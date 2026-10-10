<script lang="ts">
  import { onMount } from 'svelte'
  import { geburtstageHeute } from '../lib/countdown'
  import { app } from '../lib/speicher.svelte'
  import { spieleTon } from '../lib/ton'
  import { datumKey } from '../lib/zeit'
  import Bild from './Bild.svelte'
  import Konfetti from './Konfetti.svelte'

  const kinder = $derived(geburtstageHeute())
  let feiern = $state(false)

  onMount(() => {
    // Einmal pro Tag und Gerät mit Fanfare und Konfetti feiern
    const key = 'wochenplan.geburtstag-gefeiert'
    try {
      if (localStorage.getItem(key) !== datumKey()) {
        localStorage.setItem(key, datumKey())
        feiern = true
        if (app.einst.ton) spieleTon('alles')
        setTimeout(() => (feiern = false), 4000)
      }
    } catch {
      /* ohne Speicher eben ohne Feier */
    }
  })
</script>

{#if kinder.length}
  <div class="banner" role="status">
    <span class="torte"><Bild id="geburtstag" /></span>
    <div class="text">
      {#each kinder as k (k.name)}
        <span class="zeile" style="--kind: {k.farbe}"><b>{k.name}</b> hat Geburtstag! <span class="alter">{k.alter} Jahre</span></span>
      {/each}
    </div>
    <span class="torte"><Bild id="party" /></span>
    {#if feiern}<Konfetti anzahl={60} />{/if}
  </div>
{/if}

<style>
  .banner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    height: 64px;
    margin-bottom: 8px;
    padding: 0 16px;
    border-radius: 999px;
    background: var(--mittag-hell);
    box-shadow: inset 0 0 0 3px var(--gelb);
    flex: none;
    overflow: visible;
  }
  .torte {
    width: 48px;
    height: 48px;
    flex: none;
    animation: wippen 1.6s ease-in-out infinite;
  }
  .text {
    display: flex;
    gap: 18px;
    font-family: var(--schrift-titel);
    font-weight: 600;
    font-size: var(--t-gross);
  }
  .zeile b {
    color: var(--kind);
  }
  .alter {
    padding: 0 10px;
    border-radius: 999px;
    background: var(--gelb);
    color: var(--tinte-auf-farbe);
  }
  @keyframes wippen {
    50% {
      transform: rotate(-8deg) scale(1.08);
    }
  }
</style>
