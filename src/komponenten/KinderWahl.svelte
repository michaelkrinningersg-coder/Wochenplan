<script lang="ts">
  // Umschalten zwischen beiden Kindern – mit Alter und Sternen von heute
  import { app, sterne } from '../lib/speicher.svelte'
  import { alterAm } from '../lib/zeit'

  const jetzt = $derived(new Date(app.jetzt))
</script>

<div class="kinder" role="group" aria-label="Für wen">
  <button class="kind alle" aria-pressed={app.einst.kind === 'alle'} onclick={() => (app.einst.kind = 'alle')}>Beide</button>
  {#each app.plan.kinder as k (k.id)}
    {@const st = sterne(k.id)}
    <button
      class="kind"
      style="--kind: {k.farbe}"
      aria-pressed={app.einst.kind === k.id}
      onclick={() => (app.einst.kind = k.id)}
      aria-label="{k.name}{k.geburtstag ? `, ${alterAm(k.geburtstag, jetzt)} Jahre` : ''}, {st.heute} Sterne heute, {st.woche} diese Woche"
      title="{st.woche} Sterne in den letzten 7 Tagen"
    >
      <span class="punkt">{k.name.slice(0, 1)}</span>
      <span class="name">{k.name}{#if k.geburtstag}<small> {alterAm(k.geburtstag, jetzt)}</small>{/if}</span>
      <span class="sterne">★ {st.heute}</span>
    </button>
  {/each}
</div>

<style>
  .kinder {
    display: flex;
    gap: 6px;
    flex-wrap: nowrap;
  }
  .kind {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 2.2em;
    padding: 0.15em 0.7em 0.15em 0.25em;
    border: 2px solid var(--linie);
    border-radius: 999px;
    background: var(--tafel);
    font-family: var(--schrift-titel);
    font-weight: 600;
    font-size: var(--t-klein);
    white-space: nowrap;
  }
  .kind.alle {
    padding-left: 0.7em;
  }
  .kind[aria-pressed='true'] {
    border-color: var(--kind, var(--tinte));
    box-shadow: inset 0 0 0 2px var(--kind, var(--tinte));
  }
  .punkt {
    display: grid;
    place-items: center;
    width: 1.7em;
    height: 1.7em;
    border-radius: 50%;
    background: var(--kind);
    color: #ffffff;
  }
  small {
    font-weight: 500;
    color: var(--tinte-leise);
  }
  .sterne {
    color: #c99700;
  }
  @media (max-width: 1100px) {
    .name {
      display: none;
    }
  }
</style>
