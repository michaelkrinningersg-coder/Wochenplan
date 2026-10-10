import { ABSCHNITTE, TAGE } from './konstanten'
import type { AbschnittId, Aufgabe, Plan, TagId, Tagesplan } from './typen'

export function neueId(): string {
  try {
    return crypto.randomUUID().slice(0, 8)
  } catch {
    return Math.random().toString(36).slice(2, 10)
  }
}

export function leererTag(): Tagesplan {
  return { morgen: [], vormittag: [], mittag: [], nachmittag: [], abend: [], bett: [] }
}

function a(titel: string, bild: string, minuten: number, zusatz?: string): Aufgabe {
  return { id: neueId(), titel, bild, minuten, ...(zusatz ? { zusatz } : {}) }
}

/** Der gleiche Grundablauf für jeden Tag (jeweils mit eigenen IDs) */
function grundtag(): Tagesplan {
  return {
    morgen: [a('Zähne putzen', 'zaehne', 3), a('Anziehen', 'anziehen', 10)],
    vormittag: [],
    mittag: [a('Mittagessen', 'essen', 30)],
    nachmittag: [],
    abend: [
      a('Abendessen', 'abendbrot', 30),
      a('Aufräumen', 'aufraeumen', 10),
      a('Umziehen', 'anziehen', 5, 'mond'),
      a('Zähne putzen', 'zaehne', 3),
    ],
    bett: [a('Fernsehen', 'fernsehen', 20), a('Lesen', 'lesen', 15), a('Schlafen', 'schlafen', 0)],
  }
}

/** Vorbereitete Woche: jeden Tag gleich, Samstag Schwimmen und Spielplatz, Montag Mittag Ergotherapie. */
export function startplan(): Plan {
  const woche = {} as Record<TagId, Tagesplan>
  for (const t of TAGE) woche[t.id] = grundtag()

  woche.sa.vormittag.push(a('Schwimmen', 'schwimmen', 0))
  woche.sa.nachmittag.push(a('Spielplatz', 'spielplatz', 60))
  woche.mo.mittag.push(a('Ergotherapie', 'puzzle', 0))

  return {
    version: 2,
    woche,
    zeiten: { morgen: '06:30', vormittag: '09:00', mittag: '12:00', nachmittag: '14:00', abend: '17:30', bett: '19:00' },
    abendEnde: '20:00',
  }
}

/** Gespeicherten Plan prüfen und fehlende Teile ergänzen. */
export function planNormalisieren(roh: unknown): Plan {
  const basis = startplan()
  if (!roh || typeof roh !== 'object') return basis
  const p = roh as Partial<Plan>
  const woche = {} as Record<TagId, Tagesplan>
  for (const t of TAGE) {
    const tag = (p.woche as Record<string, Partial<Tagesplan>> | undefined)?.[t.id]
    const neu = leererTag()
    for (const ab of ABSCHNITTE) {
      const liste = tag?.[ab.id as AbschnittId]
      if (Array.isArray(liste)) {
        neu[ab.id] = liste
          .filter((x) => x && typeof x === 'object' && typeof x.titel === 'string')
          .map((x) => ({
            id: typeof x.id === 'string' && x.id ? x.id : neueId(),
            titel: x.titel,
            bild: typeof x.bild === 'string' && x.bild ? x.bild : 'stern',
            minuten: Number.isFinite(x.minuten) ? Math.max(0, Math.min(600, Math.round(x.minuten))) : 0,
            ...(typeof x.zusatz === 'string' && x.zusatz ? { zusatz: x.zusatz } : {}),
            ...(typeof x.uhrzeit === 'string' && /^\d{1,2}:\d{2}$/.test(x.uhrzeit) ? { uhrzeit: x.uhrzeit } : {}),
          }))
      }
    }
    woche[t.id] = neu
  }
  const zeiten = { ...basis.zeiten }
  for (const ab of ABSCHNITTE) {
    const z = p.zeiten?.[ab.id]
    if (typeof z === 'string' && /^\d{1,2}:\d{2}$/.test(z)) zeiten[ab.id] = z
  }
  const abendEnde = typeof p.abendEnde === 'string' && /^\d{1,2}:\d{2}$/.test(p.abendEnde) ? p.abendEnde : basis.abendEnde
  return { version: 2, woche, zeiten, abendEnde }
}
