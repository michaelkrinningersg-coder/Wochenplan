// Eigene Fotos für das Ruhebild: lokal in IndexedDB (zu groß für localStorage),
// zwischen den Geräten einzeln verschlüsselt im Repo (siehe abgleich.svelte.ts).
const DB = 'wochenplan-ruhebilder'
const STORE = 'bilder'

function oeffnen(): Promise<IDBDatabase> {
  return new Promise((ok, fehler) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = () => r.result.createObjectStore(STORE)
    r.onsuccess = () => ok(r.result)
    r.onerror = () => fehler(r.error)
  })
}

async function mitStore<T>(modus: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await oeffnen()
  return new Promise((ok, fehler) => {
    const tx = db.transaction(STORE, modus)
    const r = fn(tx.objectStore(STORE))
    r.onsuccess = () => ok(r.result)
    r.onerror = () => fehler(r.error)
  })
}

/** Bilder im Speicher: Kennung → Daten-URL */
export const ruhe = $state({ bilder: {} as Record<string, string>, geladen: false })

export async function ruhebilderLaden() {
  try {
    const keys = (await mitStore('readonly', (s) => s.getAllKeys())) as string[]
    const neu: Record<string, string> = {}
    for (const k of keys) {
      const d = (await mitStore('readonly', (s) => s.get(k))) as string | undefined
      if (d) neu[k] = d
    }
    ruhe.bilder = neu
  } catch (e) {
    console.warn('Ruhebilder laden', e)
  } finally {
    ruhe.geladen = true
  }
}

export async function ruhebildSpeichern(id: string, daten: string) {
  ruhe.bilder[id] = daten
  try {
    await mitStore('readwrite', (s) => s.put(daten, id))
  } catch (e) {
    console.warn('Ruhebild speichern', e)
  }
}

export async function ruhebildEntfernen(id: string) {
  delete ruhe.bilder[id]
  try {
    await mitStore('readwrite', (s) => s.delete(id))
  } catch (e) {
    console.warn('Ruhebild löschen', e)
  }
}

/** Foto für den Fernseher verkleinern (max. 1600 px, JPEG) */
export async function ruhebildVorbereiten(datei: File): Promise<string> {
  const url = URL.createObjectURL(datei)
  try {
    const img = await new Promise<HTMLImageElement>((ok, fehler) => {
      const i = new Image()
      i.onload = () => ok(i)
      i.onerror = () => fehler(new Error('Bild konnte nicht geladen werden'))
      i.src = url
    })
    const f = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight))
    const c = document.createElement('canvas')
    c.width = Math.round(img.naturalWidth * f)
    c.height = Math.round(img.naturalHeight * f)
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
    return c.toDataURL('image/jpeg', 0.78)
  } finally {
    URL.revokeObjectURL(url)
  }
}
