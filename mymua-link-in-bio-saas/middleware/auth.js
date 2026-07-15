const { getDb } = require('../config/db');

function authGuard(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

function loadUser(req, res, next) {
  if (req.session && req.session.userId) {
    const user = getDb().prepare('SELECT id, username, email, template_id FROM users WHERE id = ?').get(req.session.userId);
    res.locals.user = user || null;
  } else {
    res.locals.user = null;
  }
  next();
}

module.exports = { authGuard, loadUser };
