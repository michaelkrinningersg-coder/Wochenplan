import type { AbschnittId, TagId } from './typen'

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
export const ABSCHNITTE: { id: AbschnittId; name: string; bild: string; nacht: boolean }[] = [
  { id: 'aufstehen', name: 'Aufstehen', bild: 'wecker', nacht: false },
  { id: 'morgen', name: 'Morgen', bild: '_sonnenaufgang', nacht: false },
  { id: 'vormittag', name: 'Vormittag', bild: '_sonne', nacht: false },
  { id: 'mittag', name: 'Mittag', bild: '_sonnengesicht', nacht: false },
  { id: 'nachmittag', name: 'Nachmittag', bild: '_sonnewolke', nacht: false },
  { id: 'frueh', name: 'Früher Abend', bild: '_sonnenuntergang', nacht: false },
  { id: 'abend', name: 'Abendzeit', bild: '_daemmerung', nacht: true },
  { id: 'bett', name: 'Bettgehzeit', bild: '_nacht', nacht: true },
  { id: 'schlafen', name: 'Schlafen', bild: '_sternennacht', nacht: true },
]

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
