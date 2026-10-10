export type TagId = 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so'
export type AbschnittId =
  | 'aufstehen'
  | 'morgen'
  | 'vormittag'
  | 'mittag'
  | 'nachmittag'
  | 'frueh'
  | 'abend'
  | 'bett'
  | 'schlafen'

/** Eine Aufgabe im Plan, z. B. „Zähne putzen“. */
export interface Aufgabe {
  id: string
  titel: string
  /** Bild aus der Bildauswahl (z. B. "zaehne") oder eigenes Foto ("foto:<id>") */
  bild: string
  /** kleines Zusatzzeichen unten rechts am Bild (z. B. "mond") */
  zusatz?: string
  /** Timer-Dauer in Minuten, 0 = ohne Timer */
  minuten: number
  /** feste Uhrzeit "HH:MM" (optional) – dann gibt es einen Countdown bis zum Start */
  uhrzeit?: string
  /** für wen? leer/fehlt = beide Kinder */
  fuer?: KindId[]
  /** „noch X× schlafen bis …“ anzeigen */
  countdown?: boolean
  /** eigenes Foto ("foto:<id>") zusätzlich zum Bild */
  foto?: string
  /** was die Kachel zeigt: Bild, Foto oder abwechselnd */
  fotoModus?: 'bild' | 'foto' | 'wechsel'
  /** Sekunden pro Wechsel */
  wechselSek?: number
}

export type KindId = 'k1' | 'k2'

export interface Kind {
  id: KindId
  name: string
  /** "YYYY-MM-DD" */
  geburtstag?: string
  farbe: string
}

/** Termin an einem bestimmten Datum (Monats-/Jahresplan) */
export interface Termin extends Aufgabe {
  datum: string
  abschnitt: AbschnittId
}

/** Gespeicherter Tagesablauf, z. B. „Kita-Tag“ oder „Ferien“ */
export interface TagesVorlage {
  id: string
  name: string
  tag: Tagesplan
}

export type Tagesplan = Record<AbschnittId, Aufgabe[]>

export interface Plan {
  version: 3
  woche: Record<TagId, Tagesplan>
  /** Beginn jedes Tagesabschnitts "HH:MM" – ein Abschnitt endet, wenn der nächste beginnt */
  zeiten: Record<AbschnittId, string>
  /** Ende der Bettzeit (Schlafenszeit) "HH:MM" */
  abendEnde: string
  kinder: Kind[]
  termine: Termin[]
  vorlagen: TagesVorlage[]
  /** Datum "YYYY-MM-DD" → ID einer Tagesvorlage, die an diesem Tag statt des Wochentags gilt */
  datumVorlage: Record<string, string>
}

export interface Einstellungen {
  /** auto = abends automatisch dunkel */
  thema: 'auto' | 'tag' | 'nacht'
  ton: boolean
  /** Bildschirm anlassen (Fernseher geht nicht in den Bildschirmschoner) */
  wach: boolean
  /** Timer als Ampel oder als Sanduhr anzeigen */
  timerArt: 'ampel' | 'sanduhr'
  /** Ansicht für welches Kind */
  kind: 'alle' | KindId
  vorlesen: boolean
}

export interface TimerZustand {
  datum: string
  dauerMs: number
  /** Zeitpunkt des (letzten) Starts, null = pausiert / nicht gestartet */
  gestartet: number | null
  /** bis zur letzten Pause abgelaufene Zeit */
  vergangenMs: number
  gelbGemeldet?: boolean
  rotGemeldet?: boolean
  endeGemeldet?: boolean
}

export type Ansicht =
  | { art: 'woche' }
  | { art: 'tag'; tag: TagId }
  | { art: 'abschnitt'; tag: TagId; abschnitt: AbschnittId }
  | { art: 'aufgabe'; tag: TagId; abschnitt: AbschnittId; id: string }
  | { art: 'monat'; jahr: number; monat: number }
  | { art: 'jahr'; jahr: number }

export type Dialog =
  | { art: 'bearbeiten'; tag: TagId; abschnitt: AbschnittId; aufgabe: Aufgabe; neu: boolean }
  | { art: 'aktion'; tag: TagId; id: string }
  | { art: 'kopieren'; tag: TagId }
  | { art: 'aufgabeKopieren'; tag: TagId; id: string }
  | { art: 'einstellungen' }
  | { art: 'datum'; datum: string }
  | { art: 'termin'; termin: Termin; neu: boolean }
  | { art: 'vorlage'; tag: TagId }

export interface Fundstelle {
  abschnitt: AbschnittId
  index: number
  aufgabe: Aufgabe
  /** true, wenn es ein Termin aus dem Monatsplan ist */
  termin?: boolean
}
