import { expect } from '@esm-bundle/chai';
import { html } from 'lit';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers/pure';
import Store from '../../src/store.js';
import { setItemsSelectionStore } from '../../src/common/items-selection-store.js';
import { VARIANTS } from '../../src/editors/variant-picker.js';
import '../../src/swc.js';
import '../../src/common/components/mas-search-and-filters.js';

describe('MasSearchAndFilters — templateOptions ordering', () => {
    beforeEach(() => {
        setItemsSelectionStore(Store.translationProjects);
        Store.translationProjects.search.set({});
        Store.translationProjects.filters.set({ locale: 'en_US', tags: undefined, personalizationFilterEnabled: false });
        Store.translationProjects.allCards.set([]);
        Store.translationProjects.displayCards.set([]);
        Store.fragments.list.loading.set(false);
        Store.fragments.list.firstPageLoaded.set(true);
    });

    afterEach(() => {
        fixtureCleanup();
        setItemsSelectionStore(null);
    });

    it('templateOptions titles are sorted alphabetically with localeCompare', async () => {
        const el = await fixture(html`<mas-search-and-filters type="cards" .searchOnly=${false}></mas-search-and-filters>`);
        await el.updateComplete;
        const titles = el.templateOptions.map((o) => o.title);
        const sorted = [...titles].sort((a, b) => a.localeCompare(b));
        expect(titles).to.deep.equal(sorted);
    });

    it('templateOptions does not include an "All" entry', async () => {
        const el = await fixture(html`<mas-search-and-filters type="cards" .searchOnly=${false}></mas-search-and-filters>`);
        await el.updateComplete;
        const allOption = el.templateOptions.find((o) => o.title.toLowerCase() === 'all');
        expect(allOption).to.be.undefined;
    });

    it('templateOptions count equals VARIANTS length minus 1', async () => {
        const el = await fixture(html`<mas-search-and-filters type="cards" .searchOnly=${false}></mas-search-and-filters>`);
        await el.updateComplete;
        expect(el.templateOptions.length).to.equal(VARIANTS.length - 1);
    });

    it('VARIANTS source array is not mutated — still begins with All then Catalog', () => {
        expect(VARIANTS[0].label).to.equal('All');
        expect(VARIANTS[1].label).to.equal('Catalog');
    });
});
