const { Router } = require('express');
const { getDb } = require('../config/db');
const { bookingLimiter } = require('../middleware/rate-limit');
const { csrfProtect } = require('../middleware/csrf');
const { sendBookingNotification } = require('../config/mail');

const router = Router();

router.post('/booking/:username', bookingLimiter, csrfProtect, (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const db = getDb();
  const user = db.prepare('SELECT id, email FROM users WHERE username = ?').get(username);
  if (!user) return res.redirect(`/${username}?booked=error=User not found`);

  const data = {
    name: (req.body.name || '').trim(),
    phone: (req.body.phone || '').trim(),
    email: (req.body.email || '').trim(),
    location: (req.body.location || '').trim(),
    service: (req.body.service || '').trim(),
    guests: (req.body.guests || '').trim(),
    event_date: (req.body.event_date || '').trim(),
    travel: (req.body.travel || '').trim(),
    destination: (req.body.destination || '').trim(),
    notes: (req.body.notes || '').trim(),
  };

  if (!data.name || !data.phone) return res.redirect(`/${username}?booked=error=Name and phone required`);

  db.prepare('INSERT INTO bookings (user_id, data) VALUES (?, ?)').run(user.id, JSON.stringify(data));

  const row = db.prepare('SELECT data FROM user_content WHERE user_id = ?').get(user.id);
  const content = row ? JSON.parse(row.data) : {};
  const muaEmail = content.social && content.social.email ? content.social.email : user.email;
  sendBookingNotification(muaEmail, content.name || username, data).catch(e => console.error('Email send failed:', e.message));

  res.redirect(`/${username}?booked=success`);
});

module.exports = router;
