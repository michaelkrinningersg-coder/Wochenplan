<script lang="ts">
  // Mit der Fernbedienung im Bearbeiten-Modus: was soll mit der Aufgabe passieren?
  import Fenster from '../komponenten/Fenster.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import { app, aufgabeLoeschen, finde, zeigeHinweis } from '../lib/speicher.svelte'
  import type { TagId } from '../lib/typen'

  let { tag, id }: { tag: TagId; id: string } = $props()

  const fund = $derived(finde(tag, id))
  let loeschenFragen = $state(false)

  function aendern() {
    if (!fund) return
    app.dialog = { art: 'bearbeiten', tag, abschnitt: fund.abschnitt, aufgabe: { ...fund.aufgabe }, neu: false }
  }
  function verschieben() {
    app.dialog = null
    app.verschieben = { tag, id }
    app.fokusZiel = 'aufgabe:' + id
    zeigeHinweis('Mit den Pfeiltasten verschieben, OK legt ab')
  }
  function loeschen() {
    aufgabeLoeschen(tag, id)
    app.dialog = null
  }
</script>

<Fenster titel={fund?.aufgabe.titel ?? 'Aufgabe'}>
  <div class="liste">
    <button class="knopf" onclick={aendern} data-autofokus><Symbol name="stift" />Ändern</button>
    <button class="knopf" onclick={verschieben}><Symbol name="pfeile" />Verschieben</button>
    {#if loeschenFragen}
      <button class="knopf gefahr" onclick={loeschen}><Symbol name="muell" />Wirklich löschen</button>
    {:else}
      <button class="knopf gefahr" onclick={() => (loeschenFragen = true)}><Symbol name="muell" />Löschen</button>
    {/if}
  </div>
</Fenster>

<style>
  .liste {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .liste .knopf {
    justify-content: flex-start;
  }
</style>
