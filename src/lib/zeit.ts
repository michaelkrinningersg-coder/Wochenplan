import { ABSCHNITTE } from './konstanten'
import type { AbschnittId, Plan, TagId } from './typen'

const TAG_REIHENFOLGE: TagId[] = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa']

export function heuteTag(d = new Date()): TagId {
  return TAG_REIHENFOLGE[d.getDay()]
}

export function datumKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const t = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${t}`
}

export function minutenVon(hhmm: string): number {
  const [h, m] = (hhmm ?? '').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function minutenJetzt(d = new Date()): number {
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60
}

/** Beginn und Ende eines Abschnitts in Minuten seit Mitternacht */
export function abschnittSpanne(plan: Plan, id: AbschnittId): [number, number] {
  const i = ABSCHNITTE.findIndex((a) => a.id === id)
  const start = minutenVon(plan.zeiten[id])
  const naechster = ABSCHNITTE[i + 1]
  // Der letzte Abschnitt (Schlafen) dauert bis zum Aufstehen am nächsten Tag
  const ende = naechster ? minutenVon(plan.zeiten[naechster.id]) : 24 * 60
  return [start, Math.max(start + 1, ende)]
}

export function spanneText(plan: Plan, id: AbschnittId): string {
  const [s, e] = abschnittSpanne(plan, id)
  return e >= 24 * 60 ? `ab ${uhr(s)}` : `${uhr(s)}–${uhr(e)}`
}

export type TagesPhase =
  | { art: 'vorher' }
  | { art: 'nachher' }
  | { art: 'abschnitt'; id: AbschnittId; anteil: number }

/** In welchem Abschnitt sind wir gerade (bezogen auf die Uhrzeit)? */
export function tagesPhase(plan: Plan, d = new Date()): TagesPhase {
  const jetzt = minutenJetzt(d)
  const [ersterStart] = abschnittSpanne(plan, ABSCHNITTE[0].id)
  const [, letztesEnde] = abschnittSpanne(plan, ABSCHNITTE[ABSCHNITTE.length - 1].id)
  if (jetzt < ersterStart) return { art: 'vorher' }
  if (jetzt >= letztesEnde) return { art: 'nachher' }
  for (const a of ABSCHNITTE) {
    const [s, e] = abschnittSpanne(plan, a.id)
    if (jetzt >= s && jetzt < e) return { art: 'abschnitt', id: a.id, anteil: (jetzt - s) / (e - s) }
  }
  return { art: 'nachher' }
}

/** Minuten als Uhrzeit, z. B. 570 → "9:30", 540 → "9" */
export function uhr(min: number, immerMinuten = false): string {
  const h = Math.floor(min / 60) % 24
  const m = Math.round(min % 60)
  if (m === 0 && !immerMinuten) return String(h)
  return `${h}:${String(m).padStart(2, '0')}`
}

export function uhrzeitJetzt(d = new Date()): string {
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Restzeit als "2:05" (Minuten:Sekunden) bzw. "1:05:00" */
export function dauerText(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sek = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sek).padStart(2, '0')}`
  return `${m}:${String(sek).padStart(2, '0')}`
}

/** "in 5 Min", "in 1 Std 10 Min" */
export function inText(min: number): string {
  const m = Math.max(0, Math.ceil(min))
  if (m < 1) return 'gleich'
  if (m < 60) return `in ${m} Min`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r ? `in ${h} Std ${r} Min` : `in ${h} Std`
}

export function datumLang(d = new Date()): string {
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })
}

const TAG_INDEX: Record<TagId, number> = { mo: 0, di: 1, mi: 2, do: 3, fr: 4, sa: 5, so: 6 }

/** Datum des Wochentags in der laufenden Woche (Montag bis Sonntag) */
export function datumFuerTag(tag: TagId, bezug = new Date()): Date {
  const d = new Date(bezug.getFullYear(), bezug.getMonth(), bezug.getDate())
  const heute = (d.getDay() + 6) % 7
  d.setDate(d.getDate() + TAG_INDEX[tag] - heute)
  return d
}

export function ausKey(key: string): Date {
  const [j, m, t] = key.split('-').map(Number)
  return new Date(j, (m || 1) - 1, t || 1)
}

/** Ganze Tage von heute bis zum Datum (0 = heute) */
export function tageBis(ziel: Date, bezug = new Date()): number {
  const a = new Date(bezug.getFullYear(), bezug.getMonth(), bezug.getDate()).getTime()
  const b = new Date(ziel.getFullYear(), ziel.getMonth(), ziel.getDate()).getTime()
  return Math.round((b - a) / 86_400_000)
}

export function alterAm(geburtstag: string, d = new Date()): number {
  const g = ausKey(geburtstag)
  let alter = d.getFullYear() - g.getFullYear()
  if (d.getMonth() < g.getMonth() || (d.getMonth() === g.getMonth() && d.getDate() < g.getDate())) alter--
  return alter
}

/** Nächster Geburtstag (heute eingeschlossen) */
export function naechsterGeburtstag(geburtstag: string, bezug = new Date()): Date {
  const g = ausKey(geburtstag)
  const d = new Date(bezug.getFullYear(), g.getMonth(), g.getDate())
  if (tageBis(d, bezug) < 0) d.setFullYear(d.getFullYear() + 1)
  return d
}

export const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
