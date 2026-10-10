<script lang="ts">
  import Ampel from '../komponenten/Ampel.svelte'
  import Bild from '../komponenten/Bild.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import Konfetti from '../komponenten/Konfetti.svelte'
  import Sanduhr from '../komponenten/Sanduhr.svelte'
  import TimerScheibe from '../komponenten/TimerScheibe.svelte'
  import { ampelZustand } from '../lib/ampel'
  import { ICON_URL } from '../lib/bilder'
  import {
    allesErledigt,
    app,
    finde,
    istErledigt,
    istHeute,
    minutenBisStart,
    naechsteNach,
    oeffnen,
    setzeErledigt,
    timerAendern,
    timerPause,
    timerRest,
    timerSetzen,
    timerStart,
    timerZuruecksetzen,
  } from '../lib/speicher.svelte'
  import { spieleTon } from '../lib/ton'
  import type { AbschnittId, TagId } from '../lib/typen'
  import { dauerText, inText } from '../lib/zeit'

  let { tag, abschnitt, id }: { tag: TagId; abschnitt: AbschnittId; id: string } = $props()

  let breite = $state(0)
  let hoehe = $state(0)
  let feiern = $state<null | 'eins' | 'alles'>(null)
  const SCHNELL = [2, 5, 10, 15, 20, 30, 45, 60]

  const fund = $derived(finde(tag, id))
  const aufgabe = $derived(fund?.aufgabe)
  const seg = $derived(fund?.abschnitt ?? abschnitt)
  const heute = $derived(istHeute(tag))
  const erledigt = $derived(heute && istErledigt(id))
  const mitTimer = $derived((aufgabe?.minuten ?? 0) > 0 || app.timer[id] !== undefined)
  const dauerMs = $derived(app.timer[id]?.dauerMs ?? (aufgabe?.minuten ?? 0) * 60_000)
  const t = $derived(timerRest(id, dauerMs))
  const bisStart = $derived(aufgabe ? minutenBisStart(tag, aufgabe) : null)
  const danach = $derived(naechsteNach(tag, id))

  const ampel = $derived.by((): 'rot' | 'gelb' | 'gruen' | 'aus' => {
    if (!mitTimer) return 'aus'
    return ampelZustand(t.restMs, dauerMs)
  })
  const farbe = $derived(ampel === 'rot' ? 'var(--rot)' : ampel === 'gelb' ? 'var(--gelb)' : 'var(--gruen)')

  /** Anteil der Scheibe: Restzeit des Timers oder Wartezeit bis zum Start (max. 1 Stunde) */
  const anteil = $derived.by(() => {
    if (mitTimer) return dauerMs > 0 ? t.restMs / dauerMs : 0
    if (bisStart !== null) return Math.min(1, bisStart / 60)
    return null
  })

  // Platz aufteilen: Scheibe links, Ampel daneben, Knöpfe rechts
  const quer = $derived(breite > hoehe * 1.25)
  const scheibe = $derived(
    Math.max(160, Math.floor(quer ? Math.min(hoehe * 0.96, breite * 0.48) : Math.min(breite * 0.78, hoehe * 0.5))),
  )
  const ampelHoehe = $derived(Math.floor(scheibe * 0.8))

  function fertig() {
    if (!aufgabe) return
    setzeErledigt(id, true)
    timerPause(id)
    const alles = allesErledigt(tag)
    if (app.einst.ton) spieleTon(alles ? 'alles' : 'fertig')
    feiern = alles ? 'alles' : 'eins'
    setTimeout(
      () => {
        feiern = null
        document.querySelector<HTMLElement>('[data-fokus-id="danach"]')?.focus()
      },
      alles ? 3800 : 2400,
    )
  }

  function nochmal() {
    setzeErledigt(id, false)
    timerZuruecksetzen(id)
  }

  function starten() {
    if (!aufgabe) return
    if (t.gestartet && t.restMs <= 0) timerZuruecksetzen(id)
    timerStart(id, app.timer[id] ? dauerMs / 60_000 : aufgabe.minuten)
  }
</script>

{#if aufgabe}
  <div class="aufgabe" class:quer data-seg={seg} bind:clientWidth={breite} bind:clientHeight={hoehe}>
    <div class="bildteil">
      <TimerScheibe
        anteil={erledigt ? null : anteil}
        farbe={(bisStart !== null && !mitTimer) || app.einst.timerArt === 'sanduhr' ? 'var(--seg)' : farbe}
        groesse={scheibe}
      >
        <div class="bild" class:erledigt>
          <Bild id={aufgabe.bild} zusatz={aufgabe.zusatz} />
        </div>
      </TimerScheibe>
      {#if mitTimer && !erledigt}
        {#if app.einst.timerArt === 'sanduhr'}
          <Sanduhr anteil={dauerMs > 0 ? t.restMs / dauerMs : 0} laeuft={t.laeuft} vorbei={t.gestartet && t.restMs <= 0} hoehe={ampelHoehe} />
        {:else}
          <Ampel zustand={ampel} blinken={t.gestartet && t.restMs <= 0} hoehe={ampelHoehe} />
        {/if}
      {/if}
    </div>

    <div class="seite">
      <h1 class="titel">{aufgabe.titel}</h1>

      {#if erledigt}
        <p class="status geschafft">Geschafft!</p>
      {:else if mitTimer}
        <p class="status zeit" class:vorbei={t.gestartet && t.restMs <= 0}>
          {#if t.gestartet && t.restMs <= 0}
            Zeit ist um
          {:else}
            noch {dauerText(t.restMs)}
          {/if}
        </p>
      {:else if bisStart !== null}
        <p class="status">Es geht los {inText(bisStart)}</p>
      {/if}

      <div class="knoepfe">
        {#if !erledigt}
          {#if mitTimer}
            {#if t.laeuft}
              <button class="knopf gross pause" onclick={() => timerPause(id)} data-autofokus><Symbol name="pause" />Pause</button>
            {:else}
              <button class="knopf gross los" onclick={starten} data-autofokus>
                <Symbol name="start" />{t.gestartet && t.restMs > 0 ? 'Weiter' : 'Los'}
              </button>
            {/if}
          {/if}
          <button class="knopf gross fertig" onclick={fertig} data-autofokus={!mitTimer ? true : undefined}>
            <Symbol name="haken" />Fertig
          </button>
        {:else}
          <button class="knopf" onclick={nochmal}><Symbol name="neu" />Nochmal</button>
        {/if}
      </div>

      {#if !erledigt && !t.gestartet}
        <div class="schnellwahl" role="group" aria-label="Timer einstellen">
          <span class="schnell-text">Timer</span>
          {#each SCHNELL as m (m)}
            <button class="knopf klein" aria-pressed={mitTimer && dauerMs === m * 60_000} onclick={() => timerSetzen(id, m)}>{m} Min</button>
          {/each}
        </div>
      {/if}

      {#if mitTimer && !erledigt}
        <div class="feinstellung">
          <button class="knopf klein" onclick={() => timerAendern(id, -1, aufgabe.minuten)} aria-label="Eine Minute weniger">− 1 Min</button>
          <button class="knopf klein" onclick={() => timerAendern(id, 1, aufgabe.minuten)} aria-label="Eine Minute mehr">+ 1 Min</button>
          {#if t.gestartet}
            <button class="knopf klein" onclick={() => timerZuruecksetzen(id)}><Symbol name="neu" />Neu</button>
          {/if}
        </div>
      {/if}

      {#if danach}
        <button
          class="danach"
          data-seg={danach.abschnitt}
          data-fokus-id="danach"
          onclick={() => oeffnen({ art: 'aufgabe', tag, abschnitt: danach.abschnitt, id: danach.aufgabe.id })}
        >
          <span class="danach-text">Danach</span>
          <span class="danach-bild"><Bild id={danach.aufgabe.bild} zusatz={danach.aufgabe.zusatz} /></span>
          <span class="danach-name">{danach.aufgabe.titel}</span>
          <Symbol name="weiter" />
        </button>
      {/if}
    </div>

    {#if feiern}
      <div class="feier" class:alles={feiern === 'alles'} aria-live="polite">
        <Konfetti anzahl={feiern === 'alles' ? 60 : 36} />
        <img src={ICON_URL[feiern === 'alles' ? 'party' : '_leuchtstern']} alt="" />
        <span>{feiern === 'alles' ? 'Alles geschafft!' : 'Super gemacht!'}</span>
      </div>
    {/if}
  </div>
{:else}
  <div class="weg">
    <p>Diese Aufgabe gibt es nicht mehr.</p>
    <button class="knopf" onclick={() => oeffnen({ art: 'tag', tag })} data-autofokus>Zum Tag</button>
  </div>
{/if}

<style>
  .aufgabe {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--rand);
    height: 100%;
    min-height: 0;
  }
  .aufgabe.quer {
    flex-direction: row;
    justify-content: center;
  }
  .bildteil {
    display: flex;
    align-items: center;
    gap: clamp(16px, 2.5vw, 40px);
  }
  .bild {
    width: 100%;
    height: 100%;
  }
  .bild.erledigt {
    filter: saturate(1.1);
  }
  .seite {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(10px, 1.6vw, 22px);
    min-width: 0;
    max-width: 30em;
  }
  .aufgabe:not(.quer) .seite {
    align-items: center;
    text-align: center;
  }
  .titel {
    font-size: var(--t-riesig);
    line-height: 1;
  }
  .status {
    margin: 0;
    font-family: var(--schrift-titel);
    font-size: var(--t-titel);
    font-variant-numeric: tabular-nums;
    color: var(--tinte-leise);
  }
  .status.vorbei {
    color: var(--rot);
  }
  .status.geschafft {
    color: var(--gruen);
  }
  .schnellwahl {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }
  .schnell-text {
    font-size: var(--t-klein);
    color: var(--tinte-leise);
    font-weight: 700;
    margin-right: 4px;
  }
  .knoepfe,
  .feinstellung {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  /* Große Kinderknöpfe: am Symbol erkennbar, ohne lesen zu können */
  .knopf.gross {
    font-size: var(--t-titel);
    min-height: 2.1em;
    padding-inline: 0.9em 1.2em;
    gap: 0.35em;
    box-shadow: 0 0.12em 0 rgba(0, 0, 0, 0.22);
  }
  .knopf.gross :global(svg) {
    width: 1.3em;
    height: 1.3em;
    stroke-width: 3;
  }
  .knopf.los {
    background: var(--vormittag-tief);
    border-color: var(--vormittag-tief);
    color: #ffffff;
  }
  .knopf.fertig {
    background: var(--gruen);
    border-color: var(--gruen);
    color: #ffffff;
  }
  .knopf.klein {
    font-size: var(--t-klein);
    min-height: 2.4em;
  }
  .danach {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 0.4em;
    padding: 8px 16px 8px 14px;
    border: none;
    border-radius: 20px;
    background: var(--seg-hell);
    box-shadow: inset 0 0 0 3px var(--seg);
    font-size: var(--t-text);
  }
  .danach-text {
    color: var(--tinte-leise);
    font-size: var(--t-klein);
  }
  .danach-bild {
    width: clamp(36px, 4.5vw, 56px);
    height: clamp(36px, 4.5vw, 56px);
  }
  .danach-name {
    font-weight: 700;
  }

  .feier {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--himmel);
    opacity: 0.96;
    animation: feier 2.4s ease both;
    z-index: 10;
  }
  .feier img {
    width: min(40vh, 40vw);
    height: min(40vh, 40vw);
    animation: stern 1.8s ease both;
    position: relative;
  }
  .feier.alles {
    animation-duration: 3.8s;
  }
  .feier span {
    position: relative;
  }
  .feier span {
    font-family: var(--schrift-titel);
    font-weight: 600;
    font-size: var(--t-riesig);
  }
  @keyframes feier {
    0% {
      opacity: 0;
    }
    12%,
    85% {
      opacity: 0.96;
    }
    100% {
      opacity: 0;
    }
  }
  @keyframes stern {
    0% {
      transform: scale(0.3) rotate(-30deg);
    }
    30% {
      transform: scale(1.1) rotate(8deg);
    }
    45%,
    100% {
      transform: scale(1) rotate(0);
    }
  }
  .weg {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
    padding: var(--rand);
  }
</style>
