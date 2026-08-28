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

    describe('click selection', () => {
        afterEach(() => {
            Store.selecting.set(false);
            Store.selection.set([]);
        });

        it('selects the fragment on a plain click in render view without opening the editor', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="render"></mas-fragment>`);
            const card = el.querySelector('mas-fragment-render');

            card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await el.updateComplete;

            expect(Store.selection.get()).to.deep.equal(['fragment-1']);
            expect(card.hasAttribute('selected')).to.be.true;
        });

        it('opens the editor on dblclick in render view and leaves the selection unchanged', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="render"></mas-fragment>`);
            const card = el.querySelector('mas-fragment-render');
            const routerModule = await import('../src/router.js');
            const navigateSpy = sandbox.stub(routerModule.default, 'navigateToFragmentEditor').resolves();

            card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            card.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

            expect(navigateSpy.calledWith('fragment-1')).to.be.true;
            expect(Store.selection.get()).to.deep.equal(['fragment-1']);
        });

        it('selects the fragment on a plain click in table view and marks the row selected', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="table"></mas-fragment>`);
            const tableEl = el.querySelector('mas-fragment-table');
            const row = el.querySelector('sp-table-row');

            row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await el.updateComplete;
            await tableEl.updateComplete;

            expect(Store.selection.get()).to.deep.equal(['fragment-1']);
            expect(row.hasAttribute('selected')).to.be.true;
        });

        it('adds to the selection on a modifier click instead of replacing it', async () => {
            const fragmentStoreA = createFragmentStore({ id: 'fragment-1' });
            const fragmentStoreB = createFragmentStore({ id: 'fragment-2' });
            const elA = await fixture(html`<mas-fragment .fragmentStore=${fragmentStoreA} view="render"></mas-fragment>`);
            const elB = await fixture(html`<mas-fragment .fragmentStore=${fragmentStoreB} view="render"></mas-fragment>`);

            elA.querySelector('mas-fragment-render').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            elB.querySelector('mas-fragment-render').dispatchEvent(new MouseEvent('click', { bubbles: true, metaKey: true }));

            expect(Store.selection.get()).to.deep.equal(['fragment-1', 'fragment-2']);
        });

        it('keeps an already-selected fragment as the sole selection on a plain click', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="render"></mas-fragment>`);
            const card = el.querySelector('mas-fragment-render');

            card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            card.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(Store.selection.get()).to.deep.equal(['fragment-1']);
        });

        it('does not change the selection when clicking the row action menu', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="table"></mas-fragment>`);
            const actionMenu = el.querySelector('sp-action-menu');

            actionMenu.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(Store.selection.get()).to.deep.equal([]);
        });

        it('leaves Store.selecting true after a click selection and false once deselected', async () => {
            const fragmentStore = createFragmentStore();
            const el = await fixture(html`<mas-fragment .fragmentStore=${fragmentStore} view="render"></mas-fragment>`);
            const card = el.querySelector('mas-fragment-render');

            card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(Store.selecting.get()).to.be.true;

            card.dispatchEvent(new MouseEvent('click', { bubbles: true, metaKey: true }));
            expect(Store.selecting.get()).to.be.false;
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
