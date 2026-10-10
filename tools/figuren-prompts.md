# Bild-Prompts: bewegte Figuren für die Landschaft

Jede Figur braucht **2 Bilder** (Einzelbilder), die die App abwechselnd zeigt. Wichtig: Figur, Größe, Position im Bild und Farben müssen in beiden Bildern **identisch** sein, nur das genannte Detail ändert sich. Am besten: Bild 1 erzeugen, dann in **demselben Chat** schreiben: „Gleiche Figur, gleiche Pose, gleiche Größe und Position, nur …“.

## Für alle Prompts (an jeden anhängen)
> Weiche gemalte Kinderbuch-Illustration im gleichen Stil wie die Karten, warme Farben, runde freundliche Formen, die ganze Figur von Kopf bis Fuß sichtbar, steht seitlich leicht zum Betrachter gedreht, mittig im Bild, **einfarbig reiner magentafarbener Hintergrund (#FF00FF), keine Schatten, kein Boden, keine Schrift**, Hochformat 3:4.

Wichtig: Die Figuren dürfen **kein Magenta, Pink oder Violett** enthalten (sonst wird es mit herausgeschnitten) – Kleidung also in Gelb, Blau, Grün, Orange, Rot.

## Dateien
| Datei | Bild 1 | Bild 2 |
|---|---|---|
| `junge-1/2` | Junge (ca. 5 J., kurze braune Haare, gelbes Shirt, blaue Hose) steht und winkt: **rechter Arm hoch, Hand offen, Handfläche zeigt nach vorn** | **gleiche Figur, der Arm ist auf Schulterhöhe leicht nach außen gesenkt, Hand offen** (wie Winken in der Bewegung) |
| `maedchen-1/2` | Mädchen (ca. 5 J., braune Haare mit zwei Zöpfen, orange Jacke, grüne Hose) winkt: Arm hoch, Hand offen | gleiche Figur, Arm auf Schulterhöhe nach außen gesenkt |
| `hund-1/2` | Freundlicher Hund (mittelgroß, brauner Mischling, hängende Ohren, Zunge leicht raus) **steht** auf allen vier Beinen, Schwanz **links hoch**, Kopf leicht **nach links geneigt** | gleicher Hund, gleiche Beine/Körper, Schwanz **rechts hoch**, Kopf leicht **nach rechts geneigt** |
| `katze-1/2` | Katze (graugetigert, aufrechtes Sitzen/Stehen, Schwanz nach oben gebogen) schaut den Betrachter an, **beide Augen weit offen** | gleiche Katze, **beide Augen geschlossen** (zwinkernd, freundlich) |
| `vogel-1/2` | kleiner Vogel (Rotkehlchen oder Spatz, Seitenansicht, sitzt auf einem Ast, **Ast mit abgebildet, nur kurzes Stück**), **Schnabel geschlossen** | gleicher Vogel, **Schnabel weit geöffnet** (singt) |

Für die Katze „zwinkern“: Bild 2 kann auch **ein Auge zu, ein Auge offen** sein, dann wirkt es wie ein Zwinkern.

## Optional: Winter-Varianten
Gleiche Prompts mit „trägt Mütze, Schal und Handschuhe“ (Kinder) bzw. „Hund/Katze mit kleinem Schal“. Dateien heißen dann `junge-winter-1/2` usw. – im Winter nimmt die App sie automatisch, sonst die normalen.

## Einbau
1. Alle Bilder in einen Ordner, benannt wie in der Tabelle (z. B. `hund-1.png`).
2. `python tools/figuren_freistellen.py <ordner>` (erzeugt freigestellte WebP in `src/assets/figuren/`) – oder gib mir die Bilder, dann mache ich das.
3. Fertig: Die Figuren erscheinen im Ruhebild mit festem Stand (Katze links, Hund rechts neben dem Baum, Kinder am Haus, Vogel in der Baumkrone). Antippen lässt sie hüpfen.
