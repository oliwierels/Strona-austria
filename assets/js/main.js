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

  // Contact form: native POST to FormSubmit (kontakt@33bots.at). Show sending state.
  var form = document.querySelector('form[data-contact]');
  if (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Wird gesendet …'; }
      // The browser submits the form to FormSubmit, which e-mails the request
      // to kontakt@33bots.at and redirects to danke.html.
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
