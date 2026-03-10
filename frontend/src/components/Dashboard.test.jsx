import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Dashboard from './Dashboard';

describe('Dashboard', () => {
  it('should render a welcome message', () => {
    render(<Dashboard />);
    expect(screen.getByText(/welcome to your dashboard/i)).toBeInTheDocument();
  });

  it('should display a revenue widget', () => {
    render(<Dashboard />);
    const revenueHeading = screen.getByText(/revenue/i);
    const revenueWidget = revenueHeading.closest('div');
    expect(within(revenueWidget).getByText(/\$0/i)).toBeInTheDocument();
  });

  it('should display a pending tasks widget', () => {
    render(<Dashboard />);
    expect(screen.getByText(/pending tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/register your first content/i)).toBeInTheDocument();
  });

  it('should display a content performance widget', () => {
    render(<Dashboard />);
    expect(screen.getByText(/content performance/i)).toBeInTheDocument();
    expect(screen.getByText(/views: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/likes: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/earnings: \$0/i)).toBeInTheDocument();
  });

  it('should display an AI activity log widget', () => {
    render(<Dashboard />);
    expect(screen.getByText(/AI activity log/i)).toBeInTheDocument();
    expect(screen.getByText(/generated a social post/i)).toBeInTheDocument();
  });

  it('should have drag handles for each widget', () => {
    render(<Dashboard />);
    const dragHandles = screen.getAllByRole('button', { name: /drag/i });
    expect(dragHandles.length).toBe(4);
  });
});
