import os,shutil,json
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];out=[]
with sync_playwright() as pl:
 b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,file in [('M467','archive/M467_source_immutable/dist/Rafael_Brothers_M467_UNIFIED_LIFECYCLE.html'),('M468','dist/Rafael_Brothers_M468_MANAGED_ACTORS.html')]:
  p=b.new_page();p.set_content((R/file).read_text());p.wait_for_function('__RBSceneComposerV1?.snapshot().installed');p.keyboard.press('Enter');p.wait_for_function('__RBExitGrove && __RBBridgePolish');p.evaluate('''()=>{const s=__game.scene.getScene('Game');s.player.respawn(917,490);s.player.body2.setVelocity(0,0);s.player.body2.updateCenter()}''');p.wait_for_timeout(150)
  p.keyboard.down('ArrowRight');rows=[]
  for i in range(100):
   p.wait_for_timeout(36);q=p.evaluate('''()=>{let s=__game.scene.getScene('Game'),r=s.player.body2;return {x:s.player.x,y:s.player.y,bx:r.x,by:r.y,bw:r.width,bh:r.height,vy:r.velocity.y,gate:s.world.level.gate,finished:s.finished,guards:__RBExitGrove.snapshot().guards}}''');rows.append(q)
   if q['finished'] or q['x']<900:break
  p.keyboard.up('ArrowRight');out.append(dict(version=name,passed=any(q['finished'] for q in rows),rows=rows));print(name,json.dumps(out[-1]),flush=True);p.close()
 b.close()
(R/'evidence/m468-exit-parity-qa.json').write_text(json.dumps(out,indent=2))

raise SystemExit(0 if all(x['passed'] for x in out) else 1)
