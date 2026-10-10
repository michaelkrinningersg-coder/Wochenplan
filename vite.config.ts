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
    // Build-Nummer aus GitHub Actions (gleich wie die APK-Version)
    define: {
      __VERSION__: JSON.stringify(Number(process.env.GITHUB_RUN_NUMBER ?? 0)),
      // Store-Version: keine Verbindung zu GitHub oder Wetterdiensten
      __STORE__: JSON.stringify(process.env.STORE_BUILD === '1'),
    },
    plugins: single ? [svelte(), viteSingleFile()] : [svelte()],
    build: {
      outDir: single ? 'dist-single' : 'dist',
      // Android System WebView auf Chromecast HD / Tablets ist aktuell, aber wir bleiben vorsichtig
      target: 'chrome100',
      assetsInlineLimit: single ? 100_000_000 : 4096,
    },
  }
})
