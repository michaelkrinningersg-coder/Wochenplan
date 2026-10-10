import { lokale } from '../i18n.svelte'

const gross = (s: string) => s.charAt(0).toLocaleUpperCase(lokale()) + s.slice(1)

/** Monatsname (0 = Januar) in der Oberflächensprache; liest lokale() → in $derived/Template verwenden */
export function monatsName(m: number): string {
  return gross(new Intl.DateTimeFormat(lokale(), { month: 'long' }).format(new Date(2024, m, 1)))
}

/** Kurze Wochentage Montag bis Sonntag in der Oberflächensprache */
export function wochentagKurz(): string[] {
  const f = new Intl.DateTimeFormat(lokale(), { weekday: 'short' })
  return Array.from({ length: 7 }, (_, i) => gross(f.format(new Date(2024, 0, 1 + i)).replace(/\.$/, '')))
}
