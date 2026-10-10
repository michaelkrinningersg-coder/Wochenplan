// Neue App-Version finden und installieren.
// App (Fernseher/Tablet): neueste APK aus den GitHub-Releases laden und den Android-Installer öffnen.
// Browser: die Webseite wird mit jedem Release aktualisiert, dort genügt Neuladen.
import { t } from './i18n.svelte'
import { registerPlugin, type PluginListenerHandle } from '@capacitor/core'
import { istApp } from './geraet'

interface AktualisiererPlugin {
  version(): Promise<{ code: number; name: string }>
  installieren(o: { url: string }): Promise<{ status: 'gestartet' | 'erlaubnis' | 'erlaubnis-manuell' }>
  addListener(ereignis: 'fortschritt', fn: (d: { prozent: number }) => void): Promise<PluginListenerHandle>
}

const Aktualisierer = registerPlugin<AktualisiererPlugin>('Aktualisierer')

const RELEASES = 'https://api.github.com/repos/michaelkrinningersg-coder/Wochenplan/releases/latest'

export const update = $state({
  /** installierte Version (Build-Nummer) */
  aktuell: typeof __VERSION__ === 'number' ? __VERSION__ : 0,
  /** neueste verfügbare Version */
  neu: 0,
  url: '',
  zustand: 'ruhe' as 'ruhe' | 'suche' | 'laden' | 'fehler',
  prozent: 0,
  meldung: '',
})

export const updateVerfuegbar = () => update.neu > update.aktuell && update.aktuell > 0

async function versionLesen() {
  if (!istApp) return
  try {
    const v = await Aktualisierer.version()
    if (v.code > 1) update.aktuell = v.code
  } catch {
    /* ältere App ohne Plugin */
  }
}

/** Auf GitHub nach der neuesten Version sehen */
export async function suchen(): Promise<boolean> {
  if (__STORE__) return false
  update.zustand = 'suche'
  update.meldung = ''
  try {
    await versionLesen()
    const r = await fetch(RELEASES, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' })
    if (!r.ok) throw new Error(t('GitHub antwortet mit Fehler {status}.', { status: r.status }))
    const d = (await r.json()) as { tag_name?: string; assets?: { name: string; browser_download_url: string }[] }
    const nr = Number(/(\d+)$/.exec(d.tag_name ?? '')?.[1] ?? 0)
    const apk = d.assets?.find((a) => a.name.endsWith('.apk'))
    update.neu = nr
    update.url = apk?.browser_download_url ?? ''
    update.zustand = 'ruhe'
    update.meldung = updateVerfuegbar() ? t('Version 1.0.{nr} ist da.', { nr }) : t('Die App ist aktuell.')
    return updateVerfuegbar()
  } catch (e) {
    update.zustand = 'fehler'
    update.meldung = e instanceof TypeError ? t('Keine Verbindung zu GitHub.') : e instanceof Error ? e.message : String(e)
    return false
  }
}

/** Neue Version installieren (App) bzw. Seite neu laden (Browser) */
export async function installieren() {
  if (!istApp) {
    location.reload()
    return
  }
  if (!update.url) await suchen()
  if (!update.url) return
  update.zustand = 'laden'
  update.prozent = 0
  update.meldung = t('Neue Version wird geladen …')
  const h = await Aktualisierer.addListener('fortschritt', (d) => (update.prozent = d.prozent))
  try {
    const r = await Aktualisierer.installieren({ url: update.url })
    update.zustand = 'ruhe'
    update.meldung =
      r.status === 'gestartet'
        ? t('Bitte im Android-Fenster auf „Aktualisieren“ bzw. „Installieren“ drücken.')
        : r.status === 'erlaubnis'
          ? t('Einmalig erlauben: „Wochenplan“ darf Apps installieren. Danach noch einmal auf „Aktualisieren“ drücken.')
          : t('Bitte in den Android-Einstellungen erlauben, dass „Wochenplan“ Apps installieren darf, dann noch einmal versuchen.')
  } catch (e) {
    update.zustand = 'fehler'
    update.meldung = e instanceof Error ? e.message : String(e)
  } finally {
    void h.remove()
  }
}

/** In der App beim Start und dann alle 6 Stunden still nachsehen */
export function updatePruefungStarten(): () => void {
  if (__STORE__) return () => {}
  void versionLesen()
  if (!istApp) return () => {}
  const pruefen = () => {
    if (update.zustand !== 'laden') void suchen()
  }
  const start = setTimeout(pruefen, 20_000)
  const id = setInterval(pruefen, 6 * 3600_000)
  return () => {
    clearTimeout(start)
    clearInterval(id)
  }
}
