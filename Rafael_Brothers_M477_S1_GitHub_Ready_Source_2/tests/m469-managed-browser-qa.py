"""Real Phaser resource ownership, replacement, scene-unload and parity checks."""
import os,shutil,json,hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[];errors=[]
def ck(name,ok,details=None):
 checks.append(dict(name=name,passed=bool(ok),details=details));print(('PASS ' if ok else 'FAIL ')+name,flush=True)
def boot(browser,path):
 p=browser.new_page(viewport={'width':1280,'height':800});p.on('pageerror',lambda e:(errors.append(str(e)),print('PAGEERROR',e,flush=True)))
 p.set_content(path.read_text(),wait_until='domcontentloaded');p.wait_for_function('__RBSceneComposerV1?.snapshot().installed');p.keyboard.press('Enter');p.wait_for_function('__RBBridgePolish && __RBStageDressing && __RBStageAnchors');return p
stats='''()=>{const s=__game.scene.getScene('Game');return {post:s.events.listenerCount('postupdate'),shutdown:s.events.listenerCount('shutdown'),destroy:s.events.listenerCount('destroy'),colliders:s.physics.world.colliders.getActive().length,bodies:s.physics.world.staticBodies.size,children:s.children.length,anchors:s.tape.anchors.length,duplicates:__RBStageAnchors.snapshot().duplicateRefs,managed:__RBSceneComposerV1.snapshot().managed}}'''
art='''()=>({root:JSON.stringify(__RBBridgePolish.root.commandBuffer),broken:JSON.stringify(__RBBridgePolish.broken.commandBuffer),soil:JSON.stringify(__RBStageDressing.soil.commandBuffer),vines:JSON.stringify(__RBStageDressing.vines.commandBuffer),bounds:__RBBridgePolish.snapshot().bounds})'''
with sync_playwright() as pl:
 b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 old=boot(b,R/'archive/M467_source_immutable/dist/Rafael_Brothers_M467_UNIFIED_LIFECYCLE.html');oldart=old.evaluate(art);old.close()
 p=boot(b,R/'dist/Rafael_Brothers_M469_MANAGED_ANCHORS.html');p.wait_for_function('__RBBridgePolish.snapshot().legacyDisabled')
 ck('all four graphics command buffers and bridge geometry match M467',p.evaluate(art)==oldart)
 initial=p.evaluate(stats);ck('three registered managed actor instances',len(initial['managed'])==3 and all(x['state']=='created' for x in initial['managed']),initial)
 p.click('#rb-stage-tab');p.locator('#rb-m461-dressing-toggle').click();p.wait_for_function('__RBStageDressing.state==="disabled"')
 ck('panel dressing OFF hides both graphics',p.evaluate('!__RBStageDressing.soil.visible && !__RBStageDressing.vines.visible'))
 p.keyboard.press('r');p.wait_for_function('__RBSceneComposerV1.snapshot().attachCount===2');p.wait_for_function('__RBStageDressing.state==="disabled"')
 ck('persistent panel keeps dressing disabled after restart',p.evaluate('!__RBStageDressing.soil.visible && document.querySelectorAll("#rb-m461-dressing-toggle").length===1'))
 p.locator('#rb-m461-dressing-toggle').click();p.wait_for_function('__RBStageDressing.state==="created"');p.click('#rb-stage-tab')
 ck('same panel control enables replacement actor',p.evaluate('__RBStageDressing.soil.visible && __RBStageDressing.vines.visible'))
 # Put actual tape on the bridge-specific hook before disabling the owner.
 p.evaluate('''()=>{const s=__game.scene.getScene('Game'),a=__RBStageAnchors.getRef('stable-root-bridge');s.tape.anchor=a;s.tape.attached=true;__RBBridgePolish.disable()}''')
 ck('managed disable removes collider/body/anchor and releases attached tape',p.evaluate('''()=>{const s=__game.scene.getScene('Game');return !__RBBridgePolish.collider.active&&!__RBBridgePolish.zone.body.enable&&!__RBStageAnchors.isActive('stable-root-bridge')&&!s.tape.attached&&!__RBStageV1.snapshot().instances.find(x=>x.id==='living-root-shelf').bound}'''))
 p.evaluate('__RBBridgePolish.reset()');ck('reset restores existing bridge, binding and unique hook',p.evaluate('__RBBridgePolish.collider.active && __RBBridgePolish.zone.body.enable && __RBStageAnchors.isActive("stable-root-bridge") && !__RBStageAnchors.snapshot().duplicateRefs.length'))
 before=p.evaluate(stats)
 result=p.evaluate('''()=>{const s=__game.scene.getScene('Game'),a=__RBBridgePolish,soil=__RBStageDressing;
 a.disable();a.destroy();a.destroy();soil.destroy();soil.destroy();
 const stopped={post:s.events.listenerCount('postupdate'),colliders:s.physics.world.colliders.getActive().filter(c=>c.active).length,refs:!window.__RBBridgePolish&&!s.__rbBridgePolish&&!window.__RBStageDressing&&!s.__rbStageDressing,states:[a.state,soil.state],resources:[a.scope.snapshot(),soil.scope.snapshot()]};
 __RBSceneComposerV1.recreate('bridge-polish');__RBSceneComposerV1.recreate('stage-dressing');return stopped}''')
 ck('destroy disabled actors clears runtime refs and all owned scopes',result['refs'] and result['states']==['destroyed','destroyed'] and all(x['resources']==0 and not x['errors'] for x in result['resources']),result)
 ck('destroy removes each actor update listener immediately',result['post']==before['post']-2)
 p.wait_for_function('__RBStageAnchors.isActive("stable-root-bridge")')
 for n in range(15):
  p.evaluate('''()=>{for(const id of ['bridge-polish','stage-dressing']){let a=__RBSceneComposerV1.recreate(id);a.disable();a.reset()}}''')
 p.wait_for_function('__RBStageAnchors.isActive("stable-root-bridge")');after=p.evaluate(stats)
 ck('15 replacement cycles do not grow listeners, colliders, bodies, objects or anchors',all(after[k]==before[k] for k in ['post','shutdown','destroy','colliders','bodies','children','anchors']) and not after['duplicates'],{'before':before,'after':after})
 ck('lifecycle transitions bounded and stage tagged',p.evaluate('__RBSceneComposerV1.snapshot().transitions.length<=64 && __RBSceneComposerV1.snapshot().transitions.every(x=>x.stageId===__RBStageV1.stageId)'))
 # Tiny independent actual Phaser scene, no authored game stage.
 probe=p.evaluate('''()=>{
 const scene=new Phaser.Scene({key:'M468Probe'});window.__m469Probe={runs:[],dead:[]};
 scene.create=function(){const refs={},anchors=[],events=new Phaser.Events.EventEmitter();let ticks=0;
 const a=createRBManagedActor({id:'probe',scene:this,create:scope=>{
  const g=scope.gameObject(this.add.graphics());g.fillStyle(0xffffff).fillRect(0,0,8,8);
  const z=scope.gameObject(this.add.zone(20,20,10,10));this.physics.add.existing(z,true);scope.body(z.body);
  scope.collider(this.physics.add.collider(z,z));scope.listen(events,'probe',()=>ticks++);
  scope.timer(this.time.addEvent({delay:20,loop:true,callback:()=>events.emit('probe')}));
  scope.anchor(anchors,{id:'probe-anchor'});scope.reference(refs,'actor',g);
  const stage={bindRuntime:(t,id,v)=>refs.stage=v,unbindRuntime:(t,id,v)=>{if(refs.stage===v)refs.stage=null}};
  scope.binding(stage,'probe','one',g);return {graphics:g};}});
 __m469Probe.runs.push({a,refs,anchors,events});this.events.once('shutdown',()=>__m469Probe.dead.push({resources:a.scope.snapshot(),refs:!refs.actor&&!refs.stage,anchors:anchors.length,listeners:events.listenerCount('probe')}));};
 __game.scene.add('M468Probe',scene,true);return true;}''')
 p.wait_for_function('__m469Probe.runs.length===1')
 for n in range(4):
  p.evaluate("()=>{__game.scene.stop('M468Probe');return true}");p.wait_for_function(f'__m469Probe.dead.length==={n+1}',timeout=5000);print('probe stopped',n,flush=True)
  if n<3:p.evaluate("()=>{__game.scene.start('M468Probe');return true}");p.wait_for_function(f'__m469Probe.runs.length==={n+2}',timeout=5000);print('probe started',n,flush=True)
 ck('four actual test-scene unloads clear timers/listeners/anchors/refs/scopes',p.evaluate('__m469Probe.dead.every(x=>x.resources.resources===0&&!x.resources.errors.length&&x.refs&&x.anchors===0&&x.listeners===0)'),p.evaluate('__m469Probe.dead'))
 ck('stopped test scene has zero physics colliders/bodies and display objects',p.evaluate('''()=>{const s=__game.scene.getScene('M468Probe');return s.children.length===0&&(!s.physics.world||(s.physics.world.staticBodies.size===0&&s.physics.world.colliders.getActive().length===0))}'''))
 p.evaluate("()=>{__game.scene.remove('M468Probe');return true}")
 # Capture retired instances before stop; restart via real scene manager.
 p.evaluate("()=>{window.__m469Retired=[__RBBridgePolish,__RBStageDressing];__game.scene.stop('Game');return true}")
 p.wait_for_function('!__RBSceneComposerV1.snapshot().active')
 ck('Game stop destroys managed actors and clears all stage bindings',p.evaluate('__m469Retired.every(a=>a.state==="destroyed"&&a.scope.snapshot().resources===0)&&__RBStageV1.snapshot().instances.every(x=>!x.bound)'))
 p.evaluate("()=>{__game.scene.start('Game');return true}");p.wait_for_function('__RBBridgePolish && __RBStageDressing && __RBSceneComposerV1.snapshot().active')
 ck('Game start after stop restores all seven stage bindings',p.evaluate('__RBStageV1.snapshot().instances.every(x=>x.bound)'))
 ck('recording and export APIs preserved',p.evaluate('typeof __RBTelemetry.start==="function" && typeof __RBTelemetry.exportJson==="function" && typeof __RBSceneComposerV1.exportDiagnostics==="function"'))
 ck('no unhandled JavaScript errors',not errors,errors);b.close()
report=dict(version='M4.6.9',passed=sum(x['passed'] for x in checks),total=len(checks),checks=checks,pageErrors=errors,method='Actual Phaser in Chromium; targeted fixtures, real DOM panel and scene manager; not a full human playthrough')
(R/'evidence/m469-managed-browser-qa.json').write_text(json.dumps(report,indent=2));print('TOTAL',report['passed'],'/',report['total']);raise SystemExit(0 if report['passed']==report['total'] else 1)
