import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Dashboard from './Dashboard';

describe('Dashboard', () => {
  it('should render a welcome message', () => {
    render(<Dashboard />);
    expect(screen.getByText(/welcome to your dashboard/i)).toBeInTheDocument();
  });

  it('should display a revenue widget', () => {
    render(<Dashboard />);
    expect(screen.getByText(/revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/\$0/i)).toBeInTheDocument();
  });

  it('should display a pending tasks widget', () => {
    render(<Dashboard />);
    expect(screen.getByText(/pending tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/register your first content/i)).toBeInTheDocument();
  });
}
