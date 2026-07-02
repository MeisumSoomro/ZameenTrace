import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('./landing', () => function MockLandingPage() {
  return <main>ZameenTrace Landing</main>;
});

jest.mock('@/components/theme-toggle', () => function MockThemeToggle() {
  return <button type="button">Theme</button>;
});

import HomePage from './page';

describe('Home Page', () => {
  test('renders home page', () => {
    render(<HomePage />);
    expect(screen.getByText('ZameenTrace Landing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument();
  });
});
