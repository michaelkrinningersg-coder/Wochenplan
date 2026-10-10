/// <reference types="svelte" />
/// <reference types="vite/client" />

/** Build-Nummer (GitHub Actions), 0 bei lokalen Builds */
declare const __VERSION__: number

/** Store-Version (STORE_BUILD=1): ohne GitHub-Abgleich, Wetter und In-App-Update */
declare const __STORE__: boolean
