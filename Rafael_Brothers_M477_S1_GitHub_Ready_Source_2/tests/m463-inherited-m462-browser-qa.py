"""M4.6.2 browser QA: rotten root prototype + regressions for existing stage systems."""
import json,os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
html=(R/'dist/Rafael_Brothers_M463_ENVIRONMENTAL_ANCHORS.html').read_text()
results=[]
def check(msg,b,**kw):
    results.append(dict(name=msg,passed=bool(b),**kw)); print(('PASS ' if b else 'FAIL ')+msg,flush=True)
def wait(p,expr,t=13000): p.wait_for_function(expr,timeout=t)
def fixture(p,x,y,gear=[]):
    p.evaluate('([x,y,gear])=>{const s=__game.scene.getScene("Game");s.player.respawn(x,y);for(const g of gear)s.pickups.gear.add(g)}',[x,y,gear]); p.wait_for_timeout(80)
with sync_playwright() as pl:
  b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
  p=b.new_page(viewport={'width':1280,'height':800}); errors=[]; p.on('pageerror',lambda e:errors.append(str(e)))
  p.set_content(html,wait_until='domcontentloaded',timeout=60000)
  wait(p,'window.__game?.scene?.isActive?.("Menu") && window.__RBStagePanelInstalled && window.__RBRottenRootInstalled',30000)
  p.keyboard.press('Enter')
  wait(p,'window.__game?.scene?.isActive?.("Game") && window.__RBRottenRoot?.snapshot().anchorActive!==undefined',25000)
  p.wait_for_timeout(350)
  try:
    state=p.evaluate('''()=>({panel:__RBStagePanel.snapshot(),rot:__RBRottenRoot.snapshot(),bridge:__RBBridgePolish.snapshot(),web:__game.scene.getScene('Game').__rbStickyWeb?.snapshot(),egg:__game.scene.getScene('Game').__rbEggSac?.snapshot()})''')
    check('sidebar now mounts eight active toggles including rotten root',len(state['panel']['mounted'])==9 and 'rb-m462-rotten-toggle' in state['panel']['mounted'],ids=state['panel']['mounted'])
    check('rotten root starts enabled and intact',state['rot']['enabled'] and state['rot']['state']=='idle' and state['rot']['anchorActive'])
    p.click('#rb-stage-tab'); p.locator('#rb-module-hazards summary').click(); p.wait_for_timeout(120)
    p.click('#rb-m462-rotten-toggle'); p.wait_for_timeout(140)
    check('rotten root toggle disables module',p.evaluate('__RBRottenRoot.snapshot().enabled')==False)
    p.click('#rb-m462-rotten-toggle'); p.wait_for_timeout(150)
    check('rotten root toggle restores intact state',p.evaluate('__RBRottenRoot.snapshot().enabled && __RBRottenRoot.snapshot().state==="idle"'))
    # standing trigger
    p.evaluate('()=>{const s=__game.scene.getScene("Game"); s.player.respawn(900,378); s.player.body2.setVelocity(0,0); s.player.body2.updateCenter();}')
    wait(p,'__RBRottenRoot.snapshot().state!=="idle"',2500)
    check('standing on rotten shelf starts warning',p.evaluate('__RBRottenRoot.snapshot().state') in ('warning','collapsed'))
    wait(p,'__RBRottenRoot.snapshot().state==="collapsed"',4500)
    snap=p.evaluate('__RBRottenRoot.snapshot()')
    check('rotted shelf collapses and disables anchor',snap['state']=='collapsed' and snap['collapseCount']==1 and not snap['anchorActive'],snap=snap)
    p.screenshot(path=str(R/'evidence/m463-inherited-rotten-collapsed.png'))
    p.keyboard.press('r'); wait(p,'__RBRottenRoot.snapshot().state==="idle" && __RBRottenRoot.snapshot().anchorActive===true',9000)
    check('restart resets rotten root',p.evaluate('__RBRottenRoot.snapshot().state')=='idle')
    # tape trigger using real E hook and left pull on the custom anchor
    fixture(p,900,490,['tape'])
    ready=p.evaluate('''()=>({ready:__game.scene.getScene('Game').tape.snapshot().ready,preview:__game.scene.getScene('Game').tape.previewTarget})''')
    attached=p.evaluate('''()=>{const s=__game.scene.getScene('Game'); s.tape.grounded(); s.tape.toggle(); return {attached:s.tape.attached,anchor:s.tape.anchor?{x:s.tape.anchor.x,y:s.tape.anchor.y}:null,ready:s.tape.snapshot().ready};}''')
    check('rotten-root environmental anchor can be acquired when in preview range',ready['ready'] and attached['attached'] and attached['anchor'] and abs(attached['anchor']['x']-920)<2)
    p.keyboard.down('ArrowLeft'); p.wait_for_timeout(850); p.keyboard.up('ArrowLeft')
    wait(p,'__RBRottenRoot.snapshot().state==="collapsed"',4500)
    snap2=p.evaluate('__RBRottenRoot.snapshot()')
    check('tape pull can also collapse rotten root',snap2['trigger']=='tape' and snap2['collapseCount']>=1 and any(ev['type']=='collapse' for ev in snap2['audioEvents']),snap=snap2)
    p.keyboard.press('r'); wait(p,'__RBRottenRoot.snapshot().state=="idle" && __game.scene.getScene("Game").player',9000)
    # regressions
    fixture(p,108,490); wait(p,'__game.scene.getScene("Game").__rbStickyWeb.sim.contacts>0',5000)
    check('sticky web still works',p.evaluate('__game.scene.getScene("Game").__rbStickyWeb.snapshot().touching'))
    fixture(p,332,490); p.keyboard.down('Space'); wait(p,'__game.scene.getScene("Game").__rbEggSac.sim.hatched===1',5000); p.keyboard.up('Space')
    check('egg sac still hatches seven spiderlings',p.evaluate('__game.scene.getScene("Game").__rbEggSac.snapshot().total')==7)
    fixture(p,785,490); p.keyboard.down('Space'); p.wait_for_timeout(960); p.keyboard.up('Space'); p.wait_for_timeout(160)
    land=p.evaluate('''()=>({x:__game.scene.getScene('Game').player.x,y:__game.scene.getScene('Game').player.y})''')
    check('enlarged root bridge still walkable',abs(land['y']-399)<3,land=land)
    fixture(p,855,490); p.keyboard.down('ArrowRight'); wait(p,'__game.scene.getScene("Game").finished',6500); p.keyboard.up('ArrowRight')
    check('finish still works',p.evaluate('__game.scene.getScene("Game").finished')==True)
    check('no page JS errors',not errors,errors=errors)
  except Exception as e:
    check('QA harness',False,error=repr(e),errors=errors)
  b.close()
report={'release':'M4.6.3 inherited M4.6.2','passed':sum(c['passed'] for c in results),'total':len(results),'checks':results,'pageErrors':errors,'fixtureDisclosure':'Respawn/gear fixtures used for encounter isolation; standing test uses direct placement on the shelf and environmental-anchor acquisition uses tape.toggle() after preview readiness. Real keyboard used for pull/jump/restart/finish.'}
(R/'evidence/m463-inherited-m462-browser-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('FINAL',report['passed'],'/',report['total'])
raise SystemExit(0 if report['passed']==report['total'] else 1)
