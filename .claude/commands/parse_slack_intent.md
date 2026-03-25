---
description: Parse a Slack message into a GitHub issue title and body for ADW
argument-hint: "<slack message text>"
---

# Parse Slack Intent

Analyze this Slack message and determine if it's requesting a code change.

## Message

$1

## Instructions

If this is a request for a code change, new feature, bug fix, or technical task:
- Generate a concise GitHub issue title (starts with `feat:`, `fix:`, or `chore:`)
- Generate a detailed GitHub issue body with sections: **Context**, **What to Build**, **Acceptance Criteria**
- Pick the ADW workflow — default to `adw_sdlc_iso` unless the message explicitly references a simpler task

If this is NOT a technical request (greetings, status questions, non-code discussion):
- Return `is_actionable: false`

## Output Format

Output ONLY valid JSON, nothing else:

```json
{
  "is_actionable": true,
  "title": "feat: Add dark mode to settings page",
  "body": "## Context\n...\n\n## What to Build\n...\n\n## Acceptance Criteria\n- [ ] ...",
  "workflow": "adw_sdlc_iso"
}
```
