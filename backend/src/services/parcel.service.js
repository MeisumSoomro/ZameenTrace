const { pool } = require('../utils/db');

function buildPolygonGeoJson(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 4) {
    throw createBadRequestError(
      'Parcel boundary must contain at least four coordinate pairs including the closing point.'
    );
  }

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

  let parcelStatus = 'draft';

  if (statuses.includes('rejected')) {
    parcelStatus = 'disputed';
  } else if (
    statuses.length > 0 &&
    statuses.every((status) => status === 'approved')
  ) {
    parcelStatus = 'verified';
  } else if (statuses.length > 0) {
    parcelStatus = 'pending_verification';
  }

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

  if (!parcelId || !ownerName || !province || !district) {
    throw createBadRequestError(
      'parcelId, ownerName, province, and district are required.'
    );
  }

  const polygonGeoJson = buildPolygonGeoJson(coordinates);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

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

async function getParcelByIdentifier(parcelIdentifier) {
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

async function updateParcelBoundary(parcelIdentifier, payload) {
  const {
    coordinates,
    ownerUserId = null,
    ownerName,
    ownerPhone = null,
    ownerNationalId = null,
    changedByUserId = null,
    changeReason = 'Boundary updated',
    metadata = {},
  } = payload;

  if (!ownerName) {
    throw createBadRequestError(
      'ownerName is required when creating a new parcel version.'
    );
  }

  const polygonGeoJson = buildPolygonGeoJson(coordinates);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const parcelLookup = await client.query(
      `
        SELECT id, parcel_id, metadata
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

    const versionLookup = await client.query(
      `
        SELECT COALESCE(MAX(version_number), 0) AS max_version
        FROM land_parcel_versions
        WHERE parcel_id = $1
      `,
      [parcelDbId]
    );

    const nextVersion = Number(versionLookup.rows[0].max_version) + 1;

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
        ownerUserId,
        ownerName,
        ownerPhone,
        ownerNationalId,
        JSON.stringify(polygonGeoJson),
        changedByUserId,
        changeReason,
        JSON.stringify(metadata),
      ]
    );

    const currentVersion = versionInsert.rows[0];

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
        ownerUserId,
        ownerName,
        ownerPhone,
        ownerNationalId,
        JSON.stringify(polygonGeoJson),
        JSON.stringify(metadata),
        currentVersion.id,
      ]
    );

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

async function verifyParcel(parcelIdentifier, payload) {
  const {
    approverUserId,
    relationshipToParcel = 'neighbor',
    status,
    comments = null,
  } = payload;

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

    if (!currentVersionId) {
      throw createBadRequestError(
        'Parcel does not have an active version available for verification.'
      );
    }

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

async function listParcelsByRegion(filters) {
  const { province, district, tehsil, village } = filters;

  if (!province && !district && !tehsil && !village) {
    throw createBadRequestError(
      'At least one regional filter is required: province, district, tehsil, or village.'
    );
  }

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
