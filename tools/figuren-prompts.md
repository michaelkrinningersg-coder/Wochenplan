# Anweisung an Gemini: Figuren für eine Kinder-App (Bild für Bild)

Du erzeugst gezeichnete Figuren für die Landschaft einer Kinder-Tagesplan-App. Die App zeigt von jeder Figur **zwei Bilder abwechselnd**, dadurch wirkt sie bewegt. Wir arbeiten **Bild für Bild**.

## Arbeitsweise (bitte genau einhalten)
1. Beginne mit **Bild 1 von „Junge“ (Datei `junge-1`)**. Erzeuge nur dieses eine Bild und warte.
2. Ich antworte „OK“ oder nenne Änderungen. Bei „OK“ erzeugst du **genau das nächste Bild** der Liste unten, nie mehrere auf einmal.
3. Das zweite Bild einer Figur (`…-2`) muss **dieselbe Figur** zeigen: gleiche Größe, gleiche Position im Bild, gleiche Farben, gleicher Stil, gleiche Blickrichtung. Es ändert sich **nur das genannte Detail**. Nimm dafür das vorherige Bild als Vorlage.
4. Nenne bei jedem Bild den Dateinamen (z. B. „junge-1“), damit ich es richtig speichere.

## Stil (gilt für ALLE Bilder)
- Gezeichnete Zeichentrick-Illustration im Stil eines gemalten Kinderbuchs: flache Farbflächen, weiche Pinselstruktur, warme Farben, runde freundliche Formen, große freundliche Augen.
- **Kein Foto, keine realen Menschen oder Tiere, nicht fotorealistisch, kein 3D, keine Render-Optik.**
- Die ganze Figur von Kopf bis Fuß sichtbar, mittig im Bild, leicht seitlich zum Betrachter gedreht, Hochformat 3:4.
- **Hintergrund: einfarbig reines Magenta (#FF00FF)**, ohne Verlauf, ohne Boden, ohne Schatten, ohne Schrift.
- Die Figuren dürfen **kein Magenta, Pink oder Violett** enthalten (Kleidung z. B. Gelb, Blau, Grün, Orange, Rot, Braun).
- Wenn ich eine Beispielkarte der App anhänge, den Malstil daran anpassen.

## Reihenfolge und Inhalt

### 1. `junge-1`
Gezeichneter Cartoon-Junge, ca. 5 Jahre, kurze braune Haare, gelbes Shirt, blaue Hose, braune Schuhe. Er steht und **winkt mit dem rechten Arm: Arm nach oben gestreckt, Hand offen, Handfläche zeigt nach vorn**, freundliches Lächeln.

### 2. `junge-2`
Gleicher Junge, gleiche Pose, Größe, Position und Farben. Nur der **rechte Arm ist auf Schulterhöhe leicht nach außen gesenkt**, Hand offen (Winken in der Bewegung).

### 3. `maedchen-1`
Gezeichnetes Cartoon-Mädchen, ca. 5 Jahre, braune Haare mit zwei Zöpfen, orange Jacke, grüne Hose, rote Schuhe. Sie steht und **winkt mit dem rechten Arm nach oben, Hand offen**, freundliches Lächeln.

### 4. `maedchen-2`
Gleiches Mädchen, gleiche Pose und Farben. Nur der **rechte Arm ist auf Schulterhöhe nach außen gesenkt**, Hand offen.

### 5. `hund-1`
Freundlicher gezeichneter Cartoon-Hund, mittelgroß, brauner Mischling mit Hängeohren und kleiner Zunge. Er **steht seitlich auf allen vier Beinen** (Stand fest auf dem Boden), **Schwanz nach links oben**, **Kopf leicht nach links geneigt**, fröhlicher Blick.

### 6. `hund-2`
Gleicher Hund, gleicher Körper, gleiche Beine und Position. Nur der **Schwanz zeigt jetzt nach rechts oben** und der **Kopf ist leicht nach rechts geneigt**.

### 7. `katze-1`
Gezeichnete Cartoon-Katze, graugetigert, sitzt aufrecht und schaut den Betrachter an, Schwanz nach oben gebogen. **Beide Augen weit offen.**

### 8. `katze-2`
Gleiche Katze, gleiche Pose, Größe und Position. Nur **ein Auge geschlossen, das andere offen** (freundliches Zwinkern).

### 9. `vogel-1`
Kleiner gezeichneter Cartoon-Vogel (Rotkehlchen mit roter Brust), Seitenansicht, sitzt auf einem **kurzen Ast** (Ast gehört zum Bild, nur ein kleines Stück). **Schnabel geschlossen.**

### 10. `vogel-2`
Gleicher Vogel auf demselben Ast, gleiche Position. Nur der **Schnabel ist weit geöffnet** (er singt).

## Optional danach: Winter-Varianten (nur auf Nachfrage)
Dieselben Figuren mit Mütze, Schal und Handschuhen bzw. kleinem Schal. Dateien heißen dann `junge-winter-1`, `junge-winter-2` usw.

---
Einbau (für mich, nicht für Gemini): Bilder wie oben benennen (z. B. `hund-1.png`), in einen Ordner legen und an Claude geben oder `python tools/figuren_freistellen.py <ordner>` ausführen. Die App stellt die Figuren frei, schneidet alle Bilder einer Figur gleich zu und zeigt sie im Ruhebild.
