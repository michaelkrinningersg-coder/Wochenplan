<script lang="ts">
  // Gemalte Figuren mit festem Stand in der Jahreszeiten-Szene: winkende Kinder, Hund (Schwanz und Kopf wackeln),
  // Katze (zwinkert), Vogel im Baum (Schnabel auf und zu). Jede Figur besteht aus 2 Bildern (Einzelbilder),
  // die abwechselnd gezeigt werden. Dateien: src/assets/figuren/<name>-1.webp, <name>-2.webp
  // (optional je Jahreszeit: <name>-winter-1.webp usw.). Fehlt eine Figur, wird sie einfach weggelassen.
  import { onDestroy } from 'svelte'
  import type { Jahreszeit, Orte } from '../lib/jahreszeit'

  let { jz, orte, nacht = false, regen = false }: { jz: Jahreszeit; orte: Orte; nacht?: boolean; regen?: boolean } = $props()

  const dateien = import.meta.glob('../assets/figuren/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
  const BILDER = new Map<string, string>()
  for (const [pfad, url] of Object.entries(dateien)) BILDER.set(pfad.split('/').pop()!.replace(/\.webp$/, ''), url)

  /** Einzelbilder einer Figur (Jahreszeit-Variante bevorzugt) */
  function frames(name: string, zeit: Jahreszeit): string[] {
    for (const prefix of [`${name}-${zeit}-`, `${name}-`]) {
      const liste: string[] = []
      for (let i = 1; i <= 4; i++) {
        const u = BILDER.get(prefix + i)
        if (u) liste.push(u)
        else break
      }
      if (liste.length >= 2) return liste
    }
    return []
  }

  type Ablauf = 'wechsel' | 'zwinkern' | 'schnabel'
  interface Figur {
    name: string
    ablauf: Ablauf
    /** Takt in Millisekunden */
    ms: number
    /** Höhe in % der Bildschirmhöhe */
    hoehe: number
    x: number
    y: number
    /** nur bei Trockenheit (Katze verschwindet im Regen) */
    nurTrocken?: boolean
    /** versetzter Start, damit nicht alles gleichzeitig wackelt */
    versatz: number
  }

  const figuren = $derived.by((): Figur[] => {
    const boden = orte.boden[1]
    const liste: Figur[] = [
      { name: 'katze', ablauf: 'zwinkern', ms: 3200, hoehe: 12, x: orte.stamm.x - 8, y: boden, versatz: 400 },
      { name: 'hund', ablauf: 'wechsel', ms: 650, hoehe: 15, x: orte.stamm.x + 8, y: boden + 1, versatz: 0 },
      { name: 'maedchen', ablauf: 'wechsel', ms: 520, hoehe: 19, x: orte.dach[0].x - 6, y: boden + 1, versatz: 150 },
      { name: 'junge', ablauf: 'wechsel', ms: 560, hoehe: 19, x: orte.dach[0].x - 14, y: boden + 1, versatz: 300 },
      { name: 'vogel', ablauf: 'schnabel', ms: 3600, hoehe: 7, x: orte.krone.x + 3, y: orte.krone.y - 5, versatz: 900 },
    ]
    return liste.filter((f) => frames(f.name, jz).length >= 2)
  })

  // Aktuelles Einzelbild je Figur
  let bild = $state<Record<string, number>>({})
  const zeiger: ReturnType<typeof setTimeout>[] = []
  let aktiv = true

  function planen(f: Figur) {
    const n = frames(f.name, jz).length
    const setze = (i: number) => (bild[f.name] = i)
    const warte = (ms: number, fn: () => void) => {
      if (!aktiv) return
      zeiger.push(setTimeout(fn, ms))
    }
    if (f.ablauf === 'wechsel') {
      let i = 0
      const tick = () => {
        i = (i + 1) % n
        setze(i)
        warte(f.ms, tick)
      }
      warte(f.versatz + f.ms, tick)
    } else if (f.ablauf === 'zwinkern') {
      // meist Augen offen (Bild 1), ab und zu kurz zu (Bild 2), manchmal zweimal
      const tick = () => {
        setze(1)
        warte(150, () => {
          setze(0)
          if (Math.random() < 0.3) warte(180, () => (setze(1), warte(140, () => (setze(0), warte(f.ms * (0.7 + Math.random()), tick)))))
          else warte(f.ms * (0.7 + Math.random()), tick)
        })
      }
      warte(f.versatz + f.ms, tick)
    } else {
      // Schnabel: drei- bis viermal auf und zu, dann Pause
      const zwitschern = (rest: number) => {
        setze(1)
        warte(190, () => {
          setze(0)
          if (rest > 1) warte(170, () => zwitschern(rest - 1))
          else warte(f.ms * (0.6 + Math.random() * 0.8), () => zwitschern(3 + Math.floor(Math.random() * 2)))
        })
      }
      warte(f.versatz, () => zwitschern(3))
    }
  }

  let gestartet = ''
  $effect(() => {
    const schluessel = figuren.map((f) => f.name).join() + jz
    if (schluessel === gestartet) return
    gestartet = schluessel
    zeiger.splice(0).forEach(clearTimeout)
    bild = {}
    aktiv = true
    for (const f of figuren) planen(f)
  })
  onDestroy(() => {
    aktiv = false
    zeiger.forEach(clearTimeout)
  })

  // Antippen: kleiner Hüpfer
  function tippen(ev: PointerEvent) {
    const el = ev.currentTarget as HTMLElement
    ev.stopPropagation()
    el.classList.remove('hops')
    void el.offsetWidth
    el.classList.add('hops')
  }
</script>

<div class="figuren" class:nacht>
  {#each figuren as f (f.name)}
    {#if !(f.nurTrocken && regen)}
      <div
        class="figur {f.name}"
        data-spiel="hops"
        style="left: {f.x}%; top: {f.y}%; height: {f.hoehe}%"
        onpointerdown={tippen}
        role="presentation"
      >
        <span class="schatten"></span>
        {#each frames(f.name, jz) as url, i (i)}
          <img src={url} alt="" draggable="false" class:an={(bild[f.name] ?? 0) === i} class:erst={i === 0} />
        {/each}
      </div>
    {/if}
  {/each}
</div>

<style>
  .figuren {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .figuren.nacht {
    filter: brightness(0.6) saturate(0.85);
  }
  .figur {
    position: absolute;
    translate: -50% -100%;
    pointer-events: auto;
    cursor: pointer;
    transform-origin: 50% 100%;
  }
  .figur img {
    height: 100%;
    width: auto;
    display: block;
    position: absolute;
    left: 50%;
    bottom: 0;
    translate: -50% 0;
    opacity: 0;
    user-select: none;
  }
  .figur img.erst {
    position: relative;
    left: auto;
    translate: none;
  }
  .figur img.an {
    opacity: 1;
  }
  /* Bild 1 bleibt als Platzhalter für die Größe; ist ein anderes Bild an, wird Bild 1 ausgeblendet */
  .figur:has(img.an:not(.erst)) img.erst {
    opacity: 0;
  }
  .schatten {
    position: absolute;
    left: 50%;
    bottom: -3%;
    width: 80%;
    height: 9%;
    translate: -50% 0;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(0, 0, 0, 0.28), transparent 70%);
  }
  .figur.vogel .schatten {
    display: none;
  }
  .figur.hops {
    animation: hupf 0.6s ease-out;
  }
  @keyframes hupf {
    0%,
    100% {
      transform: translateY(0) scale(1, 1);
    }
    25% {
      transform: translateY(-14%) scale(0.96, 1.05);
    }
    55% {
      transform: translateY(0) scale(1.06, 0.94);
    }
    75% {
      transform: translateY(-4%) scale(1, 1);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .figur.hops {
      animation: none;
    }
  }
</style>
