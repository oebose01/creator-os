import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompanionWidget from './CompanionWidget';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user' } })
}));

// Mock axios
vi.mock('axios');
import axios from 'axios';

describe('CompanionWidget', () => {
  it('fetches and displays a suggestion', async () => {
    axios.get.mockResolvedValueOnce({ data: { suggestion: 'Test suggestion' } });
    render(<CompanionWidget />);
    await waitFor(() => {
      expect(screen.getByText('Test suggestion')).toBeInTheDocument();
    });
  });

  it('records acceptance when user clicks Sure', async () => {
    axios.get.mockResolvedValueOnce({ data: { suggestion: 'Accept me' } });
    axios.post.mockResolvedValueOnce({});
    render(<CompanionWidget />);
    await waitFor(() => {
      expect(screen.getByText('Accept me')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Sure'));
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3030/api/suggest/accept',
      expect.objectContaining({ accepted: true })
    );
  });

  it('records dismissal when user clicks Not now', async () => {
    axios.get.mockResolvedValueOnce({ data: { suggestion: 'Dismiss me' } });
    axios.post.mockResolvedValueOnce({});
    render(<CompanionWidget />);
    await waitFor(() => {
      expect(screen.getByText('Dismiss me')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Not now'));
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3030/api/suggest/accept',
      expect.objectContaining({ accepted: false })
    );
  });
});
