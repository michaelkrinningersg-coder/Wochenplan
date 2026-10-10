<script lang="ts">
  import Bild from '../komponenten/Bild.svelte'
  import Kachel from '../komponenten/Kachel.svelte'
  import Sonnenbogen from '../komponenten/Sonnenbogen.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import { aufgabeGewaehlt } from '../lib/aktionen'
  import { ABSCHNITTE, tagName } from '../lib/konstanten'
  import { tagesRaster } from '../lib/raster'
  import {
    allesErledigt,
    app,
    istErledigt,
    istHeute,
    jetztUndDanach,
    minutenBisStart,
    neueAufgabe,
    oeffnen,
  } from '../lib/speicher.svelte'
  import type { TagId } from '../lib/typen'
  import { spanneText, tagesPhase } from '../lib/zeit'

  let { tag }: { tag: TagId } = $props()

  let breite = $state(0)
  let hoehe = $state(0)
  let spaltenEl = $state<HTMLElement>()
  /** Lage der Abschnittsspalten (für die Sonne), relativ zum Spaltenbereich */
  let lagen = $state<{ links: number; breite: number }[]>([])

  $effect(() => {
    const el = spaltenEl
    if (!el) return
    const messen = () => {
      const basis = el.getBoundingClientRect()
      lagen = [...el.querySelectorAll<HTMLElement>(':scope > .spalte')].map((sp) => {
        const r = sp.getBoundingClientRect()
        return { links: r.left - basis.left, breite: r.width }
      })
    }
    const ro = new ResizeObserver(messen)
    ro.observe(el)
    el.querySelectorAll(':scope > .spalte').forEach((sp) => ro.observe(sp))
    messen()
    return () => ro.disconnect()
  })

  const heute = $derived(istHeute(tag))
  const phase = $derived(tagesPhase(app.plan, new Date(app.jetzt)))
  const jd = $derived(jetztUndDanach(tag))
  const schmal = $derived(breite > 0 && breite < 640)
  const tagLeer = $derived(ABSCHNITTE.every((a) => app.plan.woche[tag][a.id].length === 0))

  // Platz für Kacheln: Gesamthöhe minus Spaltenkopf und Innenabstände
  const KOPF = 84
  const INNEN = 10
  const raster = $derived(
    tagesRaster(
      ABSCHNITTE.map((a) => app.plan.woche[tag][a.id].length + (app.bearbeiten ? 1 : 0)),
      breite,
      Math.max(80, hoehe - KOPF - 2 * INNEN),
      12,
      10,
      INNEN,
      118,
    ),
  )
  const s = $derived(schmal ? 92 : raster.s)

  function aktiverAbschnitt(id: string): boolean {
    return heute && phase.art === 'abschnitt' && phase.id === id
  }
</script>

<div class="tagesansicht" class:schmal>
  {#if heute && !schmal}
    <Sonnenbogen {phase} {lagen} {breite} />
  {/if}

  {#if tagLeer && !app.bearbeiten}
    <div class="leer-hinweis">
      <h2>Für {tagName(tag)} ist noch nichts geplant.</h2>
      <p>Zum Planen den Stift oben rechts gedrückt halten.</p>
    </div>
  {:else}
    <div class="spalten" bind:this={spaltenEl} bind:clientWidth={breite} bind:clientHeight={hoehe}>
      {#each ABSCHNITTE as ab, i (ab.id)}
        {@const liste = app.plan.woche[tag][ab.id]}
        <section
          class="spalte"
          class:aktiv={aktiverAbschnitt(ab.id)}
          data-seg={ab.id}
          style={schmal ? '' : `flex: 1 1 ${raster.breiten[i]}px`}
        >
          <button
            class="kopf"
            data-fokus-id={'abschnitt:' + ab.id}
            onclick={() => oeffnen({ art: 'abschnitt', tag, abschnitt: ab.id })}
          >
            <span class="kopf-bild"><Bild id={ab.bild} /></span>
            {#if allesErledigt(tag, ab.id)}
              <span class="kopf-haken" aria-label="alles erledigt"><Symbol name="haken" /></span>
            {/if}
            <span class="kopf-text">
              <span class="kopf-name">{ab.name}</span>
              <span class="kopf-zeit">{spanneText(app.plan, ab.id)}</span>
            </span>
          </button>
          <div
            class="kacheln"
            data-zone
            data-tag={tag}
            data-abschnitt={ab.id}
            style={schmal ? '' : `grid-template-columns: repeat(${raster.spalten[i]}, auto)`}
          >
            {#each liste as aufgabe (aufgabe.id)}
              <Kachel
                {aufgabe}
                {tag}
                groesse={s}
                status={jd.jetzt === aufgabe.id ? 'jetzt' : jd.danach === aufgabe.id ? 'danach' : ''}
                autofokus={jd.jetzt === aufgabe.id}
                erledigt={heute && istErledigt(aufgabe.id)}
                bisStart={minutenBisStart(tag, aufgabe)}
                onwahl={(e) => aufgabeGewaehlt(e, tag, ab.id, aufgabe)}
              />
            {/each}
            {#if app.bearbeiten}
              <button class="neu" style="--s: {s}px" onclick={() => neueAufgabe(tag, ab.id)} aria-label="Aufgabe hinzufügen: {ab.name}">
                <Symbol name="plus" />
              </button>
            {/if}
          </div>
        </section>
      {/each}
    </div>
  {/if}
</div>

<style>
  .tagesansicht {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }
  .spalten {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 10px;
  }
  .spalte {
    display: flex;
    flex-direction: column;
    min-width: 0;
    border-radius: 26px;
    background: var(--seg-hell);
    overflow: hidden;
  }
  .spalte.aktiv {
    box-shadow: inset 0 0 0 4px var(--seg);
  }
  .kopf {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    height: 84px;
    padding: 6px 6px 8px;
    border: none;
    border-radius: 26px 26px 0 0;
    background: var(--seg);
    color: var(--tinte-auf-farbe);
    text-align: center;
    flex: none;
  }
  .kopf:focus-visible {
    outline-offset: -6px;
    box-shadow: none;
  }
  .kopf {
    position: relative;
  }
  .kopf-haken {
    position: absolute;
    top: 6px;
    right: 8px;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--gruen);
    color: #ffffff;
  }
  .kopf-haken :global(svg) {
    width: 18px;
    height: 18px;
    stroke-width: 3.4;
  }
  .kopf-bild {
    width: 30px;
    height: 30px;
    flex: none;
  }
  .kopf-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
    max-width: 100%;
  }
  .kopf-name {
    font-family: var(--schrift-titel);
    font-weight: 600;
    font-size: var(--t-text);
    line-height: 1.05;
    white-space: nowrap;
  }
  .kopf-zeit {
    font-size: var(--t-klein);
    font-variant-numeric: tabular-nums;
    opacity: 0.8;
  }
  .kacheln {
    flex: 1;
    min-height: 0;
    display: grid;
    align-content: start;
    justify-content: center;
    gap: 12px;
    padding: 10px;
    overflow: hidden;
  }
  .kacheln:global(.ablage-aktiv) {
    background: var(--seg);
    background-clip: content-box;
    box-shadow: inset 0 0 0 3px var(--seg-tief);
    border-radius: 0 0 26px 26px;
  }
  .neu {
    display: grid;
    place-items: center;
    width: calc(var(--s) * 1.12);
    height: calc(var(--s) * 1.1);
    border: 3px dashed var(--seg-tief);
    border-radius: calc(var(--s) * 0.2);
    background: transparent;
    color: var(--seg-tief);
    font-size: calc(var(--s) * 0.4);
  }

  .leer-hinweis {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    text-align: center;
    padding: var(--rand);
  }
  .leer-hinweis h2 {
    font-size: var(--t-titel);
  }
  .leer-hinweis p {
    margin: 0;
    color: var(--tinte-leise);
  }

  /* Handy hochkant: Abschnitte untereinander */
  .schmal .spalten {
    flex-direction: column;
  }
  .schmal .spalte {
    flex: none;
  }
  .schmal .kopf {
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;
    height: 58px;
    padding: 0 14px;
  }
  .schmal .kopf-text {
    align-items: flex-start;
  }
  .schmal .kacheln {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
</style>
