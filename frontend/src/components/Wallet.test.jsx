import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Wallet from './Wallet';

// Mock the auth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Wallet', () => {
  const mockUser = { id: 'test-user-123' };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: authenticated, not loading
    const { useAuth } = require('../hooks/useAuth');
    useAuth.mockReturnValue({ user: mockUser, loading: false });
  });

  it('shows loading state while auth is loading', () => {
    const { useAuth } = require('../hooks/useAuth');
    useAuth.mockReturnValue({ user: null, loading: true });
    render(<Wallet />);
    expect(screen.getByText('Loading user...')).toBeInTheDocument();
  });

  it('prompts login if no user', () => {
    const { useAuth } = require('../hooks/useAuth');
    useAuth.mockReturnValue({ user: null, loading: false });
    render(<Wallet />);
    expect(screen.getByText('Please log in to view your wallet.')).toBeInTheDocument();
  });

  it('fetches and displays balance on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ balance: 250 })
    });
    render(<Wallet />);
    await waitFor(() => {
      expect(screen.getByText('250 HuhlyCoin')).toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/balance/test-user-123',
      expect.any(Object)
    );
  });

  it('handles fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    render(<Wallet />);
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('calls Stripe checkout on buy with stripe method', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ balance: 0 }) }); // balance fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: 'https://checkout.stripe.com/test' })
    });
    // Mock window.location
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };

    render(<Wallet />);
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1)); // balance fetched

    const input = screen.getByPlaceholderText('Amount');
    await userEvent.type(input, '50');
    const buyButton = screen.getByText('Buy');
    await userEvent.click(buyButton);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/create-stripe-checkout',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ amount: 50, userId: 'test-user-123' })
      })
    );
    await waitFor(() => {
      expect(window.location.href).toBe('https://checkout.stripe.com/test');
    });

    window.location = originalLocation;
  });

  // Additional tests for lightning and internal methods can be added similarly
});
