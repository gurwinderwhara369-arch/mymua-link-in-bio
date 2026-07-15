const express = require('express');
const session = require('express-session');
const BetterSQLiteStore = require('./config/session-store')(session);
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/env');
const { loadUser } = require('./middleware/auth');
const { csrfToken } = require('./middleware/csrf');

const app = express();

// Trust proxy — behind Cloudflare Tunnel
app.set('trust proxy', 1);

// Logging
app.use(morgan(config.isProd ? 'combined' : 'dev'));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.tailwindcss.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'https:', 'data:'],
      connectSrc: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Body parsing
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.json({ limit: '5mb' }));

// Session
app.use(session({
  store: new BetterSQLiteStore(),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  name: 'mymua.sid',
  cookie: {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// Static files
app.use(express.static(path.resolve(__dirname, 'public')));

// EJS
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

// Global middleware
app.use(loadUser);
app.use(csrfToken);

// Routes
app.use('/', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/brochure'));
app.use('/', require('./routes/booking'));

// 404
app.use((req, res) => {
  res.status(404).render('404');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).render('500');
});

app.listen(config.port, () => {
  console.log(`Mymua SaaS running on http://localhost:${config.port}`);
});
