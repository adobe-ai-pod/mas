# Plan: Experience-PM Spectrum S2 UX Revamp

## Task Description
Transform the experience-pm Next.js 16 App Router application from its default create-next-app boilerplate into a fully styled Adobe Spectrum S2 application. This involves removing Tailwind CSS, integrating the S2 design system (Provider, page.css, style macro), building an app shell (header, sidebar, navigation), implementing dark mode, keyboard shortcuts, responsive layouts, toast notification system, and five application pages — all adapted from proven patterns in the content-qa reference app.

## Objective
When complete, experience-pm will have:
- S2 Provider configured for Next.js App Router with router integration
- Tailwind CSS fully removed
- A responsive app shell with header, collapsible sidebar, and main content area
- Light/dark theme toggle with localStorage persistence
- Keyboard shortcuts for primary navigation
- Toast notification system
- Error boundary
- Responsive breakpoints (mobile/tablet/desktop)
- Five application pages: Dashboard, Requirements, Features, Roadmap, Settings

## Problem Statement
The experience-pm app (package name: `adobe-requirements-agent`) started as a bare Next.js 16 boilerplate with Tailwind CSS v4 and Geist fonts. It needed a complete UX foundation using Adobe Spectrum S2 to match the design language established in the content-qa reference app, while respecting Next.js App Router conventions (server vs client components, metadata API, `next/navigation`).

## Solution Approach
1. **Remove Tailwind** — Delete Tailwind dependencies, postcss config, and CSS imports
2. **Install S2 stack** — Add `@react-spectrum/s2` and configure Next.js (Turbopack default, no webpack macro plugin needed)
3. **Build foundation** — Root layout with S2 Provider, `page.css`, theme context
4. **Adapt reference patterns** — Port sidebar, header, toast, keyboard shortcuts, responsive hooks from content-qa, adapting React Router patterns to Next.js App Router (`useRouter`, `usePathname`, `next/link`)
5. **Client/server split** — Keep `layout.tsx` as server component, mark interactive shells as client components via `'use client'`
6. **Build pages** — Dashboard with stat cards, plus placeholder pages for Requirements, Features, Roadmap, Settings

## Relevant Files

### Reference Files (content-qa — read only, adapt patterns)
- `apps/content-qa/client/src/main.tsx` — S2 Provider setup, ThemeProvider wrapping
- `apps/content-qa/client/src/components/AppHeader.tsx` — Header with logo, title, theme toggle
- `apps/content-qa/client/src/components/Sidebar.tsx` — Collapsible sidebar with navigation
- `apps/content-qa/client/src/components/Toast.tsx` — Custom toast notification system
- `apps/content-qa/client/src/components/ErrorBoundary.tsx` — Error boundary component
- `apps/content-qa/client/src/lib/ThemeContext.tsx` — Dark/light theme context with localStorage
- `apps/content-qa/client/src/hooks/useKeyboardShortcuts.ts` — Keyboard shortcut hook
- `apps/content-qa/client/src/hooks/useMediaQuery.ts` — Responsive breakpoint hook
- `apps/content-qa/client/src/App.tsx` — SidebarContentLayout pattern (primary layout)

### Implemented Files (experience-pm)

#### Configuration (modified from boilerplate)
- `apps/experience-pm/package.json` — Dependencies: `@react-spectrum/s2 ^1.2.0`, `next 16.1.6`, `react 19.2.3`. Tailwind removed.
- `apps/experience-pm/next.config.ts` — Turbopack enabled (Next.js 16 default). No webpack macro plugin.
- `apps/experience-pm/tsconfig.json` — Target ES2017, bundler moduleResolution, `@/*` path alias
- `apps/experience-pm/src/app/globals.css` — Minimal resets, Spectrum font stack, `epm-toast-in` keyframe animation

#### Files removed from boilerplate
- `postcss.config.mjs` — No longer needed without Tailwind
- `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` — Boilerplate assets

#### Shell Components (created)
- `apps/experience-pm/src/components/AppShell.tsx` — Client component: ThemeProvider → Provider → AppHeader + Sidebar + ErrorBoundary + main content + ToastContainer. Handles SSR-safe hydration with placeholder for sidebar, mobile overlay sidebar with backdrop, keyboard shortcuts wired.
- `apps/experience-pm/src/components/AppHeader.tsx` — 48px fixed header. Left: SVG logo mark ("EP") + "Experience PM" title + "BETA" badge. Right: BrightnessContrast icon theme toggle with tooltip. Uses S2 CSS custom property tokens throughout.
- `apps/experience-pm/src/components/Sidebar.tsx` — Collapsible (240px → 56px). Navigation items: Dashboard (ViewGrid), Requirements (Bookmark), Features (Star), Roadmap (Calendar). Footer: Settings. Uses `usePathname()` for active state, `next/link` for navigation, `aria-current="page"` for accessibility. Collapsed mode uses ActionButton + Tooltip; expanded mode uses styled Link. Custom SVG chevron icon for toggle.
- `apps/experience-pm/src/components/Toast.tsx` — Portal-based singleton. API: `toast.success()`, `.error()`, `.info()`. Uses S2 semantic color tokens (`--spectrum-positive-*`, `--spectrum-negative-*`, `--spectrum-informative-*`) for automatic dark mode support. Auto-dismiss, click-to-dismiss, `role="alert"` + `aria-live="assertive"`.
- `apps/experience-pm/src/components/ErrorBoundary.tsx` — Class component with `getDerivedStateFromError`. Styled error card with S2 negative semantic tokens, circular error icon, "Try again" Button.

#### Lib & Hooks (created)
- `apps/experience-pm/src/lib/ThemeContext.tsx` — SSR-safe (starts `true`, hydrates from `localStorage['epm_theme']` in `useEffect`). Sets `document.documentElement.dataset.colorScheme`. Exports `ThemeProvider` and `useTheme()`.
- `apps/experience-pm/src/hooks/useKeyboardShortcuts.ts` — `⌘B` (toggle sidebar), `⌘K` (focus search), `⌘⇧N` (new item). Accepts callback object `{ onToggleSidebar, onFocusSearch, onNewItem }`.
- `apps/experience-pm/src/hooks/useMediaQuery.ts` — Returns `'desktop' | 'tablet' | 'mobile'`. Breakpoints: mobile <768px, tablet 768–1023px, desktop ≥1024px. SSR-safe (defaults to `'desktop'`).

#### Layout (modified)
- `apps/experience-pm/src/app/layout.tsx` — Server component. Imports `@react-spectrum/s2/page.css` and `globals.css`. Metadata: title "Experience PM". Wraps children in `<AppShell>`. No font imports (relies on S2 page.css Spectrum font stack).

#### Pages (created)
- `apps/experience-pm/src/app/page.tsx` — **Dashboard**. Stat cards (Requirements, Features, Roadmap Items) with S2 `Meter` + `StatusLight`. Quick Actions links with keyboard shortcut hints. "Getting Started" guidance box. All counts initialized to 0 (ready for data integration). Uses S2 CSS custom property tokens for all colors.
- `apps/experience-pm/src/app/requirements/page.tsx` — **Requirements** placeholder. S2 `Heading` + description text.
- `apps/experience-pm/src/app/features/page.tsx` — **Features** placeholder. S2 `Heading` + description text.
- `apps/experience-pm/src/app/roadmap/page.tsx` — **Roadmap** placeholder. S2 `Heading` + description text.
- `apps/experience-pm/src/app/settings/page.tsx` — **Settings** placeholder. S2 `Heading` + description text.

## Implementation Phases

### Phase 1: Foundation ✅
- Tailwind CSS and related config removed
- S2 dependencies installed (`@react-spectrum/s2 ^1.2.0`)
- Next.js configured with Turbopack (default in Next.js 16)
- Root layout set up with S2 Provider and `page.css`
- ThemeContext created with SSR-safe initialization

### Phase 2: Core Implementation ✅
- AppShell built as client component orchestrating header + sidebar + content
- AppHeader adapted from content-qa pattern with logo, title, BETA badge, theme toggle
- Sidebar built with collapsible behavior, Next.js `<Link>` navigation, `usePathname()` active state
- Keyboard shortcuts and responsive hooks implemented
- Toast system and error boundary built

### Phase 3: Pages & Integration ✅
- Dashboard page built with stat cards, meters, quick actions, getting started section
- Four placeholder pages created (Requirements, Features, Roadmap, Settings)
- All components wired together in AppShell
- Dark mode toggle works end-to-end via S2 CSS custom property tokens
- Mobile overlay sidebar with backdrop and transition animation

## Step by Step Tasks

### 1. Remove Tailwind CSS ✅
- Deleted `apps/experience-pm/postcss.config.mjs`
- Removed `tailwindcss`, `@tailwindcss/postcss` from devDependencies
- Stripped `globals.css` of all Tailwind imports/directives
- Removed boilerplate SVGs from `public/`

### 2. Install S2 Dependencies ✅
- Added `@react-spectrum/s2 ^1.2.0` to dependencies
- React 19.2.3 confirmed compatible
- Note: `unplugin-parcel-macros` was **not** installed — the app uses S2 CSS custom property tokens (`var(--spectrum-*)`) and inline styles instead of the `style()` macro

### 3. Configure Next.js ✅
- `next.config.ts` configured with Turbopack (Next.js 16 default)
- No webpack macro plugin needed since `style()` macro is not used
- S2 components import directly from `@react-spectrum/s2`

### 4. Create Theme Context ✅
- Adapted from content-qa `ThemeContext.tsx`
- localStorage key: `epm_theme` (prefix `epm_` to avoid collisions)
- SSR-safe: initializes with `true` (light), reads localStorage in `useEffect`
- Sets `document.documentElement.dataset.colorScheme` on toggle

### 5. Create Responsive Hook ✅
- Ported from content-qa `useMediaQuery.ts`
- Breakpoints: mobile (<768px), tablet (768–1023px), desktop (≥1024px)
- SSR-safe: defaults to `'desktop'`, hydrates via `matchMedia` listeners on mount

### 6. Create Keyboard Shortcuts Hook ✅
- Adapted from content-qa `useKeyboardShortcuts.ts`
- Renamed `onNewChat` → `onNewItem` to match PM domain
- Shortcuts: ⌘B (toggle sidebar), ⌘K (focus search), ⌘⇧N (new item)

### 7. Build AppHeader ✅
- Adapted from content-qa `AppHeader.tsx`
- Left: SVG logo ("EP" on accent-colored rounded rect) + "Experience PM" title + "BETA" badge
- Right: BrightnessContrast icon theme toggle with tooltip
- Fixed 48px height, S2 token border and background

### 8. Build Sidebar ✅
- Adapted from content-qa `Sidebar.tsx`
- Collapsible: 240px expanded → 56px collapsed with 0.2s ease transition
- Nav items: Dashboard, Requirements, Features, Roadmap (with S2 icons)
- Footer: Settings link
- Active state via `usePathname()` with `aria-current="page"`
- localStorage persistence: `epm_sidebar_collapsed`
- Collapsed mode: icon-only with ActionButton + Tooltip
- Custom inline SVG for chevron toggle icon

### 9. Build Toast System ✅
- Adapted from content-qa `Toast.tsx`
- Uses S2 semantic color tokens instead of hardcoded light/dark color maps
- Portal-based rendering via `ReactDOM.createPortal`
- Auto-dismiss with configurable timeout, click-to-dismiss
- `epm-toast-in` animation defined in `globals.css`

### 10. Build Error Boundary ✅
- Adapted from content-qa `ErrorBoundary.tsx`
- Class component with `getDerivedStateFromError`
- Styled error card: circular icon, heading, error message, "Try again" S2 `Button`
- Uses S2 negative semantic tokens for theming

### 11. Build AppShell ✅
- Client component wrapping ThemeProvider → ShellInner
- ShellInner: S2 Provider (with Next.js router adapter), AppHeader, Sidebar, ErrorBoundary, ToastContainer
- SSR hydration: sidebar renders 56px placeholder pre-hydration to prevent layout jump
- Mobile: sidebar slides in as overlay with semi-transparent backdrop
- Desktop/tablet: sidebar renders inline with collapsible width
- Keyboard shortcuts wired to sidebar toggle and search focus

### 12. Update Root Layout ✅
- Server component importing `@react-spectrum/s2/page.css` and `globals.css`
- Metadata: `title: "Experience PM"`, `description: "Adobe Experience product management platform"`
- Geist fonts removed
- Children wrapped in `<AppShell>`

### 13. Update globals.css ✅
- All Tailwind directives removed
- Contains: box-sizing reset, html/body reset, Spectrum font stack, `epm-toast-in` keyframe animation

### 14. Build Dashboard Page ✅
- Three stat cards: Requirements, Features, Roadmap Items (counts at 0, ready for data)
- Each card: uppercase label, StatusLight, large count numeral (tabular-nums), S2 Meter, description
- Quick Actions: "New Requirement" (⌘⇧N), "View Roadmap", "Browse Features" — styled as pill links
- "Getting Started" guidance box with dashed border
- All styling via S2 CSS custom property tokens (`--spectrum-*`)

### 15. Build Placeholder Pages ✅
- Requirements, Features, Roadmap, Settings — consistent S2 Heading + description pattern
- Each page uses `maxWidth: 960, margin: '0 auto'` container

## Acceptance Criteria
- [x] Tailwind CSS fully removed (no `tailwindcss` in package.json, no `postcss.config.mjs`, no Tailwind classes)
- [x] `@react-spectrum/s2` installed and `page.css` imported in root layout
- [x] S2 Provider wraps the application with dynamic `colorScheme` prop
- [x] AppHeader renders with "EP" logo, "Experience PM" title, "BETA" badge, and theme toggle
- [x] Sidebar is collapsible (240px → 56px) and persists state to localStorage (`epm_sidebar_collapsed`)
- [x] Dark/light theme toggle works and persists to localStorage (`epm_theme`)
- [x] Keyboard shortcuts (⌘B, ⌘K, ⌘⇧N) are functional
- [x] Responsive layout adjusts at mobile/tablet/desktop breakpoints
- [x] Mobile sidebar renders as overlay with backdrop
- [x] Toast API (`toast.success/error/info`) available and theme-aware
- [x] ErrorBoundary wraps content area with styled recovery UI
- [x] Dashboard page renders stat cards, quick actions, and getting started section
- [x] Requirements, Features, Roadmap, Settings pages exist with correct routing
- [x] Sidebar navigation highlights active page via `usePathname()`
- [x] All interactive components use `'use client'` directive
- [x] SSR-safe hydration (sidebar placeholder, theme default, breakpoint default)

## Validation Commands
- `cd apps/experience-pm && npm install` — Install dependencies
- `cd apps/experience-pm && npx next build` — Verify production build succeeds
- `cd apps/experience-pm && npm run dev` — Start dev server for visual verification
- `cd apps/experience-pm && npx tsc --noEmit` — TypeScript type checking

## Architecture Decisions

### S2 CSS Tokens vs style() Macro
The implementation uses S2 CSS custom property tokens (`var(--spectrum-*)`) and inline styles rather than the `style()` compile-time macro from `@react-spectrum/s2/style`. This avoids the need for `unplugin-parcel-macros` and its webpack/Turbopack integration complexity. The tradeoff: slightly more verbose inline styles, but simpler build configuration and full compatibility with Next.js 16 Turbopack.

### Next.js Router Adapter
S2 Provider expects `{ navigate, useHref }` for router integration. The adapter maps to Next.js:
```tsx
router={{
  navigate: (path: string) => router.push(path),
  useHref: (path: string) => path,
}}
```

### SSR Hydration Strategy
Three state values require SSR-safe initialization to avoid hydration mismatch:
1. **Theme** (`lightMode`) — defaults to `true`, reads `epm_theme` from localStorage in `useEffect`
2. **Sidebar collapsed** — defaults to `true`, reads `epm_sidebar_collapsed` in `useEffect`, renders 56px placeholder pre-hydration
3. **Breakpoint** — defaults to `'desktop'`, hydrates via `matchMedia` listeners in `useEffect`

### localStorage Key Prefix
All keys use `epm_` prefix to avoid collisions with content-qa (`xqa_`) or other apps:
- `epm_theme` — `'light'` | `'dark'`
- `epm_sidebar_collapsed` — `'true'` | `'false'`

## Notes
- **Style macro not used**: Unlike content-qa which uses `unplugin-parcel-macros` + `style()` macro, this app uses S2 CSS custom property tokens directly. If the macro becomes needed for future components, install `unplugin-parcel-macros` and configure via Next.js webpack (Turbopack may need additional setup).
- **Placeholder pages ready for implementation**: Requirements, Features, Roadmap, and Settings pages are stubs. Each follows the same container pattern (`maxWidth: 960, margin: '0 auto'`) and can be built out independently.
- **Dashboard data integration**: Stat card counts are hardcoded at 0. Wire to a data source by replacing the `STATS` constant with fetched data or React state.
- **`/requirements/new` route**: Quick Actions links to `/requirements/new` which doesn't exist yet — needs a create requirement page/modal.
