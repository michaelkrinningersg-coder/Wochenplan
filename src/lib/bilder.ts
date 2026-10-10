import { app } from './speicher.svelte'

const dateien = import.meta.glob('../assets/icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

// Gemalte Bildkarten (WebP) ersetzen gleichnamige Symbole
const karten = import.meta.glob('../assets/karten/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

// Mädchen-Variante der Bildkarten (nur wo vorhanden, sonst die Standardkarte)
const kartenM = import.meta.glob('../assets/karten-maedchen/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const MAEDCHEN_URL: Record<string, string> = {}
for (const [pfad, url] of Object.entries(kartenM)) {
  MAEDCHEN_URL[pfad.split('/').pop()!.replace(/\.webp$/, '')] = url
}

export const ICON_URL: Record<string, string> = {}
export const IST_KARTE = new Set<string>()
for (const [pfad, url] of Object.entries(dateien)) {
  ICON_URL[pfad.split('/').pop()!.replace(/\.svg$/, '')] = url
}
for (const [pfad, url] of Object.entries(karten)) {
  const name = pfad.split('/').pop()!.replace(/\.webp$/, '')
  ICON_URL[name] = url
  IST_KARTE.add(name)
}

export function bildUrl(id: string, fotos: Record<string, string>): string {
  if (id.startsWith('foto:')) return fotos[id.slice(5)] ?? ICON_URL['stern']
  if (app.einst.kartenstil === 'maedchen' && MAEDCHEN_URL[id]) return MAEDCHEN_URL[id]
  return ICON_URL[id] ?? ICON_URL['stern']
}

/** Foto verkleinern (max. Kantenlänge), als JPEG-Daten-URL zurückgeben */
export async function fotoVerkleinern(datei: File, max = 512): Promise<string> {
  const url = URL.createObjectURL(datei)
  try {
    const img = await new Promise<HTMLImageElement>((ok, fehler) => {
      const i = new Image()
      i.onload = () => ok(i)
      i.onerror = () => fehler(new Error('Bild konnte nicht geladen werden'))
      i.src = url
    })
    const faktor = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
    const b = Math.max(1, Math.round(img.naturalWidth * faktor))
    const h = Math.max(1, Math.round(img.naturalHeight * faktor))
    const canvas = document.createElement('canvas')
    canvas.width = b
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, b, h)
    ctx.drawImage(img, 0, 0, b, h)
    return canvas.toDataURL('image/jpeg', 0.82)
  } finally {
    URL.revokeObjectURL(url)
  }
}
