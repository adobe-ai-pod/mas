import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import Store from '../../src/store.js';
import { PAGE_NAMES } from '../../src/constants.js';
import Events from '../../src/events.js';
import { buildPlaceholderCopyCodeUrl, copyPlaceholderCopyCodeUrls } from '../../src/placeholders/placeholder-copy-code.js';

describe('placeholder-copy-code', () => {
    let sandbox;
    let clipboardStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        Store.search.set({ path: 'nala' });
        Store.filters.set((prev) => ({ ...prev, locale: 'en_US' }));
        clipboardStub = { writeText: sandbox.stub().resolves() };
        Object.defineProperty(navigator, 'clipboard', { value: clipboardStub, configurable: true });
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('buildPlaceholderCopyCodeUrl', () => {
        it('builds a Studio deep link containing the placeholders page, surface, locale and key', () => {
            const url = buildPlaceholderCopyCodeUrl({ key: 'save-today' });
            expect(url).to.include('/studio.html#');
            expect(url).to.include('content-type=placeholder');
            expect(url).to.include(`page=${PAGE_NAMES.PLACEHOLDERS}`);
            expect(url).to.include('path=nala');
            expect(url).to.include('locale=en_US');
            expect(url).to.include('search=save-today');
        });
    });

    describe('copyPlaceholderCopyCodeUrls', () => {
        it('copies a single placeholder URL and emits a positive toast', async () => {
            const toastStub = sandbox.stub(Events.toast, 'emit');

            await copyPlaceholderCopyCodeUrls({ key: 'save-today' });

            expect(clipboardStub.writeText.calledOnce).to.be.true;
            expect(clipboardStub.writeText.firstCall.args[0]).to.include('search=save-today');
            expect(toastStub.calledWith(sinon.match({ variant: 'positive', content: 'Placeholder URL copied to clipboard' })))
                .to.be.true;
        });

        it('joins multiple placeholder URLs with newlines in input order and calls writeText once', async () => {
            const toastStub = sandbox.stub(Events.toast, 'emit');

            await copyPlaceholderCopyCodeUrls([{ key: 'key-one' }, { key: 'key-two' }, { key: 'key-three' }]);

            expect(clipboardStub.writeText.calledOnce).to.be.true;
            const copiedText = clipboardStub.writeText.firstCall.args[0];
            const urls = copiedText.split('\n');
            expect(urls).to.have.lengthOf(3);
            expect(urls[0]).to.include('search=key-one');
            expect(urls[1]).to.include('search=key-two');
            expect(urls[2]).to.include('search=key-three');
            expect(toastStub.calledWith(sinon.match({ variant: 'positive', content: 'Placeholder URLs copied to clipboard' })))
                .to.be.true;
        });

        it('emits a negative toast and does not throw when the clipboard write rejects', async () => {
            clipboardStub.writeText.rejects(new Error('Permission denied'));
            const toastStub = sandbox.stub(Events.toast, 'emit');

            await copyPlaceholderCopyCodeUrls({ key: 'save-today' });

            expect(toastStub.calledWith(sinon.match({ variant: 'negative', content: 'Failed to copy to clipboard' }))).to.be
                .true;
        });

        it('does nothing when given an empty array', async () => {
            const toastStub = sandbox.stub(Events.toast, 'emit');

            await copyPlaceholderCopyCodeUrls([]);

            expect(clipboardStub.writeText.called).to.be.false;
            expect(toastStub.called).to.be.false;
        });
    });
});
