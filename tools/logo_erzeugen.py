# Erzeugt das Tagolino-Logo (SVG) und rendert alle Icon-, Banner- und Splash-Größen mit Chromium.
import math, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image
REPO=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build-logo'); os.makedirs(OUT, exist_ok=True)
import base64
FONT='data:font/woff2;base64,'+base64.b64encode(open(REPO+'/src/assets/fonts/fredoka-latin-wght-normal.woff2','rb').read()).decode()
KACHELN=[('#ff8f7a','#e0644f'),('#6cc4ff','#3a94d6'),('#ffd24a','#e0a820'),('#7fd88a','#4caf5a'),('#b394ff','#8462e0')]

def hintergrund(dunkel=False):
    o,u = ('#1d2a5a','#3b4f8f') if dunkel else ('#8fd3ff','#fff0c9')
    return f'''<defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{o}"/><stop offset="1" stop-color="{u}"/></linearGradient></defs>
<rect width="1024" height="1024" fill="url(#hg)"/>'''

def vordergrund():
    t=[]
    # Kacheln im Lächel-Bogen
    for i,(f,s) in enumerate(KACHELN):
        a=(i-2)*0.30
        x=512+math.sin(a)*400; y=800-(1-math.cos(a))*420
        rot=math.degrees(a)*0.7
        t.append(f'<g transform="translate({x:.1f} {y:.1f}) rotate({rot:.1f})">'
                 f'<rect x="-62" y="-50" width="124" height="118" rx="30" fill="{s}"/>'
                 f'<rect x="-62" y="-58" width="124" height="112" rx="30" fill="{f}"/>'
                 f'<rect x="-44" y="-44" width="52" height="16" rx="8" fill="#fff" opacity=".45"/></g>')
    # Sonnenstrahlen (runde Blätter)
    cx,cy=512,370
    for k in range(12):
        w=k*30
        t.append(f'<g transform="rotate({w} {cx} {cy})"><ellipse cx="{cx}" cy="{cy-205}" rx="34" ry="52" fill="{"#ffad2e" if k%2 else "#ff8c1a"}"/></g>')
    t.append(f'<circle cx="{cx}" cy="{cy}" r="178" fill="#ffd43a"/>')
    t.append(f'<path d="M{cx+120} {cy-130} A178 178 0 0 1 {cx-40} {cy+174} A190 190 0 0 0 {cx+120} {cy-130} Z" fill="#f7b928"/>')
    t.append(f'<ellipse cx="{cx-70}" cy="{cy-90}" rx="52" ry="32" fill="#fff6c8" opacity=".75" transform="rotate(-30 {cx-70} {cy-90})"/>')
    # Gesicht: ein Auge zwinkert
    t.append(f'<ellipse cx="{cx-62}" cy="{cy-8}" rx="20" ry="27" fill="#3a2418"/><circle cx="{cx-68}" cy="{cy-18}" r="7" fill="#fff"/>')
    t.append(f'<path d="M{cx+38} {cy-6} q26 -26 52 0" stroke="#3a2418" stroke-width="15" fill="none" stroke-linecap="round"/>')
    t.append(f'<ellipse cx="{cx-108}" cy="{cy+52}" rx="30" ry="18" fill="#ff8a7a" opacity=".75"/><ellipse cx="{cx+112}" cy="{cy+52}" rx="30" ry="18" fill="#ff8a7a" opacity=".75"/>')
    t.append(f'<path d="M{cx-72} {cy+50} Q{cx} {cy+136} {cx+72} {cy+50} Q{cx} {cy+92} {cx-72} {cy+50} Z" fill="#3a2418"/>')
    t.append(f'<path d="M{cx-30} {cy+92} Q{cx} {cy+116} {cx+30} {cy+92} Q{cx} {cy+100} {cx-30} {cy+92} Z" fill="#ff6b6b"/>')
    # Funkeln
    for (x,y,r) in [(190,250,26),(840,230,22),(860,470,16)]:
        t.append(f'<path d="M{x} {y-r} Q{x+r*.18} {y-r*.18} {x+r} {y} Q{x+r*.18} {y+r*.18} {x} {y+r} Q{x-r*.18} {y+r*.18} {x-r} {y} Q{x-r*.18} {y-r*.18} {x} {y-r} Z" fill="#fff"/>')
    return '\n'.join(t)

def wortmarke(x,y,groesse,anker='middle'):
    farben=['#ff7a5c','#3a94d6','#f0a400','#4caf5a','#8462e0','#ff7a5c','#3a94d6','#f0a400']
    buchst='Tagolino'
    spans=''.join(f'<tspan fill="{farben[i]}" dy="{(-1 if i%2 else 1)*groesse*0.035:.1f}">{c}</tspan>' for i,c in enumerate(buchst))
    return f'<text x="{x}" y="{y}" font-family="Fredoka" font-weight="650" font-size="{groesse}" text-anchor="{anker}" stroke="#fff" stroke-width="{groesse*0.09:.1f}" paint-order="stroke" stroke-linejoin="round">{spans}</text>'

def html(svg,b,h,transparent=False):
    return f'''<!doctype html><html><head><style>@font-face{{font-family:Fredoka;src:url({FONT});font-weight:300 700}}
html,body{{margin:0;background:{'transparent' if transparent else '#fff'}}}svg{{display:block}}</style></head><body>{svg}</body></html>'''

def svg_icon(art):
    inhalt = (hintergrund() if art in ('voll','rund') else '') + (vordergrund() if art!='hinter' else '')
    if art=='hinter': inhalt=hintergrund()
    clip=''
    if art=='rund':
        return f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><clipPath id="c"><circle cx="512" cy="512" r="512"/></clipPath><g clip-path="url(#c)">{inhalt}</g></svg>'
    if art=='vorder':
        # Vordergrund etwas kleiner (Masken schneiden die Ecken ab)
        return f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><g transform="translate(512 540) scale(.86) translate(-512 -512)">{vordergrund()}</g></svg>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">{inhalt}</svg>'

def svg_banner(b=1280,h=720):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{b}" height="{h}" viewBox="0 0 1280 720">
<defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#fff0c9"/></linearGradient></defs>
<rect width="1280" height="720" fill="url(#hg)"/>
<g transform="translate(40 60) scale(.6)">{vordergrund()}</g>
{wortmarke(900,380,170)}
<text x="900" y="470" font-family="Fredoka" font-weight="500" font-size="62" text-anchor="middle" fill="#1d2b4f">Was ist heute dran?</text></svg>'''

def svg_splash(b,h,dunkel=False):
    s=min(b,h)
    groesse=s*0.42
    logo=f'<g transform="translate({b/2-groesse/2} {h/2-groesse*0.62}) scale({groesse/1024})">{vordergrund()}</g>'
    o,u = ('#1d2a5a','#3b4f8f') if dunkel else ('#8fd3ff','#fff0c9')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{b}" height="{h}" viewBox="0 0 {b} {h}">
<defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{o}"/><stop offset="1" stop-color="{u}"/></linearGradient></defs>
<rect width="{b}" height="{h}" fill="url(#hg)"/>{logo}{wortmarke(b/2, h/2+groesse*0.55, groesse*0.3)}</svg>'''

def render(pg, svg, b, h, ziel, transparent=False):
    pg.set_viewport_size({'width':b,'height':h})
    pg.set_content(html(svg,b,h,transparent)); pg.wait_for_timeout(150)
    pg.evaluate('document.fonts.ready')
    pg.screenshot(path=ziel, omit_background=transparent, clip={'x':0,'y':0,'width':b,'height':h})

with sync_playwright() as p:
    br=p.chromium.launch(); pg=br.new_page()
    for art in ['voll','rund','vorder','hinter']:
        render(pg, svg_icon(art), 1024,1024, f'{OUT}/icon-{art}.png', transparent=art in ('rund','vorder'))
    render(pg, svg_banner(), 1280,720, f'{OUT}/banner.png')
    open(f'{OUT}/logo.svg','w').write(svg_icon('voll'))
    if '--alles' in sys.argv:
        import glob
        res=REPO+'/android/app/src/main/res/'
        for f in glob.glob(res+'drawable*/splash.png'):
            im=Image.open(f); b,h=im.size
            render(pg, svg_splash(b,h,'night' in f), b,h, f)
        render(pg, svg_splash(2732,2732), 2732,2732, REPO+'/assets/splash.png')
        render(pg, svg_splash(2732,2732,True), 2732,2732, REPO+'/assets/splash-dark.png')
    br.close()

if '--alles' in sys.argv:
    res=REPO+'/android/app/src/main/res/'
    voll=Image.open(f'{OUT}/icon-voll.png').convert('RGBA'); rund=Image.open(f'{OUT}/icon-rund.png').convert('RGBA')
    vorder=Image.open(f'{OUT}/icon-vorder.png').convert('RGBA'); hinter=Image.open(f'{OUT}/icon-hinter.png').convert('RGB')
    for d,g in [('ldpi',36),('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
        m=res+f'mipmap-{d}/'
        voll.resize((g,g),Image.LANCZOS).save(m+'ic_launcher.png')
        rund.resize((g,g),Image.LANCZOS).save(m+'ic_launcher_round.png')
        vorder.resize((g,g),Image.LANCZOS).save(m+'ic_launcher_foreground.png')
        hinter.resize((g,g),Image.LANCZOS).save(m+'ic_launcher_background.png')
    Image.open(f'{OUT}/banner.png').convert('RGB').resize((320,180),Image.LANCZOS).save(res+'drawable-xhdpi/banner.png')
    voll.convert('RGB').save(REPO+'/assets/icon-only.png'); vorder.save(REPO+'/assets/icon-foreground.png'); hinter.save(REPO+'/assets/icon-background.png')
    for g,n in [(64,'favicon.png'),(192,'icon-192.png'),(512,'icon-512.png')]:
        voll.convert('RGB').resize((g,g),Image.LANCZOS).save(REPO+'/public/'+n)
print('ok')
