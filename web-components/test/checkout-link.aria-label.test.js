import {
    CheckoutLink,
    hasAuthoredAriaLabel,
    applyDerivedAriaLabel,
} from '../src/checkout-link.js';
import { mockFetch } from './mocks/fetch.js';
import { mockIms, unmockIms } from './mocks/ims.js';
import { mockLana, unmockLana } from './mocks/lana.js';
import { withWcs } from './mocks/wcs.js';
import {
    expect,
    initMasCommerceService,
    removeMasCommerceService,
} from './utilities.js';
import '../src/mas.js';
import '../src/mas-field.js';

function makeCtaField(fieldValue) {
    const el = document.createElement('mas-field');
    el.setAttribute('field', 'ctas');
    const fragment = document.createElement('aem-fragment');
    el.append(fragment);
    document.body.append(el);
    fragment.dispatchEvent(
        new CustomEvent('aem:load', {
            bubbles: true,
            detail: { fields: { ctas: fieldValue } },
        }),
    );
    return el;
}

function mockCheckoutLink(wcsOsi, options = {}) {
    const element = CheckoutLink.createCheckoutLink(
        { wcsOsi, ...options },
        `Buy now: ${wcsOsi}`,
    );
    document.body.append(element, document.createElement('br'));
    return element;
}

afterEach(() => {
    removeMasCommerceService();
    unmockIms();
    unmockLana();
    document.body
        .querySelectorAll('a[is="checkout-link"]')
        .forEach((el) => el.remove());
});

beforeEach(async () => {
    await mockFetch(withWcs);
    mockLana();
});

describe('checkout-link aria-label helpers', () => {
    describe('hasAuthoredAriaLabel', () => {
        it('is true for a non-empty string', () => {
            expect(hasAuthoredAriaLabel('Buy Acrobat Pro now')).to.be.true;
        });

        it('is false for a whitespace-only string', () => {
            expect(hasAuthoredAriaLabel('   ')).to.be.false;
        });

        it('is false for null/undefined/empty', () => {
            expect(hasAuthoredAriaLabel(null)).to.be.false;
            expect(hasAuthoredAriaLabel(undefined)).to.be.false;
            expect(hasAuthoredAriaLabel('')).to.be.false;
        });
    });

    describe('applyDerivedAriaLabel', () => {
        it('never overwrites an existing authored aria-label', () => {
            const el = document.createElement('a');
            el.setAttribute('aria-label', 'Buy Acrobat Pro now');
            applyDerivedAriaLabel(el, 'Buy now');
            expect(el.getAttribute('aria-label')).to.equal(
                'Buy Acrobat Pro now',
            );
        });

        it('applies the derived label when none is authored', () => {
            const el = document.createElement('a');
            applyDerivedAriaLabel(el, 'Buy now');
            expect(el.getAttribute('aria-label')).to.equal('Buy now');
        });

        it('treats a whitespace-only existing value as not authored', () => {
            const el = document.createElement('a');
            el.setAttribute('aria-label', '   ');
            applyDerivedAriaLabel(el, 'Buy now');
            expect(el.getAttribute('aria-label')).to.equal('Buy now');
        });

        it('never emits an empty aria-label attribute', () => {
            const el = document.createElement('a');
            applyDerivedAriaLabel(el, '   ');
            expect(el.hasAttribute('aria-label')).to.be.false;
        });
    });
});

describe('checkout-link – authored aria-label survives re-resolution', () => {
    it('keeps an authored aria-label after a full render/re-resolution pass', async () => {
        initMasCommerceService();
        const checkoutLink = mockCheckoutLink('abm');
        checkoutLink.setAttribute('aria-label', 'Buy Acrobat Pro now');
        await checkoutLink.onceSettled();
        expect(checkoutLink.getAttribute('aria-label')).to.equal(
            'Buy Acrobat Pro now',
        );

        // Trigger a second re-resolution pass (e.g. options/offer update).
        checkoutLink.requestUpdate(true);
        await checkoutLink.onceSettled();
        expect(checkoutLink.getAttribute('aria-label')).to.equal(
            'Buy Acrobat Pro now',
        );
    });

    it('leaves aria-label absent when none is authored', async () => {
        initMasCommerceService();
        const checkoutLink = mockCheckoutLink('abm');
        await checkoutLink.onceSettled();
        expect(checkoutLink.hasAttribute('aria-label')).to.be.false;
    });

    it('treats a whitespace-only authored aria-label as absent', async () => {
        initMasCommerceService();
        const checkoutLink = mockCheckoutLink('abm');
        checkoutLink.setAttribute('aria-label', '   ');
        await checkoutLink.onceSettled();
        expect(checkoutLink.hasAttribute('aria-label')).to.be.false;
    });
});

describe('mas-field CTA field HTML – aria-label serialize/deserialize round-trip', () => {
    afterEach(() => {
        document.body
            .querySelectorAll('mas-field')
            .forEach((el) => el.remove());
    });

    it('preserves an authored aria-label across two consecutive rounds', () => {
        initMasCommerceService();
        const html =
            '<a data-wcs-osi="ABC123" aria-label="Buy Acrobat Pro now">Buy now</a>';

        const first = makeCtaField(html);
        const firstLink = first.querySelector('[slot="footer"] a');
        expect(firstLink.getAttribute('aria-label')).to.equal(
            'Buy Acrobat Pro now',
        );

        // Re-serialize what was rendered and deserialize it again, simulating
        // a second Studio save/reload of the same field HTML.
        const roundTrippedHtml = firstLink.outerHTML;
        const second = makeCtaField(roundTrippedHtml);
        const secondLink = second.querySelector('[slot="footer"] a');
        expect(secondLink.getAttribute('aria-label')).to.equal(
            'Buy Acrobat Pro now',
        );

        // No round never emits an empty aria-label attribute.
        expect(firstLink.getAttribute('aria-label')).to.not.equal('');
        expect(secondLink.getAttribute('aria-label')).to.not.equal('');
    });

    it('does not add a derived aria-label to a non-commerce anchor', () => {
        initMasCommerceService();
        const el = makeCtaField('<a href="https://example.com">Learn more</a>');
        const link = el.querySelector('[slot="footer"] a');
        expect(link.outerHTML).to.equal(
            '<a href="https://example.com">Learn more</a>',
        );
        expect(link.hasAttribute('aria-label')).to.be.false;
    });
});
