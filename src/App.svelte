<script lang="ts">
  import { GETEILTE_OPTIONEN, type GeteilteOptionen } from './lib/typen'
  import { onMount, tick, untrack } from 'svelte'
  import AbschnittAnsicht from './ansichten/AbschnittAnsicht.svelte'
  import AufgabeAnsicht from './ansichten/AufgabeAnsicht.svelte'
  import JahresAnsicht from './ansichten/JahresAnsicht.svelte'
  import MonatsAnsicht from './ansichten/MonatsAnsicht.svelte'
  import DatumDialog from './dialoge/DatumDialog.svelte'
  import TagesAnsicht from './ansichten/TagesAnsicht.svelte'
  import WochenAnsicht from './ansichten/WochenAnsicht.svelte'
  import AbschnittDialog from './dialoge/AbschnittDialog.svelte'
  import AblaeufeDialog from './dialoge/AblaeufeDialog.svelte'
  import GrosseUhr from './komponenten/GrosseUhr.svelte'
  import LaufendeTimer from './komponenten/LaufendeTimer.svelte'
  import Ruhebild from './komponenten/Ruhebild.svelte'
  import { ruhebilderLaden } from './lib/ruhebilder.svelte'
  import AktionDialog from './dialoge/AktionDialog.svelte'
  import AufgabeKopierenDialog from './dialoge/AufgabeKopierenDialog.svelte'
  import BearbeitenDialog from './dialoge/BearbeitenDialog.svelte'
  import EinstellungenDialog from './dialoge/EinstellungenDialog.svelte'
  import KopierenDialog from './dialoge/KopierenDialog.svelte'
  import Kopfzeile from './komponenten/Kopfzeile.svelte'
  import { updatePruefungStarten } from './lib/update.svelte'
  import { endeAnsagen, restAnsagen, startAnsagen } from './lib/vorlesen'
  import { ruhebilderAbgleichen, abgleich, abgleichStarten, erledigtGeaendert, lokalGeaendert } from './lib/abgleich.svelte'
  import { gelbAb, rotAb } from './lib/ampel'
  import { abschnittInfo } from './lib/konstanten'
  import { bewegeFokus, ersterFokus, fokusSetzen, richtungAusTaste } from './lib/fokus'
  import { bildschirmAnlassen, zurueckTaste } from './lib/geraet'
  import { app, finde, minutenBisStart, tagesListe, planErneuert, planUmgestellt, oeffnen, schrittVerschieben, speichern, tagVerschieben, zurueck } from './lib/speicher.svelte'
  import { spieleTon, tonFreischalten } from './lib/ton'
  import { heuteTag, tagesPhase } from './lib/zeit'

  let appEl: HTMLDivElement
  let buehne: HTMLElement

  // ---------- Uhr ----------
  onMount(() => {
    const id = setInterval(() => (app.jetzt = Date.now()), 1000)
    return () => clearInterval(id)
  })

  // ---------- Speichern ----------
  let ersterPlanLauf = true
  $effect(() => {
    const plan = $state.snapshot(app.plan)
    const fotos = $state.snapshot(app.fotos)
    const okPlan = speichern('plan', plan)
    const okFotos = speichern('fotos', fotos)
    if (!okPlan || !okFotos) app.hinweis = 'Der Speicher ist voll. Bitte weniger oder kleinere Fotos verwenden.'
    if (ersterPlanLauf) {
      ersterPlanLauf = false
      return
    }
    // untrack: der Abgleich liest/schreibt eigenen Zustand, das soll diesen Effekt nicht neu auslösen
    untrack(() => lokalGeaendert())
  })
  $effect(() => {
    speichern('erledigt', $state.snapshot(app.erledigt))
  })
  // Abhaken auf diesem Gerät an die anderen Geräte melden
  $effect(() => {
    if (app.abgehakt) untrack(() => erledigtGeaendert())
  })
  $effect(() => {
    speichern('einst', $state.snapshot(app.einst))
  })

  // ---------- Gemeinsame Optionen (Timer-Art, Uhr, Vorlesen …) für alle Geräte ----------
  // Plan → dieses Gerät
  $effect(() => {
    const o = app.plan.optionen
    if (!o) return
    untrack(() => {
      const einst = app.einst as unknown as Record<string, unknown>
      for (const k of GETEILTE_OPTIONEN) if (o[k] !== undefined && einst[k] !== o[k]) einst[k] = o[k]
    })
  })
  // dieses Gerät → Plan (nur Planer; geht dann mit dem Plan an alle Geräte)
  $effect(() => {
    const werte = GETEILTE_OPTIONEN.map((k) => app.einst[k])
    if (abgleich.einst.rolle !== 'planer') return
    untrack(() => {
      const neu: Record<string, unknown> = {}
      GETEILTE_OPTIONEN.forEach((k, i) => {
        if (werte[i] !== undefined) neu[k] = werte[i]
      })
      if (JSON.stringify(neu) !== JSON.stringify(app.plan.optionen ?? {})) app.plan.optionen = neu as GeteilteOptionen
    })
  })
  $effect(() => {
    speichern('timer', $state.snapshot(app.timer))
  })

  // ---------- Gerät ----------
  $effect(() => {
    void bildschirmAnlassen(app.einst.wach)
  })
  onMount(() => {
    void zurueckTaste(() => {
      if (ruheAktiv) {
        aufwachen()
        return true
      }
      return zurueck()
    })
    void ruhebilderLaden().then(() => ruhebilderAbgleichen())
    // Neuer Wochenplan nach dem Update: auf dem Planer-Gerät gleich hochladen
    if (planErneuert || planUmgestellt) untrack(() => lokalGeaendert())
    return updatePruefungStarten()
  })

  // ---------- Abgleich ----------
  $effect(() => {
    // neu starten, wenn sich Rolle oder Zugangsdaten ändern
    void abgleich.einst.rolle
    void abgleich.einst.passwort
    void abgleich.einst.token
    return untrack(() => abgleichStarten())
  })

  // ---------- Darstellung ----------
  const thema = $derived.by(() => {
    if (app.einst.thema !== 'auto') return app.einst.thema
    const p = tagesPhase(app.plan, new Date(app.jetzt))
    return p.art === 'abschnitt' && !abschnittInfo(p.id).nacht ? 'tag' : 'nacht'
  })

  // Bearbeiten nur auf dem Planer-Gerät
  $effect(() => {
    if (abgleich.einst.rolle === 'anzeige' && app.bearbeiten) app.bearbeiten = false
  })

  // ---------- Countdown bis zu Aufgaben mit fester Uhrzeit (nur Anzeige-Geräte, damit nicht alle Handys sprechen) ----------
  const startGesagt = new Set<string>()
  let letzteMinute = -1
  $effect(() => {
    const minute = Math.floor(app.jetzt / 60_000)
    if (minute === letzteMinute) return
    letzteMinute = minute
    untrack(() => {
      if (abgleich.einst.rolle === 'planer') return
      const tag = heuteTag()
      for (const { aufgabe } of tagesListe(tag)) {
        const bis = minutenBisStart(tag, aufgabe)
        if (bis === null || !MARKEN.includes(bis)) continue
        const key = `${new Date().toDateString()}:${aufgabe.id}:${bis}`
        if (startGesagt.has(key)) continue
        startGesagt.add(key)
        startAnsagen(bis, aufgabe.titel)
      }
    })
  })

  // ---------- Timer: Töne und Ansagen bei Gelb, Rot und am Ende ----------
  const MARKEN = [10, 5, 1]
  function titelVon(id: string) {
    return finde(heuteTag(), id)?.aufgabe.titel
  }

  $effect(() => {
    const jetzt = app.jetzt
    for (const [id, t] of Object.entries(app.timer)) {
      if (t.gestartet === null) continue
      const rest = t.dauerMs - (t.vergangenMs + (jetzt - t.gestartet))
      // Sprecher: noch 10 / 5 / 1 Minute (nur Marken, die kürzer als der ganze Timer sind)
      if (rest > 0) {
        const faellig = MARKEN.filter((m) => t.dauerMs > m * 60_000 + 20_000 && rest <= m * 60_000 && !(t.angesagt ?? []).includes(m))
        if (faellig.length) {
          const m = Math.min(...faellig)
          t.angesagt = [...(t.angesagt ?? []), ...MARKEN.filter((x) => x >= m)]
          untrack(() => {
            const titel = titelVon(id)
            if (titel) setTimeout(() => restAnsagen(m, titel), 1200)
          })
        }
      }
      if (!t.gelbGemeldet && rest <= gelbAb(t.dauerMs) && rest > rotAb(t.dauerMs)) {
        t.gelbGemeldet = true
        if (app.einst.ton) spieleTon('gelb')
      }
      if (!t.rotGemeldet && rest <= rotAb(t.dauerMs) && rest > 0) {
        t.rotGemeldet = t.gelbGemeldet = true
        if (app.einst.ton) spieleTon('rot')
      }
      if (!t.endeGemeldet && rest <= 0) {
        t.endeGemeldet = true
        if (app.einst.ton) spieleTon('ende')
        untrack(() => {
          const titel = titelVon(id)
          if (titel) setTimeout(() => endeAnsagen(titel), 1200)
        })
        // Kinder sehen sofort, welche Aufgabe abgelaufen ist
        untrack(() => {
          const tag = heuteTag()
          const f = finde(tag, id)
          if (f && app.ansicht.art !== 'aufgabe' && !app.dialog && !app.bearbeiten) {
            oeffnen({ art: 'aufgabe', tag, abschnitt: f.abschnitt, id })
          }
        })
      }
    }
  })

  // ---------- Neuer Tag: um Mitternacht auf heute springen ----------
  let letzterTag = heuteTag()
  $effect(() => {
    const t = heuteTag(new Date(app.jetzt))
    if (t !== letzterTag) {
      const vorher = letzterTag
      letzterTag = t
      if (app.ansicht.art === 'tag' && app.ansicht.tag === vorher) oeffnen({ art: 'tag', tag: t })
    }
  })

  // ---------- Fokus nach Ansichtswechsel ----------
  $effect(() => {
    void app.ansicht
    const ziel = app.fokusZiel
    void tick().then(() => {
      if (app.dialog) return
      const el = ziel ? appEl?.querySelector<HTMLElement>(`[data-fokus-id="${ziel}"]`) : null
      if (!fokusSetzen(el) && buehne) ersterFokus(buehne)
      app.fokusZiel = null
    })
  })

  // ---------- Tasten (Fernbedienung, Tastatur) ----------
  function istEingabe(el: Element | null): boolean {
    if (!el) return false
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true
    return el instanceof HTMLInputElement && !['button', 'checkbox', 'radio', 'submit', 'file'].includes(el.type)
  }

  async function verschiebeTaste(e: KeyboardEvent) {
    const v = app.verschieben
    if (!v) return
    const r = richtungAusTaste(e.key)
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape' || e.key === 'Backspace') {
      e.preventDefault()
      app.verschieben = null
      return
    }
    if (!r) return
    e.preventDefault()
    let tag = v.tag
    const woche = app.ansicht.art === 'woche'
    if (woche && (r === 'links' || r === 'rechts')) {
      tag = tagVerschieben(v.tag, v.id, r === 'links' ? -1 : 1)
      app.verschieben = { tag, id: v.id }
    } else {
      schrittVerschieben(v.tag, v.id, r === 'links' || r === 'hoch' ? -1 : 1)
    }
    // in der Abschnittsansicht mitwandern, wenn die Aufgabe den Abschnitt verlässt
    const f = finde(tag, v.id)
    const a = app.ansicht
    if (f && a.art === 'abschnitt' && a.abschnitt !== f.abschnitt) {
      app.ansicht = { art: 'abschnitt', tag, abschnitt: f.abschnitt }
    }
    await tick()
    fokusSetzen(appEl.querySelector<HTMLElement>(`[data-fokus-id="aufgabe:${v.id}"]`))
  }

  // ---------- Live-Modus / Ruhebild nach Inaktivität (nur Anzeige-Geräte; Vorschau überall) ----------
  let letzteAktivitaet = $state(Date.now())
  const timerLaeuft = $derived(
    Object.values(app.timer).some((t) => t.gestartet !== null && t.dauerMs - (t.vergangenMs + (app.jetzt - t.gestartet)) > 0),
  )
  /** Ruhebild käme, wenn lange genug nichts passiert (alles außer der Wartezeit erfüllt) */
  const ruheMoeglich = $derived(
    (app.einst.ruheHier === 'an' || ((app.einst.ruheHier ?? 'auto') === 'auto' && abgleich.einst.rolle === 'anzeige')) &&
      (app.einst.ruhe ?? 'an') === 'an' &&
      !timerLaeuft &&
      !app.dialog &&
      !app.bearbeiten,
  )
  const ruheRestMs = $derived((app.einst.ruheWarten ?? 5) * 60_000 - (app.jetzt - letzteAktivitaet))
  const ruheAktiv = $derived(app.ruheVorschau || (ruheMoeglich && ruheRestMs < 0))
  function aufwachen() {
    const warAktiv = ruheAktiv
    letzteAktivitaet = Date.now()
    if (app.ruheVorschau) {
      app.ruheVorschau = false
      return
    }
    // nach dem Ruhebild wieder beim heutigen Tag starten
    if (warAktiv && app.ansicht.art !== 'aufgabe') oeffnen({ art: 'tag', tag: heuteTag() })
  }
  function bedient(e: Event) {
    // Antippen einer Überraschung im Ruhebild: nur spielen, nicht aufwachen
    if (ruheAktiv && e.type === 'pointerdown' && (e.target as Element | null)?.closest?.('[data-spiel]')) return
    if (ruheAktiv) {
      // die Taste/der Tipp weckt nur auf und löst sonst nichts aus
      e.preventDefault()
      e.stopImmediatePropagation()
      aufwachen()
      return
    }
    letzteAktivitaet = Date.now()
  }
  // neue Fotos holen, wenn sich die Liste im Plan ändert
  $effect(() => {
    void app.plan.ruhebilder
    untrack(() => void ruhebilderAbgleichen())
  })

  function taste(e: KeyboardEvent) {
    tonFreischalten()
    if (app.verschieben) {
      void verschiebeTaste(e)
      return
    }
    const aktiv = document.activeElement
    const r = richtungAusTaste(e.key)
    if (r) {
      if (istEingabe(aktiv) && (r === 'links' || r === 'rechts')) return
      const dialog = document.querySelector<HTMLElement>('dialog[open]')
      bewegeFokus(r, dialog ?? appEl)
      e.preventDefault()
      return
    }
    if (e.key === 'Escape' || e.key === 'GoBack' || e.key === 'BrowserBack' || (e.key === 'Backspace' && !istEingabe(aktiv))) {
      e.preventDefault()
      zurueck()
    }
  }
</script>

<svelte:window
  onkeydown={taste}
  onpointerdown={tonFreischalten}
  onkeydowncapture={bedient}
  onpointerdowncapture={bedient}
  onpointermove={(e) => {
    // Maus/Finger über einer Überraschung im Ruhebild: nicht aufwachen (sonst kann man sie nicht antippen)
    if (ruheAktiv && (e.target as Element | null)?.closest?.('[data-spiel]')) return
    letzteAktivitaet = Date.now()
  }}
  onwheel={() => (letzteAktivitaet = Date.now())}
/>

<div class="app" data-thema={thema} bind:this={appEl}>
  <Kopfzeile />
  <main class="buehne" bind:this={buehne}>
    {#key app.ansicht.art}
      {#if app.ansicht.art === 'woche'}
        <WochenAnsicht />
      {:else if app.ansicht.art === 'tag'}
        <TagesAnsicht tag={app.ansicht.tag} />
      {:else if app.ansicht.art === 'abschnitt'}
        <AbschnittAnsicht tag={app.ansicht.tag} abschnitt={app.ansicht.abschnitt} />
      {:else if app.ansicht.art === 'monat'}
        <MonatsAnsicht jahr={app.ansicht.jahr} monat={app.ansicht.monat} />
      {:else if app.ansicht.art === 'jahr'}
        <JahresAnsicht jahr={app.ansicht.jahr} />
      {:else}
        <AufgabeAnsicht tag={app.ansicht.tag} abschnitt={app.ansicht.abschnitt} id={app.ansicht.id} />
      {/if}
    {/key}
  </main>
  <LaufendeTimer />
  {#if ruheAktiv}
    <Ruhebild onwecken={aufwachen} />
  {:else if ruheMoeglich && app.einst.ruheCountdown !== false}
    <div class="ruhe-countdown" aria-hidden="true" title="Bis zum Ruhebild">
      ☾ {Math.floor(Math.max(0, ruheRestMs) / 60_000)}:{String(Math.floor((Math.max(0, ruheRestMs) % 60_000) / 1000)).padStart(2, '0')}
    </div>
  {/if}

  {#if app.dialog?.art === 'bearbeiten'}
    {#key app.dialog.aufgabe.id}
      <BearbeitenDialog tag={app.dialog.tag} abschnitt={app.dialog.abschnitt} aufgabe={app.dialog.aufgabe} neu={app.dialog.neu} />
    {/key}
  {:else if app.dialog?.art === 'aktion'}
    <AktionDialog tag={app.dialog.tag} id={app.dialog.id} />
  {:else if app.dialog?.art === 'datum'}
    {#key app.dialog.datum}
      <DatumDialog datum={app.dialog.datum} />
    {/key}
  {:else if app.dialog?.art === 'termin'}
    {#key app.dialog.termin.id}
      <BearbeitenDialog
        tag={heuteTag()}
        abschnitt={app.dialog.termin.abschnitt}
        aufgabe={app.dialog.termin}
        neu={app.dialog.neu}
        datum={app.dialog.termin.datum}
      />
    {/key}
  {:else if app.dialog?.art === 'aufgabeKopieren'}
    <AufgabeKopierenDialog tag={app.dialog.tag} id={app.dialog.id} />
  {:else if app.dialog?.art === 'kopieren'}
    <KopierenDialog tag={app.dialog.tag} />
  {:else if app.dialog?.art === 'einstellungen'}
    <EinstellungenDialog />
  {:else if app.dialog?.art === 'abschnittBild'}
    <AbschnittDialog id={app.dialog.id} />
  {:else if app.dialog?.art === 'ablaeufe'}
    <AblaeufeDialog />
  {:else if app.dialog?.art === 'uhr'}
    <GrosseUhr />
  {/if}

  {#if app.hinweis}
    <div class="hinweis" role="status">{app.hinweis}</div>
  {/if}
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--himmel);
    color: var(--tinte);
    overflow: hidden;
  }
  .buehne {
    flex: 1;
    min-height: 0;
    padding: 0 var(--rand) var(--rand);
    overflow: hidden;
  }
  .hinweis {
    position: fixed;
    left: 50%;
    bottom: calc(18px + env(safe-area-inset-bottom, 0px));
    transform: translateX(-50%);
    max-width: calc(100vw - 32px);
    padding: 10px 20px;
    border-radius: 999px;
    background: var(--tinte);
    color: var(--tafel);
    font-weight: 700;
    font-size: var(--t-klein);
    text-align: center;
    box-shadow: 0 8px 24px var(--schatten);
    z-index: 50;
  }
  @media (max-width: 700px) {
    .buehne {
      overflow: auto;
    }
  }
  .ruhe-countdown {
    position: fixed;
    left: 10px;
    bottom: 8px;
    z-index: 20;
    padding: 2px 9px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.08);
    color: var(--tinte-leise);
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    pointer-events: none;
  }
</style>
