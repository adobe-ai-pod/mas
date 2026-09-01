import { css, html, nothing } from 'lit';
import { Headless, renderHeadlessFields } from './headless.js';

export const HEADLESS_FAQ_FIELDS = [
    { slot: 'prices', label: 'Price' },
    { slot: 'body-xs', label: 'FAQ answer 1' },
    { slot: 'short-description', label: 'FAQ answer 2' },
    { slot: 'callout-content', label: 'FAQ answer 3' },
];

export const HEADLESS_FAQ_AEM_FRAGMENT_MAPPING = {
    cardName: { attribute: 'name' },
    prices: { tag: 'p', slot: 'prices' },
    description: { tag: 'div', slot: 'body-xs' },
    shortDescription: { tag: 'p', slot: 'short-description' },
    callout: { tag: 'div', slot: 'callout-content' },
    size: [],
};

export class HeadlessFaq extends Headless {
    constructor(card) {
        super(card);
    }

    renderLayout() {
        return html`
            <div class="headless">
                ${renderHeadlessFields(HEADLESS_FAQ_FIELDS)}
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
        :host([variant='headless-faq']) {
            border: none;
            background: transparent;
            box-shadow: none;
        }
        :host([variant='headless-faq']) .headless {
            display: flex;
            flex-direction: column;
            padding: var(--consonant-merch-spacing-xs, 8px);
        }
        :host([variant='headless-faq']) .headless-row {
            display: flex;
            gap: var(--consonant-merch-spacing-xs, 8px);
            padding: var(--consonant-merch-spacing-xxs, 4px) 0;
        }
        :host([variant='headless-faq']) .headless-label {
            flex-shrink: 0;
            font-weight: 600;
            min-width: 8em;
        }
        :host([variant='headless-faq']) .headless-value {
            flex: 1;
        }
        :host([variant='headless-faq']) .headless-value::slotted(*) {
            display: inline;
        }
    `;
}
