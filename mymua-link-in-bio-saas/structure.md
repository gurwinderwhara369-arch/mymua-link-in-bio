# Directory Structure — Mymua Link-in-Bio SaaS

```
mymua-link-in-bio-saas/
│
├── package.json              # Dependencies: express, better-sqlite3, bcrypt, ejs, etc.
├── .env                      # SESSION_SECRET, SMTP_*, DOMAIN, NODE_ENV
├── .gitignore                # node_modules, .env, uploads/*, data/*.sqlite
├── server.js                 # Entry point: Express app, middleware, route mount, server start
│
├── config/
│   ├── db.js                 # SQLite connection + table creation (auto-migrate)
│   └── env.js                # Load .env, validate required vars
│
├── middleware/
│   ├── auth.js               # Session → req.user, redirect if not logged in
│   ├── csrf.js                # Double-submit cookie CSRF
│   ├── rate-limit.js          # Per-route rate limiters
│   └── validate.js            # express-validator helpers
│
├── routes/
│   ├── auth.js               # GET /login, POST /login, GET /register, POST /register, POST /logout
│   ├── dashboard.js           # GET /dashboard/* — profile, services, gallery, testimonials, social, templates
│   ├── booking.js             # POST /booking/:username — public booking form submit
│   └── brochure.js            # GET /:username — render brochure page
│
├── views/
│   ├── layout/
│   │   └── dashboard.ejs     # Dashboard shell: sidebar, header, auth guard
│   ├── templates/
│   │   ├── template-1.ejs    # Priya's theme — dark sunset, daisyUI
│   │   ├── template-2.ejs    # Anika's theme — champagne blush, serif
│   │   └── template-3.ejs    # Zara's theme — editorial monochrome + coral
│   ├── dashboard/
│   │   ├── index.ejs         # Home — quick stats, links
│   │   ├── profile.ejs       # Profile editor form
│   │   ├── services.ejs      # Service list + add/edit modal
│   │   ├── gallery.ejs       # Gallery grid + upload
│   │   ├── testimonials.ejs  # Testimonials list + add/edit
│   │   ├── social.ejs        # Social links form
│   │   ├── templates.ejs     # Template preview cards + switch button
│   │   └── bookings.ejs      # Incoming booking requests
│   ├── login.ejs
│   ├── register.ejs
│   ├── 404.ejs
│   └── 500.ejs
│
├── public/
│   ├── css/
│   │   ├── styles.css        # Site 1 built CSS (from current dist)
│   │   ├── brochure.css      # Site 2 built CSS (from current dist)
│   │   └── brochure2.css     # Site 3 built CSS (from current dist)
│   ├── js/
│   │   ├── app.js            # Site 1 built JS (from current dist)
│   │   ├── brochure.js       # Site 2 built JS (from current dist)
│   │   ├── brochure2.js      # Site 3 built JS (from current dist)
│   │   └── dashboard.js      # Dashboard JS — form validation, preview, upload
│   ├── images/
│   │   ├── default-hero.jpg  # Fallback if MUA hasn't uploaded photo
│   │   └── favicon.ico
│   └── uploads/
│       └── .gitkeep          # Per-user folders created at runtime
│
├── data/
│   ├── .gitkeep
│   └── database.sqlite       # Auto-created by config/db.js
│
├── scripts/
│   ├── backup.sh             # Daily SQLite backup (cron)
│   └── seed.js               # Dev seed data for testing
│
├── prd.md                    # This file — product requirements
├── structure.md              # This file — directory structure
├── records.md                # Architecture decisions & rationale
└── progress.md               # Task tracking
```

---

## File Count & Size Estimate

| Directory | Files | Est. Lines | Notes |
|-----------|-------|------------|-------|
| `config/` | 2 | 60 | DB init + env loader |
| `middleware/` | 4 | 100 | Auth, CSRF, rate-limit, validate |
| `routes/` | 4 | 350 | Auth (80), dashboard (150), brochure (60), booking (60) |
| `views/` | 12 | 1200 | Templates (3 × 200 = 600), dashboard (5 × 60 = 300), auth/error (3 × 100 = 300) |
| `public/` | 6 | — | Built assets from current project |
| `scripts/` | 2 | 40 | Backup + seed |
| Root | 4 | 100 | server.js, config files, docs |
| **Total** | **~34** | **~1850** | |

---

## Data Flow

### Brochure Page Request

```
Browser → GET /@priya
  → Cloudflare (DNS, SSL, caching)
  → Cloudflare Tunnel (cloudflared) → localhost:3000
  → Express (server.js)
    → brochure.js route
      → SQLite: SELECT * FROM users WHERE username = 'priya'
      → SQLite: SELECT data FROM user_content WHERE user_id = ?
      → EJS render: template-<id>.ejs + user data
    → HTML response
```

### Dashboard Form Submit

```
Browser → POST /dashboard/profile
  → Express
    → auth.js middleware (session check)
    → csrf.js middleware (token validation)
    → validate.js middleware (express-validator)
    → dashboard.js route handler
      → sanitize input with DOMPurify
      → SQLite: UPDATE user_content SET data = ? WHERE user_id = ?
    → Redirect back to /dashboard/profile with success message
```

---

## Cloudflare Tunnel Setup

No Nginx needed. Cloudflare Tunnel connects directly to your Express app. Works from ANY environment — Codespace, laptop, VPS. Same commands everywhere.

### Quick Test (from Codespace / local)

```bash
# Install cloudflared (one line, works everywhere)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared

# Start Express app, then in another terminal:
cloudflared tunnel --url http://localhost:3000
```
→ Gives a `https://random-name.trycloudflare.com` URL. Share it. Test on phone. Zero config, no account needed.

### With Your Domain (from Codespace / local)

```bash
cloudflared tunnel login                    # browser auth to Cloudflare
cloudflared tunnel create mymua-test        # creates tunnel ID
cloudflared tunnel route dns mymua-test test.yourdomain.com  # creates DNS CNAME
cloudflared tunnel run mymua-test --url http://localhost:3000  # tunnel live
```
→ `https://test.yourdomain.com` serves your Codespace. Works globally. Share with clients for feedback before VPS deploy.

### Production (on VPS, persistent)

```bash
# Install (same one-liner, works on any Linux VPS)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared

# Authenticate (opens browser to Cloudflare)
cloudflared tunnel login

# Create a tunnel
cloudflared tunnel create mymua-tunnel

# Route subdomain to tunnel
cloudflared tunnel route dns mymua-tunnel app.yourdomain.com

# Install as system service so it starts on boot
cloudflared service install
```

Config file: `~/.cloudflared/config.yml`
```yaml
tunnel: mymua-tunnel
credentials-file: /root/.cloudflared/mymua-tunnel.json
ingress:
  - hostname: app.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

```bash
# Start service
systemctl start cloudflared
systemctl enable cloudflared
```

No SSL setup, no certbot, no open ports. Cloudflare handles everything.
