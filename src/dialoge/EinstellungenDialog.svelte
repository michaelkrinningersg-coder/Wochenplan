<script lang="ts">
  import Fenster from '../komponenten/Fenster.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import Bild from '../komponenten/Bild.svelte'
  import { deutscheStimmen, probeSprechen, type Stimme } from '../lib/vorlesen'
  import { onMount } from 'svelte'
  import ZeitWahl from '../komponenten/ZeitWahl.svelte'
  import { abgleich, einstSpeichern, holen, hochladen, istEingerichtet, ruhebildFernLoeschen, ruhebildHochladen, statusHochladen } from '../lib/abgleich.svelte'
  import { ruhe, ruhebildEntfernen, ruhebildSpeichern, ruhebildVorbereiten } from '../lib/ruhebilder.svelte'
  import { dateiExportieren, istApp } from '../lib/geraet'
  import { ABSCHNITTE } from '../lib/konstanten'
  import { app, exportDaten, importDaten, zeigeHinweis } from '../lib/speicher.svelte'
  import { KIND_FARBEN, neueId, startplan } from '../lib/startplan'
  import { minutenVon } from '../lib/zeit'
  import { installieren, suchen, update, updateVerfuegbar } from '../lib/update.svelte'

  let zuruecksetzenFragen = $state(false)

  // Reiter
  const REITER = [
    { id: 'geraet', name: 'Gerät & Kinder' },
    { id: 'anzeige', name: 'Anzeige' },
    { id: 'sprache', name: 'Sprache' },
    { id: 'tag', name: 'Tagesablauf' },
    { id: 'ruhe', name: 'Ruhebild' },
    { id: 'abgleich', name: 'Abgleich & App' },
  ]
  const REITER_KEY = 'wochenplan.einst-reiter'
  let reiter = $state(
    (() => {
      try {
        return localStorage.getItem(REITER_KEY) || 'geraet'
      } catch {
        return 'geraet'
      }
    })(),
  )
  $effect(() => {
    try {
      localStorage.setItem(REITER_KEY, reiter)
    } catch {
      /* egal */
    }
  })

  // ---------- Fotos für das Ruhebild ----------
  let fotoFeld = $state<HTMLInputElement>()
  let ordnerFeld = $state<HTMLInputElement>()
  let fotoLaedt = $state(false)
  let fotoFortschritt = $state('')
  async function fotosGewaehlt(e: Event) {
    const dateien = [...((e.target as HTMLInputElement).files ?? [])].filter((f) => f.type.startsWith('image/')).slice(0, 40)
    ;(e.target as HTMLInputElement).value = ''
    if (!dateien.length) return
    fotoLaedt = true
    let n = 0
    for (const d of dateien) {
      fotoFortschritt = `${++n} von ${dateien.length}`
      try {
        const daten = await ruhebildVorbereiten(d)
        const id = neueId()
        await ruhebildSpeichern(id, daten)
        app.plan.ruhebilder = [...(app.plan.ruhebilder ?? []), id].slice(-60)
        void ruhebildHochladen(id, daten)
      } catch {
        zeigeHinweis(`${d.name} konnte nicht geladen werden.`)
      }
    }
    fotoLaedt = false
    zeigeHinweis(`${dateien.length} Foto${dateien.length === 1 ? '' : 's'} hinzugefügt`)
  }
  function fotoLoeschen(id: string) {
    app.plan.ruhebilder = (app.plan.ruhebilder ?? []).filter((x) => x !== id)
    void ruhebildEntfernen(id)
    void ruhebildFernLoeschen(id)
  }

  // Stimmen für die Sprachausgabe
  const TEMPI = [
    { name: 'Langsam', wert: 0.7 },
    { name: 'Normal', wert: 0.85 },
    { name: 'Schneller', wert: 1 },
  ]
  let stimmen = $state<Stimme[]>([])
  let stimmenGeladen = $state(false)
  let stimmeWahl = $state(app.einst.stimme ?? '')
  onMount(() => {
    void deutscheStimmen().then((l) => {
      stimmen = l
      stimmenGeladen = true
    })
  })
  function stimmenName(s: Stimme): string {
    const land = /AT/i.test(s.lang) ? ' (Österreich)' : /CH/i.test(s.lang) ? ' (Schweiz)' : ''
    return `${s.name}${land}${s.lokal ? '' : ' – online'}`
  }
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
    <div class="reiter" role="tablist" aria-label="Bereiche der Einstellungen">
      {#each REITER as r (r.id)}
        <button class="reiter-knopf" role="tab" aria-selected={reiter === r.id} onclick={() => (reiter = r.id)}>{r.name}</button>
      {/each}
    </div>
    {#if reiter === 'geraet'}
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
    {:else if reiter === 'anzeige'}
    <section>
      <h3>Darstellung</h3>
      <p class="hilfe">Diese Einstellungen gelten für alle Geräte.</p>
      <div class="reihe">
        <button class="knopf" aria-pressed={app.einst.thema === 'auto'} onclick={() => (app.einst.thema = 'auto')}>Abends dunkel</button>
        <button class="knopf" aria-pressed={app.einst.thema === 'tag'} onclick={() => (app.einst.thema = 'tag')}>Immer hell</button>
        <button class="knopf" aria-pressed={app.einst.thema === 'nacht'} onclick={() => (app.einst.thema = 'nacht')}>Immer dunkel</button>
      </div>
      <div class="reihe">
        <span class="name zeile">Uhr</span>
        <button class="knopf" aria-pressed={(app.einst.uhrArt ?? 'digital') === 'digital'} onclick={() => (app.einst.uhrArt = 'digital')}>Digital 10:51</button>
        <button class="knopf" aria-pressed={app.einst.uhrArt === 'analog'} onclick={() => (app.einst.uhrArt = 'analog')}>Analog mit Zeigern</button>
      </div>
    </section>

    <section>
      <h3>Timer und Belohnung</h3>
      <div class="reihe">
        <span class="name zeile">Timer zeigen als</span>
        <button class="knopf" aria-pressed={app.einst.timerArt === 'ampel'} onclick={() => (app.einst.timerArt = 'ampel')}>Ampel</button>
        <button class="knopf" aria-pressed={app.einst.timerArt === 'sanduhr'} onclick={() => (app.einst.timerArt = 'sanduhr')}>Sanduhr</button>
      </div>
      <div class="reihe">
        <button class="knopf" aria-pressed={app.einst.ton} onclick={() => (app.einst.ton = !app.einst.ton)}>Töne {app.einst.ton ? 'an' : 'aus'}</button>
      </div>
      <div class="reihe">
        <span class="name zeile">Sternenregen</span>
        {#each [['alle', 'bei allen Aufgaben'], ['auswahl', 'nur ausgewählte'], ['aus', 'aus']] as [wert, text] (wert)}
          <button class="knopf klein" aria-pressed={(app.einst.sternenregen ?? 'alle') === wert} onclick={() => (app.einst.sternenregen = wert as 'alle' | 'auswahl' | 'aus')}>{text}</button>
        {/each}
      </div>
    </section>

    <section>
      <h3>Dieses Gerät</h3>
      <div class="reihe">
        <button class="knopf" aria-pressed={app.einst.wach} onclick={() => (app.einst.wach = !app.einst.wach)}>
          Bildschirm anlassen: {app.einst.wach ? 'ja' : 'nein'}
        </button>
      </div>
    </section>
    {:else if reiter === 'sprache'}
    <section>
      <h3>Vorlesen</h3>
      <p class="hilfe">Aufgaben, Lob, Uhrzeit und Timer werden laut angesagt.</p>
      <div class="reihe">
        <button class="knopf" aria-pressed={app.einst.vorlesen} onclick={() => (app.einst.vorlesen = !app.einst.vorlesen)}>
          Vorlesen {app.einst.vorlesen ? 'an' : 'aus'}
        </button>
        <button class="knopf" aria-pressed={app.einst.zeitAnsagen !== false} onclick={() => (app.einst.zeitAnsagen = app.einst.zeitAnsagen === false)}>
          Zeit ansagen (10 / 5 / 1 Min): {app.einst.zeitAnsagen !== false ? 'ja' : 'nein'}
        </button>
      </div>
          {#if app.einst.vorlesen}
        <div class="stimme">
          <span class="name">Stimme zum Vorlesen</span>
          {#if stimmen.length}
            <div class="reihe">
              <select id="stimme" bind:value={stimmeWahl} onchange={() => (app.einst.stimme = stimmeWahl || undefined)}>
                <option value="">Automatisch (beste Stimme)</option>
                {#each stimmen as s (s.uri)}
                  <option value={s.uri}>{stimmenName(s)}</option>
                {/each}
              </select>
              <button class="knopf" onclick={probeSprechen}><Symbol name="lautsprecher" />Probe hören</button>
            </div>
          {:else if stimmenGeladen}
            <p class="hilfe">Auf diesem Gerät ist keine deutsche Stimme installiert. In den Android-Einstellungen unter „Sprachausgabe“ die Google-Sprachausgabe mit Deutsch installieren.</p>
            <div class="reihe"><button class="knopf" onclick={probeSprechen}><Symbol name="lautsprecher" />Probe hören</button></div>
          {/if}
          <div class="reihe">
            <span class="name zeile">Tempo</span>
            {#each TEMPI as t (t.wert)}
              <button class="knopf klein" aria-pressed={(app.einst.tempo ?? 0.85) === t.wert} onclick={() => ((app.einst.tempo = t.wert), probeSprechen())}>{t.name}</button>
            {/each}
          </div>
        </div>
      {/if}
    </section>
    {:else if reiter === 'tag'}
    <section>
      <h3>Tagesabläufe</h3>
      <p class="hilfe">Abläufe wie „Kita-Tag“, „Ferien“ oder „Wochenende“ speichern und einer Woche (Mo–Fr, Sa, So getrennt) oder einem Datum zuordnen. Tage kopieren.</p>
      <div class="reihe">
        <button class="knopf haupt" onclick={() => (app.dialog = { art: 'ablaeufe' })}><Symbol name="kalender" />Tagesabläufe und Wochen</button>
      </div>
    </section>

    <section>
      <h3>Tageszeiten</h3>
      <p class="hilfe">Tippe auf Bild oder Namen, um eine Tageszeit umzubenennen oder ihr ein eigenes Bild zu geben. Jeder Abschnitt endet, wenn der nächste beginnt. Änderst du ein „bis“, verschiebt sich der Beginn des nächsten Abschnitts mit.</p>
      <div class="zeiten">
        {#each ABSCHNITTE as ab, i (ab.id)}
          {@const naechster = ABSCHNITTE[i + 1]}
          <div class="zeit" data-seg={ab.id}>
            <button class="zeit-name" onclick={() => (app.dialog = { art: 'abschnittBild', id: ab.id })} aria-label="{ab.name}: Name und Bild ändern">
              <span class="zeit-bild"><Bild id={ab.bild} /></span>
              <span>{ab.name}</span>
              <Symbol name="stift" />
            </button>
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
    {:else if reiter === 'ruhe'}
    <section>
      <h3>Ruhebild und Live-Modus</h3>
      <p class="hilfe">
        Auf dem Fernseher erscheint nach einer Weile ohne Bedienung ein Ruhebild, wenn gerade kein Timer läuft. Hat eine Aufgabe eine feste Zeit
        (von–bis), wird sie in dieser Zeit groß gezeigt. Eine Taste auf der Fernbedienung oder Antippen führt zurück.
      </p>
      <div class="reihe">
        <button class="knopf klein" aria-pressed={(app.einst.ruhe ?? 'an') === 'an'} onclick={() => (app.einst.ruhe = 'an')}>An</button>
        <button class="knopf klein" aria-pressed={app.einst.ruhe === 'aus'} onclick={() => (app.einst.ruhe = 'aus')}>Aus</button>
        <span class="name zeile">nach</span>
        {#each [2, 5, 10, 15, 30] as m (m)}
          <button class="knopf klein" aria-pressed={(app.einst.ruheWarten ?? 5) === m} onclick={() => (app.einst.ruheWarten = m)}>{m} Min</button>
        {/each}
      </div>
      <div class="reihe">
        <span class="name zeile">Bild</span>
        <button class="knopf klein" aria-pressed={(app.einst.ruheArt ?? 'jahreszeit') === 'jahreszeit'} onclick={() => (app.einst.ruheArt = 'jahreszeit')}>Jahreszeit</button>
        <button class="knopf klein" aria-pressed={app.einst.ruheArt === 'fotos'} onclick={() => (app.einst.ruheArt = 'fotos')}>Eigene Fotos</button>
        <button class="knopf klein" onclick={() => ((app.dialog = null), (app.ruheVorschau = true))}>Vorschau zeigen</button>
      </div>
      {#if (app.einst.ruheArt ?? 'jahreszeit') === 'jahreszeit'}
        <div class="reihe">
          <button class="knopf klein" aria-pressed={!!app.einst.ruheNamen} onclick={() => (app.einst.ruheNamen = !app.einst.ruheNamen)}>
            Namen unter den Bildern: {app.einst.ruheNamen ? 'ja' : 'nein'}
          </button>
        </div>
      {/if}
      {#if app.einst.ruheArt === 'fotos'}
        <div class="reihe">
          <button class="knopf" onclick={() => fotoFeld?.click()} disabled={fotoLaedt}><Symbol name="bild" />Fotos hinzufügen</button>
          {#if !istApp}<button class="knopf" onclick={() => ordnerFeld?.click()} disabled={fotoLaedt}>Ganzen Ordner</button>{/if}
          <span class="name zeile">Wechsel alle</span>
          {#each [10, 20, 60] as sek (sek)}
            <button class="knopf klein" aria-pressed={(app.einst.ruheWechsel ?? 20) === sek} onclick={() => (app.einst.ruheWechsel = sek)}>{sek} s</button>
          {/each}
        </div>
        <input bind:this={fotoFeld} type="file" accept="image/*" multiple hidden onchange={fotosGewaehlt} />
        <input bind:this={ordnerFeld} type="file" accept="image/*" multiple hidden webkitdirectory onchange={fotosGewaehlt} />
        {#if fotoLaedt}<p class="hilfe">Fotos werden vorbereitet … {fotoFortschritt}</p>{/if}
        {#if (app.plan.ruhebilder ?? []).length}
          <div class="ruhefotos">
            {#each app.plan.ruhebilder ?? [] as id (id)}
              <div class="ruhefoto">
                {#if ruhe.bilder[id]}<img src={ruhe.bilder[id]} alt="" />{:else}<span class="laedt">…</span>{/if}
                <button class="knopf klein gefahr" onclick={() => fotoLoeschen(id)} aria-label="Foto entfernen"><Symbol name="muell" /></button>
              </div>
            {/each}
          </div>
        {:else}
          <p class="hilfe">Noch keine Fotos. Ohne Fotos wird das Jahreszeiten-Bild gezeigt.</p>
        {/if}
      {/if}
    </section>
    {:else if reiter === 'abgleich'}
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
    {/if}

    <p class="info">
      Wochenplan {istApp ? 'App' : 'im Browser'}. Bilder: Microsoft Fluent Emoji (MIT-Lizenz). Schriften: Fredoka und Andika (SIL Open Font License).
    </p>
  </div>
</Fenster>

<style>
  .reiter {
    position: sticky;
    top: -2px;
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 4px 0 10px;
    background: var(--tafel);
    border-bottom: 2px solid var(--linie);
  }
  .reiter-knopf {
    padding: 0.45em 0.9em;
    border: 2px solid var(--linie);
    border-radius: 999px;
    background: var(--himmel);
    color: var(--tinte);
    font: inherit;
    font-weight: 700;
  }
  .reiter-knopf[aria-selected='true'] {
    border-color: var(--tinte);
    background: var(--tinte);
    color: var(--tafel);
  }
  .reiter-knopf:focus-visible {
    outline: 3px solid var(--gelb);
    outline-offset: 2px;
  }
  .ruhefotos {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 8px;
  }
  .ruhefoto {
    position: relative;
    aspect-ratio: 16 / 10;
    border-radius: 12px;
    overflow: hidden;
    background: var(--himmel);
  }
  .ruhefoto img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .ruhefoto .knopf {
    position: absolute;
    right: 4px;
    bottom: 4px;
    min-height: 0;
    padding: 5px;
    font-size: 14px;
    border-radius: 50%;
  }
  .laedt {
    display: grid;
    place-items: center;
    height: 100%;
  }
  .stimme {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  select {
    min-width: 0;
    max-width: 100%;
    padding: 0.5em 0.8em;
    border: 2px solid var(--linie);
    border-radius: 14px;
    background: var(--himmel);
    color: var(--tinte);
    font: inherit;
  }
  .zeit-name {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px 4px 4px;
    border: 2px solid transparent;
    border-radius: 14px;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 700;
    text-align: left;
  }
  .zeit-name:hover,
  .zeit-name:focus-visible {
    border-color: var(--tinte);
  }
  .zeit-name :global(svg) {
    margin-left: auto;
    opacity: 0.5;
  }
  .zeit-bild {
    width: 36px;
    height: 36px;
    flex: none;
  }
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
