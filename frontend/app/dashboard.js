'use client';

import { useState, useEffect } from 'react';
import '../styles/zameentrace.css';

export default function DashboardPage() {
  const [activeAlert, setActiveAlert] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  // Mock real-time data
  const stats = {
    propertiesTracked: 1247,
    verificationsComplete: 892,
    alertsActive: 12,
    portfolioValue: '₨145.3 Crore',
  };

  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Price Alert',
      message: 'Defence Rd properties rose 8.2% this week',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'info',
      title: 'Verification Complete',
      message: 'Plot 456 verification passed all checks',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'error',
      title: 'Document Issue',
      message: 'Encumbrance certificate pending for Plot 789',
      time: '6 hours ago',
    },
  ];

  const recentProperties = [
    {
      id: 1,
      name: 'Defence Rd, Lahore',
      status: 'Verified',
      value: '₨2.5M',
      risk: 'Low',
      change: '+8.2%',
    },
    {
      id: 2,
      name: 'Bahria Town, Lahore',
      status: 'Pending',
      value: '₨1.8M',
      risk: 'Medium',
      change: '+5.1%',
    },
    {
      id: 3,
      name: 'DHA Phase 6, Karachi',
      status: 'Verified',
      value: '₨3.2M',
      risk: 'Low',
      change: '+12.3%',
    },
  ];

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
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1f2e' }}>
            Dashboard
          </h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setTimeRange('7d')}
              style={{
                padding: '8px 16px',
                background: timeRange === '7d' ? '#3d9d8f' : '#f5f7fa',
                color: timeRange === '7d' ? '#fff' : '#1a1f2e',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              style={{
                padding: '8px 16px',
                background: timeRange === '30d' ? '#3d9d8f' : '#f5f7fa',
                color: timeRange === '30d' ? '#fff' : '#1a1f2e',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              style={{
                padding: '8px 16px',
                background: timeRange === '90d' ? '#3d9d8f' : '#f5f7fa',
                color: timeRange === '90d' ? '#fff' : '#1a1f2e',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              90 Days
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        {/* KPI Row */}
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
              label: 'Properties Tracked',
              value: stats.propertiesTracked,
              change: '+8%',
            },
            {
              label: 'Verifications Complete',
              value: stats.verificationsComplete,
              change: '+12%',
            },
            {
              label: 'Active Alerts',
              value: stats.alertsActive,
              change: '-2%',
            },
            {
              label: 'Portfolio Value',
              value: stats.portfolioValue,
              change: '+5.3%',
            },
          ].map((stat, i) => (
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
                {stat.label}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1f2e' }}>
                  {stat.value}
                </h3>
                <span
                  style={{
                    color: stat.change.startsWith('+')
                      ? '#10b981'
                      : '#ef4444',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Alerts Panel */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e8eaef',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: '16px',
              }}
            >
              Real-Time Alerts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => setActiveAlert(activeAlert === alert.id ? null : alert.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background:
                      alert.type === 'error'
                        ? '#fee2e2'
                        : alert.type === 'warning'
                          ? '#fef3c7'
                          : '#e0f2fe',
                    borderLeft: `4px solid ${
                      alert.type === 'error'
                        ? '#ef4444'
                        : alert.type === 'warning'
                          ? '#f59e0b'
                          : '#3b82f6'
                    }`,
                    cursor: 'pointer',
                    transition: 'all 300ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '14px' }}>{alert.title}</strong>
                      <p
                        style={{
                          fontSize: '12px',
                          color: '#666',
                          marginTop: '4px',
                        }}
                      >
                        {alert.message}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#888',
                        whiteSpace: 'nowrap',
                        marginLeft: '8px',
                      }}
                    >
                      {alert.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Trends */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e8eaef',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: '16px',
              }}
            >
              Market Trends
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { area: 'Defence Rd', trend: '+8.2%', color: '#10b981' },
                { area: 'Bahria Town', trend: '+5.1%', color: '#f59e0b' },
                { area: 'DHA Phase 6', trend: '+12.3%', color: '#10b981' },
              ].map((item, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>
                      {item.area}
                    </span>
                    <span style={{ color: item.color, fontWeight: 600 }}>
                      {item.trend}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      background: '#e8eaef',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background: item.color,
                        width: item.trend.includes('+')
                          ? `${parseInt(item.trend)}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Properties */}
        <div
          style={{
            marginTop: '32px',
            background: '#fff',
            border: '1px solid #e8eaef',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '24px', borderBottom: '1px solid #e8eaef' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
              Recent Properties
            </h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid #e8eaef' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>
                    Property
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>
                    Status
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>
                    Value
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>
                    Risk
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentProperties.map((prop) => (
                  <tr
                    key={prop.id}
                    style={{ borderBottom: '1px solid #e8eaef' }}
                  >
                    <td style={{ padding: '16px' }}>
                      <strong>{prop.name}</strong>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background:
                            prop.status === 'Verified'
                              ? '#e8f5e9'
                              : '#fff3cd',
                          color:
                            prop.status === 'Verified'
                              ? '#2e7d32'
                              : '#856404',
                        }}
                      >
                        {prop.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>{prop.value}</td>
                    <td style={{ padding: '16px' }}>
                      <span
                        style={{
                          color:
                            prop.risk === 'Low'
                              ? '#10b981'
                              : prop.risk === 'Medium'
                                ? '#f59e0b'
                                : '#ef4444',
                          fontWeight: 600,
                        }}
                      >
                        {prop.risk}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '16px',
                        color: '#10b981',
                        fontWeight: 600,
                      }}
                    >
                      {prop.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
