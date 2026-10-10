<script lang="ts">
  // Konfetti-Regen als Belohnung. Wenige Teile und nur CSS-Bewegungen, damit es auch auf dem Chromecast flüssig läuft.
  let { anzahl = 36 }: { anzahl?: number } = $props()

  const FARBEN = ['var(--morgen)', 'var(--vormittag)', 'var(--mittag)', 'var(--nachmittag)', 'var(--abend)', 'var(--gruen)', 'var(--gelb)']
  // svelte-ignore state_referenced_locally
  const teile = Array.from({ length: anzahl }, (_, i) => ({
    farbe: FARBEN[i % FARBEN.length],
    x: Math.round((Math.random() * 2 - 1) * 46),
    y: Math.round(-30 - Math.random() * 40),
    fall: Math.round(70 + Math.random() * 40),
    dreh: Math.round((Math.random() * 2 - 1) * 720),
    verz: Math.round(Math.random() * 250),
    rund: i % 3 === 0,
  }))
</script>

<div class="konfetti" aria-hidden="true">
  {#each teile as t, i (i)}
    <span
      class:rund={t.rund}
      style="--farbe: {t.farbe}; --x: {t.x}vw; --y: {t.y}vh; --fall: {t.fall}vh; --dreh: {t.dreh}deg; animation-delay: {t.verz}ms"
    ></span>
  {/each}
</div>

<style>
  .konfetti {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }
  span {
    position: absolute;
    left: 50%;
    top: 45%;
    width: 14px;
    height: 22px;
    border-radius: 3px;
    background: var(--farbe);
    opacity: 0;
    animation: flug 2.2s cubic-bezier(0.2, 0.6, 0.4, 1) forwards;
  }
  span.rund {
    width: 16px;
    height: 16px;
    border-radius: 50%;
  }
  @keyframes flug {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(0.4) rotate(0);
    }
    35% {
      opacity: 1;
      transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1) rotate(calc(var(--dreh) * 0.4));
    }
    100% {
      opacity: 0;
      transform: translate(calc(-50% + var(--x) * 1.2), calc(-50% + var(--y) + var(--fall))) scale(1) rotate(var(--dreh));
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .konfetti {
      display: none;
    }
  }
</style>
