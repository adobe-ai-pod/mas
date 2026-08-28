import { expect } from '@esm-bundle/chai';
import '../src/merch-card.js';
import {
    HEADLESS_MARQUEE_AEM_FRAGMENT_MAPPING,
    HEADLESS_MARQUEE_FIELDS,
} from '../src/variants/headless-marquee.js';
import {
    HEADLESS_FAQ_AEM_FRAGMENT_MAPPING,
    HEADLESS_FAQ_FIELDS,
} from '../src/variants/headless-faq.js';
import {
    HEADLESS_OFFER_TERMS_AEM_FRAGMENT_MAPPING,
    HEADLESS_OFFER_TERMS_FIELDS,
} from '../src/variants/headless-offer-terms.js';
import {
    HEADLESS_PROMO_BAR_AEM_FRAGMENT_MAPPING,
    HEADLESS_PROMO_BAR_FIELDS,
} from '../src/variants/headless-promo-bar.js';

describe('headless card templates (MWPW-205541)', () => {
    const MerchCard = customElements.get('merch-card');

    it('registers headless-marquee, headless-faq, headless-offer-terms and headless-promo-bar', () => {
        expect(MerchCard.getFragmentMapping('headless-marquee')).to.equal(
            HEADLESS_MARQUEE_AEM_FRAGMENT_MAPPING,
        );
        expect(MerchCard.getFragmentMapping('headless-faq')).to.equal(
            HEADLESS_FAQ_AEM_FRAGMENT_MAPPING,
        );
        expect(MerchCard.getFragmentMapping('headless-offer-terms')).to.equal(
            HEADLESS_OFFER_TERMS_AEM_FRAGMENT_MAPPING,
        );
        expect(MerchCard.getFragmentMapping('headless-promo-bar')).to.equal(
            HEADLESS_PROMO_BAR_AEM_FRAGMENT_MAPPING,
        );
    });

    it('Marquee Headless exposes Title, Description, Short Description, Price and CTAs with no legal-disclaimer field', () => {
        expect(HEADLESS_MARQUEE_FIELDS.map((f) => f.label)).to.deep.equal([
            'Title',
            'Description',
            'Short Description',
            'Price',
            'CTAs',
        ]);
        expect(HEADLESS_MARQUEE_AEM_FRAGMENT_MAPPING).to.not.have.any.keys(
            'legalDisclaimer',
            'legal',
        );
    });

    it('FAQ Headless exposes exactly FAQ answer 1, FAQ answer 2 and Price', () => {
        expect(HEADLESS_FAQ_FIELDS.map((f) => f.label)).to.deep.equal([
            'FAQ answer 1',
            'FAQ answer 2',
            'Price',
        ]);
    });

    it('Offer terms exposes a single Terms body field', () => {
        expect(HEADLESS_OFFER_TERMS_FIELDS.map((f) => f.label)).to.deep.equal([
            'Terms',
        ]);
    });

    it('Sticky banner/Blade exposes the four ticketed fields with distinct CTA slots', () => {
        expect(HEADLESS_PROMO_BAR_FIELDS.map((f) => f.label)).to.deep.equal([
            'Sticky banner description',
            'Sticky banner CTAs',
            'Blade description',
            'Blade CTAs',
        ]);
        expect(HEADLESS_PROMO_BAR_AEM_FRAGMENT_MAPPING.ctas.slot).to.not.equal(
            HEADLESS_PROMO_BAR_AEM_FRAGMENT_MAPPING.callout.slot,
        );
    });
});
