// Vorlesen für Kinder, die noch nicht lesen.
// App: Android-Sprachmodul, Browser: Web-Sprachausgabe (beides über das Capacitor-Plugin).
// Es wird automatisch die beste Stimme der Oberflächensprache gewählt; in den Einstellungen lässt sie sich ändern.
import { lokale, spr, t, type Sprache } from './i18n.svelte'
import { app, kindName, kinderVon } from './speicher.svelte'
import type { Aufgabe } from './typen'
import { baustein as b, clipsSpielen, clipsStoppen } from './clips'

export interface Stimme {
  index: number
  uri: string
  name: string
  lang: string
  lokal: boolean
}

const stimmenCache: Partial<Record<Sprache, Stimme[]>> = {}

// Achtung: Capacitor-Plugins sind Proxys – nie direkt aus einer async-Funktion zurückgeben (sonst wird .then() aufgerufen)
async function plugin() {
  const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
  return { tts: TextToSpeech }
}

/** Stimmen des Geräts in der Oberflächensprache (Name historisch), beste zuerst */
export async function deutscheStimmen(): Promise<Stimme[]> {
  const sprache = spr.aktuell
  const gemerkt = stimmenCache[sprache]
  if (gemerkt && gemerkt.length) return gemerkt
  try {
    const { tts } = await plugin()
    let { voices } = await tts.getSupportedVoices()
    // Browser liefern die Liste manchmal erst nach kurzer Zeit
    for (let i = 0; i < 6 && !voices.length; i++) {
      await new Promise((r) => setTimeout(r, 250))
      voices = (await tts.getSupportedVoices()).voices
    }
    const liste = voices
      .map((v, index) => ({ index, uri: v.voiceURI, name: v.name, lang: v.lang, lokal: v.localService }))
      .filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(sprache))
    return (stimmenCache[sprache] = liste.sort((a, b) => wertung(b) - wertung(a)))
  } catch {
    return []
  }
}

/** Natürlich klingende Stimmen bevorzugen (Netz-/Neural-Stimmen, Hauptvariante vor Nebenvarianten wie de-AT/CH) */
function wertung(v: Stimme): number {
  const n = (v.name + ' ' + v.uri).toLowerCase()
  let w = 0
  if (/neural|natural|premium|enhanced|wavenet|online/.test(n)) w += 6
  if (/google/.test(n)) w += 4
  if (/network/.test(n)) w += 3
  if (spr.aktuell === 'de' && /-x-(deb|deg|dea)-/.test(n)) w += 2 // gut klingende Android-Stimmen
  if (v.lang.toLowerCase().replace('_', '-') === lokale().toLowerCase()) w += 2 // Hauptvariante (de-DE, en-GB, es-ES, fr-FR)
  if (/compact|espeak|pico/.test(n)) w -= 6
  return w
}

function stimmeFuer(liste: Stimme[]): Stimme | undefined {
  const wahl = app.einst.stimme
  return (wahl && liste.find((s) => s.uri === wahl)) || liste[0]
}

/** Abkürzungen ausschreiben, damit es natürlich klingt */
export function sprechText(text: string): string {
  const roh = spr.aktuell === 'de' ? deutschAusschreiben(text) : text
  return roh.replace(/&/g, ` ${t('und')} `).replace(/\s+/g, ' ').trim()
}

function deutschAusschreiben(text: string): string {
  return text
    .replace(/\bFr\.\s*/g, 'Frau ')
    .replace(/\bHr\.\s*/g, 'Herr ')
    .replace(/\bDr\.\s*/g, 'Doktor ')
    .replace(/\bz\.\s*B\./g, 'zum Beispiel')
    .replace(/\bu\.\s*a\./g, 'unter anderem')
}

let letzter = ''
let letzteZeit = 0

/** Feste Ansage aus vorgerenderten Bausteinen; ohne Bausteine (oder bei gewählter Gerätestimme) Sprachmodul */
async function vorlesenMit(teile: string[] | null, text: string, erzwingen = false) {
  if ((!app.einst.vorlesen && !erzwingen) || !text) return
  if (teile && !app.einst.stimme && spr.aktuell === 'de') {
    if (!erzwingen && text === letzter && Date.now() - letzteZeit < 1500) return
    letzter = text
    letzteZeit = Date.now()
    if (await clipsSpielen(teile)) return
  }
  return vorlesen(text, erzwingen)
}

export async function vorlesen(text: string, erzwingen = false) {
  if ((!app.einst.vorlesen && !erzwingen) || !text) return
  // dieselbe Ansage nicht doppelt kurz hintereinander
  if (!erzwingen && text === letzter && Date.now() - letzteZeit < 1500) return
  letzter = text
  letzteZeit = Date.now()
  try {
    clipsStoppen()
    const { tts } = await plugin()
    const stimme = stimmeFuer(await deutscheStimmen())
    await tts.stop().catch(() => {})
    await tts.speak({
      text: sprechText(text),
      lang: stimme?.lang ?? lokale(),
      ...(stimme ? { voice: stimme.index } : {}),
      rate: app.einst.tempo ?? 0.85,
      pitch: 1.1,
      volume: 1,
      category: 'playback',
    })
  } catch (e) {
    console.warn('Vorlesen nicht möglich', e)
  }
}

/** Kinder, die gerade gemeint sind („Mads“, „Mads und Lutz“) */
function wer(a?: Aufgabe): string {
  const k = app.einst.kind
  const ids = k !== 'alle' ? [k] : a ? kinderVon(a) : []
  const namen = ids.map((id) => kindName(id)).filter((n) => n && !/^Kind \d$/.test(n))
  if (!namen.length) return ''
  return namen.length === 1 ? namen[0] : t('{liste} und {name}', { liste: namen.slice(0, -1).join(', '), name: namen[namen.length - 1] })
}

function minutenText(m: number): string {
  return m === 1 ? t('eine Minute') : t('{m} Minuten', { m })
}

/** Ansage beim Öffnen einer Aufgabe */
export function aufgabeAnsagen(a: Aufgabe, erledigt: boolean) {
  const name = wer(a)
  const titel = t(a.titel)
  if (erledigt) {
    void vorlesenMit(
      name ? null : [b('aufgabe', a.titel), b('lob', 'Das ist schon geschafft!')],
      t('{titel}. Das ist schon geschafft!', { titel }),
    )
    return
  }
  const zeit = a.minuten > 0 ? ' ' + t('Du hast {zeit} Zeit.', { zeit: minutenText(a.minuten) }) : ''
  const teile = name
    ? null
    : [b('ansage', `Jetzt ist ${a.titel} dran.`), ...(a.minuten > 0 ? [b('satz', 'Du hast'), b('minuten', minutenText(a.minuten)), b('satz', 'Zeit.')] : [])]
  const satz = name ? t('{name}, jetzt ist {titel} dran.', { name, titel }) : t('Jetzt ist {titel} dran.', { titel })
  void vorlesenMit(teile, satz + zeit)
}

const LOB = ['Super gemacht!', 'Toll, geschafft!', 'Prima, das hast du super gemacht!', 'Klasse!', 'Juhu, geschafft!']

export function lobAnsagen(a: Aufgabe | undefined, alles: boolean) {
  const name = wer(a)
  if (alles) {
    void vorlesenMit(
      name ? null : [b('lob', 'Du hast alles geschafft! Ganz toll!')],
      name ? t('{name}, du hast alles geschafft! Ganz toll!', { name }) : t('Du hast alles geschafft! Ganz toll!'),
    )
    return
  }
  const roh = LOB[Math.floor(Math.random() * LOB.length)]
  const lob = t(roh)
  void vorlesenMit(name ? null : [b('lob', roh)], name ? t('{lob} {name}!', { lob, name }) : lob)
}

/** Ansage, wenn ein Timer gewählt wurde */
export function timerAnsagen(minuten: number) {
  void vorlesenMit(
    [b('satz', 'Du hast'), b('minuten', minutenText(minuten)), b('satz', 'Zeit.')],
    t('Du hast {zeit} Zeit.', { zeit: minutenText(minuten) }),
  )
}

/** Zeitansagen des Timers: noch 10 / 5 / 1 Minute, Zeit um */
export function restAnsagen(minuten: number, titel: string) {
  if (app.einst.zeitAnsagen === false) return
  const name = t(titel)
  if (minuten <= 1)
    void vorlesenMit(
      [b('rest', 'Noch eine Minute für'), b('aufgabe', titel), b('rest', 'Gleich ist die Zeit um.')],
      t('Noch eine Minute für {titel}! Gleich ist die Zeit um.', { titel: name }),
    )
  else
    void vorlesenMit(
      [b('rest', `Noch ${minuten} Minuten für`), b('aufgabe', titel)],
      t('Noch {minuten} Minuten für {titel}.', { minuten, titel: name }),
    )
}
export function endeAnsagen(titel: string) {
  if (app.einst.zeitAnsagen === false) return
  void vorlesenMit([b('ende', 'Die Zeit für'), b('aufgabe', titel), b('ende', 'ist um.')], t('Die Zeit für {titel} ist um.', { titel: t(titel) }))
}
/** Countdown bis zu einer Aufgabe mit fester Uhrzeit */
export function startAnsagen(minuten: number, titel: string) {
  if (app.einst.zeitAnsagen === false) return
  const satz = minuten <= 1 ? t('In einer Minute geht es los:') : t('In {minuten} Minuten geht es los:', { minuten })
  void vorlesenMit([b('start', satz), b('aufgabe', titel)], `${satz} ${t(titel)}.`)
}

/** Uhrzeit laut und deutlich ansagen: „Es ist 10 Uhr 51.“ */
export function uhrzeitAnsagen(d: Date) {
  const h = d.getHours()
  const m = d.getMinutes()
  const uhr = h === 1 ? 'ein Uhr' : `${h} Uhr`
  // Minuten außerhalb des Deutschen zweistellig („10:05“), damit die Sprachausgabe sie als Uhrzeit liest
  const mm = spr.aktuell === 'de' ? String(m) : String(m).padStart(2, '0')
  const text =
    h === 1
      ? m === 0 ? t('Es ist ein Uhr.') : t('Es ist ein Uhr {m}.', { m: mm })
      : m === 0 ? t('Es ist {h} Uhr.', { h }) : t('Es ist {h} Uhr {m}.', { h, m: mm })
  void vorlesenMit([b('uhr', 'Es ist'), b('stunde', uhr), ...(m === 0 ? [] : [b('minute', String(m))])], text, true)
}

/** Probe in den Einstellungen */
export function probeSprechen() {
  void vorlesen(t('Hallo! So klinge ich. Jetzt ist Zähne putzen dran.'), true)
}
