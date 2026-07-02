// backend/src/services/parcel.service.js
// Core business logic for the parcel workflow — the most important file in the backend.
// Handles: creation, detail lookup, boundary updates (versioning), and verification.
// All database operations use transactions where multiple writes are needed.
// PostGIS functions (ST_GeomFromGeoJSON, ST_AsGeoJSON, ST_Area, ST_Centroid) handle
// geometry storage and computation — the database triggers auto-calculate area and centroid.

const { pool } = require('../utils/db');

// ---------------------------------------------------------------------------
// Error helpers — create structured errors with HTTP status codes.
// These are caught by the Express error middleware and returned as JSON.
// ---------------------------------------------------------------------------

function createBadRequestError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function createNotFoundError(message) {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

// ---------------------------------------------------------------------------
// Geometry helpers — validate and format GeoJSON for PostGIS storage.
// ---------------------------------------------------------------------------

/**
 * Validate and normalize parcel boundary coordinates before they are stored.
 * GeoJSON Polygon rules:
 *   - At least 4 coordinate pairs (3 unique points + closing point).
 *   - Each pair is [longitude, latitude] with numeric values.
 *   - The polygon must be closed (first point === last point).
 */
function buildPolygonGeoJson(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 4) {
    throw createBadRequestError(
      'Parcel boundary must contain at least four coordinate pairs including the closing point.'
    );
  }

  // Normalize each point to ensure clean numeric values.
  const normalized = coordinates.map((point) => {
    if (!Array.isArray(point) || point.length !== 2) {
      throw createBadRequestError(
        'Each coordinate must be a [longitude, latitude] pair.'
      );
    }

    const longitude = Number(point[0]);
    const latitude = Number(point[1]);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      throw createBadRequestError(
        'Boundary coordinates must be numeric longitude and latitude values.'
      );
    }

    return [longitude, latitude];
  });

  // GeoJSON polygons must be closed — the first and last point must match.
  const firstPoint = normalized[0];
  const lastPoint = normalized[normalized.length - 1];

  if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
    throw createBadRequestError(
      'Parcel boundary must be closed by repeating the first coordinate as the last coordinate.'
    );
  }

  return {
    type: 'Polygon',
    coordinates: [normalized],
  };
}

// ---------------------------------------------------------------------------
// Row mappers — transform raw PostgreSQL rows into clean API response objects.
// These ensure consistent property names (camelCase) for the frontend.
// ---------------------------------------------------------------------------

/** Map a land_parcels row to an API-friendly object. */
function mapParcelRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    parcelId: row.parcel_id,
    ownerUserId: row.owner_user_id,
    ownerName: row.owner_name_snapshot,
    ownerPhone: row.owner_phone_snapshot,
    ownerNationalId: row.owner_national_id_snapshot,
    province: row.province,
    district: row.district,
    tehsil: row.tehsil,
    village: row.village,
    status: row.status,
    areaSqm: row.area_sqm ? Number(row.area_sqm) : 0,
    centroid: row.centroid ? JSON.parse(row.centroid) : null,
    boundary: row.boundary ? JSON.parse(row.boundary) : null,
    currentVersionId: row.current_version_id,
    metadata: row.metadata || {},
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Map a land_parcel_versions row to an API-friendly object. */
function mapVersionRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    parcelId: row.parcel_id,
    versionNumber: row.version_number,
    changeType: row.change_type,
    ownerUserId: row.owner_user_id,
    ownerName: row.owner_name_snapshot,
    ownerPhone: row.owner_phone_snapshot,
    ownerNationalId: row.owner_national_id_snapshot,
    areaSqm: row.area_sqm ? Number(row.area_sqm) : 0,
    centroid: row.centroid ? JSON.parse(row.centroid) : null,
    boundary: row.boundary ? JSON.parse(row.boundary) : null,
    changedByUserId: row.changed_by_user_id,
    changeReason: row.change_reason,
    metadata: row.metadata || {},
    createdAt: row.created_at,
  };
}

/** Map a verification_approvals row to an API-friendly object. */
function mapApprovalRow(row) {
  return {
    id: row.id,
    parcelId: row.parcel_id,
    parcelVersionId: row.parcel_version_id,
    approverUserId: row.approver_user_id,
    relationshipToParcel: row.relationship_to_parcel,
    status: row.status,
    comments: row.comments,
    approvedAt: row.approved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Map a dispute_records row to an API-friendly object. */
function mapDisputeRow(row) {
  return {
    id: row.id,
    parcelId: row.parcel_id,
    parcelVersionId: row.parcel_version_id,
    raisedByUserId: row.raised_by_user_id,
    disputeCategory: row.dispute_category,
    title: row.title,
    description: row.description,
    status: row.status,
    resolvedByUserId: row.resolved_by_user_id,
    resolutionNotes: row.resolution_notes,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Status recalculation — derives parcel status from its verification approvals.
// ---------------------------------------------------------------------------

/**
 * Recalculate the parcel's status based on all approvals for the current version.
 * Status rules:
 *   - Any rejection → 'disputed'
 *   - All approved → 'verified'
 *   - Some approvals but not all → 'pending_verification'
 *   - No approvals → 'draft'
 * This function runs inside a transaction so it sees a consistent snapshot.
 */
async function recalculateParcelStatus(client, parcelDbId, currentVersionId) {
  const approvalsResult = await client.query(
    `
      SELECT status
      FROM verification_approvals
      WHERE parcel_id = $1 AND parcel_version_id = $2
    `,
    [parcelDbId, currentVersionId]
  );

  const statuses = approvalsResult.rows.map((row) => row.status);

  // Default to draft if no approvals exist.
  let parcelStatus = 'draft';

  if (statuses.includes('rejected')) {
    // Any rejection makes the parcel disputed — this is a conservative approach.
    parcelStatus = 'disputed';
  } else if (
    statuses.length > 0 &&
    statuses.every((status) => status === 'approved')
  ) {
    // All approvals are positive — the parcel is verified.
    parcelStatus = 'verified';
  } else if (statuses.length > 0) {
    // Some approvals exist but not all are 'approved' — still pending.
    parcelStatus = 'pending_verification';
  }

  // Update the parcel row and return the updated record.
  const result = await client.query(
    `
      UPDATE land_parcels
      SET status = $2
      WHERE id = $1
      RETURNING
        id,
        parcel_id,
        owner_user_id,
        owner_name_snapshot,
        owner_phone_snapshot,
        owner_national_id_snapshot,
        province,
        district,
        tehsil,
        village,
        ST_AsGeoJSON(boundary) AS boundary,
        area_sqm,
        ST_AsGeoJSON(centroid) AS centroid,
        status,
        current_version_id,
        metadata,
        created_by_user_id,
        created_at,
        updated_at
    `,
    [parcelDbId, parcelStatus]
  );

  return mapParcelRow(result.rows[0]);
}

// ---------------------------------------------------------------------------
// CRUD operations — the main parcel workflow functions.
// ---------------------------------------------------------------------------

/**
 * CREATE PARCEL
 * Persist a new parcel and its initial version (version_number = 1).
 * This is a transactional operation:
 *   1. Insert into land_parcels
 *   2. Insert version 1 into land_parcel_versions
 *   3. Link the parcel to its initial version via current_version_id
 * The database triggers auto-calculate area_sqm and centroid from the boundary.
 */
async function createParcel(payload) {
  const {
    parcelId,
    ownerUserId = null,
    ownerName,
    ownerPhone = null,
    ownerNationalId = null,
    province,
    district,
    tehsil = null,
    village = null,
    coordinates,
    createdByUserId = null,
    metadata = {},
  } = payload;

  // Validate required fields — these are the minimum for a meaningful parcel record.
  if (!parcelId || !ownerName || !province || !district) {
    throw createBadRequestError(
      'parcelId, ownerName, province, and district are required.'
    );
  }

  const polygonGeoJson = buildPolygonGeoJson(coordinates);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Step 1: Insert the parcel record with its boundary geometry.
    const parcelInsert = await client.query(
      `
        INSERT INTO land_parcels (
          parcel_id,
          owner_user_id,
          owner_name_snapshot,
          owner_phone_snapshot,
          owner_national_id_snapshot,
          province,
          district,
          tehsil,
          village,
          boundary,
          created_by_user_id,
          metadata
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9,
          ST_SetSRID(ST_GeomFromGeoJSON($10), 4326),
          $11, $12::jsonb
        )
        RETURNING
          id,
          parcel_id,
          owner_user_id,
          owner_name_snapshot,
          owner_phone_snapshot,
          owner_national_id_snapshot,
          province,
          district,
          tehsil,
          village,
          ST_AsGeoJSON(boundary) AS boundary,
          area_sqm,
          ST_AsGeoJSON(centroid) AS centroid,
          status,
          current_version_id,
          metadata,
          created_by_user_id,
          created_at,
          updated_at
      `,
      [
        parcelId,
        ownerUserId,
        ownerName,
        ownerPhone,
        ownerNationalId,
        province,
        district,
        tehsil,
        village,
        JSON.stringify(polygonGeoJson),
        createdByUserId,
        JSON.stringify(metadata),
      ]
    );

    const parcelRow = parcelInsert.rows[0];

    // Step 2: Create version 1 — the initial state of this parcel.
    const versionInsert = await client.query(
      `
        INSERT INTO land_parcel_versions (
          parcel_id,
          version_number,
          change_type,
          owner_user_id,
          owner_name_snapshot,
          owner_phone_snapshot,
          owner_national_id_snapshot,
          boundary,
          changed_by_user_id,
          change_reason,
          metadata
        )
        VALUES (
          $1, 1, 'created',
          $2, $3, $4, $5,
          ST_SetSRID(ST_GeomFromGeoJSON($6), 4326),
          $7, $8, $9::jsonb
        )
        RETURNING
          id,
          parcel_id,
          version_number,
          change_type,
          owner_user_id,
          owner_name_snapshot,
          owner_phone_snapshot,
          owner_national_id_snapshot,
          ST_AsGeoJSON(boundary) AS boundary,
          area_sqm,
          ST_AsGeoJSON(centroid) AS centroid,
          changed_by_user_id,
          change_reason,
          metadata,
          created_at
      `,
      [
        parcelRow.id,
        ownerUserId,
        ownerName,
        ownerPhone,
        ownerNationalId,
        JSON.stringify(polygonGeoJson),
        createdByUserId,
        'Initial parcel creation',
        JSON.stringify(metadata),
      ]
    );

    const versionRow = versionInsert.rows[0];

    // Step 3: Link the parcel to its initial version.
    const parcelUpdate = await client.query(
      `
        UPDATE land_parcels
        SET current_version_id = $2
        WHERE id = $1
        RETURNING
          id,
          parcel_id,
          owner_user_id,
          owner_name_snapshot,
          owner_phone_snapshot,
          owner_national_id_snapshot,
          province,
          district,
          tehsil,
          village,
          ST_AsGeoJSON(boundary) AS boundary,
          area_sqm,
          ST_AsGeoJSON(centroid) AS centroid,
          status,
          current_version_id,
          metadata,
          created_by_user_id,
          created_at,
          updated_at
      `,
      [parcelRow.id, versionRow.id]
    );

    await client.query('COMMIT');

    return {
      parcel: mapParcelRow(parcelUpdate.rows[0]),
      currentVersion: mapVersionRow(versionRow),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * GET PARCEL BY IDENTIFIER
 * Fetch a single parcel with its complete version history, approvals, and disputes.
 * The UI detail panel shows all of this information for a selected parcel.
 * Uses parallel queries for versions, approvals, and disputes to minimize latency.
 */
async function getParcelByIdentifier(parcelIdentifier) {
  // Look up the parcel by its human-readable parcel_id (e.g. 'ZT-PK-SND-0421').
  const parcelResult = await pool.query(
    `
      SELECT
        lp.id,
        lp.parcel_id,
        lp.owner_user_id,
        lp.owner_name_snapshot,
        lp.owner_phone_snapshot,
        lp.owner_national_id_snapshot,
        lp.province,
        lp.district,
        lp.tehsil,
        lp.village,
        ST_AsGeoJSON(lp.boundary) AS boundary,
        lp.area_sqm,
        ST_AsGeoJSON(lp.centroid) AS centroid,
        lp.status,
        lp.current_version_id,
        lp.metadata,
        lp.created_by_user_id,
        lp.created_at,
        lp.updated_at
      FROM land_parcels lp
      WHERE lp.parcel_id = $1
    `,
    [parcelIdentifier]
  );

  if (parcelResult.rowCount === 0) {
    throw createNotFoundError('Parcel not found.');
  }

  const parcel = mapParcelRow(parcelResult.rows[0]);

  // Fetch related data in parallel — versions, approvals, and disputes.
  const [versionResult, approvalsResult, disputesResult] = await Promise.all([
    pool.query(
      `
        SELECT
          id,
          parcel_id,
          version_number,
          change_type,
          owner_user_id,
          owner_name_snapshot,
          owner_phone_snapshot,
          owner_national_id_snapshot,
          ST_AsGeoJSON(boundary) AS boundary,
          area_sqm,
          ST_AsGeoJSON(centroid) AS centroid,
          changed_by_user_id,
          change_reason,
          metadata,
          created_at
        FROM land_parcel_versions
        WHERE parcel_id = $1
        ORDER BY version_number DESC
      `,
      [parcel.id]
    ),
    pool.query(
      `
        SELECT
          id,
          parcel_id,
          parcel_version_id,
          approver_user_id,
          relationship_to_parcel,
          status,
          comments,
          approved_at,
          created_at,
          updated_at
        FROM verification_approvals
        WHERE parcel_id = $1
        ORDER BY created_at DESC
      `,
      [parcel.id]
    ),
    pool.query(
      `
        SELECT
          id,
          parcel_id,
          parcel_version_id,
          raised_by_user_id,
          dispute_category,
          title,
          description,
          status,
          resolved_by_user_id,
          resolution_notes,
          resolved_at,
          created_at,
          updated_at
        FROM dispute_records
        WHERE parcel_id = $1
        ORDER BY created_at DESC
      `,
      [parcel.id]
    ),
  ]);

  return {
    parcel,
    versions: versionResult.rows.map(mapVersionRow),
    approvals: approvalsResult.rows.map(mapApprovalRow),
    disputes: disputesResult.rows.map(mapDisputeRow),
  };
}

/**
 * UPDATE PARCEL BOUNDARY
 * Create a new version when a parcel boundary changes while keeping the prior state intact.
 * This is the core of the version history feature — every boundary change is recorded.
 *
 * Transaction steps:
 *   1. Look up the parcel (with row lock via FOR UPDATE)
 *   2. Determine the next version number
 *   3. Insert a new version record
 *   4. Update the parcel's boundary, owner info, and current_version_id
 *   5. Remove stale approvals from old versions (they don't apply to the new boundary)
 *
 * ownerName and coordinates are optional — if not provided, the existing values are preserved.
 */
async function updateParcelBoundary(parcelIdentifier, payload) {
  const {
    coordinates = null,
    ownerUserId = null,
    ownerName = null,
    ownerPhone = null,
    ownerNationalId = null,
    changedByUserId = null,
    changeReason = 'Boundary updated',
    metadata = {},
  } = payload;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock the parcel row to prevent concurrent updates from creating version conflicts.
    const parcelLookup = await client.query(
      `
        SELECT id, parcel_id, owner_name_snapshot, owner_phone_snapshot,
               owner_national_id_snapshot, owner_user_id,
               ST_AsGeoJSON(boundary) AS boundary, metadata
        FROM land_parcels
        WHERE parcel_id = $1
        FOR UPDATE
      `,
      [parcelIdentifier]
    );

    if (parcelLookup.rowCount === 0) {
      throw createNotFoundError('Parcel not found.');
    }

    const existingParcel = parcelLookup.rows[0];
    const parcelDbId = existingParcel.id;

    // Use provided values or fall back to existing parcel data.
    const effectiveOwnerName = ownerName || existingParcel.owner_name_snapshot;
    const effectiveOwnerPhone = ownerPhone || existingParcel.owner_phone_snapshot;
    const effectiveOwnerNationalId = ownerNationalId || existingParcel.owner_national_id_snapshot;
    const effectiveOwnerUserId = ownerUserId || existingParcel.owner_user_id;

    // If new coordinates are provided, validate them. Otherwise reuse the existing boundary.
    let polygonGeoJsonStr;
    if (coordinates && Array.isArray(coordinates) && coordinates.length >= 4) {
      const polygonGeoJson = buildPolygonGeoJson(coordinates);
      polygonGeoJsonStr = JSON.stringify(polygonGeoJson);
    } else {
      // Reuse existing boundary — the parcel lookup already has it as GeoJSON.
      polygonGeoJsonStr = existingParcel.boundary;
    }

    // Determine the next version number by checking the max existing version.
    const versionLookup = await client.query(
      `
        SELECT COALESCE(MAX(version_number), 0) AS max_version
        FROM land_parcel_versions
        WHERE parcel_id = $1
      `,
      [parcelDbId]
    );

    const nextVersion = Number(versionLookup.rows[0].max_version) + 1;

    // Insert the new version record with the updated boundary.
    const versionInsert = await client.query(
      `
        INSERT INTO land_parcel_versions (
          parcel_id,
          version_number,
          change_type,
          owner_user_id,
          owner_name_snapshot,
          owner_phone_snapshot,
          owner_national_id_snapshot,
          boundary,
          changed_by_user_id,
          change_reason,
          metadata
        )
        VALUES (
          $1, $2, 'boundary_updated',
          $3, $4, $5, $6,
          ST_SetSRID(ST_GeomFromGeoJSON($7), 4326),
          $8, $9, $10::jsonb
        )
        RETURNING
          id,
          parcel_id,
          version_number,
          change_type,
          owner_user_id,
          owner_name_snapshot,
          owner_phone_snapshot,
          owner_national_id_snapshot,
          ST_AsGeoJSON(boundary) AS boundary,
          area_sqm,
          ST_AsGeoJSON(centroid) AS centroid,
          changed_by_user_id,
          change_reason,
          metadata,
          created_at
      `,
      [
        parcelDbId,
        nextVersion,
        effectiveOwnerUserId,
        effectiveOwnerName,
        effectiveOwnerPhone,
        effectiveOwnerNationalId,
        polygonGeoJsonStr,
        changedByUserId,
        changeReason,
        JSON.stringify(metadata),
      ]
    );

    const currentVersion = versionInsert.rows[0];

    // Update the parcel's current state to match the new version.
    const parcelUpdate = await client.query(
      `
        UPDATE land_parcels
        SET
          owner_user_id = $2,
          owner_name_snapshot = $3,
          owner_phone_snapshot = $4,
          owner_national_id_snapshot = $5,
          boundary = ST_SetSRID(ST_GeomFromGeoJSON($6), 4326),
          metadata = $7::jsonb,
          current_version_id = $8,
          status = 'pending_verification'
        WHERE id = $1
        RETURNING
          id,
          parcel_id,
          owner_user_id,
          owner_name_snapshot,
          owner_phone_snapshot,
          owner_national_id_snapshot,
          province,
          district,
          tehsil,
          village,
          ST_AsGeoJSON(boundary) AS boundary,
          area_sqm,
          ST_AsGeoJSON(centroid) AS centroid,
          status,
          current_version_id,
          metadata,
          created_by_user_id,
          created_at,
          updated_at
      `,
      [
        parcelDbId,
        effectiveOwnerUserId,
        effectiveOwnerName,
        effectiveOwnerPhone,
        effectiveOwnerNationalId,
        polygonGeoJsonStr,
        JSON.stringify(metadata),
        currentVersion.id,
      ]
    );

    // Remove approvals from old versions — they don't apply to the new boundary.
    await client.query(
      `
        DELETE FROM verification_approvals
        WHERE parcel_id = $1 AND parcel_version_id <> $2
      `,
      [parcelDbId, currentVersion.id]
    );

    await client.query('COMMIT');

    return {
      parcel: mapParcelRow(parcelUpdate.rows[0]),
      currentVersion: mapVersionRow(currentVersion),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * VERIFY PARCEL
 * Record a verification decision from a neighbor, operator, or stakeholder.
 * Uses UPSERT so the same approver can change their decision on the same version.
 *
 * After recording the approval, the parcel's status is recalculated based on
 * all current approvals for the active version.
 */
async function verifyParcel(parcelIdentifier, payload) {
  const {
    approverUserId,
    relationshipToParcel = 'neighbor',
    status,
    comments = null,
  } = payload;

  // Both fields are required — the system needs to know who approved and what they decided.
  if (!approverUserId || !status) {
    throw createBadRequestError('approverUserId and status are required.');
  }

  const allowedStatuses = ['pending', 'approved', 'rejected', 'withdrawn'];
  if (!allowedStatuses.includes(status)) {
    throw createBadRequestError(
      `status must be one of: ${allowedStatuses.join(', ')}.`
    );
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Look up the parcel and lock it for the duration of this transaction.
    const parcelLookup = await client.query(
      `
        SELECT id, current_version_id
        FROM land_parcels
        WHERE parcel_id = $1
        FOR UPDATE
      `,
      [parcelIdentifier]
    );

    if (parcelLookup.rowCount === 0) {
      throw createNotFoundError('Parcel not found.');
    }

    const parcelDbId = parcelLookup.rows[0].id;
    const currentVersionId = parcelLookup.rows[0].current_version_id;

    // A parcel must have an active version before it can be verified.
    if (!currentVersionId) {
      throw createBadRequestError(
        'Parcel does not have an active version available for verification.'
      );
    }

    // UPSERT: insert a new approval or update an existing one for the same approver+version.
    // This prevents duplicate approvals and allows users to change their decision.
    const approvalResult = await client.query(
      `
        INSERT INTO verification_approvals (
          parcel_id,
          parcel_version_id,
          approver_user_id,
          relationship_to_parcel,
          status,
          comments,
          approved_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $5 = 'approved' THEN NOW() ELSE NULL END)
        ON CONFLICT (parcel_version_id, approver_user_id)
        DO UPDATE SET
          relationship_to_parcel = EXCLUDED.relationship_to_parcel,
          status = EXCLUDED.status,
          comments = EXCLUDED.comments,
          approved_at = CASE WHEN EXCLUDED.status = 'approved' THEN NOW() ELSE NULL END
        RETURNING
          id,
          parcel_id,
          parcel_version_id,
          approver_user_id,
          relationship_to_parcel,
          status,
          comments,
          approved_at,
          created_at,
          updated_at
      `,
      [
        parcelDbId,
        currentVersionId,
        approverUserId,
        relationshipToParcel,
        status,
        comments,
      ]
    );

    // Recalculate parcel status from all approvals — this is the source of truth.
    const parcel = await recalculateParcelStatus(
      client,
      parcelDbId,
      currentVersionId
    );

    await client.query('COMMIT');

    return {
      parcel,
      approval: mapApprovalRow(approvalResult.rows[0]),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * LIST PARCELS BY REGION
 * Query parcels by province, district, tehsil, village, or free-text search.
 * At least one filter is required to avoid returning the entire table.
 * The frontend filter toolbar sends these parameters on every filter change.
 */
async function listParcelsByRegion(filters) {
  const { province, district, tehsil, village, q } = filters;

  if (!province && !district && !tehsil && !village && !q) {
    throw createBadRequestError(
      'At least one regional filter or q search term is required.'
    );
  }

  // Build the WHERE clause dynamically based on provided filters.
  const conditions = [];
  const values = [];

  [
    ['province', province],
    ['district', district],
    ['tehsil', tehsil],
    ['village', village],
  ].forEach(([column, value]) => {
    if (value) {
      values.push(value);
      conditions.push(`${column} = $${values.length}`);
    }
  });

  // Free-text search across multiple columns using ILIKE for case-insensitive matching.
  if (q) {
    values.push(`%${q}%`);
    conditions.push(`(
      parcel_id ILIKE $${values.length}
      OR owner_name_snapshot ILIKE $${values.length}
      OR province ILIKE $${values.length}
      OR district ILIKE $${values.length}
      OR tehsil ILIKE $${values.length}
      OR village ILIKE $${values.length}
    )`);
  }

  const query = `
    SELECT
      id,
      parcel_id,
      owner_user_id,
      owner_name_snapshot,
      owner_phone_snapshot,
      owner_national_id_snapshot,
      province,
      district,
      tehsil,
      village,
      ST_AsGeoJSON(boundary) AS boundary,
      area_sqm,
      ST_AsGeoJSON(centroid) AS centroid,
      status,
      current_version_id,
      metadata,
      created_by_user_id,
      created_at,
      updated_at
    FROM land_parcels
    WHERE ${conditions.join(' AND ')}
    ORDER BY updated_at DESC
  `;

  const result = await pool.query(query, values);

  return {
    region: { province, district, tehsil, village },
    query: q || null,
    count: result.rowCount,
    parcels: result.rows.map(mapParcelRow),
  };
}

module.exports = {
  createParcel,
  getParcelByIdentifier,
  updateParcelBoundary,
  verifyParcel,
  listParcelsByRegion,
};
