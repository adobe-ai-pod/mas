import { expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import { getFragmentEditorUrl, openFragmentEditorInNewTab } from '../../src/utils/open-in-new-tab.js';
import { PAGE_NAMES, CARD_MODEL_PATH, COLLECTION_MODEL_PATH } from '../../src/constants.js';
import Store from '../../src/store.js';
import { Fragment } from '../../src/aem/fragment.js';
import generateFragmentStore from '../../src/reactivity/source-fragment-store.js';
import '../../src/swc.js';
import '../../src/editors/merch-card-collection-editor.js';

describe('getFragmentEditorUrl', () => {
    it('returns a URL starting with window.location.origin + pathname', () => {
        const url = getFragmentEditorUrl('abc-123');
        expect(url.startsWith(window.location.origin + window.location.pathname)).to.be.true;
    });

    it('hash contains page=fragment-editor and the given fragmentId', () => {
        const url = getFragmentEditorUrl('abc-123');
        const hash = url.slice(url.indexOf('#') + 1);
        const params = new URLSearchParams(hash);
        expect(params.get('page')).to.equal(PAGE_NAMES.FRAGMENT_EDITOR);
        expect(params.get('fragmentId')).to.equal('abc-123');
    });

    it('preserves the current path hash param when present', () => {
        const original = window.location.hash;
        window.location.hash = 'page=fragment-editor&path=nala&fragmentId=x';
        const url = getFragmentEditorUrl('abc-456');
        const hash = url.slice(url.indexOf('#') + 1);
        const params = new URLSearchParams(hash);
        expect(params.get('path')).to.equal('nala');
        window.location.hash = original;
    });

    it('does not contain a hard-coded hostname or AEM bucket', () => {
        const url = getFragmentEditorUrl('abc-123');
        expect(url).to.not.include('adobeaemcloud.com');
        expect(url).to.not.include('author-p');
        expect(url).to.not.include('adobe.com');
    });
});

describe('openFragmentEditorInNewTab', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('calls window.open once with _blank target and noopener features', () => {
        const openStub = sandbox.stub(window, 'open');
        openFragmentEditorInNewTab('abc-123');
        expect(openStub.calledOnce).to.be.true;
        const [url, target, features] = openStub.firstCall.args;
        expect(target).to.equal('_blank');
        expect(features).to.include('noopener');
        const hash = url.slice(url.indexOf('#') + 1);
        const params = new URLSearchParams(hash);
        expect(params.get('page')).to.equal(PAGE_NAMES.FRAGMENT_EDITOR);
        expect(params.get('fragmentId')).to.equal('abc-123');
    });

    it('does not call window.open and does not throw when fragmentId is undefined', () => {
        const openStub = sandbox.stub(window, 'open');
        expect(() => openFragmentEditorInNewTab(undefined)).to.not.throw();
        expect(openStub.called).to.be.false;
    });

    it('does not call window.open and does not throw when fragmentId is null', () => {
        const openStub = sandbox.stub(window, 'open');
        expect(() => openFragmentEditorInNewTab(null)).to.not.throw();
        expect(openStub.called).to.be.false;
    });

    it('does not call window.open and does not throw when fragmentId is empty string', () => {
        const openStub = sandbox.stub(window, 'open');
        expect(() => openFragmentEditorInNewTab('')).to.not.throw();
        expect(openStub.called).to.be.false;
    });
});

// ----- helpers -------------------------------------------------------

function makeCardFragment(id, path) {
    return new Fragment({
        id,
        path,
        title: 'Test Card',
        name: 'test-card',
        status: 'PUBLISHED',
        model: { path: CARD_MODEL_PATH },
        fields: [
            { name: 'cardTitle', values: ['Test Card Title'], multiple: false },
            { name: 'variant', values: ['ccd-action'], multiple: false },
        ],
        references: [],
        tags: [],
    });
}

function makeCollectionFragment(id, path, cardId, cardPath) {
    return new Fragment({
        id,
        path,
        title: 'Test Collection',
        name: 'test-collection',
        status: 'PUBLISHED',
        model: { path: COLLECTION_MODEL_PATH },
        fields: [
            { name: 'label', values: ['Test Collection Label'], multiple: false },
            {
                name: 'cards',
                values: cardPath ? [cardPath] : [],
                multiple: true,
            },
        ],
        references: cardPath
            ? [
                  {
                      id: cardId,
                      path: cardPath,
                      title: 'Test Card',
                      name: 'test-card',
                      status: 'PUBLISHED',
                      model: { path: CARD_MODEL_PATH },
                      fields: [
                          { name: 'cardTitle', values: ['Test Card Title'], multiple: false },
                          { name: 'variant', values: ['ccd-action'], multiple: false },
                      ],
                      tags: [],
                      references: [],
                  },
              ]
            : [],
        tags: [],
    });
}

// ----- MerchCardCollectionEditor rendering tests ----------------------

describe('MerchCardCollectionEditor - Open in new tab control', () => {
    const CARD_ID = 'card-frag-id-001';
    const CARD_PATH = '/content/dam/test/card-001';
    const COLLECTION_ID = 'collection-frag-id-001';
    const COLLECTION_PATH = '/content/dam/test/collection-001';

    let sandbox;
    let editor;
    let originalStoreData;

    beforeEach(async () => {
        sandbox = sinon.createSandbox();
        originalStoreData = Store.fragments.list.data.get();

        // Create the card fragment and its store
        const cardFragment = makeCardFragment(CARD_ID, CARD_PATH);
        const cardStore = generateFragmentStore(cardFragment);

        // Put the card store into the global fragments list so initFragmentReferencesMap
        // can find it without hitting the AEM cache
        Store.fragments.list.data.set([cardStore]);

        // Create the collection fragment whose references include the card
        const collectionFragment = makeCollectionFragment(COLLECTION_ID, COLLECTION_PATH, CARD_ID, CARD_PATH);
        const collectionStore = generateFragmentStore(collectionFragment);

        // Mount the editor
        editor = await fixture(html`<merch-card-collection-editor></merch-card-collection-editor>`);
        editor.fragmentStore = collectionStore;

        // initFragmentReferencesMap is fire-and-forget inside update(); await it
        // directly so the map is populated before we inspect the shadow DOM
        await editor.initFragmentReferencesMap();
        await editor.updateComplete;
    });

    afterEach(() => {
        Store.fragments.list.data.set(originalStoreData);
        editor.remove();
        sandbox.restore();
    });

    it("renders the 'Open in new tab' control for a CARD_MODEL_PATH item", () => {
        const openInNewTabBtn = editor.shadowRoot.querySelector('sp-action-button[label="Open in new tab"]');
        expect(openInNewTabBtn).to.not.be.null;
    });

    it("'Open in new tab' control is absent when item model path is COLLECTION_MODEL_PATH", async () => {
        const SUB_COLLECTION_ID = 'sub-collection-id';
        const SUB_COLLECTION_PATH = '/content/dam/test/sub-collection';

        // A sub-collection item (model path = COLLECTION_MODEL_PATH)
        const subCollectionFragment = new Fragment({
            id: SUB_COLLECTION_ID,
            path: SUB_COLLECTION_PATH,
            title: 'Sub Collection',
            name: 'sub-collection',
            status: 'PUBLISHED',
            model: { path: COLLECTION_MODEL_PATH },
            fields: [{ name: 'label', values: ['Sub Collection'], multiple: false }],
            references: [],
            tags: [],
        });
        Store.fragments.list.data.set([generateFragmentStore(subCollectionFragment)]);

        // Parent collection that references the sub-collection via 'collections' field
        const parentFragment = new Fragment({
            id: 'parent-collection-id',
            path: '/content/dam/test/parent-collection',
            title: 'Parent Collection',
            name: 'parent-collection',
            status: 'PUBLISHED',
            model: { path: COLLECTION_MODEL_PATH },
            fields: [
                { name: 'label', values: ['Parent'], multiple: false },
                { name: 'collections', values: [SUB_COLLECTION_PATH], multiple: true },
            ],
            references: [
                {
                    id: SUB_COLLECTION_ID,
                    path: SUB_COLLECTION_PATH,
                    title: 'Sub Collection',
                    name: 'sub-collection',
                    status: 'PUBLISHED',
                    model: { path: COLLECTION_MODEL_PATH },
                    fields: [{ name: 'label', values: ['Sub Collection'], multiple: false }],
                    tags: [],
                    references: [],
                },
            ],
            tags: [],
        });

        editor.fragmentStore = generateFragmentStore(parentFragment);
        await editor.initFragmentReferencesMap();
        await editor.updateComplete;

        const openInNewTabBtn = editor.shadowRoot.querySelector('sp-action-button[label="Open in new tab"]');
        expect(openInNewTabBtn).to.be.null;
    });

    it('clicking the control calls window.open with _blank and a URL containing page=fragment-editor and the fragmentId', async () => {
        const openStub = sandbox.stub(window, 'open');

        const openInNewTabBtn = editor.shadowRoot.querySelector('sp-action-button[label="Open in new tab"]');
        expect(openInNewTabBtn).to.not.be.null;

        openInNewTabBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));

        expect(openStub.calledOnce).to.be.true;
        const [url, target] = openStub.firstCall.args;
        expect(target).to.equal('_blank');
        const hash = url.slice(url.indexOf('#') + 1);
        const params = new URLSearchParams(hash);
        expect(params.get('page')).to.equal(PAGE_NAMES.FRAGMENT_EDITOR);
        expect(params.get('fragmentId')).to.equal(CARD_ID);
    });

    it('clicking the control does not invoke router.navigateToFragmentEditor', async () => {
        const openStub = sandbox.stub(window, 'open');
        const routerSpy = sandbox.spy(editor, 'editFragment');

        const openInNewTabBtn = editor.shadowRoot.querySelector('sp-action-button[label="Open in new tab"]');
        openInNewTabBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));

        expect(openStub.calledOnce).to.be.true;
        expect(routerSpy.called).to.be.false;
    });
});
