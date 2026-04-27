/**
 * PixelMind AI — Optional Node.js Backend
 * For when you need real persistence, auth, and multi-user support
 * Deploy free on: Railway / Render / Fly.io
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

// ─── MIDDLEWARE ───
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── DATABASE (SQLite - zero cost) ───
const db = new Database(process.env.DB_PATH || './pixelmind.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    credits INTEGER DEFAULT 50,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    canvas_data TEXT,
    thumbnail TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS gallery (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    prompt TEXT,
    image_url TEXT,
    params TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS edit_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id TEXT,
    action TEXT NOT NULL,
    data TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// ─── AUTH MIDDLEWARE ───
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// ─── AUTH ROUTES ───
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password too short' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const id = generateId();
  db.prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)').run(id, name, email, hash);
  const token = jwt.sign({ id, name, email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id, name, email, credits: 50, plan: 'free' } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !await bcrypt.compare(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, credits: user.credits, plan: user.plan } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, email, credits, plan FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// ─── PROJECTS ───
app.get('/api/projects', authMiddleware, (req, res) => {
  const projects = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC').all(req.user.id);
  res.json(projects);
});

app.post('/api/projects', authMiddleware, (req, res) => {
  const { name, canvasData, thumbnail } = req.body;
  const id = generateId();
  db.prepare('INSERT INTO projects (id, user_id, name, canvas_data, thumbnail) VALUES (?, ?, ?, ?, ?)').run(id, req.user.id, name, canvasData, thumbnail);
  res.json({ id, name, created_at: new Date().toISOString() });
});

app.put('/api/projects/:id', authMiddleware, (req, res) => {
  const { name, canvasData, thumbnail } = req.body;
  db.prepare('UPDATE projects SET name = ?, canvas_data = ?, thumbnail = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?')
    .run(name, canvasData, thumbnail, req.params.id, req.user.id);
  res.json({ ok: true });
});

app.delete('/api/projects/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// ─── GALLERY ───
app.get('/api/gallery', authMiddleware, (req, res) => {
  const { type } = req.query;
  const q = type && type !== 'all'
    ? db.prepare('SELECT * FROM gallery WHERE user_id = ? AND type = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id, type)
    : db.prepare('SELECT * FROM gallery WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  res.json(q);
});

app.post('/api/gallery', authMiddleware, (req, res) => {
  const { type, prompt, imageUrl, params } = req.body;
  const id = generateId();
  db.prepare('INSERT INTO gallery (id, user_id, type, prompt, image_url, params) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, req.user.id, type, prompt, imageUrl, JSON.stringify(params || {}));
  res.json({ id });
});

// ─── CREDITS ───
app.post('/api/credits/deduct', authMiddleware, (req, res) => {
  const { amount } = req.body;
  const user = db.prepare('SELECT credits FROM users WHERE id = ?').get(req.user.id);
  if (!user || user.credits < amount) return res.status(402).json({ error: 'Insufficient credits' });
  db.prepare('UPDATE users SET credits = credits - ? WHERE id = ?').run(amount, req.user.id);
  const updated = db.prepare('SELECT credits FROM users WHERE id = ?').get(req.user.id);
  res.json({ credits: updated.credits });
});

// ─── AI PROXY (forward to local SD/ComfyUI without CORS issues) ───
app.post('/api/ai/proxy', authMiddleware, async (req, res) => {
  const { endpoint, payload, backendUrl } = req.body;
  try {
    const upstream = await fetch(backendUrl + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(300000) // 5 min timeout
    });
    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Backend unreachable: ' + err.message });
  }
});

// ─── ADMIN ROUTES ───
const adminMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    req.user = payload; next();
  } catch { res.status(401).json({ error: 'Unauthorized' }); }
};

app.get('/api/admin/stats', adminMiddleware, (req, res) => {
  const stats = {
    totalUsers: db.prepare('SELECT COUNT(*) as c FROM users').get().c,
    totalProjects: db.prepare('SELECT COUNT(*) as c FROM projects').get().c,
    totalGenerations: db.prepare('SELECT COUNT(*) as c FROM gallery').get().c,
    recentUsers: db.prepare('SELECT id, name, email, plan, credits, created_at FROM users ORDER BY created_at DESC LIMIT 10').all(),
  };
  res.json(stats);
});

// ─── CATCH ALL ───
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║  PixelMind AI Backend running        ║
  ║  http://localhost:${PORT}               ║
  ║  SQLite DB: ./pixelmind.db           ║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;
