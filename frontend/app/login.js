// frontend/app/login.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await apiClient.login(email, password);

    if (result.success) {
      apiClient.setToken(result.data.token);
      router.push('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }

    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);

    const demoEmail = 'demo@zameentrace.pk';
    const result = await apiClient.createDemoSession(
      'demo-user-001',
      demoEmail,
      'operator',
      'Demo User'
    );

    if (result.success) {
      apiClient.setToken(result.data.token);
      router.push('/dashboard');
    } else {
      setError(result.error || 'Demo login unavailable. Ensure DEMO_AUTH_ENABLED=true on the backend.');
    }

    setDemoLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid #e8eaef',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 200ms ease',
    boxSizing: 'border-box',
    background: '#fafbfc',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1f2e 0%, #0d3d2d 50%, #2d3748 100%)',
        padding: '16px',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'fixed',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(ellipse at center, rgba(61,157,143,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '48px',
          maxWidth: '420px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          position: 'relative',
        }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              background: 'linear-gradient(135deg, #3d9d8f, #0d3d2d)',
              borderRadius: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '22px',
            }}
          >
            🌏
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#1a1f2e',
              marginBottom: '6px',
              letterSpacing: '-0.02em',
            }}
          >
            ZameenTrace
          </h1>
          <p style={{ fontSize: '14px', color: '#8a8f99' }}>
            Pakistan's Property Intelligence Layer
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fff5f5',
              border: '1px solid #fca5a5',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#991b1b',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '8px',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#3d9d8f')}
              onBlur={(e) => (e.target.style.borderColor = '#e8eaef')}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '8px',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#3d9d8f')}
              onBlur={(e) => (e.target.style.borderColor = '#e8eaef')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading
                ? '#6b9e98'
                : 'linear-gradient(135deg, #3d9d8f, #2a8a7a)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 200ms ease',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(61,157,143,0.35)',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '20px 0',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: '#e8eaef' }} />
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#e8eaef' }} />
        </div>

        {/* Demo Login */}
        <button
          onClick={handleDemoLogin}
          disabled={demoLoading}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            color: '#3d9d8f',
            border: '1.5px solid #3d9d8f',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: demoLoading ? 'not-allowed' : 'pointer',
            transition: 'all 200ms ease',
            opacity: demoLoading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!demoLoading) e.target.style.background = 'rgba(61,157,143,0.08)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
          }}
        >
          {demoLoading ? 'Loading demo...' : '🎯 Try Demo Account'}
        </button>

        <p
          style={{
            fontSize: '14px',
            color: '#8a8f99',
            textAlign: 'center',
            marginTop: '24px',
          }}
        >
          Don't have an account?{' '}
          <a
            href="/signup"
            style={{
              color: '#3d9d8f',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Create one →
          </a>
        </p>

        <p style={{ textAlign: 'center', marginTop: '12px' }}>
          <a
            href="/"
            style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }}
          >
            ← Back to home
          </a>
        </p>
      </div>
    </div>
  );
}
