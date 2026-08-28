import { Headless } from './headless.js';

/**
 * AEM fragment field → slot mapping for the Sticky banner/Blade Headless template.
 * The card model exposes a single `ctas` field, so the blade's second CTA group
 * reuses the `callout` rich-text field with its own editor label and slot.
 */
export const HEADLESS_PROMO_BAR_AEM_FRAGMENT_MAPPING = {
    cardName: { attribute: 'name' },
    description: {
        tag: 'div',
        slot: 'body-xs',
        editorLabel: 'Sticky banner description',
    },
    ctas: { slot: 'footer', size: 'm', editorLabel: 'Sticky banner CTAs' },
    shortDescription: {
        tag: 'p',
        slot: 'short-description',
        editorLabel: 'Blade description',
    },
    callout: {
        tag: 'div',
        slot: 'callout-content',
        editorLabel: 'Blade CTAs',
    },
};

/** Slot/label rows rendered by the Sticky banner/Blade Headless template. Order defines render order. */
export const HEADLESS_PROMO_BAR_FIELDS = [
    { slot: 'body-xs', label: 'Sticky banner description' },
    { slot: 'footer', label: 'Sticky banner CTAs' },
    { slot: 'short-description', label: 'Blade description' },
    { slot: 'callout-content', label: 'Blade CTAs' },
];

export class HeadlessPromoBar extends Headless {
    get fields() {
        return HEADLESS_PROMO_BAR_FIELDS;
    }
}
