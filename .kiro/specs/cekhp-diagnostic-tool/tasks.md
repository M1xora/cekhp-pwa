# Implementation Plan: CekHP Diagnostic Tool

## Overview

Implementation follows a bottom-up, domain-first approach: shared infrastructure (types, mock data, engine, store) is built first, then routing scaffolding, then individual page components, then the PWA layer, and finally verification passes. Every step produces working, integrated code — no orphaned modules.

The chosen implementation language is **TypeScript** with React 18 (as specified in the design).

---

## Tasks

- [x] 1. Project scaffolding and toolchain setup
  - Initialise a Vite 5 project with the React + TypeScript template and enable `"strict": true` in `tsconfig.json`
  - Install and configure Tailwind CSS (PostCSS + `tailwind.config.ts`), including custom Claymorphism design tokens (border-radius scale, box-shadow tokens, colour palette)
  - Install all required runtime dependencies with pinned versions: `react-router-dom@6`, `zustand`, `@supabase/supabase-js`, `react-helmet-async`, `vite-plugin-pwa`
  - Install all required dev/test dependencies: `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check`, `jsdom`
  - Configure `vitest.config.ts` (jsdom environment, setup files, coverage thresholds)
  - Configure `vite.config.ts` with manual chunk splitting (vendor chunk separate from app chunk, cache headers)
  - _Requirements: 13.3, 13.5, 13.6_

- [x] 2. TypeScript types and interfaces
  - [x] 2.1 Create `src/types/knowledge-base.ts` with `Symptom`, `Condition`, `Rule`, and `DiagnosisResult` interfaces exactly as specified in the design data models
    - `Symptom`: `id`, `name`, `description`, `category`
    - `Condition`: `id`, `name`, `description`, `recommendedAction`
    - `Rule`: `id`, `symptomIds` (non-empty string array), `conditionId`
    - `DiagnosisResult`: `conditionId`, `conditionName`, `confidenceScore` (number 0–1), `inferenceLog` (string array containing the step-by-step rule evaluation trace)
    - _Requirements: 7.1, 7.2_

- [x] 3. Mock Knowledge Base
  - [x] 3.1 Create `src/data/mockData.ts` exporting `mockConditions`, `mockSymptoms`, and `mockRules` typed arrays
    - Include exactly 5 `Condition` objects: Battery Degradation, GPU Failure, RAM Overflow, Camera Module Failure, Charging Port Damage
    - Include exactly 20 `Symptom` objects spanning Battery (≥2), Screen (≥2), Performance (≥2), Camera, Connectivity, and Audio categories
    - Include exactly 10 `Rule` objects with ≥2 rules each for Battery, Screen, and Performance categories
    - Ensure every `Rule.conditionId` references a valid `Condition.id` and every `Rule.symptomIds` entry references a valid `Symptom.id`
    - _Requirements: 7.3, 7.4_

- [x] 4. Forward Chaining Inference Engine
  - [x] 4.1 Create `src/lib/engine.ts` exporting the pure function `runInference(activeFacts: string[], rules: Rule[]): DiagnosisResult[]`
    - Return `[]` immediately if `activeFacts` is empty or `rules` is empty
    - De-duplicate `activeFacts` before matching to prevent inflated scores
    - Skip any rule whose `symptomIds` array is empty (avoid division by zero)
    - For each rule compute `confidenceScore = matchedCount / rule.symptomIds.length`
    - For each rule build an `inferenceLog` entry string: `"Checked <rule.id>: matched <M>/<N> symptoms → score <score>"` followed by one line per symptom ID indicating `✓ matched` or `✗ missing`
    - Exclude results with `confidenceScore === 0` from the return array (return only scores > 0); each included result carries its `inferenceLog`
    - Sort output descending by `confidenceScore`; break ties ascending by `rule.id`
    - No imports from React, Zustand, or Supabase — pure domain logic only
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [x] 4.2 Write property tests for the Inference Engine (`src/lib/__tests__/engine.property.test.ts`)
    - **Property 7: Confidence score formula** — for any Rule with N symptoms and M matched in activeFacts, confidenceScore = M/N
    - **Property 8: Empty input returns empty array** — `runInference([], rules)` and `runInference(facts, [])` both return `[]`
    - **Property 9: Output sorting** — result array is sorted desc by confidenceScore; ties broken asc by rule.id
    - **Property 10: Determinism** — identical inputs always produce structurally identical outputs
    - Each property runs `numRuns: 100`; tag format: `// Feature: cekhp-diagnostic-tool, Property N: <text>`
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.7; Design Properties 7, 8, 9, 10_

  - [x] 4.3 Write unit tests for the Inference Engine (`src/lib/__tests__/engine.unit.test.ts`)
    - Test: empty activeFacts → `[]`
    - Test: empty rules → `[]`
    - Test: all symptoms matched → confidenceScore 1.0
    - Test: no symptoms matched → result excluded from array
    - Test: partial match → correct fractional score
    - Test: duplicate activeFacts do not inflate score
    - Test: rule with empty symptomIds is skipped
    - _Requirements: 6.3, 6.4, 6.6, 6.7_

- [x] 5. Zustand global state store
  - [x] 5.1 Create `src/store/useDiagnosaStore.ts` implementing the `DiagnosaState` interface with Zustand
    - State fields with initial values: `selectedDeviceCategory: ""`, `selectedSymptomCategory: ""`, `activeFacts: []`, `diagnosisResults: []`
    - Actions: `setDeviceCategory`, `setSymptomCategory`, `toggleFact`, `setResults`, `resetStore`
    - `toggleFact("")` (empty string) is a no-op — leave all state unchanged
    - `toggleFact(id)` adds `id` if absent, removes if present
    - `resetStore` sets all four fields back to their initial values
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 5.2 Write property tests for the Zustand store (`src/store/__tests__/store.property.test.ts`)
    - **Property 1: Setter round-trip** — `setDeviceCategory(x)` → `selectedDeviceCategory === x`; same for `setSymptomCategory`
    - **Property 4: toggleFact add/remove round-trip** — toggling twice restores original state; toggling N distinct IDs results in all present
    - **Property 5: toggleFact empty string no-op** — `toggleFact("")` leaves activeFacts unchanged for any initial state
    - **Property 6: resetStore restores initial state** — for any arbitrary store state, `resetStore()` yields all four initial values
    - Each property runs `numRuns: 100`
    - _Requirements: 2.4, 3.2, 4.2, 4.3, 8.3, 8.4, 8.5, 8.6; Design Properties 1, 4, 5, 6_

  - [x] 5.3 Write unit tests for the Zustand store (`src/store/__tests__/store.unit.test.ts`)
    - Test: initial state values
    - Test: `setDeviceCategory` updates field
    - Test: `toggleFact` add path
    - Test: `toggleFact` remove path
    - Test: `toggleFact("")` is no-op
    - Test: `resetStore` clears all fields
    - _Requirements: 8.1–8.6_

- [x] 6. Supabase client and database schema
  - [x] 6.1 Create `src/lib/supabaseClient.ts` exporting a singleton Supabase client initialised from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
    - Add `.env.example` documenting the two required variables
    - _Requirements: 9.1, 9.2_

  - [x] 6.2 Create `supabase/migrations/001_initial_schema.sql` with the full database schema
    - Tables: `symptoms`, `conditions`, `rules` with columns and types as defined in the design
    - Enable Row-Level Security on all three tables
    - Add RLS policy: anonymous role has `SELECT` access; authenticated role has `INSERT`, `UPDATE`, `DELETE` access
    - _Requirements: 10.3, 10.4, 10.5, 10.6, 9.1_

- [x] 7. Application shell, routing, and ProtectedRoute
  - [x] 7.1 Create `src/App.tsx` with `AppProviders` wrapping (`HelmetProvider`, `BrowserRouter`), a global `Suspense` fallback spinner, and all route declarations using `React.lazy` + `Suspense` for every page
    - Routes: `/` → `LandingPage`, `/diagnosa` → `DiagnosaPage`, `/login` → `LoginPage`, `/admin` → `ProtectedRoute` > `AdminLayout` with nested admin sub-routes
    - _Requirements: 13.6_

  - [x] 7.2 Create `src/components/ProtectedRoute.tsx` subscribing to `supabase.auth.onAuthStateChange`
    - Unauthenticated access to `/admin/**` → redirect to `/login`
    - Authenticated access to `/login` → redirect to `/admin`
    - While session state is loading, render a loading spinner (do not flash the protected content)
    - _Requirements: 9.1, 9.3, 9.4, 9.8_

- [x] 8. Landing Page
  - [x] 8.1 Create `src/pages/LandingPage.tsx` as the top-level page, importing and composing all Landing sections
    - Set `<title>` and `<meta name="description">` (50–160 chars) via `react-helmet-async`
    - Wrap with `ErrorBoundary` (consistent with the design's per-route error boundary strategy)
    - _Requirements: 1.4_

  - [x] 8.2 Create `src/components/landing/Navbar.tsx` with the site logo/name and a CTA link to `/diagnosa`
    - Persistent across scroll; keyboard-navigable
    - _Requirements: 1.3, 12.3, 12.5_

  - [x] 8.3 Create `src/components/landing/HeroSection.tsx` with a primary CTA button that navigates to `/diagnosa` using `react-router-dom`'s `useNavigate`
    - _Requirements: 1.1, 1.2_

  - [x] 8.4 Create `src/components/landing/FeaturesSection.tsx` rendering feature cards with Claymorphism styling (`border-radius ≥ 12px`, non-zero `box-shadow`, solid background)
    - _Requirements: 1.1, 1.5_

  - [x] 8.5 Create `src/components/landing/HowItWorksSection.tsx` illustrating the 4-step Wizard flow
    - _Requirements: 1.1_

  - [x] 8.6 Create `src/components/landing/TestimonialsSection.tsx` with testimonial cards (Claymorphism style)
    - _Requirements: 1.1, 1.5_

  - [x] 8.7 Create `src/components/landing/Footer.tsx`
    - _Requirements: 1.3_

- [x] 9. Shared UI primitives
  - [x] 9.1 Create `src/components/ui/ClayCard.tsx` implementing the `ClayCardProps` interface
    - Props: `children`, `className?`, `selected?` (adds highlighted border + scale transform), `onClick?`
    - Apply `border-radius ≥ 12px` and at least one non-zero `box-shadow` from Tailwind design tokens
    - _Requirements: 1.5, 2.2, 5.8_

  - [x] 9.2 Create `src/components/ui/WizardProgress.tsx` implementing the `WizardProgressProps` interface
    - Renders a step indicator showing current step out of 4 total steps at all times
    - _Requirements: 2.7_

  - [x] 9.3 Create `src/components/ui/ErrorBoundary.tsx` wrapping routes
    - Fallback renders a "Something went wrong" message with a "Reload" button
    - _Requirements: 5.5_

- [x] 10. Diagnostic Wizard — Step 1 (Device Category Selection)
  - [x] 10.1 Create `src/pages/diagnosa/DiagnosaPage.tsx` as the Wizard container
    - On mount, call `resetStore()` to clear `selectedDeviceCategory`
    - Manage `currentStep` state (1–4) locally; render `WizardProgress` and the active step component
    - Wrap with `ErrorBoundary`
    - _Requirements: 2.1, 2.3_

  - [x] 10.2 Create `src/pages/diagnosa/Step1DeviceCategory.tsx`
    - Render exactly 5 `ClayCard` options: Samsung, iPhone, Xiaomi, OPPO, General Android
    - On card click, call `setDeviceCategory(id)` in the Zustand store
    - Selected card shows highlighted border + check icon
    - "Next" button is disabled while `selectedDeviceCategory` is empty; enabled once a selection is made
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6_

  - [x] 10.3 Write property test for Step 1 button disabled state (`src/store/__tests__/store.property.test.ts`)
    - **Property 2 (partial): Button disabled when selectedDeviceCategory is empty string**
    - Verify that for any store state where `selectedDeviceCategory === ""`, the Next button must be in a disabled state
    - _Requirements: 2.6; Design Property 2_

- [x] 11. Diagnostic Wizard — Step 2 (Symptom Category Selection)
  - [x] 11.1 Create `src/pages/diagnosa/Step2SymptomCategory.tsx`
    - Render selectable cards for: Battery, Screen, Performance, Camera, Connectivity, Audio
    - On card click, call `setSymptomCategory(id)`
    - Selected card shows visual indicator (highlighted border and/or check icon)
    - "Next" button disabled while `selectedSymptomCategory` is empty; once enabled by a selection it remains enabled even if the user deselects the category
    - "Back" button: verify `selectedDeviceCategory` non-empty → navigate to Step 1 retaining value; otherwise stay on Step 2
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 11.2 Write property test for Step 2 button disabled state (`src/store/__tests__/store.property.test.ts`)
    - **Property 2 (partial): Button disabled when selectedSymptomCategory is empty string**
    - _Requirements: 3.4; Design Property 2_

- [x] 12. Diagnostic Wizard — Step 3 (Specific Symptom Multi-Selection)
  - [x] 12.1 Create `src/pages/diagnosa/Step3SpecificSymptoms.tsx`
    - Filter `mockSymptoms` by `symptom.category === selectedSymptomCategory` from the store
    - Render filtered symptoms as selectable cards/chips with visually distinct selected state
    - Call `toggleFact(symptom.id)` on toggle; reflect selection from `activeFacts` in the store
    - "Diagnose" button disabled while `activeFacts.length === 0`; enabled within 100 ms of first toggle
    - If no symptoms match the selected category, display "no symptoms available" message and keep button disabled
    - "Back" button: verify `selectedSymptomCategory` non-empty → navigate to Step 2 retaining `activeFacts`; otherwise stay
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 12.2 Write property test for Step 3 symptom filtering (`src/pages/diagnosa/__tests__/step3.property.test.ts`)
    - **Property 3: Symptom list filtered by selected category** — for any `selectedSymptomCategory` and any symptoms array, only symptoms with matching `category` are rendered; no symptom from another category appears
    - `numRuns: 100`
    - _Requirements: 4.1; Design Property 3_

  - [x] 12.3 Write property test for Step 3 Diagnose button disabled state (`src/pages/diagnosa/__tests__/step3.property.test.ts`)
    - **Property 2 (partial): Diagnose button disabled when activeFacts is empty**
    - _Requirements: 4.5; Design Property 2_

- [x] 13. Diagnostic Wizard — Step 4 (Results View)
  - [x] 13.1 Create `src/pages/diagnosa/Step4Results.tsx`
    - On render: call `runInference(activeFacts, mockRules)` and pass results to `setResults` in the store
    - Render each `DiagnosisResult` in a `ClayCard` (`border-radius ≥ 12px`, non-zero `box-shadow`) showing: condition name, description, confidence score as percentage, and recommended action
    - Each result card SHALL include a "Detail Teknis & Log Inferensi" collapsible accordion section; when expanded, it renders every entry in `DiagnosisResult.inferenceLog` as a readable line (one `<p>` or `<li>` per log entry); no log entry may be omitted
    - Sort results descending by `confidenceScore`; break ties ascending by rule id (handled by engine)
    - If all confidenceScores are 0 / results array is empty: show fallback "no diagnosis found" message
    - "Diagnose Again" button: call `resetStore()` and navigate to Step 1 on success; on failure show error toast and stay
    - Set `<title>` to a non-empty string containing the name of the top-confidence condition via `react-helmet-async`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 13.2 Write property tests for Step 4 results rendering (`src/pages/diagnosa/__tests__/step4.property.test.ts`)
    - **Property 11: Results card fields + inferenceLog accordion** — for any non-empty DiagnosisResult array, each rendered card displays all four fields (name, description, confidence as percentage, recommendedAction) AND the "Detail Teknis & Log Inferensi" accordion renders every entry in `inferenceLog` without omission
    - **Property 12: Results page title includes top condition name** — for any non-empty sorted DiagnosisResult array, the `<title>` contains the conditionName of the first result
    - `numRuns: 100`
    - _Requirements: 5.4, 5.7; Design Properties 11, 12_

  - [x] 13.3 Write unit tests for Step 4 (`src/pages/diagnosa/__tests__/step4.unit.test.tsx`)
    - Test: empty results array → fallback message rendered
    - Test: "Diagnose Again" button calls `resetStore` and navigates to Step 1
    - Test: results sorted descending by confidence score in rendered order
    - _Requirements: 5.3, 5.5, 5.6_

- [x] 14. Checkpoint — Core domain and Wizard complete
  - Ensure all tests pass (`vitest --run`); resolve any TypeScript strict-mode errors (`tsc --noEmit`). Ask the user if questions arise.

- [x] 15. Login Page
  - [x] 15.1 Create `src/pages/LoginPage.tsx` composing `LoginForm`
    - Set page `<title>` via `react-helmet-async`
    - Wrap with `ErrorBoundary`
    - _Requirements: 9.6_

  - [x] 15.2 Create `src/components/auth/LoginForm.tsx`
    - Controlled form with email and password fields
    - Client-side validation: display inline error on any empty field before calling Supabase
    - On valid submit: call `supabase.auth.signInWithPassword`; on success redirect to `/admin`; on error display toast notification and stay on `/login`
    - _Requirements: 9.2, 9.6, 9.7_

- [x] 16. Admin Panel layout
  - [x] 16.1 Create `src/pages/admin/AdminLayout.tsx` with `<Outlet />` and `Sidebar`
    - Wrap the layout with `ProtectedRoute` in the route tree (already declared in Task 7.1)
    - Wrap with `ErrorBoundary`
    - _Requirements: 10.1_

  - [x] 16.2 Create `src/components/admin/Sidebar.tsx` with navigation links to `/admin`, `/admin/symptoms`, `/admin/conditions`, `/admin/rules`
    - Include a "Logout" button that calls `supabase.auth.signOut()` and redirects to `/login`
    - _Requirements: 9.5, 10.1_

  - [x] 16.3 Create `src/components/admin/AdminDashboard.tsx` rendered at the `/admin` index route
    - Show summary counts or quick-links to the three CRUD views
    - _Requirements: 10.1_

- [x] 17. Admin — Symptoms CRUD view
  - [x] 17.1 Create `src/components/admin/DataTable.tsx` implementing `DataTableProps<T>`
    - Props: `data`, `columns` (column definitions), `pageSize` (default 10), `isLoading`
    - Paginate at `pageSize` records per page
    - _Requirements: 10.3_

  - [x] 17.2 Create `src/pages/admin/SymptomsAdmin.tsx`
    - Fetch all symptoms from Supabase on mount and display in `DataTable`
    - Include "Create Symptom" button that opens a modal/drawer form
    - Include "Edit" and "Delete" actions per row
    - On create/edit: validate all required fields non-empty and ≤ 255 chars before calling Supabase; display inline validation errors otherwise
    - On delete: show confirmation; on confirm call Supabase delete; reflect change in DataTable within 2 s
    - On any Supabase error: show toast with operation name; leave DataTable unchanged
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [x] 17.3 Write property tests for Admin form validation (`src/pages/admin/__tests__/adminForm.property.test.ts`)
    - **Property 13: Admin form validation blocks submission on invalid input** — for any form submission where at least one required field is empty or exceeds 255 chars, inline errors are shown AND no Supabase write is invoked
    - `numRuns: 100`
    - _Requirements: 9.6, 10.7; Design Property 13_

- [x] 18. Admin — Conditions CRUD view
  - [x] 18.1 Create `src/pages/admin/ConditionsAdmin.tsx` following the same pattern as `SymptomsAdmin`
    - Columns: `id`, `name`, `description`, `recommendedAction`
    - Same validation, error handling, and DataTable update behaviour
    - _Requirements: 10.2, 10.9_

- [x] 19. Admin — Rules CRUD view
  - [x] 19.1 Create `src/pages/admin/RulesAdmin.tsx`
    - Columns: `id`, `conditionId`, `symptomIds` (displayed as comma-separated list)
    - `symptomIds` field in the form accepts a comma-separated string of symptom IDs and is parsed into a `string[]` before submission
    - Same validation, error handling, and DataTable update behaviour
    - _Requirements: 10.2, 10.9_

- [x] 20. Checkpoint — Admin Panel complete
  - Ensure all tests pass (`vitest --run`) and TypeScript compiles cleanly (`tsc --noEmit`). Ask the user if questions arise.

- [x] 21. PWA setup
  - [x] 21.1 Configure `vite-plugin-pwa` in `vite.config.ts`
    - Web App Manifest: `name`, `short_name`, icons at 192×192 and 512×512, `theme_color`, `background_color`, `display: "standalone"`
    - Workbox `globPatterns` to pre-cache all static assets
    - Add `mockData.ts` output (compiled JS) to the Workbox pre-cache manifest so mock Knowledge Base is available offline
    - `runtimeCaching` strategy: CacheFirst for static assets with NetworkFallback
    - _Requirements: 11.1, 11.2_

  - [x] 21.2 Create `src/components/PwaUpdatePrompt.tsx`
    - Use `vite-plugin-pwa`'s `useRegisterSW` hook to detect new service worker availability
    - Show a persistent update banner with a "Reload" action; re-display on next visit if dismissed
    - _Requirements: 11.4_

  - [x] 21.3 Add offline fallback handling inside `DiagnosaPage.tsx`
    - Check `navigator.onLine` on mount; if offline and mock KB not in cache, display a visible "Diagnostic Wizard unavailable offline" message without any network call
    - _Requirements: 11.3_

- [x] 22. Responsive design and accessibility
  - [x] 22.1 Audit and update all page layouts for mobile-first responsive behaviour
    - No horizontal scrollbar or content overflow at any viewport 320–1920px
    - All interactive elements ≥ 44×44 CSS px touch target on viewports ≤ 768px
    - _Requirements: 12.1, 12.2_

  - [x] 22.2 Add ARIA labels and roles to all interactive components without visible descriptive text
    - Wizard step cards, icon-only buttons, form inputs, DataTable pagination controls
    - _Requirements: 12.3_

  - [x] 22.3 Apply WCAG 2.1 AA colour contrast to all text/background combinations
    - ≥ 4.5:1 for normal text; ≥ 3:1 for large text
    - _Requirements: 12.4_

  - [x] 22.4 Implement visible keyboard focus indicators on all interactive elements
    - Minimum 2px outline with ≥ 3:1 contrast ratio against adjacent background
    - _Requirements: 12.5_

- [x] 23. Performance optimisation and build validation
  - [x] 23.1 Verify and tune Vite chunk configuration in `vite.config.ts`
    - Confirm vendor chunk is output separately from app code chunk
    - Confirm cache max-age header configuration (≥ 31,536,000 s)
    - Confirm route-level `React.lazy` + `Suspense` applied for all pages (initial gzip payload ≤ 200 KB)
    - _Requirements: 13.5, 13.6_

  - [x] 23.2 Run TypeScript strict-mode compilation check and fix all errors
    - Command: `tsc --noEmit`
    - _Requirements: 13.3, 13.4_

  - [x] 23.3 Run production build and verify it completes without errors
    - Command: `vite build`
    - _Requirements: 13.4_

- [x] 24. Final checkpoint — Ensure all tests pass
  - Run `vitest --run` and confirm all unit and property tests pass. Run `tsc --noEmit` to confirm zero TypeScript errors. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; they encode correctness invariants that strengthen the thesis defence.
- Every task references specific requirement clauses for full traceability.
- All 13 design Correctness Properties are covered by PBT sub-tasks (4.2, 5.2, 10.3, 11.2, 12.2, 12.3, 13.2, 17.3).
- Property 2 is split across three PBT sub-tasks (10.3, 11.2, 12.3) to keep each test co-located with the component it validates.
- Requirement 5.2 states that 0-confidence conditions should be displayed; however the finalized design document specifies that the Inference Engine returns only results with score > 0 (Req 6.6), and the Results view shows a fallback when the array is empty. The engine implementation in Task 4.1 and the results view in Task 13.1 follow the design document as the authoritative source.
- Checkpoints (Tasks 14, 20, 24) are not included in the dependency graph.
- The `DataTable` component (Task 17.1) is shared by all three Admin CRUD views; it must be implemented before any CRUD view.
- `ErrorBoundary` wraps all major routes (Landing, Wizard, Login, Admin Layout) as specified in the design error handling strategy.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["3.1", "5.1", "6.1", "6.2"] },
    { "id": 2, "tasks": ["4.1", "5.2", "5.3"] },
    { "id": 3, "tasks": ["4.2", "4.3", "7.1", "7.2", "9.1", "9.2", "9.3"] },
    { "id": 4, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5", "8.6", "8.7", "10.1", "10.2", "15.1", "15.2"] },
    { "id": 5, "tasks": ["10.3", "11.1", "12.1", "13.1", "16.1", "16.2", "16.3"] },
    { "id": 6, "tasks": ["11.2", "12.2", "12.3", "13.2", "13.3", "17.1"] },
    { "id": 7, "tasks": ["17.2", "17.3", "18.1", "19.1"] },
    { "id": 8, "tasks": ["21.1", "21.2", "21.3", "22.1", "22.2", "22.3", "22.4"] },
    { "id": 9, "tasks": ["23.1", "23.2", "23.3"] }
  ]
}
```
