"""Non-authoritative fixed-scene Chromium FPS comparative smoke."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,shutil
R=Path(__file__).resolve().parents[1]
cases={'M4.6':R/'baseline/M46_RELEASE.html','M4.6.1':R/'dist/Rafael_Brothers_M461_FOREST_POLISH_STAGE_MODULES.html'}
results={}
with sync_playwright() as pl:
 b=pl.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader'])
 for name,fp in cases.items():
  pg=b.new_page(viewport={'width':1280,'height':800})
  pg.set_content(fp.read_text(),wait_until='domcontentloaded',timeout=60000)
  pg.wait_for_function('__game?.scene?.isActive?.("Menu")',timeout=22000);pg.keyboard.press('Enter')
  pg.wait_for_function('__game?.scene?.isActive?.("Game") && __RBForestParallax?.snapshot().readyLayers.length===3',timeout=22000)
  pg.wait_for_timeout(650)
  meas=[]
  for _ in range(2):
   x=pg.evaluate('''()=>new Promise(res=>{const a=__game.loop.frame,st=performance.now();setTimeout(()=>res({frames:__game.loop.frame-a,ms:performance.now()-st}),1100)})''')
   meas.append(round(x['frames']/(x['ms']/1000),1))
  results[name]=meas;pg.close()
 b.close()
(R/'evidence/m461-performance.json').write_text(json.dumps({'environment':'Linux headless Chromium/SwiftShader software rendering 1280x800, 2x 1.1s warm sampling each; not target device or full game benchmark','fps':results},indent=2))
print(results)
