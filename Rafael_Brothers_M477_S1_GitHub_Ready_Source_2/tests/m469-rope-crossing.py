"""Regression: preserve original pit anchor and cross in all Swing Lab modes.
Narrow fixture: tape equipped and player at x460; steering is real keyboard.
"""
import os,shutil,json
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
html=(R/'dist/Rafael_Brothers_M469_MANAGED_ANCHORS.html').read_text()
checks=[]
with sync_playwright() as pl:
 b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for mode in ('manual','classic','hybrid'):
  p=b.new_page(viewport={'width':1280,'height':800});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  try:
   p.set_content(html,wait_until='domcontentloaded',timeout=60000)
   p.wait_for_function('__game?.scene?.isActive?.("Menu") && __RBStageAnchorsInstalled && __RBRottenRootInstalled',timeout=30000)
   p.evaluate('(v)=>window.__RB_QA_RENDER_ISOLATION=v',os.environ.get('RB_QA_RENDER_ISOLATION')=='1')
   p.keyboard.press('Enter');p.wait_for_function('__game?.scene?.isActive?.("Game") && __RBStageAnchors.snapshot().entryCount>=4',timeout=25000)
   p.evaluate('''(m)=>{const s=__game.scene.getScene('Game');__RBSwingLab.setMode(m);if(window.__RB_QA_RENDER_ISOLATION)s.sys.settings.visible=false;s.pickups.gear.add('tape');s.player.respawn(460,490);s.tape.grounded();s.tape.toggle();}''',mode)
   attach=p.evaluate('''()=>{const s=__game.scene.getScene('Game');return {on:s.tape.attached,x:s.tape.anchor?.x,y:s.tape.anchor?.y}}''')
   p.keyboard.down('ArrowRight');maxx=460;released=False;rel=None
   for i in range(125):
    p.wait_for_timeout(36)
    q=p.evaluate('''()=>{const s=__game.scene.getScene('Game');return {x:s.player.x,y:s.player.y,vx:s.player.body2.velocity.x,vy:s.player.body2.velocity.y,attached:s.tape.attached,win:s.finished}}''')
    maxx=max(maxx,q['x'])
    if not released and q['x']>=635 and q['vx']>=220 and q['vy']<150 and q['attached']:
      rel=q.copy();p.evaluate('__game.scene.getScene("Game").tape.release()');released=True
    if released and (q['x']>=730 or q['win']):break
   p.keyboard.up('ArrowRight')
   good=attach['on'] and attach['x']==514 and attach['y']==290 and released and maxx>=730 and not errors
   checks.append({'mode':mode,'passed':bool(good),'originalAnchor':attach,'released':released,'releaseAt':rel,'maxX':round(maxx,1),'pageErrors':errors})
   print(('PASS ' if good else 'FAIL ')+mode+' pit swing',round(maxx,1),flush=True)
  except Exception as ex:
   checks.append({'mode':mode,'passed':False,'error':str(ex),'pageErrors':errors});print('FAIL',mode,str(ex),flush=True)
  finally:p.close()
 b.close()
report={'release':'M4.6.9','checks':checks,'passed':sum(bool(c['passed']) for c in checks),'total':len(checks),'renderIsolation':os.environ.get('RB_QA_RENDER_ISOLATION')=='1','fixtureDisclosure':'Optional rendering isolation; Controlled x460 fixture; Game scene rendering disabled only for software-renderer timing isolation; RAF, Phaser physics, tape, keyboard input remain live. No simulation stepping or physics modification.'}
(R/'evidence/m469-rope-crossing.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('TOTAL',report['passed'], '/', report['total'])
raise SystemExit(0 if report['passed']==report['total'] else 1)
