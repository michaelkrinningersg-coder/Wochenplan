export type TagId = 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so'
/** Kennung einer Tageszeit (Standard: aufstehen, morgen, … oder eine selbst angelegte) */
export type AbschnittId = string

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
  /** Ende "HH:MM" (optional) – im Live-Modus wird die Aufgabe von uhrzeit bis bis gezeigt */
  bis?: string
  /** für wen? leer/fehlt = beide Kinder */
  fuer?: KindId[]
  /** „noch X× schlafen bis …“ anzeigen */
  countdown?: boolean
  /** Sternenregen beim Erledigen (wenn in den Einstellungen „nur ausgewählte“ gilt) */
  sternenregen?: boolean
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
  /** eigene Namen und Bilder der Tageszeiten */
  abschnitte: Partial<Record<AbschnittId, AbschnittAnpassung>>
  /** Reihenfolge der Tageszeiten; fehlt sie, gelten die neun Standard-Tageszeiten */
  abschnittListe?: AbschnittId[]
  /** Stand der einmaligen Umstellungen (neue Bildkarten, Umbenennungen) */
  stand?: number
  /** Einstellungen, die für alle Geräte gelten */
  optionen?: GeteilteOptionen
  /** eigene Fotos für das Ruhebild (Kennungen; die Bilder liegen einzeln verschlüsselt im Repo) */
  ruhebilder?: string[]
}

export interface AbschnittAnpassung {
  name?: string
  bild?: string
  /** dunkle Darstellung mit Mond */
  nacht?: boolean
  /** Farbfamilie (Kennung einer Standard-Tageszeit) */
  farbe?: string
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
  /** gewählte Stimme (voiceURI), leer = beste deutsche Stimme automatisch */
  stimme?: string
  /** Sprechtempo 0.6–1.2 */
  tempo?: number
  /** Ansagen bei 5 Minuten / 1 Minute / Zeit um */
  zeitAnsagen?: boolean
  /** Sterne vom Himmel beim Erledigen: bei allen, nur bei ausgewählten Aufgaben oder nie */
  sternenregen?: 'alle' | 'auswahl' | 'aus'
  /** Uhr oben: Ziffern oder Zeiger */
  uhrArt?: 'digital' | 'analog'
  /** Live-Modus / Ruhebild auf dem Fernseher nach Inaktivität */
  ruhe?: 'an' | 'aus'
  /** Minuten ohne Bedienung bis zum Ruhebild */
  ruheWarten?: number
  /** Jahreszeiten-Bild oder eigene Fotos */
  ruheArt?: 'jahreszeit' | 'fotos' | 'schwarz'
  /** nachts (Schlafen bis Aufstehen) Bildschirm schwarz */
  ruheNacht?: boolean
  /** Ruhebild auf diesem Gerät: auto = nur „Nur anzeigen“-Geräte (Fernseher) */
  ruheHier?: 'auto' | 'an' | 'aus'
  /** Ort für echtes Wetter: "Name|Breite|Länge" */
  wetterOrt?: string
  /** Sekunden, bis das nächste Foto kommt */
  ruheWechsel?: number
  /** Namen unter den drei typischen Dingen zeigen */
  ruheNamen?: boolean
  /** kleinen Countdown bis zum Ruhebild in der Ecke zeigen */
  ruheCountdown?: boolean
  /** Bildkarten: Junge (Standard) oder Mädchen, wo es die Karte gibt */
  kartenstil?: 'junge' | 'maedchen'
}

/** Optionen, die mit dem Plan auf alle Geräte gehen (nicht: Kind-Auswahl, Bildschirm anlassen, Stimme) */
export const GETEILTE_OPTIONEN = ['thema', 'ton', 'timerArt', 'vorlesen', 'tempo', 'zeitAnsagen', 'sternenregen', 'uhrArt', 'ruhe', 'ruheWarten', 'ruheArt', 'ruheWechsel', 'ruheNamen', 'ruheNacht', 'wetterOrt', 'ruheCountdown', 'kartenstil'] as const
export type GeteilteOptionen = Partial<Pick<Einstellungen, (typeof GETEILTE_OPTIONEN)[number]>>

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
  /** schon angesagte Restminuten (10, 5, 1) */
  angesagt?: number[]
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
  | { art: 'abschnittBild'; id: AbschnittId }
  | { art: 'ablaeufe' }
  | { art: 'uhr' }

export interface Fundstelle {
  abschnitt: AbschnittId
  index: number
  aufgabe: Aufgabe
  /** true, wenn es ein Termin aus dem Monatsplan ist */
  termin?: boolean
}
