# Wochenplan

Tages- und Wochenplan für Kinder: Was ist heute dran, was kommt als Nächstes?
Mit großen Bildern, Timer-Scheibe und Ampel. Läuft auf dem Fernseher (Google TV), auf dem Tablet und im Browser.

- **Woche → Tag → Tagesabschnitt → Aufgabe**: Morgen, Vormittag, Mittag, Nachmittag, Abend
- **Aufgabe groß**: Bild, Timer (die farbige Scheibe ist die Restzeit), Ampel grün/gelb/rot, Ton am Ende
- **Sonne über dem Tag** zeigt, in welchem Abschnitt wir gerade sind; abends wird die App dunkel
- **Bearbeiten** (Stift gedrückt halten): Aufgaben per Drag & Drop verschieben, Bild austauschen oder eigenes Foto, Timer, feste Uhrzeit, Tage kopieren
- **Fernbedienung**: alles mit Pfeiltasten, OK und Zurück bedienbar

## So läuft es

| | Wo | Rolle |
|---|---|---|
| Planen | Webseite auf Handy oder PC: <https://michaelkrinningersg-coder.github.io/wochenplan/> | „Planen“ – Änderungen werden verschlüsselt hochgeladen |
| Anzeigen | App auf dem Google TV (oder Handy-Bildschirm auf den Fernseher spiegeln) | „Nur anzeigen“ – holt den Plan alle 2 Minuten |

Der Plan liegt verschlüsselt (AES-GCM, Schlüssel aus dem Familien-Passwort) im Zweig `plan-daten` dieses Repos.
Ohne Passwort kann ihn niemand lesen. Plan und Fotos landen nie im Code.

## Einrichtung

### 1. Webseite einschalten (einmalig)
GitHub → Repo → **Settings → Pages** → Source „Deploy from a branch“ → Branch **gh-pages** / root → Save.

### 2. Planer (Handy/PC)
1. GitHub-Token erstellen: Profilbild → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
   - Repository access: **Only select repositories → wochenplan**
   - Permissions → Repository permissions → **Contents: Read and write**
   - Ablaufdatum lang wählen, Token kopieren (`github_pat_…`)
2. Webseite öffnen → Schloss/Stift gedrückt halten → Zahnrad → **Einstellungen**:
   „Planen“, Familien-Passwort und Token eintragen → „Jetzt abgleichen“.

### 3. Fernseher (Chromecast mit Google TV)
1. Profilbild → Einstellungen → System → Info → 7× OK auf „Android TV-Betriebssystem Build“ (Entwicklermodus)
2. App **Downloader** aus dem Play Store installieren
3. Einstellungen → Apps → Sicherheit & Einschränkungen → Unbekannte Quellen → Downloader erlauben
4. In Downloader eingeben:
   `https://github.com/michaelkrinningersg-coder/wochenplan/releases/latest/download/wochenplan.apk`
5. App öffnen → Schloss oben rechts gedrückt halten → „Nur anzeigen“ und Familien-Passwort eintragen.

Updates: Link in Downloader erneut öffnen, die neue Version installiert sich über die alte (Plan bleibt erhalten).

## Entwicklung

Svelte 5 + Vite + TypeScript, Android über Capacitor 8.

```bash
npm install
npm run dev          # Entwicklung im Browser
npm run check        # Typprüfung
npm run build        # Webseite nach dist/
npm run android      # Webteil bauen und in android/ kopieren
```

GitHub Actions (`.github/workflows/bauen.yml`) baut bei jedem Push auf `main` die Webseite (Zweig `gh-pages`)
und die APK (Release „wochenplan.apk“, die letzten 5 Versionen bleiben).

Die APK wird mit `android/keystore/wochenplan.jks` signiert (Passwort `wochenplan`), damit Updates
über die installierte Version passen. Wer das nicht öffentlich haben möchte: Keystore per GitHub-Secret
übergeben (`WP_KEYSTORE`, `WP_KEYSTORE_PASSWORT`, `WP_KEY_ALIAS`, `WP_KEY_PASSWORT`).

## Bilder und Schriften

- Bilder: [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (Flat), MIT-Lizenz – `src/assets/icons/LICENSE-fluentui-emoji.txt`
- Schriften: Fredoka und Andika, SIL Open Font License – `src/assets/fonts/`
