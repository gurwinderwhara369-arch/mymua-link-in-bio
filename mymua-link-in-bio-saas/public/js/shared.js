(function() {
  'use strict';

  // ===== SCROLL REVEAL =====
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          var d = parseInt(e.target.dataset.delay || '0', 10);
          setTimeout(function() { e.target.classList.add('visible'); }, d);
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function(el) { observer.observe(el); });
  } else {
    reveals.forEach(function(el) { el.classList.add('visible'); });
  }

  // ===== GALLERY LIGHTBOX =====
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbClose = document.getElementById('lb-close');
  var lbPrev = document.getElementById('lb-prev');
  var lbNext = document.getElementById('lb-next');
  var items = [];
  var currentIdx = 0;

  var galleryItems = document.querySelectorAll('[data-full]');
  if (lb && lbImg && galleryItems.length) {
    galleryItems.forEach(function(item, idx) {
      items.push({
        src: item.getAttribute('data-full'),
        alt: (item.querySelector('img') && item.querySelector('img').getAttribute('alt')) || 'Gallery image'
      });
      item.addEventListener('click', function() { openLightbox(idx); });
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
    });

    function openLightbox(i) {
      currentIdx = i;
      showImage();
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + window.scrollY + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
    }

    function closeLightbox() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      var top = parseInt(document.body.style.top);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      if (top) window.scrollTo(0, -top);
    }

    function showImage() {
      if (items[currentIdx]) {
        lbImg.src = items[currentIdx].src;
        lbImg.alt = items[currentIdx].alt;
      }
    }

    function prevImage() {
      currentIdx = (currentIdx - 1 + items.length) % items.length;
      showImage();
    }

    function nextImage() {
      currentIdx = (currentIdx + 1) % items.length;
      showImage();
    }

    lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', function(e) { if (e.target === lb) closeLightbox(); });
    if (lbPrev) lbPrev.addEventListener('click', prevImage);
    if (lbNext) lbNext.addEventListener('click', nextImage);

    // Keyboard
    document.addEventListener('keydown', function(e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && lbPrev) { prevImage(); e.preventDefault(); }
      if (e.key === 'ArrowRight' && lbNext) { nextImage(); e.preventDefault(); }
    });

    // Touch swipe
    var touchStartX = 0;
    lb.addEventListener('touchstart', function(e) {
      if (e.target === lb || e.target === lbImg.parentElement) touchStartX = e.touches[0].clientX;
    }, { passive: true });
    lb.addEventListener('touchend', function(e) {
      if (!touchStartX) return;
      var diff = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? (lbPrev && prevImage()) : (lbNext && nextImage());
      }
      touchStartX = 0;
    }, { passive: true });
  }

  // ===== CALENDAR =====
  var calGrid = document.getElementById('cal-grid');
  var calLabel = document.getElementById('cal-month-label');
  if (calGrid && calLabel) {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    calLabel.textContent = monthNames[month] + ' ' + year;
    var dowNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = now.getDate();
    dowNames.forEach(function(d) {
      var c = document.createElement('div'); c.className = 'dow'; c.textContent = d; calGrid.appendChild(c);
    });
    for (var i = 0; i < firstDay; i++) {
      var empty = document.createElement('div'); empty.className = 'day-cell empty'; calGrid.appendChild(empty);
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var cell = document.createElement('div'); cell.className = 'day-cell'; cell.textContent = d;
      if (d < today) { cell.classList.add('past'); }
      else { cell.classList.add('avail'); }
      calGrid.appendChild(cell);
    }
  }

  // ===== HEADER SCROLL =====
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function() {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ===== TOUCH PASSIVE =====
  document.querySelectorAll('.btn, .g-item, .gallery-item, .g-frame, .link-item, .service-card').forEach(function(el) {
    el.addEventListener('touchstart', function(){}, { passive: true });
  });
})();
