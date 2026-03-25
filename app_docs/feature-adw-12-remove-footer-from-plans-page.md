# Remove Footer from Plans Page

**ADW ID:** adw-5d0e6cf3
**Date:** 2026-03-25
**Specification:** specs/issue-7a36499d-adw-5d0e6cf3-sdlc_planner-remove-footer-from-plans-page.md

## Overview

Removes the `<footer>` element from the `plans` variant merch card render layout. The footer contained the secure transaction label and the CTA slot (`slot name="footer"`). The footer markup is fully deleted from the rendered DOM output — no CSS hiding is used.

## What Was Built

- Removed `${this.secureLabelFooter}` template expression from `Plans.renderLayout()` so no `<footer>` element is emitted
- Removed three CSS rule blocks from `Plans.variantStyle` that exclusively targeted the now-absent footer
- Removed two global CSS rules from `plans.css.js` that targeted `[slot="footer"]` within plans variants
- Added optional chaining guard (`footer?.prepend(...)`) in `adjustSlotPlacement()` for null-safety now that `footer` is absent from the shadow DOM

## Technical Implementation

### Files Modified

- `web-components/src/variants/plans.js`: Removed `${this.secureLabelFooter}` from `renderLayout()`; removed `:host([variant^='plans']) footer`, `footer ::slotted([slot='addon'])`, and `.wide-footer #stock-checkbox` CSS rules from `variantStyle`; added `?.` guard on `footer.prepend()` call
- `web-components/src/variants/plans.css.js`: Removed `merch-card[variant^="plans"] [slot="footer"] a` and `merch-card[variant^="plans"] [slot="footer"] .con-button > span` global CSS rules

### Key Changes

- `Plans.renderLayout()` no longer emits a `<footer>` element — the DOM change is structural, not visual
- `adjustSlotPlacement()` line ~122 changed from `footer.prepend(...)` to `footer?.prepend(...)` to avoid a null-pointer error when footer is absent
- Three inline `variantStyle` blocks removed: footer padding rule, `::slotted([slot='addon'])` margin reset, and `.wide-footer #stock-checkbox` margin-top override
- Two global rules in `plans.css.js` removed: CTA anchor `line-height`/`padding` fix and `.con-button > span` `min-width` reset
- `plans-v2.js` and `variant-layout.js` are unchanged

## How to Use

The plans variant merch card no longer renders a footer. CTAs and the secure transaction label that were slotted into `footer` are no longer displayed. This is an intentional removal — no action is required by consumers of the component.

## Configuration

No configuration changes. The `plans`, `plans-education`, and `plans-students` variants are all affected (they share the same `Plans` class). `plans-v2` is unaffected.

## Testing

```sh
node --check web-components/src/variants/plans.js
node --check web-components/src/variants/plans.css.js
```

Verify visually that no `<footer>` element appears in the shadow DOM of any `merch-card[variant^="plans"]` component.

## Notes

- The `secureLabelFooter` getter and base class implementation in `variant-layout.js` are untouched — only the call site in `Plans.renderLayout()` was removed.
- Dead CSS rules targeting the removed footer have been cleaned up to avoid confusion and reduce bundle size.
- Scope is strictly `plans` variants; `plans-v2` and all other variants are unaffected.
