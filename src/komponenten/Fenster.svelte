<script lang="ts">
  import { t } from '../lib/i18n.svelte'
  import { onMount, tick, type Snippet } from 'svelte'
  import { ersterFokus } from '../lib/fokus'
  import { zurueck } from '../lib/speicher.svelte'
  import Symbol from './Symbol.svelte'

  let { titel, breit = false, children }: { titel: string; breit?: boolean; children: Snippet } = $props()

  let el: HTMLDialogElement

  onMount(() => {
    el.showModal()
    void tick().then(() => ersterFokus(el.querySelector('.inhalt') ?? el))
  })
</script>

<dialog
  bind:this={el}
  class:breit
  aria-label={titel}
  oncancel={(e) => {
    e.preventDefault()
    zurueck()
  }}
  onclick={(e) => {
    if (e.target === el) zurueck()
  }}
>
  <div class="rahmen">
    <header>
      <h2>{titel}</h2>
      <button class="knopf rund" onclick={() => zurueck()} aria-label={t('Schließen')}><Symbol name="kreuz" /></button>
    </header>
    <div class="inhalt">
      {@render children()}
    </div>
  </div>
</dialog>

<style>
  dialog {
    width: min(640px, calc(100vw - 24px));
    max-height: calc(100vh - 24px);
    padding: 0;
    border: none;
    border-radius: 28px;
    background: var(--tafel);
    color: var(--tinte);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
    overflow: hidden;
  }
  dialog.breit {
    width: min(980px, calc(100vw - 24px));
  }
  dialog::backdrop {
    background: rgba(20, 26, 50, 0.55);
  }
  .rahmen {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 24px);
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px 10px 24px;
    flex: none;
  }
  h2 {
    font-size: var(--t-gross);
  }
  .inhalt {
    padding: 4px 24px 22px;
    overflow: auto;
    min-height: 0;
  }
</style>
