# Automatyczne wdrożenie 33bots.at

Ten sam mechanizm, co na `33bots.pl`, `33bots.lt` i `33bots.de`. Po skonfigurowaniu każda
zmiana zatwierdzona na gałęzi `claude/session-p10snn` trafia na `33bots.at` w kilkanaście
sekund.

## Dlaczego to powstało

Austria publikowała się przez GitHub Pages, ale domena `33bots.at` **nie wskazuje na
GitHuba** — odpowiada pod nią zwykły hosting (nagłówek `Server: LiteSpeed`). Publikacje
z repozytorium trafiały więc na `oliwierels.github.io`, a pod właściwym adresem leżała
wersja wgrana kiedyś ręcznie. Przebiegi kończyły się na zielono, bo nikt nie sprawdzał,
co domena naprawdę serwuje.

Sprawdzenie z 20.09.2026, po dodaniu kroku kontrolnego:

```
https://33bots.at → HTTP 200
Serwer: LiteSpeed
ROZJAZD: 33bots.at serwuje inną treść strony głównej niż repozytorium.
W repozytorium: 7825520afa69ecd8aca1388b08338d01
Na serwerze:    5b88a61de4d4d3186e16e38ce3a597dd
```

Stąd przejście na ten sam tor, którym idą pozostałe trzy wersje językowe.

## Jak to działa

```
zmiana w repozytorium  →  GitHub sprawdza stronę  →  puka do serwera
                                                          ↓
                                   serwer sam pobiera paczkę z GitHuba po HTTPS
```

Kierunek jest odwrotny niż przy FTP — to serwer sięga po zmiany. Hosting blokuje
połączenia FTP z adresów serwerowni GitHuba, a pobieranie po HTTPS działa bez przeszkód
i hasło nigdzie nie wyjeżdża.

Pliki:

- `.github/workflows/wdrozenie.yml` — sprawdzenie strony, sygnał do serwera i kontrola,
  co domena naprawdę serwuje
- `narzedzia-serwer/deploy.php` — punkt wdrożeniowy, wgrywany na hosting raz
- `.htaccess` — przekierowania i nagłówki bezpieczeństwa; na Pages ich nie było, bo tam
  nie da się ustawiać nagłówków (stąd wcześniejszy zastępczy `<meta>` z `sicherheitskopf.py`)

## Konfiguracja — jednorazowo

### Krok 1. Wpisz token do `deploy.php`

```bash
openssl rand -base64 32 | tr -d '/+=' | cut -c1-40
```

Wstaw wynik w `narzedzia-serwer/deploy.php` w stałej `TOKEN`. **Tej wersji z tokenem nie
zatwierdzaj w repozytorium** — plik z tokenem wgrywasz tylko na serwer.

### Krok 2. Wgraj `deploy.php` na serwer

Do katalogu, w którym leży `index.html` strony 33bots.at (zwykle
`domains/33bots.at/public_html`). Skrypt rozpakowuje stronę **do katalogu, w którym sam
leży**, więc to jego umiejscowienie decyduje, gdzie wyląduje strona.

### Krok 3. Sprawdź gotowość serwera

```
https://33bots.at/deploy.php?token=TWOJ_TOKEN&test=1
```

Zobaczysz wersję PHP, dostępność `ZipArchive` i cURL oraz możliwość zapisu do katalogu.
Bez tokenu skrypt zwraca `Brak dostępu` i nic nie robi.

### Krok 4. Dodaj sekrety na GitHubie

`github.com/oliwierels/strona-austria` → **Settings** → **Secrets and variables** → **Actions**

| Nazwa | Wartość |
|---|---|
| `DEPLOY_URL_AT` | `https://33bots.at/deploy.php` |
| `DEPLOY_TOKEN_AT` | token wpisany w `deploy.php` |

### Krok 5. Uruchom

Zatwierdź dowolną zmianę na gałęzi produkcyjnej — push uruchamia wdrożenie sam. Bez
nowego commita: `Actions` → ostatnie uruchomienie → **Re-run all jobs**.

Przed pierwszym uruchomieniem zrób kopię katalogu strony (Manager plików → zaznacz
wszystko → Kompresuj). Na serwerze leży dziś inna wersja niż w repozytorium i pierwsze
wdrożenie ją nadpisze.

## Potwierdzenie, że zadziałało

Po wdrożeniu workflow pobiera `https://33bots.at/` i porównuje sumę kontrolną strony
głównej z plikiem w repozytorium. W logu zobaczysz jedno z dwojga:

```
POTWIERDZONE: 33bots.at serwuje wersję z repozytorium.
```

albo `ROZJAZD` wraz z obiema sumami. Rozjazd nie zatrzymuje przebiegu — hosting potrafi
przez chwilę oddawać stronę z bufora — ale jeśli utrzymuje się po kilku minutach, znaczy
że publikacja nie dociera na domenę.

## GitHub Pages

Ścieżka publikacji przez Pages zostaje w workflow jako zapasowa i jest domyślnie
wyłączona. Włącza ją zmienna repozytorium `PAGES_PRZEZ_ACTIONS = tak` razem z ustawieniem
**Settings → Pages → Source: GitHub Actions**. Dopóki domena stoi na zwykłym hostingu,
nie ma to sensu — pliki lądowałyby na `oliwierels.github.io`, a nie pod `33bots.at`.

## Co nie trafia na serwer

`.github/`, `narzedzia-serwer/`, pliki `.md` i `.py`, `.gitignore`, `_redirects`
(konfiguracja Netlify — Apache czyta `.htaccess`), `tailwind.config.js` oraz sam
`deploy.php`. Pomijane są też `CNAME` i `.nojekyll` — to resztki po GitHub Pages, na
Apache nic nie robią. W repozytorium zostają, bo `CNAME` sprawdza bramka. Wysyłany jest
za to katalog `video/` i wszystkie zdjęcia — tych plików nie ma na serwerze z żadnego
innego źródła.

## Gdy coś pójdzie nie tak

| Objaw | Przyczyna |
|---|---|
| HTTP 404 | Brak `deploy.php` pod adresem z `DEPLOY_URL_AT` |
| HTTP 403 | Token w pliku różni się od sekretu `DEPLOY_TOKEN_AT` |
| HTTP 500 | Placeholder zamiast tokenu albo brak `ZipArchive` na hostingu |
| HTTP 502 | Hosting nie dosięgnął GitHuba |
| Zatrzymanie na bramce | Błąd w którejś stronie; log podaje który. Na serwer nic nie poszło |
| `ROZJAZD` mimo udanego wdrożenia | Bufor hostingu albo `deploy.php` leży w innym katalogu niż strona |

## Wycofanie zmiany

`git revert` i zatwierdzenie — wdrożenie uruchomi się samo i przywróci poprzedni stan.
