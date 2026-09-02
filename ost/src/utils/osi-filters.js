// Valid picker option values from ost-filter-bar.js (excluding 'ALL' sentinels).
// Only emit a value when it matches an option; otherwise the picker stays at "All".
const VALID_CUSTOMER_SEGMENTS = new Set(['INDIVIDUAL', 'TEAM']);
const VALID_MARKET_SEGMENTS = new Set(['COM', 'EDU', 'GOV']);
const VALID_OFFER_TYPES = new Set(['BASE', 'TRIAL', 'PROMOTION']);
// Plan keys are the commitment-term composites declared in PLAN_TYPES.
const VALID_PLAN_KEYS = new Set(['YEAR-MONTHLY', 'YEAR-ANNUAL', 'MONTH-MONTHLY', 'TERM_LICENSE-P3Y', 'PERPETUAL']);

const EMPTY = Object.freeze({
    arrangementCode: '',
    commitment: '',
    term: '',
    customerSegment: '',
    marketSegment: '',
    offerType: '',
});

function filtersFromOsiAttributes(attributes) {
    if (!attributes) return { ...EMPTY };

    const arrangementCode = attributes.product_arrangement_code || attributes.arrangement_code || '';

    const customerSegment = VALID_CUSTOMER_SEGMENTS.has(attributes.customer_segment) ? attributes.customer_segment : '';

    const rawMarket = Array.isArray(attributes.market_segments) ? attributes.market_segments[0] : attributes.market_segment;
    const marketSegment = VALID_MARKET_SEGMENTS.has(rawMarket) ? rawMarket : '';

    const offerType = VALID_OFFER_TYPES.has(attributes.offer_type) ? attributes.offer_type : '';

    const rawCommitment = attributes.commitment || '';
    const rawTerm = attributes.term || '';
    const planKey = [rawCommitment, rawTerm].filter(Boolean).join('-');
    let commitment = '';
    let term = '';
    if (planKey && VALID_PLAN_KEYS.has(planKey)) {
        commitment = rawCommitment;
        term = rawTerm;
    }

    return { arrangementCode, commitment, term, customerSegment, marketSegment, offerType };
}

export { filtersFromOsiAttributes };
