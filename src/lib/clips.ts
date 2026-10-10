// Vorgerenderte Sprachbausteine (z. B. Piper-Stimmen). Liegen Dateien in src/assets/stimme/, werden sie
// für die festen Ansagen benutzt; fehlt ein Baustein, spricht die Gerätestimme (siehe vorlesen.ts).
// Dateinamen: <gruppe>_<text-als-slug>.mp3 – genau wie in tools/wortliste.csv.
const dateien = import.meta.glob('../assets/stimme/*.{mp3,ogg,opus,wav}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

const URLS = new Map<string, string>()
for (const [pfad, url] of Object.entries(dateien)) URLS.set(pfad.split('/').pop()!.replace(/\.[a-z0-9]+$/, ''), url)

export const clipsVorhanden = URLS.size > 0

export function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Bausteinname aus Gruppe und Text, z. B. baustein('ansage', 'Jetzt ist Lesen dran.') */
export const baustein = (gruppe: string, text: string) => `${gruppe}_${slug(text)}`

let aktuell: HTMLAudioElement | null = null
let zaehler = 0

export function clipsStoppen() {
  zaehler++
  aktuell?.pause()
  aktuell = null
}

/** Spielt die Bausteine nacheinander. Gibt false zurück, wenn einer fehlt (dann nichts abgespielt). */
export async function clipsSpielen(namen: string[], lautstaerke = 1): Promise<boolean> {
  if (!clipsVorhanden || !namen.length) return false
  const urls = namen.map((n) => URLS.get(n))
  if (urls.some((u) => !u)) return false
  clipsStoppen()
  const mein = zaehler
  for (const url of urls as string[]) {
    if (mein !== zaehler) return true
    const a = new Audio(url)
    a.volume = lautstaerke
    aktuell = a
    try {
      await new Promise<void>((ok, fehler) => {
        a.onended = () => ok()
        a.onerror = () => fehler(new Error('Audio'))
        void a.play().catch(fehler)
      })
    } catch {
      return mein !== zaehler ? true : false
    }
    await new Promise((r) => setTimeout(r, 60))
  }
  return true
}
