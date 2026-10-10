<script lang="ts">
  import Bild from '../komponenten/Bild.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import { geburtstageAm } from '../lib/countdown'
  import { lokale, t } from '../lib/i18n.svelte'
  import { monatsName, wochentagKurz } from '../lib/i18n/namen-ansichten'
  import { app, oeffnen } from '../lib/speicher.svelte'
  import { datumKey } from '../lib/zeit'

  let { jahr, monat }: { jahr: number; monat: number } = $props()

  const WOCHENTAGE = $derived(wochentagKurz())
  const heute = $derived(datumKey(new Date(app.jetzt)))

  /** Tage des Monats mit Leerfeldern davor (Woche beginnt Montag) */
  const felder = $derived.by(() => {
    const erster = new Date(jahr, monat, 1)
    const versatz = (erster.getDay() + 6) % 7
    const anzahl = new Date(jahr, monat + 1, 0).getDate()
    const liste: (string | null)[] = Array.from({ length: versatz }, () => null)
    for (let t = 1; t <= anzahl; t++) liste.push(datumKey(new Date(jahr, monat, t)))
    while (liste.length % 7) liste.push(null)
    return liste
  })

  function wechseln(delta: number) {
    const d = new Date(jahr, monat + delta, 1)
    oeffnen({ art: 'monat', jahr: d.getFullYear(), monat: d.getMonth() })
  }

  function vorlageName(datum: string): string | null {
    const id = app.plan.datumVorlage[datum]
    return id ? (app.plan.vorlagen.find((v) => v.id === id)?.name ?? null) : null
  }
</script>

<div class="monat">
  <div class="leiste">
    <button class="knopf rund" onclick={() => wechseln(-1)} aria-label={t('Voriger Monat')}><Symbol name="zurueck" /></button>
    <h2>{monatsName(monat)} {jahr}</h2>
    <button class="knopf rund" onclick={() => wechseln(1)} aria-label={t('Nächster Monat')}><Symbol name="weiter" /></button>
    <button class="knopf" onclick={() => oeffnen({ art: 'jahr', jahr })}>{t('Ganzes Jahr')}</button>
  </div>
  <div class="raster">
    {#each WOCHENTAGE as w (w)}
      <span class="kopf">{w}</span>
    {/each}
    {#each felder as datum, i (datum ?? 'leer' + i)}
      {#if datum}
        {@const termine = app.plan.termine.filter((t) => t.datum === datum)}
        {@const geb = geburtstageAm(datum)}
        {@const vorlage = vorlageName(datum)}
        <button
          class="tag"
          class:heute={datum === heute}
          class:geburtstag={geb.length > 0}
          data-fokus-id={'datum:' + datum}
          data-autofokus={datum === heute ? true : undefined}
          onclick={() => (app.dialog = { art: 'datum', datum })}
          aria-label={new Intl.DateTimeFormat(lokale(), { day: 'numeric', month: 'long' }).format(new Date(jahr, monat, Number(datum.slice(8)))) +
            (termine.length ? ', ' + (termine.length === 1 ? t('1 Termin') : t('{n} Termine', { n: termine.length })) : '') +
            (geb.length ? ', ' + t('Geburtstag') : '')}
        >
          <span class="zahl">{Number(datum.slice(8))}</span>
          {#if vorlage}<span class="vorlage">{vorlage}</span>{/if}
          <span class="bilder">
            {#each geb as g (g.name)}
              <span class="mini" title={t('{name} wird {alter}', { name: g.name, alter: g.alter })}><Bild id="geburtstag" /></span>
            {/each}
            {#each termine.slice(0, 4) as t (t.id)}
              <span class="mini" title={t.titel}><Bild id={t.bild} /></span>
            {/each}
          </span>
        </button>
      {:else}
        <span class="leer"></span>
      {/if}
    {/each}
  </div>
</div>

<style>
  .monat {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
    min-height: 0;
  }
  .leiste {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .leiste h2 {
    min-width: 8em;
    text-align: center;
    font-size: var(--t-gross);
  }
  .raster {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-auto-rows: minmax(0, 1fr);
    gap: 5px;
  }
  .kopf {
    text-align: center;
    font-family: var(--schrift-titel);
    font-weight: 600;
    font-size: var(--t-klein);
    color: var(--tinte-leise);
    align-self: end;
  }
  .tag {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    min-height: 0;
    padding: 4px 6px;
    border: 2px solid var(--linie);
    border-radius: 12px;
    background: var(--tafel);
    overflow: hidden;
    text-align: left;
  }
  .tag.heute {
    border-color: var(--tinte);
    box-shadow: inset 0 0 0 2px var(--tinte);
  }
  .tag.geburtstag {
    background: var(--mittag-hell);
    border-color: var(--gelb);
  }
  .zahl {
    font-family: var(--schrift-titel);
    font-weight: 600;
    font-size: var(--t-text);
    line-height: 1;
  }
  .vorlage {
    max-width: 100%;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--vormittag-hell);
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bilder {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }
  .mini {
    width: clamp(16px, 2.4vw, 30px);
    height: clamp(16px, 2.4vw, 30px);
  }
  .leer {
    min-height: 0;
  }
</style>
