
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 5500 → „5 500” (twarda spacja; pl-PL w toLocaleString nie grupuje czterech cyfr)
  const kwota = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const rzadko = (f) => { let czeka = false; return () => { if (czeka) return; czeka = true; requestAnimationFrame(() => { czeka = false; f(); }); }; };

  /* ——— „Zatrzymaj ruch”: jeden stan dla robota 3D i animacji w kartach (WCAG 2.2.2) ——— */
  const przelaczniki = [...document.querySelectorAll('[data-ruch-przelacz]')];
  if (!reduce) przelaczniki.forEach((b) => {
    b.hidden = false;
    b.addEventListener('click', () => {
      const stop = !document.documentElement.classList.contains('ruch-stop');
      document.documentElement.classList.toggle('ruch-stop', stop);
      przelaczniki.forEach((x) => { x.setAttribute('aria-pressed', String(stop)); x.textContent = stop ? "Bewegung fortsetzen" : "Bewegung anhalten"; });
    });
  });


  const robot = document.getElementById('robot');
  if (robot) {
    const CZESCI = [['glowa', 0.17], ['twarz', 0.33], ['piers', 0.5], ['rece', 0.67], ['nogi', 0.83], ['stopy', 1.01]];
    const czesc = () => {
      const r = robot.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      const nowa = CZESCI.find(([, do_]) => p < do_)[0];
      if (robot.dataset.czesc !== nowa) robot.dataset.czesc = nowa;
    };
    addEventListener('scroll', rzadko(czesc), { passive: true });
    czesc();
  }




  const sekcja = document.getElementById('wystep');
  if (sekcja) {
    const kroki = [...sekcja.querySelectorAll('.wiersz[data-poza]')];
    const scena = sekcja.querySelector('.wystep__scena');
    const nr = document.getElementById('wystepNr'), nazwa = document.getElementById('wystepNazwa');
    const jezyk = document.getElementById('wystepJezyk'), czas = document.getElementById('wystepCzas');
    const kropka = sekcja.querySelector('.wystep__kropka');
    let aktywny = -1;
    const aktualizuj = () => {
      const sr = scena.getBoundingClientRect();
      const linia = innerWidth < 1024 ? sr.bottom + (innerHeight - sr.bottom) * 0.3 : innerHeight * 0.5;
      let naj = 0, odl = Infinity;
      kroki.forEach((k, i) => {
        const r = k.getBoundingClientRect();
        const d = r.top <= linia && r.bottom >= linia ? 0 : Math.min(Math.abs(r.top - linia), Math.abs(r.bottom - linia));
        if (d < odl) { odl = d; naj = i; }
      });
      if (naj === aktywny) return;
      aktywny = naj;
      kroki.forEach((k, i) => k.classList.toggle('wiersz--aktywny', i === naj));
      sekcja.dataset.poza = kroki[naj].dataset.poza;
      nr.textContent = String(naj + 1).padStart(2, '0');
      nazwa.textContent = kroki[naj].querySelector('.h3').textContent;
    };
    addEventListener('scroll', rzadko(aktualizuj), { passive: true });
    addEventListener('resize', rzadko(aktualizuj));
    aktualizuj();

    const POWITANIA = ["Grüß Gott", "Hello", "Dzień dobry", "Laba diena", "Dobrý den", "Bună ziua", "Bonjour", "Hola", "Ciao", "こんにちは"];
    let widac = false, i = 0, sek = 0, zegar = 0;
    const tik = () => {
      if (!widac) return;
      const poza = sekcja.dataset.poza;
      if (poza === 'mowi') { i = (i + 1) % POWITANIA.length; jezyk.textContent = POWITANIA[i]; }
      if (poza === 'zdjecie') {
        sek += 0.5;
        const s = Math.floor(sek);
        czas.textContent = ['00', String(Math.floor(s / 60)).padStart(2, '0'), String(s % 60).padStart(2, '0')].join(':');
        kropka.classList.toggle('zgasla', sek % 1 !== 0);
      } else sek = 0;
    };
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(([w]) => {
        widac = w.isIntersecting;
        clearInterval(zegar);
        if (widac) zegar = setInterval(tik, 500);
      }).observe(sekcja);
    }
  }


  const kalk = document.getElementById('kalkulator');
  if (kalk) {
    const DZIEN = 2300, RABAT = 0.85;
    const RABAT_2 = 0.85, WEJSCIE = DZIEN / 2, CZTERY = DZIEN * 6 / 8;
    const rabat = (d) => (d >= 3 ? RABAT : RABAT_2);
    const el = (id) => document.getElementById(id);
    const pole = { dni: el('kalkDni'), ile: el('kalkIle'), etykieta: el('kalkEtykieta'), od: el('kalkOd'), kwota: el('kalkKwota'), zl: el('kalkZl'), opis: el('kalkOpis') };
    const minus = kalk.querySelector('[data-dni="-1"]'), plus = kalk.querySelector('[data-dni="1"]');
    let dni = 2, pokazana = DZIEN, ruszony = false, anim = 0;

    const pokazKwote = (cel) => {
      cancelAnimationFrame(anim);
      if (reduce) { pole.kwota.textContent = kwota(cel); pokazana = cel; return; }
      const z = pokazana, t0 = performance.now();
      const krok = (t) => {
        const p = Math.min(1, (t - t0) / 420), e = 1 - Math.pow(1 - p, 3);
        pokazana = z + (cel - z) * e;
        pole.kwota.textContent = kwota(Math.round(pokazana / 5) * 5);
        if (p < 1) anim = requestAnimationFrame(krok); else { pokazana = cel; pole.kwota.textContent = kwota(cel); }
      };
      anim = requestAnimationFrame(krok);
    };
    const wybor = () => (kalk.querySelector('input[name=kalk_format]:checked') || {}).value || 'dzien';
    const licz = () => {
      const f = wybor();
      pole.dni.hidden = f !== 'dni';
      if (f === 'wejscie') {
        pole.etykieta.textContent = "Einige Stunden · netto";
        pole.od.textContent = "unter";
        pokazKwote(DZIEN);
        pole.opis.textContent = "Nach einem kurzen Gespräch über Ihr Programm nennen wir den Betrag. Er liegt immer unter dem Tagespreis.";
      } else if (f === 'dni') {
        const suma = dni * DZIEN * rabat(dni);
        pole.ile.textContent = String(dni);
        minus.disabled = dni <= 2; plus.disabled = dni >= 7;
        pole.etykieta.textContent = `${dni} Tage · netto`;
        pole.od.textContent = "ab";
        pokazKwote(suma);
        pole.opis.textContent = `${dni} Tage zu je ${kwota(DZIEN * RABAT)} € statt ${kwota(DZIEN)} €. Sie sparen ${kwota(dni * DZIEN * (1 - RABAT))} €.`;
      } else {
        pole.etykieta.textContent = "Ganzer Tag · netto";
        pole.od.textContent = "ab";
        pokazKwote(DZIEN);
        pole.opis.textContent = "Den endgültigen Preis kalkulieren wir nach Dauer, Ort und Programm.";
      }
    };
    kalk.addEventListener('change', () => { ruszony = true; licz(); });
    kalk.querySelectorAll('[data-dni]').forEach((b) => b.addEventListener('click', () => {
      ruszony = true;
      dni = Math.max(2, Math.min(7, dni + +b.dataset.dni));
      licz();
    }));
    licz();

    // Przycisk pod kalkulatorem: wybrany format trafia do opisu wydarzenia w formularzu,
    const cta = document.querySelector('#formaty [data-cta="formaty"]');
    const opis = document.getElementById('pole-message'), licznik = document.getElementById('licznik');
    if (cta && opis) cta.addEventListener('click', () => {
      if (!ruszony || opis.value.trim()) return;
      const f = wybor();
      const zl = (n) => kwota(n).replace(/\u00a0/g, ' ');
      opis.value = f === 'wejscie' ? 'Ich interessiere mich für einen Auftritt von einigen Stunden.'
        : f === 'dni' ? `Ich interessiere mich für ${dni} Tage (ab ${zl(dni * DZIEN * RABAT)} € netto).`
          : `Ich interessiere mich für einen ganzen Tag (ab ${zl(DZIEN)} € netto).`;
      if (licznik) licznik.textContent = opis.value.length;
    });
  }
})();
