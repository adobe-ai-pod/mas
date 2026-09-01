import { html, css } from 'lit';
import { VariantLayout } from './variant-layout.js';
import { CSS } from './brand-concierge.css.js';

export const BRAND_CONCIERGE_AEM_FRAGMENT_MAPPING = {
    mnemonics: { size: 's' },
    title: { tag: 'h3', slot: 'heading-xxs', maxCount: 250, withSuffix: true },
    description: {
        tag: 'div',
        slot: 'body-s',
        maxCount: 2000,
        withSuffix: false,
    },
    prices: { tag: 'p', slot: 'price' },
    ctas: { slot: 'cta', size: 'M' },
};

export class BrandConcierge extends VariantLayout {
    getGlobalCSS() {
        return CSS;
    }

    get aemFragmentMapping() {
        return BRAND_CONCIERGE_AEM_FRAGMENT_MAPPING;
    }

    renderLayout() {
        return html`
            <div class="content">
                <div class="header">
                    <slot name="icons"></slot>
                    <slot name="heading-xxs"></slot>
                </div>
                <slot name="body-s"></slot>
                <div class="footer">
                    <slot name="cta"></slot>
                    <slot name="price"></slot>
                </div>
            </div>
            <slot></slot>
        `;
    }

    static variantStyle = css`
        :host([variant='brand-concierge']) {
            --consonant-merch-card-brand-concierge-width: 378px;
            width: 100%;
            max-width: var(--consonant-merch-card-brand-concierge-width);
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        }
    `;
}
