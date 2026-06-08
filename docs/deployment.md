# Deployment Notes

## Recommended split

- Frontend: Vercel or Netlify
- Backend: AWS ECS, Render, Railway, or Fly.io
- Database: managed PostgreSQL with PostGIS support

## Local development

You can boot a local stack with:

```bash
docker compose up
```

This starts:

- PostgreSQL + PostGIS
- backend service
- frontend service

## Environment requirements

Frontend:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_MAP_PROVIDER`

Backend:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `REQUEST_BODY_LIMIT`
- `DEMO_AUTH_ENABLED`

Database:

- PostGIS extension enabled
- migration `database/migrations/0001_core_schema.sql` applied

## Production notes

- store JWT secret in a managed secret store
- terminate TLS at the edge or load balancer
- restrict backend CORS to trusted frontend origins
- run migrations before exposing write endpoints
- keep `DEMO_AUTH_ENABLED=false` outside local development
- move offline queue sync from local storage to a background sync strategy when the frontend PWA layer is added
