#!/usr/bin/env python3
"""Macht aus KI-Bildern auf magentafarbenem Hintergrund freigestellte WebP-Figuren für die App.

    pip install pillow
    python tools/figuren_freistellen.py <ordner-mit-bildern>

Die Bilder heißen <figur>-<nummer>.png|jpg|webp (z. B. hund-1.png, hund-2.png, maedchen-1.png, katze-2.png,
vogel-1.png; optional je Jahreszeit hund-winter-1.png). Ergebnis: src/assets/figuren/*.webp.
Alle Bilder einer Figur werden auf denselben Ausschnitt zugeschnitten, damit sie beim Umschalten nicht springen.
"""
import re, sys
from collections import defaultdict
from pathlib import Path
from PIL import Image

quelle = Path(sys.argv[1])
ziel = Path(__file__).resolve().parent.parent / "src" / "assets" / "figuren"
ziel.mkdir(parents=True, exist_ok=True)
HOEHE = 800


def freistellen(bild: Image.Image) -> Image.Image:
    bild = bild.convert("RGBA")
    px = bild.load()
    for y in range(bild.height):
        for x in range(bild.width):
            r, g, b, a = px[x, y]
            # Magenta: viel Rot und Blau, wenig Grün
            maga = min(r, b) - g
            if maga > 120:
                px[x, y] = (r, g, b, 0)
            elif maga > 50:
                # Randpixel: halbtransparent und Magentastich entfernen
                alpha = int(255 * (1 - (maga - 50) / 70))
                m = max(g, min(r, b) - 0)
                px[x, y] = (min(r, m + 20), g, min(b, m + 20), alpha)
    return bild


gruppen = defaultdict(list)
for f in sorted(quelle.iterdir()):
    m = re.match(r"^(.+)-(\d)\.(png|jpe?g|webp)$", f.name, re.I)
    if m:
        gruppen[m.group(1)].append((int(m.group(2)), f))
if not gruppen:
    sys.exit("Keine Bilder wie hund-1.png gefunden.")

for name, liste in gruppen.items():
    bilder = [(n, freistellen(Image.open(f))) for n, f in liste]
    boxen = [b.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox() for _, b in bilder]
    boxen = [b for b in boxen if b]
    box = (min(b[0] for b in boxen), min(b[1] for b in boxen), max(b[2] for b in boxen), max(b[3] for b in boxen))
    for n, b in bilder:
        ausschnitt = b.crop(box)
        faktor = HOEHE / ausschnitt.height
        ausschnitt = ausschnitt.resize((round(ausschnitt.width * faktor), HOEHE), Image.LANCZOS)
        ausschnitt.save(ziel / f"{name}-{n}.webp", quality=88)
        print("ok", f"{name}-{n}.webp")
