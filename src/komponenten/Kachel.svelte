<script lang="ts">
  import { app, verschiebeAufgabe } from '../lib/speicher.svelte'
  import type { Aufgabe, TagId } from '../lib/typen'
  import { inText } from '../lib/zeit'
  import { ziehbar } from '../lib/ziehen'
  import Bild from './Bild.svelte'
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
</script>

<button
  class="kachel"
  class:mini
  class:jetzt={status === 'jetzt'}
  class:danach={status === 'danach'}
  class:erledigt
  class:bearbeiten
  class:verschoben
  style="--s: {groesse}px"
  data-aufgabe-id={aufgabe.id}
  data-fokus-id={'aufgabe:' + aufgabe.id}
  data-autofokus={autofokus ? true : undefined}
  aria-label={aufgabe.titel + (erledigt ? ', erledigt' : '') + (status === 'jetzt' ? ', jetzt dran' : '')}
  title={mini ? aufgabe.titel : undefined}
  onclick={onwahl}
  use:ziehbar={{
    id: aufgabe.id,
    tag,
    aktiv: bearbeiten,
    ablegen: (zielTag, zielAbschnitt, index) => verschiebeAufgabe(tag, aufgabe.id, zielTag, zielAbschnitt, index),
  }}
>
  <span class="flaeche">
    <Bild id={aufgabe.bild} zusatz={aufgabe.zusatz} />
    {#if erledigt}
      <span class="haken"><Symbol name="haken" /></span>
    {/if}
    {#if verschoben}
      <span class="pfeile"><Symbol name="pfeile" /></span>
    {/if}
  </span>
  {#if !mini}
    <span class="titel">{aufgabe.titel || 'Neue Aufgabe'}</span>
    {#if bisStart !== null}
      <span class="uhrzeit">{inText(bisStart)}</span>
    {:else if aufgabe.uhrzeit}
      <span class="uhrzeit">{aufgabe.uhrzeit.replace(/^0/, '')} Uhr</span>
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
  .kachel.bearbeiten {
    touch-action: none;
    cursor: grab;
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
    font-size: clamp(12px, calc(var(--s) * 0.13), 26px);
    line-height: 1.1;
    text-align: center;
    overflow-wrap: anywhere;
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

  .erledigt .flaeche {
    opacity: 0.45;
    filter: grayscale(0.85);
  }
  .erledigt .titel {
    color: var(--tinte-leise);
  }
  .haken {
    position: absolute;
    top: -8%;
    right: -12%;
    display: grid;
    place-items: center;
    width: 46%;
    height: 46%;
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
