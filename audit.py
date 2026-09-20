# -*- coding: utf-8 -*-
"""Technisches Audit der Website — Kriterien aus dem 33bots.pl-Audit (SETPROFIT, 09/2026).

Prüft, was sich aus den Dateien im Repository prüfen lässt: doppelte Titel, Längen von
Titel und Beschreibung, H1, Canonical, noindex, zu dünne Seiten, alt-Texte, Bildgewicht
auf dem Handy, Sicherheits-Header, /index.html-Weiterleitung und die Sitemap.

Läuft automatisch vor jedem Deployment (.github/workflows/wdrozenie.yml).
Manuell:  python3 audit.py . 33bots.de
"""
import glob, json, os, re, sys
from collections import defaultdict
from html.parser import HTMLParser
from urllib.parse import urlparse

KATALOG, DOMENA = sys.argv[1], sys.argv[2]
os.chdir(KATALOG)
BAZA = f"https://{DOMENA}"

POMIJANE = {"404.html", "szablon-case-study.html", "index-redesign.html", "danke.html"}
STRONY = sorted(p for p in glob.glob("*.html") if p not in POMIJANE)

wyniki = defaultdict(list)


def tekst(zrodlo):
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", zrodlo, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", s).strip()


tytuly = defaultdict(list)
kanoniczne = defaultdict(list)

for plik in STRONY:
    zrodlo = open(plik, encoding="utf-8").read()

    m = re.search(r"<title>(.*?)</title>", zrodlo, re.S)
    if not m:
        wyniki["brak_title"].append(plik)
    else:
        t = " ".join(m.group(1).split())
        tytuly[t].append(plik)
        if len(t) > 65:
            wyniki["title_za_dlugi"].append(f"{plik} ({len(t)})")

    m = re.search(r'<meta name="description" content="([^"]*)"', zrodlo)
    if not m:
        wyniki["brak_meta"].append(plik)
    elif len(m.group(1)) > 160:
        wyniki["meta_za_dluga"].append(f"{plik} ({len(m.group(1))})")

    h1 = re.findall(r"<h1[^>]*>(.*?)</h1>", zrodlo, re.S)
    if len(h1) != 1:
        wyniki["h1_inny_niz_jeden"].append(f"{plik} ({len(h1)})")

    m = re.search(r'<link[^>]+rel="canonical"[^>]+href="([^"]+)"', zrodlo)
    if not m:
        wyniki["brak_canonical"].append(plik)
    else:
        kanoniczne[m.group(1)].append(plik)
        oczekiwany = f"{BAZA}/" if plik == "index.html" else f"{BAZA}/{plik}"
        if m.group(1) != oczekiwany:
            wyniki["canonical_nie_self"].append(f"{plik} -> {m.group(1)}")

    if re.search(r'<meta name="robots"[^>]*noindex', zrodlo):
        wyniki["noindex"].append(plik)

    # Strony prawne z natury są krótkie i nie mają konkurować w wyszukiwarce.
    slowa = len(tekst(zrodlo).split())
    if slowa < 200 and not any(x in plik for x in ("impressum", "datenschutz", "barrierefreiheit",
                                                   "privatumo", "polityka", "regulamin")):
        wyniki["thin_content"].append(f"{plik} ({slowa})")

    for img in re.finditer(r"<img\b[^>]*>", zrodlo):
        if 'alt=' not in img.group(0):
            wyniki["img_bez_alt"].append(plik)
            break

    # Waga grafik, które przeglądarka realnie pobierze na telefonie.
    # W <picture> pobierany jest jeden plik, nie wszystkie warianty, a data-full
    # (powiększenie w lightboxie) ładuje się dopiero po kliknięciu.
    def rozmiar(sciezka):
        return os.path.getsize(sciezka) if os.path.exists(sciezka) else 0

    waga = 0
    reszta = zrodlo
    for obraz in re.finditer(r"<picture>.*?</picture>", zrodlo, re.S):
        reszta = reszta.replace(obraz.group(0), "")
        warianty = set()
        for m2 in re.finditer(r'(?:src|srcset)="([^"]+)"', obraz.group(0)):
            for kawalek in m2.group(1).split(","):
                sciezka = kawalek.strip().split(" ")[0].split("?")[0]
                if re.search(r"\.(jpg|jpeg|png|webp|gif|avif)$", sciezka, re.I) and not sciezka.startswith("http"):
                    warianty.add(sciezka)
        rozmiary = [rozmiar(w) for w in warianty if rozmiar(w)]
        waga += min(rozmiary) if rozmiary else 0

    for m2 in re.finditer(r'(?:src|srcset)="([^"]+)"', reszta):
        for kawalek in m2.group(1).split(","):
            sciezka = kawalek.strip().split(" ")[0].split("?")[0]
            if re.search(r"\.(jpg|jpeg|png|webp|gif|avif)$", sciezka, re.I) and not sciezka.startswith("http"):
                waga += rozmiar(sciezka)
    if waga > 1_500_000:
        wyniki["ciezkie_grafiki"].append(f"{plik} ({waga/1_048_576:.1f} MB)")

    if len(re.findall(r'<a [^>]*href="(?!http|mailto|tel|#)[^"]+\.html', zrodlo)) < 2:
        wyniki["malo_linkow_wewnetrznych"].append(plik)

    for m2 in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', zrodlo, re.S):
        try:
            json.loads(m2.group(1))
        except Exception as e:
            wyniki["zly_jsonld"].append(f"{plik}: {e}")
    # Strony prawne i pomocnicze nie potrzebują danych strukturalnych — nie opisują
    # usługi ani treści, którą wyszukiwarka miałaby czym wzbogacić.
    PRAWNE = ("impressum", "datenschutz", "barrierefreiheit", "privatumo", "polityka",
              "regulamin", "danke", "dziekujemy")
    if "application/ld+json" not in zrodlo and not any(x in plik for x in PRAWNE):
        wyniki["brak_schema"].append(plik)

for t, pliki in tytuly.items():
    if len(pliki) > 1:
        wyniki["duplikaty_title"].append(f'„{t[:60]}…" → {", ".join(pliki)}')
for adres, pliki in kanoniczne.items():
    if len(pliki) > 1:
        wyniki["duplikaty_canonical"].append(f'{adres} → {", ".join(pliki)}')

# --- konfiguracja serwera ---
NAGLOWKI = ["Strict-Transport-Security", "Content-Security-Policy", "X-Content-Type-Options",
            "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]
if os.path.exists(".htaccess"):
    ht = open(".htaccess", encoding="utf-8").read()
    for n in NAGLOWKI:
        if n not in ht:
            wyniki["brak_naglowka_bezp"].append(n)
    if "index.html" not in ht and "index\\.html" not in ht:
        wyniki["brak_301_index"].append("/index.html nie przekierowuje na /")
else:
    # GitHub Pages nie pozwala ustawiać własnych nagłówków HTTP. Część polityki da się
    # przenieść do <meta http-equiv>, reszta (HSTS, X-Frame-Options) wymaga serwera.
    przyklad = open(STRONY[0], encoding="utf-8").read() if STRONY else ""
    if 'http-equiv="Content-Security-Policy"' not in przyklad:
        wyniki["brak_csp_meta"].append("brak CSP w <meta> — jedyna droga bez własnego serwera")

# --- sitemap ---
if os.path.exists("sitemap.xml"):
    import xml.etree.ElementTree as ET
    NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    adresy = [w.text.strip() for w in ET.parse("sitemap.xml").getroot().iter(NS + "loc") if w.text]
    w_sitemap = set()
    for a in adresy:
        sciezka = urlparse(a).path.lstrip("/") or "index.html"
        w_sitemap.add(sciezka)
        if not os.path.exists(sciezka):
            wyniki["sitemap_martwy_adres"].append(a)
    for plik in STRONY:
        if plik not in w_sitemap:
            wyniki["strona_poza_sitemap"].append(plik)
else:
    wyniki["brak_sitemap"].append("brak sitemap.xml")

OPISY = {
    "brak_title": "strony bez tagu <title>",
    "duplikaty_title": "ten sam tytuł na kilku stronach — Google sam wybiera, którą pokazać",
    "title_za_dlugi": "tytuł powyżej 65 znaków — Google utnie końcówkę",
    "brak_meta": "brak meta description",
    "meta_za_dluga": "opis powyżej 160 znaków — utnie się wezwanie do działania",
    "h1_inny_niz_jeden": "strona musi mieć dokładnie jeden nagłówek H1",
    "brak_canonical": "brak adresu kanonicznego",
    "canonical_nie_self": "adres kanoniczny nie wskazuje na tę stronę",
    "duplikaty_canonical": "ten sam adres kanoniczny na kilku stronach",
    "noindex": "strona wyłączona z indeksu",
    "thin_content": "poniżej 200 słów treści",
    "img_bez_alt": "obrazy bez atrybutu alt",
    "ciezkie_grafiki": "powyżej 1,5 MB grafik na telefonie",
    "malo_linkow_wewnetrznych": "mniej niż dwa linki wewnętrzne",
    "zly_jsonld": "błędne dane strukturalne",
    "brak_schema": "brak danych strukturalnych",
    "brak_naglowka_bezp": "brak nagłówka bezpieczeństwa w .htaccess",
    "brak_301_index": "/index.html nie przekierowuje na /",
    "brak_csp_meta": "brak CSP (hosting bez własnych nagłówków)",
    "brak_htaccess": "brak pliku .htaccess",
    "sitemap_martwy_adres": "adres w sitemapie bez pliku",
    "strona_poza_sitemap": "strona spoza sitemapy",
    "brak_sitemap": "brak sitemap.xml",
}

print(f"### {DOMENA} — przeanalizowanych stron: {len(STRONY)}")
if not wyniki:
    print("  Wszystkie kryteria spełnione.")
    raise SystemExit(0)

for klucz, lista in sorted(wyniki.items()):
    print(f"  {klucz} ({OPISY.get(klucz, '')}): {len(lista)}")
    for x in lista[:6]:
        print(f"      - {x}")
    if len(lista) > 6:
        print(f"      … i {len(lista)-6} więcej")

print()
print("Audyt wykrył problemy — powyżej lista z plikami, których dotyczą.")
raise SystemExit(1)
