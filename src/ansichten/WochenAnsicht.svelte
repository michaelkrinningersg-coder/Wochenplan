<script lang="ts">
  import { segVon } from '../lib/konstanten'
  import Kachel from '../komponenten/Kachel.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import { aufgabeGewaehlt } from '../lib/aktionen'
  import { ABSCHNITTE, TAGE } from '../lib/konstanten'
  import { t } from '../lib/i18n.svelte'
  import { wochenRaster } from '../lib/raster'
  import { app, aufgabenIn, istErledigt, istHeute, neueAufgabe, oeffnen, vorlageFuer } from '../lib/speicher.svelte'

  let breite = $state(0)
  let hoehe = $state(0)

  const schmal = $derived(breite > 0 && breite < 700)
  const LUECKE = 6
  const BAND_INNEN = 6
  const KOPF = 52
  const spaltenBreite = $derived((breite - 6 * 8) / 7)
  const s = $derived(
    schmal
      ? app.bearbeiten
        ? 48
        : 40
      : wochenRaster(
          TAGE.map((tg) => ABSCHNITTE.map((a) => aufgabenIn(tg.id, a.id).length + (app.bearbeiten ? 1 : 0))),
          spaltenBreite,
          hoehe,
          KOPF,
          BAND_INNEN,
          LUECKE,
        ),
  )
</script>

<div class="woche" class:schmal bind:clientWidth={breite} bind:clientHeight={hoehe}>
  {#each TAGE as tg (tg.id)}
    {@const heute = istHeute(tg.id)}
    <section class="tag" class:heute>
      <div class="tag-kopf">
        <button
          class="tag-name"
          data-fokus-id={'tag:' + tg.id}
          data-autofokus={heute ? true : undefined}
          onclick={() => oeffnen({ art: 'tag', tag: tg.id })}
        >
          <span class="kurz">{t(tg.kurz)}</span>
          <span class="lang">{t(tg.lang)}</span>
        </button>
        {#if app.bearbeiten}
          <button class="kopieren" onclick={() => (app.dialog = { art: 'kopieren', tag: tg.id })} aria-label={t('{tag} kopieren, als Vorlage speichern oder leeren', { tag: t(tg.lang) })}>
            <Symbol name="kopie" />
          </button>
        {/if}
      </div>
      <div class="baender">
        {#each ABSCHNITTE as ab (ab.id)}
          <div class="band" data-seg={segVon(ab.id)} data-zone data-tag={tg.id} data-abschnitt={ab.id} style="--luecke: {LUECKE}px">
            {#each aufgabenIn(tg.id, ab.id) as aufgabe (aufgabe.id)}
              <Kachel
                {aufgabe}
                tag={tg.id}
                groesse={s}
                mini
                erledigt={heute && istErledigt(aufgabe)}
                onwahl={(e) => aufgabeGewaehlt(e, tg.id, ab.id, aufgabe)}
              />
            {/each}
            {#if app.bearbeiten}
              <button class="neu" style="--s: {s}px" onclick={() => neueAufgabe(tg.id, ab.id)} aria-label={t('Aufgabe hinzufügen: {tag}, {abschnitt}', { tag: t(tg.lang), abschnitt: t(ab.name) })}>
                <Symbol name="plus" />
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/each}
</div>

<style>
  .woche {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 8px;
    height: 100%;
    min-height: 0;
  }
  .tag {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    gap: 6px;
  }
  .tag-kopf {
    display: flex;
    gap: 4px;
    height: 46px;
    flex: none;
  }
  .tag-name {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
    border: 2px solid var(--linie);
    border-radius: 16px;
    background: var(--tafel);
    font-family: var(--schrift-titel);
    font-weight: 600;
    font-size: var(--t-gross);
  }
  .tag-name .lang {
    display: none;
  }
  .heute .tag-name {
    background: var(--tinte);
    border-color: var(--tinte);
    color: var(--tafel);
  }
  .kopieren {
    width: 40px;
    border: 2px solid var(--linie);
    border-radius: 14px;
    background: var(--tafel);
    display: grid;
    place-items: center;
    flex: none;
  }
  .baender {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .band {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: var(--luecke);
    min-height: 30px;
    padding: 6px;
    border-radius: 14px;
    background: var(--seg-hell);
  }
  .band:last-child {
    flex: 1;
  }
  .band:global(.ablage-aktiv) {
    box-shadow: inset 0 0 0 3px var(--seg-tief);
  }
  .heute .band {
    box-shadow: inset 0 0 0 2px var(--seg);
  }
  .neu {
    display: grid;
    place-items: center;
    width: var(--s);
    height: var(--s);
    border: 2px dashed var(--seg-tief);
    border-radius: calc(var(--s) * 0.24);
    background: transparent;
    color: var(--seg-tief);
    font-size: calc(var(--s) * 0.4);
  }

  /* Handy: Tage untereinander */
  .woche.schmal {
    display: flex;
    flex-direction: column;
    height: auto;
  }
  .schmal .tag {
    flex-direction: row;
    align-items: stretch;
  }
  .schmal .tag-kopf {
    flex-direction: column;
    width: 74px;
    height: auto;
  }
  .schmal .tag-name {
    font-size: var(--t-text);
  }
  .schmal .baender {
    flex: 1;
  }
  .schmal .band:last-child {
    flex: none;
  }
</style>
