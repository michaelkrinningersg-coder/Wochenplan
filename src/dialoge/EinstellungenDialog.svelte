<script lang="ts">
  import Fenster from '../komponenten/Fenster.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import ZeitWahl from '../komponenten/ZeitWahl.svelte'
  import { abgleich, einstSpeichern, holen, hochladen, istEingerichtet, statusHochladen } from '../lib/abgleich.svelte'
  import { dateiExportieren, istApp } from '../lib/geraet'
  import { ABSCHNITTE } from '../lib/konstanten'
  import { app, exportDaten, importDaten, zeigeHinweis } from '../lib/speicher.svelte'
  import { KIND_FARBEN, startplan } from '../lib/startplan'
  import { minutenVon } from '../lib/zeit'
  import { installieren, suchen, update, updateVerfuegbar } from '../lib/update.svelte'

  let zuruecksetzenFragen = $state(false)
  let passwortZeigen = $state(false)
  let erweitert = $state(false)
  let dateiFeld: HTMLInputElement | undefined = $state()

  const e = abgleich.einst

  function aenderung() {
    einstSpeichern()
  }

  async function jetztAbgleichen() {
    einstSpeichern()
    if (e.rolle === 'planer') {
      const geholt = await holen(false)
      if (!geholt) await hochladen()
    } else {
      await holen(true)
    }
    await statusHochladen()
    if (abgleich.zustand === 'ok') zeigeHinweis(abgleich.meldung || 'Plan ist abgeglichen.')
  }

  async function exportieren() {
    const d = new Date()
    const name = `wochenplan-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`
    try {
      zeigeHinweis(await dateiExportieren(name, exportDaten()))
    } catch {
      zeigeHinweis('Die Datei konnte nicht gespeichert werden.')
    }
  }

  async function importieren(ev: Event) {
    const datei = (ev.target as HTMLInputElement).files?.[0]
    if (!datei) return
    const ok = importDaten(await datei.text())
    zeigeHinweis(ok ? 'Plan übernommen.' : 'Diese Datei ist kein gültiger Wochenplan.')
    ;(ev.target as HTMLInputElement).value = ''
  }

  function zuruecksetzen() {
    app.plan = startplan()
    app.fotos = {}
    zuruecksetzenFragen = false
    zeigeHinweis('Startplan wiederhergestellt.')
  }
</script>

<Fenster titel="Einstellungen" breit>
  <div class="einstellungen">
    <section>
      <h3>Dieses Gerät</h3>
      <div class="reihe">
        <button
          class="knopf"
          aria-pressed={e.rolle === 'planer'}
          data-autofokus
          onclick={() => {
            e.rolle = 'planer'
            aenderung()
          }}>Planen (Handy, PC)</button
        >
        <button
          class="knopf"
          aria-pressed={e.rolle === 'anzeige'}
          onclick={() => {
            e.rolle = 'anzeige'
            app.bearbeiten = false
            aenderung()
          }}>Nur anzeigen (Fernseher)</button
        >
      </div>
      <p class="hilfe">
        {#if e.rolle === 'planer'}
          Hier wird der Plan bearbeitet. Jede Änderung wird verschlüsselt hochgeladen.
        {:else}
          Der Plan kommt vom Handy oder PC. Die App schaut alle 2 Minuten nach Änderungen.
        {/if}
      </p>
    </section>

    <section>
      <h3>Kinder</h3>
      <div class="kinder">
        {#each app.plan.kinder as k (k.id)}
          <div class="kind-karte" style="--kind: {k.farbe}">
            <label class="feld">
              <span class="name">Name</span>
              <input id="kind-name-{k.id}" type="text" bind:value={k.name} maxlength="30" autocomplete="off" />
            </label>
            <label class="feld">
              <span class="name">Geburtstag</span>
              <input id="kind-geburtstag-{k.id}" type="date" bind:value={k.geburtstag} />
            </label>
            <div class="feld">
              <span class="name">Farbe</span>
              <div class="farben">
                {#each KIND_FARBEN as f (f)}
                  <button class="farbe" style="--f: {f}" aria-pressed={k.farbe === f} aria-label="Farbe {f}" onclick={() => (k.farbe = f)}></button>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
      <p class="hilfe">Namen und Geburtstage stehen nur im verschlüsselten Plan, nicht im öffentlichen Code.</p>
    </section>

    <section>
      <h3>Abgleich</h3>
      <label class="feld">
        <span class="name">Familien-Passwort (auf allen Geräten gleich)</span>
        <span class="mit-knopf">
          <input
            id="abgleich-passwort"
            type={passwortZeigen ? 'text' : 'password'}
            bind:value={e.passwort}
            onchange={aenderung}
            autocomplete="off"
            placeholder="z. B. hase-sonne-blau-17"
          />
          <button class="knopf" onclick={() => (passwortZeigen = !passwortZeigen)}>{passwortZeigen ? 'Verbergen' : 'Zeigen'}</button>
        </span>
      </label>
      {#if e.rolle === 'planer'}
        <label class="feld">
          <span class="name">GitHub-Token (nur zum Hochladen nötig)</span>
          <input id="abgleich-token" type="password" bind:value={e.token} onchange={aenderung} autocomplete="off" placeholder="github_pat_…" />
        </label>
        <p class="hilfe">Der Token wird verschlüsselt mit dem Plan übertragen. So kann auch der Fernseher melden, was die Kinder abgehakt haben, und du siehst es hier.</p>
      {:else if istEingerichtet()}
        <p class="hilfe">
          {e.token ? 'Abgehakte Aufgaben werden an Handy und PC gemeldet.' : 'Abhaken wird gemeldet, sobald der Plan einmal vom Planer-Gerät hochgeladen wurde.'}
        </p>
      {/if}
      <div class="reihe">
        <button class="knopf haupt" onclick={jetztAbgleichen} disabled={!istEingerichtet()}>
          <Symbol name="neu" />{e.rolle === 'planer' ? 'Jetzt abgleichen' : 'Plan jetzt laden'}
        </button>
        <button class="knopf" onclick={() => (erweitert = !erweitert)} aria-expanded={erweitert}>Speicherort</button>
      </div>
      {#if abgleich.zustand === 'fehler'}
        <p class="meldung fehler">{abgleich.meldung}</p>
      {:else if abgleich.zuletzt}
        <p class="meldung">
          Zuletzt abgeglichen um {new Date(abgleich.zuletzt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr.
          {abgleich.meldung}
        </p>
      {:else if !istEingerichtet()}
        <p class="hilfe">
          {e.rolle === 'planer' ? 'Passwort und Token eintragen, dann wird der Plan automatisch hochgeladen.' : 'Passwort eintragen, dann lädt der Fernseher den Plan.'}
        </p>
      {/if}
      {#if erweitert}
        <div class="raster">
          <label class="feld"><span class="name">GitHub-Konto</span><input id="abgleich-besitzer" type="text" bind:value={e.besitzer} onchange={aenderung} /></label>
          <label class="feld"><span class="name">Repo</span><input id="abgleich-repo" type="text" bind:value={e.repo} onchange={aenderung} /></label>
          <label class="feld"><span class="name">Zweig</span><input id="abgleich-zweig" type="text" bind:value={e.zweig} onchange={aenderung} /></label>
          <label class="feld"><span class="name">Datei</span><input id="abgleich-datei" type="text" bind:value={e.datei} onchange={aenderung} /></label>
        </div>
      {/if}
    </section>

    <section>
      <h3>Tageszeiten</h3>
      <p class="hilfe">Jeder Abschnitt endet, wenn der nächste beginnt. Änderst du ein „bis“, verschiebt sich der Beginn des nächsten Abschnitts mit.</p>
      <div class="zeiten">
        {#each ABSCHNITTE as ab, i (ab.id)}
          {@const naechster = ABSCHNITTE[i + 1]}
          <div class="zeit" data-seg={ab.id}>
            <span class="zeit-name">{ab.name}</span>
            <div class="von-bis">
              <span class="name">von</span>
              <ZeitWahl bind:wert={app.plan.zeiten[ab.id]} label="{ab.name} von" />
            </div>
            <div class="von-bis">
              <span class="name">bis</span>
              {#if naechster}
                <ZeitWahl bind:wert={app.plan.zeiten[naechster.id]} label="{ab.name} bis" />
              {:else}
                <ZeitWahl bind:wert={app.plan.abendEnde} label="{ab.name} bis" />
              {/if}
            </div>
            {#if minutenVon(app.plan.zeiten[ab.id]) >= minutenVon(naechster ? app.plan.zeiten[naechster.id] : app.plan.abendEnde)}
              <span class="warnung">„bis“ muss nach „von“ liegen</span>
            {/if}
          </div>
        {/each}
      </div>
    </section>

    <section>
      <h3>Anzeige</h3>
      <div class="reihe">
        <button class="knopf" aria-pressed={app.einst.thema === 'auto'} onclick={() => (app.einst.thema = 'auto')}>Abends dunkel</button>
        <button class="knopf" aria-pressed={app.einst.thema === 'tag'} onclick={() => (app.einst.thema = 'tag')}>Immer hell</button>
        <button class="knopf" aria-pressed={app.einst.thema === 'nacht'} onclick={() => (app.einst.thema = 'nacht')}>Immer dunkel</button>
      </div>
      <div class="reihe">
        <span class="name zeile">Timer zeigen als</span>
        <button class="knopf" aria-pressed={app.einst.timerArt === 'ampel'} onclick={() => (app.einst.timerArt = 'ampel')}>Ampel</button>
        <button class="knopf" aria-pressed={app.einst.timerArt === 'sanduhr'} onclick={() => (app.einst.timerArt = 'sanduhr')}>Sanduhr</button>
      </div>
      <div class="reihe">
        <button class="knopf" aria-pressed={app.einst.ton} onclick={() => (app.einst.ton = !app.einst.ton)}>
          Ton {app.einst.ton ? 'an' : 'aus'}
        </button>
        <button class="knopf" aria-pressed={app.einst.vorlesen} onclick={() => (app.einst.vorlesen = !app.einst.vorlesen)}>
          Vorlesen {app.einst.vorlesen ? 'an' : 'aus'}
        </button>
        <button class="knopf" aria-pressed={app.einst.wach} onclick={() => (app.einst.wach = !app.einst.wach)}>
          Bildschirm anlassen: {app.einst.wach ? 'ja' : 'nein'}
        </button>
      </div>
    </section>

    <section>
      <h3>Sichern</h3>
      <div class="reihe">
        <button class="knopf" onclick={exportieren}>Plan als Datei sichern</button>
        <button class="knopf" onclick={() => dateiFeld?.click()}>Plan aus Datei laden</button>
        <input bind:this={dateiFeld} id="import-datei" type="file" accept="application/json,.json" hidden onchange={importieren} />
        {#if zuruecksetzenFragen}
          <button class="knopf gefahr" onclick={zuruecksetzen}>Wirklich auf Startplan zurücksetzen</button>
        {:else}
          <button class="knopf gefahr" onclick={() => (zuruecksetzenFragen = true)}>Startplan wiederherstellen</button>
        {/if}
      </div>
    </section>

    <section>
      <h3>App-Version</h3>
      <p class="hilfe">
        Installiert: {update.aktuell ? `1.0.${update.aktuell}` : 'Testversion'}{update.neu ? ` · neueste: 1.0.${update.neu}` : ''}
      </p>
      <div class="reihe">
        {#if updateVerfuegbar() || !istApp}
          <button class="knopf haupt" onclick={() => void installieren()} disabled={update.zustand === 'laden'}>
            <Symbol name="neu" />{istApp ? 'Jetzt aktualisieren' : 'Seite neu laden'}
          </button>
        {/if}
        {#if istApp}
          <button class="knopf" onclick={() => void suchen()} disabled={update.zustand === 'suche' || update.zustand === 'laden'}>
            Nach Update suchen
          </button>
        {/if}
      </div>
      {#if update.zustand === 'laden'}
        <progress max="100" value={update.prozent}>{update.prozent} %</progress>
      {/if}
      {#if update.meldung}
        <p class="meldung" class:fehler={update.zustand === 'fehler'}>{update.meldung}</p>
      {/if}
    </section>

    <p class="info">
      Wochenplan {istApp ? 'App' : 'im Browser'}. Bilder: Microsoft Fluent Emoji (MIT-Lizenz). Schriften: Fredoka und Andika (SIL Open Font License).
    </p>
  </div>
</Fenster>

<style>
  progress {
    width: 100%;
    height: 14px;
    accent-color: var(--gruen);
  }
  .einstellungen {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  h3 {
    font-size: var(--t-text);
  }
  .name.zeile {
    align-self: center;
    margin-right: 6px;
  }
  .reihe {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .feld {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .name {
    font-size: var(--t-klein);
    color: var(--tinte-leise);
    font-weight: 700;
  }
  input[type='text'],
  input[type='password'] {
    width: 100%;
    min-width: 0;
    padding: 0.5em 0.8em;
    border: 2px solid var(--linie);
    border-radius: 14px;
    background: var(--himmel);
    color: var(--tinte);
    font: inherit;
  }
  .mit-knopf {
    display: flex;
    gap: 8px;
  }
  .hilfe,
  .meldung,
  .info {
    margin: 0;
    font-size: var(--t-klein);
    color: var(--tinte-leise);
    max-width: 44em;
  }
  .meldung.fehler {
    color: var(--rot);
    font-weight: 700;
  }
  .raster {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
  }
  .zeiten {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 10px;
  }
  .kinder {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 10px;
  }
  .kind-karte {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border-radius: 18px;
    box-shadow: inset 0 0 0 3px var(--kind);
  }
  input[type='date'] {
    padding: 0.45em 0.8em;
    border: 2px solid var(--linie);
    border-radius: 14px;
    background: var(--himmel);
    color: var(--tinte);
    font: inherit;
  }
  .farben {
    display: flex;
    gap: 6px;
  }
  .farbe {
    width: 32px;
    height: 32px;
    border: 3px solid var(--tafel);
    border-radius: 50%;
    background: var(--f);
    box-shadow: 0 0 0 2px var(--linie);
  }
  .farbe[aria-pressed='true'] {
    box-shadow: 0 0 0 3px var(--tinte);
  }
  .zeit-name {
    font-family: var(--schrift-titel);
    font-weight: 600;
  }
  .von-bis {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .von-bis .name {
    width: 2em;
  }
  .warnung {
    color: var(--rot);
    font-weight: 700;
    font-size: var(--t-klein);
  }
  .zeit {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    border-radius: 18px;
    background: var(--seg-hell);
  }
  .knopf:disabled {
    opacity: 0.4;
  }
</style>
