<script lang="ts">
  import { segVon } from '../lib/konstanten'
  import Fenster from '../komponenten/Fenster.svelte'
  import Symbol from '../komponenten/Symbol.svelte'
  import Bild from '../komponenten/Bild.svelte'
  import { deutscheStimmen, probeSprechen, type Stimme } from '../lib/vorlesen'
  import { onDestroy, onMount } from 'svelte'
  import ZeitWahl from '../komponenten/ZeitWahl.svelte'
  import Lizenzen from '../komponenten/Lizenzen.svelte'
  import { empfangStarten, empfangStoppen, fernseherSuchen, kopplung, kopplungMoeglich, planSenden, type Geraet } from '../lib/kopplung.svelte'
  import { abgleich, einstSpeichern, holen, hochladen, istEingerichtet, ruhebildFernLoeschen, ruhebildHochladen, statusHochladen } from '../lib/abgleich.svelte'
  import { ruhe, ruhebildEntfernen, ruhebildSpeichern, ruhebildVorbereiten } from '../lib/ruhebilder.svelte'
  import { ortSuchen, ortTeile, wetterAktualisieren } from '../lib/wetter.svelte'
  import { dateiExportieren, istApp } from '../lib/geraet'
  import { ABSCHNITTE } from '../lib/konstanten'
  import { abschnittAnlegen, abschnittLoeschen, app, exportDaten, importDaten, zeigeHinweis } from '../lib/speicher.svelte'
  import { neueId, startplan } from '../lib/startplan'
  import { minutenVon } from '../lib/zeit'
  import { installieren, suchen, update, updateVerfuegbar } from '../lib/update.svelte'

  let zuruecksetzenFragen = $state(false)
  // Kopplung Handy → Fernseher
  let loeschenFragen = $state<string | null>(null)
  let gewaehlt = $state<Geraet | null>(null)
  let codeEingabe = $state('')
  let ipEingabe = $state('')
  onDestroy(() => {
    if (kopplung.modus === 'wartet') void empfangStoppen()
  })
  let ruheUnter = $state<'wann' | 'bild'>('wann')

  // Reiter
  const REITER = [
    { id: 'geraet', name: 'Gerät' },
    { id: 'anzeige', name: 'Anzeige' },
    { id: 'sprache', name: 'Sprache' },
    { id: 'tag', name: 'Tagesablauf' },
    { id: 'ruhe', name: 'Ruhebild' },
    { id: 'abgleich', name: __STORE__ ? 'Daten & Info' : 'Abgleich & App' },
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

  // ---------- Wetter-Ort ----------
  let ortEingabe = $state('')
  let ortTreffer = $state<{ name: string; lat: number; lon: number; land: string }[]>([])
  let ortMeldung = $state('')
  const wetterName = $derived(ortTeile(app.einst.wetterOrt)?.name ?? '')
  async function ortSuche() {
    ortMeldung = ''
    if (!ortEingabe.trim()) return
    try {
      ortTreffer = await ortSuchen(ortEingabe.trim())
      if (!ortTreffer.length) ortMeldung = 'Kein Ort gefunden.'
    } catch {
      ortMeldung = 'Die Ortssuche ist gerade nicht erreichbar.'
    }
  }

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

{#snippet schalter(wert: boolean, setze: (v: boolean) => void)}
  <button class="knopf klein" aria-pressed={wert} onclick={() => setze(true)}>An</button>
  <button class="knopf klein" aria-pressed={!wert} onclick={() => setze(false)}>Aus</button>
{/snippet}

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
      <div class="z">
        <span class="zl">Aufgabe</span>
        <div class="zr">
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
        <p class="zh">
          {#if e.rolle === 'planer'}
            {__STORE__ ? 'Hier wird der Plan bearbeitet. Alle Daten bleiben auf diesem Gerät.' : 'Hier wird der Plan bearbeitet. Jede Änderung wird verschlüsselt hochgeladen.'}
          {:else}
            {__STORE__ ? 'Dieses Gerät zeigt den Plan nur an und ist gegen versehentliche Änderungen gesperrt.' : 'Der Plan kommt vom Handy oder PC. Die App schaut alle 2 Minuten nach Änderungen.'}
          {/if}
        </p>
      </div>
      <div class="z">
        <span class="zl">Bildschirm anlassen</span>
        <div class="zr">{@render schalter(app.einst.wach, (v) => (app.einst.wach = v))}</div>
      </div>
    </section>

    {#if kopplungMoeglich}
      <section>
        <h3>Plan auf den Fernseher übertragen</h3>
        <p class="zh">Beide Geräte müssen im selben WLAN sein. Es läuft kein Server dazwischen: Der Plan wird mit dem Code verschlüsselt und direkt gesendet.</p>
        <div class="z">
          <span class="zl">1. Am Fernseher</span>
          <div class="zr">
            {#if kopplung.modus === 'wartet'}
              <div class="kopplung-code">
                <span class="gross">{kopplung.code}</span>
                <span>Adresse {kopplung.ip}{kopplung.port !== 8765 ? ':' + kopplung.port : ''}</span>
              </div>
              <button class="knopf klein" onclick={() => void empfangStoppen()}>Abbrechen</button>
            {:else}
              <button class="knopf klein" onclick={() => void empfangStarten()}>Plan empfangen</button>
            {/if}
          </div>
          {#if kopplung.modus === 'wartet'}<p class="zh">Warte auf das Handy … Am Handy „Fernseher suchen“ wählen und den Code eintippen.</p>{/if}
        </div>
        <div class="z">
          <span class="zl">2. Am Handy</span>
          <div class="zr">
            <button class="knopf klein" onclick={() => ((gewaehlt = null), void fernseherSuchen())} disabled={kopplung.modus === 'sucht' || kopplung.modus === 'sendet'}>
              {kopplung.modus === 'sucht' ? 'Suche …' : 'Fernseher suchen'}
            </button>
            {#each kopplung.geraete as g (g.ip + g.port)}
              <button class="knopf klein" aria-pressed={gewaehlt?.ip === g.ip} onclick={() => (gewaehlt = g)}>{g.name} ({g.ip})</button>
            {/each}
          </div>
          {#if kopplung.modus === 'bereit' || kopplung.modus === 'sendet' || kopplung.modus === 'fertig'}
            <div class="zr">
              <input type="text" bind:value={ipEingabe} placeholder="oder Adresse des Fernsehers, z. B. 192.168.0.23" aria-label="Adresse des Fernsehers" />
            </div>
            <div class="zr">
              <input type="text" inputmode="numeric" maxlength="6" bind:value={codeEingabe} placeholder="Code vom Fernseher" aria-label="Code vom Fernseher" />
              <button
                class="knopf haupt klein"
                disabled={kopplung.modus === 'sendet' || codeEingabe.trim().length !== 6 || (!gewaehlt && !ipEingabe.trim())}
                onclick={() => void planSenden(gewaehlt ?? { ip: ipEingabe.trim(), port: 8765, name: ipEingabe.trim() }, codeEingabe)}
              >
                {kopplung.modus === 'sendet' ? 'Sende …' : 'Plan senden'}
              </button>
            </div>
          {/if}
        </div>
        {#if kopplung.meldung}<p class="meldung" class:fehler={kopplung.modus === 'bereit'}>{kopplung.meldung}</p>{/if}
      </section>
    {/if}
    {:else if reiter === 'anzeige'}
    <section>
      <h3>Aussehen</h3>
      <p class="zh">Gilt für alle Geräte.</p>
      <div class="z">
        <span class="zl">Helligkeit</span>
        <div class="zr">
          <button class="knopf klein" aria-pressed={app.einst.thema === 'auto'} onclick={() => (app.einst.thema = 'auto')}>Abends dunkel</button>
          <button class="knopf klein" aria-pressed={app.einst.thema === 'tag'} onclick={() => (app.einst.thema = 'tag')}>Immer hell</button>
          <button class="knopf klein" aria-pressed={app.einst.thema === 'nacht'} onclick={() => (app.einst.thema = 'nacht')}>Immer dunkel</button>
        </div>
      </div>
      <div class="z">
        <span class="zl">Uhr</span>
        <div class="zr">
          <button class="knopf klein" aria-pressed={(app.einst.uhrArt ?? 'digital') === 'digital'} onclick={() => (app.einst.uhrArt = 'digital')}>Digital</button>
          <button class="knopf klein" aria-pressed={app.einst.uhrArt === 'analog'} onclick={() => (app.einst.uhrArt = 'analog')}>Analog</button>
        </div>
      </div>
    </section>

    <section>
      <h3>Timer und Belohnung</h3>
      <div class="z">
        <span class="zl">Timer zeigen als</span>
        <div class="zr">
          <button class="knopf klein" aria-pressed={app.einst.timerArt === 'ampel'} onclick={() => (app.einst.timerArt = 'ampel')}>Ampel</button>
          <button class="knopf klein" aria-pressed={app.einst.timerArt === 'sanduhr'} onclick={() => (app.einst.timerArt = 'sanduhr')}>Sanduhr</button>
        </div>
      </div>
      <div class="z">
        <span class="zl">Töne (inkl. Countdown-Piepen)</span>
        <div class="zr">{@render schalter(app.einst.ton, (v) => (app.einst.ton = v))}</div>
      </div>
      <div class="z">
        <span class="zl">Sternenregen</span>
        <div class="zr">
          {#each [['alle', 'Bei allen Aufgaben'], ['auswahl', 'Nur ausgewählte'], ['aus', 'Aus']] as [wert, text] (wert)}
            <button class="knopf klein" aria-pressed={(app.einst.sternenregen ?? 'alle') === wert} onclick={() => (app.einst.sternenregen = wert as 'alle' | 'auswahl' | 'aus')}>{text}</button>
          {/each}
        </div>
      </div>
    </section>
    {:else if reiter === 'sprache'}
    <section>
      <h3>Vorlesen</h3>
      <p class="zh">Aufgaben, Lob, Uhrzeit und Timer werden laut angesagt.</p>
      <div class="z">
        <span class="zl">Vorlesen</span>
        <div class="zr">{@render schalter(app.einst.vorlesen, (v) => (app.einst.vorlesen = v))}</div>
      </div>
      <div class="z">
        <span class="zl">Zeit ansagen (10 / 5 / 1 Min)</span>
        <div class="zr">{@render schalter(app.einst.zeitAnsagen !== false, (v) => (app.einst.zeitAnsagen = v))}</div>
      </div>
    </section>

    {#if app.einst.vorlesen}
      <section>
        <h3>Stimme</h3>
        {#if stimmen.length}
          <div class="z">
            <span class="zl">Stimme</span>
            <div class="zr">
              <select id="stimme" bind:value={stimmeWahl} onchange={() => (app.einst.stimme = stimmeWahl || undefined)}>
                <option value="">Automatisch (beste Stimme)</option>
                {#each stimmen as s (s.uri)}
                  <option value={s.uri}>{stimmenName(s)}</option>
                {/each}
              </select>
              <button class="knopf klein" onclick={probeSprechen}><Symbol name="lautsprecher" />Probe hören</button>
            </div>
          </div>
        {:else if stimmenGeladen}
          <p class="zh">Auf diesem Gerät ist keine deutsche Stimme installiert. In den Android-Einstellungen unter „Sprachausgabe“ die Google-Sprachausgabe mit Deutsch installieren.</p>
          <div class="zr"><button class="knopf klein" onclick={probeSprechen}><Symbol name="lautsprecher" />Probe hören</button></div>
        {/if}
        <div class="z">
          <span class="zl">Tempo</span>
          <div class="zr">
            {#each TEMPI as t (t.wert)}
              <button class="knopf klein" aria-pressed={(app.einst.tempo ?? 0.85) === t.wert} onclick={() => ((app.einst.tempo = t.wert), probeSprechen())}>{t.name}</button>
            {/each}
          </div>
        </div>
      </section>
    {/if}
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
      <p class="hilfe">Tippe auf Bild oder Namen, um eine Tageszeit umzubenennen, ihr ein Bild oder eine Farbe zu geben. Jeder Abschnitt endet, wenn der nächste beginnt. Änderst du ein „bis“, verschiebt sich der Beginn des nächsten Abschnitts mit. Die letzte Tageszeit dauert bis zum Aufstehen am nächsten Tag.</p>
      <div class="reihe">
        <button class="knopf haupt klein" onclick={() => (app.dialog = { art: 'abschnittBild', id: abschnittAnlegen() })}>＋ Neue Tageszeit</button>
      </div>
      <div class="zeiten">
        {#each ABSCHNITTE as ab, i (ab.id)}
          {@const naechster = ABSCHNITTE[i + 1]}
          <div class="zeit" data-seg={segVon(ab.id)}>
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
                <span class="bis-auto">bis Aufstehen</span>
              {/if}
            </div>
            {#if ABSCHNITTE.length > 1}
              {#if loeschenFragen === ab.id}
                <div class="reihe">
                  <button class="knopf klein gefahr" onclick={() => (abschnittLoeschen(ab.id), (loeschenFragen = null))}>Ja, löschen</button>
                  <button class="knopf klein" onclick={() => (loeschenFragen = null)}>Nein</button>
                </div>
                <span class="hilfe">Die Aufgaben wandern in {ABSCHNITTE[Math.max(0, i === 0 ? 1 : i - 1)].name}.</span>
              {:else}
                <button class="knopf klein loeschen" onclick={() => (loeschenFragen = ab.id)} aria-label="{ab.name} löschen"><Symbol name="muell" />Löschen</button>
              {/if}
            {/if}
            {#if naechster && minutenVon(app.plan.zeiten[ab.id]) >= minutenVon(app.plan.zeiten[naechster.id])}
              <span class="warnung">„bis“ muss nach „von“ liegen</span>
            {/if}
          </div>
        {/each}
      </div>
    </section>
    {:else if reiter === 'ruhe'}
    <div class="unterreiter" role="tablist" aria-label="Ruhebild">
      <button class="unter-knopf" role="tab" aria-selected={ruheUnter === 'wann'} onclick={() => (ruheUnter = 'wann')}>Wann</button>
      <button class="unter-knopf" role="tab" aria-selected={ruheUnter === 'bild'} onclick={() => (ruheUnter = 'bild')}>Bild und Fotos</button>
    </div>
    {#if ruheUnter === 'wann'}
    <section>
      <h3>Wann erscheint das Ruhebild?</h3>
      <p class="zh">
        Nach einer Weile ohne Bedienung erscheint ein Ruhebild, wenn gerade kein Timer läuft. Hat eine Aufgabe eine feste Zeit (von–bis), wird sie in dieser Zeit groß gezeigt.
        Eine Taste auf der Fernbedienung oder Antippen führt zurück.
      </p>
      <div class="z">
        <span class="zl">Für alle Geräte</span>
        <div class="zr">{@render schalter((app.einst.ruhe ?? 'an') === 'an', (v) => (app.einst.ruhe = v ? 'an' : 'aus'))}</div>
      </div>
      <div class="z">
        <span class="zl">Nach</span>
        <div class="zr">
          {#each [2, 5, 10, 15, 30] as m (m)}
            <button class="knopf klein" aria-pressed={(app.einst.ruheWarten ?? 5) === m} onclick={() => (app.einst.ruheWarten = m)}>{m} Min</button>
          {/each}
        </div>
      </div>
      <div class="z">
        <span class="zl">Auf diesem Gerät</span>
        <div class="zr">
          <button class="knopf klein" aria-pressed={(app.einst.ruheHier ?? 'auto') === 'auto'} onclick={() => (app.einst.ruheHier = 'auto')}>Automatisch (nur Fernseher)</button>
          <button class="knopf klein" aria-pressed={app.einst.ruheHier === 'an'} onclick={() => (app.einst.ruheHier = 'an')}>Ja</button>
          <button class="knopf klein" aria-pressed={app.einst.ruheHier === 'aus'} onclick={() => (app.einst.ruheHier = 'aus')}>Nein</button>
        </div>
        <p class="zh">
          {(app.einst.ruheHier ?? 'auto') === 'auto' && abgleich.einst.rolle === 'planer'
            ? 'Dieses Gerät plant – hier erscheint das Ruhebild nur mit „Ja“.'
            : 'Ein laufender Timer hält das Ruhebild zurück; eine geöffnete Aufgabe ohne Timer nicht.'}
        </p>
      </div>
      <div class="z">
        <span class="zl">Nachts schwarz (Schlafen bis Aufstehen)</span>
        <div class="zr">{@render schalter(!!app.einst.ruheNacht, (v) => (app.einst.ruheNacht = v))}</div>
      </div>
      <div class="z">
        <span class="zl">Mini-Countdown in der Ecke</span>
        <div class="zr">{@render schalter(app.einst.ruheCountdown !== false, (v) => (app.einst.ruheCountdown = v))}</div>
      </div>
    </section>
    {:else}
    <section>
      <h3>Bild</h3>
      <div class="z">
        <span class="zl">Zeigen</span>
        <div class="zr">
          <button class="knopf klein" aria-pressed={(app.einst.ruheArt ?? 'jahreszeit') === 'jahreszeit'} onclick={() => (app.einst.ruheArt = 'jahreszeit')}>Jahreszeit</button>
          <button class="knopf klein" aria-pressed={app.einst.ruheArt === 'fotos'} onclick={() => (app.einst.ruheArt = 'fotos')}>Eigene Fotos</button>
          <button class="knopf klein" aria-pressed={app.einst.ruheArt === 'schwarz'} onclick={() => (app.einst.ruheArt = 'schwarz')}>Schwarz</button>
          <button class="knopf klein" onclick={() => ((app.dialog = null), (app.ruheVorschau = true))}>Vorschau zeigen</button>
        </div>
        {#if app.einst.ruheArt === 'schwarz'}<p class="zh">„Schwarz“ macht den Bildschirm ganz dunkel. Bewegen, Antippen oder eine Taste holt die App zurück.</p>{/if}
      </div>
    </section>
    {#if (app.einst.ruheArt ?? 'jahreszeit') === 'jahreszeit'}
      <section>
        <h3>Jahreszeiten-Bild</h3>
        <div class="z">
          <span class="zl">Namen unter den Bildern</span>
          <div class="zr">{@render schalter(!!app.einst.ruheNamen, (v) => (app.einst.ruheNamen = v))}</div>
        </div>
        {#if !__STORE__}
        <div class="feld">
          <span class="name">Echtes Wetter im Bild {wetterName ? `(jetzt: ${wetterName})` : ''}</span>
          <div class="reihe">
            <input type="text" bind:value={ortEingabe} placeholder="Ort, z. B. Göttingen" aria-label="Ort für das Wetter" onkeydown={(ev) => ev.key === 'Enter' && void ortSuche()} />
            <button class="knopf klein" onclick={() => void ortSuche()}>Suchen</button>
            {#if app.einst.wetterOrt}<button class="knopf klein" onclick={() => (app.einst.wetterOrt = undefined)}>Kein Wetter</button>{/if}
          </div>
          {#if ortTreffer.length}
            <div class="reihe">
              {#each ortTreffer as t (t.lat + ',' + t.lon)}
                <button class="knopf klein" onclick={() => ((app.einst.wetterOrt = `${t.name}|${t.lat}|${t.lon}`), (ortTreffer = []), void wetterAktualisieren(true))}>
                  {t.name}{t.land ? ` (${t.land})` : ''}
                </button>
              {/each}
            </div>
          {/if}
          {#if ortMeldung}<p class="zh">{ortMeldung}</p>{/if}
        </div>
        {/if}
      </section>
    {/if}
    {#if app.einst.ruheArt === 'fotos'}
      <section>
        <h3>Eigene Fotos</h3>
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
      </section>
    {/if}
    {/if}
    {:else if reiter === 'abgleich'}
    {#if !__STORE__}
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

    {/if}
    <section>
      <h3>{__STORE__ ? 'Plan sichern und teilen' : 'Sichern'}</h3>
      {#if __STORE__}
        <p class="zh">Alle Daten bleiben auf diesem Gerät. Um den Plan auf ein anderes Gerät zu bringen (Partner, Tablet, Fernseher), speicherst du ihn als Datei, schickst ihn per Nachricht oder E-Mail und lädst ihn dort wieder.</p>
      {/if}
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

    {#if !__STORE__}
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
    <section>
      <h3>Info und Datenschutz</h3>
      <Lizenzen />
    </section>
    {/if}

    <p class="info">
      Wochenplan {istApp ? 'App' : 'im Browser'}{update.aktuell ? ` · Version 1.0.${update.aktuell}` : ''}.
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
    gap: 6px;
    padding: 14px 16px;
    border: 2px solid var(--linie);
    border-radius: 20px;
  }
  .z {
    display: grid;
    grid-template-columns: minmax(9em, 13em) 1fr;
    gap: 4px 16px;
    align-items: center;
    padding: 10px 0;
    border-top: 1px solid var(--linie);
  }
  h3 + .z,
  .zh + .z {
    border-top: none;
  }
  .zl {
    font-weight: 700;
    font-size: var(--t-klein);
  }
  .zr {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
  }
  .zh {
    grid-column: 1 / -1;
    margin: 0;
    font-size: var(--t-klein);
    color: var(--tinte-leise);
    max-width: 44em;
  }
  .unterreiter {
    display: flex;
    gap: 4px;
    padding: 4px;
    border-radius: 999px;
    background: var(--himmel);
    align-self: flex-start;
  }
  .unter-knopf {
    padding: 0.4em 1.1em;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--tinte);
    font: inherit;
    font-weight: 700;
  }
  .unter-knopf[aria-selected='true'] {
    background: var(--tafel);
    box-shadow: 0 0 0 2px var(--tinte);
  }
  @media (max-width: 560px) {
    .z {
      grid-template-columns: 1fr;
    }
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
  .zeit-name {
    font-family: var(--schrift-titel);
    font-weight: 600;
  }
  .von-bis {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .zeit :global(.zeitwahl) {
    flex-wrap: nowrap;
    gap: 6px;
  }
  .zeit :global(.zeitwahl .knopf.rund) {
    width: 44px;
    height: 44px;
    min-height: 0;
    padding: 0;
  }
  .zeit :global(.zeitwahl .wert) {
    min-width: 3em;
    font-size: 22px;
  }
  .kopplung-code {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: var(--t-klein);
  }
  .kopplung-code .gross {
    font-family: var(--schrift-titel);
    font-weight: 700;
    font-size: 48px;
    letter-spacing: 0.15em;
    line-height: 1.1;
  }
  .bis-auto {
    font-weight: 700;
    color: var(--tinte-leise);
  }
  .von-bis {
    flex-wrap: wrap;
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
