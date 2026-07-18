# LedgerLift

LedgerLift is an accessible, role-aware tax workflow that keeps client requests, return status, source evidence, and human review connected in one interface.

**[Open the live prototype](https://aravindc19.github.io/ledgerlift-ai-tax-platform/)**

## Product capabilities

- Action-first CPA dashboard with personal and firm scopes, search, pagination, and priorities calculated across 148 generated returns
- Connected return workspace for documents, messages, requests, and workflow history
- Source-level traceability from a return field to a structured document page, highlighted evidence, confidence, and transformation trail
- Human confirmation and correction flows for generated field suggestions, with required reasoning and an audit trail
- Role switching among preparer, reviewer, and personal-client contexts
- Client-safe rendering that separates internal notes and documents from client-visible information
- Shared return status with audience-appropriate wording, blockers, and next-action ownership
- Search, filtering, progressive disclosure, and drill-down across 180 generated work items
- First-run client workflow with document validation and a follow-up confirmation
- URL-based navigation with browser back and forward support

## What is wired up

- Navigation between all product areas and contextual return tabs
- Return-specific workspace content and review evidence
- Role-aware navigation, language, document visibility, and action attribution
- Complexity search, filtering, incremental loading, and connected-return navigation
- Priority scoring and dashboard metrics computed from generated portfolio data
- Searchable, paginated queue switching between personal assignments and the full firm portfolio
- Suggested-field confirmation and correction with a required reason
- Client document selection with PDF/JPG/PNG and 20 MB validation
- Client answers that update ownership, status, requests, priorities, and review state across the product
- Keyboard focus restoration after dynamic updates

## What is simulated

- OCR and document parsing
- AI extraction, recommendations, and confidence scoring
- Authentication and server-side permission enforcement
- Messaging and notification delivery
- Backend persistence
- File transfer and storage; the browser validates the selection and simulates completion

All sample data and interaction logic live in `app.js`.

## Run locally

```bash
git clone https://github.com/aravindc19/ledgerlift-ai-tax-platform.git
cd ledgerlift-ai-tax-platform
python3 -m http.server 8000
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000).

There is no build step and no package installation. The application uses plain HTML, CSS, and JavaScript.

## Quality checks

Run the dependency-free structural and accessibility checks:

```bash
python3 qa_check.py
```

With the local server running, include served-asset checks:

```bash
python3 qa_check.py --url http://127.0.0.1:8000/
```

The checks cover HTML structure, accessible names, form labels, assistive-technology states, role safety, keyboard focus restoration, dashboard queue behavior, source highlighting, upload validation, workflow branching, count accuracy, local assets, and served responses.

## Accessibility and resilience

- Semantic landmarks, labeled navigation, dialogs, and form controls
- Keyboard-accessible skip link and visible focus states
- `aria-current`, `aria-pressed`, live announcements, and labeled progress indicators
- Focus restoration after filtering, tab changes, role switching, and dynamic result loading
- Reduced-motion and forced-color support
- Responsive layouts down to mobile widths
- Client-safe visibility for staff-only routes, notes, and documents

This is a prototype-level accessibility implementation rather than a formal WCAG certification.

## Design decisions

- Priorities combine blocker state, current owner, urgency, and source-match risk so the dashboard leads directly to action.
- Conversations stay attached to requests, documents, and return issues instead of becoming a separate inbox.
- One shared shell adapts by role so personal and firm contexts remain distinct without splitting into separate products.
- System-suggested values are clearly identified and include evidence, uncertainty, editability, and an explicit human decision path.
- Client actions update the connected workflow rather than changing only the screen where the action occurred.
- Large workspaces use summary/detail views and progressive disclosure instead of rendering every item at once.

## Project structure

- `index.html` - application shell, landmarks, and dialogs
- `styles.css` - responsive layout, visual system, and accessibility states
- `app.js` - generated data, application state, rendering, and interaction logic
- `qa_check.py` - dependency-free regression and served-asset checks
- `favicon.svg` - LedgerLift browser icon
