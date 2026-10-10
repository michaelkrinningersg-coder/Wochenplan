// Abgleich über eine Datei, die die Familie selbst wählt (Google Drive, Nextcloud, Gerätespeicher …).
// Die App schreibt den verschlüsselten Plan dort hinein und liest ihn wieder; es läuft nichts über Server des Entwicklers.
// Mehrere Geräte: Die jüngere Änderung gewinnt. Nur in der App (Android).
import { t } from './i18n.svelte'
import { registerPlugin } from '@capacitor/core'
import { entschluesseln, ohneAbgleich, verschluesseln, lokalStand } from './abgleich.svelte'
import { istApp } from './geraet'
import { exportDaten, importDaten } from './speicher.svelte'

interface DateispeicherPlugin {
  info(): Promise<{ gewaehlt: boolean; name?: string }>
  waehlen(o: { neu: boolean }): Promise<{ name: string }>
  lesen(): Promise<{ text: string }>
  schreiben(o: { text: string }): Promise<void>
  trennen(): Promise<void>
}
const Datei = registerPlugin<DateispeicherPlugin>('Dateispeicher')

export const dateiMoeglich = istApp

const KEY = 'wochenplan.datei.v1'
interface Stand {
  passwort: string
  /** Zeitstempel des Plans, der zuletzt gelesen oder geschrieben wurde */
  synchron: number
}
function laden(): Stand {
  try {
    const s = localStorage.getItem(KEY)
    if (s) return { passwort: '', synchron: 0, ...JSON.parse(s) }
  } catch {
    /* leer */
  }
  return { passwort: '', synchron: 0 }
}

export const datei = $state({
  gewaehlt: false,
  name: '',
  passwort: laden().passwort,
  zustand: 'aus' as 'aus' | 'laeuft' | 'ok' | 'fehler',
  meldung: '',
  zuletzt: 0,
})
let synchron = laden().synchron

function merken() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ passwort: datei.passwort, synchron }))
  } catch {
    /* gesperrt */
  }
}
export function passwortSpeichern() {
  merken()
}

export async function dateiInfoLaden() {
  if (!istApp) return
  try {
    const i = await Datei.info()
    datei.gewaehlt = i.gewaehlt
    datei.name = i.name ?? ''
  } catch {
    /* Plugin fehlt (Browser) */
  }
}

export async function dateiWaehlen(neu: boolean) {
  try {
    const r = await Datei.waehlen({ neu })
    datei.gewaehlt = true
    datei.name = r.name
    datei.meldung = ''
    synchron = 0
    merken()
    // Eine neue Datei sofort füllen; eine vorhandene zuerst lesen
    await dateiAbgleichen(true)
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (m !== 'abgebrochen') {
      datei.zustand = 'fehler'
      datei.meldung = m
    }
  }
}

export async function dateiTrennen() {
  try {
    await Datei.trennen()
  } catch {
    /* egal */
  }
  datei.gewaehlt = false
  datei.name = ''
  datei.zustand = 'aus'
  datei.meldung = ''
  synchron = 0
  merken()
}

let laeuft = false

/** Datei lesen und mit dem lokalen Plan abgleichen (neuere Änderung gewinnt) */
export async function dateiAbgleichen(erster = false): Promise<void> {
  if (!istApp || !datei.gewaehlt || !datei.passwort || laeuft) {
    if (datei.gewaehlt && !datei.passwort && !laeuft) {
      datei.zustand = 'fehler'
      datei.meldung = t('Bitte ein Familien-Passwort eintragen.')
    }
    return
  }
  laeuft = true
  datei.zustand = 'laeuft'
  try {
    const { text } = await Datei.lesen()
    let fern: { geaendert: number; salz: string; iv: string; daten: string; app: string } | null = null
    if (text.trim()) {
      try {
        const p = JSON.parse(text)
        if (p?.app === 'wochenplan') fern = p
        else throw new Error('x')
      } catch {
        throw new Error(t('Die gewählte Datei ist kein Wochenplan. Bitte eine leere oder neue Datei wählen.'))
      }
    }
    const lokal = lokalStand()
    if (fern && fern.geaendert > synchron && (fern.geaendert > lokal || erster)) {
      // Datei ist neuer (oder neu gewählt) → übernehmen
      let klar: string
      try {
        klar = await entschluesseln(fern as never, datei.passwort)
      } catch {
        throw new Error(t('Das Familien-Passwort passt nicht zur Datei.'))
      }
      let ok = false
      ohneAbgleich(() => (ok = importDaten(klar)))
      if (!ok) throw new Error(t('Der Plan in der Datei konnte nicht gelesen werden.'))
      synchron = fern.geaendert
      merken()
    } else if (!fern || lokal > synchron || erster) {
      // lokal ist neuer (oder Datei leer) → schreiben
      const geaendert = Math.max(lokal, Date.now())
      const paket = await verschluesseln(exportDaten(), datei.passwort, geaendert)
      await Datei.schreiben({ text: JSON.stringify(paket) })
      synchron = geaendert
      merken()
    }
    datei.zustand = 'ok'
    datei.meldung = ''
    datei.zuletzt = Date.now()
  } catch (e) {
    datei.zustand = 'fehler'
    datei.meldung = e instanceof Error ? e.message : String(e)
  } finally {
    laeuft = false
  }
}

let timer: ReturnType<typeof setTimeout> | undefined
/** Nach einer Planänderung kurz warten und dann abgleichen */
export function dateiGeaendert() {
  if (!istApp || !datei.gewaehlt) return
  clearTimeout(timer)
  timer = setTimeout(() => void dateiAbgleichen(), 3000)
}

/** Beim Start, beim Zurückkehren in die App und regelmäßig nachsehen */
export function dateiAbgleichStarten(): () => void {
  if (!istApp) return () => {}
  let aus = false
  void dateiInfoLaden().then(() => {
    if (!aus) void dateiAbgleichen()
  })
  const id = setInterval(() => {
    if (!aus && document.visibilityState === 'visible') void dateiAbgleichen()
  }, 90_000)
  const sichtbar = () => {
    if (document.visibilityState === 'visible') void dateiAbgleichen()
  }
  document.addEventListener('visibilitychange', sichtbar)
  return () => {
    aus = true
    clearInterval(id)
    document.removeEventListener('visibilitychange', sichtbar)
  }
}
