# Audyt SEO – 33bots.at

Data audytu: 2026-07-23. Zakres: wszystkie 16 plików HTML, robots.txt, sitemap.xml, assets.

## Ocena ogólna

Strona jest technicznie bardzo dobrze zoptymalizowana — fundamenty SEO (meta tagi, canonical, sitemap, dane strukturalne, dostępność obrazków) są na wysokim poziomie. Główne ryzyka to **cienka i mocno zduplikowana treść na podstronach miast** oraz kilka mniejszych braków w danych strukturalnych i wydajności.

## Co działa dobrze ✅

- **Unikalne title i meta description** na każdej z 16 stron, poprawna długość, słowa kluczowe z przodu ("Roboter mieten in {Miasto} | Unitree G1 …").
- **Canonical** na każdej indeksowanej stronie, spójny z sitemap (https, bez www).
- **robots.txt** poprawny, wskazuje sitemap; **sitemap.xml** kompletna (wszystkie 15 indeksowanych stron, sensowne priority/changefreq).
- **noindex, follow** na `404.html` i `danke.html` — poprawnie wykluczone (i nieobecne w sitemap).
- **Dane strukturalne**: LocalBusiness + WebSite + Service + VideoObject + FAQPage na stronie głównej; Service + BreadcrumbList na podstronach miast.
- **Open Graph + Twitter Cards** na wszystkich stronach, z wymiarami i altem obrazka OG.
- **Obrazki**: 100% ma `alt` (opisowe, po niemiecku, ze słowami kluczowymi), `width`/`height` (brak CLS), `loading="lazy"` poza hero, hero z `fetchpriority="high"` + `preload`.
- **Wideo**: `preload="none"` + poster — 24 MB plików MP4 nie obciąża pierwszego ładowania.
- **Linkowanie wewnętrzne**: index linkuje do wszystkich 12 podstron miast; podstrony linkują się nawzajem.
- **Jedno `<h1>` na stronę**, logiczna hierarchia H2; `lang="de-AT"`, meta geo, theme-color, manifest, favicony.

## Problemy i rekomendacje

### 1. Cienka, zduplikowana treść na podstronach miast — priorytet WYSOKI

Podstrony miast mają ~370–410 słów, a różnice między nimi są niewielkie (np. Wels vs Villach różnią się ~150 słowami — reszta to ten sam szablon). Google może potraktować je jako "doorway pages" i indeksować tylko część z nich.

**Rekomendacja:** rozbudować każdą podstronę do 600–900 słów unikalnej treści: konkretne lokacje eventowe w mieście (jak już jest na stronach Wien/Graz/Linz/Salzburg — pozostałe miasta tego nie mają), lokalne targi/wydarzenia cykliczne, czas dojazdu/logistyka, ew. lokalne FAQ z FAQPage schema.

### 2. Dane strukturalne LocalBusiness — priorytet ŚREDNI

- Brak `telephone` — jedyny kontakt to e-mail. Jeśli numer istnieje, warto dodać (także dla konwersji).
- `logo` wskazuje na `favicon.svg` — Google preferuje rastrowe logo (jest gotowe `icon-512.png`, można też użyć `logo.svg`, ale raster ≥112×112 px jest bezpieczniejszy).
- Brak `priceRange` i `geo`/pełnego adresu (jest tylko "Wien, 1010").

### 3. Niespójny hreflang — priorytet NISKI

Index ma `de-at` + `x-default`, podstrony tylko `de-at` bez `x-default`. Przy jednej wersji językowej hreflang jest w ogóle zbędny — albo ujednolicić (wszędzie para de-at + x-default), albo usunąć całkiem.

### 4. Wydajność / obrazki — priorytet ŚREDNI

- Wszystkie zdjęcia to JPG (100–170 KB każde, format 720×1280). Konwersja do **WebP/AVIF** dałaby ~40–60% oszczędności; warto dodać `<picture>` z fallbackiem lub przynajmniej `srcset` dla mniejszych ekranów.
- Google Fonts ładowane z zewnętrznej domeny (2 rodziny) — self-hosting skróciłby łańcuch żądań krytycznych (preconnect jest, ale to nadal 2 dodatkowe połączenia TLS).
- Postery wideo 116–172 KB — też do kompresji/WebP.

### 5. Drobiazgi

- Plik `roboter-event-dresden.mp4/.jpg` — "Dresden" (Niemcy) w nazwie pliku i URL na stronie austriackiej to mieszany sygnał lokalny; przy okazji warto przemianować (z aktualizacją VideoObject).
- Brak narzędzi analitycznych na stronie — upewnić się, że domena jest zweryfikowana w **Google Search Console** i **Bing Webmaster Tools** (bez tego nie zmierzycie efektów).
- Brak sekcji blog/poradnikowej — treści typu "Was kostet ein Event-Roboter?", "Roboter auf Messen: Ideen" budowałyby topical authority i long-tail.

## Status wdrożenia (2026-07-23)

| Poprawka | Status |
|---|---|
| Rozbudowa treści 11 podstron miast do ~720–830 słów (sekcja „Typische Einsätze" + lokalne FAQ + FAQPage schema) | ✅ wdrożone |
| WebP dla zdjęć galerii (`<picture>` z fallbackiem JPG), posterów wideo i tła CSS (`image-set`) – ok. 40 % mniejsze pliki | ✅ wdrożone |
| Self-hosted fonty (Inter + Space Grotesk, variable woff2, latin/latin-ext) zamiast Google Fonts + `preload` | ✅ wdrożone |
| LocalBusiness: `priceRange`, logo → `icon-512.png` (raster) | ✅ wdrożone |
| hreflang: `x-default` uzupełniony na wszystkich podstronach | ✅ wdrożone |
| Rename `roboter-event-dresden.*` → `roboter-event-auftritt.*` (URL-e; opis wideo pozostał zgodny z prawdą) | ✅ wdrożone |
| Stopka: linki do wszystkich 11 miast (lepsze linkowanie wewnętrzne) | ✅ wdrożone |
| Sitemap: zaktualizowane `lastmod` | ✅ wdrożone |
| `telephone` w LocalBusiness | ⏳ wymaga podania numeru |
| Weryfikacja w Google Search Console / Bing Webmaster Tools | ⏳ po stronie właściciela |
| Sekcja blog/poradnikowa | 💡 rekomendacja na później |
