// Abgleich über GitHub: Der Planer (Handy/PC) lädt den Plan verschlüsselt hoch,
// der Fernseher holt ihn regelmäßig ab. Ohne Familien-Passwort ist die Datei nicht lesbar.
import { istApp } from './geraet'
import { app, erledigtKuerzen, exportDaten, importDaten, zeigeHinweis, type ErledigtStand } from './speicher.svelte'

export interface AbgleichEinst {
  rolle: 'planer' | 'anzeige'
  passwort: string
  token: string
  besitzer: string
  repo: string
  zweig: string
  datei: string
}

interface Stand {
  /** Zeitstempel des Plans, der zuletzt hoch- oder heruntergeladen wurde */
  synchron: number
  /** Zeitstempel der letzten Änderung auf diesem Gerät */
  lokal: number
  etag: string
}

const KEY_EINST = 'wochenplan.abgleich.v1'
const KEY_STAND = 'wochenplan.abgleich-stand.v1'

function laden<T>(key: string, ersatz: T): T {
  try {
    const s = localStorage.getItem(key)
    return s ? { ...ersatz, ...JSON.parse(s) } : ersatz
  } catch {
    return ersatz
  }
}
function ablegen(key: string, wert: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(wert))
  } catch {
    /* Speicher voll oder gesperrt */
  }
}

export const abgleich = $state({
  einst: laden<AbgleichEinst>(KEY_EINST, {
    // In der App (Fernseher/Tablet) standardmäßig nur anzeigen, im Browser planen
    rolle: istApp ? 'anzeige' : 'planer',
    passwort: '',
    token: '',
    besitzer: 'michaelkrinningersg-coder',
    repo: 'wochenplan',
    zweig: 'plan-daten',
    datei: 'plan.json',
  }),
  stand: laden<Stand>(KEY_STAND, { synchron: 0, lokal: 0, etag: '' }),
  zustand: 'aus' as 'aus' | 'laeuft' | 'ok' | 'fehler',
  meldung: '',
  zuletzt: 0,
})

export function einstSpeichern() {
  ablegen(KEY_EINST, $state.snapshot(abgleich.einst))
}
function standSpeichern() {
  ablegen(KEY_STAND, $state.snapshot(abgleich.stand))
}

export function istEingerichtet(): boolean {
  const e = abgleich.einst
  // Lesen geht nur mit Passwort; der Token (zum Hochladen) kommt notfalls verschlüsselt mit dem Plan
  return !!(e.passwort && e.besitzer && e.repo && e.zweig && e.datei)
}

// ---------- Verschlüsselung (AES-GCM, Schlüssel aus Passwort per PBKDF2) ----------

const enc = new TextEncoder()
const dec = new TextDecoder()

function zuB64(bytes: Uint8Array): string {
  let s = ''
  const STUECK = 0x8000
  for (let i = 0; i < bytes.length; i += STUECK) s += String.fromCharCode(...bytes.subarray(i, i + STUECK))
  return btoa(s)
}
function ausB64(b64: string): Uint8Array<ArrayBuffer> {
  const s = atob(b64.replace(/\s/g, ''))
  const out = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i)
  return out
}

async function schluessel(passwort: string, salz: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const basis = await crypto.subtle.importKey('raw', enc.encode(passwort), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salz, iterations: 250_000, hash: 'SHA-256' },
    basis,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

interface Paket {
  app: 'wochenplan'
  format: 1
  geaendert: number
  salz: string
  iv: string
  daten: string
}

export async function verschluesseln(text: string, passwort: string, geaendert: number): Promise<Paket> {
  const salz = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await schluessel(passwort, salz)
  const daten = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text)))
  return { app: 'wochenplan', format: 1, geaendert, salz: zuB64(salz), iv: zuB64(iv), daten: zuB64(daten) }
}

export async function entschluesseln(p: Paket, passwort: string): Promise<string> {
  const key = await schluessel(passwort, ausB64(p.salz))
  const klar = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ausB64(p.iv) }, key, ausB64(p.daten))
  return dec.decode(klar)
}

// ---------- GitHub ----------

/** Erledigt-Stand liegt neben dem Plan in status.json */
function statusDatei(): string {
  const teile = abgleich.einst.datei.split('/')
  teile[teile.length - 1] = 'status.json'
  return teile.join('/')
}

function apiUrl(datei = abgleich.einst.datei): string {
  const e = abgleich.einst
  return `https://api.github.com/repos/${encodeURIComponent(e.besitzer)}/${encodeURIComponent(e.repo)}/contents/${datei
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`
}

function kopf(extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { 'X-GitHub-Api-Version': '2022-11-28', ...extra }
  if (abgleich.einst.token) h.Authorization = `Bearer ${abgleich.einst.token.trim()}`
  return h
}

function fehlerText(status: number): string {
  if (status === 401) return 'Der GitHub-Token ist ungültig oder abgelaufen.'
  if (status === 403) return 'GitHub verweigert den Zugriff. Prüfe die Rechte des Tokens (Inhalte: Lesen und Schreiben).'
  if (status === 404) return 'Plan-Datei oder Zweig nicht gefunden. Prüfe Repo und Zweig in den Einstellungen.'
  if (status === 409 || status === 422) return 'Der Plan wurde gleichzeitig woanders geändert. Bitte noch einmal versuchen.'
  return `GitHub antwortet mit Fehler ${status}.`
}

let laeuft = false
let anwenden = false

/** Plan vom Server holen. Gibt true zurück, wenn ein neuer Plan übernommen wurde. */
export async function holen(erzwingen = false): Promise<boolean> {
  if (!istEingerichtet() || laeuft) return false
  laeuft = true
  abgleich.zustand = 'laeuft'
  try {
    const ref = encodeURIComponent(abgleich.einst.zweig)
    const r = await fetch(`${apiUrl()}?ref=${ref}`, {
      headers: kopf({
        Accept: 'application/vnd.github.raw+json',
        ...(abgleich.stand.etag && !erzwingen ? { 'If-None-Match': abgleich.stand.etag } : {}),
      }),
      cache: 'no-store',
    })
    if (r.status === 304) {
      ok()
      return false
    }
    if (r.status === 404) {
      // noch nie hochgeladen – kein Fehler für den Planer
      if (abgleich.einst.rolle === 'planer') {
        ok('Noch kein Plan hochgeladen.')
        return false
      }
      throw new Error(fehlerText(404))
    }
    if (!r.ok) throw new Error(fehlerText(r.status))
    const paket = (await r.json()) as Paket
    abgleich.stand.etag = r.headers.get('ETag') ?? ''
    if (paket.app !== 'wochenplan') throw new Error('Die Datei ist kein Wochenplan.')
    const lokalUngespeichert = abgleich.einst.rolle === 'planer' && abgleich.stand.lokal > abgleich.stand.synchron
    if (!erzwingen && (paket.geaendert <= abgleich.stand.synchron || lokalUngespeichert)) {
      standSpeichern()
      ok()
      return false
    }
    let text: string
    try {
      text = await entschluesseln(paket, abgleich.einst.passwort)
    } catch {
      throw new Error('Das Familien-Passwort passt nicht zum Plan.')
    }
    tokenUebernehmen(text)
    anwenden = true
    const erfolg = importDaten(text)
    queueMicrotask(() => (anwenden = false))
    if (!erfolg) throw new Error('Der Plan konnte nicht gelesen werden.')
    abgleich.stand.synchron = paket.geaendert
    abgleich.stand.lokal = paket.geaendert
    standSpeichern()
    ok()
    return true
  } catch (e) {
    fehler(e)
    return false
  } finally {
    laeuft = false
  }
}

/** Plan hochladen (nur Planer mit Token) */
export async function hochladen(): Promise<boolean> {
  if (!istEingerichtet() || abgleich.einst.rolle !== 'planer' || !abgleich.einst.token || laeuft) return false
  laeuft = true
  abgleich.zustand = 'laeuft'
  try {
    // Mehrere Planer (z. B. zwei Handys): wurde der Plan inzwischen woanders geändert?
    // Dann nicht überschreiben, sondern den neueren Plan übernehmen.
    {
      const r = await fetch(`${apiUrl()}?ref=${encodeURIComponent(abgleich.einst.zweig)}`, {
        headers: kopf({ Accept: 'application/vnd.github.raw+json' }),
        cache: 'no-store',
      })
      if (r.ok) {
        const fern = (await r.json()) as Paket
        if (fern.app === 'wochenplan' && fern.geaendert > abgleich.stand.synchron) {
          const vorher = abgleich.stand.synchron
          const text = await entschluesseln(fern, abgleich.einst.passwort)
          anwenden = true
          const erfolg = importDaten(text)
          queueMicrotask(() => (anwenden = false))
          if (erfolg) {
            abgleich.stand.synchron = fern.geaendert
            abgleich.stand.lokal = fern.geaendert
            abgleich.stand.etag = r.headers.get('ETag') ?? ''
            standSpeichern()
            ok()
            if (vorher > 0)
              zeigeHinweis('Der Plan wurde auf einem anderen Gerät geändert und neu geladen. Bitte die letzte Änderung noch einmal machen.')
            return false
          }
        }
      } else if (r.status !== 404) throw new Error(fehlerText(r.status))
    }
    const geaendert = Math.max(abgleich.stand.lokal, Date.now())
    // Der Schreib-Token reist verschlüsselt mit, damit der Fernseher „Erledigt“ melden kann
    const daten = { ...JSON.parse(exportDaten()), zugang: { token: abgleich.einst.token.trim() } }
    const paket = await verschluesseln(JSON.stringify(daten), abgleich.einst.passwort, geaendert)
    const inhalt = zuB64(enc.encode(JSON.stringify(paket)))
    const ref = encodeURIComponent(abgleich.einst.zweig)

    for (let versuch = 0; versuch < 2; versuch++) {
      // aktuelle Version (sha) der Datei holen
      let sha: string | undefined
      const meta = await fetch(`${apiUrl()}?ref=${ref}`, {
        headers: kopf({ Accept: 'application/vnd.github+json' }),
        cache: 'no-store',
      })
      if (meta.ok) sha = ((await meta.json()) as { sha?: string }).sha
      else if (meta.status !== 404) throw new Error(fehlerText(meta.status))

      const r = await fetch(apiUrl(), {
        method: 'PUT',
        headers: kopf({ Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          message: 'Plan aktualisiert',
          content: inhalt,
          branch: abgleich.einst.zweig,
          ...(sha ? { sha } : {}),
        }),
      })
      if (r.ok) {
        abgleich.stand.synchron = geaendert
        abgleich.stand.lokal = geaendert
        abgleich.stand.etag = ''
        standSpeichern()
        ok()
        return true
      }
      if (r.status === 409 && versuch === 0) continue
      throw new Error(fehlerText(r.status))
    }
    return false
  } catch (e) {
    fehler(e)
    return false
  } finally {
    laeuft = false
  }
}

function tokenUebernehmen(text: string) {
  // Fernseher immer; zweites Planer-Handy nur, wenn dort noch kein Token eingetragen ist
  if (abgleich.einst.rolle !== 'anzeige' && abgleich.einst.token) return
  try {
    const t = JSON.parse(text)?.zugang?.token
    if (typeof t === 'string' && t && t !== abgleich.einst.token) {
      abgleich.einst.token = t
      einstSpeichern()
    }
  } catch {
    /* egal */
  }
}

// ---------- Erledigt-Stand (status.json) ----------

/** Zwei Stände zusammenführen: je Eintrag gewinnt die jüngere Änderung */
export function erledigtMischen(a: ErledigtStand, b: ErledigtStand): ErledigtStand {
  const out: ErledigtStand = {}
  for (const quelle of [a, b])
    for (const [datum, eintraege] of Object.entries(quelle ?? {})) {
      if (!eintraege || typeof eintraege !== 'object') continue
      const ziel = (out[datum] ??= {})
      for (const [k, v] of Object.entries(eintraege)) {
        if (typeof v !== 'number') continue
        if (ziel[k] === undefined || Math.abs(v) > Math.abs(ziel[k])) ziel[k] = v
      }
    }
  return erledigtKuerzen(out)
}

function gleich(a: ErledigtStand, b: ErledigtStand): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

let statusEtag = ''
let statusLaeuft = false

/** Erledigt-Stand der anderen Geräte holen und einmischen */
export async function statusHolen(): Promise<void> {
  if (!istEingerichtet() || statusLaeuft) return
  statusLaeuft = true
  try {
    const ref = encodeURIComponent(abgleich.einst.zweig)
    const r = await fetch(`${apiUrl(statusDatei())}?ref=${ref}`, {
      headers: kopf({ Accept: 'application/vnd.github.raw+json', ...(statusEtag ? { 'If-None-Match': statusEtag } : {}) }),
      cache: 'no-store',
    })
    if (!r.ok) return
    statusEtag = r.headers.get('ETag') ?? ''
    const fern = JSON.parse(await entschluesseln((await r.json()) as Paket, abgleich.einst.passwort)) as {
      erledigt?: ErledigtStand
    }
    const neu = erledigtMischen($state.snapshot(app.erledigt), fern.erledigt ?? {})
    if (!gleich(neu, $state.snapshot(app.erledigt))) app.erledigt = neu
  } catch (e) {
    console.warn('Status holen', e)
  } finally {
    statusLaeuft = false
  }
}

/** Eigenen Erledigt-Stand hochladen (mit dem Stand auf GitHub zusammengeführt) */
export async function statusHochladen(): Promise<boolean> {
  if (!istEingerichtet() || !abgleich.einst.token || statusLaeuft) return false
  statusLaeuft = true
  try {
    const ref = encodeURIComponent(abgleich.einst.zweig)
    for (let versuch = 0; versuch < 3; versuch++) {
      let sha: string | undefined
      let fern: ErledigtStand = {}
      const meta = await fetch(`${apiUrl(statusDatei())}?ref=${ref}`, {
        headers: kopf({ Accept: 'application/vnd.github+json' }),
        cache: 'no-store',
      })
      if (meta.ok) {
        const m = (await meta.json()) as { sha?: string; content?: string }
        sha = m.sha
        try {
          const paket = JSON.parse(dec.decode(ausB64(m.content ?? ''))) as Paket
          fern = (JSON.parse(await entschluesseln(paket, abgleich.einst.passwort)) as { erledigt?: ErledigtStand }).erledigt ?? {}
        } catch {
          fern = {}
        }
      } else if (meta.status !== 404) throw new Error(fehlerText(meta.status))

      const lokal = $state.snapshot(app.erledigt) as ErledigtStand
      const neu = erledigtMischen(lokal, fern)
      if (!gleich(neu, lokal)) app.erledigt = neu
      if (sha && gleich(neu, erledigtKuerzen(fern))) return true // nichts Neues

      const paket = await verschluesseln(JSON.stringify({ erledigt: neu }), abgleich.einst.passwort, Date.now())
      const r = await fetch(apiUrl(statusDatei()), {
        method: 'PUT',
        headers: kopf({ Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          message: 'Erledigt-Stand',
          content: zuB64(enc.encode(JSON.stringify(paket))),
          branch: abgleich.einst.zweig,
          ...(sha ? { sha } : {}),
        }),
      })
      if (r.ok) {
        statusEtag = ''
        return true
      }
      if (r.status === 409 || r.status === 422) continue
      throw new Error(fehlerText(r.status))
    }
    return false
  } catch (e) {
    console.warn('Status hochladen', e)
    return false
  } finally {
    statusLaeuft = false
  }
}

let statusTimer: ReturnType<typeof setTimeout> | null = null

/** Wird aufgerufen, wenn auf diesem Gerät etwas abgehakt wurde */
export function erledigtGeaendert() {
  if (!istEingerichtet() || !abgleich.einst.token) return
  if (statusTimer) clearTimeout(statusTimer)
  statusTimer = setTimeout(() => void statusHochladen(), 3000)
}

function ok(meldung = '') {
  abgleich.zustand = 'ok'
  abgleich.meldung = meldung
  abgleich.zuletzt = Date.now()
}
function fehler(e: unknown) {
  abgleich.zustand = 'fehler'
  abgleich.meldung =
    e instanceof TypeError ? 'Keine Verbindung zu GitHub. Ist das Gerät online?' : e instanceof Error ? e.message : String(e)
  console.warn('Abgleich', e)
}

let hochladenTimer: ReturnType<typeof setTimeout> | null = null

/** Wird bei jeder Planänderung aufgerufen */
export function lokalGeaendert() {
  if (anwenden) return
  abgleich.stand.lokal = Date.now()
  standSpeichern()
  if (abgleich.einst.rolle !== 'planer' || !istEingerichtet()) return
  if (hochladenTimer) clearTimeout(hochladenTimer)
  hochladenTimer = setTimeout(() => void hochladen(), 2500)
}

/** Regelmäßig nachsehen (Plan: Fernseher alle 2 Minuten, Planer alle 10 Minuten) */
export function abgleichStarten(): () => void {
  let aus = false
  const takt = () => {
    if (aus) return
    if (abgleich.einst.rolle === 'planer' && abgleich.stand.lokal > abgleich.stand.synchron) void hochladen()
    else void holen()
    void statusHolen()
  }
  takt()
  // Planer schauen öfter nach (zweites Handy), solange die App sichtbar ist
  const id = setInterval(() => {
    if (abgleich.einst.rolle === 'anzeige' || document.visibilityState === 'visible') takt()
  }, abgleich.einst.rolle === 'anzeige' ? 120_000 : 60_000)
  // Erledigt-Stand öfter nachsehen, solange die App sichtbar ist (Handy sieht, was abgehakt wurde)
  const statusId = setInterval(() => {
    if (!aus && document.visibilityState === 'visible') void statusHolen()
  }, abgleich.einst.token ? 45_000 : 120_000)
  const sichtbar = () => {
    if (document.visibilityState === 'visible') takt()
  }
  document.addEventListener('visibilitychange', sichtbar)
  return () => {
    aus = true
    clearInterval(id)
    clearInterval(statusId)
    document.removeEventListener('visibilitychange', sichtbar)
  }
}

