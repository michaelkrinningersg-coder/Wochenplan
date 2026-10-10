<script lang="ts">
  import Bild from '../komponenten/Bild.svelte'
  import Fenster from '../komponenten/Fenster.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import { TAGE, abschnittInfo, tagName } from '../lib/konstanten'
  import { app, aufgabeKopieren, finde, zeigeHinweis } from '../lib/speicher.svelte'
  import type { TagId } from '../lib/typen'

  let props: { tag: TagId; id: string } = $props()
  // Werte festhalten: Nach dem Schließen (app.dialog = null) sind die Props nicht mehr lesbar
  // svelte-ignore state_referenced_locally
  const { tag, id } = props
  const fund = finde(tag, id)

  let ziele = $state<TagId[]>([])

  function umschalten(z: TagId) {
    ziele = ziele.includes(z) ? ziele.filter((x) => x !== z) : [...ziele, z]
  }
  function kopieren() {
    if (!fund || ziele.length === 0) return
    aufgabeKopieren(tag, id, ziele)
    zeigeHinweis(`„${fund.aufgabe.titel}“ kopiert nach ${ziele.map(tagName).join(', ')}`)
    app.dialog = null
  }
</script>

<Fenster titel="Aufgabe kopieren">
  {#if fund}
    <div class="inhalt">
      <div class="aufgabe" data-seg={fund.abschnitt}>
        <span class="bild"><Bild id={fund.aufgabe.bild} zusatz={fund.aufgabe.zusatz} /></span>
        <span><b>{fund.aufgabe.titel}</b><br /><small>{abschnittInfo(fund.abschnitt).name}, gleiche Tageszeit an jedem Zieltag</small></span>
      </div>
      <p>Auf welche Tage soll die Aufgabe zusätzlich?</p>
      <div class="reihe">
        {#each TAGE as t (t.id)}
          <button class="knopf" aria-pressed={ziele.includes(t.id)} onclick={() => umschalten(t.id)} data-autofokus={t.id === 'mo' ? true : undefined}>
            {t.kurz}{t.id === tag ? ' (nochmal)' : ''}
          </button>
        {/each}
      </div>
      <div class="reihe">
        <button class="knopf klein" onclick={() => (ziele = ['mo', 'di', 'mi', 'do', 'fr'].filter((z) => z !== tag) as TagId[])}>Mo–Fr</button>
        <button class="knopf klein" onclick={() => (ziele = TAGE.map((t) => t.id).filter((z) => z !== tag))}>Alle anderen Tage</button>
      </div>
      <div class="reihe">
        <button class="knopf haupt" disabled={ziele.length === 0} onclick={kopieren}><Symbol name="kopie" />Kopieren</button>
        <button class="knopf" onclick={() => (app.dialog = null)}>Abbrechen</button>
      </div>
    </div>
  {/if}
</Fenster>

<style>
  .inhalt {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .aufgabe {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 18px;
    background: var(--seg-hell);
  }
  .bild {
    width: 54px;
    height: 54px;
    flex: none;
  }
  small {
    color: var(--tinte-leise);
  }
  p {
    margin: 0;
  }
  .reihe {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .knopf.klein {
    font-size: var(--t-klein);
    min-height: 2.2em;
  }
  .knopf:disabled {
    opacity: 0.4;
  }
</style>
