import "./brochure2.css";

const WA_PHONE = "919999999999";
let lb = null;
let onKeyBound = null;

document.addEventListener("DOMContentLoaded", () => {
  initHeaderScroll();
  initScrollAnimations();
  initStaggerReveal();
  initTouchFeedback();
  initGalleryLightbox();
  initServiceChips();
  initWhatsAppForm();
  initAvailabilityCalendar("3");
  initBookingForm("3");
  initTravelToggle("3");
});

function initTouchFeedback() {
  document.querySelectorAll(".service-card-ed, .link-item-ed, .g-item, .lb-nav, .lb-close").forEach((el) => {
    el.addEventListener("touchstart", () => {}, { passive: true });
  });
}

function initHeaderScroll() {
  const header = document.getElementById("editorial-header");
  if (!header) return;
  const bookBtn = header.querySelector('a[href="#contact"]');
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 60);
    if (y > 60) {
      header.style.color = "#1A1A1A";
      if (bookBtn) { bookBtn.style.color = "#1A1A1A"; bookBtn.style.borderColor = "#1A1A1A"; }
    } else {
      header.style.color = "";
      if (bookBtn) { bookBtn.style.color = ""; bookBtn.style.borderColor = ""; }
    }
  }, { passive: true });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const anim = entry.target.dataset.anim || "slide-up";
          entry.target.classList.add(`animate-${anim}`);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
}

function initStaggerReveal() {
  document.querySelectorAll("[data-reveal-stagger]").forEach((parent) => {
    const children = Array.from(parent.children);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            children.forEach((child, i) => {
              child.style.animation = `slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.06}s forwards`;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(parent);
  });
}

function initGalleryLightbox() {
  const gallery = document.getElementById("gallery-grid-ed");
  if (!gallery) return;
  const items = gallery.querySelectorAll("[data-src]");
  items.forEach((el, i) => {
    el.addEventListener("click", () => openLightbox(i));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(i); }
    });
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `Open gallery image ${i + 1}`);
  });
}

function getGalleryMeta() {
  const items = document.querySelectorAll("#gallery-grid-ed [data-src]");
  return {
    src: Array.from(items).map((i) => i.getAttribute("data-src")),
    alt: Array.from(items).map((i) => i.getAttribute("data-alt") || "Editorial makeup"),
  };
}

function openLightbox(index) {
  const meta = getGalleryMeta();
  if (!meta.src.length) return;
  lb = { current: index, total: meta.src.length };
  renderLightbox(meta);
}

function renderLightbox(meta) {
  const old = document.getElementById("lb");
  if (old) old.remove();
  if (onKeyBound) document.removeEventListener("keydown", onKeyBound);

  const wrap = ce("div", { id: "lb", className: "lb-backdrop" });

  const topBar = ce("div", { className: "lb-top" });
  const counter = ce("span", { className: "lb-counter", id: "lb-counter" });
  counter.textContent = `${lb.current + 1} / ${lb.total}`;
  const closeBtn = ce("button", { className: "lb-close", "aria-label": "Close" });
  closeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
  topBar.appendChild(counter);
  topBar.appendChild(closeBtn);
  wrap.appendChild(topBar);

  const imgWrap = ce("div", { className: "lb-img-wrap" });
  const img = ce("img", { className: "lb-img", id: "lb-img" });
  img.src = meta.src[lb.current];
  img.alt = meta.alt[lb.current];
  imgWrap.appendChild(img);
  wrap.appendChild(imgWrap);

  const caption = ce("div", { className: "lb-caption" });
  const captionP = ce("p");
  captionP.textContent = meta.alt[lb.current];
  caption.appendChild(captionP);
  wrap.appendChild(caption);

  if (lb.total > 1) {
    const prevBtn = ce("button", { className: "lb-nav lb-prev", "aria-label": "Previous" });
    prevBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`;
    const nextBtn = ce("button", { className: "lb-nav lb-next", "aria-label": "Next" });
    nextBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`;
    wrap.appendChild(prevBtn);
    wrap.appendChild(nextBtn);
    prevBtn.addEventListener("click", () => navigateLB(-1, meta));
    nextBtn.addEventListener("click", () => navigateLB(1, meta));
  }

  document.body.appendChild(wrap);
  document.body.style.overflow = "hidden";

  requestAnimationFrame(() => {
    img.style.opacity = "0";
    requestAnimationFrame(() => {
      img.style.transition = "opacity 0.3s ease";
      img.style.opacity = "1";
    });
  });

  closeBtn.addEventListener("click", closeLB);
  wrap.addEventListener("click", (e) => {
    if (e.target === wrap || e.target === imgWrap) closeLB();
  });

  onKeyBound = (e) => {
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") navigateLB(-1, meta);
    if (e.key === "ArrowRight") navigateLB(1, meta);
  };
  document.addEventListener("keydown", onKeyBound);

  initTouchLB(imgWrap, img, meta);
  let zoomed = false;
  imgWrap.addEventListener("dblclick", () => {
    zoomed = !zoomed;
    img.classList.toggle("zoomed", zoomed);
  });
}

function navigateLB(dir, meta) {
  if (!lb) return;
  lb.current = (lb.current + dir + lb.total) % lb.total;
  updateLightboxContent(meta);
}

function updateLightboxContent(meta) {
  if (!lb) return;
  const img = document.getElementById("lb-img");
  const counter = document.getElementById("lb-counter");
  const caption = document.querySelector(".lb-caption p");
  if (!img) return;
  img.style.opacity = "0";
  setTimeout(() => {
    if (!lb) return;
    img.src = meta.src[lb.current];
    img.alt = meta.alt[lb.current];
    img.classList.remove("zoomed");
    requestAnimationFrame(() => {
      img.style.transition = "opacity 0.3s ease";
      img.style.opacity = "1";
    });
  }, 150);
  if (counter) counter.textContent = `${lb.current + 1} / ${lb.total}`;
  if (caption) caption.textContent = meta.alt[lb.current];
}

function closeLB() {
  if (onKeyBound) { document.removeEventListener("keydown", onKeyBound); onKeyBound = null; }
  const wrap = document.getElementById("lb");
  if (wrap) wrap.remove();
  else lb = null;
  document.body.style.overflow = "";
}

function initTouchLB(imgWrap, img, meta) {
  let startX = 0, dx = 0, isDragging = false;
  const threshold = 60;
  imgWrap.addEventListener("touchstart", (e) => {
    if (!lb) return;
    startX = e.touches[0].clientX; dx = 0; isDragging = true;
  }, { passive: true });
  imgWrap.addEventListener("touchmove", (e) => {
    if (!isDragging || !lb) return;
    dx = e.touches[0].clientX - startX;
    if (Math.abs(dx) > 10) {
      img.style.transform = `translateX(${dx * 0.4}px) scale(0.95)`;
      img.style.opacity = `${1 - Math.min(Math.abs(dx) / 600, 0.5)}`;
    }
  }, { passive: true });
  imgWrap.addEventListener("touchend", () => {
    if (!isDragging || !lb) return;
    isDragging = false;
    img.style.transition = "all 0.4s ease";
    if (Math.abs(dx) > threshold) {
      if (dx > 0) navigateLB(-1, meta);
      else navigateLB(1, meta);
    } else { img.style.transform = ""; img.style.opacity = "1"; }
  }, { passive: true });
}

function initServiceChips() {
  document.querySelectorAll(".service-chip-2").forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("active");
      chip.setAttribute("aria-pressed", chip.classList.contains("active") ? "true" : "false");
    });
  });
}

function initWhatsAppForm() {
  const form = document.getElementById("wa-form-2");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("wa-name-2")?.value?.trim() || "";
    const phone = document.getElementById("wa-phone-2")?.value?.trim() || "";
    const date = document.getElementById("wa-date-2")?.value || "";
    const notes = document.getElementById("wa-notes-2")?.value?.trim() || "";
    const inquiryType = document.getElementById("wa-inquiry-2")?.value || "";
    const selectedChips = document.querySelectorAll(".service-chip-2.active");
    const services = Array.from(selectedChips).map((c) => c.textContent.trim()).join(", ");
    let msg = `Hello! I'd like to inquire about bridal makeup services.%0A%0A`;
    if (name) msg += `Name: ${name}%0A`;
    if (phone) msg += `Phone: ${phone}%0A`;
    if (inquiryType) msg += `Inquiry: ${inquiryType}%0A`;
    if (date) msg += `Event Date: ${date}%0A`;
    if (services) msg += `Services: ${services}%0A`;
    if (notes) msg += `Notes: ${notes}%0A`;
    msg += `%0AThank you!`;
    window.open(`https://wa.me/${WA_PHONE}?text=${msg}`, "_blank", "noopener,noreferrer");
  });
}

function ce(tag, attrs = {}) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "className") el.className = v;
    else el.setAttribute(k, v);
  });
  return el;
}

function initTravelToggle(suffix) {
  const radios = document.querySelectorAll(`#booking-form-${suffix} input[name="travel"]`);
  const dest = document.querySelector(`#booking-form-${suffix} .travel-destination`);
  if (!radios.length || !dest) return;
  radios.forEach((r) => {
    r.addEventListener("change", () => { dest.style.display = r.value === "yes" ? "block" : "none"; });
  });
}

function initAvailabilityCalendar(suffix) {
  const container = document.getElementById(`calendar-${suffix}`);
  if (!container) return;
  const months = [];
  const now = new Date();
  for (let i = 0; i < 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  const bookedDates = new Set();
  months.forEach((m) => {
    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
    const numBooked = Math.floor(daysInMonth * 0.35);
    const booked = new Set();
    while (booked.size < numBooked) booked.add(Math.floor(Math.random() * daysInMonth) + 1);
    booked.forEach((d) => bookedDates.add(`${m.year}-${m.month}-${d}`));
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  months.forEach((m) => {
    const firstDay = new Date(m.year, m.month, 1).getDay();
    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
    const monthName = new Date(m.year, m.month).toLocaleString("en-US", { month: "long", year: "numeric" });
    const wrap = ce("div", { className: "cal-month" });
    const header = ce("div", { className: "cal-header" });
    const title = ce("span", { className: "cal-title" });
    title.textContent = monthName;
    header.appendChild(title);
    wrap.appendChild(header);
    const grid = ce("div", { className: "cal-grid" });
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach((n) => {
      const el = ce("div", { className: "cal-day-name" });
      el.textContent = n;
      grid.appendChild(el);
    });
    for (let i = 0; i < firstDay; i++) grid.appendChild(ce("div", { className: "cal-day" }));
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = ce("div", { className: "cal-day" });
      const span = ce("span");
      span.textContent = d;
      const date = new Date(m.year, m.month, d);
      if (date < today) cell.classList.add("past");
      else if (bookedDates.has(`${m.year}-${m.month}-${d}`)) cell.classList.add("booked");
      else cell.classList.add("available");
      cell.appendChild(span);
      grid.appendChild(cell);
    }
    wrap.appendChild(grid);
    container.appendChild(wrap);
  });
}

function initBookingForm(suffix) {
  const form = document.getElementById(`booking-form-${suffix}`);
  if (!form) return;
  const submitBtn = document.getElementById(`booking-submit-${suffix}`);
  const status = document.getElementById(`booking-status-${suffix}`);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!submitBtn || !status) return;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    status.classList.remove("hidden");
    status.textContent = "Submitting your request...";
    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: new FormData(form) });
      const json = await res.json();
      if (json.success) {
        status.textContent = "✅ Booking request sent! We'll confirm within 2 hours.";
        form.reset();
      } else {
        status.textContent = "❌ Something went wrong. Try again or WhatsApp us.";
      }
    } catch {
      status.textContent = "❌ Network error. Check connection or WhatsApp us.";
    }
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Booking Request";
  });
}
