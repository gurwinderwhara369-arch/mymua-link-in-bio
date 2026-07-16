const { Router } = require('express');
const { getDb } = require('../config/db');
const { csrfProtect } = require('../middleware/csrf');
const bcrypt = require('bcrypt');

const router = Router();

function adminGuard(req, res, next) {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  const user = getDb().prepare('SELECT is_admin FROM users WHERE id = ?').get(req.session.userId);
  if (!user || !user.is_admin) return res.status(403).send('Forbidden');
  next();
}

router.use(adminGuard);

router.get('/', (req, res) => {
  const db = getDb();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const search = (req.query.search || '').trim();
  const limit = 20;
  const offset = (page - 1) * limit;

  let totalUsers, users;

  if (search) {
    const like = `%${search}%`;
    totalUsers = db.prepare('SELECT COUNT(*) as c FROM users WHERE username LIKE ? OR email LIKE ?').get(like, like).c;
    users = db.prepare('SELECT id, username, email, template_id, is_admin, created_at FROM users WHERE username LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(like, like, limit, offset);
  } else {
    totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    users = db.prepare('SELECT id, username, email, template_id, is_admin, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
  }
  const totalPages = Math.ceil(totalUsers / limit);

  const totalBookings = db.prepare('SELECT COUNT(*) as c FROM bookings').get().c;
  const usersWithBooking = db.prepare('SELECT COUNT(DISTINCT user_id) as c FROM bookings').get().c;
  const templateStats = db.prepare('SELECT template_id, COUNT(*) as c FROM users GROUP BY template_id').all();

  const msg = req.session.msg || null;
  const msgType = req.session.msgType || 'info';
  delete req.session.msg;
  delete req.session.msgType;

  const templateNames = {
    1: 'Twilight Glow', 2: 'Champagne Blush', 3: 'Editorial Edge',
    4: 'Editorial Luxe', 5: 'Bridal Romance', 6: 'Indian Bridal',
    7: 'Event Glamour', 8: 'Modern Classic', 9: 'Soft Radiance'
  };

  res.render('admin/index', {
    users, totalUsers, totalBookings, usersWithBooking,
    templateStats, templateNames,
    msg, msgType, page, totalPages, search, limit
  });
});

router.get('/user/:id', (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).send('User not found');
  const row = db.prepare('SELECT data FROM user_content WHERE user_id = ?').get(user.id);
  const content = row ? JSON.parse(row.data) : {};
  const bookings = db.prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  bookings.forEach(b => { b.data = JSON.parse(b.data); });

  const templateNames = {
    1: 'Twilight Glow', 2: 'Champagne Blush', 3: 'Editorial Edge',
    4: 'Editorial Luxe', 5: 'Bridal Romance', 6: 'Indian Bridal',
    7: 'Event Glamour', 8: 'Modern Classic', 9: 'Soft Radiance'
  };

  const msg = req.session.msg || null;
  const msgType = req.session.msgType || 'info';
  delete req.session.msg;
  delete req.session.msgType;

  res.render('admin/user', { user, content, bookings, templateNames, msg, msgType });
});

router.post('/user/:id/content', csrfProtect, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).send('Not found');

  const existing = db.prepare('SELECT data FROM user_content WHERE user_id = ?').get(user.id);
  let data = existing ? JSON.parse(existing.data) : {};
  data.basic = data.basic || {};
  data.social = data.social || {};

  data.basic.name = (req.body.name || '').trim();
  data.basic.title = (req.body.title || '').trim();
  data.basic.location = (req.body.location || '').trim();
  data.basic.phone = (req.body.phone || '').trim();
  data.social.instagram = (req.body.instagram || '').trim();
  data.social.whatsapp = (req.body.whatsapp || '').trim();
  data.social.phone = (req.body.social_phone || '').trim();
  data.social.email = (req.body.social_email || '').trim();

  if (existing) {
    db.prepare('UPDATE user_content SET data = ?, updated_at = datetime(\'now\') WHERE user_id = ?').run(JSON.stringify(data), user.id);
  } else {
    db.prepare('INSERT INTO user_content (user_id, data) VALUES (?, ?)').run(user.id, JSON.stringify(data));
  }

  req.session.msg = 'Profile updated';
  req.session.msgType = 'success';
  res.redirect(`/admin/user/${user.id}`);
});

router.post('/user/:id/password', csrfProtect, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).send('Not found');

  const newPass = (req.body.password || '').trim();
  if (newPass.length < 6) {
    req.session.msg = 'Password must be at least 6 characters';
    req.session.msgType = 'error';
    return res.redirect(`/admin/user/${user.id}`);
  }

  const hash = bcrypt.hashSync(newPass, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);

  req.session.msg = 'Password reset successful';
  req.session.msgType = 'success';
  res.redirect(`/admin/user/${user.id}`);
});

router.post('/user/:id/template', csrfProtect, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).send('Not found');

  const tid = parseInt(req.body.template_id, 10);
  if (tid < 1 || tid > 9) {
    req.session.msg = 'Invalid template ID (1-9)';
    req.session.msgType = 'error';
    return res.redirect(`/admin/user/${user.id}`);
  }

  db.prepare('UPDATE users SET template_id = ? WHERE id = ?').run(tid, user.id);

  req.session.msg = `Template changed to ${tid}`;
  req.session.msgType = 'success';
  res.redirect(`/admin/user/${user.id}`);
});

router.post('/user/:id/delete', csrfProtect, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).send('Not found');
  if (user.id === req.session.userId) {
    req.session.msg = 'Cannot delete yourself';
    req.session.msgType = 'error';
    return res.redirect('/admin');
  }

  db.prepare('DELETE FROM bookings WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM user_content WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM users WHERE id = ?').run(user.id);

  req.session.msg = 'User deleted';
  req.session.msgType = 'success';
  res.redirect('/admin');
});

router.post('/user/:id/toggle-admin', csrfProtect, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, is_admin FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).send('Not found');
  if (user.id === req.session.userId) {
    req.session.msg = 'Cannot demote yourself';
    req.session.msgType = 'error';
    return res.redirect('/admin');
  }
  db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(user.is_admin ? 0 : 1, user.id);

  req.session.msg = `Admin toggled for user`;
  req.session.msgType = 'success';
  res.redirect(`/admin/user/${user.id}`);
});

router.post('/booking/:id/status', csrfProtect, (req, res) => {
  const db = getDb();
  const booking = db.prepare('SELECT id, user_id FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).send('Booking not found');

  const status = req.body.status;
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).send('Invalid status');
  }

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, booking.id);

  req.session.msg = `Booking #${booking.id} marked as ${status}`;
  req.session.msgType = 'success';
  res.redirect(`/admin/user/${booking.user_id}`);
});

module.exports = router;
