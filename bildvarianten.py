# -*- coding: utf-8 -*-
"""Kleinere Bildvarianten für die Galerie (400 px Breite, WebP).

Auf dem Handy ist eine Galeriekachel etwa 380 px breit, geladen wurde aber die
volle Datei mit 150–270 KB. Die 400-px-Variante wiegt einen Bruchteil davon.

Aufruf:  python3 bildvarianten.py   (läuft auch automatisch aus generate_site.py)
Benötigt Pillow. Legt <name>-400.webp neben den Originalen ab.
"""
import glob
import os

from PIL import Image

SZEROKOSC = 400
WZORCE = ("realizacja-*.jpg", "robot-pies-*.jpg", "robot-g1-studio.jpg")


def main():
    zrobione = 0
    for wzorzec in WZORCE:
        for zrodlo in sorted(glob.glob(wzorzec)):
            cel = zrodlo.rsplit(".", 1)[0] + "-400.webp"
            if os.path.exists(cel) and os.path.getmtime(cel) >= os.path.getmtime(zrodlo):
                continue
            obraz = Image.open(zrodlo)
            if obraz.width > SZEROKOSC:
                wysokosc = round(obraz.height * SZEROKOSC / obraz.width)
                obraz = obraz.resize((SZEROKOSC, wysokosc), Image.LANCZOS)
            obraz.convert("RGB").save(cel, "WEBP", quality=82, method=6)
            zrobione += 1
            print(f"  ✓ {cel} ({os.path.getsize(cel)//1024} KB)")
    print(f"Wariantów zapisanych: {zrobione}")


if __name__ == "__main__":
    main()
