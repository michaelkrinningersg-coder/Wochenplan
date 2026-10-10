<script lang="ts">
  import { t } from '../lib/i18n.svelte'
  // Zeigeruhr, auf gute Lesbarkeit getrimmt: große Ziffern, kräftige Zeiger, kurzer Stundenzeiger dunkel, Minutenzeiger blau.
  let { zeit, groesse = 240, sekunden = false }: { zeit: Date; groesse?: number; sekunden?: boolean } = $props()

  const h = $derived(zeit.getHours() % 12)
  const m = $derived(zeit.getMinutes())
  const s = $derived(zeit.getSeconds())
  const winkelStunde = $derived((h + m / 60) * 30)
  const winkelMinute = $derived((m + s / 60) * 6)
  const winkelSekunde = $derived(s * 6)
  const ZIFFERN = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1
    const w = (n * 30 * Math.PI) / 180
    return { n, x: 50 + Math.sin(w) * 31.5, y: 50 - Math.cos(w) * 31.5 }
  })
  const STRICHE = Array.from({ length: 60 }, (_, i) => i)
</script>

<svg class="analog" viewBox="0 0 100 100" width={groesse} height={groesse} role="img" aria-label={t('Uhr: {h} Uhr {m}', { h: zeit.getHours(), m })}>
  <circle cx="50" cy="50" r="48" class="rand" />
  <circle cx="50" cy="50" r="45.5" class="blatt" />
  {#each STRICHE as i (i)}
    <line
      x1="50"
      y1={i % 5 === 0 ? 6.8 : 7.2}
      x2="50"
      y2={i % 5 === 0 ? 10.6 : 8.8}
      class={i % 5 === 0 ? 'strich gross' : 'strich'}
      transform="rotate({i * 6} 50 50)"
    />
  {/each}
  {#each ZIFFERN as z (z.n)}
    <text x={z.x} y={z.y} class="ziffer">{z.n}</text>
  {/each}
  <line x1="50" y1="56" x2="50" y2="28" class="zeiger stunde" transform="rotate({winkelStunde} 50 50)" />
  <line x1="50" y1="58" x2="50" y2="14" class="zeiger minute" transform="rotate({winkelMinute} 50 50)" />
  {#if sekunden}
    <line x1="50" y1="60" x2="50" y2="12" class="zeiger sekunde" transform="rotate({winkelSekunde} 50 50)" />
  {/if}
  <circle cx="50" cy="50" r="3.2" class="mitte" />
</svg>

<style>
  .analog {
    display: block;
    flex: none;
  }
  .rand {
    fill: #1f2a44;
  }
  .blatt {
    fill: #ffffff;
  }
  .strich {
    stroke: #9aa3b5;
    stroke-width: 0.8;
    stroke-linecap: round;
  }
  .strich.gross {
    stroke: #1f2a44;
    stroke-width: 1.8;
  }
  .ziffer {
    font-family: var(--schrift-titel), system-ui, sans-serif;
    font-weight: 700;
    font-size: 10px;
    fill: #1f2a44;
    text-anchor: middle;
    dominant-baseline: central;
  }
  .zeiger {
    stroke-linecap: round;
  }
  .stunde {
    stroke: #1f2a44;
    stroke-width: 5;
  }
  .minute {
    stroke: #2a7fb8;
    stroke-width: 3.2;
  }
  .sekunde {
    stroke: #e0452b;
    stroke-width: 1;
  }
  .mitte {
    fill: #1f2a44;
    stroke: #ffffff;
    stroke-width: 1;
  }
</style>
