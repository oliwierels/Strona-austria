// ─────────────────────────────────────────────────────────────
// FORMSUBMIT: Anfragen laufen an das Postfach kontakt@33bots.at
// AJAX-Endpoint von FormSubmit; die Antworten gehen an das Postfach oben.
// ─────────────────────────────────────────────────────────────
const FORMSPREE_ENDPOINT = 'https://formsubmit.co/ajax/kontakt@33bots.at';

// ── SCROLL TO TOP ON LOAD ─────────────────────────────────────
window.addEventListener('pageshow', () => window.scrollTo(0, 0));

// ── CURSOR GLOW ───────────────────────────────────────────────
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow && !window.matchMedia('(pointer: coarse)').matches) {
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top  = e.clientY + 'px';
    cursorGlow.classList.add('visible');
  }, { passive: true });
  document.addEventListener('mouseleave', () => cursorGlow.classList.remove('visible'));
}

// ── SCROLL PROGRESS ──────────────────────────────────────────
const progressBar = document.getElementById('scrollProgress');

// ── NAV SCROLL ───────────────────────────────────────────────
const nav = document.getElementById('nav');

// ── HAMBURGER ────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Menu');
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
}));

// ── STAT COUNTERS ─────────────────────────────────────────────
const easeOutQuad = t => 1 - (1 - t) * (1 - t);
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix ?? '';
  const duration = 900;
  const start = performance.now();
  const tick = now => {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(easeOutQuad(t) * target) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (!e.isIntersecting) return; animateCounter(e.target); counterObs.unobserve(e.target); });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

// ── FADE UP ───────────────────────────────────────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.children].filter(el => el.classList.contains('fade-up'));
    setTimeout(() => entry.target.classList.add('in'), siblings.indexOf(entry.target) * 70);
    io.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.tile, .use-item, .process-step, .stat-item, .testimonial, .faq-item, .video-teaser__content, .price-card, .pricing-promo')
  .forEach(el => { el.classList.add('fade-up'); io.observe(el); });

// ── FAQ ───────────────────────────────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  const panel = item.querySelector('.faq-a');
  panel.removeAttribute('hidden');
  const naturalH = panel.scrollHeight + 'px';
  panel.style.maxHeight = '0px';
  btn.addEventListener('click', () => {
    const opening = !item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => {
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

// ── COMBINED SCROLL HANDLER (RAF-throttled) ───────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
const scrollTotal = () => document.documentElement.scrollHeight - window.innerHeight;
let rafPending = false;

function handleScroll() {
  const y = window.scrollY;
  const total = scrollTotal();

  progressBar.style.width = total > 0 ? `${(y / total) * 100}%` : '0%';
  nav.classList.toggle('scrolled', y > 16);

  let current = '';
  sections.forEach(s => { if (y >= s.offsetTop - 100) current = s.id; });
  navLinks.forEach(a => { a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--text)' : ''; });

  rafPending = false;
}

window.addEventListener('scroll', () => {
  if (!rafPending) { rafPending = true; requestAnimationFrame(handleScroll); }
}, { passive: true });

handleScroll();

// ── ROBOT PARALLAX + GLITCH ───────────────────────────────────
const robotWrap = document.getElementById('robotWrap');
const heroSection = document.querySelector('.hero');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (robotWrap && heroSection && !reducedMotion) {
  heroSection.addEventListener('mousemove', (e) => {
    const r = heroSection.getBoundingClientRect();
    const dx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
    const dy = ((e.clientY - r.top)  / r.height - 0.5) * 2;
    robotWrap.style.transform = `perspective(900px) rotateY(${dx * 7}deg) rotateX(${-dy * 4}deg)`;
  }, { passive: true });
  heroSection.addEventListener('mouseleave', () => {
    robotWrap.style.transform = '';
  });

  // periodic glitch
  function triggerGlitch() {
    robotWrap.classList.add('is-glitching');
    setTimeout(() => robotWrap.classList.remove('is-glitching'), 380);
    setTimeout(triggerGlitch, 5000 + Math.random() * 7000);
  }
  setTimeout(triggerGlitch, 2500);
}

// ── COOKIE BANNER ─────────────────────────────────────────────
const cookieBanner = document.getElementById('cookieBanner');
if (!localStorage.getItem('33bots-cookies')) {
  setTimeout(() => cookieBanner.classList.add('visible'), 1200);
}
document.getElementById('cookieAccept').addEventListener('click', () => {
  localStorage.setItem('33bots-cookies', '1');
  cookieBanner.classList.remove('visible');
});

// ═════════════════════════════════════════════════════════════
// CONTACT FORM — multi-step + Formspree
// ═════════════════════════════════════════════════════════════
const form     = document.getElementById('contactForm');
const step1    = document.getElementById('formStep1');
const step2    = document.getElementById('formStep2');
const ind1     = document.getElementById('stepInd1');
const ind2     = document.getElementById('stepInd2');
const btnNext  = document.getElementById('btnNext');
const btnBack  = document.getElementById('btnBack');

// ── Validation helpers ────────────────────────────────────────
const errorMsg = { valueMissing: 'Dieses Feld ist erforderlich', typeMismatch: 'Ungültiges Format' };

function validateField(field) {
  const wrap = field.closest('.form-field');
  if (!wrap) return true;
  const errEl = wrap.querySelector('.form-field__err');
  if (!field.validity.valid) {
    if (errEl) errEl.textContent = field.validity.valueMissing ? errorMsg.valueMissing : field.validity.typeMismatch ? errorMsg.typeMismatch : 'Bitte dieses Feld prüfen';
    wrap.classList.add('has-error');
    return false;
  }
  wrap.classList.remove('has-error');
  if (errEl) errEl.textContent = '';
  return true;
}

function validateStep(stepEl) {
  return [...stepEl.querySelectorAll('input[required], textarea[required]')]
    .map(validateField).every(Boolean);
}

// live clearing on input
form.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.closest('.form-field')?.classList.contains('has-error')) validateField(field);
  });
});

// ── Slide between steps ───────────────────────────────────────
function goToStep(from, to, fromInd, toInd) {
  from.style.opacity = '0';
  setTimeout(() => {
    from.classList.add('form-step--hidden');
    from.setAttribute('aria-hidden', 'true');
    to.classList.remove('form-step--hidden');
    to.removeAttribute('aria-hidden');
    requestAnimationFrame(() => { to.style.opacity = '1'; });
    fromInd.classList.remove('active');
    toInd.classList.add('active');
    // scroll form into view smoothly
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 200);
}

btnNext.addEventListener('click', () => {
  if (!validateStep(step1)) return;
  goToStep(step1, step2, ind1, ind2);
});

btnBack.addEventListener('click', () => {
  goToStep(step2, step1, ind2, ind1);
});

// ── Character counter ─────────────────────────────────────────
const textarea  = document.getElementById('f-message');
const charCount = document.getElementById('charCount');
const MAX_CHARS = 600;
textarea.addEventListener('input', () => {
  const len = textarea.value.length;
  charCount.textContent = len;
  charCount.closest('.char-counter').classList.toggle('near-limit', len > MAX_CHARS * 0.85);
});

// ── Submit → FormSubmit ───────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateStep(step2)) return;

  const btn = step2.querySelector('button[type="submit"]');
  btn.textContent = 'Wird gesendet…';
  btn.disabled = true;

  const data = new FormData(form);
  const payload = {
    name:     data.get('name'),
    company:  data.get('company') || '—',
    email:    data.get('email'),
    phone:    data.get('phone') || '—',
    date:     data.get('date') || '—',
    location: data.get('location') || '—',
    message:  data.get('message'),
  };

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      if (typeof gtag === 'function') {
        gtag('event', 'form_submit', {
          event_category: 'contact',
          event_label: 'Formularz kontaktowy',
        });
      }
      form.innerHTML = `<div class="form-success">
        <h3>Nachricht gesendet</h3>
        <p>Wir melden uns an <strong>${payload.email}</strong><br>innerhalb von 24 Werkstunden.</p>
      </div>`;
    } else {
      throw new Error('server');
    }
  } catch {
    btn.textContent = 'Spróbuj ponownie';
    btn.disabled = false;
    const errEl = step2.querySelector('.form-field__err');
    if (errEl) { errEl.textContent = 'Etwas ist schiefgelaufen. Schreiben Sie uns direkt an kontakt@33bots.at'; }
  }
});
