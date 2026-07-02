# ZameenTrace

## Overview
ZameenTrace is a full-stack land intelligence prototype for Pakistan. The current build focuses on a usable frontend shell, a lightweight Express backend, and a clear path for future parcel and verification workflows.

## Setup
1. Install dependencies from the repository root.
2. Copy environment examples and fill in local values where required.
3. Start the backend:
   ```bash
   npm run dev:backend
   ```
4. Start the frontend:
   ```bash
   npm run dev:frontend
   ```

## Features
- Next.js landing page and UI shell
- Express backend with health and parcel API wiring
- Safer API client handling for empty or non-JSON responses
- Basic frontend/backend connectivity status on the landing page
- Environment-based configuration for easier local development
- Backend route structure ready for parcel creation, lookup, boundary updates, and verification

## Recent fixes and improvements
- Hardened the frontend API client so empty responses do not break requests.
- Made backend environment loading more resilient for local startup and tests.
- Refactored the landing page structure for better readability and maintainability.
- Added a simple backend health indicator to the UI for faster integration feedback.
- Added concise inline comments to the main backend and frontend modules to make the project easier to extend.

## Known Issues
- Some UI sections still use demo content rather than live data.
- Full parcel verification workflows depend on a live database setup.
- Authentication and offline sync remain partially scaffolded.

## Next Steps
- Connect parcel and report actions to real backend endpoints.
- Add clearer loading and error states in the UI.
- Complete authentication flow and deployment documentation.
- Add a live PostGIS-backed test environment for end-to-end parcel submission verification.
