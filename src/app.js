import "./styles.css";

const WA_PHONE = "919999999999";
let lb = null;
let onKeyBound = null;

document.addEventListener("DOMContentLoaded", () => {
  initScrollAnimations();
  initGalleryLightbox();
  initWhatsAppForm();
  initServiceChips();
  initNavScroll();
  initSmoothReveal();
});

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
    el.style.opacity = "0";
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
              child.style.opacity = "0";
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
    const services = Array.from(selectedChips)
      .map((chip) => chip.textContent.trim())
      .join(", ");

    let message = `Hello! I'd like to inquire about bridal makeup services.%0A%0A`;

    if (name) message += `👤 Name: ${name}%0A`;
    if (phone) message += `📱 Phone: ${phone}%0A`;
    if (inquiryType) message += `📋 Inquiry: ${inquiryType}%0A`;
    if (date) message += `📅 Event Date: ${date}%0A`;
    if (services) message += `💄 Services: ${services}%0A`;
    if (notes) message += `📝 Notes: ${notes}%0A`;

    message += `%0AThank you!`;

    const url = `https://wa.me/${WA_PHONE}?text=${message}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });

  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.addEventListener("focus", (e) => {
      const label = e.target
        .closest(".whatsapp-field")
        ?.querySelector(".whatsapp-form-label");
      if (label) label.style.opacity = "1";
    });
    input.addEventListener("blur", (e) => {
      const label = e.target
        .closest(".whatsapp-field")
        ?.querySelector(".whatsapp-form-label");
      if (label && !e.target.value) label.style.opacity = "0.6";
    });
  });
}

function initServiceChips() {
  document.querySelectorAll(".service-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const nowActive = chip.classList.toggle("active");
      chip.setAttribute("aria-pressed", String(nowActive));
      chip.style.transform = "scale(0.92)";
      setTimeout(() => {
        chip.style.transform = "scale(1)";
      }, 150);
    });
  });
}

function initNavScroll() {
  const header = document.querySelector("header");
  if (!header) return;

  const scrollEl = document.querySelector(".scroll-container") || document.querySelector(".flex.flex-col.min-h-dvh");
  if (!scrollEl) return;

  let lastScroll = 0;

  scrollEl.addEventListener("scroll", () => {
    const scrollY = scrollEl.scrollTop;

    header.style.borderBottomWidth = scrollY > 60 ? "1px" : "0px";
    header.style.backdropFilter = scrollY > 60 ? "blur(24px)" : "blur(20px)";

    if (scrollY > lastScroll && scrollY > 120) {
      header.style.transform = "translateY(-100%)";
    } else {
      header.style.transform = "translateY(0)";
    }

    lastScroll = scrollY;
  }, { passive: true });
}

/* ====== LIGHTBOX ====== */

function initGalleryLightbox() {
  const gallery = document.getElementById("gallery-grid");
  if (!gallery) return;

  const items = gallery.querySelectorAll("[data-src]");
  if (items.length === 0) return;

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
  if (meta.src.length === 0) return;
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
  closeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
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
    prevBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>`;
    const nextBtn = ce("button", { className: "lightbox-nav lightbox-next", "aria-label": "Next image" });
    nextBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>`;
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
      tImg.src = meta.src[i]
        .replace("w=1200&q=85", "w=80&q=60")
        .replace("w=800&q=85", "w=80&q=60")
        .replace("w=600&q=80", "w=80&q=60");
      tImg.alt = "";
      tImg.setAttribute("aria-hidden", "true");
      thumb.appendChild(tImg);
      thumb.addEventListener("click", () => goToLB(i, meta));
      thumbRow.appendChild(thumb);
    }
    wrap.appendChild(thumbRow);
  }

  document.body.appendChild(wrap);
  document.body.style.position = "fixed";
  document.body.style.top = `-${window.scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
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

  updateProgress();

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
  updateProgress();
  updateThumbs();
}

function updateProgress() {
  if (!lb) return;
  const bar = document.querySelector(".lightbox-progress-bar");
  if (bar) {
    bar.style.width = `${((lb.current + 1) / lb.total) * 100}%`;
  }
}

function updateThumbs() {
  if (!lb) return;
  document.querySelectorAll(".lightbox-thumb").forEach((t) => {
    t.classList.toggle("active", parseInt(t.getAttribute("data-index")) === lb.current);
  });
  const active = document.querySelector(".lightbox-thumb.active");
  if (active) {
    active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }
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
    if (img) {
      img.style.transform = "scale(0.92)";
      img.style.opacity = "0";
    }
    setTimeout(() => {
      wrap.remove();
      lb = null;
    }, 250);
  } else {
    lb = null;
  }
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.overflow = "";
}

function initTouchLB(imgWrap, img, meta) {
  let startX = 0, startY = 0;
  let dx = 0, dy = 0;
  let isDragging = false;
  const threshold = 60;

  imgWrap.addEventListener("touchstart", (e) => {
    if (!lb) return;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    dx = 0;
    dy = 0;
    isDragging = true;
    img.style.transition = "none";
  }, { passive: true });

  imgWrap.addEventListener("touchmove", (e) => {
    if (!isDragging || !lb) return;
    const t = e.touches[0];
    dx = t.clientX - startX;
    dy = t.clientY - startY;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy && absDx > 10) {
      img.style.transform = `translateX(${dx * 0.4}px) scale(0.95)`;
      img.style.opacity = `${1 - Math.min(absDx / 600, 0.5)}`;
    } else if (absDy > absDx && absDy > 10) {
      const scale = Math.max(0.7, 1 - absDy / 800);
      img.style.transform = `translateY(${dy * 0.5}px) scale(${scale})`;
      img.style.opacity = `${1 - Math.min(absDy / 500, 0.8)}`;
    }
  }, { passive: true });

  imgWrap.addEventListener("touchend", (e) => {
    if (!isDragging || !lb) return;
    isDragging = false;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    img.style.transition = "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)";

    if (absDy > threshold && dy > 0) {
      closeLB();
      return;
    }

    if (absDx > threshold) {
      if (dx > 0) navigateLB(-1, meta);
      else navigateLB(1, meta);
    } else {
      img.style.transform = "scale(1)";
      img.style.opacity = "1";
    }
  }, { passive: true });
}

function ce(tag, attrs = {}) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "className") el.className = v;
    else el.setAttribute(k, v);
  });
  return el;
}
