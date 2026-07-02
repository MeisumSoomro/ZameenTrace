const { pool } = require('../utils/db');

async function getDashboardStatsHandler(req, res, next) {
  try {
    // Query real stats from the DB; fall back to zeros if DB is unavailable
    const [parcelsResult, verificationsResult, disputesResult] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM land_parcels`),
      pool.query(`SELECT COUNT(*) AS total FROM land_parcels WHERE status = 'verified'`),
      pool.query(`SELECT COUNT(*) AS total FROM dispute_records WHERE status = 'open'`),
    ]);

    res.json({
      propertiesTracked: Number(parcelsResult.rows[0]?.total || 0),
      verificationsComplete: Number(verificationsResult.rows[0]?.total || 0),
      alertsActive: Number(disputesResult.rows[0]?.total || 0),
      portfolioValue: null, // Requires valuation model — placeholder
    });
  } catch (error) {
    // If DB is not connected, return stub data so the frontend still renders
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === '3D000') {
      return res.json({
        propertiesTracked: 0,
        verificationsComplete: 0,
        alertsActive: 0,
        portfolioValue: null,
        _source: 'stub',
      });
    }
    next(error);
  }
}

async function getAlertsHandler(req, res, next) {
  const limit = Math.min(Number(req.query.limit || 10), 50);

  try {
    // Pull recent open disputes as alerts
    const disputesResult = await pool.query(
      `SELECT
         d.id,
         d.title,
         d.dispute_category,
         d.status,
         d.created_at,
         lp.parcel_id
       FROM dispute_records d
       JOIN land_parcels lp ON lp.id = d.parcel_id
       WHERE d.status = 'open'
       ORDER BY d.created_at DESC
       LIMIT $1`,
      [limit]
    );

    // Pull pending verification approvals as info alerts
    const pendingResult = await pool.query(
      `SELECT
         lp.parcel_id,
         lp.district,
         lp.updated_at
       FROM land_parcels lp
       WHERE lp.status = 'pending_verification'
       ORDER BY lp.updated_at DESC
       LIMIT $1`,
      [limit]
    );

    const alerts = [
      ...disputesResult.rows.map((row) => ({
        id: row.id,
        type: 'error',
        title: `Dispute: ${row.dispute_category}`,
        message: row.title,
        parcelId: row.parcel_id,
        time: row.created_at,
      })),
      ...pendingResult.rows.map((row) => ({
        id: `pending-${row.parcel_id}`,
        type: 'warning',
        title: 'Pending Verification',
        message: `Parcel ${row.parcel_id} in ${row.district} awaiting verification`,
        parcelId: row.parcel_id,
        time: row.updated_at,
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, limit);

    res.json({ alerts, limit });
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === '3D000') {
      return res.json({ alerts: [], limit, _source: 'stub' });
    }
    next(error);
  }
}

module.exports = { getDashboardStatsHandler, getAlertsHandler };
