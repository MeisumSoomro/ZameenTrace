import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/app-shell', () => ({
  AppShell: () => <div>Farmer App</div>,
}));

import HomePage from './page';

describe('Home Page', () => {
  test('renders home page', () => {
    render(<HomePage />);
    expect(screen.getByText('Farmer App')).toBeInTheDocument();
  });
});
