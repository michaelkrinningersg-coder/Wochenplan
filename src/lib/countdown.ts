// Countdowns: „noch 3× schlafen bis …“ für Termine, markierte Aufgaben und Geburtstage
import { TAGE } from './konstanten'
import { app } from './speicher.svelte'
import { ausKey, datumKey, naechsterGeburtstag, alterAm, tageBis } from './zeit'

export interface CountdownEintrag {
  titel: string
  bild: string
  tage: number
  datum: string
  geburtstag?: boolean
}

export function countdowns(maxTage = 60): CountdownEintrag[] {
  const jetzt = new Date(app.jetzt)
  const liste: CountdownEintrag[] = []

  for (const t of app.plan.termine) {
    if (!t.countdown) continue
    const tage = tageBis(ausKey(t.datum), jetzt)
    if (tage >= 1 && tage <= maxTage) liste.push({ titel: t.titel, bild: t.bild, tage, datum: t.datum })
  }

  // Aufgaben aus dem Wochenplan mit Countdown: nächstes Vorkommen dieses Wochentags
  const heuteIndex = (jetzt.getDay() + 6) % 7
  TAGE.forEach((tag, i) => {
    for (const liste2 of Object.values(app.plan.woche[tag.id])) {
      for (const a of liste2) {
        if (!a.countdown) continue
        let tage = (i - heuteIndex + 7) % 7
        if (tage === 0) continue
        const d = new Date(jetzt)
        d.setDate(d.getDate() + tage)
        liste.push({ titel: a.titel, bild: a.bild, tage, datum: datumKey(d) })
      }
    }
  })

  for (const k of app.plan.kinder) {
    if (!k.geburtstag) continue
    const d = naechsterGeburtstag(k.geburtstag, jetzt)
    const tage = tageBis(d, jetzt)
    if (tage >= 1 && tage <= 14)
      liste.push({ titel: `${k.name} wird ${alterAm(k.geburtstag, d)}`, bild: 'geburtstag', tage, datum: datumKey(d), geburtstag: true })
  }
  return liste.sort((a, b) => a.tage - b.tage)
}

/** Kinder, die heute Geburtstag haben */
export function geburtstageHeute(): { name: string; alter: number; farbe: string }[] {
  const jetzt = new Date(app.jetzt)
  return app.plan.kinder
    .filter((k) => k.geburtstag && tageBis(naechsterGeburtstag(k.geburtstag, jetzt), jetzt) === 0)
    .map((k) => ({ name: k.name, alter: alterAm(k.geburtstag!, jetzt), farbe: k.farbe }))
}

export function geburtstageAm(datum: string): { name: string; alter: number }[] {
  const d = ausKey(datum)
  return app.plan.kinder
    .filter((k) => k.geburtstag && k.geburtstag.slice(5) === datum.slice(5) && k.geburtstag <= datum)
    .map((k) => ({ name: k.name, alter: alterAm(k.geburtstag!, d) }))
}
