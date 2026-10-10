<script lang="ts">
  import Bild from '../komponenten/Bild.svelte'
  import Kachel from '../komponenten/Kachel.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import { aufgabeGewaehlt } from '../lib/aktionen'
  import { ABSCHNITTE } from '../lib/konstanten'
  import { flaechenRaster } from '../lib/raster'
  import {
    app,
    aufgabenIn,
    istErledigt,
    istHeute,
    jetztUndDanach,
    minutenBisStart,
    neueAufgabe,
    oeffnen,
  } from '../lib/speicher.svelte'
  import type { AbschnittId, TagId } from '../lib/typen'

  let { tag, abschnitt }: { tag: TagId; abschnitt: AbschnittId } = $props()

  let breite = $state(0)
  let hoehe = $state(0)

  const index = $derived(ABSCHNITTE.findIndex((a) => a.id === abschnitt))
  const vorher = $derived(ABSCHNITTE[index - 1])
  const nachher = $derived(ABSCHNITTE[index + 1])
  const liste = $derived(aufgabenIn(tag, abschnitt))
  const heute = $derived(istHeute(tag))
  const jd = $derived(jetztUndDanach(tag))
  const anzahl = $derived(liste.length + (app.bearbeiten ? 1 : 0))
  const raster = $derived(flaechenRaster(anzahl, breite - 24, hoehe - 24, 22, 280))
  /** Fokus beim Öffnen: die Jetzt-Aufgabe, sonst die erste offene, sonst die erste */
  const fokusId = $derived(
    liste.find((x) => x.id === jd.jetzt)?.id ??
      liste.find((x) => !(heute && istErledigt(x)))?.id ??
      liste[0]?.id,
  )
</script>

<div class="abschnitt" data-seg={abschnitt}>
  {#if vorher}
    <button
      class="nachbar links"
      data-seg={vorher.id}
      onclick={() => oeffnen({ art: 'abschnitt', tag, abschnitt: vorher.id })}
      aria-label="Zurück zu {vorher.name}"
    >
      <span class="nachbar-bild"><Bild id={vorher.bild} /></span>
      <Symbol name="zurueck" />
    </button>
  {:else}
    <span class="nachbar-platz"></span>
  {/if}

  <div class="flaeche" bind:clientWidth={breite} bind:clientHeight={hoehe}>
    {#if liste.length === 0 && !app.bearbeiten}
      <p class="leer">Hier ist nichts geplant.</p>
    {:else}
      <div
        class="kacheln"
        data-zone
        data-tag={tag}
        data-abschnitt={abschnitt}
        style="grid-template-columns: repeat({raster.spalten}, auto)"
      >
        {#each liste as aufgabe (aufgabe.id)}
          <Kachel
            {aufgabe}
            {tag}
            groesse={raster.s}
            status={jd.jetzt === aufgabe.id ? 'jetzt' : jd.danach === aufgabe.id ? 'danach' : ''}
            autofokus={fokusId === aufgabe.id}
            erledigt={heute && istErledigt(aufgabe)}
            bisStart={minutenBisStart(tag, aufgabe)}
            onwahl={(e) => aufgabeGewaehlt(e, tag, abschnitt, aufgabe)}
          />
        {/each}
        {#if app.bearbeiten}
          <button class="neu" style="--s: {raster.s}px" onclick={() => neueAufgabe(tag, abschnitt)} aria-label="Aufgabe hinzufügen">
            <Symbol name="plus" />
          </button>
        {/if}
      </div>
    {/if}
  </div>

  {#if nachher}
    <button
      class="nachbar rechts"
      data-seg={nachher.id}
      onclick={() => oeffnen({ art: 'abschnitt', tag, abschnitt: nachher.id })}
      aria-label="Weiter zu {nachher.name}"
    >
      <span class="nachbar-bild"><Bild id={nachher.bild} /></span>
      <Symbol name="weiter" />
    </button>
  {:else}
    <span class="nachbar-platz"></span>
  {/if}
</div>

<style>
  .abschnitt {
    display: flex;
    align-items: stretch;
    gap: 12px;
    height: 100%;
    min-height: 0;
  }
  .flaeche {
    flex: 1;
    min-width: 0;
    display: grid;
    place-items: center;
    border-radius: 32px;
    background: var(--seg-hell);
    box-shadow: inset 0 0 0 4px var(--seg);
    overflow: hidden;
  }
  .kacheln {
    display: grid;
    gap: 22px;
    justify-content: center;
    align-content: center;
    padding: 12px;
  }
  .kacheln:global(.ablage-aktiv) {
    outline: 3px dashed var(--seg-tief);
    outline-offset: 4px;
    border-radius: 20px;
  }
  .neu {
    display: grid;
    place-items: center;
    width: calc(var(--s) * 1.12);
    height: calc(var(--s) * 1.2);
    border: 4px dashed var(--seg-tief);
    border-radius: calc(var(--s) * 0.2);
    background: transparent;
    color: var(--seg-tief);
    font-size: calc(var(--s) * 0.35);
  }
  .leer {
    font-size: var(--t-gross);
    color: var(--tinte-leise);
  }
  .nachbar {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: clamp(52px, 7vw, 92px);
    border: none;
    border-radius: 24px;
    background: var(--seg-hell);
    color: var(--tinte);
    font-size: var(--t-gross);
    flex: none;
  }
  .nachbar-bild {
    width: 70%;
    aspect-ratio: 1;
  }
  .nachbar-platz {
    width: clamp(52px, 7vw, 92px);
    flex: none;
  }
  @media (max-width: 640px) {
    .abschnitt {
      flex-direction: column;
    }
    .nachbar,
    .nachbar-platz {
      width: 100%;
      flex-direction: row;
      padding: 8px;
    }
    .nachbar-platz {
      display: none;
    }
    .nachbar-bild {
      width: 36px;
    }
    .flaeche {
      min-height: 60vh;
    }
  }
</style>
