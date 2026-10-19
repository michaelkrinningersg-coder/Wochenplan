<script lang="ts" module>
  // Stacheln des Igels (einmal berechnet): Dreiecke entlang des Rückenbogens, zwei Lagen
  const STACHELN = (() => {
    const liste: { d: string; hell: boolean }[] = []
    for (const [lage, r0, n] of [
      [0, 40, 20],
      [1, 33, 16],
    ] as const) {
      for (let i = 0; i < n; i++) {
        const w = Math.PI * (1.08 + (0.86 * (i + lage * 0.5)) / n)
        const cx = 66
        const cy = 60
        const bx = cx + Math.cos(w) * r0
        const by = cy + Math.sin(w) * r0 * 1.02
        const tx = cx + Math.cos(w) * (r0 + 10)
        const ty = cy + Math.sin(w) * (r0 + 10) * 1.02
        const nx = -Math.sin(w) * 4.2
        const ny = Math.cos(w) * 4.2
        liste.push({ d: `M${bx + nx} ${by + ny} L${tx} ${ty} L${bx - nx} ${by - ny} Z`, hell: lage === 1 })
      }
    }
    return liste
  })()
  /** Höhe der Figur im Verhältnis zur Schriftgröße (Emoji-Größe = 1em) */
  export const HOEHE: Record<string, number> = {
    igel: 1.15,
    eichhoernchen: 1.5,
    nuss: 0.55,
    fliegenpilz: 1,
    steinpilz: 1,
    apfel: 0.8,
    birne: 0.85,
    karotte: 0.85,
    traube: 0.8,
    kuerbis: 1,
    kastanienmann: 1.5,
    traktor: 1.45,
    gans: 1,
    regenschirm: 1.3,
    korb: 1.2,
    vogel: 0.85,
    eule: 1.5,
    schnecke: 0.8,
    specht: 1.35,
    laterne: 1.1,
    spinne: 0.6,
    blatt: 1,
    kastanie: 0.9,
    drachen: 1.6,
  }
</script>

<script lang="ts">
  // Gemalte Figuren im Stil der bewegten Herbst-Szene: flache Formen mit Schatten- und Lichtfläche, ohne Umrisslinien.
  // Alle Tiere schauen nach links (wie die Emojis) – Laufwege spiegeln sie bei Bedarf.
  let { name, gesicht = false, groesse, fuellen = false }: { name: string; gesicht?: boolean; groesse?: number; fuellen?: boolean } = $props()
  const SCHATTEN = '#3a2414'
</script>

<svg
  class="gemalt {name}"
  class:figur={fuellen}
  style={fuellen ? 'width: 100%; height: 100%' : `height: ${groesse ?? HOEHE[name] ?? 1}em`}
  viewBox={{
    igel: '0 0 112 78',
    eichhoernchen: '0 0 100 100',
    nuss: '0 0 30 34',
    fliegenpilz: '0 0 60 64',
    steinpilz: '0 0 60 64',
    apfel: '0 0 40 42',
    birne: '0 0 36 46',
    karotte: '0 0 30 50',
    traube: '0 0 36 44',
    kuerbis: '0 0 84 66',
    kastanienmann: '0 0 44 62',
    traktor: '0 0 186 94',
    gans: '0 0 124 70',
    regenschirm: '0 0 84 84',
    korb: '0 0 76 56',
    vogel: '0 0 72 50',
    eule: '0 0 70 86',
    schnecke: '0 0 76 48',
    specht: '0 0 52 74',
    laterne: '0 0 52 64',
    spinne: '0 0 34 34',
    blatt: '0 0 56 56',
    kastanie: '0 0 52 44',
    drachen: '0 0 64 104',
  }[name] ?? '0 0 40 40'}
  aria-hidden="true"
>
  {#if name === 'igel'}
    <ellipse cx="58" cy="73" rx="44" ry="4.5" fill={SCHATTEN} opacity=".18" />
    <ellipse class="bein a" cx="42" cy="68" rx="6" ry="4.5" fill="#4a3022" />
    <ellipse class="bein b" cx="82" cy="68" rx="6" ry="4.5" fill="#4a3022" />
    <path d="M28 64 C26 30 52 14 78 18 C100 22 110 44 104 66 Z" fill="#5e4130" />
    {#each STACHELN as s, i (i)}<path d={s.d} fill={s.hell ? '#8a6448' : '#4f3526'} />{/each}
    <path d="M66 24 C88 26 102 42 102 62 L90 64 C92 46 82 32 66 24 Z" fill="#4a3022" opacity=".55" />
    <path d="M46 34 q8 -10 18 -12 M54 40 q8 -10 18 -12 M62 46 q8 -10 18 -12" stroke="#a37c5a" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7" />
    <path d="M38 42 C26 44 12 52 6 60 C12 68 28 68 42 66 Z" fill="#e8c9a0" />
    <path d="M42 56 C30 60 18 62 8 62 C14 68 28 68 42 66 Z" fill="#d1a97c" />
    <circle cx="38" cy="44" r="4.5" fill="#c9a07a" />
    <circle cx="7" cy="60" r="3.6" fill="#2a1a12" /><circle cx="6" cy="58.8" r="1" fill="#fff" opacity=".8" />
    <circle cx="24" cy="51" r="2.8" fill="#2a1a12" /><circle cx="23.2" cy="50.2" r="1" fill="#fff" />
    <ellipse cx="20" cy="58" rx="3.4" ry="2.2" fill="#f2a08a" opacity=".6" />
    <g transform="translate(72 15)">
      <circle r="9" fill="#d93a2b" /><path d="M2 -2 a9 9 0 0 1 -6 10.6 a9 9 0 0 0 9 -8 z" fill="#a8261c" /><ellipse cx="-3" cy="-3" rx="2.4" ry="3.4" fill="#fff" opacity=".35" />
      <path d="M0 -8 l1 -5" stroke="#5a3a1a" stroke-width="2" stroke-linecap="round" /><path d="M1 -11 q6 -4 9 0 q-5 3 -9 0" fill="#5aa83a" />
    </g>
  {:else if name === 'eichhoernchen'}
    <ellipse cx="50" cy="96" rx="32" ry="3.8" fill={SCHATTEN} opacity=".18" />
    <path class="schwanz" d="M60 92 C98 90 102 52 88 34 C80 22 90 8 78 4 C64 0 56 14 66 26 C76 40 74 62 56 80 Z" fill="#c45a24" />
    <path d="M70 84 C92 76 94 50 84 36 C78 26 86 14 80 8" stroke="#e48848" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8" />
    <path d="M66 26 C60 16 66 4 78 4 C70 8 68 16 72 24 Z" fill="#a8461a" />
    <ellipse cx="46" cy="70" rx="20" ry="24" fill="#d06a2c" />
    <path d="M60 56 C68 70 64 88 50 94 C60 82 62 70 60 56 Z" fill="#a8461a" opacity=".6" />
    <ellipse cx="38" cy="74" rx="11" ry="16" fill="#f5dcb8" />
    <ellipse cx="57" cy="88" rx="15" ry="8" fill="#b85a24" />
    <ellipse cx="40" cy="93" rx="8" ry="3.4" fill="#a8461a" />
    <circle cx="34" cy="42" r="15" fill="#d06a2c" />
    <ellipse cx="22" cy="48" rx="10" ry="7.5" fill="#df7a3a" />
    <ellipse cx="27" cy="51" rx="7" ry="5" fill="#f5dcb8" />
    <path d="M37 32 L41 15 L48 30 Z" fill="#b85a24" /><path d="M41 15 l-2 -5 M41 15 l1 -6 M41 15 l4 -4" stroke="#8a3c16" stroke-width="2" stroke-linecap="round" />
    <path d="M39 30 L41 21 L45 29 Z" fill="#f2b48a" />
    <circle cx="28" cy="40" r="3.2" fill="#2a1a12" /><circle cx="27" cy="39" r="1.1" fill="#fff" />
    <circle cx="13.5" cy="47" r="2.4" fill="#3a2418" />
    <ellipse cx="28" cy="62" rx="5" ry="3.6" fill="#b85a24" /><ellipse cx="34" cy="63" rx="5" ry="3.6" fill="#c4622a" />
    <path d="M42 32 q-8 -6 -14 -2" stroke="#ef9a5a" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7" />
  {:else if name === 'nuss'}
    <ellipse cx="15" cy="22" rx="10" ry="11" fill="#c08a3e" />
    <path d="M22 14 C27 22 24 31 15 33 C22 28 23 20 22 14 Z" fill="#9a6a2a" />
    <ellipse cx="11" cy="20" rx="2.6" ry="5" fill="#fff" opacity=".3" />
    <path d="M3 14 C3 5 27 5 27 14 C27 17 3 17 3 14 Z" fill="#7a4e2d" />
    <path d="M7 9 l3 3 M12 7 l2 4 M18 7 l-1 4 M23 9 l-3 3" stroke="#5a3820" stroke-width="1.4" stroke-linecap="round" />
    <path d="M15 6 l1 -5" stroke="#5a3820" stroke-width="2.2" stroke-linecap="round" />
  {:else if name === 'fliegenpilz'}
    <ellipse cx="30" cy="61" rx="18" ry="3" fill={SCHATTEN} opacity=".2" />
    <path d="M22 28 C20 42 19 52 17 60 L43 60 C41 52 40 42 38 28 Z" fill="#f6ecd8" />
    <path d="M34 28 C36 42 37 52 41 60 L43 60 C41 52 40 42 38 28 Z" fill="#d8c7a6" />
    <path d="M19 36 C24 42 36 42 41 36 L40 40 C34 46 26 46 20 40 Z" fill="#fffaf0" />
    <path d="M2 30 C2 8 58 8 58 30 C58 34 2 34 2 30 Z" fill="#e23a28" />
    <path d="M40 10 C54 16 58 26 58 30 C58 33 44 34 34 33 C46 28 48 18 40 10 Z" fill="#b72818" />
    <path d="M10 22 C12 14 20 10 26 10 C18 14 14 18 12 24 Z" fill="#ff7a5e" opacity=".8" />
    <circle cx="16" cy="20" r="3.4" fill="#fff" /><circle cx="30" cy="14" r="2.8" fill="#fff" /><circle cx="44" cy="21" r="3" fill="#fff" /><circle cx="25" cy="26" r="2" fill="#fff" /><circle cx="51" cy="28" r="1.8" fill="#fff" /><circle cx="8" cy="28" r="1.8" fill="#fff" />
    <path d="M8 60 l3 -7 l2 7 M46 60 l3 -8 l3 8" fill="#7d8a34" />
  {:else if name === 'steinpilz'}
    <ellipse cx="30" cy="61" rx="18" ry="3" fill={SCHATTEN} opacity=".2" />
    <path d="M18 30 C12 44 14 56 20 60 L42 60 C48 56 48 44 42 30 Z" fill="#efe2c4" />
    <path d="M36 30 C44 42 46 54 40 60 L42 60 C48 56 48 44 42 30 Z" fill="#cdb98e" />
    <path d="M22 40 q2 6 0 12 M30 38 q2 8 0 14" stroke="#d8c8a2" stroke-width="1.4" fill="none" />
    <path d="M4 32 C2 12 58 8 56 32 C50 36 10 36 4 32 Z" fill="#8a5428" />
    <path d="M38 12 C52 18 56 26 56 32 C50 35 40 35 34 34 C46 28 46 18 38 12 Z" fill="#6a3c1a" />
    <path d="M12 22 C16 14 24 12 30 12 C22 16 18 20 15 26 Z" fill="#b07a46" opacity=".9" />
    <path d="M8 60 l3 -7 l2 7 M46 60 l3 -8 l3 8" fill="#7d8a34" />
  {:else if name === 'apfel'}
    <path d="M20 10 C8 4 2 16 6 27 C9 35 16 40 20 37 C24 40 31 35 34 27 C38 16 32 4 20 10 Z" fill="#d93a2b" />
    <path d="M30 8 C38 16 36 30 28 36 C25 38 22 38 20 37 C28 32 33 22 30 8 Z" fill="#a8261c" />
    <path d="M10 12 C6 18 6 24 8 28 C9 22 11 16 16 12 Z" fill="#f2b33d" opacity=".55" />
    <ellipse cx="13" cy="19" rx="3" ry="5" fill="#fff" opacity=".35" />
    <path d="M20 11 L21 3" stroke="#5a3a1a" stroke-width="2.5" stroke-linecap="round" />
    <path d="M21 6 q7 -5 11 0 q-6 4 -11 0" fill="#5aa83a" /><path d="M22 6 q4 -1 9 0" stroke="#3e7d26" stroke-width=".8" fill="none" />
  {:else if name === 'birne'}
    <path d="M18 8 C12 8 12 18 10 24 C4 30 4 42 18 44 C32 42 32 30 26 24 C24 18 24 8 18 8 Z" fill="#c9cf4a" />
    <path d="M24 14 C26 24 34 30 28 40 C25 43 21 44 18 44 C28 38 28 26 24 14 Z" fill="#9aa632" />
    <ellipse cx="13" cy="30" rx="2.6" ry="5" fill="#fff" opacity=".35" />
    <ellipse cx="20" cy="34" rx="5" ry="4" fill="#e8823a" opacity=".35" />
    <path d="M18 9 l2 -6" stroke="#5a3a1a" stroke-width="2.2" stroke-linecap="round" />
  {:else if name === 'karotte'}
    <path d="M8 14 C8 10 22 10 22 14 L16 48 C15 50 14 50 14 48 Z" fill="#f08a24" />
    <path d="M18 12 C22 12 22 14 22 14 L16 48 C16 40 18 26 18 12 Z" fill="#c8661a" />
    <path d="M10 22 l5 1 M11 30 l4 1 M12 38 l3 0" stroke="#c8661a" stroke-width="1.4" stroke-linecap="round" />
    <path d="M15 12 C12 4 8 2 6 2 C10 6 12 9 13 12 Z M15 12 C15 4 18 0 20 0 C18 4 17 8 16 12 Z M15 12 C20 6 24 6 26 6 C22 8 19 10 17 12 Z" fill="#4caf50" />
  {:else if name === 'traube'}
    {#each [[10, 14], [20, 13], [28, 16], [14, 22], [24, 22], [18, 30], [10, 28], [26, 29], [18, 38]] as [x, y], i (i)}
      <circle cx={x} cy={y} r="5.6" fill="#6d3f8a" /><circle cx={x + 1.6} cy={y + 1.6} r="3.8" fill="#55306e" /><circle cx={x - 1.8} cy={y - 1.8} r="1.4" fill="#fff" opacity=".45" />
    {/each}
    <path d="M18 9 l2 -7" stroke="#5a3a1a" stroke-width="2" stroke-linecap="round" /><path d="M20 5 q8 -5 12 0 q-6 4 -12 0" fill="#6aa83a" />
  {:else if name === 'kuerbis'}
    <ellipse cx="42" cy="63" rx="34" ry="3" fill={SCHATTEN} opacity=".2" />
    <ellipse cx="18" cy="38" rx="14" ry="23" fill="#d9661a" />
    <ellipse cx="66" cy="38" rx="14" ry="23" fill="#c4561a" />
    <ellipse cx="30" cy="37" rx="15" ry="25" fill="#ea7a22" />
    <ellipse cx="54" cy="37" rx="15" ry="25" fill="#de6c1e" />
    <ellipse cx="42" cy="37" rx="14" ry="26" fill="#f58f2e" />
    <ellipse cx="36" cy="26" rx="4" ry="9" fill="#ffc067" opacity=".5" />
    <path d="M40 12 C40 6 42 2 48 0 C48 4 46 8 46 12 Z" fill="#5a6a2a" />
    <path d="M46 6 q10 -6 16 0 q-8 6 -16 0" fill="#7a9a34" />
    {#if gesicht}
      <g class="glut">
        <path d="M24 30 L32 24 L34 34 Z M60 30 L52 24 L50 34 Z" fill="#ffd35a" />
        <path d="M22 44 L28 50 L34 45 L42 52 L50 45 L56 50 L62 44 L56 56 L42 58 L28 56 Z" fill="#ffd35a" />
      </g>
    {/if}
  {:else if name === 'kastanienmann'}
    <path class="arm" d="M9 31 L1 40 M35 31 L43 22" stroke="#e2c79a" stroke-width="2.6" stroke-linecap="round" />
    <circle cx="1" cy="40" r="2.2" fill="#d93a2b" /><circle cx="43" cy="22" r="2.2" fill="#d93a2b" />
    <path d="M16 44 L12 60 M28 44 L32 60" stroke="#e2c79a" stroke-width="2.6" stroke-linecap="round" />
    <circle cx="12" cy="60" r="2.2" fill="#d93a2b" /><circle cx="32" cy="60" r="2.2" fill="#d93a2b" />
    <ellipse cx="22" cy="34" rx="14" ry="13" fill="#7a3f1d" />
    <path d="M30 24 C38 32 36 44 26 47 C32 40 33 32 30 24 Z" fill="#5c2c12" />
    <ellipse cx="22" cy="44" rx="8" ry="3.6" fill="#d9b98a" />
    <ellipse cx="17" cy="29" rx="4" ry="3" fill="#fff" opacity=".28" />
    <circle cx="22" cy="13" r="10" fill="#8a4a24" />
    <path d="M28 6 C33 12 32 20 25 23 C29 17 30 11 28 6 Z" fill="#6a3418" />
    <ellipse cx="18" cy="9" rx="3" ry="2" fill="#fff" opacity=".28" />
    <circle cx="19" cy="12" r="1.5" fill="#fff" /><circle cx="25" cy="12" r="1.5" fill="#fff" />
    <path d="M18 16 q4 3 8 0" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" />
    <path d="M22 3 l-1 -3" stroke="#5a3a1a" stroke-width="1.6" stroke-linecap="round" />
  {:else if name === 'traktor'}
    <ellipse cx="96" cy="90" rx="90" ry="4" fill={SCHATTEN} opacity=".18" />
    <!-- Anhänger mit Äpfeln -->
    <path d="M110 62 L124 62" stroke="#4a3022" stroke-width="3" />
    <path d="M124 44 L182 44 L178 70 L128 70 Z" fill="#b8783a" />
    <path d="M126 52 L180 52 M127 61 L179 61" stroke="#93582a" stroke-width="2" />
    {#each [[134, 40], [146, 37], [158, 38], [170, 40], [140, 32], [152, 30], [164, 32], [158, 24]] as [x, y], i (i)}
      <circle cx={x} cy={y} r="6.5" fill={i % 3 === 2 ? '#f2b33d' : '#d93a2b'} /><circle cx={x - 2} cy={y - 2} r="1.8" fill="#fff" opacity=".4" />
    {/each}
    <g transform="translate(154 76)"><g class="rad"><circle r="11" fill="#2e2a2a" /><circle r="5" fill="#d9a23a" /><path d="M0 -9 V9 M-9 0 H9" stroke="#3e3838" stroke-width="2" /></g></g>
    <!-- Traktor -->
    <path d="M14 46 C14 40 18 38 24 38 L74 38 L74 66 L14 66 Z" fill="#d6402c" />
    <path d="M14 58 L74 58 L74 66 L14 66 Z" fill="#a82e1e" />
    <rect x="16" y="44" width="10" height="12" rx="2" fill="#3a3030" opacity=".5" />
    <path d="M70 12 L110 12 L112 66 L70 66 Z" fill="#c63a26" />
    <path d="M76 18 L104 18 L105 40 L76 40 Z" fill="#bfe3ff" />
    <path d="M78 20 L88 20 L80 36 Z" fill="#fff" opacity=".5" />
    <path d="M66 10 L114 10 L114 15 L66 15 Z" fill="#8f2618" />
    <rect x="48" y="20" width="5" height="19" fill="#4a4040" />
    <circle class="puff" cx="50" cy="14" r="5" fill="#e8e2dc" />
    <circle class="puff b" cx="50" cy="14" r="5" fill="#e8e2dc" />
    <g transform="translate(96 68)">
      <g class="rad"><circle r="22" fill="#2e2a2a" />{#each Array.from({ length: 10 }) as _, i (i)}<rect x="-3" y="-24" width="6" height="5" rx="1" fill="#2e2a2a" transform="rotate({i * 36})" />{/each}<circle r="10" fill="#f2b33d" /><path d="M0 -10 V10 M-10 0 H10" stroke="#c98a1e" stroke-width="2.5" /></g>
    </g>
    <g transform="translate(32 74)">
      <g class="rad"><circle r="13" fill="#2e2a2a" /><circle r="6" fill="#f2b33d" /><path d="M0 -6 V6 M-6 0 H6" stroke="#c98a1e" stroke-width="2" /></g>
    </g>
  {:else if name === 'gans'}
    <path d="M86 40 L104 36 L100 44 Z" fill="#6e6458" />
    <ellipse cx="66" cy="42" rx="30" ry="12" fill="#8a7f72" />
    <path d="M46 46 C56 54 80 54 94 46 C82 52 58 54 46 46 Z" fill="#e8e2d8" />
    <path d="M40 38 C30 34 22 28 18 24" stroke="#8a7f72" stroke-width="8" fill="none" stroke-linecap="round" />
    <circle cx="16" cy="22" r="7" fill="#958a7c" />
    <path d="M10 22 L1 25 L10 27 Z" fill="#f08a3a" />
    <circle cx="15" cy="20" r="1.6" fill="#1a1a1a" />
    <path class="fluegel" d="M52 38 C60 12 80 2 100 6 C88 14 80 26 76 40 Z" fill="#7a6f62" />
    <path class="fluegel" d="M60 36 C66 20 78 12 92 10 C82 18 76 28 74 38 Z" fill="#9a8f80" />
    <path d="M58 54 l-2 8 M68 54 l-1 8" stroke="#f08a6a" stroke-width="2" stroke-linecap="round" />
  {:else if name === 'regenschirm'}
    <path d="M42 40 L42 74 C42 82 32 82 32 76" stroke="#5a3a1a" stroke-width="3.4" fill="none" stroke-linecap="round" />
    <path d="M4 40 C6 18 22 6 42 6 C62 6 78 18 80 40 C74 36 68 36 62 40 C56 36 48 36 42 40 C36 36 28 36 22 40 C16 36 10 36 4 40 Z" fill="#e8452b" />
    <path d="M42 6 C34 12 28 26 22 40 C28 36 36 36 42 40 Z M42 6 C50 12 56 26 62 40 C56 36 48 36 42 40 Z" fill="#f2b33d" />
    <path d="M42 6 C62 6 78 18 80 40 C74 36 68 36 62 40 C58 28 52 14 42 6 Z" fill="#b8301c" opacity=".55" />
    <path d="M14 26 C18 16 26 11 34 9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".45" />
    <path d="M42 6 V1" stroke="#5a3a1a" stroke-width="3" stroke-linecap="round" />
  {:else if name === 'korb'}
    <ellipse cx="38" cy="53" rx="30" ry="3" fill={SCHATTEN} opacity=".2" />
    <path d="M14 24 C14 2 62 2 62 24" stroke="#9a6430" stroke-width="5" fill="none" />
    <path d="M6 24 L70 24 L62 52 L14 52 Z" fill="#c08446" />
    <path d="M8 30 H68 M10 37 H66 M12 44 H64" stroke="#93602e" stroke-width="2.2" />
    <path d="M20 24 L22 52 M32 24 L33 52 M44 24 L43 52 M56 24 L54 52" stroke="#a8703a" stroke-width="2" />
    <path d="M54 24 L70 24 L62 52 L52 52 Z" fill="#7a4a20" opacity=".35" />
    <path d="M4 22 H72 V27 H4 Z" fill="#a8703a" />
  {:else if name === 'vogel'}
    <path d="M50 26 L68 20 L66 30 Z" fill="#6a5440" />
    <ellipse cx="34" cy="28" rx="20" ry="13" fill="#8a6a4a" />
    <ellipse cx="26" cy="32" rx="12" ry="9" fill="#ee6a2a" />
    <ellipse cx="34" cy="38" rx="10" ry="4" fill="#efe2cc" />
    <circle cx="16" cy="22" r="10" fill="#8a6a4a" />
    <ellipse cx="14" cy="27" rx="6" ry="5" fill="#ee6a2a" />
    <path d="M7 21 L0 23 L7 25 Z" fill="#3a2a1a" />
    <circle cx="12" cy="19" r="2" fill="#1a1a1a" /><circle cx="11.4" cy="18.4" r=".7" fill="#fff" />
    <path class="fluegel" d="M30 24 C36 6 50 0 60 4 C52 10 46 18 44 28 Z" fill="#6e5238" />
  {:else if name === 'eule'}
    <path d="M14 82 H60" stroke="#6e4126" stroke-width="6" stroke-linecap="round" />
    <path d="M10 20 L16 4 L26 14 Z M60 20 L54 4 L44 14 Z" fill="#7a5638" />
    <ellipse cx="35" cy="48" rx="25" ry="32" fill="#8e6644" />
    <path d="M50 24 C62 40 60 66 44 78 C54 62 56 42 50 24 Z" fill="#6e4c30" />
    <ellipse cx="35" cy="58" rx="15" ry="18" fill="#d9bf98" />
    {#each [[30, 50], [40, 50], [28, 58], [35, 58], [42, 58], [31, 66], [39, 66]] as [x, y], i (i)}<path d="M{x - 3} {y} l3 3 l3 -3" stroke="#a88a60" stroke-width="1.4" fill="none" stroke-linecap="round" />{/each}
    <ellipse cx="35" cy="30" rx="22" ry="15" fill="#e6cfa8" />
    <circle cx="25" cy="30" r="8.5" fill="#fff8e6" /><circle cx="45" cy="30" r="8.5" fill="#fff8e6" />
    <circle cx="25" cy="30" r="5.5" fill="#f2a83a" /><circle cx="45" cy="30" r="5.5" fill="#f2a83a" />
    <circle cx="25" cy="30" r="3" fill="#1a1a1a" /><circle cx="45" cy="30" r="3" fill="#1a1a1a" />
    <circle cx="24" cy="29" r="1" fill="#fff" /><circle cx="44" cy="29" r="1" fill="#fff" />
    <g class="lid"><ellipse cx="25" cy="30" rx="9" ry="9" fill="#8e6644" /><ellipse cx="45" cy="30" rx="9" ry="9" fill="#8e6644" /></g>
    <path d="M32 36 L35 43 L38 36 Z" fill="#e8a23a" />
    <path d="M24 80 l-3 3 M28 80 v4 M42 80 v4 M46 80 l3 3" stroke="#e8a23a" stroke-width="2.4" stroke-linecap="round" />
  {:else if name === 'schnecke'}
    <ellipse cx="38" cy="46" rx="34" ry="2.6" fill={SCHATTEN} opacity=".2" />
    <path d="M4 44 C4 34 12 30 22 32 L66 38 C72 40 72 44 66 45 Z" fill="#d9c49a" />
    <path d="M22 40 L68 42 C70 44 68 45 66 45 L6 45 C10 42 16 40 22 40 Z" fill="#bfa878" />
    <path d="M12 32 L8 16 M18 31 L18 14" stroke="#cdb688" stroke-width="2.6" stroke-linecap="round" />
    <circle cx="8" cy="15" r="2.6" fill="#3a2a1a" /><circle cx="18" cy="13" r="2.6" fill="#3a2a1a" />
    <circle cx="8" cy="34" r="1.6" fill="#3a2a1a" /><path d="M5 38 q3 2 6 0" stroke="#3a2a1a" stroke-width="1.2" fill="none" />
    <circle cx="46" cy="24" r="18" fill="#c8742e" />
    <path d="M58 12 C68 24 64 40 50 42 C60 34 62 22 58 12 Z" fill="#9a5420" />
    <path d="M46 24 m0 -3 a3 3 0 1 1 -3 3 a6 6 0 1 1 6 6 a10 10 0 1 1 -10 -10 a14 14 0 0 1 14 14" stroke="#7a3e16" stroke-width="2.6" fill="none" stroke-linecap="round" />
    <ellipse cx="38" cy="14" rx="4" ry="2.6" fill="#fff" opacity=".35" />
  {:else if name === 'specht'}
    <path d="M30 68 L40 74 L38 62 Z" fill="#1e1e1e" />
    <ellipse cx="30" cy="40" rx="14" ry="24" fill="#222" />
    <ellipse cx="24" cy="42" rx="8" ry="18" fill="#f4efe6" />
    <path d="M36 30 l6 4 M36 40 l6 4 M36 50 l6 4" stroke="#f4efe6" stroke-width="3" stroke-linecap="round" />
    <ellipse cx="26" cy="60" rx="7" ry="5" fill="#d9302a" />
    <circle cx="22" cy="16" r="11" fill="#f4efe6" />
    <path d="M14 10 C16 4 28 2 32 10 C26 8 20 8 14 10 Z" fill="#222" />
    <path d="M30 10 C34 12 34 18 30 20 Z" fill="#d9302a" />
    <path d="M12 18 C18 22 26 22 30 20" stroke="#222" stroke-width="3" fill="none" />
    <path d="M12 14 L0 16 L12 18 Z" fill="#3a3a3a" />
    <circle cx="18" cy="13" r="1.8" fill="#1a1a1a" /><circle cx="17.4" cy="12.4" r=".6" fill="#fff" />
    <path d="M22 62 l-6 4 M24 64 l-4 6" stroke="#555" stroke-width="2" stroke-linecap="round" />
  {:else if name === 'laterne'}
    <circle class="glut" cx="26" cy="36" r="26" fill="#ffd36a" opacity=".35" />
    <path d="M26 0 V10" stroke="#5a3a1a" stroke-width="1.6" />
    <rect x="14" y="10" width="24" height="5" rx="1.5" fill="#7a2a18" />
    <ellipse cx="26" cy="36" rx="21" ry="21" fill="#ff9a2a" />
    <ellipse cx="26" cy="36" rx="13" ry="21" fill="#ffb84a" />
    <ellipse cx="26" cy="36" rx="5" ry="21" fill="#ffd36a" />
    <path d="M18 30 a6 6 0 1 0 6 -6 a4.6 4.6 0 1 1 -6 6 Z" fill="#fff4c2" />
    <path d="M34 40 l1.4 3 l3 .4 l-2.2 2 l.6 3 l-2.8 -1.4 l-2.8 1.4 l.6 -3 l-2.2 -2 l3 -.4 Z" fill="#fff4c2" />
    <rect x="14" y="56" width="24" height="5" rx="1.5" fill="#7a2a18" />
  {:else if name === 'spinne'}
    <path d="M17 0 V10" stroke="#fff" stroke-width=".8" opacity=".8" />
    <path d="M10 16 C4 12 2 14 0 18 M10 19 C4 18 2 20 0 24 M24 16 C30 12 32 14 34 18 M24 19 C30 18 32 20 34 24 M11 22 C6 24 4 28 4 32 M23 22 C28 24 30 28 30 32" stroke="#3a2438" stroke-width="2" fill="none" stroke-linecap="round" />
    <circle cx="17" cy="19" r="8" fill="#4a2e48" />
    <circle cx="17" cy="11" r="5" fill="#5a3a58" />
    <circle cx="15" cy="10" r="1.6" fill="#fff" /><circle cx="19" cy="10" r="1.6" fill="#fff" />
    <circle cx="15" cy="10.4" r=".7" fill="#1a1a1a" /><circle cx="19" cy="10.4" r=".7" fill="#1a1a1a" />
    <ellipse cx="14" cy="16" rx="2.4" ry="1.6" fill="#fff" opacity=".25" />
  {:else if name === 'blatt'}
    <g transform="rotate(-24 34 30)">
      <path d="M34 8 C44 14 48 26 44 38 C40 46 30 48 24 44 C20 34 22 18 34 8 Z" fill="#f0b03a" />
      <path d="M34 8 C40 20 40 32 24 44 C30 48 40 46 44 38 C48 26 44 14 34 8 Z" fill="#d9952a" />
      <path d="M33 12 C32 24 30 34 25 43" stroke="#b8781e" stroke-width="1.4" fill="none" />
    </g>
    <path d="M24 4 L28 14 L35 10 L33 19 L44 16 L38 26 L46 30 L34 33 L36 41 L27 36 L26 46 L22 46 L21 36 L12 41 L14 33 L2 30 L10 26 L4 16 L15 19 L13 10 L20 14 Z" fill="#e5682a" />
    <path d="M24 4 L28 14 L35 10 L33 19 L44 16 L38 26 L46 30 L34 33 L36 41 L27 36 L26 46 L24 46 L24 4 Z" fill="#c4482a" />
    <path d="M24 46 V18 M24 30 L12 22 M24 30 L36 22 M24 36 L14 36 M24 36 L34 36" stroke="#9a3418" stroke-width="1.3" fill="none" stroke-linecap="round" />
    <path d="M24 46 l-1 8" stroke="#7a3418" stroke-width="2" stroke-linecap="round" />
    <path d="M10 20 C14 16 18 14 22 14" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".35" />
  {:else if name === 'kastanie'}
    <ellipse cx="26" cy="41" rx="20" ry="2.6" fill={SCHATTEN} opacity=".2" />
    <path d="M4 30 C2 16 12 8 22 10 L18 40 C10 40 5 36 4 30 Z" fill="#7fb43a" />
    <path d="M48 30 C50 16 40 8 30 10 L34 40 C42 40 47 36 48 30 Z" fill="#6a9e2e" />
    {#each [[6, 18], [3, 26], [8, 36], [14, 12], [46, 18], [49, 26], [44, 36], [38, 12]] as [x, y], i (i)}<path d="M{x} {y} l{x < 26 ? -4 : 4} -2" stroke="#4f7a1d" stroke-width="1.6" stroke-linecap="round" />{/each}
    <ellipse cx="26" cy="27" rx="13" ry="12" fill="#7a3a18" />
    <path d="M34 18 C40 26 38 36 28 39 C34 32 36 26 34 18 Z" fill="#5a2810" />
    <ellipse cx="26" cy="37" rx="8" ry="3" fill="#d9b98a" />
    <ellipse cx="21" cy="22" rx="4" ry="2.8" fill="#fff" opacity=".35" />
  {:else if name === 'drachen'}
    <path class="schnur" d="M32 64 C22 72 42 78 30 86 C20 92 38 96 30 102" stroke="#7a4a2a" stroke-width="1.6" fill="none" />
    {#each [[27, 72], [33, 84], [27, 96]] as [x, y], i (i)}<path d="M{x - 6} {y - 3} L{x} {y} L{x - 6} {y + 3} Z M{x + 6} {y - 3} L{x} {y} L{x + 6} {y + 3} Z" fill={['#f2b33d', '#3b8fd6', '#e8452b'][i]} />{/each}
    <path d="M32 2 L58 32 L32 32 Z" fill="#f2b33d" />
    <path d="M32 2 L6 32 L32 32 Z" fill="#e8452b" />
    <path d="M6 32 L32 66 L32 32 Z" fill="#3b8fd6" />
    <path d="M58 32 L32 66 L32 32 Z" fill="#4caf50" />
    <path d="M32 2 L58 32 L32 66 Z" fill="#000" opacity=".12" />
    <path d="M32 2 V66 M6 32 H58" stroke="#fff" stroke-width="1.4" opacity=".55" />
    <path d="M14 26 L30 8" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".4" />
  {/if}
</svg>

<style>
  .gemalt {
    display: block;
    width: auto;
    overflow: visible;
  }
  .bein {
    transform-box: fill-box;
    transform-origin: 50% 0;
    animation: tappen 0.5s ease-in-out infinite alternate;
  }
  .bein.b {
    animation-direction: alternate-reverse;
  }
  .schwanz {
    transform-box: fill-box;
    transform-origin: 0% 100%;
    animation: wedeln 1.6s ease-in-out infinite alternate;
  }
  .rad {
    animation: rollen 1.6s linear infinite;
  }
  .puff {
    transform-box: fill-box;
    transform-origin: center;
    animation: puff 1.8s ease-out infinite;
  }
  .puff.b {
    animation-delay: 0.9s;
  }
  .fluegel {
    transform-box: fill-box;
    transform-origin: 0% 100%;
    animation: schlagen 0.5s ease-in-out infinite alternate;
  }
  .lid {
    transform-box: fill-box;
    transform-origin: 50% 0;
    animation: blinzeln 4s ease-in-out infinite;
  }
  .glut {
    animation: glimmen 1.6s ease-in-out infinite alternate;
  }
  .arm {
    transform-box: fill-box;
    transform-origin: center;
    animation: winken 0.7s ease-in-out infinite alternate;
  }
  @keyframes tappen {
    from {
      transform: rotate(-14deg);
    }
    to {
      transform: rotate(14deg);
    }
  }
  @keyframes wedeln {
    from {
      transform: rotate(-4deg);
    }
    to {
      transform: rotate(5deg);
    }
  }
  @keyframes rollen {
    to {
      transform: rotate(-360deg);
    }
  }
  @keyframes puff {
    0% {
      opacity: 0.8;
      transform: translate(0, 0) scale(0.6);
    }
    100% {
      opacity: 0;
      transform: translate(14px, -22px) scale(2);
    }
  }
  @keyframes schlagen {
    from {
      transform: scaleY(1);
    }
    to {
      transform: scaleY(-0.55);
    }
  }
  @keyframes blinzeln {
    0%,
    88%,
    100% {
      transform: scaleY(0);
    }
    92%,
    96% {
      transform: scaleY(1);
    }
  }
  @keyframes glimmen {
    from {
      opacity: 0.7;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes winken {
    from {
      transform: rotate(-8deg);
    }
    to {
      transform: rotate(8deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .gemalt * {
      animation: none !important;
    }
  }
</style>
