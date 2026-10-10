// Vorlesen für Kinder, die noch nicht lesen: in der App über das Android-Sprachmodul, im Browser über die Web-Sprachausgabe
import { app } from './speicher.svelte'

let letzter = ''
let letzteZeit = 0

export async function vorlesen(text: string) {
  if (!app.einst.vorlesen || !text) return
  // dieselbe Ansage nicht doppelt kurz hintereinander
  if (text === letzter && Date.now() - letzteZeit < 1500) return
  letzter = text
  letzteZeit = Date.now()
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
    await TextToSpeech.stop().catch(() => {})
    await TextToSpeech.speak({ text, lang: 'de-DE', rate: 0.9, pitch: 1.05, volume: 1, category: 'ambient' })
  } catch (e) {
    console.warn('Vorlesen nicht möglich', e)
  }
}
