// Plan im WLAN vom Handy auf den Fernseher übertragen (Kopplungscode, ohne Server).
// Fernseher: „Plan empfangen“ zeigt Adresse und 6-stelligen Code. Handy: „Plan senden“ sucht den Fernseher,
// verschlüsselt den Plan mit dem Code und schickt ihn direkt. Nur in der App (nicht im Browser).
import { t } from './i18n.svelte'
import { registerPlugin, type PluginListenerHandle } from '@capacitor/core'
import { entschluesseln, verschluesseln } from './abgleich.svelte'
import { istApp } from './geraet'
import { exportDaten, importDaten } from './speicher.svelte'

export interface Geraet {
  ip: string
  port: number
  name: string
}

interface KopplungPlugin {
  empfangen(): Promise<{ ip: string; port: number }>
  antworten(o: { ok: boolean }): Promise<void>
  stoppen(): Promise<void>
  suchen(): Promise<{ geraete: Geraet[] }>
  senden(o: { ip: string; port: number; daten: string }): Promise<{ antwort: string }>
  addListener(ereignis: 'empfangen', fn: (d: { daten: string }) => void): Promise<PluginListenerHandle>
}

const Kopplung = registerPlugin<KopplungPlugin>('Kopplung')

export const kopplungMoeglich = istApp

export const kopplung = $state({
  /** aus | wartet (Fernseher zeigt Code) | sucht | bereit (Fernseher gewählt) | sendet | fertig */
  modus: 'aus' as 'aus' | 'wartet' | 'sucht' | 'bereit' | 'sendet' | 'fertig',
  ip: '',
  port: 0,
  code: '',
  meldung: '',
  geraete: [] as Geraet[],
})

let hoerer: PluginListenerHandle | null = null
let versuche = 0
let abbruch: ReturnType<typeof setTimeout> | undefined

function neuerCode(): string {
  const z = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000
  return String(z).padStart(6, '0')
}

/** Fernseher: bereit machen und auf das Handy warten (höchstens 10 Minuten) */
export async function empfangStarten() {
  if (!istApp) return
  await empfangStoppen()
  kopplung.meldung = ''
  kopplung.code = neuerCode()
  versuche = 0
  try {
    hoerer = await Kopplung.addListener('empfangen', async ({ daten }) => {
      let ok = false
      try {
        const klar = await entschluesseln(JSON.parse(daten), kopplung.code)
        ok = importDaten(klar)
        kopplung.meldung = ok ? t('Plan übernommen.') : t('Die Daten sind kein gültiger Plan.')
      } catch {
        versuche++
        kopplung.meldung = t('Ein Gerät hat einen falschen Code eingegeben.')
        if (versuche >= 5) {
          kopplung.code = neuerCode()
          versuche = 0
          kopplung.meldung += ' ' + t('Der Code wurde erneuert.')
        }
      }
      await Kopplung.antworten({ ok })
      if (ok) {
        kopplung.modus = 'fertig'
        void empfangStoppen(false)
      }
    })
    const r = await Kopplung.empfangen()
    kopplung.ip = r.ip
    kopplung.port = r.port
    kopplung.modus = 'wartet'
    abbruch = setTimeout(() => void empfangStoppen(), 10 * 60_000)
  } catch (e) {
    kopplung.meldung = e instanceof Error ? e.message : t('Der Empfang konnte nicht gestartet werden.')
    kopplung.modus = 'aus'
  }
}

export async function empfangStoppen(zuruecksetzen = true) {
  clearTimeout(abbruch)
  try {
    await hoerer?.remove()
  } catch {
    /* egal */
  }
  hoerer = null
  if (istApp) {
    try {
      await Kopplung.stoppen()
    } catch {
      /* egal */
    }
  }
  if (zuruecksetzen) {
    kopplung.modus = 'aus'
    kopplung.code = ''
  }
}

/** Handy: Fernseher im WLAN suchen */
export async function fernseherSuchen() {
  if (!istApp) return
  kopplung.modus = 'sucht'
  kopplung.meldung = ''
  try {
    const r = await Kopplung.suchen()
    kopplung.geraete = r.geraete
    kopplung.meldung = r.geraete.length ? '' : t('Kein Fernseher gefunden. Ist dort „Plan empfangen“ gestartet und sind beide im selben WLAN?')
  } catch {
    kopplung.meldung = t('Die Suche ist fehlgeschlagen.')
  }
  kopplung.modus = 'bereit'
}

/** Handy: Plan mit dem Code verschlüsseln und an den Fernseher schicken */
export async function planSenden(g: Geraet, code: string): Promise<boolean> {
  if (!istApp) return false
  kopplung.modus = 'sendet'
  kopplung.meldung = ''
  try {
    const paket = await verschluesseln(exportDaten(), code.trim(), Date.now())
    const r = await Kopplung.senden({ ip: g.ip, port: g.port, daten: JSON.stringify(paket) })
    if (r.antwort === 'OK') {
      kopplung.meldung = t('Der Plan ist auf dem Fernseher.')
      kopplung.modus = 'fertig'
      return true
    }
    kopplung.meldung = r.antwort === 'FALSCH' ? t('Der Code stimmt nicht. Bitte noch einmal vom Fernseher ablesen.') : t('Der Fernseher hat den Plan nicht angenommen.')
  } catch (e) {
    kopplung.meldung = e instanceof Error ? e.message : t('Keine Verbindung zum Fernseher.')
  }
  kopplung.modus = 'bereit'
  return false
}
