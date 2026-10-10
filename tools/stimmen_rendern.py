#!/usr/bin/env python3
"""Rendert alle Sprachbausteine aus wortliste.csv mit einer Piper-Stimme zu kleinen MP3-Dateien.

Einmalig auf dem eigenen Rechner ausführen (braucht Internet, Python 3.9+ und ffmpeg):

    pip install piper-tts
    python tools/stimmen_rendern.py --stimme de_DE-thorsten-high
    python tools/stimmen_rendern.py --stimme de_DE-kerstin-low     # andere Stimme

Ergebnis: src/assets/stimme/*.mp3 (ca. 10-20 MB). Danach `npm run build` – die App nutzt die Bausteine
automatisch, fehlende Texte spricht weiter die Gerätestimme.
Vorher die Lizenz der gewählten Stimme prüfen (Modellkarte auf huggingface.co/rhasspy/piper-voices) und
im Dialog „Bilder und Lizenzen“ mit Namen nennen.
"""
import argparse, csv, subprocess, sys, tempfile, wave
from pathlib import Path

wurzel = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("--stimme", default="de_DE-thorsten-high")
ap.add_argument("--liste", default=str(wurzel / "tools" / "wortliste.csv"))
ap.add_argument("--ziel", default=str(wurzel / "src" / "assets" / "stimme"))
ap.add_argument("--tempo", type=float, default=1.15, help="length_scale: größer = langsamer (Kinder: 1.1-1.25)")
a = ap.parse_args()

modelle = Path.home() / ".cache" / "piper-stimmen"
modelle.mkdir(parents=True, exist_ok=True)
modell = modelle / f"{a.stimme}.onnx"
if not modell.exists():
    subprocess.run([sys.executable, "-m", "piper.download_voices", a.stimme, "--download-dir", str(modelle)], check=True)

from piper import PiperVoice  # noqa: E402
try:
    from piper import SynthesisConfig  # piper-tts >= 1.3
    konfig = SynthesisConfig(length_scale=a.tempo)
except ImportError:
    konfig = None
stimme = PiperVoice.load(str(modell))

ziel = Path(a.ziel)
ziel.mkdir(parents=True, exist_ok=True)
with open(a.liste, encoding="utf-8-sig", newline="") as f:
    zeilen = list(csv.DictReader(f, delimiter=";"))
for i, z in enumerate(zeilen, 1):
    mp3 = ziel / z["Dateiname"]
    if mp3.exists():
        continue
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as t:
        wav = Path(t.name)
    with wave.open(str(wav), "wb") as w:
        if konfig:
            stimme.synthesize_wav(z["Text"], w, syn_config=konfig)
        else:
            stimme.synthesize(z["Text"], w, length_scale=a.tempo)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-b:a", "48k", str(mp3)], check=True)
    wav.unlink()
    print(f"{i}/{len(zeilen)} {z['Dateiname']}")
print("Fertig:", ziel)
