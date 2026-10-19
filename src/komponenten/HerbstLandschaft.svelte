<script lang="ts">
  // Gemalte Herbst-Landschaft mit Bewegung („Motion Graphics“): Hügel-Ebenen mit leichter Parallaxe, Nebelbänder,
  // ziehende Wolken, schwingende Baumkrone aus Laubbüscheln, Rauch, Zugvögel und fallende, kippende Blätter (Canvas).
  // Ab und zu kommt eine Windböe: Baum und Gras neigen sich, ein Schwall Blätter fliegt durchs Bild, liegendes Laub wirbelt auf.
  // Himmel, Sonne, Mond und Licht folgen der Uhrzeit (Werte kommen von JahreszeitSzene).
  import { onMount } from 'svelte'
  import type { WetterArt } from '../lib/wetter.svelte'
  import { szene, type Ausschnitt } from '../lib/szene.svelte'

  let {
    stunde,
    dunkel,
    daemm,
    art = null,
    aus,
  }: { stunde: number; dunkel: number; daemm: number; art?: WetterArt | null; aus: Ausschnitt } = $props()

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
    let h: [string, string] = art === 'gewitter' ? ['#5d6a80', '#a9b4c4'] : trueb ? ['#9fb2c6', '#dfe6ee'] : ['#6fb0e3', '#f6e3c0']
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
  const REIHE_FARBEN = ['#c4622f', '#d98a32', '#a94a2a', '#e0a83c', '#b9772e']
  const REIHE: { x: number; y: number; r: number; f: string }[] = []
  for (let x = 640; x < 1100; x += 34 + zz() * 26) {
    const y = 556 + 24 * Math.sin((x - 560) / 300) - (x > 900 ? 30 * Math.min(1, (x - 900) / 280) : 0)
    REIHE.push({ x, y, r: 16 + zz() * 12, f: REIHE_FARBEN[Math.floor(zz() * REIHE_FARBEN.length)] })
  }
  const TOENE = [
    ['#8f3420', '#c4542c', '#ef8a3a'],
    ['#9a4a1c', '#e07a2c', '#f6b44a'],
    ['#a3621c', '#efab3a', '#fbd36c'],
  ]
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
    farben: TOENE[t],
    d: 5 + zz() * 3,
    v: -zz() * 6,
    flecken: Array.from({ length: 5 }, (_, k) => {
      const w = zz() * Math.PI * 2
      const d = r * (0.4 + zz() * 0.5)
      return { x: x + Math.cos(w) * d, y: y + Math.sin(w) * d, rot: zz() * 180, licht: k % 2 === 1 }
    }),
  }))
  const LAUB = ['#c4542c', '#e07a2c', '#f0b03a', '#a94a2a', '#d98a32']
  const HAUFEN = Array.from({ length: 46 }, (_, i) => {
    const x = 410 + zz() * 120
    return { x, y: 712 + zz() * 18 - Math.max(0, 22 - Math.abs(x - 470) * 0.4), rot: zz() * 180, f: LAUB[i % LAUB.length] }
  })
  const GRAS_FARBEN = ['#9a7a34', '#b38d3c', '#7d6328', '#c49a46']
  const GRAS: { d: string; f: string; dauer: number; v: number }[] = []
  for (let x = -60; x < 1660; x += 9 + zz() * 12) {
    const h = 26 + zz() * 52
    const b = 5 + zz() * 4
    const k = (zz() - 0.5) * 16
    GRAS.push({ d: `M${x} 900 Q${x + k} ${900 - h * 0.6} ${x + k * 1.6} ${900 - h} Q${x + b * 0.4} ${900 - h * 0.5} ${x + b} 900 Z`, f: GRAS_FARBEN[Math.floor(zz() * 4)], dauer: 2.4 + zz() * 1.8, v: -zz() * 3 })
  }
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
    const bilder = ['#e07a2c', '#f0b03a', '#c4542c', '#a94a2a', '#d98a32', '#b8452a'].map((f) => [blattBild(f, false), blattBild(f, true)])

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
    const MAX = 70
    const neues = (vonLinks: boolean) => {
      if (blaetter.length >= MAX) return
      blaetter.push({
        x: vonLinks ? aus.x0 - 40 - Math.random() * 120 : 250 + Math.random() * 260,
        y: vonLinks ? 150 + Math.random() * 400 : 300 + Math.random() * 170,
        vx: 0,
        vy: 0,
        gr: 15 + Math.random() * 13,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 2.4,
        flip: Math.random() * Math.PI * 2,
        vf: 2 + Math.random() * 3,
        pendel: Math.random() * Math.PI * 2,
        fall: 38 + Math.random() * 34,
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
          spawn = (dunkel > 0.5 ? 2.2 : regen ? 1.6 : 0.85) * (0.6 + Math.random() * 0.8)
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
          if (b.y >= b.ruheY && g < 0.3) {
            b.y = b.ruheY
            b.liegt = 0.001
            b.flip = Math.PI / 3
          }
          if (b.x > aus.x0 + aus.w + 120 || b.y > 960) blaetter.splice(i, 1)
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, B, H)
      const s = aus.s
      for (const b of blaetter) {
        const k = Math.cos(b.flip)
        const gr = b.gr * s
        ctx.globalAlpha = b.alpha
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.translate(aus.ox + (b.x - aus.x0) * s, aus.oy + b.y * s)
        ctx.rotate(b.rot)
        ctx.scale(1, Math.max(0.12, Math.abs(k)))
        ctx.drawImage(bilder[b.farbe][k < 0 ? 1 : 0], -gr / 2, -gr / 2, gr, gr)
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

<div class="herbst" class:boe>
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
      <linearGradient id="hb-fern" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9a7c6" /><stop offset="1" stop-color="#d9b9a6" /></linearGradient>
      <linearGradient id="hb-mitte" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cf9a55" /><stop offset="1" stop-color="#b9783f" /></linearGradient>
      <linearGradient id="hb-nah" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98436" /><stop offset="1" stop-color="#9a6528" /></linearGradient>
      <linearGradient id="hb-vorne" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a2b" /><stop offset="1" stop-color="#6b4220" /></linearGradient>
    </defs>

    <rect x="-100" width="1800" height="900" fill="url(#hb-himmel)" />
    <g class="weich" style="opacity: {dunkel}">
      {#each STERNE as st, i (i)}<circle class="stern" cx={st.x} cy={st.y} r={st.r} fill="#fff" style="animation-delay: {st.v}s" />{/each}
    </g>
    <g class="wandern" style="transform: translate({mond.x}px, {mond.y}px); opacity: {dunkel}">
      <circle r="120" fill="url(#hb-mondhof)" /><circle r="44" fill="#fff4cf" /><circle cx="-12" cy="-8" r="7" fill="#efe0b4" /><circle cx="14" cy="12" r="5" fill="#efe0b4" />
    </g>
    <g class="wandern" style="transform: translate({sonne.x}px, {sonne.y}px); opacity: {sonnenOp}">
      <g class="strahlen" style="opacity: {0.18 * (1 - daemm * 0.3)}">
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
    <g class="nebelband"><ellipse cx="520" cy="515" rx="560" ry="46" fill="url(#hb-nebel)" /></g>
    <g class="ebene" style="--tiefe: 14px">
      <path d="M-80 570 C150 520 350 540 560 562 C800 586 950 518 1180 530 C1380 540 1500 508 1680 528 V900 H-80 Z" fill="url(#hb-mitte)" />
      {#each REIHE as b, i (i)}
        <rect x={b.x - 2.5} y={b.y - 6} width="5" height="16" fill="#6e4126" /><circle cx={b.x} cy={b.y - b.r * 0.9} r={b.r} fill={b.f} />
      {/each}
    </g>
    <g class="nebelband b"><ellipse cx="1150" cy="590" rx="620" ry="40" fill="url(#hb-nebel)" /></g>

    {#if dunkel < 0.5}
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
        <rect x="1176" y="599" width="28" height="48" rx="2" fill="#7a4a2a" />
        <circle cx="1200" cy="625" r="2.2" fill="#e6b65a" />
        <g class="weich" style="opacity: {fensterAn ? 0.9 : 0}"><circle cx="1146" cy="607" r="36" fill="url(#hb-glut)" /><circle cx="1234" cy="607" r="36" fill="url(#hb-glut)" /></g>
        <rect class="weich" x="1134" y="595" width="24" height="22" rx="2" style="fill: {fensterAn ? '#ffd36a' : '#bfe3ff'}" />
        <rect class="weich" x="1222" y="595" width="24" height="22" rx="2" style="fill: {fensterAn ? '#ffd36a' : '#bfe3ff'}" />
        <path d="M1146 595 V617 M1134 606 H1158 M1234 595 V617 M1222 606 H1246" stroke="#f3d1a0" stroke-width="2.5" />
        <g transform="translate(1330 668)">
          <circle class="weich" r="70" fill="url(#hb-glut)" style="opacity: {fensterAn ? 1 : 0}" />
          <ellipse rx="34" ry="26" fill="#e9761f" /><ellipse rx="16" ry="26" fill="#f58f2e" /><path d="M-3 -24 q2 -14 10 -16" stroke="#5a3a1a" stroke-width="5" fill="none" stroke-linecap="round" />
          <ellipse cx="62" cy="10" rx="24" ry="18" fill="#f0a03a" /><ellipse cx="62" cy="10" rx="10" ry="18" fill="#f7b552" /><path d="M61 -6 q1 -9 7 -11" stroke="#5a3a1a" stroke-width="4" fill="none" stroke-linecap="round" />
        </g>
      </g>
      <!-- großer Baum (gezeichnet für Boden 712, verkleinert auf Boden 642) -->
      <g transform="translate(382 642) scale(.85) translate(-382 -712)">
        {#each HAUFEN as h, i (i)}<ellipse cx={h.x} cy={h.y} rx="8" ry="4.5" fill={h.f} transform="rotate({h.rot} {h.x} {h.y})" />{/each}
        <g class="krone-boe">
          <path d="M364 712 C368 640 371 570 373 488 L391 488 C393 570 396 640 402 712 Z" fill="#6e4126" />
          <path d="M367 712 C369 650 372 590 374 520" stroke="#8a5534" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7" />
          <path d="M378 572 C352 540 322 518 296 500" stroke="#6e4126" stroke-width="12" fill="none" stroke-linecap="round" />
          <path d="M386 548 C412 516 442 500 474 488" stroke="#6e4126" stroke-width="10" fill="none" stroke-linecap="round" />
          {#each BUESCHEL as b, i (i)}
            <g class="ast" style="animation-duration: {b.d}s; animation-delay: {b.v}s">
              <circle cx={b.x + b.r * 0.14} cy={b.y + b.r * 0.16} r={b.r} fill={b.farben[0]} />
              <circle cx={b.x} cy={b.y} r={b.r * 0.92} fill={b.farben[1]} />
              <circle cx={b.x - b.r * 0.3} cy={b.y - b.r * 0.32} r={b.r * 0.5} fill={b.farben[2]} opacity=".6" />
              {#each b.flecken as f, k (k)}<ellipse cx={f.x} cy={f.y} rx="7" ry="4.5" fill={f.licht ? b.farben[2] : b.farben[0]} transform="rotate({f.rot} {f.x} {f.y})" />{/each}
            </g>
          {/each}
        </g>
      </g>
    </g>

    <g class="ebene" style="--tiefe: 40px">
      <path d="M-80 742 C300 716 700 736 1000 728 C1300 720 1500 738 1680 730 V900 H-80 Z" fill="url(#hb-vorne)" />
      <g class="gras-boe">
        {#each GRAS as g, i (i)}<path class="halm" d={g.d} fill={g.f} style="animation-duration: {g.dauer}s; animation-delay: {g.v}s" />{/each}
      </g>
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
  .herbst,
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
    .herbst * {
      animation: none !important;
    }
  }
</style>
