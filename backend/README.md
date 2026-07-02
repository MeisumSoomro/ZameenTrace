# Backend API

## Overview
The backend provides the API layer for ZameenTrace. It currently includes a health check endpoint, environment-safe startup, and the initial parcel/auth structure needed for frontend integration.

## Setup
1. Create a local environment file in the backend folder.
2. Set at least the database and JWT values before starting the server.
3. Start the server:
   ```bash
   npm run dev
   ```

## Current state
- Health endpoint available at `/health`
- Safer config loading for local development and tests
- Parcel and auth routes are scaffolded for further wiring

## Main endpoints
- `GET /health` — basic backend health check used by the frontend status indicator
- `POST /api/auth/login` — demo auth route when enabled
- `GET /api/parcels` and `POST /api/parcels` — parcel workflow scaffold

## Known issues
- Database-backed parcel persistence still requires a live PostGIS setup.
- Authentication and validation are still partial.

## Next steps
- Connect parcel routes to real database logic.
- Add stronger validation and test coverage.
- Finish the frontend integration flow for parcel actions.
