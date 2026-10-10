<script lang="ts">
  import Fenster from '../komponenten/Fenster.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import { TAGE, tagName } from '../lib/konstanten'
  import { app, tagKopieren, tagLeeren, zeigeHinweis } from '../lib/speicher.svelte'
  import type { TagId } from '../lib/typen'

  let { tag }: { tag: TagId } = $props()

  let ziele = $state<TagId[]>([])
  let ersetzen = $state(true)
  let leerenFragen = $state(false)

  function umschalten(id: TagId) {
    ziele = ziele.includes(id) ? ziele.filter((z) => z !== id) : [...ziele, id]
  }
  function kopieren() {
    if (ziele.length === 0) return
    tagKopieren(tag, ziele, ersetzen)
    zeigeHinweis(`${tagName(tag)} kopiert nach ${ziele.map(tagName).join(', ')}`)
    app.dialog = null
  }
</script>

<Fenster titel="{tagName(tag)} kopieren">
  <div class="inhalt">
    <p class="erklaerung">Auf welche Tage soll der Plan von {tagName(tag)} kommen?</p>
    <div class="tage">
      {#each TAGE as t (t.id)}
        <button
          class="knopf"
          disabled={t.id === tag}
          aria-pressed={ziele.includes(t.id)}
          onclick={() => umschalten(t.id)}
          data-autofokus={t.id === TAGE[(TAGE.findIndex((x) => x.id === tag) + 1) % 7].id ? true : undefined}
        >
          {t.kurz}
        </button>
      {/each}
    </div>
    <div class="wahl">
      <button class="knopf" aria-pressed={ersetzen} onclick={() => (ersetzen = true)}>Vorhandenes ersetzen</button>
      <button class="knopf" aria-pressed={!ersetzen} onclick={() => (ersetzen = false)}>Hinten anhängen</button>
    </div>
    <div class="aktionen">
      <button class="knopf haupt" disabled={ziele.length === 0} onclick={kopieren}><Symbol name="kopie" />Kopieren</button>
      {#if leerenFragen}
        <button
          class="knopf gefahr"
          onclick={() => {
            tagLeeren(tag)
            app.dialog = null
          }}><Symbol name="muell" />{tagName(tag)} wirklich leeren</button
        >
      {:else}
        <button class="knopf gefahr" onclick={() => (leerenFragen = true)}><Symbol name="muell" />{tagName(tag)} leeren</button>
      {/if}
    </div>
  </div>
</Fenster>

<style>
  .inhalt {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .erklaerung {
    margin: 0;
  }
  .tage,
  .wahl,
  .aktionen {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .tage .knopf {
    min-width: 3.2em;
  }
  .knopf:disabled {
    opacity: 0.35;
  }
</style>
