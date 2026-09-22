#!/usr/bin/env python3
"""Znaczy arkusz stylów sumą kontrolną jego własnej treści.

Strony odwoływały się do `assets-redesign.css` bez numeru wersji. Dopóki
33bots.at stało na GitHub Pages, uchodziło to płazem. Od przejścia na zwykły
hosting `.htaccess` każe trzymać arkusz w pamięci podręcznej przez rok —
bez numeru wersji każda zmiana wyglądu byłaby dla powracającego odwiedzającego
niewidoczna przez ten cały rok.

Numer zmienia się dokładnie wtedy, gdy zmieni się treść arkusza: ani razu
więcej, ani razu mniej. Odpowiednik buduj.sh z 33bots.pl.

UŻYCIE
    python3 wersja_arkusza.py
"""

import hashlib
import pathlib
import re

KATALOG = pathlib.Path(__file__).resolve().parent
ARKUSZ = "assets-redesign.css"


def main() -> None:
    wersja = hashlib.md5((KATALOG / ARKUSZ).read_bytes()).hexdigest()[:8]
    wzorzec = re.compile(rf'href="{re.escape(ARKUSZ)}(\?v=[0-9a-f]+)?"')
    nowy = f'href="{ARKUSZ}?v={wersja}"'

    zmienione = 0
    for plik in sorted(KATALOG.glob("*.html")):
        tekst = plik.read_text(encoding="utf-8")
        podmieniony, ile = wzorzec.subn(nowy, tekst)
        if ile and podmieniony != tekst:
            plik.write_text(podmieniony, encoding="utf-8")
            zmienione += 1

    print(f"Arkusz {ARKUSZ}: wersja {wersja}")
    print(f"Oznaczone strony: {zmienione}")


if __name__ == "__main__":
    main()
