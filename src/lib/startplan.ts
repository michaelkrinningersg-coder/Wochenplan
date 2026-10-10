import { ABSCHNITTE, TAGE } from './konstanten'
import type { AbschnittId, Aufgabe, Kind, KindId, Plan, TagId, Tagesplan, Termin } from './typen'

export function neueId(): string {
  try {
    return crypto.randomUUID().slice(0, 8)
  } catch {
    return Math.random().toString(36).slice(2, 10)
  }
}

export function leererTag(): Tagesplan {
  return { aufstehen: [], morgen: [], vormittag: [], mittag: [], nachmittag: [], frueh: [], abend: [], bett: [], schlafen: [] }
}

function a(titel: string, bild: string, minuten: number, zusatz?: string): Aufgabe {
  return { id: neueId(), titel, bild, minuten, ...(zusatz ? { zusatz } : {}) }
}

export const KIND_FARBEN = ['#2a7fb8', '#3b8f32', '#d6634a', '#7a5cc4', '#b98a00', '#c2417a']

export function standardKinder(): Kind[] {
  return [
    { id: 'k1', name: 'Kind 1', farbe: KIND_FARBEN[0] },
    { id: 'k2', name: 'Kind 2', farbe: KIND_FARBEN[1] },
  ]
}

/** Der gleiche Grundablauf für jeden Tag (jeweils mit eigenen IDs) */
function grundtag(): Tagesplan {
  return {
    aufstehen: [a('Aufstehen', 'wecker', 5), a('Toilette', 'toilette', 3)],
    morgen: [a('Zähne putzen', 'zaehne', 3), a('Anziehen', 'anziehen', 10)],
    vormittag: [],
    mittag: [a('Mittagessen', 'essen', 30)],
    nachmittag: [],
    frueh: [a('Abendessen', 'abendbrot', 30), a('Aufräumen', 'aufraeumen', 10)],
    abend: [a('Schlafanzug anziehen', 'schlafanzug', 5), a('Zähne putzen', 'zaehne', 3), a('Fernsehen', 'fernsehen', 20)],
    bett: [a('Toilette', 'toilette', 3, 'mond'), a('Lesen', 'lesen', 15)],
    schlafen: [a('Schlafen', 'schlafen', 0)],
  }
}

/** Vorbereitete Woche: jeden Tag gleich; Sa Schwimmen + Spielplatz, Mo Mittag Ergotherapie, Do Nachmittag Psychotherapie. */
export function startplan(): Plan {
  const woche = {} as Record<TagId, Tagesplan>
  for (const t of TAGE) woche[t.id] = grundtag()

  woche.sa.vormittag.push(a('Schwimmen', 'schwimmen', 0))
  woche.sa.nachmittag.push(a('Spielplatz', 'spielplatz', 60))
  woche.mo.mittag.push(a('Ergotherapie', 'puzzle', 0))
  woche.do.nachmittag.push(a('Psychotherapie', 'psychotherapie', 0))

  return {
    version: 3,
    woche,
    kinder: standardKinder(),
    termine: [],
    vorlagen: [],
    datumVorlage: {},
    zeiten: {
      aufstehen: '06:30',
      morgen: '07:00',
      vormittag: '09:00',
      mittag: '12:00',
      nachmittag: '14:00',
      frueh: '17:00',
      abend: '18:00',
      bett: '19:00',
      schlafen: '19:30',
    },
    abendEnde: '20:00',
  }
}

/** Gespeicherten Plan prüfen und fehlende Teile ergänzen. */
const DATUM = /^\d{4}-\d{2}-\d{2}$/
const UHR = /^\d{1,2}:\d{2}$/

function aufgabeNormalisieren(x: Record<string, unknown>): Aufgabe | null {
  if (!x || typeof x !== 'object' || typeof x.titel !== 'string') return null
  const fuer = Array.isArray(x.fuer) ? (x.fuer.filter((k) => k === 'k1' || k === 'k2') as KindId[]) : []
  const modus = x.fotoModus === 'foto' || x.fotoModus === 'wechsel' ? x.fotoModus : undefined
  return {
    id: typeof x.id === 'string' && x.id ? x.id : neueId(),
    titel: x.titel,
    bild: typeof x.bild === 'string' && x.bild ? x.bild : 'stern',
    minuten: Number.isFinite(x.minuten) ? Math.max(0, Math.min(600, Math.round(x.minuten as number))) : 0,
    ...(typeof x.zusatz === 'string' && x.zusatz ? { zusatz: x.zusatz } : {}),
    ...(typeof x.uhrzeit === 'string' && UHR.test(x.uhrzeit) ? { uhrzeit: x.uhrzeit } : {}),
    ...(fuer.length === 1 ? { fuer } : {}),
    ...(x.countdown === true ? { countdown: true } : {}),
    ...(typeof x.foto === 'string' && x.foto.startsWith('foto:') ? { foto: x.foto } : {}),
    ...(modus ? { fotoModus: modus } : {}),
    ...(Number.isFinite(x.wechselSek) ? { wechselSek: Math.max(2, Math.min(60, Math.round(x.wechselSek as number))) } : {}),
  }
}

function tagNormalisieren(roh: unknown): Tagesplan {
  const neu = leererTag()
  const tag = roh as Record<string, unknown> | undefined
  for (const ab of ABSCHNITTE) {
    const liste = tag?.[ab.id]
    if (Array.isArray(liste)) neu[ab.id] = liste.map(aufgabeNormalisieren).filter((x): x is Aufgabe => !!x)
  }
  return neu
}

/** Gespeicherten Plan prüfen und fehlende Teile ergänzen. */
export function planNormalisieren(roh: unknown): Plan {
  const basis = startplan()
  if (!roh || typeof roh !== 'object') return basis
  const p = roh as Partial<Plan>
  const woche = {} as Record<TagId, Tagesplan>
  for (const t of TAGE) woche[t.id] = tagNormalisieren((p.woche as Record<string, unknown> | undefined)?.[t.id])
  const zeiten = { ...basis.zeiten }
  for (const ab of ABSCHNITTE) {
    const z = p.zeiten?.[ab.id]
    if (typeof z === 'string' && UHR.test(z)) zeiten[ab.id] = z
  }
  const abendEnde = typeof p.abendEnde === 'string' && UHR.test(p.abendEnde) ? p.abendEnde : basis.abendEnde
  const kinder = standardKinder().map((k) => {
    const g = Array.isArray(p.kinder) ? p.kinder.find((x) => x && x.id === k.id) : undefined
    return {
      id: k.id,
      name: typeof g?.name === 'string' && g.name.trim() ? g.name.trim().slice(0, 30) : k.name,
      farbe: typeof g?.farbe === 'string' && /^#[0-9a-f]{6}$/i.test(g.farbe) ? g.farbe : k.farbe,
      ...(typeof g?.geburtstag === 'string' && DATUM.test(g.geburtstag) ? { geburtstag: g.geburtstag } : {}),
    }
  })
  const termine: Termin[] = Array.isArray(p.termine)
    ? p.termine
        .map((t) => {
          const a = aufgabeNormalisieren(t as unknown as Record<string, unknown>)
          if (!a || typeof t.datum !== 'string' || !DATUM.test(t.datum)) return null
          const abschnitt = ABSCHNITTE.some((x) => x.id === t.abschnitt) ? t.abschnitt : 'vormittag'
          return { ...a, datum: t.datum, abschnitt }
        })
        .filter((x): x is Termin => !!x)
    : []
  const vorlagen = Array.isArray(p.vorlagen)
    ? p.vorlagen
        .filter((v) => v && typeof v.name === 'string')
        .map((v) => ({ id: typeof v.id === 'string' ? v.id : neueId(), name: v.name.slice(0, 40), tag: tagNormalisieren(v.tag) }))
    : []
  const datumVorlage: Record<string, string> = {}
  if (p.datumVorlage && typeof p.datumVorlage === 'object')
    for (const [d, id] of Object.entries(p.datumVorlage))
      if (DATUM.test(d) && vorlagen.some((v) => v.id === id)) datumVorlage[d] = id
  return { version: 3, woche, zeiten, abendEnde, kinder, termine, vorlagen, datumVorlage }
}
