// Kachelgrößen so berechnen, dass alles ohne Scrollen auf den Bildschirm passt (wichtig für den Fernseher).

/** Höhe einer Kachel im Verhältnis zur Grundgröße s (Bild + Titel + Rand) */
export const KACHEL_HOEHE = 1.4
export const KACHEL_BREITE = 1.12

export interface TagesRaster {
  s: number
  /** Unterspalten je Abschnitt */
  spalten: number[]
  /** Mindestbreite je Abschnittsspalte in px */
  breiten: number[]
}

export function tagesRaster(
  anzahlen: number[],
  breite: number,
  hoehe: number,
  luecke: number,
  spaltenLuecke: number,
  innen: number,
  minSpalte: number | number[],
): TagesRaster {
  const minimum = (i: number) => (Array.isArray(minSpalte) ? minSpalte[i] : minSpalte)
  const k = anzahlen.length
  for (let s = 170; s >= 44; s -= 2) {
    const zeilen = Math.max(1, Math.floor((hoehe + luecke) / (s * KACHEL_HOEHE + luecke)))
    const spalten = anzahlen.map((n) => Math.max(1, Math.ceil(n / zeilen)))
    const breiten = spalten.map((c, i) =>
      anzahlen[i] === 0 ? minimum(i) : Math.max(c * s * KACHEL_BREITE + (c - 1) * luecke + 2 * innen, minimum(i)),
    )
    const summe = breiten.reduce((a, b) => a + b, 0) + (k - 1) * spaltenLuecke
    if (summe <= breite) return { s, spalten, breiten }
  }
  const s = 44
  const zeilen = Math.max(1, Math.floor((hoehe + luecke) / (s * KACHEL_HOEHE + luecke)))
  const spalten = anzahlen.map((n) => Math.max(1, Math.ceil(n / zeilen)))
  return { s, spalten, breiten: spalten.map((_, i) => minimum(i)) }
}

/** Größte Kachel für n Kacheln in einer Fläche (Abschnittsansicht) */
export function flaechenRaster(n: number, breite: number, hoehe: number, luecke: number, max = 300): { s: number; spalten: number } {
  let best = { s: 40, spalten: Math.max(1, n) }
  if (n <= 0) return { s: max, spalten: 1 }
  for (let spalten = 1; spalten <= n; spalten++) {
    const zeilen = Math.ceil(n / spalten)
    const sb = (breite - (spalten - 1) * luecke) / (spalten * KACHEL_BREITE)
    const sh = (hoehe - (zeilen - 1) * luecke) / (zeilen * KACHEL_HOEHE)
    const s = Math.min(sb, sh, max)
    if (s > best.s) best = { s, spalten }
  }
  return { s: Math.floor(best.s), spalten: best.spalten }
}

/** Mini-Kachelgröße für die Wochenansicht */
export function wochenRaster(
  tage: number[][],
  spaltenBreite: number,
  hoehe: number,
  kopf: number,
  bandInnen: number,
  luecke: number,
): number {
  for (let s = 64; s >= 22; s -= 2) {
    const proZeile = Math.max(1, Math.floor((spaltenBreite - 2 * bandInnen + luecke) / (s + luecke)))
    let passt = true
    for (const baender of tage) {
      let h = kopf
      for (const n of baender) {
        const zeilen = Math.max(1, Math.ceil(n / proZeile))
        h += zeilen * (s + luecke) - luecke + 2 * bandInnen + luecke
      }
      if (h > hoehe) {
        passt = false
        break
      }
    }
    if (passt) return s
  }
  return 22
}
