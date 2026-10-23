# -*- coding: utf-8 -*-
"""Sicherheits-Header als <meta>, weil GitHub Pages keine eigenen HTTP-Header erlaubt.

Die drei Schwesterseiten setzen HSTS, CSP, X-Frame-Options, Referrer-Policy und
Permissions-Policy in der .htaccess. 33bots.at liegt auf GitHub Pages — dort gibt es
keine Serverkonfiguration, also bleibt nur der Teil, den HTML selbst tragen kann:

- Content-Security-Policy als <meta http-equiv> (alles außer frame-ancestors),
- Referrer-Policy als <meta name="referrer">.

Nicht abbildbar sind HSTS, X-Frame-Options, X-Content-Type-Options und
Permissions-Policy: die gibt es ausschließlich als echte HTTP-Header. Wer sie braucht,
muss die Seite auf ein Hosting mit Serverkonfiguration umziehen — dieselbe cyber-folks-
Umgebung, auf der 33bots.pl, .de und .lt laufen.

Aufruf:  python3 sicherheitskopf.py   (idempotent)
"""
import glob
import re

MARKER = "data-sicherheit"

# Genau die Hosts, von denen die Seiten wirklich etwas laden. Dazu gehören nicht nur
# die im HTML sichtbaren, sondern auch die Sammel-Hosts der Tags, die GTM-MR7R7CJ3
# selbst nachlädt: Google Analytics 4 (G-MNE9Y0S9QV) und Google Ads (Conversions,
# Remarketing) sowie das Albacross-Pixel. Fehlen sie, blockiert die Richtlinie jede
# Messung, ohne dass die Seite einen sichtbaren Fehler zeigt. Die Liste stammt aus den
# tatsächlichen Anfragen des Containers.
GOOGLE = "https://www.google.com https://www.google.pl https://www.google.at https://www.google.de"
CSP = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com "
    "https://serve.albacross.com https://*.albacross.com "
    "https://www.googleadservices.com https://www.google.com https://googleads.g.doubleclick.net; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com "
    f"https://*.google-analytics.com https://*.analytics.google.com {GOOGLE} "
    "https://*.doubleclick.net https://www.googleadservices.com https://*.albacross.com; "
    "font-src 'self' data: https://fonts.gstatic.com; "
    "connect-src 'self' https://formspree.io https://www.google-analytics.com "
    "https://*.albacross.com https://serve.albacross.com https://www.googletagmanager.com "
    "https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com "
    f"{GOOGLE} https://*.doubleclick.net https://www.googleadservices.com "
    "https://pagead2.googlesyndication.com; "
    "frame-src https://www.googletagmanager.com https://www.youtube.com "
    "https://www.youtube-nocookie.com https://gdansk.tvp.pl https://*.doubleclick.net; "
    "media-src 'self'; form-action 'self' https://formspree.io; base-uri 'self'"
)

BLOCK = (f'<meta http-equiv="Content-Security-Policy" content="{CSP}" {MARKER} />\n'
         f'<meta name="referrer" content="strict-origin-when-cross-origin" {MARKER} />')


def main():
    geaendert = 0
    for datei in sorted(glob.glob("*.html")):
        inhalt = open(datei, encoding="utf-8").read()
        inhalt = re.sub(r'[ \t]*<meta[^>]*' + MARKER + r'[^>]*>\n?', "", inhalt)
        # direkt hinter das charset, damit die Regel gilt, bevor etwas geladen wird
        neu, n = re.subn(r'(<meta charset="[^"]+"\s*/?>)', r"\1\n" + BLOCK, inhalt, count=1)
        if n and neu != open(datei, encoding="utf-8").read():
            open(datei, "w", encoding="utf-8").write(neu)
            geaendert += 1
    print(f"Seiten mit Sicherheits-Meta: {geaendert}")


if __name__ == "__main__":
    main()
