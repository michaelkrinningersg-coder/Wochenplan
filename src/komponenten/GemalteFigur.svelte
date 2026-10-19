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
    hahn: 1.3,
    radler: 1.6,
    stiefel: 1.2,
    schokolade: 0.5,
    orange: 0.5,
    bonbon: 0.4,
    flugzeug: 1,
    schaf: 1,
    note: 0.6,
    noten: 0.6,
    herz: 1,
    ranzen: 1.1,
    baer: 1.1,
    schildkroete: 0.8,
    pinguin: 1.1,
    elefant: 1.3,
    giraffe: 1.9,
    affe: 1.1,
    loewe: 1.1,
    gespann: 1,
    schmetterling: 0.8,
    biene: 0.7,
    eiswagen: 1.6,
    hase: 1,
    fuchs: 1,
    marienkaefer: 0.5,
    schlitten: 1.2,
    tulpe: 1,
    gaensebluemchen: 0.9,
    kirschbluete: 0.7,
    sonnenblume: 1.4,
    nest: 0.6,
    ei: 0.5,
    kueken: 0.7,
    frosch: 0.9,
    loewenzahn: 1,
    ente: 1,
    hemd: 0.8,
    hose: 0.8,
    socke: 0.7,
    kleid: 0.8,
    raupe: 0.6,
    segelboot: 1.3,
    schlittschuh: 0.8,
    regenbogen: 1,
    spross: 0.9,
    sonne: 1,
    erdbeere: 0.8,
    schwimmring: 1,
    eimer: 1,
    eis: 1.1,
    melone: 0.75,
    zelt: 1,
    schneemann: 1.4,
    schneeflocke: 0.8,
    tannenbaum: 1.3,
    plaetzchen: 0.9,
    handschuhe: 0.9,
    kerze: 1,
    kakao: 0.9,
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
  data-n={name}
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
    hahn: '0 0 80 84',
    radler: '0 0 120 100',
    stiefel: '0 0 60 70',
    schokolade: '0 0 30 26',
    orange: '0 0 28 28',
    bonbon: '0 0 36 20',
    flugzeug: '0 0 120 60',
    schaf: '0 0 80 64',
    note: '0 0 26 34',
    noten: '0 0 34 34',
    herz: '0 0 60 54',
    ranzen: '0 0 60 70',
    baer: '0 0 80 70',
    schildkroete: '0 0 90 56',
    pinguin: '0 0 50 70',
    elefant: '0 0 100 78',
    giraffe: '0 0 70 110',
    affe: '0 0 64 70',
    loewe: '0 0 92 70',
    gespann: '0 0 252 70',
    schmetterling: '0 0 60 50',
    biene: '0 0 56 44',
    eiswagen: '0 -26 150 116',
    hase: '0 0 80 70',
    fuchs: '0 0 98 64',
    marienkaefer: '0 0 44 34',
    schlitten: '0 -14 110 84',
    tulpe: '0 0 30 56',
    gaensebluemchen: '0 0 40 50',
    kirschbluete: '0 0 40 40',
    sonnenblume: '0 -4 50 84',
    nest: '0 6 70 30',
    ei: '0 0 26 32',
    kueken: '0 0 40 42',
    frosch: '0 0 60 52',
    loewenzahn: '0 -4 34 60',
    ente: '-4 0 74 56',
    hemd: '0 0 40 40',
    hose: '0 0 40 40',
    socke: '0 0 32 38',
    kleid: '0 0 40 40',
    raupe: '0 0 70 36',
    segelboot: '0 0 80 80',
    schlittschuh: '0 0 60 52',
    regenbogen: '-6 6 112 54',
    spross: '0 0 40 52',
    sonne: '0 0 60 60',
    erdbeere: '0 0 40 46',
    schwimmring: '0 0 60 60',
    eimer: '0 0 60 56',
    eis: '0 -6 36 70',
    melone: '0 0 60 40',
    zelt: '0 0 80 60',
    schneemann: '0 -8 50 86',
    schneeflocke: '0 0 50 50',
    tannenbaum: '0 -2 60 82',
    plaetzchen: '0 0 50 50',
    handschuhe: '0 0 60 50',
    kerze: '0 0 30 60',
    kakao: '0 0 56 52',
  }[name] ?? '0 0 40 40'}
  aria-hidden="true"
>
  {#if name === 'igel'}
    <ellipse cx="58" cy="73" rx="44" ry="4.5" fill={SCHATTEN} opacity=".18" />
    <g class="k">
    <ellipse class="bein a" cx="42" cy="68" rx="6" ry="4.5" fill="#4a3022" />
    <ellipse class="bein b" cx="82" cy="68" rx="6" ry="4.5" fill="#4a3022" />
    <path d="M28 64 C26 30 52 14 78 18 C100 22 110 44 104 66 Z" fill="#5e4130" />
    {#each STACHELN as s, i (i)}<path d={s.d} fill={s.hell ? '#8a6448' : '#4f3526'} />{/each}
    <path d="M66 24 C88 26 102 42 102 62 L90 64 C92 46 82 32 66 24 Z" fill="#4a3022" opacity=".55" />
    <path d="M46 34 q8 -10 18 -12 M54 40 q8 -10 18 -12 M62 46 q8 -10 18 -12" stroke="#a37c5a" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7" />
    <path d="M38 42 C26 44 12 52 6 60 C12 68 28 68 42 66 Z" fill="#e8c9a0" />
    <path d="M42 56 C30 60 18 62 8 62 C14 68 28 68 42 66 Z" fill="#d1a97c" />
    <circle cx="38" cy="44" r="4.5" fill="#c9a07a" />
    <g class="teil schnuppern" style="transform-origin: 9px 60px"><circle cx="7" cy="60" r="3.6" fill="#2a1a12" /><circle cx="6" cy="58.8" r="1" fill="#fff" opacity=".8" /></g>
    <circle cx="24" cy="51" r="2.8" fill="#2a1a12" /><circle cx="23.2" cy="50.2" r="1" fill="#fff" />
    <ellipse cx="20" cy="58" rx="3.4" ry="2.2" fill="#f2a08a" opacity=".6" />
    <g transform="translate(72 15)">
      <circle r="9" fill="#d93a2b" /><path d="M2 -2 a9 9 0 0 1 -6 10.6 a9 9 0 0 0 9 -8 z" fill="#a8261c" /><ellipse cx="-3" cy="-3" rx="2.4" ry="3.4" fill="#fff" opacity=".35" />
      <path d="M0 -8 l1 -5" stroke="#5a3a1a" stroke-width="2" stroke-linecap="round" /><path d="M1 -11 q6 -4 9 0 q-5 3 -9 0" fill="#5aa83a" />
    </g>
    </g>
  {:else if name === 'eichhoernchen'}
    <ellipse cx="50" cy="96" rx="32" ry="3.8" fill={SCHATTEN} opacity=".18" />
    <g class="k">
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
    <g class="teil zucken" style="transform-origin: 42px 31px"><path d="M37 32 L41 15 L48 30 Z" fill="#b85a24" /><path d="M41 15 l-2 -5 M41 15 l1 -6 M41 15 l4 -4" stroke="#8a3c16" stroke-width="2" stroke-linecap="round" />
    <path d="M39 30 L41 21 L45 29 Z" fill="#f2b48a" /></g>
    <circle cx="28" cy="40" r="3.2" fill="#2a1a12" /><circle cx="27" cy="39" r="1.1" fill="#fff" />
    <circle cx="13.5" cy="47" r="2.4" fill="#3a2418" />
    <ellipse cx="28" cy="62" rx="5" ry="3.6" fill="#b85a24" /><ellipse cx="34" cy="63" rx="5" ry="3.6" fill="#c4622a" />
    <path d="M42 32 q-8 -6 -14 -2" stroke="#ef9a5a" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7" />
    </g>
  {:else if name === 'nuss'}
    <g class="k">
    <ellipse cx="15" cy="22" rx="10" ry="11" fill="#c08a3e" />
    <path d="M22 14 C27 22 24 31 15 33 C22 28 23 20 22 14 Z" fill="#9a6a2a" />
    <ellipse cx="11" cy="20" rx="2.6" ry="5" fill="#fff" opacity=".3" />
    <path d="M3 14 C3 5 27 5 27 14 C27 17 3 17 3 14 Z" fill="#7a4e2d" />
    <path d="M7 9 l3 3 M12 7 l2 4 M18 7 l-1 4 M23 9 l-3 3" stroke="#5a3820" stroke-width="1.4" stroke-linecap="round" />
    <path d="M15 6 l1 -5" stroke="#5a3820" stroke-width="2.2" stroke-linecap="round" />
    </g>
  {:else if name === 'fliegenpilz'}
    <ellipse cx="30" cy="61" rx="18" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path d="M22 28 C20 42 19 52 17 60 L43 60 C41 52 40 42 38 28 Z" fill="#f6ecd8" />
    <path d="M34 28 C36 42 37 52 41 60 L43 60 C41 52 40 42 38 28 Z" fill="#d8c7a6" />
    <path d="M19 36 C24 42 36 42 41 36 L40 40 C34 46 26 46 20 40 Z" fill="#fffaf0" />
    <path d="M2 30 C2 8 58 8 58 30 C58 34 2 34 2 30 Z" fill="#e23a28" />
    <path d="M40 10 C54 16 58 26 58 30 C58 33 44 34 34 33 C46 28 48 18 40 10 Z" fill="#b72818" />
    <path d="M10 22 C12 14 20 10 26 10 C18 14 14 18 12 24 Z" fill="#ff7a5e" opacity=".8" />
    <circle cx="16" cy="20" r="3.4" fill="#fff" /><circle cx="30" cy="14" r="2.8" fill="#fff" /><circle cx="44" cy="21" r="3" fill="#fff" /><circle cx="25" cy="26" r="2" fill="#fff" /><circle cx="51" cy="28" r="1.8" fill="#fff" /><circle cx="8" cy="28" r="1.8" fill="#fff" />
    <path d="M8 60 l3 -7 l2 7 M46 60 l3 -8 l3 8" fill="#7d8a34" />
    </g>
  {:else if name === 'steinpilz'}
    <ellipse cx="30" cy="61" rx="18" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path d="M18 30 C12 44 14 56 20 60 L42 60 C48 56 48 44 42 30 Z" fill="#efe2c4" />
    <path d="M36 30 C44 42 46 54 40 60 L42 60 C48 56 48 44 42 30 Z" fill="#cdb98e" />
    <path d="M22 40 q2 6 0 12 M30 38 q2 8 0 14" stroke="#d8c8a2" stroke-width="1.4" fill="none" />
    <path d="M4 32 C2 12 58 8 56 32 C50 36 10 36 4 32 Z" fill="#8a5428" />
    <path d="M38 12 C52 18 56 26 56 32 C50 35 40 35 34 34 C46 28 46 18 38 12 Z" fill="#6a3c1a" />
    <path d="M12 22 C16 14 24 12 30 12 C22 16 18 20 15 26 Z" fill="#b07a46" opacity=".9" />
    <path d="M8 60 l3 -7 l2 7 M46 60 l3 -8 l3 8" fill="#7d8a34" />
    </g>
  {:else if name === 'apfel'}
    <g class="k">
    <path d="M20 10 C8 4 2 16 6 27 C9 35 16 40 20 37 C24 40 31 35 34 27 C38 16 32 4 20 10 Z" fill="#d93a2b" />
    <path d="M30 8 C38 16 36 30 28 36 C25 38 22 38 20 37 C28 32 33 22 30 8 Z" fill="#a8261c" />
    <path d="M10 12 C6 18 6 24 8 28 C9 22 11 16 16 12 Z" fill="#f2b33d" opacity=".55" />
    <ellipse cx="13" cy="19" rx="3" ry="5" fill="#fff" opacity=".35" />
    <path d="M20 11 L21 3" stroke="#5a3a1a" stroke-width="2.5" stroke-linecap="round" />
    <path d="M21 6 q7 -5 11 0 q-6 4 -11 0" fill="#5aa83a" /><path d="M22 6 q4 -1 9 0" stroke="#3e7d26" stroke-width=".8" fill="none" />
    </g>
  {:else if name === 'birne'}
    <g class="k">
    <path d="M18 8 C12 8 12 18 10 24 C4 30 4 42 18 44 C32 42 32 30 26 24 C24 18 24 8 18 8 Z" fill="#c9cf4a" />
    <path d="M24 14 C26 24 34 30 28 40 C25 43 21 44 18 44 C28 38 28 26 24 14 Z" fill="#9aa632" />
    <ellipse cx="13" cy="30" rx="2.6" ry="5" fill="#fff" opacity=".35" />
    <ellipse cx="20" cy="34" rx="5" ry="4" fill="#e8823a" opacity=".35" />
    <path d="M18 9 l2 -6" stroke="#5a3a1a" stroke-width="2.2" stroke-linecap="round" />
    </g>
  {:else if name === 'karotte'}
    <g class="k">
    <path d="M8 14 C8 10 22 10 22 14 L16 48 C15 50 14 50 14 48 Z" fill="#f08a24" />
    <path d="M18 12 C22 12 22 14 22 14 L16 48 C16 40 18 26 18 12 Z" fill="#c8661a" />
    <path d="M10 22 l5 1 M11 30 l4 1 M12 38 l3 0" stroke="#c8661a" stroke-width="1.4" stroke-linecap="round" />
    <path d="M15 12 C12 4 8 2 6 2 C10 6 12 9 13 12 Z M15 12 C15 4 18 0 20 0 C18 4 17 8 16 12 Z M15 12 C20 6 24 6 26 6 C22 8 19 10 17 12 Z" fill="#4caf50" />
    </g>
  {:else if name === 'traube'}
    <g class="k">
    {#each [[10, 14], [20, 13], [28, 16], [14, 22], [24, 22], [18, 30], [10, 28], [26, 29], [18, 38]] as [x, y], i (i)}
      <circle cx={x} cy={y} r="5.6" fill="#6d3f8a" /><circle cx={x + 1.6} cy={y + 1.6} r="3.8" fill="#55306e" /><circle cx={x - 1.8} cy={y - 1.8} r="1.4" fill="#fff" opacity=".45" />
    {/each}
    <path d="M18 9 l2 -7" stroke="#5a3a1a" stroke-width="2" stroke-linecap="round" /><path d="M20 5 q8 -5 12 0 q-6 4 -12 0" fill="#6aa83a" />
    </g>
  {:else if name === 'kuerbis'}
    <ellipse cx="42" cy="63" rx="34" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
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
    </g>
  {:else if name === 'kastanienmann'}
    <g class="k">
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
    </g>
  {:else if name === 'traktor'}
    <ellipse cx="96" cy="90" rx="90" ry="4" fill={SCHATTEN} opacity=".18" />
    <g class="k">
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
    </g>
  {:else if name === 'gans'}
    <g class="k">
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
    </g>
  {:else if name === 'regenschirm'}
    <g class="k">
    <path d="M42 40 L42 74 C42 82 32 82 32 76" stroke="#5a3a1a" stroke-width="3.4" fill="none" stroke-linecap="round" />
    <path d="M4 40 C6 18 22 6 42 6 C62 6 78 18 80 40 C74 36 68 36 62 40 C56 36 48 36 42 40 C36 36 28 36 22 40 C16 36 10 36 4 40 Z" fill="#e8452b" />
    <path d="M42 6 C34 12 28 26 22 40 C28 36 36 36 42 40 Z M42 6 C50 12 56 26 62 40 C56 36 48 36 42 40 Z" fill="#f2b33d" />
    <path d="M42 6 C62 6 78 18 80 40 C74 36 68 36 62 40 C58 28 52 14 42 6 Z" fill="#b8301c" opacity=".55" />
    <path d="M14 26 C18 16 26 11 34 9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".45" />
    <path d="M42 6 V1" stroke="#5a3a1a" stroke-width="3" stroke-linecap="round" />
    </g>
  {:else if name === 'korb'}
    <ellipse cx="38" cy="53" rx="30" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path d="M14 24 C14 2 62 2 62 24" stroke="#9a6430" stroke-width="5" fill="none" />
    <path d="M6 24 L70 24 L62 52 L14 52 Z" fill="#c08446" />
    <path d="M8 30 H68 M10 37 H66 M12 44 H64" stroke="#93602e" stroke-width="2.2" />
    <path d="M20 24 L22 52 M32 24 L33 52 M44 24 L43 52 M56 24 L54 52" stroke="#a8703a" stroke-width="2" />
    <path d="M54 24 L70 24 L62 52 L52 52 Z" fill="#7a4a20" opacity=".35" />
    <path d="M4 22 H72 V27 H4 Z" fill="#a8703a" />
    </g>
  {:else if name === 'vogel'}
    <g class="k">
    <path d="M50 26 L68 20 L66 30 Z" fill="#6a5440" />
    <ellipse cx="34" cy="28" rx="20" ry="13" fill="#8a6a4a" />
    <ellipse cx="26" cy="32" rx="12" ry="9" fill="#ee6a2a" />
    <ellipse cx="34" cy="38" rx="10" ry="4" fill="#efe2cc" />
    <circle cx="16" cy="22" r="10" fill="#8a6a4a" />
    <ellipse cx="14" cy="27" rx="6" ry="5" fill="#ee6a2a" />
    <path d="M7 21 L0 23 L7 25 Z" fill="#3a2a1a" />
    <circle cx="12" cy="19" r="2" fill="#1a1a1a" /><circle cx="11.4" cy="18.4" r=".7" fill="#fff" />
    <path class="fluegel" d="M30 24 C36 6 50 0 60 4 C52 10 46 18 44 28 Z" fill="#6e5238" />
    </g>
  {:else if name === 'eule'}
    <g class="k">
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
    </g>
  {:else if name === 'schnecke'}
    <ellipse cx="38" cy="46" rx="34" ry="2.6" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path d="M4 44 C4 34 12 30 22 32 L66 38 C72 40 72 44 66 45 Z" fill="#d9c49a" />
    <path d="M22 40 L68 42 C70 44 68 45 66 45 L6 45 C10 42 16 40 22 40 Z" fill="#bfa878" />
    <g class="teil fuehler" style="transform-origin: 15px 32px"><path d="M12 32 L8 16 M18 31 L18 14" stroke="#cdb688" stroke-width="2.6" stroke-linecap="round" />
    <circle cx="8" cy="15" r="2.6" fill="#3a2a1a" /><circle cx="18" cy="13" r="2.6" fill="#3a2a1a" /></g>
    <circle cx="8" cy="34" r="1.6" fill="#3a2a1a" /><path d="M5 38 q3 2 6 0" stroke="#3a2a1a" stroke-width="1.2" fill="none" />
    <circle cx="46" cy="24" r="18" fill="#c8742e" />
    <path d="M58 12 C68 24 64 40 50 42 C60 34 62 22 58 12 Z" fill="#9a5420" />
    <path d="M46 24 m0 -3 a3 3 0 1 1 -3 3 a6 6 0 1 1 6 6 a10 10 0 1 1 -10 -10 a14 14 0 0 1 14 14" stroke="#7a3e16" stroke-width="2.6" fill="none" stroke-linecap="round" />
    <ellipse cx="38" cy="14" rx="4" ry="2.6" fill="#fff" opacity=".35" />
    </g>
  {:else if name === 'specht'}
    <g class="k">
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
    </g>
  {:else if name === 'laterne'}
    <g class="k">
    <circle class="glut" cx="26" cy="36" r="26" fill="#ffd36a" opacity=".35" />
    <path d="M26 0 V10" stroke="#5a3a1a" stroke-width="1.6" />
    <rect x="14" y="10" width="24" height="5" rx="1.5" fill="#7a2a18" />
    <ellipse cx="26" cy="36" rx="21" ry="21" fill="#ff9a2a" />
    <ellipse cx="26" cy="36" rx="13" ry="21" fill="#ffb84a" />
    <ellipse cx="26" cy="36" rx="5" ry="21" fill="#ffd36a" />
    <path d="M18 30 a6 6 0 1 0 6 -6 a4.6 4.6 0 1 1 -6 6 Z" fill="#fff4c2" />
    <path d="M34 40 l1.4 3 l3 .4 l-2.2 2 l.6 3 l-2.8 -1.4 l-2.8 1.4 l.6 -3 l-2.2 -2 l3 -.4 Z" fill="#fff4c2" />
    <rect x="14" y="56" width="24" height="5" rx="1.5" fill="#7a2a18" />
    </g>
  {:else if name === 'spinne'}
    <g class="k">
    <path d="M17 0 V10" stroke="#fff" stroke-width=".8" opacity=".8" />
    <g class="teil zappeln" style="transform-origin: 17px 19px"><path d="M10 16 C4 12 2 14 0 18 M10 19 C4 18 2 20 0 24 M24 16 C30 12 32 14 34 18 M24 19 C30 18 32 20 34 24 M11 22 C6 24 4 28 4 32 M23 22 C28 24 30 28 30 32" stroke="#3a2438" stroke-width="2" fill="none" stroke-linecap="round" /></g>
    <circle cx="17" cy="19" r="8" fill="#4a2e48" />
    <circle cx="17" cy="11" r="5" fill="#5a3a58" />
    <circle cx="15" cy="10" r="1.6" fill="#fff" /><circle cx="19" cy="10" r="1.6" fill="#fff" />
    <circle cx="15" cy="10.4" r=".7" fill="#1a1a1a" /><circle cx="19" cy="10.4" r=".7" fill="#1a1a1a" />
    <ellipse cx="14" cy="16" rx="2.4" ry="1.6" fill="#fff" opacity=".25" />
    </g>
  {:else if name === 'blatt'}
    <g class="k">
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
    </g>
  {:else if name === 'kastanie'}
    <ellipse cx="26" cy="41" rx="20" ry="2.6" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path d="M4 30 C2 16 12 8 22 10 L18 40 C10 40 5 36 4 30 Z" fill="#7fb43a" />
    <path d="M48 30 C50 16 40 8 30 10 L34 40 C42 40 47 36 48 30 Z" fill="#6a9e2e" />
    {#each [[6, 18], [3, 26], [8, 36], [14, 12], [46, 18], [49, 26], [44, 36], [38, 12]] as [x, y], i (i)}<path d="M{x} {y} l{x < 26 ? -4 : 4} -2" stroke="#4f7a1d" stroke-width="1.6" stroke-linecap="round" />{/each}
    <ellipse cx="26" cy="27" rx="13" ry="12" fill="#7a3a18" />
    <path d="M34 18 C40 26 38 36 28 39 C34 32 36 26 34 18 Z" fill="#5a2810" />
    <ellipse cx="26" cy="37" rx="8" ry="3" fill="#d9b98a" />
    <ellipse cx="21" cy="22" rx="4" ry="2.8" fill="#fff" opacity=".35" />
    </g>
  {:else if name === 'drachen'}
    <g class="k">
    <g class="teil schnur" style="transform-origin: 32px 64px"><path d="M32 64 C22 72 42 78 30 86 C20 92 38 96 30 102" stroke="#7a4a2a" stroke-width="1.6" fill="none" />
    {#each [[27, 72], [33, 84], [27, 96]] as [x, y], i (i)}<path d="M{x - 6} {y - 3} L{x} {y} L{x - 6} {y + 3} Z M{x + 6} {y - 3} L{x} {y} L{x + 6} {y + 3} Z" fill={['#f2b33d', '#3b8fd6', '#e8452b'][i]} />{/each}</g>
    <path d="M32 2 L58 32 L32 32 Z" fill="#f2b33d" />
    <path d="M32 2 L6 32 L32 32 Z" fill="#e8452b" />
    <path d="M6 32 L32 66 L32 32 Z" fill="#3b8fd6" />
    <path d="M58 32 L32 66 L32 32 Z" fill="#4caf50" />
    <path d="M32 2 L58 32 L32 66 Z" fill="#000" opacity=".12" />
    <path d="M32 2 V66 M6 32 H58" stroke="#fff" stroke-width="1.4" opacity=".55" />
    <path d="M14 26 L30 8" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".4" />
    </g>
  {:else if name === 'hahn'}
    <ellipse cx="40" cy="81" rx="26" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path d="M50 44 C56 20 72 12 78 22 C72 22 66 30 64 42 Z" fill="#1f3a34" />
    <path d="M54 46 C64 26 78 26 78 36 C72 34 66 40 62 48 Z" fill="#2c5a4c" />
    <path d="M56 48 C66 38 76 42 74 50 C70 46 64 48 60 52 Z" fill="#b8301c" />
    <path d="M40 74 L38 80 M34 80 h8 M50 74 L52 80 M48 80 h8" stroke="#e8a23a" stroke-width="2.6" stroke-linecap="round" />
    <ellipse cx="44" cy="58" rx="20" ry="17" fill="#b85a24" />
    <path d="M56 46 C66 56 62 72 46 75 C56 66 58 56 56 46 Z" fill="#8a3c16" />
    <path d="M36 54 C42 48 54 50 56 58 C50 56 42 58 38 62 Z" fill="#7a3414" />
    <g class="teil picken" style="transform-origin: 34px 52px">
    <path d="M26 54 C22 44 24 34 28 28 L38 30 C36 38 36 46 40 52 Z" fill="#e8a23a" />
    <circle cx="28" cy="26" r="9" fill="#e8a23a" />
    <path d="M22 18 q2 -8 6 -4 q2 -7 6 -2 q4 -5 5 2 q-8 2 -17 4 Z" fill="#e23a28" />
    <path d="M20 26 L10 28 L20 31 Z" fill="#f2c23a" />
    <path d="M22 31 q-2 7 3 8 q3 -4 0 -8 Z" fill="#e23a28" />
    <circle cx="26" cy="24" r="1.8" fill="#1a1a1a" /><circle cx="25.5" cy="23.5" r=".6" fill="#fff" /></g>
    </g>
  {:else if name === 'radler'}
    <ellipse cx="62" cy="97" rx="54" ry="3" fill={SCHATTEN} opacity=".18" />
    <g class="k">
    <g transform="translate(26 76)"><g class="rad"><circle r="19" fill="none" stroke="#2e2a2a" stroke-width="5" />{#each [0, 45, 90, 135] as w (w)}<path d="M-17 0 H17" stroke="#9a9a9a" stroke-width="1.2" transform="rotate({w})" />{/each}<circle r="3" fill="#9a9a9a" /></g></g>
    <g transform="translate(96 76)"><g class="rad"><circle r="19" fill="none" stroke="#2e2a2a" stroke-width="5" />{#each [0, 45, 90, 135] as w (w)}<path d="M-17 0 H17" stroke="#9a9a9a" stroke-width="1.2" transform="rotate({w})" />{/each}<circle r="3" fill="#9a9a9a" /></g></g>
    <path d="M26 76 L44 46 L82 50 L96 76 M44 46 L62 78 L82 50 M62 78 L96 76 M40 40 L44 46 M34 40 h10 M82 50 L80 42 M74 42 h12" stroke="#e8452b" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <g class="pedal"><path d="M62 78 l0 -9 M62 78 l0 9" stroke="#3a3a3a" stroke-width="3" stroke-linecap="round" /></g>
    <path d="M76 40 C70 52 66 64 62 70" stroke="#2f5fa8" stroke-width="7" fill="none" stroke-linecap="round" />
    <path d="M78 38 C64 30 52 26 42 30" stroke="#f2b33d" stroke-width="9" fill="none" stroke-linecap="round" />
    <path d="M58 30 C50 34 44 38 40 40" stroke="#f0c8a0" stroke-width="4.5" fill="none" stroke-linecap="round" />
    <circle cx="44" cy="18" r="11" fill="#f0c8a0" />
    <path d="M32 16 C32 4 56 2 56 16 Z" fill="#3b8fd6" /><path d="M44 5 C50 6 54 10 56 16 L50 16 C50 12 48 8 44 5 Z" fill="#2a6ab0" />
    <circle cx="38" cy="20" r="1.6" fill="#1a1a1a" /><path d="M34 25 q3 2 6 0" stroke="#b05a3a" stroke-width="1.4" fill="none" stroke-linecap="round" />
    <ellipse cx="41" cy="24" rx="2.4" ry="1.6" fill="#f2a08a" opacity=".7" />
    </g>
  {:else if name === 'stiefel'}
    <ellipse cx="30" cy="67" rx="24" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path d="M18 14 L44 14 L44 46 C56 48 58 64 50 66 L10 66 C6 66 6 58 14 54 L18 50 Z" fill="#d6302a" />
    <path d="M36 14 L44 14 L44 46 C56 48 58 64 50 66 L36 66 C50 60 46 50 36 48 Z" fill="#a8221c" />
    <path d="M10 62 L52 62 L50 66 L10 66 Z" fill="#5a2a1a" />
    <rect x="14" y="6" width="34" height="12" rx="6" fill="#fffaf2" />
    <path d="M18 9 C24 8 30 8 34 9" stroke="#e8ded0" stroke-width="3" stroke-linecap="round" />
    <path d="M24 26 C26 22 30 22 30 26" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".4" />
    </g>
  {:else if name === 'schokolade'}
    <g class="k">
    <rect x="2" y="4" width="26" height="18" rx="2" fill="#6a3a1e" />
    <path d="M10 4 V22 M19 4 V22 M2 13 H28" stroke="#4e2810" stroke-width="1.4" />
    <path d="M2 4 L16 4 L10 22 L2 22 Z" fill="#3b8fd6" /><path d="M5 9 h6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" />
    </g>
  {:else if name === 'orange'}
    <g class="k">
    <circle cx="14" cy="15" r="12" fill="#f28a1e" /><path d="M22 7 C28 16 24 26 14 27 C22 22 24 14 22 7 Z" fill="#d06a12" />
    <ellipse cx="10" cy="11" rx="3" ry="4" fill="#fff" opacity=".35" /><path d="M14 3 q5 -4 9 0 q-5 3 -9 0" fill="#5aa83a" />
    </g>
  {:else if name === 'bonbon'}
    <g class="k">
    <path d="M10 10 L2 3 L2 17 Z M26 10 L34 3 L34 17 Z" fill="#ff8fb1" />
    <ellipse cx="18" cy="10" rx="9" ry="7" fill="#ff5d8f" /><path d="M13 5 L17 15 M19 4 L23 14" stroke="#fff" stroke-width="2" opacity=".7" />
    </g>
  {:else if name === 'flugzeug'}
    <g class="k">
    <path d="M92 26 L112 8 L118 8 L108 30 Z" fill="#3b8fd6" />
    <path d="M14 30 C14 22 24 20 34 20 L104 24 C112 26 112 34 104 36 L34 40 C24 40 14 38 14 30 Z" fill="#f4f1ec" />
    <path d="M14 30 C14 36 24 40 34 40 L104 36 C110 35 112 32 110 30 Z" fill="#d6d0c6" />
    <path d="M50 30 L80 30 L64 56 L56 56 Z" fill="#e8452b" /><path d="M54 24 L74 25 L62 8 L56 8 Z" fill="#c8361e" opacity=".8" />
    {#each [32, 42, 52, 62, 72, 82] as x (x)}<circle cx={x} cy="27" r="2.4" fill="#7fb8e6" />{/each}
    <path d="M18 26 C20 23 24 22 26 22 L26 30 L18 30 Z" fill="#7fb8e6" />
    <g transform="translate(12 30)"><ellipse class="propeller" rx="2.4" ry="12" fill="#5a5a5a" opacity=".7" /></g>
    </g>
  {:else if name === 'schaf'}
    <ellipse cx="40" cy="61" rx="28" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path d="M26 46 v12 M34 48 v11 M52 48 v11 M60 46 v12" stroke="#3a3a3a" stroke-width="4" stroke-linecap="round" />
    <ellipse cx="44" cy="36" rx="28" ry="17" fill="#d9cfba" />
    {#each [[30, 30, 12], [44, 24, 13], [58, 30, 12], [36, 42, 12], [52, 42, 12], [64, 38, 9], [24, 38, 9]] as [x, y, r], i (i)}<circle cx={x} cy={y} r={r} fill="#f6f1e6" />{/each}
    {#each [[50, 46, 10], [64, 40, 7]] as [x, y, r], i (i)}<circle cx={x} cy={y} r={r} fill="#ddd4c2" />{/each}
    <circle cx="38" cy="22" r="5" fill="#fff" opacity=".8" />
    <ellipse cx="16" cy="32" rx="10" ry="12" fill="#4a4448" />
    <ellipse cx="22" cy="24" rx="6" ry="3" fill="#3a3438" transform="rotate(30 22 24)" />
    <circle cx="12" cy="30" r="2" fill="#fff" /><circle cx="12" cy="30" r="1" fill="#1a1a1a" />
    <circle cx="20" cy="22" r="5" fill="#f6f1e6" />
    </g>
  {:else if name === 'note'}
    <g class="k">
    <ellipse cx="9" cy="28" rx="7" ry="5" fill="#3a2a5a" transform="rotate(-20 9 28)" /><path d="M15 26 V3 C19 8 24 10 22 18" stroke="#3a2a5a" stroke-width="2.6" fill="none" stroke-linecap="round" />
    </g>
  {:else if name === 'noten'}
    <g class="k">
    <ellipse cx="8" cy="28" rx="6" ry="4.4" fill="#3a2a5a" transform="rotate(-20 8 28)" /><ellipse cx="26" cy="24" rx="6" ry="4.4" fill="#3a2a5a" transform="rotate(-20 26 24)" />
    <path d="M13 27 V6 L31 2 V23" stroke="#3a2a5a" stroke-width="2.6" fill="none" stroke-linejoin="round" /><path d="M13 6 L31 2 L31 7 L13 11 Z" fill="#3a2a5a" />
    </g>
  {:else if name === 'herz'}
    <g class="k">
    <path d="M30 50 C10 36 2 26 4 16 C6 6 20 2 30 14 C40 2 54 6 56 16 C58 26 50 36 30 50 Z" fill="#e8304a" />
    <path d="M44 6 C54 10 58 22 50 32 C44 40 36 46 30 50 C40 40 50 28 44 6 Z" fill="#b81e34" />
    <ellipse cx="16" cy="16" rx="5" ry="7" fill="#fff" opacity=".35" transform="rotate(-30 16 16)" />
    </g>
  {:else if name === 'ranzen'}
    <ellipse cx="30" cy="67" rx="24" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path d="M20 10 C20 2 40 2 40 10" stroke="#2a4a7a" stroke-width="4" fill="none" />
    <rect x="8" y="10" width="44" height="54" rx="8" fill="#3b7fd6" />
    <path d="M44 10 C50 10 52 14 52 18 L52 56 C52 62 48 64 44 64 Z" fill="#2a62b0" />
    <path d="M8 18 C8 12 12 10 18 10 L42 10 C48 10 52 12 52 18 L52 34 L8 34 Z" fill="#f2b33d" />
    <rect x="26" y="30" width="8" height="8" rx="2" fill="#c8c8c8" />
    <circle cx="16" cy="52" r="4" fill="#ffe25a" /><circle cx="44" cy="52" r="4" fill="#ffe25a" />
    <path d="M14 20 h18" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".45" />
    </g>
  {:else if name === 'baer'}
    <ellipse cx="42" cy="67" rx="34" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <ellipse class="bein a" cx="24" cy="58" rx="7" ry="9" fill="#6a4228" /><ellipse class="bein b" cx="60" cy="58" rx="7" ry="9" fill="#6a4228" />
    <ellipse cx="46" cy="42" rx="30" ry="20" fill="#8a5a36" />
    <path d="M62 26 C78 34 78 52 62 60 C70 50 70 36 62 26 Z" fill="#6a4228" />
    <circle cx="18" cy="32" r="14" fill="#8a5a36" />
    <circle cx="20" cy="18" r="5" fill="#8a5a36" /><circle cx="20" cy="18" r="2.6" fill="#c89870" />
    <ellipse cx="9" cy="36" rx="7" ry="5.4" fill="#d9b48a" /><ellipse cx="5" cy="34" rx="2.6" ry="2" fill="#2a1a12" />
    <circle cx="14" cy="28" r="2" fill="#1a1a1a" /><circle cx="13.4" cy="27.4" r=".7" fill="#fff" />
    <ellipse cx="38" cy="32" rx="10" ry="5" fill="#a87a50" opacity=".6" />
    </g>
  {:else if name === 'schildkroete'}
    <ellipse cx="46" cy="53" rx="38" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <ellipse class="bein a" cx="26" cy="46" rx="6" ry="6" fill="#8ab84a" /><ellipse class="bein b" cx="66" cy="46" rx="6" ry="6" fill="#8ab84a" />
    <path d="M78 40 L88 44 L78 46 Z" fill="#8ab84a" />
    <ellipse cx="14" cy="34" rx="10" ry="8" fill="#9ac85a" /><circle cx="10" cy="31" r="1.8" fill="#1a1a1a" /><path d="M5 37 q3 2 6 0" stroke="#4a7a2a" stroke-width="1.2" fill="none" />
    <path d="M18 44 C18 16 40 8 52 8 C66 8 82 20 80 44 Z" fill="#3e8a3a" />
    <path d="M60 10 C76 16 82 30 80 44 L66 44 C70 30 68 18 60 10 Z" fill="#2c6a2a" />
    <path d="M36 22 l8 -6 l10 0 l6 8 l-6 8 l-12 0 Z M24 40 l6 -10 l8 2 l2 12 Z M64 36 l4 -10 l8 6 l0 12 Z" fill="#6aaa4a" />
    <rect x="16" y="42" width="66" height="5" rx="2.5" fill="#d9c47a" />
    </g>
  {:else if name === 'pinguin'}
    <ellipse cx="25" cy="67" rx="16" ry="2.6" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path d="M14 64 l-4 3 h10 Z M30 64 l-2 3 h10 Z" fill="#f08a2a" />
    <ellipse cx="25" cy="40" rx="17" ry="25" fill="#2a2e3a" />
    <ellipse cx="22" cy="44" rx="11" ry="19" fill="#fffaf2" />
    <path d="M38 30 C46 40 44 52 38 56 C40 46 40 38 38 30 Z" fill="#1a1e28" />
    <path class="teil flosse" style="transform-origin: 8px 32px" d="M8 32 C2 40 4 48 8 50 Z" fill="#1a1e28" />
    <circle cx="16" cy="22" r="2.2" fill="#fff" /><circle cx="15.6" cy="22" r="1.2" fill="#1a1a1a" />
    <path d="M10 26 L2 28 L10 30 Z" fill="#f08a2a" />
    <ellipse cx="14" cy="30" rx="2.6" ry="1.6" fill="#f2a08a" opacity=".6" />
    </g>
  {:else if name === 'elefant'}
    <ellipse cx="54" cy="75" rx="42" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <rect class="bein a" x="28" y="50" width="12" height="24" rx="5" fill="#8a94a4" /><rect class="bein b" x="68" y="50" width="12" height="24" rx="5" fill="#8a94a4" />
    <ellipse cx="60" cy="42" rx="34" ry="24" fill="#a3adbd" />
    <path d="M80 22 C98 30 98 56 80 64 C88 54 88 34 80 22 Z" fill="#8a94a4" />
    <path d="M94 38 q8 4 6 14" stroke="#8a94a4" stroke-width="3" fill="none" stroke-linecap="round" />
    <circle cx="26" cy="34" r="16" fill="#a3adbd" />
    <path class="teil ruessel" style="transform-origin: 17px 40px" d="M14 38 C8 48 6 60 12 68 C14 70 18 68 16 64 C12 58 16 50 20 44 Z" fill="#a3adbd" />
    <g class="teil ohrwedeln" style="transform-origin: 30px 34px"><ellipse cx="36" cy="34" rx="12" ry="16" fill="#8a94a4" /><ellipse cx="36" cy="34" rx="8" ry="11" fill="#e8b4b4" opacity=".6" /></g>
    <circle cx="20" cy="30" r="2.2" fill="#1a1a1a" /><circle cx="19.4" cy="29.4" r=".7" fill="#fff" />
    <path d="M18 44 l-5 6" stroke="#fffaf2" stroke-width="3" stroke-linecap="round" />
    </g>
  {:else if name === 'giraffe'}
    <ellipse cx="40" cy="107" rx="26" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <rect class="bein a" x="26" y="74" width="6" height="32" rx="3" fill="#e0a848" /><rect class="bein b" x="50" y="74" width="6" height="32" rx="3" fill="#e0a848" />
    <ellipse cx="42" cy="70" rx="22" ry="14" fill="#f2c25a" />
    <path d="M28 64 C24 46 20 30 16 18 L26 16 C30 30 34 46 38 62 Z" fill="#f2c25a" />
    {#each [[36, 68, 5], [48, 64, 4], [52, 74, 4], [30, 74, 3.6], [24, 40, 3.4], [22, 28, 3], [28, 54, 3.4]] as [x, y, r], i (i)}<circle cx={x} cy={y} r={r} fill="#b8702a" />{/each}
    <path d="M56 60 C64 66 64 76 54 82 C58 74 58 66 56 60 Z" fill="#d9a43a" />
    <ellipse cx="16" cy="16" rx="11" ry="7" fill="#f2c25a" transform="rotate(-20 16 16)" />
    <path d="M18 8 v-6 M24 9 v-6" stroke="#b8702a" stroke-width="2.4" stroke-linecap="round" /><circle cx="18" cy="2" r="2" fill="#7a4a1a" /><circle cx="24" cy="3" r="2" fill="#7a4a1a" />
    <circle cx="14" cy="13" r="1.8" fill="#1a1a1a" /><ellipse cx="7" cy="19" rx="4" ry="3" fill="#e8b46a" />
    <path d="M28 18 C34 30 36 46 40 62" stroke="#b8702a" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-dasharray="3 3" />
    </g>
  {:else if name === 'affe'}
    <ellipse cx="30" cy="67" rx="20" ry="2.6" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path class="schwanz" d="M44 54 C60 54 62 36 52 32 C46 30 44 38 50 40" stroke="#7a4a2a" stroke-width="4" fill="none" stroke-linecap="round" />
    <ellipse class="bein a" cx="22" cy="60" rx="5" ry="7" fill="#7a4a2a" /><ellipse class="bein b" cx="38" cy="60" rx="5" ry="7" fill="#7a4a2a" />
    <ellipse cx="30" cy="44" rx="15" ry="16" fill="#8a5632" /><ellipse cx="28" cy="48" rx="9" ry="10" fill="#e8c49a" />
    <circle cx="10" cy="20" r="6" fill="#8a5632" /><circle cx="10" cy="20" r="3.4" fill="#e8b48a" />
    <circle cx="40" cy="20" r="6" fill="#8a5632" /><circle cx="40" cy="20" r="3.4" fill="#e8b48a" />
    <circle cx="25" cy="22" r="14" fill="#8a5632" />
    <path d="M14 22 C14 14 24 14 25 20 C26 14 36 14 36 22 C36 32 30 34 25 34 C20 34 14 32 14 22 Z" fill="#e8c49a" />
    <circle cx="20" cy="21" r="2" fill="#1a1a1a" /><circle cx="30" cy="21" r="2" fill="#1a1a1a" />
    <path d="M20 29 q5 4 10 0" stroke="#7a4a2a" stroke-width="1.6" fill="none" stroke-linecap="round" />
    </g>
  {:else if name === 'loewe'}
    <ellipse cx="46" cy="67" rx="36" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path class="schwanz" d="M76 40 C88 40 90 26 84 22" stroke="#d9963a" stroke-width="3.4" fill="none" stroke-linecap="round" /><circle cx="84" cy="22" r="4" fill="#9a5a1e" />
    <rect class="bein a" x="30" y="46" width="9" height="20" rx="4" fill="#d9963a" /><rect class="bein b" x="62" y="46" width="9" height="20" rx="4" fill="#d9963a" />
    <ellipse cx="54" cy="42" rx="26" ry="15" fill="#eab04e" />
    <path d="M68 30 C82 36 80 52 68 56 C74 48 74 38 68 30 Z" fill="#d9963a" />
    {#each Array.from({ length: 12 }) as _, i (i)}<ellipse cx={24 + Math.cos(i * 0.52) * 15} cy={30 + Math.sin(i * 0.52) * 15} rx="8" ry="6" fill={i % 2 ? '#b8641e' : '#9a5a1e'} transform="rotate({i * 30} {24 + Math.cos(i * 0.52) * 15} {30 + Math.sin(i * 0.52) * 15})" />{/each}
    <circle cx="24" cy="30" r="13" fill="#eab04e" />
    <ellipse cx="17" cy="35" rx="7" ry="5" fill="#f6d39a" /><path d="M12 31 l4 2 l-4 2 Z" fill="#6a3a1a" />
    <circle cx="20" cy="26" r="2" fill="#1a1a1a" /><circle cx="19.4" cy="25.4" r=".7" fill="#fff" />
    </g>
  {:else if name === 'gespann'}
    <g class="k">
    <path d="M70 40 C100 44 130 44 162 46" stroke="#7a4a2a" stroke-width="1.6" fill="none" />
    {#each [0, 64] as dx (dx)}
      <g transform="translate({dx} 0)">
        <path d="M22 14 l-6 -10 M22 14 l-2 -12 M26 14 l4 -10 M26 14 l8 -8" stroke="#7a4a2a" stroke-width="2.2" stroke-linecap="round" />
        <path class="bein a" d="M30 44 l-6 14 M50 44 l-2 14" stroke="#6a3e22" stroke-width="3.4" stroke-linecap="round" />
        <path class="bein b" d="M36 44 l4 14 M56 44 l6 14" stroke="#6a3e22" stroke-width="3.4" stroke-linecap="round" />
        <ellipse cx="44" cy="38" rx="18" ry="9" fill="#a8703e" />
        <path d="M30 36 C26 28 24 22 22 18" stroke="#a8703e" stroke-width="7" stroke-linecap="round" />
        <ellipse cx="20" cy="18" rx="8" ry="6" fill="#a8703e" /><circle cx="13" cy="19" r={dx === 0 ? 3 : 2.4} fill={dx === 0 ? '#e8302a' : '#2a1a12'} />
        <circle cx="19" cy="15" r="1.4" fill="#1a1a1a" />
        <ellipse cx="44" cy="42" rx="12" ry="4" fill="#e8d4b4" opacity=".7" />
        <path d="M30 34 C36 40 52 40 58 34" stroke="#c8302a" stroke-width="2.6" fill="none" /><circle cx="44" cy="39" r="2" fill="#f2c23a" />
      </g>
    {/each}
    <path d="M160 58 C170 64 230 64 248 54" stroke="#c89a3a" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M160 30 L232 30 C244 30 248 42 240 52 L172 52 C164 52 160 44 160 30 Z" fill="#c8302a" />
    <path d="M200 30 L232 30 C244 30 248 42 240 52 L212 52 C224 46 222 36 200 30 Z" fill="#9a2018" />
    <path d="M164 34 L236 34" stroke="#f2c23a" stroke-width="2.4" />
    <path d="M226 30 C224 18 232 10 244 16 C246 22 242 30 238 30 Z" fill="#7a4a2a" />
    <circle cx="190" cy="14" r="9" fill="#f0c8a0" /><path d="M180 12 C180 0 200 -2 202 10 Z" fill="#d6302a" /><circle cx="203" cy="10" r="3" fill="#fff" />
    <path d="M182 18 C184 30 196 30 198 18 Z" fill="#fffaf2" />
    <path d="M178 28 C178 22 202 22 202 28 L202 32 L178 32 Z" fill="#d6302a" />
    <circle cx="187" cy="13" r="1.4" fill="#1a1a1a" />
    </g>
  {:else if name === 'schmetterling'}
    <g class="k">
    <g class="teil flattern-x" style="transform-origin: 30px 25px">
      <path d="M29 22 C20 4 4 2 3 14 C2 24 16 28 29 24 Z" fill="#ff8a2a" />
      <path d="M29 24 C18 26 8 34 12 44 C18 50 26 40 29 28 Z" fill="#ffb02e" />
      <path d="M31 22 C40 4 56 2 57 14 C58 24 44 28 31 24 Z" fill="#e8702a" />
      <path d="M31 24 C42 26 52 34 48 44 C42 50 34 40 31 28 Z" fill="#f29a2a" />
      <circle cx="14" cy="13" r="4" fill="#fff" opacity=".8" /><circle cx="46" cy="13" r="4" fill="#fff" opacity=".8" />
      <circle cx="17" cy="38" r="3" fill="#7a3a1a" /><circle cx="43" cy="38" r="3" fill="#7a3a1a" />
    </g>
    <ellipse cx="30" cy="27" rx="3" ry="13" fill="#4a2e22" />
    <circle cx="30" cy="13" r="3.6" fill="#4a2e22" />
    <path d="M29 10 q-4 -7 -8 -7 M31 10 q4 -7 8 -7" stroke="#4a2e22" stroke-width="1.4" fill="none" stroke-linecap="round" />
    </g>
  {:else if name === 'biene'}
    <g class="k">
    <path class="fluegel" d="M26 16 C20 0 34 -2 34 12 Z" fill="#dff3ff" opacity=".85" />
    <path class="fluegel" d="M32 16 C32 2 46 2 40 16 Z" fill="#cbeaff" opacity=".85" />
    <path d="M46 26 L54 28 L46 31 Z" fill="#3a2a1a" />
    <ellipse cx="32" cy="27" rx="16" ry="12" fill="#ffd23a" />
    <path d="M28 16 C26 22 26 32 28 38 L34 38 C32 32 32 22 34 16 Z M40 18 C38 24 38 31 40 36 L44 34 C43 30 43 24 44 20 Z" fill="#3a2a1a" />
    <path d="M38 18 C46 22 48 32 40 37 C44 30 44 24 38 18 Z" fill="#e0a820" opacity=".5" />
    <circle cx="14" cy="26" r="10" fill="#3a2a1a" />
    <circle cx="10" cy="24" r="2.6" fill="#fff" /><circle cx="9.4" cy="24" r="1.3" fill="#1a1a1a" />
    <path d="M8 30 q3 2 6 0" stroke="#ffd23a" stroke-width="1.4" fill="none" stroke-linecap="round" />
    <path d="M12 17 q-3 -8 -8 -8 M16 17 q0 -8 4 -10" stroke="#3a2a1a" stroke-width="1.6" fill="none" stroke-linecap="round" />
    </g>
  {:else if name === 'eiswagen'}
    <ellipse cx="78" cy="87" rx="70" ry="3" fill={SCHATTEN} opacity=".18" />
    <g class="k">
    <path d="M16 36 C16 26 22 22 32 22 L134 22 C142 22 146 28 146 36 L146 72 L10 72 L10 50 Z" fill="#fff0f4" />
    <path d="M100 22 L134 22 C142 22 146 28 146 36 L146 72 L100 72 Z" fill="#f2d8e2" />
    <path d="M10 60 L146 60 L146 72 L10 72 Z" fill="#ff8fb1" />
    <path d="M16 36 L40 36 L40 52 L12 52 Z" fill="#bfe3ff" /><path d="M18 38 L26 38 L18 48 Z" fill="#fff" opacity=".6" />
    <rect x="52" y="30" width="70" height="26" rx="4" fill="#7fd3ff" />
    {#each [0, 1, 2, 3, 4, 5, 6] as i (i)}<path d="M{50 + i * 11} 26 h11 v6 a5.5 5.5 0 0 1 -11 0 Z" fill={i % 2 ? '#fff' : '#ff5d8f'} />{/each}
    <path d="M86 -2 L80 20 L92 20 Z" fill="#e8b46a" /><circle cx="82" cy="-6" r="8" fill="#ff8fb1" /><circle cx="90" cy="-8" r="8" fill="#fff4c2" /><circle cx="86" cy="-16" r="7" fill="#9be37a" />
    <g transform="translate(36 74)"><g class="rad"><circle r="13" fill="#3a3030" /><circle r="5" fill="#d8d8d8" /><path d="M0 -5 V5 M-5 0 H5" stroke="#9a9a9a" stroke-width="1.6" /></g></g>
    <g transform="translate(122 74)"><g class="rad"><circle r="13" fill="#3a3030" /><circle r="5" fill="#d8d8d8" /><path d="M0 -5 V5 M-5 0 H5" stroke="#9a9a9a" stroke-width="1.6" /></g></g>
    <circle cx="10" cy="58" r="4" fill="#ffd84a" />
    </g>
  {:else if name === 'hase'}
    <ellipse cx="44" cy="66" rx="30" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <ellipse class="bein a" cx="26" cy="62" rx="8" ry="5" fill="#b8a898" /><ellipse class="bein b" cx="56" cy="62" rx="12" ry="6" fill="#a89888" />
    <ellipse cx="46" cy="46" rx="24" ry="18" fill="#c8b8a8" />
    <path d="M58 32 C72 40 70 58 56 64 C64 54 64 42 58 32 Z" fill="#a89888" />
    <circle cx="70" cy="42" r="7" fill="#fffaf2" />
    <ellipse cx="44" cy="54" rx="12" ry="8" fill="#f2e8dc" />
    <g class="teil zucken" style="transform-origin: 26px 24px">
      <ellipse cx="22" cy="10" rx="5.4" ry="15" fill="#c8b8a8" transform="rotate(-14 22 10)" /><ellipse cx="22" cy="11" rx="2.6" ry="11" fill="#f2b8b8" transform="rotate(-14 22 11)" />
      <ellipse cx="32" cy="9" rx="5.4" ry="15" fill="#b8a898" transform="rotate(10 32 9)" />
    </g>
    <circle cx="22" cy="34" r="13" fill="#c8b8a8" />
    <circle cx="16" cy="31" r="2.6" fill="#1a1a1a" /><circle cx="15.4" cy="30.4" r=".9" fill="#fff" />
    <ellipse cx="10" cy="37" rx="3" ry="2.4" fill="#f28aa0" />
    <ellipse cx="18" cy="40" rx="3.6" ry="2.2" fill="#f2a08a" opacity=".6" />
    </g>
  {:else if name === 'fuchs'}
    <ellipse cx="50" cy="61" rx="38" ry="3" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path class="schwanz" style="transform-origin: 72px 34px" d="M72 34 C88 24 98 34 94 46 C90 54 80 50 74 44 Z" fill="#e8702a" />
    <path d="M90 36 C96 40 96 48 92 50 C88 48 88 42 90 36 Z" fill="#fffaf2" />
    <path class="bein a" d="M30 44 l-2 16 M62 44 l2 16" stroke="#3a2418" stroke-width="5" stroke-linecap="round" />
    <path class="bein b" d="M38 44 l3 16 M70 42 l-2 16" stroke="#4a2e20" stroke-width="5" stroke-linecap="round" />
    <ellipse cx="50" cy="36" rx="26" ry="13" fill="#f07a2e" />
    <path d="M60 24 C76 28 78 44 64 48 C70 40 68 32 60 24 Z" fill="#c8561a" />
    <path d="M26 36 C30 46 44 50 52 46 C44 44 34 40 30 30 Z" fill="#fffaf2" />
    <path d="M30 18 L18 4 L16 20 Z M38 18 L34 2 L26 16 Z" fill="#e8702a" /><path d="M28 16 L19 8 L18 18 Z" fill="#3a2418" />
    <path d="M36 22 C36 14 26 12 20 16 C14 20 6 24 2 30 C8 34 20 34 30 32 C36 30 38 26 36 22 Z" fill="#f07a2e" />
    <path d="M2 30 C8 34 20 34 30 32 C24 30 16 30 10 28 Z" fill="#fffaf2" />
    <circle cx="3" cy="30" r="2.6" fill="#1a1a1a" />
    <path d="M18 21 q3 -3 6 0" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round" />
    </g>
  {:else if name === 'marienkaefer'}
    <ellipse cx="24" cy="31" rx="16" ry="2" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path class="bein a" d="M14 24 l-4 6 M24 26 l0 6 M32 24 l4 6" stroke="#2a2a2a" stroke-width="2" stroke-linecap="round" />
    <circle cx="9" cy="17" r="7" fill="#2a2a2a" /><circle cx="6" cy="15" r="1.6" fill="#fff" />
    <path d="M6 10 q-3 -5 -6 -5 M10 10 q0 -5 3 -7" stroke="#2a2a2a" stroke-width="1.4" fill="none" stroke-linecap="round" />
    <path d="M12 18 C12 4 40 4 40 18 C40 26 12 26 12 18 Z" fill="#e8302a" />
    <path d="M30 6 C40 10 42 22 34 25 C38 18 36 10 30 6 Z" fill="#b8201a" />
    <path d="M26 5 V25" stroke="#2a2a2a" stroke-width="1.6" />
    <circle cx="19" cy="12" r="3" fill="#2a2a2a" /><circle cx="33" cy="12" r="3" fill="#2a2a2a" /><circle cx="20" cy="20" r="2.4" fill="#2a2a2a" /><circle cx="33" cy="20" r="2.4" fill="#2a2a2a" />
    <ellipse cx="18" cy="9" rx="3" ry="1.6" fill="#fff" opacity=".45" />
    </g>
  {:else if name === 'schlitten'}
    <ellipse cx="56" cy="67" rx="50" ry="3" fill={SCHATTEN} opacity=".18" />
    <g class="k">
    <path d="M6 60 C2 60 2 54 8 54 L96 54 C104 54 108 60 104 66" stroke="#c0392b" stroke-width="4" fill="none" stroke-linecap="round" />
    <path d="M20 54 V46 M84 54 V46" stroke="#8a5a36" stroke-width="4" />
    <rect x="12" y="38" width="84" height="10" rx="4" fill="#b8783a" /><rect x="12" y="38" width="84" height="4" rx="2" fill="#d09050" />
    <path d="M70 38 C70 24 64 18 56 18 L44 18 C38 18 34 24 34 38 Z" fill="#3b8fd6" />
    <path d="M60 18 C68 22 70 30 70 38 L62 38 C62 30 60 24 56 20 Z" fill="#2a6ab0" />
    <path d="M36 34 L22 36" stroke="#3b8fd6" stroke-width="6" stroke-linecap="round" /><circle cx="20" cy="36" r="4" fill="#e8302a" />
    <circle cx="50" cy="10" r="10" fill="#f0c8a0" />
    <path d="M39 8 C40 -2 60 -2 61 8 Z" fill="#e8302a" /><circle cx="50" cy="-3" r="4" fill="#fff" />
    <path d="M40 18 C46 22 56 22 62 18 L62 22 C56 26 46 26 40 22 Z" fill="#ffd84a" />
    <circle cx="45" cy="10" r="1.6" fill="#1a1a1a" /><path d="M43 14 q3 2 6 0" stroke="#b05a3a" stroke-width="1.3" fill="none" stroke-linecap="round" />
    <ellipse cx="48" cy="13" rx="2.6" ry="1.6" fill="#f28aa0" opacity=".7" />
    </g>
  {:else if name === 'tulpe'}
    <g class="k">
    <path d="M15 54 C14 44 16 34 15 24" stroke="#4c9a3a" stroke-width="3" fill="none" />
    <path d="M15 44 C6 40 4 30 6 24 C12 28 15 36 15 44 Z" fill="#5ea844" />
    <path d="M5 8 L5 20 C5 28 25 28 25 20 L25 8 L20 13 L15 4 L10 13 Z" fill="#e8302a" />
    <path d="M18 7 L20 13 L25 8 L25 20 C25 26 20 28 15 27 C20 24 21 16 18 7 Z" fill="#b8201a" />
    <path d="M9 12 C8 16 8 20 10 22" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".45" />
    </g>
  {:else if name === 'gaensebluemchen'}
    <g class="k">
    <path d="M20 48 C19 40 21 32 20 22" stroke="#4c9a3a" stroke-width="3" fill="none" />
    <path d="M20 40 C12 38 8 32 9 28 C15 30 19 34 20 40 Z" fill="#5ea844" />
    {#each Array.from({ length: 12 }) as _, i (i)}<ellipse cx="20" cy="9" rx="3.2" ry="8" fill={i % 2 ? '#fff' : '#f6eef6'} transform="rotate({i * 30} 20 17)" />{/each}
    <circle cx="20" cy="17" r="5.6" fill="#ffc21a" /><circle cx="18.4" cy="15.4" r="2" fill="#ffe27a" />
    </g>
  {:else if name === 'kirschbluete'}
    <g class="k">
    {#each Array.from({ length: 5 }) as _, i (i)}<path d="M20 20 C12 14 12 4 18 3 L20 6 L22 3 C28 4 28 14 20 20 Z" fill={i % 2 ? '#ffc2d8' : '#ffafcc'} transform="rotate({i * 72} 20 20)" />{/each}
    <circle cx="20" cy="20" r="4" fill="#ff7aa8" />
    {#each Array.from({ length: 5 }) as _, i (i)}<circle cx={20 + Math.cos(i * 1.26) * 6} cy={20 + Math.sin(i * 1.26) * 6} r="1.2" fill="#ffd84a" />{/each}
    </g>
  {:else if name === 'sonnenblume'}
    <g class="k">
    <path d="M25 78 C24 60 26 44 25 30" stroke="#4c9a3a" stroke-width="4" fill="none" />
    <path d="M25 60 C12 58 8 48 10 42 C18 46 24 52 25 60 Z M25 50 C38 48 42 38 40 32 C32 36 26 42 25 50 Z" fill="#5ea844" />
    {#each Array.from({ length: 14 }) as _, i (i)}<ellipse cx="25" cy="7" rx="4.6" ry="10" fill={i % 2 ? '#ffc21a' : '#ffd84a'} transform="rotate({i * (360 / 14)} 25 20)" />{/each}
    <circle cx="25" cy="20" r="10" fill="#7a4a1e" /><circle cx="22" cy="17" r="4" fill="#9a6a2e" />
    </g>
  {:else if name === 'nest'}
    <g class="k">
    <path d="M4 18 C4 36 66 36 66 18 C56 22 14 22 4 18 Z" fill="#9a6a3a" />
    <path d="M6 18 C10 32 60 32 64 18" stroke="#7a4e2a" stroke-width="2" fill="none" />
    <path d="M8 22 l10 6 M20 30 l12 -6 M34 30 l12 -6 M48 28 l12 -6 M14 26 l14 0 M40 26 l14 2" stroke="#c08a50" stroke-width="2" stroke-linecap="round" />
    <path d="M2 18 C12 12 58 12 68 18" stroke="#b8804a" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>
  {:else if name === 'ei'}
    <g class="k">
    <path d="M13 2 C4 2 1 16 2 22 C3 28 8 31 13 31 C18 31 23 28 24 22 C25 16 22 2 13 2 Z" fill="#9fd8ff" />
    <path d="M2.4 16 C8 13 18 19 24 15 L24.4 20 C18 24 8 18 2.2 21 Z" fill="#ffd84a" />
    <path d="M19 5 C24 10 26 22 20 29 C22 22 22 12 19 5 Z" fill="#6fb8e6" opacity=".6" />
    <ellipse cx="9" cy="9" rx="2" ry="3.6" fill="#fff" opacity=".6" />
    </g>
  {:else if name === 'kueken'}
    <ellipse cx="20" cy="39" rx="14" ry="2" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path class="bein a" d="M18 34 l-2 5 M24 34 l1 5" stroke="#f08a2a" stroke-width="2" stroke-linecap="round" />
    <ellipse cx="22" cy="25" rx="14" ry="11" fill="#ffd84a" />
    <path d="M30 18 C40 22 38 34 28 35 C34 30 34 24 30 18 Z" fill="#f2b81e" />
    <circle cx="14" cy="14" r="9" fill="#ffe25a" />
    <path class="teil zucken" style="transform-origin: 26px 24px" d="M24 22 C32 18 36 24 32 30 C30 28 26 26 24 22 Z" fill="#f2c81e" />
    <path d="M6 14 L0 16 L6 18 Z" fill="#f08a2a" />
    <circle cx="11" cy="12" r="1.8" fill="#1a1a1a" /><circle cx="10.5" cy="11.5" r=".6" fill="#fff" />
    <path d="M14 5 q1 -4 4 -4 M14 5 q-2 -4 -5 -3" stroke="#f2b81e" stroke-width="1.6" fill="none" stroke-linecap="round" />
    </g>
  {:else if name === 'frosch'}
    <ellipse cx="30" cy="48" rx="26" ry="2.6" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <ellipse cx="18" cy="44" rx="12" ry="5" fill="#5aa83a" /><ellipse cx="44" cy="44" rx="12" ry="5" fill="#4c9a30" />
    <ellipse cx="30" cy="32" rx="22" ry="14" fill="#6cc24a" />
    <path d="M40 20 C54 26 54 40 42 44 C48 36 46 28 40 20 Z" fill="#4c9a30" />
    <ellipse cx="30" cy="38" rx="14" ry="7" fill="#c8ec9a" />
    <circle cx="18" cy="16" r="9" fill="#6cc24a" /><circle cx="40" cy="16" r="9" fill="#6cc24a" />
    <circle cx="18" cy="15" r="5.6" fill="#fff" /><circle cx="40" cy="15" r="5.6" fill="#fff" />
    <circle cx="17" cy="16" r="3" fill="#1a1a1a" /><circle cx="39" cy="16" r="3" fill="#1a1a1a" />
    <path d="M18 30 Q29 38 40 30" stroke="#2f6a1e" stroke-width="2.4" fill="none" stroke-linecap="round" />
    <ellipse cx="14" cy="30" rx="3" ry="2" fill="#f2a08a" opacity=".6" /><ellipse cx="44" cy="30" rx="3" ry="2" fill="#f2a08a" opacity=".6" />
    </g>
  {:else if name === 'loewenzahn'}
    <g class="k">
    <path d="M17 54 C16 44 18 34 17 22" stroke="#4c9a3a" stroke-width="3" fill="none" />
    <path d="M17 46 C8 46 2 40 2 34 C8 36 12 38 17 46 Z M17 40 C26 40 32 34 32 28 C26 30 20 34 17 40 Z" fill="#5ea844" />
    {#each Array.from({ length: 18 }) as _, i (i)}<ellipse cx="17" cy="5" rx="2.4" ry="7" fill={i % 2 ? '#ffd23a' : '#ffc21a'} transform="rotate({i * 20} 17 13)" />{/each}
    <circle cx="17" cy="13" r="5" fill="#ffb81a" />
    </g>
  {:else if name === 'ente'}
    <ellipse cx="38" cy="52" rx="28" ry="2.4" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <ellipse class="bein a" cx="34" cy="50" rx="6" ry="3" fill="#f08a2a" /><ellipse class="bein b" cx="44" cy="50" rx="6" ry="3" fill="#f08a2a" />
    <path d="M24 32 C24 22 48 18 62 24 L68 22 L64 32 C62 44 50 48 38 48 C28 48 24 42 24 32 Z" fill="#c8c0b4" />
    <path d="M52 22 C62 26 64 38 56 44 C58 36 56 28 52 22 Z" fill="#a8a094" />
    <path d="M24 32 C24 42 30 46 38 46 C34 40 32 34 30 30 Z" fill="#8a5a3a" />
    <path d="M40 30 C46 26 56 28 58 34 C52 34 46 34 40 30 Z" fill="#5a7ab0" />
    <circle cx="18" cy="18" r="11" fill="#2f7a4a" />
    <path d="M22 26 C24 30 30 32 30 32 L22 32 Z" fill="#fff" />
    <path d="M8 18 L-2 21 C-2 24 4 25 9 23 Z" fill="#ffc21a" />
    <circle cx="15" cy="15" r="2.2" fill="#1a1a1a" /><circle cx="14.4" cy="14.4" r=".7" fill="#fff" />
    <ellipse cx="22" cy="12" rx="4" ry="2" fill="#4aa86a" opacity=".7" />
    </g>
  {:else if name === 'hemd'}
    <g class="k">
    <path d="M10 4 L18 2 Q20 6 22 2 L30 4 L38 12 L32 18 L30 15 L30 38 L10 38 L10 15 L8 18 L2 12 Z" fill="#3b8fd6" />
    <path d="M26 4 L30 4 L38 12 L32 18 L30 15 L30 38 L24 38 Z" fill="#2a6ab0" opacity=".6" />
    <path d="M14 10 h4 M14 16 h4" stroke="#fff" stroke-width="2" stroke-linecap="round" />
    </g>
  {:else if name === 'hose'}
    <g class="k">
    <path d="M8 2 L32 2 L34 38 L24 38 L20 14 L16 38 L6 38 Z" fill="#e8452b" />
    <path d="M24 2 L32 2 L34 38 L24 38 L22 18 Z" fill="#b8301c" opacity=".55" />
    <rect x="8" y="2" width="24" height="5" fill="#ffd84a" />
    </g>
  {:else if name === 'socke'}
    <g class="k">
    <path d="M14 2 L26 2 L26 24 C26 30 22 36 14 36 L6 36 C2 36 2 28 6 28 L14 26 Z" fill="#7fd88a" />
    <path d="M14 2 L26 2 L26 6 L14 6 Z M14 12 L26 12 L26 16 L14 16 Z" fill="#fff" />
    <path d="M22 24 C24 30 20 34 14 36 L18 36 C24 34 26 30 26 24 Z" fill="#4caf5a" opacity=".6" />
    </g>
  {:else if name === 'kleid'}
    <g class="k">
    <path d="M14 2 L26 2 L26 10 L36 38 L4 38 L14 10 Z" fill="#ff8fb1" />
    <path d="M20 10 L26 10 L36 38 L24 38 Z" fill="#e86a94" opacity=".55" />
    {#each [[12, 26], [20, 30], [28, 26], [16, 34], [26, 34]] as [x, y], i (i)}<circle cx={x} cy={y} r="1.8" fill="#fff" />{/each}
    <path d="M14 2 q6 6 12 0" stroke="#fff" stroke-width="2" fill="none" />
    </g>
  {:else if name === 'raupe'}
    <ellipse cx="38" cy="32" rx="30" ry="2" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    {#each [58, 48, 38, 28] as x, i (i)}<circle class="teil buckel" style="transform-origin: {x}px 28px; animation-delay: {i * 0.12}s" cx={x} cy="20" r="9" fill={i % 2 ? '#7fd36a' : '#6cc24a'} />{/each}
    {#each [58, 48, 38, 28] as x, i (i)}<path d="M{x - 2} 29 l-1 4 M{x + 2} 29 l1 4" stroke="#3a7a2a" stroke-width="1.6" stroke-linecap="round" />{/each}
    <circle cx="16" cy="18" r="11" fill="#8fe07a" />
    <circle cx="12" cy="15" r="2.6" fill="#fff" /><circle cx="11.4" cy="15.4" r="1.4" fill="#1a1a1a" />
    <path d="M8 22 q4 3 8 0" stroke="#2f6a1e" stroke-width="1.6" fill="none" stroke-linecap="round" />
    <path d="M14 8 q-3 -6 -7 -6 M18 8 q2 -6 6 -6" stroke="#3a7a2a" stroke-width="1.6" fill="none" stroke-linecap="round" /><circle cx="7" cy="2" r="2" fill="#e8302a" /><circle cx="24" cy="2" r="2" fill="#e8302a" />
    </g>
  {:else if name === 'segelboot'}
    <g class="k">
    <path d="M38 6 L38 60" stroke="#6e4126" stroke-width="3" />
    <path d="M38 8 L70 52 L38 52 Z" fill="#fffaf2" /><path d="M54 30 L70 52 L54 52 Z" fill="#e2dccf" />
    <path d="M36 14 L10 52 L36 52 Z" fill="#e8452b" /><path d="M36 30 L22 52 L36 52 Z" fill="#b8301c" />
    <path d="M38 6 L50 10 L38 14 Z" fill="#ffd84a" />
    <path d="M4 58 L76 58 L66 72 L14 72 Z" fill="#3b7fd6" /><path d="M48 58 L76 58 L66 72 L46 72 Z" fill="#2a62b0" />
    <path d="M4 58 L76 58" stroke="#fff" stroke-width="3" />
    <path d="M0 76 q10 -5 20 0 t20 0 t20 0 t20 0" stroke="#7fc8ff" stroke-width="3" fill="none" stroke-linecap="round" />
    </g>
  {:else if name === 'schlittschuh'}
    <g class="k">
    <path d="M14 4 L34 4 L36 26 C46 28 54 30 54 36 L54 40 L10 40 L10 26 Z" fill="#fffaf2" />
    <path d="M30 4 L34 4 L36 26 C46 28 54 30 54 36 L54 40 L40 40 C46 34 42 30 30 28 Z" fill="#e2dccf" />
    <path d="M18 10 l10 0 M18 16 l10 0 M18 22 l12 0" stroke="#e8452b" stroke-width="2.4" stroke-linecap="round" />
    <path d="M8 40 L56 40" stroke="#5a5a6a" stroke-width="3" />
    <path d="M14 42 L14 46 M48 42 L48 46 M4 48 C4 44 8 46 10 46 L58 46 C60 46 60 50 56 50 L8 50 C5 50 4 49 4 48 Z" stroke="#b8c2d0" stroke-width="2" fill="#d8e0ea" />
    </g>
  {:else if name === 'regenbogen'}
    <g class="k">
    {#each ['#e8452b', '#f08a2a', '#ffd23a', '#6cc24a', '#3b8fd6', '#8462e0'] as f, i (i)}
      <path d="M{10 + i * 6} 50 A{40 - i * 6} {40 - i * 6} 0 0 1 {90 - i * 6} 50" stroke={f} stroke-width="6.4" fill="none" />
    {/each}
    <g fill="#fff"><circle cx="12" cy="50" r="9" /><circle cx="22" cy="52" r="7" /><circle cx="4" cy="54" r="5" /><circle cx="88" cy="50" r="9" /><circle cx="78" cy="52" r="7" /><circle cx="96" cy="54" r="5" /></g>
    </g>
  {:else if name === 'spross'}
    <g class="k">
    <ellipse cx="20" cy="44" rx="18" ry="6" fill="#8a5a36" /><ellipse cx="16" cy="42" rx="8" ry="2" fill="#a87a50" />
    <path d="M20 42 C20 34 21 28 20 22" stroke="#5ea844" stroke-width="3" fill="none" />
    <path d="M20 24 C10 24 4 16 4 10 C12 10 18 16 20 24 Z" fill="#7fc25a" />
    <path d="M20 22 C28 20 36 12 36 6 C28 6 22 12 20 22 Z" fill="#5ea844" />
    <path d="M8 12 C12 14 16 18 18 22" stroke="#4c9a3a" stroke-width="1.2" fill="none" />
    </g>
  {:else if name === 'sonne'}
    <g class="k">
    {#each Array.from({ length: 10 }) as _, i (i)}<ellipse cx="30" cy="7" rx="4.6" ry="7" fill={i % 2 ? '#ffad2e' : '#ff8c1a'} transform="rotate({i * 36} 30 30)" />{/each}
    <circle cx="30" cy="30" r="17" fill="#ffd43a" />
    <ellipse cx="24" cy="22" rx="5" ry="3" fill="#fff6c8" opacity=".7" transform="rotate(-30 24 22)" />
    <circle cx="24" cy="29" r="2.2" fill="#3a2418" /><circle cx="36" cy="29" r="2.2" fill="#3a2418" />
    <path d="M23 35 Q30 42 37 35" stroke="#3a2418" stroke-width="2.2" fill="none" stroke-linecap="round" />
    <ellipse cx="20" cy="34" rx="3" ry="2" fill="#ff8a7a" opacity=".7" /><ellipse cx="40" cy="34" rx="3" ry="2" fill="#ff8a7a" opacity=".7" />
    </g>
  {:else if name === 'erdbeere'}
    <g class="k">
    <path d="M20 12 C8 10 2 18 6 28 C10 38 18 44 20 44 C22 44 30 38 34 28 C38 18 32 10 20 12 Z" fill="#e8302a" />
    <path d="M30 13 C38 20 34 34 24 42 C28 32 32 22 30 13 Z" fill="#b8201a" />
    {#each [[12, 20], [20, 18], [28, 20], [10, 28], [18, 27], [26, 28], [14, 35], [22, 35], [19, 41]] as [x, y], i (i)}<ellipse cx={x} cy={y} rx="1" ry="1.6" fill="#ffe27a" />{/each}
    <path d="M20 12 L10 8 L16 6 L14 1 L20 5 L26 1 L24 6 L30 8 Z" fill="#4caf50" />
    <ellipse cx="12" cy="18" rx="2.4" ry="4" fill="#fff" opacity=".3" />
    </g>
  {:else if name === 'schwimmring'}
    <g class="k">
    <circle cx="30" cy="30" r="26" fill="#e8302a" />
    {#each [0, 90, 180, 270] as w (w)}<path d="M30 4 A26 26 0 0 1 48.4 11.6 L40.6 19.4 A15 15 0 0 0 30 15 Z" fill="#fff" transform="rotate({w} 30 30)" />{/each}
    <circle cx="30" cy="30" r="13" fill="#7fc8ff" />
    <path d="M12 18 C16 12 22 8 28 7" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6" />
    </g>
  {:else if name === 'eimer'}
    <ellipse cx="28" cy="53" rx="22" ry="2.4" fill={SCHATTEN} opacity=".2" />
    <g class="k">
    <path d="M44 8 L52 2" stroke="#8a5a36" stroke-width="3" stroke-linecap="round" /><path d="M40 20 L46 4 C48 2 52 4 50 8 L46 22 Z" fill="#3b8fd6" />
    <path d="M10 22 C10 6 46 6 46 22" stroke="#e8452b" stroke-width="3" fill="none" />
    <path d="M6 22 L50 22 L44 52 L12 52 Z" fill="#ffd23a" />
    <path d="M38 22 L50 22 L44 52 L36 52 Z" fill="#e0a820" opacity=".6" />
    <path d="M6 22 L50 22 L49 27 L7 27 Z" fill="#f08a2a" />
    <path d="M18 34 l4 4 l4 -4 l4 4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7" />
    </g>
  {:else if name === 'eis'}
    <g class="k">
    <path d="M8 26 L18 62 L28 26 Z" fill="#e8b46a" />
    <path d="M10 30 L26 46 M14 28 L26 40 M26 30 L12 46 M22 28 L10 40" stroke="#c88a3a" stroke-width="1.4" />
    <circle cx="18" cy="22" r="11" fill="#ff8fb1" />
    <circle cx="18" cy="10" r="9" fill="#fff4c2" />
    <path d="M7 24 C10 30 14 26 18 30 C22 26 26 30 29 24" fill="#ff8fb1" />
    <circle cx="20" cy="1" r="3" fill="#e8302a" /><path d="M20 -2 q2 -4 6 -4" stroke="#4a8a2a" stroke-width="1.2" fill="none" />
    <ellipse cx="13" cy="7" rx="2.4" ry="1.6" fill="#fff" opacity=".7" />
    </g>
  {:else if name === 'melone'}
    <g class="k">
    <path d="M2 6 L58 6 C58 24 46 36 30 36 C14 36 2 24 2 6 Z" fill="#3f9b35" />
    <path d="M5 6 L55 6 C55 22 44 32 30 32 C16 32 5 22 5 6 Z" fill="#d8f0b8" />
    <path d="M8 6 L52 6 C52 20 42 29 30 29 C18 29 8 20 8 6 Z" fill="#ff5d6b" />
    <path d="M38 6 L52 6 C52 20 42 29 30 29 C40 22 42 14 38 6 Z" fill="#e8404e" />
    {#each [[18, 14], [30, 18], [42, 14], [24, 22], [36, 22]] as [x, y], i (i)}<ellipse cx={x} cy={y} rx="1.4" ry="2.4" fill="#2a1a1a" />{/each}
    </g>
  {:else if name === 'zelt'}
    <g class="k">
    <path d="M40 2 L40 8" stroke="#6e4126" stroke-width="2.4" /><path d="M40 2 L52 5 L40 8 Z" fill="#e8302a" />
    <path d="M40 8 L76 56 L4 56 Z" fill="#f08a2a" />
    <path d="M40 8 L76 56 L52 56 Z" fill="#c8661a" />
    <path d="M40 22 L30 56 L50 56 Z" fill="#7a3a1a" />
    <path d="M40 22 L36 56 L44 56 Z" fill="#ffd36a" opacity=".5" />
    <path d="M0 56 L80 56" stroke="#5ea844" stroke-width="3" stroke-linecap="round" />
    </g>
  {:else if name === 'schneemann'}
    <ellipse cx="26" cy="74" rx="22" ry="2.6" fill="#9fb8d6" opacity=".4" />
    <g class="k">
    <circle cx="25" cy="58" r="17" fill="#ffffff" /><path d="M34 44 C44 52 42 68 30 74 C36 64 38 54 34 44 Z" fill="#dfe9f5" />
    <circle cx="25" cy="32" r="12" fill="#ffffff" /><path d="M32 22 C38 28 38 38 31 43 C34 36 35 28 32 22 Z" fill="#dfe9f5" />
    <circle cx="25" cy="13" r="9" fill="#ffffff" />
    <path d="M23 13 L12 15 L23 16 Z" fill="#f08a24" />
    <circle cx="21" cy="10" r="1.4" fill="#2a2a2a" /><circle cx="28" cy="10" r="1.4" fill="#2a2a2a" />
    <circle cx="25" cy="30" r="1.6" fill="#2a2a2a" /><circle cx="25" cy="36" r="1.6" fill="#2a2a2a" /><circle cx="25" cy="56" r="1.6" fill="#2a2a2a" />
    <path d="M16 22 C21 25 29 25 34 22 L35 26 C29 28 21 28 16 26 Z" fill="#e8302a" /><path d="M30 25 l4 10 l-4 1 l-3 -10 Z" fill="#c8241e" />
    <path d="M14 32 L2 24 M36 32 L48 24" stroke="#6e4126" stroke-width="2.4" stroke-linecap="round" />
    <path d="M16 6 L34 6 L33 4 L31 -6 L19 -6 L17 4 Z" fill="#2a2a3a" /><rect x="19" y="0" width="12" height="2.6" fill="#e8302a" />
    </g>
  {:else if name === 'schneeflocke'}
    <g class="k">
    <g stroke="#9fd2ff" stroke-width="3.4" stroke-linecap="round" fill="none">
      {#each [0, 60, 120] as w (w)}<path d="M25 4 V46" transform="rotate({w} 25 25)" />{/each}
      {#each [0, 60, 120, 180, 240, 300] as w (w)}<path d="M25 10 l-5 -4 M25 10 l5 -4 M25 17 l-6 -4 M25 17 l6 -4" transform="rotate({w} 25 25)" />{/each}
    </g>
    <circle cx="25" cy="25" r="4" fill="#dff1ff" />
    </g>
  {:else if name === 'tannenbaum'}
    <g class="k">
    <rect x="25" y="66" width="10" height="12" fill="#7a4a2a" />
    <path d="M30 6 L56 68 L4 68 Z" fill="#2f7a46" />
    <path d="M30 6 L56 68 L36 68 Z" fill="#245e36" />
    <path d="M30 6 L48 44 L12 44 Z" fill="#3a8a52" />
    <path d="M12 44 Q30 52 48 44 M8 58 Q30 66 52 58" stroke="#ffd84a" stroke-width="2" fill="none" />
    {#each [[22, 36, '#e8302a'], [38, 40, '#3b8fd6'], [18, 56, '#ffd84a'], [32, 52, '#e8302a'], [44, 60, '#b07cff'], [28, 26, '#ffd84a']] as [x, y, f], i (i)}<circle class="teil glut" cx={x} cy={y} r="3.4" fill={String(f)} style="animation-delay: {i * 0.3}s" />{/each}
    <path d="M30 0 l2.4 5 l5.4 .6 l-4 3.6 l1.2 5.4 l-5 -2.8 l-5 2.8 l1.2 -5.4 l-4 -3.6 l5.4 -.6 Z" fill="#ffd23a" />
    </g>
  {:else if name === 'plaetzchen'}
    <g class="k">
    <circle cx="34" cy="32" r="14" fill="#d9a05a" /><circle cx="34" cy="32" r="10" fill="#e8b46a" />
    {#each [[30, 28], [38, 30], [33, 37]] as [x, y], i (i)}<circle cx={x} cy={y} r="2" fill="#6a3a1e" />{/each}
    <path d="M16 4 l4 9 l10 1 l-7 7 l2 10 l-9 -5 l-9 5 l2 -10 l-7 -7 l10 -1 Z" fill="#e8b46a" />
    <path d="M16 9 l2.6 6 l6.4 .6 l-4.6 4.4 l1.4 6.4 l-5.8 -3.2 l-5.8 3.2 l1.4 -6.4 l-4.6 -4.4 l6.4 -.6 Z" fill="#fff4f8" />
    <circle cx="16" cy="18" r="1.6" fill="#e8302a" />
    </g>
  {:else if name === 'handschuhe'}
    <g class="k">
    <g transform="rotate(-12 18 26)">
      <path d="M8 14 C8 4 26 4 26 14 L26 38 L8 38 Z" fill="#e8302a" /><path d="M8 20 C2 18 0 26 6 30 L8 30 Z" fill="#e8302a" />
      <rect x="6" y="36" width="22" height="9" rx="3" fill="#fffaf2" /><path d="M12 20 l4 4 l4 -4 l4 4" stroke="#fff" stroke-width="1.8" fill="none" opacity=".7" />
    </g>
    <g transform="rotate(12 42 26)">
      <path d="M34 14 C34 4 52 4 52 14 L52 38 L34 38 Z" fill="#3b8fd6" /><path d="M52 20 C58 18 60 26 54 30 L52 30 Z" fill="#3b8fd6" />
      <rect x="32" y="36" width="22" height="9" rx="3" fill="#fffaf2" /><path d="M38 20 l4 4 l4 -4 l4 4" stroke="#fff" stroke-width="1.8" fill="none" opacity=".7" />
    </g>
    </g>
  {:else if name === 'kerze'}
    <g class="k">
    <circle class="teil glut" cx="15" cy="12" r="12" fill="#ffd36a" opacity=".35" />
    <path class="teil flamme-k" style="transform-origin: 15px 22px" d="M15 2 C20 10 20 16 15 20 C10 16 10 10 15 2 Z" fill="#ffb02e" />
    <path d="M15 8 C17 12 17 15 15 17 C13 15 13 12 15 8 Z" fill="#fff4c2" />
    <path d="M15 20 V24" stroke="#3a2a1a" stroke-width="1.4" />
    <rect x="7" y="24" width="16" height="34" rx="3" fill="#fffaf2" /><rect x="17" y="24" width="6" height="34" rx="3" fill="#e2dccf" />
    <path d="M9 24 C9 30 13 30 13 26" stroke="#fffaf2" stroke-width="3" fill="none" />
    </g>
  {:else if name === 'kakao'}
    <g class="k">
    <path class="teil dampf" style="transform-origin: 20px 12px" d="M16 14 q-4 -6 0 -10 M26 14 q-4 -6 0 -10" stroke="#e8e2dc" stroke-width="2.6" fill="none" stroke-linecap="round" />
    <path d="M42 24 C54 24 54 40 40 40" stroke="#e8302a" stroke-width="5" fill="none" />
    <path d="M6 18 L44 18 L40 46 C40 48 38 50 36 50 L14 50 C12 50 10 48 10 46 Z" fill="#e8302a" />
    <path d="M32 18 L44 18 L40 46 C40 48 38 50 36 50 L30 50 C36 44 36 30 32 18 Z" fill="#b8201a" />
    <ellipse cx="25" cy="18" rx="19" ry="4" fill="#6a3a1e" /><ellipse cx="20" cy="17" rx="6" ry="2" fill="#fff" opacity=".7" />
    <path d="M16 30 l4 6 l4 -6 l4 6" stroke="#fff" stroke-width="2" fill="none" opacity=".7" />
    </g>
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
  .pedal {
    transform-box: view-box;
    transform-origin: 62px 78px;
    animation: rollen 1.6s linear infinite;
  }
  .propeller {
    transform-box: fill-box;
    transform-origin: center;
    animation: propeller 0.18s linear infinite alternate;
  }
  @keyframes propeller {
    from {
      transform: scaleY(1);
    }
    to {
      transform: scaleY(0.15);
    }
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
  [data-n='igel'] .k,
  [data-n='baer'] .k,
  [data-n='schildkroete'] .k,
  [data-n='loewe'] .k,
  [data-n='elefant'] .k,
  [data-n='affe'] .k,
  [data-n='schaf'] .k,
  [data-n='eichhoernchen'] .k,
  [data-n='kastanienmann'] .k,
  [data-n='gespann'] .k,
  [data-n='radler'] .k,
  [data-n='hase'] .k,
  [data-n='fuchs'] .k,
  [data-n='marienkaefer'] .k,
  [data-n='kueken'] .k {
    animation: gehen var(--d, 1s) ease-in-out infinite alternate;
  }
  [data-n='pinguin'] .k,
  [data-n='ente'] .k {
    animation: watscheln var(--d, 1s) ease-in-out infinite alternate;
  }
  [data-n='fliegenpilz'] .k,
  [data-n='steinpilz'] .k,
  [data-n='kastanie'] .k,
  [data-n='kuerbis'] .k,
  [data-n='korb'] .k,
  [data-n='stiefel'] .k,
  [data-n='ranzen'] .k,
  [data-n='giraffe'] .k,
  [data-n='eule'] .k,
  [data-n='hahn'] .k,
  [data-n='specht'] .k,
  [data-n='tulpe'] .k,
  [data-n='gaensebluemchen'] .k,
  [data-n='sonnenblume'] .k,
  [data-n='loewenzahn'] .k,
  [data-n='spross'] .k,
  [data-n='nest'] .k,
  [data-n='ei'] .k,
  [data-n='schneemann'] .k,
  [data-n='tannenbaum'] .k,
  [data-n='zelt'] .k,
  [data-n='eimer'] .k,
  [data-n='kakao'] .k,
  [data-n='kerze'] .k,
  [data-n='segelboot'] .k,
  [data-n='kirschbluete'] .k,
  [data-n='regenbogen'] .k {
    animation: wackeln var(--d, 1s) ease-in-out infinite alternate;
  }
  [data-n='apfel'] .k,
  [data-n='birne'] .k,
  [data-n='karotte'] .k,
  [data-n='traube'] .k,
  [data-n='nuss'] .k,
  [data-n='orange'] .k,
  [data-n='bonbon'] .k,
  [data-n='schokolade'] .k,
  [data-n='laterne'] .k,
  [data-n='drachen'] .k,
  [data-n='regenschirm'] .k,
  [data-n='blatt'] .k,
  [data-n='hemd'] .k,
  [data-n='hose'] .k,
  [data-n='socke'] .k,
  [data-n='kleid'] .k,
  [data-n='erdbeere'] .k,
  [data-n='eis'] .k,
  [data-n='plaetzchen'] .k,
  [data-n='handschuhe'] .k,
  [data-n='schwimmring'] .k,
  [data-n='schlittschuh'] .k,
  [data-n='melone'] .k {
    animation: baumeln var(--d, 1s) ease-in-out infinite alternate;
  }
  [data-n='herz'] .k,
  [data-n='sonne'] .k {
    animation: pochen var(--d, 1s) ease-in-out infinite alternate;
  }
  [data-n='note'] .k,
  [data-n='noten'] .k,
  [data-n='spinne'] .k,
  [data-n='frosch'] .k {
    animation: huepfen var(--d, 1s) ease-in-out infinite alternate;
  }
  [data-n='traktor'] .k,
  [data-n='eiswagen'] .k,
  [data-n='schlitten'] .k {
    animation: rattern var(--d, 1s) ease-in-out infinite alternate;
  }
  [data-n='gans'] .k,
  [data-n='vogel'] .k,
  [data-n='flugzeug'] .k,
  [data-n='schmetterling'] .k,
  [data-n='biene'] .k {
    animation: schweben var(--d, 1s) ease-in-out infinite alternate;
  }
  [data-n='schnecke'] .k,
  [data-n='raupe'] .k {
    animation: kriechen var(--d, 1s) ease-in-out infinite alternate;
  }
  [data-n='fliegenpilz'] .k {
    transform-origin: 30px 60px;
  }
  [data-n='steinpilz'] .k {
    transform-origin: 30px 60px;
  }
  [data-n='kastanie'] .k {
    transform-origin: 26px 40px;
  }
  [data-n='kuerbis'] .k {
    transform-origin: 42px 62px;
  }
  [data-n='korb'] .k {
    transform-origin: 38px 52px;
  }
  [data-n='stiefel'] .k {
    transform-origin: 30px 66px;
  }
  [data-n='ranzen'] .k {
    transform-origin: 30px 64px;
  }
  [data-n='giraffe'] .k {
    transform-origin: 40px 106px;
  }
  [data-n='eule'] .k {
    transform-origin: 35px 82px;
  }
  [data-n='hahn'] .k {
    transform-origin: 40px 80px;
  }
  [data-n='specht'] .k {
    transform-origin: 30px 70px;
  }
  [data-n='pinguin'] .k {
    transform-origin: 25px 66px;
  }
  [data-n='apfel'] .k {
    transform-origin: 20px 4px;
  }
  [data-n='birne'] .k {
    transform-origin: 18px 4px;
  }
  [data-n='karotte'] .k {
    transform-origin: 15px 4px;
  }
  [data-n='traube'] .k {
    transform-origin: 19px 4px;
  }
  [data-n='nuss'] .k {
    transform-origin: 15px 2px;
  }
  [data-n='orange'] .k {
    transform-origin: 14px 4px;
  }
  [data-n='bonbon'] .k {
    transform-origin: 18px 10px;
  }
  [data-n='schokolade'] .k {
    transform-origin: 15px 13px;
  }
  [data-n='laterne'] .k {
    transform-origin: 26px 0px;
  }
  [data-n='drachen'] .k {
    transform-origin: 32px 2px;
  }
  [data-n='regenschirm'] .k {
    transform-origin: 42px 40px;
  }
  [data-n='blatt'] .k {
    transform-origin: 24px 50px;
  }
  [data-n='herz'] .k {
    transform-origin: 30px 28px;
  }
  [data-n='schnecke'] .k {
    transform-origin: 60px 44px;
  }
  [data-n='schneeflocke'] .k {
    animation: drehen-l var(--d, 1s) linear infinite;
  }
  [data-n='tulpe'] .k {
    transform-origin: 15px 54px;
  }
  [data-n='gaensebluemchen'] .k {
    transform-origin: 20px 48px;
  }
  [data-n='sonnenblume'] .k {
    transform-origin: 25px 78px;
  }
  [data-n='loewenzahn'] .k {
    transform-origin: 17px 54px;
  }
  [data-n='spross'] .k {
    transform-origin: 20px 46px;
  }
  [data-n='nest'] .k {
    transform-origin: 35px 30px;
  }
  [data-n='ei'] .k {
    transform-origin: 13px 31px;
  }
  [data-n='schneemann'] .k {
    transform-origin: 25px 74px;
  }
  [data-n='tannenbaum'] .k {
    transform-origin: 30px 78px;
  }
  [data-n='zelt'] .k {
    transform-origin: 40px 56px;
  }
  [data-n='eimer'] .k {
    transform-origin: 28px 52px;
  }
  [data-n='kakao'] .k {
    transform-origin: 25px 50px;
  }
  [data-n='kerze'] .k {
    transform-origin: 15px 58px;
  }
  [data-n='segelboot'] .k {
    transform-origin: 40px 72px;
  }
  [data-n='kirschbluete'] .k {
    transform-origin: 20px 20px;
  }
  [data-n='regenbogen'] .k {
    transform-origin: 50px 54px;
  }
  [data-n='hemd'] .k {
    transform-origin: 20px 2px;
  }
  [data-n='hose'] .k {
    transform-origin: 20px 2px;
  }
  [data-n='socke'] .k {
    transform-origin: 20px 2px;
  }
  [data-n='kleid'] .k {
    transform-origin: 20px 2px;
  }
  [data-n='erdbeere'] .k {
    transform-origin: 20px 6px;
  }
  [data-n='eis'] .k {
    transform-origin: 18px 62px;
  }
  [data-n='plaetzchen'] .k {
    transform-origin: 25px 25px;
  }
  [data-n='handschuhe'] .k {
    transform-origin: 30px 10px;
  }
  [data-n='schwimmring'] .k {
    transform-origin: 30px 30px;
  }
  [data-n='schlittschuh'] .k {
    transform-origin: 30px 6px;
  }
  [data-n='melone'] .k {
    transform-origin: 30px 20px;
  }
  [data-n='sonne'] .k {
    transform-origin: 30px 30px;
  }
  [data-n='schneeflocke'] .k {
    transform-origin: 25px 25px;
  }
  [data-n='raupe'] .k {
    transform-origin: 60px 30px;
  }
  [data-n='ente'] .k {
    transform-origin: 38px 52px;
  }
  [data-n='hase'] .k, [data-n='fuchs'] .k, [data-n='kueken'] .k, [data-n='marienkaefer'] .k {
    --d: 0.25s;
  }
  [data-n='ente'] .k {
    --d: 0.4s;
  }
  [data-n='eiswagen'] .k, [data-n='schlitten'] .k {
    --d: 0.16s;
  }
  [data-n='schmetterling'] .k, [data-n='biene'] .k {
    --d: 0.6s;
  }
  [data-n='sonne'] .k {
    --d: 1.4s;
  }
  [data-n='frosch'] .k {
    --d: 0.5s;
  }
  [data-n='schneeflocke'] .k {
    --d: 12s;
  }
  .flattern-x {
    animation: flattern-x 0.28s ease-in-out infinite alternate;
  }
  .buckel {
    animation: buckel 0.6s ease-in-out infinite alternate;
  }
  .flamme-k {
    animation: flamme-k 0.5s ease-in-out infinite alternate;
  }
  .dampf {
    animation: dampf 2s ease-in-out infinite;
  }
  @keyframes drehen-l {
    to { transform: rotate(360deg); }
  }
  @keyframes flattern-x {
    from { transform: scaleX(1); }
    to { transform: scaleX(0.25); }
  }
  @keyframes buckel {
    from { transform: translateY(0); }
    to { transform: translateY(-3px); }
  }
  @keyframes flamme-k {
    from { transform: scale(1, 1) rotate(-3deg); }
    to { transform: scale(0.9, 1.1) rotate(3deg); }
  }
  @keyframes dampf {
    0% { opacity: 0; transform: translateY(4px); }
    40% { opacity: 1; }
    100% { opacity: 0; transform: translateY(-6px); }
  }
  .k,
  .teil {
    transform-box: view-box;
  }
  .k {
    --d: 1.2s;
  }
  [data-n='igel'] .k, [data-n='schildkroete'] .k, [data-n='baer'] .k, [data-n='loewe'] .k, [data-n='schaf'] .k, [data-n='affe'] .k, [data-n='eichhoernchen'] .k, [data-n='kastanienmann'] .k {
    --d: 0.25s;
  }
  [data-n='gespann'] .k, [data-n='radler'] .k, [data-n='elefant'] .k {
    --d: 0.4s;
  }
  [data-n='pinguin'] .k {
    --d: 0.42s;
  }
  [data-n='traktor'] .k {
    --d: 0.14s;
  }
  [data-n='herz'] .k {
    --d: 0.45s;
  }
  [data-n='note'] .k, [data-n='noten'] .k, [data-n='gans'] .k, [data-n='vogel'] .k {
    --d: 0.5s;
  }
  [data-n='flugzeug'] .k, [data-n='giraffe'] .k, [data-n='eule'] .k, [data-n='laterne'] .k, [data-n='drachen'] .k, [data-n='spinne'] .k {
    --d: 1.8s;
  }
  [data-n='hahn'] .k, [data-n='specht'] .k {
    --d: 0.9s;
  }
  .schnuppern {
    animation: schnuppern 0.35s ease-in-out infinite alternate;
  }
  .zucken {
    animation: zucken 2.6s ease-in-out infinite;
  }
  .fuehler {
    animation: fuehler 1.4s ease-in-out infinite alternate;
  }
  .zappeln {
    animation: zappeln 0.3s ease-in-out infinite alternate;
  }
  .flosse {
    animation: flosse 0.42s ease-in-out infinite alternate;
  }
  .ruessel {
    animation: ruessel 1.2s ease-in-out infinite alternate;
  }
  .ohrwedeln {
    animation: ohrwedeln 0.9s ease-in-out infinite alternate;
  }
  .picken {
    animation: picken 1.8s ease-in-out infinite;
  }
  .schnur {
    animation: schnur 1.1s ease-in-out infinite alternate;
  }
  @keyframes gehen {
    from { transform: translateY(0); }
    to { transform: translateY(-2.5px); }
  }
  @keyframes watscheln {
    from { transform: rotate(-7deg); }
    to { transform: rotate(7deg); }
  }
  @keyframes wackeln {
    from { transform: rotate(-3deg) scaleY(1); }
    to { transform: rotate(3deg) scaleY(0.97); }
  }
  @keyframes baumeln {
    from { transform: rotate(-6deg); }
    to { transform: rotate(6deg); }
  }
  @keyframes pochen {
    from { transform: scale(1); }
    to { transform: scale(1.12); }
  }
  @keyframes huepfen {
    from { transform: translateY(0) rotate(-4deg); }
    to { transform: translateY(-4px) rotate(4deg); }
  }
  @keyframes rattern {
    from { transform: translateY(0); }
    to { transform: translateY(-1.2px); }
  }
  @keyframes schweben {
    from { transform: translateY(1.5px) rotate(-1.5deg); }
    to { transform: translateY(-1.5px) rotate(1.5deg); }
  }
  @keyframes kriechen {
    from { transform: scaleX(1); }
    to { transform: scaleX(1.07); }
  }
  @keyframes schnuppern {
    from { transform: translate(0, 0); }
    to { transform: translate(-1px, -0.6px); }
  }
  @keyframes zucken {
    0%, 80%, 100% { transform: rotate(0); }
    85% { transform: rotate(-12deg); }
    90% { transform: rotate(8deg); }
  }
  @keyframes fuehler {
    from { transform: rotate(-8deg); }
    to { transform: rotate(8deg); }
  }
  @keyframes zappeln {
    from { transform: scaleX(1); }
    to { transform: scaleX(1.12) scaleY(0.94); }
  }
  @keyframes flosse {
    from { transform: rotate(-4deg); }
    to { transform: rotate(18deg); }
  }
  @keyframes ruessel {
    from { transform: rotate(-10deg); }
    to { transform: rotate(14deg); }
  }
  @keyframes ohrwedeln {
    from { transform: scaleX(1); }
    to { transform: scaleX(0.75); }
  }
  @keyframes picken {
    0%, 55%, 100% { transform: rotate(0); }
    65% { transform: rotate(-22deg); }
    72% { transform: rotate(0); }
    80% { transform: rotate(-22deg); }
    88% { transform: rotate(0); }
  }
  @keyframes schnur {
    from { transform: rotate(-10deg); }
    to { transform: rotate(10deg); }
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
