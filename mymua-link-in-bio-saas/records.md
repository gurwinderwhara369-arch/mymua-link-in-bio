# Design Records — Mymua Link-in-Bio SaaS

> Rationale behind every architecture decision. Read this before questioning why something is the way it is.

---

## Record 1: Node.js + Express (not PHP, Python, Next.js)

**Decision:** Node.js 20+ with Express 4

**Alternatives considered:** PHP (Laravel), Python (Flask), Next.js

**Why:**
- Solo dev already works in JS/Node ecosystem (current project uses Vite + Node)
- Express is the most documented web framework in existence. Every problem has been solved.
- Same language front-to-back. No context switching between PHP and JS.
- PM2 gives zero-downtime deploys, cluster mode, auto-restart — essential for solo ops.

**Why not Next.js:**
- Overkill for 5 dashboard routes + 1 brochure route
- Forces React — our templates are already HTML, not components
- Build step per deploy. Express = restart PM2, done.
- SSR is native to Express + EJS. Next.js SSR adds complexity with zero benefit for this use case.

**Why not PHP:**
- Would require learning/buying a new ecosystem (Composer, Laravel config)
- PHP file upload handling is simpler, but not worth the language switch for a JS dev

---

## Record 2: SQLite3 (not MySQL, PostgreSQL)

**Decision:** SQLite via better-sqlite3

**Alternatives considered:** MySQL, PostgreSQL (Supabase/Neon), MongoDB

**Why:**
- Zero setup. No daemon, no config, no Docker. One file.
- 1000 users × 1 brochure page each = trivial load for SQLite. It handles millions of reads.
- Synchronous API (better-sqlite3) — simpler code, no async/await for DB calls.
- Backup = `cp database.sqlite backup.sqlite`. Cron job, done.
- No monthly cost. Runs on the same $10 VPS as the app.

**When to migrate:**
- When hitting 1000+ users AND seeing write contention on booking form submits
- Migration path: SQLite → PostgreSQL via pgloader. No schema changes needed.

---

## Record 3: EJS (not React, Vue, Handlebars)

**Decision:** EJS templating engine

**Alternatives considered:** React SSR, Handlebars, Pug, bare HTML string interpolation

**Why:**
- Our 3 brochure templates are already HTML. EJS IS HTML with `<% %>` tags added.
- Conversion takes hours, not days. Find-and-replace hardcoded values with EJS tags.
- Zero build step. Zero JavaScript runtime in the server for rendering.
- Handlebars logic-less philosophy fights against looping over services/gallery/testimonials. EJS just uses JS.
- For a dashboard with simple forms and lists, React is a cannon for a mosquito.

**EJS syntax used:**
```ejs
<%= value %>       <!-- Escaped output (XSS safe) -->
<%- value %>       <!-- Raw output (only for trusted HTML) -->
<% if (cond) { %>  <!-- Conditional -->
<% items.forEach(function(i) { %>  <!-- Loop -->
```

---

## Record 4: Session-based auth (not JWT)

**Decision:** express-session with SQLite session store

**Alternatives considered:** JWT (JSON Web Tokens), Clerk, Supabase Auth

**Why:**
- JWT: cannot be revoked server-side. If a session is stolen, it's valid until expiry. Sessions are stored server-side and can be killed instantly.
- JWT: dashboard UX — every form submit needs token refresh logic. Sessions handle this transparently.
- Clerk/Supabase Auth: external dependency. Adds latency, cost, and a failure point. For 100–1000 users, bcrypt + sessions in the same app is simpler and more reliable.
- SQLite session store: same DB as everything else. No Redis needed at this scale.

**Session config:**
```js
{
  name: 'mymua.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  }
}
```

---

## Record 5: JSON column for user content (not normalized tables)

**Decision:** Single `user_content.data` JSON column

**Alternatives considered:** Separate tables for services, gallery, testimonials

**Why:**
- Every user has the exact same data shape, regardless of template
- One query to load everything for a brochure page. No joins, no N+1.
- Adding a field (e.g., "Instagram URL" or "YouTube link") = adding a key in JSON. No migration needed.
- SQLite handles JSON fine for this use case. The data never needs to be queried independently (no "find all services priced under ₹10K").
- If we ever do need normalized tables (Phase 4 analytics), we can extract specific fields into indexed columns.

**Schema:**
```json
{
  "name": "Priya Sharma",
  "title": "Bridal Makeup Artist",
  "bio": "Premium bridal makeup...",
  "photo": "/uploads/1/photo.jpg",
  "location": "Mumbai, Maharashtra",
  "services": [
    { "name": "Bridal", "price": "₹15,000+", "desc": "Full bridal look" }
  ],
  "gallery": [
    { "url": "/uploads/1/gallery-1.jpg", "alt": "Bridal look" }
  ],
  "testimonials": [
    { "name": "Ananya", "text": "Amazing work!", "event": "Wedding" }
  ],
  "social": {
    "phone": "+919999999999",
    "whatsapp": "+919999999999",
    "instagram": "priyasharmamua",
    "email": "priya@email.com"
  }
}
```

---

## Record 6: Local file storage (not S3, Cloudinary)

**Decision:** `public/uploads/<user-id>/` for images

**Alternatives considered:** AWS S3, Cloudinary, Supabase Storage

**Why:**
- Zero setup, zero cost, zero API integration
- Express static middleware serves `public/uploads/` directly — no Nginx needed with Cloudflare Tunnel
- PM2 + cron backup already covers the uploads directory
- S3/Cloudinary make sense at 1000+ users when storage costs and CDN distribution become relevant. Not before.

**Security measures:**
- MIME type validation on upload (only image/jpeg, image/png, image/webp)
- Max 5MB per file
- No executable extensions
- Filename sanitized + UUID renamed (no user-provided filenames)
- Express limits upload size via `express.json({ limit: '5mb' })` + busboy config

---

## Record 7: Tailwind CDN for dashboard (not build step)

**Decision:** Tailwind CSS v3 via CDN `<script>` tag for dashboard pages

**Alternatives considered:** Tailwind CLI, Vite build, plain CSS

**Why:**
- Dashboard pages are simple forms and lists. No custom animations, no complex layouts.
- CDN = zero build step. Edit HTML, refresh browser, see changes. Solo dev velocity.
- The CDN (play.cdnjs.com or tailwind CDN) scans your HTML and generates only the classes you use. <10KB for a dashboard page.
- Dashboard doesn't need daisyUI. The brochure pages (which do need it) use compiled CSS from the current Vite build.

**Trade-off:** CDN adds ~100ms to dashboard page load. For an admin tool used by 100 MUAs, acceptable.

---

## Record 8: Template assets from current build (not re-building)

**Decision:** Copy compiled CSS/JS from `../dist/assets/` into `public/css/` and `public/js/`

**Alternatives considered:** Setting up Tailwind v4 + daisyUI build pipeline in the SaaS project

**Why:**
- The current Vite project already produces optimized, production CSS/JS files
- Copy-paste the 6 files (3 CSS + 3 JS) into the new project. Zero build config needed.
- The templates link to these files via `<link href="/css/styles.css">` — works in Express static serving
- When we update a template (new design), we build in the Vite project and copy the new output

---

## Record 9: No React, no SPA, no client-side routing

**Decision:** Traditional server-rendered multi-page app (MPA)

**Alternatives considered:** React SPA with client-side routing

**Why:**
- 10 pages total (login, register, 5 dashboard pages, 3 template previews in dashboard)
- Each page is a form or a list. No complex client-state management needed.
- MPA = simpler code, simpler debugging, simpler deployment.
- Page transitions are full reloads — fine for an admin dashboard used occasionally.
- Brochure pages MUST be server-rendered for SEO (Google needs HTML, not JS).

---

## Record 10: No Docker, no CI/CD pipeline (Phase 1)

**Decision:** Manual deploy via git push + PM2 restart

**Alternatives considered:** Docker, GitHub Actions, Coolify

**Why:**
- Solo dev + 1 VPS = `git pull && pm2 restart` is faster than setting up Docker
- Docker adds a learning curve, a Dockerfile to maintain, and a registry to push to
- Adding CI/CD in Phase 3 once the deploy process is stable and frequent

**Deploy flow (Phase 1):**
```bash
ssh vps
cd /var/www/mymua-link-in-bio-saas
git pull origin main
npm ci --production
pm2 restart mymua
```
Takes 10 seconds.

---

## Record 11: Cloudflare Tunnel + Subdomain Routing

**Decision:** Cloudflare Tunnel (cloudflared) for zero-open-port hosting + subdirectory (`/anika`) and subdomain (`anika.mymua.in`) routing.

**Connection details:**
- **Tunnel ID:** `78707d5f-ef6b-4b3c-8b76-c8058c618440`
- **Token saved in:** `.env` (`TUNNEL_TOKEN`)
- **Config file:** `config-tunnel.yml`
- **Run command:** `sudo cloudflared tunnel --config config-tunnel.yml run`

**Subdomain routing:**
```
anika.mymua.in  →  Cloudflare DNS: * CNAME → tunnel  →  Tunnel: *.mymua.in → localhost:3000  →  Express: brochure route reads subdomain from Host header
```
- DNS: `*` CNAME → `78707d5f-ef6b-4b3c-8b76-c8058c618440.cfargotunnel.com` (Proxied)
- Tunnel ingress: `*.mymua.in` → `http://localhost:3000`
- Express: `routes/brochure.js` middleware extracts subdomain from `req.headers.host`, treats it as username

**Subdirectory fallback:**
- `mymua.in/anika` → works as `/anika` route (always works, no DNS needed)
- Both subdomain and subdirectory serve the same content

**Cloudflare SSL:**
- SSL/TLS: Full (not Flexible)
- Edge cert: Automatic (Cloudflare Universal SSL)
