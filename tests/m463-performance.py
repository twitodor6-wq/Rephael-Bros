"""Non-authoritative headless Chromium fixed-scene responsiveness comparison."""
import json,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
cases={'M4.6.2':R/'dist/Rafael_Brothers_M462_ROTTEN_ROOT_ANCHOR.html','M4.6.3':R/'dist/Rafael_Brothers_M463_ENVIRONMENTAL_ANCHORS.html'}
results={}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader'])
 for name,filename in cases.items():
  page=b.new_page(viewport={'width':1280,'height':800});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(filename.read_text(),wait_until='domcontentloaded',timeout=60000)
  page.wait_for_function('__game?.scene?.isActive?.("Menu")',timeout=25000);page.keyboard.press('Enter')
  page.wait_for_function('__game?.scene?.isActive?.("Game") && __RBForestParallax?.snapshot().readyLayers.length===3',timeout=30000)
  page.wait_for_timeout(550)
  samples=[]
  for _ in range(3):
   q=page.evaluate('''()=>new Promise(res=>{const f=__game.loop.frame,t=performance.now();setTimeout(()=>res({frames:__game.loop.frame-f,ms:performance.now()-t}),1000)})''')
   samples.append(round(q['frames']*1000/q['ms'],1))
  results[name]={'fps_samples':samples,'mean_fps':round(sum(samples)/len(samples),1),'pageErrors':errors}
  page.close()
 b.close()
(R/'evidence/m463-performance.json').write_text(json.dumps({'notes':'Software-rendered headless Chromium Linux 1280x800, sequential fixed-scene, 3x1 second windows each, NOT a Safari or target-device benchmark','results':results},indent=2))
print(results)
