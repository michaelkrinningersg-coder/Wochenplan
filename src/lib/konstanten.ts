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

export const ABSCHNITTE: { id: AbschnittId; name: string; bild: string }[] = [
  { id: 'morgen', name: 'Morgen', bild: '_sonnenaufgang' },
  { id: 'vormittag', name: 'Vormittag', bild: '_sonne' },
  { id: 'mittag', name: 'Mittag', bild: '_sonnengesicht' },
  { id: 'nachmittag', name: 'Nachmittag', bild: '_sonnewolke' },
  { id: 'abend', name: 'Abend', bild: '_sonnenuntergang' },
  { id: 'bett', name: 'Bettzeit', bild: '_nacht' },
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
