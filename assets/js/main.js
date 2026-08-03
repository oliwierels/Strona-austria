/* ─────────────────────────────────────────────────────────────
   33bots.at — interactions
   Every block is guarded so the same bundle can run on the
   homepage and on the leaner sub-pages without throwing.
   ───────────────────────────────────────────────────────────── */

const FORM_ENDPOINT = 'https://formsubmit.co/ajax/kontakt@33bots.at';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── CURSOR GLOW ───────────────────────────────────────────────
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow && !window.matchMedia('(pointer: coarse)').matches) {
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
    cursorGlow.classList.add('visible');
  }, { passive: true });
  document.addEventListener('mouseleave', () => cursorGlow.classList.remove('visible'));
}

// ── HAMBURGER / MOBILE MENU ───────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  });
  mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }));
}

// ── STAT COUNTERS ─────────────────────────────────────────────
const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix ?? '';
  if (Number.isNaN(target)) return;
  const duration = 900;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(easeOutQuad(t) * target) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
if ('IntersectionObserver' in window) {
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      animateCounter(e.target);
      counterObs.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach((el) => counterObs.observe(el));
}

// ── FADE UP ───────────────────────────────────────────────────
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.children].filter((el) => el.classList.contains('fade-up'));
      setTimeout(() => entry.target.classList.add('in'), siblings.indexOf(entry.target) * 70);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.tile, .use-item, .process-step, .stat-item, .testimonial, .faq-item, .video-teaser__content, .price-card, .pricing-promo, .card, .usecase, .photo-card, .video-card, [data-reveal]')
    .forEach((el) => { el.classList.add('fade-up'); io.observe(el); });
}

// ── FAQ ACCORDION ─────────────────────────────────────────────
document.querySelectorAll('.faq-item').forEach((item) => {
  const btn = item.querySelector('.faq-q');
  const panel = item.querySelector('.faq-a');
  if (!btn || !panel) return;
  panel.removeAttribute('hidden');
  const naturalH = panel.scrollHeight + 'px';
  panel.style.maxHeight = '0px';
  btn.addEventListener('click', () => {
    const opening = !item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach((o) => {
      o.classList.remove('open');
      o.querySelector('.faq-a').style.maxHeight = '0px';
      o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (opening) {
      item.classList.add('open');
      panel.style.maxHeight = naturalH;
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ── SCROLL: PROGRESS BAR + STICKY NAV + ACTIVE LINK ───────────
const progressBar = document.getElementById('scrollProgress');
const nav = document.getElementById('nav');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
const scrollTotal = () => document.documentElement.scrollHeight - window.innerHeight;
let rafPending = false;

function handleScroll() {
  const y = window.scrollY;
  const total = scrollTotal();

  if (progressBar) progressBar.style.width = total > 0 ? `${(y / total) * 100}%` : '0%';
  if (nav) nav.classList.toggle('scrolled', y > 16);

  if (navLinks.length) {
    let current = '';
    sections.forEach((s) => { if (y >= s.offsetTop - 100) current = s.id; });
    navLinks.forEach((a) => { a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--text)' : ''; });
  }

  rafPending = false;
}

window.addEventListener('scroll', () => {
  if (!rafPending) { rafPending = true; requestAnimationFrame(handleScroll); }
}, { passive: true });
handleScroll();

// ── HERO ROBOT: PARALLAX + PERIODIC GLITCH ────────────────────
const robotWrap = document.getElementById('robotWrap');
const heroSection = document.querySelector('.hero');
if (robotWrap && heroSection && !reducedMotion) {
  heroSection.addEventListener('mousemove', (e) => {
    const r = heroSection.getBoundingClientRect();
    const dx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const dy = ((e.clientY - r.top) / r.height - 0.5) * 2;
    robotWrap.style.transform = `perspective(900px) rotateY(${dx * 7}deg) rotateX(${-dy * 4}deg)`;
  }, { passive: true });
  heroSection.addEventListener('mouseleave', () => { robotWrap.style.transform = ''; });

  (function triggerGlitch() {
    setTimeout(() => {
      robotWrap.classList.add('is-glitching');
      setTimeout(() => robotWrap.classList.remove('is-glitching'), 380);
      triggerGlitch();
    }, 5000 + Math.random() * 7000);
  })();
}

// ── VIDEO CARDS ───────────────────────────────────────────────
const videos = document.querySelectorAll('.video-card video');
videos.forEach((video) => {
  const card = video.closest('.video-card');
  video.addEventListener('play', () => {
    if (card) card.classList.add('playing');
    videos.forEach((other) => { if (other !== video) other.pause(); });
  });
  video.addEventListener('pause', () => { if (card) card.classList.remove('playing'); });
  video.addEventListener('ended', () => { if (card) card.classList.remove('playing'); });
});

// ── GALLERY LIGHTBOX ──────────────────────────────────────────
const photos = document.querySelectorAll('.photo-card img');
if (photos.length) {
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Bildansicht');
  box.innerHTML = '<button class="lightbox-close" aria-label="Schließen">✕</button><img alt="">';
  document.body.appendChild(box);
  const boxImg = box.querySelector('img');
  photos.forEach((img) => {
    img.closest('.photo-card').addEventListener('click', () => {
      boxImg.src = img.currentSrc || img.src;
      boxImg.alt = img.alt;
      box.classList.add('open');
    });
  });
  box.addEventListener('click', () => box.classList.remove('open'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') box.classList.remove('open'); });
}

// ── COOKIE BANNER ─────────────────────────────────────────────
const cookieBanner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');
if (cookieBanner && cookieAccept) {
  if (!localStorage.getItem('33bots-at-cookies')) {
    setTimeout(() => cookieBanner.classList.add('visible'), 1200);
  }
  cookieAccept.addEventListener('click', () => {
    localStorage.setItem('33bots-at-cookies', '1');
    cookieBanner.classList.remove('visible');
  });
}

// ═════════════════════════════════════════════════════════════
// CONTACT FORM — optional two-step flow + FormSubmit
// ═════════════════════════════════════════════════════════════
const form = document.getElementById('contactForm');
if (form) {
  const step1 = document.getElementById('formStep1');
  const step2 = document.getElementById('formStep2');
  const ind1 = document.getElementById('stepInd1');
  const ind2 = document.getElementById('stepInd2');
  const btnNext = document.getElementById('btnNext');
  const btnBack = document.getElementById('btnBack');
  const multiStep = Boolean(step1 && step2 && btnNext && btnBack);

  const errorMsg = {
    valueMissing: 'Dieses Feld ist erforderlich',
    typeMismatch: 'Ungültiges Format',
    generic: 'Bitte überprüfen Sie dieses Feld',
  };

  const validateField = (field) => {
    const wrap = field.closest('.form-field');
    if (!wrap) return field.validity.valid;
    const errEl = wrap.querySelector('.form-field__err');
    if (!field.validity.valid) {
      if (errEl) {
        errEl.textContent = field.validity.valueMissing ? errorMsg.valueMissing
          : field.validity.typeMismatch ? errorMsg.typeMismatch
            : errorMsg.generic;
      }
      wrap.classList.add('has-error');
      return false;
    }
    wrap.classList.remove('has-error');
    if (errEl) errEl.textContent = '';
    return true;
  };

  const validateScope = (scope) => [...scope.querySelectorAll('input[required], textarea[required], select[required]')]
    .map(validateField).every(Boolean);

  form.querySelectorAll('input, textarea, select').forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.closest('.form-field')?.classList.contains('has-error')) validateField(field);
    });
  });

  if (multiStep) {
    const goToStep = (from, to, fromInd, toInd) => {
      from.style.opacity = '0';
      setTimeout(() => {
        from.classList.add('form-step--hidden');
        from.setAttribute('aria-hidden', 'true');
        to.classList.remove('form-step--hidden');
        to.removeAttribute('aria-hidden');
        requestAnimationFrame(() => { to.style.opacity = '1'; });
        fromInd?.classList.remove('active');
        toInd?.classList.add('active');
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    };
    btnNext.addEventListener('click', () => {
      if (!validateScope(step1)) return;
      goToStep(step1, step2, ind1, ind2);
    });
    btnBack.addEventListener('click', () => goToStep(step2, step1, ind2, ind1));
  }

  // Character counter
  const textarea = document.getElementById('f-message');
  const charCount = document.getElementById('charCount');
  const MAX_CHARS = 600;
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = len;
      charCount.closest('.char-counter')?.classList.toggle('near-limit', len > MAX_CHARS * 0.85);
    });
  }

  form.addEventListener('submit', async (e) => {
    if (!window.fetch || !window.FormData) return; // native POST fallback
    e.preventDefault();

    const scope = multiStep ? step2 : form;
    if (!validateScope(scope)) return;

    const btn = scope.querySelector('button[type="submit"]') || form.querySelector('button[type="submit"]');
    if (btn) { btn.textContent = 'Wird gesendet …'; btn.disabled = true; }

    const email = String(new FormData(form).get('email') || '');

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !(data.success === 'true' || data.success === true)) throw new Error('server');

      const safeEmail = email.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      form.innerHTML = `<div class="form-success">
        <h3>Anfrage gesendet</h3>
        <p>Wir melden uns an <strong>${safeEmail}</strong><br>innerhalb von 24 Stunden.</p>
      </div>`;
    } catch {
      if (btn) { btn.textContent = 'Erneut versuchen'; btn.disabled = false; }
      const errEl = scope.querySelector('.form-field__err') || form.querySelector('.form-field__err');
      if (errEl) errEl.textContent = 'Da ist etwas schiefgelaufen — schreiben Sie uns direkt an kontakt@33bots.at';
      const status = form.querySelector('.form-status');
      if (status) {
        status.hidden = false;
        status.classList.add('form-status--error');
        status.textContent = 'Ihre Anfrage konnte nicht gesendet werden. Bitte schreiben Sie uns direkt an kontakt@33bots.at.';
      }
    }
  });
}
