// frontend/app/login.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import '../styles/zameentrace.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await apiClient.login(email, password);

    if (result.success) {
      // Store token in localStorage
      localStorage.setItem('authToken', result.data.token);
      apiClient.setToken(result.data.token);
      router.push('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%)',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '400px',
          width: '90%',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#1a1f2e',
            marginBottom: '8px',
            textAlign: 'center',
          }}
        >
          ZameenTrace
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#8a8f99',
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          Pakistan's Property Intelligence Layer
        </p>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              color: '#991b1b',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#1a1f2e',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e8eaef',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#1a1f2e',
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
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e8eaef',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#3d9d8f',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 300ms ease',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

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
              fontWeight: 600,
            }}
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
