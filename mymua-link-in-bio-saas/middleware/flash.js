function flash(req, res, next) {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
}

function setFlash(req, message) {
  req.session.flash = message;
}

module.exports = { flash, setFlash };
