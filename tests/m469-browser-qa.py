"""M4.6.9 browser regression QA: reachability from regular gameplay, natural exit, web response."""
import json,shutil,os
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
HTML=(R/'dist/Rafael_Brothers_M469_MANAGED_ANCHORS.html').read_text()
results=[]
def ck(name,good,**more):
    results.append(dict(name=name,passed=bool(good),**more));print(('PASS ' if good else 'FAIL ')+name,flush=True)
def wait(p,x,timeout=10000):p.wait_for_function(x,timeout=timeout)
def fixture(p,x,y,gear=()):
    p.evaluate('''([x,y,gear])=>{let s=__game.scene.getScene('Game');if(s.tape.attached)s.tape.release();s.player.respawn(x,y);s.player.body2.setVelocity(0,0);s.player.body2.updateCenter();for(const t of gear)s.pickups.gear.add(t);s.tape.grounded()}''',[x,y,list(gear)]);p.wait_for_timeout(150)
with sync_playwright() as sw:
    b=sw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    p=b.new_page(viewport={'width':1280,'height':800});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
    p.set_content(HTML,wait_until='domcontentloaded',timeout=60000)
    wait(p,'window.__game?.scene?.isActive?.("Menu") && window.__RBExitGroveInstalled && window.__RBWebResponseInstalled',30000)
    p.keyboard.press('Enter');wait(p,'window.__game?.scene?.isActive?.("Game") && window.__RBFallingBridge?.snapshot() && window.__RBExitGrove?.snapshot()',25000)
    p.wait_for_timeout(250)
    try:
        ck('new falling tree is active by default, before the pit',p.evaluate('__RBFallingBridge.snapshot().enabled && __RBFallingBridge.snapshot().state==="idle" && __RBFallingBridge.snapshot().geometry.x<370'))
        gate=p.evaluate('__RBExitGrove.snapshot()')
        ck('green portal/glow hidden; natural roots active',gate['legacyGateHidden'] and gate['glowHidden'] and gate['portalType']=='root-grove',gate=gate)
        ck('natural gate completion threshold moved beyond fragile shelf',gate['exitX']>946-1)
        ck('parallax and ambience still active',p.evaluate('__RBForestParallax.snapshot().enabled && __RBForestAmbience.snapshot().enabled'))
        ck('local web response enabled by default',p.evaluate('__RBWebResponse.snapshot().enabled'))
        # Gameplay: rotten branch on left bank can warn and collapse without debug toggles.
        fixture(p,330,490,gear=())
        wait(p,'__RBFallingBridge.snapshot().state==="warning"',2800)
        ck('standing near pit triggers tree warning in normal mode',p.evaluate('__RBFallingBridge.snapshot().state')=='warning')
        wait(p,'__RBFallingBridge.snapshot().state==="collapsed"',4300)
        fb=p.evaluate('__RBFallingBridge.snapshot()')
        ck('falling branch creates short platform with safe rope gap',fb['platformActive'] and fb['clearance']>=150,fallen=fb)
        p.screenshot(path=str(R/'evidence/m469-falling-tree.png'))
        p.keyboard.press('r');wait(p,'__RBFallingBridge.snapshot().state==="idle"',8000)
        ck('restart resets near-side tree',p.evaluate('__RBFallingBridge.snapshot().state')=='idle')
        # Exit zone at former x=844 no longer ends game.
        fixture(p,868,490,gear=())
        p.wait_for_timeout(600)
        ck('player can pass old early-finish trigger alive',p.evaluate('__game.scene.getScene("Game").finished')==False)
        ck('fragile exit tree still intact when player is at x868',p.evaluate('__RBRottenRoot.snapshot().state')=='idle')
        p.screenshot(path=str(R/'evidence/m469-natural-exit.png'))
        # Gate should not finish above its portal while on rotten shelf.
        fixture(p,902,378,gear=())
        wait(p,'__RBRottenRoot.snapshot().state==="warning"',3000)
        ck('fragile tree near new exit is reachable before finishing',p.evaluate('!__game.scene.getScene("Game").finished && __RBRottenRoot.snapshot().state==="warning"'))
        wait(p,'__RBRottenRoot.snapshot().state==="collapsed"',4000)
        ck('fragile exit tree can collapse while play continues',p.evaluate('!__game.scene.getScene("Game").finished && __RBRottenRoot.snapshot().state==="collapsed"'))
        p.keyboard.press('r');wait(p,'__RBRottenRoot.snapshot().state==="idle"',8000)
        # Finishing now requires traveling through the grove.
        fixture(p,917,490,gear=())
        ck('exit still pending before new far-edge trigger',p.evaluate('!__game.scene.getScene("Game").finished'))
        p.evaluate('''()=>{window.__exitTrace=[];let s=__game.scene.getScene('Game');const f=()=>{let b=s.player.body2;__exitTrace.push({x:s.player.x,y:s.player.y,bx:b.x,by:b.y,w:b.width,h:b.height,enabled:b.enable,blocked:b.blocked.down,won:s.world.won,guards:__RBExitGrove.snapshot().guards});if(__exitTrace.length>=180||s.finished)s.events.off('postupdate',f)};s.events.on('postupdate',f)}''')
        p.keyboard.down('ArrowRight');wait(p,'__game.scene.getScene("Game").finished',5000);p.keyboard.up('ArrowRight')
        ck('new right-edge grove finishes stage',p.evaluate('__game.scene.getScene("Game").finished'))
        # web response: local tension test (separate restarted scene).
        p.keyboard.press('r');wait(p,'__game.scene.getScene("Game").finished===false',8000)
        fixture(p,335,490,gear=['tape'])
        h=p.evaluate('''()=>{let s=__game.scene.getScene('Game');s.tape.toggle();return s.tape.anchor?{x:s.tape.anchor.x,y:s.tape.anchor.y}:null}''')
        ck('original pit anchor preserved and prioritized',h is not None and abs(h['x']-514)<1,anchor=h)
        p.keyboard.down('ArrowRight');p.wait_for_timeout(1200);p.keyboard.up('ArrowRight')
        wr=p.evaluate('__RBWebResponse.snapshot()')
        ck('local web response bounded by small amplitude',abs(wr['deflection'])<=3.6 and wr['maxDeflection']==3.5,response=wr)
        p.click('#rb-stage-tab')
        webbutton=p.locator('#rb-m464-web-response-toggle')
        ck('web response configurable in stage module panel',webbutton.count()==1 and webbutton.is_visible())
        webbutton.click();ck('web response toggle disables',p.evaluate('__RBWebResponse.snapshot().enabled')==False)
        webbutton.click();ck('web response re-enables',p.evaluate('__RBWebResponse.snapshot().enabled')==True)
        p.click('#rb-stage-tab')
        p.keyboard.press('r');wait(p,'__game.scene.getScene("Game").finished===false && __RBExitGrove.snapshot().legacyGateHidden',8000)
        fixture(p,108,490,gear=());wait(p,'__game.scene.getScene("Game").__rbStickyWeb.sim.contacts>0',5500)
        ck('sticky web still detects player',p.evaluate('__game.scene.getScene("Game").__rbStickyWeb.snapshot().touching'))
        fixture(p,332,490,gear=());p.keyboard.down('Space')
        wait(p,'__game.scene.getScene("Game").__rbEggSac.sim.hatched===1',5500);p.keyboard.up('Space')
        ck('egg sac still releases seven spiderlings',p.evaluate('__game.scene.getScene("Game").__rbEggSac.snapshot().total')==7)
        ck('no JS errors',not errors,errors=errors)
    except Exception as e:ck('harness completed',False,error=repr(e),errors=errors,diagnostics=p.evaluate('''()=>{let s=__game.scene.getScene('Game');return {trace:window.__exitTrace,x:s.player.x,y:s.player.y,finished:s.finished,active:s.sys.isActive(),paused:s.sys.isPaused(),velocity:{x:s.player.body2.velocity.x,y:s.player.body2.velocity.y},exit:__RBExitGrove.snapshot(),composition:__RBSceneComposerV1.snapshot()}}'''))
    b.close()
report={'version':'M4.6.9','passed':sum(a['passed'] for a in results),'total':len(results),'checks':results,'pageErrors':errors,'disclosure':'QA uses targeted position and equipment fixtures; actual Phaser update/collision and keyboard traversal are active; not an end-to-end manual run.'}
(R/'evidence/m469-browser-qa.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
print('FINAL',report['passed'],'/',report['total']);raise SystemExit(0 if report['passed']==report['total'] else 1)
