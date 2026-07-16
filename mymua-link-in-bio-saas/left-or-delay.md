# Left or Delay — Backlog

## HIGH PRIORITY

- [ ] **Fix demo user passwords (bcrypt)**
  naina/priya/kavya/ria/meera/diya have `password_hash = 'demo1234'` in plaintext.
  bcrypt compareSync will reject them → they can never log into dashboard.
  Fix: re-hash with bcrypt in seed.js or run migration script.

- [ ] **Standardize booking form fields across all 9 templates**
  T1 missing `email` field.
  T4–T9 missing `service` field.
  T6 uses `bride_name` instead of `name`.
  Booking form specs in read-this-also.md say all fields must be identical.

- [ ] **Admin panel: user detail page reads wrong JSON path**
  `views/admin/user.ejs` uses `content.name`, `content.title`, `content.location`.
  But data is nested under `basic: {}` — should be `content.basic?.name`, `content.basic?.title`, `content.basic?.location`.
  Shows `—` for every user's name/title/location.

## MEDIUM PRIORITY

- [ ] **Change DOMAIN from localhost to mymua.in in .env**
  Currently `DOMAIN=localhost:3000` → password reset emails link to localhost.
  Should be `DOMAIN=mymua.in` for production.

- [ ] **Set up PM2 or systemd for auto-restart**
  If Node server crashes, it stays down until manually restarted.
  PM2 or systemd service would auto-restart.

- [ ] **Database backup cron job**
  SQLite is a single file — if it corrupts, all user data is gone.
  Add daily cron: `cp data/database.sqlite backups/$(date +%F).sqlite`

- [ ] **Admin panel: missing features**
  No way to edit user content from admin (read-only).
  No way to reset user passwords.
  No way to delete users.
  No search/filter in user list.
  No pagination for large user bases.
  No booking status management (confirm/cancel).
  No rate limiting on admin routes.

- [ ] **www.mymua.in still points to old cPanel site**
  A record `147.93.29.55` (DNS only) — visitors on www see old site.
  Either delete or route to tunnel.

## LOW PRIORITY

- [ ] **Root domain mymua.in returns 404**
  No subdomain → no user found → 404.
  Could show a landing page or redirect to a default MUA.

- [ ] **No monitoring / uptime alerts**
  No way to know if tunnel disconnects or server crashes.
  Could use Cloudflare notifications or a simple health check.

- [ ] **Clean up old brochure/ src/ dist/ files in repo root**
  `brochure/index.html`, `brochure2/index.html`, `src/brochure*.css/js` — leftover from old build, not part of saas app.
