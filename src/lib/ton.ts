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

export function spieleTon(art: 'gelb' | 'ende' | 'fertig') {
  const c = kontext()
  if (!c) return
  const t = c.currentTime + 0.02
  if (art === 'gelb') {
    note(c, 587, t, 0.5, 0.14)
  } else if (art === 'ende') {
    // drei Glockentöne, zweimal
    for (const w of [0, 1.3]) {
      note(c, 784, t + w, 0.7)
      note(c, 659, t + w + 0.25, 0.7)
      note(c, 523, t + w + 0.5, 1.0)
    }
  } else {
    note(c, 523, t, 0.3, 0.16)
    note(c, 659, t + 0.12, 0.3, 0.16)
    note(c, 784, t + 0.24, 0.3, 0.16)
    note(c, 1047, t + 0.36, 0.6, 0.16)
  }
}
