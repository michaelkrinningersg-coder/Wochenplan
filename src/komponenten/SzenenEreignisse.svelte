<script lang="ts">
  // Kleine Überraschungen im Jahreszeiten-Bild – immer nur eine zur Zeit, mit zufälligen Wegen und Pausen dazwischen.
  // Herbst: Drachen fliegt, Pilze wachsen, Apfel fällt vom Baum, Igel läuft. Winter, Frühling, Sommer haben eigene.
  import { onMount } from 'svelte'
  import type { Jahreszeit } from '../lib/jahreszeit'

  let { jz }: { jz: Jahreszeit } = $props()

  type Art = 'drachen' | 'pilze' | 'apfel' | 'tier' | 'flieger' | 'blumen' | 'ballon' | 'schlitten'
  interface Ereignis {
    art: Art
    nr: number
    zeichen?: string
    stellen?: number[]
  }

  const LISTE: Record<Jahreszeit, { art: Art; zeichen?: string }[]> = {
    herbst: [{ art: 'drachen' }, { art: 'pilze' }, { art: 'apfel' }, { art: 'tier', zeichen: '🦔' }, { art: 'flieger', zeichen: '🐦' }],
    winter: [{ art: 'schlitten', zeichen: '🛷' }, { art: 'flieger', zeichen: '🐦' }, { art: 'tier', zeichen: '🦊' }, { art: 'drachen' }],
    fruehling: [{ art: 'flieger', zeichen: '🦋' }, { art: 'blumen' }, { art: 'flieger', zeichen: '🐝' }, { art: 'tier', zeichen: '🐇' }],
    sommer: [{ art: 'ballon', zeichen: '🎈' }, { art: 'flieger', zeichen: '🦋' }, { art: 'flieger', zeichen: '✈️' }, { art: 'flieger', zeichen: '🐝' }, { art: 'drachen' }],
  }

  let aktuell = $state<Ereignis | null>(null)
  let nr = 0
  let letzte = ''
  let timer: ReturnType<typeof setTimeout> | undefined
  const zufall = (a: number, b: number) => a + Math.random() * (b - a)

  function naechstes(verz: number) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      const moegliche = LISTE[jz].filter((e) => e.art + (e.zeichen ?? '') !== letzte)
      const e = moegliche[Math.floor(Math.random() * moegliche.length)]
      letzte = e.art + (e.zeichen ?? '')
      aktuell = {
        ...e,
        nr: ++nr,
        stellen: Array.from({ length: 3 + Math.floor(Math.random() * 2) }, () => zufall(6, 92)),
      }
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

  /** Bewegung mit der Web-Animations-API; ruft am Ende fertig() */
  function animiere(node: HTMLElement, p: { keyframes: Keyframe[]; dauer: number; ende?: boolean }) {
    const a = node.animate(p.keyframes, { duration: p.dauer, easing: 'linear', fill: 'forwards' })
    if (p.ende !== false) a.onfinish = fertig
    return { destroy: () => a.cancel() }
  }

  // Wege
  function flugWeg(hoch: [number, number]): Keyframe[] {
    const vonLinks = Math.random() < 0.5
    const y0 = zufall(...hoch)
    const y1 = zufall(...hoch)
    const schritte = 6
    return Array.from({ length: schritte + 1 }, (_, i) => {
      const t = i / schritte
      const x = vonLinks ? -12 + t * 124 : 112 - t * 124
      const y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI * 3 + y0) * zufall(2, 6)
      return { left: `${x}%`, top: `${y}%`, transform: `scaleX(${vonLinks ? -1 : 1}) rotate(${Math.sin(t * 9) * 12}deg)` }
    })
  }
  function bodenWeg(): Keyframe[] {
    const vonLinks = Math.random() < 0.5
    const y = zufall(64, 70)
    return [
      { left: vonLinks ? '-8%' : '108%', top: `${y}%`, transform: `scaleX(${vonLinks ? -1 : 1})` },
      { left: vonLinks ? '108%' : '-8%', top: `${y - zufall(-3, 3)}%`, transform: `scaleX(${vonLinks ? -1 : 1})` },
    ]
  }
  function drachenWeg(): Keyframe[] {
    const vonLinks = Math.random() < 0.5
    const y0 = zufall(8, 30)
    const y1 = zufall(5, 35)
    return Array.from({ length: 9 }, (_, i) => {
      const t = i / 8
      const x = vonLinks ? -15 + t * 130 : 115 - t * 130
      const y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI * 2 + y0) * zufall(4, 9)
      return { left: `${x}%`, top: `${y}%`, transform: `rotate(${Math.sin(t * 7 + y0) * 18 + (vonLinks ? 10 : -10)}deg)` }
    })
  }
  function apfelWeg(): Keyframe[] {
    const x = zufall(20, 29)
    const richtung = Math.random() < 0.5 ? -1 : 1
    return [
      { left: `${x}%`, top: '44%', opacity: 1, transform: 'rotate(0deg)', offset: 0 },
      { left: `${x}%`, top: '44%', opacity: 1, transform: 'rotate(0deg)', offset: 0.18 },
      { left: `${x}%`, top: '68%', opacity: 1, transform: 'rotate(40deg)', offset: 0.36, easing: 'ease-out' },
      { left: `${x + richtung * 2}%`, top: '63%', opacity: 1, transform: 'rotate(80deg)', offset: 0.44, easing: 'ease-in' },
      { left: `${x + richtung * 4}%`, top: '68%', opacity: 1, transform: 'rotate(140deg)', offset: 0.52 },
      { left: `${x + richtung * 9}%`, top: '69%', opacity: 1, transform: `rotate(${richtung * 400}deg)`, offset: 0.75 },
      { left: `${x + richtung * 9}%`, top: '69%', opacity: 0, transform: `rotate(${richtung * 400}deg)`, offset: 1 },
    ]
  }
  function ballonWeg(): Keyframe[] {
    const x = zufall(10, 85)
    return Array.from({ length: 7 }, (_, i) => {
      const t = i / 6
      return { left: `${x + Math.sin(t * 6) * 4}%`, top: `${100 - t * 120}%` }
    })
  }
  function schlittenWeg(): Keyframe[] {
    // den Hügel hinunter (rechts oben nach links unten oder umgekehrt)
    const vonRechts = Math.random() < 0.5
    return [
      { left: vonRechts ? '96%' : '-6%', top: '58%', transform: `scaleX(${vonRechts ? 1 : -1}) rotate(${vonRechts ? -8 : 8}deg)` },
      { left: vonRechts ? '-8%' : '104%', top: '70%', transform: `scaleX(${vonRechts ? 1 : -1}) rotate(${vonRechts ? -14 : 14}deg)` },
    ]
  }
  function wachsen(i: number): Keyframe[] {
    return [
      { transform: 'scale(0)', opacity: 0, offset: 0 },
      { transform: 'scale(0)', opacity: 0, offset: 0.04 + i * 0.05 },
      { transform: 'scale(1.1)', opacity: 1, offset: 0.2 + i * 0.05 },
      { transform: 'scale(1)', opacity: 1, offset: 0.25 + i * 0.05 },
      { transform: 'scale(1)', opacity: 1, offset: 0.85 },
      { transform: 'scale(0)', opacity: 0, offset: 1 },
    ]
  }
</script>

<div class="ereignisse" aria-hidden="true">
  {#if aktuell}
    {#key aktuell.nr}
      {#if aktuell.art === 'drachen'}
        <div class="ding drachen" use:animiere={{ keyframes: drachenWeg(), dauer: zufall(14000, 20000) }}>
          <svg viewBox="0 0 60 110" width="100%" height="100%">
            <path d="M30 2 L54 30 L30 62 L6 30 Z" fill="#e8452b" stroke="#7a2a18" stroke-width="2" />
            <path d="M30 2 L30 62 M6 30 L54 30" stroke="#7a2a18" stroke-width="1.5" />
            <path d="M30 2 L54 30 L30 30 Z" fill="#f2b33d" />
            <path d="M30 30 L6 30 L30 62 Z" fill="#3b8fd6" />
            <path d="M30 62 q-8 8 0 14 q8 6 0 14 q-8 6 0 14" fill="none" stroke="#7a2a18" stroke-width="1.5" />
            <path d="M24 72 l12 0 l-6 5 z M24 86 l12 0 l-6 5 z M24 100 l12 0 l-6 5 z" fill="#f2b33d" />
          </svg>
        </div>
      {:else if aktuell.art === 'apfel'}
        <div class="ding apfel" use:animiere={{ keyframes: apfelWeg(), dauer: 7000 }}>
          <svg viewBox="0 0 40 40" width="100%" height="100%">
            <path d="M20 10 C8 4 2 16 6 26 C9 34 16 38 20 35 C24 38 31 34 34 26 C38 16 32 4 20 10 Z" fill="#d93a2b" />
            <path d="M20 10 L21 3" stroke="#5a3a1a" stroke-width="2.5" stroke-linecap="round" />
            <path d="M21 6 q7 -5 11 0 q-6 4 -11 0" fill="#4caf50" />
            <ellipse cx="13" cy="18" rx="3" ry="5" fill="#ffffff" opacity="0.35" />
          </svg>
        </div>
      {:else if aktuell.art === 'pilze' || aktuell.art === 'blumen'}
        <div class="reihe-boden" use:animiere={{ keyframes: [{ opacity: 1 }, { opacity: 1 }], dauer: 12000 }}>
          {#each aktuell.stellen ?? [] as x, i (i)}
            <div class="ding wachsend" style="left: {x}%; top: {64 + (i % 3) * 3}%" use:animiere={{ keyframes: wachsen(i), dauer: 12000, ende: false }}>
              {#if aktuell.art === 'pilze'}
                <svg viewBox="0 0 40 40" width="100%" height="100%">
                  <rect x="15" y="20" width="10" height="16" rx="4" fill="#f6ecd8" stroke="#b39b78" stroke-width="1.2" />
                  <path d="M3 22 C3 8 37 8 37 22 Z" fill={i % 2 ? '#c9563c' : '#e8452b'} />
                  <circle cx="13" cy="15" r="2.6" fill="#fff" /><circle cx="24" cy="12" r="2.2" fill="#fff" /><circle cx="30" cy="18" r="2" fill="#fff" />
                </svg>
              {:else}
                <span class="emoji">{['🌷', '🌼', '🌸', '🌻'][i % 4]}</span>
              {/if}
            </div>
          {/each}
        </div>
      {:else if aktuell.art === 'tier'}
        <div class="ding tier" use:animiere={{ keyframes: bodenWeg(), dauer: zufall(16000, 24000) }}><span class="emoji">{aktuell.zeichen}</span></div>
      {:else if aktuell.art === 'flieger'}
        <div class="ding flieger" use:animiere={{ keyframes: flugWeg(aktuell.zeichen === '✈️' ? [6, 18] : [12, 50]), dauer: zufall(11000, 17000) }}>
          <span class="emoji">{aktuell.zeichen}</span>
        </div>
      {:else if aktuell.art === 'ballon'}
        <div class="ding flieger" use:animiere={{ keyframes: ballonWeg(), dauer: zufall(14000, 19000) }}><span class="emoji gross">{aktuell.zeichen}</span></div>
      {:else if aktuell.art === 'schlitten'}
        <div class="ding tier" use:animiere={{ keyframes: schlittenWeg(), dauer: zufall(7000, 10000) }}><span class="emoji">{aktuell.zeichen}</span></div>
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
  .ding {
    position: absolute;
    translate: -50% -50%;
  }
  .drachen {
    width: clamp(50px, 8vw, 110px);
    height: clamp(90px, 14vw, 200px);
  }
  .apfel {
    width: clamp(26px, 3.4vw, 46px);
    height: clamp(26px, 3.4vw, 46px);
  }
  .wachsend {
    width: clamp(34px, 5vw, 70px);
    height: clamp(34px, 5vw, 70px);
    transform-origin: 50% 100%;
    transform: scale(0);
  }
  .emoji {
    display: block;
    font-size: clamp(30px, 6vh, 64px);
    line-height: 1;
  }
  .emoji.gross {
    font-size: clamp(44px, 9vh, 96px);
  }
</style>
