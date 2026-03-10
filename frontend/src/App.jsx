import CompanionWidget from './components/CompanionWidget';
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Dashboard from './components/Dashboard';
import { Wallet } from './components/Wallet';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleSignUp = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">HuhlyHub</h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSignUp}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? '...' : 'Sign Up'}
              </button>
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? '...' : 'Sign In'}
              </button>
            </div>
          </div>
          <p className="mt-4 text-center text-gray-600 text-sm">
            By continuing, you agree to HuhlyHub's Terms of Service.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        {/* Temporary: Show Wallet above Dashboard */}
        <div className="mb-4">
          <Wallet />
        </div>
        <Dashboard />
      </div>
          <CompanionWidget />
</div>
  );
}

export default App;


