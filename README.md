# 33bots Österreich 🤖

Statische, SEO-optimierte Website für **33bots Austria** – Vermietung des humanoiden Roboters **Unitree G1** für Events, Messen und Firmenveranstaltungen in ganz Österreich.

Deutschsprachige (de-AT) Adaption des polnischen Angebots von [33bots.pl](https://33bots.pl) für den österreichischen Markt.

## Seiten

| Datei | Zweck |
|-------|-------|
| `index.html` | Startseite (Hero, Vorteile, Roboter-Specs, Ablauf, Preise, Städte, FAQ, CTA) |
| `preise.html` | Preisübersicht mit Paketen (1/2/3 Tage) |
| `kontakt.html` | Kontakt- und Anfrageformular |
| `roboter-mieten-wien.html` | Lokale Landingpage Wien |
| `roboter-mieten-graz.html` | Lokale Landingpage Graz |
| `roboter-mieten-linz.html` | Lokale Landingpage Linz |
| `roboter-mieten-salzburg.html` | Lokale Landingpage Salzburg |
| `roboter-mieten-innsbruck.html` | Lokale Landingpage Innsbruck |
| `roboter-mieten-klagenfurt.html` | Lokale Landingpage Klagenfurt |
| `roboter-mieten-villach.html` | Lokale Landingpage Villach |
| `roboter-mieten-wels.html` | Lokale Landingpage Wels |
| `roboter-mieten-st-poelten.html` | Lokale Landingpage St. Pölten |
| `roboter-mieten-dornbirn.html` | Lokale Landingpage Dornbirn |
| `roboter-mieten-eisenstadt.html` | Lokale Landingpage Eisenstadt |
| `impressum.html` | Impressum (§ 5 ECG / § 25 MedienG) – Platzhalter befüllen |
| `datenschutz.html` | Datenschutzerklärung (DSGVO) – Platzhalter befüllen |

## SEO-Features

- **Meta-Tags**: individuelle Title & Descriptions, Keywords, `robots`, `theme-color`, Geo-Tags pro Stadt
- **Open Graph & Twitter Cards** inkl. 1200×630 Share-Image (`assets/img/og-image.png`)
- **Structured Data (JSON-LD)**: `LocalBusiness`, `Service`, `FAQPage`, `BreadcrumbList`, `ContactPage` (14 valide Blöcke)
- **Canonical-URLs** und `hreflang` (`de-at`, `x-default`)
- **`sitemap.xml`** & **`robots.txt`**
- **Semantisches HTML5**, korrekte Heading-Hierarchie, `alt`-Texte, ARIA-Labels
- **Lokale Landingpages** je Stadt für regionale Suchbegriffe („Roboter mieten Wien" etc.)
- **Video-Galerie** mit echten Event-Aufnahmen (`assets/video/`), `VideoObject`-Schema, Lazy-Loading (`preload="none"`) und Poster-Bildern
- **PWA-Manifest** (`site.webmanifest`)
- **Performance**: keine schweren Frameworks, reines HTML/CSS/JS, `defer`, `preconnect`
- **Responsiv** (Mobile-First) und `prefers-reduced-motion`-freundlich

## Lokale Vorschau

```bash
npx http-server -p 8080
# dann http://127.0.0.1:8080 öffnen
```

Absolute Pfade (`/assets/...`) benötigen einen Webserver – ein direktes Öffnen per `file://` lädt die Assets nicht.

## Vor dem Go-Live anzupassen

- **Domain**: alle absoluten URLs sind auf `https://33bots.at/` gesetzt – bei abweichender Domain in allen Dateien (Canonical, OG, Sitemap, JSON-LD) anpassen.
- **Kontaktdaten**: Telefonnummer (`+43 1 267 0000`) prüfen; E-Mail ist `kontakt@33bots.at`.
- **Preise**: die genannten Beträge sind Beispielwerte und marktgerecht zu prüfen.
- **Impressum & Datenschutz**: die in `[eckigen Klammern]` markierten Platzhalter mit echten Unternehmensdaten befüllen.
- **Formular**: sendet per [FormSubmit](https://formsubmit.co) an `kontakt@33bots.at`. Die **erste** Absendung löst eine einmalige Bestätigungs-E-Mail (Aktivierung) an dieses Postfach aus – Link anklicken, danach werden alle Anfragen zugestellt.
- **Domain**: `CNAME` enthält `33bots.at`. DNS beim Registrar setzen (A-Records auf GitHub-Pages-IPs bzw. CNAME für `www`).

## Veröffentlichung

Die Seite liegt auf GitHub Pages (Domain über die Datei `CNAME`). Jeder Push auf den
Produktionsbranch veröffentlicht sie; davor prüft `.github/workflows/wdrozenie.yml` die
komplette Website und bricht bei einem Fehler ab, damit nichts Kaputtes live geht:

- geschlossene HTML-Tags und gültiges JSON-LD,
- Canonical-Adressen unter `33bots.at`, vorhanden und ohne Dubletten,
- hreflang: keine fremde Sprachversion zeigt auf die eigene Domain,
- Verweise auf Dateien, die es im Repository nicht gibt,
- `sitemap.xml` als gültiges XML mit vorhandenen Dateien,
- `CNAME` mit exakt `33bots.at` — fehlt er, verliert Pages die eigene Domain.

Damit die Veröffentlichung selbst über Actions läuft (statt direkt aus dem Branch),
sind zwei einmalige Einstellungen nötig:

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**
2. Settings → Secrets and variables → Actions → Variables → `PAGES_PRZEZ_ACTIONS` = `tak`

Ohne die Variable prüft der Workflow nur — veröffentlicht wird weiter aus dem Branch.

## Sprachversionen

`sprachen.py` pflegt hreflang und den Sprachumschalter in der Fußzeile. Die Tabelle der
Entsprechungen (33bots.pl, 33bots.de, 33bots.lt) steht oben in der Datei; nach einer
Änderung einmal `python3 sprachen.py` laufen lassen. Das Skript ist idempotent.

## Tech-Stack

Statisches HTML/CSS/Vanilla-JS – kein Build-Schritt, direkt hostbar (Netlify, Vercel, GitHub Pages, jeder Webspace).
