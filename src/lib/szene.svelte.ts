// Gemeinsamer Zustand der Jahreszeiten-Szene: Ereignisse können z. B. eine Windböe auslösen.
export const szene = $state({ boe: 0 })

export function windboe() {
  szene.boe++
}

/** Ausschnitt der gemalten Szene (Bild 1600×900): quer mittig beschnitten, hochkant um den Baum gelegt */
export interface Ausschnitt {
  x0: number
  w: number
  s: number
  ox: number
  oy: number
  hoch: boolean
}
export function ausschnitt(breite: number, hoehe: number): Ausschnitt {
  const b = Math.max(1, breite)
  const h = Math.max(1, hoehe)
  if (h > b * 1.05) {
    const s = h / 900
    const w = (900 * b) / h
    const x0 = Math.max(0, Math.min(1600 - w, 470 - w / 2))
    return { x0, w, s, ox: 0, oy: 0, hoch: true }
  }
  const s = Math.max(b / 1600, h / 900)
  return { x0: 0, w: 1600, s, ox: (b - 1600 * s) / 2, oy: (h - 900 * s) / 2, hoch: false }
}
/** Punkt im Bild (1600×900) → Prozent des Bildschirms */
export function prozent(a: Ausschnitt, breite: number, hoehe: number, x: number, y: number) {
  return { x: ((a.ox + (x - a.x0) * a.s) / Math.max(1, breite)) * 100, y: ((a.oy + y * a.s) / Math.max(1, hoehe)) * 100 }
}
