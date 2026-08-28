import { expect } from '@esm-bundle/chai';
import {
    normalizeImageUrl,
    ADOBE_ORIGIN_HOSTS,
    AEM_ORIGIN_HOST_SUFFIXES,
} from '../src/image-url.js';
import { processMnemonics, processBackgroundImage } from '../src/hydrate.js';
import '../src/merch-icon.js';

describe('normalizeImageUrl', () => {
    it('exports the expected AEM authoring host suffixes', () => {
        expect(AEM_ORIGIN_HOST_SUFFIXES).to.deep.equal([
            '.aem.live',
            '.aem.page',
        ]);
    });

    it('rewrites an absolute aem.live URL to origin-relative on www.adobe.com', () => {
        expect(
            normalizeImageUrl(
                'https://main--mas--adobecom.aem.live/a/b.svg?w=1#f',
                'www.adobe.com',
            ),
        ).to.equal('/a/b.svg?w=1#f');
    });

    it('rewrites an absolute aem.page URL to origin-relative on stage.adobe.com', () => {
        expect(
            normalizeImageUrl(
                'https://main--mas--adobecom.aem.page/a/b.svg',
                'stage.adobe.com',
            ),
        ).to.equal('/a/b.svg');
    });

    it('rewrites a protocol-relative aem.live URL on www.adobe.com', () => {
        expect(
            normalizeImageUrl(
                '//main--mas--adobecom.aem.live/a/b.svg',
                'www.adobe.com',
            ),
        ).to.equal('/a/b.svg');
    });

    it('leaves aem.live URLs unchanged when the page hostname is not an Adobe origin', () => {
        const input = 'https://main--mas--adobecom.aem.live/a/b.svg';
        expect(normalizeImageUrl(input, 'localhost')).to.equal(input);
        expect(
            normalizeImageUrl(input, 'main--mas--adobecom.aem.live'),
        ).to.equal(input);
    });

    it('leaves non-AEM absolute hosts unchanged on an Adobe origin', () => {
        const damUrl = 'https://dam.adobe.com/prod/photoshop.svg?token=abc';
        const wwwUrl = 'https://www.adobe.com/x.svg';
        const thirdParty = 'https://third-party.example/x.png';
        expect(normalizeImageUrl(damUrl, 'www.adobe.com')).to.equal(damUrl);
        expect(normalizeImageUrl(wwwUrl, 'www.adobe.com')).to.equal(wwwUrl);
        expect(normalizeImageUrl(thirdParty, 'www.adobe.com')).to.equal(
            thirdParty,
        );
    });

    it('leaves already-relative paths and empty/undefined values unchanged', () => {
        expect(
            normalizeImageUrl('/test/mocks/img/photoshop.svg', 'www.adobe.com'),
        ).to.equal('/test/mocks/img/photoshop.svg');
        expect(normalizeImageUrl('', 'www.adobe.com')).to.equal('');
        expect(normalizeImageUrl(undefined, 'www.adobe.com')).to.equal(
            undefined,
        );
    });

    it('never throws on malformed input and returns it unchanged', () => {
        expect(normalizeImageUrl('http://[', 'www.adobe.com')).to.equal(
            'http://[',
        );
    });

    describe('with the test origin registered as an Adobe host', () => {
        beforeEach(() => ADOBE_ORIGIN_HOSTS.add('localhost'));
        afterEach(() => ADOBE_ORIGIN_HOSTS.delete('localhost'));

        it('uses window.location.hostname as the default hostname argument', () => {
            expect(
                normalizeImageUrl(
                    'https://main--mas--adobecom.aem.live/a/b.svg',
                ),
            ).to.equal('/a/b.svg');
        });
    });
});

describe('processMnemonics image normalization', () => {
    function mockMerchCard() {
        const merchCard = document.createElement('div');
        merchCard.loading = 'lazy';
        merchCard.attachShadow({ mode: 'open' });
        document.body.appendChild(merchCard);
        return merchCard;
    }

    beforeEach(() => ADOBE_ORIGIN_HOSTS.add('localhost'));
    afterEach(() => ADOBE_ORIGIN_HOSTS.delete('localhost'));

    it('rewrites an aem.live mnemonic icon src while leaving href normalization untouched', () => {
        const fields = {
            mnemonicIcon: ['https://main--mas--adobecom.aem.live/icons/cc.svg'],
            mnemonicAlt: [],
            mnemonicLink: ['www.adobe.com'],
        };
        const merchCard = mockMerchCard();
        processMnemonics(fields, merchCard, { size: 'm' });
        const icon = merchCard.querySelector('merch-icon');
        expect(icon.getAttribute('src')).to.equal('/icons/cc.svg');
        expect(icon.getAttribute('href')).to.equal('https://www.adobe.com/');
        merchCard.remove();
    });

    it('leaves the authored mnemonic icon src unchanged when the host is not registered', () => {
        ADOBE_ORIGIN_HOSTS.delete('localhost');
        const fields = {
            mnemonicIcon: ['https://main--mas--adobecom.aem.live/icons/cc.svg'],
            mnemonicAlt: [],
            mnemonicLink: [],
        };
        const merchCard = mockMerchCard();
        processMnemonics(fields, merchCard, { size: 'm' });
        const icon = merchCard.querySelector('merch-icon');
        expect(icon.getAttribute('src')).to.equal(
            'https://main--mas--adobecom.aem.live/icons/cc.svg',
        );
        merchCard.remove();
    });
});

describe('processBackgroundImage image normalization', () => {
    function mockMerchCard() {
        const merchCard = document.createElement('div');
        merchCard.loading = 'lazy';
        merchCard.attachShadow({ mode: 'open' });
        document.body.appendChild(merchCard);
        return merchCard;
    }

    beforeEach(() => ADOBE_ORIGIN_HOSTS.add('localhost'));
    afterEach(() => ADOBE_ORIGIN_HOSTS.delete('localhost'));

    it('rewrites the appended <img> src for aem.page background images', () => {
        const fields = {
            backgroundImage: 'https://main--mas--adobecom.aem.page/bg.jpg',
            backgroundImageAltText: 'Test Image',
        };
        const merchCard = mockMerchCard();
        processBackgroundImage(fields, merchCard, {
            tag: 'div',
            slot: 'image',
        });
        const img = merchCard.querySelector('div[slot="image"] img');
        expect(img.getAttribute('src')).to.equal('/bg.jpg');
        expect(img.getAttribute('alt')).to.equal('Test Image');
        expect(img.getAttribute('loading')).to.equal('lazy');
        merchCard.remove();
    });

    it('rewrites the variant-declared background-image attribute', () => {
        const fields = {
            backgroundImage: 'https://main--mas--adobecom.aem.live/bg.jpg',
        };
        const merchCard = mockMerchCard();
        processBackgroundImage(fields, merchCard, {
            attribute: 'background-image',
        });
        expect(merchCard.getAttribute('background-image')).to.equal('/bg.jpg');
        merchCard.remove();
    });
});

describe('merch-icon src normalization', () => {
    beforeEach(() => ADOBE_ORIGIN_HOSTS.add('localhost'));
    afterEach(() => ADOBE_ORIGIN_HOSTS.delete('localhost'));

    it('renders a CDN-relative shadow <img> while keeping the authored host src attribute', async () => {
        const icon = document.createElement('merch-icon');
        icon.setAttribute('src', 'https://main--mas--adobecom.aem.live/i.svg');
        icon.setAttribute('alt', 'x');
        icon.setAttribute('loading', 'lazy');
        document.body.appendChild(icon);
        await icon.updateComplete;

        expect(
            icon.shadowRoot.querySelector('img').getAttribute('src'),
        ).to.equal('/i.svg');
        expect(icon.getAttribute('src')).to.equal(
            'https://main--mas--adobecom.aem.live/i.svg',
        );
        icon.remove();
    });
});
