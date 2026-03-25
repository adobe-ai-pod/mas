# Plans Page Header Height Increase

**ADW ID:** 5015a2b4
**Date:** 2026-03-25
**Specification:** specs/issue-1aa6893e-adw-5015a2b4-sdlc_planner-plans-page-header-height.md

## Overview

Increased the height of the plans page collection header (`merch-card-collection-header.plans`) from the default 44px to 66px. This was achieved by overriding two CSS custom properties in the plans variant stylesheet, which propagate automatically to the filter button, sort button, and search input within the header.

## What Was Built

- Height override for the plans page collection header filter element (66px)
- Height override for the plans page collection header search input min-height (66px)

## Technical Implementation

### Files Modified

- `web-components/src/variants/plans.css.js`: Added two CSS custom property overrides inside the `merch-card-collection-header.plans` selector block

### Key Changes

- Added `--merch-card-collection-header-filter-height: 66px` to set the filter and sort button heights (~50% increase from the 44px default)
- Added `--merch-card-collection-header-search-min-height: 66px` to set the search input minimum height
- These variables propagate to `#filter`, `#sort` (which inherits filter height), and `#search sp-search` via the base component CSS in `merch-card-collection.js`
- No desktop media query override was needed — the height applies globally at all breakpoints as intended
- No layout changes to the card grid, sidenav, or content sections below the header

## How to Use

The height change is applied automatically on all plans pages that use `merch-card-collection-header` with the `.plans` variant class. No configuration or feature flags are required.

## Configuration

No configuration required. The height is hardcoded to 66px via CSS custom properties in `web-components/src/variants/plans.css.js`.

## Testing

- Run `node --check web-components/src/variants/plans.css.js` to validate JS syntax
- Load a plans page in the browser and visually confirm the collection header is taller (~66px) compared to other page variants
- Verify the filter button, sort button, and search input are all taller
- Confirm no layout regression in the card grid or sidenav below the header

## Notes

- The default header height for other variants remains 44px — only plans pages are affected
- If a different height is needed in the future, update `--merch-card-collection-header-filter-height` and `--merch-card-collection-header-search-min-height` in the `merch-card-collection-header.plans` block
- A separate desktop media query override can be added to the existing `merch-card-collection-header.plans` block at ~line 427 if distinct desktop/mobile heights are required
