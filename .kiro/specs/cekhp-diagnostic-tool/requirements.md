# Requirements Document

## Introduction

CekHP is a production-ready Single Page Application (SPA) designed as a final year thesis project implementing an **Expert System** using the **Forward Chaining** algorithm. The application enables users to diagnose common smartphone hardware and software problems through a guided, interactive 4-step Diagnostic Wizard. The system maps user-selected symptoms (Facts) through a rule-based inference engine (Rules) to reach a diagnosis (Conclusion), clearly reflecting academic-grade data-driven inferencing.

The application consists of three main areas:
1. **Landing Page** — public-facing marketing and information page
2. **Diagnostic Wizard** — a 4-step guided symptom selection and results flow
3. **Admin Panel** — a protected dashboard for managing the Knowledge Base (symptoms, conditions, and rules)

The UI design follows a Playful Claymorphism design system with vibrant colors, large border-radius, soft drop-shadows, and bouncy/spring interactions.

---

## Glossary

- **System**: The CekHP SPA as a whole
- **Inference_Engine**: The forward chaining module (`engine.ts`) that processes Facts against Rules to derive Conclusions
- **Knowledge_Base**: The structured dataset of Symptoms, Conditions, and Rules stored in Supabase and/or `mockData.ts`
- **Fact**: A user-confirmed symptom selected during the Diagnostic Wizard
- **Rule**: An if-then mapping of one or more Symptoms to a Condition stored in the Knowledge_Base
- **Condition**: A diagnosed smartphone problem (e.g., "Battery Degradation", "GPU Failure")
- **Symptom**: A discrete, observable smartphone malfunction selectable by the user (e.g., "Battery drains fast", "Screen flickering")
- **Wizard**: The 4-step diagnostic flow accessible at `/diagnosa`
- **Admin**: An authenticated user with access to the `/admin` panel
- **Supabase**: The Backend-as-a-Service platform used for authentication and database storage
- **PWA**: Progressive Web App — installable, offline-capable web application
- **Claymorphism**: The UI design language used in the project (3D fluffy card aesthetic)
- **Zustand_Store**: The global client-side state container (`useDiagnosaStore.ts`) holding selected Facts during a session
- **Knowledge_Base_Manager**: The admin interface for CRUD operations on the Knowledge Base
- **Diagnosis_Result**: An object containing a `conditionId` (string), `conditionName` (string), and `confidenceScore` (number between 0 and 1 inclusive) returned by the Inference_Engine

---

## Requirements

### Requirement 1: Landing Page

**User Story:** As a first-time visitor, I want to see a clear and engaging landing page, so that I can understand the purpose of CekHP and start a diagnosis.

#### Acceptance Criteria

1. THE System SHALL render a Landing Page at the `/` route containing at minimum: a Hero section, a Features section, a How It Works section, and a Testimonials section.
2. WHEN a visitor clicks the primary Call-to-Action button on the Hero section, THE System SHALL navigate the visitor to the `/diagnosa` route; no additional error feedback or retry mechanism is required if the navigation cannot be completed.
3. THE System SHALL display the Landing Page with a layout that includes a persistent Navbar and Footer.
4. WHEN the Landing Page is rendered, THE System SHALL set the HTML `<title>` to a non-empty string and set a `<meta name="description">` tag with content between 50 and 160 characters in length, using `react-helmet-async`; this requirement applies only when the Landing Page is rendered and does not impose any title or meta description behavior when other routes are accessed directly.
5. THE System SHALL render all Card components on the Landing Page with a CSS `border-radius` of at least 12px and at least one non-zero `box-shadow` value; all card background colors SHALL be solid (non-transparent) colors.

---

### Requirement 2: Diagnostic Wizard — Step 1 (Device Category Selection)

**User Story:** As a user starting a diagnosis, I want to select my smartphone's brand or category, so that the diagnostic engine can narrow down relevant symptoms.

#### Acceptance Criteria

1. WHEN a user navigates to the `/diagnosa` route, THE System SHALL display Step 1 of the Diagnostic Wizard as the initial view, with all subsequent steps hidden.
2. THE System SHALL present exactly the following 5 selectable device category options: Samsung, iPhone, Xiaomi, OPPO, and General Android, each rendered as a Claymorphism-styled Card component with a `border-radius` of at least 12px and a non-zero `box-shadow`.
3. WHEN the Diagnostic Wizard is first entered, THE Zustand_Store SHALL reset `selectedDeviceCategory` to null.
4. WHEN a user selects a device category, THE Zustand_Store SHALL record the selected category's identifier string in `selectedDeviceCategory`.
5. WHEN a device category is selected, THE System SHALL display both a highlighted border AND a check icon on the selected card, and SHALL enable the "Next" navigation button.
6. WHILE `selectedDeviceCategory` in the Zustand_Store is null or an empty string, THE System SHALL render the "Next" button in a disabled state.
7. THE System SHALL display a step progress indicator at the top of the Wizard view showing the current step (1 of 4); the total step count SHALL always be 4 throughout all steps of the Wizard.

---

### Requirement 3: Diagnostic Wizard — Step 2 (Symptom Category Selection)

**User Story:** As a user, I want to select the general area of my smartphone that is malfunctioning, so that I can be shown the most relevant symptoms.

#### Acceptance Criteria

1. WHEN Step 2 is rendered, THE System SHALL display selectable symptom category options representing at minimum the following hardware/software areas: Battery, Screen, Performance, Camera, Connectivity, and Audio.
2. WHEN a user selects a symptom category, THE Zustand_Store SHALL record the selected category's identifier string in `selectedSymptomCategory`.
3. WHEN a symptom category is selected, THE System SHALL display a visual selection indicator on the selected option (highlighted border and/or check icon) and SHALL enable the "Next" navigation button; once the "Next" button has been enabled by a category selection, it SHALL remain enabled even if the user subsequently deselects the category.
4. WHILE `selectedSymptomCategory` in the Zustand_Store is null or an empty string, THE System SHALL render the "Next" button in a disabled state; no additional validation conditions beyond this check are required to enable the button.
5. WHEN the "Back" button is clicked on Step 2, THE System SHALL verify that `selectedDeviceCategory` in the Zustand_Store is non-null and non-empty; IF the value is present, THE System SHALL navigate back to Step 1 and retain the existing `selectedDeviceCategory` value unchanged; IF the value is absent (null or empty), THE System SHALL remain on Step 2 without navigating.

---

### Requirement 4: Diagnostic Wizard — Step 3 (Specific Symptom Multi-Selection)

**User Story:** As a user, I want to select all specific symptoms that apply to my smartphone, so that the diagnostic engine has enough Facts to infer an accurate Condition.

#### Acceptance Criteria

1. WHEN Step 3 is rendered, THE System SHALL display a list of Symptoms filtered by the `selectedSymptomCategory` from the Zustand_Store, sourced from the Knowledge_Base; IF no Symptoms exist for the selected category in the Knowledge_Base, THE System SHALL display a message stating that no symptoms are available for the selected category and SHALL keep the "Diagnose" button disabled.
2. THE System SHALL allow the user to select multiple Symptoms simultaneously; selecting one Symptom SHALL NOT deselect any other previously selected Symptom.
3. WHEN the user toggles a Symptom, THE Zustand_Store SHALL add the Symptom's ID to `activeFacts` if it is not already present, or remove it if it is already present.
4. WHEN at least one Symptom has been toggled to a selected state, THE System SHALL enable the "Diagnose" action button within 100 milliseconds of the toggle event; the button SHALL be enabled immediately based on the toggle event regardless of whether the internal symptom count has been updated yet.
5. WHILE the count of selected Symptoms in `activeFacts` is exactly zero, THE System SHALL render the "Diagnose" button in a disabled state; a symptom count greater than zero is the sole precondition for enabling this button.
6. WHEN a Symptom is in a selected state, THE System SHALL display a visually distinct selected indicator on its card or chip component (e.g., distinct border color, filled checkbox, or background color change) that is different from its unselected appearance.
7. WHEN the "Back" button is clicked on Step 3, THE System SHALL verify that `selectedSymptomCategory` in the Zustand_Store is non-null and non-empty; IF the value is present, THE System SHALL navigate back to Step 2 and retain all values in `activeFacts` unchanged; IF the value is absent (null or empty), THE System SHALL remain on Step 3 without navigating.

---

### Requirement 5: Diagnostic Wizard — Step 4 (Diagnosis Results)

**User Story:** As a user who has submitted symptoms, I want to see a clear diagnosis of my smartphone's condition, so that I understand the problem and know what steps to take next.

#### Acceptance Criteria

1. WHEN the user clicks the "Diagnose" button on Step 3, THE Inference_Engine SHALL be invoked with the current `activeFacts` array and the full Knowledge_Base Rules array.
2. THE Inference_Engine SHALL evaluate every Rule in the Knowledge_Base and return all evaluated Conditions; Conditions with a confidence score of 0 SHALL be included in the result array and displayed with a "0%" confidence indicator on the Results view; Conditions with a confidence score greater than 0 are considered "matched".
3. THE System SHALL display the evaluated Conditions in descending order of confidence score on the Results view; WHEN two or more Conditions share the same confidence score, THE System SHALL display them in ascending order of their Rule identifier as a secondary sort key.
4. WHEN one or more Conditions have a confidence score greater than 0, THE System SHALL display the Step 4 Results view showing each Condition with its name, description, confidence score as a percentage, and recommended action.
5. WHEN the Inference_Engine returns an array containing only Conditions with a confidence score of 0 (no matched conditions), THE System SHALL display a fallback message indicating no diagnosis was found and suggesting the user revisit their symptom selections; IF a runtime error prevents the Results view from rendering, THE System SHALL display a generic error notification as a secondary fallback; this generic error notification also applies when conditions do match but a runtime error prevents the results view from displaying.
6. THE System SHALL display a "Diagnose Again" button on the Results view; WHEN clicked, THE System SHALL invoke `resetStore` on the Zustand_Store and, only upon successful completion of the store reset, navigate the user to Step 1 of the Wizard; IF the store reset fails, THE System SHALL remain on the current view and display an error notification without navigating.
7. WHEN the Results view is rendered, THE System SHALL set the HTML `<title>` to a non-empty string that includes the name of the Condition with the highest confidence score.
8. THE System SHALL render each Condition on the Results view inside a Claymorphism-styled card component with a `border-radius` of at least 12px and a non-zero `box-shadow`.

---

### Requirement 6: Forward Chaining Inference Engine

**User Story:** As a thesis evaluator, I want the diagnostic logic to clearly implement a Forward Chaining Expert System, so that the academic contribution of the project is demonstrable in the codebase.

#### Acceptance Criteria

1. THE Inference_Engine SHALL be implemented as one or more functions that produce no side effects: they SHALL NOT modify any shared state, perform DOM manipulation, or make network calls; given identical inputs, they SHALL always return identical outputs.
2. THE Inference_Engine SHALL accept exactly two inputs: (a) an array of active Fact identifier strings and (b) an array of Rule objects comprising the full Knowledge_Base.
3. WHEN the Inference_Engine is invoked, THE Inference_Engine SHALL evaluate each Rule using AND logic: a Rule's condition set is considered satisfied only when every Fact identifier in the Rule's `symptomIds` array is present in the active Facts array (forward chaining: data-driven reasoning from Facts to Conclusions).
4. THE Inference_Engine SHALL compute a `confidenceScore` for each evaluated Rule as: `(count of Fact identifiers in the Rule's symptomIds that are present in the active Facts array) / (total count of Fact identifiers in the Rule's symptomIds)`, yielding a value between 0 and 1 inclusive.
5. THE Inference_Engine SHALL return an array of `Diagnosis_Result` objects sorted in descending order by `confidenceScore`; WHEN two results share the same `confidenceScore`, they SHALL be secondarily sorted in ascending order by Rule identifier.
6. IF no Rule has a `confidenceScore` greater than 0, THEN THE Inference_Engine SHALL return an empty array.
7. WHEN the active Facts array is empty OR the Knowledge_Base Rules array is empty, THE Inference_Engine SHALL return an empty array without evaluating any Rules.
8. THE Inference_Engine SHALL produce correct outputs when invoked with mock Fact identifiers and mock Rule objects that contain no references to Supabase clients, React components, or any browser-specific APIs.

---

### Requirement 7: Knowledge Base Data Model & Mock Data

**User Story:** As a developer, I want a clearly typed and structured Knowledge Base, so that the data-driven inference model is academically valid and easy to extend.

#### Acceptance Criteria

1. THE System SHALL define TypeScript interfaces for `Symptom`, `Condition`, and `Rule`, each with at minimum: an `id` field (string, non-empty unique identifier), a `name` field (string), and a `description` field (string).
2. THE `Rule` interface SHALL include a `symptomIds` field (non-empty array of strings, each referencing a `Symptom` `id`) and a `conditionId` field (string referencing a `Condition` `id`).
3. THE System SHALL provide a hardcoded mock Knowledge Base containing at minimum 5 distinct `Condition` objects, 20 distinct `Symptom` objects, and 10 distinct `Rule` objects for development and offline usage.
4. THE mock Knowledge Base SHALL include Symptoms and Rules covering at minimum the following 3 symptom categories: Battery, Screen, and Performance; each category SHALL contain at least 2 Symptoms and at least 2 Rules.
5. WHEN the Inference_Engine is invoked with a non-empty set of active Fact identifiers drawn exclusively from `Symptom` `id` values present in the mock Knowledge Base, AND the mock Knowledge Base Rules array is provided as the second input, THE Inference_Engine SHALL return the same `Diagnosis_Result` array on every invocation (deterministic output); this determinism guarantee applies only to non-empty active Fact sets — behavior when called with an empty set of active Facts is not required to be deterministic. A Rule is considered matched when ALL `symptomIds` in its array are present in the active Fact identifiers set.

---

### Requirement 8: Zustand Global State Store

**User Story:** As a developer, I want a centralized state store for the diagnostic session, so that user selections persist across Wizard steps without prop drilling.

#### Acceptance Criteria

1. THE Zustand_Store SHALL expose the following state fields with their specified initial values: `selectedDeviceCategory` (string, initial value: `""`), `selectedSymptomCategory` (string, initial value: `""`), `activeFacts` (array of strings, initial value: `[]`), and `diagnosisResults` (array of objects each containing a `conditionName` string and a `confidenceScore` number, initial value: `[]`).
2. THE Zustand_Store SHALL expose the following actions: `setDeviceCategory`, `setSymptomCategory`, `toggleFact`, `setResults`, and `resetStore`.
3. WHEN `toggleFact` is called with a Fact ID string that is already present in `activeFacts`, THE Zustand_Store SHALL remove that Fact ID from the `activeFacts` array; the resulting array SHALL contain all previous elements except the removed Fact ID.
4. WHEN `toggleFact` is called with a Fact ID string that is NOT present in `activeFacts`, THE Zustand_Store SHALL append that Fact ID to the `activeFacts` array; the resulting array SHALL contain all previous elements plus the new Fact ID.
5. WHEN `resetStore` is called, THE Zustand_Store SHALL set `selectedDeviceCategory` to `""`, `selectedSymptomCategory` to `""`, `activeFacts` to `[]`, and `diagnosisResults` to `[]`.
6. WHEN `toggleFact` is called with an empty string (`""`), THE Zustand_Store SHALL leave all state fields unchanged.

---

### Requirement 9: Authentication & Route Protection

**User Story:** As an Admin, I want my dashboard to be protected behind authentication, so that unauthorized users cannot access or modify the Knowledge Base.

#### Acceptance Criteria

1. THE System SHALL require an active Supabase Auth session for all routes under `/admin`, including `/admin` itself and all sub-routes; any request to these routes without an active session SHALL result in a redirect to `/login`.
2. WHEN an Admin submits an email/password pair on the Login page that is successfully verified by Supabase Auth, THE System SHALL establish an authenticated session and redirect the Admin to `/admin`.
3. WHEN an unauthenticated user attempts to navigate to `/admin` or any `/admin` sub-route, THE System SHALL redirect that user to `/login` before rendering any admin content.
4. WHEN an authenticated Admin navigates to `/login`, THE System SHALL redirect that Admin to `/admin` without rendering the login form.
5. WHEN an Admin clicks the "Logout" button, THE System SHALL terminate the Supabase session and redirect the Admin to `/login`.
6. WHEN an Admin submits the Login form with one or more empty fields (email or password), THE System SHALL display an inline validation error on the empty field(s) and SHALL NOT submit the form to Supabase Auth.
7. IF the Supabase authentication request returns an error (e.g., invalid credentials, network failure), THEN THE System SHALL display a descriptive error notification and keep the user on the `/login` page.
8. WHEN an active Supabase session expires while the Admin is on an `/admin` route, THE System SHALL detect the session expiry and redirect the Admin to `/login`.

---

### Requirement 10: Admin Panel — Knowledge Base Management

**User Story:** As an Admin, I want to perform CRUD operations on the Knowledge Base, so that I can keep the diagnostic rules and symptoms up to date without modifying source code.

#### Acceptance Criteria

1. THE System SHALL render the Admin Panel at the `/admin` route with a persistent Sidebar navigation that links to the Symptoms, Conditions, and Rules management views.
2. THE System SHALL provide separate admin views for managing Symptoms, Conditions, and Rules; each view SHALL be accessible via its own distinct URL sub-path under `/admin`.
3. WHEN an Admin navigates to the Symptoms management view, THE System SHALL fetch and display all Symptoms from Supabase in a DataTable component paginated at 10 records per page.
4. WHEN an Admin submits a "Create Symptom" form where all required fields are non-empty and each field value does not exceed 255 characters, THE System SHALL insert a new Symptom record into Supabase and update the DataTable to display the new record within 2 seconds; IF a post-insert step fails but the record was inserted, THE System SHALL still reflect the inserted record in the DataTable.
5. WHEN an Admin submits a "Edit Symptom" form with all required fields non-empty and each value not exceeding 255 characters, THE System SHALL update the corresponding Symptom record in Supabase and reflect the change in the DataTable within 2 seconds.
6. WHEN an Admin confirms deletion of a Symptom, THE System SHALL delete the record from Supabase and remove it from the DataTable within 2 seconds.
7. WHEN an Admin submits a Create or Edit form where any required field is empty or exceeds 255 characters, THE System SHALL display an inline validation error on the offending field(s) and SHALL NOT submit the form to Supabase.
8. IF a Supabase CRUD operation fails, THEN THE System SHALL display an error notification indicating which operation failed (create, update, or delete) and SHALL leave the DataTable data unchanged.
9. THE same CRUD behavior described in criteria 3–8 SHALL apply equivalently to the Conditions and Rules management views.

---

### Requirement 11: PWA Support

**User Story:** As a mobile user, I want to install CekHP on my home screen and use it offline, so that I can run a diagnosis without an active internet connection.

#### Acceptance Criteria

1. THE System SHALL include a Web App Manifest file containing at minimum: `name`, `short_name`, icons at 192×192px and 512×512px, `theme_color`, `background_color`, and `display: "standalone"`; compliance with this manifest specification is sufficient to satisfy this requirement independent of broader PWA infrastructure.
2. THE System SHALL register a service worker that intercepts requests for static assets and serves them from cache first, falling back to the network if the cached response is absent; the service worker SHALL cache the mock Knowledge Base data at install time.
3. WHEN the application is loaded while the device has no network connectivity, THE System SHALL serve all cached static assets and render the Diagnostic Wizard using the cached mock Knowledge Base; IF the mock Knowledge Base is not present in the service worker cache, THE System SHALL display a visible message (without requiring any network interaction) stating that the Diagnostic Wizard is unavailable offline and prompting the user to reconnect.
4. WHEN a new version of the application is deployed and the user opens the app, THE System SHALL display a prompt informing the user that an update is available and offering a reload action; the prompt SHALL remain visible until the user either reloads or explicitly dismisses it; IF the user dismisses the prompt, THE System SHALL re-display it on the user's next visit.

---

### Requirement 12: Responsive Design & Accessibility

**User Story:** As a user on any device, I want the application to be fully usable on both mobile and desktop screens, so that I can run a diagnosis from my phone or computer.

#### Acceptance Criteria

1. THE System SHALL implement a mobile-first responsive layout such that, at any viewport width between 320px and 1920px inclusive: no horizontal scrollbar appears, no content overflows its container, and all interactive elements remain operable.
2. THE System SHALL ensure that, on viewports with a width of 768px or less, all interactive elements (buttons, cards, form inputs) have a rendered touch target size of at least 44×44 CSS pixels.
3. THE System SHALL apply ARIA labels and roles to all interactive components that do not have visible descriptive text.
4. THE System SHALL ensure that all text-on-background color combinations meet WCAG 2.1 AA contrast ratios: at least 4.5:1 for normal text (below 18pt or below 14pt bold) and at least 3:1 for large text (18pt or above, or 14pt bold or above).
5. WHEN a user navigates any page of the application using only a keyboard, THE System SHALL display a visible focus indicator on the currently focused interactive element at all times; the focus indicator SHALL consist of at least a 2px outline with a contrast ratio of at least 3:1 against the adjacent background colors.

---

### Requirement 13: Performance & Build Quality

**User Story:** As a thesis evaluator, I want the application to meet web performance benchmarks, so that the technical quality of the project is academically defensible.

#### Acceptance Criteria

1. THE System SHALL achieve a Lighthouse Performance score of 90 or above on the Landing Page when measured using the Lighthouse "Mobile" preset (Moto G4 throttling profile).
2. THE System SHALL achieve a Lighthouse Accessibility score of 90 or above on the Landing Page, the Diagnostic Page, and the Results Page.
3. THE System SHALL be built using Vite with TypeScript Strict Mode enabled (`"strict": true` in `tsconfig.json`).
4. WHEN the production build command is executed, THE System SHALL complete without any TypeScript compilation errors.
5. WHEN the production build command is executed, THE System SHALL output vendor dependencies in one or more JavaScript chunks separate from the application code chunk, with each chunk configured for a browser cache max-age of at least 31,536,000 seconds (1 year); the build SHALL succeed regardless of whether the application code bundle alone exceeds 200KB; this requirement applies only during production build generation and does not impose invariant constraints on other build states.
6. THE System SHALL implement route-level code splitting using React lazy loading and `Suspense` boundaries such that the initial JavaScript payload delivered to the browser does not exceed 200KB when measured in gzip-compressed size.
