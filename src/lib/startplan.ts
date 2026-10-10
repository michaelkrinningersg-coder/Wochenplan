import { t } from './i18n.svelte'
import { STANDARD_ABSCHNITTE, TAGE } from './konstanten'
import type { AbschnittId, Aufgabe, GeteilteOptionen, Kind, KindId, Plan, TagId, Tagesplan, Termin } from './typen'

export function neueId(): string {
  try {
    return crypto.randomUUID().slice(0, 8)
  } catch {
    return Math.random().toString(36).slice(2, 10)
  }
}

export function leererTag(ids: string[] = STANDARD_ABSCHNITTE): Tagesplan {
  const t: Tagesplan = {}
  for (const id of ids) t[id] = []
  return t
}

function a(titel: string, bild: string, minuten: number, zusatz?: string): Aufgabe {
  // Titel in der aktuellen Sprache festschreiben (nur für neu erzeugte Pläne)
  return { id: neueId(), titel: t(titel), bild, minuten, ...(zusatz ? { zusatz } : {}) }
}

export const KIND_FARBEN = ['#2a7fb8', '#3b8f32', '#d6634a', '#7a5cc4', '#b98a00', '#c2417a']

export function standardKinder(): Kind[] {
  return [{ id: 'k1', name: 'Kind 1', farbe: KIND_FARBEN[0] }]
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
  woche.di.nachmittag.push(a('Kinderturnen', 'turnen', 0))
  woche.mi.nachmittag.push(a('Spielplatz', 'spielplatz', 0))
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
  // Nur noch ein Kind: Zuordnung „für wen“ entfällt
  const fuer: KindId[] = []
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

function tagNormalisieren(roh: unknown, ids: string[]): Tagesplan {
  const neu = leererTag(ids)
  const tag = roh as Record<string, unknown> | undefined
  for (const id of ids) {
    const liste = tag?.[id]
    if (Array.isArray(liste)) neu[id] = liste.map(aufgabeNormalisieren).filter((x): x is Aufgabe => !!x)
  }
  return neu
}

/** Eigene Reihenfolge der Tageszeiten prüfen; ohne gültige Liste gelten die Standard-Tageszeiten */
function listeNormalisieren(roh: unknown): string[] | undefined {
  if (!Array.isArray(roh)) return undefined
  const ids = [...new Set(roh.filter((x): x is string => typeof x === 'string' && /^[a-z0-9-]{2,24}$/i.test(x)))].slice(0, 30)
  if (!ids.length) return undefined
  return ids.join() === STANDARD_ABSCHNITTE.join() ? undefined : ids
}

/** Gespeicherten Plan prüfen und fehlende Teile ergänzen. */
export function planNormalisieren(roh: unknown): Plan {
  const basis = startplan()
  if (!roh || typeof roh !== 'object') return basis
  const p = roh as Partial<Plan>
  const liste = listeNormalisieren(p.abschnittListe)
  const ids = liste ?? STANDARD_ABSCHNITTE
  const woche = {} as Record<TagId, Tagesplan>
  for (const t of TAGE) woche[t.id] = tagNormalisieren((p.woche as Record<string, unknown> | undefined)?.[t.id], ids)
  const zeiten: Record<string, string> = {}
  ids.forEach((id, i) => {
    const z = p.zeiten?.[id]
    zeiten[id] = typeof z === 'string' && UHR.test(z) ? z : (basis.zeiten[id] ?? (i > 0 ? zeiten[ids[i - 1]] : '06:30'))
  })
  const abendEnde = typeof p.abendEnde === 'string' && UHR.test(p.abendEnde) ? p.abendEnde : basis.abendEnde
  const kinder = standardKinder().map((k) => {
    const g = Array.isArray(p.kinder) ? p.kinder.find((x) => x && x.id === k.id) : undefined
    return { id: k.id, name: k.name, farbe: typeof g?.farbe === 'string' && /^#[0-9a-f]{6}$/i.test(g.farbe) ? g.farbe : k.farbe }
  })
  const termine: Termin[] = Array.isArray(p.termine)
    ? p.termine
        .map((t) => {
          const a = aufgabeNormalisieren(t as unknown as Record<string, unknown>)
          if (!a || typeof t.datum !== 'string' || !DATUM.test(t.datum)) return null
          const abschnitt = ids.includes(t.abschnitt) ? t.abschnitt : ids.includes('vormittag') ? 'vormittag' : ids[0]
          return { ...a, datum: t.datum, abschnitt }
        })
        .filter((x): x is Termin => !!x)
    : []
  const vorlagen = Array.isArray(p.vorlagen)
    ? p.vorlagen
        .filter((v) => v && typeof v.name === 'string')
        .map((v) => ({ id: typeof v.id === 'string' ? v.id : neueId(), name: v.name.slice(0, 40), tag: tagNormalisieren(v.tag, ids) }))
    : []
  const datumVorlage: Record<string, string> = {}
  if (p.datumVorlage && typeof p.datumVorlage === 'object')
    for (const [d, id] of Object.entries(p.datumVorlage))
      if (DATUM.test(d) && vorlagen.some((v) => v.id === id)) datumVorlage[d] = id
  const abschnitte: Plan['abschnitte'] = {}
  if (p.abschnitte && typeof p.abschnitte === 'object')
    for (const id of ids) {
      const x = (p.abschnitte as Record<string, { name?: unknown; bild?: unknown; nacht?: unknown; farbe?: unknown }>)[id]
      if (!x || typeof x !== 'object') continue
      const name = typeof x.name === 'string' && x.name.trim() ? x.name.trim().slice(0, 30) : undefined
      const bild = typeof x.bild === 'string' && x.bild ? x.bild : undefined
      const nacht = typeof x.nacht === 'boolean' ? x.nacht : undefined
      const farbe = typeof x.farbe === 'string' && STANDARD_ABSCHNITTE.includes(x.farbe) ? x.farbe : undefined
      if (name || bild || nacht !== undefined || farbe)
        abschnitte[id] = { ...(name ? { name } : {}), ...(bild ? { bild } : {}), ...(nacht !== undefined ? { nacht } : {}), ...(farbe ? { farbe } : {}) }
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
    ...(liste ? { abschnittListe: liste } : {}),
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
  if (o.kartenstil === 'junge' || o.kartenstil === 'maedchen') r.kartenstil = o.kartenstil
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
  if (typeof o.ruheCountdown === 'boolean') r.ruheCountdown = o.ruheCountdown
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
  if (vonStand < 4) for (const tp of Object.values(plan.woche)) for (const l of Object.values(tp)) for (const x of l) x.minuten = 0
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
  for (const tp of tage) for (const l of Object.values(tp)) l.forEach(anpassen)
  plan.termine.forEach(anpassen)
}
