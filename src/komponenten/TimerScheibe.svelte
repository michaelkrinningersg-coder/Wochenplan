<script lang="ts">
  // Zeitscheibe wie bei einer Kinder-Uhr: die farbige Fläche ist die Zeit, die noch übrig ist.
  import type { Snippet } from 'svelte'

  let {
    anteil,
    farbe,
    groesse,
    children,
  }: { anteil: number | null; farbe: string; groesse: number; children: Snippet } = $props()

  const R = 96
  const M = 100

  const keil = $derived.by(() => {
    if (anteil === null) return ''
    const a = Math.min(1, Math.max(0, anteil))
    if (a <= 0) return ''
    if (a >= 0.9999) return 'voll'
    const w = a * 2 * Math.PI
    const x = M + R * Math.sin(w)
    const y = M - R * Math.cos(w)
    const gross = a > 0.5 ? 1 : 0
    return `M ${M} ${M} L ${M} ${M - R} A ${R} ${R} 0 ${gross} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`
  })

  const striche = Array.from({ length: 12 }, (_, i) => i * 30)
</script>

<div class="scheibe" style="--d: {groesse}px">
  <svg viewBox="0 0 200 200" aria-hidden="true">
    <circle cx={M} cy={M} r={R + 3} class="grund" />
    {#if keil === 'voll'}
      <circle cx={M} cy={M} r={R} fill={farbe} />
    {:else if keil}
      <path d={keil} fill={farbe} />
    {/if}
    {#each striche as w (w)}
      <line
        x1={M + (R - 2) * Math.sin((w * Math.PI) / 180)}
        y1={M - (R - 2) * Math.cos((w * Math.PI) / 180)}
        x2={M + (R - 9) * Math.sin((w * Math.PI) / 180)}
        y2={M - (R - 9) * Math.cos((w * Math.PI) / 180)}
        class="strich"
      />
    {/each}
    <circle cx={M} cy={M} r={R * 0.68} class="teller" />
  </svg>
  <div class="mitte">
    {@render children()}
  </div>
</div>

<style>
  .scheibe {
    position: relative;
    width: var(--d);
    height: var(--d);
    flex: none;
  }
  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .grund {
    fill: var(--seg-hell, var(--himmel));
    stroke: var(--tafel);
    stroke-width: 3;
  }
  .strich {
    stroke: var(--tinte);
    stroke-width: 2.4;
    stroke-linecap: round;
    opacity: 0.35;
  }
  .teller {
    fill: var(--tafel);
  }
  .mitte {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 50%;
    height: 50%;
    transform: translate(-50%, -50%);
  }
</style>
