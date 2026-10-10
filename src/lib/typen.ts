export type TagId = 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so'
export type AbschnittId = 'morgen' | 'vormittag' | 'mittag' | 'nachmittag' | 'abend' | 'bett'

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
}

export type Tagesplan = Record<AbschnittId, Aufgabe[]>

export interface Plan {
  version: 2
  woche: Record<TagId, Tagesplan>
  /** Beginn jedes Tagesabschnitts "HH:MM" – ein Abschnitt endet, wenn der nächste beginnt */
  zeiten: Record<AbschnittId, string>
  /** Ende der Bettzeit (Schlafenszeit) "HH:MM" */
  abendEnde: string
}

export interface Einstellungen {
  /** auto = abends automatisch dunkel */
  thema: 'auto' | 'tag' | 'nacht'
  ton: boolean
  /** Bildschirm anlassen (Fernseher geht nicht in den Bildschirmschoner) */
  wach: boolean
  /** Timer als Ampel oder als Sanduhr anzeigen */
  timerArt: 'ampel' | 'sanduhr'
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

export type Dialog =
  | { art: 'bearbeiten'; tag: TagId; abschnitt: AbschnittId; aufgabe: Aufgabe; neu: boolean }
  | { art: 'aktion'; tag: TagId; id: string }
  | { art: 'kopieren'; tag: TagId }
  | { art: 'aufgabeKopieren'; tag: TagId; id: string }
  | { art: 'einstellungen' }

export interface Fundstelle {
  abschnitt: AbschnittId
  index: number
  aufgabe: Aufgabe
}
