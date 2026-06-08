'use client';

import { useState } from 'react';
import '../styles/zameentrace.css';

export default function LandIntelligenceReport() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Header */}
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #e8eaef',
          padding: '24px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#1a1f2e',
              }}
              >
                Plot 123, Defence Rd, Lahore
              </h1>
              <p style={{ fontSize: '14px', color: '#8a8f99', marginTop: '4px' }}>
                Land Intelligence Report
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '12px',
              }}
            >
              <span
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: '#fff',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                ✓ Verified
              </span>
              <span
                style={{
                  padding: '8px 16px',
                  background: '#f59e0b',
                  color: '#fff',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                ⚠ Low Risk
              </span>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        {/* KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {[
            {
              label: 'Property Area',
              value: '5,000 sq ft',
              subtitle: 'Total area',
            },
            { label: 'Current Value', value: '₨2.5M', subtitle: 'Market rate' },
            { label: 'Risk Score', value: '15%', subtitle: 'Low risk' },
            { label: 'Last Verified', value: '2 days ago', subtitle: '' },
          ].map((kpi, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                border: '1px solid #e8eaef',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <p style={{ fontSize: '12px', color: '#8a8f99', marginBottom: '8px' }}>
                {kpi.label}
              </p>
              <h3
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#1a1f2e',
                }}
              >
                {kpi.value}
              </h3>
              {kpi.subtitle && (
                <p
                  style={{
                    fontSize: '12px',
                    color: '#8a8f99',
                    marginTop: '8px',
                  }}
                >
                  {kpi.subtitle}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e8eaef',
            marginBottom: '32px',
          }}
        >
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'ownership', label: 'Ownership History' },
            { id: 'verification', label: 'Verification' },
            { id: 'market', label: 'Market Analysis' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: 'transparent',
                borderBottom:
                  activeTab === tab.id ? '2px solid #3d9d8f' : 'transparent',
                color: activeTab === tab.id ? '#3d9d8f' : '#8a8f99',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 300ms ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Areas */}
        {activeTab === 'overview' && (
          <div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '24px',
                color: '#1a1f2e',
              }}
            >
              Property Overview
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>
                  Location Details
                </h3>
                <ul style={{ listStyle: 'none', lineHeight: 2 }}>
                  <li>
                    <strong>Address:</strong> Plot 123, Defence Road, Lahore
                  </li>
                  <li>
                    <strong>City:</strong> Lahore
                  </li>
                  <li>
                    <strong>District:</strong> Lahore
                  </li>
                  <li>
                    <strong>Coordinates:</strong> 31.5204°N, 74.3587°E
                  </li>
                </ul>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>
                  Property Details
                </h3>
                <ul style={{ listStyle: 'none', lineHeight: 2 }}>
                  <li>
                    <strong>Type:</strong> Residential Plot
                  </li>
                  <li>
                    <strong>Area:</strong> 5,000 sq ft
                  </li>
                  <li>
                    <strong>Status:</strong> Active
                  </li>
                  <li>
                    <strong>Utility:</strong> All utilities available
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ownership' && (
          <div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '24px',
                color: '#1a1f2e',
              }}
            >
              Ownership History
            </h2>
            <div style={{ background: '#fff', borderRadius: '12px' }}>
              {[
                {
                  date: '2023-01-15',
                  owner: 'Ahmed Khan',
                  action: 'Purchase',
                  docs: 'Title Deed, Sale Agreement',
                },
                {
                  date: '2021-06-22',
                  owner: 'Fatima Ahmed',
                  action: 'Sale',
                  docs: 'Title Deed, Transfer Certificate',
                },
                {
                  date: '2019-03-10',
                  owner: 'Original Developer',
                  action: 'Allocation',
                  docs: 'Allotment Letter',
                },
              ].map((entry, i) => (
                <div
                  key={i}
                  style={{
                    padding: '24px',
                    borderBottom: i < 2 ? '1px solid #e8eaef' : 'none',
                    display: 'flex',
                    gap: '24px',
                  }}
                >
                  <div
                    style={{
                      minWidth: '100px',
                      fontSize: '12px',
                      color: '#8a8f99',
                      fontWeight: 600,
                    }}
                  >
                    {entry.date}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {entry.owner}
                    </p>
                    <p style={{ fontSize: '14px', color: '#8a8f99' }}>
                      {entry.action} • {entry.docs}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: '6px 12px',
                      background: '#e8f5e9',
                      color: '#2e7d32',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Verified
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '24px',
                color: '#1a1f2e',
              }}
            >
              Verification Status
            </h2>
            <div
              style={{
                display: 'grid',
                gap: '16px',
              }}
            >
              {[
                {
                  name: 'Title Deed Verification',
                  status: 'verified',
                  date: '2024-01-10',
                },
                {
                  name: 'Survey Report Match',
                  status: 'verified',
                  date: '2024-01-10',
                },
                { name: 'Utility Status Check', status: 'verified', date: '2024-01-08' },
                {
                  name: 'Encumbrance Certificate',
                  status: 'pending',
                  date: 'In Progress',
                },
              ].map((check, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fff',
                    padding: '20px',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #e8eaef',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {check.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#8a8f99' }}>
                      {check.date}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: '6px 16px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background:
                        check.status === 'verified'
                          ? '#e8f5e9'
                          : '#fff3cd',
                      color:
                        check.status === 'verified'
                          ? '#2e7d32'
                          : '#856404',
                    }}
                  >
                    {check.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '24px',
                color: '#1a1f2e',
              }}
            >
              Market Analysis
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
                <h3
                  style={{
                    fontSize: '16px',
                    marginBottom: '16px',
                    fontWeight: 600,
                  }}
                >
                  Price Trend
                </h3>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                  +12.5%
                </p>
                <p style={{ fontSize: '12px', color: '#8a8f99', marginTop: '8px' }}>
                  YoY growth in Defence Rd area
                </p>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
                <h3
                  style={{
                    fontSize: '16px',
                    marginBottom: '16px',
                    fontWeight: 600,
                  }}
                >
                  Comparable Sales
                </h3>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#1a1f2e' }}>
                  8 sold
                </p>
                <p style={{ fontSize: '12px', color: '#8a8f99', marginTop: '8px' }}>
                  Similar properties in last 6 months
                </p>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
                <h3
                  style={{
                    fontSize: '16px',
                    marginBottom: '16px',
                    fontWeight: 600,
                  }}
                >
                  Investment Score
                </h3>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>
                  8.2/10
                </p>
                <p style={{ fontSize: '12px', color: '#8a8f99', marginTop: '8px' }}>
                  Strong growth potential
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
