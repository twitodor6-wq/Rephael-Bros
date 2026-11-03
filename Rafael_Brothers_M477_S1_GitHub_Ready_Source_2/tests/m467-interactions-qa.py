"""Focused M4.6.7 runtime toggle, collider, anchor-release and restart audit."""
import json,shutil,os
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
checks=[];errors=[]
def ck(name,yes):checks.append({'name':name,'passed':bool(yes)});print(('PASS ' if yes else 'FAIL ')+name,flush=True)
with sync_playwright() as pl:
 b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 p=b.new_page(viewport={'width':1280,'height':800});p.on('pageerror',lambda e:errors.append(str(e)))
 p.set_content((R/'dist/Rafael_Brothers_M467_UNIFIED_LIFECYCLE.html').read_text(),wait_until='domcontentloaded')
 p.wait_for_function('__game?.scene?.isActive?.("Menu") && !!__RBStageV1',timeout=30000);p.keyboard.press('Enter')
 p.wait_for_function('__game?.scene?.isActive?.("Game") && !!__RBExitGrove && !!__RBFallingBridge',timeout=30000)
 init=p.evaluate('''()=>({active:__RBStageAnchors.isActive('fallen-bridge-tree'),counts:__RBStageAnchors.snapshot().duplicateRefs,listener:__game.scene.getScene('Game').events.listenerCount('postupdate'),bound:__RBStageV1.snapshot().instances.filter(x=>x.bound).length})''')
 ck('initial authored falling-tree hook active, without duplicates',init['active'] and not init['counts'])
 ck('all seven authored prefabs bound',init['bound']==7)
 p.evaluate('''()=>{const t=__RBFallingBridge;t.setEnabled(false);__RBStageAnchors.sync()}''')
 off=p.evaluate('''()=>{const t=__RBFallingBridge,s=__game.scene.getScene('Game');return {anchor:__RBStageAnchors.isActive('fallen-bridge-tree'),zone:t.zone.body.enable,coll:t.collider.active,art:t.graphics.visible,hint:t.hint.visible,attached:s.tape.anchors.includes(__RBStageAnchors.getRef('fallen-bridge-tree'))}}''')
 ck('falling-tree OFF unregisters physical tape anchor',not off['anchor'] and not off['attached'])
 ck('falling-tree OFF deactivates Arcade collider and body',not off['zone'] and not off['coll'])
 ck('falling-tree OFF hides graphics and warning',not off['art'] and not off['hint'])
 p.evaluate('''()=>{__RBFallingBridge.setEnabled(true);__RBStageAnchors.sync()}''')
 on=p.evaluate('''()=>({anchor:__RBStageAnchors.isActive('fallen-bridge-tree'),visible:__RBFallingBridge.graphics.visible,state:__RBFallingBridge.snapshot().state,duplicates:__RBStageAnchors.snapshot().duplicateRefs})''')
 ck('falling-tree re-enable restores hook and intact appearance',on['anchor'] and on['visible'] and on['state']=='idle' and not on['duplicates'])
 p.keyboard.press('r');p.wait_for_function('''__game.scene.getScene('Game').__rbFallingBridge?.snapshot().state==='idle' && __RBExitGrove && __RBStageV1.snapshot().instances.every(x=>x.bound)''',timeout=15000)
 restarted=p.evaluate('''()=>({counts:__RBStageAnchors.snapshot().duplicateRefs,listener:__game.scene.getScene('Game').events.listenerCount('postupdate'),exitX:__RBExitGrove.snapshot().exitX,hook:__RBStageAnchors.isActive('fallen-bridge-tree')})''')
 ck('restart restores single active tree anchor',not restarted['counts'] and restarted['hook'])
 ck('restart keeps authored exit and no growing postupdate listener count',restarted['exitX']==946 and restarted['listener']<=init['listener'])
 ck('no browser JavaScript exceptions',not errors)
 b.close()
report={'release':'M4.6.7','checks':checks,'passed':sum(c['passed'] for c in checks),'total':len(checks),'errors':errors,'source':'Playwright/Chromium actual Phaser scene, controlled component toggles and restart'}
(R/'evidence/m467-interactions-qa.json').write_text(json.dumps(report,indent=2))
print('TOTAL',report['passed'],'/',report['total']);raise SystemExit(0 if report['passed']==report['total'] else 1)
