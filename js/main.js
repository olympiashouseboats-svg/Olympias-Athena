/* ============================================================
   OLYMPIAS HOUSE BOATS — main.js
   Dal Lake, Srinagar, Kashmir
   ============================================================ */

'use strict';

/* ===== NAVBAR SCROLL ===== */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const isHero = navbar.dataset.hero === 'true';

  function updateNav() {
    if (isHero && window.scrollY < 80) {
      navbar.classList.add('transparent');
      navbar.classList.remove('scrolled');
    } else {
      navbar.classList.remove('transparent');
      navbar.classList.add('scrolled');
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();


/* ===== MOBILE MENU ===== */
(function initMobile() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    }
  });
})();


/* ===== SCROLL REVEAL ===== */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();


/* ===== FAQ ACCORDION ===== */
(function initFaq() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();


/* ===== TESTIMONIAL SLIDER ===== */
(function initTestiSlider() {
  const track = document.getElementById('testiTrack');
  if (!track) return;

  let index = 0;

  function getVisible() {
    if (window.innerWidth > 1024) return 3;
    if (window.innerWidth > 640) return 2;
    return 1;
  }

  function update() {
    const card = track.querySelector('.testi-card');
    if (!card) return;
    const cardW = card.offsetWidth + 24;
    track.style.transform = `translateX(-${index * cardW}px)`;
  }

  window.testiNext = function () {
    const max = track.children.length - getVisible();
    index = Math.min(index + 1, max);
    update();
  };
  window.testiPrev = function () {
    index = Math.max(index - 1, 0);
    update();
  };

  window.addEventListener('resize', update, { passive: true });
})();


/* ===== GALLERY LIGHTBOX ===== */
(function initLightbox() {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbClose = document.getElementById('lb-close');
  if (!lb) return;

  document.querySelectorAll('.gal-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.full || item.querySelector('img').src;
      lbImg.src = src;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  if (lbClose) lbClose.addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();


/* ===== BOOKING POPUP ===== */
(function initPopup() {
  const popup = document.getElementById('booking-popup');
  if (!popup) return;

  window.openPopup = function () { popup.classList.add('open'); };
  window.closePopup = function () { popup.classList.remove('open'); };

  popup.addEventListener('click', e => { if (e.target === popup) window.closePopup(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') window.closePopup(); });

  // Auto show after 10s on index only
  if (document.body.dataset.page === 'home') {
    setTimeout(() => window.openPopup(), 10000);
  }
})();


/* ===== SMOOTH ANCHOR SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ===== ACTIVE NAV LINK ===== */
(function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href !== '#' && path.includes(href.replace('.html',''))) {
      a.classList.add('active');
    }
    if ((path === 'index.html' || path === '') && (href === 'index.html' || href === '/')) {
      a.classList.add('active');
    }
  });
})();


/* ===== FORM HANDLING ===== */
(function initForms() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    const btn = form.querySelector('.form-submit');
    if (btn) {
      btn.textContent = 'Sending…';
      btn.style.opacity = '0.75';
    }
  });
})();
