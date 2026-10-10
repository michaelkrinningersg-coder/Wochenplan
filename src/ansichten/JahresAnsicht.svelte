<script lang="ts">
  import Symbol from '../komponenten/Symbol.svelte'
  import { geburtstageAm } from '../lib/countdown'
  import { t } from '../lib/i18n.svelte'
  import { monatsName } from '../lib/i18n/namen-ansichten'
  import { app, oeffnen } from '../lib/speicher.svelte'
  import { datumKey } from '../lib/zeit'

  let { jahr }: { jahr: number } = $props()
  const heute = $derived(datumKey(new Date(app.jetzt)))

  function tage(monat: number): (string | null)[] {
    const versatz = (new Date(jahr, monat, 1).getDay() + 6) % 7
    const anzahl = new Date(jahr, monat + 1, 0).getDate()
    const liste: (string | null)[] = Array.from({ length: versatz }, () => null)
    for (let t = 1; t <= anzahl; t++) liste.push(datumKey(new Date(jahr, monat, t)))
    return liste
  }
  const termineSet = $derived(new Set(app.plan.termine.map((t) => t.datum)))
</script>

<div class="jahr">
  <div class="leiste">
    <button class="knopf rund" onclick={() => oeffnen({ art: 'jahr', jahr: jahr - 1 })} aria-label={t('Voriges Jahr')}><Symbol name="zurueck" /></button>
    <h2>{jahr}</h2>
    <button class="knopf rund" onclick={() => oeffnen({ art: 'jahr', jahr: jahr + 1 })} aria-label={t('Nächstes Jahr')}><Symbol name="weiter" /></button>
  </div>
  <div class="monate">
    {#each Array.from({ length: 12 }, (_, i) => i) as m (m)}
      <button
        class="monat"
        class:aktuell={jahr === new Date(app.jetzt).getFullYear() && m === new Date(app.jetzt).getMonth()}
        data-autofokus={jahr === new Date(app.jetzt).getFullYear() && m === new Date(app.jetzt).getMonth() ? true : undefined}
        data-fokus-id={'monat:' + m}
        onclick={() => oeffnen({ art: 'monat', jahr, monat: m }, null)}
      >
        <span class="name">{monatsName(m)}</span>
        <span class="tage">
          {#each tage(m) as d, i (d ?? 'l' + i)}
            {#if d}
              <span
                class="punkt"
                class:heute={d === heute}
                class:termin={termineSet.has(d)}
                class:geb={geburtstageAm(d).length > 0}
              ></span>
            {:else}
              <span></span>
            {/if}
          {/each}
        </span>
      </button>
    {/each}
  </div>
  <p class="legende"><span class="punkt termin"></span> {t('Termin')} <span class="punkt geb"></span> {t('Geburtstag')} <span class="punkt heute"></span> {t('heute')}</p>
</div>

<style>
  .jahr {
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
    min-width: 4em;
    text-align: center;
    font-size: var(--t-gross);
  }
  .monate {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    grid-auto-rows: minmax(0, 1fr);
    gap: 8px;
  }
  .monat {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 0;
    padding: 6px 10px;
    border: 2px solid var(--linie);
    border-radius: 14px;
    background: var(--tafel);
    text-align: left;
    overflow: hidden;
  }
  .monat.aktuell {
    border-color: var(--tinte);
  }
  .name {
    font-family: var(--schrift-titel);
    font-weight: 600;
    font-size: var(--t-klein);
  }
  .tage {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  .punkt {
    display: inline-block;
    width: 100%;
    max-width: 10px;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--linie);
  }
  .punkt.termin {
    background: var(--vormittag-tief);
  }
  .punkt.geb {
    background: var(--gelb);
  }
  .punkt.heute {
    background: var(--rot);
  }
  .legende {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    font-size: var(--t-klein);
    color: var(--tinte-leise);
  }
  .legende .punkt {
    width: 10px;
    margin-left: 8px;
  }
  @media (max-width: 700px) {
    .monate {
      grid-auto-rows: auto;
    }
  }
</style>
