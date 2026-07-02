-- =============================================================================
-- ZameenTrace MVP Seed Data
-- Creates a demo user and 3 sample parcels so the full parcel workflow can be
-- tested end-to-end with real database records.
-- =============================================================================

-- Demo user: used as the default approver / operator for MVP testing.
-- The UUID is deterministic so frontend can reference it without a lookup.
INSERT INTO users (id, full_name, email, phone, role, preferred_language)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Operator',
  'demo@zameentrace.pk',
  '+92-300-0000001',
  'operator',
  'en'
)
ON CONFLICT (id) DO NOTHING;

-- Parcel 1: Ali Khan — verified parcel in Mir Wah village.
-- Coordinates form a closed polygon in Tando Allahyar, Sindh.
INSERT INTO land_parcels (
  parcel_id, owner_user_id, owner_name_snapshot,
  province, district, tehsil, village,
  boundary, created_by_user_id
)
VALUES (
  'ZT-PK-SND-0421',
  '00000000-0000-0000-0000-000000000001',
  'Ali Khan',
  'Sindh', 'Tando Allahyar', 'Tando Allahyar', 'Mir Wah',
  ST_SetSRID(ST_GeomFromGeoJSON('{
    "type": "Polygon",
    "coordinates": [[
      [68.7146, 25.4621],
      [68.7170, 25.4620],
      [68.7174, 25.4637],
      [68.7149, 25.4641],
      [68.7146, 25.4621]
    ]]
  }'), 4326),
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (parcel_id) DO NOTHING;

-- Parcel 2: Mehran Bux — pending verification in Chamber village.
INSERT INTO land_parcels (
  parcel_id, owner_user_id, owner_name_snapshot,
  province, district, tehsil, village,
  boundary, created_by_user_id
)
VALUES (
  'ZT-PK-SND-0422',
  '00000000-0000-0000-0000-000000000001',
  'Mehran Bux',
  'Sindh', 'Tando Allahyar', 'Tando Allahyar', 'Chamber',
  ST_SetSRID(ST_GeomFromGeoJSON('{
    "type": "Polygon",
    "coordinates": [[
      [68.7172, 25.4614],
      [68.7188, 25.4613],
      [68.7191, 25.4627],
      [68.7174, 25.4628],
      [68.7172, 25.4614]
    ]]
  }'), 4326),
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (parcel_id) DO NOTHING;

-- Parcel 3: Shazia Memon — draft parcel on Nasarpur Road.
INSERT INTO land_parcels (
  parcel_id, owner_user_id, owner_name_snapshot,
  province, district, tehsil, village,
  boundary, created_by_user_id
)
VALUES (
  'ZT-PK-SND-0423',
  '00000000-0000-0000-0000-000000000001',
  'Shazia Memon',
  'Sindh', 'Tando Allahyar', 'Tando Allahyar', 'Nasarpur Road',
  ST_SetSRID(ST_GeomFromGeoJSON('{
    "type": "Polygon",
    "coordinates": [[
      [68.7133, 25.4608],
      [68.7148, 25.4607],
      [68.7150, 25.4620],
      [68.7134, 25.4621],
      [68.7133, 25.4608]
    ]]
  }'), 4326),
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (parcel_id) DO NOTHING;

-- Create initial version records for each parcel so the versioning workflow works.
-- Version 1 for parcel 1 (Ali Khan)
INSERT INTO land_parcel_versions (
  parcel_id, version_number, change_type,
  owner_user_id, owner_name_snapshot,
  boundary, changed_by_user_id, change_reason
)
SELECT
  lp.id, 1, 'created',
  '00000000-0000-0000-0000-000000000001', lp.owner_name_snapshot,
  lp.boundary, '00000000-0000-0000-0000-000000000001', 'Initial parcel creation'
FROM land_parcels lp
WHERE lp.parcel_id = 'ZT-PK-SND-0421'
  AND NOT EXISTS (
    SELECT 1 FROM land_parcel_versions v WHERE v.parcel_id = lp.id
  );

-- Version 1 for parcel 2 (Mehran Bux)
INSERT INTO land_parcel_versions (
  parcel_id, version_number, change_type,
  owner_user_id, owner_name_snapshot,
  boundary, changed_by_user_id, change_reason
)
SELECT
  lp.id, 1, 'created',
  '00000000-0000-0000-0000-000000000001', lp.owner_name_snapshot,
  lp.boundary, '00000000-0000-0000-0000-000000000001', 'Initial parcel creation'
FROM land_parcels lp
WHERE lp.parcel_id = 'ZT-PK-SND-0422'
  AND NOT EXISTS (
    SELECT 1 FROM land_parcel_versions v WHERE v.parcel_id = lp.id
  );

-- Version 1 for parcel 3 (Shazia Memon)
INSERT INTO land_parcel_versions (
  parcel_id, version_number, change_type,
  owner_user_id, owner_name_snapshot,
  boundary, changed_by_user_id, change_reason
)
SELECT
  lp.id, 1, 'created',
  '00000000-0000-0000-0000-000000000001', lp.owner_name_snapshot,
  lp.boundary, '00000000-0000-0000-0000-000000000001', 'Initial parcel creation'
FROM land_parcels lp
WHERE lp.parcel_id = 'ZT-PK-SND-0423'
  AND NOT EXISTS (
    SELECT 1 FROM land_parcel_versions v WHERE v.parcel_id = lp.id
  );

-- Link each parcel to its initial version so current_version_id is set.
UPDATE land_parcels lp
SET current_version_id = v.id
FROM land_parcel_versions v
WHERE v.parcel_id = lp.id
  AND v.version_number = 1
  AND lp.current_version_id IS NULL;
