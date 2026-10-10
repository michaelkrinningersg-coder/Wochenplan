<script lang="ts">
  // Große Uhr über dem ganzen Bildschirm (nach Auswahl der Uhr oben). Schließt mit OK, Zurück oder nach 20 Sekunden.
  import { onMount } from 'svelte'
  import { app, zurueck } from '../lib/speicher.svelte'
  import { uhrzeitAnsagen } from '../lib/vorlesen'
  import { datumLang } from '../lib/zeit'
  import AnalogUhr from './AnalogUhr.svelte'

  let breite = $state(800)
  let hoehe = $state(600)
  const jetzt = $derived(new Date(app.jetzt))
  const analog = $derived((app.einst.uhrArt ?? 'digital') === 'analog')
  const groesse = $derived(Math.floor(Math.min(breite * 0.8, hoehe * 0.68)))
  const hh = $derived(String(jetzt.getHours()).padStart(2, '0'))
  const mm = $derived(String(jetzt.getMinutes()).padStart(2, '0'))

  onMount(() => {
    uhrzeitAnsagen(new Date())
    const t = setTimeout(() => {
      if (app.dialog?.art === 'uhr') zurueck()
    }, 20_000)
    return () => clearTimeout(t)
  })
</script>

<div class="grosse-uhr" bind:clientWidth={breite} bind:clientHeight={hoehe}>
  <button class="flaeche" onclick={() => zurueck()} aria-label="Uhr schließen" data-autofokus>
    {#if analog}
      <AnalogUhr zeit={jetzt} {groesse} sekunden />
      <span class="digital klein">{hh}:{mm} Uhr</span>
    {:else}
      <span class="digital" style="font-size: {Math.floor(Math.min(breite * 0.26, hoehe * 0.5))}px">{hh}<span class="punkt">:</span>{mm}</span>
    {/if}
    <span class="datum">{datumLang(jetzt)}</span>
  </button>
  <button class="knopf nochmal" onclick={() => uhrzeitAnsagen(new Date())}>Nochmal sagen</button>
</div>

<style>
  .grosse-uhr {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: grid;
    place-items: center;
    background: var(--himmel);
  }
  .flaeche {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    border: none;
    background: none;
    color: var(--tinte);
    padding: 0;
  }
  .flaeche:focus-visible {
    outline: none;
  }
  .digital {
    font-family: var(--schrift-titel);
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }
  .digital.klein {
    font-size: clamp(28px, 6vh, 64px);
  }
  .punkt {
    animation: blinken 2s steps(1) infinite;
  }
  .datum {
    font-size: clamp(18px, 3.4vh, 34px);
    color: var(--tinte-leise);
  }
  .nochmal {
    position: absolute;
    bottom: 24px;
    right: 24px;
  }
  @keyframes blinken {
    50% {
      opacity: 0.25;
    }
  }
</style>
