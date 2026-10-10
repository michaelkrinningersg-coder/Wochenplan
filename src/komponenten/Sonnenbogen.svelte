<script lang="ts">
  // Die Sonne wandert über den Tag – über der Spalte des aktuellen Abschnitts.
  // Abends geht der Mond auf.
  import { ICON_URL } from '../lib/bilder'
  import { ABSCHNITTE } from '../lib/konstanten'
  import type { TagesPhase } from '../lib/zeit'

  let {
    phase,
    lagen,
    breite,
  }: { phase: TagesPhase; lagen: { links: number; breite: number }[]; breite: number } = $props()

  const H = 64
  const OBEN = 14
  const UNTEN = H - 10

  function yBei(x: number): number {
    if (breite <= 0) return UNTEN
    const t = Math.min(1, Math.max(0, x / breite))
    const c = 2 * OBEN - UNTEN
    return UNTEN + 2 * t * (1 - t) * (c - UNTEN)
  }

  const pos = $derived.by(() => {
    if (breite <= 0) return null
    if (phase.art === 'vorher') return { x: 18, mond: true }
    if (phase.art === 'nachher') return { x: breite - 18, mond: true }
    const i = ABSCHNITTE.findIndex((a) => a.id === phase.id)
    const l = lagen[i]
    if (!l) return null
    const x = l.links + l.breite * phase.anteil
    return { x, mond: phase.id === 'abend' || phase.id === 'bett' }
  })

  const pfad = $derived(`M 0 ${UNTEN} Q ${breite / 2} ${2 * OBEN - UNTEN} ${breite} ${UNTEN}`)
</script>

<div class="bogen" style="height: {H}px" aria-hidden="true">
  {#if breite > 0}
    <svg width={breite} height={H} viewBox="0 0 {breite} {H}">
      <path d={pfad} class="bahn" />
    </svg>
    {#if pos}
      <img
        class="gestirn"
        class:mond={pos.mond}
        src={pos.mond ? ICON_URL['_nacht'] : ICON_URL['_sonne']}
        alt=""
        style="left: {pos.x}px; top: {yBei(pos.x)}px"
      />
    {/if}
  {/if}
</div>

<style>
  .bogen {
    position: relative;
    flex: none;
    margin-bottom: -18px;
    pointer-events: none;
    z-index: 4;
  }
  svg {
    position: absolute;
    inset: 0;
    overflow: visible;
  }
  .bahn {
    fill: none;
    stroke: var(--tinte-leise);
    stroke-width: 2.5;
    stroke-dasharray: 1 9;
    stroke-linecap: round;
    opacity: 0.55;
  }
  .gestirn {
    position: absolute;
    width: 52px;
    height: 52px;
    transform: translate(-50%, -50%);
    filter: drop-shadow(0 0 10px var(--sonne));
    transition:
      left 1s linear,
      top 1s linear;
  }
  .gestirn.mond {
    width: 44px;
    height: 44px;
    filter: drop-shadow(0 0 8px rgba(255, 220, 120, 0.6));
  }
</style>
