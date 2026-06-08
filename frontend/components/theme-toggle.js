// frontend/components/theme-toggle.js
'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;

    if (newTheme === 'dark') {
      root.style.setProperty('--color-bg-primary', '#0f1419');
      root.style.setProperty('--color-bg-secondary', '#1a1f2e');
      root.style.setProperty('--color-bg-tertiary', '#252d3d');
      root.style.setProperty('--color-text-primary', '#f5f7fa');
      root.style.setProperty('--color-text-secondary', '#a0a8b8');
      root.style.setProperty('--color-border', '#2d3544');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      root.style.setProperty('--color-bg-primary', '#ffffff');
      root.style.setProperty('--color-bg-secondary', '#f5f7fa');
      root.style.setProperty('--color-bg-tertiary', '#e8eaef');
      root.style.setProperty('--color-text-primary', '#1a1f2e');
      root.style.setProperty('--color-text-secondary', '#8a8f99');
      root.style.setProperty('--color-border', '#e8eaef');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        newTheme === 'dark' ? '#1a1f2e' : '#ffffff'
      );
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        padding: '8px 12px',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'all 300ms ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-bg-tertiary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--color-bg-secondary)';
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
      <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
}

export default ThemeToggle;
