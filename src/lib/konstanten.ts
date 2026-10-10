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

// Eigene Namen/Bilder aus dem Plan (wird vom Speicher gesetzt, damit hier kein Kreisbezug entsteht)
let anpassung: () => Partial<Record<AbschnittId, AbschnittAnpassung>> | undefined = () => undefined
export function abschnittAnpassungVon(quelle: typeof anpassung) {
  anpassung = quelle
}

export interface AbschnittDef {
  id: AbschnittId
  nacht: boolean
  /** Name/Bild ohne eigene Anpassung */
  grundName: string
  grundBild: string
  readonly name: string
  readonly bild: string
}

export const ABSCHNITTE: AbschnittDef[] = GRUND.map((g) => ({
  id: g.id,
  nacht: g.nacht,
  grundName: g.name,
  grundBild: g.bild,
  get name() {
    return anpassung()?.[g.id]?.name?.trim() || g.name
  },
  get bild() {
    return anpassung()?.[g.id]?.bild || g.bild
  },
}))

export const ZUSAETZE: { id: string; name: string; bild: string }[] = [
  { id: 'mond', name: 'Mond', bild: 'mond' },
  { id: 'sonne', name: 'Sonne', bild: '_sonne' },
  { id: 'stern', name: 'Stern', bild: 'stern' },
  { id: 'apfel', name: 'Apfel', bild: 'apfel' },
]

export function tagName(id: TagId): string {
  return TAGE.find((t) => t.id === id)?.lang ?? id
}

export function abschnittInfo(id: AbschnittId) {
  return ABSCHNITTE.find((a) => a.id === id)!
}
