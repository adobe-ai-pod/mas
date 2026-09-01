import { expect } from '@esm-bundle/chai';
import { html } from 'lit';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers/pure';
import sinon from 'sinon';
import { QUICK_ACTION } from '../../src/constants.js';
import Store from '../../src/store.js';
import { Fragment } from '../../src/aem/fragment.js';
import { FragmentStore } from '../../src/reactivity/fragment-store.js';
import Events from '../../src/events.js';
import '../../src/swc.js';
import '../../src/translation/mas-translation.js';
import '../../src/translation/mas-translation-editor.js';

const createMockProject = (id, title, submissionDate = null, status = null) => {
    const fields = [];
    if (submissionDate !== null && submissionDate !== undefined) {
        fields.push({ name: 'submissionDate', type: 'long', values: [submissionDate] });
    }
    if (status !== null && status !== undefined) {
        fields.push({ name: 'status', type: 'text', values: [status] });
    }
    fields.push({ name: 'title', type: 'text', multiple: false, values: [title] });
    fields.push({
        name: 'fragments',
        type: 'content-fragment',
        multiple: true,
        values: ['/content/dam/mas/sandbox/en_US/frag1'],
    });
    fields.push({ name: 'placeholders', type: 'content-fragment', multiple: true, values: [] });
    fields.push({ name: 'collections', type: 'content-fragment', multiple: true, values: [] });
    fields.push({ name: 'targetLocales', type: 'text', multiple: true, values: ['fr_FR', 'de_DE'] });
    fields.push({ name: 'projectType', type: 'enumeration', multiple: false, values: ['translation'] });
    const fragment = new Fragment({
        id,
        title,
        path: `/content/dam/mas/sandbox/translations/${id}`,
        modified: { fullName: 'Test User' },
        fields,
    });
    return new FragmentStore(fragment);
};

describe('MasTranslation duplicate wiring', () => {
    let sandbox;
    let toastEmitStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        toastEmitStub = sinon.stub(Events.toast, 'emit');
        Store.translationProjects.list.data.value = [];
        Store.translationProjects.list.loading.value = false;
        Store.translationProjects.inEdit.value = null;
        Store.translationProjects.translationProjectId.value = null;
    });

    afterEach(() => {
        fixtureCleanup();
        sandbox.restore();
        toastEmitStub.restore();
        Store.translationProjects.list.data.value = [];
        Store.translationProjects.list.loading.value = false;
        Store.translationProjects.inEdit.value = null;
        Store.translationProjects.translationProjectId.value = null;
    });

    it('Duplicate menu item for a project with submissionDate is rendered without disabled', async () => {
        const sentToLocDate = new Date('2024-06-01').getTime();
        const mockProject = createMockProject('sent-1', 'Sent Project', sentToLocDate, 'ASYNC_PROCESSING');
        Store.translationProjects.list.data.value = [mockProject];
        const el = await fixture(html`<mas-translation></mas-translation>`);
        await el.updateComplete;
        const menuItems = el.shadowRoot.querySelectorAll('sp-menu-item');
        const duplicateItem = Array.from(menuItems).find((item) => item.textContent.trim().includes('Duplicate'));
        expect(duplicateItem).to.exist;
        expect(duplicateItem.disabled).to.be.false;
    });

    it('clicking Duplicate opens the dialog with proposed title for a Sent to Loc project', async () => {
        const sentToLocDate = new Date('2024-06-01').getTime();
        const mockProject = createMockProject('sent-2', 'My Sent Project', sentToLocDate, 'ASYNC_PROCESSING');
        Store.translationProjects.list.data.value = [mockProject];
        const el = await fixture(html`<mas-translation></mas-translation>`);
        await el.updateComplete;
        const menuItems = el.shadowRoot.querySelectorAll('sp-menu-item');
        const duplicateItem = Array.from(menuItems).find((item) => item.textContent.trim().includes('Duplicate'));
        duplicateItem.click();
        await el.updateComplete;
        expect(el.duplicateDialogOpen).to.be.true;
        expect(el.duplicateProposedTitle).to.equal('My Sent Project copy');
    });

    it('duplicate-confirmed creates a project with the confirmed title, no submissionDate, and retained fields', async () => {
        const sentToLocDate = new Date('2024-06-01').getTime();
        const mockProject = createMockProject('sent-3', 'Confirmed Project', sentToLocDate, 'ASYNC_PROCESSING');
        Store.translationProjects.list.data.value = [mockProject];

        let capturedPayload = null;
        const createFragmentStub = sinon.stub().callsFake((payload) => {
            capturedPayload = payload;
            return Promise.resolve(
                new Fragment({
                    id: 'new-id',
                    title: payload.title,
                    path: `/content/dam/mas/sandbox/translations/new-id`,
                    modified: { fullName: 'Test User' },
                    fields: payload.fields,
                }),
            );
        });
        const getTranslationsPathStub = sinon.stub().returns('/content/dam/mas/sandbox/translations');
        const originalQuerySelector = document.querySelector.bind(document);
        const querySelectorStub = sinon.stub(document, 'querySelector').callsFake((selector) => {
            if (selector === 'mas-repository') {
                return { createFragment: createFragmentStub, getTranslationsPath: getTranslationsPathStub };
            }
            return originalQuerySelector(selector);
        });

        const el = await fixture(html`<mas-translation></mas-translation>`);
        await el.updateComplete;
        const menuItems = el.shadowRoot.querySelectorAll('sp-menu-item');
        const duplicateItem = Array.from(menuItems).find((item) => item.textContent.trim().includes('Duplicate'));
        duplicateItem.click();
        await el.updateComplete;

        const dialog = el.shadowRoot.querySelector('mas-translation-duplicate-dialog');
        dialog.dispatchEvent(
            new CustomEvent('duplicate-confirmed', {
                bubbles: true,
                composed: true,
                detail: { title: 'New Duplicate Title' },
            }),
        );
        await el.updateComplete;
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(createFragmentStub.calledOnce).to.be.true;
        expect(capturedPayload.title).to.equal('New Duplicate Title');
        const submissionField = capturedPayload.fields.find((f) => f.name === 'submissionDate');
        expect(submissionField).to.be.undefined;
        const targetLocalesField = capturedPayload.fields.find((f) => f.name === 'targetLocales');
        expect(targetLocalesField).to.exist;
        expect(targetLocalesField.values).to.deep.equal(['fr_FR', 'de_DE']);
        const fragmentsField = capturedPayload.fields.find((f) => f.name === 'fragments');
        expect(fragmentsField).to.exist;
        expect(fragmentsField.values).to.deep.equal(['/content/dam/mas/sandbox/en_US/frag1']);

        querySelectorStub.restore();
    });

    it('duplicate-cancelled closes the dialog without calling repository', async () => {
        const mockProject = createMockProject('draft-1', 'Draft Project');
        Store.translationProjects.list.data.value = [mockProject];

        const createFragmentStub = sinon.stub().resolves();
        const originalQuerySelector = document.querySelector.bind(document);
        const querySelectorStub = sinon.stub(document, 'querySelector').callsFake((selector) => {
            if (selector === 'mas-repository') {
                return { createFragment: createFragmentStub, getTranslationsPath: sinon.stub().returns('/path') };
            }
            return originalQuerySelector(selector);
        });

        const el = await fixture(html`<mas-translation></mas-translation>`);
        await el.updateComplete;
        const menuItems = el.shadowRoot.querySelectorAll('sp-menu-item');
        const duplicateItem = Array.from(menuItems).find((item) => item.textContent.trim().includes('Duplicate'));
        duplicateItem.click();
        await el.updateComplete;
        expect(el.duplicateDialogOpen).to.be.true;

        const dialog = el.shadowRoot.querySelector('mas-translation-duplicate-dialog');
        dialog.dispatchEvent(new CustomEvent('duplicate-cancelled', { bubbles: true, composed: true }));
        await el.updateComplete;

        expect(el.duplicateDialogOpen).to.be.false;
        expect(createFragmentStub.called).to.be.false;

        querySelectorStub.restore();
    });
});

describe('MasTranslationEditor duplicate action', () => {
    let sandbox;

    const createMockFragment = (overrides = {}) => ({
        id: 'editor-fragment-id',
        title: 'Editor-Project',
        path: '/content/dam/mas/sandbox/translations/editor-project',
        fields: [
            { name: 'title', type: 'text', multiple: false, values: ['Editor-Project'] },
            { name: 'status', type: 'text', multiple: false, values: [] },
            { name: 'fragments', type: 'content-fragment', multiple: true, values: ['/content/dam/mas/sandbox/en_US/frag1'] },
            { name: 'placeholders', type: 'content-fragment', multiple: true, values: [] },
            { name: 'collections', type: 'content-fragment', multiple: true, values: [] },
            { name: 'targetLocales', type: 'text', multiple: true, values: ['fr_FR'] },
            { name: 'submissionDate', type: 'date-time', multiple: false, values: ['2024-06-01T00:00:00Z'] },
            { name: 'projectType', type: 'enumeration', multiple: false, values: ['translation'] },
        ],
        modified: { fullName: 'Test User' },
        ...overrides,
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        Store.translationProjects.list.data.value = [];
        Store.translationProjects.list.loading.value = false;
        Store.translationProjects.inEdit.value = null;
        Store.translationProjects.translationProjectId.value = null;
        Store.translationProjects.selectedCards.value = [];
        Store.translationProjects.selectedCollections.value = [];
        Store.translationProjects.selectedPlaceholders.value = [];
        Store.translationProjects.targetLocales.value = [];
    });

    afterEach(() => {
        fixtureCleanup();
        sandbox.restore();
        Store.translationProjects.inEdit.value = null;
        Store.translationProjects.translationProjectId.value = null;
        Store.translationProjects.selectedCards.value = [];
        Store.translationProjects.selectedCollections.value = [];
        Store.translationProjects.selectedPlaceholders.value = [];
        Store.translationProjects.targetLocales.value = [];
    });

    it('QUICK_ACTION.DUPLICATE is not in the disabled set for a loaded submitted project', async () => {
        const mockFragmentData = createMockFragment();
        const getByIdStub = sinon.stub().resolves(mockFragmentData);
        const originalQuerySelector = document.querySelector.bind(document);
        const querySelectorStub = sinon.stub(document, 'querySelector').callsFake((selector) => {
            if (selector === 'mas-repository') {
                return {
                    aem: { sites: { cf: { fragments: { getById: getByIdStub } } } },
                    searchFragments: sinon.stub(),
                    loadPlaceholders: sinon.stub(),
                    loadAllCollections: sinon.stub(),
                    getTranslationsPath: sinon.stub().returns('/content/dam/mas/sandbox/translations'),
                };
            }
            return originalQuerySelector(selector);
        });

        Store.translationProjects.translationProjectId.value = 'editor-fragment-id';
        const el = await fixture(html`<mas-translation-editor></mas-translation-editor>`);
        await el.updateComplete;
        await new Promise((resolve) => setTimeout(resolve, 20));
        await el.updateComplete;

        expect(el.isProjectReadonly).to.be.true;
        expect(el.disabledActions.has(QUICK_ACTION.DUPLICATE)).to.be.false;
        expect(el.disabledActions.has(QUICK_ACTION.LOC)).to.be.true;

        querySelectorStub.restore();
    });
});
