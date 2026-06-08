'use client';

import LandingPage from './landing';
import ThemeToggle from '@/components/theme-toggle';
import '../styles/zameentrace.css';
import '../styles/themes.css';

export default function HomePage() {
  return (
    <>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50 }}>
        <ThemeToggle />
      </div>
      <LandingPage />
    </>
  );
}
