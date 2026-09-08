import { expect } from '@esm-bundle/chai';
import { VARIATION_TABS } from '../../src/editors/variation-utils.js';
import {
    VARIATION_FILTER_KINDS,
    normalizeVariationSelection,
    getVariationKind,
    isVariationVisible,
    filterStoresByVariationSelection,
} from '../../src/fragments/variation-filter.js';

describe('variation-filter', () => {
    const localeFragment = { path: '/content/dam/mas/sandbox/en_CA/my-card' };
    const promoFragment = { path: '/content/dam/mas/sandbox/en_US/promotions/black-friday/my-card' };
    const groupedFragment = { path: '/content/dam/mas/sandbox/en_US/PA-123/pzn/my-card-grouped' };
    const plainFragment = { path: '/content/dam/mas/sandbox/en_US/my-card' };

    const makeStore = (fragment) => ({ get: () => fragment, value: fragment });

    it('exposes VARIATION_FILTER_KINDS ids matching VARIATION_TABS', () => {
        expect(VARIATION_FILTER_KINDS.map((kind) => kind.id)).to.deep.equal(VARIATION_TABS.map((tab) => tab.id));
    });

    it('classifies fragments into the correct variation kind', () => {
        expect(getVariationKind(localeFragment)).to.equal('locale');
        expect(getVariationKind(promoFragment)).to.equal('promotion');
        expect(getVariationKind(groupedFragment)).to.equal('grouped');
        expect(getVariationKind(plainFragment)).to.be.null;
    });

    describe('default state (empty/null/undefined selection)', () => {
        for (const selection of [[], null, undefined]) {
            it(`hides every variation kind and keeps non-variations visible for selection=${JSON.stringify(selection)}`, () => {
                expect(isVariationVisible(localeFragment, selection)).to.be.false;
                expect(isVariationVisible(promoFragment, selection)).to.be.false;
                expect(isVariationVisible(groupedFragment, selection)).to.be.false;
                expect(isVariationVisible(plainFragment, selection)).to.be.true;
            });
        }
    });

    it('shows only the selected kind for each single-kind selection', () => {
        expect(isVariationVisible(localeFragment, ['locale'])).to.be.true;
        expect(isVariationVisible(promoFragment, ['locale'])).to.be.false;
        expect(isVariationVisible(groupedFragment, ['locale'])).to.be.false;

        expect(isVariationVisible(promoFragment, ['promotion'])).to.be.true;
        expect(isVariationVisible(localeFragment, ['promotion'])).to.be.false;
        expect(isVariationVisible(groupedFragment, ['promotion'])).to.be.false;

        expect(isVariationVisible(groupedFragment, ['grouped'])).to.be.true;
        expect(isVariationVisible(localeFragment, ['grouped'])).to.be.false;
        expect(isVariationVisible(promoFragment, ['grouped'])).to.be.false;
    });

    it('shows the union of kinds for a combined selection', () => {
        const selection = ['locale', 'grouped'];
        expect(isVariationVisible(localeFragment, selection)).to.be.true;
        expect(isVariationVisible(groupedFragment, selection)).to.be.true;
        expect(isVariationVisible(promoFragment, selection)).to.be.false;
    });

    it('normalizes unknown and duplicate ids out of the selection', () => {
        expect(normalizeVariationSelection(['locale', 'locale', 'bogus'])).to.deep.equal(['locale']);
        expect(normalizeVariationSelection(null)).to.deep.equal([]);
        expect(normalizeVariationSelection(undefined)).to.deep.equal([]);
        expect(normalizeVariationSelection('locale')).to.deep.equal([]);
    });

    it('filters a store array by selection, preserving input order and not mutating the input', () => {
        const stores = [
            makeStore(plainFragment),
            makeStore(localeFragment),
            makeStore(promoFragment),
            makeStore(groupedFragment),
        ];
        const original = [...stores];

        const filtered = filterStoresByVariationSelection(stores, ['grouped']);

        expect(filtered.map((store) => store.get().path)).to.deep.equal([plainFragment.path, groupedFragment.path]);
        expect(stores).to.deep.equal(original);
    });
});
