// Free / Pro der Store-Version. Die Familienversion (kein Store-Build) hat immer alles.
// Gekauft wird über Google Play (Plugin „Kauf“). Der gemerkte Stand dient nur dem Offline-Start;
// bei jedem Start fragt die App Google Play erneut (Käufe, Erstattungen).
import { registerPlugin } from '@capacitor/core'

interface KaufPlugin {
  status(): Promise<{ pro: boolean; preis?: string; bereit: boolean }>
  kaufen(): Promise<{ pro: boolean }>
  wiederherstellen(): Promise<{ pro: boolean }>
}
const Kauf = registerPlugin<KaufPlugin>('Kauf')

/** Die kostenlose Version zeigt nur diese Tageszeit … */
export const FREI_ABSCHNITT = 'morgen'
/** … mit höchstens so vielen Kacheln */
export const FREI_MAX_KACHELN = 5

const KEY = 'wochenplan.pro.v1'

function gemerkt(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export const lizenz = $state({
  pro: !__STORE__ || gemerkt(),
  /** Preis aus Google Play, z. B. „2,99 €“ */
  preis: '',
  /** Kauf in Google Play möglich (Dienst erreichbar, Produkt vorhanden) */
  bereit: false,
  laeuft: false,
  meldung: '',
})

export function istPro(): boolean {
  return lizenz.pro
}

function setzen(pro: boolean) {
  lizenz.pro = pro
  try {
    if (pro) localStorage.setItem(KEY, '1')
    else localStorage.removeItem(KEY)
  } catch {
    /* ohne Speicher gilt der Stand nur für diese Sitzung */
  }
}

/** Beim Start: Käufe und Preis bei Google Play abfragen (nur Store-Version auf dem Gerät) */
export async function lizenzLaden(): Promise<void> {
  if (!__STORE__) return
  try {
    const r = await Kauf.status()
    lizenz.bereit = r.bereit
    lizenz.preis = r.preis ?? ''
    // Nur wenn Google Play geantwortet hat, ist „kein Kauf“ verbindlich (sonst bleibt der gemerkte Stand)
    if (r.bereit) setzen(r.pro)
  } catch {
    /* Browser oder kein Google Play: gemerkter Stand bleibt */
  }
}

/** Kaufvorgang starten; liefert true, wenn Pro danach aktiv ist */
export async function proKaufen(): Promise<boolean> {
  if (lizenz.laeuft) return lizenz.pro
  lizenz.laeuft = true
  lizenz.meldung = ''
  try {
    const r = await Kauf.kaufen()
    setzen(r.pro)
    return r.pro
  } catch (e) {
    lizenz.meldung = e instanceof Error ? e.message : String(e)
    return false
  } finally {
    lizenz.laeuft = false
  }
}

export async function kaeufeWiederherstellen(): Promise<boolean> {
  if (lizenz.laeuft) return lizenz.pro
  lizenz.laeuft = true
  lizenz.meldung = ''
  try {
    const r = await Kauf.wiederherstellen()
    setzen(r.pro)
    return r.pro
  } catch (e) {
    lizenz.meldung = e instanceof Error ? e.message : String(e)
    return false
  } finally {
    lizenz.laeuft = false
  }
}
