import { expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import Store from '../src/store.js';
import '../src/mas-fragment.js';

describe('MasFragment', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        Store.selecting.set(false);
        Store.selection.set([]);
    });

    const createFragmentStore = (overrides = {}) => {
        const store = {
            id: 'fragment-1',
            value: {
                id: 'fragment-1',
                path: '/test/path',
                model: { path: '/conf/mas/settings/dam/cfm/models/card' },
                references: null,
                getField: sandbox.stub().returns({ values: [] }),
                getFieldValue: sandbox.stub().returns(''),
                getTagTitle: sandbox.stub().returns(''),
                listLocaleVariations: sandbox.stub().returns([]),
                listPromoVariations: sandbox.stub().returns([]),
                listGroupedVariations: sandbox.stub().returns([]),
                ...overrides,
            },
            get() {
                return this.value;
            },
            subscribe: sandbox.stub().returns({ unsubscribe: sandbox.stub() }),
            unsubscribe: sandbox.stub(),
        };
        return store;
    };

    describe('toggleExpand', () => {
        it('toggles expanded state', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="table"></mas-fragment>`);
            expect(el.expanded).to.be.false;
            await el.toggleExpand();
            expect(el.expanded).to.be.true;
        });

        it('loads references when expanding without existing references', async () => {
            const fragmentStore = createFragmentStore();
            const mockReferences = [{ id: 'ref1' }];
            const mockRepo = {
                refreshFragment: sandbox.stub().callsFake(async (store) => {
                    store.value.references = mockReferences;
                }),
            };
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="table"></mas-fragment>`);
            sandbox.stub(el, 'repository').get(() => mockRepo);
            await el.toggleExpand();
            expect(mockRepo.refreshFragment.calledWith(fragmentStore)).to.be.true;
            expect(fragmentStore.value.references).to.deep.equal(mockReferences);
        });

        it('does not load references when already loaded', async () => {
            const fragmentStore = createFragmentStore({ references: [{ id: 'existing' }] });
            const mockRepo = {
                refreshFragment: sandbox.stub().resolves([{ id: 'ref1' }]),
            };
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="table"></mas-fragment>`);
            sandbox.stub(el, 'repository').get(() => mockRepo);
            await el.toggleExpand();
            expect(mockRepo.refreshFragment.called).to.be.false;
        });

        it('dispatches table-selection-refresh when expanding while selecting', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="table"></mas-fragment>`);
            const parent = document.createElement('div');
            parent.appendChild(el);
            const refreshSpy = sinon.spy();
            parent.addEventListener('table-selection-refresh', refreshSpy);

            Store.selecting.set(true);
            await el.toggleExpand();

            expect(refreshSpy.calledOnce).to.be.true;
            Store.selecting.set(false);
        });

        it('handles error when loading references', async () => {
            const fragmentStore = createFragmentStore();
            const consoleErrorStub = sandbox.stub(console, 'error');
            const mockRepo = {
                refreshFragment: sandbox.stub().rejects(new Error('Load failed')),
            };
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="table"></mas-fragment>`);
            sandbox.stub(el, 'repository').get(() => mockRepo);
            await el.toggleExpand();
            expect(consoleErrorStub.calledWithMatch('Failed to load references:', sinon.match.instanceOf(Error))).to.be.true;
            expect(el.expanded).to.be.true;
            expect(el.loadingReferences).to.be.false;
        });
    });

    describe('single click selects', () => {
        it('toggles the fragment id into Store.selection on single click', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="render"></mas-fragment>`);
            const target = el.querySelector('mas-fragment-render');
            target.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 1 }));
            await new Promise((r) => setTimeout(r, 250));
            expect(Store.selection.get()).to.deep.equal(['fragment-1']);
        });

        it('removes the fragment id on a second single click (toggle)', async () => {
            const fragmentStore = createFragmentStore();
            Store.selection.set(['fragment-1']);
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="render"></mas-fragment>`);
            const target = el.querySelector('mas-fragment-render');
            target.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 1 }));
            await new Promise((r) => setTimeout(r, 250));
            expect(Store.selection.get()).to.deep.equal([]);
        });

        it('does not toggle selection when clicking an interactive control', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="render"></mas-fragment>`);
            const target = el.querySelector('mas-fragment-render');
            const expandButton = document.createElement('button');
            expandButton.className = 'expand-button';
            target.appendChild(expandButton);
            expandButton.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 1 }));
            await new Promise((r) => setTimeout(r, 250));
            expect(Store.selection.get()).to.deep.equal([]);
        });

        it('does not toggle parent fragment when click originates from a nested mas-fragment-table', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="table"></mas-fragment>`);
            const nestedTable = document.createElement('mas-fragment-table');
            el.appendChild(nestedTable);
            nestedTable.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 1 }));
            await new Promise((r) => setTimeout(r, 250));
            expect(Store.selection.get()).to.deep.equal([]);
        });

        it('double-click opens the editor without toggling selection', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="render"></mas-fragment>`);
            const routerModule = await import('../src/router.js');
            const navigateSpy = sandbox.stub(routerModule.default, 'navigateToFragmentEditor').resolves();
            const target = el.querySelector('mas-fragment-render');

            // Simulate browser sequence: click(detail=1), click(detail=2), dblclick
            target.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 1 }));
            target.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 2 }));
            target.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, composed: true, detail: 2 }));
            await new Promise((r) => setTimeout(r, 250));

            expect(navigateSpy.calledOnce).to.be.true;
            expect(Store.selection.get()).to.deep.equal([]);
        });
    });

    describe('view rendering', () => {
        it('renders table view when view="table"', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="table"></mas-fragment>`);
            const tableView = el.querySelector('mas-fragment-table');
            const renderView = el.querySelector('mas-fragment-render');
            expect(tableView).to.exist;
            expect(renderView).to.not.exist;
        });

        it('renders render view when view="render"', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="render"></mas-fragment>`);
            const renderView = el.querySelector('mas-fragment-render');
            const tableView = el.querySelector('mas-fragment-table');
            expect(renderView).to.exist;
            expect(tableView).to.not.exist;
        });

        it('renders fragment variations when expanded', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="table"></mas-fragment>`);
            el.expanded = true;
            await el.updateComplete;
            const variations = el.querySelector('mas-fragment-variations');
            expect(variations).to.exist;
        });
    });
});
