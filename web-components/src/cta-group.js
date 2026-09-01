export const CTA_GROUP_CLASS = 'cta-group';
export const CTA_PRIMARY_TOKENS = ['accent', 'primary'];

const MODIFIER_PATTERN = /-(outline|link)$/;

export function resolveCTAGroupStyles(ctaStyles, { groupCTAs } = {}) {
    if (!groupCTAs) return ctaStyles;
    if (!ctaStyles.length) return ctaStyles;

    const primaryIndex = ctaStyles.findIndex((token) => {
        const base = token ? token.replace(MODIFIER_PATTERN, '') : '';
        return CTA_PRIMARY_TOKENS.includes(base);
    });
    const resolvedPrimary = primaryIndex === -1 ? 0 : primaryIndex;

    return ctaStyles.map((token, i) => {
        if (i === resolvedPrimary) return token;
        const modifier = token ? (MODIFIER_PATTERN.exec(token)?.[0] ?? '') : '';
        return `secondary${modifier}`;
    });
}

export function getCTAGroupClass(groupCTAs) {
    return groupCTAs ? CTA_GROUP_CLASS : undefined;
}
