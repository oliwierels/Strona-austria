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

## ⚠️ 33bots.de — nie udało się zweryfikować

Nie znalazłem repozytorium ze źródłem tej strony w Twoim koncie GitHub. Sprawdziłem wszystkie dostępne repozytoria (`oliwierels/*`) i jedyne kojarzące się z Niemcami to:

- `oliwierels/website-germany` i `oliwierels/strona-niemcy-dobre-rpeo` — obie zawierają stronę **robotollern.de**, innej marki. Sprawdziłem kod: inny e-mail kontaktowy (`info@robotollern.de` vs `kontakt@33bots.at/.pl`), inny numer telefonu, zero wzmianek o „33bots" w treści, meta danych czy Impressum. To wygląda na osobny, niepowiązany biznes (albo inną markę tego samego właściciela, ale bez żadnego technicznego powiązania w kodzie).

Środowisko, w którym pracuję, ma **zablokowany dostęp do internetu poza GitHub** — nie mogę więc po prostu wejść na żywo na 33bots.de i zrobić audytu z tego, co widać publicznie.

**Żeby zrobić audyt, potrzebuję jednego z:**
1. Nazwy/linku repozytorium GitHub ze źródłem 33bots.de (jeśli istnieje pod innym kontem/organizacją — dodam je do sesji),
2. potwierdzenia, że robotollern.de **to jest** Twoja niemiecka strona 33bots (to nietypowe rozwiązanie, ale zrobię audyt tego kodu, jeśli tak),
3. albo dostępu do internetu w tej sesji, żebym mógł zrobić audyt zewnętrzny (meta tagi, nagłówki, szybkość) bez kodu źródłowego.

## ⚠️ 33bots.lt — brak treści do audytu

Repozytorium `oliwierels/litwa-strona` istnieje, ale zawiera wyłącznie plik `README.md` z jednym wierszem tekstu — **strona nie ma jeszcze kodu**. Nie ma czego audytować.

Jeśli strona już działa na żywo pod adresem 33bots.lt (hostowana skądinąd, np. builder typu Wix/Webflow, albo kod w innym repo), daj znać gdzie szukać źródła, albo odblokuj tej sesji dostęp do internetu, żebym zrobił audyt zewnętrzny.
