<script lang="ts">
  // Gemalte Landschaft je Jahreszeit (SVG + CSS): Himmel, Hügel, Baum, fallende Blätter/Schnee/Blüten.
  // Nachts dunkler Himmel mit Mond und Sternen.
  import type { Jahreszeit, Orte } from '../lib/jahreszeit'
  import Figuren from './Figuren.svelte'
  import SzenenEreignisse from './SzenenEreignisse.svelte'
  import HerbstLandschaft from './HerbstLandschaft.svelte'
  import { ausschnitt, prozent } from '../lib/szene.svelte'
  import { onDestroy } from 'svelte'

  import type { WetterArt } from '../lib/wetter.svelte'

  let { jz, nacht = false, wetterArt = null }: { jz: Jahreszeit; nacht?: boolean; wetterArt?: WetterArt | null } = $props()

  const FARBEN: Record<Jahreszeit, { himmel: [string, string]; huegel: [string, string]; krone: string[]; teilchen: string[] }> = {
    fruehling: { himmel: ['#8fd3ff', '#e6f7ff'], huegel: ['#8fd16a', '#5fb24a'], krone: ['#ffc8dd', '#ffafcc', '#ffe5ef'], teilchen: ['#ffafcc', '#ffffff'] },
    sommer: { himmel: ['#4fb4ff', '#c9ecff'], huegel: ['#6cc24a', '#3f9b35'], krone: ['#3f9b35', '#5bbf3c', '#2f7d2a'], teilchen: [] },
    herbst: { himmel: ['#9cc9e8', '#f5e6c8'], huegel: ['#c9a24a', '#a8792f'], krone: ['#e8752a', '#f2b33d', '#c94a2a'], teilchen: ['#e8752a', '#f2b33d', '#c94a2a', '#a8582a'] },
    winter: { himmel: ['#b9d3ea', '#eef5fb'], huegel: ['#ffffff', '#e3edf6'], krone: ['#ffffff', '#e8f1f8', '#d7e6f2'], teilchen: ['#ffffff'] },
  }
  let breite = $state(1600)
  let hoehe = $state(900)
  // hochkant: Baum und Haus in die sichtbare Mitte rücken (das Bild wird seitlich beschnitten)
  const hoch = $derived(hoehe > breite)
  const f = $derived(FARBEN[jz])
  // Lage von Baum, Haus und Boden auf dem Bildschirm (Bild 160×90, „slice“ = füllt und beschneidet)
  const baumDx = $derived(hoch ? 30 : 0)
  const hausX = $derived(hoch ? 82 : 110)
  const aus = $derived(ausschnitt(breite, hoehe))
  const orte = $derived.by((): Orte => {
    if (jz === 'herbst') {
      const q = (x: number, y: number) => prozent(aus, breite, hoehe, x, y)
      const dx = aus.hoch ? aus.x0 + aus.w - 175 - 1120 : 0
      return {
        krone: q(380, 385),
        stamm: q(382, 560),
        dach: [q(1104 + dx, 571), q(1190 + dx, 501), q(1276 + dx, 571)],
        boden: [q(0, 612).y, q(0, 652).y],
      }
    }
    const s = Math.max(breite / 160, hoehe / 90)
    const ox = (breite - 160 * s) / 2
    const oy = (hoehe - 90 * s) / 2
    const p = (x: number, y: number) => ({ x: ((ox + x * s) / breite) * 100, y: ((oy + y * s) / hoehe) * 100 })
    return {
      krone: p(40 + baumDx, 38),
      stamm: p(40 + baumDx, 56),
      dach: [p(hausX - 2, 61), p(hausX + 9, 52), p(hausX + 20, 61)],
      // oberhalb der drei Karten (quer ca. 74 % vom unteren Rand belegt, hochkant ca. 80 %)
      boden: hoch ? [70, 75] : [67, 72],
    }
  })
  // ---------- Tageslauf: Himmel, Sonne und Mond folgen der Uhrzeit ----------
  let jetzt = $state(new Date())
  const uhr = setInterval(() => (jetzt = new Date()), 30_000)
  onDestroy(() => clearInterval(uhr))
  const stunde = $derived(jetzt.getHours() + jetzt.getMinutes() / 60)
  const klemme = (v: number) => Math.max(0, Math.min(1, v))
  /** 0 = Tag, 1 = tiefe Nacht (Übergang 19–20 Uhr und 5–6 Uhr) */
  const dunkel = $derived(stunde >= 12 ? klemme(stunde - 19) : klemme(6 - stunde))
  /** Morgen-/Abendrot (6–8 und 17–19 Uhr) */
  const daemm = $derived(stunde < 12 ? klemme(1 - (stunde - 6) / 2) * klemme(stunde - 5) : klemme((stunde - 17) / 2) * klemme(20 - stunde))
  const istNacht = $derived(dunkel > 0.5)
  const bogen = (t: number) => ({ x: 22 + 116 * t, y: 52 - 42 * Math.sin(Math.PI * t) })
  const sonnenPos = $derived(bogen(klemme((stunde - 6) / 14)))
  const mondPos = $derived(bogen(klemme((stunde >= 12 ? stunde - 19 : stunde + 5) / 11)))
  function mixHex(a: string, b: string, t: number): string {
    const z = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
    const [r1, g1, b1] = z(a)
    const [r2, g2, b2] = z(b)
    const m = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0')
    return `#${m(r1, r2)}${m(g1, g2)}${m(b1, b2)}`
  }

  // Regenschauer ab und zu, wenn kein echtes Wetter vorliegt (nicht im Winter: dort schneit es)
  let schauer = $state(false)
  $effect(() => {
    if (wetterArt || jz === 'winter') {
      schauer = false
      return
    }
    let timer: ReturnType<typeof setTimeout>
    const weiter = (regnet: boolean) => {
      const dauer = regnet ? 45_000 + Math.random() * 60_000 : 4 * 60_000 + Math.random() * 8 * 60_000
      timer = setTimeout(() => {
        schauer = !regnet
        weiter(!regnet)
      }, dauer)
    }
    weiter(false)
    return () => clearTimeout(timer)
  })
  const art = $derived<WetterArt | null>(wetterArt ?? (schauer ? 'regen' : null))

  const trueb = $derived(wetterArt === 'regen' || wetterArt === 'gewitter' || wetterArt === 'nebel' || wetterArt === 'wolkig' || wetterArt === 'schnee')
  const himmel = $derived.by((): [string, string] => {
    const regnerisch = art === 'regen' || art === 'gewitter' || trueb
    let basis: [string, string] = art === 'gewitter' ? ['#5d6a80', '#a9b4c4'] : regnerisch ? ['#9fb2c6', '#dfe6ee'] : f.himmel
    if (daemm > 0) basis = [mixHex(basis[0], stunde < 12 ? '#f2a56a' : '#ee8662', daemm * 0.8), mixHex(basis[1], stunde < 12 ? '#ffe6b8' : '#ffd3a2', daemm * 0.8)]
    return [mixHex(basis[0], '#13204a', dunkel), mixHex(basis[1], '#3a4f86', dunkel)]
  })
  const huegel0 = $derived(mixHex(f.huegel[0], '#2e4a3a', dunkel))
  const huegel1 = $derived(mixHex(f.huegel[1], '#22382c', dunkel))

  // svelte-ignore state_referenced_locally
  const teile = Array.from({ length: 40 }, (_, i) => ({
    x: Math.round(Math.random() * 100),
    groesse: 10 + Math.round(Math.random() * 16),
    dauer: (7 + Math.random() * 7).toFixed(1),
    verz: (-Math.random() * 14).toFixed(1),
    pendel: 20 + Math.round(Math.random() * 60),
    i,
  }))
  const sterne = Array.from({ length: 40 }, () => ({ x: Math.random() * 100, y: Math.random() * 45, r: 0.15 + Math.random() * 0.3 }))
</script>

<div class="szene" bind:clientWidth={breite} bind:clientHeight={hoehe}>
  {#if jz === 'herbst'}
    <HerbstLandschaft {stunde} {dunkel} {daemm} {art} {aus} />
  {:else}
  <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="himmel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color={himmel[0]} />
        <stop offset="1" stop-color={himmel[1]} />
      </linearGradient>
    </defs>
    <rect width="160" height="90" fill="url(#himmel)" />
    {#if dunkel > 0}
      {#each sterne as st, i (i)}<circle cx={st.x * 1.6} cy={st.y} r={st.r} fill="#fff" opacity={0.85 * dunkel} />{/each}
    {/if}
    {#if dunkel < 0.9}
      <g opacity={1 - dunkel} transform="translate({sonnenPos.x - 128} {sonnenPos.y - 18})">
        <circle cx="128" cy="18" r={jz === 'sommer' ? 10 : 8} fill={daemm > 0.2 ? '#ffb347' : jz === 'winter' ? '#fff6d6' : '#ffd84a'} class="sonne" />
      </g>
    {/if}
    {#if dunkel > 0.1}
      <g opacity={dunkel} transform="translate({mondPos.x - 128} {mondPos.y - 18})">
        <circle cx="128" cy="18" r="8" fill="#fff4c2" />
        <circle cx="131" cy="16" r="7" fill={himmel[0]} />
      </g>
    {/if}
    {#if dunkel < 0.9}
      <g class="wolke" opacity={1 - dunkel}><ellipse cx="30" cy="18" rx="12" ry="4.5" fill="#fff" opacity="0.9" /><ellipse cx="37" cy="15" rx="7" ry="5" fill="#fff" opacity="0.9" /></g>
      <g class="wolke langsam" opacity={1 - dunkel}><ellipse cx="85" cy="12" rx="9" ry="3.5" fill="#fff" opacity="0.8" /><ellipse cx="90" cy="10" rx="5" ry="3.5" fill="#fff" opacity="0.8" /></g>
      <g class="wolke mittel" opacity={1 - dunkel}><ellipse cx="128" cy="30" rx="10" ry="3.6" fill="#fff" opacity="0.75" /><ellipse cx="122" cy="28" rx="6" ry="3.6" fill="#fff" opacity="0.75" /></g>
    {/if}
    <!-- Hügel -->
    <path d="M0 62 Q30 48 62 58 T122 54 T160 58 V90 H0 Z" fill={huegel0} />
    <path d="M0 74 Q40 62 82 72 T160 68 V90 H0 Z" fill={huegel1} />
    <!-- Baum -->
    <g transform={hoch ? 'translate(30 0)' : undefined}>
    <rect x="38" y="44" width="4" height="22" rx="1.5" fill="#7a4e2d" />
    <g class="krone">
    <circle cx="40" cy="40" r="11" fill={f.krone[0]} />
    <circle cx="33" cy="44" r="7.5" fill={f.krone[1]} />
    <circle cx="47" cy="44" r="7.5" fill={f.krone[2]} />
    <circle cx="40" cy="33" r="7" fill={f.krone[1]} />
    </g>
    </g>
    <!-- kleines Haus -->
    <g transform={hoch ? 'translate(82 54)' : 'translate(110 54)'}>
      <rect x="0" y="6" width="18" height="12" fill={jz === 'winter' ? '#f3e2c9' : '#f6d6a8'} />
      <path d="M-2 7 L9 -2 L20 7 Z" fill="#c9563c" />
      {#if jz === 'winter'}<path d="M-2.5 7.2 L9 -2.6 L20.5 7.2 L18 7.2 L9 0.4 L0 7.2 Z" fill="#ffffff" /><path d="M2 3.6 L9 -2 L16 3.6 Z" fill="#ffffff" />{/if}
      <rect x="7" y="11" width="4" height="7" fill="#7a4e2d" />
      <rect x="2" y="9" width="3.5" height="3" fill={istNacht ? '#ffd84a' : '#bfe3ff'} />
      <rect x="12.5" y="9" width="3.5" height="3" fill={istNacht ? '#ffd84a' : '#bfe3ff'} />
    </g>
    {#if jz === 'fruehling' || jz === 'sommer'}
      {#each [12, 22, 70, 78, 92, 140, 150] as x, i (i)}
        <circle cx={x} cy={76 + (i % 3) * 3} r="1.4" fill={['#ff5d8f', '#ffd84a', '#ffffff', '#b07cff'][i % 4]} />
      {/each}
    {/if}
    {#if jz === 'winter'}
      <path d="M0 84 Q14 80.5 30 83 T62 82 T96 83.5 T130 81.5 T160 83 V90 H0 Z" fill="#fff" />
      <path d="M0 87 Q22 84.5 46 86.5 T100 86 T160 86.5 V90 H0 Z" fill="#e6eff8" />
      <ellipse cx="40" cy="66.3" rx="5.5" ry="1.2" fill="#fff" />
      <circle cx="70" cy="78" r="4.5" fill="#fff" /><circle cx="70" cy="71" r="3.2" fill="#fff" /><path d="M70 71 l3 0.6 -3 0.6 z" fill="#f08a24" />
    {/if}
  </svg>
  {/if}

  <Figuren {jz} {orte} nacht={istNacht} regen={art === 'regen' || art === 'gewitter'} />
  <SzenenEreignisse {jz} {orte} />

  {#if art === 'wolkig' || art === 'regen' || art === 'gewitter' || art === 'schnee'}
    <div class="wetter-wolken" class:dunkel={art === 'gewitter'}>
      {#each [8, 30, 55, 78] as x, i (i)}<span style="left: {x}%; top: {4 + (i % 2) * 7}%; animation-delay: {-i * 9}s"></span>{/each}
    </div>
  {/if}
  {#if art === 'regen' || art === 'gewitter'}
    <div class="pfuetzen" style="top: {orte.boden[1] + 1}%">{#each [18, 34, 52, 71, 86] as x, i (i)}<span style="left: {x}%; animation-delay: {-i * 0.4}s"></span>{/each}</div>
    <div class="wetter-regen">{#each Array.from({ length: 60 }) as _, i (i)}<span style="left: {(i * 37) % 100}%; animation-delay: {((i * 13) % 10) / 10}s"></span>{/each}</div>
  {/if}
  {#if art === 'gewitter'}<div class="blitz"></div>{/if}
  {#if art === 'schnee' && jz !== 'winter'}
    <div class="wetter-schnee">{#each Array.from({ length: 40 }) as _, i (i)}<span style="left: {(i * 29) % 100}%; animation-delay: {-((i * 7) % 12)}s"></span>{/each}</div>
  {/if}
  {#if art === 'nebel'}
    <div class="wetter-nebel">{#each [30, 52, 70] as y, i (i)}<span style="top: {y}%; animation-delay: {-i * 12}s"></span>{/each}</div>
  {/if}

  {#if f.teilchen.length && jz !== 'herbst'}
    <div class="teilchen" class:schnee={jz === 'winter'}>
      {#each teile.slice(0, jz === 'winter' ? 40 : 26) as t (t.i)}
        <span
          style="left: {t.x}%; width: {t.groesse}px; height: {jz === 'winter' ? t.groesse : t.groesse * 0.7}px; background: {f.teilchen[t.i % f.teilchen.length]}; --dauer: {t.dauer}s; --pendel: {t.pendel}px; animation-delay: {t.verz}s, {t.verz}s"
        ></span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .szene {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  svg {
    pointer-events: none;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .wetter-wolken,
  .wetter-regen,
  .wetter-schnee,
  .wetter-nebel,
  .blitz {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .wetter-wolken span {
    position: absolute;
    width: 26vw;
    height: 9vw;
    border-radius: 999px;
    background: radial-gradient(ellipse at 40% 40%, #ffffff, #d5dce6 70%);
    opacity: 0.9;
    animation: treiben 40s linear infinite alternate;
  }
  .wetter-wolken.dunkel span {
    background: radial-gradient(ellipse at 40% 40%, #8e98a8, #59647a 70%);
  }
  .wetter-regen span {
    position: absolute;
    top: -10%;
    width: 2px;
    height: 24px;
    background: rgba(60, 100, 170, 0.5);
    animation: regen 0.8s linear infinite;
  }
  .wetter-schnee span {
    position: absolute;
    top: -5%;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #fff;
    animation: schnee 12s linear infinite;
  }
  .wetter-nebel span {
    position: absolute;
    left: -30%;
    width: 160%;
    height: 14%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.45);
    filter: blur(14px);
    animation: nebel 36s ease-in-out infinite alternate;
  }
  .blitz {
    background: #fff;
    opacity: 0;
    animation: blitz 9s infinite;
  }
  @keyframes treiben {
    to {
      translate: 8vw 0;
    }
  }
  @keyframes regen {
    to {
      top: 105%;
    }
  }
  @keyframes schnee {
    to {
      top: 105%;
      translate: -40px 0;
    }
  }
  @keyframes nebel {
    to {
      translate: 20% 0;
    }
  }
  @keyframes blitz {
    0%,
    90%,
    94%,
    100% {
      opacity: 0;
    }
    91%,
    93% {
      opacity: 0.7;
    }
  }
  .wolke {
    animation: ziehen 80s ease-in-out infinite alternate;
  }
  .wolke.langsam {
    animation-duration: 120s;
  }
  .wolke.mittel {
    animation-duration: 100s;
    animation-direction: alternate-reverse;
  }
  .krone {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation: wiegen 6s ease-in-out infinite alternate;
  }
  @keyframes wiegen {
    from {
      transform: rotate(-1.3deg);
    }
    to {
      transform: rotate(1.5deg);
    }
  }
  .pfuetzen {
    position: absolute;
    left: 0;
    right: 0;
    height: 0;
    pointer-events: none;
  }
  .pfuetzen span {
    position: absolute;
    width: 9vw;
    height: 1.6vh;
    translate: -50% 0;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(120, 165, 215, 0.55), rgba(120, 165, 215, 0.15) 70%, transparent);
    animation: pfuetze 2.4s ease-in-out infinite alternate;
  }
  @keyframes pfuetze {
    from {
      scale: 0.85 1;
      opacity: 0.6;
    }
    to {
      scale: 1.05 1;
      opacity: 1;
    }
  }
  .sonne {
    animation: leuchten 6s ease-in-out infinite alternate;
  }
.teilchen {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .teilchen span {
    position: absolute;
    top: -40px;
    border-radius: 50% 0 50% 0;
    opacity: 0.9;
    animation:
      fallen var(--dauer) linear infinite,
      pendeln calc(var(--dauer) / 3) ease-in-out infinite alternate;
  }
  .teilchen.schnee span {
    border-radius: 50%;
  }
  @keyframes fallen {
    to {
      top: 105%;
      rotate: 540deg;
    }
  }
  @keyframes pendeln {
    from {
      translate: calc(var(--pendel) * -1) 0;
    }
    to {
      translate: var(--pendel) 0;
    }
  }
  @keyframes ziehen {
    to {
      transform: translateX(60px);
    }
  }
  @keyframes leuchten {
    to {
      opacity: 0.85;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .teilchen {
      display: none;
    }
  }
</style>
