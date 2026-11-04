import json,os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[];errors=[]
def ck(n,ok,info=None):checks.append({'name':n,'passed':bool(ok),'details':info});print(('PASS ' if ok else 'FAIL ')+n,flush=True)
with sync_playwright() as pl:
 b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page();p.on('pageerror',lambda e:errors.append(str(e)));p.set_content((R/'dist/Rafael_Brothers_M470_MANAGED_ENCOUNTERS.html').read_text());p.wait_for_function('__RBSceneComposerV1?.snapshot().installed');p.keyboard.press('Enter');p.wait_for_function('__RBRottenRoot?.managedActor')
 setup='''()=>{const src=structuredClone(__RBM470Fixture);window.__fixtureData=src;const scene=new Phaser.Scene({key:'M470WorldFixture'});scene.create=function(){this.player=this.add.rectangle(src.world.spawn.x,src.world.spawn.y,16,32,0xffffff);this.physics.add.existing(this.player,false);this.player.body.setGravityY(1400);this.player.body.setCollideWorldBounds(false);this.handles=[]};__game.scene.add('M470WorldFixture',scene,true);return true}'''
 p.evaluate(setup);p.wait_for_function("__game.scene.getScene('M470WorldFixture').player")
 result=p.evaluate('''()=>{const s=__game.scene.getScene('M470WorldFixture'),w=mountRBWorldFixture(s,__fixtureData);s.handles.push(w);const b=w.surfaces.map(x=>({id:x.id,x:x.zone.body.x,y:x.zone.body.y,w:x.zone.body.width}));const bounds=s.cameras.main._bounds;return {b,spawn:w.spawn,exit:w.exit,bounds:{x:bounds.x,y:bounds.y,width:bounds.width,height:bounds.height},pits:w.pits}}''')
 ck('JSON creates actual Phaser static bodies and camera bounds',len(result['b'])==2 and result['b'][0]['x']==0 and result['b'][1]['x']==480 and result['bounds']['width']==900,result)
 ck('spawn and exit read from JSON, pit remains free of ground',result['spawn']['x']==120 and result['exit']['x']==770 and all(r['x']+r['w']<=310 or r['x']>=480 for r in result['b']))
 initial=p.evaluate('''()=>{let s=__game.scene.getScene('M470WorldFixture');return {objects:s.children.length,statics:s.physics.world.staticBodies.size,colliders:s.physics.world.colliders.getActive().length}}''')
 ck('fixture disable removes physics and overlap colliders',p.evaluate('''()=>{let a=__game.scene.getScene('M470WorldFixture').handles[0];a.disable();return a.surfaces.every(x=>!x.zone.body.enable)&&!a.goal.body.enable}'''))
 ck('fixture reset re-enables Phaser bodies',p.evaluate('''()=>{let a=__game.scene.getScene('M470WorldFixture').handles[0];a.reset();return a.surfaces.every(x=>x.zone.body.enable)&&a.goal.body.enable}'''))
 # 16 real same-scene mount/dispose cycles, scene player remains in place.
 p.evaluate('''()=>{let s=__game.scene.getScene('M470WorldFixture');s.handles.shift().destroy()}''')
 base=p.evaluate('''()=>{let s=__game.scene.getScene('M470WorldFixture');return {objects:s.children.length,statics:s.physics.world.staticBodies.size,colliders:s.physics.world.colliders.getActive().length}}''')
 for i in range(16):
  p.wait_for_timeout(35)
  v=p.evaluate('''()=>{let s=__game.scene.getScene('M470WorldFixture'),w=mountRBWorldFixture(s,__fixtureData);w.destroy();return {objects:s.children.length,statics:s.physics.world.staticBodies.size,colliders:s.physics.world.colliders.getActive().length,scope:w.lifecycleSnapshot()}}''')
 p.wait_for_timeout(400);v2=p.evaluate("()=>{let s=__game.scene.getScene('M470WorldFixture');return {objects:s.children.length,statics:s.physics.world.staticBodies.size,colliders:s.physics.world.colliders.getActive().length}}");ck('16 fixture create/destroy cycles restore resource counts',all(v2[k]==base[k] for k in ['objects','statics','colliders']) and v['scope']['resources']==0,{'base':base,'last':v,'afterPhysicsStep':v2})
 changed=p.evaluate('''()=>{let d=structuredClone(__fixtureData),s=__game.scene.getScene('M470WorldFixture');d.world.terrain.surfaces[1].x=495;d.world.terrain.surfaces[1].w=405;d.world.finish.x=765;d.camera.bounds.width=850;let w=mountRBWorldFixture(s,d),r={x:w.surfaces[1].zone.body.x,exitX:w.goal.body.center.x,cameraWidth:s.cameras.main._bounds.width};w.destroy();return r}''')
 ck('JSON mutation affects Phaser world body, exit zone and camera',changed['x']==495 and changed['exitX']==765 and changed['cameraWidth']==850,changed)
 ck('no page errors in fixture testing',not errors,errors)
 # Explicit report is written before browser teardown; Chromium may stall on fixture scene removal.
 p.close();b.close()
report={'milestone':'M4.7.0','passed':sum(x['passed'] for x in checks),'total':len(checks),'checks':checks,'pageErrors':errors};(R/'evidence/m470-world-fixture.json').write_text(json.dumps(report,indent=2));print('TOTAL',report['passed'],'/',report['total']);raise SystemExit(0 if report['passed']==report['total'] else 1)
