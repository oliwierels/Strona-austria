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

  // Contact form (demo — no backend). Falls back to mailto.
  var form = document.querySelector('form[data-contact]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var subject = encodeURIComponent('Anfrage Roboter-Miete — ' + (data.get('event') || 'Event'));
      var body = encodeURIComponent(
        'Name: ' + (data.get('name') || '') + '\n' +
        'E-Mail: ' + (data.get('email') || '') + '\n' +
        'Telefon: ' + (data.get('phone') || '') + '\n' +
        'Stadt: ' + (data.get('city') || '') + '\n' +
        'Event-Typ: ' + (data.get('event') || '') + '\n' +
        'Datum: ' + (data.get('date') || '') + '\n\n' +
        'Nachricht:\n' + (data.get('message') || '')
      );
      window.location.href = 'mailto:hallo@33bots.at?subject=' + subject + '&body=' + body;
      var note = form.querySelector('.form-note');
      if (note) note.textContent = 'Ihr E-Mail-Programm wird geöffnet. Wir melden uns innerhalb von 24 Stunden.';
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
