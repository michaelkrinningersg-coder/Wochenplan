<script lang="ts">
  // Datenschutz-Kurzfassung und Lizenzen der verwendeten Bausteine (in der App, auch ohne Internet lesbar)
  import fluent from '../assets/icons/LICENSE-fluentui-emoji.txt?raw'
  import andika from '../assets/fonts/LICENSE-Andika-OFL.txt?raw'
  import fredoka from '../assets/fonts/LICENSE-Fredoka-OFL.txt?raw'
  import svelteLizenz from '../../node_modules/svelte/LICENSE.md?raw'
  import capacitor from '../../node_modules/@capacitor/core/LICENSE?raw'
  import keepAwake from '../../node_modules/@capacitor-community/keep-awake/LICENSE?raw'
  import tts from '../../node_modules/@capacitor-community/text-to-speech/LICENSE?raw'

  const LIZENZEN = [
    { name: 'Bilder (Symbole): Microsoft Fluent Emoji', text: fluent },
    { name: 'Schrift Fredoka', text: fredoka },
    { name: 'Schrift Andika', text: andika },
    { name: 'Svelte', text: svelteLizenz },
    { name: 'Capacitor', text: capacitor },
    { name: 'Capacitor Keep Awake', text: keepAwake },
    { name: 'Capacitor Text-to-Speech', text: tts },
  ]
</script>

<details>
  <summary>Datenschutz in Kürze</summary>
  <div class="text">
    {#if __STORE__}
      <p>Alle Eingaben (Plan, abgehakte Aufgaben, Einstellungen, eigene Fotos) bleiben ausschließlich auf diesem Gerät. Die App hat keine Konten, keine Werbung, keine Statistik- oder Absturzberichte und baut keine Verbindung zu Servern auf.</p>
      <p>Fotos für das Ruhebild liest die App nur, wenn du sie selbst auswählst. Die Sprachausgabe nutzt die Sprachausgabe deines Geräts; je nach installierter Stimme kann Android sie selbst verarbeiten.</p>
      <p>Wenn du den Plan als Datei teilst, entscheidest du, an wen er geht.</p>
    {:else}
      <p>Der Plan wird auf dem Gerät mit deinem Familien-Passwort verschlüsselt, bevor er bei GitHub gespeichert wird. Wetter und Ortssuche (optional) senden den Ort an Open-Meteo, die Update-Suche fragt GitHub ab. Es gibt keine Werbung und keine Statistik.</p>
    {/if}
    <p>Die ausführliche Datenschutzerklärung steht unter michaelkrinningersg-coder.github.io/Wochenplan/datenschutz.html.</p>
  </div>
</details>

<details>
  <summary>Bilder und Lizenzen</summary>
  <div class="text">
    <p>Die großen Szenenbilder auf den Karten wurden mit KI-Unterstützung erstellt. Die kleinen Symbole stammen von Microsoft Fluent Emoji (MIT-Lizenz). Schriften: Fredoka und Andika (SIL Open Font License 1.1).</p>
    {#each LIZENZEN as l (l.name)}
      <details class="innen">
        <summary>{l.name}</summary>
        <pre>{l.text}</pre>
      </details>
    {/each}
  </div>
</details>

<style>
  details {
    border-top: 1px solid var(--linie);
    padding: 8px 0;
  }
  summary {
    cursor: pointer;
    font-weight: 700;
    padding: 4px 0;
  }
  summary:focus-visible {
    outline: 3px solid var(--gelb);
    outline-offset: 2px;
  }
  .text {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: var(--t-klein);
    color: var(--tinte-leise);
    max-width: 44em;
  }
  .text p {
    margin: 0;
  }
  .innen {
    margin-left: 12px;
  }
  pre {
    margin: 4px 0 0;
    max-height: 14em;
    overflow: auto;
    white-space: pre-wrap;
    font-size: 12px;
  }
</style>
