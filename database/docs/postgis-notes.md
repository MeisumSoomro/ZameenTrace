# PostGIS Notes

## Geometry model

- Parcel boundaries use `GEOMETRY(POLYGON, 4326)`
- Parcel centroids use `GEOMETRY(POINT, 4326)`
- GPS coordinates should be submitted in WGS84 latitude/longitude

## Area calculation

The schema calculates parcel area with:

```sql
ST_Area(boundary::geography)
```

This returns area in square meters and is more appropriate for field-scale land measurement than planar degree-based area.

## Validation rules

`prepare_parcel_geometry()` enforces:

- geometry is present
- geometry type is polygon
- SRID is `4326`
- polygon is valid
- area is greater than zero

The same trigger is applied to both:

- `land_parcels`
- `land_parcel_versions`

## Spatial indexing

GiST indexes are created for:

- parcel boundaries
- parcel centroids
- versioned parcel boundaries

These support:

- region and map-based parcel retrieval
- intersection checks
- bounding-box filtering
- future proximity and overlap queries

## Design note

The schema stores both:

- the current parcel state in `land_parcels`
- historical snapshots in `land_parcel_versions`

That makes the read path simpler for active parcel operations while still preserving a full audit trail.
