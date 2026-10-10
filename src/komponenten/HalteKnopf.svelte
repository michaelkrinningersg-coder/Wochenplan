<script lang="ts">
  // Knopf, der nur reagiert, wenn man ihn gedrückt hält – damit Kinder nicht aus Versehen etwas verstellen.
  import type { Snippet } from 'svelte'

  let {
    dauer = 1200,
    label,
    onhalten,
    onkurz,
    children,
  }: { dauer?: number; label: string; onhalten: () => void; onkurz?: () => void; children: Snippet } = $props()

  let fortschritt = $state(0)
  let start = 0
  let rahmen = 0
  let fertig = false

  function beginnen() {
    if (start) return
    fertig = false
    start = performance.now()
    const schritt = () => {
      fortschritt = Math.min(1, (performance.now() - start) / dauer)
      if (fortschritt >= 1) {
        fertig = true
        ende(false)
        onhalten()
        return
      }
      rahmen = requestAnimationFrame(schritt)
    }
    rahmen = requestAnimationFrame(schritt)
  }

  function ende(kurzMelden: boolean) {
    if (!start) return
    cancelAnimationFrame(rahmen)
    start = 0
    fortschritt = 0
    if (kurzMelden && !fertig) onkurz?.()
  }
</script>

<button
  class="halte knopf rund"
  aria-label={label}
  style="--f: {fortschritt}"
  onpointerdown={(e) => {
    if (e.button === 0) beginnen()
  }}
  onpointerup={() => ende(true)}
  onpointerleave={() => ende(false)}
  onpointercancel={() => ende(false)}
  oncontextmenu={(e) => e.preventDefault()}
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!e.repeat) beginnen()
    }
  }}
  onkeyup={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      ende(true)
    }
  }}
  onclick={(e) => e.preventDefault()}
>
  {@render children()}
  <svg class="ring" viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="18" pathLength="1" />
  </svg>
</button>

<style>
  .halte {
    position: relative;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }
  .ring {
    position: absolute;
    inset: -5px;
    width: calc(100% + 10px);
    height: calc(100% + 10px);
    transform: rotate(-90deg);
    pointer-events: none;
  }
  .ring circle {
    fill: none;
    stroke: var(--tinte);
    stroke-width: 3.5;
    stroke-linecap: round;
    stroke-dasharray: 1;
    stroke-dashoffset: calc(1 - var(--f));
    opacity: calc(var(--f) * 10);
  }
</style>
