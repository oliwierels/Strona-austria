// pasek mobilny, baner cookie (logika bez zmian) i akordeon FAQ.
(() => {
  const nav = document.getElementById('nav');
  const przycisk = document.getElementById('navPrzycisk');
  const panel = document.getElementById('navPanel');
  if (nav && przycisk && panel) {
    const tloNav = () => nav.classList.toggle('nav--tlo', scrollY > 8 || !panel.hidden);
    const menu = (otworz) => {
      panel.hidden = !otworz;
      przycisk.setAttribute('aria-expanded', String(otworz));
      przycisk.textContent = otworz ? 'Schließen' : 'Menü';
      tloNav();
    };
    przycisk.addEventListener('click', () => menu(panel.hidden));
    panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { menu(false); przycisk.focus(); } });
    addEventListener('resize', () => { if (innerWidth >= 1024 && !panel.hidden) menu(false); });
    addEventListener('scroll', tloNav, { passive: true });
    tloNav();
  }

  const pasek = document.getElementById('pasekMobilny');
  const glowa = document.querySelector('.art__glowa');
  if (pasek && glowa && 'IntersectionObserver' in window) {
    new IntersectionObserver(([w]) => pasek.classList.toggle('pasek--widoczny', !w.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px' }).observe(glowa);
  }

  // Akordeon FAQ.
  document.querySelectorAll('.faq__q').forEach((q) => q.addEventListener('click', () => {
    const otwarte = q.getAttribute('aria-expanded') === 'true';
    q.setAttribute('aria-expanded', String(!otwarte));
    document.getElementById(q.getAttribute('aria-controls')).hidden = otwarte;
  }));

  const ciasteczka = document.getElementById('cookies');
  if (ciasteczka) {
    const pokazBaner = () => { if (!localStorage.getItem('33bots-cookies')) ciasteczka.classList.add('show'); };
    const skryptCmp = (n) => n.nodeName === 'SCRIPT' && /^https:\/\/([^/]+\.)?consentboard\.[a-z]+\//i.test(n.src);
    const cmpJest = () => Array.from(document.scripts).some(skryptCmp);
    const cmpZastepuje = () => { localStorage.setItem('33bots-cmp', '1'); ciasteczka.remove(); };
    if (cmpJest()) cmpZastepuje();
    else {
      new MutationObserver((zmiany, obs) => {
        if (zmiany.some((z) => Array.from(z.addedNodes).some(skryptCmp))) { obs.disconnect(); cmpZastepuje(); }
      }).observe(document.documentElement, { childList: true, subtree: true });
      if (localStorage.getItem('33bots-cmp')) {
        setTimeout(() => { if (!cmpJest()) { localStorage.removeItem('33bots-cmp'); pokazBaner(); } }, 8000);
      } else {
        setTimeout(pokazBaner, 1400);
      }
    }
    document.getElementById('cookiesOk').addEventListener('click', () => {
      localStorage.setItem('33bots-cookies', '1');
      ciasteczka.classList.remove('show');
    });
  }
})();
