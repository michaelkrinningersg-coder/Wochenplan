# Tagolino (Repo „Wochenplan“) – Hinweise für Claude

Kinder-Tages- und Wochenplan (Svelte 5 + Capacitor 8) für Tablet, Google TV und Web.
Zwei Versionen: Familie (Abgleich, Wetter, Update-Prüfung) und Play-Store (`STORE_BUILD=1`, `__STORE__`, Free/Pro).

## Arbeitsweise
- Antworten auf Deutsch, knapp.
- Jede Änderung gilt für **beide Versionen**; immer auch auf öffentliche Veröffentlichung (Play Store, Familienrichtlinie, Datenschutz) hin bewerten.
- Neue Texte: `t('Deutscher Text')`, Übersetzungen (en/es/fr) in `src/lib/i18n/woerter-*.ts` ergänzen.
- Vor dem Commit: `npm run check` (0 Fehler, 0 Warnungen), Sichtprüfung mit Playwright gegen `npx vite preview --port 4173`.
- Kein `pkill` verwenden (beendet die eigene Shell).
- Commits enden mit den Co-Authored-By-/Claude-Session-Zeilen.

## Bildsprache: keine Emojis, alles selbst gemalt
Im Ruhebild (Szene, Ereignisse, „typische Dinge“-Karten) werden **keine Emojis** verwendet.
Jedes Motiv wird als eigene SVG-Figur in `src/komponenten/GemalteFigur.svelte` gezeichnet:

- **Stil:** flache Formen ohne Umrisslinien; je Form eine Grundfarbe, eine dunklere Schattenfläche (unten/rechts)
  und eine hellere Lichtfläche (oben/links, `opacity` ≈ .35–.6); kleine weiße Glanzpunkte in Augen.
  Warme, kräftige Farben passend zur Jahreszeit; Bodenschatten als `<ellipse fill={SCHATTEN} opacity=".18">`.
- **Blickrichtung:** Tiere und Fahrzeuge schauen/fahren **nach links** (Laufwege spiegeln mit `scaleX(-1)`).
- **Aufbau einer Figur:** eigener `viewBox`-Eintrag und Höhe in `HOEHE` (em relativ zur Emoji-Schriftgröße);
  Schatten zuerst, danach alles in `<g class="k">` (Ganzkörper-Bewegung).
- **Bewegung (Pflicht):** jede Figur bewegt sich.
  - Ganzkörper über die Zuordnung `[data-n='name'] .k` zu einer Art: `gehen`, `watscheln`, `wackeln`, `baumeln`,
    `pochen`, `huepfen`, `rattern`, `schweben`, `kriechen`; Drehpunkt per `transform-origin` im viewBox (Boden- oder Aufhängepunkt).
  - Teile zusätzlich: Beine `class="bein a|b"`, Flügel `fluegel`, Räder `rad`, Blinzeln `lid`, Schwanz `schwanz`,
    sonst `<g class="teil …" style="transform-origin: Xpx Ypx">` (z. B. `ruessel`, `fuehler`, `picken`, `zucken`).
  - Nur `transform`/`opacity` animieren (flüssig auf dem TV); `prefers-reduced-motion` schaltet alles ab.
- **Einbau:** in `SzenenEreignisse.svelte` `<span class="figur emoji"><GemalteFigur name="…" /></span>`
  (füllende Boxen: `fuellen`); Karten in `Ruhebild.svelte` über die Zuordnung `GEMALT`.
- **Prüfen:** Galerie aller Figuren kurz per Playwright rendern (temporäre Seite, danach löschen) und als Bild ansehen.

## Szenen mit Motion Graphics
- Je Jahreszeit eine Landschaft (`src/komponenten/Landschaft.svelte`, Ausstattung je Jahreszeit in `SAISON`): Bild 1600×900,
  Ebenen mit leichter Parallaxe (`.ebene`, `--tiefe`), Nebel, ziehende Wolken, Baumkrone aus Büscheln,
  Teilchen im Canvas (Blätter/Schnee/Blüten), Böen über `windboe()` aus `src/lib/szene.svelte.ts`.
- Tageslauf (Himmel, Sonne, Mond, Tönung, Fensterlicht) kommt aus `JahreszeitSzene.svelte` (`stunde`, `dunkel`, `daemm`, `art`).
- Ausschnitt quer/hochkant über `ausschnitt()`/`prozent()`; `orte` (Krone, Stamm, Dach, Boden) passend zur Zeichnung setzen.
- Die drei Karten belegen ca. die unteren 24 % – Boden für Figuren bei y ≈ 650–672 (von 900), Haus und Baum darüber.
- Wachsendes (`stellen()`) spart Stamm und Haus aus.
