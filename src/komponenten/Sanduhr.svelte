<script lang="ts">
  // Sanduhr als Alternative zur Ampel: oben rinnt der Sand weg, unten wächst der Haufen.
  let {
    anteil,
    laeuft,
    vorbei,
    hoehe,
  }: { anteil: number; laeuft: boolean; vorbei: boolean; hoehe: number } = $props()

  const a = $derived(Math.min(1, Math.max(0, anteil)))
  // Oberer Kolben: Sand liegt unten am Hals (y = 80) und sinkt von oben ab
  const obenY = $derived(80 - 58 * a)
  // Unterer Kolben: Haufen wächst vom Boden (y = 146) nach oben
  const untenY = $derived(146 - 54 * (1 - a))
  const GLAS = 'M22 16 H78 C78 50 57 68 52 80 C57 92 78 110 78 144 H22 C22 110 43 92 48 80 C43 68 22 50 22 16 Z'
</script>

<div class="sanduhr" class:vorbei style="--h: {hoehe}px" role="img" aria-label={vorbei ? 'Die Zeit ist um' : `Noch ${Math.round(a * 100)} Prozent Sand oben`}>
  <svg viewBox="0 0 100 160" aria-hidden="true">
    <defs>
      <clipPath id="sanduhr-glas"><path d={GLAS} /></clipPath>
    </defs>
    <!-- Rahmen -->
    <rect x="10" y="4" width="80" height="12" rx="5" class="holz" />
    <rect x="10" y="144" width="80" height="12" rx="5" class="holz" />
    <rect x="14" y="14" width="5" height="132" rx="2" class="holz stab" />
    <rect x="81" y="14" width="5" height="132" rx="2" class="holz stab" />
    <!-- Glas -->
    <path d={GLAS} class="glas" />
    <g clip-path="url(#sanduhr-glas)">
      <rect x="0" y={obenY} width="100" height={Math.max(0, 80 - obenY)} class="sand" />
      <rect x="0" y={untenY} width="100" height={146 - untenY} class="sand" />
      {#if laeuft && a > 0}
        <line x1="50" y1="80" x2="50" y2={untenY} class="strahl" />
      {/if}
    </g>
    <path d={GLAS} class="glanz" />
  </svg>
</div>

<style>
  .sanduhr {
    width: calc(var(--h) * 0.62);
    height: var(--h);
    flex: none;
  }
  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .holz {
    fill: var(--gehaeuse);
  }
  .vorbei .holz {
    fill: var(--rot);
    animation: blinken 1s steps(2, jump-none) infinite;
  }
  .glas {
    fill: var(--tafel);
    opacity: 0.85;
  }
  .glanz {
    fill: none;
    stroke: var(--tinte);
    stroke-width: 2;
    opacity: 0.5;
  }
  .sand {
    fill: #e9b44c;
  }
  .strahl {
    stroke: #e9b44c;
    stroke-width: 2.2;
    stroke-dasharray: 3 3;
    animation: rieseln 0.4s linear infinite;
  }
  @keyframes rieseln {
    to {
      stroke-dashoffset: -6;
    }
  }
  @keyframes blinken {
    50% {
      opacity: 0.35;
    }
  }
</style>
