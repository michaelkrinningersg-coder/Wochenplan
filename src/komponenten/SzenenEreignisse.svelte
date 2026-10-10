<script lang="ts">
  // Kleine Überraschungen im Jahreszeiten-Bild – immer nur eine zur Zeit, mit zufälligen Wegen und Pausen dazwischen.
  // Je Jahreszeit zehn Ereignisse, dazu Extras (Geburtstag, Hahn am Morgen, Mondaufgang) und Ereignisse mit Datumsbezug
  // (Ostereier, St. Martin, Rentierschlitten). Antippen einer Figur lässt sie hüpfen oder platzen – ohne das Ruhebild zu beenden.
  import { onMount } from 'svelte'
  import { geburtstageHeute } from '../lib/countdown'
  import type { Jahreszeit, Orte } from '../lib/jahreszeit'
  import { app } from '../lib/speicher.svelte'

  let { jz, orte }: { jz: Jahreszeit; orte: Orte } = $props()

  // ---------- Kalender ----------
  function ostersonntag(jahr: number): Date {
    const a = jahr % 19
    const b = Math.floor(jahr / 100)
    const c = jahr % 100
    const d = Math.floor(b / 4)
    const e = b % 4
    const f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3)
    const h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(c / 4)
    const k = c % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const monat = Math.floor((h + l - 7 * m + 114) / 31)
    const tag = ((h + l - 7 * m + 114) % 31) + 1
    return new Date(jahr, monat - 1, tag)
  }
  const tageZwischen = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000)
  const istOsterzeit = (d: Date) => {
    const t = tageZwischen(ostersonntag(d.getFullYear()), new Date(d.getFullYear(), d.getMonth(), d.getDate()))
    return t >= -14 && t <= 7
  }
  const minuten = (d: Date) => d.getHours() * 60 + d.getMinutes()
  const istMartinszeit = (d: Date) => d.getMonth() === 10 && d.getDate() <= 15 && minuten(d) >= 16 * 60 + 30
  const istAdvent = (d: Date) => d.getMonth() === 11 && d.getDate() <= 26
  const istAbend = (d: Date) => d.getHours() >= 16 || d.getHours() < 6
  const istNacht = (d: Date) => d.getHours() >= 19 || d.getHours() < 6

  // ---------- Ereignisse ----------
  type Id =
    | 'schmetterling' | 'biene' | 'blumen' | 'hase' | 'nest' | 'regenbogen' | 'ostereier' | 'marienkaefer' | 'storch' | 'knospen'
    | 'ballon' | 'flugzeug' | 'drachen' | 'eiswagen' | 'seifenblasen' | 'gluehwuermchen' | 'sprenger' | 'heissluft'
    | 'pilze' | 'apfel' | 'igel' | 'vogel' | 'eichhoernchen' | 'windboee' | 'zugvoegel' | 'kastanie' | 'laterne'
    | 'schlitten' | 'fuchs' | 'schneemann' | 'rotkehlchen' | 'schneeball' | 'rentiere' | 'lichterkette' | 'gestoeber'
    | 'geburtstag' | 'hahn' | 'mond'
  interface Def {
    id: Id
    jz: Jahreszeit[] | 'alle'
    wann?: (d: Date) => boolean
    gewicht?: number
  }
  const DEFS: Def[] = [
    // Frühling
    { id: 'schmetterling', jz: ['fruehling', 'sommer'], wann: (d) => !istNacht(d) },
    { id: 'biene', jz: ['fruehling', 'sommer'], wann: (d) => !istNacht(d) },
    { id: 'blumen', jz: ['fruehling'] },
    { id: 'hase', jz: ['fruehling'] },
    { id: 'nest', jz: ['fruehling'] },
    { id: 'regenbogen', jz: ['fruehling'], wann: (d) => !istNacht(d) },
    { id: 'ostereier', jz: ['fruehling', 'winter'], wann: istOsterzeit, gewicht: 2 },
    { id: 'marienkaefer', jz: ['fruehling'] },
    { id: 'storch', jz: ['fruehling'], wann: (d) => !istNacht(d) },
    { id: 'knospen', jz: ['fruehling'] },
    // Sommer
    { id: 'ballon', jz: ['sommer'] },
    { id: 'flugzeug', jz: ['sommer'], wann: (d) => !istNacht(d) },
    { id: 'drachen', jz: ['sommer', 'herbst', 'winter'], wann: (d) => !istNacht(d) },
    { id: 'eiswagen', jz: ['sommer'], wann: (d) => !istNacht(d) },
    { id: 'seifenblasen', jz: ['sommer'] },
    { id: 'gluehwuermchen', jz: ['sommer'], wann: istAbend, gewicht: 2 },
    { id: 'sprenger', jz: ['sommer'], wann: (d) => !istNacht(d) },
    { id: 'heissluft', jz: ['sommer'], wann: (d) => !istNacht(d) },
    // Herbst
    { id: 'pilze', jz: ['herbst'] },
    { id: 'apfel', jz: ['herbst'] },
    { id: 'igel', jz: ['herbst'] },
    { id: 'vogel', jz: ['herbst', 'winter'], wann: (d) => !istNacht(d) },
    { id: 'eichhoernchen', jz: ['herbst'] },
    { id: 'windboee', jz: ['herbst'] },
    { id: 'zugvoegel', jz: ['herbst'], wann: (d) => !istNacht(d) },
    { id: 'kastanie', jz: ['herbst'] },
    { id: 'laterne', jz: ['herbst'], wann: istMartinszeit, gewicht: 3 },
    // Winter
    { id: 'schlitten', jz: ['winter'] },
    { id: 'fuchs', jz: ['winter'] },
    { id: 'schneemann', jz: ['winter'] },
    { id: 'rotkehlchen', jz: ['winter'] },
    { id: 'schneeball', jz: ['winter'] },
    { id: 'rentiere', jz: ['herbst', 'winter'], wann: istAdvent, gewicht: 2 },
    { id: 'lichterkette', jz: ['herbst', 'winter'], wann: (d) => istAbend(d) && (jz === 'winter' || d.getMonth() === 11), gewicht: 2 },
    { id: 'gestoeber', jz: ['winter'] },
    // Extras für alle Jahreszeiten
    { id: 'geburtstag', jz: 'alle', wann: () => geburtstageHeute().length > 0, gewicht: 4 },
    { id: 'hahn', jz: 'alle', wann: (d) => d.getHours() >= 6 && d.getHours() < 9, gewicht: 2 },
    { id: 'mond', jz: 'alle', wann: (d) => minuten(d) >= 17 * 60 && d.getHours() < 19 },
  ]

  interface Ereignis {
    id: Id
    nr: number
    links: boolean
    zufall: number[]
  }
  let aktuell = $state<Ereignis | null>(null)
  let nr = 0
  let letzte: Id | '' = ''
  let timer: ReturnType<typeof setTimeout> | undefined
  const zufall = (a: number, b: number) => a + Math.random() * (b - a)

  function auswahl(): Id {
    // für Tests: bestimmtes Ereignis erzwingen
    const test = (globalThis as { __ruheTest?: Id }).__ruheTest
    if (test) return test
    const d = new Date(app.jetzt)
    const moegliche = DEFS.filter((e) => (e.jz === 'alle' || e.jz.includes(jz)) && (!e.wann || e.wann(d)) && e.id !== letzte)
    const summe = moegliche.reduce((s, e) => s + (e.gewicht ?? 1), 0)
    let r = Math.random() * summe
    for (const e of moegliche) {
      r -= e.gewicht ?? 1
      if (r <= 0) return e.id
    }
    return moegliche[0]?.id ?? 'vogel'
  }
  function naechstes(verz: number) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      const id = auswahl()
      letzte = id
      aktuell = { id, nr: ++nr, links: Math.random() < 0.5, zufall: Array.from({ length: 12 }, () => Math.random()) }
    }, verz)
  }
  function fertig() {
    aktuell = null
    naechstes(zufall(7000, 18000))
  }
  onMount(() => {
    naechstes(zufall(3000, 7000))
    return () => clearTimeout(timer)
  })

  /** Bewegung mit der Web-Animations-API; das Ereignis endet mit der Animation (ende !== false) */
  function animiere(node: Element, p: { k: Keyframe[]; dauer: number; ende?: boolean; easing?: string; verz?: number }) {
    const a = node.animate(p.k, { duration: p.dauer, easing: p.easing ?? 'linear', fill: 'both', delay: p.verz ?? 0 })
    if (p.ende !== false) a.onfinish = fertig
    return { destroy: () => a.cancel() }
  }

  // ---------- Wege ----------
  const pos = (x: number, y: number, extra = '') => ({ left: `${x}%`, top: `${y}%`, transform: extra || 'none' })
  /** Flug quer durchs Bild mit Wellen; Figuren schauen in Flugrichtung (Emojis schauen meist nach links) */
  function flug(e: Ereignis, hoch: [number, number], welle = 5, schritte = 8, kippen = 12): Keyframe[] {
    const y0 = hoch[0] + e.zufall[0] * (hoch[1] - hoch[0])
    const y1 = hoch[0] + e.zufall[1] * (hoch[1] - hoch[0])
    return Array.from({ length: schritte + 1 }, (_, i) => {
      const t = i / schritte
      const x = e.links ? -12 + t * 124 : 112 - t * 124
      const y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI * 3 + e.zufall[2] * 6) * welle
      return pos(x, y, `scaleX(${e.links ? -1 : 1}) rotate(${Math.sin(t * 9) * kippen}deg)`)
    })
  }
  /** über den Boden laufen oder hoppeln */
  function boden(e: Ereignis, hopser = 0, schritte = 16): Keyframe[] {
    const y = orte.boden[0] + e.zufall[3] * (orte.boden[1] - orte.boden[0])
    return Array.from({ length: schritte + 1 }, (_, i) => {
      const t = i / schritte
      const x = e.links ? -8 + t * 116 : 108 - t * 116
      return pos(x, y - (hopser && i % 2 ? hopser : 0), `scaleX(${e.links ? -1 : 1})`)
    })
  }
  function wachsen(i: number, halten = 0.85): Keyframe[] {
    return [
      { transform: 'scale(0)', opacity: 0, offset: 0 },
      { transform: 'scale(0)', opacity: 0, offset: 0.04 + i * 0.05 },
      { transform: 'scale(1.12)', opacity: 1, offset: 0.2 + i * 0.05 },
      { transform: 'scale(1)', opacity: 1, offset: 0.25 + i * 0.05 },
      { transform: 'scale(1)', opacity: 1, offset: halten },
      { transform: 'scale(0)', opacity: 0, offset: 1 },
    ]
  }
  const sichtbar = (an: number, aus: number): Keyframe[] => [
    { opacity: 0, offset: 0 },
    { opacity: 0, offset: an },
    { opacity: 1, offset: Math.min(an + 0.04, aus) },
    { opacity: 1, offset: aus },
    { opacity: 0, offset: Math.min(aus + 0.04, 1) },
    { opacity: 0, offset: 1 },
  ]
  /** Bodenstellen für Wachsendes (gleichmäßig verteilt, leicht zufällig) */
  function stellen(e: Ereignis, n: number) {
    return Array.from({ length: n }, (_, i) => ({
      x: 8 + (i + e.zufall[i % 12] * 0.8) * (84 / n),
      y: orte.boden[0] + ((i * 7) % 5) * ((orte.boden[1] - orte.boden[0]) / 4),
    }))
  }
  function fallen(von: { x: number; y: number }, e: Ereignis, rollen = true): Keyframe[] {
    const x = von.x + (e.zufall[4] - 0.5) * 6
    const r = e.links ? -1 : 1
    const b = orte.boden[1] - 1
    return [
      { left: `${x}%`, top: `${von.y}%`, opacity: 1, transform: 'rotate(0deg)', offset: 0 },
      { left: `${x}%`, top: `${von.y}%`, opacity: 1, transform: 'rotate(0deg)', offset: 0.18 },
      { left: `${x}%`, top: `${b}%`, opacity: 1, transform: 'rotate(40deg)', offset: 0.36, easing: 'ease-out' },
      { left: `${x + r * 2}%`, top: `${b - 5}%`, opacity: 1, transform: 'rotate(80deg)', offset: 0.44, easing: 'ease-in' },
      { left: `${x + r * 4}%`, top: `${b}%`, opacity: 1, transform: 'rotate(140deg)', offset: 0.52 },
      { left: `${x + r * (rollen ? 9 : 4)}%`, top: `${b}%`, opacity: 1, transform: `rotate(${r * (rollen ? 400 : 140)}deg)`, offset: 0.75 },
      { left: `${x + r * (rollen ? 9 : 4)}%`, top: `${b}%`, opacity: 0, transform: `rotate(${r * (rollen ? 400 : 140)}deg)`, offset: 1 },
    ]
  }

  // ---------- Antippen: hüpfen oder platzen, mit Glitzer ----------
  function getippt(ev: PointerEvent) {
    const ziel = (ev.target as Element | null)?.closest?.('[data-spiel]') as HTMLElement | null
    if (!ziel) return
    ev.stopPropagation()
    const figur = (ziel.querySelector('.figur') as HTMLElement | null) ?? ziel
    const art = ziel.dataset.spiel
    if (art === 'platzen') {
      figur.classList.add('platzt')
    } else {
      figur.classList.remove('hops')
      void figur.offsetWidth
      figur.classList.add('hops')
    }
    const flaeche = ev.currentTarget as HTMLElement
    const r = flaeche.getBoundingClientRect()
    const glitzer = document.createElement('span')
    glitzer.className = 'glitzer'
    glitzer.textContent = art === 'platzen' ? '💥' : '✨'
    glitzer.style.left = `${ev.clientX - r.left}px`
    glitzer.style.top = `${ev.clientY - r.top}px`
    flaeche.appendChild(glitzer)
    setTimeout(() => glitzer.remove(), 900)
  }
  function klickHalten(ev: MouseEvent) {
    if ((ev.target as Element | null)?.closest?.('[data-spiel]')) ev.stopPropagation()
  }

  const BALLON_FARBEN = ['#e8452b', '#3b8fd6', '#f2b33d', '#4caf50', '#b07cff', '#ff5d8f']
  const EIER = ['#ff8fb1', '#7fd3ff', '#ffd84a', '#9be37a', '#c7a2ff']
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="ereignisse" onpointerdown={getippt} onclick={klickHalten}>
  {#if aktuell}
    {@const e = aktuell}
    {#key e.nr}
      <!-- ================= Flieger ================= -->
      {#if e.id === 'schmetterling' || e.id === 'biene' || e.id === 'vogel'}
        <div class="ding" data-spiel="hops" use:animiere={{ k: flug(e, e.id === 'vogel' ? [10, 40] : [18, 58], e.id === 'biene' ? 3 : 7, 10), dauer: zufall(11000, 17000) }}>
          <span class="figur emoji">{e.id === 'schmetterling' ? '🦋' : e.id === 'biene' ? '🐝' : '🐦'}</span>
        </div>
      {:else if e.id === 'flugzeug'}
        <div class="ding" data-spiel="hops" use:animiere={{ k: flug(e, [5, 16], 1, 4, 2), dauer: zufall(12000, 16000) }}>
          <span class="figur emoji">✈️</span>
        </div>
      {:else if e.id === 'drachen'}
        <div class="ding drachen" data-spiel="hops" use:animiere={{ k: flug(e, [6, 34], 8, 8, 20).map((f) => ({ ...f, transform: String(f.transform).replace(/scaleX\([^)]*\) /, '') })), dauer: zufall(14000, 20000) }}>
          <svg class="figur" viewBox="0 0 60 110" width="100%" height="100%">
            <path d="M30 2 L54 30 L30 62 L6 30 Z" fill="#e8452b" stroke="#7a2a18" stroke-width="2" />
            <path d="M30 2 L30 62 M6 30 L54 30" stroke="#7a2a18" stroke-width="1.5" />
            <path d="M30 2 L54 30 L30 30 Z" fill="#f2b33d" />
            <path d="M30 30 L6 30 L30 62 Z" fill="#3b8fd6" />
            <path d="M30 62 q-8 8 0 14 q8 6 0 14 q-8 6 0 14" fill="none" stroke="#7a2a18" stroke-width="1.5" />
            <path d="M24 72 l12 0 l-6 5 z M24 86 l12 0 l-6 5 z M24 100 l12 0 l-6 5 z" fill="#f2b33d" />
          </svg>
        </div>
      {:else if e.id === 'storch'}
        <div class="ding storch" data-spiel="hops" use:animiere={{ k: flug(e, [8, 30], 3, 6, 4), dauer: zufall(15000, 20000) }}>
          <svg class="figur" viewBox="0 0 120 60" width="100%" height="100%">
            <path d="M10 30 L2 29" stroke="#e8452b" stroke-width="3" stroke-linecap="round" />
            <circle cx="16" cy="29" r="5" fill="#fff" stroke="#2a2a2a" stroke-width="1" />
            <path d="M20 30 Q34 32 46 33" stroke="#fff" stroke-width="4" stroke-linecap="round" />
            <ellipse cx="62" cy="34" rx="18" ry="8" fill="#fff" stroke="#2a2a2a" stroke-width="1" />
            <g class="fluegel"><path d="M54 32 Q66 2 86 8 Q74 20 68 33 Z" fill="#fff" stroke="#2a2a2a" stroke-width="1" /><path d="M76 10 Q84 6 88 8 Q80 14 78 20 Z" fill="#2a2a2a" /></g>
            <path d="M78 36 L112 40 M78 34 L112 37" stroke="#e8452b" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
      {:else if e.id === 'zugvoegel'}
        <div class="ding schar" data-spiel="hops" use:animiere={{ k: flug(e, [8, 26], 2, 4, 2), dauer: zufall(14000, 18000) }}>
          <svg class="figur" viewBox="0 0 140 70" width="100%" height="100%">
            {#each [[10, 35], [30, 25], [30, 45], [50, 15], [50, 55], [70, 5], [70, 65]] as [x, y], i (i)}
              <path class="flattern" style="animation-delay: {i * 0.12}s" d="M{x} {y} q6 -6 12 0 q6 -6 12 0" fill="none" stroke="#2c3550" stroke-width="2.6" stroke-linecap="round" />
            {/each}
          </svg>
        </div>
      {:else if e.id === 'heissluft'}
        <div class="ding heissluft" data-spiel="hops" use:animiere={{ k: flug(e, [10, 30], 3, 6, 2).map((f) => ({ ...f, transform: 'none' })), dauer: zufall(24000, 30000) }}>
          <svg class="figur" viewBox="0 0 60 84" width="100%" height="100%">
            <path d="M30 2 C8 2 2 22 8 36 C12 46 22 54 24 60 L36 60 C38 54 48 46 52 36 C58 22 52 2 30 2 Z" fill="#e8452b" />
            <path d="M30 2 C20 6 18 30 24 60 L30 60 Z" fill="#f2b33d" /><path d="M30 2 C40 6 42 30 36 60 L30 60 Z" fill="#3b8fd6" />
            <path d="M25 60 L24 70 M35 60 L36 70" stroke="#5a3a1a" stroke-width="1.2" />
            <rect x="22" y="70" width="16" height="11" rx="2" fill="#a8792f" />
          </svg>
        </div>
      {:else if e.id === 'rentiere'}
        <div class="ding gespann" data-spiel="hops" use:animiere={{ k: flug(e, [6, 24], 4, 8, 6), dauer: zufall(14000, 18000) }}>
          <span class="figur emoji reihe">🦌🦌🛷🎅</span>
        </div>

      <!-- ================= Aufsteigen ================= -->
      {:else if e.id === 'ballon' || e.id === 'geburtstag'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: e.id === 'geburtstag' ? 17000 : 16000 }}>
          {#each Array.from({ length: e.id === 'geburtstag' ? 7 : 1 }) as _, i (i)}
            {@const x = e.id === 'geburtstag' ? 8 + i * 13 + e.zufall[i] * 6 : 15 + e.zufall[0] * 70}
            <div
              class="ding ballon"
              data-spiel="platzen"
              use:animiere={{
                k: Array.from({ length: 7 }, (_, j) => ({ left: `${x + Math.sin(j + i) * 3}%`, top: `${108 - (j / 6) * 125}%` })),
                dauer: 13000 + e.zufall[(i + 3) % 12] * 3000,
                verz: i * 450,
                ende: false,
              }}
            >
              <svg class="figur" viewBox="0 0 40 70" width="100%" height="100%">
                <ellipse cx="20" cy="20" rx="16" ry="19" fill={BALLON_FARBEN[(i + Math.floor(e.zufall[5] * 6)) % 6]} />
                <ellipse cx="14" cy="13" rx="4" ry="6" fill="#fff" opacity="0.4" />
                <path d="M18 39 L22 39 L20 42 Z" fill={BALLON_FARBEN[(i + Math.floor(e.zufall[5] * 6)) % 6]} />
                <path d="M20 42 q-4 7 0 14 q4 7 0 14" fill="none" stroke="#666" stroke-width="1" />
              </svg>
            </div>
          {/each}
          {#if e.id === 'geburtstag'}
            {#each Array.from({ length: 40 }) as _, i (i)}
              <span
                class="konfetti"
                style="left: {e.zufall[i % 12] * 100}%; background: {BALLON_FARBEN[i % 6]}; animation-delay: {(i % 10) * 0.35}s; --dx: {(i % 7) * 12 - 36}px"
              ></span>
            {/each}
          {/if}
        </div>
      {:else if e.id === 'seifenblasen'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 13000 }}>
          {#each Array.from({ length: 9 }) as _, i (i)}
            {@const x = 10 + e.zufall[i] * 80}
            <div
              class="ding blase"
              data-spiel="platzen"
              style="--g: {28 + (i % 4) * 14}px"
              use:animiere={{
                k: [
                  { left: `${x}%`, top: `${orte.boden[0]}%`, opacity: 0, transform: 'scale(0.4)' },
                  { left: `${x + 3}%`, top: `${orte.boden[0] - 15}%`, opacity: 1, transform: 'scale(1)', offset: 0.2 },
                  { left: `${x - 4}%`, top: `${orte.boden[0] - 40}%`, opacity: 1, transform: 'scale(1)', offset: 0.7 },
                  { left: `${x + 2}%`, top: `${orte.boden[0] - 52}%`, opacity: 0, transform: 'scale(1.4)' },
                ],
                dauer: 7000 + e.zufall[(i + 2) % 12] * 4000,
                verz: i * 600,
                ende: false,
              }}
            >
              <span class="figur blase-innen"></span>
            </div>
          {/each}
        </div>

      <!-- ================= Boden ================= -->
      {:else if e.id === 'hase' || e.id === 'igel' || e.id === 'fuchs' || e.id === 'marienkaefer' || e.id === 'eiswagen'}
        <div
          class="ding"
          class:klein={e.id === 'marienkaefer'}
          data-spiel="hops"
          use:animiere={{
            k: boden(e, e.id === 'hase' ? 4 : 0, e.id === 'hase' ? 20 : 16),
            dauer: e.id === 'marienkaefer' ? 24000 : e.id === 'eiswagen' ? 15000 : zufall(16000, 22000),
          }}
        >
          {#if e.id === 'eiswagen'}
            <span class="figur emoji reihe eiswagen"><span class="schild">🍦</span>🚐</span>
          {:else}
            <span class="figur emoji">{e.id === 'hase' ? '🐇' : e.id === 'igel' ? '🦔' : e.id === 'fuchs' ? '🦊' : '🐞'}</span>
          {/if}
        </div>
      {:else if e.id === 'schlitten'}
        <div
          class="ding"
          data-spiel="hops"
          use:animiere={{
            k: [
              pos(e.links ? -6 : 106, orte.boden[0] - 12, `scaleX(${e.links ? -1 : 1}) rotate(${e.links ? 10 : -10}deg)`),
              pos(e.links ? 106 : -6, orte.boden[1], `scaleX(${e.links ? -1 : 1}) rotate(${e.links ? 14 : -14}deg)`),
            ],
            dauer: zufall(7000, 10000),
            easing: 'ease-in',
          }}
        >
          <span class="figur emoji">🛷</span>
        </div>
      {:else if e.id === 'rotkehlchen'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 16000 }}>
          {#each Array.from({ length: 14 }) as _, i (i)}
            {@const x = e.links ? 6 + i * 6.5 : 94 - i * 6.5}
            <span class="spur" style="left: {x}%; top: {orte.boden[1] + 2 + (i % 2) * 1.2}%" use:animiere={{ k: sichtbar(i / 15, 0.92), dauer: 16000, ende: false }}></span>
          {/each}
          <div class="ding klein" data-spiel="hops" use:animiere={{ k: boden(e, 3, 28).map((f) => ({ ...f, top: `${orte.boden[1]}%` })), dauer: 16000, ende: false }}>
            <svg class="figur" viewBox="0 0 40 36" width="100%" height="100%">
              <ellipse cx="20" cy="20" rx="13" ry="11" fill="#8a5a3a" />
              <ellipse cx="14" cy="22" rx="7" ry="7" fill="#e8552b" />
              <circle cx="10" cy="14" r="5.5" fill="#8a5a3a" />
              <circle cx="8.5" cy="13" r="1.3" fill="#111" />
              <path d="M4 14 L1 15 L4 16 Z" fill="#3a2a1a" />
              <path d="M31 16 L39 12 L36 20 Z" fill="#6b4329" />
              <path d="M18 31 L17 35 M22 31 L23 35" stroke="#3a2a1a" stroke-width="1.4" />
            </svg>
          </div>
        </div>
      {:else if e.id === 'hahn'}
        {@const x = 12 + e.zufall[0] * 70}
        <div class="ding" data-spiel="hops" style="left: {x}%; top: {orte.boden[0]}%" use:animiere={{ k: sichtbar(0.05, 0.9), dauer: 9000 }}>
          <span class="figur emoji">🐓</span>
          <span class="blase-text" style="animation-delay: 1.4s">Kikeriki!</span>
        </div>

      <!-- ================= Wachsen ================= -->
      {:else if e.id === 'blumen' || e.id === 'pilze' || e.id === 'ostereier'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 12000 }}>
          {#each stellen(e, e.id === 'ostereier' ? 5 : 4) as s, i (i)}
            <div class="ding wachsend" data-spiel="hops" style="left: {s.x}%; top: {s.y}%" use:animiere={{ k: wachsen(i), dauer: 12000, ende: false }}>
              {#if e.id === 'pilze'}
                <svg class="figur" viewBox="0 0 40 40" width="100%" height="100%">
                  <rect x="15" y="20" width="10" height="16" rx="4" fill="#f6ecd8" stroke="#b39b78" stroke-width="1.2" />
                  <path d="M3 22 C3 8 37 8 37 22 Z" fill={i % 2 ? '#c9563c' : '#e8452b'} />
                  <circle cx="13" cy="15" r="2.6" fill="#fff" /><circle cx="24" cy="12" r="2.2" fill="#fff" /><circle cx="30" cy="18" r="2" fill="#fff" />
                </svg>
              {:else if e.id === 'ostereier'}
                <svg class="figur" viewBox="0 0 30 38" width="100%" height="100%">
                  <path d="M15 2 C6 2 2 18 2 24 C2 32 8 36 15 36 C22 36 28 32 28 24 C28 18 24 2 15 2 Z" fill={EIER[i % 5]} />
                  <path d="M3 20 q6 -4 12 0 q6 4 12 0" fill="none" stroke="#fff" stroke-width="2.4" />
                  <circle cx="10" cy="28" r="2" fill="#fff" /><circle cx="20" cy="28" r="2" fill="#fff" />
                </svg>
              {:else}
                <span class="figur emoji">{['🌷', '🌼', '🌸', '🌻'][i % 4]}</span>
              {/if}
            </div>
          {/each}
        </div>
      {:else if e.id === 'knospen'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 12000 }}>
          {#each Array.from({ length: 6 }) as _, i (i)}
            {@const w = (i / 6) * Math.PI * 2 + e.zufall[0]}
            <div
              class="ding knospe"
              data-spiel="hops"
              style="left: {orte.krone.x + Math.cos(w) * 5}%; top: {orte.krone.y + Math.sin(w) * 7}%"
              use:animiere={{ k: wachsen(i, 0.88), dauer: 12000, ende: false }}
            >
              <span class="figur emoji">🌸</span>
            </div>
          {/each}
        </div>
      {:else if e.id === 'nest'}
        <div class="ding nest" data-spiel="hops" style="left: {orte.krone.x + 3}%; top: {orte.krone.y + 4}%" use:animiere={{ k: sichtbar(0.02, 0.92), dauer: 12000 }}>
          <span class="figur stapel">
            <span class="emoji">🪺</span>
            <span class="emoji obenauf" use:animiere={{ k: sichtbar(0.2, 0.5), dauer: 12000, ende: false }}>🥚</span>
            <span class="emoji obenauf" use:animiere={{ k: sichtbar(0.5, 0.92), dauer: 12000, ende: false }}>🐣</span>
          </span>
        </div>
      {:else if e.id === 'schneemann'}
        {@const x = 14 + e.zufall[0] * 66}
        <div class="ding schneemann" data-spiel="hops" style="left: {x}%; top: {orte.boden[0] - 4}%" use:animiere={{ k: sichtbar(0, 0.93), dauer: 14000 }}>
          <svg class="figur" viewBox="0 0 60 90" width="100%" height="100%">
            <g use:animiere={{ k: wachsen(0, 0.93), dauer: 14000, ende: false }} style="transform-origin: 30px 88px"><circle cx="30" cy="70" r="18" fill="#fff" stroke="#cfdbe6" stroke-width="1.5" /></g>
            <g use:animiere={{ k: wachsen(2, 0.93), dauer: 14000, ende: false }} style="transform-origin: 30px 56px"><circle cx="30" cy="42" r="13" fill="#fff" stroke="#cfdbe6" stroke-width="1.5" /><circle cx="30" cy="38" r="1.6" fill="#333" /><circle cx="30" cy="45" r="1.6" fill="#333" /></g>
            <g use:animiere={{ k: wachsen(4, 0.93), dauer: 14000, ende: false }} style="transform-origin: 30px 30px">
              <circle cx="30" cy="20" r="10" fill="#fff" stroke="#cfdbe6" stroke-width="1.5" />
              <circle cx="26" cy="18" r="1.4" fill="#333" /><circle cx="34" cy="18" r="1.4" fill="#333" />
              <path d="M30 21 L40 23 L30 24 Z" fill="#f08a24" />
            </g>
            <g use:animiere={{ k: wachsen(6, 0.93), dauer: 14000, ende: false }} style="transform-origin: 30px 12px">
              <rect x="22" y="4" width="16" height="9" fill="#2a2a2a" /><rect x="18" y="12" width="24" height="3" fill="#2a2a2a" />
            </g>
          </svg>
        </div>

      <!-- ================= Fallen ================= -->
      {:else if e.id === 'apfel'}
        <div class="ding frucht" data-spiel="hops" use:animiere={{ k: fallen(orte.krone, e), dauer: 7000 }}>
          <svg class="figur" viewBox="0 0 40 40" width="100%" height="100%">
            <path d="M20 10 C8 4 2 16 6 26 C9 34 16 38 20 35 C24 38 31 34 34 26 C38 16 32 4 20 10 Z" fill="#d93a2b" />
            <path d="M20 10 L21 3" stroke="#5a3a1a" stroke-width="2.5" stroke-linecap="round" />
            <path d="M21 6 q7 -5 11 0 q-6 4 -11 0" fill="#4caf50" />
            <ellipse cx="13" cy="18" rx="3" ry="5" fill="#ffffff" opacity="0.35" />
          </svg>
        </div>
      {:else if e.id === 'kastanie'}
        <div class="ding frucht" data-spiel="hops" use:animiere={{ k: fallen(orte.krone, e, false), dauer: 9000 }}>
          <svg class="figur" viewBox="0 0 50 40" width="100%" height="100%">
            <ellipse cx="25" cy="24" rx="9" ry="8" fill="#7a3f1d" />
            <ellipse cx="22" cy="21" rx="3" ry="2" fill="#fff" opacity="0.3" />
            <g class="schale links"><path d="M16 24 A10 10 0 0 1 25 12 L25 34 A10 10 0 0 1 16 24 Z" fill="#7fb43a" /><path d="M14 18 l-3 -2 M13 24 l-4 0 M14 30 l-3 2 M19 14 l-2 -3" stroke="#4f7a1d" stroke-width="1.4" /></g>
            <g class="schale rechts"><path d="M34 24 A10 10 0 0 0 25 12 L25 34 A10 10 0 0 0 34 24 Z" fill="#8cc244" /><path d="M36 18 l3 -2 M37 24 l4 0 M36 30 l3 2 M31 14 l2 -3" stroke="#4f7a1d" stroke-width="1.4" /></g>
          </svg>
        </div>
      {:else if e.id === 'eichhoernchen'}
        {@const r = e.links ? -1 : 1}
        <div
          class="ding"
          data-spiel="hops"
          use:animiere={{
            k: [
              { left: `${orte.stamm.x}%`, top: `${orte.krone.y + 6}%`, transform: 'rotate(90deg)', opacity: 0, offset: 0 },
              { left: `${orte.stamm.x}%`, top: `${orte.krone.y + 6}%`, transform: 'rotate(90deg)', opacity: 1, offset: 0.05 },
              { left: `${orte.stamm.x}%`, top: `${orte.boden[0]}%`, transform: 'rotate(90deg)', opacity: 1, offset: 0.25 },
              { left: `${orte.stamm.x + r * 8}%`, top: `${orte.boden[1]}%`, transform: `scaleX(${-r})`, opacity: 1, offset: 0.4 },
              { left: `${orte.stamm.x + r * 8}%`, top: `${orte.boden[1]}%`, transform: `scaleX(${-r}) rotate(-12deg)`, opacity: 1, offset: 0.45 },
              { left: `${orte.stamm.x + r * 8}%`, top: `${orte.boden[1]}%`, transform: `scaleX(${-r}) rotate(10deg)`, opacity: 1, offset: 0.5 },
              { left: `${orte.stamm.x + r * 8}%`, top: `${orte.boden[1]}%`, transform: `scaleX(${-r}) rotate(-12deg)`, opacity: 1, offset: 0.55 },
              { left: `${orte.stamm.x + r * 8}%`, top: `${orte.boden[1]}%`, transform: `scaleX(${-r})`, opacity: 1, offset: 0.62 },
              { left: `${r > 0 ? 110 : -10}%`, top: `${orte.boden[0]}%`, transform: `scaleX(${-r})`, opacity: 1, offset: 1 },
            ],
            dauer: 12000,
          }}
        >
          <span class="figur emoji">🐿️</span>
          <span class="nuss" style="--r: {r}">🌰</span>
        </div>

      <!-- ================= Wetter und Licht ================= -->
      {:else if e.id === 'regenbogen'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 14000 }}>
          <div class="regen" use:animiere={{ k: sichtbar(0, 0.45), dauer: 14000, ende: false }}>
            {#each Array.from({ length: 50 }) as _, i (i)}
              <span style="left: {(i * 37) % 100}%; animation-delay: {((i * 13) % 10) / 10}s"></span>
            {/each}
          </div>
          <svg class="bogen" viewBox="0 0 200 100" preserveAspectRatio="none" data-spiel="hops" use:animiere={{ k: sichtbar(0.38, 0.92), dauer: 14000, ende: false }}>
            {#each ['#e8452b', '#f08a24', '#ffd84a', '#4caf50', '#3b8fd6', '#7a5cc4'] as farbe, i (i)}
              <path d="M{10 + i * 4} 100 A{90 - i * 4} {90 - i * 4} 0 0 1 {190 - i * 4} 100" fill="none" stroke={farbe} stroke-width="4" opacity="0.75" />
            {/each}
          </svg>
        </div>
      {:else if e.id === 'sprenger'}
        {@const x = 18 + e.zufall[0] * 60}
        <div class="ding sprenger" data-spiel="hops" style="left: {x}%; top: {orte.boden[0] + 2}%" use:animiere={{ k: sichtbar(0.03, 0.92), dauer: 10000 }}>
          <span class="figur strahlen">
            {#each Array.from({ length: 16 }) as _, i (i)}
              <span class="tropfen" style="--w: {-70 + (i % 8) * 20}deg; animation-delay: {(i % 8) * 0.12}s"></span>
            {/each}
            <span class="mini-bogen"></span>
            <span class="duese"></span>
          </span>
        </div>
      {:else if e.id === 'gluehwuermchen'}
        <div class="flaeche" use:animiere={{ k: sichtbar(0.02, 0.92), dauer: 14000 }}>
          {#each Array.from({ length: 16 }) as _, i (i)}
            <span
              class="licht"
              data-spiel="hops"
              style="left: {8 + e.zufall[i % 12] * 84}%; top: {30 + ((i * 17) % 40)}%; animation-delay: {(i % 7) * 0.4}s, {(i % 5) * 0.3}s"
            ></span>
          {/each}
        </div>
      {:else if e.id === 'windboee'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 6000 }}>
          {#each Array.from({ length: 34 }) as _, i (i)}
            <span
              class="blatt"
              style="top: {15 + ((i * 23) % 60)}%; background: {['#e8752a', '#f2b33d', '#c94a2a', '#a8582a'][i % 4]}; animation-delay: {(i % 12) * 0.12}s; --r: {e.links ? 1 : -1}"
            ></span>
          {/each}
        </div>
      {:else if e.id === 'gestoeber'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 8000 }}>
          {#each Array.from({ length: 70 }) as _, i (i)}
            <span class="flocke" style="left: {(i * 41) % 110 - 5}%; animation-delay: {(i % 14) * 0.25}s; --g: {6 + (i % 4) * 4}px"></span>
          {/each}
        </div>
      {:else if e.id === 'schneeball'}
        {@const zielX = 25 + e.zufall[0] * 50}
        <div
          class="ding ball"
          data-spiel="platzen"
          use:animiere={{
            k: Array.from({ length: 9 }, (_, i) => {
              const t = i / 8
              const x = e.links ? -5 + t * (zielX + 5) : 105 - t * (105 - zielX)
              return { left: `${x}%`, top: `${orte.boden[0] - 10 - Math.sin(t * Math.PI) * 30}%`, transform: 'scale(1)', opacity: 1 }
            }).concat([{ left: `${zielX}%`, top: `${orte.boden[0] - 10}%`, transform: 'scale(2.4)', opacity: 0 }]),
            dauer: 3200,
            easing: 'ease-in',
          }}
        >
          <span class="figur schneeball"></span>
        </div>
      {:else if e.id === 'lichterkette'}
        <div class="flaeche" use:animiere={{ k: sichtbar(0.02, 0.94), dauer: 15000 }}>
          {#each Array.from({ length: 13 }) as _, i (i)}
            {@const t = i / 12}
            {@const [a, b] = t < 0.5 ? [orte.dach[0], orte.dach[1]] : [orte.dach[1], orte.dach[2]]}
            {@const u = t < 0.5 ? t * 2 : (t - 0.5) * 2}
            <span
              class="birne"
              data-spiel="hops"
              style="left: {a.x + (b.x - a.x) * u}%; top: {a.y + (b.y - a.y) * u + Math.sin(u * Math.PI) * 0.8}%; --farbe: {['#ff5d5d', '#ffd84a', '#5dd6ff', '#7dff7a'][i % 4]}; animation-delay: {(i % 4) * 0.35}s"
            ></span>
          {/each}
        </div>
      {:else if e.id === 'laterne'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 20000 }}>
          {#each [0, 1, 2] as i (i)}
            <div class="ding laterne" data-spiel="hops" use:animiere={{ k: boden(e, 0, 10).map((f) => ({ ...f, top: `${orte.boden[0] - 6}%`, transform: 'none' })), dauer: 18000, verz: i * 1500, ende: false }}>
              <span class="figur pendel">
                <span class="stab"></span>
                <span class="emoji">🏮</span>
              </span>
            </div>
          {/each}
        </div>
      {:else if e.id === 'mond'}
        <div class="ding mond" data-spiel="hops" use:animiere={{ k: [pos(80, 62), pos(78, 30), pos(77, 22)].map((f, i) => ({ ...f, opacity: i === 0 ? 0 : 1 })), dauer: 16000, easing: 'ease-out' }}>
          <svg class="figur" viewBox="0 0 40 40" width="100%" height="100%">
            <circle cx="20" cy="20" r="16" fill="#fff4c2" />
            <circle cx="14" cy="15" r="3" fill="#efe1a5" /><circle cx="24" cy="25" r="4" fill="#efe1a5" /><circle cx="27" cy="13" r="2" fill="#efe1a5" />
          </svg>
        </div>
      {/if}
    {/key}
  {/if}
</div>

<style>
  .ereignisse {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .flaeche {
    position: absolute;
    inset: 0;
  }
  .ding {
    position: absolute;
    translate: -50% -50%;
    pointer-events: auto;
    cursor: pointer;
  }
  .figur {
    display: block;
  }
  .emoji {
    display: block;
    font-size: clamp(30px, 6vh, 64px);
    line-height: 1;
  }
  .klein .emoji,
  .klein {
    font-size: clamp(20px, 3.6vh, 40px);
  }
  .klein {
    width: clamp(28px, 4vh, 46px);
    height: clamp(26px, 3.6vh, 42px);
  }
  .reihe {
    white-space: nowrap;
    letter-spacing: -0.1em;
  }
  .drachen {
    width: clamp(50px, 8vw, 110px);
    height: clamp(90px, 14vw, 200px);
  }
  .storch {
    width: clamp(90px, 13vw, 180px);
    height: clamp(45px, 6.5vw, 90px);
  }
  .fluegel {
    transform-origin: 60px 32px;
    animation: schlagen 0.9s ease-in-out infinite alternate;
  }
  .schar {
    width: clamp(110px, 16vw, 220px);
    height: clamp(55px, 8vw, 110px);
  }
  .flattern {
    animation: flattern 0.6s ease-in-out infinite alternate;
    transform-box: fill-box;
    transform-origin: center;
  }
  .heissluft {
    width: clamp(60px, 8vw, 120px);
    height: clamp(84px, 11vw, 168px);
  }
  .ballon {
    width: clamp(34px, 5vw, 64px);
    height: clamp(60px, 9vw, 112px);
  }
  .blase {
    width: var(--g);
    height: var(--g);
  }
  .blase-innen {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(180, 220, 255, 0.25) 45%, rgba(255, 170, 230, 0.35) 70%, rgba(255, 255, 255, 0.5));
    box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.8);
  }
  .konfetti {
    position: absolute;
    top: -20px;
    width: 10px;
    height: 16px;
    border-radius: 3px;
    animation: konfetti 4s linear infinite;
  }
  .eiswagen {
    position: relative;
    font-size: clamp(40px, 8vh, 84px);
  }
  .schild {
    position: absolute;
    left: 30%;
    top: -55%;
    font-size: 0.5em;
    animation: wackeln 0.6s ease-in-out infinite alternate;
  }
  .spur {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(90, 110, 140, 0.45);
  }
  .blase-text {
    position: absolute;
    left: 70%;
    bottom: 80%;
    padding: 0.2em 0.6em;
    border-radius: 14px;
    background: #fff;
    color: #1f2a44;
    font-family: var(--schrift-titel);
    font-weight: 700;
    font-size: clamp(14px, 2.6vh, 28px);
    white-space: nowrap;
    opacity: 0;
    animation: sagen 3s ease-out forwards;
  }
  .wachsend {
    width: clamp(34px, 5vw, 70px);
    height: clamp(34px, 5vw, 70px);
    translate: -50% -100%;
  }
  .wachsend .figur,
  .wachsend {
    transform-origin: 50% 100%;
  }
  .knospe .emoji {
    font-size: clamp(16px, 3vh, 32px);
  }
  .nest .emoji {
    font-size: clamp(28px, 5vh, 54px);
  }
  .stapel {
    position: relative;
  }
  .obenauf {
    position: absolute;
    left: 15%;
    top: -45%;
    font-size: 0.7em !important;
  }
  .schneemann {
    width: clamp(50px, 7vw, 100px);
    height: clamp(75px, 10.5vw, 150px);
    translate: -50% -80%;
  }
  .frucht {
    width: clamp(26px, 3.4vw, 46px);
    height: clamp(26px, 3.4vw, 46px);
  }
  .schale {
    transition: transform 1s;
    animation: aufplatzen 9s forwards;
  }
  .schale.rechts {
    animation-name: aufplatzen-r;
  }
  .nuss {
    position: absolute;
    left: 50%;
    top: 60%;
    font-size: clamp(14px, 2.4vh, 26px);
    opacity: 0;
    animation: nuss 12s forwards;
  }
  .regen {
    position: absolute;
    inset: 0;
  }
  .regen span {
    position: absolute;
    top: -10%;
    width: 2px;
    height: 22px;
    background: rgba(70, 120, 200, 0.55);
    animation: regnen 0.9s linear infinite;
  }
  .bogen {
    position: absolute;
    left: 10%;
    top: 12%;
    width: 80%;
    height: 50%;
    pointer-events: auto;
  }
  .sprenger {
    width: 10px;
    height: 10px;
  }
  .strahlen {
    position: relative;
    width: 10px;
    height: 10px;
  }
  .duese {
    position: absolute;
    left: -6px;
    top: 2px;
    width: 22px;
    height: 10px;
    border-radius: 6px 6px 2px 2px;
    background: #f2b33d;
  }
  .tropfen {
    position: absolute;
    left: 4px;
    top: 0;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #6cc3ff;
    transform-origin: 2px 2px;
    rotate: var(--w);
    animation: spritzen 1s ease-out infinite;
  }
  .mini-bogen {
    position: absolute;
    left: -60px;
    top: -60px;
    width: 130px;
    height: 70px;
    border-radius: 130px 130px 0 0;
    border: 3px solid transparent;
    border-top-color: rgba(255, 0, 0, 0.3);
    box-shadow: inset 0 3px 0 rgba(255, 220, 0, 0.3), inset 0 6px 0 rgba(0, 200, 0, 0.25), inset 0 9px 0 rgba(0, 120, 255, 0.25);
  }
  .licht {
    position: absolute;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #f6ff8a;
    box-shadow: 0 0 12px 5px rgba(240, 255, 120, 0.7);
    pointer-events: auto;
    animation:
      blinken 1.8s ease-in-out infinite alternate,
      schwirren 5s ease-in-out infinite alternate;
  }
  .blatt {
    position: absolute;
    left: calc(50% - var(--r) * 60%);
    width: 18px;
    height: 12px;
    border-radius: 50% 0 50% 0;
    animation: boee 2.6s ease-in forwards;
  }
  .flocke {
    position: absolute;
    top: -5%;
    width: var(--g);
    height: var(--g);
    border-radius: 50%;
    background: #fff;
    animation: gestoeber 2.4s linear infinite;
  }
  .ball {
    width: 26px;
    height: 26px;
  }
  .schneeball {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #fff, #dde8f2);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  .birne {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--farbe);
    box-shadow: 0 0 10px 3px var(--farbe);
    translate: -50% -50%;
    pointer-events: auto;
    animation: blinken 1.4s ease-in-out infinite alternate;
  }
  .laterne .emoji {
    font-size: clamp(26px, 5vh, 52px);
    filter: drop-shadow(0 0 10px rgba(255, 170, 60, 0.9));
  }
  .pendel {
    position: relative;
    transform-origin: 50% -40%;
    animation: pendeln 1.6s ease-in-out infinite alternate;
  }
  .stab {
    position: absolute;
    left: 50%;
    bottom: 90%;
    width: 2px;
    height: 60%;
    background: #5a3a1a;
  }
  .mond {
    width: clamp(50px, 8vh, 90px);
    height: clamp(50px, 8vh, 90px);
  }

  /* Antippen */
  :global(.ereignisse .hops) {
    animation: hops 0.7s ease-out;
  }
  :global(.ereignisse .platzt) {
    animation: platzen 0.35s ease-out forwards;
  }
  :global(.ereignisse .glitzer) {
    position: absolute;
    translate: -50% -50%;
    font-size: 40px;
    pointer-events: none;
    animation: glitzer 0.9s ease-out forwards;
  }

  @keyframes hops {
    30% {
      translate: 0 -40%;
      scale: 1.15;
    }
    60% {
      translate: 0 0;
      scale: 0.95;
    }
  }
  @keyframes platzen {
    to {
      scale: 1.8;
      opacity: 0;
    }
  }
  @keyframes glitzer {
    from {
      scale: 0.4;
      opacity: 1;
    }
    to {
      scale: 1.6;
      opacity: 0;
    }
  }
  @keyframes schlagen {
    to {
      transform: scaleY(-0.6);
    }
  }
  @keyframes flattern {
    to {
      transform: scaleY(-0.7);
    }
  }
  @keyframes konfetti {
    to {
      top: 105%;
      translate: var(--dx) 0;
      rotate: 720deg;
    }
  }
  @keyframes wackeln {
    to {
      rotate: 12deg;
    }
  }
  @keyframes sagen {
    0% {
      opacity: 0;
      scale: 0.5;
    }
    15% {
      opacity: 1;
      scale: 1.1;
    }
    25%,
    80% {
      opacity: 1;
      scale: 1;
    }
    100% {
      opacity: 0;
    }
  }
  @keyframes aufplatzen {
    0%,
    60% {
      transform: none;
    }
    75%,
    100% {
      transform: translate(-6px, 3px) rotate(-35deg);
    }
  }
  @keyframes aufplatzen-r {
    0%,
    60% {
      transform: none;
    }
    75%,
    100% {
      transform: translate(6px, 3px) rotate(35deg);
    }
  }
  @keyframes nuss {
    0%,
    40% {
      opacity: 0;
    }
    45%,
    58% {
      opacity: 1;
      translate: calc(var(--r) * 10px) 6px;
    }
    62%,
    100% {
      opacity: 0;
    }
  }
  @keyframes regnen {
    to {
      top: 105%;
    }
  }
  @keyframes spritzen {
    from {
      translate: 0 0;
      opacity: 1;
    }
    to {
      translate: 0 -70px;
      opacity: 0;
    }
  }
  @keyframes blinken {
    from {
      opacity: 0.25;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes schwirren {
    to {
      translate: 30px -24px;
    }
  }
  @keyframes boee {
    from {
      left: calc(50% - var(--r) * 65%);
      rotate: 0deg;
    }
    to {
      left: calc(50% + var(--r) * 65%);
      rotate: 900deg;
      translate: 0 40px;
    }
  }
  @keyframes gestoeber {
    to {
      top: 105%;
      translate: -80px 0;
    }
  }
  @keyframes pendeln {
    from {
      rotate: -10deg;
    }
    to {
      rotate: 10deg;
    }
  }
</style>
