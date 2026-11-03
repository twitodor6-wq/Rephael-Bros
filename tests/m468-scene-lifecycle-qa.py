"""Actual Phaser scene restart stress test of the unified M4.6.8 composition root."""
import os,shutil,json
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
checks=[];errors=[]
def ck(name,ok,details=None):
 checks.append({'name':name,'passed':bool(ok),'details':details});print(('PASS ' if ok else 'FAIL ')+name,flush=True)
with sync_playwright() as pl:
 browser=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1280,'height':800});page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content((R/'dist/Rafael_Brothers_M468_MANAGED_ACTORS.html').read_text(),wait_until='domcontentloaded')
 page.wait_for_function('window.__game?.scene?.isActive?.("Menu") && window.__RBSceneComposerV1?.snapshot().installed',timeout=30000)
 snap=page.evaluate('__RBSceneComposerV1.snapshot()')
 ck('all seven actors registered before Game starts',snap['expected']==snap['registered'] and len(snap['registered'])==7,snap)
 ck('no legacy actor create monkey-patches installed',snap['legacyScenePatches']==[])
 page.keyboard.press('Enter');page.wait_for_function('window.__game?.scene?.isActive?.("Game") && __RBSceneComposerV1.snapshot().active',timeout=30000)
 init=page.evaluate('''()=>({scene:__RBSceneComposerV1.snapshot(),stage:__RBStageV1.snapshot(),
  anchors:__RBStageAnchors.snapshot(),post:__game.scene.getScene('Game').events.listenerCount('postupdate'),
  shutdown:__game.scene.getScene('Game').events.listenerCount('shutdown')})''')
 ck('composition is in documented order, exactly once',init['scene']['actors']==init['scene']['expected'] and init['scene']['attachCount']==1)
 ck('all seven JSON objects bound with no duplicate tape anchors',all(x['bound'] for x in init['stage']['instances']) and not init['anchors']['duplicateRefs'])
 ck('only one composition root patched Phaser scene.create',page.evaluate('''()=>{const p=Object.getPrototypeOf(__game.scene.getScene('Game'));return !!p.__rbM467CompositionPatched && !p.__rbM461BridgePatched && !p.__rbM461DressPatched && !p.__rbM463EnvironmentalAnchorsPatched && !p.__rbM462RottenPatched && !p.__rbM463FallingTreePatched && !p.__rbM464ExitPatched && !p.__rbM464WebPatched}'''))
 history=[]
 for n in range(1,6):
  page.keyboard.press('r')
  page.wait_for_function(f'__RBSceneComposerV1.snapshot().attachCount>={n+1} && __RBSceneComposerV1.snapshot().active',timeout=15000)
  item=page.evaluate('''()=>({scene:__RBSceneComposerV1.snapshot(),stage:__RBStageV1.snapshot(),
   anchor:__RBStageAnchors.snapshot(),post:__game.scene.getScene('Game').events.listenerCount('postupdate'),
   shutdown:__game.scene.getScene('Game').events.listenerCount('shutdown')})''');history.append(item)
  ck(f'restart {n}: one active actor instance per JSON prefab',item['scene']['actors']==init['scene']['actors'] and item['scene']['attachCount']==n+1 and item['scene']['shutdownCount']==n and all(x['bound'] for x in item['stage']['instances']))
  ck(f'restart {n}: anchor identities unique, listener counts stable',not item['anchor']['duplicateRefs'] and item['post']<=init['post'] and item['shutdown']<=init['shutdown'],{'post':item['post'],'shutdown':item['shutdown'],'anchors':item['anchor']['duplicateRefs']})
 # Exit to Menu: verify stage registry is not left referencing an unloaded scene.
 page.evaluate("()=>{__game.scene.getScene('Game').scene.stop();return true}")
 page.wait_for_function('!__RBSceneComposerV1.snapshot().active',timeout=10000)
 stop=page.evaluate('''()=>({scene:__RBSceneComposerV1.snapshot(),bound:__RBStageV1.snapshot().instances.filter(x=>x.bound).length})''')
 ck('scene.stop cleans up composition epoch',stop['scene']['shutdownCount']==6 and stop['scene']['active']==False,stop)
 ck('no stale prefab runtime bindings after Game scene unload',stop['bound']==0,stop)
 ck('no uncaught browser JavaScript exceptions',not errors,errors)
 browser.close()
report={'version':'M4.6.8','passed':sum(c['passed'] for c in checks),'total':len(checks),'checks':checks,'pageErrors':errors,'method':'Playwright/Chromium, Phaser Game scene with real restarts and stop'}
(R/'evidence/m468-scene-lifecycle-qa.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
print('TOTAL',report['passed'],'/',report['total']);raise SystemExit(0 if report['passed']==report['total'] else 1)
