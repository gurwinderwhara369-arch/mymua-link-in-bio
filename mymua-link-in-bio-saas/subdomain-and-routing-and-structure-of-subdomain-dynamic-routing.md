# Mymua — Subdomain Architecture & Deployment Guide

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Subdomain Routing Flow](#2-subdomain-routing-flow)
3. [Cloudflare DNS Setup](#3-cloudflare-dns-setup)
4. [Cloudflare Tunnel Setup](#4-cloudflare-tunnel-setup)
5. [Project Code — How Subdomain Routing Works](#5-project-code--how-subdomain-routing-works)
6. [Template Mapping & Structure](#6-template-mapping--structure)
7. [Data Storage & Management](#7-data-storage--management)
8. [Running the Tunnel (Startup & Persistence)](#8-running-the-tunnel-startup--persistence)
9. [Warning Checklist — Don't Get Stuck](#9-warning-checklist--dont-get-stuck)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. System Overview

```
Browser ──https──→ Cloudflare Edge ──tunnel──→ cloudflared ──→ localhost:3000 ──→ Express
                      │                                                           │
                      │ DNS: *.mymua.in                                            │ routes/brochure.js
                      │ Tunnel: mymua.in + *.mymua.in                              │ extracts subdomain from Host header
                      │                                                           │ looks up user in SQLite
                      │                                                           │ renders template-N.ejs
```

**Key components:**
- **Cloudflare DNS** — resolves `*.mymua.in` → Cloudflare's edge network
- **Cloudflare Tunnel** — encrypted tunnel from Cloudflare edge → your server
- **cloudflared** — runs on the server, connects to the tunnel, routes requests to `localhost:3000`
- **Express (Node.js)** — renders the correct template based on the subdomain (username)
- **SQLite** — stores users, template assignments, content, bookings, sessions

---

## 2. Subdomain Routing Flow

### Complete request lifecycle for `https://naina.mymua.in`

```
1. Browser → https://naina.mymua.in
2. DNS lookup → Cloudflare (wildcard *.mymua.in CNAME matches)
3. Cloudflare edge → tunnel hostname "*.mymua.in" matches
4. Tunnel → cloudflared on server → http://localhost:3000
5. Express receives request with Host: naina.mymua.in
6. routes/brochure.js middleware extracts "naina" from host
7. SQL query: SELECT * FROM users WHERE username = 'naina'
8. SQL query: SELECT data FROM user_content WHERE user_id = ?
9. render template-4.ejs (naina's template_id = 4)
10. HTML response sent back through tunnel → Cloudflare → Browser
```

### Route precedence in server.js (order matters)

```js
// File: server.js — lines 66-70
// Mount order determines priority. Brochure's /:username
// would hijack /dashboard if mounted first.

app.use('/', require('./routes/auth'));          // 1. Auth (/login, /register, /forgot, /reset)
app.use('/dashboard', require('./routes/dashboard')); // 2. Dashboard (/dashboard/*)
app.use('/admin', require('./routes/admin'));    // 3. Admin (/admin)
app.use('/', require('./routes/brochure'));      // 4. Brochure (subdomain + /:username)
app.use('/', require('./routes/booking'));       // 5. Booking (POST /booking)
```

**Why this order matters:**
- If brochure was mounted first, `GET /dashboard` would match `/:username` and try to find a user named "dashboard" → 404
- Auth routes must come first so unauthenticated users are redirected before any page renders
- Booking comes last because it only matches `POST /booking` — no conflict

### Routes inside brochure.js

```js
// File: routes/brochure.js — 69 lines total

// DEMO ROUTE: Template preview for dashboard iframes
router.get('/demo', (req, res, next) => { ... });

// SUBDOMAIN MIDDLEWARE: Runs on EVERY request
// Extracts username from Host header like "naina.mymua.in"
router.use((req, res, next) => { ... });

// SUBDOMAIN ROUTE: Matches when subdomain exists (e.g. naina.mymua.in/)
router.get('/', (req, res, next) => { ... });

// PATH FALLBACK: Match /naina directly (no subdomain needed)
router.get('/:username', (req, res, next) => { ... });
```

### Two ways to access the same page

| Method | URL | How It Works |
|--------|-----|-------------|
| Subdomain | `https://naina.mymua.in` | Host header → extract "naina" → render |
| Path | `https://mymua.in/naina` | URL param → get "naina" → render |

Both call the same `renderBrochure()` function at the end. Same page, same user, same template.

---

## 3. Cloudflare DNS Setup

### Records required

| Type | Name | Target | Proxy | Purpose |
|------|------|--------|-------|---------|
| Tunnel | `mymua.in` | `tunnelmymua.in` | Proxied | Routes root domain through tunnel |
| CNAME | `*` | `mymua.in` | Proxied | Wildcard — routes ALL subdomains → tunnel |

### Steps to add wildcard (Cloudflare Dashboard)

1. Go to Cloudflare Dashboard → mymua.in → **DNS → Records**
2. Click **Add record**
3. Set:
   - **Type:** `CNAME`
   - **Name:** `*`
   - **Target:** `mymua.in`
   - **Proxy status:** Proxied (orange cloud)
4. Save

### Verify DNS

```bash
# Check that subdomain resolves to Cloudflare IP
nslookup zara.mymua.in 8.8.8.8
# Should return something like 104.16.x.x or 172.64.x.x (Cloudflare IPs)
# NOT your origin server IP (147.93.29.55)

# Alternative with curl (once tunnel is running)
curl -s -o /dev/null -w "%{http_code}" https://zara.mymua.in
# Should return 200
```

### Critical — No local /etc/hosts overrides

**NEVER add subdomain entries to /etc/hosts on a production server.** It overrides real DNS and breaks the tunnel routing:

```bash
# ❌ WRONG — never do this:
127.0.0.1 zara.mymua.in  # blocks Cloudflare DNS, curl goes to localhost:443 → fails
127.0.0.1 naina.mymua.in  # Connection refused on port 443

# ✅ RIGHT — let DNS resolve naturally through Cloudflare:
# No entries in /etc/hosts for mymua.in subdomains

# To check for bad entries:
grep mymua /etc/hosts
# Should return nothing noll result
```

### Full DNS Check Script

```bash
#!/bin/bash
# save as scripts/check-dns.sh
echo "=== DNS Check for mymua.in ==="
for u in zara naina priya kavya ria meera diya; do
  RESULT=$(nslookup "$u.mymua.in" 8.8.8.8 2>/dev/null | grep -o 'Address [0-9.]*' | tail -1)
  echo "$u.mymua.in → $RESULT"
done
```

---

## 4. Cloudflare Tunnel Setup

### Tunnel configuration (Cloudflare Zero Trust Dashboard)

1. Go to **Zero Trust → Networks → Tunnels**
2. Select tunnel `tunnelmymua.in` → **Configure**

### Public hostnames required

| Hostname | Service | Description |
|----------|---------|-------------|
| `mymua.in` | `http://127.0.0.1:3000` | Root domain (also serves as wildcard target) |
| `*.mymua.in` | `http://127.0.0.1:3000` | All subdomains |

### Steps to add wildcard hostname

1. In tunnel config → **Public Hostname** tab → **Add a public hostname**
2. Set:
   - **Subdomain:** `*`
   - **Domain:** `mymua.in`
   - **Service:** `http://127.0.0.1:3000`
3. Save

The tunnel pulls config from Cloudflare remotely — no local config file needed.

### Local config-tunnel.yml (backup reference)

```yaml
# config-tunnel.yml — Only used if tunnel runs without remote config
# When running with TUNNEL_TOKEN env var, remote config takes precedence
token: ${TUNNEL_TOKEN}
ingress:
  - hostname: mymua.in
    service: http://localhost:3000
  - hostname: "*.mymua.in"
    service: http://localhost:3000
  - service: http_status:404
```

### How to get the tunnel token

```
Cloudflare Dashboard → Zero Trust → Networks → Tunnels
  → Click tunnelmymua.in → Settings → Copy Tunnel Token
```

The token is a base64-encoded JSON:
```json
{"a":"93f4eefbe165741b1deeb01f182fc53c",
 "t":"78707d5f-ef6b-4b3c-8b76-c8058c618440",
 "s":"ZTNjZmZkNWYtYmYzMS00NjZhLTkxY2MtZjMxMWExN2I5ZDM5"}
```
- `t` = tunnel ID (must match the tunnel in Cloudflare)
- `a` = account authentication key
- `s` = session/secret key

### Tunnel Config Pull (Cloudflare manages config remotely)

When cloudflared starts with `TUNNEL_TOKEN`, it fetches config from Cloudflare:
```
INF Updated to new configuration config={
  "ingress":[
    {"hostname":"mymua.in","service":"http://127.0.0.1:3000"},
    {"hostname":"*.mymua.in","service":"http://127.0.0.1:3000"},
    {"service":"http_status:404"}
  ],
  "warp-routing":{"enabled":false}
} version=6
```

---

## 5. Project Code — How Subdomain Routing Works

### Location: `routes/brochure.js` — Complete annotated file

```js
const { Router } = require('express');
const { getDb } = require('../config/db');
const { sanitizeUserContent } = require('../middleware/sanitize');

const router = Router();

// ── DEMO ROUTE ────────────────────────────────────────────────────
// Used by dashboard iframes: <iframe src="/demo?template=4">
// Finds ANY user assigned to that template and renders their page

router.get('/demo', (req, res, next) => {
  const db = getDb();
  const tid = parseInt(req.query.template, 10);
  if (tid < 1 || tid > 9) return res.redirect('/demo?template=1');

  const demoUser = db.prepare(
    'SELECT username FROM users WHERE template_id = ? ORDER BY id LIMIT 1'
  ).get(tid);

  if (!demoUser) return next();  // no user for this template → 404

  req.params = { username: demoUser.username };
  return renderBrochure(req, res, next);
});

// ── SUBDOMAIN MIDDLEWARE ───────────────────────────────────────────
// Runs on ALL requests. Extracts subdomain from Host header.
// Example: naina.mymua.in → req.subdomainUsername = "naina"

router.use((req, res, next) => {
  const host = req.headers.host || '';     // "naina.mymua.in"
  const parts = host.split('.');           // ["naina","mymua","in"]

  // Must have 3+ parts and not start with "www"
  if (parts.length >= 3 && parts[0] !== 'www') {
    req.subdomainUsername = parts[0].toLowerCase().trim();
  }
  // If host is just "mymua.in" (2 parts), subdomainUsername stays undefined
  // If host is "www.mymua.in", explicitly skipped (www is not a username)
  next();
});

// ── SUBDOMAIN ROUTE ────────────────────────────────────────────────
// Only fires when someone visits the ROOT of a subdomain.
// Example: https://naina.mymua.in/ (GET / with Host: naina.mymua.in)

router.get('/', (req, res, next) => {
  if (req.subdomainUsername) {
    req.params.username = req.subdomainUsername;
    return renderBrochure(req, res, next);
  }
  next(); // no subdomain → let next handler try (ends in 404)
});

// ── PATH FALLBACK ROUTE ────────────────────────────────────────────
// Allows access via path instead of subdomain.
// Example: https://mymua.in/naina (GET /naina)

router.get('/:username', (req, res, next) => {
  const username = req.params.username.toLowerCase().trim();

  // Skip non-user paths like /favicon.ico, /robots.txt, /sitemap.xml
  if (username.startsWith('favicon') ||
      username.startsWith('robots') ||
      username.startsWith('sitemap')) return next();

  renderBrochure(req, res, next);
});

// ── CORE RENDER FUNCTION ───────────────────────────────────────────
// Shared by both subdomain and path-based routing.
// 1. Look up user by username
// 2. Fetch their content JSON
// 3. Map template_id to template file
// 4. Render with all 5 content sections as defaults

function renderBrochure(req, res, next) {
  const username = req.params.username.toLowerCase().trim();
  const db = getDb();

  // STEP 1: Find user in database
  // users table: id, username, email, password_hash, template_id, is_admin
  const user = db.prepare(
    'SELECT id, username, template_id FROM users WHERE username = ?'
  ).get(username);

  if (!user) return next(); // unknown username → 404

  // STEP 2: Fetch content JSON
  // user_content table: id, user_id, data (JSON text)
  const row = db.prepare(
    'SELECT data FROM user_content WHERE user_id = ?'
  ).get(user.id);

  // Parse JSON content, or start empty
  const content = row
    ? sanitizeUserContent(JSON.parse(row.data))
    : {};

  // STEP 3: Default every section to prevent template crashes
  // Templates access user.social.phone, user.services[0].name, etc.
  // Without these defaults, empty content = TypeError crash
  content.social       = content.social       || {};
  content.services     = content.services     || [];
  content.gallery      = content.gallery      || [];
  content.testimonials = content.testimonials || [];
  content.basic        = content.basic        || {};

  // STEP 4: Map template_id to template file
  // 1 → template-1.ejs, 2 → template-2.ejs, ... 9 → template-9.ejs
  const templateMap = {
    1: 'template-1', 2: 'template-2', 3: 'template-3',
    4: 'template-4', 5: 'template-5', 6: 'template-6',
    7: 'template-7', 8: 'template-8', 9: 'template-9'
  };
  const template = templateMap[user.template_id] || 'template-1';

  // STEP 5: Render the template
  // Template receives:
  //   user        → content object (basic, social, services, gallery, testimonials)
  //   username    → login name for URLs
  //   bookingStatus → from query param ?booked=success or ?booked=error=...
  res.render(`templates/${template}`, {
    user: content,
    username: user.username,
    bookingStatus: req.query.booked || null,
  });
}

module.exports = router;
```

### Host header parsing — Edge case examples

```js
// Production: https://naina.mymua.in
// Host: "naina.mymua.in"
// parts: ["naina", "mymua", "in"]
// parts.length >= 3 && parts[0] !== 'www' → true
// → subdomainUsername = "naina" ✅

// Root domain: https://mymua.in
// Host: "mymua.in"
// parts: ["mymua", "in"]
// parts.length >= 3 → false
// → subdomainUsername = undefined ✅ (correct — no subdomain)

// www prefix: https://www.mymua.in
// Host: "www.mymua.in"
// parts: ["www", "mymua", "in"]
// parts[0] !== 'www' → false
// → subdomainUsername = undefined ✅ (correct — www is not a username)

// Local dev with port: http://naina.mymua.in:3000
// Host: "naina.mymua.in:3000"
// parts: ["naina", "mymua", "in:3000"]
// parts.length >= 3 → true
// → subdomainUsername = "naina" ✅ (port suffix on last part doesn't affect first part)

// Deep subdomain: https://portfolio.naina.mymua.in
// Host: "portfolio.naina.mymua.in"
// parts: ["portfolio", "naina", "mymua", "in"]
// → subdomainUsername = "portfolio" ⚠️ (would try to find user "portfolio")
// Our system doesn't use deep subdomains, so this would 404
```

### How to add a NEW user + assign template (Node.js)

```js
const db = require('better-sqlite3')('./data/database.sqlite');
const bcrypt = require('bcrypt');

// Create user
const hash = bcrypt.hashSync('userpassword', 10);
const info = db.prepare(
  'INSERT INTO users (username, email, password_hash, template_id) VALUES (?, ?, ?, ?)'
).run('newmua', 'newmua@email.com', hash, 3);
// template_id 3 = Editorial Edge

// Create empty content record
db.prepare(
  'INSERT INTO user_content (user_id, data) VALUES (?, ?)'
).run(info.lastInsertRowid, '{}');

console.log('User created with ID:', info.lastInsertRowid);
// Now https://newmua.mymua.in renders template-3 (Editorial Edge)
// with empty content (defaults kick in: social={}, services=[], etc.)
```

### How to change a user's template

```js
// From Node.js script or dashboard
db.prepare('UPDATE users SET template_id = ? WHERE username = ?')
  .run(5, 'naina');
// naina's page now renders template-5.ejs (Bridal Romance)
// Content stays EXACTLY the same — only the design/layout changes

// Verify
const user = db.prepare('SELECT username, template_id FROM users WHERE username = ?')
  .get('naina');
console.log(user); // { username: 'naina', template_id: 5 }
```

### Dashboard template switch code (Express route)

```js
// File: routes/dashboard.js — Template switch handler

router.post('/templates', authGuard, (req, res) => {
  // Validate: template_id must be 1-9 (or whatever max is)
  const tid = parseInt(req.body.template_id, 10);
  if (tid < 1 || tid > 9) {
    req.session.error = 'Invalid template';
    return res.redirect('/dashboard/templates');
  }

  // Update the database
  getDb().prepare('UPDATE users SET template_id = ? WHERE id = ?')
    .run(tid, req.session.userId);

  res.redirect('/dashboard/templates');
});
```

---

## 6. Template Mapping & Structure

### Location: `views/templates/template-{1..9}.ejs`

| template_id | File | Name | Description |
|-------------|------|------|-------------|
| 1 | `template-1.ejs` | Twilight Glow | Dark sunset, daisyUI, warm earthy tones |
| 2 | `template-2.ejs` | Champagne Blush | Romantic gold & rose gold, serif fonts |
| 3 | `template-3.ejs` | Editorial Edge | Monochrome + coral, sharp corners, bold |
| 4 | `template-4.ejs` | Editorial Luxe | Dark luxury, Playfair serif, grain overlay |
| 5 | `template-5.ejs` | Bridal Romance | Champagne palette, stardust particles |
| 6 | `template-6.ejs` | Indian Bridal | Maroon-gold, lotus ornaments, category gallery |
| 7 | `template-7.ejs` | Event Glamour | Midnight gold, sparkle particles, filmstrip |
| 8 | `template-8.ejs` | Modern Classic | Rose accent, mesh-gradient blobs, masonry |
| 9 | `template-9.ejs` | Soft Radiance | Bokeh circles, peach palette, skin-type selector |

### Template storage format

User content is stored as JSON in the `user_content.data` column:

```json
{
  "basic": {
    "name": "Naina Kaur",
    "title": "Bridal Makeup Artist",
    "bio": "Specializing in bridal, editorial, and event makeup with 8+ years of experience.",
    "location": "Delhi, India",
    "phone": "+91-9876543210"
  },
  "social": {
    "instagram": "naina_mua",
    "whatsapp": "+919876543210",
    "phone": "+91-9876543210",
    "email": "naina@mymua.com"
  },
  "services": [
    {
      "name": "Bridal Makeup",
      "price": "₹15,000",
      "desc": "Full bridal look including trial, HD makeup, and touch-up kit"
    },
    {
      "name": "Editorial Shoot",
      "price": "₹8,000",
      "desc": "High-definition makeup for photoshoots and portfolios"
    },
    {
      "name": "Party Makeup",
      "price": "₹5,000",
      "desc": "Glamorous look for sangeet, cocktail, and evening events"
    }
  ],
  "gallery": [
    { "src": "https://images.unsplash.com/photo-xxx", "caption": "Bridal Look — Red Lehenga" },
    { "src": "https://images.unsplash.com/photo-yyy", "caption": "Editorial — Golden Smokey Eye" }
  ],
  "testimonials": [
    {
      "name": "Priya Sharma",
      "text": "Naina did my wedding makeup and I've never felt more beautiful!",
      "rating": 5
    }
  ]
}
```

### Template variables available in EVERY template

```ejs
<!-- Each template receives these 4 variables: -->

<%= user.basic.name %>           <!-- "Naina Kaur" — from user_content.data.basic -->
<%= user.social.instagram %>     <!-- "naina_mua" — from user_content.data.social -->
<%= username %>                  <!-- "naina" — from users.username -->
<%= bookingStatus %>             <!-- "success" — from query param ?booked=success -->

<!-- CSRF token for forms (injected by global middleware): -->
<%= csrfToken %>                 <!-- "a1b2c3d4..." — from middleware/csrf.js -->
```

### Example: How T4 accesses content vs T1

Both templates receive the SAME variables. They just display them differently:

**Template 1 (Twilight Glow)** — daisyUI components:
```html
<!-- template-1.ejs uses daisyUI card component -->
<div class="card bg-base-200 shadow-xl">
  <div class="card-body">
    <h2 class="card-title"><%= user.basic.name %></h2>
    <p><%= user.basic.bio %></p>
  </div>
</div>
```

**Template 4 (Editorial Luxe)** — custom HTML:
```html
<!-- template-4.ejs uses custom div with Playfair font -->
<div class="luxe-card">
  <h2 class="playfair"><%= user.basic.name %></h2>
  <p class="inter"><%= user.basic.bio %></p>
</div>
```

**Template 7 (Event Glamour)** — different layout entirely:
```html
<!-- template-7.ejs uses filmstrip gallery + sparkle effects -->
<div class="event-hero">
  <h1 class="cinzel"><%= user.basic.name %></h1>
  <p class="inter-light"><%= user.basic.bio %></p>
</div>
```

### How ONE routing function dynamically serves ALL 9 templates

The key architectural insight: **subdomain routing code is written ONCE in one file** (`routes/brochure.js`). It does NOT know or care which template is being rendered. The same `renderBrochure()` function serves ALL templates dynamically.

```
                    ┌────────────────────────────────────┐
                    │       renderBrochure()             │
                    │  (routes/brochure.js:320-371)      │
                    │                                    │
                    │  1. Extract username (subdomain)   │
                    │  2. Look up user in DB             │
                    │  3. Look up user_content in DB     │
                    │  4. Apply content defaults         │
                    │  5. templateMap[user.template_id]  │ ← dynamic!
                    │  6. res.render(`templates/${template}`, { user, username })
                    └──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
                       │  │  │  │  │  │  │  │  │  │  │
                       ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼
                    T1  T2  T3  T4  T5  T6  T7  T8  T9
```

**The critical line that makes it dynamic:**

```js
// This ONE line decides which template file to render
// It looks up the template_id from the user's database record
// and maps it to a filename like "template-4.ejs"
const template = templateMap[user.template_id] || 'template-1';

// Then renders that specific template file
// The SAME user object is passed to EVERY template
res.render(`templates/${template}`, { user: content, username, bookingStatus });
```

**Real example — same function, different results:**

| Request | DB lookup | template_id | Rendered file | 
|---------|-----------|-------------|---------------|
| `https://zara.mymua.in` | zara → template_id=3 | `templateMap[3]` | `template-3.ejs` |
| `https://naina.mymua.in` | naina → template_id=4 | `templateMap[4]` | `template-4.ejs` |
| `https://diya.mymua.in` | diya → template_id=9 | `templateMap[9]` | `template-9.ejs` |
| New user with template_id=7 | newuser → template_id=7 | `templateMap[7]` | `template-7.ejs` |
| Unknown template_id=99 | anything → template_id=99 | `templateMap[99]` → undefined | `template-1.ejs` (fallback) |

**What happens in `renderBrochure` step by step:**

```js
// User visits https://naina.mymua.in
// Step 1: Subdomain middleware extracts "naina"
// Step 2: renderBrochure runs

function renderBrochure(req, res, next) {
  const username = req.params.username;  // "naina"
  const db = getDb();

  // Step 3: Get user from DB
  const user = db.prepare(
    'SELECT id, username, template_id FROM users WHERE username = ?'
  ).get(username);
  // → { id: 10, username: 'naina', template_id: 4 }

  // Step 4: Get content from DB
  const row = db.prepare(
    'SELECT data FROM user_content WHERE user_id = ?'
  ).get(user.id);
  const content = row ? JSON.parse(row.data) : {};
  content.social = content.social || {};
  content.services = content.services || [];
  content.gallery = content.gallery || [];
  content.testimonials = content.testimonials || [];
  content.basic = content.basic || {};

  // Step 5: Dynamic template selection
  const templateMap = {
    1: 'template-1', 2: 'template-2', 3: 'template-3',
    4: 'template-4', 5: 'template-5', 6: 'template-6',
    7: 'template-7', 8: 'template-8', 9: 'template-9'
  };
  const template = templateMap[user.template_id];
  // → templateMap[4] → "template-4"

  // Step 6: Render
  res.render(`templates/template-4`, { user: content, username: 'naina' });
  // The .ejs extension is automatic (EJS view engine adds it)
}
```

**Proof that templates don't know about subdomains — search the template files:**

```bash
# Check if ANY template file contains subdomain-related code
grep -rn "subdomain\|host\|split\|parts\[0\]" mymua-link-in-bio-saas/views/templates/
# Result: (no output)
# → ZERO template files know about subdomains!
```

**All 9 templates are PURE presentation.** They only use the variables passed to them:

```ejs
<!-- Every template uses these exact same variables -->
<%= user.basic.name %>              <!-- "Naina Kaur" -->
<%= user.social.instagram %>        <!-- "naina_mua" -->
<%= user.services[0].name %>        <!-- "Bridal Makeup" -->
<%= username %>                     <!-- "naina" -->
<%= bookingStatus %>                <!-- "success" -->
```

**How to add a 10th template — routing code needs ONE line change:**

```js
// Only change needed in routes/brochure.js:
const templateMap = {
  1: 'template-1', 2: 'template-2', 3: 'template-3',
  4: 'template-4', 5: 'template-5', 6: 'template-6',
  7: 'template-7', 8: 'template-8', 9: 'template-9',
  10: 'template-10'    // ← ADD THIS ONE LINE
};

// That's it. The rest of the routing code stays IDENTICAL.
// Subdomain extraction → same code
// User lookup → same query
// Content fetch → same query
// Content defaults → same code
// res.render → automatically picks template-10.ejs
//                        when user has template_id = 10
```

### How to add a NEW template (step by step)

```js
// 1. Create the file: views/templates/template-10.ejs
//    Must use variables: user.basic, user.social, user.services, user.gallery, user.testimonials
//    Must include: booking form, CSRF token, WhatsApp/Instagram links

// 2. Add to templateMap in routes/brochure.js:
const templateMap = {
  1: 'template-1', 2: 'template-2', ...,
  10: 'template-10'  // add this line
};

// 3. Update validation in routes/dashboard.js:
if (tid < 1 || tid > 10) {  // changed 9 → 10
  req.session.error = 'Invalid template';
  return res.redirect('/dashboard/templates');
}

// 4. Add to UI in views/dashboard/templates.ejs:
var templates = [
  { id: 1, name: 'Twilight Glow', desc: '...' },
  ...,
  { id: 10, name: 'New Template', desc: '...' },
];

// 5. Update database schema (optional):
// No schema change needed — template_id is just an INTEGER

// 6. Assign user to new template:
db.prepare('UPDATE users SET template_id = 10 WHERE username = ?')
  .run('naina');
```

---

## 7. Data Storage & Management

### Database: SQLite at `data/database.sqlite`

**Tables:**

```sql
-- Users table — core identity
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,      -- "naina" → used in URL
  email         TEXT UNIQUE NOT NULL,      -- "naina@mymua.com"
  password_hash TEXT NOT NULL,             -- bcrypt hash
  template_id   INTEGER DEFAULT 1,         -- 1-9, maps to template-N.ejs
  is_admin      INTEGER DEFAULT 0,         -- 0=user, 1=admin
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now')),
  reset_token   TEXT,                       -- password reset
  reset_expires INTEGER                     -- reset expiry timestamp
);

-- Content table — stores ALL profile data as JSON
CREATE TABLE IF NOT EXISTS user_content (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
  data    TEXT DEFAULT '{}'                 -- JSON: { basic, social, services, gallery, testimonials }
);

-- Bookings table — inquiries from clients
CREATE TABLE IF NOT EXISTS bookings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  data       TEXT NOT NULL,                 -- JSON: { name, phone, date, message }
  status     TEXT DEFAULT 'pending',        -- 'pending', 'confirmed', 'cancelled'
  created_at TEXT DEFAULT (datetime('now'))
);

-- Index for fast username lookups (critical for subdomain routing)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
```

### Example: Query to find user by subdomain

```js
// This query runs on EVERY subdomain request
// route: GET / (when subdomainUsername = "naina")

const db = getDb();

const user = db.prepare(
  `SELECT id, username, template_id
   FROM users
   WHERE username = ?`
).get('naina');
// Returns: { id: 10, username: 'naina', template_id: 4 }
// If null → 404 (unknown user)

const contentRow = db.prepare(
  `SELECT data
   FROM user_content
   WHERE user_id = ?`
).get(10);
// Returns: { data: '{"basic":{"name":"Naina Kaur",...}}' }
// If null → user has no content yet (defaults apply)
```

### How template switching works (Dashboard → DB)

```
Dashboard (POST /dashboard/templates)
  ↓
authGuard — check user is logged in
  ↓
express-validator — validate template_id is 1-9
  ↓
SQL: UPDATE users SET template_id = 5, updated_at = datetime('now') WHERE id = ?
  ↓
redirect back to /dashboard/templates
  ↓
Page refreshes, currentTemplate is now 5
  ↓
User visits https://naina.mymua.in → renders template-5.ejs
```

### Seed data (scripts/seed.js)

```js
// Run: npm run seed
// Creates 9 demo users, one per template

const demoUsers = [
  { username: 'admin', template: 1, email: 'admin@mymua.com', isAdmin: true },
  { username: 'anika', template: 2, email: 'anika@mymua.com' },
  { username: 'zara',  template: 3, email: 'zara@mymua.com'  },
  { username: 'naina', template: 4, email: 'naina@mymua.com' },
  { username: 'priya', template: 5, email: 'priya@mymua.com' },
  { username: 'kavya', template: 6, email: 'kavya@mymua.com' },
  { username: 'ria',   template: 7, email: 'ria@mymua.com'   },
  { username: 'meera', template: 8, email: 'meera@mymua.com' },
  { username: 'diya',  template: 9, email: 'diya@mymua.com'  },
];

for (const u of demoUsers) {
  const hash = bcrypt.hashSync(
    u.isAdmin ? 'admin1234' : 'demo1234', 10
  );
  db.prepare(
    `INSERT OR IGNORE INTO users
     (username, email, password_hash, template_id, is_admin)
     VALUES (?, ?, ?, ?, ?)`
  ).run(u.username, u.email, hash, u.template, u.isAdmin ? 1 : 0);
}
```

| Username | Template | Subdomain URL | Email | Password |
|----------|----------|---------------|-------|----------|
| admin | T1 | `admin.mymua.in` | admin@mymua.com | admin1234 |
| anika | T2 | `anika.mymua.in` | anika@mymua.com | demo1234 |
| zara | T3 | `zara.mymua.in` | zara@mymua.com | demo1234 |
| naina | T4 | `naina.mymua.in` | naina@mymua.com | demo1234 |
| priya | T5 | `priya.mymua.in` | priya@mymua.com | demo1234 |
| kavya | T6 | `kavya.mymua.in` | kavya@mymua.com | demo1234 |
| ria | T7 | `ria.mymua.in` | ria@mymua.com | demo1234 |
| meera | T8 | `meera.mymua.in` | meera@mymua.com | demo1234 |
| diya | T9 | `diya.mymua.in` | diya@mymua.com | demo1234 |

### Configuration storage

```bash
# .env file — ALL configuration is here
SESSION_SECRET=change-this-to-a-random-string-at-least-32-chars
TUNNEL_ID=78707d5f-ef6b-4b3c-8b76-c8058c618440
TUNNEL_TOKEN=eyJhIjoi...                         # From Cloudflare Zero Trust
DOMAIN=mymua.in                                    # Used in password reset emails
NODE_ENV=development                               # Change to 'production' for live

# SMTP (password reset emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=gurwinderwhara777@gmail.com
SMTP_PASS=nmgk ggch adcs tark                     # Gmail App Password
SMTP_FROM=gurwinderwhara777@gmail.com
```

```js
// How .env values are loaded (config/env.js)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET,
  domain: process.env.DOMAIN || `localhost:${process.env.PORT || '3000'}`,
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@mymua.com',
  },
};
```

### Server-side session storage

```js
// config/session-store.js — Sessions in SQLite, NOT in memory
// This means sessions survive server restarts

const Database = require('better-sqlite3');
const dbPath = path.resolve(__dirname, '..', 'data', 'sessions.db');

class BetterSQLiteStore extends Store {
  get(sid, cb) {
    const row = this.db.prepare(
      'SELECT sess FROM sessions WHERE sid = ? AND expired > ?'
    ).get(sid, Date.now());
    cb(null, row ? JSON.parse(row.sess) : null);
  }

  set(sid, sess, cb) {
    const expired = Date.now() + (sess.cookie?.maxAge || 86400000);
    this.db.prepare(
      'INSERT OR REPLACE INTO sessions (sid, expired, sess) VALUES (?, ?, ?)'
    ).run(sid, expired, JSON.stringify(sess));
    cb(null);
  }

  destroy(sid, cb) {
    this.db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
    cb(null);
  }
}
```

### Files you must keep secure

```
.env                    # Tunnel token, SMTP password, session secret
data/database.sqlite    # All user data and password hashes
data/sessions.db        # Active session tokens
```

---

## 8. Running the Tunnel (Startup & Persistence)

### Start tunnel (manual)

```bash
# 1. Start Node server
cd /workspaces/mymua-link-in-bio/mymua-link-in-bio-saas
node server.js

# 2. Start cloudflared tunnel (in another terminal or background)
export TUNNEL_TOKEN="eyJhIjoiOTNmNGVlZmJlMTY1NzQxYjFkZWViMDFmMTgyZmM1M2MiLCJ0IjoiNzg3MDdkNWYtZWY2Yi00YjNjLThiNzYtYzgwNThjNjE4NDQwIiwicyI6IlpUTmpabVprTldZdFltWXpNUzAwTmpaaExUa3hZMk10WmpNeE1XRXhOMkk1WkRNNSJ9"
cloudflared tunnel run

# Or one-liner (reads token from .env):
TUNNEL_TOKEN=$(grep TUNNEL_TOKEN /path/to/.env | cut -d= -f2-) cloudflared tunnel run &
```

### Verify tunnel is connected

```bash
# Check cloudflared is running
ps aux | grep cloudflared
# Should show: cloudflared tunnel run

# Check node server is responding
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login
# Should return: 200

# Check live subdomain (from internet via Cloudflare)
curl -s -o /dev/null -w "%{http_code}" https://naina.mymua.in
# Should return: 200

# Check tunnel log for config pull confirmation
# Look for this line in cloudflared output:
# "Updated to new configuration config={\"ingress\":[{\"hostname\":\"mymua.in\",...},{\"hostname\":\"*.mymua.in\",...}]}"
```

### What to check when server restarts

After a server reboot, you need BOTH processes running:

```bash
#!/bin/bash
# save as start.sh — run after every reboot

# Step 1: Start Node server
cd /workspaces/mymua-link-in-bio/mymua-link-in-bio-saas
node server.js &

# Step 2: Wait for server to be ready
sleep 3

# Step 3: Start tunnel
TUNNEL_TOKEN=$(grep TUNNEL_TOKEN .env | cut -d= -f2-)
TUNNEL_TOKEN=$TUNNEL_TOKEN cloudflared tunnel run &

# Step 4: Verify both are running
sleep 5
echo "Node: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/login)"
echo "Tunnel: $(ps aux | grep cloudflared | grep -v grep | wc -l) process(es)"
echo "Live: $(curl -s -o /dev/null -w '%{http_code}' https://naina.mymua.in)"
```

### Production persistence with systemd (optional)

```ini
# /etc/systemd/system/mymua.service
[Unit]
Description=Mymua Node.js Application
After=network.target

[Service]
Type=simple
User=codespace
WorkingDirectory=/workspaces/mymua-link-in-bio/mymua-link-in-bio-saas
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/cloudflared-tunnel.service
[Unit]
Description=Cloudflare Tunnel for Mymua
After=mymua.service
Requires=mymua.service

[Service]
Type=simple
User=codespace
WorkingDirectory=/workspaces/mymua-link-in-bio/mymua-link-in-bio-saas
ExecStart=/usr/local/bin/cloudflared tunnel run
EnvironmentFile=/workspaces/mymua-link-in-bio/mymua-link-in-bio-saas/.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
# Enable services to auto-start on boot
sudo systemctl enable mymua.service
sudo systemctl enable cloudflared-tunnel.service

# Start now
sudo systemctl start mymua.service
sudo systemctl start cloudflared-tunnel.service

# Check status
sudo systemctl status mymua.service
sudo systemctl status cloudflared-tunnel.service
```

---

## 9. Warning Checklist — Don't Get Stuck

### ⚠️ DNS Pitfalls

| # | Warning | Why | Code/Fix |
|---|---------|-----|----------|
| 1 | **NO /etc/hosts entries for mymua.in subdomains** | Overrides real DNS, breaks tunnel routing | `grep mymua /etc/hosts` should return nothing |
| 2 | **DNS proxy MUST be orange (Proxied)** | Tunnel only works with proxied DNS; grey (DNS only) bypasses Cloudflare | Check Cloudflare DNS dashboard |
| 3 | **Wildcard CNAME takes time to propagate** | Can take 1-5 minutes before new DNS records work globally | Wait, then `nslookup zara.mymua.in 8.8.8.8` |
| 4 | **CNAME wildcard only works as first label** | `*.mymua.in` works, `sub.*.mymua.in` does NOT | Keep it flat: just one level |
| 5 | **Root domain Tunnel record must exist** | `mymua.in` Tunnel record is the target for the wildcard CNAME | Without it, `*` CNAME has nowhere to point |

### ⚠️ Tunnel Pitfalls

| # | Warning | Why | Code/Fix |
|---|---------|-----|----------|
| 6 | **Tunnel token MUST match tunnel in Cloudflare** | Old/wrong token → "Provided Tunnel token is not valid" | Re-copy token from Zero Trust dashboard |
| 7 | **Both `mymua.in` AND `*.mymua.in` hostnames needed** | Missing wildcard → subdomains get Cloudflare 404 | Check tunnel → Public Hostnames |
| 8 | **Proxy must be enabled in DNS for the tunnel record** | `mymua.in` Tunnel record must be proxied (orange cloud) | Check DNS → Records |
| 9 | **Tunnel uses remote config when run with token** | Local config-tunnel.yml is IGNORED for remotely-managed tunnels | Edit config in Cloudflare dashboard, not YAML file |
| 10 | **cloudflared version >= 2026 uses `TUNNEL_TOKEN` env var** | Old `--token` flag syntax doesn't work in v2026+ | Use `TUNNEL_TOKEN=... cloudflared tunnel run` |
| 11 | **server.js must set `trust proxy`** | Without this, `req.headers.host` is wrong behind Cloudflare | `app.set('trust proxy', 1);` in server.js:14 |

### ⚠️ Code Pitfalls

| # | Warning | Why | Fix |
|---|---------|-----|-----|
| 12 | **brochure.js must be mounted AFTER auth/dashboard** | `/:username` would hijack `/dashboard` | Mount order: auth → dashboard → admin → brochure → booking |
| 13 | **Content defaults MUST be applied** | `user.social.phone` crashes if `user_content.data` is `{}` | `content.social = content.social \|\| {}` and same for services, gallery, testimonials, basic |
| 14 | **Host parsing splits by dot — beware of ports** | `naina.mymua.in:3000` works (local); production has no port | Test locally with port, production without |
| 15 | **`www` subdomain is explicitly skipped** | `www.mymua.in` falls through to 404 | Handle `www` separately if needed |
| 16 | **template_id must be 1-9** | Any other value silently falls back to `template-1` | Validate in dashboard: `if (tid < 1 \|\| tid > 9)` |
| 17 | **Unknown username → 404, not crash** | `renderBrochure` calls `next()` when user not found → falls to 404 handler | Safe by design, but confusing if username is misspelled |

### ⚠️ Session & Auth Pitfalls

| # | Warning | Why | Fix |
|---|---------|-----|-----|
| 18 | **SESSION_SECRET must be random 32+ chars** | Weak secret → session hijacking | `openssl rand -hex 32` → paste into `.env` |
| 19 | **Session cookie secure flag** | In production, cookie must be `secure: true` | Set `NODE_ENV=production` → `config.isProd = true` → `cookie.secure = true` |
| 20 | **CSRF token must be in every form** | All POST requests need `_csrf` hidden field | Include `<input type="hidden" name="_csrf" value="<%= csrfToken %>">` in every form |

### ⚠️ Production Checklist

| # | Check | How to verify |
|---|-------|---------------|
| 1 | `NODE_ENV=production` in `.env` | `grep NODE_ENV .env` → should be `production` |
| 2 | `SESSION_SECRET` changed from default | `grep SESSION_SECRET .env` → should NOT be "change-this-to-a-random-string-at-least-32-chars" |
| 3 | `DOMAIN=mymua.in` in `.env` | `grep DOMAIN .env` → should be `mymua.in` |
| 4 | HTTPS handled by Cloudflare | Visit `https://naina.mymua.in` → check lock icon in browser |
| 5 | No open ports besides SSH | `ss -tlnp` → should only show 22 (SSH) and 3000 (Node, but only accessible via tunnel) |
| 6 | Database backed up | `ls -la data/*.sqlite` → check file size, set up cron backup |
| 7 | Both services running after reboot | `systemctl status mymua cloudflared-tunnel` (if using systemd) |

---

## 10. Troubleshooting

### Problem: Visiting `naina.mymua.in` shows "This site can't be reached"

```bash
# 1. Check DNS resolution
nslookup naina.mymua.in 8.8.8.8
# Expected: Cloudflare IP (104.x.x.x or 172.x.x.x)
# Wrong: Your origin IP (147.93.29.55) → DNS not proxied
# Wrong: 127.0.0.1 → /etc/hosts override exists

# 2. Check for local overrides
grep mymua /etc/hosts
# Should return nothing — if it shows entries, remove them

# 3. Check Cloudflare DNS dashboard
# Go to mymua.in → DNS → Records
# Verify: CNAME * → mymua.in exists and is Proxied (orange cloud)
```

### Problem: Tunnel won't start

```bash
# 1. Check cloudflared version
cloudflared version
# Should be 2026.x.x

# 2. Test token by running tunnel (verbose)
cd /path/to/mymua-link-in-bio-saas
TUNNEL_TOKEN=$(grep TUNNEL_TOKEN .env | cut -d= -f2-)
TUNNEL_TOKEN=$TUNNEL_TOKEN cloudflared tunnel run --loglevel debug &
# Look for: "Registered tunnel connection" → success
# Look for: "Failed to connect" → token or network issue

# 3. Check if server is running
curl http://localhost:3000/login
# If connection refused → start node server.js first

# 4. Check port availability
ss -tlnp | grep 3000
# Should show LISTEN state with node process
```

### Problem: Tunnel starts but subdomains return 404/502

```bash
# 1. Check tunnel config was pulled correctly
# Look in cloudflared log for:
# "Updated to new configuration config={\"ingress\":
#   [{\"hostname\":\"mymua.in\",...},
#    {\"hostname\":\"*.mymua.in\",...},
#    {\"service\":\"http_status:404\"}]}"
# If "*.mymua.in" is missing → add in Cloudflare dashboard

# 2. Check if wildcard hostname exists in Cloudflare
# Zero Trust → Networks → Tunnels → tunnelmymua.in → Public Hostnames
# Should show BOTH: mymua.in AND *.mymua.in

# 3. Check node server is responding
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login
# Must be 200 — if not, restart server

# 4. Test root domain (should 404 — expected for mymua.in without subdomain)
curl -s -o /dev/null -w "%{http_code}" https://mymua.in
# 404 is OK — root domain has no subdomain to extract
```

### Problem: User not found / 404 on subdomain

```bash
# 1. Check if user exists in database
cd /path/to/mymua-link-in-bio-saas
node -e "
const db = require('better-sqlite3')('./data/database.sqlite');
const users = db.prepare('SELECT username, template_id FROM users').all();
console.log(users);
"
# Check that the username you're trying exists in the list

# 2. Check for case mismatch
# Username "Naina" ≠ "naina" — all usernames are lowercase
# Code does .toLowerCase() so uppercase should still work, but verify

# 3. Try direct path route instead of subdomain
curl -s -o /dev/null -w "%{http_code}" https://mymua.in/naina
# If 200 → subdomain extraction is the issue
# If 404 → user doesn't exist or DB issue

# 4. Check brochure route is mounted
grep "brochure" server.js
# Should show: app.use('/', require('./routes/brochure'));
```

### Problem: Pages load unstyled or broken

```bash
# 1. Templates 4-9 use INLINE <style> tags — no external CSS needed
# Check if the template has <style> block at top

# 2. Templates 1-3 use external CSS:
# template-1 → /css/styles.css
# template-2 → /css/brochure.css
# template-3 → /css/brochure2.css
# Verify these files exist in public/css/

# 3. Check CSP in server.js
# If Tailwind CDN is blocked, styles won't load
# Helmet CSP must allow: https://cdn.tailwindcss.com
```

### Problem: Admin can't log in

```bash
# 1. Check admin credentials in .env or seed data
# Admin email: admin@mymua.com
# Admin password: admin1234 (set in seed.js)

# 2. Check if admin user exists
node -e "
const db = require('better-sqlite3')('./data/database.sqlite');
const admin = db.prepare('SELECT username, email FROM users WHERE is_admin = 1').all();
console.log('Admins:', admin);
"

# 3. Reset admin password (Node.js)
node -e "
const db = require('better-sqlite3')('./data/database.sqlite');
const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('admin1234', 10);
db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(hash, 'admin');
console.log('Admin password reset to: admin1234');
"
```

### Complete health check script

```bash
#!/bin/bash
# save as scripts/health-check.sh

echo "═══════════════════════════════════════"
echo "  Mymua — Health Check"
echo "═══════════════════════════════════════"

# 1. Node server
NODE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login 2>&1)
echo "✓ Node Server:    HTTP $NODE_STATUS"

# 2. Cloudflared
CF_RUNNING=$(ps aux | grep "cloudflared tunnel" | grep -v grep | wc -l)
echo "✓ Cloudflare:     $CF_RUNNING tunnel process(es)"

# 3. Database
DB_SIZE=$(ls -lh data/database.sqlite 2>/dev/null | awk '{print $5}')
echo "✓ Database:       $DB_SIZE"

# 4. Live subdomains (from internet)
echo "── Subdomains ──────"
for u in zara naina priya kavya ria meera diya; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$u.mymua.in" --max-time 10 2>&1)
  echo "  $u.mymua.in  HTTP $STATUS"
done

echo "═══════════════════════════════════════"
```

---

## Architecture Summary Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          INTERNET                                │
│                                                                  │
│  Browser ──https──→ naina.mymua.in                               │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE EDGE                             │
│                                                                  │
│  DNS Lookup: *.mymua.in CNAME → mymua.in (proxied) ✅            │
│  SSL/TLS:    Automatic Cloudflare certificate ✅                 │
│  Tunnel:     hostname "*.mymua.in" → tunnelmymua.in ✅           │
│                                                                  │
│  ┌─ DNS Records ────────────────────────┐                        │
│  │ mymua.in    Tunnel  tunnelmymua.in   │                        │
│  │ *           CNAME   mymua.in         │                        │
│  │ www.mymua.in A      147.93.29.55     │  ← cPanel (old site)   │
│  └──────────────────────────────────────┘                        │
└───────────────────────────┬──────────────────────────────────────┘
                            │ encrypted tunnel (QUIC)
                            │ outbound from server:7844
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                      YOUR SERVER                                 │
│                                                                  │
│  ┌─ cloudflared (PID: xxxx) ─────────────────────────────────┐   │
│  │ TUNNEL_TOKEN=eyJh...                                       │   │
│  │ Connected to tunnelmymua.in (4 connections) 🟢              │   │
│  │ Routing: *.mymua.in → http://127.0.0.1:3000                │   │
│  └──────────────────────┬─────────────────────────────────────┘   │
│                         │                                         │
│                         ▼                                         │
│  ┌─ Express (Node.js :3000) ─────────────────────────────────┐   │
│  │                                                           │   │
│  │  server.js                                                │   │
│  │   │                                                       │   │
│  │   ├── helmet()          ← Security headers (CSP, HSTS)    │   │
│  │   ├── morgan()          ← Request logging                 │   │
│  │   ├── session()         ← SQLite sessions                 │   │
│  │   ├── loadUser()        ← Attach user to res.locals       │   │
│  │   ├── csrfToken()       ← CSRF protection                │   │
│  │   │                                                       │   │
│  │   ├── /login          → routes/auth.js                   │   │
│  │   ├── /register       → routes/auth.js                   │   │
│  │   ├── /dashboard/*    → routes/dashboard.js              │   │
│  │   ├── /admin          → routes/admin.js                  │   │
│  │   │                                                       │   │
│  │   ├── / (subdomain)   → routes/brochure.js   ← ★ HERE    │   │
│  │   │    └─ Host: naina.mymua.in                           │   │
│  │   │       → split('.') → ["naina","mymua","in"]          │   │
│  │   │       → req.subdomainUsername = "naina"              │   │
│  │   │       → SELECT * FROM users WHERE username='naina'   │   │
│  │   │       → SELECT data FROM user_content WHERE user_id=X│   │
│  │   │       → render template-4.ejs                        │   │
│  │   │                                                       │   │
│  │   ├── /:username      → routes/brochure.js (path fallback)│   │
│  │   └── POST /booking   → routes/booking.js                │   │
│  │                                                           │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ SQLite Databases ───────────────────────────────────────┐   │
│  │  data/database.sqlite                                      │   │
│  │   ├── users (id, username, email, password_hash,           │   │
│  │   │         template_id, is_admin, ...)                    │   │
│  │   ├── user_content (id, user_id, data)                     │   │
│  │   ├── bookings (id, user_id, data, status)                 │   │
│  │   └── idx_users_username INDEX (for fast subdomain lookup) │   │
│  │                                                           │   │
│  │  data/sessions.db                                         │   │
│  │   └── sessions (sid, expired, sess)                       │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ Templates (views/templates/) ────────────────────────────┐   │
│  │  template-1.ejs  (Twilight Glow)    ← daisyUI             │   │
│  │  template-2.ejs  (Champagne Blush)  ← external CSS        │   │
│  │  template-3.ejs  (Editorial Edge)   ← external CSS        │   │
│  │  template-4.ejs  (Editorial Luxe)   ← inline styles       │   │
│  │  template-5.ejs  (Bridal Romance)   ← inline styles       │   │
│  │  template-6.ejs  (Indian Bridal)    ← inline styles       │   │
│  │  template-7.ejs  (Event Glamour)    ← inline styles       │   │
│  │  template-8.ejs  (Modern Classic)   ← inline styles       │   │
│  │  template-9.ejs  (Soft Radiance)    ← inline styles       │   │
│  │                                                           │   │
│  │  ALL receive same variables:                              │   │
│  │  user.basic, user.social, user.services,                  │   │
│  │  user.gallery, user.testimonials,                         │   │
│  │  username, bookingStatus, csrfToken                       │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```
