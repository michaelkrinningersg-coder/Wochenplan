import { ABSCHNITTE, TAGE } from './konstanten'
import type { AbschnittId, Aufgabe, GeteilteOptionen, Kind, KindId, Plan, TagId, Tagesplan, Termin } from './typen'

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

/** Werktag (Mo–Fr): Kita bis zum Nachmittag, danach Spielzeit */
function werktag(): Tagesplan {
  return {
    aufstehen: [a('Aufstehen', 'wecker', 0), a('Toilette', 'toilette', 0)],
    morgen: [a('Frühstück', 'fruehstueck', 0), a('Zähne putzen', 'zaehne', 0), a('Anziehen', 'anziehen', 0)],
    vormittag: [a('Kita', 'kita', 0)],
    mittag: [],
    nachmittag: [a('Spielzeit', 'spielen', 0)],
    frueh: [a('Hände waschen', 'waschen', 0), a('Abendessen', 'abendbrot', 0), a('Spielzeit', 'spielen', 0)],
    abend: [a('Aufräumen', 'aufraeumen', 0), a('Schlafanzug anziehen', 'schlafanzug', 0), a('Zähne putzen', 'zaehne', 0)],
    bett: [a('Toilette', 'toilette', 0, 'mond'), a('Lesen', 'lesen', 0)],
    schlafen: [a('Schlafen', 'schlafen', 0)],
  }
}

/** Wochenende: Sa mit Schwimmen am Vormittag, So mit Spielplatz am Vormittag */
function wochenende(vormittag: Aufgabe): Tagesplan {
  return {
    aufstehen: [a('Aufstehen', 'wecker', 0), a('Toilette', 'toilette', 0)],
    morgen: [a('Frühstück', 'fruehstueck', 0), a('Zähne putzen', 'zaehne', 0), a('Anziehen', 'anziehen', 0)],
    vormittag: [vormittag],
    mittag: [a('Mittagessen', 'essen', 0), a('Mittagsruhe', 'mittagsruhe', 0)],
    nachmittag: [a('Spielplatz', 'spielplatz', 0)],
    frueh: [a('Hände waschen', 'waschen', 0), a('Abendessen', 'abendbrot', 0), a('Spielzeit', 'spielen', 0)],
    abend: [a('Aufräumen', 'aufraeumen', 0), a('Schlafanzug anziehen', 'schlafanzug', 0), a('Zähne putzen', 'zaehne', 0), a('Fernsehen', 'fernsehen', 0)],
    bett: [a('Toilette', 'toilette', 0, 'mond'), a('Lesen', 'lesen', 0)],
    schlafen: [a('Schlafen', 'schlafen', 0)],
  }
}

/** Standardwoche */
export function standardWoche(): Record<TagId, Tagesplan> {
  const woche = {} as Record<TagId, Tagesplan>
  for (const t of TAGE) woche[t.id] = werktag()
  woche.mo.nachmittag.push(a('Ergotherapie', 'ergotherapie', 0))
  woche.di.nachmittag.push(a('Kinderturnen', 'turnen', 0))
  woche.mi.nachmittag.push(a('Spielplatz', 'spielplatz', 0))
  woche.do.nachmittag.push(a('Fr. Gardner', 'psychotherapie', 0))
  woche.fr.nachmittag.push(a('Spielplatz', 'spielplatz', 0))
  woche.fr.abend.push(a('Fernsehen', 'fernsehen', 0))
  woche.sa = wochenende(a('Schwimmen', 'schwimmen', 0))
  // Samstag: alleine lesen statt Spielzeit nach dem Abendessen
  woche.sa.frueh = woche.sa.frueh.map((x) => (x.bild === 'spielen' ? a('Alleine Lesezeit', 'lesezeit', 0) : x))
  woche.so = wochenende(a('Spielplatz', 'spielplatz', 0))
  return woche
}

export function startplan(): Plan {
  const woche = standardWoche()

  return {
    version: 3,
    stand: STAND,
    abschnitte: {},
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
    ...(typeof x.bis === 'string' && UHR.test(x.bis) ? { bis: x.bis } : {}),
    ...(fuer.length === 1 ? { fuer } : {}),
    ...(x.countdown === true ? { countdown: true } : {}),
    ...(x.sternenregen === true ? { sternenregen: true } : {}),
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
  const abschnitte: Plan['abschnitte'] = {}
  if (p.abschnitte && typeof p.abschnitte === 'object')
    for (const ab of ABSCHNITTE) {
      const x = (p.abschnitte as Record<string, { name?: unknown; bild?: unknown }>)[ab.id]
      if (!x || typeof x !== 'object') continue
      const name = typeof x.name === 'string' && x.name.trim() ? x.name.trim().slice(0, 30) : undefined
      const bild = typeof x.bild === 'string' && x.bild ? x.bild : undefined
      if (name || bild) abschnitte[ab.id] = { ...(name ? { name } : {}), ...(bild ? { bild } : {}) }
    }
  const optionen = optionenNormalisieren(p.optionen)
  const plan: Plan = {
    version: 3,
    stand: STAND,
    woche,
    zeiten,
    abendEnde,
    kinder,
    termine,
    vorlagen,
    datumVorlage,
    abschnitte,
    ...(optionen ? { optionen } : {}),
    ...(Array.isArray(p.ruhebilder) ? { ruhebilder: p.ruhebilder.filter((x): x is string => typeof x === 'string' && /^[a-z0-9-]{4,40}$/i.test(x)).slice(0, 60) } : {}),
  }
  const vonStand = typeof p.stand === 'number' ? p.stand : 1
  if (vonStand < STAND) umstellen(plan, vonStand)
  return plan
}

function optionenNormalisieren(roh: unknown): GeteilteOptionen | undefined {
  if (!roh || typeof roh !== 'object') return undefined
  const o = roh as Record<string, unknown>
  const r: GeteilteOptionen = {}
  if (o.thema === 'auto' || o.thema === 'tag' || o.thema === 'nacht') r.thema = o.thema
  if (typeof o.ton === 'boolean') r.ton = o.ton
  if (o.timerArt === 'ampel' || o.timerArt === 'sanduhr') r.timerArt = o.timerArt
  if (typeof o.vorlesen === 'boolean') r.vorlesen = o.vorlesen
  if (typeof o.tempo === 'number' && o.tempo >= 0.5 && o.tempo <= 1.5) r.tempo = o.tempo
  if (typeof o.zeitAnsagen === 'boolean') r.zeitAnsagen = o.zeitAnsagen
  if (o.sternenregen === 'alle' || o.sternenregen === 'auswahl' || o.sternenregen === 'aus') r.sternenregen = o.sternenregen
  if (o.uhrArt === 'digital' || o.uhrArt === 'analog') r.uhrArt = o.uhrArt
  if (o.ruhe === 'an' || o.ruhe === 'aus') r.ruhe = o.ruhe
  if (typeof o.ruheWarten === 'number' && o.ruheWarten >= 1 && o.ruheWarten <= 60) r.ruheWarten = o.ruheWarten
  if (o.ruheArt === 'jahreszeit' || o.ruheArt === 'fotos' || o.ruheArt === 'schwarz') r.ruheArt = o.ruheArt
  if (typeof o.ruheNacht === 'boolean') r.ruheNacht = o.ruheNacht
  if (typeof o.wetterOrt === 'string' && /^[^|]{1,60}\|-?\d+(\.\d+)?\|-?\d+(\.\d+)?$/.test(o.wetterOrt)) r.wetterOrt = o.wetterOrt
  if (typeof o.ruheNamen === 'boolean') r.ruheNamen = o.ruheNamen
  if (typeof o.ruheWechsel === 'number' && o.ruheWechsel >= 5 && o.ruheWechsel <= 600) r.ruheWechsel = o.ruheWechsel
  return Object.keys(r).length ? r : undefined
}

/** Stand der einmaligen Umstellungen. Erhöhen, wenn neue Regeln in UMZUG dazukommen. */
const STAND = 6

/** Neue Bildkarten für vorhandene Aufgaben (Titel + altes Bild → neues Bild, ggf. neuer Titel) */
const UMZUG: { titel: string; alt: string; neu: string; neuerTitel?: string }[] = [
  { titel: 'Ergotherapie', alt: 'puzzle', neu: 'ergotherapie' },
  { titel: 'Mittagsruhe', alt: 'bett', neu: 'mittagsruhe' },
  { titel: 'Kita', alt: 'schule', neu: 'kita' },
  { titel: 'Abholen', alt: 'zuhause', neu: 'abholen' },
  { titel: 'Vorschulheft', alt: 'buntstift', neu: 'vorschule', neuerTitel: 'Vorschulaufgaben' },
  { titel: 'Psychotherapie', alt: 'psychotherapie', neu: 'psychotherapie', neuerTitel: 'Fr. Gardner' },
]

function umstellen(plan: Plan, vonStand: number) {
  // Stand 3: neue Standardwoche (gewünschter Wochenablauf); Termine, Abläufe, Kinder und Zeiten bleiben
  if (vonStand < 3) plan.woche = standardWoche()
  // Stand 4: Timer nur noch nach Auswahl – keine vorgegebenen Minuten in der Woche
  if (vonStand < 4) for (const tp of Object.values(plan.woche)) for (const ab of ABSCHNITTE) for (const x of tp[ab.id]) x.minuten = 0
  // Stand 5: vor dem Abendessen immer Hände waschen
  if (vonStand < 5)
    for (const tp of Object.values(plan.woche)) {
      const i = tp.frueh.findIndex((x) => x.titel === 'Abendessen')
      if (i < 0 || tp.frueh[i - 1]?.bild === 'waschen') continue
      // am Wochenende stand es bisher am Ende des Nachmittags – dorthin nicht doppelt
      const letzte = tp.nachmittag[tp.nachmittag.length - 1]
      if (letzte?.bild === 'waschen') tp.nachmittag.pop()
      tp.frueh.splice(i, 0, { id: neueId(), titel: 'Hände waschen', bild: 'waschen', minuten: 0 })
    }
  // Stand 6: Aufräumen in die Abendzeit (vorne), Samstag alleine lesen statt Spielzeit
  if (vonStand < 6) {
    for (const tp of Object.values(plan.woche)) {
      const i = tp.frueh.findIndex((x) => x.titel === 'Aufräumen')
      if (i >= 0) tp.abend.unshift(...tp.frueh.splice(i, 1))
    }
    const sa = plan.woche.sa.frueh
    const s = sa.findIndex((x) => x.titel === 'Spielzeit')
    if (s >= 0) sa[s] = { id: neueId(), titel: 'Alleine Lesezeit', bild: 'lesezeit', minuten: 0 }
  }
  const anpassen = (x: Aufgabe) => {
    const r = UMZUG.find((u) => u.titel === x.titel && u.alt === x.bild)
    if (!r) return
    x.bild = r.neu
    if (r.neuerTitel) x.titel = r.neuerTitel
  }
  const tage = [...Object.values(plan.woche), ...plan.vorlagen.map((v) => v.tag)]
  for (const tp of tage) for (const ab of ABSCHNITTE) tp[ab.id].forEach(anpassen)
  plan.termine.forEach(anpassen)
}
