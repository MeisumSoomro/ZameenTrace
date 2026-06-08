'use client';

import { useState, useEffect } from 'react';

export default function MobileOptimizedLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Add viewport meta tag dynamically if needed
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content =
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  );
}

export function ResponsiveContainer({ children, maxWidth = '1400px' }) {
  return (
    <div
      style={{
        maxWidth,
        margin: '0 auto',
        width: '100%',
        padding: '0 var(--spacing-md)',
      }}
    >
      {children}
    </div>
  );
}

export function ResponsiveGrid({ children, cols = 3, gap = '24px' }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${100 / cols}%, 300px), 1fr))`,
        gap,
      }}
    >
      {children}
    </div>
  );
}
