def kopf(haut, haut_s, haar_hinten, haar_vorn, kleid, kleid_s, extra='', wangen=True, augen='auf'):
    a = ('<circle cx="42" cy="48" r="2.8" fill="#2a1a12"/><circle cx="58" cy="48" r="2.8" fill="#2a1a12"/><circle cx="41.2" cy="47.2" r="1" fill="#fff"/><circle cx="57.2" cy="47.2" r="1" fill="#fff"/>'
         if augen == 'auf' else '<path d="M38 48 q4 3 8 0 M54 48 q4 3 8 0" stroke="#2a1a12" stroke-width="2" fill="none" stroke-linecap="round"/>')
    return f'''{haar_hinten}
 <path d="M18 96 C18 78 30 70 50 70 C70 70 82 78 82 96 Z" fill="{kleid}"/><path d="M62 72 C74 76 82 84 82 96 L66 96 C68 88 66 78 62 72 Z" fill="{kleid_s}"/>
 <rect x="44" y="62" width="12" height="12" rx="4" fill="{haut_s}"/>
 <circle cx="50" cy="46" r="20" fill="{haut}"/><path d="M62 30 C72 40 70 58 56 64 C64 56 66 42 62 30 Z" fill="{haut_s}" opacity=".6"/>
 <circle cx="30" cy="48" r="4.6" fill="{haut}"/><circle cx="70" cy="48" r="4.6" fill="{haut_s}"/>
 {a}<path d="M44 56 q6 5 12 0" stroke="#b05a3a" stroke-width="2" fill="none" stroke-linecap="round"/>
 {'<ellipse cx="37" cy="54" rx="3.4" ry="2.2" fill="#ff8a7a" opacity=".55"/><ellipse cx="63" cy="54" rx="3.4" ry="2.2" fill="#ff8a7a" opacity=".55"/>' if wangen else ''}
 {haar_vorn}{extra}'''
H1, H1s = '#f6d2b0', '#e8b890'
H2, H2s = '#d9a06e', '#c08250'
H3, H3s = '#7a4a2c', '#5e3820'
B = [
("g-einkaufswagen","Einkaufen","Einkaufen","rattern","""
 <path d="M6 18 L18 18 L28 66 L80 66" stroke="#5a6478" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <circle cx="34" cy="38" r="7" fill="#5ea844"/><circle cx="46" cy="34" r="8" fill="#e8302a"/><ellipse cx="60" cy="34" rx="5" ry="11" fill="#ffd23a" transform="rotate(30 60 34)"/><path d="M72 22 L78 40 L66 40 Z" fill="#f08a24"/><path d="M72 22 l-3 -6 M72 22 l2 -7 M72 22 l5 -5" stroke="#4caf50" stroke-width="2" stroke-linecap="round"/>
 <path d="M20 34 L88 34 L80 66 L28 66 Z" fill="#7fc8ff" opacity=".85"/>
 <path d="M30 34 L34 66 M44 34 L46 66 M58 34 L58 66 M72 34 L70 66 M24 46 L85 46 M26 56 L83 56" stroke="#4fa8e6" stroke-width="2"/>
 <circle cx="34" cy="82" r="7" fill="#2e2a2a"/><circle cx="34" cy="82" r="2.6" fill="#c8c8c8"/><circle cx="74" cy="82" r="7" fill="#2e2a2a"/><circle cx="74" cy="82" r="2.6" fill="#c8c8c8"/>
 <path d="M28 70 L80 70" stroke="#5a6478" stroke-width="4" stroke-linecap="round"/>"""),
("g-einkaufskorb","Einkaufskorb","Einkaufen","wackeln","""
 <path d="M26 44 C26 18 74 18 74 44" stroke="#e8452b" stroke-width="6" fill="none"/>
 <circle cx="36" cy="40" r="9" fill="#e8302a"/><path d="M50 22 L58 42 L46 42 Z" fill="#f08a24"/><path d="M50 22 l-2 -6 M50 22 l3 -6" stroke="#4caf50" stroke-width="2"/><rect x="58" y="24" width="14" height="22" rx="3" fill="#fffaf2"/><rect x="58" y="24" width="14" height="7" rx="2" fill="#3b8fd6"/>
 <path d="M12 44 L88 44 L80 88 L20 88 Z" fill="#e8452b"/><path d="M66 44 L88 44 L80 88 L64 88 Z" fill="#b8301c"/>
 <g fill="#b8301c"><rect x="24" y="54" width="8" height="8" rx="2"/><rect x="38" y="54" width="8" height="8" rx="2"/><rect x="52" y="54" width="8" height="8" rx="2"/><rect x="26" y="70" width="8" height="8" rx="2"/><rect x="40" y="70" width="8" height="8" rx="2"/><rect x="54" y="70" width="8" height="8" rx="2"/></g>
 <path d="M10 44 L90 44 L89 49 L11 49 Z" fill="#ff6a5a"/>"""),
("g-einkaufstasche","Einkaufstasche","Einkaufen","wackeln","""
 <path d="M60 4 C66 2 70 8 66 14 L56 40 L50 38 Z" fill="#e8b46a"/><path d="M60 8 l-2 4 M57 16 l-2 4 M54 24 l-2 4" stroke="#c88a3a" stroke-width="1.6"/>
 <path d="M28 40 L36 20 L42 22 L38 40 Z" fill="#5ea844"/><circle cx="34" cy="20" r="5" fill="#7fc25a"/>
 <path d="M34 40 C34 26 66 26 66 40" stroke="#a86a3a" stroke-width="4" fill="none"/>
 <path d="M16 40 L84 40 L80 90 L20 90 Z" fill="#f2d4a0"/><path d="M66 40 L84 40 L80 90 L64 90 Z" fill="#d9b480"/>
 <circle cx="44" cy="64" r="11" fill="#7fd88a"/><path d="M44 54 C40 60 40 68 44 74 M44 54 C48 60 48 68 44 74" stroke="#5cbf6a" stroke-width="2" fill="none"/>"""),
("g-broetchen","Bäcker","Einkaufen","atmen","""
 <path d="M8 66 C8 48 26 38 40 44 C42 30 62 26 70 38 C84 34 96 48 92 64 C90 74 80 78 70 78 L28 78 C16 78 8 74 8 66 Z" fill="#d8904a"/>
 <path d="M70 38 C84 34 96 48 92 64 C90 74 80 78 70 78 L62 78 C78 70 80 50 70 38 Z" fill="#b87030"/>
 <path d="M28 52 C32 48 38 48 40 52 M46 46 C52 40 60 40 62 46 M70 50 C74 46 80 48 82 52" stroke="#f2c88a" stroke-width="4" fill="none" stroke-linecap="round"/>
 <g fill="#fff4dc"><circle cx="30" cy="62" r="1.6"/><circle cx="44" cy="60" r="1.6"/><circle cx="56" cy="64" r="1.6"/><circle cx="68" cy="60" r="1.6"/><circle cx="38" cy="68" r="1.6"/></g>
 <path d="M12 84 L88 84" stroke="#e8e2d6" stroke-width="6" stroke-linecap="round"/>"""),
("g-geldboerse","Bezahlen","Einkaufen","atmen","""
 <path d="M14 36 C14 28 18 24 26 24 L74 24 C82 24 86 28 86 36 L86 80 C86 86 82 88 76 88 L24 88 C18 88 14 86 14 80 Z" fill="#8462e0"/>
 <path d="M66 24 L74 24 C82 24 86 28 86 36 L86 80 C86 86 82 88 76 88 L66 88 C70 70 70 40 66 24 Z" fill="#6a48c8"/>
 <path d="M60 46 L90 46 L90 66 L60 66 C54 66 54 46 60 46 Z" fill="#b394ff"/><circle cx="66" cy="56" r="4" fill="#ffd23a"/>
 <g><circle cx="34" cy="16" r="10" fill="#ffd23a"/><circle cx="34" cy="16" r="6" fill="#f2b81e"/><text x="34" y="20" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="9" fill="#fff4c2">1</text></g>
 <g><circle cx="52" cy="10" r="8" fill="#e0e4ea"/><circle cx="52" cy="10" r="4.6" fill="#c8ccd6"/></g>"""),
("g-markt","Wochenmarkt","Einkaufen","atmen","""
 <path d="M10 32 L90 32 L84 16 L16 16 Z" fill="#e8452b"/><g fill="#fffaf2"><path d="M26 16 L22 32 L34 32 L36 16 Z"/><path d="M46 16 L46 32 L58 32 L56 16 Z"/><path d="M66 16 L70 32 L82 32 L76 16 Z"/></g>
 <path d="M10 32 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0" fill="#e8452b"/>
 <path d="M16 36 L16 90 M84 36 L84 90" stroke="#a86a3a" stroke-width="4"/>
 <rect x="10" y="62" width="80" height="12" rx="3" fill="#c8864a"/><rect x="10" y="74" width="80" height="16" fill="#a86a3a"/>
 <g><circle cx="24" cy="56" r="6" fill="#e8302a"/><circle cx="34" cy="58" r="6" fill="#e8302a"/><circle cx="29" cy="50" r="6" fill="#ff4a3a"/></g>
 <g><circle cx="50" cy="56" r="7" fill="#5ea844"/><circle cx="58" cy="52" r="7" fill="#7fc25a"/></g>
 <g><ellipse cx="74" cy="56" rx="8" ry="5" fill="#ffd23a"/><ellipse cx="80" cy="50" rx="6" ry="4" fill="#ffc21a"/></g>"""),
("g-obstkiste","Obst kaufen","Einkaufen","atmen","""
 <g><circle cx="26" cy="40" r="9" fill="#e8302a"/><circle cx="42" cy="36" r="9" fill="#f08a24"/><circle cx="58" cy="38" r="9" fill="#e8302a"/><circle cx="74" cy="40" r="9" fill="#9fd04a"/><circle cx="34" cy="28" r="8" fill="#ffd23a"/><circle cx="66" cy="28" r="8" fill="#f08a24"/></g>
 <g fill="#fff" opacity=".4"><circle cx="23" cy="37" r="2.4"/><circle cx="55" cy="35" r="2.4"/></g>
 <path d="M10 44 L90 44 L86 88 L14 88 Z" fill="#c8864a"/><path d="M70 44 L90 44 L86 88 L70 88 Z" fill="#a86a3a"/>
 <path d="M12 56 L88 56 M13 70 L87 70" stroke="#a86a3a" stroke-width="3"/>
 <rect x="34" y="60" width="32" height="18" rx="3" fill="#fffaf2"/><path d="M40 69 h20" stroke="#e8452b" stroke-width="3" stroke-linecap="round"/>"""),
("g-milchkarton","Milch kaufen","Einkaufen","wackeln","""
 <path d="M30 26 L50 10 L70 26 Z" fill="#e2e8f0"/><path d="M50 10 L70 26 L60 26 Z" fill="#c8d4e2"/><rect x="44" y="4" width="12" height="8" rx="2" fill="#3b8fd6"/>
 <rect x="30" y="26" width="40" height="64" rx="3" fill="#fffaf2"/><rect x="58" y="26" width="12" height="64" rx="3" fill="#e8e2d6"/>
 <path d="M30 50 C38 46 46 54 54 50 C60 47 66 50 70 52 L70 90 L30 90 Z" fill="#7fc8ff"/>
 <g fill="#2e2a2a"><ellipse cx="44" cy="68" rx="6" ry="4"/><circle cx="56" cy="76" r="3"/></g><path d="M38 40 C40 34 48 34 50 40 Z" fill="#fff"/>
 <text x="50" y="44" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="9" fill="#3b8fd6">MILCH</text>"""),
("g-einkaufsliste","Einkaufszettel","Einkaufen","wackeln","""
 <path d="M22 10 L78 10 L78 86 L72 92 L66 86 L60 92 L54 86 L48 92 L42 86 L36 92 L30 86 L22 92 Z" fill="#fffaf2"/>
 <path d="M66 10 L78 10 L78 86 L72 92 L66 86 Z" fill="#ece6d8"/>
 <g><circle cx="32" cy="26" r="4" fill="#e8302a"/><path d="M40 26 h28" stroke="#b8c2d0" stroke-width="3" stroke-linecap="round"/></g>
 <g><circle cx="32" cy="42" r="4" fill="#ffd23a"/><path d="M40 42 h24" stroke="#b8c2d0" stroke-width="3" stroke-linecap="round"/></g>
 <g><circle cx="32" cy="58" r="4" fill="#5ea844"/><path d="M40 58 h26" stroke="#b8c2d0" stroke-width="3" stroke-linecap="round"/></g>
 <g><circle cx="32" cy="74" r="4" fill="#7fc8ff"/><path d="M40 74 h20" stroke="#b8c2d0" stroke-width="3" stroke-linecap="round"/></g>
 <path d="M28 24 l3 3 l6 -7 M28 40 l3 3 l6 -7" stroke="#4caf5a" stroke-width="3" fill="none" stroke-linecap="round"/>
 <g transform="rotate(30 80 60)"><rect x="76" y="30" width="8" height="44" rx="2" fill="#ffd23a"/><path d="M76 74 L84 74 L80 84 Z" fill="#f2c88a"/><path d="M78.6 80 L81.4 80 L80 84 Z" fill="#3a2a2a"/></g>"""),
("g-kasse","An der Kasse","Einkaufen","atmen","""
 <path d="M8 70 L92 70 L88 90 L12 90 Z" fill="#5a6478"/><path d="M8 70 L92 70 L92 74 L8 74 Z" fill="#7a8498"/>
 <rect x="52" y="30" width="38" height="40" rx="5" fill="#3b8fd6"/><rect x="58" y="36" width="26" height="12" rx="2" fill="#bfe3ff"/><text x="71" y="45" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="9" fill="#1d2b4f">4,20</text>
 <g fill="#2a62b0"><rect x="58" y="52" width="6" height="5" rx="1"/><rect x="66" y="52" width="6" height="5" rx="1"/><rect x="74" y="52" width="6" height="5" rx="1"/><rect x="58" y="59" width="6" height="5" rx="1"/><rect x="66" y="59" width="6" height="5" rx="1"/><rect x="74" y="59" width="6" height="5" rx="1"/></g>
 <circle cx="20" cy="60" r="9" fill="#e8302a"/><rect x="32" y="50" width="12" height="20" rx="2" fill="#fffaf2"/><rect x="32" y="50" width="12" height="6" rx="2" fill="#7fd88a"/>"""),
# --- Leute ---
]
# Leute: jede Person in drei Varianten (hell, mittel, dunkel). Die bisherige Kennung behält ihre Hautfarbe.
HAUT = {'w': (H1, H1s), 'l': (H2, H2s), 's': (H3, H3s)}
# Haarfarben je Variante: (hinten, vorn)
HAAR = {'w': None, 'l': ('#3a2418', '#4a2e1e'), 's': ('#1d1a1a', '#2e2622')}
def _haar(v, hinten, vorn):
    return (hinten, vorn) if HAAR[v] is None else HAAR[v]
def mama(v):
    h, hs = HAUT[v]; a, b = _haar(v, '#8a4a24', '#a85a2a')
    return kopf(h, hs, f'<path d="M24 46 C22 28 34 20 50 20 C66 20 78 28 76 46 L78 80 C70 84 30 84 22 80 Z" fill="{a}"/>',
        f'<path d="M30 42 C30 26 42 22 52 22 C64 22 72 30 70 42 C62 34 48 32 30 42 Z" fill="{b}"/>',
        '#e8452b','#b8301c','<circle cx="30" cy="56" r="2" fill="#ffd23a"/><circle cx="70" cy="56" r="2" fill="#ffd23a"/>')
def papa(v, bart=False):
    h, hs = HAUT[v]; a, b = _haar(v, '#8a5a2e', '#b07a44')
    return kopf(h, hs, '',
        f'<path d="M30 40 C28 22 44 18 54 20 C66 22 74 30 70 42 C66 34 56 30 44 32 C38 34 32 38 30 40 Z" fill="{a}"/><path d="M34 30 C40 24 50 22 58 24 C50 25 42 28 36 33 Z" fill="{b}" opacity=".55"/>'
        + (f'<path d="M36 60 C40 68 60 68 64 60 C64 64 60 70 50 70 C40 70 36 64 36 60 Z" fill="{a}"/>' if bart else ''),
        '#3b8fd6','#2a62b0','<path d="M44 74 L50 82 L56 74" stroke="#fffaf2" stroke-width="3" fill="none"/>')
def oma(v):
    h, hs = HAUT[v]
    return kopf(h, hs, '<circle cx="50" cy="20" r="10" fill="#d8dce6"/>',
        '<path d="M30 44 C28 26 40 22 50 22 C62 22 72 28 70 44 C64 34 54 30 30 44 Z" fill="#e8ecf2"/>',
        '#8462e0','#6a48c8','<g fill="none" stroke="#5a5a6a" stroke-width="2"><circle cx="42" cy="48" r="6"/><circle cx="58" cy="48" r="6"/><path d="M48 48 h4"/></g><path d="M40 72 C44 78 56 78 60 72" stroke="#fffaf2" stroke-width="3" fill="none"/>')
def opa(v):
    h, hs = HAUT[v]
    return kopf(h, hs, '<path d="M28 50 C26 40 30 34 34 32 L34 52 Z M72 50 C74 40 70 34 66 32 L66 52 Z" fill="#e8ecf2"/>',
        '<path d="M40 58 C44 54 56 54 60 58 C56 60 44 60 40 58 Z" fill="#e8ecf2"/><path d="M36 38 q6 -4 10 0 M54 38 q6 -4 10 0" stroke="#e8ecf2" stroke-width="3" fill="none"/>',
        '#5ea844','#4a8a30',f'<g fill="none" stroke="#5a5a6a" stroke-width="2"><rect x="35" y="43" width="12" height="9" rx="3"/><rect x="53" y="43" width="12" height="9" rx="3"/><path d="M47 47 h6"/></g><path d="M40 26 C44 24 56 24 60 26" stroke="{hs}" stroke-width="2" fill="none"/>')
def baby(v):
    h, hs = HAUT[v]; a, _ = _haar(v, '#c88a52', '')
    return kopf(h, hs, '', f'<path d="M48 26 C44 18 54 14 56 22 C52 20 50 22 52 26" stroke="{a}" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
        '#ffd23a','#e0a820','<circle cx="50" cy="60" r="6" fill="#ff8fb1"/><circle cx="50" cy="60" r="3" fill="#fff4f8"/><rect x="47" y="54" width="6" height="4" rx="1.6" fill="#7fc8ff"/>', augen='zu')
def bruder(v):
    h, hs = HAUT[v]; a, _ = _haar(v, '#a8642a', '')
    return kopf(h, hs, '', f'<path d="M30 42 C28 24 42 20 52 22 C62 20 74 28 70 42 C64 30 54 34 46 30 C40 34 34 36 30 42 Z" fill="{a}"/>',
        '#f08a24','#c8661a','<rect x="36" y="80" width="28" height="6" rx="3" fill="#fffaf2" opacity=".6"/>')
def schwester(v):
    h, hs = HAUT[v]; a, b = _haar(v, '#e0a83c', '#f2c25a')
    return kopf(h, hs, f'<path d="M22 50 C16 58 18 70 24 74 C28 66 28 56 26 48 Z M78 50 C84 58 82 70 76 74 C72 66 72 56 74 48 Z" fill="{a}"/>',
        f'<path d="M30 44 C28 26 40 22 50 22 C62 22 72 28 70 44 C66 34 58 30 48 32 C40 34 34 38 30 44 Z" fill="{b}"/><circle cx="24" cy="46" r="4" fill="#ff5d8f"/><circle cx="76" cy="46" r="4" fill="#ff5d8f"/>',
        '#ff8fb1','#e86a94','')
def freunde(v1, v2):
    h1, hs1 = HAUT[v1]; h2, hs2 = HAUT[v2]
    a1, _ = _haar(v1, '#6a3a1e', ''); a2, _ = _haar(v2, '#c8561a', '')
    return ('<g transform="translate(-16 6) scale(.8)">'+kopf(h1,hs1,f'<path d="M24 44 C20 26 34 18 50 18 C66 18 80 26 76 44 C76 56 70 62 66 62 L34 62 C30 62 24 56 24 44 Z" fill="{a1}"/>','','#7fd88a','#5cbf6a','')
        +'</g><g transform="translate(36 6) scale(.8)">'+kopf(h2,hs2,'',f'<path d="M30 42 C28 24 42 20 52 22 C62 20 74 28 70 42 C64 32 52 28 30 42 Z" fill="{a2}"/>','#3b8fd6','#2a62b0','')
        +f'</g><path d="M42 82 C48 76 52 76 58 82" stroke="{h2}" stroke-width="6" fill="none" stroke-linecap="round"/>')
def erzieherin(v):
    h, hs = HAUT[v]; a, b = _haar(v, '#7a4a24', '#8a5a2e')
    return kopf(h, hs, f'<path d="M24 46 C22 26 36 18 50 18 C64 18 78 26 76 46 C76 56 72 60 68 60 L32 60 C28 60 24 56 24 46 Z" fill="{a}"/>',
        f'<path d="M30 40 C32 26 44 22 52 22 C62 22 70 30 70 40 C60 34 44 32 30 40 Z" fill="{b}"/>',
        '#7fd3ff','#4fb4e6','<rect x="38" y="78" width="24" height="16" rx="3" fill="#fffaf2"/><circle cx="46" cy="86" r="3" fill="#ffd23a"/><circle cx="54" cy="86" r="3" fill="#e8452b"/>')
def aerztin(v):
    h, hs = HAUT[v]; a, b = _haar(v, '#c8561a', '#e0702a')
    return kopf(h, hs, f'<path d="M24 46 C22 28 34 20 50 20 C66 20 78 28 76 46 L76 62 L24 62 Z" fill="{a}"/>',
        f'<path d="M30 42 C30 26 42 22 52 22 C64 22 72 30 70 42 C62 34 48 32 30 42 Z" fill="{b}"/>',
        '#fffaf2','#e2dccf','<path d="M38 74 C34 84 40 90 46 88 M62 74 C66 84 60 90 54 88" stroke="#5a6478" stroke-width="2.4" fill="none"/><circle cx="50" cy="88" r="4" fill="#9aa2ae"/><path d="M66 80 h8 M70 76 v8" stroke="#e8452b" stroke-width="3"/>')
# (Kennung, Name, Zeichnung, Variante der bisherigen Kennung)
PERSONEN = [('mama','Mama',mama,'w'),('papa','Papa',papa,'w'),('oma','Oma',oma,'w'),('opa','Opa',opa,'l'),
    ('baby','Baby',baby,'w'),('bruder','Bruder',bruder,'s'),('schwester','Schwester',schwester,'w'),
    ('erzieherin','Erzieherin',erzieherin,'l'),('aerztin','Kinderärztin',aerztin,'w')]
for k, name, f, alt in PERSONEN:
    for v in 'wls':
        kennung = f'g-{k}' if v == alt else f'g-{k}-{v}'
        inhalt = papa(v, bart=True) if (k == 'papa' and v == 'l') else f(v)
        B.append((kennung, name, 'Leute', 'wackeln', inhalt))
B.append(('g-freunde','Freunde treffen','Leute','wackeln', freunde('s','w')))
B.append(('g-freunde-l','Freunde treffen','Leute','wackeln', freunde('w','l')))
B.append(('g-freunde-s','Freunde treffen','Leute','wackeln', freunde('l','s')))
