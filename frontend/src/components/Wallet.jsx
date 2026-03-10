import React from 'react';

export function Wallet() {
  return (
    <div className="wallet p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-2">Wallet</h2>
      <p>Balance: 0 HuhlyCoin</p>
      <section className="mt-4">
        <h3 className="font-semibold">Recent Transactions</h3>
        <p className="text-gray-500">No transactions yet</p>
      </section>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Buy Tokens
      </button>
    </div>
  );
}
