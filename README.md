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
- **Kontaktdaten**: Telefonnummer (`+43 1 267 0000`) und E-Mail (`hallo@33bots.at`) durch echte Daten ersetzen.
- **Preise**: die genannten Beträge sind Beispielwerte und marktgerecht zu prüfen.
- **Impressum & Datenschutz**: die in `[eckigen Klammern]` markierten Platzhalter mit echten Unternehmensdaten befüllen.
- **Formular**: sendet aktuell per `mailto:` – für echten Versand ein Backend/Form-Service anbinden.

## Tech-Stack

Statisches HTML/CSS/Vanilla-JS – kein Build-Schritt, direkt hostbar (Netlify, Vercel, GitHub Pages, jeder Webspace).
