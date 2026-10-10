/** Ab wie viel Restzeit die Ampel gelb wird: ein Viertel der Zeit, mindestens 1, höchstens 10 Minuten
 *  (bei sehr kurzen Timern höchstens die Hälfte der Zeit). */
export function gelbAb(dauerMs: number): number {
  return Math.min(10 * 60_000, Math.max(60_000, dauerMs * 0.25), dauerMs * 0.5)
}
