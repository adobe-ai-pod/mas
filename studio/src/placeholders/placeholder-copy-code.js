import Store from '../store.js';
import { PAGE_NAMES } from '../constants.js';
import { showToast } from '../utils.js';

/**
 * Builds the "Copy code" deep-link URL for a placeholder. Reuses the current origin
 * plus '/studio.html#' and the 'content-type' / 'page' / 'path' param names and ordering
 * that the 'Copy code' action (QUICK_ACTION.COPY, studio/src/mas-quick-actions.js:26-29)
 * produces for other fragment types when wired up (e.g. editor-panel.js#copyToUse via
 * generateCodeToUse -> buildStudioFragmentHref, studio/src/utils.js:277-285).
 * Two params intentionally deviate from that template, both required for the link to
 * actually resolve to the right placeholder:
 *  - 'locale' is added because placeholders are locale-scoped (unlike a card/collection
 *    fragment, which is addressed by a globally unique id and needs no locale in the link).
 *  - 'search' is used instead of 'query' for the identifier because the 'query' hash key is
 *    linked to Store.search.query (router.js STORE_SEARCH_HASH_KEYS), and router.js#start()
 *    unconditionally redirects to the Content page whenever Store.search.value.query is set
 *    (`if (Store.search.value.query) { Store.page.set(PAGE_NAMES.CONTENT); }`), which would
 *    send the link to the wrong page. 'search' instead maps to Store.placeholders.search
 *    (router.js: linkStoreToHash(Store.placeholders.search, 'search')), which pre-filters the
 *    placeholders table to that key when the link is opened.
 * The origin is read from window.location.origin (rather than a hardcoded host) so links
 * copied from stage or a local dev server resolve back to that same environment.
 * @param {{ key: string }} placeholder
 * @returns {string}
 */
export function buildPlaceholderCopyCodeUrl(placeholder) {
    const params = new URLSearchParams();
    params.set('content-type', 'placeholder');
    params.set('page', PAGE_NAMES.PLACEHOLDERS);
    params.set('path', Store.surface());
    params.set('locale', Store.localeOrRegion());
    params.set('search', placeholder?.key ?? '');
    return `${window.location.origin}/studio.html#${params.toString()}`;
}

/**
 * Copies the Studio deep-link URL(s) for one or more placeholders to the clipboard,
 * joined with newlines (matching the join convention in mas-selection-panel.js's
 * handleCopyFragmentUrls), and reports the outcome via showToast.
 * @param {{ key: string } | { key: string }[]} placeholders
 */
export async function copyPlaceholderCopyCodeUrls(placeholders) {
    const list = Array.isArray(placeholders) ? placeholders : [placeholders];
    if (list.length === 0) return;

    const urls = list.map(buildPlaceholderCopyCodeUrl).join('\n');

    try {
        await navigator.clipboard.writeText(urls);
        showToast(list.length > 1 ? 'Placeholder URLs copied to clipboard' : 'Placeholder URL copied to clipboard', 'positive');
    } catch {
        showToast('Failed to copy to clipboard', 'negative');
    }
}
