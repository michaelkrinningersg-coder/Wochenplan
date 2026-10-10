// Echtes Wetter für das Ruhebild (Open-Meteo, kostenlos, ohne Schlüssel). Nur wenn in den Einstellungen ein Ort gewählt ist.
import { app } from './speicher.svelte'

export type WetterArt = 'klar' | 'wolkig' | 'nebel' | 'regen' | 'schnee' | 'gewitter'

export const wetter = $state({ art: null as WetterArt | null, temperatur: null as number | null, zeit: 0, ort: '' })

function artVonCode(c: number): WetterArt {
  if (c >= 95) return 'gewitter'
  if ((c >= 71 && c <= 77) || c === 85 || c === 86) return 'schnee'
  if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return 'regen'
  if (c === 45 || c === 48) return 'nebel'
  if (c >= 2) return 'wolkig'
  return 'klar'
}

export function ortTeile(ort?: string): { name: string; lat: number; lon: number } | null {
  if (!ort) return null
  const [name, lat, lon] = ort.split('|')
  return name && lat && lon ? { name, lat: Number(lat), lon: Number(lon) } : null
}

/** Wetter holen (höchstens alle 30 Minuten) */
export async function wetterAktualisieren(erzwingen = false) {
  const o = ortTeile(app.einst.wetterOrt)
  if (!o) {
    wetter.art = null
    wetter.temperatur = null
    return
  }
  if (!erzwingen && wetter.ort === app.einst.wetterOrt && Date.now() - wetter.zeit < 30 * 60_000) return
  try {
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${o.lat}&longitude=${o.lon}&current=temperature_2m,weather_code&timezone=auto`,
    )
    if (!r.ok) return
    const d = (await r.json()) as { current?: { temperature_2m?: number; weather_code?: number } }
    if (typeof d.current?.weather_code !== 'number') return
    wetter.art = artVonCode(d.current.weather_code)
    wetter.temperatur = typeof d.current.temperature_2m === 'number' ? Math.round(d.current.temperature_2m) : null
    wetter.zeit = Date.now()
    wetter.ort = app.einst.wetterOrt ?? ''
  } catch (e) {
    console.warn('Wetter', e)
  }
}

/** Ort suchen (Name → Koordinaten) */
export async function ortSuchen(name: string): Promise<{ name: string; lat: number; lon: number; land: string }[]> {
  const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=de&format=json`)
  if (!r.ok) throw new Error('Ortssuche nicht erreichbar')
  const d = (await r.json()) as { results?: { name: string; latitude: number; longitude: number; admin1?: string; country?: string }[] }
  return (d.results ?? []).map((x) => ({
    name: x.name,
    lat: Math.round(x.latitude * 100) / 100,
    lon: Math.round(x.longitude * 100) / 100,
    land: [x.admin1, x.country].filter(Boolean).join(', '),
  }))
}
