<script lang="ts">
  // Gemalte Jahreszeiten-Landschaft mit Bewegung („Motion Graphics“): Hügel-Ebenen mit leichter Parallaxe, Nebelbänder,
  // ziehende Wolken, schwingende Baumkrone aus Büscheln (Winter: kahle, verschneite Äste), Rauch, Zugvögel und
  // Teilchen im Canvas: Blätter (Herbst), Blüten (Frühling), Pusteblumen-Samen (Sommer), Schnee (Winter).
  // Ab und zu kommt eine Windböe: Baum und Gras neigen sich, ein Schwall Teilchen fliegt durchs Bild, Liegendes wirbelt auf.
  // Himmel, Sonne, Mond und Licht folgen der Uhrzeit (Werte kommen von JahreszeitSzene).
  import { onMount } from 'svelte'
  import type { WetterArt } from '../lib/wetter.svelte'
  import { szene, type Ausschnitt } from '../lib/szene.svelte'
  import type { Jahreszeit } from '../lib/jahreszeit'

  let {
    jz,
    stunde,
    dunkel,
    daemm,
    art = null,
    aus,
  }: { jz: Jahreszeit; stunde: number; dunkel: number; daemm: number; art?: WetterArt | null; aus: Ausschnitt } = $props()

  // ---------- Farben und Ausstattung je Jahreszeit ----------
  interface Saison {
    himmel: [string, string]
    fern: [string, string]
    mitte: [string, string]
    nah: [string, string]
    vorne: [string, string]
    reihe: string[]
    tannen?: boolean
    krone: string[][] | null
    gras: string[] | null
    nebel: number
    strahlen: number
    voegel: boolean
  }
  const SAISON: Record<Jahreszeit, Saison> = {
    fruehling: {
      himmel: ['#7cc8ff', '#e9f8ff'],
      fern: ['#a8c4e0', '#cfe0cf'],
      mitte: ['#a6d97c', '#86c45e'],
      nah: ['#86c95c', '#66ad44'],
      vorne: ['#5e9e3c', '#4a8530'],
      reihe: ['#ffc8dd', '#9fd27a', '#ffafcc', '#7fc25a', '#ffe5ef'],
      krone: [
        ['#e07fa6', '#ffb3cf', '#ffdcea'],
        ['#d9739c', '#ffa5c4', '#ffd0e2'],
        ['#e98cb0', '#ffc2d8', '#ffe8f1'],
      ],
      gras: ['#7fc25a', '#5ea844', '#9ad46a', '#4c9a3a'],
      nebel: 0.35,
      strahlen: 0.18,
      voegel: true,
    },
    sommer: {
      himmel: ['#3ea6ff', '#d2f0ff'],
      fern: ['#93b4d8', '#bcd8c0'],
      mitte: ['#96d25a', '#74ba3e'],
      nah: ['#72ba40', '#559c2e'],
      vorne: ['#4f8a2a', '#3e7222'],
      reihe: ['#3f9b35', '#5bbf3c', '#2f7d2a', '#6cc24a'],
      krone: [
        ['#2f7d2a', '#3f9b35', '#6cc24a'],
        ['#3a8a30', '#55b23c', '#86d05a'],
        ['#2a6e26', '#47a336', '#74c44a'],
      ],
      gras: ['#6cb43c', '#8ccc4a', '#4f9a2e', '#a8d45a'],
      nebel: 0.15,
      strahlen: 0.24,
      voegel: false,
    },
    herbst: {
      himmel: ['#6fb0e3', '#f6e3c0'],
      fern: ['#b9a7c6', '#d9b9a6'],
      mitte: ['#cf9a55', '#b9783f'],
      nah: ['#b98436', '#9a6528'],
      vorne: ['#8a5a2b', '#6b4220'],
      reihe: ['#c4622f', '#d98a32', '#a94a2a', '#e0a83c', '#b9772e'],
      krone: [
        ['#8f3420', '#c4542c', '#ef8a3a'],
        ['#9a4a1c', '#e07a2c', '#f6b44a'],
        ['#a3621c', '#efab3a', '#fbd36c'],
      ],
      gras: ['#9a7a34', '#b38d3c', '#7d6328', '#c49a46'],
      nebel: 1,
      strahlen: 0.18,
      voegel: true,
    },
    winter: {
      himmel: ['#a9c6e4', '#f1f6fb'],
      fern: ['#c4cfe2', '#e3e9f3'],
      mitte: ['#f2f6fb', '#dfe8f3'],
      nah: ['#ffffff', '#e8eff8'],
      vorne: ['#e4ecf6', '#cfdcec'],
      reihe: ['#2f5a46'],
      tannen: true,
      krone: null,
      gras: null,
      nebel: 1.2,
      strahlen: 0.1,
      voegel: false,
    },
  }
  const S = $derived(SAISON[jz])

  // ---------- Farben je Tageszeit und Wetter ----------
  function mixHex(a: string, b: string, t: number): string {
    const z = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
    const [r1, g1, b1] = z(a)
    const [r2, g2, b2] = z(b)
    const m = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0')
    return `#${m(r1, r2)}${m(g1, g2)}${m(b1, b2)}`
  }
  const klemme = (v: number) => Math.max(0, Math.min(1, v))
  const morgens = $derived(stunde < 12)
  const trueb = $derived(art === 'regen' || art === 'gewitter' || art === 'wolkig' || art === 'nebel' || art === 'schnee')
  const himmel = $derived.by((): [string, string] => {
    let h: [string, string] = art === 'gewitter' ? ['#5d6a80', '#a9b4c4'] : trueb ? ['#9fb2c6', '#dfe6ee'] : S.himmel
    if (daemm > 0) {
      const ziel = morgens ? ['#8fb3d9', '#ffd6ad'] : ['#545a9c', '#f39466']
      h = [mixHex(h[0], ziel[0], daemm * 0.85), mixHex(h[1], ziel[1], daemm * 0.85)]
    }
    return [mixHex(h[0], '#0d1433', dunkel), mixHex(h[1], '#2c3a6c', dunkel)]
  })
  const toenung = $derived(mixHex(morgens ? '#ff9a5a' : '#b8402e', '#0b1030', dunkel))
  const toenungOp = $derived(Math.max(daemm * (morgens ? 0.1 : 0.2), 0.55 * dunkel) + (trueb ? 0.06 : 0))
  const bogen = (t: number) => ({ x: 220 + 1160 * t, y: 520 - 420 * Math.sin(Math.PI * t) })
  const sonne = $derived(bogen(klemme((stunde - 6) / 14)))
  const mond = $derived(bogen(klemme((stunde >= 12 ? stunde - 19 : stunde + 5) / 11)))
  const sonnenOp = $derived((1 - dunkel) * (trueb ? 0.25 : 1))
  const sonnenFarbe = $derived(daemm > 0.2 ? '#ff9a48' : '#ffd25e')
  const fensterAn = $derived(dunkel > 0.2 || (!morgens && daemm > 0.3))
  const blattHell = $derived(1 - 0.55 * dunkel)

  // ---------- feste Zufallswerte (Szene sieht immer gleich aus) ----------
  let saat = 7
  const zz = () => (saat = (saat * 16807) % 2147483647) / 2147483647
  const STERNE = Array.from({ length: 70 }, () => ({ x: zz() * 1600, y: zz() * 420, r: 1 + zz() * 2.2, v: -zz() * 4 }))
  const WOLKEN = [
    [120, 1.0, 110, 0],
    [210, 0.7, 150, -60],
    [70, 0.55, 190, -120],
    [250, 0.85, 130, -30],
  ]
  const REIHE: { x: number; y: number; r: number; f: number }[] = []
  for (let x = 640; x < 1100; x += 34 + zz() * 26) {
    const y = 556 + 24 * Math.sin((x - 560) / 300) - (x > 900 ? 30 * Math.min(1, (x - 900) / 280) : 0)
    REIHE.push({ x, y, r: 16 + zz() * 12, f: Math.floor(zz() * 5) })
  }
  const BUESCHEL = (
    [
      [300, 470, 78, 0],
      [470, 465, 80, 0],
      [380, 410, 110, 1],
      [310, 380, 66, 2],
      [455, 372, 68, 1],
      [385, 320, 76, 2],
      [240, 430, 48, 0],
      [535, 420, 50, 2],
    ] as const
  ).map(([x, y, r, t]) => ({
    x,
    y,
    r,
    t,
    d: 5 + zz() * 3,
    v: -zz() * 6,
    flecken: Array.from({ length: 5 }, (_, k) => {
      const w = zz() * Math.PI * 2
      const d = r * (0.4 + zz() * 0.5)
      return { x: x + Math.cos(w) * d, y: y + Math.sin(w) * d, rot: zz() * 180, licht: k % 2 === 1, bluete: k % 2 === 0 }
    }),
  }))
  const LAUB = ['#c4542c', '#e07a2c', '#f0b03a', '#a94a2a', '#d98a32']
  const HAUFEN = Array.from({ length: 46 }, (_, i) => {
    const x = 410 + zz() * 120
    return { x, y: 712 + zz() * 18 - Math.max(0, 22 - Math.abs(x - 470) * 0.4), rot: zz() * 180, f: LAUB[i % LAUB.length] }
  })
  const GRAS: { d: string; f: number; dauer: number; v: number }[] = []
  for (let x = -60; x < 1660; x += 9 + zz() * 12) {
    const h = 26 + zz() * 52
    const b = 5 + zz() * 4
    const k = (zz() - 0.5) * 16
    GRAS.push({ d: `M${x} 900 Q${x + k} ${900 - h * 0.6} ${x + k * 1.6} ${900 - h} Q${x + b * 0.4} ${900 - h * 0.5} ${x + b} 900 Z`, f: Math.floor(zz() * 4), dauer: 2.4 + zz() * 1.8, v: -zz() * 3 })
  }
  // Blumen auf der Wiese (Frühling, Sommer)
  const BLUMEN = Array.from({ length: 34 }, () => {
    const x = -40 + zz() * 1680
    return { x, y: 655 + zz() * 40, r: 4 + zz() * 3, f: Math.floor(zz() * 4) }
  })
  const BLUMEN_FARBEN = ['#ff5d8f', '#ffd84a', '#ffffff', '#b07cff']
  // kahle Äste im Winter (gezeichnet für Boden 712)
  const AESTE = [
    'M378 572 C352 540 322 518 296 500',
    'M386 548 C412 516 442 500 474 488',
    'M380 520 C366 480 346 450 326 424',
    'M384 506 C404 470 428 442 452 418',
    'M382 488 C384 450 386 410 384 372',
    'M326 424 C312 404 300 396 284 392',
    'M452 418 C468 404 482 400 498 400',
    'M296 500 C280 488 266 484 250 484',
    'M474 488 C492 478 508 476 522 478',
    'M384 372 C374 356 366 346 352 340',
    'M384 372 C396 356 406 348 420 344',
  ]
  const VOEGEL = [
    [0, 0],
    [-34, -18],
    [-34, 18],
    [-68, -36],
    [-68, 36],
    [-102, -54],
    [-102, 54],
  ]

  // Haus: hochkant an den rechten Rand des sichtbaren Ausschnitts rücken
  const hausDx = $derived(aus.hoch ? aus.x0 + aus.w - 175 - 1120 : 0)

  // ---------- Windböen und fallende Blätter (Canvas) ----------
  let boe = $state(false)
  let cv: HTMLCanvasElement
  let boeAusloesen: (() => void) | null = null
  $effect(() => {
    if (szene.boe > 0) boeAusloesen?.()
  })

  onMount(() => {
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const reduziert = matchMedia('(prefers-reduced-motion: reduce)').matches
    let B = 0
    let H = 0
    let dpr = 1
    const messen = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      B = cv.clientWidth
      H = cv.clientHeight
      cv.width = Math.round(B * dpr)
      cv.height = Math.round(H * dpr)
    }
    messen()
    const ro = new ResizeObserver(messen)
    ro.observe(cv)

    const blattBild = (farbe: string, rueck: boolean) => {
      const c = document.createElement('canvas')
      c.width = 64
      c.height = 64
      const g = c.getContext('2d')!
      g.translate(32, 32)
      g.fillStyle = farbe
      g.beginPath()
      g.moveTo(0, -28)
      g.bezierCurveTo(20, -18, 20, 14, 0, 28)
      g.bezierCurveTo(-20, 14, -20, -18, 0, -28)
      g.fill()
      if (rueck) {
        g.fillStyle = 'rgba(60,20,10,.28)'
        g.fill()
      }
      g.strokeStyle = 'rgba(90,40,15,.55)'
      g.lineWidth = 2
      g.beginPath()
      g.moveTo(0, -24)
      g.lineTo(0, 30)
      g.stroke()
      g.lineWidth = 1.2
      for (const y of [-12, -2, 8]) {
        g.beginPath()
        g.moveTo(0, y + 4)
        g.lineTo(9, y - 3)
        g.moveTo(0, y + 4)
        g.lineTo(-9, y - 3)
        g.stroke()
      }
      return c
    }
    const bluetenBild = (farbe: string, rueck: boolean) => {
      const c = document.createElement('canvas')
      c.width = 64
      c.height = 64
      const g = c.getContext('2d')!
      g.translate(32, 32)
      g.fillStyle = farbe
      g.beginPath()
      g.moveTo(0, 26)
      g.bezierCurveTo(-24, 10, -20, -22, -4, -26)
      g.quadraticCurveTo(0, -18, 4, -26)
      g.bezierCurveTo(20, -22, 24, 10, 0, 26)
      g.fill()
      g.fillStyle = rueck ? 'rgba(160,60,100,.25)' : 'rgba(255,255,255,.45)'
      g.beginPath()
      g.ellipse(-6, -8, 6, 10, -0.4, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = 'rgba(200,80,120,.5)'
      g.beginPath()
      g.ellipse(0, 20, 5, 4, 0, 0, Math.PI * 2)
      g.fill()
      return c
    }
    const schneeBild = () => {
      const c = document.createElement('canvas')
      c.width = 64
      c.height = 64
      const g = c.getContext('2d')!
      const v = g.createRadialGradient(32, 32, 2, 32, 32, 30)
      v.addColorStop(0, 'rgba(255,255,255,1)')
      v.addColorStop(0.55, 'rgba(255,255,255,.9)')
      v.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = v
      g.beginPath()
      g.arc(32, 32, 30, 0, Math.PI * 2)
      g.fill()
      return c
    }
    const samenBild = () => {
      const c = document.createElement('canvas')
      c.width = 64
      c.height = 64
      const g = c.getContext('2d')!
      g.translate(32, 26)
      g.strokeStyle = 'rgba(255,255,255,.95)'
      g.lineWidth = 1.6
      for (let i = 0; i < 14; i++) {
        const w = Math.PI + (i / 13) * Math.PI
        g.beginPath()
        g.moveTo(0, 0)
        g.lineTo(Math.cos(w) * 22, Math.sin(w) * 22)
        g.stroke()
      }
      g.strokeStyle = 'rgba(170,150,110,.9)'
      g.lineWidth = 2
      g.beginPath()
      g.moveTo(0, 0)
      g.lineTo(0, 30)
      g.stroke()
      g.fillStyle = '#8a6a3a'
      g.beginPath()
      g.ellipse(0, 32, 2.4, 4, 0, 0, Math.PI * 2)
      g.fill()
      return c
    }
    const teilchen = jz === 'winter' ? 'schnee' : jz === 'sommer' ? 'samen' : jz === 'fruehling' ? 'bluete' : 'blatt'
    const bilder =
      teilchen === 'blatt'
        ? ['#e07a2c', '#f0b03a', '#c4542c', '#a94a2a', '#d98a32', '#b8452a'].map((f) => [blattBild(f, false), blattBild(f, true)])
        : teilchen === 'bluete'
          ? ['#ffafcc', '#ffc8dd', '#ffffff', '#ff9ec0'].map((f) => [bluetenBild(f, false), bluetenBild(f, true)])
          : teilchen === 'schnee'
            ? [[schneeBild(), schneeBild()]]
            : [[samenBild(), samenBild()]]
    const flach = teilchen === 'schnee' || teilchen === 'samen'

    interface Blatt {
      x: number
      y: number
      vx: number
      vy: number
      gr: number
      rot: number
      vr: number
      flip: number
      vf: number
      pendel: number
      fall: number
      ruheY: number
      liegt: number
      alpha: number
      farbe: number
    }
    const blaetter: Blatt[] = []
    const MAX = teilchen === 'schnee' ? 150 : 70
    const neues = (vonLinks: boolean) => {
      if (blaetter.length >= MAX) return
      const oben = teilchen === 'schnee' && !vonLinks
      const wiese = teilchen === 'samen' && !vonLinks
      blaetter.push({
        x: vonLinks ? aus.x0 - 40 - Math.random() * 120 : oben || wiese ? aus.x0 + Math.random() * aus.w : 250 + Math.random() * 260,
        y: vonLinks ? 150 + Math.random() * 400 : oben ? -20 : wiese ? 640 + Math.random() * 60 : 300 + Math.random() * 170,
        vx: 0,
        vy: 0,
        gr: teilchen === 'schnee' ? 6 + Math.random() * 8 : teilchen === 'bluete' ? 9 + Math.random() * 6 : teilchen === 'samen' ? 16 + Math.random() * 8 : 15 + Math.random() * 13,
        rot: teilchen === 'samen' ? (Math.random() - 0.5) * 0.6 : Math.random() * Math.PI * 2,
        vr: teilchen === 'samen' ? (Math.random() - 0.5) * 0.4 : (Math.random() - 0.5) * 2.4,
        flip: Math.random() * Math.PI * 2,
        vf: 2 + Math.random() * 3,
        pendel: Math.random() * Math.PI * 2,
        fall: teilchen === 'samen' ? -(8 + Math.random() * 12) : teilchen === 'schnee' ? 30 + Math.random() * 30 : 38 + Math.random() * 34,
        ruheY: 645 + Math.random() * 110,
        liegt: 0,
        alpha: 0,
        farbe: Math.floor(Math.random() * bilder.length),
      })
    }

    let zeit = 0
    let boeStart = -100
    let naechste = 8 + Math.random() * 6
    let aus1: ReturnType<typeof setTimeout> | undefined
    const staerke = (t: number) => {
      const d = t - boeStart
      if (d < 0 || d > 5.4) return 0
      if (d < 1.1) return d / 1.1
      if (d < 2.7) return 1
      return 1 - (d - 2.7) / 2.7
    }
    const zeiger: ReturnType<typeof setTimeout>[] = []
    boeAusloesen = () => {
      if (reduziert) return
      boeStart = zeit
      naechste = zeit + 14 + Math.random() * 10
      boe = false
      requestAnimationFrame(() => (boe = true))
      clearTimeout(aus1)
      aus1 = setTimeout(() => (boe = false), 2700)
      for (let i = 0; i < 14; i++) zeiger.push(setTimeout(() => neues(false), i * 70))
      for (let i = 0; i < 8; i++) zeiger.push(setTimeout(() => neues(true), 200 + i * 110))
    }

    if (reduziert) {
      for (let i = 0; i < 18; i++) {
        neues(false)
        const b = blaetter[i]
        b.x = aus.x0 + Math.random() * aus.w
        b.y = b.ruheY
        b.liegt = 0.001
        b.alpha = 1
        b.flip = Math.PI / 3
      }
    }

    let letzte = performance.now()
    let spawn = 0
    let rahmen = 0
    const schritt = (jetzt: number) => {
      const dt = Math.min(0.05, (jetzt - letzte) / 1000)
      letzte = jetzt
      if (!reduziert) {
        zeit += dt
        if (zeit > naechste) boeAusloesen?.()
        const regen = art === 'regen' || art === 'gewitter'
        spawn -= dt
        if (spawn <= 0) {
          neues(false)
          const takt = teilchen === 'schnee' ? 0.09 : teilchen === 'samen' ? 2.4 : teilchen === 'bluete' ? 0.6 : 0.85
          spawn = takt * (dunkel > 0.5 && teilchen !== 'schnee' ? 2.5 : regen ? 1.8 : 1) * (0.6 + Math.random() * 0.8)
        }
        const g = staerke(zeit)
        const wind = 18 + 10 * Math.sin(zeit * 0.35) + g * 300
        for (let i = blaetter.length - 1; i >= 0; i--) {
          const b = blaetter[i]
          b.alpha = Math.min(1, b.alpha + dt * 3)
          if (b.liegt > 0) {
            b.liegt += dt
            if (g > 0.55 && Math.random() < dt * 2.5) {
              b.liegt = 0
              b.vy = -60 - Math.random() * 60
              b.ruheY = 650 + Math.random() * 110
            } else if (b.liegt > 9) {
              b.alpha = Math.max(0, 1 - (b.liegt - 9))
              if (b.liegt > 10) blaetter.splice(i, 1)
            }
            continue
          }
          b.pendel += dt * 1.8
          b.vx += (wind + Math.sin(b.pendel) * 40 - b.vx) * Math.min(1, dt * 1.6)
          b.vy += (b.fall * (regen ? 1.6 : 1) - g * 25 + Math.cos(b.pendel * 1.3) * 22 - b.vy) * Math.min(1, dt * 2)
          b.x += b.vx * dt
          b.y += b.vy * dt
          b.rot += b.vr * dt * (1 + g * 2)
          b.flip += b.vf * dt * (1 + g * 1.5)
          if (teilchen !== 'samen' && b.y >= b.ruheY && g < 0.3) {
            b.y = b.ruheY
            b.liegt = 0.001
            b.flip = Math.PI / 3
          }
          if (b.x > aus.x0 + aus.w + 120 || b.y > 960 || b.y < -60) blaetter.splice(i, 1)
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, B, H)
      const s = aus.s
      for (const b of blaetter) {
        const k = flach ? 1 : Math.cos(b.flip)
        const gr = b.gr * s
        ctx.globalAlpha = b.alpha
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.translate(aus.ox + (b.x - aus.x0) * s, aus.oy + b.y * s)
        ctx.rotate(b.rot)
        ctx.scale(1, Math.max(0.12, Math.abs(k)))
        ctx.drawImage(bilder[b.farbe % bilder.length][k < 0 ? 1 : 0], -gr / 2, -gr / 2, gr, gr)
      }
      ctx.globalAlpha = 1
      rahmen = requestAnimationFrame(schritt)
    }
    rahmen = requestAnimationFrame(schritt)
    return () => {
      cancelAnimationFrame(rahmen)
      ro.disconnect()
      clearTimeout(aus1)
      zeiger.forEach(clearTimeout)
      boeAusloesen = null
    }
  })
</script>

<div class="landschaft" class:boe>
  <svg viewBox="{aus.x0} 0 {aus.w} 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="hb-himmel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color: {himmel[0]}" />
        <stop offset=".78" style="stop-color: {himmel[1]}" />
      </linearGradient>
      <radialGradient id="hb-hof"><stop offset="0" stop-color="#fff3c4" stop-opacity=".9" /><stop offset=".35" stop-color="#ffd98a" stop-opacity=".35" /><stop offset="1" stop-color="#ffd98a" stop-opacity="0" /></radialGradient>
      <radialGradient id="hb-mondhof"><stop offset="0" stop-color="#fff6d8" stop-opacity=".5" /><stop offset="1" stop-color="#fff6d8" stop-opacity="0" /></radialGradient>
      <radialGradient id="hb-nebel"><stop offset="0" stop-color="#fff8ee" stop-opacity=".55" /><stop offset="1" stop-color="#fff8ee" stop-opacity="0" /></radialGradient>
      <radialGradient id="hb-glut"><stop offset="0" stop-color="#ffcf5a" stop-opacity=".9" /><stop offset="1" stop-color="#ff9a3a" stop-opacity="0" /></radialGradient>
      <linearGradient id="hb-fern" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: {S.fern[0]}" /><stop offset="1" style="stop-color: {S.fern[1]}" /></linearGradient>
      <linearGradient id="hb-mitte" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: {S.mitte[0]}" /><stop offset="1" style="stop-color: {S.mitte[1]}" /></linearGradient>
      <linearGradient id="hb-nah" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: {S.nah[0]}" /><stop offset="1" style="stop-color: {S.nah[1]}" /></linearGradient>
      <linearGradient id="hb-vorne" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: {S.vorne[0]}" /><stop offset="1" style="stop-color: {S.vorne[1]}" /></linearGradient>
    </defs>

    <rect x="-100" width="1800" height="900" fill="url(#hb-himmel)" />
    <g class="weich" style="opacity: {dunkel}">
      {#each STERNE as st, i (i)}<circle class="stern" cx={st.x} cy={st.y} r={st.r} fill="#fff" style="animation-delay: {st.v}s" />{/each}
    </g>
    <g class="wandern" style="transform: translate({mond.x}px, {mond.y}px); opacity: {dunkel}">
      <circle r="120" fill="url(#hb-mondhof)" /><circle r="44" fill="#fff4cf" /><circle cx="-12" cy="-8" r="7" fill="#efe0b4" /><circle cx="14" cy="12" r="5" fill="#efe0b4" />
    </g>
    <g class="wandern" style="transform: translate({sonne.x}px, {sonne.y}px); opacity: {sonnenOp}">
      <g class="strahlen" style="opacity: {S.strahlen * (1 - daemm * 0.3)}">
        {#each Array.from({ length: 12 }) as _, i (i)}<path d="M-18 0 L18 0 L6 -520 L-6 -520 Z" fill="#fff6d0" transform="rotate({i * 30})" />{/each}
      </g>
      <circle r="210" fill="url(#hb-hof)" opacity=".55" />
      <circle class="weich" r="54" style="fill: {sonnenFarbe}" />
    </g>
    <g class="weich" style="opacity: {(1 - dunkel * 0.8) * 0.92}">
      {#each WOLKEN as [y, s, d, v], i (i)}
        <g class="wolke" style="animation-duration: {d}s; animation-delay: {v}s">
          <g transform="translate(0 {y}) scale({s})">
            <ellipse rx="130" ry="34" fill="#fff" /><ellipse cx="-40" cy="-22" rx="62" ry="42" fill="#fff" /><ellipse cx="34" cy="-30" rx="70" ry="50" fill="#fff" />
            <ellipse cx="10" cy="14" rx="120" ry="18" fill="#f3e6dc" opacity=".7" />
          </g>
        </g>
      {/each}
    </g>

    <g class="ebene" style="--tiefe: 6px"><path d="M-80 490 C140 430 360 450 560 470 C760 490 900 408 1110 428 C1310 448 1450 396 1680 426 V900 H-80 Z" fill="url(#hb-fern)" /></g>
    <g class="nebelband" style="opacity: {Math.min(1, S.nebel)}"><ellipse cx="520" cy="515" rx="560" ry="46" fill="url(#hb-nebel)" /></g>
    <g class="ebene" style="--tiefe: 14px">
      <path d="M-80 570 C150 520 350 540 560 562 C800 586 950 518 1180 530 C1380 540 1500 508 1680 528 V900 H-80 Z" fill="url(#hb-mitte)" />
      {#each REIHE as b, i (i)}
        {#if S.tannen}
          <rect x={b.x - 2.5} y={b.y - 4} width="5" height="12" fill="#5a3a26" />
          <path d="M{b.x} {b.y - b.r * 2.4} L{b.x + b.r * 0.9} {b.y - 2} L{b.x - b.r * 0.9} {b.y - 2} Z" fill="#2f5a46" />
          <path d="M{b.x} {b.y - b.r * 2.4} L{b.x + b.r * 0.42} {b.y - b.r * 1.3} L{b.x} {b.y - b.r * 1.5} L{b.x - b.r * 0.42} {b.y - b.r * 1.3} Z" fill="#fff" />
          <path d="M{b.x - b.r * 0.7} {b.y - b.r * 0.6} L{b.x} {b.y - b.r * 0.9} L{b.x + b.r * 0.7} {b.y - b.r * 0.6}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" />
        {:else}
          <rect x={b.x - 2.5} y={b.y - 6} width="5" height="16" fill="#6e4126" /><circle cx={b.x} cy={b.y - b.r * 0.9} r={b.r} fill={S.reihe[b.f % S.reihe.length]} />
        {/if}
      {/each}
    </g>
    <g class="nebelband b" style="opacity: {Math.min(1, S.nebel)}"><ellipse cx="1150" cy="590" rx="620" ry="40" fill="url(#hb-nebel)" /></g>

    {#if dunkel < 0.5 && S.voegel}
      <g class="vogelzug">
        {#each VOEGEL as [x, y], i (i)}
          <path class="vogel" d="M{x - 13} {y} q6.5 -8 13 0 q6.5 -8 13 0" stroke="#3a2a3a" stroke-width="3" fill="none" stroke-linecap="round" style="animation-delay: {-i * 0.07}s" />
        {/each}
      </g>
    {/if}

    <g class="ebene" style="--tiefe: 26px">
      <path d="M-80 652 C200 610 420 620 640 645 C880 672 1100 630 1320 635 C1480 638 1560 628 1680 634 V900 H-80 Z" fill="url(#hb-nah)" />
      <!-- Haus mit Rauch -->
      <g transform="translate({hausDx} 0)">
        <g class="rauch-boe">
          {#each Array.from({ length: 5 }) as _, i (i)}<circle class="rauch" cx="1226" cy="513" r="16" fill="#f6efe8" style="animation-delay: {-i * 1.4}s" />{/each}
        </g>
        <rect x="1212" y="520" width="26" height="46" fill="#7d3a2a" />
        <rect x="1120" y="563" width="140" height="84" rx="3" fill="#f3d1a0" />
        <path d="M1104 571 L1190 501 L1276 571 Z" fill="#b84a34" />
        <path d="M1104 571 L1190 501 L1276 571 L1266 571 L1190 511 L1114 571 Z" fill="#94392a" />
        {#if jz === 'winter'}
          <path d="M1100 574 C1100 566 1104 566 1108 564 L1190 496 L1272 564 C1278 566 1280 570 1278 576 C1270 572 1262 576 1254 572 C1246 578 1236 574 1228 572 L1190 540 L1152 572 C1142 576 1134 572 1126 576 C1118 572 1108 578 1100 574 Z" fill="#ffffff" />
          <path d="M1208 520 C1208 512 1242 512 1242 520 L1240 524 L1210 524 Z" fill="#ffffff" />
          {#each [1120, 1140, 1160, 1220, 1244, 1262] as x, i (i)}<path d="M{x} 574 l3 {10 + (i % 3) * 5} l3 -{10 + (i % 3) * 5} Z" fill="#dff1ff" />{/each}
        {/if}
        <rect x="1176" y="599" width="28" height="48" rx="2" fill="#7a4a2a" />
        <circle cx="1200" cy="625" r="2.2" fill="#e6b65a" />
        <g class="weich" style="opacity: {fensterAn ? 0.9 : 0}"><circle cx="1146" cy="607" r="36" fill="url(#hb-glut)" /><circle cx="1234" cy="607" r="36" fill="url(#hb-glut)" /></g>
        <rect class="weich" x="1134" y="595" width="24" height="22" rx="2" style="fill: {fensterAn ? '#ffd36a' : '#bfe3ff'}" />
        <rect class="weich" x="1222" y="595" width="24" height="22" rx="2" style="fill: {fensterAn ? '#ffd36a' : '#bfe3ff'}" />
        <path d="M1146 595 V617 M1134 606 H1158 M1234 595 V617 M1222 606 H1246" stroke="#f3d1a0" stroke-width="2.5" />
        {#if jz === 'herbst'}
        <g transform="translate(1330 668)">
          <circle class="weich" r="70" fill="url(#hb-glut)" style="opacity: {fensterAn ? 1 : 0}" />
          <ellipse rx="34" ry="26" fill="#e9761f" /><ellipse rx="16" ry="26" fill="#f58f2e" /><path d="M-3 -24 q2 -14 10 -16" stroke="#5a3a1a" stroke-width="5" fill="none" stroke-linecap="round" />
          <ellipse cx="62" cy="10" rx="24" ry="18" fill="#f0a03a" /><ellipse cx="62" cy="10" rx="10" ry="18" fill="#f7b552" /><path d="M61 -6 q1 -9 7 -11" stroke="#5a3a1a" stroke-width="4" fill="none" stroke-linecap="round" />
        </g>
        {:else if jz === 'winter'}
          <!-- Schneemann -->
          <g transform="translate(1340 672)">
            <ellipse cx="4" cy="4" rx="46" ry="8" fill="#c9d8ea" />
            <circle cy="-22" r="34" fill="#ffffff" /><path d="M20 -48 C38 -36 38 -10 22 4 C30 -14 30 -32 20 -48 Z" fill="#dfe9f5" />
            <circle cy="-76" r="25" fill="#ffffff" /><path d="M14 -96 C28 -86 28 -66 16 -56 C22 -70 22 -84 14 -96 Z" fill="#dfe9f5" />
            <circle cy="-116" r="18" fill="#ffffff" /><path d="M10 -130 C20 -122 20 -110 12 -102 C16 -112 16 -122 10 -130 Z" fill="#dfe9f5" />
            <path d="M-4 -116 L-26 -112 L-4 -110 Z" fill="#f08a24" />
            <circle cx="-8" cy="-122" r="2.6" fill="#2a2a2a" /><circle cx="6" cy="-122" r="2.6" fill="#2a2a2a" />
            <circle cy="-82" r="3" fill="#2a2a2a" /><circle cy="-70" r="3" fill="#2a2a2a" /><circle cy="-28" r="3" fill="#2a2a2a" />
            <path d="M-17 -100 C-8 -94 8 -94 17 -100 L18 -92 C8 -88 -8 -88 -18 -92 Z" fill="#e8302a" /><path d="M10 -94 l8 22 l-9 2 l-5 -20 Z" fill="#c8241e" />
            <path d="M-24 -84 L-56 -104 M-46 -98 l-4 -10 M22 -84 L52 -102 M44 -97 l6 -9" stroke="#6e4126" stroke-width="4" stroke-linecap="round" />
            <path d="M-20 -132 L20 -132 L18 -136 L14 -158 L-14 -158 L-18 -136 Z" fill="#2a2a3a" /><rect x="-14" y="-142" width="28" height="5" fill="#e8302a" />
          </g>
        {:else if jz === 'fruehling'}
          <!-- Tulpenbeet -->
          <g transform="translate(1330 668)">
            {#each [[-30, 0, '#e8302a'], [-12, -6, '#ffd84a'], [6, 2, '#ff6fa8'], [24, -4, '#e8302a'], [42, 3, '#b07cff'], [60, -2, '#ffd84a']] as [x, y, f], i (i)}
              <g class="tulpe" style="animation-delay: {-i * 0.4}s; transform-origin: {x}px {Number(y) + 4}px">
                <path d="M{x} {Number(y) + 4} C{Number(x) - 2} {Number(y) - 14} {Number(x) + 2} {Number(y) - 26} {x} {Number(y) - 36}" stroke="#4c9a3a" stroke-width="4" fill="none" />
                <path d="M{x} {Number(y) - 6} C{Number(x) - 14} {Number(y) - 12} {Number(x) - 14} {Number(y) - 24} {Number(x) - 8} {Number(y) - 28}" fill="#5ea844" />
                <path d="M{Number(x) - 9} {Number(y) - 48} L{Number(x) - 9} {Number(y) - 36} C{Number(x) - 9} {Number(y) - 30} {Number(x) + 9} {Number(y) - 30} {Number(x) + 9} {Number(y) - 36} L{Number(x) + 9} {Number(y) - 48} L{Number(x) + 4} {Number(y) - 42} L{x} {Number(y) - 50} L{Number(x) - 4} {Number(y) - 42} Z" fill={String(f)} />
                <path d="M{Number(x) + 3} {Number(y) - 46} L{Number(x) + 9} {Number(y) - 48} L{Number(x) + 9} {Number(y) - 36} C{Number(x) + 9} {Number(y) - 33} {Number(x) + 6} {Number(y) - 32} {Number(x) + 3} {Number(y) - 32} Z" fill="#000" opacity=".15" />
              </g>
            {/each}
          </g>
        {:else}
          <!-- Sonnenblumen -->
          <g transform="translate(1340 672)">
            {#each [[-20, 0, 1], [26, 4, 0.82]] as [x, y, k], i (i)}
              <g class="tulpe" style="animation-delay: {-i * 0.8}s; transform-origin: {x}px {y}px">
                <g transform="translate({x} {y}) scale({k})">
                  <path d="M0 0 C-2 -40 2 -80 0 -118" stroke="#4c9a3a" stroke-width="7" fill="none" />
                  <path d="M0 -40 C-24 -46 -30 -62 -26 -72 C-12 -66 -4 -56 0 -46 Z M0 -66 C22 -72 30 -86 26 -96 C12 -90 4 -80 0 -72 Z" fill="#5ea844" />
                  {#each Array.from({ length: 14 }) as _, j (j)}<ellipse cx="0" cy="-150" rx="7" ry="17" fill={j % 2 ? '#ffc21a' : '#ffd84a'} transform="rotate({j * (360 / 14)} 0 -126)" />{/each}
                  <circle cy="-126" r="17" fill="#7a4a1e" /><circle cx="-4" cy="-130" r="6" fill="#9a6a2e" />
                </g>
              </g>
            {/each}
          </g>
        {/if}
      </g>
      {#if jz === 'fruehling' || jz === 'sommer'}
        {#each BLUMEN as b, i (i)}<circle cx={b.x} cy={b.y} r={b.r} fill={BLUMEN_FARBEN[b.f]} /><circle cx={b.x} cy={b.y} r={b.r * 0.35} fill="#ffb02e" />{/each}
      {/if}
      <!-- großer Baum (gezeichnet für Boden 712, verkleinert auf Boden 642) -->
      <g transform="translate(382 642) scale(.85) translate(-382 -712)">
        {#if jz === 'herbst'}{#each HAUFEN as h, i (i)}<ellipse cx={h.x} cy={h.y} rx="8" ry="4.5" fill={h.f} transform="rotate({h.rot} {h.x} {h.y})" />{/each}{:else if jz === 'winter'}<ellipse cx="382" cy="716" rx="90" ry="14" fill="#ffffff" />{/if}
        <g class="krone-boe">
          <path d="M364 712 C368 640 371 570 373 488 L391 488 C393 570 396 640 402 712 Z" fill="#6e4126" />
          <path d="M367 712 C369 650 372 590 374 520" stroke="#8a5534" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7" />
          <path d="M378 572 C352 540 322 518 296 500" stroke="#6e4126" stroke-width="12" fill="none" stroke-linecap="round" />
          <path d="M386 548 C412 516 442 500 474 488" stroke="#6e4126" stroke-width="10" fill="none" stroke-linecap="round" />
          {#if S.krone}
            {@const K = S.krone}
            {#each BUESCHEL as b, i (i)}
              <g class="ast" style="animation-duration: {b.d}s; animation-delay: {b.v}s">
                <circle cx={b.x + b.r * 0.14} cy={b.y + b.r * 0.16} r={b.r} fill={K[b.t][0]} />
                <circle cx={b.x} cy={b.y} r={b.r * 0.92} fill={K[b.t][1]} />
                <circle cx={b.x - b.r * 0.3} cy={b.y - b.r * 0.32} r={b.r * 0.5} fill={K[b.t][2]} opacity=".6" />
                {#each b.flecken as f, k (k)}
                  {#if jz === 'fruehling' && f.bluete}
                    <circle cx={f.x} cy={f.y} r="6" fill="#ffffff" /><circle cx={f.x} cy={f.y} r="2" fill="#ffb02e" />
                  {:else if jz === 'fruehling'}
                    <ellipse cx={f.x} cy={f.y} rx="7" ry="4" fill="#7cc25a" transform="rotate({f.rot} {f.x} {f.y})" />
                  {:else if jz === 'sommer' && f.bluete && k % 4 === 0}
                    <circle cx={f.x} cy={f.y} r="8" fill="#d93a2b" /><circle cx={f.x - 2.4} cy={f.y - 2.4} r="2.4" fill="#fff" opacity=".45" />
                  {:else}
                    <ellipse cx={f.x} cy={f.y} rx="7" ry="4.5" fill={f.licht ? K[b.t][2] : K[b.t][0]} transform="rotate({f.rot} {f.x} {f.y})" />
                  {/if}
                {/each}
              </g>
            {/each}
          {:else}
            <!-- Winter: kahle Äste mit Schnee -->
            {#each AESTE as d, i (i)}<path class="ast" style="animation-duration: {5 + (i % 3)}s" {d} stroke="#6e4126" stroke-width={i < 5 ? 11 - i : 5} fill="none" stroke-linecap="round" />{/each}
            <g transform="translate(0 -4)">{#each AESTE as d, i (i)}<path class="ast" style="animation-duration: {5 + (i % 3)}s" {d} stroke="#ffffff" stroke-width={i < 5 ? 6 - i * 0.6 : 3} stroke-dasharray="30 18" fill="none" stroke-linecap="round" />{/each}</g>
            <ellipse cx="383" cy="488" rx="14" ry="6" fill="#ffffff" />
          {/if}
        </g>
      </g>
    </g>

    <g class="ebene" style="--tiefe: 40px">
      <path d="M-80 742 C300 716 700 736 1000 728 C1300 720 1500 738 1680 730 V900 H-80 Z" fill="url(#hb-vorne)" />
      {#if S.gras}
        {@const G = S.gras}
        <g class="gras-boe">
          {#each GRAS as g, i (i)}<path class="halm" d={g.d} fill={G[g.f]} style="animation-duration: {g.dauer}s; animation-delay: {g.v}s" />{/each}
        </g>
      {/if}
    </g>

    <rect class="weich" x="-100" width="1800" height="900" style="fill: {toenung}; opacity: {toenungOp}" />
    {#if boe}
      <g fill="none" stroke="#fffaf0" stroke-width="3" stroke-linecap="round">
        <path class="windlinie" d="M-100 380 C200 340 420 430 700 390 S1200 320 1700 370" />
        <path class="windlinie" style="animation-delay: .25s" d="M-100 500 C260 460 520 540 860 500 S1300 440 1700 480" />
        <path class="windlinie" style="animation-delay: .5s" d="M-100 260 C300 230 560 300 900 260 S1350 210 1700 250" />
      </g>
    {/if}
  </svg>
  <canvas bind:this={cv} style="filter: brightness({blattHell})"></canvas>
</div>

<style>
  .landschaft,
  svg,
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  canvas {
    transition: filter 3s ease;
  }
  .weich,
  .wandern {
    transition:
      opacity 3s ease,
      fill 3s ease;
  }
  .wandern {
    transition:
      transform 30s linear,
      opacity 3s ease;
  }
  stop {
    transition: stop-color 3s ease;
  }
  .stern {
    animation: funkeln 3.6s ease-in-out infinite alternate;
  }
  .strahlen {
    animation: drehen 140s linear infinite;
    transition: opacity 3s ease;
  }
  .wolke {
    animation: ziehen 110s linear infinite;
  }
  .ebene {
    animation: kamera 46s ease-in-out infinite alternate;
  }
  .nebelband {
    animation: treiben 38s ease-in-out infinite alternate;
  }
  .nebelband.b {
    animation-duration: 52s;
    animation-direction: alternate-reverse;
  }
  .ast {
    transform-box: view-box;
    transform-origin: 382px 540px;
    animation: wiegen 6s ease-in-out infinite alternate;
  }
  .krone-boe {
    transform-box: view-box;
    transform-origin: 382px 700px;
    transition: transform 2.8s cubic-bezier(0.3, 0.7, 0.3, 1);
  }
  .boe .krone-boe {
    transform: rotate(2.4deg);
    transition-duration: 1.1s;
  }
  .halm {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation: wiegen 3s ease-in-out infinite alternate;
  }
  .gras-boe {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    transition: transform 2.6s cubic-bezier(0.3, 0.7, 0.3, 1);
  }
  .boe .gras-boe {
    transform: skewX(-16deg);
    transition-duration: 0.9s;
  }
  .rauch-boe {
    transform-box: view-box;
    transform-origin: 1226px 525px;
    transition: transform 2.6s ease;
  }
  .boe .rauch-boe {
    transform: skewX(-34deg);
    transition-duration: 1s;
  }
  .tulpe {
    transform-box: view-box;
    animation: wiegen 3.2s ease-in-out infinite alternate;
  }
  .rauch {
    transform-box: fill-box;
    transform-origin: center;
    opacity: 0;
    animation: rauch 7s ease-out infinite;
  }
  .vogelzug {
    animation: vogelzug 44s linear infinite;
    animation-delay: -6s;
  }
  .vogel {
    transform-box: fill-box;
    transform-origin: center;
    animation: flattern 0.42s ease-in-out infinite alternate;
  }
  .windlinie {
    stroke-dasharray: 160 2200;
    stroke-dashoffset: 2360;
    opacity: 0;
    animation: wind 2.4s ease-out forwards;
  }
  @keyframes funkeln {
    from {
      opacity: 0.25;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes drehen {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes ziehen {
    from {
      transform: translateX(-420px);
    }
    to {
      transform: translateX(1900px);
    }
  }
  @keyframes kamera {
    from {
      transform: translateX(calc(var(--tiefe) * -1));
    }
    to {
      transform: translateX(var(--tiefe));
    }
  }
  @keyframes treiben {
    from {
      transform: translateX(-80px);
    }
    to {
      transform: translateX(110px);
    }
  }
  @keyframes wiegen {
    from {
      transform: rotate(-1.1deg);
    }
    to {
      transform: rotate(1.3deg);
    }
  }
  @keyframes rauch {
    0% {
      opacity: 0;
      transform: translate(0, 0) scale(0.5);
    }
    15% {
      opacity: 0.55;
    }
    100% {
      opacity: 0;
      transform: translate(26px, -150px) scale(2.3);
    }
  }
  @keyframes vogelzug {
    0% {
      transform: translate(-260px, 200px);
    }
    55% {
      transform: translate(1800px, 100px);
    }
    100% {
      transform: translate(1800px, 100px);
    }
  }
  @keyframes flattern {
    from {
      transform: scaleY(1);
    }
    to {
      transform: scaleY(0.35);
    }
  }
  @keyframes wind {
    0% {
      stroke-dashoffset: 2360;
      opacity: 0;
    }
    15% {
      opacity: 0.55;
    }
    100% {
      stroke-dashoffset: 0;
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .landschaft * {
      animation: none !important;
    }
  }
</style>
