// frontend/app/signup.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import '../styles/zameentrace.css';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
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
    const result = await apiClient.signup(
      formData.email,
      formData.password,
      formData.name
    );

    if (result.success) {
      localStorage.setItem('authToken', result.data.token);
      apiClient.setToken(result.data.token);
      router.push('/dashboard');
    } else {
      setErrors({ submit: result.error || 'Signup failed. Please try again.' });
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
          Create Account
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#8a8f99',
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          Join ZameenTrace today
        </p>

        {errors.submit && (
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
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSignup}>
          {['name', 'email', 'password', 'confirmPassword'].map((field) => (
            <div key={field} style={{ marginBottom: '16px' }}>
              <label
                htmlFor={field}
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: '#1a1f2e',
                }}
              >
                {field === 'confirmPassword' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                id={field}
                type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors[field] ? '2px solid #ef4444' : '1px solid #e8eaef',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
              {errors[field] && (
                <p
                  style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    marginTop: '4px',
                  }}
                >
                  {errors[field]}
                </p>
              )}
            </div>
          ))}

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
              marginTop: '8px',
            }}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
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
              fontWeight: 600,
            }}
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
