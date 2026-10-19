<script lang="ts">
  // Jahreszeiten-Szene: bewegte, gemalte Landschaft (Landschaft.svelte), Tageslauf, Wetter, Figuren und Ereignisse.
  import type { Jahreszeit, Orte } from '../lib/jahreszeit'
  import Figuren from './Figuren.svelte'
  import SzenenEreignisse from './SzenenEreignisse.svelte'
  import Landschaft from './Landschaft.svelte'
  import { ausschnitt, prozent } from '../lib/szene.svelte'
  import { onDestroy } from 'svelte'

  import type { WetterArt } from '../lib/wetter.svelte'

  let { jz, nacht = false, wetterArt = null }: { jz: Jahreszeit; nacht?: boolean; wetterArt?: WetterArt | null } = $props()

  let breite = $state(1600)
  let hoehe = $state(900)
  const aus = $derived(ausschnitt(breite, hoehe))
  // Lage von Baum, Haus und Boden auf dem Bildschirm (Bild 1600×900, Werte in % für Figuren und Ereignisse)
  const orte = $derived.by((): Orte => {
    const q = (x: number, y: number) => prozent(aus, breite, hoehe, x, y)
    const dx = aus.hoch ? aus.x0 + aus.w - 175 - 1120 : 0
    return {
      krone: q(380, 385),
      stamm: q(382, 560),
      dach: [q(1104 + dx, 571), q(1190 + dx, 501), q(1276 + dx, 571)],
      // oberhalb der drei Karten
      boden: [q(0, 650).y, q(0, 672).y],
    }
  })
  // ---------- Tageslauf: Himmel, Sonne und Mond folgen der Uhrzeit ----------
  let jetzt = $state(new Date())
  const uhr = setInterval(() => (jetzt = new Date()), 30_000)
  onDestroy(() => clearInterval(uhr))
  const stunde = $derived(jetzt.getHours() + jetzt.getMinutes() / 60)
  const klemme = (v: number) => Math.max(0, Math.min(1, v))
  /** 0 = Tag, 1 = tiefe Nacht (Übergang 19–20 Uhr und 5–6 Uhr) */
  const dunkel = $derived(stunde >= 12 ? klemme(stunde - 19) : klemme(6 - stunde))
  /** Morgen-/Abendrot (6–8 und 17–19 Uhr) */
  const daemm = $derived(stunde < 12 ? klemme(1 - (stunde - 6) / 2) * klemme(stunde - 5) : klemme((stunde - 17) / 2) * klemme(20 - stunde))
  const istNacht = $derived(dunkel > 0.5)
  // Regenschauer ab und zu, wenn kein echtes Wetter vorliegt (nicht im Winter: dort schneit es)
  let schauer = $state(false)
  $effect(() => {
    if (wetterArt || jz === 'winter') {
      schauer = false
      return
    }
    let timer: ReturnType<typeof setTimeout>
    const weiter = (regnet: boolean) => {
      const dauer = regnet ? 45_000 + Math.random() * 60_000 : 4 * 60_000 + Math.random() * 8 * 60_000
      timer = setTimeout(() => {
        schauer = !regnet
        weiter(!regnet)
      }, dauer)
    }
    weiter(false)
    return () => clearTimeout(timer)
  })
  const art = $derived<WetterArt | null>(wetterArt ?? (schauer ? 'regen' : null))

</script>

<div class="szene" bind:clientWidth={breite} bind:clientHeight={hoehe}>
  {#key jz}
    <Landschaft {jz} {stunde} {dunkel} {daemm} {art} {aus} />
  {/key}

  <Figuren {jz} {orte} nacht={istNacht} regen={art === 'regen' || art === 'gewitter'} />
  <SzenenEreignisse {jz} {orte} />

  {#if art === 'wolkig' || art === 'regen' || art === 'gewitter' || art === 'schnee'}
    <div class="wetter-wolken" class:dunkel={art === 'gewitter'}>
      {#each [8, 30, 55, 78] as x, i (i)}<span style="left: {x}%; top: {4 + (i % 2) * 7}%; animation-delay: {-i * 9}s"></span>{/each}
    </div>
  {/if}
  {#if art === 'regen' || art === 'gewitter'}
    <div class="pfuetzen" style="top: {orte.boden[1] + 1}%">{#each [18, 34, 52, 71, 86] as x, i (i)}<span style="left: {x}%; animation-delay: {-i * 0.4}s"></span>{/each}</div>
    <div class="wetter-regen">{#each Array.from({ length: 60 }) as _, i (i)}<span style="left: {(i * 37) % 100}%; animation-delay: {((i * 13) % 10) / 10}s"></span>{/each}</div>
  {/if}
  {#if art === 'gewitter'}<div class="blitz"></div>{/if}
  {#if art === 'schnee' && jz !== 'winter'}
    <div class="wetter-schnee">{#each Array.from({ length: 40 }) as _, i (i)}<span style="left: {(i * 29) % 100}%; animation-delay: {-((i * 7) % 12)}s"></span>{/each}</div>
  {/if}
  {#if art === 'nebel'}
    <div class="wetter-nebel">{#each [30, 52, 70] as y, i (i)}<span style="top: {y}%; animation-delay: {-i * 12}s"></span>{/each}</div>
  {/if}

</div>

<style>
  .szene {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  .wetter-wolken,
  .wetter-regen,
  .wetter-schnee,
  .wetter-nebel,
  .blitz {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .wetter-wolken span {
    position: absolute;
    width: 26vw;
    height: 9vw;
    border-radius: 999px;
    background: radial-gradient(ellipse at 40% 40%, #ffffff, #d5dce6 70%);
    opacity: 0.9;
    animation: treiben 40s linear infinite alternate;
  }
  .wetter-wolken.dunkel span {
    background: radial-gradient(ellipse at 40% 40%, #8e98a8, #59647a 70%);
  }
  .wetter-regen span {
    position: absolute;
    top: -10%;
    width: 2px;
    height: 24px;
    background: rgba(60, 100, 170, 0.5);
    animation: regen 0.8s linear infinite;
  }
  .wetter-schnee span {
    position: absolute;
    top: -5%;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #fff;
    animation: schnee 12s linear infinite;
  }
  .wetter-nebel span {
    position: absolute;
    left: -30%;
    width: 160%;
    height: 14%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.45);
    filter: blur(14px);
    animation: nebel 36s ease-in-out infinite alternate;
  }
  .blitz {
    background: #fff;
    opacity: 0;
    animation: blitz 9s infinite;
  }
  @keyframes treiben {
    to {
      translate: 8vw 0;
    }
  }
  @keyframes regen {
    to {
      top: 105%;
    }
  }
  @keyframes schnee {
    to {
      top: 105%;
      translate: -40px 0;
    }
  }
  @keyframes nebel {
    to {
      translate: 20% 0;
    }
  }
  @keyframes blitz {
    0%,
    90%,
    94%,
    100% {
      opacity: 0;
    }
    91%,
    93% {
      opacity: 0.7;
    }
  }
  .pfuetzen {
    position: absolute;
    left: 0;
    right: 0;
    height: 0;
    pointer-events: none;
  }
  .pfuetzen span {
    position: absolute;
    width: 9vw;
    height: 1.6vh;
    translate: -50% 0;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(120, 165, 215, 0.55), rgba(120, 165, 215, 0.15) 70%, transparent);
    animation: pfuetze 2.4s ease-in-out infinite alternate;
  }
  @keyframes pfuetze {
    from {
      scale: 0.85 1;
      opacity: 0.6;
    }
    to {
      scale: 1.05 1;
      opacity: 1;
    }
  }
</style>
