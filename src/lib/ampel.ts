// Ampel für den Timer: 5 Minuten vor Schluss gelb, 1 Minute vor Schluss rot.
// Bei kurzen Timern (5 Minuten oder weniger) wird die Ampel nach der Hälfte gelb
// und im letzten Fünftel (höchstens 1 Minute) rot, damit sie nicht sofort gelb ist.

export type AmpelZustand = 'rot' | 'gelb' | 'gruen'

export function gelbAb(dauerMs: number): number {
  return Math.min(5 * 60_000, dauerMs * 0.5)
}

export function rotAb(dauerMs: number): number {
  return Math.min(60_000, dauerMs * 0.2)
}

export function ampelZustand(restMs: number, dauerMs: number): AmpelZustand {
  if (restMs <= rotAb(dauerMs)) return 'rot'
  if (restMs <= gelbAb(dauerMs)) return 'gelb'
  return 'gruen'
}
