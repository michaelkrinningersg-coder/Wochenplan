<script lang="ts">
  import { countdowns } from '../lib/countdown'
  import Bild from './Bild.svelte'

  let { max = 2 }: { max?: number } = $props()
  const liste = $derived(countdowns().slice(0, max))
</script>

{#if liste.length}
  <div class="countdowns">
    {#each liste as c (c.titel + c.datum)}
      <div class="chip" class:geburtstag={c.geburtstag} title={c.titel}>
        <span class="bild"><Bild id={c.bild} /></span>
        <span class="text">
          <b>{c.titel}</b>
          {#if c.tage <= 7}
            <span class="monde" aria-label="noch {c.tage} mal schlafen">
              {#each Array.from({ length: c.tage }) as _, i (i)}<span class="mond">☾</span>{/each}
            </span>
          {:else}
            <span>in {c.tage} Tagen</span>
          {/if}
        </span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .countdowns {
    display: flex;
    gap: 8px;
    min-width: 0;
    overflow: hidden;
  }
  .chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px 4px 6px;
    border-radius: 999px;
    background: var(--tafel);
    box-shadow: inset 0 0 0 2px var(--linie);
    min-width: 0;
  }
  .chip.geburtstag {
    box-shadow: inset 0 0 0 2px var(--gelb);
  }
  .bild {
    width: 30px;
    height: 30px;
    flex: none;
  }
  .text {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
    font-size: var(--t-klein);
    min-width: 0;
  }
  .text b {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .monde {
    color: var(--abend);
    letter-spacing: 1px;
    font-size: 1.05em;
  }
</style>
