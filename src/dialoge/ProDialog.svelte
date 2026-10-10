<script lang="ts">
  // Wochenplan Pro: Vergleich Kostenlos / Pro und Kauf über Google Play (hinter einer Erwachsenen-Frage)
  import Fenster from '../komponenten/Fenster.svelte'
  import { t } from '../lib/i18n.svelte'
  import { FREI_MAX_KACHELN, kaeufeWiederherstellen, lizenz, proKaufen } from '../lib/lizenz.svelte'

  const a = 3 + Math.floor(Math.random() * 7)
  const b = 3 + Math.floor(Math.random() * 7)
  let antwort = $state('')
  const erwachsen = $derived(Number(antwort.trim()) === a * b)

  const FREI = [t('Morgenroutine'), t('bis zu {n} Kacheln', { n: FREI_MAX_KACHELN }), t('Plan sichern und teilen')]
  const PRO = [
    t('Alle Tageszeiten, vom Aufstehen bis zum Schlafen'),
    t('Beliebig viele Kacheln'),
    t('Ruhebild mit Jahreszeiten, Wetter und Figuren'),
    t('Uhr und Sonnenbogen'),
    t('Sprachausgabe: Die App liest vor und lobt'),
  ]
</script>

<Fenster titel={t('Wochenplan Pro')}>
  {#if lizenz.pro}
    <p class="gross">✓ {t('Pro ist freigeschaltet. Vielen Dank!')}</p>
  {:else}
    <div class="spalten">
      <section>
        <h3>{t('Kostenlos')}</h3>
        <ul>{#each FREI as x}<li>{x}</li>{/each}</ul>
      </section>
      <section class="pro">
        <h3>{t('Pro')} <small>{t('einmalig, kein Abo')}</small></h3>
        <ul>{#each PRO as x}<li>{x}</li>{/each}</ul>
      </section>
    </div>

    <div class="kauf">
      <label>
        <span>{t('Nur für Erwachsene: Was ist {a} × {b}?', { a, b })}</span>
        <input inputmode="numeric" autocomplete="off" bind:value={antwort} aria-label={t('Antwort')} />
      </label>
      <button class="knopf" disabled={!erwachsen || !lizenz.bereit || lizenz.laeuft} onclick={() => void proKaufen()}>
        {lizenz.preis ? t('Pro freischalten – {preis}', { preis: lizenz.preis }) : t('Pro freischalten')}
      </button>
      <button class="knopf klein" disabled={!erwachsen || lizenz.laeuft} onclick={() => void kaeufeWiederherstellen()}>
        {t('Kauf wiederherstellen')}
      </button>
      {#if !lizenz.bereit}<p class="hilfe">{t('Google Play ist gerade nicht erreichbar.')}</p>{/if}
      {#if lizenz.meldung}<p class="hilfe fehler">{lizenz.meldung}</p>{/if}
    </div>
  {/if}
</Fenster>

<style>
  .gross {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 16px 0;
  }
  .spalten {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
  }
  .spalten section {
    padding: 14px 16px;
    border-radius: 18px;
    background: color-mix(in srgb, var(--tinte) 6%, transparent);
  }
  .spalten .pro {
    background: color-mix(in srgb, #f2b138 28%, transparent);
  }
  h3 {
    margin: 0 0 8px;
    font-size: 1.15rem;
  }
  h3 small {
    font-weight: 500;
    opacity: 0.7;
    font-size: 0.8rem;
  }
  ul {
    margin: 0;
    padding-left: 20px;
    display: grid;
    gap: 4px;
  }
  .kauf {
    display: grid;
    gap: 10px;
    margin-top: 16px;
    justify-items: start;
  }
  label {
    display: grid;
    gap: 6px;
  }
  input {
    width: 7em;
    font: inherit;
    font-size: 1.2rem;
    padding: 8px 12px;
    border-radius: 12px;
    border: 2px solid color-mix(in srgb, var(--tinte) 30%, transparent);
    background: var(--tafel);
    color: inherit;
  }
  .hilfe {
    margin: 0;
    opacity: 0.8;
  }
  .fehler {
    color: #b3261e;
  }
  button:disabled {
    opacity: 0.45;
  }
</style>
