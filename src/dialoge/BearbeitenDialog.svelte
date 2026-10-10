<script lang="ts">
  import Bild from '../komponenten/Bild.svelte'
  import Fenster from '../komponenten/Fenster.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import ZeitWahl from '../komponenten/ZeitWahl.svelte'
  import { bildUrl, fotoVerkleinern } from '../lib/bilder'
  import { ICON_GROUPS, ICON_LIST } from '../lib/iconliste'
  import { ABSCHNITTE, ZUSAETZE, tagName } from '../lib/konstanten'
  import { app, aufgabeLoeschen, aufgabeSpeichern, fotoHinzufuegen, zeigeHinweis } from '../lib/speicher.svelte'
  import type { AbschnittId, Aufgabe, TagId } from '../lib/typen'

  let {
    tag,
    abschnitt: startAbschnitt,
    aufgabe: start,
    neu,
  }: { tag: TagId; abschnitt: AbschnittId; aufgabe: Aufgabe; neu: boolean } = $props()

  // Arbeitskopie (die Props sind die Ausgangswerte; Änderungen gelten erst beim Speichern)
  // svelte-ignore state_referenced_locally
  let entwurf = $state<Aufgabe>({ ...start })
  // svelte-ignore state_referenced_locally
  let abschnitt = $state<AbschnittId>(startAbschnitt)
  // svelte-ignore state_referenced_locally
  let gruppe = $state(ICON_LIST.find((i) => i.id === start.bild)?.group ?? ICON_GROUPS[0])
  let loeschenFragen = $state(false)
  let titelGeaendert = $state(false)
  let dateiFeld: HTMLInputElement | undefined = $state()
  let fotoAlt = $state('')

  function bildWaehlen(id: string, name: string) {
    // Titel automatisch vorschlagen, solange er noch nicht selbst geschrieben wurde
    if (!titelGeaendert && (neu || !entwurf.titel)) entwurf.titel = name
    entwurf.bild = id
  }

  async function fotoGewaehlt(e: Event) {
    const datei = (e.target as HTMLInputElement).files?.[0]
    if (!datei) return
    try {
      const daten = await fotoVerkleinern(datei)
      fotoAlt = daten
      entwurf.bild = fotoHinzufuegen(daten)
    } catch {
      zeigeHinweis('Das Foto konnte nicht geladen werden.')
    } finally {
      ;(e.target as HTMLInputElement).value = ''
    }
  }

  function speichern() {
    const fertig: Aufgabe = { ...entwurf, titel: entwurf.titel.trim() || 'Aufgabe' }
    if (!fertig.zusatz) delete fertig.zusatz
    if (!fertig.uhrzeit) delete fertig.uhrzeit
    aufgabeSpeichern(tag, abschnitt, fertig)
    app.dialog = null
  }

  function loeschen() {
    aufgabeLoeschen(tag, entwurf.id)
    app.dialog = null
  }

  const gruppenIcons = $derived(ICON_LIST.filter((i) => i.group === gruppe))
</script>

<Fenster titel={neu ? `Neue Aufgabe am ${tagName(tag)}` : 'Aufgabe ändern'} breit>
  <form
    class="formular"
    onsubmit={(e) => {
      e.preventDefault()
      speichern()
    }}
  >
    <div class="vorschau" data-seg={abschnitt}>
      <div class="vorschau-bild"><Bild id={entwurf.bild} zusatz={entwurf.zusatz} /></div>
      <span class="vorschau-titel">{entwurf.titel || 'Neue Aufgabe'}</span>
    </div>

    <div class="felder">
      <label class="feld">
        <span class="name">Name</span>
        <input
          id="aufgabe-titel"
          type="text"
          bind:value={entwurf.titel}
          oninput={() => (titelGeaendert = true)}
          maxlength="40"
          placeholder="z. B. Zähne putzen"
          autocomplete="off"
          data-autofokus={!neu ? true : undefined}
        />
      </label>

      <div class="feld">
        <span class="name">Tageszeit</span>
        <div class="reihe">
          {#each ABSCHNITTE as ab (ab.id)}
            <button
              type="button"
              class="knopf abschnitt-wahl"
              data-seg={ab.id}
              aria-pressed={abschnitt === ab.id}
              onclick={() => (abschnitt = ab.id)}
            >
              {ab.name}
            </button>
          {/each}
        </div>
      </div>

      <div class="feld zwei">
        <div>
          <span class="name">Timer</span>
          <div class="reihe">
            <button type="button" class="knopf rund" onclick={() => (entwurf.minuten = Math.max(0, entwurf.minuten - (entwurf.minuten > 10 ? 5 : 1)))} aria-label="Weniger Minuten">−</button>
            <span class="wert">{entwurf.minuten > 0 ? `${entwurf.minuten} Min` : 'ohne'}</span>
            <button type="button" class="knopf rund" onclick={() => (entwurf.minuten = Math.min(600, entwurf.minuten + (entwurf.minuten >= 10 ? 5 : 1)))} aria-label="Mehr Minuten">+</button>
          </div>
        </div>
        <div>
          <span class="name">Feste Uhrzeit</span>
          <ZeitWahl bind:wert={entwurf.uhrzeit} leerErlaubt label="Uhrzeit" />
        </div>
      </div>

      <div class="feld">
        <span class="name">Bild</span>
        <div class="reihe gruppen" role="group" aria-label="Bildgruppen">
          {#each ICON_GROUPS as g (g)}
            <button type="button" class="knopf klein" aria-pressed={gruppe === g} onclick={() => (gruppe = g)}>{g}</button>
          {/each}
          <button type="button" class="knopf klein" aria-pressed={gruppe === 'Foto'} onclick={() => (gruppe = 'Foto')}>
            <Symbol name="bild" />Eigenes Foto
          </button>
        </div>
        {#if gruppe === 'Foto'}
          <div class="foto-bereich">
            <p>Ein Foto vom Handy oder PC wählen, z. B. von der Kita, der Oma oder dem eigenen Zahnputzbecher. Es wird verkleinert und im Plan gespeichert.</p>
            <button type="button" class="knopf haupt" onclick={() => dateiFeld?.click()}><Symbol name="bild" />Foto auswählen</button>
            <input bind:this={dateiFeld} id="foto-datei" type="file" accept="image/*" hidden onchange={fotoGewaehlt} />
            {#if entwurf.bild.startsWith('foto:') || fotoAlt}
              <img class="foto-vorschau" src={bildUrl(entwurf.bild, app.fotos)} alt="Gewähltes Foto" />
            {/if}
          </div>
        {:else}
          <div class="bildwahl">
            {#each gruppenIcons as ic (ic.id)}
              <button
                type="button"
                class="bildknopf"
                aria-pressed={entwurf.bild === ic.id}
                aria-label={ic.name}
                title={ic.name}
                onclick={() => bildWaehlen(ic.id, ic.name)}
              >
                <img src={bildUrl(ic.id, app.fotos)} alt="" draggable="false" />
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="feld">
        <span class="name">Zusatzzeichen</span>
        <div class="reihe">
          <button type="button" class="knopf klein" aria-pressed={!entwurf.zusatz} onclick={() => (entwurf.zusatz = undefined)}>keins</button>
          {#each ZUSAETZE as z (z.id)}
            <button type="button" class="knopf klein zusatz" aria-pressed={entwurf.zusatz === z.id} onclick={() => (entwurf.zusatz = z.id)}>
              <img src={bildUrl(z.bild, app.fotos)} alt="" />{z.name}
            </button>
          {/each}
        </div>
      </div>

      <div class="aktionen">
        <button type="submit" class="knopf haupt" data-autofokus={neu ? true : undefined}><Symbol name="haken" />Speichern</button>
        <button type="button" class="knopf" onclick={() => (app.dialog = null)}>Abbrechen</button>
        {#if !neu}
          {#if loeschenFragen}
            <button type="button" class="knopf gefahr" onclick={loeschen}><Symbol name="muell" />Wirklich löschen</button>
          {:else}
            <button type="button" class="knopf gefahr" onclick={() => (loeschenFragen = true)}><Symbol name="muell" />Löschen</button>
          {/if}
        {/if}
      </div>
    </div>
  </form>
</Fenster>

<style>
  .formular {
    display: grid;
    grid-template-columns: minmax(140px, 220px) minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }
  .vorschau {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 18px 14px;
    border-radius: 24px;
    background: var(--seg-hell);
    box-shadow: inset 0 0 0 3px var(--seg);
  }
  .vorschau-bild {
    width: 70%;
    aspect-ratio: 1;
  }
  .vorschau-titel {
    font-weight: 700;
    text-align: center;
    font-size: var(--t-gross);
  }
  .felder {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-width: 0;
  }
  .feld {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .feld.zwei {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 24px;
  }
  .name {
    display: block;
    margin-bottom: 4px;
    font-size: var(--t-klein);
    color: var(--tinte-leise);
    font-weight: 700;
  }
  input[type='text'] {
    width: 100%;
    padding: 0.5em 0.8em;
    border: 2px solid var(--linie);
    border-radius: 16px;
    background: var(--himmel);
    color: var(--tinte);
    font: inherit;
    font-size: var(--t-gross);
  }
  .reihe {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .wert {
    min-width: 4em;
    text-align: center;
    font-family: var(--schrift-titel);
    font-weight: 600;
    font-size: var(--t-gross);
  }
  .knopf.klein {
    min-height: 2.2em;
    font-size: var(--t-klein);
  }
  .abschnitt-wahl[aria-pressed='true'] {
    background: var(--seg);
    border-color: var(--seg-tief);
    color: var(--tinte-auf-farbe);
  }
  .zusatz img {
    width: 1.3em;
    height: 1.3em;
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
    padding: 10px;
    border: 2px solid var(--linie);
    border-radius: 16px;
    background: var(--himmel);
  }
  .bildknopf img {
    width: 100%;
    height: 100%;
  }
  .bildknopf[aria-pressed='true'] {
    border-color: var(--tinte);
    background: var(--tafel);
    box-shadow: inset 0 0 0 2px var(--tinte);
  }
  .foto-bereich {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .foto-bereich p {
    margin: 0;
    max-width: 34em;
    color: var(--tinte-leise);
    font-size: var(--t-klein);
  }
  .foto-vorschau {
    width: 160px;
    height: 160px;
    object-fit: cover;
    border-radius: 20px;
  }
  .aktionen {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 6px;
  }
  @media (max-width: 640px) {
    .formular {
      grid-template-columns: 1fr;
    }
    .vorschau {
      position: static;
      flex-direction: row;
      padding: 10px 14px;
    }
    .vorschau-bild {
      width: 64px;
    }
  }
</style>
