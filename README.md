# ZameenTrace

Full-stack scaffold for a land mapping web application focused on digital trust infrastructure for agriculture in Pakistan.

## Status

This repository now includes implementation work across `STEP 1` to `STEP 6`, with some runtime verification still pending.

Included:

- frontend application scaffold with Next.js
- backend API scaffold with Express and parcel endpoints
- database schema for PostgreSQL + PostGIS
- environment file templates
- farmer-facing frontend route with map UI
- admin dashboard UI
- auth and deployment scaffolding

Not included yet:

- full runtime verification
- production-hardening of auth and offline sync
- cloud deployment-specific secrets and infrastructure setup

## Project structure

- `frontend/` - Next.js frontend scaffold
- `backend/` - Express backend scaffold
- `database/` - PostgreSQL/PostGIS migrations and docs scaffold
- `assets/` - existing marketing asset library
- `index.html` - existing landing page prototype preserved at the repo root
- `api/` - legacy API scaffold preserved for reference
- `legacy/` - archived scripts from earlier iterations
- `docker-compose.yml` - local integration stack
- `docs/deployment.md` - deployment notes

## Frontend scaffold

- `frontend/app/page.js` - farmer-facing route
- `frontend/app/dashboard/page.js` - admin route
- `frontend/components/app-shell.js` - farmer UI shell
- `frontend/components/admin-dashboard.js` - admin dashboard UI
- `frontend/lib/config.js` - frontend config helper
- `frontend/lib/api.js` - frontend API helpers
- `frontend/lib/offline-sync.js` - offline queue helper
- `frontend/.env.local.example` - frontend env template

## Backend scaffold

- `backend/src/server.js` - Express server entry
- `backend/src/app.js` - app wiring and middleware
- `backend/src/routes/` - API route modules
- `backend/src/controllers/` - parcel and auth controllers
- `backend/src/services/` - parcel and auth services
- `backend/src/config/env.js` - backend env loader
- `backend/src/middleware/auth.middleware.js` - auth protection
- `backend/.env.example` - backend env template
- `backend/README.md` - API endpoint overview

## Database scaffold

- `database/migrations/` - migration placeholder files
- `database/migrations/0001_core_schema.sql` - core PostGIS schema migration
- `database/seeds/` - seed folder
- `database/docs/` - database planning notes

## Root environment template

Copy `.env.example` when wiring local services together.

## Workspace scripts

From the repository root:

```bash
npm run dev:frontend
npm run dev:backend
```

## Notes

- The existing root landing page has been preserved and not converted into the Next.js app yet.
- The older `api/` folder is still present as a legacy reference and can be removed once the new backend replaces it.
- The interrupted smoke test means the latest frontend/backend additions should still be run once before launch work continues.
- The demo auth endpoint is intentionally gated behind `DEMO_AUTH_ENABLED=true` for local development only.
