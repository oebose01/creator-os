import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Wallet } from './Wallet';

describe('Wallet', () => {
  it('displays the current token balance', () => {
    render(<Wallet />);
    const balanceElement = screen.getByText(/Balance: 0 HuhlyCoin/i);
    expect(balanceElement).toBeInTheDocument();
  });

  it('shows a list of recent transactions (placeholder)', () => {
    render(<Wallet />);
    const transactionsHeading = screen.getByText(/Recent Transactions/i);
    expect(transactionsHeading).toBeInTheDocument();
    const placeholder = screen.getByText(/No transactions yet/i);
    expect(placeholder).toBeInTheDocument();
  });

  it('contains a button to buy tokens', () => {
    render(<Wallet />);
    const buyButton = screen.getByRole('button', { name: /Buy Tokens/i });
    expect(buyButton).toBeInTheDocument();
  });
});
