import Store from './store.js';

const POWER_USER_GROUPS = new Set(['GRP-ODIN-MAS-POWERUSERS', 'GRP-ODIN-MAS-ADMINS']);

const SURFACE_POWER_USER_GROUPS = {
    'acom-cc': new Set(['GRP-ODIN-MAS-CC-POWERUSERS']),
    'acom-dc': new Set(['GRP-ODIN-MAS-DC-POWERUSERS']),
};

const SURFACE_EDITOR_GROUPS = {
    'acom-cc': new Set(['GRP-ODIN-MAS-ACOM-CC-EDITORS', 'GRP-ODIN-MAS-CC-POWERUSERS']),
    'acom-dc': new Set(['GRP-ODIN-MAS-ACOM-DC-EDITORS', 'GRP-ODIN-MAS-DC-POWERUSERS']),
};

function getNormalizedGroups() {
    const { email } = Store.profile.get();
    if (!email) return null;
    const user = Store.users.get().find((user) => user.userPrincipalName === email);
    if (!user) return null;
    return user.groups?.map((group) => group.toUpperCase()) || [];
}

/**
 * Returns whether the current profile belongs to a MAS power user group.
 * Group values are normalized to uppercase to avoid case-based access regressions.
 *
 * @returns {boolean}
 */
export function isPowerUser() {
    const normalizedGroups = getNormalizedGroups();
    if (!normalizedGroups) return false;
    return normalizedGroups.some((group) => POWER_USER_GROUPS.has(group));
}

/**
 * Returns whether the current profile is a power user for a given surface.
 * Global admins/power users always return true.
 *
 * @param {string} surface
 * @returns {boolean}
 */
export function isSurfacePowerUser(surface) {
    if (isPowerUser()) return true;
    const surfaceGroups = SURFACE_POWER_USER_GROUPS[surface];
    if (!surfaceGroups) return false;
    const normalizedGroups = getNormalizedGroups();
    if (!normalizedGroups) return false;
    return normalizedGroups.some((group) => surfaceGroups.has(group));
}

/**
 * Returns whether the current profile can edit content on a given surface.
 * Global admins/power users always return true. Surfaces without editor group
 * restrictions are unrestricted.
 *
 * @param {string} surface
 * @returns {boolean}
 */
export function isSurfaceEditor(surface) {
    if (isPowerUser()) return true;
    const surfaceGroups = SURFACE_EDITOR_GROUPS[surface];
    if (!surfaceGroups) return true;
    const normalizedGroups = getNormalizedGroups();
    if (!normalizedGroups) return false;
    return normalizedGroups.some((group) => surfaceGroups.has(group));
}
