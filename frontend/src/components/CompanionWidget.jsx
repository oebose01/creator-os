import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const COMPANION_API = 'http://localhost:3030';

export default function CompanionWidget() {
  const { user } = useAuth();
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Fetch a suggestion when user is idle or on certain actions
    // For demo, fetch every 30 seconds
    const interval = setInterval(() => {
      fetchSuggestion();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchSuggestion = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get(`${COMPANION_API}/api/suggest/${user.id}`);
      setSuggestion(res.data.suggestion);
      setVisible(true);
    } catch (err) {
      console.error('Companion error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user || !suggestion) return;
    try {
      await axios.post(`${COMPANION_API}/api/suggest/accept`, {
        userId: user.id,
        suggestion,
        accepted: true
      });
    } catch (err) {
      console.error('Failed to record acceptance:', err);
    }
    setVisible(false);
    // TODO: Execute the suggestion action
  };

  const handleDismiss = async () => {
    if (!user || !suggestion) return;
    try {
      await axios.post(`${COMPANION_API}/api/suggest/accept`, {
        userId: user.id,
        suggestion,
        accepted: false
      });
    } catch (err) {
      console.error('Failed to record dismissal:', err);
    }
    setVisible(false);
  };

  if (!visible || !suggestion) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-blue-200 dark:border-blue-900 p-4 z-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
        </div>
        <button onClick={() => setVisible(false)} className="ml-2 text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>
      <div className="mt-3 flex space-x-2">
        <button
          onClick={handleAccept}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Sure
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-sm rounded hover:bg-gray-300"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
