# Remove Footer from Plans Page

**ADW ID:** adw-07232995
**Date:** 2026-03-25
**Specification:** specs/issue-cc24365d-adw-07232995-sdlc_planner-remove-footer-from-plans-page.md

## Overview

The `<footer>` element was removed from the plans variant merch card shadow DOM layout. CTAs (slot="footer" content) were preserved by moving `<slot name="footer"></slot>` into the `.body` div. Dead CSS rules targeting the now-removed `<footer>` element were also cleaned up.

## What Was Built

- Removed `${this.secureLabelFooter}` from `renderLayout()` — no more `<footer>` element in the plans card shadow DOM
- Added `<slot name="footer"></slot>` inside the `.body` div so CTA/buy button slots still render
- Removed three dead CSS rules from `variantStyle` that targeted `<footer>` and `.wide-footer`

## Technical Implementation

### Files Modified

- `web-components/src/variants/plans.js`: Removed `secureLabelFooter` from `renderLayout()`, moved `<slot name="footer">` into `.body` div, removed dead footer CSS rules from `variantStyle`

### Key Changes

- `renderLayout()` no longer renders `${this.secureLabelFooter}`, eliminating the `<footer>` element from the plans card shadow DOM
- `<slot name="footer"></slot>` added at the bottom of `.body` div (after `<slot name="badge">`) to preserve CTA rendering
- Removed CSS rules: `:host([variant^='plans']) footer { padding }`, `:host([variant^='plans']) footer ::slotted([slot='addon'])`, and `:host([variant='plans']) .wide-footer #stock-checkbox`
- The `adjustSlotPlacement` method's `shadowRoot.querySelector('footer')` safely returns `null` via existing optional chaining — no changes needed there

## How to Use

The plans merch card now renders CTAs directly inside the `.body` div with no wrapping `<footer>` element. No consumer-side changes are required — slotted content using `slot="footer"` continues to render as before.

## Configuration

No configuration changes required.

## Testing

Run syntax check: `node --check web-components/src/variants/plans.js`

Verify in browser that plans merch cards render CTAs correctly and that no `<footer>` element appears in the shadow DOM.

## Notes

- The `secureLabelFooter` getter remains in `variant-layout.js` (shared base) and is still used by other variants — do not remove it from the base class
- `[slot="footer"]` styles in `plans.css.js` remain valid and were intentionally left in place
- Other variants (product, catalog, segment, etc.) are unaffected
