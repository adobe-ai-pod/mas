import { Headless } from './headless.js';

/** AEM fragment field → slot mapping for the Marquee Headless template (no legal-disclaimer field). */
export const HEADLESS_MARQUEE_AEM_FRAGMENT_MAPPING = {
    cardName: { attribute: 'name' },
    title: { tag: 'p', slot: 'heading-xs' },
    cardTitle: { tag: 'p', slot: 'heading-xs' },
    description: { tag: 'div', slot: 'body-xs', editorLabel: 'Description' },
    shortDescription: { tag: 'p', slot: 'short-description' },
    prices: { tag: 'p', slot: 'prices', editorLabel: 'Price' },
    ctas: { slot: 'footer', size: 'm', editorLabel: 'CTAs' },
};

/** Slot/label rows rendered by the Marquee Headless template. Order defines render order. */
export const HEADLESS_MARQUEE_FIELDS = [
    { slot: 'heading-xs', label: 'Title' },
    { slot: 'body-xs', label: 'Description' },
    { slot: 'short-description', label: 'Short Description' },
    { slot: 'prices', label: 'Price' },
    { slot: 'footer', label: 'CTAs' },
];

export class HeadlessMarquee extends Headless {
    get fields() {
        return HEADLESS_MARQUEE_FIELDS;
    }
}
