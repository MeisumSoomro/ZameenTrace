// frontend/app/signup.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

const ROLES = [
  { value: 'operator', label: 'Property Professional' },
  { value: 'investor', label: 'Investor' },
  { value: 'farmer', label: 'Farmer / Land Owner' },
  { value: 'surveyor', label: 'Surveyor' },
  { value: 'government_admin', label: 'Government Official' },
  { value: 'viewer', label: 'Viewer / Researcher' },
];

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'operator',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const result = await apiClient.register(
      formData.email,
      formData.password,
      formData.fullName,
      formData.role
    );

    if (result.success) {
      apiClient.setToken(result.data.token);
      router.push('/dashboard');
    } else {
      setErrors({ submit: result.error || 'Registration failed. Please try again.' });
    }

    setLoading(false);
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '12px 16px',
    border: `1.5px solid ${errors[field] ? '#fca5a5' : '#e8eaef'}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 200ms ease',
    boxSizing: 'border-box',
    background: errors[field] ? '#fff5f5' : '#fafbfc',
  });

  const fields = [
    { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Ahmed Khan' },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'ahmed@example.com' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '8+ characters' },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
  ];

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
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '48px',
          maxWidth: '440px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        }}
      >
        {/* Brand Header */}
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
            Create Account
          </h1>
          <p style={{ fontSize: '14px', color: '#8a8f99' }}>
            Join ZameenTrace — Pakistan's Property Intelligence Platform
          </p>
        </div>

        {errors.submit && (
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
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSignup}>
          {fields.map((field) => (
            <div key={field.name} style={{ marginBottom: '16px' }}>
              <label
                htmlFor={field.name}
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
                {field.label}
              </label>
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                style={inputStyle(field.name)}
                onFocus={(e) => {
                  if (!errors[field.name]) e.target.style.borderColor = '#3d9d8f';
                }}
                onBlur={(e) => {
                  if (!errors[field.name]) e.target.style.borderColor = '#e8eaef';
                }}
              />
              {errors[field.name] && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}

          {/* Role selector */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="role"
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
              I am a...
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid #e8eaef',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                background: '#fafbfc',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
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
            {loading ? '⏳ Creating account...' : 'Create Account →'}
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
          Already have an account?{' '}
          <a
            href="/login"
            style={{
              color: '#3d9d8f',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Sign in →
          </a>
        </p>

        <p style={{ textAlign: 'center', marginTop: '8px' }}>
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
