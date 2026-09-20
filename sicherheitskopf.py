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

# Genau die Hosts, von denen die Seiten wirklich etwas laden — aus dem Code gelesen,
# nicht aus einer Vorlage kopiert.
CSP = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com "
    "https://serve.albacross.com https://*.albacross.com; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com; "
    "font-src 'self' data: https://fonts.gstatic.com; "
    "connect-src 'self' https://formsubmit.co https://www.google-analytics.com "
    "https://*.albacross.com https://serve.albacross.com; "
    "frame-src https://www.googletagmanager.com https://www.youtube.com "
    "https://www.youtube-nocookie.com https://gdansk.tvp.pl; "
    "media-src 'self'; form-action 'self' https://formsubmit.co; base-uri 'self'"
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
