import { createCheckoutElement } from './checkout-mixin.js';
import { CheckoutMixin } from './checkout-mixin.js';
import {
    hasAuthoredAriaLabel,
    applyDerivedAriaLabel,
} from './aria-label-utils.js';

export { hasAuthoredAriaLabel, applyDerivedAriaLabel };

export class CheckoutLink extends CheckoutMixin(HTMLAnchorElement) {
    static is = 'checkout-link';
    static tag = 'a';

    static createCheckoutLink(options = {}, innerHTML = '') {
        return createCheckoutElement(CheckoutLink, options, innerHTML);
    }

    setCheckoutUrl(value) {
        this.setAttribute('href', value);
    }

    get isCheckoutLink() {
        return true;
    }

    clickHandler(e) {
        if (this.checkoutActionHandler) {
            this.checkoutActionHandler?.(e);
            return;
        }
    }

    /**
     * Re-resolution (price/offer updates, locale switches) never mutates
     * aria-label itself, but this gate guarantees it: an authored aria-label
     * always wins over anything derived here, and derivation never emits an
     * empty aria-label attribute.
     */
    renderOffers(...args) {
        const authoredAriaLabel = this.getAttribute('aria-label');
        const result = super.renderOffers(...args);
        applyDerivedAriaLabel(this, authoredAriaLabel);
        return result;
    }
}

// Define custom DOM element
if (!window.customElements.get(CheckoutLink.is)) {
    window.customElements.define(CheckoutLink.is, CheckoutLink, {
        extends: CheckoutLink.tag,
    });
}
