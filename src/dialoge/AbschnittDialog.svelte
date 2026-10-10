<script lang="ts">
  import { segVon } from '../lib/konstanten'
  // Tageszeit anpassen: eigener Name und eigenes Bild (Symbol, Bildkarte oder Foto aus der Galerie)
  import BildZuschnitt from '../komponenten/BildZuschnitt.svelte'
  import Fenster from '../komponenten/Fenster.svelte'
  import Bild from '../komponenten/Bild.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import ZeitWahl from '../komponenten/ZeitWahl.svelte'
  import { bildUrl, fotoVerkleinern } from '../lib/bilder'
  import { ICON_GROUPS, ICON_LIST } from '../lib/iconliste'
  import { bilderSuchen } from '../lib/suche'
  import { ABSCHNITTE, STANDARD_ABSCHNITTE, abschnittInfo } from '../lib/konstanten'
  import { app, fotoHinzufuegen, fotosAufraeumen, zeigeHinweis } from '../lib/speicher.svelte'
  import type { AbschnittId } from '../lib/typen'

  let { id }: { id: AbschnittId } = $props()
  // svelte-ignore state_referenced_locally
  const abId = id
  const info = abschnittInfo(abId)
  const start = app.plan.abschnitte[abId] ?? {}

  const eigene = !STANDARD_ABSCHNITTE.includes(abId)
  let nacht = $state(start.nacht ?? info.grundNacht)
  let farbe = $state(start.farbe ?? info.grundFarbe)
  let name = $state(start.name ?? '')
  let bild = $state(start.bild ?? '')
  let zuschnittQuelle = $state<string | null>(null)
  let dateiFeld = $state<HTMLInputElement>()

  const HIMMEL = 'Himmel'
  const gruppen = [HIMMEL, ...ICON_GROUPS]
  let gruppe = $state(HIMMEL)
  const himmel = [...new Set(ABSCHNITTE.map((a) => a.grundBild))].map((b) => ({ id: b, name: b.replace(/^_/, '') }))
  let suche = $state('')
  const icons = $derived(suche.trim() ? bilderSuchen(suche) : gruppe === HIMMEL ? himmel : ICON_LIST.filter((i) => i.group === gruppe))
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
    const neu = {
      ...((n && n !== info.grundName) || eigene ? { name: (n || info.grundName).slice(0, 30) } : {}),
      ...(bild ? { bild } : {}),
      ...(nacht !== info.grundNacht ? { nacht } : {}),
      ...(farbe !== info.grundFarbe ? { farbe } : {}),
    }
    if (Object.keys(neu).length) app.plan.abschnitte[abId] = neu
    else delete app.plan.abschnitte[abId]
    fotosAufraeumen()
    app.dialog = { art: 'einstellungen' }
  }
  function zuruecksetzen() {
    name = ''
    bild = ''
  }
</script>

<Fenster titel="Tageszeit anpassen" breit>
  <div class="inhalt" data-seg={segVon(abId)}>
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
        <span class="name">Aufstehen am nächsten Tag</span>
      {/if}
    </div>

    <div class="feld">
      <span class="name">Darstellung</span>
      <div class="reihe">
        <button type="button" class="knopf klein" aria-pressed={!nacht} onclick={() => (nacht = false)}>Tag (Sonne)</button>
        <button type="button" class="knopf klein" aria-pressed={nacht} onclick={() => (nacht = true)}>Nacht (dunkel, Mond)</button>
      </div>
      <span class="name">Farbe</span>
      <div class="reihe" role="group" aria-label="Farbe">
        {#each STANDARD_ABSCHNITTE as f (f)}
          <button type="button" class="farbpunkt" data-seg={f} style="background: var(--seg)" aria-pressed={farbe === f} aria-label="Farbe {abschnittInfo(f).grundName}" title={abschnittInfo(f).grundName} onclick={() => (farbe = f)}></button>
        {/each}
      </div>
    </div>

    <div class="feld">
      <span class="name">Bild</span>
      <input id="abschnitt-suche" type="search" bind:value={suche} placeholder="Bild suchen" autocomplete="off" aria-label="Bild suchen" />
      <div class="reihe" role="group" aria-label="Bildgruppen">
        {#each gruppen as g (g)}
          <button type="button" class="knopf klein" aria-pressed={!suche.trim() && gruppe === g} onclick={() => ((gruppe = g), (suche = ''))}>{g}</button>
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
  input[type='text'],
  input[type='search'] {
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
  .farbpunkt {
    width: 36px;
    height: 36px;
    border: 3px solid var(--tafel);
    border-radius: 50%;
    box-shadow: 0 0 0 2px var(--linie);
  }
  .farbpunkt[aria-pressed='true'] {
    box-shadow: 0 0 0 4px var(--tinte);
  }
</style>
