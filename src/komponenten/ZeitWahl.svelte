<script lang="ts">
  // Uhrzeit mit Minus/Plus einstellen – bequemer mit Fernbedienung als ein Texteingabefeld.
  import { minutenVon, uhr } from '../lib/zeit'

  let {
    wert = $bindable(),
    schritt = 15,
    leerErlaubt = false,
    label,
  }: { wert: string | undefined; schritt?: number; leerErlaubt?: boolean; label: string } = $props()

  function setzen(min: number) {
    const m = ((min % 1440) + 1440) % 1440
    wert = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  }
  function aendern(delta: number) {
    if (!wert) {
      setzen(9 * 60)
      return
    }
    const m = minutenVon(wert)
    setzen(Math.round((m + delta) / schritt) * schritt)
  }
</script>

<div class="zeitwahl" role="group" aria-label={label}>
  <button type="button" class="knopf rund" onclick={() => aendern(-schritt)} aria-label="{label} früher">−</button>
  <span class="wert">{wert ? uhr(minutenVon(wert), true) : 'keine'}</span>
  <button type="button" class="knopf rund" onclick={() => aendern(schritt)} aria-label="{label} später">+</button>
  {#if leerErlaubt && wert}
    <button type="button" class="knopf" onclick={() => (wert = undefined)}>keine</button>
  {/if}
</div>

<style>
  .zeitwahl {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .wert {
    min-width: 3.4em;
    text-align: center;
    font-family: var(--schrift-titel);
    font-weight: 600;
    font-size: var(--t-gross);
    font-variant-numeric: tabular-nums;
  }
</style>
