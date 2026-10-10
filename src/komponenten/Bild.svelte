<script lang="ts">
  import { bildUrl } from '../lib/bilder'
  import { ZUSAETZE } from '../lib/konstanten'
  import { app } from '../lib/speicher.svelte'

  let { id, zusatz }: { id: string; zusatz?: string } = $props()

  const istFoto = $derived(id.startsWith('foto:'))
  const zusatzBild = $derived(zusatz ? ZUSAETZE.find((z) => z.id === zusatz)?.bild : undefined)
</script>

<span class="bild" class:foto={istFoto}>
  <img src={bildUrl(id, app.fotos)} alt="" draggable="false" />
  {#if zusatzBild}
    <span class="zusatz"><img src={bildUrl(zusatzBild, app.fotos)} alt="" draggable="false" /></span>
  {/if}
</span>

<style>
  .bild {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
  }
  .bild > img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .foto > img {
    object-fit: cover;
    border-radius: 16%;
  }
  .zusatz {
    position: absolute;
    right: -6%;
    bottom: -6%;
    width: 46%;
    height: 46%;
    padding: 7%;
    border-radius: 50%;
    background: var(--abend-tief);
    box-shadow: 0 0 0 3px var(--tafel);
  }
  .zusatz img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>
