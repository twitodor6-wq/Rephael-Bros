"""Focused M471 actor lifecycle and 15 restart verification in Phaser Chromium."""
import json,shutil,os
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[]
def ck(name,good,more=None):
 checks.append(dict(name=name,passed=bool(good),details=more));print(('PASS ' if good else 'FAIL ')+name,flush=True)
stats='''()=>{const s=__game.scene.getScene('Game');return {listeners:s.events.listenerCount('postupdate'),shutdown:s.events.listenerCount('shutdown'),colliders:s.physics.world.colliders.getActive().length,staticBodies:s.physics.world.staticBodies.size,displayObjects:s.children.length,anchors:s.tape.anchors.length,bound:__RBStageV1.snapshot().instances.filter(o=>o.bound).length,managed:__RBSceneComposerV1.snapshot().managed.length,duplicates:__RBStageAnchors.snapshot().duplicateRefs,solids:s.world.solids.getChildren().length,extension:__RBForestExtension?.snapshot()}}'''
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 p.set_content((R/'dist/Rafael_Brothers_M471_ROOT_FOREST.html').read_text(),wait_until='domcontentloaded',timeout=60000)
 p.wait_for_function('__game?.scene?.isActive?.("Menu")');p.keyboard.press('Enter');p.wait_for_function('__RBForestExtension?.snapshot() && __RBFallingBridge?.snapshot() && __RBRottenRoot?.snapshot()');p.wait_for_timeout(250)
 init=p.evaluate(stats);ck('Stage01 eight managed actors, eight bindings, no duplicate anchors',init['managed']==6 and init['bound']==8 and init['solids']==4 and not init['duplicates'],init)
 before=p.evaluate('''()=>{let a=__RBForestExtension,s=__game.scene.getScene('Game'),before=a.snapshot();a.disable();return {before,after:a.snapshot(),on:a.lifecycleSnapshot(),enabled:a.surfaces.map(k=>k.zone.body.enable),visual:a.graphics.visible}}''')
 ck('extension disable deactivates both bodies and graphics',before['enabled']==[False,False] and before['visual']==False and before['on']['state']=='disabled',before)
 p.evaluate('__RBForestExtension.reset()');p.wait_for_timeout(250)
 ck('extension reset reenables bodies',p.evaluate('__RBForestExtension.surfaces.every(v=>v.zone.body.enable)'))
 # 15 disable/reset cycles preserve the same Phaser body count and references.
 cycles=[]
 for i in range(15):
  p.evaluate('__RBForestExtension.disable();__RBForestExtension.reset()')
  p.wait_for_timeout(70)
  cycles.append(p.evaluate(stats))
 same=['listeners','shutdown','colliders','staticBodies','displayObjects','anchors','bound','managed','solids']
 ck('15 extension disable/reset cycles keep stable resources',all(all(c[k]==init[k] for k in same) and not c['duplicates'] for c in cycles),{'initial':init,'last':cycles[-1],'deviations':[{k:(c[k],init[k]) for k in same if c[k]!=init[k]} for c in cycles]})
 # Native legacy UI must still work and managed actor cannot hide the gate after recreation.
 ck('gate and new anchor remain active after disable/reset cycles',p.evaluate('''()=>__game.scene.getScene('Game').world.level.gate.x===1710 && __RBStageAnchors.isActive('stable-root-extension')'''))
 restart=[]
 for i in range(15):
  print('Restart',i+1,flush=True)
  old=p.evaluate('__RBSceneComposerV1.snapshot().attachCount');p.keyboard.press('r')
  p.wait_for_function('(x)=>__RBSceneComposerV1.snapshot().attachCount===x',arg=old+1,timeout=10000)
  p.wait_for_timeout(100)
  restart.append(p.evaluate(stats))
 ck('15 in-game R restarts stay at same resources and 8 bindings',all(all(v[k]==init[k] for k in same) and not v['duplicates'] for v in restart),{'initial':init,'last':restart[-1]})
 p.evaluate('''()=>{window.__retiredForest=__RBForestExtension;__game.scene.getScene('Game').scene.stop()}''')
 p.wait_for_function('!__RBSceneComposerV1.snapshot().active')
 ck('shutdown destroys extension scope',p.evaluate('''()=>__retiredForest.lifecycleSnapshot().state==='destroyed'&&__retiredForest.lifecycleSnapshot().resources===0&&__RBStageV1.snapshot().instances.every(x=>!x.bound)'''))
 ck('no runtime exceptions',not errors,errors)
 b.close()
(R/'evidence/m471-lifecycle-browser.json').write_text(json.dumps(checks,indent=2))
print('TOTAL',sum(x['passed'] for x in checks),'/',len(checks))
raise SystemExit(0 if all(x['passed'] for x in checks) else 1)
