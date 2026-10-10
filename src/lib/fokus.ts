// Bedienung mit der Fernbedienung: Pfeiltasten springen zum nächstgelegenen Bedienelement.

export type Richtung = 'links' | 'rechts' | 'hoch' | 'runter'

const FOKUSSIERBAR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function sichtbar(el: HTMLElement): boolean {
  if (el.closest('[inert], [hidden]')) return false
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0
}

export function fokussierbare(bereich: ParentNode): HTMLElement[] {
  return [...bereich.querySelectorAll<HTMLElement>(FOKUSSIERBAR)].filter(sichtbar)
}

export function fokusSetzen(el: HTMLElement | null | undefined): boolean {
  if (!el) return false
  el.focus({ preventScroll: true })
  el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  return document.activeElement === el
}

export function ersterFokus(bereich: ParentNode): boolean {
  const auto = bereich.querySelector<HTMLElement>('[data-autofokus]')
  if (auto && sichtbar(auto)) return fokusSetzen(auto)
  return fokusSetzen(fokussierbare(bereich)[0])
}

/** Fokus in eine Richtung bewegen. Gibt true zurück, wenn ein Ziel gefunden wurde. */
export function bewegeFokus(richtung: Richtung, bereich: HTMLElement): boolean {
  const aktiv = document.activeElement as HTMLElement | null
  if (!aktiv || aktiv === document.body || !bereich.contains(aktiv)) return ersterFokus(bereich)

  const a = aktiv.getBoundingClientRect()
  const ax = a.left + a.width / 2
  const ay = a.top + a.height / 2
  let bestes: HTMLElement | null = null
  let besteWertung = Infinity

  for (const el of fokussierbare(bereich)) {
    if (el === aktiv || el.contains(aktiv)) continue
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    let haupt: number
    let quer: number
    switch (richtung) {
      case 'rechts':
        if (cx <= ax + 1 || r.right <= a.right) continue
        haupt = Math.max(0, r.left - a.right)
        quer = Math.max(0, r.top - a.bottom, a.top - r.bottom)
        break
      case 'links':
        if (cx >= ax - 1 || r.left >= a.left) continue
        haupt = Math.max(0, a.left - r.right)
        quer = Math.max(0, r.top - a.bottom, a.top - r.bottom)
        break
      case 'runter':
        if (cy <= ay + 1 || r.bottom <= a.bottom) continue
        haupt = Math.max(0, r.top - a.bottom)
        quer = Math.max(0, r.left - a.right, a.left - r.right)
        break
      case 'hoch':
        if (cy >= ay - 1 || r.top >= a.top) continue
        haupt = Math.max(0, a.top - r.bottom)
        quer = Math.max(0, r.left - a.right, a.left - r.right)
        break
    }
    const mitte = richtung === 'links' || richtung === 'rechts' ? Math.abs(cy - ay) : Math.abs(cx - ax)
    const wertung = haupt + quer * 3 + mitte * 0.15
    if (wertung < besteWertung) {
      besteWertung = wertung
      bestes = el
    }
  }
  return fokusSetzen(bestes)
}

export function richtungAusTaste(key: string): Richtung | null {
  switch (key) {
    case 'ArrowLeft':
      return 'links'
    case 'ArrowRight':
      return 'rechts'
    case 'ArrowUp':
      return 'hoch'
    case 'ArrowDown':
      return 'runter'
    default:
      return null
  }
}
