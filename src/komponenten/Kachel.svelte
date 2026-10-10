<script lang="ts">
  import { t } from '../lib/i18n.svelte'
  import { app, istTermin, verschiebeAufgabe } from '../lib/speicher.svelte'
  import { ampelZustand } from '../lib/ampel'
  import { dauerText } from '../lib/zeit'
  import type { Aufgabe, TagId } from '../lib/typen'
  import { inText } from '../lib/zeit'
  import { ziehbar } from '../lib/ziehen'
  import AufgabenBild from './AufgabenBild.svelte'
  import Symbol from './Symbol.svelte'

  let {
    aufgabe,
    tag,
    groesse,
    status = '',
    erledigt = false,
    bisStart = null,
    mini = false,
    autofokus = false,
    onwahl,
  }: {
    aufgabe: Aufgabe
    tag: TagId
    groesse: number
    status?: 'jetzt' | 'danach' | ''
    erledigt?: boolean
    bisStart?: number | null
    mini?: boolean
    autofokus?: boolean
    onwahl: (e: MouseEvent) => void
  } = $props()

  const verschoben = $derived(app.verschieben?.id === aufgabe.id)
  const bearbeiten = $derived(app.bearbeiten)
  const termin = $derived(istTermin(aufgabe.id))
  const timer = $derived.by(() => {
    const tm = app.timer[aufgabe.id]
    if (!tm || erledigt || (tm.gestartet === null && tm.vergangenMs === 0)) return null
    const rest = tm.dauerMs - (tm.vergangenMs + (tm.gestartet !== null ? app.jetzt - tm.gestartet : 0))
    return { rest, zustand: ampelZustand(rest, tm.dauerMs), laeuft: tm.gestartet !== null }
  })
  const kind = $derived(aufgabe.fuer?.length === 1 ? app.plan.kinder.find((k) => k.id === aufgabe.fuer![0]) : undefined)

  /** kleines Wackeln beim Antippen (nicht im Bearbeiten-Modus, dort wird gezogen) */
  function wackeln(el: HTMLElement) {
    if (bearbeiten) return
    el.classList.remove('wackel')
    void el.offsetWidth
    el.classList.add('wackel')
  }
</script>

<button
  class="kachel"
  class:mini
  class:jetzt={status === 'jetzt'}
  class:danach={status === 'danach'}
  class:erledigt
  class:bearbeiten
  class:verschoben
  class:termin
  style="--s: {groesse}px"
  data-aufgabe-id={aufgabe.id}
  data-fokus-id={'aufgabe:' + aufgabe.id}
  data-autofokus={autofokus ? true : undefined}
  aria-label={aufgabe.titel + (erledigt ? ', ' + t('erledigt') : '') + (status === 'jetzt' ? ', ' + t('jetzt dran') : '')}
  title={mini ? aufgabe.titel : undefined}
  onclick={(e) => {
    wackeln(e.currentTarget)
    onwahl(e)
  }}
  use:ziehbar={{
    id: aufgabe.id,
    tag,
    aktiv: bearbeiten && !termin,
    ablegen: (zielTag, zielAbschnitt, index) => verschiebeAufgabe(tag, aufgabe.id, zielTag, zielAbschnitt, index),
  }}
>
  <span class="flaeche">
    <AufgabenBild {aufgabe} />
    {#if kind && app.einst.kind === 'alle'}
      <span class="kind" style="--kind: {kind.farbe}" title={t('nur {name}', { name: kind.name })}>{kind.name.slice(0, 1)}</span>
    {/if}
    {#if erledigt}
      <span class="haken"><Symbol name="haken" /></span>
    {/if}
    {#if timer && !mini}
      <span class="restzeit {timer.zustand}" class:pause={!timer.laeuft}>{timer.rest > 0 ? dauerText(timer.rest) : '0:00'}</span>
    {/if}
    {#if verschoben}
      <span class="pfeile"><Symbol name="pfeile" /></span>
    {/if}
  </span>
  {#if !mini}
    <span class="titel">{aufgabe.titel || t('Neue Aufgabe')}</span>
    {#if bisStart !== null}
      <span class="uhrzeit">{inText(bisStart)}</span>
    {:else if aufgabe.uhrzeit}
      <span class="uhrzeit">{t('{zeit} Uhr', { zeit: aufgabe.uhrzeit.replace(/^0/, '') })}</span>
    {/if}
  {/if}
</button>

<style>
  /* Eine Aufgabe als Magnet auf der Tafel */
  .kachel {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--s) * 0.06);
    width: calc(var(--s) * 1.12);
    padding: calc(var(--s) * 0.1) calc(var(--s) * 0.06) calc(var(--s) * 0.08);
    border: none;
    border-radius: calc(var(--s) * 0.2);
    background: var(--tafel);
    box-shadow: 0 calc(var(--s) * 0.04) 0 var(--seg-tief, var(--linie));
    transition: transform 0.15s ease;
    touch-action: manipulation;
  }
  .kachel:active:not(.bearbeiten) {
    transform: scale(0.94);
  }
  .kachel:global(.wackel) {
    animation: wackel 0.45s ease-out;
  }
  @keyframes wackel {
    0% {
      transform: scale(0.94) rotate(0);
    }
    25% {
      transform: scale(1.06) rotate(-4deg);
    }
    50% {
      transform: scale(1.04) rotate(3.5deg);
    }
    75% {
      transform: scale(1.02) rotate(-1.5deg);
    }
    100% {
      transform: scale(1) rotate(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .kachel:global(.wackel) {
      animation: none;
    }
  }
  .kachel.bearbeiten {
    touch-action: none;
    cursor: grab;
  }
  .restzeit {
    position: absolute;
    left: 50%;
    bottom: -4%;
    transform: translateX(-50%);
    padding: 0.05em 0.45em;
    border-radius: 999px;
    background: var(--gruen);
    color: #fff;
    font-family: var(--schrift-titel);
    font-weight: 700;
    font-size: calc(var(--s) * 0.16);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    box-shadow: 0 0 0 2px var(--tafel);
  }
  .restzeit.gelb {
    background: var(--gelb);
    color: #3a2a00;
  }
  .restzeit.rot {
    background: var(--rot);
  }
  .restzeit.pause {
    opacity: 0.75;
  }
  .flaeche {
    position: relative;
    display: block;
    width: calc(var(--s) * 0.72);
    height: calc(var(--s) * 0.72);
  }
  .titel {
    max-width: 100%;
    font-family: var(--schrift-text);
    font-weight: 700;
    font-size: clamp(10px, calc(var(--s) * 0.15), 26px);
    line-height: 1.1;
    text-align: center;
    overflow-wrap: break-word;
    hyphens: auto;
  }
  .uhrzeit {
    padding: 0.1em 0.55em;
    border-radius: 999px;
    background: var(--seg-hell, var(--himmel));
    font-family: var(--schrift-titel);
    font-size: clamp(11px, calc(var(--s) * 0.105), 20px);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  /* jetzt dran: großer Ring in der Abschnittsfarbe */
  .jetzt {
    transform: scale(1.06);
    box-shadow:
      0 calc(var(--s) * 0.04) 0 var(--seg-tief, var(--linie)),
      0 0 0 calc(var(--s) * 0.05) var(--seg, var(--linie));
    z-index: 1;
  }
  .jetzt:focus-visible {
    box-shadow:
      0 0 0 calc(var(--s) * 0.05) var(--seg, var(--linie)),
      0 0 0 9px var(--fokus-hof);
  }

  /* Erledigt: grüne Kachel mit großem grünem Haken */
  .erledigt {
    background: var(--gruen-hell);
    box-shadow:
      0 calc(var(--s) * 0.04) 0 var(--gruen),
      inset 0 0 0 calc(var(--s) * 0.03) var(--gruen);
  }
  .erledigt .flaeche {
    opacity: 0.6;
  }
  .erledigt .titel {
    color: var(--gruen-tief);
  }
  .haken {
    position: absolute;
    top: -8%;
    right: -12%;
    display: grid;
    place-items: center;
    width: 56%;
    height: 56%;
    border-radius: 50%;
    background: var(--gruen);
    color: #ffffff;
    box-shadow: 0 0 0 3px var(--tafel);
    font-size: calc(var(--s) * 0.24);
  }
  .haken :global(svg) {
    width: 70%;
    height: 70%;
    stroke-width: 3.4;
  }

  .kind {
    position: absolute;
    left: -10%;
    top: -10%;
    display: grid;
    place-items: center;
    width: 36%;
    height: 36%;
    border-radius: 50%;
    background: var(--kind);
    color: #ffffff;
    font-family: var(--schrift-titel);
    font-weight: 600;
    font-size: calc(var(--s) * 0.17);
    box-shadow: 0 0 0 2px var(--tafel);
  }
  .termin {
    outline: 3px dotted var(--seg-tief, var(--linie));
    outline-offset: -6px;
  }
  .verschoben {
    transform: scale(1.1) rotate(-3deg);
    box-shadow: 0 10px 22px var(--schatten);
    outline: 4px dashed var(--fokus);
    outline-offset: 4px;
    z-index: 2;
  }
  .pfeile {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--tafel);
    opacity: 0.85;
    color: var(--tinte);
    font-size: calc(var(--s) * 0.5);
  }

  .kachel:focus-visible {
    transform: scale(1.08);
    z-index: 3;
  }

  /* Mini-Kachel für die Wochenansicht: nur Bild */
  .mini {
    width: var(--s);
    padding: calc(var(--s) * 0.1);
    border-radius: calc(var(--s) * 0.24);
    gap: 0;
  }
  .mini .flaeche {
    width: calc(var(--s) * 0.8);
    height: calc(var(--s) * 0.8);
  }
  .mini .haken {
    top: -14%;
    right: -14%;
  }
</style>
