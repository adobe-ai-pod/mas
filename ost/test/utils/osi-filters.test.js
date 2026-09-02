import { expect } from '@open-wc/testing';
import { filtersFromOsiAttributes } from '../../src/utils/osi-filters.js';

function makeAttrs(overrides = {}) {
    return {
        product_arrangement_code: 'phsp',
        customer_segment: 'INDIVIDUAL',
        market_segments: ['COM'],
        market_segment: undefined,
        offer_type: 'BASE',
        commitment: 'YEAR',
        term: 'MONTHLY',
        ...overrides,
    };
}

describe('filtersFromOsiAttributes', () => {
    it('maps CC Pro individual ABM attributes to the correct aosParams', () => {
        const result = filtersFromOsiAttributes(makeAttrs());
        expect(result.arrangementCode).to.equal('phsp');
        expect(result.commitment).to.equal('YEAR');
        expect(result.term).to.equal('MONTHLY');
        expect(result.customerSegment).to.equal('INDIVIDUAL');
        expect(result.marketSegment).to.equal('COM');
        expect(result.offerType).to.equal('BASE');
    });

    it('maps TEAM customer segment', () => {
        const result = filtersFromOsiAttributes(makeAttrs({ customer_segment: 'TEAM' }));
        expect(result.customerSegment).to.equal('TEAM');
    });

    it('maps EDU market segment', () => {
        const result = filtersFromOsiAttributes(makeAttrs({ market_segments: ['EDU'] }));
        expect(result.marketSegment).to.equal('EDU');
    });

    it('maps GOV market segment', () => {
        const result = filtersFromOsiAttributes(makeAttrs({ market_segments: ['GOV'] }));
        expect(result.marketSegment).to.equal('GOV');
    });

    it('maps PUF plan type (YEAR-ANNUAL)', () => {
        const result = filtersFromOsiAttributes(makeAttrs({ commitment: 'YEAR', term: 'ANNUAL' }));
        expect(result.commitment).to.equal('YEAR');
        expect(result.term).to.equal('ANNUAL');
    });

    it('maps M2M plan type (MONTH-MONTHLY)', () => {
        const result = filtersFromOsiAttributes(makeAttrs({ commitment: 'MONTH', term: 'MONTHLY' }));
        expect(result.commitment).to.equal('MONTH');
        expect(result.term).to.equal('MONTHLY');
    });

    it('maps TRIAL offer type', () => {
        const result = filtersFromOsiAttributes(makeAttrs({ offer_type: 'TRIAL' }));
        expect(result.offerType).to.equal('TRIAL');
    });

    it('maps PROMOTION offer type', () => {
        const result = filtersFromOsiAttributes(makeAttrs({ offer_type: 'PROMOTION' }));
        expect(result.offerType).to.equal('PROMOTION');
    });

    it('falls back to empty string for unknown customer segment', () => {
        const result = filtersFromOsiAttributes(makeAttrs({ customer_segment: 'ENTERPRISE' }));
        expect(result.customerSegment).to.equal('');
    });

    it('falls back to empty string for unknown market segment', () => {
        const result = filtersFromOsiAttributes(makeAttrs({ market_segments: ['UNKNOWN'] }));
        expect(result.marketSegment).to.equal('');
    });

    it('falls back to empty strings for unknown plan type combination', () => {
        const result = filtersFromOsiAttributes(makeAttrs({ commitment: 'BIENNIAL', term: 'ANNUAL' }));
        expect(result.commitment).to.equal('');
        expect(result.term).to.equal('');
    });

    it('falls back to empty string for unknown offer type', () => {
        const result = filtersFromOsiAttributes(makeAttrs({ offer_type: 'UNKNOWN_TYPE' }));
        expect(result.offerType).to.equal('');
    });

    it('falls back to empty strings when market_segments is an empty array', () => {
        const result = filtersFromOsiAttributes(makeAttrs({ market_segments: [] }));
        expect(result.marketSegment).to.equal('');
    });

    it('falls back to market_segment scalar when market_segments is absent', () => {
        const result = filtersFromOsiAttributes(makeAttrs({ market_segments: undefined, market_segment: 'COM' }));
        expect(result.marketSegment).to.equal('COM');
    });

    it('returns all-empty object for null input', () => {
        const result = filtersFromOsiAttributes(null);
        expect(result.arrangementCode).to.equal('');
        expect(result.commitment).to.equal('');
        expect(result.term).to.equal('');
        expect(result.customerSegment).to.equal('');
        expect(result.marketSegment).to.equal('');
        expect(result.offerType).to.equal('');
    });

    it('returns all-empty object for undefined input', () => {
        const result = filtersFromOsiAttributes(undefined);
        expect(result.arrangementCode).to.equal('');
        expect(result.commitment).to.equal('');
        expect(result.term).to.equal('');
        expect(result.customerSegment).to.equal('');
        expect(result.marketSegment).to.equal('');
        expect(result.offerType).to.equal('');
    });

    it('does not mutate the input attributes object', () => {
        const attrs = makeAttrs();
        const original = JSON.stringify(attrs);
        filtersFromOsiAttributes(attrs);
        expect(JSON.stringify(attrs)).to.equal(original);
    });

    it('uses arrangement_code as fallback when product_arrangement_code is absent', () => {
        const attrs = makeAttrs({ product_arrangement_code: undefined, arrangement_code: 'ilst' });
        const result = filtersFromOsiAttributes(attrs);
        expect(result.arrangementCode).to.equal('ilst');
    });
});
