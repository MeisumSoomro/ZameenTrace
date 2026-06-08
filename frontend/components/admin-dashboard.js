'use client';

import { useMemo, useState } from 'react';

import { fallbackParcels } from '@/lib/api';

const disputeQueue = [
  {
    id: 'DSP-001',
    parcelId: 'ZT-PK-SND-0422',
    district: 'Tando Allahyar',
    category: 'Boundary overlap',
    status: 'under_review',
  },
  {
    id: 'DSP-002',
    parcelId: 'ZT-PK-SND-0423',
    district: 'Hyderabad',
    category: 'Neighbor objection',
    status: 'open',
  },
];

const approvalFeed = [
  {
    id: 'APR-001',
    parcelId: 'ZT-PK-SND-0421',
    actor: 'Neighbor - Mir Wah',
    state: 'approved',
  },
  {
    id: 'APR-002',
    parcelId: 'ZT-PK-SND-0422',
    actor: 'Operator - Sindh South',
    state: 'pending',
  },
  {
    id: 'APR-003',
    parcelId: 'ZT-PK-SND-0423',
    actor: 'Neighbor - Nasarpur Road',
    state: 'rejected',
  },
];

export function AdminDashboard() {
  const [activeDisputeId, setActiveDisputeId] = useState(
    disputeQueue[0]?.id ?? null
  );
  const activeDispute = useMemo(
    () =>
      disputeQueue.find((item) => item.id === activeDisputeId) ||
      disputeQueue[0],
    [activeDisputeId]
  );

  return (
    <main className="app-shell admin-shell">
      <section className="hero">
        <div className="hero-copy-block">
          <p className="eyebrow">Operator Console</p>
          <h1>Review parcels, disputes, and verification flow.</h1>
          <p className="copy">
            A single dashboard for registry operators and government teams to
            monitor mapped land, resolve issues, and keep the trust layer
            moving.
          </p>
        </div>

        <div className="hero-summary">
          <div className="summary-card">
            <span>Total mapped parcels</span>
            <strong>{fallbackParcels.length}</strong>
          </div>
          <div className="summary-card">
            <span>Open disputes</span>
            <strong>{disputeQueue.length}</strong>
          </div>
          <div className="summary-card">
            <span>Pending approvals</span>
            <strong>
              {approvalFeed.filter((item) => item.state === 'pending').length}
            </strong>
          </div>
        </div>
      </section>

      <section className="workspace admin-workspace">
        <div className="map-column">
          <div className="card section-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Registry Records</p>
                <h2>Mapped parcels</h2>
              </div>
            </div>

            <div className="table-list">
              {fallbackParcels.map((parcel) => (
                <div className="table-row" key={parcel.parcelId}>
                  <div>
                    <strong>{parcel.parcelId}</strong>
                    <span>
                      {parcel.ownerName} • {parcel.village}
                    </span>
                  </div>
                  <span className="table-tag">
                    {parcel.status.replaceAll('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card section-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Verification Activity</p>
                <h2>Recent approvals</h2>
              </div>
            </div>

            <div className="table-list">
              {approvalFeed.map((item) => (
                <div className="table-row" key={item.id}>
                  <div>
                    <strong>{item.parcelId}</strong>
                    <span>{item.actor}</span>
                  </div>
                  <span className={`table-tag is-${item.state}`}>
                    {item.state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="info-column">
          <div className="card section-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Dispute Queue</p>
                <h2>Boundary review</h2>
              </div>
            </div>

            <div className="parcel-list">
              {disputeQueue.map((dispute) => (
                <button
                  type="button"
                  key={dispute.id}
                  className={`parcel-item ${dispute.id === activeDisputeId ? 'is-active' : ''}`}
                  onClick={() => setActiveDisputeId(dispute.id)}
                >
                  <div>
                    <strong>{dispute.parcelId}</strong>
                    <span>
                      {dispute.category} • {dispute.district}
                    </span>
                  </div>
                  <span className="parcel-area">
                    {dispute.status.replaceAll('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card section-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Resolution Panel</p>
                <h2>{activeDispute?.id || 'No dispute selected'}</h2>
              </div>
            </div>

            {activeDispute ? (
              <>
                <div className="detail-stack">
                  <div className="detail-row">
                    <span>Parcel</span>
                    <strong>{activeDispute.parcelId}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Category</span>
                    <strong>{activeDispute.category}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Status</span>
                    <strong>{activeDispute.status.replaceAll('_', ' ')}</strong>
                  </div>
                </div>

                <div className="action-row">
                  <button className="primary-button" type="button">
                    Approve resolution
                  </button>
                  <button className="secondary-button" type="button">
                    Reject dispute
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
