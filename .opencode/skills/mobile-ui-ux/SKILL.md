---
name: mobile-ui-ux
description: Pixel-perfect mobile responsive UI/UX design and development engine with 50 hard rules, fluid math architecture, safe-area mechanics, container queries, daisyUI integration, and production CSS/Tailwind boilerplates for link-in-bio and mobile web apps.
---

# Mobile Responsive UI/UX — Pixel-Perfect Engineering Engine

You are building for **mymua-link-in-bio** — a mobile-first link-in-bio page for a makeup artist. Every decision below is hardened for 2026 mobile viewports.

## Core Philosophy

1. **Mobile-first** — base CSS at 320px, enhance with `min-width`. Desktop is the bonus, not the target.
2. **No hardcoded pixels for sizing** — fluid math (`clamp`, `%`, `dvh`) everywhere.
3. **8px hard grid** — every margin/padding is a multiple of 8px.
4. **Safe-area aware** — `env(safe-area-inset-*)` on every sticky/fixed element.
5. **Container queries over media queries** — components respond to their parent, not the viewport.
6. **No hover on touch** — `@media (pointer: coarse)` kills hover states.
7. **daisyUI 5 + Tailwind CSS 4** — semantic classes, zero-JS components, theme-driven.
8. **100dvh not 100vh** — dynamic viewport units prevent bottom bar clipping.

---

## 50 Hard Execution Rules

### Section 1: Hardware, Notch & Screen Realities (1–10)

1. **viewport-fit=cover** — your `<meta name="viewport">` MUST include `viewport-fit=cover` or you're building a website, not a mobile app.
2. **Dynamic Island clearance** — keep critical text/tiny alerts clear of top-center 54px on modern iOS.
3. **Double safe-area inset** — `padding-bottom: calc(16px + env(safe-area-inset-bottom))` on bottom stickies. Never raw numbers.
4. **Foldable divide** — `@media (horizontal-viewport-segments: 2)` to prevent content splitting across a fold hinge.
5. **Left-hand escape hatches** — modal Close/Back in top-left or bottom-center, never top-right.
6. **Thumb-zone CTAs** — primary actions in bottom 35% of screen. If a CTA requires reaching top 20%, layout fails.
7. **Aspect ratio isolation** — validate 21:9 (foldables/tall) AND 16:9 (budget) concurrently. Bottom buttons must not fall off on stubby screens.
8. **48px target minimum** — interactive hitbox never below 48x48px.
9. **Pseudo-element hitbox expansion** — tiny 16px icons get `::before { content: ''; position: absolute; inset: -16px; }` for fat fingers.
10. **Rotational destruction guard** — never portrait-lock. Reposition sticky FABs into compact sidebar panels on `orientation: landscape`.

### Section 2: Typography & Layout Architecture (11–20)

11. **clamp() everywhere** — never static `px` for font-size. Use fluid clamps.
12. **Line-height 1.5–1.65** for body text. Tighter lines create unreadable walls on high-density screens.
13. **16px input zoom defense** — `input, select, textarea { font-size: 16px !important; }`. iOS auto-zooms below 16px.
14. **System font stack** — `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto` — no multi-megabyte font downloads on mobile networks.
15. **60-character ceiling** — text containers max ~60 chars per line. Edge-to-edge text tires the eye.
16. **Never hardcode container heights with text** — use `min-height` + flex centering. Text wraps naturally.
17. **8px spacing multiplier** — space-1 (4px), space-2 (8px), space-3 (12px), space-4 (16px), space-6 (24px), space-8 (32px), space-12 (48px).
18. **No-kissing boundaries** — permanent horizontal padding minimum of 16px on all structural wrappers.
19. **Sub-pixel rounding shields** — use integer-based percentages or clean fractional `rem` units. Avoid `width: 33.333%`.
20. **Flexbox wrapping mandate** — `flex-wrap: wrap` on every inline row of buttons/tags/badges.

### Section 3: Performance, Interaction & Animation (21–30)

21. **Zero hover reliance** — mobile has no hover. Tooltips/info behind hover are invisible to touch users.
22. **Tap-active feedback** — `:active { transform: scale(0.98); }` for physical confirmation of every tap.
23. **Desktop hover suppression** — wrap hover effects in `@media (hover: hover)` to prevent stuck-highlighted states on mobile.
24. **GPU acceleration triggers** — `transform: translateZ(0)` or `will-change: transform` on sticky headers, sliding drawers, overlays.
25. **300ms delay elimination** — `touch-action: manipulation` on all interactive blocks.
26. **Inertial momentum scrolling** — `-webkit-overflow-scrolling: touch` on internal scrollable panels.
27. **Layout shift lock** — strict `aspect-ratio` on images and ad zones to prevent CLS as assets stream in.
28. **Scroll overlap defense** — `body { overflow: hidden }` when modals/drawers open to prevent dual-axis scroll fights.
29. **Swipe-to-dismiss universality** — any bottom sheet/panel must be dismissible by pulling down, not just tapping an X.
30. **Skeleton masking** — never use spinner animations. Use structural skeleton loaders matching your layout.

### Section 4: Components, Input & Form UX (31–40)

31. **Contextual keyboard injection** — `inputmode="numeric"`, `type="email"`, `type="tel"`, `autocomplete` on every form field.
32. **Autofill compatibility** — `autocomplete="cc-number"`, `autocomplete="one-time-code"` for OS biometrics and password managers.
33. **Massive field hitboxes** — minimum 52px height on text inputs for easy thumb targeting.
34. **Persistent floating labels** — never hide labels inside placeholders. Users forget what they were typing.
35. **Inline validation** — error messages directly below the field, not in a summary block at page top/bottom.
36. **Inline dropdown replacement** — ditch `<select>` for <5 options. Use segmented button toggles.
37. **Bottom-sheet selectors** — >5 items -> bottom modal sheet within thumb reach.
38. **Progress saving** — `localStorage` auto-backup on multi-step forms. Accidental tab close = no data loss.
39. **Single-column form default** — multi-column forms break mobile vertical scanning patterns.
40. **Destructive action double-checks** — secondary confirmation or pull-to-confirm for deletes/wipes.

### Section 5: Edge Cases, System Integration & Verification (41–50)

41. **Real-time offline warning** — `navigator.onLine` listener. Instant banner on connection drop, no silent timeout crash.
42. **Multi-state dark mode** — never simple inversion. Drop opacity on bright images, soften neon colors in dark mode.
43. **Data throttling protection** — `navigator.connection.saveData` disables autoplay video, non-essential animations, requests compressed images.
44. **Contrast compliance** — minimum 4.5:1 for body text (WCAG AA). Essential for readability in direct sunlight.
45. **Universal screen-reader support** — `aria-expanded`, `aria-live`, `role="dialog"` on dynamic elements.
46. **Red-line overflow scan** — `* { outline: 1px solid rgba(255,0,0,0.2) }` — any box bleeding past viewport = immediate fix.
47. **200% text scaling stress test** — device settings -> 200% text. Elements must push down cleanly, never overlap.
48. **100dvh not 100vh** — `height: 100dvh` prevents bottom nav from slipping under the shifting address bar.
49. **Touch-target separation** — 8px buffer minimum between interactive elements to prevent mis-taps.
50. **High-refresh optimization** — use CSS transitions/Web Animation API for 90Hz/120Hz, never `setInterval` animations.

---

## CSS Baseline Architecture

```css
/* === Mobile Viewport Lock === */
@viewport { width: device-width; }
@-ms-viewport { width: device-width; }

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  width: 100%;
  height: 100dvh;
  min-height: 100dvh;
  overflow-x: hidden;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* === 8px Hard Grid Design Tokens === */
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  --text-xs: clamp(0.75rem, 0.69rem + 0.26vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.81rem + 0.28vw, 1rem);
  --text-base: clamp(1rem, 0.94rem + 0.27vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1.01rem + 0.49vw, 1.35rem);
  --text-xl: clamp(1.35rem, 1.2rem + 0.65vw, 1.65rem);
  --text-2xl: clamp(1.65rem, 1.45rem + 0.88vw, 2.1rem);
  --text-3xl: clamp(2rem, 1.75rem + 1.2vw, 2.5rem);
}

/* === iOS Zoom Fix === */
input, select, textarea, button {
  font-size: 16px !important;
  font-family: inherit;
}

/* === Inertial Scrolling === */
.scrollable-viewport {
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.scrollable-viewport::-webkit-scrollbar { display: none; }

/* === Safe Area Utilities === */
.safe-top { padding-top: env(safe-area-inset-top, 0px); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
.safe-left { padding-left: env(safe-area-inset-left, 0px); }
.safe-right { padding-right: env(safe-area-inset-right, 0px); }
```

---

## Tailwind CSS v4 + daisyUI 5 Configuration

For Tailwind CSS v4 (CSS-first config), add to your main CSS file:

```css
@import "tailwindcss";
@plugin "daisyui";

@theme {
  --breakpoint-xs: 320px;
  --breakpoint-sm: 390px;
  --breakpoint-md: 440px;
  --breakpoint-lg: 600px;

  --font-size-fluid-xs: clamp(0.75rem, 0.69rem + 0.26vw, 0.875rem);
  --font-size-fluid-sm: clamp(0.875rem, 0.81rem + 0.28vw, 1rem);
  --font-size-fluid-base: clamp(1rem, 0.94rem + 0.27vw, 1.125rem);
  --font-size-fluid-lg: clamp(1.125rem, 1.01rem + 0.49vw, 1.35rem);
  --font-size-fluid-xl: clamp(1.35rem, 1.2rem + 0.65vw, 1.65rem);
  --font-size-fluid-2xl: clamp(1.65rem, 1.45rem + 0.88vw, 2.1rem);

  --spacing-touch-target: 48px;
  --spacing-field-target: 52px;
}

@layer utilities {
  @media (pointer: coarse) and (hover: none) {
    .mobile-no-hover {
      -webkit-tap-highlight-color: transparent;
    }
    .mobile-active-feedback:active {
      transform: scale(0.97);
    }
  }
}
```

For **daisyUI 5 themes** (this project uses `sunset` theme):
- Set `<html data-theme="sunset">` for dark luxury beauty vibe
- Or use theme picker with daisyUI's 35+ themes
- Test all components in both light and dark modes
- daisyUI 5 uses OKLCH color space — override via CSS variables in a `@layer base`

---

## Structural Layout Boilerplate (Link-in-Bio Optimized)

```html
<!DOCTYPE html>
<html lang="en" data-theme="sunset">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#09090b" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <title>MUA Link in Bio</title>
  <link rel="stylesheet" href="/src/styles.css" />
</head>
<body class="bg-base-300 text-base-content">
  <div class="flex flex-col h-dvh max-h-dvh overflow-hidden">

    <!-- Header with safe-area -->
    <header class="flex-none px-4 pt-safe-top bg-base-200/80 backdrop-blur-md border-b border-base-300 z-50">
      <div class="flex items-center justify-between h-14 max-w-[480px] mx-auto">
        <h1 class="text-fluid-lg font-bold">MUA</h1>
        <button class="btn btn-ghost btn-circle w-12 h-12" aria-label="Menu">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Main scrollable content -->
    <main class="flex-1 overflow-y-auto scrollable-viewport px-4 py-6">
      <div class="max-w-[480px] mx-auto flex flex-col gap-6">

        <!-- Profile Card -->
        <section class="card bg-base-100 border border-base-200 shadow-sm">
          <div class="card-body items-center text-center gap-4 p-6">
            <div class="avatar">
              <div class="w-24 h-24 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" alt="MUA Profile" />
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <h2 class="text-fluid-xl font-bold">Artist Name</h2>
              <p class="text-fluid-sm text-base-content/60">Professional Makeup Artist</p>
              <p class="text-fluid-xs text-base-content/40 mt-1">📍 Los Angeles · Bookings Open</p>
            </div>
          </div>
        </section>

        <!-- Link Grid (8px spaced) -->
        <div class="flex flex-col gap-3">
          <a href="#" class="btn btn-primary btn-lg w-full h-14 text-fluid-base rounded-2xl shadow-sm active:scale-[0.98] transition-transform">
            View Portfolio
          </a>
          <a href="#" class="btn btn-outline btn-lg w-full h-14 text-fluid-base rounded-2xl active:scale-[0.98] transition-transform">
            Book a Session
          </a>
          <a href="#" class="btn btn-ghost btn-lg w-full h-14 text-fluid-base rounded-2xl active:scale-[0.98] transition-transform">
            Instagram @mua
          </a>
          <a href="#" class="btn btn-ghost btn-lg w-full h-14 text-fluid-base rounded-2xl active:scale-[0.98] transition-transform">
            TikTok @mua
          </a>
          <a href="#" class="btn btn-ghost btn-lg w-full h-14 text-fluid-base rounded-2xl active:scale-[0.98] transition-transform">
            YouTube
          </a>
        </div>

        <!-- Gallery Grid with container query pattern -->
        <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,140px),1fr))] gap-3">
          <div class="aspect-[4/5] rounded-2xl overflow-hidden bg-base-200">
            <img src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp" alt="Look 1" class="w-full h-full object-cover" loading="lazy" />
          </div>
          <div class="aspect-[4/5] rounded-2xl overflow-hidden bg-base-200">
            <img src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp" alt="Look 2" class="w-full h-full object-cover" loading="lazy" />
          </div>
          <div class="aspect-[4/5] rounded-2xl overflow-hidden bg-base-200">
            <img src="https://img.daisyui.com/images/stock/photo-1572635148818-7686b1f1c9a7.webp" alt="Look 3" class="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>

      </div>
    </main>

    <!-- Bottom Navigation with safe-area -->
    <nav class="flex-none px-4 pb-safe-bottom bg-base-200/80 backdrop-blur-md border-t border-base-300 z-50">
      <div class="flex items-center justify-around h-16 max-w-[480px] mx-auto">
        <button class="btn btn-ghost btn-sm flex-col gap-0 w-14 h-14 text-primary">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
          <span class="text-[10px] font-bold tracking-widest uppercase">Home</span>
        </button>
        <button class="btn btn-ghost btn-sm flex-col gap-0 w-14 h-14 text-base-content/50">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          <span class="text-[10px] font-bold tracking-widest uppercase">Gallery</span>
        </button>
        <button class="btn btn-ghost btn-sm flex-col gap-0 w-14 h-14 text-base-content/50">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span class="text-[10px] font-bold tracking-widest uppercase">Book</span>
        </button>
      </div>
    </nav>

  </div>
</body>
</html>
```

---

## Container Query Component Pattern

For reusable cards/widgets that appear in multiple contexts:

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (max-width: 340px) {
  .card-inner {
    flex-direction: column;
    gap: var(--space-2);
  }
  .card-avatar {
    width: 40px;
    height: 40px;
  }
}

@container card (min-width: 341px) {
  .card-inner {
    flex-direction: row;
    gap: var(--space-4);
  }
  .card-avatar {
    width: 56px;
    height: 56px;
  }
}
```

---

## Pre-Delivery Checklist

Before shipping ANY code:

- [ ] Test on iPhone SE (320px), Modern Flagship (393-430px), Galaxy Fold (512-280px)
- [ ] System text zoom at 200% — no overlap, no clipping
- [ ] Red-line overflow scan — no horizontal scroll
- [ ] All touch targets >= 48x48px with 8px separation
- [ ] Safe-area inset on all sticky/fixed elements
- [ ] `touch-action: manipulation` on interactive elements
- [ ] `:active` feedback on all buttons
- [ ] No hover-only functionality
- [ ] WCAG contrast minimum 4.5:1 on all text
- [ ] `alt` text and ARIA labels on all interactive elements
- [ ] Test landscape rotation — no content cutoff
- [ ] `100dvh` not `100vh` on layout wrappers
- [ ] `clamp()` on all font sizes, never static px
- [ ] `aspect-ratio` on all images (prevents CLS)
- [ ] `inputmode` and `autocomplete` on all form fields
