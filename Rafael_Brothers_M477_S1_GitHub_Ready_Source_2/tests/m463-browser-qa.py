"""M4.6.3: actual Phaser/Chromium checks for three authored environmental anchors."""
import json,os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
html=(R/'dist/Rafael_Brothers_M463_ENVIRONMENTAL_ANCHORS.html').read_text()
results=[]
def ck(label,passed,**data):
    results.append({'label':label,'passed':bool(passed),**data});print(('PASS ' if passed else 'FAIL ')+label,flush=True)
def wait(p,js,t=12000):p.wait_for_function(js,timeout=t)
def setup(p,x,y,gear=('tape',)):
    p.evaluate('''([x,y,gear])=>{const s=__game.scene.getScene('Game');if(s.tape.attached)s.tape.release();s.player.respawn(x,y);s.player.body2.setVelocity(0,0);s.player.body2.updateCenter();for(const it of gear)s.pickups.gear.add(it);s.tape.grounded()}''',[x,y,list(gear)])
    p.wait_for_timeout(150)
def hook(p):
    return p.evaluate('''()=>{const s=__game.scene.getScene('Game');s.tape.grounded();s.tape.toggle();return {attached:s.tape.attached,anchor:s.tape.anchor?{x:s.tape.anchor.x,y:s.tape.anchor.y}:null};}''')
with sync_playwright() as pl:
    b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    p=b.new_page(viewport={'width':1280,'height':800});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
    p.set_content(html,wait_until='domcontentloaded',timeout=60000)
    wait(p,'window.__game?.scene?.isActive?.("Menu") && window.__RBStageAnchorsInstalled && window.__RBRottenRootInstalled',30000)
    p.keyboard.press('Enter')
    wait(p,'window.__game?.scene?.isActive?.("Game") && window.__RBStageAnchors?.snapshot().entryCount>=4',30000)
    p.wait_for_timeout(180)
    try:
        snap=p.evaluate('__RBStageAnchors.snapshot()')
        ck('registry has 3 active environmental anchors + original',snap['stage']=='s01' and snap['entryCount']==4 and snap['originalCount']==1 and len(snap['anchors'])==4,snap=snap)
        ck('stable tree/bridge and fragile root authored',[(x['kind'],x['strength']) for x in snap['anchors']]==[('tree','stable'),('bridge','stable'),('tree','fragile'),('tree','fragile')])
        ck('new falling-tree variant is disabled by default',snap['anchors'][3]['active']==False and p.evaluate('__RBFallingBridge.snapshot().enabled')==False)
        ck('no duplicated anchor references',snap['duplicateRefs']==[])
        ck('M4.6 depth and original atmosphere survive',p.evaluate('__RBForestParallax.snapshot().enabled && __RBForestAmbience.snapshot().enabled'))
        ck('approved M4.6.1 walkable bridge geometry unchanged',p.evaluate('__RBBridgePolish.snapshot().bounds.w')==169)
        # Select each anchor from real existing TapeMeasure based on distance.
        for label,x,y,ax,ay in [('living tree near start',145,490,105,250),('original pit anchor still preferred at pit lip',330,490,514,290),('root bridge at far bank',810,490,790,350),('fragile root near gate',905,490,920,330)]:
            setup(p,x,y)
            h=hook(p)
            ck('tape selects '+label,h['attached'] and h['anchor'] and abs(h['anchor']['x']-ax)<1 and abs(h['anchor']['y']-ay)<1,hook=h)
        # Bridge toggles synchronize with anchor removal. Release if currently attached.
        setup(p,810,490);hook(p)
        p.click('#rb-stage-tab');p.click('#rb-m46-bridges-toggle');p.wait_for_timeout(180)
        status=p.evaluate('''()=>({anchor:__RBStageAnchors.snapshot().anchors.find(x=>x.id==='stable-root-bridge'),attached:__game.scene.getScene('Game').tape.attached})''')
        ck('turning off bridges removes anchor and safely releases tape',status['anchor']['active']==False and status['attached']==False,state=status)
        p.click('#rb-m46-bridges-toggle');p.wait_for_timeout(120)
        ck('turning bridges back on restores its anchor',p.evaluate('__RBStageAnchors.isActive("stable-root-bridge")'))
        # Hazard toggle only affects fragile anchor, not stable ones
        p.locator('#rb-module-hazards summary').click()
        p.click('#rb-m462-rotten-toggle');p.wait_for_timeout(150)
        status=p.evaluate('__RBStageAnchors.snapshot()')
        ck('hollow-tree module OFF removes only its own anchor',not status['anchors'][2]['active'] and status['anchors'][0]['active'] and status['anchors'][1]['active'])
        p.click('#rb-m462-rotten-toggle');p.wait_for_timeout(120)
        ck('hollow-tree module ON restores fragile anchor',p.evaluate('__RBStageAnchors.isActive("rotten-root")'))
        p.click('#rb-stage-tab')
        # Reset after hook-selection fixtures; these may have activated the exit gate.
        p.keyboard.press('r');wait(p,'__game.scene.getScene("Game").finished===false && __RBRottenRoot.snapshot().state==="idle"',8000)
        # Test standing -> collapse (uses fixture) and ensure only rotten anchor is removed.
        setup(p,900,378,gear=());wait(p,'__RBRottenRoot.snapshot().state==="warning"',2800)

        ck('standing on rotten shelf triggers creak and warning',p.evaluate('__RBRottenRoot.snapshot().audioEvents.some(x=>x.type==="groan")'))
        wait(p,'__RBRottenRoot.snapshot().state==="collapsed"',4000)
        snap=p.evaluate('__RBStageAnchors.snapshot()');rot=p.evaluate('__RBRottenRoot.snapshot()')
        ck('collapse removes fragile reference only, stable tree and bridge stay',not snap['anchors'][2]['active'] and snap['anchors'][0]['active'] and snap['anchors'][1]['active'],snap=snap)
        ck('fallen tree collider replaces old shelf',rot['floorColliderActive'] and not rot['colliderActive'])
        p.screenshot(path=str(R/'evidence/m463-collapse.png'))
        # restart
        p.keyboard.press('r');wait(p,'__RBRottenRoot.snapshot().state==="idle" && __RBStageAnchors.snapshot().entryCount===4',8000)
        ck('restart cleans up and reinstalls all anchors once',p.evaluate('__RBStageAnchors.snapshot().duplicateRefs.length===0 && __RBStageAnchors.snapshot().entryCount===4'))
        setup(p,900,490);hook(p)
        p.keyboard.down('ArrowLeft');p.wait_for_timeout(800);p.keyboard.up('ArrowLeft')
        wait(p,'__RBRottenRoot.snapshot().state==="collapsed"',4800)
        rot=p.evaluate('__RBRottenRoot.snapshot()')
        ck('pull with tape still collapses hollow tree',rot['trigger']=='tape' and any(e['type']=='collapse' for e in rot['audioEvents']),state=rot)
        p.keyboard.press('r');wait(p,'__RBRottenRoot.snapshot().state==="idle"',8000)
        # Optional tree: collapse produces a *short* bridge fragment but does not span pit.
        p.click('#rb-stage-tab');p.locator('#rb-module-hazards').evaluate('(e)=>e.open=true');p.click('#rb-m463-falling-toggle',timeout=5000);p.click('#rb-stage-tab')
        wait(p,'__RBFallingBridge.snapshot().enabled===true && __RBStageAnchors.isActive("fallen-bridge-tree")',2500)
        ck('optional falling bridge toggle enables authored hook',p.evaluate('__RBFallingBridge.snapshot().anchorActive'))
        setup(p,330,490,gear=());wait(p,'__RBFallingBridge.snapshot().state==="warning"',2800)
        ck('falling tree warns with crack sound',p.evaluate('__RBFallingBridge.snapshot().sounds.some(x=>x.type==="groan")'))
        wait(p,'__RBFallingBridge.snapshot().state==="collapsed"',3900)
        fb=p.evaluate('__RBFallingBridge.snapshot()')
        ck('fallen tree becomes a partial walking bridge only',fb['platformActive'] and fb['safe'] and fb['clearance']>=150 and not fb['anchorActive'],state=fb)
        p.screenshot(path=str(R/'evidence/m463-fallen-bridge.png'))
        setup(p,430,380,gear=());p.wait_for_timeout(800)
        landed=p.evaluate('''()=>{let s=__game.scene.getScene('Game');return {x:s.player.x,y:s.player.y,vy:s.player.body2.velocity.y,blocked:s.player.body2.blocked.down}}''')
        ck('actual player can land on fallen one-way bridge over start of pit',abs(landed['y']-459)<3 and landed['blocked'],landed=landed)
        p.keyboard.press('r');wait(p,'__RBFallingBridge.snapshot().state==="idle" && __RBStageAnchors.isActive("fallen-bridge-tree")',8500)
        ck('restart resets experimental tree and restores anchor',p.evaluate('__RBFallingBridge.snapshot().state==="idle"'))
        p.click('#rb-stage-tab');p.locator('#rb-module-hazards').evaluate('(e)=>e.open=true');p.click('#rb-m463-falling-toggle',timeout=5000);p.click('#rb-stage-tab');p.wait_for_timeout(100)
        ck('switching variant OFF cleans up its anchor and collider',p.evaluate('__RBFallingBridge.snapshot().enabled===false && __RBFallingBridge.snapshot().platformActive===false && !__RBStageAnchors.isActive("fallen-bridge-tree")'))
        # inherited encounters and win
        setup(p,108,490,gear=());wait(p,'__game.scene.getScene("Game").__rbStickyWeb.sim.contacts>0',5000)
        ck('sticky web preserved',p.evaluate('__game.scene.getScene("Game").__rbStickyWeb.snapshot().touching'))
        setup(p,332,490,gear=());p.keyboard.down('Space');wait(p,'__game.scene.getScene("Game").__rbEggSac.sim.hatched===1',5000);p.keyboard.up('Space')
        ck('seven spiderlings preserved',p.evaluate('__game.scene.getScene("Game").__rbEggSac.snapshot().total')==7)
        setup(p,785,490,gear=());p.keyboard.down('Space');p.wait_for_timeout(960);p.keyboard.up('Space');p.wait_for_timeout(160)
        ck('far bank living bridge still walkable',abs(p.evaluate('__game.scene.getScene("Game").player.y')-399)<3)
        setup(p,855,490,gear=());p.keyboard.down('ArrowRight');wait(p,'__game.scene.getScene("Game").finished',6500);p.keyboard.up('ArrowRight')
        ck('level gate still finishes',p.evaluate('__game.scene.getScene("Game").finished'))
        ck('no JavaScript errors',not errors,errors=errors)
    except Exception as exc:
        ck('QA harness stopped',False,error=str(exc),errors=errors)
    b.close()
report={'release':'M4.6.3','passed':sum(x['passed'] for x in results),'total':len(results),'checks':results,'pageErrors':errors,'fixtureDisclosure':'Focused respawn and gear fixtures; direct tape.toggle() to avoid unreliable headless E focus; real keyboard movement/jump/restart/finish.'}
(R/'evidence/m463-browser-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(f"FINAL {report['passed']}/{report['total']}")
raise SystemExit(0 if report['passed']==report['total'] else 1)
