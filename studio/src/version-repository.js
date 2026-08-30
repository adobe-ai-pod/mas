import Events from './events.js';

export const SERVICE_ACCOUNT_IDENTIFIERS = new Set(['workflow-service']);

/**
 * Extract the author identity string from an AEM fragment or version item,
 * checking the known field shapes in priority order.
 * Strips leading "user:" / "ims:" prefixes that some AEM implementations add.
 * @param {object} source
 * @returns {string|null}
 */
export function extractAuthorIdentity(source) {
    if (!source) return null;
    const raw = source.createdBy || source.modifiedBy || source.created?.by || source.modified?.by || source.author || null;
    if (!raw) return null;
    const trimmed = String(raw).trim();
    // Strip "user:" or "ims:" style prefixes
    return trimmed.replace(/^(?:user|ims):/i, '') || null;
}

/**
 * Resolve an author identity string into a display descriptor.
 * @param {string|null} identity
 * @param {Array<{userPrincipalName: string, displayName: string}>} users
 * @returns {{ identity: string|null, email: string|null, displayName: string|null, label: string, isServiceAccount: boolean }}
 */
export function resolveAuthorLabel(identity, users = []) {
    if (!identity || SERVICE_ACCOUNT_IDENTIFIERS.has(identity)) {
        return {
            identity,
            email: null,
            displayName: null,
            label: 'System',
            isServiceAccount: true,
        };
    }

    const lowerIdentity = identity.toLowerCase();
    const match = users.find((u) => u.userPrincipalName?.toLowerCase() === lowerIdentity);
    if (match) {
        return {
            identity,
            email: match.userPrincipalName,
            displayName: match.displayName || null,
            label: match.displayName || match.userPrincipalName,
            isServiceAccount: false,
        };
    }

    // Unmatched but looks like an email — show as-is
    return {
        identity,
        email: identity,
        displayName: null,
        label: identity,
        isServiceAccount: false,
    };
}

/**
 * Apply author resolution to a version item, returning the item with
 * additional author fields populated.
 * @param {object} item
 * @param {Array} users
 * @returns {object}
 */
function applyAuthorResolution(item, users) {
    const identity = extractAuthorIdentity(item);
    const resolved = resolveAuthorLabel(identity, users);
    return {
        ...item,
        createdBy: resolved.isServiceAccount ? 'System' : resolved.email || identity || 'System',
        createdByName: resolved.displayName || null,
        createdByEmail: resolved.email || null,
        createdByIsService: resolved.isServiceAccount,
        createdByRaw: identity,
    };
}

/**
 * Repository for version-related data operations.
 * Handles loading, saving, and restoring fragment versions.
 */
export class VersionRepository {
    constructor(repository) {
        this.repository = repository;
    }

    /**
     * Load version history for a fragment
     * @param {string} fragmentId - The fragment ID
     * @returns {Promise<{fragment: Object, versions: Array, currentVersion: Object}>}
     */
    async loadVersionHistory(fragmentId, { users = [] } = {}) {
        try {
            // Load the current fragment
            const fragment = await this.repository.aem.sites.cf.fragments.getById(fragmentId);

            // Create a "current version" from the live fragment
            // Handle different formats of modified date (could be string, object with 'at' property, or undefined)
            let modifiedDate;
            if (fragment.modified) {
                if (typeof fragment.modified === 'object' && fragment.modified.at) {
                    modifiedDate = fragment.modified.at;
                } else if (typeof fragment.modified === 'string') {
                    modifiedDate = fragment.modified;
                } else {
                    modifiedDate = new Date().toISOString();
                }
            } else {
                modifiedDate = new Date().toISOString();
            }

            const rawCurrentVersion = {
                id: 'current',
                version: 'Current',
                created: modifiedDate,
                isCurrent: true,
            };
            const currentVersion = applyAuthorResolution(
                { ...rawCurrentVersion, modifiedBy: fragment.modifiedBy, modified: fragment.modified },
                users,
            );
            // createdBy must fall back to 'System' (not null) when no identity found
            if (!currentVersion.createdBy) currentVersion.createdBy = 'System';

            // Load version history
            const versionsResponse = await this.repository.aem.sites.cf.fragments.getVersions(fragmentId);
            const historicalVersions = versionsResponse?.items || [];

            // Normalise author fields on every historical item
            const normalisedHistoricalVersions = historicalVersions.map((item) => applyAuthorResolution(item, users));

            // Combine current version with historical versions
            const versions = [currentVersion, ...normalisedHistoricalVersions];

            return {
                fragment,
                versions,
                currentVersion,
            };
        } catch (error) {
            console.error('Failed to load version history:', error);
            throw error;
        }
    }

    /**
     * Load data for a specific version
     * @param {string} fragmentId - The fragment ID
     * @param {string} versionId - The version ID
     * @returns {Promise<Object>} Version data
     */
    async loadVersionData(fragmentId, versionId) {
        try {
            const versionData = await this.repository.aem.sites.cf.fragments.getVersion(fragmentId, versionId);
            return versionData;
        } catch (error) {
            console.error('Failed to load version data:', error);
            throw error;
        }
    }

    /**
     * Restore a fragment to a specific version
     * @param {Object} version - The version to restore
     * @param {Object} currentFragment - The current fragment
     * @param {Function} normalizeFields - Function to normalize fields
     * @param {Function} denormalizeFields - Function to denormalize fields
     * @returns {Promise<void>}
     */
    async restoreVersion(version, currentFragment, normalizeFields, denormalizeFields) {
        try {
            // Load the version data if not already loaded
            const versionData = await this.loadVersionData(currentFragment.id, version.id);

            // Normalize the version fields
            const normalizedFields = normalizeFields(versionData);

            // Convert back to AEM array format for saving
            let fieldsArray = denormalizeFields(normalizedFields, currentFragment);

            // Preserve the current fragment's variations field so restored versions don't wipe locale variation.
            const currentVariationsField = currentFragment.fields?.find((f) => f.name === 'variations');
            if (currentVariationsField) {
                const withoutVariations = fieldsArray.filter((f) => f.name !== 'variations');
                fieldsArray = [
                    ...withoutVariations,
                    { ...currentVariationsField, values: currentVariationsField.values || [] },
                ];
            }

            // Extract fragment title and description from normalized fields
            const { fragmentTitle, fragmentDescription } = normalizedFields;

            // Update the current fragment with the version data
            const updatedFragment = {
                ...currentFragment,
                fields: fieldsArray,
                // Restore title and description if they exist in the version
                ...(fragmentTitle !== undefined && { title: fragmentTitle }),
                ...(fragmentDescription !== undefined && { description: fragmentDescription }),
            };

            // Save the fragment
            await this.repository.aem.sites.cf.fragments.save(updatedFragment);

            Events.toast.emit({
                variant: 'positive',
                content: `Version ${version.title} restored successfully`,
            });
        } catch (error) {
            console.error('Failed to restore version:', error);
            Events.toast.emit({
                variant: 'negative',
                content: `Failed to restore version: ${error.message}`,
            });
            throw error;
        }
    }

    /**
     * Search versions by query
     * @param {Array} versions - Array of versions to search
     * @param {string} query - Search query
     * @returns {Array} Filtered versions
     */
    searchVersions(versions, query) {
        if (!query) return versions;

        const lowerQuery = query.toLowerCase();
        return versions.filter((version) => {
            return (
                version.version?.toLowerCase().includes(lowerQuery) ||
                version.createdBy?.toLowerCase().includes(lowerQuery) ||
                version.createdByName?.toLowerCase().includes(lowerQuery) ||
                version.createdByEmail?.toLowerCase().includes(lowerQuery) ||
                version.created?.toLowerCase().includes(lowerQuery) ||
                version.comment?.toLowerCase().includes(lowerQuery)
            );
        });
    }
}
