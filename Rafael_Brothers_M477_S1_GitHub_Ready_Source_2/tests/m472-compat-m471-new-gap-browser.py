"""Actual Phaser keyboard jump across the new forest gap (controlled start on east bank)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import shutil,json,os
R=Path(__file__).resolve().parents[1]; checks=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1280,'height':720});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 p.set_content((R/'dist/Rafael_Brothers_M472_ROPE_CROSSING_SAFETY.html').read_text(),wait_until='domcontentloaded');p.wait_for_function('__game?.scene?.isActive?.("Menu")');p.keyboard.press('Enter');p.wait_for_function('__RBForestExtension?.snapshot()')
 # Standing on the last pixels of the east bank, ready for controlled live keyboard jump.
 p.evaluate('''()=>{let s=__game.scene.getScene('Game');s.player.respawn(1180,490);s.player.body2.setVelocity(0,0);s.tape.grounded();}''');p.wait_for_timeout(150)
 pos=p.evaluate('''()=>{let s=__game.scene.getScene('Game'),b=s.player.body2;return {x:s.player.x,y:s.player.y,blocked:b.blocked.down,v:b.velocity.y}}''')
 print('start',pos,flush=True)
 p.keyboard.down('ArrowRight');p.keyboard.down('Space');p.wait_for_timeout(440);p.keyboard.up('Space')
 series=[]
 for i in range(30):
  p.wait_for_timeout(90)
  sample=p.evaluate('''()=>{const s=__game.scene.getScene('Game'),b=s.player.body2;return {x:s.player.x,y:s.player.y,vx:b.velocity.x,vy:b.velocity.y,ground:b.blocked.down,finished:s.finished}}''');series.append(sample)
  if sample['x']>=1425 and sample['ground']:break
 p.keyboard.up('ArrowRight')
 end=series[-1]
 good=max(v['x'] for v in series)>1310 and any(v['x']>=1280 and v['ground'] for v in series)
 checks.append({'name':'controlled live keyboard jump across 80px forest root gap','passed':good,'initial':pos,'final':end,'maxX':max(v['x'] for v in series),'samples':series})
 print(('PASS ' if good else 'FAIL ')+'actual jump new forest gap',end,flush=True)
 checks.append({'name':'no runtime exceptions','passed':not errors,'errors':errors})
 p.screenshot(path=str(R/'evidence/M472_COMPAT_SECOND_GAP_LANDING.png'))
 b.close()
(R/'evidence/m472-compat-m471-new-gap-browser.json').write_text(json.dumps(checks,indent=2))
raise SystemExit(0 if all(c['passed'] for c in checks) else 1)
