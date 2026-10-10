// Oberflächensprache (pro Gerät, nicht Teil des Plans). Schlüssel sind die deutschen Originaltexte:
//   t('Zähne putzen')                       → "Brush teeth" (en)
//   t('Noch {n} Minuten', { n: 5 })         → "5 minutes left" (en), Platzhalter in {geschweiften Klammern}
// Fehlt eine Übersetzung, erscheint der deutsche Text. Wörterbücher: src/lib/i18n/woerter-*.ts
export type Sprache = 'de' | 'en' | 'es' | 'fr'
export const SPRACHEN: { id: Sprache; name: string; lokale: string }[] = [
  { id: 'de', name: 'Deutsch', lokale: 'de-DE' },
  { id: 'en', name: 'English', lokale: 'en-GB' },
  { id: 'es', name: 'Español', lokale: 'es-ES' },
  { id: 'fr', name: 'Français', lokale: 'fr-FR' },
]

const KEY = 'wochenplan.sprache.v1'

function start(): Sprache {
  try {
    const s = localStorage.getItem(KEY)
    if (s && SPRACHEN.some((x) => x.id === s)) return s as Sprache
  } catch {
    /* gesperrt */
  }
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'de').slice(0, 2).toLowerCase()
  return (SPRACHEN.find((x) => x.id === nav)?.id ?? (nav === 'de' ? 'de' : 'en')) as Sprache
}

export const spr = $state({ aktuell: start() })

export function spracheSetzen(s: Sprache) {
  spr.aktuell = s
  try {
    localStorage.setItem(KEY, s)
  } catch {
    /* gesperrt */
  }
  if (typeof document !== 'undefined') document.documentElement.lang = s
}
if (typeof document !== 'undefined') document.documentElement.lang = spr.aktuell

type Woerter = Record<string, string>
const WOERTER: Record<Exclude<Sprache, 'de'>, Woerter> = { en: {}, es: {}, fr: {} }
const dateien = import.meta.glob('./i18n/woerter-*.ts', { eager: true }) as Record<string, { W: Partial<Record<Exclude<Sprache, 'de'>, Woerter>> }>
for (const m of Object.values(dateien))
  for (const l of ['en', 'es', 'fr'] as const) Object.assign(WOERTER[l], m.W[l] ?? {})

/** Übersetzt einen deutschen Text; Platzhalter {name} werden durch werte ersetzt */
export function t(text: string, werte?: Record<string, string | number>): string {
  let roh = text
  if (spr.aktuell !== 'de') {
    const w = WOERTER[spr.aktuell][text]
    if (w !== undefined) roh = w
    else (((globalThis as { __i18nFehlt?: Set<string> }).__i18nFehlt ??= new Set()) as Set<string>).add(text) // zum Prüfen der Wörterbücher
  }
  return werte ? roh.replace(/\{(\w+)\}/g, (m, k) => (k in werte ? String(werte[k]) : m)) : roh
}

/** Locale für Datum und Uhrzeit, z. B. 'en-GB' */
export const lokale = () => SPRACHEN.find((x) => x.id === spr.aktuell)!.lokale
// zum Prüfen (Test): alle übersetzbaren deutschen Schlüssel
;(globalThis as { __i18nKeys?: string[] }).__i18nKeys = Object.keys(WOERTER.en)
