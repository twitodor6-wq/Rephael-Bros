"""M4.6.9 Chromium scene cleanup/Stage Module off-on regression with original actors."""
from pathlib import Path
import os,shutil,json
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
checks=[]
def ck(name,test,details=None):
    checks.append({'name':name,'passed':bool(test),'details':details});print(('PASS ' if test else 'FAIL ')+name,flush=True)
with sync_playwright() as pl:
    b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    p=b.new_page(viewport={'width':1280,'height':800});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
    p.set_content((R/'dist/Rafael_Brothers_M470_MANAGED_ENCOUNTERS.html').read_text(),wait_until='domcontentloaded')
    p.wait_for_function('__game?.scene?.isActive?.("Menu") && __RBStageV1')
    p.keyboard.press('Enter');p.wait_for_function('__game?.scene?.isActive?.("Game") && __RBStageAnchors && __RBRottenRoot && __RBBridgePolish')
    a=p.evaluate('''()=>({prefabs:__RBStageV1.snapshot(),anchors:__RBStageAnchors.snapshot(),bridge:__RBBridgePolish.snapshot(),rotten:__RBRottenRoot.snapshot()})''')
    ck('all 7 prefabs are bound in active Phaser scene',len(a['prefabs']['instances'])==7 and all(x['bound'] for x in a['prefabs']['instances']))
    ck('normal start has no duplicate anchor references',a['anchors']['duplicateRefs']==[])
    p.evaluate('''()=>{__RBRootBridgesEnabled=false;__RBBridgePolish.update();__RBStageAnchors.sync();}''')
    state=p.evaluate('''()=>({bridge:__RBBridgePolish.snapshot(),anchors:__RBStageAnchors.snapshot()})''')
    ck('bridge OFF disables Arcade collider and body',not state['bridge']['colliderActive'] and not p.evaluate('__RBBridgePolish.zone.body.enable'))
    ck('bridge OFF removes attached living-root anchor',not next(x for x in state['anchors']['anchors'] if x['id']=='stable-root-bridge')['active'])
    p.evaluate('''()=>{__RBRootBridgesEnabled=true;__RBBridgePolish.update();__RBStageAnchors.sync();}''')
    state=p.evaluate('''()=>({bridge:__RBBridgePolish.snapshot(),anchors:__RBStageAnchors.snapshot()})''')
    ck('bridge re-enable restores collider, body, anchor',state['bridge']['colliderActive'] and p.evaluate('__RBBridgePolish.zone.body.enable') and next(x for x in state['anchors']['anchors'] if x['id']=='stable-root-bridge')['active'])
    p.evaluate('''()=>__RBRottenRoot.setEnabled(false)''')
    ck('rotten OFF disables both colliders and drops hook',p.evaluate('''()=>{const r=__RBRottenRoot;return !r.collider.active&&!r.floorCollider.active&&!r.zone.body.enable&&!r.floor.body.enable&&!__RBStageAnchors.isActive('rotten-root')}'''))
    p.evaluate('''()=>__RBRottenRoot.setEnabled(true)''')
    ck('rotten ON restores intact platform and hook',p.evaluate('''()=>{const r=__RBRottenRoot;return r.collider.active&&r.zone.body.enable&&__RBStageAnchors.isActive('rotten-root')}'''))
    p.keyboard.press('r');p.wait_for_function('''__game.scene.getScene('Game').__rbRottenRoot?.state==='idle' && __RBStageAnchors.snapshot().entryCount>=4''',timeout=12000)
    z=p.evaluate('''()=>({reg:__RBStageAnchors.snapshot(),stage:__RBStageV1.snapshot(),rope:__game.scene.getScene('Game').tape.anchors.length})''')
    ck('restart has no duplicate anchor refs',z['reg']['duplicateRefs']==[])
    ck('restart binds each prefab ID once',len(z['stage']['instances'])==7 and all(x['bound'] for x in z['stage']['instances']))
    ck('browser has no JS pageerrors',not errors,errors)
    b.close()
report={'version':'M4.6.9','checks':checks,'passed':sum(c['passed'] for c in checks),'total':len(checks),'pageErrors':errors}
(R/'evidence/m470-lifecycle-qa.json').write_text(json.dumps(report,indent=2))
print('TOTAL',report['passed'],'/',report['total'])
raise SystemExit(0 if report['passed']==report['total'] else 1)
