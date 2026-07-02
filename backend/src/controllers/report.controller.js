const {
  getParcelByIdentifier,
} = require('../services/parcel.service');

async function generateReportHandler(req, res, next) {
  const { parcelId } = req.params;

  try {
    const { parcel, versions, approvals, disputes } = await getParcelByIdentifier(parcelId);

    const currentVersion = versions[0] || null;

    // Determine risk level based on disputes
    const openDisputes = disputes.filter((d) => d.status === 'open').length;
    const riskLevel = openDisputes > 0 ? 'high' : parcel.status === 'verified' ? 'low' : 'medium';

    const report = {
      parcelId: parcel.parcelId,
      generatedAt: new Date().toISOString(),
      status: parcel.status,
      summary: `Land Intelligence Report for parcel ${parcel.parcelId} in ${parcel.district}, ${parcel.province}.`,
      parcel: {
        id: parcel.parcelId,
        ownerName: parcel.ownerName,
        ownerPhone: parcel.ownerPhone,
        province: parcel.province,
        district: parcel.district,
        tehsil: parcel.tehsil,
        village: parcel.village,
        areaSqm: parcel.areaSqm,
        status: parcel.status,
        centroid: parcel.centroid,
        boundary: parcel.boundary,
        createdAt: parcel.createdAt,
        updatedAt: parcel.updatedAt,
      },
      sections: {
        ownership: versions.map((v) => ({
          version: v.versionNumber,
          changeType: v.changeType,
          ownerName: v.ownerName,
          changeReason: v.changeReason,
          changedAt: v.createdAt,
        })),
        verification: {
          approvals: approvals.map((a) => ({
            approverUserId: a.approverUserId,
            relationship: a.relationshipToParcel,
            status: a.status,
            comments: a.comments,
            approvedAt: a.approvedAt,
          })),
          totalApprovals: approvals.length,
          approved: approvals.filter((a) => a.status === 'approved').length,
          rejected: approvals.filter((a) => a.status === 'rejected').length,
        },
        disputes: disputes.map((d) => ({
          category: d.disputeCategory,
          title: d.title,
          description: d.description,
          status: d.status,
          createdAt: d.createdAt,
        })),
        risk: {
          level: riskLevel,
          openDisputes,
          factors: [
            openDisputes > 0 && `${openDisputes} open dispute(s)`,
            parcel.status === 'pending_verification' && 'Pending verification',
            parcel.status === 'draft' && 'No verifications submitted',
          ].filter(Boolean),
        },
        currentVersion: currentVersion
          ? {
              versionNumber: currentVersion.versionNumber,
              changeType: currentVersion.changeType,
              areaSqm: currentVersion.areaSqm,
              createdAt: currentVersion.createdAt,
            }
          : null,
      },
    };

    res.json(report);
  } catch (error) {
    // If parcel not found or DB unavailable, return a graceful stub
    if (error.statusCode === 404) {
      return next(error);
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === '3D000') {
      return res.json({
        parcelId,
        generatedAt: new Date().toISOString(),
        status: 'unavailable',
        summary: 'Database unavailable. Please ensure the database is running.',
        sections: { ownership: [], verification: { approvals: [], totalApprovals: 0, approved: 0, rejected: 0 }, disputes: [], risk: { level: 'unknown', factors: [] } },
        _source: 'stub',
      });
    }
    next(error);
  }
}

async function getReportHistoryHandler(req, res, next) {
  const { parcelId } = req.params;

  try {
    const { versions } = await getParcelByIdentifier(parcelId);
    res.json({
      parcelId,
      reports: versions.map((v) => ({
        versionNumber: v.versionNumber,
        changeType: v.changeType,
        changeReason: v.changeReason,
        createdAt: v.createdAt,
      })),
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return next(error);
    }
    next(error);
  }
}

module.exports = { generateReportHandler, getReportHistoryHandler };
