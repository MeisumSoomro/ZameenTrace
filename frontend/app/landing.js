'use client';

import { useEffect, useRef, useState } from 'react';
import '../styles/zameentrace.css';
import '../styles/landing-expanded.css';

export default function ZameenTraceLanding() {
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('location');
  const [reportTab, setReportTab] = useState('overview');
  const [L, setL] = useState(null);

  // Initialize Leaflet
  useEffect(() => {
    const initMap = async () => {
      const leaflet = await import('leaflet');
      setL(leaflet.default);
    };
    initMap();
  }, []);

  // Initialize hero map
  useEffect(() => {
    if (L && mapRef.current && !mapRef.current._leaflet_id) {
      const map = L.map(mapRef.current).setView([30.3753, 69.3451], 5);

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 18,
        }
      ).addTo(map);

      const sampleBoundaries = [
        [[30.1, 69.5], [30.1, 69.6], [30.2, 69.6], [30.2, 69.5]],
        [[31.5, 74.3], [31.5, 74.4], [31.6, 74.4], [31.6, 74.3]],
      ];

      sampleBoundaries.forEach((coords) => {
        L.polygon(coords, {
          color: '#3d9d8f',
          weight: 2,
          opacity: 0.6,
          fillOpacity: 0.1,
          dashArray: '5, 5',
        }).addTo(map);
      });
    }
  }, [L]);

  const SampleReportTabs = () => {
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'satellite', label: 'Satellite' },
      { id: 'ownership', label: 'Ownership' },
      { id: 'verification', label: 'Verification' },
      { id: 'risk', label: 'Risk' },
      { id: 'infrastructure', label: 'Infrastructure' },
      { id: 'trends', label: 'Trends' },
      { id: 'summary', label: 'AI Summary' },
      { id: 'investment', label: 'Investment' },
    ];

    return (
      <div className="glass-panel" style={{ padding: '32px', marginTop: '32px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportTab(tab.id)}
              style={{
                padding: '10px 16px',
                border: reportTab === tab.id ? '1px solid #3d9d8f' : '1px solid rgba(255, 255, 255, 0.2)',
                background: reportTab === tab.id ? 'rgba(61, 157, 143, 0.15)' : 'transparent',
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                transition: 'all 300ms ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '350px' }}>
          {reportTab === 'overview' && (
            <div>
              <h3 style={{ color: '#3d9d8f', marginBottom: '16px', fontSize: '18px' }}>Property Overview</h3>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div><p style={{ color: '#a8afa7', fontSize: '12px' }}>TYPE</p><p style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>Residential Plot</p></div>
                <div><p style={{ color: '#a8afa7', fontSize: '12px' }}>AREA</p><p style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>1,200 Sq Yards</p></div>
                <div><p style={{ color: '#a8afa7', fontSize: '12px' }}>LOCATION</p><p style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>DHA Phase VI, Lahore</p></div>
                <div><p style={{ color: '#a8afa7', fontSize: '12px' }}>GRADE</p><p style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>A-Grade</p></div>
              </div>
            </div>
          )}
          {reportTab === 'satellite' && (
            <div><h3 style={{ color: '#3d9d8f', marginBottom: '16px' }}>Satellite View</h3><div style={{ background: 'rgba(0, 0, 0, 0.4)', height: '280px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8afa7' }}>🛰️ Satellite imagery with highlighted boundaries</div></div>
          )}
          {reportTab === 'ownership' && (
            <div><h3 style={{ color: '#3d9d8f', marginBottom: '16px' }}>Timeline</h3><div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{['2023: Current Owner', '2020: Previous Owner', '2015: Original Developer'].map((item, i) => (<div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><div style={{ width: '12px', height: '12px', background: '#3d9d8f', borderRadius: '50%' }} /><p style={{ color: '#fff', fontSize: '14px' }}>{item}</p></div>))}</div></div>
          )}
          {reportTab === 'verification' && (
            <div><h3 style={{ color: '#3d9d8f', marginBottom: '16px' }}>Status</h3><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{['✓ FBR Verified', '✓ Records Match', '✓ No Disputes', '✓ Utilities Valid'].map((check, i) => (<p key={i} style={{ color: '#a8d5c8', fontSize: '14px' }}>{check}</p>))}</div></div>
          )}
          {reportTab === 'risk' && (
            <div><h3 style={{ color: '#3d9d8f', marginBottom: '16px' }}>Assessment</h3><div style={{ background: 'rgba(61, 157, 143, 0.1)', padding: '16px', borderRadius: '8px' }}><p style={{ color: '#a8d5c8', marginBottom: '12px', fontWeight: 600 }}>Risk Level: LOW</p><p style={{ color: '#a8afa7', fontSize: '14px' }}>Clean title with no encumbrances or disputes detected.</p></div></div>
          )}
          {reportTab === 'infrastructure' && (
            <div><h3 style={{ color: '#3d9d8f', marginBottom: '16px' }}>Analysis</h3><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{['Main Road: 200m', 'School: 500m', 'Hospital: 1.2km', 'Shopping: 800m'].map((inf, i) => (<p key={i} style={{ color: '#fff', fontSize: '14px' }}>• {inf}</p>))}</div></div>
          )}
          {reportTab === 'trends' && (
            <div><h3 style={{ color: '#3d9d8f', marginBottom: '16px' }}>Growth Trends</h3><p style={{ color: '#a8afa7', marginBottom: '16px', fontSize: '14px' }}>Area shows 18% YoY appreciation over last 3 years</p><div style={{ background: 'rgba(0, 0, 0, 0.3)', height: '220px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8afa7' }}>📈 Growth chart</div></div>
          )}
          {reportTab === 'summary' && (
            <div><h3 style={{ color: '#3d9d8f', marginBottom: '16px' }}>AI Insights</h3><p style={{ color: '#a8afa7', lineHeight: '1.6', fontSize: '14px' }}>Premium DHA property with strong fundamentals. Low-risk investment with verified ownership, excellent location access, and consistent market appreciation. Suitable for both owner-occupancy and portfolio investment.</p></div>
          )}
          {reportTab === 'investment' && (
            <div><h3 style={{ color: '#3d9d8f', marginBottom: '16px' }}>Outlook</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}><div><p style={{ color: '#a8afa7', fontSize: '12px' }}>5-YEAR PROJECTION</p><p style={{ color: '#a8d5c8', fontSize: '18px', fontWeight: 600 }}>+22-28%</p></div><div><p style={{ color: '#a8afa7', fontSize: '12px' }}>RENTAL YIELD</p><p style={{ color: '#a8d5c8', fontSize: '18px', fontWeight: 600 }}>4.8-5.2%</p></div></div></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#0f1419', color: '#fff' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(15, 20, 25, 0.85) 0%, rgba(13, 61, 45, 0.7) 100%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '32px' }}>
          <h1 style={{ fontSize: '64px', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.02em' }}>Pakistan's Property Intelligence Layer</h1>
          <p style={{ fontSize: '20px', color: '#a8afa7', maxWidth: '600px', margin: '0 auto 48px' }}>Unlock ownership history, verify land titles, and gain AI-powered insights with advanced GIS mapping technology</p>

          <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', padding: '32px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#8a8f99', display: 'block', marginBottom: '12px' }}>Search Type</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[{ value: 'location', label: 'Location' }, { value: 'coordinates', label: 'Coordinates' }, { value: 'plot', label: 'Plot' }, { value: 'society', label: 'Society' }].map((type) => (
                  <button key={type.value} onClick={() => setSearchType(type.value)} style={{ flex: 1, padding: '12px', border: searchType === type.value ? '1px solid #3d9d8f' : '1px solid rgba(255, 255, 255, 0.2)', background: searchType === type.value ? 'rgba(61, 157, 143, 0.15)' : 'transparent', color: '#fff', borderRadius: '8px', cursor: 'pointer', transition: 'all 300ms ease', fontSize: '14px', fontWeight: 500 }}>{type.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search by ${searchType}...`} style={{ flex: 1, padding: '14px 16px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', fontSize: '14px' }} />
              <button style={{ padding: '14px 32px', background: '#3d9d8f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 300ms ease' }} onMouseEnter={(e) => { e.target.style.background = '#2a8a7a'; e.target.style.boxShadow = '0 0 30px rgba(61, 157, 143, 0.4)'; }} onMouseLeave={(e) => { e.target.style.background = '#3d9d8f'; e.target.style.boxShadow = 'none'; }}>Generate Report</button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section style={{ background: '#1a1f2e', padding: '96px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '16px', fontSize: '48px', color: '#fff' }}>The Problem with Property in Pakistan</h2>
          <p style={{ textAlign: 'center', color: '#a8afa7', marginBottom: '64px', maxWidth: '700px', margin: '0 auto 64px' }}>Fragmented records, disputed ownership, and lack of transparency make property investment risky</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {[{ stat: '47%', desc: 'Properties lack clear ownership documentation' }, { stat: '3-5 years', desc: 'Average time to resolve land disputes' }, { stat: '82%', desc: 'Investors report trust concerns' }, { stat: '100K+', desc: 'Cases pending in land courts' }].map((card, i) => (
              <div key={i} className="glass-panel" style={{ padding: '32px', textAlign: 'center', transition: 'all 300ms ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <p style={{ fontSize: '48px', fontWeight: 700, color: '#3d9d8f', marginBottom: '12px' }}>{card.stat}</p>
                <p style={{ fontSize: '14px', color: '#a8afa7' }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: '#0f1419', padding: '96px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '64px', fontSize: '48px', color: '#fff' }}>How ZameenTrace Works</h2>
          <p style={{ textAlign: 'center', color: '#a8afa7', marginBottom: '64px', fontSize: '16px' }}>A three-stage intelligence engine powered by GIS, AI, and geospatial analytics</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { num: '1', title: 'DISCOVER', desc: 'Search properties by location, plot number, or coordinates', icon: '🔍' },
              { num: '2', title: 'VERIFY', desc: 'Cross-reference with official records, historical data & registries', icon: '✓' },
              { num: '3', title: 'ANALYZE', desc: 'Get AI insights, market trends, risk assessments & investment metrics', icon: '📊' }
            ].map((stage, i) => (
              <div key={i} className="glass-panel" style={{ padding: '32px', textAlign: 'center', position: 'relative' }}>
                <p style={{ fontSize: '56px', marginBottom: '16px' }}>{stage.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#3d9d8f', marginBottom: '12px', textTransform: 'uppercase' }}>Stage {stage.num}</p>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#fff' }}>{stage.title}</h3>
                <p style={{ fontSize: '14px', color: '#a8afa7' }}>{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Report */}
      <section style={{ background: '#1a1f2e', padding: '96px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '16px', fontSize: '48px', color: '#fff' }}>Sample Land Intelligence Report</h2>
          <p style={{ textAlign: 'center', color: '#a8afa7', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>Explore how ZameenTrace transforms property data into actionable intelligence. Click through each tab to see the full intelligence capability.</p>
          <SampleReportTabs />
        </div>
      </section>

      {/* Technology */}
      <section style={{ background: '#0f1419', padding: '96px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '64px', fontSize: '48px', color: '#fff' }}>Technology Behind ZameenTrace</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[
              { title: 'GIS Mapping', desc: 'Precise geospatial intelligence with satellite imagery and cadastral overlays' },
              { title: 'Geospatial Analytics', desc: 'Advanced spatial analysis to identify patterns and investment opportunities' },
              { title: 'AI-Assisted Verification', desc: 'Machine learning algorithms cross-reference multiple data sources for accuracy' },
              { title: 'Historical Record Indexing', desc: 'Complete ownership chain with temporal tracking and anomaly detection' },
              { title: 'Predictive Intelligence', desc: 'Forecasting market trends and property value appreciation' },
              { title: 'Blockchain Ready', desc: 'Future-proof audit trails for transparent ownership records' }
            ].map((tech, i) => (
              <div key={i} className="glass-panel" style={{ padding: '32px', transition: 'all 300ms ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#3d9d8f' }}>{tech.title}</h3>
                <p style={{ fontSize: '14px', color: '#a8afa7' }}>{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section style={{ background: '#1a1f2e', padding: '96px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '64px', fontSize: '48px', color: '#fff' }}>Our Vision: Pakistan's Property Intelligence Infrastructure</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { phase: 'Phase 1', title: 'Land Verification Layer', status: '🔷 Current' },
              { phase: 'Phase 2', title: 'Market Intelligence Engine', status: '🔶 Q2 2025' },
              { phase: 'Phase 3', title: 'Government Integrations', status: '🟠 Q3 2025' },
              { phase: 'Phase 4', title: 'AI Valuation Models', status: '🟠 Q4 2025' },
              { phase: 'Phase 5', title: 'Developer API Ecosystem', status: '⚪ 2026' },
              { phase: 'Phase 6', title: 'Nationwide Coverage', status: '⚪ 2026' }
            ].map((milestone, i) => (
              <div key={i} className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><p style={{ color: '#3d9d8f', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>{milestone.phase}</p><h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>{milestone.title}</h3></div>
                <p style={{ fontSize: '16px' }}>{milestone.status}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section style={{ background: 'linear-gradient(135deg, #0d3d2d 0%, #1a1f2e 100%)', padding: '96px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', marginBottom: '32px', color: '#fff', lineHeight: '1.3' }}>Building Trust Through Intelligence</h2>
          <p style={{ fontSize: '18px', color: '#a8afa7', lineHeight: '1.8', marginBottom: '48px' }}>
            ZameenTrace exists to make land ownership transparent, verifiable, and understandable. We believe property investment should be based on facts, not fear. By combining geospatial intelligence, historical verification, and market analytics, we empower investors, developers, banks, surveyors, and everyday Pakistanis to make confident property decisions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '64px' }}>
            {[{ title: 'For Investors', desc: 'Investment analysis and risk assessment' }, { title: 'For Developers', desc: 'Market intelligence and growth trends' }, { title: 'For Institutions', desc: 'Verification and due diligence support' }].map((segment, i) => (
              <div key={i} style={{ padding: '24px' }}><p style={{ fontSize: '14px', color: '#3d9d8f', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>{segment.title}</p><p style={{ fontSize: '14px', color: '#a8afa7' }}>{segment.desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: '#0f1419', padding: '96px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '48px', marginBottom: '32px', color: '#fff' }}>Ready to transform your property decisions?</h2>
        <p style={{ fontSize: '18px', color: '#a8afa7', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>Experience the future of property intelligence. Explore our sample report, join the waitlist, or request early access.</p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{ padding: '16px 48px', background: '#3d9d8f', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 300ms ease' }} onMouseEnter={(e) => { e.target.style.background = '#2a8a7a'; e.target.style.boxShadow = '0 0 40px rgba(61, 157, 143, 0.5)'; }} onMouseLeave={(e) => { e.target.style.background = '#3d9d8f'; e.target.style.boxShadow = 'none'; }}>Explore Live Demo</button>
          <button style={{ padding: '16px 48px', background: 'transparent', color: '#3d9d8f', border: '2px solid #3d9d8f', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 300ms ease' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(61, 157, 143, 0.1)'; }} onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}>Join Waitlist</button>
          <button style={{ padding: '16px 48px', background: 'transparent', color: '#3d9d8f', border: '2px solid #3d9d8f', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 300ms ease' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(61, 157, 143, 0.1)'; }} onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}>Request Early Access</button>
        </div>
      </section>

      {/* Features Overview */}
      <section style={{ background: '#1a1f2e', padding: '96px 32px', borderTop: '1px solid rgba(61, 157, 143, 0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '64px', fontSize: '48px', color: '#fff' }}>Core Capabilities</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { icon: '📜', title: 'Ownership History', desc: 'Complete chain with timestamps and verification' },
              { icon: '✓', title: 'Land Verification', desc: 'Cross-reference with government registries' },
              { icon: '🤖', title: 'AI Insights', desc: 'Market analysis and trends' },
              { icon: '💼', title: 'Investment Analysis', desc: 'Risk and opportunity scoring' },
              { icon: '🏗️', title: 'Infrastructure Monitoring', desc: 'Track development nearby' },
              { icon: '📊', title: 'Market Intelligence', desc: 'Real-time data and analytics' }
            ].map((feature, i) => (
              <div key={i} className="glass-panel" style={{ padding: '32px', transition: 'all 300ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(61, 157, 143, 0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#fff', fontWeight: 600 }}>{feature.title}</h3>
                <p style={{ fontSize: '14px', color: '#a8afa7' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section style={{ background: '#0a0d12', padding: '48px 32px', textAlign: 'center', borderTop: '1px solid rgba(61, 157, 143, 0.1)' }}>
        <p style={{ color: '#a8afa7', fontSize: '14px' }}>© 2025 ZameenTrace. Pakistan's Property Intelligence Layer.</p>
      </section>
    </div>
  );
}
