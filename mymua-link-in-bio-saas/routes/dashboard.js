const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../config/db');
const { authGuard } = require('../middleware/auth');
const { csrfProtect } = require('../middleware/csrf');
const { dashboardLimiter } = require('../middleware/rate-limit');
const { upload, sanitize } = require('../middleware/validate');

const router = Router();
router.use(authGuard);
router.use(dashboardLimiter);
router.use(csrfProtect);

router.use((req, res, next) => {
  res.locals.error = req.session.error || null;
  delete req.session.error;
  next();
});

function fail(req, res, msg) {
  req.session.error = msg;
  res.redirect(req.originalUrl);
}

function getContent(userId) {
  const row = getDb().prepare('SELECT data FROM user_content WHERE user_id = ?').get(userId);
  return row ? JSON.parse(row.data) : {};
}

function saveContent(userId, data) {
  getDb().prepare('UPDATE user_content SET data = ? WHERE user_id = ?').run(JSON.stringify(data), userId);
}

router.get('/', (req, res) => {
  const content = getContent(req.session.userId);
  const user = res.locals.user;
  const bookingCount = getDb().prepare('SELECT COUNT(*) as c FROM bookings WHERE user_id = ?').get(req.session.userId).c;
  res.render('dashboard/index', { content, user, bookingCount });
});

router.get('/profile', (req, res) => {
  res.render('dashboard/profile', { content: getContent(req.session.userId), user: res.locals.user, error: res.locals.error });
});

router.post('/profile', upload.single('photo'), [
  body('name').notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('bio').optional().isLength({ max: 1000 }).withMessage('Bio too long'),
  body('location').optional().isLength({ max: 200 }).withMessage('Location too long'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(req, res, errors.array().map(e => e.msg).join(', '));
  const content = getContent(req.session.userId);
  content.name = sanitize(req.body.name || content.name);
  content.title = sanitize(req.body.title || '');
  content.bio = sanitize(req.body.bio || content.bio);
  content.location = sanitize(req.body.location || '');
  if (req.file) content.photo = `/uploads/${req.session.userId}/${req.file.filename}`;
  saveContent(req.session.userId, content);
  res.redirect('/dashboard/profile');
});

router.get('/services', (req, res) => {
  res.render('dashboard/services', { content: getContent(req.session.userId), user: res.locals.user, error: res.locals.error });
});

router.post('/services', [
  body('action').isIn(['add', 'edit', 'delete']).withMessage('Invalid action'),
  body('name').if(body('action').equals('add')).notEmpty().withMessage('Service name required').isLength({ max: 100 }),
  body('index').if(body('action').equals('edit') || body('action').equals('delete')).isInt({ min: 0 }).withMessage('Invalid index'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(req, res, errors.array().map(e => e.msg).join(', '));
  const content = getContent(req.session.userId);
  const action = req.body.action;
  if (action === 'add') {
    content.services.push({
      name: sanitize(req.body.name || ''),
      price: sanitize(req.body.price || ''),
      desc: sanitize(req.body.desc || ''),
    });
  } else if (action === 'edit') {
    const idx = parseInt(req.body.index);
    if (idx >= 0 && idx < content.services.length) {
      content.services[idx] = {
        name: sanitize(req.body.name || content.services[idx].name),
        price: sanitize(req.body.price || content.services[idx].price),
        desc: sanitize(req.body.desc || content.services[idx].desc),
      };
    }
  } else if (action === 'delete') {
    const idx = parseInt(req.body.index);
    if (idx >= 0 && idx < content.services.length) content.services.splice(idx, 1);
  }
  saveContent(req.session.userId, content);
  res.redirect('/dashboard/services');
});

router.get('/gallery', (req, res) => {
  res.render('dashboard/gallery', { content: getContent(req.session.userId), user: res.locals.user, error: res.locals.error });
});

router.post('/gallery/upload', upload.array('images', 20), (req, res) => {
  const content = getContent(req.session.userId);
  if (req.files) {
    req.files.forEach(f => {
      content.gallery.push({
        url: `/uploads/${req.session.userId}/${f.filename}`,
        alt: sanitize(req.body.alt || ''),
      });
    });
  }
  saveContent(req.session.userId, content);
  res.redirect('/dashboard/gallery');
});

router.post('/gallery/delete', (req, res) => {
  const content = getContent(req.session.userId);
  const idx = parseInt(req.body.index);
  if (idx >= 0 && idx < content.gallery.length) content.gallery.splice(idx, 1);
  saveContent(req.session.userId, content);
  res.redirect('/dashboard/gallery');
});

router.get('/testimonials', (req, res) => {
  res.render('dashboard/testimonials', { content: getContent(req.session.userId), user: res.locals.user, error: res.locals.error });
});

router.post('/testimonials', [
  body('action').isIn(['add', 'edit', 'delete']).withMessage('Invalid action'),
  body('name').if(body('action').equals('add')).notEmpty().withMessage('Name required').isLength({ max: 100 }),
  body('index').if(body('action').equals('edit') || body('action').equals('delete')).isInt({ min: 0 }).withMessage('Invalid index'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(req, res, errors.array().map(e => e.msg).join(', '));
  const content = getContent(req.session.userId);
  const action = req.body.action;
  if (action === 'add') {
    content.testimonials.push({
      name: sanitize(req.body.name || ''),
      text: sanitize(req.body.text || ''),
      event: sanitize(req.body.event || ''),
    });
  } else if (action === 'edit') {
    const idx = parseInt(req.body.index);
    if (idx >= 0 && idx < content.testimonials.length) {
      content.testimonials[idx] = {
        name: sanitize(req.body.name || content.testimonials[idx].name),
        text: sanitize(req.body.text || content.testimonials[idx].text),
        event: sanitize(req.body.event || content.testimonials[idx].event),
      };
    }
  } else if (action === 'delete') {
    const idx = parseInt(req.body.index);
    if (idx >= 0 && idx < content.testimonials.length) content.testimonials.splice(idx, 1);
  }
  saveContent(req.session.userId, content);
  res.redirect('/dashboard/testimonials');
});

router.get('/social', (req, res) => {
  res.render('dashboard/social', { content: getContent(req.session.userId), user: res.locals.user, error: res.locals.error });
});

router.post('/social', [
  body('email').optional().isEmail().withMessage('Invalid email').normalizeEmail(),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('whatsapp').optional().isMobilePhone().withMessage('Invalid WhatsApp number'),
  body('instagram').optional().isLength({ max: 30 }).withMessage('Instagram handle too long'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(req, res, errors.array().map(e => e.msg).join(', '));
  const content = getContent(req.session.userId);
  content.social.phone = sanitize(req.body.phone || '');
  content.social.whatsapp = sanitize(req.body.whatsapp || '');
  content.social.instagram = sanitize(req.body.instagram || '');
  content.social.email = sanitize(req.body.email || '');
  saveContent(req.session.userId, content);
  res.redirect('/dashboard/social');
});

router.get('/templates', (req, res) => {
  res.render('dashboard/templates', { content: getContent(req.session.userId), user: res.locals.user, currentTemplate: res.locals.user.template_id });
});

router.post('/templates', (req, res) => {
  const tid = parseInt(req.body.template_id);
  if (tid >= 1 && tid <= 9) {
    getDb().prepare('UPDATE users SET template_id = ? WHERE id = ?').run(tid, req.session.userId);
  }
  res.redirect('/dashboard/templates');
});

router.get('/bookings', (req, res) => {
  const bookings = getDb().prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC').all(req.session.userId);
  bookings.forEach(b => { b.data = JSON.parse(b.data); });
  res.render('dashboard/bookings', { bookings, user: res.locals.user });
});

module.exports = router;
