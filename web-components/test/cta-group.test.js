import { expect } from '@esm-bundle/chai';
import {
    resolveCTAGroupStyles,
    getCTAGroupClass,
    CTA_GROUP_CLASS,
    CTA_PRIMARY_TOKENS,
} from '../src/cta-group.js';

describe('resolveCTAGroupStyles', () => {
    it('returns input unchanged when flag is off (no options)', () => {
        const input = ['accent', 'primary', 'secondary-outline'];
        expect(resolveCTAGroupStyles(input)).to.deep.equal(input);
    });

    it('returns input unchanged when groupCTAs is false', () => {
        const input = ['accent', 'primary', 'secondary-outline'];
        expect(
            resolveCTAGroupStyles(input, { groupCTAs: false }),
        ).to.deep.equal(input);
    });

    it('first accent wins; later primary is demoted', () => {
        expect(
            resolveCTAGroupStyles(['secondary', 'accent', 'primary'], {
                groupCTAs: true,
            }),
        ).to.deep.equal(['secondary', 'accent', 'secondary']);
    });

    it('positional fallback: index 0 kept as authored, index 1 stays secondary-link', () => {
        const result = resolveCTAGroupStyles(['secondary', 'secondary-link'], {
            groupCTAs: true,
        });
        expect(result[0]).to.equal('secondary');
        expect(result[1]).to.equal('secondary-link');
        expect(result).to.have.length(2);
    });

    it('preserves modifiers when demoting: accent-outline -> secondary-outline', () => {
        expect(
            resolveCTAGroupStyles(
                ['primary', 'accent-outline', 'secondary-link'],
                { groupCTAs: true },
            ),
        ).to.deep.equal(['primary', 'secondary-outline', 'secondary-link']);
    });

    it('single CTA: returns length 1 with unchanged token', () => {
        const result = resolveCTAGroupStyles(['secondary'], {
            groupCTAs: true,
        });
        expect(result).to.have.length(1);
        expect(result[0]).to.equal('secondary');
    });

    it('five CTAs all accent: exactly one primary-base, four secondary, length 5', () => {
        const result = resolveCTAGroupStyles(
            ['accent', 'accent', 'accent', 'accent', 'accent'],
            { groupCTAs: true },
        );
        expect(result).to.have.length(5);
        const primaries = result.filter((t) =>
            CTA_PRIMARY_TOKENS.includes(t.replace(/-(outline|link)$/, '')),
        );
        expect(primaries).to.have.length(1);
        const secondaries = result.filter(
            (t) => t.replace(/-(outline|link)$/, '') === 'secondary',
        );
        expect(secondaries).to.have.length(4);
    });

    it('empty array: returns empty array without throwing', () => {
        expect(resolveCTAGroupStyles([], { groupCTAs: true })).to.deep.equal(
            [],
        );
    });

    it('output length equals input length for 2-CTA case', () => {
        const input = ['accent', 'primary'];
        expect(
            resolveCTAGroupStyles(input, { groupCTAs: true }),
        ).to.have.length(2);
    });
});

describe('getCTAGroupClass', () => {
    it('returns CTA_GROUP_CLASS when enabled', () => {
        expect(getCTAGroupClass(true)).to.equal(CTA_GROUP_CLASS);
        expect(getCTAGroupClass(true)).to.equal('cta-group');
    });

    it('returns undefined when disabled', () => {
        expect(getCTAGroupClass(false)).to.be.undefined;
        expect(getCTAGroupClass(undefined)).to.be.undefined;
    });

    it('CTA_GROUP_CLASS equals "cta-group"', () => {
        expect(CTA_GROUP_CLASS).to.equal('cta-group');
    });
});
