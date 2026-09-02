import { expect } from '@esm-bundle/chai';
import { html } from 'lit';
import { fixture } from '@open-wc/testing-helpers/pure';
import '../../src/swc.js';
import '../../src/editors/variant-picker.js';
import { spTheme } from '../utils.js';

describe('VariantPicker error state', () => {
    it('renders sp-picker with invalid attribute when value is empty', async () => {
        const el = await fixture(html`<variant-picker></variant-picker>`, { parentNode: spTheme() });
        const picker = el.shadowRoot.querySelector('sp-picker');
        expect(picker).to.exist;
        expect(picker.invalid).to.be.true;
    });

    it('renders negative help text "Select a template first" when value is empty', async () => {
        const el = await fixture(html`<variant-picker></variant-picker>`, { parentNode: spTheme() });
        await el.updateComplete;
        const helpText = el.shadowRoot.querySelector('.help-text-negative');
        expect(helpText).to.exist;
        expect(helpText.textContent).to.equal('Select a template first');
    });

    it('does not render invalid state when a value is set', async () => {
        const el = await fixture(html`<variant-picker value="plans"></variant-picker>`, { parentNode: spTheme() });
        await el.updateComplete;
        const picker = el.shadowRoot.querySelector('sp-picker');
        expect(picker.invalid).to.be.false;
        const helpText = el.shadowRoot.querySelector('.help-text-negative');
        expect(helpText).to.be.null;
    });

    it('does not render help text when a value is set', async () => {
        const el = await fixture(html`<variant-picker value="catalog"></variant-picker>`, { parentNode: spTheme() });
        await el.updateComplete;
        const helpText = el.shadowRoot.querySelector('.help-text-negative');
        expect(helpText).to.be.null;
    });

    it('restores error state after value is cleared', async () => {
        const el = await fixture(html`<variant-picker value="plans"></variant-picker>`, { parentNode: spTheme() });
        await el.updateComplete;
        expect(el.shadowRoot.querySelector('.help-text-negative')).to.be.null;

        el.value = '';
        await el.updateComplete;
        const helpText = el.shadowRoot.querySelector('.help-text-negative');
        expect(helpText).to.exist;
        expect(el.shadowRoot.querySelector('sp-picker').invalid).to.be.true;
    });

    it('does not show error state when value is set even if invalid attribute is present', async () => {
        const el = await fixture(html`<variant-picker value="plans" invalid></variant-picker>`, {
            parentNode: spTheme(),
        });
        await el.updateComplete;
        const picker = el.shadowRoot.querySelector('sp-picker');
        expect(picker.invalid).to.be.false;
        const helpText = el.shadowRoot.querySelector('.help-text-negative');
        expect(helpText).to.be.null;
    });
});
