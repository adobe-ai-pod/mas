import { css, html, nothing } from 'lit';
import { Headless, renderHeadlessFields } from './headless.js';

export const HEADLESS_MARQUEE_FIELDS = [
    { slot: 'heading-xs', label: 'Title' },
    { slot: 'body-xs', label: 'Description' },
    { slot: 'short-description', label: 'Short Description' },
    { slot: 'prices', label: 'Price' },
    { slot: 'footer', label: 'CTAs' },
];

export const HEADLESS_MARQUEE_AEM_FRAGMENT_MAPPING = {
    cardName: { attribute: 'name' },
    title: { tag: 'p', slot: 'heading-xs' },
    description: { tag: 'div', slot: 'body-xs' },
    shortDescription: { tag: 'p', slot: 'short-description' },
    prices: { tag: 'p', slot: 'prices' },
    ctas: { slot: 'footer', size: 'm' },
    size: [],
};

export class HeadlessMarquee extends Headless {
    constructor(card) {
        super(card);
    }

    renderLayout() {
        return html`
            <div class="headless">
                ${renderHeadlessFields(HEADLESS_MARQUEE_FIELDS)}
                ${this.card.secureLabel
                    ? html`
                          <div class="headless-row">
                              <span class="headless-label">Secure label</span>
                              <span class="headless-value">
                                  ${this.secureLabel}
                              </span>
                          </div>
                      `
                    : nothing}
            </div>
        `;
    }

    static variantStyle = css`
        :host([variant='headless-marquee']) {
            border: none;
            background: transparent;
            box-shadow: none;
        }
        :host([variant='headless-marquee']) .headless {
            display: flex;
            flex-direction: column;
            padding: var(--consonant-merch-spacing-xs, 8px);
        }
        :host([variant='headless-marquee']) .headless-row {
            display: flex;
            gap: var(--consonant-merch-spacing-xs, 8px);
            padding: var(--consonant-merch-spacing-xxs, 4px) 0;
        }
        :host([variant='headless-marquee']) .headless-label {
            flex-shrink: 0;
            font-weight: 600;
            min-width: 8em;
        }
        :host([variant='headless-marquee']) .headless-value {
            flex: 1;
        }
        :host([variant='headless-marquee']) .headless-value::slotted(*) {
            display: inline;
        }
    `;
}
