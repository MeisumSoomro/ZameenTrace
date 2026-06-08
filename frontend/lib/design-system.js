// lib/design-system.js
// ZameenTrace Design System - Premium Property Intelligence Platform

export const colors = {
  // Primary palette - deep, sophisticated, trustworthy
  charcoal: '#1a1f2e',
  'slate-black': '#0f1419',
  'dark-emerald': '#0d3d2d',
  'muted-teal': '#2a5f52',
  
  // Accents - subtle, refined
  'teal-accent': '#3d9d8f',
  'silver-accent': '#8a8f99',
  'light-gray': '#e8eaef',
  'pale-gray': '#f5f7fa',
  
  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Glassmorphism
  'glass-light': 'rgba(255, 255, 255, 0.08)',
  'glass-dark': 'rgba(0, 0, 0, 0.15)',
};

export const typography = {
  // Headings - clean, authoritative
  h1: {
    fontSize: '56px',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '42px',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '32px',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  
  // Body - readable, precise
  body: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  'body-sm': {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  
  // Special
  label: {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.12)',
  md: '0 4px 12px rgba(0, 0, 0, 0.15)',
  lg: '0 12px 32px rgba(0, 0, 0, 0.2)',
  'inset-lg': 'inset 0 0 32px rgba(255, 255, 255, 0.05)',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};
