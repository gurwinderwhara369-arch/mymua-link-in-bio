import "./brochure.css";

const WA_PHONE = "919999999999";
let lb = null;
let onKeyBound = null;

document.addEventListener("DOMContentLoaded", () => {
  initPetalFall();
  initScrollAnimations();
  initGalleryLightbox();
  initNavScroll();
  initSmoothReveal();
  initTouchFeedback();
  initWhatsAppForm();
  initServiceChips();
  initAvailabilityCalendar("2");
  initBookingForm("2");
  initTravelToggle("2");
});

function initTouchFeedback() {
  document.querySelectorAll(".btn, .link-item, .pricing-card, .testimonial-card, .gallery-item, .lightbox-thumb, .lightbox-nav, .lightbox-close").forEach((el) => {
    el.addEventListener("touchstart", () => {}, { passive: true });
  });
}

function initPetalFall() {
  const container = document.getElementById("petals-container");
  if (!container) return;
  const total = 18;
  for (let i = 0; i < total; i++) {
    const petal = document.createElement("div");
    petal.className = "petal";
    petal.style.left = Math.random() * 100 + "%";
    petal.style.animationDelay = Math.random() * 12 + "s";
    petal.style.animationDuration = (8 + Math.random() * 10) + "s";
    petal.style.width = (14 + Math.random() * 12) + "px";
    petal.style.height = (16 + Math.random() * 10) + "px";
    petal.style.opacity = (0.2 + Math.random() * 0.4).toString();
    container.appendChild(petal);
  }
}

function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    observer.observe(el);
  });
}

function initSmoothReveal() {
  document.querySelectorAll("[data-reveal-stagger]").forEach((parent) => {
    const children = parent.children;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            Array.from(children).forEach((child, i) => {
              child.style.animation = `fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s forwards`;
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

function initNavScroll() {
  const header = document.querySelector("header");
  if (!header) return;
  let lastScroll = 0;

  window.addEventListener(
    "scroll",
    () => {
      const scrollY = window.scrollY;
      header.style.borderBottomWidth = scrollY > 60 ? "1px" : "0px";
      header.style.borderBottomColor = scrollY > 60 ? "rgba(212,163,115,0.15)" : "transparent";
      if (scrollY > lastScroll && scrollY > 120) {
        header.style.transform = "translateY(-100%)";
      } else {
        header.style.transform = "translateY(0)";
      }
      lastScroll = scrollY;
    },
    { passive: true }
  );
}

function initGalleryLightbox() {
  const gallery = document.getElementById("gallery-grid");
  if (!gallery) return;
  const items = gallery.querySelectorAll("[data-src]");
  if (!items.length) return;

  items.forEach((el, i) => {
    el.addEventListener("click", () => openLightbox(i));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(i);
      }
    });
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `Open gallery image ${i + 1}`);
  });
}

function getGalleryMeta() {
  const items = document.querySelectorAll("#gallery-grid [data-src]");
  return {
    src: Array.from(items).map((i) => i.getAttribute("data-src")),
    alt: Array.from(items).map((i) => i.getAttribute("data-alt") || "Bridal makeup gallery image"),
    label: Array.from(items).map((i) => i.getAttribute("data-label") || ""),
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

  const wrap = ce("div", { id: "lb", className: "lightbox-backdrop" });
  const prog = ce("div", { className: "lightbox-progress" });
  const progBar = ce("div", { className: "lightbox-progress-bar" });
  prog.appendChild(progBar);
  wrap.appendChild(prog);

  const topBar = ce("div", { className: "lightbox-top-bar" });
  const counter = ce("span", { className: "lightbox-counter", id: "lb-counter" });
  counter.textContent = `${lb.current + 1} / ${lb.total}`;
  const closeBtn = ce("button", { className: "lightbox-close", "aria-label": "Close gallery" });
  closeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
  topBar.appendChild(counter);
  topBar.appendChild(closeBtn);
  wrap.appendChild(topBar);

  const imgWrap = ce("div", { className: "lightbox-image-wrap", id: "lb-img-wrap" });
  const img = ce("img", { className: "lightbox-content", id: "lb-img" });
  img.src = meta.src[lb.current];
  img.alt = meta.alt[lb.current];
  imgWrap.appendChild(img);
  wrap.appendChild(imgWrap);

  const caption = ce("div", { className: "lightbox-caption" });
  const captionP = ce("p");
  captionP.textContent = meta.label[lb.current] || meta.alt[lb.current] || "";
  caption.appendChild(captionP);
  wrap.appendChild(caption);

  if (lb.total > 1) {
    const prevBtn = ce("button", { className: "lightbox-nav lightbox-prev", "aria-label": "Previous image" });
    prevBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`;
    const nextBtn = ce("button", { className: "lightbox-nav lightbox-next", "aria-label": "Next image" });
    nextBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`;
    wrap.appendChild(prevBtn);
    wrap.appendChild(nextBtn);
    prevBtn.addEventListener("click", () => navigateLB(-1, meta));
    nextBtn.addEventListener("click", () => navigateLB(1, meta));
  }

  if (lb.total > 1) {
    const thumbRow = ce("div", { className: "lightbox-thumbnails" });
    for (let i = 0; i < meta.src.length; i++) {
      const thumb = ce("div", { className: `lightbox-thumb${i === lb.current ? " active" : ""}`, "data-index": i, "aria-label": `Go to image ${i + 1}`, role: "button", tabindex: "0" });
      const tImg = ce("img");
      tImg.src = meta.src[i].replace(/w=\d+&q=\d+/g, "w=80&q=60");
      tImg.alt = "";
      tImg.setAttribute("aria-hidden", "true");
      thumb.appendChild(tImg);
      thumb.addEventListener("click", () => goToLB(i, meta));
      thumbRow.appendChild(thumb);
    }
    wrap.appendChild(thumbRow);
  }

  document.body.appendChild(wrap);
  document.body.style.overflow = "hidden";

  requestAnimationFrame(() => {
    img.style.opacity = "0";
    img.style.transform = "scale(0.92)";
    requestAnimationFrame(() => {
      img.style.transition = "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
      img.style.opacity = "1";
      img.style.transform = "scale(1)";
    });
  });

  updateProgressLB();
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

function goToLB(index, meta) {
  if (!lb || index === lb.current) return;
  lb.current = index;
  updateLightboxContent(meta);
}

function updateLightboxContent(meta) {
  if (!lb) return;
  const img = document.getElementById("lb-img");
  const counter = document.getElementById("lb-counter");
  const caption = document.querySelector(".lightbox-caption p");
  const progBar = document.querySelector(".lightbox-progress-bar");
  if (!img) return;

  img.style.opacity = "0";
  img.style.transform = "scale(0.92)";
  setTimeout(() => {
    if (!lb) return;
    img.src = meta.src[lb.current];
    img.alt = meta.alt[lb.current];
    img.classList.remove("zoomed");
    requestAnimationFrame(() => {
      img.style.transition = "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
      img.style.opacity = "1";
      img.style.transform = "scale(1)";
    });
  }, 200);

  if (counter && lb) counter.textContent = `${lb.current + 1} / ${lb.total}`;
  if (caption && lb) caption.textContent = meta.label[lb.current] || meta.alt[lb.current] || "";
  updateProgressLB();
  updateThumbsLB();
}

function updateProgressLB() {
  if (!lb) return;
  const bar = document.querySelector(".lightbox-progress-bar");
  if (bar) bar.style.width = `${((lb.current + 1) / lb.total) * 100}%`;
}

function updateThumbsLB() {
  if (!lb) return;
  document.querySelectorAll(".lightbox-thumb").forEach((t) => {
    t.classList.toggle("active", parseInt(t.getAttribute("data-index")) === lb.current);
  });
  const active = document.querySelector(".lightbox-thumb.active");
  if (active) active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
}

function closeLB() {
  if (onKeyBound) {
    document.removeEventListener("keydown", onKeyBound);
    onKeyBound = null;
  }
  const wrap = document.getElementById("lb");
  if (wrap) {
    wrap.style.animation = "fade-in 0.2s ease-out reverse";
    const img = document.getElementById("lb-img");
    if (img) { img.style.transform = "scale(0.92)"; img.style.opacity = "0"; }
    setTimeout(() => { wrap.remove(); lb = null; }, 250);
  } else { lb = null; }
  document.body.style.overflow = "";
}

function initTouchLB(imgWrap, img, meta) {
  let startX = 0, startY = 0, dx = 0, dy = 0, isDragging = false;
  const threshold = 60;

  imgWrap.addEventListener("touchstart", (e) => {
    if (!lb) return;
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    dx = 0; dy = 0; isDragging = true;
    img.style.transition = "none";
  }, { passive: true });

  imgWrap.addEventListener("touchmove", (e) => {
    if (!isDragging || !lb) return;
    const t = e.touches[0];
    dx = t.clientX - startX;
    dy = t.clientY - startY;
    const absDx = Math.abs(dx), absDy = Math.abs(dy);
    if (absDx > absDy && absDx > 10) {
      img.style.transform = `translateX(${dx * 0.4}px) scale(0.95)`;
      img.style.opacity = `${1 - Math.min(absDx / 600, 0.5)}`;
    } else if (absDy > absDx && absDy > 10) {
      img.style.transform = `translateY(${dy * 0.5}px) scale(${Math.max(0.7, 1 - absDy / 800)})`;
      img.style.opacity = `${1 - Math.min(absDy / 500, 0.8)}`;
    }
  }, { passive: true });

  imgWrap.addEventListener("touchend", () => {
    if (!isDragging || !lb) return;
    isDragging = false;
    img.style.transition = "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
    if (Math.abs(dy) > threshold && dy > 0) { closeLB(); return; }
    if (Math.abs(dx) > threshold) {
      if (dx > 0) navigateLB(-1, meta);
      else navigateLB(1, meta);
    } else { img.style.transform = "scale(1)"; img.style.opacity = "1"; }
  }, { passive: true });
}

function initWhatsAppForm() {
  const form = document.getElementById("whatsapp-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (document.getElementById("wa-name")?.value ?? "").trim();
    const phone = (document.getElementById("wa-phone")?.value ?? "").trim();
    const date = document.getElementById("wa-date")?.value ?? "";
    const notes = (document.getElementById("wa-notes")?.value ?? "").trim();
    const inquiryType = document.getElementById("wa-inquiry")?.value ?? "";
    const selectedChips = document.querySelectorAll(".service-chip.active");
    const services = Array.from(selectedChips).map((c) => c.textContent.trim()).join(", ");

    let message = `Hello! I'd like to inquire about bridal makeup services.%0A%0A`;
    if (name) message += `👤 Name: ${name}%0A`;
    if (phone) message += `📱 Phone: ${phone}%0A`;
    if (inquiryType) message += `📋 Inquiry: ${inquiryType}%0A`;
    if (date) message += `📅 Event Date: ${date}%0A`;
    if (services) message += `💄 Services: ${services}%0A`;
    if (notes) message += `📝 Notes: ${notes}%0A`;
    message += `%0AThank you!`;

    window.open(`https://wa.me/${WA_PHONE}?text=${message}`, "_blank", "noopener,noreferrer");
  });

  form.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("focus", (e) => {
      const label = e.target.closest(".whatsapp-field")?.querySelector(".whatsapp-form-label");
      if (label) label.style.opacity = "1";
    });
    input.addEventListener("blur", (e) => {
      const label = e.target.closest(".whatsapp-field")?.querySelector(".whatsapp-form-label");
      if (label && !e.target.value) label.style.opacity = "0.5";
    });
  });
}

function initServiceChips() {
  document.querySelectorAll(".service-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const nowActive = chip.classList.toggle("active");
      chip.setAttribute("aria-pressed", String(nowActive));
      chip.style.transform = "scale(0.92)";
      setTimeout(() => { chip.style.transform = "scale(1)"; }, 150);
    });
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
