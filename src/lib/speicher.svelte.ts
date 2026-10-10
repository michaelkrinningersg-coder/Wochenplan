import { gelbAb, rotAb } from './ampel'
import { ABSCHNITTE, TAGE, abschnittAnpassungVon } from './konstanten'
import { neueId, planNormalisieren, startplan } from './startplan'
import type {
  AbschnittId,
  Ansicht,
  Aufgabe,
  Dialog,
  Einstellungen,
  Fundstelle,
  KindId,
  Plan,
  Tagesplan,
  Termin,
  TagId,
  TimerZustand,
} from './typen'
import { datumFuerTag, datumKey, heuteTag, minutenJetzt, minutenVon, tagesPhase } from './zeit'

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

const STANDARD_EINST: Einstellungen = { thema: 'auto', ton: true, wach: true, timerArt: 'ampel', kind: 'alle', vorlesen: true }

function timerLaden(): Record<string, TimerZustand> {
  const roh = laden<Record<string, TimerZustand>>(SCHLUESSEL.timer, {})
  const heute = datumKey()
  const sauber: Record<string, TimerZustand> = {}
  for (const [id, t] of Object.entries(roh)) if (t && t.datum === heute) sauber[id] = t
  return sauber
}

/**
 * Erledigt-Stand: Datum → Schlüssel "k1:<aufgabe>" → Zeitstempel.
 * Positiv = erledigt, negativ = wieder offen. So lassen sich Stände von mehreren Geräten zusammenführen.
 */
export type ErledigtStand = Record<string, Record<string, number>>

export function erledigtKuerzen(roh: ErledigtStand): ErledigtStand {
  // 14 Tage behalten (für die Sterne der Woche)
  const tage = Object.keys(roh).sort().slice(-14)
  const sauber: ErledigtStand = {}
  for (const t of tage) if (roh[t] && typeof roh[t] === 'object' && !Array.isArray(roh[t])) sauber[t] = roh[t]
  return sauber
}

function erledigtLaden(): ErledigtStand {
  return erledigtKuerzen(laden<ErledigtStand>(SCHLUESSEL.erledigt, {}))
}

// Pläne älterer Versionen (andere Tagesgliederung) werden einmalig durch den vorbereiteten Wochenplan ersetzt
const gespeicherterPlan = laden<{ version?: number; stand?: number } | null>(SCHLUESSEL.plan, null)
export const planErneuert = !!gespeicherterPlan && gespeicherterPlan.version !== 3
/** Plan bekommt beim Laden neue Bildkarten / Namen (einmalige Umstellung) */
export const planUmgestellt = !!gespeicherterPlan && !planErneuert && (gespeicherterPlan.stand ?? 1) < 6

export const app = $state({
  plan: (gespeicherterPlan && !planErneuert ? planNormalisieren(gespeicherterPlan) : startplan()) as Plan,
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
  /** Ruhebild als Vorschau zeigen (Einstellungen) */
  ruheVorschau: false,
  /** Zeitpunkt des letzten Abhakens auf diesem Gerät (löst den Abgleich aus) */
  abgehakt: 0,
})

abschnittAnpassungVon(() => app.plan.abschnitte)

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
    // Unterdialoge der Einstellungen führen zurück in die Einstellungen
    app.dialog = app.dialog.art === 'abschnittBild' || app.dialog.art === 'ablaeufe' ? { art: 'einstellungen' } : null
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
    case 'jahr':
      oeffnen({ art: 'tag', tag: heuteTag() })
      return true
    case 'monat':
      oeffnen({ art: 'jahr', jahr: a.jahr })
      return true
  }
  return false
}

export function zeigeHinweis(text: string) {
  app.hinweis = text
  setTimeout(() => {
    if (app.hinweis === text) app.hinweis = null
  }, 3500)
}

// ---------- Plan lesen ----------

/** Datum (Schlüssel) des Wochentags in der laufenden Woche */
export function datumVon(tag: TagId): string {
  return datumKey(datumFuerTag(tag, new Date(app.jetzt)))
}

/** Der Tagesplan, der an diesem Wochentag gilt: Tagesvorlage für das Datum oder der normale Wochentag */
export function planFuer(tag: TagId): Tagesplan {
  const vorlageId = app.plan.datumVorlage[datumVon(tag)]
  const vorlage = vorlageId ? app.plan.vorlagen.find((v) => v.id === vorlageId) : undefined
  return vorlage ? vorlage.tag : app.plan.woche[tag]
}

export function vorlageFuer(tag: TagId): string | null {
  const id = app.plan.datumVorlage[datumVon(tag)]
  return id ? (app.plan.vorlagen.find((v) => v.id === id)?.name ?? null) : null
}

/** Ist die Aufgabe für das gewählte Kind sichtbar? */
export function sichtbar(a: Aufgabe): boolean {
  const k = app.einst.kind
  return k === 'alle' || !a.fuer || a.fuer.length === 0 || a.fuer.includes(k)
}

export function termineAm(datum: string): Termin[] {
  return app.plan.termine.filter((t) => t.datum === datum)
}

/** Alle Aufgaben eines Abschnitts, die angezeigt werden (Plan + Termine des Datums, gefiltert nach Kind) */
export function aufgabenIn(tag: TagId, abschnitt: AbschnittId): Aufgabe[] {
  const datum = datumVon(tag)
  return [
    ...planFuer(tag)[abschnitt].filter(sichtbar),
    ...app.plan.termine.filter((t) => t.datum === datum && t.abschnitt === abschnitt && sichtbar(t)),
  ]
}

export function istTermin(id: string): boolean {
  return app.plan.termine.some((t) => t.id === id)
}

export function finde(tag: TagId, id: string): Fundstelle | null {
  const tp = planFuer(tag)
  for (const ab of ABSCHNITTE) {
    const i = tp[ab.id].findIndex((x) => x.id === id)
    if (i >= 0) return { abschnitt: ab.id, index: i, aufgabe: tp[ab.id][i] }
  }
  const t = app.plan.termine.find((x) => x.id === id)
  if (t) return { abschnitt: t.abschnitt, index: 0, aufgabe: t, termin: true }
  return null
}

/** Alle sichtbaren Aufgaben eines Tages in Reihenfolge */
export function tagesListe(tag: TagId): { abschnitt: AbschnittId; aufgabe: Aufgabe }[] {
  return ABSCHNITTE.flatMap((ab) => aufgabenIn(tag, ab.id).map((aufgabe) => ({ abschnitt: ab.id, aufgabe })))
}

// ---------- Kinder ----------

export function kindName(id: KindId): string {
  return app.plan.kinder.find((k) => k.id === id)?.name ?? id
}

/** Für welche Kinder gilt die Aufgabe? */
export function kinderVon(a: Aufgabe): KindId[] {
  return a.fuer && a.fuer.length ? a.fuer : app.plan.kinder.map((k) => k.id)
}

// ---------- Erledigt ----------

function erledigtFuer(kind: KindId, id: string, datum = datumKey(new Date(app.jetzt))): boolean {
  return (app.erledigt[datum]?.[kind + ':' + id] ?? 0) > 0
}

/** Erledigt? In der Ansicht „Beide“: erst, wenn alle zugeordneten Kinder fertig sind. */
export function istErledigt(a: Aufgabe): boolean {
  const k = app.einst.kind
  if (k !== 'alle') return erledigtFuer(k, a.id)
  return kinderVon(a).every((kind) => erledigtFuer(kind, a.id))
}

export function setzeErledigt(a: Aufgabe, wert: boolean) {
  const datum = datumKey()
  const k = app.einst.kind
  const kinder = k === 'alle' ? kinderVon(a) : [k]
  const tag = app.erledigt[datum] ?? {}
  const t = Date.now()
  for (const kind of kinder) tag[kind + ':' + a.id] = wert ? t : -t
  app.erledigt[datum] = tag
  app.abgehakt = t
}

/** Sterne eines Kindes: erledigte Aufgaben heute und in den letzten 7 Tagen */
export function sterne(kind: KindId): { heute: number; woche: number } {
  const heute = datumKey(new Date(app.jetzt))
  const grenze = new Date(app.jetzt)
  grenze.setDate(grenze.getDate() - 6)
  const ab = datumKey(grenze)
  let h = 0
  let w = 0
  for (const [datum, eintraege] of Object.entries(app.erledigt)) {
    if (datum < ab) continue
    for (const [schluessel, wert] of Object.entries(eintraege)) {
      if (wert > 0 && schluessel.startsWith(kind + ':')) {
        w++
        if (datum === heute) h++
      }
    }
  }
  return { heute: h, woche: w }
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
  const offen = liste.filter((x) => !istErledigt(x.aufgabe))
  if (offen.length === 0 || phase.art === 'nachher') return { jetzt: null, danach: null }
  let startIndex = 0
  if (phase.art === 'abschnitt') {
    const abIndex = ABSCHNITTE.findIndex((a) => a.id === phase.id)
    startIndex = offen.findIndex((x) => ABSCHNITTE.findIndex((a) => a.id === x.abschnitt) >= abIndex)
    if (startIndex < 0) startIndex = 0
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
  return rest.find((x) => !istErledigt(x.aufgabe)) ?? rest[0] ?? null
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
  if (f.termin) return
  const quelle = planFuer(vonTag)[f.abschnitt]
  const [teil] = quelle.splice(f.index, 1)
  const ziel = planFuer(nachTag)[nachAbschnitt]
  const i = Math.max(0, Math.min(index, ziel.length))
  ziel.splice(i, 0, teil)
}

/** Verschieben mit Pfeiltasten: einen Platz früher/später in der Tagesreihenfolge */
export function schrittVerschieben(tag: TagId, id: string, richtung: -1 | 1) {
  const f = finde(tag, id)
  if (!f || f.termin) return
  const abIndex = ABSCHNITTE.findIndex((a) => a.id === f.abschnitt)
  const liste = planFuer(tag)[f.abschnitt]
  const neu = f.index + richtung
  if (neu >= 0 && neu < liste.length) {
    verschiebeAufgabe(tag, id, tag, f.abschnitt, neu)
    return
  }
  const nachbar = ABSCHNITTE[abIndex + richtung]
  if (!nachbar) return
  const zielListe = planFuer(tag)[nachbar.id]
  verschiebeAufgabe(tag, id, tag, nachbar.id, richtung === 1 ? 0 : zielListe.length)
}

/** Verschieben mit Pfeiltasten in der Wochenansicht: auf den Nachbartag */
export function tagVerschieben(tag: TagId, id: string, richtung: -1 | 1): TagId {
  const i = TAGE.findIndex((t) => t.id === tag)
  const ziel = TAGE[i + richtung]
  const f = finde(tag, id)
  if (!ziel || !f || f.termin) return tag
  verschiebeAufgabe(tag, id, ziel.id, f.abschnitt, planFuer(ziel.id)[f.abschnitt].length)
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
  if (f && !f.termin) {
    planFuer(tag)[f.abschnitt][f.index] = aufgabe
    if (f.abschnitt !== abschnitt) {
      verschiebeAufgabe(tag, aufgabe.id, tag, abschnitt, planFuer(tag)[abschnitt].length)
    }
  } else if (!f) {
    planFuer(tag)[abschnitt].push(aufgabe)
  }
  fotosAufraeumen()
}

export function aufgabeLoeschen(tag: TagId, id: string) {
  const f = finde(tag, id)
  if (!f) return
  if (f.termin) app.plan.termine = app.plan.termine.filter((t) => t.id !== id)
  else planFuer(tag)[f.abschnitt].splice(f.index, 1)
  delete app.timer[id]
  fotosAufraeumen()
}

export function tagKopieren(von: TagId, nach: TagId[], ersetzen: boolean) {
  const quelle = $state.snapshot(planFuer(von))
  for (const z of nach) {
    if (z === von) continue
    const ziel = planFuer(z)
    for (const ab of ABSCHNITTE) {
      const kopie = quelle[ab.id].map((x) => ({ ...x, id: neueId() }))
      ziel[ab.id] = ersetzen ? kopie : [...ziel[ab.id], ...kopie]
    }
  }
}

/** Eine Aufgabe auf andere Tage kopieren (gleiche Tageszeit, hinten angehängt) */
export function aufgabeKopieren(tag: TagId, id: string, ziele: TagId[]) {
  const f = finde(tag, id)
  if (!f) return
  for (const z of ziele) planFuer(z)[f.abschnitt].push({ ...$state.snapshot(f.aufgabe), id: neueId() })
}

export function tagLeeren(tag: TagId) {
  const ziel = planFuer(tag)
  for (const ab of ABSCHNITTE) ziel[ab.id] = []
  fotosAufraeumen()
}

/** Fotos löschen, die keine Aufgabe mehr benutzt */
export function fotosAufraeumen() {
  const benutzt = new Set<string>()
  const merken = (x: Aufgabe) => {
    for (const b of [x.bild, x.foto]) if (b && b.startsWith('foto:')) benutzt.add(b.slice(5))
  }
  const tage = [...TAGE.map((t) => app.plan.woche[t.id]), ...app.plan.vorlagen.map((v) => v.tag)]
  for (const tp of tage) for (const ab of ABSCHNITTE) tp[ab.id].forEach(merken)
  app.plan.termine.forEach(merken)
  for (const ab of Object.values(app.plan.abschnitte)) if (ab?.bild?.startsWith('foto:')) benutzt.add(ab.bild.slice(5))
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

/** Timer-Dauer wählen (noch nicht starten) */
export function timerSetzen(id: string, minuten: number) {
  app.timer[id] = { datum: datumKey(), dauerMs: minuten * 60_000, gestartet: null, vergangenMs: 0 }
}

/** Sind heute alle Aufgaben erledigt (bzw. alle eines Abschnitts)? */
export function allesErledigt(tag: TagId, abschnitt?: AbschnittId): boolean {
  const liste = abschnitt ? aufgabenIn(tag, abschnitt) : tagesListe(tag).map((x) => x.aufgabe)
  return istHeute(tag) && liste.length > 0 && liste.every((a) => istErledigt(a))
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
  const rest = t.dauerMs - (t.vergangenMs + (t.gestartet ? Date.now() - t.gestartet : 0))
  if (rest > 0) t.endeGemeldet = false
  if (rest > rotAb(t.dauerMs)) t.rotGemeldet = false
  if (rest > gelbAb(t.dauerMs)) t.gelbGemeldet = false
  if (t.angesagt) t.angesagt = t.angesagt.filter((m) => rest <= m * 60_000)
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
