CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('farmer', 'neighbor', 'operator', 'government_admin', 'surveyor', 'viewer');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'parcel_status') THEN
    CREATE TYPE parcel_status AS ENUM ('draft', 'pending_verification', 'verified', 'disputed', 'archived');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'parcel_change_type') THEN
    CREATE TYPE parcel_change_type AS ENUM ('created', 'boundary_updated', 'owner_updated', 'metadata_updated', 'verification_locked');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
    CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispute_status') THEN
    CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'rejected');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prepare_parcel_geometry()
RETURNS TRIGGER AS $$
DECLARE
  computed_area DOUBLE PRECISION;
BEGIN
  IF NEW.boundary IS NULL THEN
    RAISE EXCEPTION 'Parcel boundary is required';
  END IF;

  IF GeometryType(NEW.boundary) <> 'POLYGON' THEN
    RAISE EXCEPTION 'Parcel boundary must be a POLYGON geometry';
  END IF;

  IF ST_SRID(NEW.boundary) <> 4326 THEN
    RAISE EXCEPTION 'Parcel boundary must use SRID 4326';
  END IF;

  IF NOT ST_IsValid(NEW.boundary) THEN
    RAISE EXCEPTION 'Parcel boundary is not a valid polygon';
  END IF;

  computed_area := ST_Area(NEW.boundary::geography);

  IF computed_area <= 0 THEN
    RAISE EXCEPTION 'Parcel area must be greater than zero';
  END IF;

  NEW.area_sqm := computed_area;
  NEW.centroid := ST_Centroid(NEW.boundary);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email CITEXT UNIQUE,
  phone TEXT,
  national_id TEXT,
  organization_name TEXT,
  role user_role NOT NULL DEFAULT 'farmer',
  preferred_language TEXT DEFAULT 'en',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_contact_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS land_parcels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id TEXT NOT NULL UNIQUE,
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  owner_name_snapshot TEXT NOT NULL,
  owner_phone_snapshot TEXT,
  owner_national_id_snapshot TEXT,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  tehsil TEXT,
  village TEXT,
  boundary GEOMETRY(POLYGON, 4326) NOT NULL,
  area_sqm DOUBLE PRECISION NOT NULL DEFAULT 0,
  centroid GEOMETRY(POINT, 4326),
  status parcel_status NOT NULL DEFAULT 'draft',
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS land_parcel_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID NOT NULL REFERENCES land_parcels(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  change_type parcel_change_type NOT NULL,
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  owner_name_snapshot TEXT NOT NULL,
  owner_phone_snapshot TEXT,
  owner_national_id_snapshot TEXT,
  boundary GEOMETRY(POLYGON, 4326) NOT NULL,
  area_sqm DOUBLE PRECISION NOT NULL DEFAULT 0,
  centroid GEOMETRY(POINT, 4326),
  changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  change_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT land_parcel_versions_unique_version UNIQUE (parcel_id, version_number)
);

ALTER TABLE land_parcels
  ADD COLUMN IF NOT EXISTS current_version_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'land_parcels_current_version_fk'
      AND table_name = 'land_parcels'
  ) THEN
    ALTER TABLE land_parcels
      ADD CONSTRAINT land_parcels_current_version_fk
      FOREIGN KEY (current_version_id)
      REFERENCES land_parcel_versions(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS verification_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID NOT NULL REFERENCES land_parcels(id) ON DELETE CASCADE,
  parcel_version_id UUID NOT NULL REFERENCES land_parcel_versions(id) ON DELETE CASCADE,
  approver_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship_to_parcel TEXT NOT NULL DEFAULT 'neighbor',
  status approval_status NOT NULL DEFAULT 'pending',
  comments TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT verification_approvals_unique UNIQUE (parcel_version_id, approver_user_id)
);

CREATE TABLE IF NOT EXISTS dispute_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID NOT NULL REFERENCES land_parcels(id) ON DELETE CASCADE,
  parcel_version_id UUID REFERENCES land_parcel_versions(id) ON DELETE SET NULL,
  raised_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  dispute_category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status dispute_status NOT NULL DEFAULT 'open',
  resolved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS land_parcels_boundary_gix
  ON land_parcels
  USING GIST (boundary);

CREATE INDEX IF NOT EXISTS land_parcels_centroid_gix
  ON land_parcels
  USING GIST (centroid);

CREATE INDEX IF NOT EXISTS land_parcels_region_idx
  ON land_parcels (province, district, tehsil, village);

CREATE INDEX IF NOT EXISTS land_parcel_versions_boundary_gix
  ON land_parcel_versions
  USING GIST (boundary);

CREATE INDEX IF NOT EXISTS land_parcel_versions_parcel_idx
  ON land_parcel_versions (parcel_id, version_number DESC);

CREATE INDEX IF NOT EXISTS verification_approvals_status_idx
  ON verification_approvals (parcel_version_id, status);

CREATE INDEX IF NOT EXISTS dispute_records_status_idx
  ON dispute_records (parcel_id, status, created_at DESC);

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER land_parcels_set_updated_at
BEFORE UPDATE ON land_parcels
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER verification_approvals_set_updated_at
BEFORE UPDATE ON verification_approvals
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER dispute_records_set_updated_at
BEFORE UPDATE ON dispute_records
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER land_parcels_prepare_geometry
BEFORE INSERT OR UPDATE OF boundary ON land_parcels
FOR EACH ROW
EXECUTE FUNCTION prepare_parcel_geometry();

CREATE TRIGGER land_parcel_versions_prepare_geometry
BEFORE INSERT OR UPDATE OF boundary ON land_parcel_versions
FOR EACH ROW
EXECUTE FUNCTION prepare_parcel_geometry();
