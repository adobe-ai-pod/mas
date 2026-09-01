import { css, html, nothing } from 'lit';
import { Headless, renderHeadlessFields } from './headless.js';

export const HEADLESS_PROMO_BAR_FIELDS = [
    { slot: 'body-xs', label: 'Description' },
    { slot: 'footer', label: 'CTAs' },
];

export const HEADLESS_PROMO_BAR_AEM_FRAGMENT_MAPPING = {
    cardName: { attribute: 'name' },
    description: { tag: 'div', slot: 'body-xs' },
    ctas: { slot: 'footer', size: 'm' },
    size: [],
};

export class HeadlessPromoBar extends Headless {
    constructor(card) {
        super(card);
    }

    renderLayout() {
        return html`
            <div class="headless">
                ${renderHeadlessFields(HEADLESS_PROMO_BAR_FIELDS)}
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
        :host([variant='headless-promo-bar']) {
            border: none;
            background: transparent;
            box-shadow: none;
        }
        :host([variant='headless-promo-bar']) .headless {
            display: flex;
            flex-direction: column;
            padding: var(--consonant-merch-spacing-xs, 8px);
        }
        :host([variant='headless-promo-bar']) .headless-row {
            display: flex;
            gap: var(--consonant-merch-spacing-xs, 8px);
            padding: var(--consonant-merch-spacing-xxs, 4px) 0;
        }
        :host([variant='headless-promo-bar']) .headless-label {
            flex-shrink: 0;
            font-weight: 600;
            min-width: 8em;
        }
        :host([variant='headless-promo-bar']) .headless-value {
            flex: 1;
        }
        :host([variant='headless-promo-bar']) .headless-value::slotted(*) {
            display: inline;
        }
    `;
}
