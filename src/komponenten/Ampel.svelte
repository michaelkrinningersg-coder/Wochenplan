<script lang="ts">
  let { zustand, blinken = false, hoehe }: { zustand: 'rot' | 'gelb' | 'gruen' | 'aus'; blinken?: boolean; hoehe: number } =
    $props()

  const text = $derived(
    zustand === 'gruen' ? 'Grün: genug Zeit' : zustand === 'gelb' ? 'Gelb: gleich vorbei' : zustand === 'rot' ? 'Rot: Zeit ist um' : 'Ampel aus',
  )
</script>

<div class="ampel" style="--h: {hoehe}px" role="img" aria-label={text}>
  <span class="lampe rot" class:an={zustand === 'rot'} class:blinken={zustand === 'rot' && blinken}></span>
  <span class="lampe gelb" class:an={zustand === 'gelb'}></span>
  <span class="lampe gruen" class:an={zustand === 'gruen'}></span>
</div>

<style>
  .ampel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: calc(var(--h) * 0.36);
    height: var(--h);
    padding: calc(var(--h) * 0.04) 0;
    border-radius: calc(var(--h) * 0.08);
    background: var(--gehaeuse);
    box-shadow: 0 6px 0 rgba(0, 0, 0, 0.25);
    flex: none;
  }
  .lampe {
    width: calc(var(--h) * 0.26);
    height: calc(var(--h) * 0.26);
    border-radius: 50%;
    opacity: 0.2;
    transition:
      opacity 0.3s ease,
      box-shadow 0.3s ease;
  }
  .rot {
    background: var(--rot);
  }
  .gelb {
    background: var(--gelb);
  }
  .gruen {
    background: var(--gruen);
  }
  .an {
    opacity: 1;
  }
  .rot.an {
    box-shadow: 0 0 calc(var(--h) * 0.08) var(--rot);
  }
  .gelb.an {
    box-shadow: 0 0 calc(var(--h) * 0.08) var(--gelb);
  }
  .gruen.an {
    box-shadow: 0 0 calc(var(--h) * 0.08) var(--gruen);
  }
  .blinken {
    animation: blinken 1s steps(2, jump-none) infinite;
  }
  @keyframes blinken {
    50% {
      opacity: 0.25;
      box-shadow: none;
    }
  }
</style>
