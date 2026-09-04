/**
 * Shared rule for "is this aria-label authored" across the merch-card CTA
 * pipeline (RTE serialization, mas-field render, checkout-link render):
 * blank/whitespace-only is treated as not authored.
 */
export function hasAuthoredAriaLabel(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Writes a derived aria-label onto el, unless el already carries an authored
 * (non-blank) aria-label, in which case the authored value is left untouched.
 */
export function applyDerivedAriaLabel(el, derivedLabel) {
    if (hasAuthoredAriaLabel(el.getAttribute('aria-label'))) return;
    if (hasAuthoredAriaLabel(derivedLabel)) {
        el.setAttribute('aria-label', derivedLabel);
    } else {
        el.removeAttribute('aria-label');
    }
}
