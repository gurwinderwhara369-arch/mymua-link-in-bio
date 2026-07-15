const { Router } = require('express');
const { getDb } = require('../config/db');
const { csrfProtect } = require('../middleware/csrf');

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
  const users = db.prepare('SELECT id, username, email, template_id, is_admin, created_at FROM users ORDER BY created_at DESC').all();
  const totalUsers = users.length;
  const totalBookings = db.prepare('SELECT COUNT(*) as c FROM bookings').get().c;
  const usersWithBooking = db.prepare('SELECT COUNT(DISTINCT user_id) as c FROM bookings').get().c;
  const templateStats = db.prepare('SELECT template_id, COUNT(*) as c FROM users GROUP BY template_id').all();
  res.render('admin/index', { users, totalUsers, totalBookings, usersWithBooking, templateStats, msg: req.query.msg || null });
});

router.get('/user/:id', (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).send('User not found');
  const content = db.prepare('SELECT data FROM user_content WHERE user_id = ?').get(user.id);
  const bookings = db.prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  bookings.forEach(b => { b.data = JSON.parse(b.data); });
  res.render('admin/user', { user, content: content ? JSON.parse(content.data) : {}, bookings });
});

router.post('/user/:id/toggle-admin', csrfProtect, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, is_admin FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).send('Not found');
  if (user.id === req.session.userId) return res.redirect('/admin?msg=cannot-demote-self');
  db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(user.is_admin ? 0 : 1, user.id);
  res.redirect(`/admin/user/${user.id}`);
});

module.exports = router;
