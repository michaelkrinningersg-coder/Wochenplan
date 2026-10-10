<script lang="ts">
  // Kleine Überraschungen im Jahreszeiten-Bild – immer nur eine zur Zeit, mit zufälligen Wegen und Pausen dazwischen.
  // Je Jahreszeit zehn Ereignisse, dazu Extras (Geburtstag, Hahn am Morgen, Mondaufgang) und Ereignisse mit Datumsbezug
  // (Ostereier, St. Martin, Rentierschlitten). Antippen einer Figur lässt sie hüpfen oder platzen – ohne das Ruhebild zu beenden.
  import { onMount } from 'svelte'
  import { t } from '../lib/i18n.svelte'
  import { countdowns, geburtstageHeute } from '../lib/countdown'
  import { ruhe } from '../lib/ruhebilder.svelte'
  import { sterne, termineAm } from '../lib/speicher.svelte'
  import { datumKey } from '../lib/zeit'
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
  const istMorgen = (d: Date) => d.getHours() >= 6 && d.getHours() < 10
  const istDaemmerung = (d: Date) => minuten(d) >= 17 * 60 || d.getHours() < 6
  const tagRel = (d: Date, bezug: Date) => tageZwischen(bezug, new Date(d.getFullYear(), d.getMonth(), d.getDate()))
  const istFasching = (d: Date) => {
    const t = tagRel(d, ostersonntag(d.getFullYear()))
    return t >= -52 && t <= -47
  }
  const istMuttertag = (d: Date) => d.getMonth() === 4 && d.getDay() === 0 && d.getDate() > 7 && d.getDate() <= 14
  const istVatertag = (d: Date) => tagRel(d, ostersonntag(d.getFullYear())) === 39
  const istErntedank = (d: Date) => d.getMonth() === 9 && d.getDate() <= 14
  const istNikolaus = (d: Date) => d.getMonth() === 11 && d.getDate() >= 5 && d.getDate() <= 7
  const istSilvester = (d: Date) =>
    (d.getMonth() === 11 && d.getDate() === 31 && d.getHours() >= 17) || (d.getMonth() === 0 && d.getDate() === 1 && d.getHours() < 3)
  /** Anzahl Adventssonntage bis heute (0 außerhalb der Adventszeit) */
  function adventKerzen(d: Date): number {
    const weihnacht = new Date(d.getFullYear(), 11, 25)
    const vierter = new Date(d.getFullYear(), 11, 25 - (weihnacht.getDay() === 0 ? 7 : weihnacht.getDay()))
    const heute = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if (heute > new Date(d.getFullYear(), 11, 26)) return 0
    let n = 0
    for (let i = 3; i >= 0; i--) {
      const so = new Date(vierter)
      so.setDate(vierter.getDate() - i * 7)
      if (heute >= so) n++
    }
    return n
  }
  const terminHeute = (wort: RegExp) => termineAm(datumKey(new Date(app.jetzt))).some((t) => wort.test(t.titel))
  const istFeiertag = (d: Date) =>
    istFasching(d) || istMuttertag(d) || istVatertag(d) || terminHeute(/einschul|schulanfang|laterne|martin/i)
    const fotoListe = () => (app.plan.ruhebilder ?? []).map((id) => ruhe.bilder[id]).filter(Boolean)

  // ---------- Ereignisse ----------
  type Id =
    | 'schmetterling' | 'biene' | 'blumen' | 'hase' | 'nest' | 'regenbogen' | 'ostereier' | 'marienkaefer' | 'storch' | 'knospen'
    | 'ballon' | 'flugzeug' | 'drachen' | 'eiswagen' | 'seifenblasen' | 'gluehwuermchen' | 'sprenger' | 'heissluft'
    | 'pilze' | 'apfel' | 'igel' | 'vogel' | 'eichhoernchen' | 'windboee' | 'zugvoegel' | 'kastanie' | 'laterne'
    | 'schlitten' | 'fuchs' | 'schneemann' | 'rotkehlchen' | 'schneeball' | 'rentiere' | 'lichterkette' | 'gestoeber'
    | 'geburtstag' | 'hahn' | 'mond'
    | 'maulwurf' | 'frosch' | 'pusteblume' | 'enten' | 'waesche' | 'raupe' | 'giesskanne' | 'schnecke' | 'specht' | 'bluetenregen'
    | 'wasserbombe' | 'melone' | 'eule' | 'sternschnuppe' | 'sonnenblume' | 'libelle' | 'gewitter' | 'fahrrad' | 'picknick' | 'segelboot'
    | 'kuerbis' | 'nebel' | 'traktor' | 'blaetterhaufen' | 'spinnennetz' | 'wildgaense' | 'regenschirm' | 'kastanienmann' | 'erntekorb'
    | 'eiszapfen' | 'schlittschuh' | 'iglu' | 'schneeengel' | 'pinguin' | 'kaminrauch' | 'adventskranz' | 'nikolaus' | 'feuerwerk' | 'hasenspuren'
    | 'sternenballon' | 'sternenglas' | 'banner' | 'wochentier' | 'schaefchen' | 'sonnenaufgang' | 'fensterfoto' | 'feiertag'
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
    // Frühling (neu)
    { id: 'maulwurf', jz: ['fruehling', 'sommer'] },
    { id: 'frosch', jz: ['fruehling', 'sommer'] },
    { id: 'pusteblume', jz: ['fruehling', 'sommer'], wann: (d) => !istNacht(d) },
    { id: 'enten', jz: ['fruehling'] },
    { id: 'waesche', jz: ['fruehling', 'sommer'], wann: (d) => !istNacht(d) },
    { id: 'raupe', jz: ['fruehling'] },
    { id: 'giesskanne', jz: ['fruehling', 'sommer'], wann: (d) => !istNacht(d) },
    { id: 'schnecke', jz: ['fruehling', 'herbst'] },
    { id: 'specht', jz: ['fruehling', 'herbst'], wann: (d) => !istNacht(d) },
    { id: 'bluetenregen', jz: ['fruehling'] },
    // Sommer (neu)
    { id: 'wasserbombe', jz: ['sommer'], wann: (d) => !istNacht(d) },
    { id: 'melone', jz: ['sommer'] },
    { id: 'eule', jz: ['sommer', 'herbst', 'winter'], wann: istDaemmerung, gewicht: 2 },
    { id: 'sternschnuppe', jz: 'alle', wann: istNacht, gewicht: 2 },
    { id: 'sonnenblume', jz: ['sommer'], wann: (d) => !istNacht(d) },
    { id: 'libelle', jz: ['sommer'], wann: (d) => !istNacht(d) },
    { id: 'gewitter', jz: ['sommer'] },
    { id: 'fahrrad', jz: ['fruehling', 'sommer', 'herbst'], wann: (d) => !istNacht(d) },
    { id: 'picknick', jz: ['sommer'], wann: (d) => !istNacht(d) },
    { id: 'segelboot', jz: ['sommer'], wann: (d) => !istNacht(d) },
    // Herbst (neu)
    { id: 'kuerbis', jz: ['herbst'], wann: istDaemmerung, gewicht: 2 },
    { id: 'nebel', jz: ['herbst'] },
    { id: 'traktor', jz: ['herbst', 'sommer'], wann: (d) => !istNacht(d) },
    { id: 'blaetterhaufen', jz: ['herbst'], wann: (d) => !istNacht(d) },
    { id: 'spinnennetz', jz: ['herbst'], wann: istMorgen, gewicht: 2 },
    { id: 'wildgaense', jz: ['herbst'], wann: (d) => !istNacht(d) },
    { id: 'regenschirm', jz: ['herbst'] },
    { id: 'kastanienmann', jz: ['herbst'] },
    { id: 'erntekorb', jz: ['herbst'], wann: istErntedank, gewicht: 2 },
    // Winter (neu)
    { id: 'eiszapfen', jz: ['winter'] },
    { id: 'schlittschuh', jz: ['winter'], wann: (d) => !istNacht(d) },
    { id: 'iglu', jz: ['winter'] },
    { id: 'schneeengel', jz: ['winter'] },
    { id: 'pinguin', jz: ['winter'] },
    { id: 'kaminrauch', jz: ['herbst', 'winter'], wann: (d) => jz === 'winter' || d.getMonth() >= 10 },
    { id: 'adventskranz', jz: ['herbst', 'winter'], wann: (d) => adventKerzen(d) > 0, gewicht: 2 },
    { id: 'nikolaus', jz: ['herbst', 'winter'], wann: istNikolaus, gewicht: 3 },
    { id: 'feuerwerk', jz: ['herbst', 'winter'], wann: istSilvester, gewicht: 4 },
    { id: 'hasenspuren', jz: ['winter'] },
    // Extras (neu)
    { id: 'sternenballon', jz: 'alle', wann: () => app.plan.kinder.some((k) => sterne(k.id).heute > 0) },
    { id: 'sternenglas', jz: 'alle', wann: () => app.plan.kinder.some((k) => sterne(k.id).woche > 0) },
    { id: 'banner', jz: 'alle', wann: () => countdowns(14).length > 0, gewicht: 2 },
    { id: 'wochentier', jz: 'alle' },
    { id: 'schaefchen', jz: 'alle', wann: (d) => d.getHours() >= 18 || d.getHours() < 6, gewicht: 2 },
    { id: 'sonnenaufgang', jz: 'alle', wann: istMorgen, gewicht: 2 },
    { id: 'fensterfoto', jz: 'alle', wann: () => fotoListe().length > 0 },
    { id: 'feiertag', jz: 'alle', wann: istFeiertag, gewicht: 4 },
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
  const WOCHENTIERE = ['🐻', '🐢', '🐧', '🐘', '🦒', '🐒', '🦁'] // So, Mo, Di, …
  const FEUER = ['#ff5d5d', '#ffd84a', '#5dd6ff', '#7dff7a', '#ff8fe0', '#ffffff']
  /** Bogenflug (Wurf) von der Seite zu einem Ziel */
  function wurf(e: Ereignis, zielX: number, zielY: number, hoehe = 30): Keyframe[] {
    return Array.from({ length: 9 }, (_, i) => {
      const t = i / 8
      const x = e.links ? -5 + t * (zielX + 5) : 105 - t * (105 - zielX)
      return { left: `${x}%`, top: `${zielY - Math.sin(t * Math.PI) * hoehe}%`, transform: `rotate(${t * 360}deg)`, opacity: 1 }
    })
  }
  const heuteFeiertag = $derived.by(() => {
    const d = new Date(app.jetzt)
    if (istFasching(d)) return 'fasching'
    if (istMuttertag(d)) return 'muttertag'
    if (istVatertag(d)) return 'vatertag'
    if (terminHeute(/einschul|schulanfang/i)) return 'einschulung'
    if (terminHeute(/laterne|martin/i)) return 'laterne'
    return 'fasching'
  })
  const besterSammler = $derived.by(() => {
    const l = app.plan.kinder.map((k) => ({ k, n: sterne(k.id).heute }))
    l.sort((a, b) => b.n - a.n)
    return l[0]
  })
  const wochenSterne = $derived(app.plan.kinder.reduce((summe, k) => summe + sterne(k.id).woche, 0))
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
          <span class="blase-text" style="animation-delay: 1.4s">{t('Kikeriki!')}</span>
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
      <!-- ================= Frühling (neu) ================= -->
      {:else if e.id === 'maulwurf'}
        {@const x = 12 + e.zufall[0] * 72}
        <div class="ding wachsend gross" data-spiel="hops" style="left: {x}%; top: {orte.boden[1]}%" use:animiere={{ k: wachsen(0, 0.88), dauer: 9000 }}>
          <svg class="figur" viewBox="0 0 60 44" width="100%" height="100%">
            <ellipse cx="30" cy="38" rx="28" ry="8" fill="#7a5233" />
            <ellipse cx="30" cy="24" rx="13" ry="14" fill="#4a4a52" />
            <circle cx="25" cy="21" r="3" fill="#fff" /><circle cx="35" cy="21" r="3" fill="#fff" />
            <circle cx="25" cy="21" r="1.5" fill="#111" /><circle cx="35" cy="21" r="1.5" fill="#111" />
            <ellipse cx="30" cy="28" rx="4" ry="3" fill="#ff8fb1" />
            <path d="M18 34 q-4 -2 -6 2 M42 34 q4 -2 6 2" stroke="#ff8fb1" stroke-width="2.5" fill="none" stroke-linecap="round" />
          </svg>
        </div>
      {:else if e.id === 'frosch'}
        {@const ziel = 30 + e.zufall[0] * 40}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 9000 }}>
          <span class="pfuetze" style="left: {ziel}%; top: {orte.boden[1] + 1}%"></span>
          <div
            class="ding"
            data-spiel="hops"
            use:animiere={{
              k: Array.from({ length: 9 }, (_, i) => {
                const t = i / 8
                const x = e.links ? -6 + t * (ziel + 6) : 106 - t * (106 - ziel)
                return pos(x, orte.boden[1] - (i % 2 ? 9 : 0), `scaleX(${e.links ? -1 : 1})`)
              }),
              dauer: 5000,
              ende: false,
            }}
          >
            <span class="figur emoji">🐸</span>
          </div>
          <span class="spritzer" style="left: {ziel}%; top: {orte.boden[1]}%">
            {#each Array.from({ length: 10 }) as _, i (i)}<i style="--w: {i * 36}deg"></i>{/each}
          </span>
        </div>
      {:else if e.id === 'pusteblume'}
        {@const x = 15 + e.zufall[0] * 65}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 12000 }}>
          <div class="ding wachsend" data-spiel="hops" style="left: {x}%; top: {orte.boden[1]}%" use:animiere={{ k: wachsen(0, 0.95), dauer: 12000, ende: false }}>
            <span class="figur stapel">
              <span class="emoji" use:animiere={{ k: sichtbar(0, 0.35), dauer: 12000, ende: false }}>🌼</span>
              <span class="puste obenauf2" use:animiere={{ k: sichtbar(0.35, 0.55), dauer: 12000, ende: false }}></span>
            </span>
          </div>
          {#each Array.from({ length: 12 }) as _, i (i)}
            <span
              class="samen"
              style="left: {x}%; top: {orte.boden[1] - 6}%"
              use:animiere={{
                k: [
                  { opacity: 0, translate: '0 0', offset: 0 },
                  { opacity: 0, translate: '0 0', offset: 0.5 },
                  { opacity: 1, translate: '0 0', offset: 0.55 },
                  { opacity: 0, translate: `${(e.links ? 1 : -1) * (120 + i * 30)}px ${-80 - (i % 4) * 40}px`, offset: 1 },
                ],
                dauer: 12000,
                ende: false,
              }}
            ></span>
          {/each}
        </div>
      {:else if e.id === 'enten'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 21000 }}>
          {#each ['🦆', '🐥', '🐥', '🐥'] as z, i (i)}
            <div class="ding" class:klein={i > 0} data-spiel="hops" use:animiere={{ k: boden(e, 1.5, 24), dauer: 18000, verz: i * 900, ende: false }}>
              <span class="figur emoji">{z}</span>
            </div>
          {/each}
        </div>
      {:else if e.id === 'waesche'}
        <div class="flaeche waesche-leine" use:animiere={{ k: sichtbar(0.03, 0.93), dauer: 13000 }} style="--x0: {orte.dach[0].x - 22}%; --x1: {orte.dach[0].x}%; --y: {orte.dach[0].y + 3}%">
          <span class="leine"></span>
          {#each ['👕', '👖', '🧦', '👗'] as z, i (i)}
            <span class="ding klein" data-spiel="hops" style="left: calc(var(--x0) + {(i + 0.6) * 5}%); top: calc(var(--y) + 3%)">
              <span class="figur emoji pendel" style="animation-delay: {i * 0.2}s">{z}</span>
            </span>
          {/each}
        </div>
      {:else if e.id === 'raupe'}
        {@const ziel = orte.stamm.x}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 18000 }}>
          <div class="ding klein" data-spiel="hops" use:animiere={{ k: [pos(e.links ? -4 : 104, orte.boden[1], `scaleX(${e.links ? -1 : 1})`), { ...pos(ziel, orte.boden[1], `scaleX(${e.links ? -1 : 1})`), offset: 0.55, opacity: 1 }, { ...pos(ziel, orte.boden[1], 'scale(0.4)'), opacity: 0 }], dauer: 11000, ende: false }}>
            <span class="figur emoji">🐛</span>
          </div>
          <div class="ding" data-spiel="hops" use:animiere={{ k: [{ ...pos(ziel, orte.boden[1]), opacity: 0 }, { ...pos(ziel + 4, orte.boden[1] - 15), opacity: 1 }, { ...pos(ziel + 30, orte.boden[0] - 45), opacity: 1 }, { ...pos(e.links ? 115 : -15, 10), opacity: 1 }], dauer: 7000, verz: 11000, ende: false }}>
            <span class="figur emoji">🦋</span>
          </div>
        </div>
      {:else if e.id === 'giesskanne'}
        {@const x = 18 + e.zufall[0] * 60}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 11000 }}>
          {#each [0, 1, 2] as i (i)}
            <div class="ding wachsend" data-spiel="hops" style="left: {x + i * 4}%; top: {orte.boden[1]}%" use:animiere={{ k: [{ transform: 'scale(0.45)', opacity: 1 }, { transform: 'scale(0.45)', offset: 0.3 }, { transform: 'scale(1.15)', offset: 0.8 }, { transform: 'scale(1.15)', opacity: 1, offset: 0.92 }, { transform: 'scale(1.15)', opacity: 0 }], dauer: 11000, ende: false }}>
              <span class="figur emoji">{['🌷', '🌼', '🌸'][i]}</span>
            </div>
          {/each}
          <div class="ding giess" style="left: {x + 7}%; top: {orte.boden[1] - 20}%" use:animiere={{ k: [{ transform: 'rotate(0deg)', opacity: 0 }, { transform: 'rotate(0deg)', opacity: 1, offset: 0.1 }, { transform: 'rotate(-35deg)', offset: 0.25 }, { transform: 'rotate(-35deg)', offset: 0.8 }, { transform: 'rotate(0deg)', opacity: 1, offset: 0.9 }, { transform: 'rotate(0deg)', opacity: 0 }], dauer: 11000, ende: false }}>
            <svg class="figur" viewBox="0 0 60 40" width="100%" height="100%">
              <path d="M18 10 h24 v22 a4 4 0 0 1 -4 4 h-16 a4 4 0 0 1 -4 -4 z" fill="#3b8fd6" />
              <path d="M18 16 L4 8 L2 11 L16 22 Z" fill="#3b8fd6" />
              <path d="M42 14 q12 2 10 14 q-2 4 -10 2" fill="none" stroke="#2a6fa8" stroke-width="3" />
            </svg>
            <span class="giesstropfen">{#each Array.from({ length: 8 }) as _, i (i)}<i style="animation-delay: {i * 0.12}s; left: {i * 3}px"></i>{/each}</span>
          </div>
        </div>
      {:else if e.id === 'schnecke'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 30000 }}>
          {#each Array.from({ length: 24 }) as _, i (i)}
            {@const x = e.links ? 2 + i * 4.2 : 98 - i * 4.2}
            <span class="glitzerspur" style="left: {x}%; top: {orte.boden[1] + 2}%" use:animiere={{ k: sichtbar(i / 25, 0.95), dauer: 30000, ende: false }}></span>
          {/each}
          <div class="ding klein" data-spiel="hops" use:animiere={{ k: boden(e, 0, 4).map((f) => ({ ...f, top: `${orte.boden[1]}%` })), dauer: 30000, ende: false }}>
            <span class="figur emoji">🐌</span>
          </div>
        </div>
      {:else if e.id === 'specht'}
        <div class="ding" data-spiel="hops" style="left: {orte.stamm.x + 2.5}%; top: {orte.stamm.y - 4}%" use:animiere={{ k: sichtbar(0.04, 0.9), dauer: 9000 }}>
          <span class="figur emoji klopfen" style="transform: scaleX(-1)">🐦</span>
          <span class="blase-text" style="animation-delay: 1s">{t('Tock tock tock')}</span>
        </div>
      {:else if e.id === 'bluetenregen'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 8000 }}>
          {#each Array.from({ length: 60 }) as _, i (i)}
            <span class="bluete" style="left: {(i * 43) % 104 - 2}%; animation-delay: {(i % 15) * 0.25}s; background: {['#ffafcc', '#ffc8dd', '#ffffff'][i % 3]}"></span>
          {/each}
        </div>

      <!-- ================= Sommer (neu) ================= -->
      {:else if e.id === 'wasserbombe'}
        {@const zx = 25 + e.zufall[0] * 50}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 5200 }}>
          <div class="ding ball" data-spiel="platzen" use:animiere={{ k: wurf(e, zx, orte.boden[0] - 4).concat([{ left: `${zx}%`, top: `${orte.boden[0] - 4}%`, transform: 'scale(2)', opacity: 0 }]), dauer: 3000, easing: 'ease-in', ende: false }}>
            <span class="figur wasserbombe-b"></span>
          </div>
          <span class="spritzer blau spaet" style="left: {zx}%; top: {orte.boden[0] - 4}%">
            {#each Array.from({ length: 12 }) as _, i (i)}<i style="--w: {i * 30}deg"></i>{/each}
          </span>
        </div>
      {:else if e.id === 'melone'}
        {@const x = 20 + e.zufall[0] * 60}
        <div class="ding melone" data-spiel="hops" style="left: {x}%; top: {orte.boden[1]}%" use:animiere={{ k: sichtbar(0.03, 0.92), dauer: 9000 }}>
          <svg class="figur" viewBox="0 0 60 40" width="100%" height="100%">
            <g class="schale links"><path d="M30 6 A16 16 0 0 0 30 38 Z" fill="#3f9b35" /><path d="M29 9 A13 13 0 0 0 29 35 Z" fill="#ff5d6b" /><circle cx="24" cy="18" r="1.3" fill="#222" /><circle cx="22" cy="26" r="1.3" fill="#222" /></g>
            <g class="schale rechts"><path d="M30 6 A16 16 0 0 1 30 38 Z" fill="#4caf50" /><path d="M31 9 A13 13 0 0 1 31 35 Z" fill="#ff5d6b" /><circle cx="36" cy="18" r="1.3" fill="#222" /><circle cx="38" cy="27" r="1.3" fill="#222" /></g>
          </svg>
        </div>
      {:else if e.id === 'eule'}
        <div class="ding" data-spiel="hops" style="left: {orte.krone.x + 2}%; top: {orte.krone.y}%" use:animiere={{ k: sichtbar(0.04, 0.9), dauer: 10000 }}>
          <span class="figur emoji wippen">🦉</span>
          <span class="blase-text" style="animation-delay: 2s">{t('Uhu!')}</span>
        </div>
      {:else if e.id === 'sternschnuppe'}
        {@const y = 6 + e.zufall[0] * 20}
        <div
          class="ding schnuppe"
          data-spiel="hops"
          use:animiere={{
            k: [
              { left: e.links ? '5%' : '95%', top: `${y}%`, opacity: 0, transform: `rotate(${e.links ? 20 : 160}deg)` },
              { left: e.links ? '20%' : '80%', top: `${y + 4}%`, opacity: 1, transform: `rotate(${e.links ? 20 : 160}deg)`, offset: 0.2 },
              { left: e.links ? '70%' : '30%', top: `${y + 18}%`, opacity: 0, transform: `rotate(${e.links ? 20 : 160}deg)` },
            ],
            dauer: 2600,
            easing: 'ease-in',
          }}
        >
          <span class="figur schweif"></span>
        </div>
      {:else if e.id === 'sonnenblume'}
        {@const x = 15 + e.zufall[0] * 65}
        <div class="ding wachsend hoch" data-spiel="hops" style="left: {x}%; top: {orte.boden[1]}%" use:animiere={{ k: wachsen(0, 0.9), dauer: 13000 }}>
          <span class="figur stapel">
            <span class="stiel"></span>
            <span class="emoji dreh">🌻</span>
          </span>
        </div>
      {:else if e.id === 'libelle'}
        <div
          class="ding libelle"
          data-spiel="hops"
          use:animiere={{
            k: Array.from({ length: 9 }, (_, i) => {
              const t = i / 8
              return pos(e.links ? -8 + t * 116 : 108 - t * 116, 25 + ((i * 37 + e.zufall[0] * 50) % 30), `scaleX(${e.links ? -1 : 1})`)
            }),
            dauer: 9000,
            easing: 'steps(16, jump-none)',
          }}
        >
          <svg class="figur" viewBox="0 0 70 40" width="100%" height="100%">
            <rect x="8" y="18" width="50" height="4" rx="2" fill="#2a8fa8" />
            <circle cx="8" cy="20" r="4.5" fill="#1f6f86" />
            <g class="surren"><ellipse cx="24" cy="10" rx="12" ry="5" fill="#bfe8ff" opacity="0.8" /><ellipse cx="24" cy="30" rx="12" ry="5" fill="#bfe8ff" opacity="0.8" /><ellipse cx="38" cy="11" rx="10" ry="4" fill="#bfe8ff" opacity="0.8" /><ellipse cx="38" cy="29" rx="10" ry="4" fill="#bfe8ff" opacity="0.8" /></g>
          </svg>
        </div>
      {:else if e.id === 'gewitter'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 12000 }}>
          <div class="abdunkeln" use:animiere={{ k: sichtbar(0.08, 0.8), dauer: 12000, ende: false }}></div>
          <div class="ding gewitterwolke" data-spiel="hops" use:animiere={{ k: [pos(e.links ? -20 : 120, 12), { ...pos(50, 14), offset: 0.3 }, { ...pos(50, 14), offset: 0.7 }, pos(e.links ? 120 : -20, 12)], dauer: 12000, ende: false }}>
            <svg class="figur" viewBox="0 0 120 70" width="100%" height="100%">
              <ellipse cx="40" cy="38" rx="30" ry="20" fill="#5d6a80" /><ellipse cx="70" cy="30" rx="32" ry="24" fill="#4c586c" /><ellipse cx="95" cy="42" rx="22" ry="16" fill="#5d6a80" />
              <path class="blitzstrahl" d="M66 50 L56 64 L64 64 L54 80 L74 58 L65 58 L72 50 Z" fill="#ffd84a" />
            </svg>
          </div>
          <div class="regen spaet2">{#each Array.from({ length: 40 }) as _, i (i)}<span style="left: {30 + ((i * 37) % 40)}%; animation-delay: {((i * 13) % 10) / 10}s"></span>{/each}</div>
          <div class="flash"></div>
        </div>
      {:else if e.id === 'fahrrad'}
        <div class="ding" data-spiel="hops" use:animiere={{ k: boden(e, 0, 8), dauer: 9000 }}>
          <span class="figur emoji gross">🚴</span>
          <span class="blase-text" style="animation-delay: 2s">{t('Kling kling!')}</span>
        </div>
      {:else if e.id === 'picknick'}
        {@const x = 22 + e.zufall[0] * 50}
        <div class="flaeche" use:animiere={{ k: sichtbar(0.03, 0.94), dauer: 16000 }}>
          <span class="decke" style="left: {x}%; top: {orte.boden[1] - 1}%"></span>
          <span class="ding" style="left: {x + 3}%; top: {orte.boden[1] - 3}%" data-spiel="hops"><span class="figur emoji">🧺</span></span>
          {#each Array.from({ length: 6 }) as _, i (i)}
            <span class="ameise" style="top: {orte.boden[1] + 3}%" use:animiere={{ k: [{ left: `${x + 4}%` }, { left: `${e.links ? 105 : -5}%` }], dauer: 9000, verz: 2500 + i * 700, ende: false }}>{#if i % 2 === 0}<b></b>{/if}</span>
          {/each}
        </div>
      {:else if e.id === 'segelboot'}
        {@const x = 25 + e.zufall[0] * 45}
        <div class="flaeche" use:animiere={{ k: sichtbar(0.02, 0.94), dauer: 16000 }}>
          <span class="see" style="left: {x}%; top: {orte.boden[0] + 2}%"></span>
          <div class="ding" data-spiel="hops" use:animiere={{ k: [pos(x - 9, orte.boden[0]), { ...pos(x + 9, orte.boden[0]), offset: 0.5 }, pos(x - 9, orte.boden[0])], dauer: 16000, ende: false }}>
            <span class="figur emoji schaukeln">⛵</span>
          </div>
        </div>

      <!-- ================= Herbst (neu) ================= -->
      {:else if e.id === 'kuerbis'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 12000 }}>
          {#each stellen(e, 3) as s, i (i)}
            <div class="ding wachsend" data-spiel="hops" style="left: {s.x}%; top: {s.y}%" use:animiere={{ k: wachsen(i), dauer: 12000, ende: false }}>
              <span class="figur emoji leuchten">🎃</span>
            </div>
          {/each}
        </div>
      {:else if e.id === 'nebel'}
        <div class="flaeche" use:animiere={{ k: sichtbar(0.1, 0.8), dauer: 18000 }}>
          {#each [35, 50, 62, 72] as y, i (i)}<span class="nebelband" style="top: {y}%; animation-delay: {-i * 3}s"></span>{/each}
        </div>
      {:else if e.id === 'traktor'}
        <div class="ding" data-spiel="hops" use:animiere={{ k: boden(e, 0, 8), dauer: 14000 }}>
          <span class="figur emoji reihe gross">🚜<span class="anhaenger">🍎🍎🍎</span></span>
        </div>
      {:else if e.id === 'blaetterhaufen'}
        {@const x = 25 + e.zufall[0] * 50}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 10000 }}>
          {#each Array.from({ length: 24 }) as _, i (i)}
            <span
              class="haufenblatt"
              style="left: {x + ((i * 7) % 9) - 4}%; top: {orte.boden[1] - (i % 4)}%; background: {['#e8752a', '#f2b33d', '#c94a2a', '#a8582a'][i % 4]}; --dx: {((i * 53) % 200) - 100}px; --dy: {-60 - ((i * 31) % 120)}px"
            ></span>
          {/each}
          <div class="ding" data-spiel="hops" use:animiere={{ k: [...wurf(e, x, orte.boden[1] - 2, 20).map((f): Keyframe => ({ ...f, transform: 'none' })), { left: `${x}%`, top: `${orte.boden[1] - 2}%`, transform: 'none', opacity: 0 }], dauer: 3500, ende: false }}>
            <span class="figur emoji">🧒</span>
          </div>
        </div>
      {:else if e.id === 'spinnennetz'}
        <div class="ding netz" data-spiel="hops" style="left: {orte.stamm.x + 6}%; top: {orte.stamm.y - 2}%" use:animiere={{ k: sichtbar(0.04, 0.92), dauer: 12000 }}>
          <svg class="figur" viewBox="0 0 60 60" width="100%" height="100%">
            {#each Array.from({ length: 8 }) as _, i (i)}<line x1="30" y1="30" x2={30 + Math.cos((i * Math.PI) / 4) * 28} y2={30 + Math.sin((i * Math.PI) / 4) * 28} stroke="#ffffff" stroke-width="0.8" />{/each}
            {#each [8, 14, 20, 26] as r (r)}<circle cx="30" cy="30" {r} fill="none" stroke="#ffffff" stroke-width="0.7" />{/each}
            {#each Array.from({ length: 10 }) as _, i (i)}<circle class="tau" style="animation-delay: {i * 0.3}s" cx={30 + Math.cos(i * 1.7) * (8 + (i % 4) * 6)} cy={30 + Math.sin(i * 1.7) * (8 + (i % 4) * 6)} r="1.4" fill="#cfefff" />{/each}
          </svg>
          <span class="spinne">🕷️</span>
        </div>
      {:else if e.id === 'wildgaense'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 16000 }}>
          {#each [0, 1, 2] as i (i)}
            <div
              class="ding"
              data-spiel="hops"
              use:animiere={{
                k: [
                  pos(e.links ? -8 : 108, 12 + i * 4, `scaleX(${e.links ? -1 : 1})`),
                  { ...pos(40 + i * 8, orte.boden[0] + i, `scaleX(${e.links ? -1 : 1})`), offset: 0.5 },
                  { ...pos(42 + i * 8, orte.boden[0] + i, `scaleX(${e.links ? -1 : 1})`), offset: 0.85, opacity: 1 },
                  { ...pos(42 + i * 8, orte.boden[0] + i, `scaleX(${e.links ? -1 : 1})`), opacity: 0 },
                ],
                dauer: 15000,
                verz: i * 400,
                ende: false,
              }}
            >
              <span class="figur emoji">🦆</span>
            </div>
          {/each}
        </div>
      {:else if e.id === 'regenschirm'}
        <div class="ding" data-spiel="hops" use:animiere={{ k: flug(e, [15, 50], 10, 10, 0).map((f, i) => ({ ...f, transform: `rotate(${i * 70}deg)` })), dauer: 9000 }}>
          <span class="figur emoji gross">☂️</span>
        </div>
      {:else if e.id === 'kastanienmann'}
        <div class="ding kastanienmann" data-spiel="hops" use:animiere={{ k: boden(e, 1, 20), dauer: 18000 }}>
          <svg class="figur watscheln" viewBox="0 0 40 60" width="100%" height="100%">
            <path d="M14 42 L10 58 M26 42 L30 58 M8 30 L1 38 M32 30 L39 22" stroke="#d9b98a" stroke-width="2.5" stroke-linecap="round" />
            <ellipse cx="20" cy="32" rx="13" ry="12" fill="#7a3f1d" />
            <ellipse cx="16" cy="28" rx="4" ry="3" fill="#fff" opacity="0.25" />
            <circle cx="20" cy="12" r="9" fill="#8a4a24" />
            <circle cx="17" cy="11" r="1.4" fill="#fff" /><circle cx="23" cy="11" r="1.4" fill="#fff" />
            <path d="M16 15 q4 3 8 0" fill="none" stroke="#fff" stroke-width="1.2" />
          </svg>
        </div>
      {:else if e.id === 'erntekorb'}
        {@const x = 30 + e.zufall[0] * 40}
        <div class="flaeche" use:animiere={{ k: sichtbar(0.02, 0.94), dauer: 14000 }}>
          {#each ['🍎', '🍐', '🥕', '🎃', '🌽', '🍇'] as z, i (i)}
            <span class="ding klein" style="left: {x + (i % 3) * 1.5 - 1.5}%" use:animiere={{ k: [{ top: '-8%', opacity: 1 }, { top: `${orte.boden[1] - 4 - Math.floor(i / 3) * 3}%`, opacity: 1, offset: 0.15 }, { top: `${orte.boden[1] - 4 - Math.floor(i / 3) * 3}%`, opacity: 1 }], dauer: 11000, verz: 800 + i * 1200, easing: 'ease-in', ende: false }}>
              <span class="figur emoji">{z}</span>
            </span>
          {/each}
          <span class="ding" style="left: {x}%; top: {orte.boden[1]}%" data-spiel="hops"><span class="figur emoji gross">🧺</span></span>
        </div>

      <!-- ================= Winter (neu) ================= -->
      {:else if e.id === 'eiszapfen'}
        <div class="flaeche" use:animiere={{ k: sichtbar(0.02, 0.94), dauer: 14000 }}>
          {#each Array.from({ length: 7 }) as _, i (i)}
            {@const t = i / 6}
            <span class="zapfen" data-spiel="hops" style="left: {orte.dach[0].x + (orte.dach[2].x - orte.dach[0].x) * t}%; top: {orte.dach[0].y}%; animation-delay: {i * 0.4}s; --l: {14 + (i % 3) * 8}px">
              <i style="animation-delay: {2 + i * 0.7}s"></i>
            </span>
          {/each}
        </div>
      {:else if e.id === 'schlittschuh'}
        {@const x = 30 + e.zufall[0] * 40}
        <div class="flaeche" use:animiere={{ k: sichtbar(0.02, 0.94), dauer: 16000 }}>
          <span class="see eis" style="left: {x}%; top: {orte.boden[0] + 2}%"></span>
          <div class="ding" data-spiel="hops" use:animiere={{ k: Array.from({ length: 17 }, (_, i) => pos(x + Math.cos((i / 16) * Math.PI * 4) * 9, orte.boden[0] + 1 + Math.sin((i / 16) * Math.PI * 4) * 2.5, `scaleX(${Math.sin((i / 16) * Math.PI * 4) > 0 ? -1 : 1})`)), dauer: 16000, ende: false }}>
            <span class="figur emoji">⛸️</span>
          </div>
        </div>
      {:else if e.id === 'iglu'}
        {@const x = 15 + e.zufall[0] * 60}
        <div class="ding iglu" data-spiel="hops" style="left: {x}%; top: {orte.boden[1]}%" use:animiere={{ k: sichtbar(0, 0.93), dauer: 14000 }}>
          <svg class="figur" viewBox="0 0 80 50" width="100%" height="100%">
            {#each [0, 1, 2, 3] as r (r)}
              <g use:animiere={{ k: wachsen(r * 1.4, 0.93), dauer: 14000, ende: false }} style="transform-origin: 40px {48 - r * 10}px">
                <path d="M{6 + r * 7} {48 - r * 10} L{74 - r * 7} {48 - r * 10} L{70 - r * 8} {38 - r * 10} L{10 + r * 8} {38 - r * 10} Z" fill="#f4f9fd" stroke="#bcd2e4" stroke-width="1" />
              </g>
            {/each}
            <path d="M32 48 V38 a8 8 0 0 1 16 0 V48 Z" fill="#7a8fa6" />
          </svg>
        </div>
      {:else if e.id === 'schneeengel'}
        {@const x = 20 + e.zufall[0] * 55}
        <div class="ding engel" data-spiel="hops" style="left: {x}%; top: {orte.boden[1]}%" use:animiere={{ k: [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'scale(1)', offset: 0.2 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }], dauer: 10000 }}>
          <svg class="figur" viewBox="0 0 60 50" width="100%" height="100%">
            <path d="M30 6 C22 6 22 16 30 16 C38 16 38 6 30 6 Z M30 16 C10 4 2 18 12 26 C6 34 18 46 30 40 C42 46 54 34 48 26 C58 18 50 4 30 16 Z" fill="#dce8f2" stroke="#b6cbe0" stroke-width="1.5" />
          </svg>
          <span class="glitzer-fix">✨</span>
        </div>
      {:else if e.id === 'pinguin'}
        <div class="ding" data-spiel="hops" use:animiere={{ k: boden(e, 0, 6).map((f) => ({ ...f, transform: `${f.transform} rotate(${e.links ? 80 : -80}deg)` })), dauer: 6000, easing: 'ease-in' }}>
          <span class="figur emoji">🐧</span>
        </div>
      {:else if e.id === 'kaminrauch'}
        <div class="flaeche" use:animiere={{ k: sichtbar(0.02, 0.94), dauer: 14000 }}>
          <span class="kamin" style="left: {orte.dach[1].x + (orte.dach[2].x - orte.dach[1].x) * 0.5}%; top: {orte.dach[1].y + (orte.dach[2].y - orte.dach[1].y) * 0.35}%"></span>
          {#each Array.from({ length: 8 }) as _, i (i)}
            <span class="rauch" style="left: {orte.dach[1].x + (orte.dach[2].x - orte.dach[1].x) * 0.5}%; top: {orte.dach[1].y + (orte.dach[2].y - orte.dach[1].y) * 0.35 - 2}%; animation-delay: {i * 0.9}s"></span>
          {/each}
        </div>
      {:else if e.id === 'adventskranz'}
        {@const n = adventKerzen(new Date(app.jetzt))}
        <div class="ding kranz" data-spiel="hops" style="left: {orte.dach[2].x + 6}%; top: {orte.boden[0] - 2}%" use:animiere={{ k: sichtbar(0.03, 0.92), dauer: 12000 }}>
          <svg class="figur" viewBox="0 0 100 60" width="100%" height="100%">
            <ellipse cx="50" cy="46" rx="44" ry="12" fill="#2f7d2a" /><ellipse cx="50" cy="44" rx="34" ry="7" fill="#3f9b35" />
            {#each [0, 1, 2, 3] as i (i)}
              {@const cx = 20 + i * 20}
              <rect x={cx - 4} y="20" width="8" height="22" rx="2" fill="#d93a2b" />
              {#if i < n}<path class="flamme" style="animation-delay: {i * 0.2}s" d="M{cx} 8 q5 6 0 12 q-5 -6 0 -12 Z" fill="#ffc83d" />{/if}
            {/each}
            {#each [12, 30, 48, 66, 84] as x (x)}<circle cx={x} cy="50" r="2.6" fill="#e8452b" />{/each}
          </svg>
        </div>
      {:else if e.id === 'nikolaus'}
        <div class="ding stiefel" data-spiel="hops" style="left: {orte.dach[1].x}%; top: {orte.boden[0] + 1}%" use:animiere={{ k: sichtbar(0.03, 0.92), dauer: 11000 }}>
          <span class="figur stapel">
            <span class="emoji gross">👢</span>
            {#each ['🍫', '🍊', '🍬', '🥜'] as z, i (i)}<span class="emoji klein huepfend" style="animation-delay: {1 + i * 0.6}s; --dx: {(i - 1.5) * 18}px">{z}</span>{/each}
          </span>
        </div>
      {:else if e.id === 'feuerwerk'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 12000 }}>
          {#each Array.from({ length: 6 }) as _, r (r)}
            <span class="rakete" style="left: {15 + r * 14 + e.zufall[r] * 6}%; --hoehe: {10 + (r % 3) * 9}%; animation-delay: {r * 1.6}s">
              {#each Array.from({ length: 14 }) as _, i (i)}<i style="--w: {i * (360 / 14)}deg; background: {FEUER[(r + i) % 6]}; animation-delay: {r * 1.6 + 1}s"></i>{/each}
            </span>
          {/each}
        </div>
      {:else if e.id === 'hasenspuren'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 14000 }}>
          {#each Array.from({ length: 10 }) as _, i (i)}
            {@const x = e.links ? 6 + i * 9 : 94 - i * 9}
            <span class="hasenspur" style="left: {x}%; top: {orte.boden[1] + 2}%" use:animiere={{ k: sichtbar(i / 11, 0.95), dauer: 14000, ende: false }}><i></i><i></i><b></b><b></b></span>
          {/each}
          <div class="ding" data-spiel="hops" use:animiere={{ k: boden(e, 4, 20).map((f) => ({ ...f, top: `${orte.boden[1] - 2}%` })), dauer: 14000, ende: false }}>
            <span class="figur emoji">🐇</span>
          </div>
        </div>

      <!-- ================= Extras (neu) ================= -->
      {:else if e.id === 'sternenballon'}
        {@const b = besterSammler}
        <div class="ding namensballon" data-spiel="platzen" use:animiere={{ k: Array.from({ length: 7 }, (_, j) => ({ left: `${30 + e.zufall[0] * 40 + Math.sin(j) * 4}%`, top: `${108 - (j / 6) * 125}%` })), dauer: 16000 }}>
          <span class="figur ballon-name" style="--farbe: {b?.k.farbe ?? '#e8452b'}">
            <span>★ Super!</span>
            <small>{b?.n ?? 0} Sterne heute</small>
          </span>
        </div>
      {:else if e.id === 'sternenglas'}
        {@const n = Math.min(wochenSterne, 40)}
        <div class="ding glas" data-spiel="hops" style="left: {orte.dach[2].x + 5}%; top: {orte.boden[0] - 4}%" use:animiere={{ k: sichtbar(0.03, 0.93), dauer: 14000 }}>
          <span class="figur glas-koerper">
            {#each Array.from({ length: n }) as _, i (i)}<i style="left: {8 + ((i * 37) % 80)}%; bottom: {4 + Math.floor(i / 6) * 11}%; animation-delay: {0.5 + i * 0.12}s">★</i>{/each}
          </span>
          <span class="glas-zahl">{wochenSterne} ★ diese Woche</span>
        </div>
      {:else if e.id === 'banner'}
        {@const c = countdowns(14)[0]}
        <div class="ding banner" data-spiel="hops" use:animiere={{ k: flug(e, [8, 22], 2, 6, 2).map((f) => ({ ...f, transform: 'none' })), dauer: 16000 }}>
          <span class="figur reihe banner-zug">
            {#if e.links}<span class="banner-tuch">{t('Noch {n}× schlafen: {titel}', { n: c?.tage ?? 0, titel: c?.titel ?? '' })}</span><span class="emoji" style="transform: scaleX(-1)">✈️</span>
            {:else}<span class="emoji">✈️</span><span class="banner-tuch">{t('Noch {n}× schlafen: {titel}', { n: c?.tage ?? 0, titel: c?.titel ?? '' })}</span>{/if}
          </span>
        </div>
      {:else if e.id === 'wochentier'}
        <div class="ding" data-spiel="hops" use:animiere={{ k: boden(e, 2, 18), dauer: 16000 }}>
          <span class="figur emoji gross">{WOCHENTIERE[new Date(app.jetzt).getDay()]}</span>
        </div>
      {:else if e.id === 'schaefchen'}
        {@const x = 30 + e.zufall[0] * 40}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 16000 }}>
          <span class="zaun" style="left: {x}%; top: {orte.boden[1] - 1}%"></span>
          {#each [0, 1, 2, 3] as i (i)}
            <div class="ding" data-spiel="hops" use:animiere={{ k: [pos(e.links ? -8 : 108, orte.boden[1] - 2), { ...pos(x - (e.links ? 6 : -6), orte.boden[1] - 2), offset: 0.4 }, { ...pos(x, orte.boden[1] - 16), offset: 0.5 }, { ...pos(x + (e.links ? 6 : -6), orte.boden[1] - 2), offset: 0.6 }, pos(e.links ? 108 : -8, orte.boden[1] - 2)], dauer: 9000, verz: i * 2000, ende: false }}>
              <span class="figur emoji">🐑</span>
            </div>
          {/each}
          <span class="zzz" style="left: {x}%; top: {orte.boden[0] - 22}%">1, 2, 3 … 💤</span>
        </div>
      {:else if e.id === 'sonnenaufgang'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 14000 }}>
          <div class="ding aufgehen" data-spiel="hops" use:animiere={{ k: [{ ...pos(e.links ? 22 : 78, orte.boden[0] + 4), opacity: 0 }, { ...pos(e.links ? 22 : 78, orte.boden[0] + 2), opacity: 1, offset: 0.1 }, { ...pos(e.links ? 24 : 76, orte.boden[0] - 30), opacity: 1, offset: 0.85 }, { ...pos(e.links ? 24 : 76, orte.boden[0] - 30), opacity: 0 }], dauer: 14000, easing: 'ease-out', ende: false }}>
            <span class="figur sonne-gross"></span>
          </div>
          {#each ['🎵', '🎶', '🐦', '🎵'] as z, i (i)}
            <span class="note" style="left: {orte.krone.x + (i - 1.5) * 4}%; top: {orte.krone.y - 6}%; animation-delay: {3 + i * 1.2}s">{z}</span>
          {/each}
        </div>
      {:else if e.id === 'fensterfoto'}
        {@const f = fotoListe()[Math.floor(e.zufall[0] * fotoListe().length)]}
        <div class="ding fensterbild" data-spiel="hops" style="left: {orte.dach[1].x}%; top: {orte.dach[1].y - 14}%" use:animiere={{ k: [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'scale(1)', offset: 0.12 }, { opacity: 1, offset: 0.88 }, { opacity: 0, transform: 'scale(0.3)' }], dauer: 12000 }}>
          <span class="figur rahmen"><img src={f} alt="" /></span>
        </div>
      {:else if e.id === 'feiertag'}
        <div class="flaeche" use:animiere={{ k: [{ opacity: 1 }, { opacity: 1 }], dauer: 14000 }}>
          {#if heuteFeiertag === 'fasching'}
            {#each Array.from({ length: 18 }) as _, i (i)}
              <span class="luftschlange" style="left: {(i * 23) % 100}%; background: {BALLON_FARBEN[i % 6]}; animation-delay: {(i % 9) * 0.5}s"></span>
            {/each}
            <span class="feier-text">{t('Helau! Alaaf! 🎭')}</span>
          {:else if heuteFeiertag === 'muttertag' || heuteFeiertag === 'vatertag'}
            <div class="ding" data-spiel="platzen" use:animiere={{ k: Array.from({ length: 7 }, (_, j) => ({ left: `${50 + Math.sin(j) * 6}%`, top: `${108 - (j / 6) * 125}%` })), dauer: 14000, ende: false }}>
              <span class="figur emoji riesig">❤️</span>
            </div>
            <span class="feier-text">{heuteFeiertag === 'muttertag' ? t('Alles Liebe zum Muttertag!') : t('Alles Liebe zum Vatertag!')}</span>
          {:else if heuteFeiertag === 'einschulung'}
            <div class="ding" data-spiel="hops" style="left: 50%; top: {orte.boden[0] - 8}%" use:animiere={{ k: wachsen(0, 0.92), dauer: 14000, ende: false }}>
              <span class="figur emoji riesig">🎒</span>
            </div>
            <span class="feier-text">{t('Hurra, Schulanfang! 🎉')}</span>
          {:else}
            {#each [0, 1, 2, 3] as i (i)}
              <div class="ding laterne" data-spiel="hops" use:animiere={{ k: boden(e, 0, 10).map((f) => ({ ...f, top: `${orte.boden[0] - 6}%`, transform: 'none' })), dauer: 13000, verz: i * 1200, ende: false }}>
                <span class="figur pendel"><span class="stab"></span><span class="emoji">🏮</span></span>
              </div>
            {/each}
            <span class="feier-text">{t('Laterne, Laterne … 🏮')}</span>
          {/if}
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


  /* ---------- neue Überraschungen ---------- */
  .giess {
    width: clamp(60px, 8vw, 110px);
    height: clamp(40px, 5.4vw, 74px);
  }
  .giesstropfen {
    position: absolute;
    left: 2%;
    top: 30%;
  }
  .giesstropfen i {
    position: absolute;
    width: 4px;
    height: 8px;
    border-radius: 50%;
    background: #6cc3ff;
    opacity: 0;
    animation: giessen 0.8s linear infinite;
  }
  @keyframes giessen {
    0% {
      opacity: 1;
      translate: 0 0;
    }
    100% {
      opacity: 0;
      translate: -6px 60px;
    }
  }
  .emoji.gross {
    font-size: clamp(40px, 8vh, 86px);
  }
  .emoji.riesig {
    font-size: clamp(70px, 16vh, 170px);
  }
  .wachsend.gross {
    width: clamp(60px, 8vw, 120px);
    height: clamp(44px, 6vw, 88px);
  }
  .pfuetze,
  .see {
    position: absolute;
    width: 14vw;
    height: 3.2vw;
    translate: -50% -50%;
    border-radius: 50%;
    background: radial-gradient(ellipse, #8fd0ff, #4a9ad6);
  }
  .see {
    width: 26vw;
    height: 6vw;
  }
  .see.eis {
    background: radial-gradient(ellipse, #eaf6ff, #a9d3f0);
    box-shadow: inset 0 0 0 2px #fff;
  }
  .spritzer {
    position: absolute;
    width: 0;
    height: 0;
  }
  .spritzer i {
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #6cc3ff;
    rotate: var(--w);
    opacity: 0;
    animation: spritz 0.9s ease-out 4.9s forwards;
  }
  .spritzer.blau.spaet i {
    background: #3b8fd6;
    animation-delay: 2.9s;
  }
  .puste {
    display: block;
    width: clamp(30px, 5vh, 54px);
    height: clamp(30px, 5vh, 54px);
    border-radius: 50%;
    background: radial-gradient(circle, #ffffff 30%, rgba(255, 255, 255, 0.4) 60%, transparent 70%);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.7);
  }
  .obenauf2 {
    position: absolute;
    left: 0;
    top: 0;
  }
  .samen {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 4px #fff;
  }
  .waesche-leine {
    pointer-events: none;
  }
  .leine {
    position: absolute;
    left: var(--x0);
    top: var(--y);
    width: calc(var(--x1) - var(--x0));
    height: 2px;
    background: #6b5a4a;
  }
  .glitzerspur {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.9);
  }
  .klopfen {
    animation: klopfen 0.25s ease-in-out infinite alternate;
  }
  .bluete {
    position: absolute;
    top: -4%;
    width: 12px;
    height: 10px;
    border-radius: 50% 0 50% 0;
    animation: bluetenfall 3.6s linear infinite;
  }
  .wasserbombe-b {
    width: 100%;
    height: 100%;
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    background: radial-gradient(circle at 35% 35%, #9fe0ff, #2a7fd6);
  }
  .melone {
    width: clamp(56px, 7vw, 100px);
    height: clamp(38px, 4.6vw, 66px);
  }
  .melone .schale {
    animation-duration: 9s;
  }
  .wippen {
    animation: wippen 1.2s ease-in-out infinite alternate;
  }
  .schnuppe {
    width: 160px;
    height: 4px;
  }
  .schweif {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, transparent, #fff8c9 70%, #ffffff);
    box-shadow: 0 0 10px #fff8c9;
  }
  .hoch {
    width: clamp(40px, 6vw, 80px);
    height: clamp(90px, 18vh, 200px);
  }
  .stiel {
    position: absolute;
    left: 50%;
    top: 30%;
    width: 5px;
    height: 120%;
    translate: -50% 0;
    background: #3f9b35;
  }
  .dreh {
    position: relative;
    font-size: clamp(36px, 7vh, 76px);
    animation: drehen 6s ease-in-out infinite alternate;
  }
  .libelle {
    width: clamp(60px, 8vw, 110px);
    height: clamp(34px, 4.6vw, 64px);
  }
  .surren {
    animation: surren 0.08s linear infinite alternate;
    transform-origin: 30px 20px;
  }
  .abdunkeln {
    position: absolute;
    inset: 0;
    background: rgba(40, 50, 70, 0.35);
  }
  .gewitterwolke {
    width: clamp(160px, 26vw, 360px);
    height: clamp(94px, 15vw, 210px);
  }
  .blitzstrahl {
    opacity: 0;
    animation: blitzen 12s infinite;
  }
  .flash {
    position: absolute;
    inset: 0;
    background: #fff;
    opacity: 0;
    pointer-events: none;
    animation: blitzen 12s infinite;
  }
  .spaet2 {
    opacity: 0;
    animation: einaus 12s forwards;
  }
  .decke {
    position: absolute;
    width: 16vw;
    height: 4vw;
    translate: -50% -50%;
    transform: perspective(300px) rotateX(55deg);
    background: repeating-conic-gradient(#e8452b 0 25%, #ffffff 0 50%) 0 0 / 28px 28px;
    border-radius: 6px;
  }
  .ameise {
    position: absolute;
    width: 8px;
    height: 5px;
    border-radius: 3px;
    background: #222;
  }
  .ameise b {
    position: absolute;
    top: -6px;
    left: 0;
    width: 7px;
    height: 6px;
    border-radius: 2px;
    background: #f6e3b0;
  }
  .schaukeln {
    animation: schaukeln 2s ease-in-out infinite alternate;
  }
  .leuchten {
    filter: drop-shadow(0 0 14px rgba(255, 150, 40, 0.95));
  }
  .nebelband {
    position: absolute;
    left: -40%;
    width: 180%;
    height: 12%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.55);
    filter: blur(16px);
    animation: nebelziehen 18s ease-in-out infinite alternate;
  }
  .anhaenger {
    font-size: 0.5em;
    margin-left: -0.2em;
    vertical-align: bottom;
  }
  .haufenblatt {
    position: absolute;
    width: 16px;
    height: 11px;
    border-radius: 50% 0 50% 0;
    animation: haufen 10s ease-out forwards;
  }
  .netz {
    width: clamp(70px, 10vw, 140px);
    height: clamp(70px, 10vw, 140px);
  }
  .tau {
    animation: blinken 1.6s ease-in-out infinite alternate;
  }
  .spinne {
    position: absolute;
    left: 55%;
    top: 20%;
    font-size: clamp(14px, 2.4vh, 26px);
    animation: abseilen 4s ease-in-out infinite alternate;
  }
  .kastanienmann {
    width: clamp(36px, 5vw, 64px);
    height: clamp(54px, 7.5vw, 96px);
  }
  .watscheln {
    animation: watscheln 0.5s ease-in-out infinite alternate;
  }
  .zapfen {
    position: absolute;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 0 solid #e3f3ff;
    translate: -50% 0;
    pointer-events: auto;
    animation: zapfen 3s ease-out forwards;
  }
  .zapfen i {
    position: absolute;
    left: -2px;
    top: 0;
    width: 4px;
    height: 6px;
    border-radius: 50%;
    background: #a9dcff;
    opacity: 0;
    animation: tropfen 2.4s ease-in infinite;
  }
  .iglu {
    width: clamp(90px, 13vw, 180px);
    height: clamp(56px, 8vw, 112px);
    translate: -50% -100%;
  }
  .engel {
    width: clamp(70px, 10vw, 140px);
    height: clamp(58px, 8vw, 116px);
  }
  .glitzer-fix {
    position: absolute;
    right: -10%;
    top: -20%;
    font-size: 28px;
    animation: blinken 0.8s ease-in-out infinite alternate;
  }
  .kamin {
    position: absolute;
    width: 1.6vw;
    height: 3vw;
    translate: -50% -100%;
    background: #8a4a34;
    box-shadow: inset 0 4px 0 #6b3424;
  }
  .rauch {
    position: absolute;
    width: 2.4vw;
    height: 2.4vw;
    border-radius: 50%;
    background: rgba(220, 225, 232, 0.85);
    translate: -50% -50%;
    opacity: 0;
    animation: rauch 7s ease-out infinite;
  }
  .kranz {
    width: clamp(110px, 15vw, 210px);
    height: clamp(66px, 9vw, 126px);
  }
  .flamme {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation: flackern 0.3s ease-in-out infinite alternate;
  }
  .huepfend {
    position: absolute;
    left: 30%;
    top: 0;
    opacity: 0;
    animation: rausspringen 1.6s ease-out forwards;
  }
  .rakete {
    position: absolute;
    bottom: 30%;
    width: 4px;
    height: 14px;
    border-radius: 2px;
    background: #ffd84a;
    opacity: 0;
    animation: rakete 1.6s ease-out forwards;
  }
  .rakete i {
    position: absolute;
    left: 0;
    top: 0;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    rotate: var(--w);
    opacity: 0;
    animation: funken 1.6s ease-out forwards;
  }
  .hasenspur {
    position: absolute;
    width: 28px;
    height: 16px;
  }
  .hasenspur i,
  .hasenspur b {
    position: absolute;
    border-radius: 50%;
    background: rgba(90, 110, 140, 0.45);
  }
  .hasenspur i {
    width: 6px;
    height: 10px;
    top: 0;
  }
  .hasenspur i:first-child {
    left: 0;
  }
  .hasenspur i:nth-child(2) {
    left: 8px;
  }
  .hasenspur b {
    width: 5px;
    height: 5px;
    top: 12px;
  }
  .hasenspur b:nth-of-type(1) {
    left: 18px;
  }
  .hasenspur b:nth-of-type(2) {
    left: 22px;
    top: 4px;
  }
  .ballon-name {
    display: grid;
    place-items: center;
    width: clamp(110px, 14vw, 190px);
    height: clamp(130px, 17vw, 230px);
    border-radius: 50% 50% 48% 48% / 55% 55% 45% 45%;
    background: var(--farbe);
    color: #fff;
    text-align: center;
    font-family: var(--schrift-titel);
    font-weight: 700;
    font-size: clamp(16px, 3vh, 32px);
    box-shadow: inset -10px -14px 0 rgba(0, 0, 0, 0.12);
  }
  .ballon-name small {
    display: block;
    font-size: 0.55em;
    font-weight: 600;
  }
  .glas-koerper {
    position: relative;
    width: clamp(60px, 8vw, 110px);
    height: clamp(80px, 11vw, 150px);
    border: 4px solid rgba(255, 255, 255, 0.9);
    border-top-width: 10px;
    border-radius: 14px 14px 26px 26px;
    background: rgba(220, 240, 255, 0.35);
    overflow: hidden;
  }
  .glas-koerper i {
    position: absolute;
    color: #ffd84a;
    font-style: normal;
    font-size: clamp(12px, 2vh, 22px);
    text-shadow: 0 0 6px #ffb800;
    opacity: 0;
    animation: reinfallen 0.8s ease-in forwards;
  }
  .glas-zahl {
    position: absolute;
    left: 50%;
    top: 100%;
    translate: -50% 4px;
    padding: 0.1em 0.5em;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.9);
    color: #1f2a44;
    font-weight: 700;
    white-space: nowrap;
    font-size: clamp(12px, 2vh, 22px);
  }
  .banner-zug {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .banner-tuch {
    padding: 0.2em 0.8em;
    border-radius: 6px;
    background: #fff;
    color: #1f2a44;
    font-family: var(--schrift-titel);
    font-weight: 700;
    font-size: clamp(16px, 3vh, 32px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    white-space: nowrap;
  }
  .zaun {
    position: absolute;
    width: 4vw;
    height: 4vh;
    translate: -50% -100%;
    background: repeating-linear-gradient(90deg, #a8792f 0 6px, transparent 6px 14px), linear-gradient(#a8792f, #a8792f) 0 30% / 100% 4px no-repeat;
  }
  .zzz {
    position: absolute;
    translate: -50% 0;
    padding: 0.2em 0.6em;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.85);
    color: #1f2a44;
    font-family: var(--schrift-titel);
    font-weight: 700;
    font-size: clamp(14px, 2.6vh, 28px);
  }
  .sonne-gross {
    width: clamp(70px, 12vh, 140px);
    height: clamp(70px, 12vh, 140px);
    border-radius: 50%;
    background: radial-gradient(circle, #fff3a8, #ffb84a);
    box-shadow: 0 0 40px 18px rgba(255, 190, 80, 0.6);
  }
  .note {
    position: absolute;
    font-size: clamp(20px, 3.6vh, 38px);
    opacity: 0;
    animation: note 3s ease-out forwards;
  }
  .rahmen {
    padding: 6px;
    border-radius: 6px;
    background: #8a5a3a;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  .rahmen img {
    display: block;
    width: clamp(90px, 13vw, 180px);
    height: clamp(64px, 9vw, 126px);
    object-fit: cover;
    border-radius: 3px;
  }
  .luftschlange {
    position: absolute;
    top: -10%;
    width: 6px;
    height: 70px;
    border-radius: 3px;
    animation: schlange 4.5s linear infinite;
  }
  .feier-text {
    position: absolute;
    left: 50%;
    top: 34%;
    translate: -50% 0;
    padding: 0.3em 0.9em;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
    color: #1f2a44;
    font-family: var(--schrift-titel);
    font-weight: 700;
    font-size: clamp(20px, 5vh, 56px);
    white-space: nowrap;
    animation: sagen 14s ease-out forwards;
  }

  @keyframes spritz {
    0% {
      opacity: 1;
      translate: 0 0;
    }
    100% {
      opacity: 0;
      translate: 0 -40px;
    }
  }
  @keyframes klopfen {
    to {
      rotate: -14deg;
    }
  }
  @keyframes bluetenfall {
    to {
      top: 105%;
      translate: 60px 0;
      rotate: 500deg;
    }
  }
  @keyframes wippen {
    to {
      rotate: 10deg;
    }
  }
  @keyframes drehen {
    from {
      rotate: -25deg;
    }
    to {
      rotate: 25deg;
    }
  }
  @keyframes surren {
    to {
      transform: scaleY(0.6);
    }
  }
  @keyframes blitzen {
    0%,
    35%,
    37%,
    55%,
    57%,
    100% {
      opacity: 0;
    }
    36%,
    56% {
      opacity: 0.85;
    }
  }
  @keyframes einaus {
    0%,
    30% {
      opacity: 0;
    }
    35%,
    75% {
      opacity: 1;
    }
    85%,
    100% {
      opacity: 0;
    }
  }
  @keyframes schaukeln {
    from {
      rotate: -6deg;
    }
    to {
      rotate: 6deg;
    }
  }
  @keyframes nebelziehen {
    to {
      translate: 25% 0;
    }
  }
  @keyframes haufen {
    0%,
    30% {
      translate: 0 0;
      rotate: 0deg;
      opacity: 1;
    }
    50% {
      translate: var(--dx) var(--dy);
      rotate: 300deg;
      opacity: 1;
    }
    85% {
      translate: calc(var(--dx) * 1.3) 10px;
      rotate: 600deg;
      opacity: 1;
    }
    100% {
      translate: calc(var(--dx) * 1.3) 10px;
      opacity: 0;
    }
  }
  @keyframes abseilen {
    to {
      top: 70%;
    }
  }
  @keyframes watscheln {
    from {
      rotate: -8deg;
    }
    to {
      rotate: 8deg;
    }
  }
  @keyframes zapfen {
    to {
      border-top-width: var(--l);
    }
  }
  @keyframes tropfen {
    0%,
    60% {
      opacity: 0;
      top: 0;
    }
    65% {
      opacity: 1;
      top: 0;
    }
    100% {
      opacity: 0;
      top: 60px;
    }
  }
  @keyframes rauch {
    0% {
      opacity: 0;
      translate: -50% -50%;
      scale: 0.5;
    }
    15% {
      opacity: 0.9;
    }
    100% {
      opacity: 0;
      translate: 30% -500%;
      scale: 2.2;
    }
  }
  @keyframes flackern {
    to {
      transform: scaleY(0.82) rotate(4deg);
    }
  }
  @keyframes rausspringen {
    0% {
      opacity: 0;
      translate: 0 0;
    }
    30% {
      opacity: 1;
      translate: var(--dx) -60px;
    }
    100% {
      opacity: 1;
      translate: calc(var(--dx) * 1.6) -10px;
    }
  }
  @keyframes rakete {
    0% {
      opacity: 1;
      bottom: 30%;
    }
    60% {
      opacity: 1;
      bottom: calc(100% - var(--hoehe));
    }
    61%,
    100% {
      opacity: 0;
      bottom: calc(100% - var(--hoehe));
    }
  }
  @keyframes funken {
    0%,
    60% {
      opacity: 0;
      translate: 0 0;
    }
    65% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      translate: 0 -90px;
    }
  }
  @keyframes reinfallen {
    from {
      opacity: 0;
      translate: 0 -120px;
    }
    to {
      opacity: 1;
      translate: 0 0;
    }
  }
  @keyframes note {
    0% {
      opacity: 0;
      translate: 0 0;
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      translate: 20px -80px;
    }
  }
  @keyframes schlange {
    to {
      top: 105%;
      rotate: 360deg;
    }
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
