import { Headless } from './headless.js';

/** AEM fragment field → slot mapping for the FAQ Headless template. */
export const HEADLESS_FAQ_AEM_FRAGMENT_MAPPING = {
    cardName: { attribute: 'name' },
    description: { tag: 'div', slot: 'body-xs', editorLabel: 'FAQ answer 1' },
    shortDescription: {
        tag: 'p',
        slot: 'short-description',
        editorLabel: 'FAQ answer 2',
    },
    prices: { tag: 'p', slot: 'prices', editorLabel: 'Price' },
};

/** Slot/label rows rendered by the FAQ Headless template. Order defines render order. */
export const HEADLESS_FAQ_FIELDS = [
    { slot: 'body-xs', label: 'FAQ answer 1' },
    { slot: 'short-description', label: 'FAQ answer 2' },
    { slot: 'prices', label: 'Price' },
];

export class HeadlessFaq extends Headless {
    get fields() {
        return HEADLESS_FAQ_FIELDS;
    }
}
