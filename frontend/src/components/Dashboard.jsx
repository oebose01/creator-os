import React from 'react';

function Dashboard() {
  return (
    <div>
      <h1>Welcome to your dashboard</h1>
            <div>
              <h2>Revenue</h2>
              <p>$0</p>
            </div>
      <div>
        <h2>Pending Tasks</h2>
        <ul>
          <li>Register your first content</li>
          <li>Verify your email</li>
          <li>Connect your wallet</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
