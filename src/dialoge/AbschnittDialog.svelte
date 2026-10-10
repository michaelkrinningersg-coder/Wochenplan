<script lang="ts">
  // Tageszeit anpassen: eigener Name und eigenes Bild (Symbol, Bildkarte oder Foto aus der Galerie)
  import BildZuschnitt from '../komponenten/BildZuschnitt.svelte'
  import Fenster from '../komponenten/Fenster.svelte'
  import Bild from '../komponenten/Bild.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import ZeitWahl from '../komponenten/ZeitWahl.svelte'
  import { bildUrl, fotoVerkleinern } from '../lib/bilder'
  import { ICON_GROUPS, ICON_LIST } from '../lib/iconliste'
  import { ABSCHNITTE, abschnittInfo } from '../lib/konstanten'
  import { app, fotoHinzufuegen, fotosAufraeumen, zeigeHinweis } from '../lib/speicher.svelte'
  import type { AbschnittId } from '../lib/typen'

  let { id }: { id: AbschnittId } = $props()
  // svelte-ignore state_referenced_locally
  const abId = id
  const info = abschnittInfo(abId)
  const start = app.plan.abschnitte[abId] ?? {}

  let name = $state(start.name ?? '')
  let bild = $state(start.bild ?? '')
  let zuschnittQuelle = $state<string | null>(null)
  let dateiFeld = $state<HTMLInputElement>()

  const HIMMEL = 'Himmel'
  const gruppen = [HIMMEL, ...ICON_GROUPS]
  let gruppe = $state(HIMMEL)
  const himmel = [...new Set(ABSCHNITTE.map((a) => a.grundBild))].map((b) => ({ id: b, name: b.replace(/^_/, '') }))
  const icons = $derived(gruppe === HIMMEL ? himmel : ICON_LIST.filter((i) => i.group === gruppe))
  const vorschau = $derived(bild || info.grundBild)
  const naechster = ABSCHNITTE[ABSCHNITTE.findIndex((a) => a.id === abId) + 1]

  async function fotoGewaehlt(e: Event) {
    const datei = (e.target as HTMLInputElement).files?.[0]
    if (!datei) return
    try {
      zuschnittQuelle = await fotoVerkleinern(datei, 1400)
    } catch {
      zeigeHinweis('Das Foto konnte nicht geladen werden.')
    } finally {
      ;(e.target as HTMLInputElement).value = ''
    }
  }
  function zuschnittFertig(daten: string) {
    bild = fotoHinzufuegen(daten)
    zuschnittQuelle = null
  }

  function speichern() {
    const n = name.trim()
    if (!n && !bild) delete app.plan.abschnitte[abId]
    else app.plan.abschnitte[abId] = { ...(n && n !== info.grundName ? { name: n.slice(0, 30) } : {}), ...(bild ? { bild } : {}) }
    fotosAufraeumen()
    app.dialog = { art: 'einstellungen' }
  }
  function zuruecksetzen() {
    name = ''
    bild = ''
  }
</script>

<Fenster titel="Tageszeit anpassen" breit>
  <div class="inhalt" data-seg={abId}>
    <div class="kopf">
      <span class="vorschau"><Bild id={vorschau} /></span>
      <label class="feld">
        <span class="name">Name (Standard: {info.grundName})</span>
        <input id="abschnitt-name" type="text" bind:value={name} placeholder={info.grundName} maxlength="30" autocomplete="off" />
      </label>
    </div>

    <div class="reihe zeiten">
      <span class="name zeile">von</span>
      <ZeitWahl bind:wert={app.plan.zeiten[abId]} label="{info.name} von" />
      <span class="name zeile">bis</span>
      {#if naechster}
        <ZeitWahl bind:wert={app.plan.zeiten[naechster.id]} label="{info.name} bis" />
      {:else}
        <ZeitWahl bind:wert={app.plan.abendEnde} label="{info.name} bis" />
      {/if}
    </div>

    <div class="feld">
      <span class="name">Bild</span>
      <div class="reihe" role="group" aria-label="Bildgruppen">
        {#each gruppen as g (g)}
          <button type="button" class="knopf klein" aria-pressed={gruppe === g} onclick={() => (gruppe = g)}>{g}</button>
        {/each}
      </div>
      <div class="bildwahl">
        {#each icons as ic (ic.id)}
          <button type="button" class="bildknopf" aria-pressed={vorschau === ic.id} aria-label={ic.name} title={ic.name} onclick={() => (bild = ic.id === info.grundBild ? '' : ic.id)}>
            <img src={bildUrl(ic.id, app.fotos)} alt="" draggable="false" />
          </button>
        {/each}
      </div>
    </div>

    <div class="feld">
      <span class="name">Eigenes Foto</span>
      {#if zuschnittQuelle}
        <BildZuschnitt quelle={zuschnittQuelle} onfertig={zuschnittFertig} onabbrechen={() => (zuschnittQuelle = null)} />
      {:else}
        <div class="reihe">
          <button type="button" class="knopf" onclick={() => dateiFeld?.click()}><Symbol name="bild" />Foto aus der Galerie</button>
        </div>
        <input bind:this={dateiFeld} id="abschnitt-foto" type="file" accept="image/*" hidden onchange={fotoGewaehlt} />
      {/if}
    </div>

    <div class="reihe">
      <button type="button" class="knopf haupt" onclick={speichern}><Symbol name="haken" />Speichern</button>
      <button type="button" class="knopf" onclick={() => (app.dialog = { art: 'einstellungen' })}>Abbrechen</button>
      <button type="button" class="knopf" onclick={zuruecksetzen}><Symbol name="neu" />Standard</button>
    </div>
  </div>
</Fenster>

<style>
  .inhalt {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .kopf {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .kopf .feld {
    flex: 1;
  }
  .vorschau {
    flex: none;
    width: 96px;
    height: 96px;
    padding: 10px;
    border-radius: 22px;
    background: var(--seg, var(--himmel));
  }
  .reihe {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .feld {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .name {
    font-size: var(--t-klein);
    color: var(--tinte-leise);
    font-weight: 700;
  }
  input[type='text'] {
    width: 100%;
    min-width: 0;
    padding: 0.5em 0.8em;
    border: 2px solid var(--linie);
    border-radius: 14px;
    background: var(--himmel);
    color: var(--tinte);
    font: inherit;
  }
  .bildwahl {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
    gap: 8px;
  }
  .bildknopf {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    padding: 8px;
    border: 2px solid var(--linie);
    border-radius: 16px;
    background: var(--himmel);
  }
  .bildknopf img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .bildknopf[aria-pressed='true'] {
    border-color: var(--tinte);
    background: var(--tafel);
    box-shadow: inset 0 0 0 2px var(--tinte);
  }
</style>
