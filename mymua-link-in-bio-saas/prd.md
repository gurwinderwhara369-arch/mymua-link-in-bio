# PRD: Mymua Link-in-Bio SaaS

> **Product:** Multi-template link-in-brochure for bridal MUAs
> **Builder:** Solo developer
> **Target:** 100–1000 paying MUAs
> **Philosophy:** Templates ≠ Wix. Fixed themes, one-click swap, zero drag-building.

---

## 1. Product Vision

A ridiculously simple SaaS where a bridal MUA signs up, fills a form, and gets a beautiful mobile brochure page. They can switch between 3 pre-built templates with one click. No design skills, no setup, no backend knowledge.

The brochure page has: Hero → About → Services → Gallery → Testimonials → Contact → Availability → Booking Form. Every MUA gets the same sections, just their content and chosen template style.

---

## 2. Target User

| Attribute | Description |
|-----------|-------------|
| **Who** | Bridal makeup artists in India (₹15K–₹50K per booking) |
| **Age** | 22–40, owns a smartphone, uses Instagram + WhatsApp daily |
| **Tech level** | Can upload photos, fill forms, copy-paste links |
| **Pain** | Needs a professional page to send brides, no time/money for a web dev |
| **Current solution** | Instagram highlights + WhatsApp catalog — messy, unprofessional |
| **Why they pay** | ₹199–₹499/mo vs ₹15K–₹50K one-time for a web dev |

---

## 3. Core Features

### 3.1 Public Brochure Page (`/:username`)
- Renders one of 3 templates with the MUA's content
- Template = entire visual identity (colors, fonts, layout, animations)
- Sections: Hero, About, Services, Gallery, Testimonials, Contact, Availability Calendar, Booking Form
- Mobile-first (320px–480px), desktop compatible
- WhatsApp floating button, image lightbox, scroll animations

### 3.2 Dashboard (`/dashboard`)
- **Profile** — Name, title, bio, profile photo, location
- **Services** — Add/edit/remove: service name, price, description
- **Gallery** — Upload images, drag reorder, delete
- **Testimonials** — Add/edit/remove: client name, text, event type
- **Social Links** — Instagram, WhatsApp, phone, email
- **Templates** — Preview all 3, one-click switch
- **Booking** — View incoming booking requests from the form

### 3.3 Auth System
- Email + password registration
- Session-based auth (bcrypt + express-session)
- "Forgot password" (email reset link)
- Rate-limited login attempts

### 3.4 Booking Notification
- Form submissions → email to MUA (via Web3Forms or SMTP)
- Dashboard shows all incoming booking requests

---

## 4. Phases

### Phase 1: Core MVP (Week 1 — 5 days)

**Goal:** MUA can sign up, fill content, pick template, get a live brochure page.

| Day | Task | Details |
|-----|------|---------|
| 1 | **Project setup** | Express server, SQLite, folder structure, static files, EJS setup |
| 1 | **Cloudflare Tunnel** | Install cloudflared, test quick tunnel from Codespace |
| 1 | **Database schema** | `users` table + `user_content` JSON column |
| 2 | **Auth system** | Register, login, logout, session middleware, rate limiting |
| 2 | **Dashboard layout** | Sidebar nav, dashboard home page, auth guard middleware |
| 3 | **Profile editor** | Form: name, title, bio, photo upload, location |
| 3 | **Service editor** | CRUD: service name, price, description |
| 3 | **Gallery upload** | Multi-image upload, thumbnails, delete |
| 4 | **Testimonials editor** | CRUD: client name, text, event type |
| 4 | **Social links editor** | Instagram, WhatsApp, phone, email fields |
| 4 | **Template converter** | Copy 3 existing HTML → EJS, replace hardcoded values with `<%= %>` |
| 5 | **Template switcher** | Dashboard shows 3 template previews, one-click switch |
| 5 | **Brochure route** | `/:username` → render selected template with user data |
| 5 | **Deploy** | PM2 + persistent Cloudflare Tunnel on VPS. Test tunnel from Codespace first |

**Phase 1 output:** Working SaaS. MUA signs up, fills data, picks template, gets `domain.com/@username`.

### Phase 2: Booking & Polish (Week 2 — 3 days)

| Day | Task | Details |
|-----|------|---------|
| 6 | **Booking form DB** | Store incoming booking requests |
| 6 | **Email notification** | SMTP email to MUA when booking submitted (Resend or Brevo) |
| 6 | **Dashboard booking list** | View all booking requests with status |
| 7 | **Availability calendar** | JS calendar (reuse current) on brochure + dashboard |
| 7 | **Form input validation** | Server-side validation on all dashboard forms |
| 7 | **File upload security** | Validate MIME type, file size limit (5MB), virus scanning |
| 8 | **Rate limiting** | express-rate-limit on auth routes + booking form |
| 8 | **XSS sanitization** | DOMPurify on all user text input before render |
| 8 | **CSRF protection** | Double-submit cookie pattern on all dashboard forms |

### Phase 3: Quality & Security Hardening (Week 3 — 3 days)

| Day | Task | Details |
|-----|------|---------|
| 9 | **Helmet middleware** | Security headers (CSP, HSTS, X-Frame-Options, etc.) |
| 9 | **Session hardening** | Secure cookies, httpOnly, sameSite, rolling expiration |
| 9 | **Password policy** | Min 8 chars, bcrypt cost factor 12 |
| 10 | **Mobile QA pass** | Test all 3 templates on iPhone SE, Pixel 7, Galaxy Fold |
| 10 | **Accessibility pass** | ARIA labels, focus management, screen reader testing |
| 10 | **Error handling** | Custom 404, 500 pages, global error middleware |
| 11 | **Logging** | Request logging (morgan), error logging (winston) |
| 11 | **Rate limit tuning** | Per-route rate limits, IP-based + user-based |
| 11 | **DB backup** | Automated SQLite backup script (cron daily) |

### Phase 4: Growth Features (Week 4+ — ongoing)

| Task | Details |
|------|---------|
| **Custom domains / subdomains** | Phase 1: `domain.com/@username` (subdirectories). Fast to build, zero DNS config, works immediately. Phase 4+: MUAs can upgrade to subdomains (`mua.domain.com`) or their own domain. Subdomain routing uses Cloudflare wildcard DNS + tunnel config |
| **Analytics dashboard** | Page views, WhatsApp clicks, booking form submits |
| **Payment integration** | Stripe/Razorpay — ₹199–₹499/mo subscription |
| **Referral system** | MUA invites another → both get 1 month free |
| **SEO** | Meta tags, Open Graph, JSON-LD schema per user page |
| **New templates** | Template 4, 5 based on user demand |

---

## 5. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Backend** | Node.js 20+ / Express 4 | Solo dev — same JS as frontend, fastest builds |
| **Database** | SQLite3 (via better-sqlite3) | Zero setup, no daemon, 1 file per DB. Handles 1000 users. Migrate to MySQL if needed |
| **Templating** | EJS | Direct HTML extension. 3 existing HTML files → EJS in hours |
| **Auth** | bcrypt + express-session | Simple, proven, no external dependency |
| **Styling (brochure)** | Built CSS from current Vite build | Already compiled. Just serve from `public/css/` |
| **Styling (dashboard)** | Tailwind CSS v3 CDN + daisyUI CDN | Zero build step, fast prototyping, consistent with brochures |
| **File storage** | Local filesystem (`public/uploads/`) | Simple for 100–1000 users. Each user = folder |
| **Email** | Resend or Brevo SMTP | Transactional emails (booking notif, password reset) |
| **Security** | Helmet, express-rate-limit, csurf, DOMPurify, express-validator | Covers OWASP Top 10 for a form-based app |
| **Hosting** | VPS + PM2 + Cloudflare Tunnel | Works from Codespace for testing, VPS for production. Zero open ports. No SSL config |
| **SSL** | Cloudflare edge | Automatic. No certbot, no renewal |
| **Process** | PM2 | Auto-restart, cluster mode, log management |

---

## 6. Database Schema

```sql
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  template_id   INTEGER DEFAULT 1,  -- 1, 2, or 3
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE user_content (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
  data    TEXT DEFAULT '{}'  -- JSON blob: { name, bio, photo, location,
                             --   services[], gallery[], testimonials[],
                             --   social{phone, whatsapp, instagram, email},
                             --   booking{availability} }
);

CREATE TABLE bookings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  data       TEXT NOT NULL,  -- JSON: { name, phone, email, location,
                             --          service, guests, date, travel,
                             --          destination, notes }
  status     TEXT DEFAULT 'pending',  -- pending, confirmed, cancelled
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  sid        TEXT PRIMARY KEY,
  sess       TEXT NOT NULL,  -- JSON session data
  expired    DATETIME NOT NULL
);
```

**Why JSON column for user_content:**
- All 3 templates use the SAME fields (name, bio, services, etc.)
- One column, one query, no joins
- Adding a field = just adding a key in JSON. No migration
- For 100–1000 users on SQLite, this is performant enough
- If scaling beyond, migrate to PostgreSQL JSONB

---

## 7. Template Architecture

### How Templates Work

Each template is an EJS file in `views/templates/`. They contain:
- Full HTML structure (unchanged from current HTML files)
- CSS links to the built CSS files (from current dist)
- JS links to the built JS files (from current dist)
- EJS tags replacing hardcoded content

### Template Switching Flow

```
Dashboard click "Template 2"
  → POST /dashboard/template  { template_id: 2 }
  → UPDATE users SET template_id = 2
  → User sees confirmation

Public visit domain.com/@priya
  → GET /@priya
  → DB read: user row + user_content JSON
  → SELECT template_id → load template-2.ejs
  → Render with user content
  → Serve HTML
```

### Template → EJS Conversion

```ejs
<!-- Current hardcoded: -->
<h1>Priya Sharma</h1>
<p class="bio-text">Premium bridal makeup artistry by Priya Sharma...</p>
<img src="https://images.unsplash.com/photo-xxx" alt="Bridal makeup" />

<!-- Converted to EJS: -->
<h1><%= user.name %></h1>
<p class="bio-text"><%= user.bio %></p>
<img src="<%= user.photo || '/images/default-hero.jpg' %>" alt="<%= user.name %>" />

<!-- Services loop: -->
<% user.services.forEach(function(s) { %>
<div class="service-card">
  <h3><%= s.name %></h3>
  <p class="price"><%= s.price %></p>
</div>
<% }) %>

<!-- Gallery loop: -->
<% user.gallery.forEach(function(img) { %>
<div class="g-item">
  <img src="<%= img.url %>" alt="<%= img.alt %>" loading="lazy" />
</div>
<% }) %>
```

---

## 8. Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Password storage** | bcrypt, cost factor 12 |
| **Session security** | httpOnly, secure (prod), sameSite: 'strict', rolling: true |
| **CSRF** | Double-submit cookie pattern on all state-changing requests |
| **Rate limiting** | Auth: 5 attempts/15min. Booking: 3/min. Dashboard: 30/min |
| **XSS prevention** | DOMPurify on all user text before rendering in EJS |
| **SQL injection** | Parameterized queries (better-sqlite3 prepared statements) |
| **File upload** | MIME type validation, max 5MB, no executable extensions |
| **Security headers** | Helmet middleware (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) |
| **HTTPS** | Cloudflare edge (Full/Strict). App runs plain HTTP on localhost:3000 |
| **Input validation** | express-validator on all form routes |
| **Error exposure** | No stack traces in production. Generic error messages to users |
| **Logging** | Auth attempts logged. Access logs via morgan |

---

## 9. Quality Requirements

| Requirement | Standard |
|-------------|----------|
| **Mobile support** | 320px–480px viewports. Test on iPhone SE, Pixel 7, Galaxy Fold |
| **Touch targets** | Minimum 48x48px, 8px separation between interactive elements |
| **Safe areas** | `env(safe-area-inset-*)` on fixed/sticky elements |
| **Font scaling** | `clamp()` on font sizes. Test at 200% system font zoom |
| **Contrast** | WCAG AA minimum 4.5:1 for body text |
| **CLS prevention** | `aspect-ratio` on all images |
| **Keyboard nav** | All interactive elements focusable and operable via keyboard |
| **Screen reader** | ARIA labels on icons, `alt` on all images, semantic HTML |
| **No hover dependency** | All interactions work via tap/click. No hover-only features |
| **Offline handling** | Graceful degradation, error message on form submit failure |
| **Page speed** | Target <2s Time to Interactive on 4G |
| **Form zoom prevention** | `font-size: 16px !important` on all inputs |

---

## 10. Constraints (Honest)

- **Subdirectories, not subdomains, in Phase 1.** `domain.com/@username` — zero DNS config, works immediately with Cloudflare Tunnel. Subdomains (`username.domain.com`) and custom domains are Phase 4 paid upgrades.
- **No real-time preview during editing.** Save → refresh brochure page.
- **No mobile app.** Web-only. PWA optional for Phase 4.
- **No multi-language.** English + Hindi Hinglish can be added if demand exists.
- **Each user = 1 brochure page.** No sub-pages, no blog, no CMS.
- **SQLite, not Postgres.** Works for 1000 users. Migration path exists if needed.

---

## 11. Success Metrics

| Metric | Target (Phase 1) | Target (Phase 4) |
|--------|-------------------|------------------|
| Registered MUAs | 50 | 1000 |
| Active brochure pages | 30 | 600 |
| Monthly brochure views | 10K | 500K |
| Booking form submissions | 100/mo | 5000/mo |
| Page load time (<2s) | 95% | 99% |
| Uptime | 99.5% | 99.9% |

---

## 12. Future Considerations (Not Building Now)

- Stripe/Razorpay subscription billing
- Custom domain mapping (MUA's own domain)
- Analytics dashboard (views, clicks)
- Referral program
- WhatsApp notification for bookings (instead of email)
- PWA install prompt on brochure page
- More templates (based on user demand)
- Team/agency accounts (multiple MUAs under one org)
