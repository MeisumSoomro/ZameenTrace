# ZameenTrace MVP Handoff Spec

## 0. Project context for the restructuring agent
This repository is a monorepo for a land-intelligence prototype for Pakistan. The system is intended to support a practical land-record workflow for parcels, especially in contexts where boundaries, ownership, and verification need to be reviewed by field staff, neighbors, or local operators.

### What the project is about
ZameenTrace aims to create a simple digital workflow for:
- viewing land parcels in a map-based interface,
- reviewing parcel ownership and location details,
- submitting boundary updates when parcel information changes,
- recording verification decisions from relevant stakeholders,
- and keeping parcel history and status in a structured way.

In short, it is meant to become a lightweight land-record review and verification tool rather than a full enterprise GIS platform.

### What it aims to create
The long-term product goal is a usable system that helps turn messy or fragmented parcel records into a more transparent, reviewable, and traceable process. The MVP should focus on the core loop:
1. Find a parcel.
2. Inspect its details.
3. Submit a change request.
4. Record a verification decision.
5. Preserve that history in the system.

### Current UI structure
The current user interface is organized as a single parcel workflow experience in the frontend app shell. It is structured around a few major sections:
- a hero/summary area at the top,
- a region filter toolbar,
- a map column showing parcel locations,
- a parcel list for selecting parcels,
- a details panel for parcel information,
- and separate forms for boundary updates and verification.

This structure is already aligned with the MVP: it gives users a practical way to navigate, inspect, and act on parcel information from one screen.

### What it will take to complete the whole project
To complete the full project, the team will need to connect the existing scaffolding into a fully reliable end-to-end product. The key requirements are:
- a working database-backed backend,
- a stable authentication and user identity layer,
- clean and tested parcel CRUD and versioning flows,
- a more polished frontend experience,
- and operational setup for deployment and local development.

The current codebase already has the main building blocks, but it still needs hardening and completion around persistence, validation, and real-world usability.

## 1. Product goal
Build a simple land-parcel review and verification workflow that lets a user:
- find parcels by region,
- view parcel details,
- submit a boundary update,
- submit a verification decision,
- and have the action persisted through the backend and database.

## 2. Current architecture to preserve
The restructuring should keep the existing high-level structure unless a simpler layout is clearly better.

### Backend
- Express app entry point in backend/src/server.js
- App bootstrap and middleware in backend/src/app.js
- Route/controller/service layering for parcel operations
- Parcel routes in backend/src/routes/parcel.routes.js
- Parcel controllers in backend/src/controllers/parcel.controller.js
- Parcel service logic in backend/src/services/parcel.service.js
- Database connection in backend/src/utils/db.js

### Frontend
- Main parcel workflow UI in frontend/components/app-shell.js
- Parcel map component in frontend/components/parcel-map.js
- Frontend API helpers in frontend/lib/api.js and frontend/lib/api-client.js
- App configuration in frontend/lib/config.js
- Offline sync helpers in frontend/lib/offline-sync.js

### Database
- Postgres/PostGIS schema in database/migrations/0001_core_schema.sql
- Supporting notes in database/docs/

## 3. Must build
These are the minimum features required for the project to be considered usable.

### Backend
- Start and run a working Express server
- Expose a health endpoint
- Provide parcel API routes for:
  - list parcels
  - get one parcel
  - create a parcel
  - update parcel boundary
  - submit verification
- Validate required request data
- Persist parcel and version data in PostgreSQL
- Store verification approvals
- Return clear success/error responses

### Frontend
- A simple app shell or landing entry point
- Region filter UI
- Parcel list UI
- Parcel detail panel
- Parcel map view with selection
- Boundary update form
- Verification form
- Basic feedback for loading, success, and error states

### Database
- User table for basic identity
- Parcel table
- Parcel version history table
- Verification approval table
- Basic filtering by province/district/tehsil/village

## 4. Should build
These improve usability but are not essential for the first release.

- Auth flow with real login/session handling
- Better loading and empty states
- Cleaner error messaging
- Basic status badges for parcel lifecycle
- Simple map styling and parcel highlighting
- Basic API client error handling

## 5. Can defer / remove for simplicity
These should be postponed or omitted from the MVP.

- Advanced reporting dashboards
- Complex dispute workflows
- Offline sync queueing
- Advanced permissions/roles
- Large design system polish
- Experimental GIS features
- Notifications
- Social/community modules
- Deep analytics and audit trails

## 6. MVP acceptance criteria
The project is “done enough” when:
1. A user can view parcels by region.
2. A user can select a parcel and see details.
3. A user can submit a boundary update.
4. A user can submit a verification decision.
5. The backend stores the results and the UI reflects the updated state.

## 7. Current HTML/CSS assessment
The current HTML and CSS are functional as a prototype, but they are not yet optimized for long-term maintainability or a clean MVP structure.

### Current state of the HTML
- The UI is built around clear content sections and forms, which is good for rapid prototyping.
- The structure is understandable and close to the product workflow.
- Some parts are still more experimental or marketing-oriented than product-focused.

### Current state of the CSS
- The styling is visually broad and somewhat layered, which can make the interface feel less focused.
- There is a mix of app-shell styling, landing-page styling, and reusable component styling.
- The design is acceptable for a prototype, but the CSS would benefit from being simplified around the MVP workflow.

### Suggested direction
For the MVP, the HTML and CSS should be simplified to emphasize:
- a clear parcel workflow,
- simple responsive layouts,
- strong form clarity,
- minimal visual noise,
- and consistent spacing and typography.

The styling should support the product experience rather than showcase decorative design.

## 8. Additional suggestions and remaining needs
Beyond the MVP workflow, the project would benefit from the following:
- a single clear product narrative so the UI and backend target the same use case,
- more consistent naming across frontend and backend modules,
- fewer experimental or legacy files in the active path,
- stronger validation and error messages for users,
- more realistic sample data for testing the parcel flow,
- and a simple deployment path for local and remote environments.

## 9. Recommended restructuring scope
For a restructuring pass, keep the project focused on:
- backend parcel workflow,
- frontend parcel management UI,
- PostgreSQL persistence,
- basic auth and validation,
- a simplified and consistent HTML/CSS structure.

Everything else should be treated as optional future work.
