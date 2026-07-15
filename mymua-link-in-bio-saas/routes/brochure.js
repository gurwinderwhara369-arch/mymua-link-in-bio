const { Router } = require('express');
const { getDb } = require('../config/db');
const { sanitizeUserContent } = require('../middleware/sanitize');

const router = Router();

// Subdomain routing: anika.mymua.in/ → username = anika
router.use((req, res, next) => {
  const host = req.headers.host || '';
  const parts = host.split('.');
  if (parts.length >= 3 && parts[0] !== 'www') {
    req.subdomainUsername = parts[0].toLowerCase().trim();
  }
  next();
});

router.get('/', (req, res, next) => {
  if (req.subdomainUsername) {
    req.params.username = req.subdomainUsername;
    return renderBrochure(req, res, next);
  }
  next();
});

router.get('/:username', (req, res, next) => {
  const username = req.params.username.toLowerCase().trim();
  if (username.startsWith('favicon') || username.startsWith('robots') || username.startsWith('sitemap')) return next();
  renderBrochure(req, res, next);
});

function renderBrochure(req, res, next) {
  const username = req.params.username.toLowerCase().trim();

  const db = getDb();
  const user = db.prepare('SELECT id, username, template_id FROM users WHERE username = ?').get(username);
  if (!user) return next();

  const row = db.prepare('SELECT data FROM user_content WHERE user_id = ?').get(user.id);
  const content = row ? sanitizeUserContent(JSON.parse(row.data)) : {};

  const templateMap = { 1: 'template-1', 2: 'template-2', 3: 'template-3' };
  const template = templateMap[user.template_id] || 'template-1';

  res.render(`templates/${template}`, {
    user: content,
    username: user.username,
    bookingStatus: req.query.booked || null,
  });
}

module.exports = router;
