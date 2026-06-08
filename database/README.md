# Database

PostgreSQL + PostGIS schema assets for ZameenTrace.

## Included in STEP 2

- core schema migration for:
  - users
  - land parcels
  - parcel version history
  - verification approvals
  - dispute records
- PostGIS geometry validation trigger
- automatic parcel area and centroid calculation
- regional and spatial indexes

## Key files

- `database/migrations/0001_core_schema.sql` - core schema migration
- `database/docs/postgis-notes.md` - geospatial design notes
- `database/docs/schema-overview.md` - table-by-table overview

## Schema highlights

- parcel boundaries are stored as `GEOMETRY(POLYGON, 4326)`
- area is calculated in square meters using `ST_Area(boundary::geography)`
- centroid is stored for spatial queries and map summaries
- parcel changes are tracked in `land_parcel_versions`
- approvals attach to a specific parcel version
- disputes can reference a parcel and optionally a specific version

## Next step

`STEP 3` can now build REST APIs on top of this schema for parcel creation, versioned updates, approvals, and regional queries.
