---
name: frontend-design
description: Produce intentional, characterful Adobe Spectrum S2 UIs — not generic default-everything Spectrum. Activates on frontend design work using React Spectrum or Adobe design system components.
---

# frontend-design

Design philosophy and practical guidance for building bold, distinctive UIs with Adobe Spectrum 2 (S2).

This skill provides two distinct workflows. **Answer this question first:** Is there an existing codebase with S2 components, pages, or a design system?

---

## Existing App (most common)

**Use this workflow:** [EXISTING-APP-CHECKLIST.md](EXISTING-APP-CHECKLIST.md)

**Purpose:** Enforce design consistency by analyzing existing S2 patterns before implementation.

**When to use:**
- Adding components to an existing S2 project
- Creating new pages in an existing app
- Modifying UI in an established codebase
- Working within an existing design system

**Process:** Mandatory 3-phase checklist (Analyze → Decide → Implement)

---

## New App (greenfield)

**Use this workflow:** [NEW-APP-DESIGN.md](NEW-APP-DESIGN.md)

**Purpose:** Choose a bold design stance and configure S2 from scratch.

**When to use:**
- Starting a new application
- Building standalone pages with no existing patterns to match
- Full creative freedom within Spectrum's vocabulary

**Process:** Context → Design stance → Provider config → Component selection → Implement

---

## Quick Reference

| Need | Go to |
|------|-------|
| Consistency in existing app | [EXISTING-APP-CHECKLIST.md](EXISTING-APP-CHECKLIST.md) |
| Design stance for new app | [NEW-APP-DESIGN.md](NEW-APP-DESIGN.md) |
| Before/after examples | [EXAMPLES.md](EXAMPLES.md) |
| Token system, density, components | [REFERENCE.md](REFERENCE.md) |

---

## Core Principle

Spectrum gives you a vocabulary, but using every component at its default size/variant/color reads as **undesigned**. Make explicit choices.

## Integration Points

- **Before writing**: Look up S2 components via MCP tools (`react-spectrum-s2` skill) or `adobe-spectrum` agent
- **After implementing**: Run `/spectrum-check` to catch raw HTML/CSS that should be Spectrum
- **New applications**: Use `/scaffold` to set up Provider, theme, and boilerplate

## References

- **`react-spectrum-s2` skill**: Look up S2 component docs, props, examples, and categories
- **`react-aria` skill**: Headless accessibility primitives for custom components
- **`adobe-spectrum` agent**: Verify import paths and required props
- **`/spectrum-check` command**: Audit for Spectrum adoption opportunities
