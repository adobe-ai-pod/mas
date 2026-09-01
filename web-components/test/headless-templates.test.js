import { expect } from '@esm-bundle/chai';
import '../src/mas.js';
import { Headless } from '../src/variants/headless.js';
import {
    HeadlessMarquee,
    HEADLESS_MARQUEE_AEM_FRAGMENT_MAPPING,
    HEADLESS_MARQUEE_FIELDS,
} from '../src/variants/headless-marquee.js';
import {
    HeadlessFaq,
    HEADLESS_FAQ_AEM_FRAGMENT_MAPPING,
    HEADLESS_FAQ_FIELDS,
} from '../src/variants/headless-faq.js';
import {
    HeadlessPromoBar,
    HEADLESS_PROMO_BAR_AEM_FRAGMENT_MAPPING,
    HEADLESS_PROMO_BAR_FIELDS,
} from '../src/variants/headless-promo-bar.js';
import {
    getFragmentMapping,
    getVariantLayout,
} from '../src/variants/variants.js';

async function makeCard(variant) {
    const card = document.createElement('merch-card');
    card.setAttribute('variant', variant);
    document.body.appendChild(card);
    await card.updateComplete;
    return card;
}

describe('headless template variant registry', () => {
    const cards = [];

    after(() => {
        cards.forEach((c) => c.remove());
    });

    it('getVariantLayout("headless") returns an instance of Headless (no regression)', async () => {
        const card = await makeCard('headless');
        cards.push(card);
        const layout = getVariantLayout(card);
        expect(layout).to.be.instanceof(Headless);
    });

    it('getVariantLayout("headless-marquee") returns an instance of HeadlessMarquee', async () => {
        const card = await makeCard('headless-marquee');
        cards.push(card);
        const layout = getVariantLayout(card);
        expect(layout).to.be.instanceof(HeadlessMarquee);
    });

    it('getVariantLayout("headless-faq") returns an instance of HeadlessFaq', async () => {
        const card = await makeCard('headless-faq');
        cards.push(card);
        const layout = getVariantLayout(card);
        expect(layout).to.be.instanceof(HeadlessFaq);
    });

    it('getVariantLayout("headless-promo-bar") returns an instance of HeadlessPromoBar', async () => {
        const card = await makeCard('headless-promo-bar');
        cards.push(card);
        const layout = getVariantLayout(card);
        expect(layout).to.be.instanceof(HeadlessPromoBar);
    });

    it('getFragmentMapping("headless") still returns HEADLESS_AEM_FRAGMENT_MAPPING (no regression)', () => {
        const mapping = getFragmentMapping('headless');
        expect(mapping).to.exist;
        expect(mapping.title).to.deep.equal({ tag: 'p', slot: 'heading-xs' });
    });

    it('getFragmentMapping("headless-marquee") returns HEADLESS_MARQUEE_AEM_FRAGMENT_MAPPING', () => {
        expect(getFragmentMapping('headless-marquee')).to.equal(
            HEADLESS_MARQUEE_AEM_FRAGMENT_MAPPING,
        );
    });

    it('getFragmentMapping("headless-faq") returns HEADLESS_FAQ_AEM_FRAGMENT_MAPPING', () => {
        expect(getFragmentMapping('headless-faq')).to.equal(
            HEADLESS_FAQ_AEM_FRAGMENT_MAPPING,
        );
    });

    it('getFragmentMapping("headless-promo-bar") returns HEADLESS_PROMO_BAR_AEM_FRAGMENT_MAPPING', () => {
        expect(getFragmentMapping('headless-promo-bar')).to.equal(
            HEADLESS_PROMO_BAR_AEM_FRAGMENT_MAPPING,
        );
    });

    it('HeadlessMarquee extends Headless', async () => {
        const card = await makeCard('headless-marquee');
        cards.push(card);
        expect(new HeadlessMarquee(card)).to.be.instanceof(Headless);
    });

    it('HeadlessFaq extends Headless', async () => {
        const card = await makeCard('headless-faq');
        cards.push(card);
        expect(new HeadlessFaq(card)).to.be.instanceof(Headless);
    });

    it('HeadlessPromoBar extends Headless', async () => {
        const card = await makeCard('headless-promo-bar');
        cards.push(card);
        expect(new HeadlessPromoBar(card)).to.be.instanceof(Headless);
    });

    it('HEADLESS_MARQUEE_FIELDS has title, description, shortDescription, prices, ctas rows', () => {
        const slots = HEADLESS_MARQUEE_FIELDS.map((f) => f.slot);
        expect(slots).to.include('heading-xs');
        expect(slots).to.include('body-xs');
        expect(slots).to.include('short-description');
        expect(slots).to.include('prices');
        expect(slots).to.include('footer');
        expect(slots).to.have.lengthOf(5);
    });

    it('HEADLESS_FAQ_FIELDS has prices and three answer rows', () => {
        const slots = HEADLESS_FAQ_FIELDS.map((f) => f.slot);
        expect(slots).to.include('prices');
        expect(slots).to.include('body-xs');
        expect(slots).to.include('short-description');
        expect(slots).to.include('callout-content');
        expect(slots).to.have.lengthOf(4);
    });

    it('HEADLESS_PROMO_BAR_FIELDS has description and ctas rows', () => {
        const slots = HEADLESS_PROMO_BAR_FIELDS.map((f) => f.slot);
        expect(slots).to.include('body-xs');
        expect(slots).to.include('footer');
        expect(slots).to.have.lengthOf(2);
    });
});

describe('headless template rendered rows', () => {
    const renderedCards = [];

    after(() => {
        renderedCards.forEach((c) => c.remove());
    });

    it('headless-marquee renders one row per HEADLESS_MARQUEE_FIELDS entry', async () => {
        const card = await makeCard('headless-marquee');
        renderedCards.push(card);
        const rows = card.shadowRoot.querySelectorAll(
            '.headless .headless-row',
        );
        expect(rows.length).to.equal(HEADLESS_MARQUEE_FIELDS.length);
    });

    it('headless-faq renders one row per HEADLESS_FAQ_FIELDS entry', async () => {
        const card = await makeCard('headless-faq');
        renderedCards.push(card);
        const rows = card.shadowRoot.querySelectorAll(
            '.headless .headless-row',
        );
        expect(rows.length).to.equal(HEADLESS_FAQ_FIELDS.length);
    });

    it('headless-promo-bar renders one row per HEADLESS_PROMO_BAR_FIELDS entry', async () => {
        const card = await makeCard('headless-promo-bar');
        renderedCards.push(card);
        const rows = card.shadowRoot.querySelectorAll(
            '.headless .headless-row',
        );
        expect(rows.length).to.equal(HEADLESS_PROMO_BAR_FIELDS.length);
    });
});
