<script lang="ts">
  import { segVon } from '../lib/konstanten'
  import { abgleich } from '../lib/abgleich.svelte'
  import Bild from '../komponenten/Bild.svelte'
  import Fenster from '../komponenten/Fenster.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import { geburtstageAm } from '../lib/countdown'
  import { abschnittInfo } from '../lib/konstanten'
  import { neueId } from '../lib/startplan'
  import { app } from '../lib/speicher.svelte'
  import { ausKey } from '../lib/zeit'

  let props: { datum: string } = $props()
  // svelte-ignore state_referenced_locally
  const { datum } = props

  const titel = ausKey(datum).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const termine = $derived(app.plan.termine.filter((t) => t.datum === datum))
  const geb = $derived(geburtstageAm(datum))
  const darfAendern = $derived(abgleich.einst.rolle === 'planer')

  function neuerTermin() {
    app.dialog = {
      art: 'termin',
      neu: true,
      termin: { id: 't' + neueId(), titel: '', bild: 'stern', minuten: 0, datum, abschnitt: 'vormittag', countdown: true },
    }
  }
  function vorlageSetzen(id: string | null) {
    if (id) app.plan.datumVorlage[datum] = id
    else delete app.plan.datumVorlage[datum]
  }
</script>

<Fenster titel={titel}>
  <div class="inhalt">
    {#each geb as g (g.name)}
      <div class="geburtstag"><span class="bild"><Bild id="geburtstag" /></span><b>{g.name} wird {g.alter}!</b></div>
    {/each}

    {#if termine.length}
      <ul class="termine">
        {#each termine as t (t.id)}
          <li>
            <button
              class="termin"
              data-seg={segVon(t.abschnitt)}
              disabled={!darfAendern}
              onclick={() => (app.dialog = { art: 'termin', neu: false, termin: { ...t } })}
            >
              <span class="bild"><Bild id={t.bild} zusatz={t.zusatz} /></span>
              <span><b>{t.titel}</b><br /><small>{abschnittInfo(t.abschnitt).name}{t.uhrzeit ? `, ${t.uhrzeit} Uhr` : ''}{t.countdown ? ', mit Countdown' : ''}</small></span>
            </button>
          </li>
        {/each}
      </ul>
    {:else if !geb.length}
      <p class="leise">Noch nichts eingetragen.</p>
    {/if}

    {#if darfAendern}
      <div><button class="knopf haupt" onclick={neuerTermin} data-autofokus><Symbol name="plus" />Termin eintragen</button></div>
      <section>
        <h3>Tagesablauf an diesem Datum</h3>
        <div class="reihe">
          <button class="knopf klein" aria-pressed={!app.plan.datumVorlage[datum]} onclick={() => vorlageSetzen(null)}>Normaler Wochentag</button>
          {#each app.plan.vorlagen as v (v.id)}
            <button class="knopf klein" aria-pressed={app.plan.datumVorlage[datum] === v.id} onclick={() => vorlageSetzen(v.id)}>{v.name}</button>
          {/each}
        </div>
        {#if app.plan.vorlagen.length === 0}
          <p class="leise">Tagesvorlagen (z. B. Ferien, Krank) legst du in der Wochenansicht über das Kopier-Symbol eines Tages an.</p>
        {/if}
      </section>
    {/if}
  </div>
</Fenster>

<style>
  .inhalt {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .geburtstag {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    border-radius: 16px;
    background: var(--mittag-hell);
    font-size: var(--t-gross);
  }
  .termine {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .termin {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 8px 12px;
    border: none;
    border-radius: 16px;
    background: var(--seg-hell);
    text-align: left;
  }
  .bild {
    width: 44px;
    height: 44px;
    flex: none;
  }
  small,
  .leise {
    color: var(--tinte-leise);
  }
  .leise {
    margin: 0;
    font-size: var(--t-klein);
  }
  h3 {
    font-size: var(--t-text);
    margin-bottom: 6px;
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
</style>
