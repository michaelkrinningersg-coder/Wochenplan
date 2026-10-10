<script lang="ts">
  // Einfache Bediensymbole (Linien), passen sich der Textfarbe an
  let { name }: { name: string } = $props()
</script>

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  {#if name === 'zurueck'}
    <path d="M15 5l-7 7 7 7" />
  {:else if name === 'weiter'}
    <path d="M9 5l7 7-7 7" />
  {:else if name === 'stift'}
    <path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" />
  {:else if name === 'zahnrad'}
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3L5.5 5.5" />
  {:else if name === 'plus'}
    <path d="M12 5v14M5 12h14" />
  {:else if name === 'muell'}
    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" />
  {:else if name === 'start'}
    <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
  {:else if name === 'pause'}
    <path d="M8 5.5v13M16 5.5v13" stroke-width="3.4" />
  {:else if name === 'neu'}
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" /><path d="M4 4.5v4h4" />
  {:else if name === 'haken'}
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  {:else if name === 'woche'}
    <rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" />
  {:else if name === 'kalender'}
    <rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /><path d="M8 14h2M12 14h2M16 14h0.5M8 17h2M12 17h2" />
  {:else if name === 'heute'}
    <circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4M18.7 18.7l-1.4-1.4M6.7 6.7L5.3 5.3" />
  {:else if name === 'pfeile'}
    <path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" />
  {:else if name === 'kopie'}
    <rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" />
  {:else if name === 'bild'}
    <rect x="3.5" y="5" width="17" height="14" rx="2.5" /><circle cx="9" cy="10" r="1.8" /><path d="M20.5 16l-5-5-8.5 8" />
  {:else if name === 'schloss'}
    <rect x="5" y="11" width="14" height="9.5" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
  {:else if name === 'kreuz'}
    <path d="M6 6l12 12M18 6L6 18" />
  {/if}
</svg>

<style>
  svg {
    width: 1.2em;
    height: 1.2em;
    flex: none;
  }
</style>
