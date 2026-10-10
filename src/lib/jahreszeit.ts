// Jahreszeit nach Datum und typische Dinge dazu (für das Ruhebild)
export type Jahreszeit = 'fruehling' | 'sommer' | 'herbst' | 'winter'

export function jahreszeit(d = new Date()): Jahreszeit {
  const md = (d.getMonth() + 1) * 100 + d.getDate()
  if (md >= 320 && md < 621) return 'fruehling'
  if (md >= 621 && md < 923) return 'sommer'
  if (md >= 923 && md < 1221) return 'herbst'
  return 'winter'
}

export const JAHRESZEIT_NAME: Record<Jahreszeit, string> = {
  fruehling: 'Frühling',
  sommer: 'Sommer',
  herbst: 'Herbst',
  winter: 'Winter',
}

export const TYPISCH: Record<Jahreszeit, { e: string; t: string }[]> = {
  fruehling: [
    { e: '🌷', t: 'Tulpen blühen' },
    { e: '🐣', t: 'Küken schlüpfen' },
    { e: '🐝', t: 'Bienen summen' },
    { e: '🦋', t: 'Schmetterlinge' },
    { e: '🌈', t: 'Regenbogen' },
    { e: '🐞', t: 'Marienkäfer' },
    { e: '🐰', t: 'Osterhase' },
    { e: '🌱', t: 'Alles wächst' },
  ],
  sommer: [
    { e: '☀️', t: 'Sonne' },
    { e: '🍦', t: 'Eis essen' },
    { e: '🏖️', t: 'Strand' },
    { e: '🏊', t: 'Baden gehen' },
    { e: '🍓', t: 'Erdbeeren' },
    { e: '🌻', t: 'Sonnenblumen' },
    { e: '🍉', t: 'Melone' },
    { e: '⛺', t: 'Zelten' },
  ],
  herbst: [
    { e: '🍂', t: 'Bunte Blätter' },
    { e: '🌰', t: 'Kastanien sammeln' },
    { e: '🎃', t: 'Kürbisse' },
    { e: '🍄', t: 'Pilze' },
    { e: '🪁', t: 'Drachen steigen' },
    { e: '🦔', t: 'Igel' },
    { e: '🍎', t: 'Äpfel ernten' },
    { e: '☔', t: 'Regenwetter' },
  ],
  winter: [
    { e: '⛄', t: 'Schneemann bauen' },
    { e: '❄️', t: 'Schneeflocken' },
    { e: '🛷', t: 'Schlitten fahren' },
    { e: '🎄', t: 'Tannenbaum' },
    { e: '🍪', t: 'Plätzchen backen' },
    { e: '🧤', t: 'Handschuhe an' },
    { e: '🕯️', t: 'Kerzen' },
    { e: '☕', t: 'Kakao trinken' },
  ],
}

/** Drei Dinge ab einer Startposition (rotiert durch die Liste) */
export function dreiDinge(jz: Jahreszeit, start: number) {
  const l = TYPISCH[jz]
  return [0, 1, 2].map((i) => l[(start + i) % l.length])
}

/** Bildschirm-Positionen (in %) von Baum, Dach und Boden im Jahreszeiten-Bild */
export interface Orte {
  krone: { x: number; y: number }
  stamm: { x: number; y: number }
  dach: { x: number; y: number }[]
  boden: [number, number]
}
