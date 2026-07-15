# Progress — Mymua Link-in-Bio SaaS

> Live tracking doc. Updated after every build session.

---

## ✅ Phase 1-3: Core MVP + Polish + Hardening — COMPLETE

| Task | Status | Notes |
|------|--------|-------|
| Project structure, `package.json`, `.env`, `.gitignore` | ✅ | |
| `server.js` — Express with Helmet, sessions, body parsers | ✅ | Fixed trust proxy, CSP config |
| `config/db.js` — SQLite with auto-migration | ✅ | users, user_content, bookings tables |
| `config/env.js` — env loader | ✅ | |
| `routes/auth.js` — register, login, logout | ✅ | bcrypt (cost 12), rate limited (10/15min) |
| `routes/dashboard.js` — all CRUD editors | ✅ | Profile, services, gallery, testimonials, social, templates, bookings |
| `middleware/auth.js` — session guard + loadUser | ✅ | Fixed: moved require to top |
| `middleware/csrf.js` — double-submit cookie CSRF | ✅ | On all dashboard + booking POST routes |
| `middleware/rate-limit.js` — auth, booking, dashboard limiters | ✅ | |
| `middleware/validate.js` — multer upload + sanitize | ✅ | Fixed: no longer strips `&"'` |
| `middleware/sanitize.js` — DOMPurify on render | ✅ | |
| `views/login.ejs`, `register.ejs`, `404.ejs`, `500.ejs` | ✅ | |
| `views/partials/dash-head.ejs` — sidebar + mobile nav | ✅ | |
| All 8 dashboard views (index, profile, services, gallery, testimonials, social, templates, bookings) | ✅ | |
| `views/templates/template-1.ejs` (dark sunset / daisyUI) | ✅ | EJS with dynamic content, booking submits to backend |
| `views/templates/template-2.ejs` (champagne blush) | ✅ | From `brochure/index.html`, booking submits to backend |
| `views/templates/template-3.ejs` (editorial edge) | ✅ | From `brochure2/index.html`, booking submits to backend |
| `routes/brochure.js` — GET /:username + subdomain routing | ✅ | Renders selected template + booking status messages |
| `routes/booking.js` — POST /booking/:username | ✅ | CSRF protected, saves to DB, sends email notification |
| Static assets (compiled CSS/JS for all 3 templates) | ✅ | In `public/css/` and `public/js/` |
| `scripts/seed.js` — demo data for anika + zara | ✅ | |
| Full flow tested: register → login → dashboard → template switch → /username | ✅ | All endpoints return 200 |
| Email notification (nodemailer + Gmail SMTP) | ✅ | Sends to MUA on new booking |
| Helmet CSP + security headers | ✅ | |
| Morgan request logging | ✅ | dev/combined based on NODE_ENV |
| Subdomain routing (`*.mymua.in`) | ✅ | Requires Cloudflare Tunnel wildcard route |

---

## 🔮 Phase 4: Growth (post-MVP)

| Task | Status | Notes |
|------|--------|-------|
| Forgot password | ❌ | Not built |
| express-validator on all forms | ❌ | Not built |
| Payment integration | ⬜ | Stripe/Razorpay |
| Custom domain mapping | ⬜ | |
| Analytics | ⬜ | |
| Referral system | ⬜ | |
| SEO meta tags | ⬜ | |
| New templates | ⬜ | |
| Mobile QA pass | ⬜ | |
| Accessibility pass | ⬜ | |
| SQLite daily backup | ⬜ | |

---

## Changelog

| Date | Change |
|------|--------|
| Session 1 | Initial scaffold: server.js, db, auth, all middleware, all dashboard views, template-1.ejs |
| Session 2 | template-2.ejs + template-3.ejs created. Fixed connect-sqlite3 → custom BetterSQLiteStore. Fixed dash-head EJS path scope. Fixed missing `updated_at` column. Seed script. |
| Session 3 | Added subdomain routing (`anika.mymua.in/`). Fixed critical bugs: booking form now submits to backend (not Web3Forms), username case normalization, `@` prefix removed from all dashboard links, CSRF added to booking route, middleware optimized, sanitizer fixed. Audit report generated. |
