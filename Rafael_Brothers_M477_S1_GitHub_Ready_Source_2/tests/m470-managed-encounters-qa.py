import json,os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[];errors=[]
def ck(name,ok,data=None):
 checks.append({'name':name,'passed':bool(ok),'details':data});print(('PASS ' if ok else 'FAIL ')+name,flush=True)
stats='''()=>{const s=__game.scene.getScene('Game');return {listeners:s.events.listenerCount('postupdate'),shutdown:s.events.listenerCount('shutdown'),colliders:s.physics.world.colliders.getActive().length,staticBodies:s.physics.world.staticBodies.size,displayObjects:s.children.length,anchors:s.tape.anchors.length,bound:__RBStageV1.snapshot().instances.filter(o=>o.bound).length,managed:__RBSceneComposerV1.snapshot().managed.length,duplicates:__RBStageAnchors.snapshot().duplicateRefs}}'''
with sync_playwright() as pl:
 b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
 p.set_content((R/'dist/Rafael_Brothers_M470_MANAGED_ENCOUNTERS.html').read_text());p.wait_for_function('__RBSceneComposerV1?.snapshot().installed');p.keyboard.press('Enter');p.wait_for_function('__RBRottenRoot?.managedActor && __RBFallingBridge?.managedActor')
 init=p.evaluate(stats);ck('five managed actors; seven Stage01 bindings',init['managed']==5 and init['bound']==7,init)
 ck('both gameplay states preserved, managed lifecycle separate',p.evaluate('''()=>__RBRottenRoot.state==='idle'&&__RBFallingBridge.snapshot().state==='idle'&&__RBRottenRoot.lifecycleState==='created'&&__RBFallingBridge.lifecycleState==='created' '''))
 for label,ref,key in [('rotten','__RBRottenRoot','rotten-root-ledge'),('falling','__RBFallingBridge','fallen-bridge-tree')]:
  data=p.evaluate('''(a)=>{let o=window[a.ref],s=__game.scene.getScene('Game');o.setEnabled(false);const off={bound:__RBStageV1.snapshot().instances.find(v=>v.id===a.key).bound,scope:o.lifecycleSnapshot(),hook:__RBStageAnchors.isActive(a.key==='rotten-root-ledge'?'rotten-root':'fallen-bridge-tree'),platform:o.zone.body.enable,collider:o.collider.active};o.setEnabled(true);return {off,on:{bound:__RBStageV1.snapshot().instances.find(v=>v.id===a.key).bound,scope:o.lifecycleSnapshot(),platform:o.zone.body.enable,collider:o.collider.active,hook:__RBStageAnchors.isActive(a.key==='rotten-root-ledge'?'rotten-root':'fallen-bridge-tree')}}}''',{'ref':ref,'key':key})
  ck(label+' disable unbinds collision, hook, stage registry',not data['off']['bound'] and not data['off']['platform'] and not data['off']['collider'] and not data['off']['hook'] and data['off']['scope']['state']=='disabled',data)
  ck(label+' reset restores original ready encounter',data['on']['bound'] and data['on']['hook'] and data['on']['scope']['state']=='created' and (data['on']['platform'] if label=='rotten' else not data['on']['platform']),data)
  p.evaluate('''(name)=>{let a=window[name];a.disable();a.reset();}''',ref)
 ck('15 in-place encounter replacements preserve physics and handles',True)
 for i in range(15):
  p.evaluate('''()=>{__RBSceneComposerV1.recreate('falling-bridge-tree');__RBSceneComposerV1.recreate('rotten-root')}''')
 after=p.evaluate(stats);checks[-1]['passed']=all(init[k]==after[k] for k in ['listeners','shutdown','colliders','staticBodies','displayObjects','anchors','bound','managed']) and not after['duplicates'];checks[-1]['details']={'initial':init,'final':after};print('15 cycle result:',checks[-1]['passed'],flush=True)
 ck('created encounter resources have no scope errors',p.evaluate('''()=>[__RBRottenRoot,__RBFallingBridge].every(a=>a.lifecycleSnapshot().errors.length===0)'''))
 for n in range(15):
  p.keyboard.press('r');p.wait_for_function(f'__RBSceneComposerV1.snapshot().attachCount==={n+2}')
 final=p.evaluate(stats);ck('15 full scene Restarts: no growth in tracked resources',all(init[k]==final[k] for k in ['listeners','shutdown','colliders','staticBodies','displayObjects','anchors','bound','managed']) and not final['duplicates'],{'initial':init,'final':final})
 p.evaluate("()=>{window.__retiredM470=[__RBRottenRoot,__RBFallingBridge];__game.scene.getScene('Game').scene.stop()}");p.wait_for_function('!__RBSceneComposerV1.snapshot().active')
 ck('shutdown clears both scopes and stage binding references',p.evaluate('''()=>__retiredM470.every(a=>a.lifecycleSnapshot().state==='destroyed'&&a.lifecycleSnapshot().resources===0)&&__RBStageV1.snapshot().instances.every(x=>!x.bound)'''))
 ck('no JS pageerror',not errors,errors)
 p.close();b.close()
report={'milestone':'M4.7.0','checks':checks,'passed':sum(c['passed'] for c in checks),'total':len(checks),'pageErrors':errors};(R/'evidence/m470-managed-encounters.json').write_text(json.dumps(report,indent=2));print('TOTAL',report['passed'], '/',report['total']);raise SystemExit(0 if report['passed']==report['total'] else 1)
