<script lang="ts">
  // Laufende Timer bleiben sichtbar, auch in Wochen-, Tages- oder Kalenderansicht:
  // eine runde Plakette unten rechts mit Bild, Restzeit und Ampelfarbe. Antippen öffnet die Aufgabe.
  import { ampelZustand } from '../lib/ampel'
  import { app, finde, istErledigt, oeffnen } from '../lib/speicher.svelte'
  import { dauerText, heuteTag } from '../lib/zeit'
  import Bild from './Bild.svelte'

  const liste = $derived.by(() => {
    const tag = heuteTag(new Date(app.jetzt))
    const offen = app.ansicht.art === 'aufgabe' ? app.ansicht.id : null
    return Object.entries(app.timer)
      .filter(([id, t]) => id !== offen && (t.gestartet !== null || t.vergangenMs > 0))
      .map(([id, t]) => {
        const f = finde(tag, id)
        if (!f || istErledigt(f.aufgabe)) return null
        const rest = t.dauerMs - (t.vergangenMs + (t.gestartet !== null ? app.jetzt - t.gestartet : 0))
        return { id, f, rest, dauer: t.dauerMs, laeuft: t.gestartet !== null }
      })
      .filter((x): x is NonNullable<typeof x> => !!x)
  })

  const FARBE = { gruen: 'var(--gruen)', gelb: 'var(--gelb)', rot: 'var(--rot)', aus: 'var(--linie)' }
  const UMFANG = 2 * Math.PI * 46
</script>

{#if liste.length && !app.dialog}
  <div class="laufend" role="status" aria-live="off">
    {#each liste as l (l.id)}
      {@const zustand = ampelZustand(l.rest, l.dauer)}
      <button
        class="plakette"
        class:vorbei={l.rest <= 0}
        class:pause={!l.laeuft}
        style="--farbe: {FARBE[zustand]}"
        onclick={() => oeffnen({ art: 'aufgabe', tag: heuteTag(), abschnitt: l.f.abschnitt, id: l.id })}
        aria-label="{l.f.aufgabe.titel}: {l.rest > 0 ? 'noch ' + dauerText(l.rest) : 'Zeit ist um'}{l.laeuft ? '' : ', pausiert'}"
      >
        <span class="ring">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="46" class="spur" />
            <circle
              cx="50"
              cy="50"
              r="46"
              class="rest"
              stroke-dasharray={UMFANG}
              stroke-dashoffset={UMFANG * (1 - Math.max(0, Math.min(1, l.rest / l.dauer)))}
            />
          </svg>
          <span class="bild"><Bild id={l.f.aufgabe.bild} /></span>
        </span>
        <span class="zeit">{l.rest > 0 ? dauerText(l.rest) : 'Zeit!'}{l.laeuft ? '' : ' ⏸'}</span>
      </button>
    {/each}
  </div>
{/if}

<style>
  .laufend {
    position: fixed;
    right: 14px;
    bottom: 14px;
    z-index: 30;
    display: flex;
    gap: 10px;
  }
  .plakette {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 16px 6px 6px;
    border: 3px solid var(--farbe);
    border-radius: 999px;
    background: var(--tafel);
    color: var(--tinte);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  }
  .plakette.vorbei {
    animation: pulsieren 1s ease-in-out infinite alternate;
  }
  .plakette.pause {
    opacity: 0.85;
  }
  .ring {
    position: relative;
    width: 64px;
    height: 64px;
  }
  .ring svg {
    position: absolute;
    inset: 0;
    transform: rotate(-90deg);
  }
  .spur {
    fill: none;
    stroke: var(--linie);
    stroke-width: 8;
  }
  .rest {
    fill: none;
    stroke: var(--farbe);
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 1s linear;
  }
  .bild {
    position: absolute;
    inset: 13px;
  }
  .zeit {
    font-family: var(--schrift-titel);
    font-weight: 700;
    font-size: clamp(22px, 3.2vh, 34px);
    font-variant-numeric: tabular-nums;
  }
  @keyframes pulsieren {
    to {
      transform: scale(1.06);
    }
  }
</style>
