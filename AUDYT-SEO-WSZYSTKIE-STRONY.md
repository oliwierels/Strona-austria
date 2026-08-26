# Audyt SEO — wszystkie strony 33bots (33bots.at, 33bots.pl, 33bots.de, 33bots.lt)

Data: 2026-08-26. Poniżej status audytu dla każdej z czterech domen, wraz z linkami do pełnych raportów.

## ✅ 33bots.at — audyt kompletny

Repo źródłowe: `oliwierels/Strona-austria` (ten branch). Pełny raport: [`SEO-AUDIT.md`](./SEO-AUDIT.md), data audytu 2026-07-23.

**Stan:** bardzo dobry technicznie. Prawie wszystkie rekomendacje z audytu już wdrożone:
- ✅ Treść podstron miast rozbudowana (720–830 słów, lokalne FAQ + FAQPage schema)
- ✅ WebP dla zdjęć/posterów, self-hosted fonty
- ✅ LocalBusiness: `priceRange`, logo rastrowe
- ✅ hreflang `x-default` uzupełniony wszędzie
- ✅ Sitemap zaktualizowana
- ⏳ Zostało: numer `telephone` w danych strukturalnych (potrzebny realny numer), weryfikacja w Google Search Console/Bing Webmaster Tools (po stronie właściciela)
- 💡 Rekomendacja na później: sekcja blog/poradnikowa

## ✅ 33bots.pl — audyt kompletny

Repo źródłowe: `oliwierels/33bots` (branch `main`). Pełny raport: `SEO-AUDIT.md` w tym repozytorium, data audytu 2026-07-23.

**Stan:** bardzo dobry technicznie, 194 strony, zero braków krytycznych. Główne wdrożone poprawki:
- ✅ Usunięto ryzykowne dane strukturalne (`lowPrice: 1`, powielony `aggregateRating` na 147 stronach → tylko strona główna)
- ✅ Ograniczono ryzyko doorway pages: unikalne sekcje lokalne na stronach miast, konsolidacja 7 miast śląskich do Katowic (301)
- ✅ Usunięto podwójne śledzenie GA4 (GTM + bezpośredni gtag.js)
- ✅ Skrócono zbyt długie title/description
- ✅ 191 unikalnych obrazków OG zamiast jednego wspólnego
- ⏳ Zostało (opcjonalne): dalsza unikalizacja treści miejskich, `loading="lazy"` sitewide

## ⚠️ 33bots.de — czeka na wskazanie repozytorium

`robotollern.de` **nie jest** 33bots.de (potwierdzone przez właściciela) — to pomyłkowy trop, odrzucony. Środowisko ma zablokowany dostęp do internetu poza GitHub, więc nie mogę zrobić audytu zewnętrznego bez kodu źródłowego.

**Potrzebuję:** dokładnej nazwy repo + brancha (analogicznie do `oliwierels/litwa-strona` @ `claude/lithuanian-33bots-site-4v8qf8` dla .lt), żeby dodać je do sesji i zrobić audyt.

## ✅ 33bots.lt — audyt kompletny

Repo źródłowe: `oliwierels/litwa-strona`, branch `claude/lithuanian-33bots-site-4v8qf8`, commit `b1e75bf`. 71 stron, generowane statycznie z Pythona (`build_all.py`).

### Co działa dobrze

- Sitemap (71 URL) 1:1 zgodna z realnymi plikami, `llms.txt` i `feed.xml` kompletne.
- `robots.txt` poprawny, jawnie dopuszcza boty AI (GPTBot, ClaudeBot, PerplexityBot…).
- Unikalne title/description na wszystkich próbkowanych podstronach (miasta, oferta, blog).
- Realna, zróżnicowana treść lokalna miast (konkretne miejsca, nie tylko podmiana nazwy) — np. Biržai i Vilnius mają realnie inne sekcje „Kur dirbame".
- Cena w JSON-LD (`2100 EUR`) zgodna z cennikiem, brak spamowych wartości typu `1 €`.
- Obrazy z `width`/`height`, `loading="lazy"` poza hero, hero z `fetchpriority="high"` + `preload`.
- Fonty self-hosted, `font-display: swap`.
- JSON-LD kompletny: `ProfessionalService`, `WebSite`, `Service`, `FAQPage`, `BreadcrumbList`, `VideoObject`.

### Problemy i rekomendacje

1. **🔴 WYSOKI — Błędny hreflang na stronie głównej.** `hreflang="pl"` i `hreflang="x-default"` w `index.html` (linie 35–39) wskazują na `33bots.lt` zamiast `33bots.pl` — self-referencing conflict, który może unieważnić cały klaster hreflang strony głównej. **Fix:** poprawić `lt_common.ALTERNATES`/`build_index_redesign.py`, tak by `pl` i `x-default` wskazywały na `33bots.pl`, tak jak reszta witryny.
2. **🔴 WYSOKI — Polski tekst w metadanych strony głównej.** `index.html` linia 26: `og:image:alt` = „Robot humanoidalny Unitree G1 — wynajem na eventy **w Polsce**" — pozostałość po kopiowaniu `templates/pl-index.html`. **Fix:** dodać brakujący klucz do `lt_index_strings.TEXTS`, przebudować.
3. **🟠 ŚREDNI — `AggregateRating`/opinie opisane w README jako wdrożone nie istnieją w realnej witrynie.** Blok jest tylko w nieużywanym `templates/pl-index.html`, nie w żadnym z 71 wdrożonych plików. Stracona szansa na rich snippet z gwiazdkami; do tego rozjazd dokumentacji z kodem. **Fix:** albo dodać do `build_index_redesign.py`/`lt_common.py` (z jasnym oznaczeniem „opinie z realizacji w Polsce"), albo poprawić README.
4. **🟠 ŚREDNI — Dane kontaktowe (NAP) w schema.org są w 100% polskie.** `telephone: "+48531408004"`, `email: "kontakt@33bots.pl"` — brak litewskiego numeru/domeny w danych strukturalnych, co osłabia sygnał lokalności (istotne też pod przyszły Google Business Profile PL vs LT).
5. **🟠 ŚREDNI — Umiarkowana głębokość unikalnej treści miast.** ~65% podobieństwa tekstu między Vilnius/Kaunas/Biržai; realnie unikalne dla miasta jest tylko ok. 15–20% treści strony (mniejsze miasta jeszcze skromniej różnicowane). To nie klasyczne doorway pages, ale przy 28 miastach Google może i tak ocenić klaster jako thin content. **Fix:** dodać po jednym unikalnym elemencie na miasto (lokalne zdjęcie, cytat klienta, konkretny adres/salę).
6. **🟡 NISKI — Formspree endpoint współdzielony z 33bots.pl** (`formspree.io/f/mnjwvray`) — leady LT i PL mieszają się w tym samym formularzu/CRM.
7. **🟡 NISKI — Brak zwrotnego hreflang z 33bots.at** (i z docelowej niemieckiej strony, gdy powstanie/zostanie potwierdzona) — 33bots.pl już linkuje do .lt, reszta jeszcze nie.
8. **🟡 NISKI — Ślady polskiego języka w komentarzach kodu** (np. `index.html` linia 1427) — nie wpływa na SEO, ale sygnalizuje niedokończone tłumaczenie portu; warto posprzątać przy okazji punktu 2.
