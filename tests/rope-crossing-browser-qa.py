"""M4.7.2 Phaser / Chromium checks. Truly sent keyboard events; controlled starts.
Does not claim unassisted swing clearance or full-level playthrough.
"""
import json, os, shutil, hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
OUT=R/'evidence/m472-rope-crossing-browser.json'
HTML=R/'dist/Rafael_Brothers_M472_ROPE_CROSSING_SAFETY.html'
checks=[]
profiles=[]
def check(name,passed,**details):
 checks.append(dict(name=name,passed=bool(passed),**details));print(('PASS' if passed else 'FAIL'),name,flush=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1280,'height':720});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(HTML.read_text(),wait_until='domcontentloaded',timeout=60000)
 page.wait_for_function('__game?.scene?.isActive?.("Menu")',timeout=15000)
 page.keyboard.press('Enter')
 page.wait_for_function('__RBForestExtension?.snapshot()',timeout=15000)
 static=page.evaluate('''()=>__RBRopeCrossingSafety.report()''')
 check('both gaps discovered from live Phaser colliders',static['status']=='PASS' and len(static['crossings'])==2,report=static)
 # Verify the old M471 coordinate is rejected by the SAME runtime validator (do not mutate actual game).
 old=page.evaluate('''()=>{const s=__RBRopeCrossingSafety.snapshot();s.anchors.find(a=>a.id==='stable-root-extension').x=1275;return __RBRopeCrossingSafety.validate(s)}''')
 check('old x1275 is rejected as collision sweep',old['status']=='FAIL' and any(c['code']=='REEL_SWEEP_BLOCKED' for v in old['crossings'] for c in v['checks']),report=old)
 # Phaser body per profile, real character swap with keyboard.
 for profile in ['rafi','shaul']:
  current=page.evaluate("()=>__game.scene.getScene('Game').player.activeId")
  if current!=profile:page.keyboard.press('Tab');page.wait_for_timeout(100)
  body=page.evaluate('''()=>{const s=__game.scene.getScene('Game');return {id:s.player.activeId,w:s.player.body2.width,h:s.player.body2.height}}''')
  check('character profile active '+profile,body['id']==profile and body['w']>0 and body['h']>0,body=body)
  profiles.append({'id':body['id'],'width':body['w'],'height':body['h']})
  report=page.evaluate('''()=>__RBRopeCrossingSafety.report()''')
  check('live static validation '+profile,report['status']=='PASS' and len(report['crossings'])==2,report=report)
  for mode in ['manual','classic','hybrid']:
   for pit in [{'id':'legacy', 'left':370,'right':706,'anchor':514,'ay':290},{'id':'forest-gap-02','left':1190,'right':1270,'anchor':1230,'ay':260}]:
    for side in ['left','right']:
     x=(pit['left']+body['w']/2+2) if side=='left' else (pit['right']-body['w']/2-2)
     y=490+body['h']/2+min(body['h']/4,170/4)
     page.evaluate('''({mode,x,y,ax,ay})=>{
       const s=__game.scene.getScene('Game');globalThis.__RBSwingMode=mode;
       s.tape.reset();s.player.respawn(x,y);s.player.body2.setVelocity(0,0);
       const a=s.tape.anchors.find(a=>a.x===ax && a.y===ay);
       if(!a)throw Error('Real tape anchor not mounted');
       s.tape.anchor=a;s.tape.recent=a;
       s.tape.length=Math.hypot(a.x-s.player.body2.center.x,a.y-s.player.body2.center.y);
       s.player.tethered=true;
     }''',dict(mode=mode,x=x,y=y,ax=pit['anchor'],ay=pit['ay']))
     page.wait_for_timeout(60)
     before=page.evaluate('''()=>{const s=__game.scene.getScene('Game');return {attached:s.tape.attached,length:s.tape.length,position:{x:s.player.body2.center.x,y:s.player.body2.center.y},blocked:{...s.player.body2.blocked},mode:globalThis.__RBSwingMode,anchor:s.tape.anchor&&{x:s.tape.anchor.x,y:s.tape.anchor.y}}}''')
     page.keyboard.down('ArrowUp');page.wait_for_timeout(250)
     after=page.evaluate('''()=>{const s=__game.scene.getScene('Game');return {attached:s.tape.attached,length:s.tape.length,position:{x:s.player.body2.center.x,y:s.player.body2.center.y},blocked:{...s.player.body2.blocked},mode:globalThis.__RBSwingMode,anchor:s.tape.anchor&&{x:s.tape.anchor.x,y:s.tape.anchor.y}}}''')
     page.keyboard.up('ArrowUp')
     ok=before['attached'] and after['attached'] and after['length']<before['length']-2
     check(f'reel {profile}/{mode}/{pit["id"]}/{side}',ok,before=before,after=after)
 # Negative control: reproduce the original failure IN Phaser, temporarily using the
 # old anchor x, then restore the stable registered object (never write Stage JSON).
 if page.evaluate("()=>__game.scene.getScene('Game').player.activeId")!='rafi':page.keyboard.press('Tab');page.wait_for_timeout(75)
 page.evaluate('''()=>{const s=__game.scene.getScene('Game');s.tape.reset();s.player.respawn(1256,546.5);s.player.body2.setVelocity(0,0);
   globalThis.__M472Diag=[];const original=s.tape.toast;
   s.tape.toast=function(message){globalThis.__M472Diag.push(String(message));return original(message)};
   s.tape.__m472OriginalToast=original;
   const a=s.__rbStageAnchors.getRef('stable-root-extension');a.x=1275;
   s.tape.anchor=a;s.tape.recent=a;s.tape.length=Math.hypot(a.x-s.player.body2.center.x,a.y-s.player.body2.center.y);s.player.tethered=true;
 }''')
 page.wait_for_timeout(40);page.keyboard.down('ArrowUp');page.wait_for_timeout(220);page.keyboard.up('ArrowUp')
 negative=page.evaluate('''()=>{const s=__game.scene.getScene('Game');const res={attached:s.tape.attached,diagnostics:[...globalThis.__M472Diag],blocked:{...s.player.body2.blocked}};
   s.tape.reset();s.__rbStageAnchors.getRef('stable-root-extension').x=1230;s.tape.toast=s.tape.__m472OriginalToast;delete s.tape.__m472OriginalToast;
   return res;}''')
 check('actual old x1275 collision causes safe release in Phaser',not negative['attached'] and any('blocked by roots' in t for t in negative['diagnostics']),negative=negative)
 # Real manual-mode swing steering on the existing tape, preserving one attached actor.
 for mode in ['manual','classic','hybrid']:
  page.evaluate('''mode=>{const s=__game.scene.getScene('Game');globalThis.__RBSwingMode=mode;s.tape.reset();s.player.respawn(1225,519);s.player.body2.setVelocity(0,0);
   const a=s.__rbStageAnchors.getRef('stable-root-extension');s.tape.anchor=a;s.tape.recent=a;s.tape.length=Math.hypot(a.x-s.player.body2.center.x,a.y-s.player.body2.center.y);s.player.tethered=true;}''',mode)
  page.keyboard.down('ArrowLeft');page.wait_for_timeout(120);page.keyboard.up('ArrowLeft')
  swing=page.evaluate('''()=>{const s=__game.scene.getScene('Game');return {attached:s.tape.attached,velocity:{x:s.player.body2.velocity.x,y:s.player.body2.velocity.y},mode:globalThis.__RBSwingMode}}''')
  check('real keyboard swing steer '+mode,swing['attached'] and abs(swing['velocity']['x'])>0.01,swing=swing)
 # Check extending tape while attached and E voluntary release on real key events.
 page.evaluate('''()=>{const s=__game.scene.getScene('Game');globalThis.__RBSwingMode='manual';s.tape.reset();s.player.respawn(1230,535);s.player.body2.setVelocity(0,0);const a=s.tape.anchors.find(a=>a.x===1230&&a.y===260);s.tape.anchor=a;s.tape.recent=a;s.tape.length=300;s.player.tethered=true;}''')
 before=page.evaluate("()=>__game.scene.getScene('Game').tape.length")
 page.keyboard.down('ArrowDown');page.wait_for_timeout(220);page.keyboard.up('ArrowDown')
 extended=page.evaluate("()=>__game.scene.getScene('Game').tape.length")
 check('keyboard ArrowDown extends tape',extended>before+2,before=before,after=extended)
 page.keyboard.press('KeyE');page.wait_for_timeout(120)
 check('keyboard E voluntary detach',not page.evaluate("()=>__game.scene.getScene('Game').tape.attached"))
 # lifecycle/restart: verify Stage runtime and colliders come back without duplication
 for repeat in range(3):
  page.keyboard.press('KeyR');page.wait_for_function('__RBForestExtension?.snapshot()&&__game.scene.isActive("Game")',timeout=15000)
  state=page.evaluate('''()=>{const s=__game.scene.getScene('Game');const v=__RBRopeCrossingSafety.report();return {surfaces:s.world.solidRects.length,report:v.status,crossings:v.crossings.length,duplicates:s.__rbStageAnchors?.snapshot()?.duplicateRefs||[]}}''')
  check(f'restart cycle {repeat+1} retains geometry and anchors',state['surfaces']==4 and state['report']=='PASS' and state['crossings']==2 and not state['duplicates'],state=state)
 # Disabled static geometry / hook must never be mistakenly certified as active.
 page.evaluate('__RBForestExtension.disable()')
 off=page.evaluate('__RBRopeCrossingSafety.report()')
 check('disabled extension collision reports NOT TESTED',off['status']=='NOT TESTED',report=off)
 page.evaluate('__RBForestExtension.reset()');page.wait_for_timeout(100)
 check('extension reset restores live validator PASS',page.evaluate('__RBRopeCrossingSafety.report().status')=='PASS')
 page.evaluate("__RBStageAnchors.setActive('stable-root-extension',false)")
 off=page.evaluate('__RBRopeCrossingSafety.report()')
 check('disabled mandatory anchor reports NOT TESTED',off['status']=='NOT TESTED',report=off)
 page.evaluate("__RBStageAnchors.clearOverride('stable-root-extension')")
 check('anchor reset restores live validator PASS',page.evaluate('__RBRopeCrossingSafety.report().status')=='PASS')
 check('no JavaScript page errors',not errors,errors=errors)
 browser.close()
OUT.parent.mkdir(exist_ok=True)
sha=lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
OUT.write_text(json.dumps({'milestone':'M4.7.2','browser':'chromium',
 'baselineSha256':sha(R/'baseline/M46_RELEASE.html'), 'stageSha256':sha(R/'stages/s01.stage.json'),
 'htmlSha256':sha(HTML), 'profiles':profiles,'scope':'controlled start, actual keyboard input, real Phaser update','checks':checks},indent=2)+'\n')
print('TOTAL',sum(v['passed'] for v in checks),'/',len(checks),flush=True)
raise SystemExit(0 if all(v['passed'] for v in checks) else 1)
