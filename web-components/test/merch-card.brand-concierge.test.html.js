// @ts-nocheck
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

    describe('merch-card web component for brand-concierge', () => {
        it('should be registered and exist', async () => {
            const card = document.querySelector(
                'merch-card[variant="brand-concierge"]',
            );
            expect(card).to.exist;
        });

        it('should cap width at 378px inside a wide container', async () => {
            const card = document.getElementById('brand-concierge-wide');
            expect(card).to.exist;
            const width = parseFloat(getComputedStyle(card).width);
            expect(width).to.equal(378);
        });

        it('should track container width inside a narrow container', async () => {
            const card = document.getElementById('brand-concierge-narrow');
            expect(card).to.exist;
            const wrapper = document.getElementById('narrow-wrapper');
            const cardWidth = parseFloat(getComputedStyle(card).width);
            const wrapperWidth = parseFloat(getComputedStyle(wrapper).width);
            expect(cardWidth).to.equal(wrapperWidth);
        });

        it('should have --consonant-merch-card-brand-concierge-width set to 378px', async () => {
            const card = document.getElementById('brand-concierge-wide');
            const value = getComputedStyle(card)
                .getPropertyValue(
                    '--consonant-merch-card-brand-concierge-width',
                )
                .trim();
            expect(value).to.equal('378px');
        });
    });
});
