'use client';

import { useEffect, useMemo, useState } from 'react';

import { fetchRegionalParcels, fallbackParcels } from '@/lib/api';
import { appConfig } from '@/lib/config';
import { enqueueOfflineAction, getOfflineQueue } from '@/lib/offline-sync';
import { ParcelMap } from '@/components/parcel-map';

const defaultFilters = {
  province: 'Sindh',
  district: 'Tando Allahyar',
  tehsil: '',
  village: '',
};

export function AppShell() {
  const [filters, setFilters] = useState(defaultFilters);
  const [parcels, setParcels] = useState(fallbackParcels);
  const [selectedParcelId, setSelectedParcelId] = useState(
    fallbackParcels[0]?.parcelId ?? null
  );
  const [loading, setLoading] = useState(true);
  const [submissionState, setSubmissionState] = useState('idle');
  const [verificationState, setVerificationState] = useState('idle');
  const [offlineQueue, setOfflineQueue] = useState([]);

  useEffect(() => {
    setOfflineQueue(getOfflineQueue());
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadParcels() {
      setLoading(true);

      try {
        const response = await fetchRegionalParcels(filters);

        if (!isMounted) {
          return;
        }

        const nextParcels = response.parcels?.length
          ? response.parcels
          : fallbackParcels;
        setParcels(nextParcels);
        setSelectedParcelId(
          (current) => current || nextParcels[0]?.parcelId || null
        );
      } catch (_error) {
        if (!isMounted) {
          return;
        }

        setParcels(fallbackParcels);
        setSelectedParcelId(fallbackParcels[0]?.parcelId ?? null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadParcels();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  const selectedParcel = useMemo(
    () =>
      parcels.find((parcel) => parcel.parcelId === selectedParcelId) ||
      parcels[0] ||
      null,
    [parcels, selectedParcelId]
  );

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleBoundarySubmit(event) {
    event.preventDefault();
    const nextQueue = enqueueOfflineAction({
      type: 'boundary_update',
      parcelId: selectedParcel?.parcelId || null,
    });
    setOfflineQueue(nextQueue);
    setSubmissionState('saved');
  }

  function handleVerify(event) {
    event.preventDefault();
    const nextQueue = enqueueOfflineAction({
      type: 'verification',
      parcelId: selectedParcel?.parcelId || null,
    });
    setOfflineQueue(nextQueue);
    setVerificationState('submitted');
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy-block">
          <p className="eyebrow">Farmer Interface</p>
          <h1>Clear land records, mapped for the field.</h1>
          <p className="copy">
            A mobile-first workspace for viewing parcel boundaries, submitting
            updates, and confirming land records in a simpler, lower-friction
            way.
          </p>
        </div>

        <div className="hero-summary">
          <div className="summary-card">
            <span>Region</span>
            <strong>{filters.district || 'Select district'}</strong>
          </div>
          <div className="summary-card">
            <span>Map layer</span>
            <strong>{appConfig.mapProvider}</strong>
          </div>
          <div className="summary-card">
            <span>Parcel count</span>
            <strong>
              {loading ? 'Loading...' : `${parcels.length} mapped`}
            </strong>
          </div>
          <div className="summary-card hero-summary-wide">
            <span>Offline sync queue</span>
            <strong>
              {offlineQueue.length
                ? `${offlineQueue.length} action${offlineQueue.length > 1 ? 's' : ''} waiting`
                : 'No queued actions'}
            </strong>
            {offlineQueue.length ? (
              <div className="queue-list">
                {offlineQueue
                  .slice(-2)
                  .reverse()
                  .map((item) => (
                    <div className="queue-item" key={item.id}>
                      <span>{item.type.replaceAll('_', ' ')}</span>
                      <span>{item.parcelId || 'Pending parcel'}</span>
                    </div>
                  ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="toolbar card">
        <div className="toolbar-copy">
          <p className="eyebrow">Region Filter</p>
          <h2>Find parcels by area</h2>
        </div>

        <div className="filter-grid">
          <label className="field">
            <span>Province</span>
            <input
              name="province"
              value={filters.province}
              onChange={updateFilter}
              placeholder="Sindh"
            />
          </label>
          <label className="field">
            <span>District</span>
            <input
              name="district"
              value={filters.district}
              onChange={updateFilter}
              placeholder="Tando Allahyar"
            />
          </label>
          <label className="field">
            <span>Tehsil</span>
            <input
              name="tehsil"
              value={filters.tehsil}
              onChange={updateFilter}
              placeholder="Optional"
            />
          </label>
          <label className="field">
            <span>Village</span>
            <input
              name="village"
              value={filters.village}
              onChange={updateFilter}
              placeholder="Optional"
            />
          </label>
        </div>
      </section>

      <section className="workspace">
        <div className="map-column">
          <div className="card section-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Map</p>
                <h2>Parcel view</h2>
              </div>
              <div className="status-pill">
                {selectedParcel?.status?.replaceAll('_', ' ') ||
                  'No parcel selected'}
              </div>
            </div>

            <ParcelMap
              parcels={parcels}
              selectedParcelId={selectedParcel?.parcelId}
              onSelectParcel={setSelectedParcelId}
            />
          </div>

          <div className="card section-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Mapped Parcels</p>
                <h2>Choose a parcel</h2>
              </div>
            </div>

            <div className="parcel-list">
              {parcels.map((parcel) => (
                <button
                  type="button"
                  key={parcel.parcelId}
                  className={`parcel-item ${parcel.parcelId === selectedParcel?.parcelId ? 'is-active' : ''}`}
                  onClick={() => setSelectedParcelId(parcel.parcelId)}
                >
                  <div>
                    <strong>{parcel.parcelId}</strong>
                    <span>
                      {parcel.village}, {parcel.district}
                    </span>
                  </div>
                  <span className="parcel-area">
                    {Math.round(parcel.areaSqm).toLocaleString()} sqm
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="info-column">
          <div className="card section-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Parcel Details</p>
                <h2>{selectedParcel?.parcelId || 'No parcel selected'}</h2>
              </div>
            </div>

            {selectedParcel ? (
              <div className="detail-stack">
                <div className="detail-row">
                  <span>Owner</span>
                  <strong>{selectedParcel.ownerName}</strong>
                </div>
                <div className="detail-row">
                  <span>Village</span>
                  <strong>{selectedParcel.village}</strong>
                </div>
                <div className="detail-row">
                  <span>District</span>
                  <strong>{selectedParcel.district}</strong>
                </div>
                <div className="detail-row">
                  <span>Area</span>
                  <strong>
                    {Math.round(selectedParcel.areaSqm).toLocaleString()} sqm
                  </strong>
                </div>
                <div className="detail-row">
                  <span>Status</span>
                  <strong>{selectedParcel.status.replaceAll('_', ' ')}</strong>
                </div>
              </div>
            ) : (
              <p className="copy">
                Select a parcel to inspect its map, boundary, and verification
                state.
              </p>
            )}
          </div>

          <form className="card section-card" onSubmit={handleBoundarySubmit}>
            <div className="section-head">
              <div>
                <p className="eyebrow">Submit Boundary</p>
                <h2>Request an update</h2>
              </div>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Parcel ID</span>
                <input
                  defaultValue={selectedParcel?.parcelId || ''}
                  placeholder="ZT-PK-SND-0001"
                />
              </label>
              <label className="field">
                <span>Owner name</span>
                <input
                  defaultValue={selectedParcel?.ownerName || ''}
                  placeholder="Farmer name"
                />
              </label>
              <label className="field field-full">
                <span>Boundary notes</span>
                <textarea
                  rows="4"
                  placeholder="Short note for the operator or field team"
                />
              </label>
            </div>

            <button className="primary-button" type="submit">
              Submit boundary for review
            </button>
            {submissionState === 'saved' ? (
              <p className="feedback">
                Boundary request queued for sync. API hookup and offline handoff
                are ready for the next pass.
              </p>
            ) : null}
          </form>

          <form className="card section-card" onSubmit={handleVerify}>
            <div className="section-head">
              <div>
                <p className="eyebrow">Neighbor Verification</p>
                <h2>Confirm this boundary</h2>
              </div>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Your role</span>
                <select defaultValue="neighbor">
                  <option value="neighbor">Neighbor</option>
                  <option value="operator">Operator</option>
                  <option value="viewer">Community witness</option>
                </select>
              </label>
              <label className="field">
                <span>Decision</span>
                <select defaultValue="approved">
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                  <option value="pending">Need more review</option>
                </select>
              </label>
              <label className="field field-full">
                <span>Comment</span>
                <textarea
                  rows="3"
                  placeholder="Optional note in simple language"
                />
              </label>
            </div>

            <button className="primary-button" type="submit">
              Submit verification
            </button>
            {verificationState === 'submitted' ? (
              <p className="feedback">
                Verification queued for sync. This screen is prepared for `POST
                /api/parcels/:parcelId/verify`.
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </main>
  );
}
