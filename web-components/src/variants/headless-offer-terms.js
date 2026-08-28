import { Headless } from './headless.js';

/** AEM fragment field → slot mapping for the Offer terms template. */
export const HEADLESS_OFFER_TERMS_AEM_FRAGMENT_MAPPING = {
    cardName: { attribute: 'name' },
    description: { tag: 'div', slot: 'body-xs', editorLabel: 'Terms' },
};

/** Slot/label rows rendered by the Offer terms template. Order defines render order. */
export const HEADLESS_OFFER_TERMS_FIELDS = [
    { slot: 'body-xs', label: 'Terms' },
];

export class HeadlessOfferTerms extends Headless {
    get fields() {
        return HEADLESS_OFFER_TERMS_FIELDS;
    }
}
