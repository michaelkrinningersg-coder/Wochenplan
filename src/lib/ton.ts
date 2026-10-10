// Kleine Töne mit WebAudio – keine Audiodateien nötig.

let ctx: AudioContext | null = null

function kontext(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Beim ersten Tastendruck/Tippen aufrufen, damit der Ton später erlaubt ist */
export function tonFreischalten() {
  kontext()
}

function note(c: AudioContext, frequenz: number, start: number, dauer: number, lautstaerke = 0.18) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequenz
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(lautstaerke, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dauer)
  osc.connect(gain).connect(c.destination)
  osc.start(start)
  osc.stop(start + dauer + 0.05)
}

function glocke(c: AudioContext, frequenz: number, start: number, dauer: number, lautstaerke = 0.12) {
  // Grundton plus leiser Oberton klingt wie ein kleines Glockenspiel
  note(c, frequenz, start, dauer, lautstaerke)
  note(c, frequenz * 2, start, dauer * 0.6, lautstaerke * 0.35)
}

export function spieleTon(art: 'gelb' | 'rot' | 'ende' | 'fertig' | 'alles' | 'piep' | 'piepLetzte') {
  const c = kontext()
  if (!c) return
  const t = c.currentTime + 0.02
  if (art === 'piep') {
    note(c, 880, t, 0.14, 0.16)
  } else if (art === 'piepLetzte') {
    note(c, 1175, t, 0.3, 0.2)
  } else if (art === 'gelb') {
    note(c, 587, t, 0.5, 0.14)
  } else if (art === 'rot') {
    note(c, 659, t, 0.35, 0.15)
    note(c, 659, t + 0.4, 0.5, 0.15)
  } else if (art === 'ende') {
    // drei Glockentöne, zweimal
    for (const w of [0, 1.3]) {
      note(c, 784, t + w, 0.7)
      note(c, 659, t + w + 0.25, 0.7)
      note(c, 523, t + w + 0.5, 1.0)
    }
  } else if (art === 'fertig') {
    // Belohnung: aufsteigende Melodie, Schlussakkord und Glitzer
    const melodie = [523, 659, 784, 1047]
    melodie.forEach((f, i) => glocke(c, f, t + i * 0.11, 0.35, 0.14))
    for (const f of [523, 659, 784, 1047]) note(c, f, t + 0.5, 1.2, 0.07)
    for (let i = 0; i < 6; i++) note(c, 1568 + i * 220, t + 0.55 + i * 0.07, 0.25, 0.04)
  } else {
    // Alles geschafft: kleine Fanfare
    const folge: [number, number, number][] = [
      [523, 0, 0.18], [523, 0.2, 0.18], [523, 0.4, 0.18], [659, 0.6, 0.45],
      [587, 1.1, 0.18], [659, 1.3, 0.18], [784, 1.5, 0.9],
    ]
    for (const [f, w, d] of folge) glocke(c, f, t + w, d + 0.2, 0.15)
    for (const f of [523, 659, 784, 1047]) note(c, f, t + 1.5, 1.6, 0.06)
    for (let i = 0; i < 10; i++) note(c, 1568 + (i % 5) * 262, t + 1.6 + i * 0.08, 0.25, 0.035)
  }
}
