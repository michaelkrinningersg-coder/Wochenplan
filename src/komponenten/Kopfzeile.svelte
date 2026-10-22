<script lang="ts">
  import { t } from '../lib/i18n.svelte'
  import { abgleich, holen } from '../lib/abgleich.svelte'
  import { abschnittInfo, tagName } from '../lib/konstanten'
  import { app, datumVon, istHeute, oeffnen, tagSpringen, wocheSpringen, zeigeHinweis, zuHeute, zurueck } from '../lib/speicher.svelte'
  import { ausKey, datumLang, spanneText, uhrzeitJetzt } from '../lib/zeit'
  import Bild from './Bild.svelte'
  import HalteKnopf from './HalteKnopf.svelte'
  import AnalogUhr from './AnalogUhr.svelte'
  import { istPro } from '../lib/lizenz.svelte'
  import { uhrzeitAnsagen } from '../lib/vorlesen'
  import { installieren, update, updateVerfuegbar } from '../lib/update.svelte'
  import Symbol from './Symbol.svelte'

  const a = $derived(app.ansicht)
  const jetzt = $derived(new Date(app.jetzt))
  const planer = $derived(abgleich.einst.rolle === 'planer')

  const titel = $derived.by(() => {
    switch (a.art) {
      case 'woche':
        return t('Woche')
      case 'monat':
        return t('Kalender')
      case 'jahr':
        return t('Jahresplan')
      case 'tag':
        return t(tagName(a.tag))
      case 'abschnitt':
      case 'aufgabe':
        return t(abschnittInfo(a.abschnitt).name)
    }
  })
  const unter = $derived.by(() => {
    switch (a.art) {
      case 'woche':
        return app.wochenOffset === 0 ? t('diese Woche') : t('ab {datum}', { datum: datumLang(ausKey(datumVon('mo'))) })
      case 'monat':
      case 'jahr':
        return t('Termine und Geburtstage')
      case 'tag':
        return istHeute(a.tag) ? t('heute, {datum}', { datum: datumLang(jetzt) }) : datumLang(ausKey(datumVon(a.tag)))
      case 'abschnitt':
      case 'aufgabe':
        return t('{tag}, {zeit} Uhr', { tag: t(tagName(a.tag)), zeit: spanneText(app.plan, a.abschnitt) })
    }
  })
  const kopfBild = $derived(a.art === 'abschnitt' || a.art === 'aufgabe' ? abschnittInfo(a.abschnitt).bild : null)
  const istStart = $derived(a.art === 'tag' && istHeute(a.tag))
  const zeigeHeute = $derived(a.art === 'tag' && istHeute(a.tag))
  const springbar = $derived(a.art === 'tag' || a.art === 'woche')
  function springen(r: -1 | 1) {
    if (a.art === 'woche') wocheSpringen(r)
    else tagSpringen(r)
  }
</script>

<header class="kopfzeile" class:bearbeiten={app.bearbeiten}>
  <div class="links">
    {#if !istStart}
      <button class="knopf rund zurueck" onclick={() => zurueck()} aria-label={t('Zurück')}><Symbol name="zurueck" /></button>
    {/if}
    {#if kopfBild}
      <span class="kopf-bild"><Bild id={kopfBild} /></span>
    {/if}
    <div class="titelblock">
      <h1>{titel}</h1>
      <span class="unter">{unter}</span>
    </div>
  </div>

  <div class="rechts">
    {#if springbar}
      <div class="sprung">
        <button class="knopf rund" onclick={() => springen(-1)} aria-label={a.art === 'woche' ? t('Vorherige Woche') : t('Vorheriger Tag')}><Symbol name="zurueck" /></button>
        <button class="knopf rund" onclick={() => springen(1)} aria-label={a.art === 'woche' ? t('Nächste Woche') : t('Nächster Tag')}><Symbol name="weiter" /></button>
      </div>
    {/if}
    <nav class="wechsel" aria-label={t('Ansicht')}>
      <button
        class="knopf"
        aria-label={t('Heute')}
        aria-pressed={zeigeHeute}
        onclick={zuHeute}
      >
        <Symbol name="heute" /><span class="wort">{t('Heute')}</span>
      </button>
      <button class="knopf" aria-label={t('Woche')} aria-pressed={a.art === 'woche'} onclick={() => oeffnen({ art: 'woche' })}>
        <Symbol name="woche" /><span class="wort">{t('Woche')}</span>
      </button>
      <button
        class="knopf"
        aria-label={t('Kalender')}
        aria-pressed={a.art === 'monat' || a.art === 'jahr'}
        onclick={() => oeffnen({ art: 'monat', jahr: jetzt.getFullYear(), monat: jetzt.getMonth() })}
      >
        <Symbol name="kalender" /><span class="wort">{t('Kalender')}</span>
      </button>
    </nav>

    {#if updateVerfuegbar()}
      <HalteKnopf
        label={t('Neue Version installieren (gedrückt halten)')}
        onhalten={() => void installieren()}
        onkurz={() => zeigeHinweis(update.meldung && update.zustand !== 'suche' ? update.meldung : t('Neue Version: zum Installieren gedrückt halten'))}
      >
        <span class="update-punkt"><Symbol name="neu" /></span>
      </HalteKnopf>
    {/if}

    {#if istPro()}
    <button
      class="uhr"
      onclick={() => {
        if (app.dialog?.art !== 'uhr') app.dialog = { art: 'uhr' }
        else uhrzeitAnsagen(new Date())
      }}
      aria-label={t('Uhrzeit {zeit} – groß zeigen und ansagen', { zeit: uhrzeitJetzt(jetzt) })}
    >
      {#if (app.einst.uhrArt ?? 'digital') === 'analog'}
        <AnalogUhr zeit={jetzt} groesse={52} />
      {:else}
        {uhrzeitJetzt(jetzt)}
      {/if}
    </button>
    {/if}

    {#if planer && abgleich.zustand !== 'aus'}
      <button
        class="wolke"
        class:fehler={abgleich.zustand === 'fehler'}
        class:laeuft={abgleich.zustand === 'laeuft'}
        onclick={() => (app.dialog = { art: 'einstellungen' })}
        aria-label={abgleich.zustand === 'fehler' ? t('Abgleich fehlgeschlagen') : t('Plan ist abgeglichen')}
        title={abgleich.meldung || t('Plan ist abgeglichen')}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.2 4.5 4.5 0 0 0 7 18z" /></svg>
      </button>
    {:else if !planer && abgleich.zustand === 'fehler'}
      <span class="wolke fehler" title={abgleich.meldung} role="img" aria-label={t('Plan konnte nicht geladen werden')}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.2 4.5 4.5 0 0 0 7 18z" /></svg>
      </span>
    {/if}

    {#if app.bearbeiten}
      <button class="knopf rund" onclick={() => (app.dialog = { art: 'einstellungen' })} aria-label={t('Einstellungen')}>
        <Symbol name="zahnrad" />
      </button>
      <button class="knopf haupt fertig" onclick={() => ((app.bearbeiten = false), (app.verschieben = null))} aria-label={t('Fertig')}>
        <Symbol name="haken" /><span class="fertig-wort">{t('Fertig')}</span>
      </button>
    {:else if planer}
      <button class="knopf rund" onclick={() => (app.dialog = { art: 'einstellungen' })} aria-label={t('Einstellungen')}>
        <Symbol name="zahnrad" />
      </button>
      <HalteKnopf
        label={t('Plan bearbeiten (gedrückt halten)')}
        onhalten={() => ((app.bearbeiten = true), void holen())}
        onkurz={() => zeigeHinweis(t('Zum Bearbeiten den Stift gedrückt halten'))}
      >
        <Symbol name="stift" />
      </HalteKnopf>
    {:else}
      <HalteKnopf
        label={t('Einstellungen (gedrückt halten)')}
        onhalten={() => (app.dialog = { art: 'einstellungen' })}
        onkurz={() => zeigeHinweis(t('Für die Einstellungen gedrückt halten'))}
      >
        <Symbol name="zahnrad" />
      </HalteKnopf>
    {/if}
  </div>
</header>

{#if app.bearbeiten}
  <div class="bearbeiten-leiste" role="status">
    {#if app.verschieben}
      {t('Mit den Pfeiltasten verschieben, OK legt die Aufgabe ab.')}
    {:else}
      {t('Aufgaben ziehen zum Verschieben, antippen zum Ändern.')}
    {/if}
  </div>
{/if}

<style>
  .kopfzeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 var(--rand);
    min-height: clamp(56px, 8.5vh, 84px);
    flex: none;
  }
  .links,
  .rechts {
    display: flex;
    align-items: center;
    gap: clamp(8px, 1.2vw, 16px);
    min-width: 0;
  }
  .kopf-bild {
    width: clamp(34px, 4.5vw, 54px);
    height: clamp(34px, 4.5vw, 54px);
    flex: none;
  }
  .titelblock {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  h1 {
    font-size: var(--t-titel);
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .unter {
    font-size: var(--t-klein);
    color: var(--tinte-leise);
    white-space: nowrap;
  }
  .sprung {
    display: flex;
    gap: 6px;
  }
  .wechsel {
    display: flex;
    gap: 6px;
  }
  .uhr {
    display: grid;
    place-items: center;
    border: 2px solid transparent;
    border-radius: 16px;
    padding: 2px 8px;
    background: none;
    color: inherit;
    font-family: var(--schrift-titel);
    font-weight: 600;
    font-size: var(--t-titel);
    font-variant-numeric: tabular-nums;
    min-width: 2.6em;
    text-align: right;
  }
  .update-punkt {
    display: grid;
    place-items: center;
    color: var(--gruen);
  }
  .wolke {
    display: grid;
    place-items: center;
    width: 2.2em;
    height: 2.2em;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--gruen);
  }
  .wolke svg {
    width: 1.4em;
    height: 1.4em;
    fill: currentColor;
  }
  .wolke.laeuft {
    color: var(--tinte-leise);
  }
  .wolke.fehler {
    color: var(--rot);
  }
  .bearbeiten-leiste {
    margin: 0 var(--rand) 8px;
    padding: 6px 16px;
    border-radius: 999px;
    background: var(--gelb);
    color: var(--tinte-auf-farbe);
    font-weight: 700;
    font-size: var(--t-klein);
    text-align: center;
    flex: none;
  }
  @media (max-width: 1200px) {
    .wort {
      display: none;
    }
    .wechsel .knopf {
      padding: 0;
      width: 2.6em;
    }
  }
  @media (max-width: 760px) {
    .wort {
      display: none;
    }
    .wechsel .knopf {
      padding: 0;
      width: 2.6em;
    }
    .uhr {
      font-size: var(--t-gross);
    }
  }
  /* im Bearbeiten-Modus ist es enger: Wörter der Ansichtsknöpfe früher ausblenden, damit der Titel ganz bleibt */
  @media (max-width: 1440px) {
    .kopfzeile.bearbeiten .wort {
      display: none;
    }
    .kopfzeile.bearbeiten .wechsel .knopf {
      padding: 0;
      width: 2.6em;
    }
  }
  @media (max-width: 480px) {
    .kopfzeile {
      flex-wrap: wrap;
      row-gap: 6px;
      padding-block: 8px;
    }
    .rechts {
      width: 100%;
      justify-content: space-between;
      gap: 4px;
    }
    .rechts :global(.knopf.rund),
    .wechsel .knopf {
      width: 2.3em;
      height: 2.3em;
      min-height: 0;
    }
    .uhr {
      min-width: 0;
      padding: 2px 4px;
    }
    .fertig {
      padding-inline: 0.7em;
    }
    .fertig-wort {
      display: none;
    }
  }
</style>
