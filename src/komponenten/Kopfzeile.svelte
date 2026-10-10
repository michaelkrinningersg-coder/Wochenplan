<script lang="ts">
  import { abgleich, holen } from '../lib/abgleich.svelte'
  import { abschnittInfo, tagName } from '../lib/konstanten'
  import { app, istHeute, oeffnen, zeigeHinweis, zurueck } from '../lib/speicher.svelte'
  import { datumLang, heuteTag, spanneText, uhrzeitJetzt } from '../lib/zeit'
  import Bild from './Bild.svelte'
  import HalteKnopf from './HalteKnopf.svelte'
  import KinderWahl from './KinderWahl.svelte'
  import { installieren, update, updateVerfuegbar } from '../lib/update.svelte'
  import Symbol from './Symbol.svelte'

  const a = $derived(app.ansicht)
  const jetzt = $derived(new Date(app.jetzt))
  const planer = $derived(abgleich.einst.rolle === 'planer')

  const titel = $derived.by(() => {
    switch (a.art) {
      case 'woche':
        return 'Woche'
      case 'monat':
        return 'Kalender'
      case 'jahr':
        return 'Jahresplan'
      case 'tag':
        return tagName(a.tag)
      case 'abschnitt':
      case 'aufgabe':
        return abschnittInfo(a.abschnitt).name
    }
  })
  const unter = $derived.by(() => {
    switch (a.art) {
      case 'woche':
        return 'jede Woche gleich'
      case 'monat':
      case 'jahr':
        return 'Termine und Geburtstage'
      case 'tag':
        return istHeute(a.tag) ? `heute, ${datumLang(jetzt)}` : 'jede Woche'
      case 'abschnitt':
      case 'aufgabe':
        return `${tagName(a.tag)}, ${spanneText(app.plan, a.abschnitt)} Uhr`
    }
  })
  const kopfBild = $derived(a.art === 'abschnitt' || a.art === 'aufgabe' ? abschnittInfo(a.abschnitt).bild : null)
  const istStart = $derived(a.art === 'tag' && istHeute(a.tag))
  const zeigeHeute = $derived(a.art === 'tag' && istHeute(a.tag))
</script>

<header class="kopfzeile">
  <div class="links">
    {#if !istStart}
      <button class="knopf rund zurueck" onclick={() => zurueck()} aria-label="Zurück"><Symbol name="zurueck" /></button>
    {/if}
    {#if kopfBild}
      <span class="kopf-bild"><Bild id={kopfBild} /></span>
    {/if}
    <div class="titelblock">
      <h1>{titel}</h1>
      <span class="unter">{unter}</span>
    </div>
    {#if a.art === 'tag' || a.art === 'abschnitt' || a.art === 'aufgabe'}
      <KinderWahl />
    {/if}
  </div>

  <div class="rechts">
    <nav class="wechsel" aria-label="Ansicht">
      <button
        class="knopf"
        aria-label="Heute"
        aria-pressed={zeigeHeute}
        onclick={() => oeffnen({ art: 'tag', tag: heuteTag() })}
      >
        <Symbol name="heute" /><span class="wort">Heute</span>
      </button>
      <button class="knopf" aria-label="Woche" aria-pressed={a.art === 'woche'} onclick={() => oeffnen({ art: 'woche' })}>
        <Symbol name="woche" /><span class="wort">Woche</span>
      </button>
      <button
        class="knopf"
        aria-label="Kalender"
        aria-pressed={a.art === 'monat' || a.art === 'jahr'}
        onclick={() => oeffnen({ art: 'monat', jahr: jetzt.getFullYear(), monat: jetzt.getMonth() })}
      >
        <Symbol name="kalender" /><span class="wort">Kalender</span>
      </button>
    </nav>

    {#if updateVerfuegbar()}
      <HalteKnopf
        label="Neue Version installieren (gedrückt halten)"
        onhalten={() => void installieren()}
        onkurz={() => zeigeHinweis(update.meldung && update.zustand !== 'suche' ? update.meldung : 'Neue Version: zum Installieren gedrückt halten')}
      >
        <span class="update-punkt"><Symbol name="neu" /></span>
      </HalteKnopf>
    {/if}

    <span class="uhr" aria-label="Uhrzeit">{uhrzeitJetzt(jetzt)}</span>

    {#if planer && abgleich.zustand !== 'aus'}
      <button
        class="wolke"
        class:fehler={abgleich.zustand === 'fehler'}
        class:laeuft={abgleich.zustand === 'laeuft'}
        onclick={() => (app.dialog = { art: 'einstellungen' })}
        aria-label={abgleich.zustand === 'fehler' ? 'Abgleich fehlgeschlagen' : 'Plan ist abgeglichen'}
        title={abgleich.meldung || 'Plan ist abgeglichen'}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.2 4.5 4.5 0 0 0 7 18z" /></svg>
      </button>
    {:else if !planer && abgleich.zustand === 'fehler'}
      <span class="wolke fehler" title={abgleich.meldung} role="img" aria-label="Plan konnte nicht geladen werden">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.2 4.5 4.5 0 0 0 7 18z" /></svg>
      </span>
    {/if}

    {#if app.bearbeiten}
      <button class="knopf rund" onclick={() => (app.dialog = { art: 'einstellungen' })} aria-label="Einstellungen">
        <Symbol name="zahnrad" />
      </button>
      <button class="knopf haupt" onclick={() => ((app.bearbeiten = false), (app.verschieben = null))}>
        <Symbol name="haken" />Fertig
      </button>
    {:else if planer}
      <HalteKnopf
        label="Plan bearbeiten (gedrückt halten)"
        onhalten={() => ((app.bearbeiten = true), void holen())}
        onkurz={() => zeigeHinweis('Zum Bearbeiten den Stift gedrückt halten')}
      >
        <Symbol name="stift" />
      </HalteKnopf>
    {:else}
      <HalteKnopf
        label="Einstellungen (gedrückt halten)"
        onhalten={() => (app.dialog = { art: 'einstellungen' })}
        onkurz={() => zeigeHinweis('Für die Einstellungen gedrückt halten')}
      >
        <Symbol name="schloss" />
      </HalteKnopf>
    {/if}
  </div>
</header>

{#if app.bearbeiten}
  <div class="bearbeiten-leiste" role="status">
    {#if app.verschieben}
      Mit den Pfeiltasten verschieben, OK legt die Aufgabe ab.
    {:else}
      Aufgaben ziehen zum Verschieben, antippen zum Ändern.
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
  .wechsel {
    display: flex;
    gap: 6px;
  }
  .uhr {
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
  @media (max-width: 480px) {
    .kopfzeile {
      flex-wrap: wrap;
      padding-block: 8px;
    }
  }
</style>
