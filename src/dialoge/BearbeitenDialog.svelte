<script lang="ts">
  import AufgabenBild from '../komponenten/AufgabenBild.svelte'
  import Bild from '../komponenten/Bild.svelte'
  import BildZuschnitt from '../komponenten/BildZuschnitt.svelte'
  import Fenster from '../komponenten/Fenster.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import ZeitWahl from '../komponenten/ZeitWahl.svelte'
  import { bildUrl, fotoVerkleinern } from '../lib/bilder'
  import { ICON_GROUPS, ICON_LIST } from '../lib/iconliste'
  import { ABSCHNITTE, ZUSAETZE, tagName } from '../lib/konstanten'
  import { app, aufgabeLoeschen, aufgabeSpeichern, fotoHinzufuegen, zeigeHinweis } from '../lib/speicher.svelte'
  import type { AbschnittId, Aufgabe, KindId, TagId, Termin } from '../lib/typen'
  import { ausKey } from '../lib/zeit'
  import { VORLAGEN, type Vorlage } from '../lib/vorlagen'

  let props: { tag: TagId; abschnitt: AbschnittId; aufgabe: Aufgabe; neu: boolean; datum?: string } = $props()
  // Werte festhalten: Nach dem Schließen (app.dialog = null) sind die Props nicht mehr lesbar
  // svelte-ignore state_referenced_locally
  const { tag, abschnitt: startAbschnitt, aufgabe: start, neu, datum } = props
  const istTerminModus = !!datum

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

  /** Foto aus der Galerie: erst groß laden, dann zuschneiden */
  let zuschnittQuelle = $state<string | null>(null)
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
    fotoAlt = daten
    entwurf.foto = fotoHinzufuegen(daten)
    if (!entwurf.fotoModus) entwurf.fotoModus = 'wechsel'
    zuschnittQuelle = null
  }

  function fuerSetzen(k: 'alle' | KindId) {
    entwurf.fuer = k === 'alle' ? undefined : [k]
  }

  function speichern() {
    const fertig: Aufgabe = { ...$state.snapshot(entwurf), titel: entwurf.titel.trim() || 'Aufgabe' }
    for (const f of ['zusatz', 'uhrzeit', 'fuer', 'countdown', 'foto', 'fotoModus', 'wechselSek'] as const)
      if (fertig[f] === undefined || fertig[f] === false || fertig[f] === '') delete fertig[f]
    if (!fertig.foto) {
      delete fertig.fotoModus
      delete fertig.wechselSek
    }
    if (istTerminModus) {
      const termin: Termin = { ...fertig, datum: datum!, abschnitt }
      const i = app.plan.termine.findIndex((t) => t.id === termin.id)
      if (i >= 0) app.plan.termine[i] = termin
      else app.plan.termine.push(termin)
      app.dialog = { art: 'datum', datum: datum! }
      return
    }
    aufgabeSpeichern(tag, abschnitt, fertig)
    app.dialog = null
  }

  function loeschen() {
    if (istTerminModus) {
      app.plan.termine = app.plan.termine.filter((t) => t.id !== entwurf.id)
      app.dialog = { art: 'datum', datum: datum! }
      return
    }
    aufgabeLoeschen(tag, entwurf.id)
    app.dialog = null
  }

  // svelte-ignore state_referenced_locally
  let zeigeVorlagen = $state(neu)
  const passendeVorlagen = $derived([
    ...VORLAGEN.filter((v) => v.abschnitt === abschnitt),
    ...VORLAGEN.filter((v) => v.abschnitt !== abschnitt),
  ])
  function vorlageWaehlen(v: Vorlage) {
    entwurf.titel = v.titel
    entwurf.bild = v.bild
    entwurf.minuten = v.minuten
    entwurf.zusatz = v.zusatz
    titelGeaendert = true
    zeigeVorlagen = false
  }

  const gruppenIcons = $derived(ICON_LIST.filter((i) => i.group === gruppe))
</script>

<Fenster
  titel={istTerminModus
    ? `Termin am ${ausKey(datum!).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}`
    : neu
      ? `Neue Aufgabe am ${tagName(tag)}`
      : 'Aufgabe ändern'}
  breit
>
  <form
    class="formular"
    onsubmit={(e) => {
      e.preventDefault()
      speichern()
    }}
  >
    <div class="vorschau" data-seg={abschnitt}>
      <div class="vorschau-bild"><AufgabenBild aufgabe={entwurf} /></div>
      <span class="vorschau-titel">{entwurf.titel || 'Neue Aufgabe'}</span>
    </div>

    <div class="felder">
      {#if neu}
        <div class="feld">
          <span class="name">Aus der Bibliothek</span>
          {#if zeigeVorlagen}
            <div class="vorlagen">
              {#each passendeVorlagen as v (v.titel + v.abschnitt)}
                <button type="button" class="vorlage" data-seg={v.abschnitt} onclick={() => vorlageWaehlen(v)}>
                  <span class="vorlage-bild"><Bild id={v.bild} zusatz={v.zusatz} /></span>
                  <span>{v.titel}</span>
                </button>
              {/each}
            </div>
          {:else}
            <div><button type="button" class="knopf klein" onclick={() => (zeigeVorlagen = true)}>Andere Vorlage wählen</button></div>
          {/if}
        </div>
      {/if}
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
          <span class="name">Für</span>
          <div class="reihe">
            <button type="button" class="knopf klein" aria-pressed={!entwurf.fuer?.length} onclick={() => fuerSetzen('alle')}>Beide</button>
            {#each app.plan.kinder as k (k.id)}
              <button type="button" class="knopf klein kind" style="--kind: {k.farbe}" aria-pressed={entwurf.fuer?.length === 1 && entwurf.fuer[0] === k.id} onclick={() => fuerSetzen(k.id)}>
                <span class="punkt"></span>{k.name}
              </button>
            {/each}
          </div>
        </div>
        <div>
          <span class="name">Countdown</span>
          <div class="reihe">
            <button type="button" class="knopf klein" aria-pressed={!!entwurf.countdown} onclick={() => (entwurf.countdown = !entwurf.countdown)}>
              {entwurf.countdown ? 'Ja: „noch X× schlafen“' : 'Nein'}
            </button>
          </div>
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
        </div>
        {#if true}
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
        <span class="name">Eigenes Foto</span>
        {#if zuschnittQuelle}
          <BildZuschnitt quelle={zuschnittQuelle} onfertig={zuschnittFertig} onabbrechen={() => (zuschnittQuelle = null)} />
        {:else}
          <div class="foto-bereich">
            <div class="reihe">
              <button type="button" class="knopf" onclick={() => dateiFeld?.click()}><Symbol name="bild" />{entwurf.foto ? 'Anderes Foto' : 'Foto aus der Galerie'}</button>
              {#if entwurf.foto}
                <img class="foto-vorschau" src={bildUrl(entwurf.foto, app.fotos)} alt="Gewähltes Foto" />
                <button type="button" class="knopf klein gefahr" onclick={() => (entwurf.foto = undefined)}>Foto entfernen</button>
              {/if}
            </div>
            <input bind:this={dateiFeld} id="foto-datei" type="file" accept="image/*" hidden onchange={fotoGewaehlt} />
            {#if entwurf.foto}
              <div class="reihe">
                <span class="name zeile">Kachel zeigt</span>
                <button type="button" class="knopf klein" aria-pressed={entwurf.fotoModus === 'bild'} onclick={() => (entwurf.fotoModus = 'bild')}>Bild</button>
                <button type="button" class="knopf klein" aria-pressed={entwurf.fotoModus === 'foto'} onclick={() => (entwurf.fotoModus = 'foto')}>Foto</button>
                <button type="button" class="knopf klein" aria-pressed={(entwurf.fotoModus ?? 'wechsel') === 'wechsel'} onclick={() => (entwurf.fotoModus = 'wechsel')}>Abwechselnd</button>
                {#if (entwurf.fotoModus ?? 'wechsel') === 'wechsel'}
                  <button type="button" class="knopf rund" onclick={() => (entwurf.wechselSek = Math.max(2, (entwurf.wechselSek ?? 5) - 1))} aria-label="Schneller wechseln">−</button>
                  <span class="wert">alle {entwurf.wechselSek ?? 5} s</span>
                  <button type="button" class="knopf rund" onclick={() => (entwurf.wechselSek = Math.min(60, (entwurf.wechselSek ?? 5) + 1))} aria-label="Langsamer wechseln">+</button>
                {/if}
              </div>
            {:else}
              <p>Zum Beispiel die Kita, Oma oder der eigene Zahnputzbecher. Das Foto wird quadratisch zugeschnitten und kann mit dem Bild abwechseln.</p>
            {/if}
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
        {#if !neu && !istTerminModus}
          <button
            type="button"
            class="knopf"
            onclick={() => {
              speichern()
              app.dialog = { art: 'aufgabeKopieren', tag, id: entwurf.id }
            }}><Symbol name="kopie" />Kopieren nach …</button
          >
        {/if}
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
    color: var(--seg-text, var(--tinte-auf-farbe));
  }
  .zusatz img {
    width: 1.3em;
    height: 1.3em;
  }
  .vorlagen {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 8px;
    max-height: 260px;
    overflow: auto;
    padding: 2px;
  }
  .vorlage {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 4px;
    border: none;
    border-radius: 16px;
    background: var(--seg-hell);
    font-size: var(--t-klein);
    font-weight: 700;
    line-height: 1.1;
    text-align: center;
  }
  .vorlage-bild {
    width: 40px;
    height: 40px;
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
  .kind .punkt {
    width: 0.8em;
    height: 0.8em;
    border-radius: 50%;
    background: var(--kind);
  }
  .name.zeile {
    align-self: center;
    margin: 0 4px 0 0;
  }
  .foto-vorschau {
    width: 64px;
    height: 64px;
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
