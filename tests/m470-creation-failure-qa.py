"""Fault injection verifies rollback of partial allocations. Never replace a live anchor registry."""
import json,os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[];errors=[]
with sync_playwright() as pl:
 b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for id,prop,binding,hook in [('rotten-root','__RBRottenRoot','rotten-root-ledge','rotten-root'),('falling-bridge-tree','__RBFallingBridge','fallen-bridge-tree','fallen-bridge-tree')]:
  p=b.new_page();p.on('pageerror',lambda e:errors.append(str(e)));p.set_content((R/'dist/Rafael_Brothers_M470_MANAGED_ENCOUNTERS.html').read_text());p.wait_for_function('__RBSceneComposerV1?.snapshot().installed');p.keyboard.press('Enter');p.wait_for_function('__RBRottenRoot?.managedActor&&__RBFallingBridge?.managedActor')
  result=p.evaluate('''(arg)=>{const s=__game.scene.getScene('Game'),a=window[arg.prop],pre={children:s.children.length,static:s.physics.world.staticBodies.size,colliders:s.physics.world.colliders.getActive().length},fn=s.physics.add.collider;let reason=null;s.physics.add.collider=function(){throw Error('injected creation fault')};try{__RBSceneComposerV1.recreate(arg.id)}catch(e){reason=e.message}finally{s.physics.add.collider=fn}return {reason,old:a.lifecycleSnapshot(),current:window[arg.prop]||null,bound:__RBStageV1.snapshot().instances.find(x=>x.id===arg.binding).bound,hookActive:__RBStageAnchors.isActive(arg.hook),pre,post:{children:s.children.length,static:s.physics.world.staticBodies.size,colliders:s.physics.world.colliders.getActive().length}}}''',{'id':id,'prop':prop,'binding':binding,'hook':hook})
  p.wait_for_timeout(250)
  result['settled']=p.evaluate("()=>{const s=__game.scene.getScene('Game');return {children:s.children.length,static:s.physics.world.staticBodies.size,colliders:s.physics.world.colliders.getActive().length}}")
  ok=(result['reason']=='injected creation fault' and result['old']['destroyed'] and result['old']['resources']==0 and result['current'] is None and not result['bound'] and result['settled']['children']<=result['pre']['children'] and result['settled']['static']<=result['pre']['static'] and result['settled']['colliders']<=result['pre']['colliders'])
  checks.append({'name':id+' partial creation failure cleans allocated objects/bodies/refs','passed':ok,'details':result});print(('PASS ' if ok else 'FAIL ')+id+' partial creation rollback',flush=True);p.close()
 b.close()
checks.append({'name':'no unhandled page errors','passed':not errors,'details':errors})
report={'milestone':'M4.7.0','passed':sum(v['passed'] for v in checks),'total':len(checks),'checks':checks};(R/'evidence/m470-creation-failure.json').write_text(json.dumps(report,indent=2));print('TOTAL',report['passed'],'/',report['total']);raise SystemExit(0 if report['passed']==report['total'] else 1)
