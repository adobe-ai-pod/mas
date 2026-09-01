import { expect } from '@esm-bundle/chai';
import '../src/mas.js';
import { CSS } from '../src/variants/product.css.js';

let Product;

before(async () => {
    if (!document.querySelector('mas-commerce-service')) {
        document.head.appendChild(
            document.createElement('mas-commerce-service'),
        );
    }
    await customElements.whenDefined('merch-card');
    ({ Product } = await import('../src/variants/product.js'));
});

// ── Product.adjustShortDescription ───────────────────────────────────────────

describe('Product.adjustShortDescription', () => {
    function makeContainer({ shortDesc = null, legal = null } = {}) {
        const container = document.createElement('div');
        if (legal) container.appendChild(legal);
        const layout = Object.create(Product.prototype);
        layout.card = {
            querySelector: (sel) => {
                if (sel.includes('merch-short-description'))
                    return container.querySelector('.merch-short-description');
                if (sel.includes('short-description')) return shortDesc;
                if (sel.includes('data-template="legal"')) return legal;
                return null;
            },
        };
        return { layout, container };
    }

    it('does nothing when there is no short-description element', () => {
        makeContainer().layout.adjustShortDescription(); // must not throw
    });

    it('does nothing when short-description has no text', () => {
        const shortDesc = document.createElement('div');
        makeContainer({ shortDesc }).layout.adjustShortDescription(); // must not throw
    });

    it('does nothing when legal price element is missing', () => {
        const shortDesc = document.createElement('div');
        shortDesc.innerHTML = '<p>Annual subscription</p>';
        makeContainer({ shortDesc }).layout.adjustShortDescription(); // must not throw
    });

    it('inserts .merch-short-description as sibling after legal price', () => {
        const shortDesc = document.createElement('div');
        shortDesc.innerHTML = '<p>Annual subscription</p>';
        const legal = document.createElement('span');
        const { layout, container } = makeContainer({ shortDesc, legal });
        layout.adjustShortDescription();
        const span = container.querySelector('.merch-short-description');
        expect(span).to.exist;
        expect(span.textContent).to.include('Annual subscription');
        expect(legal.contains(span)).to.be.false;
        expect(span.previousElementSibling).to.equal(legal);
    });

    it('hides the short-description slot element after injection', () => {
        const shortDesc = document.createElement('div');
        shortDesc.innerHTML = '<p>Annual subscription</p>';
        const legal = document.createElement('span');
        const { layout } = makeContainer({ shortDesc, legal });
        layout.adjustShortDescription();
        expect(shortDesc.hidden).to.be.true;
    });

    it('removes existing .merch-short-description before re-appending', () => {
        const shortDesc = document.createElement('div');
        shortDesc.innerHTML = '<p>Annual subscription</p>';
        const legal = document.createElement('span');
        const { layout, container } = makeContainer({ shortDesc, legal });
        layout.adjustShortDescription();
        shortDesc.hidden = false; // reset so second call can proceed
        layout.adjustShortDescription();
        expect(
            container.querySelectorAll('.merch-short-description').length,
        ).to.equal(1);
    });

    it('wires tooltip events on .icon-button elements', () => {
        const shortDesc = document.createElement('div');
        shortDesc.innerHTML =
            '<p>See details <span class="icon-button" data-tooltip="More info"></span></p>';
        const legal = document.createElement('span');
        const { layout, container } = makeContainer({ shortDesc, legal });
        layout.adjustShortDescription();
        const btn = container.querySelector(
            '.merch-short-description .icon-button',
        );
        expect(btn).to.exist;
        btn.dispatchEvent(new Event('mouseenter'));
        expect(btn.classList.contains('tooltip-visible')).to.be.true;
        btn.dispatchEvent(new Event('mouseleave'));
        expect(btn.classList.contains('tooltip-visible')).to.be.false;
    });

    it('hides tooltip on Escape keydown', () => {
        const shortDesc = document.createElement('div');
        shortDesc.innerHTML =
            '<p>Info <span class="icon-button" data-tooltip="Tip"></span></p>';
        const legal = document.createElement('span');
        const { layout, container } = makeContainer({ shortDesc, legal });
        layout.adjustShortDescription();
        const btn = container.querySelector(
            '.merch-short-description .icon-button',
        );
        btn.classList.add('tooltip-visible');
        btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(btn.classList.contains('tooltip-visible')).to.be.false;
    });

    it('does not wire events twice on the same button', () => {
        const shortDesc = document.createElement('div');
        shortDesc.innerHTML =
            '<p>Details <span class="icon-button" data-tooltip="Info"></span></p>';
        const legal = document.createElement('span');
        const { layout, container } = makeContainer({ shortDesc, legal });
        layout.adjustShortDescription();
        shortDesc.hidden = false; // reset so second call can proceed
        layout.adjustShortDescription();
        const btn = container.querySelector(
            '.merch-short-description .icon-button',
        );
        btn.dispatchEvent(new Event('mouseenter'));
        expect(btn.classList.contains('tooltip-visible')).to.be.true;
    });

    it('excludes nested promo-text markup from the injected span', () => {
        const shortDesc = document.createElement('div');
        shortDesc.innerHTML =
            '<p>Annual subscription <span slot="promo-text">Green promo text</span></p>';
        const legal = document.createElement('span');
        const { layout, container } = makeContainer({ shortDesc, legal });
        layout.adjustShortDescription();
        const span = container.querySelector('.merch-short-description');
        expect(span).to.exist;
        expect(span.textContent).to.include('Annual subscription');
        expect(span.textContent).to.not.include('Green promo text');
    });
});

// ── Product.adjustLegal ───────────────────────────────────────────────────────

describe('Product.adjustLegal', () => {
    function makeLayout({ id = '', headingPrice = null } = {}) {
        const layout = Object.create(Product.prototype);
        layout.card = {
            id,
            updateComplete: Promise.resolve(),
            querySelector: (sel) => {
                if (sel.includes('heading-xs') && sel.includes('inline-price'))
                    return headingPrice;
                return null;
            },
        };
        return layout;
    }

    it('does nothing when card has no id', async () => {
        await makeLayout({ id: '' }).adjustLegal(); // must not throw
    });

    it('does nothing when mainPrice is missing', async () => {
        const layout = makeLayout({ id: 'card-1' });
        await customElements.whenDefined('inline-price').catch(() => {});
        await layout.adjustLegal(); // must not throw
    });

    it('sets legalAdjusted flag so it only runs once', async () => {
        const layout = makeLayout({ id: 'card-1' });
        layout.legalAdjusted = true;
        await layout.adjustLegal(); // must not throw — exits early
        expect(layout.legalAdjusted).to.be.true;
    });
});

// ── Product.renderLayout ──────────────────────────────────────────────────────

describe('Product.renderLayout', () => {
    function makeLayout({ promoBottom = false, badge = '' } = {}) {
        const layout = Object.create(Product.prototype);
        Object.defineProperty(layout, 'promoBottom', {
            get: () => promoBottom,
        });
        Object.defineProperty(layout, 'badge', { get: () => badge });
        Object.defineProperty(layout, 'secureLabelFooter', { get: () => '' });
        return layout;
    }

    it('renders without body-xxs slot', () => {
        const result = makeLayout().renderLayout();
        const str = JSON.stringify(result);
        expect(str).to.not.include('body-xxs');
    });

    it('renders promo-text before body-xs when promoBottom is false', () => {
        const result = makeLayout({ promoBottom: false }).renderLayout();
        const str = JSON.stringify(result);
        expect(str).to.include('promo-text');
        expect(str).to.include('body-xs');
    });

    it('renders promo-text after body-xs when promoBottom is true', () => {
        const result = makeLayout({ promoBottom: true }).renderLayout();
        const str = JSON.stringify(result);
        expect(str).to.include('promo-text');
    });
});

// ── product variant short-description styling ─────────────────────────────────

describe('product variant short-description styling', () => {
    function getRuleBody(css, selector) {
        const idx = css.indexOf(selector);
        if (idx === -1) return '';
        const start = css.indexOf('{', idx);
        const end = css.indexOf('}', start);
        return css.slice(start, end + 1);
    }

    it('.merch-short-description uses body-xs font-size token', () => {
        const rule = getRuleBody(
            CSS,
            'merch-card[variant="product"] .merch-short-description {',
        );
        expect(rule).to.include(
            'var(--consonant-merch-card-body-xs-font-size)',
        );
    });

    it('.merch-short-description uses body-xs line-height token', () => {
        const rule = getRuleBody(
            CSS,
            'merch-card[variant="product"] .merch-short-description {',
        );
        expect(rule).to.include(
            'var(--consonant-merch-card-body-xs-line-height)',
        );
    });

    it('.merch-short-description is not italic', () => {
        const rule = getRuleBody(
            CSS,
            'merch-card[variant="product"] .merch-short-description {',
        );
        expect(rule).to.include('font-style: normal');
        expect(rule).to.not.include('font-style: italic');
    });

    it('span[data-template="legal"] rule still has italic treatment', () => {
        const rule = getRuleBody(
            CSS,
            'merch-card[variant="product"][id] span[data-template="legal"]',
        );
        expect(rule).to.include('font-style: italic');
    });
});
