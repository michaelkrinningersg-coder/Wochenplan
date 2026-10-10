// Verbindung zu Android über Capacitor (Zurück-Taste, Bildschirm anlassen, Datei teilen).
// Im Browser greifen jeweils einfache Ersatzlösungen.
import { Capacitor } from '@capacitor/core'

export const istApp = Capacitor.isNativePlatform()

export async function bildschirmAnlassen(an: boolean) {
  try {
    const { KeepAwake } = await import('@capacitor-community/keep-awake')
    const { isSupported } = await KeepAwake.isSupported()
    if (!isSupported) return
    if (an) await KeepAwake.keepAwake()
    else await KeepAwake.allowSleep()
  } catch (e) {
    console.warn('Bildschirm anlassen nicht möglich', e)
  }
}

/** Zurück-Taste der Fernbedienung / des Tablets. handler gibt false zurück → App beenden. */
export async function zurueckTaste(handler: () => boolean) {
  if (!istApp) return
  const { App } = await import('@capacitor/app')
  await App.addListener('backButton', () => {
    if (!handler()) void App.exitApp()
  })
}

/** Datei speichern bzw. teilen. Gibt eine kurze Rückmeldung für den Nutzer zurück. */
export async function dateiExportieren(dateiname: string, text: string): Promise<string> {
  if (!istApp) {
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = dateiname
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
    return 'Datei wird heruntergeladen.'
  }
  const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem')
  const ergebnis = await Filesystem.writeFile({
    path: dateiname,
    data: text,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  })
  try {
    const { Share } = await import('@capacitor/share')
    const { value } = await Share.canShare()
    if (value) {
      await Share.share({ title: 'Wochenplan', url: ergebnis.uri, dialogTitle: 'Wochenplan teilen' })
      return 'Plan geteilt.'
    }
  } catch (e) {
    console.warn('Teilen nicht möglich', e)
  }
  // Fallback (z. B. Fernseher): in „Dokumente“ ablegen
  await Filesystem.writeFile({
    path: dateiname,
    data: text,
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  })
  return `Gespeichert unter Dokumente/${dateiname}`
}
