// Suche über alle Bildkategorien und Vorlagen (Groß-/Kleinschreibung und Umlaute egal)
import { ICON_LIST, type IconInfo } from './iconliste'
import { VORLAGEN, type Vorlage } from './vorlagen'

export function normal(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9 ]/g, ' ')
    .trim()
}

function passt(text: string, worte: string[]): boolean {
  const n = normal(text)
  return worte.every((w) => n.includes(w))
}

/** Bilder, deren Name, Kennung oder passende Vorlage den Suchtext enthält */
export function bilderSuchen(text: string): IconInfo[] {
  const worte = normal(text).split(/\s+/).filter(Boolean)
  if (!worte.length) return []
  const treffer = new Map<string, IconInfo>()
  for (const i of ICON_LIST) if (passt(i.name + ' ' + i.id + ' ' + i.group, worte) && !treffer.has(i.id)) treffer.set(i.id, i)
  for (const v of VORLAGEN)
    if (passt(v.titel, worte) && !treffer.has(v.bild)) {
      const info = ICON_LIST.find((i) => i.id === v.bild)
      treffer.set(v.bild, info ?? { id: v.bild, name: v.titel, group: '' })
    }
  return [...treffer.values()]
}

export function vorlagenSuchen(text: string, liste: Vorlage[] = VORLAGEN): Vorlage[] {
  const worte = normal(text).split(/\s+/).filter(Boolean)
  if (!worte.length) return liste
  return liste.filter((v) => passt(v.titel + ' ' + v.bild, worte))
}
