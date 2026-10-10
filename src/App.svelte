<script lang="ts">
  import { onMount, tick, untrack } from 'svelte'
  import AbschnittAnsicht from './ansichten/AbschnittAnsicht.svelte'
  import AufgabeAnsicht from './ansichten/AufgabeAnsicht.svelte'
  import JahresAnsicht from './ansichten/JahresAnsicht.svelte'
  import MonatsAnsicht from './ansichten/MonatsAnsicht.svelte'
  import DatumDialog from './dialoge/DatumDialog.svelte'
  import TagesAnsicht from './ansichten/TagesAnsicht.svelte'
  import WochenAnsicht from './ansichten/WochenAnsicht.svelte'
  import AktionDialog from './dialoge/AktionDialog.svelte'
  import AufgabeKopierenDialog from './dialoge/AufgabeKopierenDialog.svelte'
  import BearbeitenDialog from './dialoge/BearbeitenDialog.svelte'
  import EinstellungenDialog from './dialoge/EinstellungenDialog.svelte'
  import KopierenDialog from './dialoge/KopierenDialog.svelte'
  import Kopfzeile from './komponenten/Kopfzeile.svelte'
  import { abgleich, abgleichStarten, lokalGeaendert } from './lib/abgleich.svelte'
  import { gelbAb, rotAb } from './lib/ampel'
  import { abschnittInfo } from './lib/konstanten'
  import { bewegeFokus, ersterFokus, fokusSetzen, richtungAusTaste } from './lib/fokus'
  import { bildschirmAnlassen, zurueckTaste } from './lib/geraet'
  import { app, finde, planErneuert, oeffnen, schrittVerschieben, speichern, tagVerschieben, zurueck } from './lib/speicher.svelte'
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
  $effect(() => {
    speichern('einst', $state.snapshot(app.einst))
  })
  $effect(() => {
    speichern('timer', $state.snapshot(app.timer))
  })

  // ---------- Gerät ----------
  $effect(() => {
    void bildschirmAnlassen(app.einst.wach)
  })
  onMount(() => {
    void zurueckTaste(() => zurueck())
    // Neuer Wochenplan nach dem Update: auf dem Planer-Gerät gleich hochladen
    if (planErneuert) untrack(() => lokalGeaendert())
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

  // ---------- Timer: Töne bei Gelb und am Ende ----------
  $effect(() => {
    const jetzt = app.jetzt
    for (const [id, t] of Object.entries(app.timer)) {
      if (t.gestartet === null) continue
      const rest = t.dauerMs - (t.vergangenMs + (jetzt - t.gestartet))
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

<svelte:window onkeydown={taste} onpointerdown={tonFreischalten} />

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
</style>
