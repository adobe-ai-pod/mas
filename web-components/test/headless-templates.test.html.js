import { runTests } from '@web/test-runner-mocha';
import { expect } from '@esm-bundle/chai';

import { mockLana } from './mocks/lana.js';
import { mockFetch } from './mocks/fetch.js';

import './spectrum.js';

import { mockIms } from './mocks/ims.js';
import { withWcs } from './mocks/wcs.js';
import '../src/mas.js';

runTests(async () => {
    mockIms();
    mockLana();
    await mockFetch(withWcs);

    describe('headless-marquee card', () => {
        let card;

        before(() => {
            card = document.getElementById('card-headless-marquee');
        });

        it('renders with variant headless-marquee', () => {
            expect(card).to.exist;
            expect(card.getAttribute('variant')).to.equal('headless-marquee');
        });

        it('has all required slots populated', () => {
            expect(card.querySelector('[slot="heading-xs"]')).to.exist;
            expect(card.querySelector('[slot="body-xs"]')).to.exist;
            expect(card.querySelector('[slot="short-description"]')).to.exist;
            expect(card.querySelector('[slot="prices"]')).to.exist;
            expect(card.querySelector('[slot="footer"]')).to.exist;
        });
    });

    describe('headless-faq card', () => {
        let card;

        before(() => {
            card = document.getElementById('card-headless-faq');
        });

        it('renders with variant headless-faq', () => {
            expect(card).to.exist;
            expect(card.getAttribute('variant')).to.equal('headless-faq');
        });

        it('has prices and answer slots populated', () => {
            expect(card.querySelector('[slot="prices"]')).to.exist;
            expect(card.querySelector('[slot="body-xs"]')).to.exist;
            expect(card.querySelector('[slot="short-description"]')).to.exist;
            expect(card.querySelector('[slot="callout-content"]')).to.exist;
        });
    });

    describe('headless-promo-bar card', () => {
        let card;

        before(() => {
            card = document.getElementById('card-headless-promo-bar');
        });

        it('renders with variant headless-promo-bar', () => {
            expect(card).to.exist;
            expect(card.getAttribute('variant')).to.equal('headless-promo-bar');
        });

        it('has description and footer slots populated', () => {
            expect(card.querySelector('[slot="body-xs"]')).to.exist;
            expect(card.querySelector('[slot="footer"]')).to.exist;
        });
    });
});
