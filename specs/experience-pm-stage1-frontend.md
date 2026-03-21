# Plan: Stage 1 SDLC Pipeline — Frontend (agent-frontend)

## Task Description

Implement the **client-side UI** for the Stage 1 SDLC intake pipeline in `experience-pm`, using the `agent-frontend` agent. This covers all new pages, components, routes, API client methods, and Spectrum S2 design decisions required to deliver the intake → enrich → structure → review flow described in `specs/stage1-sdlc-pipeline.md`.

The server-side backend (actions, services) is **out of scope** for this plan — it is assumed to be built separately. This plan focuses exclusively on what the `agent-frontend` agent needs to produce.

---

## Objective

When complete, the experience-pm client will have:

- A **Requirements list page** (`/requirements`) showing all intakes with status badges, input-type chips, and a "New Intake" CTA
- A **New Intake form** (`/requirements/new`) with input-type selector cards, a large textarea, optional title, and submit
- A **Pipeline detail page** (`/requirements/:id`) with a 4-stage stepper, progressive section reveal (raw input → enrichment → proposal → review actions), and 3s polling
- **5 new API client methods** wired to the intake endpoints
- **4 reusable components**: `StagesStepper`, `EnrichmentContext`, `ProposalView`, `ReviewActions`
- All built with **intentional Spectrum S2** usage following the `frontend-design` skill

---

## Problem Statement

The experience-pm app has a working Spectrum S2 shell with navigation and placeholder pages but no intake pipeline UI. The `PlansPage.tsx` is an empty placeholder. Engineers and PMs need a visual interface to submit raw input, watch the enrichment/structuring pipeline progress, review structured proposals, and approve/reject JIRA tree creation.

---

## Solution Approach

### Design Direction: **Information-dense & structured**

This is a productivity/tool UI for engineers and PMs. The design direction is:
- **Density**: `regular` (already set at Provider level)
- **Typography**: `Heading size="M"` for page titles, `Heading size="S"` for section headers, `Detail` for metadata labels, `Body size="S"` for secondary text
- **Color**: Semantic tokens only — `informative` for active/in-progress, `positive` for approved/complete, `negative` for failed/rejected, `notice` for review-needed
- **Layout**: `Flex` and `View` with token-based padding/gaps, no raw divs with inline styles
- **Components**: S2 `Button`, `Badge`, `TextArea`, `TextField`, `RadioGroup`/cards, `ProgressCircle`, `Divider`, `IllustratedMessage` (empty state), `ToastQueue`

### Architecture Decisions

1. **No new global state** — `useState` + polling per the content-qa pattern (no Redux)
2. **Polling interval**: 3s via `setTimeout` chain (same pattern as `RunDetailPage.tsx` with 4s)
3. **Lazy-loaded pages** — new routes added to `PageRoutes` via `React.lazy()`
4. **Component colocation** — intake components live in `components/Intake/` directory
5. **TypeScript interfaces** — intake types defined in `lib/api.ts` alongside existing types

---

## Relevant Files

### Existing Files (modify)

- `client/src/App.tsx` — Add 3 new lazy imports and routes (`/requirements`, `/requirements/new`, `/requirements/:id`)
- `client/src/lib/api.ts` — Add intake interfaces and 5 API methods
- `client/src/pages/PlansPage.tsx` — Replace empty placeholder with Requirements list page
- `client/src/components/Sidebar.tsx` — Add "Requirements" nav item if not already present (verify first)

### New Files (create)

- `client/src/pages/IntakePage.tsx` — New Intake form (`/requirements/new`)
- `client/src/pages/IntakeDetailPage.tsx` — Pipeline view (`/requirements/:id`)
- `client/src/components/Intake/StagesStepper.tsx` — 4-step horizontal stepper
- `client/src/components/Intake/EnrichmentContext.tsx` — Collapsible 4-section enrichment display
- `client/src/components/Intake/ProposalView.tsx` — Full proposal rendering with JIRA tree
- `client/src/components/Intake/ReviewActions.tsx` — Approve/reject with inline feedback textarea
- `client/src/components/Intake/types.ts` — Shared intake type definitions (re-exported from api.ts)

---

## Implementation Phases

### Phase 1: Data Layer
Add TypeScript interfaces and API client methods. This unblocks all UI work.

### Phase 2: Core Components
Build the 4 reusable Intake components (StagesStepper, EnrichmentContext, ProposalView, ReviewActions) in isolation.

### Phase 3: Pages & Routing
Build the 3 pages, wire routes into App.tsx, connect polling logic.

### Phase 4: Polish & Integration
Empty states, error handling, toast notifications, nav updates.

---

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Read the frontend-design skill
- Read `.claude/skills/frontend-design/SKILL.md` to internalize design philosophy
- Design direction: **Information-dense & structured** — productivity tool for PMs/engineers

### 2. Add TypeScript interfaces to `client/src/lib/api.ts`
- Add `IntakeStatus` type: `'intake' | 'enriching' | 'structuring' | 'review' | 'approved' | 'rejected' | 'failed'`
- Add `EnrichmentContext` interface matching the data model from the spec:
  ```ts
  export interface EnrichmentContextData {
    jiraTickets: Array<{ key: string; summary: string; url: string }>;
    expLeagueDocs: Array<{ title: string; url: string }>;
    slackThreads: Array<{ channel: string; snippet: string }>;
    runbooks: Array<{ title: string; url: string }>;
  }
  ```
- Add `Proposal` interface:
  ```ts
  export interface Proposal {
    summary: string;
    requirements: Array<{ id: string; text: string }>;
    ambiguities: Array<{ id: string; text: string }>;
    acceptanceCriteria: Array<{ id: string; requirementId: string; text: string }>;
    jiraTree: {
      epic: { title: string; description: string; labels: string[] };
      stories: Array<{
        title: string;
        description: string;
        acceptanceCriteria: string[];
        tasks: Array<{ title: string; description: string }>;
      }>;
    };
  }
  ```
- Add `Intake` interface:
  ```ts
  export interface Intake {
    id: string;
    title: string;
    inputType: 'transcript' | 'ticket' | 'document' | 'notes';
    rawInput: string;
    status: IntakeStatus;
    enrichmentContext: EnrichmentContextData | null;
    proposal: Proposal | null;
    rejectionFeedback: string | null;
    jiraEpicKey: string | null;
    createdAt: string;
    updatedAt: string;
  }
  ```
- Add `IntakeSummary` interface (for list view): `{ id, title, inputType, status, createdAt }`

### 3. Add 5 API client methods to `client/src/lib/api.ts`
- Add new section `// ── Intake ──` after the Chat section
- Implement:
  ```ts
  export async function createIntake(body: { inputType: string; rawInput: string; title?: string }): Promise<{ id: string }>
  export async function listIntakes(): Promise<{ intakes: IntakeSummary[] }>
  export async function getIntake(id: string): Promise<{ intake: Intake }>
  export async function approveIntake(id: string): Promise<{ epicKey: string }>
  export async function rejectIntake(id: string, feedback: string): Promise<void>
  ```
- `createIntake` → `POST /api/intake`
- `listIntakes` → `GET /api/intake`
- `getIntake` → `GET /api/intake/${id}`
- `approveIntake` → `POST /api/intake/${id}/approve`
- `rejectIntake` → `POST /api/intake/${id}/reject` with `{ feedback }` body

### 4. Build `StagesStepper` component
- **File**: `client/src/components/Intake/StagesStepper.tsx`
- **Props**: `currentStatus: IntakeStatus`
- **Design**: Horizontal 4-step stepper with connecting lines
- **S2 components to look up**: `ProgressCircle` (for active spinner), Badge or custom step indicators
- **Steps**: Intake → Enrich → Structure → Review
- **Status mapping**:
  - `intake` → step 0 active
  - `enriching` → step 0 complete, step 1 active
  - `structuring` → steps 0-1 complete, step 2 active
  - `review | approved | rejected` → steps 0-2 complete, step 3 active/complete
  - `failed` → current step shows negative state
- **Visual**: Use `Flex` layout, `View` for step circles, `Divider` or styled lines between steps
- **Active step**: `ProgressCircle isIndeterminate size="S"` (S2)
- **Complete step**: Checkmark icon in accent color
- **Failed step**: Alert icon in negative color
- **Pending step**: Gray circle
- Use `Detail` component for step labels below each circle

### 5. Build `EnrichmentContext` component
- **File**: `client/src/components/Intake/EnrichmentContext.tsx`
- **Props**: `data: EnrichmentContextData`
- **Design**: 4 collapsible sub-sections using S2 `Disclosure` or custom collapsible pattern
- **S2 components to look up**: `Disclosure`, `DisclosurePanel`, `DisclosureTitle` (or use Accordion if available)
- **Sub-sections**: JIRA Tickets, Experience League Docs, Slack Threads, Runbooks
- Each sub-section:
  - Header with count badge: e.g., "JIRA Tickets (3)" using `Heading size="S"` + `Badge`
  - List of items as links (use `<a>` or S2 `Link` if available)
  - Empty state: `Body size="S"` with "None found" in muted color
- Use `View` with `padding` and `borderRadius` tokens for section containers
- Use `Divider` between sub-sections

### 6. Build `ProposalView` component
- **File**: `client/src/components/Intake/ProposalView.tsx`
- **Props**: `proposal: Proposal`
- **Design**: Structured display of the full proposal with clear visual hierarchy
- **Sections**:
  1. **Summary** — `Body size="M"` paragraph
  2. **Requirements** — Numbered list with `Detail` labels for IDs (R-01, R-02…)
  3. **Ambiguities** — Use S2 `InlineAlert` (or `StatusLight` with notice color) for callout box, numbered Q-01…
  4. **Acceptance Criteria** — Grouped by requirement ID using `Detail` headers
  5. **JIRA Tree** — Hierarchical card layout:
     - Epic: `View` with `backgroundColor="informative-100"`, `Heading size="S"`, `Body` for description
     - Stories: Indented `View` cards with `borderStartWidth="thick"` accent border
     - Tasks: Bullet list within each story
- Use `Flex direction="column" gap="size-300"` for section spacing
- Use `Heading size="S"` for section titles
- Use `Divider` between major sections

### 7. Build `ReviewActions` component
- **File**: `client/src/components/Intake/ReviewActions.tsx`
- **Props**: `intakeId: string; onApprove: (epicKey: string) => void; onReject: () => void`
- **Design**: Action bar with approve/reject buttons
- **S2 components**: `Button` (variant="accent" for Approve, variant="secondary" for Reject), `TextArea` for feedback, `ButtonGroup`
- **Behavior**:
  - `Approve` button (accent/CTA) → calls `approveIntake(id)` → fires `onApprove` callback
  - `Reject & Refine` button (secondary) → toggles inline `TextArea` for feedback
  - When feedback textarea visible: `Submit Feedback` button → calls `rejectIntake(id, feedback)` → fires `onReject`
  - Loading state on both buttons during API calls (use `isPending` prop if available, else disable + ProgressCircle)
- Use `Flex` for button layout with `gap="size-150"`

### 8. Build `IntakePage` (New Intake form)
- **File**: `client/src/pages/IntakePage.tsx`
- **Route**: `/requirements/new`
- **Design**:
  - Page title: `Heading size="L"` — "New Intake"
  - **Input Type selector**: 4 clickable cards in a `Flex wrap gap="size-200"` layout
    - Each card: `View` with border, icon, label, and description
    - Types: Transcript (chat icon), JIRA Ticket (ticket icon), Document (file icon), Notes (edit icon)
    - Selected card: accent border + subtle accent background
    - Look up S2 `RadioGroup` — if it supports custom card rendering, use it. Otherwise, build with `View` + `useState`
  - **Title field**: `TextField` (optional, auto-filled from first line of input on blur)
  - **Input textarea**: `TextArea` with `placeholder="Paste your input here…"`, minimum height ~300px
  - **Submit**: `Button variant="accent"` — "Start Pipeline"
    - Disabled until inputType selected AND rawInput non-empty
    - On submit: `createIntake({ inputType, rawInput, title })` → `navigate(\`/requirements/${id}\`)`
- Use `Flex direction="column" gap="size-300"` for form layout
- Max width ~720px centered

### 9. Build `IntakeDetailPage` (Pipeline view)
- **File**: `client/src/pages/IntakeDetailPage.tsx`
- **Route**: `/requirements/:id`
- **Design**:
  - Page header: `Heading size="L"` with intake title + `Badge` for inputType
  - `StagesStepper` component (always visible)
  - **Conditional sections** (progressive reveal based on status):
    1. **Raw Input** (visible always after intake): Collapsible `Disclosure` with monospace `<pre>` or `Code` display
    2. **Enrichment Context** (visible when `enrichmentContext` is not null): `EnrichmentContext` component
    3. **Proposal** (visible when `status === 'review' | 'approved' | 'rejected'`): `ProposalView` component
    4. **Review Actions** (visible only when `status === 'review'`): `ReviewActions` component
  - **Approved banner** (visible when `status === 'approved'`): `InlineAlert` variant="positive" with JIRA epic key and external link
  - **Failed banner** (visible when `status === 'failed'`): `InlineAlert` variant="negative" with error message
- **Polling**:
  - `useEffect` with `setTimeout` chain (same pattern as `RunDetailPage.tsx`)
  - Poll `getIntake(id)` every 3s while `status` is `'enriching'` or `'structuring'`
  - Stop polling when status reaches `'review'`, `'approved'`, `'rejected'`, or `'failed'`
  - Cleanup timeout on unmount
- **Approve flow**: On approve success → show success toast + update local state
- **Reject flow**: On reject success → show info toast, polling resumes (status goes back to `structuring`)
- Use toast from existing `components/Toast.tsx`

### 10. Update `PlansPage.tsx` → Requirements List
- **File**: `client/src/pages/PlansPage.tsx`
- Replace empty placeholder with full intake list page
- **Design**:
  - Page header: `Heading size="L"` — "Requirements"
  - `Button variant="accent"` — "New Intake" → links to `/requirements/new` (top-right, prominent)
  - **Intake list**: Use `Flex direction="column" gap="size-100"` with `View` cards for each intake
    - Each card shows: title, inputType chip (`Badge variant="informative"`), status badge (color-coded), created date (`Detail`)
    - Click → `navigate(\`/requirements/${intake.id}\`)`
  - **Status badge colors**:
    - `enriching | structuring` → `Badge variant="informative"` (blue)
    - `review` → `Badge variant="notice"` (yellow)
    - `approved` → `Badge variant="positive"` (green)
    - `failed | rejected` → `Badge variant="negative"` (red)
    - `intake` → `Badge variant="neutral"` (gray)
  - **Empty state**: `IllustratedMessage` — "No intakes yet — start by creating one" with CTA button
  - **Loading state**: `ProgressCircle isIndeterminate` centered
- Fetch `listIntakes()` on mount with `useEffect`

### 11. Add routes to `App.tsx`
- Add lazy imports at top:
  ```tsx
  const IntakePage = React.lazy(() => import('./pages/IntakePage'));
  const IntakeDetailPage = React.lazy(() => import('./pages/IntakeDetailPage'));
  ```
- Add routes to `PageRoutes` function (PlansPage already exists as a lazy import — rename if needed, or keep as-is since we're repurposing it):
  ```tsx
  <Route path="/requirements" element={<ErrorBoundary><PlansPage /></ErrorBoundary>} />
  <Route path="/requirements/new" element={<ErrorBoundary><IntakePage /></ErrorBoundary>} />
  <Route path="/requirements/:id" element={<ErrorBoundary><IntakeDetailPage /></ErrorBoundary>} />
  ```
- Note: Check if `PlansPage` is already lazy-imported. If not, add it. If the sidebar already has a "Requirements" nav link pointing to `/requirements`, routes may already partially exist — verify before adding duplicates.

### 12. Update navigation (if needed)
- Check `Sidebar.tsx` and all layout nav configs in `App.tsx`
- Ensure a "Requirements" nav item exists pointing to `/requirements`
- If the sidebar only has Chat/History/Settings, add Requirements with an appropriate icon (look up S2 icons: `ViewList`, `TaskList`, or `Clipboard`)
- Add to icon-rail, top-tabs, three-panel, and dashboard layouts if they enumerate nav items

### 13. Validate the work
- Verify all new files compile: check for TypeScript errors
- Verify routing works: `/requirements`, `/requirements/new`, `/requirements/:id`
- Verify S2 compliance: no raw `<div>`, `<button>`, `<input>` where S2 equivalents exist; no hardcoded hex colors; no inline `style={{ padding }}` where tokens should be used
- Verify imports: all from `@react-spectrum/s2`, no mixed Spectrum 1 imports

---

## S2 Component Lookup Checklist

Before writing code, the `agent-frontend` agent MUST look up these components via MCP:

| Component | Why |
|-----------|-----|
| `Button` | Approve/reject/submit actions — need variant props |
| `Badge` | Status badges, inputType chips |
| `TextArea` | Raw input textarea, rejection feedback |
| `TextField` | Optional title field |
| `ProgressCircle` | Active stepper step spinner, loading states |
| `Heading` | Page titles, section headers |
| `Body` | Body text |
| `Detail` | Metadata labels, step labels |
| `View` | Layout zones with token props |
| `Flex` | All structural layout |
| `Divider` | Section separators |
| `IllustratedMessage` | Empty state |
| `InlineAlert` | Ambiguities callout, approved/failed banners |
| `Disclosure` | Collapsible sections (raw input, enrichment) |
| `Link` | External links in enrichment context |
| `ButtonGroup` | Approve/reject button pair |
| `RadioGroup` | Input type selector (if supports custom rendering) |
| `Content` | Card body content |

Also look up available **icons** from `@react-spectrum/s2/icons/` for:
- Input types: Chat/Comment, Ticket, File/Document, Edit/Pen
- Stepper: Checkmark, Alert/Warning
- Navigation: a list/requirements icon

---

## Testing Strategy

Since there is no test framework currently set up in the client, validation is manual:

1. **Compile check**: Ensure `npm run build` succeeds with no TypeScript errors
2. **Visual check**: Navigate to each new route and verify S2 components render correctly
3. **API wiring**: Verify API methods are correctly structured (endpoint paths, HTTP methods, body shape)
4. **Polling**: Verify the polling `useEffect` starts/stops correctly based on status
5. **Empty states**: Verify `IllustratedMessage` renders when no intakes exist
6. **Error handling**: Verify error states show toasts and don't crash the UI

---

## Acceptance Criteria

- [ ] `/requirements` renders a list of intakes with status badges and "New Intake" CTA
- [ ] `/requirements` shows `IllustratedMessage` empty state when no intakes exist
- [ ] `/requirements/new` renders input-type selector (4 cards), title field, textarea, and submit button
- [ ] Submit on `/requirements/new` calls `createIntake()` and navigates to `/requirements/:id`
- [ ] `/requirements/:id` renders `StagesStepper` showing current pipeline stage
- [ ] `/requirements/:id` polls every 3s while status is `enriching` or `structuring`
- [ ] `/requirements/:id` progressively reveals sections as pipeline advances
- [ ] `EnrichmentContext` renders 4 collapsible sub-sections with links or "None found"
- [ ] `ProposalView` renders summary, requirements, ambiguities, acceptance criteria, and JIRA tree
- [ ] `ReviewActions` shows Approve (accent) and Reject (secondary) buttons only during `review` status
- [ ] Approve shows success toast with JIRA epic key
- [ ] Reject opens feedback textarea and re-triggers structuring
- [ ] Approved state shows green banner with JIRA link
- [ ] Failed state shows negative banner with error
- [ ] All UI uses Spectrum S2 components — no raw HTML, no hardcoded colors, no pixel padding
- [ ] 5 API methods added to `api.ts` with correct TypeScript signatures
- [ ] 3 new routes registered in `App.tsx`
- [ ] Application compiles without TypeScript errors

---

## Validation Commands

Execute these commands to validate the task is complete:

- `cd apps/experience-pm/client && npx tsc --noEmit` — Verify TypeScript compiles
- `cd apps/experience-pm && npm run build` — Full production build (if available)
- `grep -r "from '@adobe/react-spectrum'" client/src/` — Verify no Spectrum 1 imports (should return empty)
- `grep -r "style={{" client/src/pages/IntakePage.tsx client/src/pages/IntakeDetailPage.tsx client/src/components/Intake/` — Audit for inline styles (minimize, prefer S2 tokens)

---

## Notes

- The `agent-frontend` agent must read `.claude/skills/frontend-design/SKILL.md` before writing any component
- The `agent-frontend` agent must use MCP tools (`mcp__react-spectrum-s2__get_component`) to verify every S2 component's exact props and import path before using it
- The existing `PlansPage.tsx` is an empty placeholder — it can be safely overwritten
- The existing app uses `style()` macro from `@react-spectrum/s2/style` for some layout — new components should use S2 layout components (`Flex`, `View`) where possible, falling back to `style()` macro for custom layout needs
- Toast notifications use the existing `components/Toast.tsx` — check its API before using
- The polling pattern in `RunDetailPage.tsx` (setTimeout chain, cleanup on unmount) is the established pattern — replicate it exactly
- No server-side changes are in scope for this plan — the backend endpoints are assumed to exist
