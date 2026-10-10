<script lang="ts">
  // Live-Modus / Ruhebild: nach Inaktivität. Läuft gerade eine Aufgabe mit fester Zeit (von–bis), wird sie groß gezeigt,
  // sonst die Jahreszeit (Datum, Uhr, drei typische Dinge im Wechsel) oder eigene Fotos als Diashow.
  import { onMount } from 'svelte'
  import { dreiDinge, jahreszeit, JAHRESZEIT_NAME, TYPISCH } from '../lib/jahreszeit'
  import { app, istErledigt, tagesListe } from '../lib/speicher.svelte'
  import { ruhe } from '../lib/ruhebilder.svelte'
  import { heuteTag, minutenVon } from '../lib/zeit'
  import AnalogUhr from './AnalogUhr.svelte'
  import AufgabenBild from './AufgabenBild.svelte'
  import JahreszeitSzene from './JahreszeitSzene.svelte'

  let { onwecken }: { onwecken: () => void } = $props()

  const jetzt = $derived(new Date(app.jetzt))
  const jz = $derived(jahreszeit(jetzt))
  const nacht = $derived(jetzt.getHours() >= 19 || jetzt.getHours() < 6)
  const hh = $derived(String(jetzt.getHours()).padStart(2, '0'))
  const mm = $derived(String(jetzt.getMinutes()).padStart(2, '0'))
  const datum = $derived(jetzt.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

  /** Aufgabe, deren feste Zeit gerade läuft */
  const live = $derived.by(() => {
    const min = jetzt.getHours() * 60 + jetzt.getMinutes() + jetzt.getSeconds() / 60
    for (const { aufgabe } of tagesListe(heuteTag(jetzt))) {
      if (!aufgabe.uhrzeit) continue
      const von = minutenVon(aufgabe.uhrzeit)
      const bis = aufgabe.bis ? minutenVon(aufgabe.bis) : von + (aufgabe.minuten > 0 ? aufgabe.minuten : 15)
      if (min >= von && min < bis && !istErledigt(aufgabe)) return { aufgabe, von, bis, rest: Math.ceil(bis - min) }
    }
    return null
  })

  // Drei typische Dinge: bei jedem Erscheinen eine neue Auswahl, dann alle 8 Sekunden weiter
  const KEY = 'wochenplan.ruhe-dinge'
  let start = $state(0)
  onMount(() => {
    try {
      start = (Number(localStorage.getItem(KEY) ?? 0) + 3) % TYPISCH[jahreszeit()].length
      localStorage.setItem(KEY, String(start))
    } catch {
      /* egal */
    }
    const id = setInterval(() => (start = (start + 1) % TYPISCH[jahreszeit()].length), 8000)
    return () => clearInterval(id)
  })
  const dinge = $derived(dreiDinge(jz, start))

  // Eigene Fotos
  const fotos = $derived((app.plan.ruhebilder ?? []).map((id) => ruhe.bilder[id]).filter(Boolean))
  const mitFotos = $derived((app.einst.ruheArt ?? 'jahreszeit') === 'fotos' && fotos.length > 0)
  let fotoNr = $state(Math.floor(Math.random() * 1000))
  $effect(() => {
    if (!mitFotos) return
    const id = setInterval(() => fotoNr++, Math.max(5, app.einst.ruheWechsel ?? 20) * 1000)
    return () => clearInterval(id)
  })
  const analog = $derived(app.einst.uhrArt === 'analog')
  const uhrZiel = (b: string) => b.replace(/^0/, '')
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="ruhe" role="button" tabindex="-1" aria-label="Ruhebild – antippen zum Zurückkehren" onclick={onwecken}>
  {#if live}
    <div class="live" data-seg="vormittag">
      <div class="live-bild"><AufgabenBild aufgabe={live.aufgabe} /></div>
      <div class="live-text">
        <span class="live-jetzt">Jetzt</span>
        <span class="live-titel">{live.aufgabe.titel}</span>
        <span class="live-zeit">
          {live.aufgabe.bis ? `${uhrZiel(live.aufgabe.uhrzeit!)} – ${uhrZiel(live.aufgabe.bis)} Uhr` : `ab ${uhrZiel(live.aufgabe.uhrzeit!)} Uhr`} · noch {live.rest} Min
        </span>
        <span class="live-uhr">{hh}:{mm}</span>
      </div>
    </div>
  {:else if mitFotos}
    {#key fotoNr}
      <img class="foto" src={fotos[fotoNr % fotos.length]} alt="" />
    {/key}
    <div class="ecke">
      <span class="ecke-jz">{JAHRESZEIT_NAME[jz]}</span>
      <span class="ecke-uhr">{hh}:{mm}</span>
      <span class="ecke-datum">{datum}</span>
    </div>
  {:else}
    <JahreszeitSzene {jz} {nacht} />
    <div class="inhalt">
      <div class="kopf">
        <div class="datum-block">
          <span class="jz">{JAHRESZEIT_NAME[jz]}</span>
          <span class="datum">{datum}</span>
        </div>
        {#if analog}
          <AnalogUhr zeit={jetzt} groesse={170} />
        {:else}
          <span class="uhr">{hh}:{mm}</span>
        {/if}
      </div>
      <div class="dinge">
        {#each dinge as d (d.t)}
          <div class="ding">
            <span class="emoji">{d.e}</span>
            {#if app.einst.ruheNamen}<span class="ding-text">{d.t}</span>{/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .ruhe {
    position: fixed;
    inset: 0;
    z-index: 90;
    overflow: hidden;
    background: #13204a;
    cursor: none;
    outline: none;
  }
  .inhalt {
    position: absolute;
    inset: 0;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 4vh 4vw 5vh;
  }
  .kopf {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 3vw;
  }
  .datum-block {
    display: flex;
    flex-direction: column;
    padding: 0.5em 0.9em;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.82);
    color: #1f2a44;
  }
  .jz {
    font-family: var(--schrift-titel);
    font-weight: 700;
    font-size: clamp(30px, 7vh, 80px);
    line-height: 1.05;
  }
  .datum {
    font-size: clamp(18px, 3.6vh, 40px);
  }
  .uhr {
    padding: 0.18em 0.45em 0.12em;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.82);
    color: #1f2a44;
    font-family: var(--schrift-titel);
    font-weight: 700;
    font-size: clamp(40px, 11vh, 130px);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .dinge {
    display: flex;
    justify-content: center;
    gap: 3vw;
  }
  .ding {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: clamp(120px, 22vw, 300px);
    padding: 2.4vh 1.2vw;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.88);
    color: #1f2a44;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    animation: auftauchen 0.8s ease-out both;
  }
  .ding:nth-child(2) {
    animation-delay: 0.15s;
  }
  .ding:nth-child(3) {
    animation-delay: 0.3s;
  }
  .emoji {
    font-size: clamp(48px, 13vh, 150px);
    line-height: 1.1;
  }
  .ding-text {
    font-family: var(--schrift-titel);
    font-weight: 600;
    font-size: clamp(16px, 3.4vh, 36px);
    text-align: center;
  }
  .foto {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation:
      einblenden 1.5s ease-out,
      zoom 30s linear forwards;
  }
  .ecke {
    position: absolute;
    right: 3vw;
    bottom: 4vh;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 0.6em 1em;
    border-radius: 20px;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
  }
  .ecke-uhr {
    font-family: var(--schrift-titel);
    font-weight: 700;
    font-size: clamp(32px, 8vh, 90px);
    line-height: 1;
  }
  .ecke-jz {
    font-family: var(--schrift-titel);
    font-weight: 700;
    font-size: clamp(18px, 3.4vh, 38px);
  }
  .ecke-datum {
    font-size: clamp(14px, 2.6vh, 28px);
  }
  .live {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5vw;
    padding: 5vh 5vw;
    background: var(--himmel, #e6f2fb);
    color: var(--tinte, #1f2a44);
  }
  .live-bild {
    width: min(42vw, 72vh);
    height: min(42vw, 72vh);
  }
  .live-text {
    display: flex;
    flex-direction: column;
    gap: 1.2vh;
  }
  .live-jetzt {
    font-size: clamp(18px, 4vh, 44px);
    color: var(--tinte-leise, #5a6680);
  }
  .live-titel {
    font-family: var(--schrift-titel);
    font-weight: 700;
    font-size: clamp(36px, 10vh, 120px);
    line-height: 1;
  }
  .live-zeit {
    font-size: clamp(18px, 4vh, 44px);
  }
  .live-uhr {
    margin-top: 2vh;
    font-family: var(--schrift-titel);
    font-weight: 700;
    font-size: clamp(30px, 7vh, 80px);
    font-variant-numeric: tabular-nums;
  }
  /* hochkant (Handy, Tablet hochkant): Kopf untereinander, Bilder größer */
  @media (orientation: portrait) {
    .inhalt {
      padding: 3vh 4vw 4vh;
    }
    .kopf {
      flex-direction: column;
      align-items: center;
      gap: 1.6vh;
    }
    .datum-block {
      align-items: center;
      text-align: center;
    }
    .jz {
      font-size: clamp(30px, 11vw, 72px);
    }
    .datum {
      font-size: clamp(16px, 4.6vw, 34px);
    }
    .uhr {
      font-size: clamp(44px, 17vw, 120px);
    }
    .dinge {
      gap: 3vw;
    }
    .ding {
      width: 29vw;
      padding: 1.6vh 1vw;
      border-radius: 20px;
    }
    .emoji {
      font-size: 16vw;
    }
    .ding-text {
      font-size: clamp(13px, 3.6vw, 26px);
    }
    .live {
      flex-direction: column;
      text-align: center;
    }
    .live-bild {
      width: 70vw;
      height: 70vw;
    }
    .live-text {
      align-items: center;
    }
  }
  @keyframes auftauchen {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
  }
  @keyframes einblenden {
    from {
      opacity: 0;
    }
  }
  @keyframes zoom {
    to {
      transform: scale(1.08);
    }
  }
</style>
