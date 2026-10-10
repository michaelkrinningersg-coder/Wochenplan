<script lang="ts">
  // Foto quadratisch zuschneiden: verschieben (Finger/Maus oder Pfeile) und zoomen
  let {
    quelle,
    onfertig,
    onabbrechen,
  }: { quelle: string; onfertig: (daten: string) => void; onabbrechen: () => void } = $props()

  const RAHMEN = 260
  let img = $state<HTMLImageElement>()
  let natur = $state({ b: 1, h: 1 })
  let zoom = $state(1)
  let x = $state(0)
  let y = $state(0)
  let ziehen: { px: number; py: number; x: number; y: number } | null = null

  // Grundmaßstab: das Bild füllt den Rahmen
  const basis = $derived(Math.max(RAHMEN / natur.b, RAHMEN / natur.h))
  const mass = $derived(basis * zoom)

  function begrenzen() {
    const b = natur.b * mass
    const h = natur.h * mass
    x = Math.min(0, Math.max(RAHMEN - b, x))
    y = Math.min(0, Math.max(RAHMEN - h, y))
  }

  function geladen() {
    if (!img) return
    natur = { b: img.naturalWidth, h: img.naturalHeight }
    const m = Math.max(RAHMEN / natur.b, RAHMEN / natur.h)
    x = (RAHMEN - natur.b * m) / 2
    y = (RAHMEN - natur.h * m) / 2
  }

  function zoomen(neu: number) {
    const alt = mass
    zoom = Math.min(4, Math.max(1, neu))
    const f = mass / alt
    // um die Mitte zoomen
    x = RAHMEN / 2 - (RAHMEN / 2 - x) * f
    y = RAHMEN / 2 - (RAHMEN / 2 - y) * f
    begrenzen()
  }

  function fertig() {
    if (!img) return
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 512
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 512, 512)
    const f = 512 / RAHMEN
    ctx.drawImage(img, x * f, y * f, natur.b * mass * f, natur.h * mass * f)
    onfertig(canvas.toDataURL('image/jpeg', 0.82))
  }
</script>

<div class="zuschnitt">
  <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
  <div
    class="rahmen"
    style="width: {RAHMEN}px; height: {RAHMEN}px"
    role="application"
    aria-label="Foto verschieben"
    tabindex="0"
    onpointerdown={(e) => {
      ziehen = { px: e.clientX, py: e.clientY, x, y }
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }}
    onpointermove={(e) => {
      if (!ziehen) return
      x = ziehen.x + e.clientX - ziehen.px
      y = ziehen.y + e.clientY - ziehen.py
      begrenzen()
    }}
    onpointerup={() => (ziehen = null)}
    onwheel={(e) => {
      e.preventDefault()
      zoomen(zoom * (e.deltaY < 0 ? 1.1 : 0.9))
    }}
    onkeydown={(e) => {
      const d = 12
      if (e.key === 'ArrowLeft') x += d
      else if (e.key === 'ArrowRight') x -= d
      else if (e.key === 'ArrowUp') y += d
      else if (e.key === 'ArrowDown') y -= d
      else return
      e.preventDefault()
      e.stopPropagation()
      begrenzen()
    }}
  >
    <img
      bind:this={img}
      src={quelle}
      alt="Zuschnitt"
      draggable="false"
      onload={geladen}
      style="width: {natur.b * mass}px; height: {natur.h * mass}px; transform: translate({x}px, {y}px)"
    />
  </div>
  <div class="regler">
    <button type="button" class="knopf rund" onclick={() => zoomen(zoom / 1.2)} aria-label="Verkleinern">−</button>
    <input type="range" min="1" max="4" step="0.05" value={zoom} oninput={(e) => zoomen(Number((e.target as HTMLInputElement).value))} aria-label="Zoom" />
    <button type="button" class="knopf rund" onclick={() => zoomen(zoom * 1.2)} aria-label="Vergrößern">+</button>
  </div>
  <p class="hilfe">Foto mit dem Finger verschieben, mit dem Regler vergrößern.</p>
  <div class="reihe">
    <button type="button" class="knopf haupt" onclick={fertig}>Zuschnitt übernehmen</button>
    <button type="button" class="knopf" onclick={onabbrechen}>Abbrechen</button>
  </div>
</div>

<style>
  .zuschnitt {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .rahmen {
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    background: var(--himmel);
    box-shadow: inset 0 0 0 3px var(--tinte);
    touch-action: none;
    cursor: grab;
  }
  .rahmen img {
    position: absolute;
    left: 0;
    top: 0;
    max-width: none;
    user-select: none;
    pointer-events: none;
    transform-origin: 0 0;
  }
  .regler {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 260px;
  }
  .regler input {
    flex: 1;
  }
  .hilfe {
    margin: 0;
    font-size: var(--t-klein);
    color: var(--tinte-leise);
  }
  .reihe {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
</style>
