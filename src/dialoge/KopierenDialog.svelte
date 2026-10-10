<script lang="ts">
  import Fenster from '../komponenten/Fenster.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import { TAGE, tagName } from '../lib/konstanten'
  import { app, planFuer, tagKopieren, tagLeeren, zeigeHinweis } from '../lib/speicher.svelte'
  import { neueId } from '../lib/startplan'
  import { ABSCHNITTE } from '../lib/konstanten'
  import type { TagId } from '../lib/typen'

  let props: { tag: TagId } = $props()
  // svelte-ignore state_referenced_locally
  const { tag } = props

  let ziele = $state<TagId[]>([])
  let ersetzen = $state(true)
  let leerenFragen = $state(false)

  function umschalten(id: TagId) {
    ziele = ziele.includes(id) ? ziele.filter((z) => z !== id) : [...ziele, id]
  }
  function auswahl(ids: TagId[]) {
    ziele = ids.filter((z) => z !== tag)
  }
  // ---------- Tagesvorlagen ----------
  let vorlageName = $state('')
  let loeschenId = $state<string | null>(null)
  function alsVorlageSpeichern() {
    const name = vorlageName.trim()
    if (!name) return
    const quelle = $state.snapshot(planFuer(tag))
    const kopie = {} as typeof quelle
    for (const ab of ABSCHNITTE) kopie[ab.id] = (quelle[ab.id] ?? []).map((x) => ({ ...x, id: neueId() }))
    app.plan.vorlagen.push({ id: neueId(), name, tag: kopie })
    vorlageName = ''
    zeigeHinweis(`Tagesvorlage „${name}“ gespeichert`)
  }
  function vorlageAnwenden(id: string) {
    const v = app.plan.vorlagen.find((x) => x.id === id)
    if (!v) return
    const quelle = $state.snapshot(v.tag)
    for (const ab of ABSCHNITTE) app.plan.woche[tag][ab.id] = (quelle[ab.id] ?? []).map((x) => ({ ...x, id: neueId() }))
    zeigeHinweis(`${tagName(tag)} nutzt jetzt „${v.name}“`)
    app.dialog = null
  }
  function vorlageLoeschen(id: string) {
    app.plan.vorlagen = app.plan.vorlagen.filter((v) => v.id !== id)
    for (const [d, vid] of Object.entries(app.plan.datumVorlage)) if (vid === id) delete app.plan.datumVorlage[d]
    loeschenId = null
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
      <button class="knopf klein" onclick={() => auswahl(['mo', 'di', 'mi', 'do', 'fr'])}>Mo–Fr</button>
      <button class="knopf klein" onclick={() => auswahl(['sa', 'so'])}>Wochenende</button>
      <button class="knopf klein" onclick={() => auswahl(TAGE.map((t) => t.id))}>Alle Tage</button>
      <button class="knopf klein" onclick={() => (ziele = [])}>Keine</button>
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

    <section class="vorlagen">
      <h3>Tagesvorlagen</h3>
      <p class="erklaerung">Z. B. „Kita-Tag“, „Wochenende“, „Ferien“ oder „Krank“. Speichere den Ablauf von {tagName(tag)} als Vorlage oder übernimm eine Vorlage für {tagName(tag)}. Im Kalender kannst du eine Vorlage auch für ein einzelnes Datum wählen.</p>
      <div class="wahl">
        <input id="vorlage-name" type="text" bind:value={vorlageName} placeholder="Name der Vorlage" maxlength="40" autocomplete="off" />
        <button class="knopf" disabled={!vorlageName.trim()} onclick={alsVorlageSpeichern}><Symbol name="plus" />Als Vorlage speichern</button>
      </div>
      {#each app.plan.vorlagen as v (v.id)}
        <div class="wahl vorlage">
          <b>{v.name}</b>
          <button class="knopf klein" onclick={() => vorlageAnwenden(v.id)}>Für {tagName(tag)} übernehmen</button>
          {#if loeschenId === v.id}
            <button class="knopf klein gefahr" onclick={() => vorlageLoeschen(v.id)}>Wirklich löschen</button>
          {:else}
            <button class="knopf klein gefahr" onclick={() => (loeschenId = v.id)} aria-label="Vorlage {v.name} löschen"><Symbol name="muell" /></button>
          {/if}
        </div>
      {/each}
    </section>
  </div>
</Fenster>

<style>
  .inhalt {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .vorlagen {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 10px;
    border-top: 2px solid var(--linie);
  }
  h3 {
    font-size: var(--t-text);
  }
  .vorlage {
    align-items: center;
  }
  .vorlage b {
    min-width: 8em;
  }
  input[type='text'] {
    flex: 1;
    min-width: 10em;
    padding: 0.45em 0.8em;
    border: 2px solid var(--linie);
    border-radius: 14px;
    background: var(--himmel);
    color: var(--tinte);
    font: inherit;
  }
  .knopf.klein {
    font-size: var(--t-klein);
    min-height: 2.2em;
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
