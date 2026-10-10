<script lang="ts">
  // Sterne flattern vom oberen Bildrand herunter (leichtes Pendeln, Drehen). Nur CSS – läuft auch auf dem Chromecast flüssig.
  import { ICON_URL } from '../lib/bilder'

  let { anzahl = 22 }: { anzahl?: number } = $props()

  const BILDER = ['stern', '_leuchtstern']
  // svelte-ignore state_referenced_locally
  const sterne = Array.from({ length: anzahl }, (_, i) => ({
    bild: ICON_URL[BILDER[i % BILDER.length]] ?? ICON_URL['stern'],
    x: Math.round(Math.random() * 96),
    groesse: Math.round(28 + Math.random() * 38),
    dauer: (2.6 + Math.random() * 1.8).toFixed(2),
    verz: Math.round(Math.random() * 1400),
    pendel: Math.round(18 + Math.random() * 40),
    dreh: Math.round((Math.random() * 2 - 1) * 260),
  }))
</script>

<div class="regen" aria-hidden="true">
  {#each sterne as s, i (i)}
    <span
      class="bahn"
      style="left: {s.x}%; --dauer: {s.dauer}s; animation-delay: {s.verz}ms"
    >
      <img
        src={s.bild}
        alt=""
        style="width: {s.groesse}px; --pendel: {s.pendel}px; --dreh: {s.dreh}deg; animation-delay: {s.verz}ms; --dauer: {s.dauer}s"
      />
    </span>
  {/each}
</div>

<style>
  .regen {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .bahn {
    position: absolute;
    top: 0;
    opacity: 0;
    animation: fallen var(--dauer) linear forwards;
  }
  .bahn img {
    display: block;
    animation: flattern 0.9s ease-in-out infinite alternate;
    filter: drop-shadow(0 0 6px rgba(255, 210, 60, 0.8));
  }
  @keyframes fallen {
    0% {
      opacity: 0;
      transform: translateY(-15vh);
    }
    8% {
      opacity: 1;
    }
    85% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(105vh);
    }
  }
  @keyframes flattern {
    from {
      transform: translateX(calc(var(--pendel) * -1)) rotate(calc(var(--dreh) * -0.3));
    }
    to {
      transform: translateX(var(--pendel)) rotate(var(--dreh));
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .bahn img {
      animation: none;
    }
  }
</style>
