<script lang="ts">
  // Bild einer Aufgabe – je nach Einstellung das Symbol, das eigene Foto oder beides im Wechsel
  import { app } from '../lib/speicher.svelte'
  import type { Aufgabe } from '../lib/typen'
  import Bild from './Bild.svelte'

  let { aufgabe }: { aufgabe: Aufgabe } = $props()

  const modus = $derived(aufgabe.foto ? (aufgabe.fotoModus ?? 'wechsel') : 'bild')
  const sek = $derived(Math.max(2, aufgabe.wechselSek ?? 5))
  const zeigeFoto = $derived(modus === 'foto' || (modus === 'wechsel' && Math.floor(app.jetzt / 1000 / sek) % 2 === 1))
</script>

<span class="aufgabenbild">
  {#if modus === 'bild'}
    <Bild id={aufgabe.bild} zusatz={aufgabe.zusatz} />
  {:else}
    <span class="ebene" class:sichtbar={!zeigeFoto}><Bild id={aufgabe.bild} zusatz={aufgabe.zusatz} /></span>
    <span class="ebene foto" class:sichtbar={zeigeFoto}><Bild id={aufgabe.foto!} zusatz={aufgabe.zusatz} /></span>
  {/if}
</span>

<style>
  .aufgabenbild {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
  }
  .ebene {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.6s ease;
  }
  .ebene.sichtbar {
    opacity: 1;
  }
</style>
