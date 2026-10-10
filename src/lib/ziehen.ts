// Drag & Drop für Finger und Maus (Pointer Events). Funktioniert auf Tablet und am PC.
// Ablageziele sind Elemente mit data-zone, data-tag und data-abschnitt.
// Ziehbare Elemente tragen data-aufgabe-id.
import type { AbschnittId, TagId } from './typen'

export interface ZiehOptionen {
  id: string
  tag: TagId
  aktiv: boolean
  ablegen: (zielTag: TagId, zielAbschnitt: AbschnittId, index: number) => void
}

const SCHWELLE = 8
const RAND = 56

/** Der Klick direkt nach dem Loslassen soll keine Aufgabe öffnen (Tastatur-Klicks bleiben erlaubt) */
function klickNachZiehenSperren() {
  const sperre = (e: MouseEvent) => {
    if (e.detail === 0) return
    e.stopPropagation()
    e.preventDefault()
    window.removeEventListener('click', sperre, true)
  }
  window.addEventListener('click', sperre, true)
  setTimeout(() => window.removeEventListener('click', sperre, true), 300)
}

function scrollbarerVorfahr(el: HTMLElement | null): HTMLElement | null {
  while (el && el !== document.body) {
    const s = getComputedStyle(el)
    if (/(auto|scroll)/.test(s.overflowY + s.overflowX) && (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth))
      return el
    el = el.parentElement
  }
  return null
}

interface Ziel {
  zone: HTMLElement
  index: number
}

/** Einfügeposition in einer Zone bestimmen (Kacheln sind zeilenweise angeordnet) */
function zielBerechnen(zone: HTMLElement, x: number, y: number, gezogen: HTMLElement): Ziel {
  const kinder = [...zone.querySelectorAll<HTMLElement>(':scope > [data-aufgabe-id]')].filter((k) => k !== gezogen)
  const rects = kinder.map((k) => k.getBoundingClientRect())
  for (let i = 0; i < kinder.length; i++) {
    const r = rects[i]
    if (y < r.top) return { zone, index: i }
    if (y <= r.bottom) {
      const alleinInZeile = !rects.some((o, j) => j !== i && o.top < r.bottom - 2 && o.bottom > r.top + 2)
      const davor = alleinInZeile ? y < r.top + r.height / 2 : x < r.left + r.width / 2
      if (davor) return { zone, index: i }
    }
  }
  return { zone, index: kinder.length }
}

export function ziehbar(node: HTMLElement, opt: ZiehOptionen) {
  let o = opt
  let start: { x: number; y: number; id: number } | null = null
  let zieht = false
  let geist: HTMLElement | null = null
  let marke: HTMLElement | null = null
  let versatz = { x: 0, y: 0 }
  let ziel: Ziel | null = null
  let letzteZone: HTMLElement | null = null

  function aufraeumen() {
    window.removeEventListener('pointermove', bewegen)
    window.removeEventListener('pointerup', loslassen)
    window.removeEventListener('pointercancel', abbrechen)
    window.removeEventListener('keydown', taste, true)
    geist?.remove()
    marke?.remove()
    geist = marke = null
    letzteZone?.classList.remove('ablage-aktiv')
    letzteZone = null
    node.classList.remove('wird-gezogen')
    document.documentElement.classList.remove('ziehen-laeuft')
    start = null
    zieht = false
    ziel = null
  }

  function beginnen(e: PointerEvent) {
    zieht = true
    const r = node.getBoundingClientRect()
    versatz = { x: e.clientX - r.left, y: e.clientY - r.top }
    geist = node.cloneNode(true) as HTMLElement
    geist.removeAttribute('data-aufgabe-id')
    geist.classList.add('zieh-geist')
    const stil = getComputedStyle(node)
    for (const v of ['--s', '--seg', '--seg-tief', '--seg-hell']) geist.style.setProperty(v, stil.getPropertyValue(v))
    Object.assign(geist.style, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: `${r.width}px`,
      height: `${r.height}px`,
      margin: '0',
      pointerEvents: 'none',
      zIndex: '1000',
    })
    document.body.appendChild(geist)
    marke = document.createElement('div')
    marke.className = 'zieh-marke'
    document.body.appendChild(marke)
    node.classList.add('wird-gezogen')
    document.documentElement.classList.add('ziehen-laeuft')
    window.addEventListener('keydown', taste, true)
  }

  function zeigeMarke() {
    if (!marke) return
    if (!ziel) {
      marke.style.display = 'none'
      return
    }
    const kinder = [...ziel.zone.querySelectorAll<HTMLElement>(':scope > [data-aufgabe-id]')].filter((k) => k !== node)
    marke.style.display = 'block'
    if (kinder.length === 0) {
      marke.style.display = 'none'
      return
    }
    const rects = kinder.map((k) => k.getBoundingClientRect())
    const i = Math.min(ziel.index, kinder.length - 1)
    const ref = rects[i]
    const nachLetztem = ziel.index >= kinder.length
    const alleinInZeile = !rects.some((r, j) => j !== i && r.top < ref.bottom - 2 && r.bottom > ref.top + 2)
    if (alleinInZeile) {
      const y = nachLetztem ? ref.bottom + 3 : ref.top - 5
      Object.assign(marke.style, { left: `${ref.left}px`, top: `${y}px`, width: `${ref.width}px`, height: '6px' })
    } else {
      const x = nachLetztem ? ref.right + 3 : ref.left - 5
      Object.assign(marke.style, { left: `${x}px`, top: `${ref.top}px`, width: `6px`, height: `${ref.height}px` })
    }
  }

  function bewegen(e: PointerEvent) {
    if (!start || e.pointerId !== start.id) return
    if (!zieht) {
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < SCHWELLE) return
      beginnen(e)
    }
    e.preventDefault()
    if (geist) {
      geist.style.transform = `translate(${e.clientX - versatz.x}px, ${e.clientY - versatz.y}px) rotate(-3deg) scale(1.06)`
    }
    const unter = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    const zone = unter?.closest<HTMLElement>('[data-zone]') ?? null
    if (zone !== letzteZone) {
      letzteZone?.classList.remove('ablage-aktiv')
      zone?.classList.add('ablage-aktiv')
      letzteZone = zone
    }
    ziel = zone ? zielBerechnen(zone, e.clientX, e.clientY, node) : null
    zeigeMarke()

    // am Rand automatisch weiterscrollen
    const scroller = scrollbarerVorfahr(zone ?? unter)
    if (scroller) {
      const r = scroller.getBoundingClientRect()
      if (e.clientY < r.top + RAND) scroller.scrollBy(0, -14)
      else if (e.clientY > r.bottom - RAND) scroller.scrollBy(0, 14)
      if (e.clientX < r.left + RAND) scroller.scrollBy(-14, 0)
      else if (e.clientX > r.right - RAND) scroller.scrollBy(14, 0)
    }
  }

  function loslassen(e: PointerEvent) {
    if (!start || e.pointerId !== start.id) return
    if (zieht) {
      klickNachZiehenSperren()
      const z = ziel
      if (z) {
        const tag = z.zone.dataset.tag as TagId
        const abschnitt = z.zone.dataset.abschnitt as AbschnittId
        aufraeumen()
        o.ablegen(tag, abschnitt, z.index)
        return
      }
    }
    aufraeumen()
  }

  function abbrechen() {
    if (zieht) klickNachZiehenSperren()
    aufraeumen()
  }

  function taste(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      abbrechen()
    }
  }

  function runter(e: PointerEvent) {
    if (!o.aktiv || e.button !== 0 || !e.isPrimary) return
    start = { x: e.clientX, y: e.clientY, id: e.pointerId }
    window.addEventListener('pointermove', bewegen, { passive: false })
    window.addEventListener('pointerup', loslassen)
    window.addEventListener('pointercancel', abbrechen)
  }

  node.addEventListener('pointerdown', runter)

  return {
    update(neu: ZiehOptionen) {
      o = neu
    },
    destroy() {
      node.removeEventListener('pointerdown', runter)
      aufraeumen()
    },
  }
}
