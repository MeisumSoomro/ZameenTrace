const { pool } = require('../utils/db');

async function getMarketTrendsHandler(req, res, next) {
  const { region, range = '7d' } = req.query;

  try {
    // Aggregate parcel counts by province/district to surface activity trends
    const result = await pool.query(
      `SELECT
         province,
         district,
         COUNT(*) AS parcel_count,
         COUNT(*) FILTER (WHERE status = 'verified') AS verified_count,
         COUNT(*) FILTER (WHERE status = 'pending_verification') AS pending_count,
         AVG(area_sqm) AS avg_area_sqm,
         MAX(updated_at) AS last_activity
       FROM land_parcels
       ${region ? 'WHERE province ILIKE $1 OR district ILIKE $1' : ''}
       GROUP BY province, district
       ORDER BY parcel_count DESC
       LIMIT 20`,
      region ? [`%${region}%`] : []
    );

    const trends = result.rows.map((row) => ({
      province: row.province,
      district: row.district,
      parcelCount: Number(row.parcel_count),
      verifiedCount: Number(row.verified_count),
      pendingCount: Number(row.pending_count),
      avgAreaSqm: row.avg_area_sqm ? Number(row.avg_area_sqm).toFixed(2) : null,
      lastActivity: row.last_activity,
      verificationRate: row.parcel_count > 0
        ? ((row.verified_count / row.parcel_count) * 100).toFixed(1) + '%'
        : '0%',
    }));

    res.json({ region: region || null, range, trends });
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === '3D000') {
      return res.json({ region: region || null, range, trends: [], _source: 'stub' });
    }
    next(error);
  }
}

async function getComparablesHandler(req, res, next) {
  const { parcelId } = req.params;
  const radiusMeters = Number(req.query.radius || 5000);

  try {
    // Find the centroid of the target parcel
    const targetResult = await pool.query(
      `SELECT id, ST_AsGeoJSON(centroid) AS centroid
       FROM land_parcels WHERE parcel_id = $1`,
      [parcelId]
    );

    if (targetResult.rowCount === 0) {
      return res.json({ parcelId, comparables: [] });
    }

    const target = targetResult.rows[0];

    // Find nearby parcels using ST_DWithin
    const comparablesResult = await pool.query(
      `SELECT
         lp.parcel_id,
         lp.owner_name_snapshot AS owner_name,
         lp.district,
         lp.village,
         lp.status,
         lp.area_sqm,
         ST_Distance(lp.centroid::geography, ref.centroid::geography) AS distance_meters
       FROM land_parcels lp
       JOIN land_parcels ref ON ref.parcel_id = $1
       WHERE lp.parcel_id != $1
         AND lp.centroid IS NOT NULL
         AND ref.centroid IS NOT NULL
         AND ST_DWithin(lp.centroid::geography, ref.centroid::geography, $2)
       ORDER BY distance_meters ASC
       LIMIT 10`,
      [parcelId, radiusMeters]
    );

    res.json({
      parcelId,
      comparables: comparablesResult.rows.map((row) => ({
        parcelId: row.parcel_id,
        ownerName: row.owner_name,
        district: row.district,
        village: row.village,
        status: row.status,
        areaSqm: row.area_sqm ? Number(row.area_sqm) : null,
        distanceMeters: row.distance_meters ? Number(row.distance_meters).toFixed(0) : null,
      })),
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === '3D000') {
      return res.json({ parcelId, comparables: [], _source: 'stub' });
    }
    next(error);
  }
}

module.exports = { getMarketTrendsHandler, getComparablesHandler };
