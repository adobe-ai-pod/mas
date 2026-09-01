import { PAGE_NAMES } from '../constants.js';

/**
 * Builds an absolute URL to the Studio fragment-editor deep link for a given fragmentId.
 * Derives origin and pathname from window.location; never hard-codes a hostname or bucket.
 * Preserves the current path hash parameter when present.
 * @param {string} fragmentId
 * @returns {string}
 */
export function getFragmentEditorUrl(fragmentId) {
    const currentParams = new URLSearchParams(window.location.hash.slice(1));
    const path = currentParams.get('path');

    const hashParams = new URLSearchParams();
    hashParams.set('page', PAGE_NAMES.FRAGMENT_EDITOR);
    hashParams.set('fragmentId', fragmentId);
    if (path) {
        hashParams.set('path', path);
    }

    return `${window.location.origin}${window.location.pathname}#${hashParams.toString()}`;
}

/**
 * Opens the Studio fragment-editor for the given fragmentId in a new browser tab.
 * Returns early without throwing when fragmentId is falsy.
 * @param {string} fragmentId
 */
export function openFragmentEditorInNewTab(fragmentId) {
    if (!fragmentId) return;
    const url = getFragmentEditorUrl(fragmentId);
    window.open(url, '_blank', 'noopener,noreferrer');
}
