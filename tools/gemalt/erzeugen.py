# Erzeugt src/assets/gemalt/*.svg und src/lib/gemaltliste.ts aus b1..b4
import os, json, sys
sys.path.insert(0, os.path.dirname(__file__))
from b1 import B as B1
from b2 import B as B2
from b3 import B as B3
from b4 import B as B4
ZIEL=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'assets', 'gemalt')
os.makedirs(ZIEL, exist_ok=True)
BEW={
 'wackeln':'.k{transform-origin:50px 92px;animation:w 2.6s ease-in-out infinite alternate}@keyframes w{from{transform:rotate(-2.5deg)}to{transform:rotate(2.5deg)}}',
 'atmen':'.k{transform-origin:50px 92px;animation:a 2.4s ease-in-out infinite alternate}@keyframes a{to{transform:scale(1.035,.975)}}',
 'schweben':'.k{animation:s 2.2s ease-in-out infinite alternate}@keyframes s{from{transform:translateY(2px)}to{transform:translateY(-3px)}}',
 'huepfen':'.k{transform-origin:50px 92px;animation:h .9s cubic-bezier(.3,0,.5,1) infinite alternate}@keyframes h{to{transform:translateY(-6px)}}',
 'rattern':'.k{animation:r .22s linear infinite alternate}@keyframes r{to{transform:translateY(-1.2px)}}',
 'schaukeln':'.k{transform-origin:50px 60px;animation:sk 2.4s ease-in-out infinite alternate}@keyframes sk{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}',
 'baumeln':'.k{transform-origin:50px 8px;animation:b 2.2s ease-in-out infinite alternate}@keyframes b{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}',
 'leuchten':'.k{transform-origin:50px 92px;animation:a 2.4s ease-in-out infinite alternate}@keyframes a{to{transform:scale(1.02,.985)}}',
}
TEILE=('.schein{animation:sch 1.8s ease-in-out infinite alternate}@keyframes sch{from{opacity:.15}to{opacity:.45}}'
 '.schwing{animation:sw 1.8s ease-in-out infinite alternate}@keyframes sw{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}'
 '.dreh{animation:dr 2s ease-in-out infinite alternate}@keyframes dr{from{transform:scaleX(1)}to{transform:scaleX(-1)}}'
 '.flamme{animation:fl .5s ease-in-out infinite alternate}@keyframes fl{to{transform:scale(.9,1.1) rotate(3deg)}}'
 '.funkel{animation:fu 1.4s ease-in-out infinite alternate}@keyframes fu{from{opacity:.4}}'
 '@media (prefers-reduced-motion:reduce){*{animation:none!important}}')
liste=[]
ids=set()
for (id_,name,gruppe,bew,inhalt) in B1+B2+B3+B4:
    assert id_ not in ids, id_; ids.add(id_)
    stil=BEW[bew]+TEILE
    svg=(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>{stil}</style>'
         f'<ellipse cx="50" cy="94" rx="34" ry="3.6" fill="#3a2414" opacity=".13"/><g class="k">{inhalt.strip()}</g></svg>')
    svg=svg.replace('transform-origin:', 'transform-box:view-box;transform-origin:') if 'transform-box' not in svg else svg
    open(f'{ZIEL}/{id_}.svg','w').write(svg)
    liste.append({'id':id_,'name':name,'group':gruppe})
ts='// Selbst gezeichnete Bilder (Stil wie GemalteFigur), erzeugt mit tools/gemalt/erzeugen.py\nimport type { IconInfo } from \'./iconliste\'\n\nexport const GEMALT_LIST: IconInfo[] = [\n'
ts+=''.join(f'  {{ id: {json.dumps(x["id"])}, name: {json.dumps(x["name"],ensure_ascii=False)}, group: {json.dumps(x["group"],ensure_ascii=False)} }},\n' for x in liste)
ts+=']\n'
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'lib', 'gemaltliste.ts'),'w').write(ts)
from collections import Counter
print(len(liste), Counter(x['group'] for x in liste))
