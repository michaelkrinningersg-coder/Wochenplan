import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Zwei Builds:
//  - normal (`npm run build`): Dateien in dist/ für Capacitor (Android-App für Tablet und Google TV)
//  - single (`npm run build:single`): eine einzige HTML-Datei in dist-single/ zum Ausprobieren im Browser
export default defineConfig(({ mode }) => {
  const single = mode === 'single'
  return {
    base: './',
    plugins: single ? [svelte(), viteSingleFile()] : [svelte()],
    build: {
      outDir: single ? 'dist-single' : 'dist',
      // Android System WebView auf Chromecast HD / Tablets ist aktuell, aber wir bleiben vorsichtig
      target: 'chrome100',
      assetsInlineLimit: single ? 100_000_000 : 4096,
    },
  }
})
