import { ABSCHNITTE, TAGE } from './konstanten'
import { neueId, planNormalisieren, startplan } from './startplan'
import type {
  AbschnittId,
  Ansicht,
  Aufgabe,
  Dialog,
  Einstellungen,
  Fundstelle,
  Plan,
  TagId,
  TimerZustand,
} from './typen'
import { datumKey, heuteTag, minutenJetzt, minutenVon, tagesPhase } from './zeit'

const SCHLUESSEL = {
  plan: 'wochenplan.plan.v1',
  fotos: 'wochenplan.fotos.v1',
  erledigt: 'wochenplan.erledigt.v1',
  einst: 'wochenplan.einstellungen.v1',
  timer: 'wochenplan.timer.v1',
}

function laden<T>(key: string, ersatz: T): T {
  try {
    const s = localStorage.getItem(key)
    return s ? (JSON.parse(s) as T) : ersatz
  } catch {
    return ersatz
  }
}

export function speichern(key: keyof typeof SCHLUESSEL, wert: unknown): boolean {
  try {
    localStorage.setItem(SCHLUESSEL[key], JSON.stringify(wert))
    return true
  } catch (e) {
    console.warn('Speichern fehlgeschlagen', key, e)
    return false
  }
}

const STANDARD_EINST: Einstellungen = { thema: 'auto', ton: true, wach: true }

function timerLaden(): Record<string, TimerZustand> {
  const roh = laden<Record<string, TimerZustand>>(SCHLUESSEL.timer, {})
  const heute = datumKey()
  const sauber: Record<string, TimerZustand> = {}
  for (const [id, t] of Object.entries(roh)) if (t && t.datum === heute) sauber[id] = t
  return sauber
}

function erledigtLaden(): Record<string, string[]> {
  const roh = laden<Record<string, string[]>>(SCHLUESSEL.erledigt, {})
  // nur die letzten 7 Tage behalten
  const tage = Object.keys(roh).sort().slice(-7)
  const sauber: Record<string, string[]> = {}
  for (const t of tage) if (Array.isArray(roh[t])) sauber[t] = roh[t]
  return sauber
}

export const app = $state({
  plan: planNormalisieren(laden<unknown>(SCHLUESSEL.plan, startplan())) as Plan,
  fotos: laden<Record<string, string>>(SCHLUESSEL.fotos, {}),
  erledigt: erledigtLaden(),
  einst: { ...STANDARD_EINST, ...laden<Partial<Einstellungen>>(SCHLUESSEL.einst, {}) } as Einstellungen,
  timer: timerLaden(),
  ansicht: { art: 'tag', tag: heuteTag() } as Ansicht,
  bearbeiten: false,
  /** Aufgabe, die gerade mit den Pfeiltasten verschoben wird */
  verschieben: null as null | { tag: TagId; id: string },
  dialog: null as Dialog | null,
  /** wird jede Sekunde aktualisiert */
  jetzt: Date.now(),
  /** Element, das nach einem Ansichtswechsel den Fokus bekommen soll */
  fokusZiel: null as string | null,
  hinweis: null as string | null,
})

// ---------- Navigation ----------

export function istHeute(tag: TagId): boolean {
  return tag === heuteTag(new Date(app.jetzt))
}

export function oeffnen(ansicht: Ansicht, fokusZiel: string | null = null) {
  app.ansicht = ansicht
  app.fokusZiel = fokusZiel
}

/** Eine Ebene zurück. Gibt false zurück, wenn wir schon ganz oben (heute) sind. */
export function zurueck(): boolean {
  if (app.dialog) {
    app.dialog = null
    return true
  }
  if (app.verschieben) {
    app.verschieben = null
    return true
  }
  const a = app.ansicht
  switch (a.art) {
    case 'aufgabe':
      oeffnen({ art: 'abschnitt', tag: a.tag, abschnitt: a.abschnitt }, 'aufgabe:' + a.id)
      return true
    case 'abschnitt':
      oeffnen({ art: 'tag', tag: a.tag }, 'abschnitt:' + a.abschnitt)
      return true
    case 'tag':
      if (istHeute(a.tag)) return false
      oeffnen({ art: 'woche' }, 'tag:' + a.tag)
      return true
    case 'woche':
      oeffnen({ art: 'tag', tag: heuteTag() })
      return true
  }
}

export function zeigeHinweis(text: string) {
  app.hinweis = text
  setTimeout(() => {
    if (app.hinweis === text) app.hinweis = null
  }, 3500)
}

// ---------- Plan lesen ----------

export function finde(tag: TagId, id: string): Fundstelle | null {
  const tp = app.plan.woche[tag]
  for (const ab of ABSCHNITTE) {
    const i = tp[ab.id].findIndex((x) => x.id === id)
    if (i >= 0) return { abschnitt: ab.id, index: i, aufgabe: tp[ab.id][i] }
  }
  return null
}

/** Alle Aufgaben eines Tages in Reihenfolge */
export function tagesListe(tag: TagId): { abschnitt: AbschnittId; aufgabe: Aufgabe }[] {
  const tp = app.plan.woche[tag]
  return ABSCHNITTE.flatMap((ab) => tp[ab.id].map((aufgabe) => ({ abschnitt: ab.id, aufgabe })))
}

// ---------- Erledigt ----------

export function istErledigt(id: string): boolean {
  return app.erledigt[datumKey(new Date(app.jetzt))]?.includes(id) ?? false
}

export function setzeErledigt(id: string, wert: boolean) {
  const k = datumKey()
  const liste = app.erledigt[k] ?? []
  const ohne = liste.filter((x) => x !== id)
  app.erledigt[k] = wert ? [...ohne, id] : ohne
}

/**
 * Was ist heute „jetzt“ dran und was „als Nächstes“?
 * Jetzt = erste unerledigte Aufgabe im laufenden Abschnitt (oder die nächste danach).
 */
export function jetztUndDanach(tag: TagId): { jetzt: string | null; danach: string | null } {
  if (!istHeute(tag)) return { jetzt: null, danach: null }
  const d = new Date(app.jetzt)
  const phase = tagesPhase(app.plan, d)
  const liste = tagesListe(tag)
  const offen = liste.filter((x) => !istErledigt(x.aufgabe.id))
  if (offen.length === 0 || phase.art === 'nachher') return { jetzt: null, danach: null }
  let startIndex = 0
  if (phase.art === 'abschnitt') {
    const abIndex = ABSCHNITTE.findIndex((a) => a.id === phase.id)
    startIndex = offen.findIndex((x) => ABSCHNITTE.findIndex((a) => a.id === x.abschnitt) >= abIndex)
    if (startIndex < 0) {
      // alles Spätere erledigt – die älteste offene Aufgabe ist noch dran
      startIndex = 0
    }
  }
  if (phase.art === 'vorher') return { jetzt: null, danach: offen[0]?.aufgabe.id ?? null }
  return { jetzt: offen[startIndex]?.aufgabe.id ?? null, danach: offen[startIndex + 1]?.aufgabe.id ?? null }
}

/** Die nächste Aufgabe in der Tagesreihenfolge nach `id` (unerledigt bevorzugt) */
export function naechsteNach(tag: TagId, id: string): { abschnitt: AbschnittId; aufgabe: Aufgabe } | null {
  const liste = tagesListe(tag)
  const i = liste.findIndex((x) => x.aufgabe.id === id)
  if (i < 0) return null
  const rest = liste.slice(i + 1)
  return rest.find((x) => !istErledigt(x.aufgabe.id)) ?? rest[0] ?? null
}

/** Minuten bis zur festen Uhrzeit einer Aufgabe (nur heute, nur Zukunft) */
export function minutenBisStart(tag: TagId, aufgabe: Aufgabe): number | null {
  if (!aufgabe.uhrzeit || !istHeute(tag)) return null
  const diff = minutenVon(aufgabe.uhrzeit) - minutenJetzt(new Date(app.jetzt))
  return diff > 0 ? diff : null
}

// ---------- Plan ändern ----------

export function verschiebeAufgabe(vonTag: TagId, id: string, nachTag: TagId, nachAbschnitt: AbschnittId, index: number) {
  const f = finde(vonTag, id)
  if (!f) return
  const quelle = app.plan.woche[vonTag][f.abschnitt]
  const [teil] = quelle.splice(f.index, 1)
  const ziel = app.plan.woche[nachTag][nachAbschnitt]
  const i = Math.max(0, Math.min(index, ziel.length))
  ziel.splice(i, 0, teil)
}

/** Verschieben mit Pfeiltasten: einen Platz früher/später in der Tagesreihenfolge */
export function schrittVerschieben(tag: TagId, id: string, richtung: -1 | 1) {
  const f = finde(tag, id)
  if (!f) return
  const abIndex = ABSCHNITTE.findIndex((a) => a.id === f.abschnitt)
  const liste = app.plan.woche[tag][f.abschnitt]
  const neu = f.index + richtung
  if (neu >= 0 && neu < liste.length) {
    verschiebeAufgabe(tag, id, tag, f.abschnitt, neu)
    return
  }
  const nachbar = ABSCHNITTE[abIndex + richtung]
  if (!nachbar) return
  const zielListe = app.plan.woche[tag][nachbar.id]
  verschiebeAufgabe(tag, id, tag, nachbar.id, richtung === 1 ? 0 : zielListe.length)
}

/** Verschieben mit Pfeiltasten in der Wochenansicht: auf den Nachbartag */
export function tagVerschieben(tag: TagId, id: string, richtung: -1 | 1): TagId {
  const i = TAGE.findIndex((t) => t.id === tag)
  const ziel = TAGE[i + richtung]
  const f = finde(tag, id)
  if (!ziel || !f) return tag
  verschiebeAufgabe(tag, id, ziel.id, f.abschnitt, app.plan.woche[ziel.id][f.abschnitt].length)
  return ziel.id
}

export function neueAufgabe(tag: TagId, abschnitt: AbschnittId) {
  app.dialog = {
    art: 'bearbeiten',
    tag,
    abschnitt,
    neu: true,
    aufgabe: { id: neueId(), titel: '', bild: 'stern', minuten: 0 },
  }
}

export function aufgabeSpeichern(tag: TagId, abschnitt: AbschnittId, aufgabe: Aufgabe) {
  const f = finde(tag, aufgabe.id)
  if (f) {
    app.plan.woche[tag][f.abschnitt][f.index] = aufgabe
    if (f.abschnitt !== abschnitt) {
      verschiebeAufgabe(tag, aufgabe.id, tag, abschnitt, app.plan.woche[tag][abschnitt].length)
    }
  } else {
    app.plan.woche[tag][abschnitt].push(aufgabe)
  }
  fotosAufraeumen()
}

export function aufgabeLoeschen(tag: TagId, id: string) {
  const f = finde(tag, id)
  if (!f) return
  app.plan.woche[tag][f.abschnitt].splice(f.index, 1)
  delete app.timer[id]
  fotosAufraeumen()
}

export function tagKopieren(von: TagId, nach: TagId[], ersetzen: boolean) {
  const quelle = app.plan.woche[von]
  for (const z of nach) {
    if (z === von) continue
    for (const ab of ABSCHNITTE) {
      const kopie = quelle[ab.id].map((x) => ({ ...x, id: neueId() }))
      app.plan.woche[z][ab.id] = ersetzen ? kopie : [...app.plan.woche[z][ab.id], ...kopie]
    }
  }
}

export function tagLeeren(tag: TagId) {
  for (const ab of ABSCHNITTE) app.plan.woche[tag][ab.id] = []
  fotosAufraeumen()
}

/** Fotos löschen, die keine Aufgabe mehr benutzt */
export function fotosAufraeumen() {
  const benutzt = new Set<string>()
  for (const t of TAGE)
    for (const ab of ABSCHNITTE)
      for (const x of app.plan.woche[t.id][ab.id]) if (x.bild.startsWith('foto:')) benutzt.add(x.bild.slice(5))
  for (const id of Object.keys(app.fotos)) if (!benutzt.has(id)) delete app.fotos[id]
}

export function fotoHinzufuegen(dataUrl: string): string {
  const id = neueId()
  app.fotos[id] = dataUrl
  return 'foto:' + id
}

// ---------- Timer ----------

export function timerRest(id: string, dauerMs: number): { restMs: number; laeuft: boolean; gestartet: boolean } {
  const t = app.timer[id]
  if (!t) return { restMs: dauerMs, laeuft: false, gestartet: false }
  const vergangen = t.vergangenMs + (t.gestartet ? app.jetzt - t.gestartet : 0)
  return { restMs: t.dauerMs - vergangen, laeuft: t.gestartet !== null, gestartet: true }
}

export function timerStart(id: string, minuten: number) {
  const t = app.timer[id]
  if (t && t.gestartet === null && t.vergangenMs < t.dauerMs) {
    t.gestartet = Date.now()
    return
  }
  app.timer[id] = { datum: datumKey(), dauerMs: minuten * 60_000, gestartet: Date.now(), vergangenMs: 0 }
}

export function timerPause(id: string) {
  const t = app.timer[id]
  if (!t || t.gestartet === null) return
  t.vergangenMs += Date.now() - t.gestartet
  t.gestartet = null
}

export function timerZuruecksetzen(id: string) {
  delete app.timer[id]
}

export function timerAendern(id: string, deltaMin: number, minutenStandard: number) {
  const t = app.timer[id]
  if (!t) {
    app.timer[id] = {
      datum: datumKey(),
      dauerMs: Math.max(60_000, (minutenStandard + deltaMin) * 60_000),
      gestartet: null,
      vergangenMs: 0,
    }
    return
  }
  t.dauerMs = Math.max(60_000, t.dauerMs + deltaMin * 60_000)
  if (t.vergangenMs + (t.gestartet ? Date.now() - t.gestartet : 0) < t.dauerMs) t.endeGemeldet = false
}

// ---------- Export / Import ----------

export function exportDaten(): string {
  return JSON.stringify(
    { app: 'wochenplan', version: 1, plan: $state.snapshot(app.plan), fotos: $state.snapshot(app.fotos) },
    null,
    1,
  )
}

export function importDaten(text: string): boolean {
  try {
    const d = JSON.parse(text)
    const plan = d?.plan ?? d
    if (!plan?.woche) return false
    app.plan = planNormalisieren(plan)
    app.fotos = d?.fotos && typeof d.fotos === 'object' ? d.fotos : {}
    fotosAufraeumen()
    return true
  } catch {
    return false
  }
}
