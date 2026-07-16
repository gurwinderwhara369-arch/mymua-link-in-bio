const { Router } = require('express');
const { getDb } = require('../config/db');
const { sanitizeUserContent } = require('../middleware/sanitize');

const router = Router();

// Demo preview: /demo?template=N renders that template with a demo user
router.get('/demo', (req, res, next) => {
  const db = getDb();
  const tid = parseInt(req.query.template, 10);
  if (tid < 1 || tid > 9) return res.redirect('/demo?template=1');

  const demoUser = db.prepare('SELECT username FROM users WHERE template_id = ? ORDER BY id LIMIT 1').get(tid);
  if (!demoUser) return next();

  req.params = { username: demoUser.username };
  return renderBrochure(req, res, next);
});

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
  content.social = content.social || {};
  content.services = content.services || [];
  content.gallery = content.gallery || [];
  content.testimonials = content.testimonials || [];
  content.basic = content.basic || {};

  const templateMap = { 1: 'template-1', 2: 'template-2', 3: 'template-3', 4: 'template-4', 5: 'template-5', 6: 'template-6', 7: 'template-7', 8: 'template-8', 9: 'template-9' };
  const template = templateMap[user.template_id] || 'template-1';

  res.render(`templates/${template}`, {
    user: content,
    username: user.username,
    bookingStatus: req.query.booked || null,
  });
}

module.exports = router;
