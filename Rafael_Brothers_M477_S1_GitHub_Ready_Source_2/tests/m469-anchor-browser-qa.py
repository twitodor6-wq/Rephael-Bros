import os,shutil,json
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[];errors=[]
def ck(name,ok,d=None):checks.append(dict(name=name,passed=bool(ok),details=d));print(('PASS ' if ok else 'FAIL ')+name,flush=True)
with sync_playwright() as pl:
 b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 p=b.new_page();p.on('pageerror',lambda e:errors.append(str(e)));p.set_content((R/'dist/Rafael_Brothers_M469_MANAGED_ANCHORS.html').read_text());p.wait_for_function('__RBSceneComposerV1?.snapshot().installed');p.keyboard.press('Enter');p.wait_for_function('__RBStageAnchors?.managedActor && __RBFallingBridge')
 stats='''()=>{let s=__game.scene.getScene('Game');return {post:s.events.listenerCount('postupdate'),shutdown:s.events.listenerCount('shutdown'),destroy:s.events.listenerCount('destroy'),colliders:s.physics.world.colliders.getActive().length,bodies:s.physics.world.staticBodies.size,anchors:s.tape.anchors.length,managed:__RBSceneComposerV1.snapshot().managed.length,bound:__RBStageV1.snapshot().instances.filter(x=>x.bound).length}}'''
 initial=p.evaluate(stats);ck('three managed modules and all seven Stage01 bindings',initial['managed']==3 and initial['bound']==7,initial)
 info=p.evaluate('''()=>{let r=__RBStageAnchors,s=__game.scene.getScene('Game');window.__anchorRefs=r.config.anchors.map(x=>r.getRef(x.id));window.__originalAnchorList=s.tape.anchors.slice();let old=s.tape.release;s.tape.release=function(){window.__releaseCalls=(window.__releaseCalls||0)+1;this.anchor=null;throw Error('injected partial release')};s.tape.anchor=__anchorRefs[0];s.tape.attached=true;r.disable();let result={attached:s.tape.attached,anchor:s.tape.anchor,own:s.tape.anchors.filter(x=>__anchorRefs.includes(x)).length,error:r.scope.snapshot().errors};s.tape.release=old;r.reset();return result}''')
 ck('failed partial release clears attached flag and all owned hook refs',not info['attached'] and info['anchor'] is None and info['own']==0 and bool(info['error']),info)
 ck('reset restores same hook identities in same selection order',p.evaluate('''()=>{let r=__RBStageAnchors,s=__game.scene.getScene('Game');return r.config.anchors.every((m,i)=>r.getRef(m.id)===__anchorRefs[i])&&s.tape.anchors.every((x,i)=>x===__originalAnchorList[i])}'''))
 p.evaluate('''()=>{let r=__RBStageAnchors,s=__game.scene.getScene('Game'),ref=r.getRef('stable-tree-start');s.tape.anchors.push(ref);r.sync()}''');ck('duplicate identity normalized by registry sync',p.evaluate('!__RBStageAnchors.snapshot().duplicateRefs.length'))
 p.evaluate('''()=>{let s=__game.scene.getScene('Game');s.tape.anchor=__RBStageAnchors.getRef('stable-root-bridge');s.tape.attached=true;__RBBridgePolish.disable()}''');ck('bridge disable releases bridge hook while registry remains managed',p.evaluate('!__game.scene.getScene("Game").tape.attached&&!__RBStageAnchors.isActive("stable-root-bridge")'));p.evaluate('__RBBridgePolish.reset()')
 # Full restarts refresh legacy actors that capture the old registry; no unsafe in-place recreation API is exposed.
 for n in range(15):
  p.evaluate("()=>{__game.scene.getScene('Game').scene.restart();return true}");p.wait_for_function(f'__RBSceneComposerV1.snapshot().attachCount==={n+2} && __RBStageAnchors?.state==="created"')
 final=p.evaluate(stats);ck('15 real restarts keep listener/body/collider/anchor counts stable',all(initial[k]==final[k] for k in initial),{'initial':initial,'final':final})
 ck('new epochs contain no inherited cleanup errors',p.evaluate('__RBSceneComposerV1.snapshot().managed.every(x=>!x.errors.length)'))
 p.evaluate("()=>{window.__retiredAnchors=__RBStageAnchors;let s=__game.scene.getScene('Game');s.tape.anchor=__RBStageAnchors.getRef('stable-tree-start');s.tape.attached=true;s.scene.stop();return true}");p.wait_for_function('!__RBSceneComposerV1.snapshot().active')
 ck('scene stop destroys registry and clears all runtime bindings',p.evaluate('__retiredAnchors.state==="destroyed"&&__retiredAnchors.scope.snapshot().resources===0&&__RBStageV1.snapshot().instances.every(x=>!x.bound)'))
 ck('no browser JS exceptions',not errors,errors);b.close()
report=dict(version='M4.6.9',passed=sum(x['passed'] for x in checks),total=len(checks),checks=checks,pageErrors=errors)
(R/'evidence/m469-anchor-browser-qa.json').write_text(json.dumps(report,indent=2));print('TOTAL',report['passed'],'/',report['total']);raise SystemExit(0 if report['passed']==report['total'] else 1)
