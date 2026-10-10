import type { AbschnittAnpassung, AbschnittId, TagId } from './typen'

export const TAGE: { id: TagId; kurz: string; lang: string }[] = [
  { id: 'mo', kurz: 'Mo', lang: 'Montag' },
  { id: 'di', kurz: 'Di', lang: 'Dienstag' },
  { id: 'mi', kurz: 'Mi', lang: 'Mittwoch' },
  { id: 'do', kurz: 'Do', lang: 'Donnerstag' },
  { id: 'fr', kurz: 'Fr', lang: 'Freitag' },
  { id: 'sa', kurz: 'Sa', lang: 'Samstag' },
  { id: 'so', kurz: 'So', lang: 'Sonntag' },
]

/** Gliederung des Tages. „nacht“ = dunkle Darstellung und Mond statt Sonne. */
const GRUND: { id: AbschnittId; name: string; bild: string; nacht: boolean }[] = [
  { id: 'aufstehen', name: 'Aufstehen', bild: '_wecker', nacht: false },
  { id: 'morgen', name: 'Morgen', bild: '_sonnenaufgang', nacht: false },
  { id: 'vormittag', name: 'Vormittag', bild: '_sonne', nacht: false },
  { id: 'mittag', name: 'Mittag', bild: '_sonnengesicht', nacht: false },
  { id: 'nachmittag', name: 'Nachmittag', bild: '_sonnewolke', nacht: false },
  { id: 'frueh', name: 'Früher Abend', bild: '_sonnenuntergang', nacht: false },
  { id: 'abend', name: 'Abendzeit', bild: '_daemmerung', nacht: true },
  { id: 'bett', name: 'Bettgehzeit', bild: '_nacht', nacht: true },
  { id: 'schlafen', name: 'Schlafen', bild: '_sternennacht', nacht: true },
]

// Eigene Namen/Bilder und die Reihenfolge der Tageszeiten aus dem Plan (wird vom Speicher gesetzt, damit hier kein Kreisbezug entsteht)
let anpassung: () => Partial<Record<AbschnittId, AbschnittAnpassung>> | undefined = () => undefined
let listeVon: () => AbschnittId[] | undefined = () => undefined
export function abschnittAnpassungVon(quelle: typeof anpassung, liste?: typeof listeVon) {
  anpassung = quelle
  if (liste) listeVon = liste
}

/** Kennungen der neun Standard-Tageszeiten in Tagesreihenfolge */
export const STANDARD_ABSCHNITTE: AbschnittId[] = GRUND.map((g) => g.id)

export interface AbschnittDef {
  id: AbschnittId
  /** Name/Bild ohne eigene Anpassung */
  grundName: string
  grundBild: string
  grundNacht: boolean
  grundFarbe: string
  readonly nacht: boolean
  readonly name: string
  readonly bild: string
  /** Farbfamilie (Kennung einer Standard-Tageszeit) für die Darstellung */
  readonly farbe: string
}

const defs = new Map<AbschnittId, AbschnittDef>()
function defVon(id: AbschnittId): AbschnittDef {
  let d = defs.get(id)
  if (d) return d
  const g = GRUND.find((x) => x.id === id)
  d = {
    id,
    grundName: g?.name ?? 'Neue Tageszeit',
    grundBild: g?.bild ?? '_sonne',
    grundNacht: g?.nacht ?? false,
    grundFarbe: g ? g.id : 'vormittag',
    get nacht() {
      return anpassung()?.[id]?.nacht ?? (g?.nacht ?? false)
    },
    get name() {
      return anpassung()?.[id]?.name?.trim() || (g?.name ?? 'Neue Tageszeit')
    },
    get bild() {
      return anpassung()?.[id]?.bild || (g?.bild ?? '_sonne')
    },
    get farbe() {
      return anpassung()?.[id]?.farbe || (g ? g.id : 'vormittag')
    },
  }
  defs.set(id, d)
  return d
}

function aktuelle(): AbschnittDef[] {
  return (listeVon() ?? STANDARD_ABSCHNITTE).map(defVon)
}

/** Die Tageszeiten des Plans in Reihenfolge (lesen wie ein Array; ändert sich mit dem Plan) */
export const ABSCHNITTE: AbschnittDef[] = new Proxy([] as AbschnittDef[], {
  get: (_t, p) => Reflect.get(aktuelle(), p),
  has: (_t, p) => Reflect.has(aktuelle(), p),
  ownKeys: () => Reflect.ownKeys(aktuelle()),
  getOwnPropertyDescriptor: (_t, p) => {
    const d = Reflect.getOwnPropertyDescriptor(aktuelle(), p)
    return d ? { ...d, configurable: true } : d
  },
})

/** Farbfamilie für data-seg (eigene Tageszeiten benutzen die Farbe einer Standard-Tageszeit) */
export function segVon(id: string): string {
  return GRUND.some((g) => g.id === id) && !anpassung()?.[id]?.farbe ? id : defVon(id).farbe
}

export const ZUSAETZE: { id: string; name: string; bild: string }[] = [
  { id: 'mond', name: 'Mond', bild: 'mond' },
  { id: 'sonne', name: 'Sonne', bild: '_sonne' },
  { id: 'stern', name: 'Stern', bild: 'stern' },
  { id: 'apfel', name: 'Apfel', bild: 'apfel' },
]

export function tagName(id: TagId): string {
  return TAGE.find((t) => t.id === id)?.lang ?? id
}

export function abschnittInfo(id: AbschnittId): AbschnittDef {
  return defVon(id)
}
