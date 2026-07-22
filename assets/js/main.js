/* 33bots.at — interactions */
(function () {
  'use strict';

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      var expanded = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', String(expanded));
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }

  // Contact form: AJAX POST to FormSubmit (kontakt@33bots.at) with visible
  // success/error feedback. The form's action attribute stays as a no-JS fallback.
  var form = document.querySelector('form[data-contact]');
  if (form) {
    form.addEventListener('submit', function (e) {
      if (!window.fetch || !window.FormData) return; // native fallback
      e.preventDefault();

      var btn = form.querySelector('button[type="submit"]');
      var status = form.querySelector('.form-status');
      var setStatus = function (msg, ok) {
        if (!status) return;
        status.hidden = false;
        status.textContent = msg;
        status.classList.toggle('form-status--error', !ok);
      };
      var reset = function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Anfrage senden'; }
      };

      if (btn) { btn.disabled = true; btn.textContent = 'Wird gesendet …'; }
      if (status) status.hidden = true;

      fetch('https://formsubmit.co/ajax/kontakt@33bots.at', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && (data.success === 'true' || data.success === true)) {
            window.location.href = 'danke.html';
          } else {
            reset();
            setStatus((data && data.message) || 'Ihre Anfrage konnte nicht gesendet werden. Bitte schreiben Sie uns direkt an kontakt@33bots.at.', false);
          }
        })
        .catch(function () {
          reset();
          setStatus('Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt an kontakt@33bots.at.', false);
        });
    });
  }

  // Gallery lightbox
  var photos = document.querySelectorAll('.photo-card img');
  if (photos.length) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Bildansicht');
    box.innerHTML = '<button class="lightbox-close" aria-label="Schließen">✕</button><img alt="">';
    document.body.appendChild(box);
    var boxImg = box.querySelector('img');
    photos.forEach(function (img) {
      img.closest('.photo-card').addEventListener('click', function () {
        boxImg.src = img.src;
        boxImg.alt = img.alt;
        box.classList.add('open');
      });
    });
    box.addEventListener('click', function () { box.classList.remove('open'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') box.classList.remove('open');
    });
  }

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      obs.observe(el);
    });
  }
})();
