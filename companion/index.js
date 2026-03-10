const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.COMPANION_PORT || 3030;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./companion.db');
db.serialize(() => {
  // Create table for user preferences/events
  db.run(`CREATE TABLE IF NOT EXISTS user_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    event_type TEXT,
    context TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create table for suggestions (to measure acceptance)
  db.run(`CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    suggestion TEXT,
    accepted BOOLEAN,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Simple endpoint to log events
app.post('/api/event', (req, res) => {
  const { userId, eventType, context } = req.body;
  db.run(
    'INSERT INTO user_events (user_id, event_type, context) VALUES (?, ?, ?)',
    [userId, eventType, context],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Get a proactive suggestion (very basic for now)
app.get('/api/suggest/:userId', (req, res) => {
  const { userId } = req.params;
  // Dummy suggestion – later will be ML‑based
  const suggestions = [
    'You often create videos on Wednesdays – want me to prepare your editing tools?',
    'Your last project used these assets – shall I re‑import them?',
    'It looks like you’re starting a new track – need some royalty‑free samples?'
  ];
  const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  res.json({ suggestion });
});

// Record if suggestion was accepted
app.post('/api/suggest/accept', (req, res) => {
  const { userId, suggestion, accepted } = req.body;
  db.run(
    'INSERT INTO suggestions (user_id, suggestion, accepted) VALUES (?, ?, ?)',
    [userId, suggestion, accepted],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.listen(port, () => {
  console.log(`🤖 Companion service running on port ${port}`);
});
