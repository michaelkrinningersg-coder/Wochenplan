// Vorlesen für Kinder, die noch nicht lesen.
// App: Android-Sprachmodul, Browser: Web-Sprachausgabe (beides über das Capacitor-Plugin).
// Es wird automatisch die beste deutsche Stimme gewählt; in den Einstellungen lässt sie sich ändern.
import { app, kindName, kinderVon } from './speicher.svelte'
import type { Aufgabe } from './typen'

export interface Stimme {
  index: number
  uri: string
  name: string
  lang: string
  lokal: boolean
}

let stimmenCache: Stimme[] | null = null

// Achtung: Capacitor-Plugins sind Proxys – nie direkt aus einer async-Funktion zurückgeben (sonst wird .then() aufgerufen)
async function plugin() {
  const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
  return { tts: TextToSpeech }
}

/** Deutsche Stimmen des Geräts, beste zuerst */
export async function deutscheStimmen(): Promise<Stimme[]> {
  if (stimmenCache && stimmenCache.length) return stimmenCache
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
      .filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('de'))
    stimmenCache = liste.sort((a, b) => wertung(b) - wertung(a))
    return stimmenCache
  } catch {
    return []
  }
}

/** Natürlich klingende Stimmen bevorzugen (Netz-/Neural-Stimmen, de-DE vor de-AT/CH) */
function wertung(v: Stimme): number {
  const n = (v.name + ' ' + v.uri).toLowerCase()
  let w = 0
  if (/neural|natural|premium|enhanced|wavenet|online/.test(n)) w += 6
  if (/google/.test(n)) w += 4
  if (/network/.test(n)) w += 3
  if (/-x-(deb|deg|dea)-/.test(n)) w += 2 // gut klingende Android-Stimmen
  if (/de[-_]de/i.test(v.lang)) w += 2
  if (/compact|espeak|pico/.test(n)) w -= 6
  return w
}

function stimmeFuer(liste: Stimme[]): Stimme | undefined {
  const wahl = app.einst.stimme
  return (wahl && liste.find((s) => s.uri === wahl)) || liste[0]
}

/** Abkürzungen ausschreiben, damit es natürlich klingt */
export function sprechText(text: string): string {
  return text
    .replace(/\bFr\.\s*/g, 'Frau ')
    .replace(/\bHr\.\s*/g, 'Herr ')
    .replace(/\bDr\.\s*/g, 'Doktor ')
    .replace(/\bz\.\s*B\./g, 'zum Beispiel')
    .replace(/\bu\.\s*a\./g, 'unter anderem')
    .replace(/&/g, ' und ')
    .replace(/\s+/g, ' ')
    .trim()
}

let letzter = ''
let letzteZeit = 0

export async function vorlesen(text: string, erzwingen = false) {
  if ((!app.einst.vorlesen && !erzwingen) || !text) return
  // dieselbe Ansage nicht doppelt kurz hintereinander
  if (!erzwingen && text === letzter && Date.now() - letzteZeit < 1500) return
  letzter = text
  letzteZeit = Date.now()
  try {
    const { tts } = await plugin()
    const stimme = stimmeFuer(await deutscheStimmen())
    await tts.stop().catch(() => {})
    await tts.speak({
      text: sprechText(text),
      lang: stimme?.lang ?? 'de-DE',
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
  return namen.length === 1 ? namen[0] : namen.slice(0, -1).join(', ') + ' und ' + namen[namen.length - 1]
}

function minutenText(m: number): string {
  return m === 1 ? 'eine Minute' : `${m} Minuten`
}

/** Ansage beim Öffnen einer Aufgabe */
export function aufgabeAnsagen(a: Aufgabe, erledigt: boolean) {
  const name = wer(a)
  if (erledigt) {
    void vorlesen(`${a.titel}. Das ist schon geschafft!`)
    return
  }
  const zeit = a.minuten > 0 ? ` Du hast ${minutenText(a.minuten)} Zeit.` : ''
  void vorlesen(`${name ? name + ', jetzt ' : 'Jetzt '}ist ${a.titel} dran.${zeit}`)
}

const LOB = ['Super gemacht!', 'Toll, geschafft!', 'Prima, das hast du super gemacht!', 'Klasse!', 'Juhu, geschafft!']

export function lobAnsagen(a: Aufgabe | undefined, alles: boolean) {
  const name = wer(a)
  if (alles) {
    void vorlesen(`${name ? name + ', du' : 'Du'} hast alles geschafft! Ganz toll!`)
    return
  }
  const lob = LOB[Math.floor(Math.random() * LOB.length)]
  void vorlesen(name ? `${lob} ${name}!` : lob)
}

/** Ansage, wenn ein Timer gewählt wurde */
export function timerAnsagen(minuten: number) {
  void vorlesen(`Du hast ${minutenText(minuten)} Zeit.`)
}

/** Zeitansagen des Timers: noch 10 / 5 / 1 Minute, Zeit um */
export function restAnsagen(minuten: number, titel: string) {
  if (app.einst.zeitAnsagen === false) return
  if (minuten <= 1) void vorlesen(`Noch eine Minute für ${titel}! Gleich ist die Zeit um.`)
  else void vorlesen(`Noch ${minuten} Minuten für ${titel}.`)
}
export function endeAnsagen(titel: string) {
  if (app.einst.zeitAnsagen === false) return
  void vorlesen(`Die Zeit für ${titel} ist um.`)
}
/** Countdown bis zu einer Aufgabe mit fester Uhrzeit */
export function startAnsagen(minuten: number, titel: string) {
  if (app.einst.zeitAnsagen === false) return
  void vorlesen(minuten <= 1 ? `In einer Minute geht es los: ${titel}.` : `In ${minuten} Minuten geht es los: ${titel}.`)
}

/** Uhrzeit laut und deutlich ansagen: „Es ist 10 Uhr 51.“ */
export function uhrzeitAnsagen(d: Date) {
  const h = d.getHours()
  const m = d.getMinutes()
  const uhr = h === 1 ? 'ein Uhr' : `${h} Uhr`
  void vorlesen(m === 0 ? `Es ist ${uhr}.` : `Es ist ${uhr} ${m}.`, true)
}

/** Probe in den Einstellungen */
export function probeSprechen() {
  void vorlesen('Hallo! So klinge ich. Jetzt ist Zähne putzen dran.', true)
}
