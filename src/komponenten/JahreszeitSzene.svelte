<script lang="ts">
  // Gemalte Landschaft je Jahreszeit (SVG + CSS): Himmel, Hügel, Baum, fallende Blätter/Schnee/Blüten.
  // Nachts dunkler Himmel mit Mond und Sternen.
  import type { Jahreszeit, Orte } from '../lib/jahreszeit'
  import SzenenEreignisse from './SzenenEreignisse.svelte'

  let { jz, nacht = false }: { jz: Jahreszeit; nacht?: boolean } = $props()

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
  const orte = $derived.by((): Orte => {
    const s = Math.max(breite / 160, hoehe / 90)
    const ox = (breite - 160 * s) / 2
    const oy = (hoehe - 90 * s) / 2
    const p = (x: number, y: number) => ({ x: ((ox + x * s) / breite) * 100, y: ((oy + y * s) / hoehe) * 100 })
    return {
      krone: p(40 + baumDx, 38),
      stamm: p(40 + baumDx, 56),
      dach: [p(hausX - 2, 61), p(hausX + 9, 52), p(hausX + 20, 61)],
      // oberhalb der drei Karten (quer ca. 74 % vom unteren Rand belegt, hochkant ca. 80 %)
      boden: hoch ? [68, 74] : [62, 68],
    }
  })
  const himmel = $derived<[string, string]>(nacht ? ['#13204a', '#3a4f86'] : f.himmel)

  // svelte-ignore state_referenced_locally
  const teile = Array.from({ length: 26 }, (_, i) => ({
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
  <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="himmel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color={himmel[0]} />
        <stop offset="1" stop-color={himmel[1]} />
      </linearGradient>
    </defs>
    <rect width="160" height="90" fill="url(#himmel)" />
    {#if nacht}
      {#each sterne as s, i (i)}<circle cx={s.x * 1.6} cy={s.y} r={s.r} fill="#fff" opacity="0.85" />{/each}
      <circle cx="128" cy="18" r="8" fill="#fff4c2" />
      <circle cx="131" cy="16" r="7" fill={himmel[0]} />
    {:else}
      <circle cx="128" cy="18" r={jz === 'sommer' ? 10 : 8} fill={jz === 'winter' ? '#fff6d6' : '#ffd84a'} class="sonne" />
      <g class="wolke"><ellipse cx="30" cy="18" rx="12" ry="4.5" fill="#fff" opacity="0.9" /><ellipse cx="37" cy="15" rx="7" ry="5" fill="#fff" opacity="0.9" /></g>
      <g class="wolke langsam"><ellipse cx="85" cy="12" rx="9" ry="3.5" fill="#fff" opacity="0.8" /><ellipse cx="90" cy="10" rx="5" ry="3.5" fill="#fff" opacity="0.8" /></g>
    {/if}
    <!-- Hügel -->
    <path d="M0 62 Q30 48 62 58 T122 54 T160 58 V90 H0 Z" fill={nacht ? '#2e4a3a' : f.huegel[0]} />
    <path d="M0 74 Q40 62 82 72 T160 68 V90 H0 Z" fill={nacht ? '#22382c' : f.huegel[1]} />
    <!-- Baum -->
    <g transform={hoch ? 'translate(30 0)' : undefined}>
    <rect x="38" y="44" width="4" height="22" rx="1.5" fill="#7a4e2d" />
    <circle cx="40" cy="40" r="11" fill={f.krone[0]} />
    <circle cx="33" cy="44" r="7.5" fill={f.krone[1]} />
    <circle cx="47" cy="44" r="7.5" fill={f.krone[2]} />
    <circle cx="40" cy="33" r="7" fill={f.krone[1]} />
    {#if jz === 'herbst'}
      <circle cx="37" cy="38" r="1.6" fill="#c94a2a" /><circle cx="44" cy="42" r="1.6" fill="#c94a2a" />
    {/if}
    </g>
    <!-- kleines Haus -->
    <g transform={hoch ? 'translate(82 54)' : 'translate(110 54)'}>
      <rect x="0" y="6" width="18" height="12" fill={jz === 'winter' ? '#f3e2c9' : '#f6d6a8'} />
      <path d="M-2 7 L9 -2 L20 7 Z" fill="#c9563c" />
      {#if jz === 'winter'}<path d="M-2.5 7.2 L9 -2.6 L20.5 7.2 L18 7.2 L9 0.4 L0 7.2 Z" fill="#ffffff" /><path d="M2 3.6 L9 -2 L16 3.6 Z" fill="#ffffff" />{/if}
      <rect x="7" y="11" width="4" height="7" fill="#7a4e2d" />
      <rect x="2" y="9" width="3.5" height="3" fill={nacht ? '#ffd84a' : '#bfe3ff'} />
      <rect x="12.5" y="9" width="3.5" height="3" fill={nacht ? '#ffd84a' : '#bfe3ff'} />
    </g>
    {#if jz === 'fruehling' || jz === 'sommer'}
      {#each [12, 22, 70, 78, 92, 140, 150] as x, i (i)}
        <circle cx={x} cy={76 + (i % 3) * 3} r="1.4" fill={['#ff5d8f', '#ffd84a', '#ffffff', '#b07cff'][i % 4]} />
      {/each}
    {/if}
    {#if jz === 'herbst'}
      <ellipse cx="66" cy="80" rx="4" ry="3.2" fill="#f08a24" /><rect x="65.5" y="76" width="1" height="2" fill="#5a3a1a" />
      <ellipse cx="74" cy="82" rx="3" ry="2.4" fill="#f2a03d" />
    {/if}
    {#if jz === 'winter'}
      <circle cx="70" cy="78" r="4.5" fill="#fff" /><circle cx="70" cy="71" r="3.2" fill="#fff" /><path d="M70 71 l3 0.6 -3 0.6 z" fill="#f08a24" />
    {/if}
  </svg>

  <SzenenEreignisse {jz} {orte} />

  {#if f.teilchen.length}
    <div class="teilchen" class:schnee={jz === 'winter'}>
      {#each teile as t (t.i)}
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
  .wolke {
    animation: ziehen 60s linear infinite alternate;
  }
  .wolke.langsam {
    animation-duration: 90s;
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
      transform: translateX(40px);
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
