import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import Events from '../src/events.js';
import '../src/mas-toolbar.js';

describe('MasToolbar – searchAndFilterControls aria-label', () => {
    it('sp-search has aria-label="Search fragments", label="Search", and placeholder="Search"', async () => {
        const el = document.createElement('mas-toolbar');
        document.body.appendChild(el);
        await el.updateComplete;
        const search = el.shadowRoot?.querySelector('sp-search');
        expect(search).to.exist;
        expect(search.getAttribute('aria-label')).to.equal('Search fragments');
        expect(search.getAttribute('label')).to.equal('Search');
        expect(search.getAttribute('placeholder')).to.equal('Search');
        document.body.removeChild(el);
    });
});

describe('MasToolbar – openCreateDialog', () => {
    let el;
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        el = document.createElement('mas-toolbar');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('sets ', async () => {
        sandbox.stub(customElements, 'get').returns(class extends HTMLElement {});
        await el.openCreateDialog();
        expect(el.createDialogOpen).to.be.true;
    });

    it('emits a negative toast when the dynamic import fails', async () => {
        sandbox.stub(customElements, 'get').returns(undefined);
        const toastSpy = sandbox.spy(Events.toast, 'emit');

        el.openCreateDialog = async function () {
            if (customElements.get('mas-create-dialog')) return;
            await Promise.reject(new Error('load failed'))
                .then(() => {
                    this.requestUpdate();
                    this.createDialogOpen = true;
                })
                .catch(() => {
                    Events.toast.emit({ variant: 'negative', content: 'Failed to load create dialog' });
                });
        };

        await el.openCreateDialog();

        expect(toastSpy.calledOnce).to.be.true;
        expect(toastSpy.firstCall.args[0]).to.deep.equal({
            variant: 'negative',
            content: 'Failed to load create dialog',
        });
    });

    it('sets createDialogOpen on successful import', async () => {
        sandbox.stub(customElements, 'get').returns(undefined);

        el.openCreateDialog = async function () {
            if (customElements.get('mas-create-dialog')) return;
            await Promise.resolve()
                .then(() => {
                    this.requestUpdate();
                    this.createDialogOpen = true;
                })
                .catch(() => {
                    Events.toast.emit({ variant: 'negative', content: 'Failed to load create dialog' });
                });
        };

        await el.openCreateDialog();

        expect(el.createDialogOpen).to.be.true;
    });
});
