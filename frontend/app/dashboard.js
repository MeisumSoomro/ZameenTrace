'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

// Fallback mock data used when DB is unavailable
const MOCK_STATS = {
  propertiesTracked: 1247,
  verificationsComplete: 892,
  alertsActive: 12,
  portfolioValue: '₨145.3 Crore',
};

const MOCK_ALERTS = [
  { id: 1, type: 'warning', title: 'Price Alert', message: 'Defence Rd properties rose 8.2% this week', time: '2 hours ago' },
  { id: 2, type: 'info', title: 'Verification Complete', message: 'Plot 456 verification passed all checks', time: '4 hours ago' },
  { id: 3, type: 'error', title: 'Document Issue', message: 'Encumbrance certificate pending for Plot 789', time: '6 hours ago' },
];

const MOCK_TRENDS = [
  { area: 'Defence Rd, Lahore', trend: '+8.2%', color: '#10b981' },
  { area: 'Bahria Town, Lahore', trend: '+5.1%', color: '#f59e0b' },
  { area: 'DHA Phase 6, Karachi', trend: '+12.3%', color: '#10b981' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [trends, setTrends] = useState(MOCK_TRENDS);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeAlert, setActiveAlert] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    apiClient.setToken(token);
    apiClient.getUserProfile().then((result) => {
      if (result.success) {
        setUser(result.data.user);
      } else {
        // Token invalid
        localStorage.removeItem('authToken');
        router.replace('/login');
      }
      setAuthLoading(false);
    });
  }, [router]);

  // Load dashboard data
  const loadData = useCallback(async () => {
    setDataLoading(true);
    const [statsResult, alertsResult, trendsResult] = await Promise.all([
      apiClient.getDashboardStats(),
      apiClient.getAlerts(5),
      apiClient.getMarketTrends(null, timeRange),
    ]);

    if (statsResult.success && statsResult.data._source !== 'stub') {
      setStats(statsResult.data);
    } else {
      setStats(MOCK_STATS);
    }

    if (alertsResult.success && alertsResult.data.alerts?.length > 0) {
      setAlerts(alertsResult.data.alerts);
    } else {
      setAlerts(MOCK_ALERTS);
    }

    if (trendsResult.success && trendsResult.data.trends?.length > 0) {
      setTrends(trendsResult.data.trends.slice(0, 5).map((t) => ({
        area: `${t.district}, ${t.province}`,
        trend: `${t.verificationRate}`,
        color: parseFloat(t.verificationRate) > 50 ? '#10b981' : '#f59e0b',
      })));
    }

    setDataLoading(false);
  }, [timeRange]);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
  }, [authLoading, user, loadData]);

  const handleLogout = () => {
    apiClient.clearToken();
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f7fa',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '3px solid #e8eaef',
              borderTopColor: '#3d9d8f',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: '#8a8f99', fontSize: '14px' }}>Authenticating...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const displayStats = stats || MOCK_STATS;

  const statCards = [
    { label: 'Properties Tracked', value: displayStats.propertiesTracked?.toLocaleString?.() || displayStats.propertiesTracked, change: '+8%', icon: '🏠' },
    { label: 'Verifications Complete', value: displayStats.verificationsComplete?.toLocaleString?.() || displayStats.verificationsComplete, change: '+12%', icon: '✅' },
    { label: 'Active Alerts', value: displayStats.alertsActive, change: displayStats.alertsActive > 0 ? `${displayStats.alertsActive} open` : 'None', icon: '🔔' },
    { label: 'Portfolio Value', value: displayStats.portfolioValue || 'Connect DB', change: '+5.3%', icon: '💰' },
  ];

  const alertColor = (type) => {
    if (type === 'error') return { bg: '#fee2e2', border: '#ef4444' };
    if (type === 'warning') return { bg: '#fef3c7', border: '#f59e0b' };
    return { bg: '#e0f2fe', border: '#3b82f6' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '240px',
          height: '100vh',
          background: 'linear-gradient(180deg, #1a1f2e 0%, #0d1520 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 200,
          padding: '0',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #3d9d8f, #0d3d2d)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              🌏
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px', margin: 0 }}>ZameenTrace</p>
              <p style={{ color: '#4b5563', fontSize: '11px', margin: 0 }}>Intelligence Layer</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: '16px 12px' }}>
          {[
            { icon: '📊', label: 'Dashboard', href: '/dashboard', active: true },
            { icon: '🗺️', label: 'Map View', href: '/' },
            { icon: '📄', label: 'Reports', href: '/report' },
            { icon: '🏠', label: 'My Properties', href: '/dashboard' },
            { icon: '⚙️', label: 'Settings', href: '/dashboard' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                marginBottom: '4px',
                background: item.active ? 'rgba(61,157,143,0.15)' : 'transparent',
                border: item.active ? '1px solid rgba(61,157,143,0.25)' : '1px solid transparent',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                if (!item.active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={(e) => {
                if (!item.active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span style={{ color: item.active ? '#3d9d8f' : '#9ca3af', fontSize: '14px', fontWeight: item.active ? 600 : 400 }}>
                {item.label}
              </span>
            </a>
          ))}
        </div>

        {/* User info + Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #3d9d8f, #2a8a7a)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              {user?.fullName?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.fullName || 'User'}
              </p>
              <p style={{ color: '#4b5563', fontSize: '11px', margin: 0, textTransform: 'capitalize' }}>
                {user?.role || 'operator'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '6px',
              color: '#f87171',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => (e.target.style.background = 'rgba(239,68,68,0.2)')}
            onMouseLeave={(e) => (e.target.style.background = 'rgba(239,68,68,0.1)')}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ marginLeft: '240px', minHeight: '100vh' }}>
        {/* Top Bar */}
        <header
          style={{
            background: '#fff',
            borderBottom: '1px solid #e8eaef',
            padding: '20px 32px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1f2e', margin: 0 }}>
              Dashboard
            </h1>
            <p style={{ fontSize: '13px', color: '#8a8f99', margin: '2px 0 0' }}>
              Welcome back, {user?.fullName?.split(' ')[0] || 'there'} 👋
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '8px 16px',
                  background: timeRange === range ? '#3d9d8f' : '#f5f7fa',
                  color: timeRange === range ? '#fff' : '#1a1f2e',
                  border: `1px solid ${timeRange === range ? '#3d9d8f' : '#e8eaef'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'all 200ms ease',
                }}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
            <button
              onClick={loadData}
              disabled={dataLoading}
              title="Refresh data"
              style={{
                padding: '8px 12px',
                background: '#f5f7fa',
                border: '1px solid #e8eaef',
                borderRadius: '6px',
                cursor: dataLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                transition: 'all 200ms ease',
                opacity: dataLoading ? 0.6 : 1,
              }}
            >
              🔄
            </button>
          </div>
        </header>

        <main style={{ padding: '32px' }}>
          {/* KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            {statCards.map((stat, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  border: '1px solid #e8eaef',
                  borderRadius: '14px',
                  padding: '24px',
                  transition: 'all 200ms ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#8a8f99', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {stat.label}
                  </p>
                  <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                </div>
                <h3
                  style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#1a1f2e',
                    margin: '0 0 8px',
                    letterSpacing: '-0.02em',
                    filter: dataLoading ? 'blur(4px)' : 'none',
                    transition: 'filter 300ms ease',
                  }}
                >
                  {stat.value}
                </h3>
                <span
                  style={{
                    fontSize: '12px',
                    color: stat.change.startsWith('+') ? '#10b981' : stat.change.startsWith('-') ? '#ef4444' : '#8a8f99',
                    fontWeight: 600,
                    background: stat.change.startsWith('+') ? '#f0fdf4' : stat.change.startsWith('-') ? '#fef2f2' : '#f5f7fa',
                    padding: '3px 8px',
                    borderRadius: '20px',
                  }}
                >
                  {stat.change}
                </span>
              </div>
            ))}
          </div>

          {/* Main 2-column grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '24px',
              marginBottom: '32px',
            }}
          >
            {/* Alerts Panel */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e8eaef',
                borderRadius: '14px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1f2e', margin: 0 }}>
                  Real-Time Alerts
                </h2>
                <span
                  style={{
                    background: '#fee2e2',
                    color: '#991b1b',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '20px',
                  }}
                >
                  {alerts.length} active
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alerts.slice(0, 5).map((alert, idx) => {
                  const colors = alertColor(alert.type);
                  return (
                    <div
                      key={alert.id || idx}
                      onClick={() => setActiveAlert(activeAlert === (alert.id || idx) ? null : (alert.id || idx))}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        background: colors.bg,
                        borderLeft: `3px solid ${colors.border}`,
                        cursor: 'pointer',
                        transition: 'all 200ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(4px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '13px', color: '#1a1f2e' }}>{alert.title}</strong>
                          <p style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>{alert.message}</p>
                        </div>
                        <span style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                          {typeof alert.time === 'string' ? alert.time : new Date(alert.time).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Market Trends Panel */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e8eaef',
                borderRadius: '14px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1f2e', margin: 0 }}>
                  Market Trends
                </h2>
                <span style={{ fontSize: '12px', color: '#8a8f99' }}>{timeRange}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {trends.map((item, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#1a1f2e' }}>{item.area}</span>
                      <span style={{ color: item.color, fontWeight: 700, fontSize: '13px' }}>{item.trend}</span>
                    </div>
                    <div style={{ height: '6px', background: '#e8eaef', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                          width: item.trend.replace('+', '').replace('%', '') + '%',
                          borderRadius: '3px',
                          transition: 'width 600ms ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e8eaef',
              borderRadius: '14px',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1f2e', margin: '0 0 16px' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: '🔍 Search Parcel', href: '/' },
                { label: '📄 Generate Report', href: '/report' },
                { label: '🗺️ View Map', href: '/' },
                { label: '➕ Register Property', href: '/' },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  style={{
                    padding: '10px 20px',
                    background: '#f5f7fa',
                    border: '1px solid #e8eaef',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#1a1f2e',
                    fontSize: '13px',
                    fontWeight: 600,
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3d9d8f';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = '#3d9d8f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f5f7fa';
                    e.currentTarget.style.color = '#1a1f2e';
                    e.currentTarget.style.borderColor = '#e8eaef';
                  }}
                >
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
