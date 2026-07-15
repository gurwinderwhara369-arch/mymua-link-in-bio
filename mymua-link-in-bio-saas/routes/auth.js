const { Router } = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { getDb } = require('../config/db');
const { authLimiter } = require('../middleware/rate-limit');
const { getTransporter } = require('../config/mail');

const router = Router();

router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { error: null, reset: req.query.reset === 'done' });
});

router.post('/login', authLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.render('login', { error: 'Email and password required' });

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.render('login', { error: 'Invalid email or password' });
  }

  req.session.userId = user.id;
  req.session.save(() => res.redirect('/dashboard'));
});

router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('register', { error: null });
});

router.post('/register', authLimiter, (req, res) => {
  const username = (req.body.username || '').toLowerCase().trim();
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';
  if (!username || !email || !password) return res.render('register', { error: 'All fields required' });
  if (password.length < 8) return res.render('register', { error: 'Password must be at least 8 characters' });
  if (!/^[a-z0-9_]{3,30}$/.test(username)) return res.render('register', { error: 'Username: 3-30 chars, letters/numbers/underscore only' });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) return res.render('register', { error: 'Username or email already taken' });

  const hash = bcrypt.hashSync(password, 12);
  const info = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, hash);
  db.prepare('INSERT INTO user_content (user_id, data) VALUES (?, ?)').run(info.lastInsertRowid, JSON.stringify(getDefaultContent(username)));

  req.session.userId = info.lastInsertRowid;
  req.session.save(() => res.redirect('/dashboard'));
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

router.get('/forgot', (req, res) => {
  res.render('forgot', { error: null, sent: false });
});

router.post('/forgot', authLimiter, (req, res) => {
  const email = (req.body.email || '').trim();
  if (!email) return res.render('forgot', { error: 'Email required', sent: false });

  const db = getDb();
  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
  if (!user) return res.render('forgot', { error: 'No account with that email', sent: false });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 3600000;
  db.prepare('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?').run(token, expires, user.id);

  const t = getTransporter();
  if (t) {
    const resetUrl = `${req.protocol}://${req.headers.host}/reset/${token}`;
    t.sendMail({
      from: process.env.SMTP_FROM || 'noreply@mymua.com',
      to: user.email,
      subject: 'Reset your Mymua password',
      html: `<div style="font-family:sans-serif;max-width:500px"><h2>Password Reset</h2><p>Click this link to reset your password (expires in 1 hour):</p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#18181b;color:#fff;text-decoration:none;border-radius:8px;margin:16px 0">Reset Password</a><p style="color:#888;font-size:12px">If you didn't request this, ignore this email.</p></div>`
    }).catch(e => console.error('Reset email send failed:', e.message));
  }

  res.render('forgot', { error: null, sent: true });
});

router.get('/reset/:token', (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE reset_token = ? AND reset_expires > ?').get(req.params.token, Date.now());
  if (!user) return res.render('forgot', { error: 'Invalid or expired reset link', sent: false });
  res.render('reset', { token: req.params.token, error: null });
});

router.post('/reset/:token', authLimiter, (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 8) return res.render('reset', { token: req.params.token, error: 'Password must be at least 8 characters' });

  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE reset_token = ? AND reset_expires > ?').get(req.params.token, Date.now());
  if (!user) return res.render('forgot', { error: 'Invalid or expired reset link', sent: false });

  const hash = bcrypt.hashSync(password, 12);
  db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?').run(hash, user.id);
  res.redirect('/login?reset=done');
});

function getDefaultContent(username) {
  return {
    name: username,
    title: 'Bridal Makeup Artist',
    bio: 'Professional bridal makeup artist dedicated to making every bride feel beautiful on her special day.',
    photo: '',
    location: '',
    services: [
      { name: 'Bridal', price: '₹15,000+', desc: 'Full bridal makeup' },
      { name: 'Engagement', price: '₹10,000+', desc: 'Engagement & sangeet' },
      { name: 'Reception', price: '₹12,000+', desc: 'Evening reception glam' },
    ],
    gallery: [],
    testimonials: [],
    social: { phone: '', whatsapp: '', instagram: '', email: '' },
  };
}

module.exports = router;
