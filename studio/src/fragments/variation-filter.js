import { VARIATION_TABS } from '../editors/variation-utils.js';
import { classifyVariationByPath } from '../utils/variation-search.js';

/**
 * Multiselect options for the "Has variation?" filter, derived from the repository's
 * own variation taxonomy (studio/src/editors/variation-utils.js VARIATION_TABS).
 */
export const VARIATION_FILTER_KINDS = VARIATION_TABS.map(({ id, label }) => ({ id, label }));

const VALID_KIND_IDS = new Set(VARIATION_FILTER_KINDS.map((kind) => kind.id));

/**
 * Coerces a raw selection into a de-duplicated array of known variation-kind ids.
 * @param {*} selection
 * @returns {string[]}
 */
export function normalizeVariationSelection(selection) {
    const values = Array.isArray(selection) ? selection : [];
    return [...new Set(values.filter((id) => VALID_KIND_IDS.has(id)))];
}

/**
 * Classifies a fragment into a variation kind by delegating to the repository's own
 * path classifier, studio/src/utils/variation-search.js#classifyVariationByPath, which
 * already composes Fragment.isGroupedVariationPath, isPromoVariationPath and the
 * locale/default-locale predicates in the grouped > promotion > locale priority order
 * used elsewhere in the app (see studio/src/aem/fragment.js #categorizeVariations).
 * @param {{ path?: string }} fragment
 * @returns {string|null} one of the VARIATION_FILTER_KINDS ids, or null when not a variation
 */
export function getVariationKind(fragment) {
    const { isVariation, tab } = classifyVariationByPath(fragment?.path);
    return isVariation ? tab : null;
}

/**
 * Non-variation fragments are always visible; a variation fragment is visible only
 * when its kind is part of the (normalized) selection. An empty/null/undefined
 * selection hides every variation kind, preserving today's default behavior.
 * @param {{ path?: string }} fragment
 * @param {*} selection
 * @returns {boolean}
 */
export function isVariationVisible(fragment, selection) {
    const kind = getVariationKind(fragment);
    if (!kind) return true;
    return normalizeVariationSelection(selection).includes(kind);
}

/**
 * Filters a store array by the variation-kind selection, preserving input order.
 * @param {import('../reactivity/fragment-store.js').FragmentStore[]} fragmentStores
 * @param {*} selection
 * @returns {import('../reactivity/fragment-store.js').FragmentStore[]}
 */
export function filterStoresByVariationSelection(fragmentStores, selection) {
    return fragmentStores.filter((store) => {
        const fragment = store.get?.() ?? store.value;
        return isVariationVisible(fragment, selection);
    });
}
