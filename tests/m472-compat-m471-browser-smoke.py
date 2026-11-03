from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os,shutil
R=Path(__file__).resolve().parents[1];H=(R/'dist/Rafael_Brothers_M472_ROPE_CROSSING_SAFETY.html').read_text();out=[]
def ck(name,val,data=None):
 print(('PASS ' if val else 'FAIL ')+name,flush=True);out.append({'name':name,'passed':bool(val),'data':data})
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=os.getenv('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 p=b.new_page(viewport={'width':1280,'height':720}); errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 p.set_content(H,wait_until='domcontentloaded',timeout=60000)
 p.wait_for_function('window.__game?.scene?.isActive?.("Menu")',timeout=25000)
 p.keyboard.press('Enter')
 try:p.wait_for_function('window.__RBForestExtension?.snapshot && window.__RBFallingBridge?.snapshot && window.__RBExitGrove?.snapshot',timeout=20000)
 except Exception as e:print('START FAIL',e,errors,p.evaluate('window.__RBSceneComposerV1?.snapshot()'));raise
 d=p.evaluate('''()=>{const s=__game.scene.getScene('Game');return {ext:__RBForestExtension.snapshot(),fall:__RBFallingBridge.snapshot(),gate:__RBExitGrove.snapshot(),anchors:__RBStageAnchors.snapshot(),camera:s.cameras.main.scrollX,objs:s.world.solids.getChildren().map(x=>({x:x.body.x,y:x.body.y,w:x.body.width,h:x.body.height})),errors:__RBSceneComposerV1.snapshot().lastError}}''')
 print(json.dumps(d,indent=2))
 ck('world and camera expanded',d['ext']['worldWidth']==1800 and d['ext']['cameraWidth']==1800)
 ck('end relocated',d['ext']['gate']['x']==1710 and d['gate']['exitX']==1740)
 ck('two new ground bodies',d['ext']['ownedSurfaces']==2 and d['ext']['surfaces'][0]['enabled'])
 ck('new stable root hook',any(x['id']=='stable-root-extension' and x['active'] for x in d['anchors']['anchors']))
 # Legacy player character switch and telemetry panel work in the expanded world.
 first=p.evaluate('__game.scene.getScene("Game").player.activeId')
 p.keyboard.press('Tab');p.wait_for_function('__game.scene.getScene("Game").player.activeId==="shaul"')
 ck('Tab switches to Shaul',first=='rafi')
 p.keyboard.press('Tab');p.wait_for_function('__game.scene.getScene("Game").player.activeId==="rafi"')
 ck('Tab restores Rafi',True)
 panel=p.evaluate('document.querySelector("#rb-telemetry-panel").hidden')
 p.keyboard.press('F3');ck('F3 toggles telemetry panel',p.evaluate('document.querySelector("#rb-telemetry-panel").hidden')!=panel)
 p.keyboard.press('F3')

 ck('falling tree above pit',d['fall']['geometry']['x']>=370 and d['fall']['geometry']['x']<706 and d['fall']['safe'])
 # Old exit must not complete when traversed on far side
 p.evaluate('''()=>{let s=__game.scene.getScene('Game');s.player.respawn(930,460);s.player.body2.setVelocity(0,0)}''');p.wait_for_timeout(500)
 ck('old gate no longer finishes',not p.evaluate('__game.scene.getScene("Game").finished'))
 # Grounded on new first root path
 p.evaluate('''()=>{let s=__game.scene.getScene('Game');s.player.respawn(1040,450);s.player.body2.setVelocity(0,0)}''');p.wait_for_timeout(1100)
 ck('new path walkable',p.evaluate('''()=>{const b=__game.scene.getScene('Game').player.body2;return b.blocked.down&&b.y+b.height>487&&b.y+b.height<497}'''))
 p.screenshot(path=str(R/'evidence/M472_COMPAT_NEW_FOREST_START.png'))
 # check navigation and actual end using position before goal and right movement
 p.evaluate('''()=>{let s=__game.scene.getScene('Game');s.player.respawn(1600,460);s.player.body2.setVelocity(0,0)}''');p.wait_for_timeout(550)
 d2=p.evaluate('''()=>{const s=__game.scene.getScene('Game');return {playerX:s.player.x,scrollX:s.cameras.main.scrollX,displayWidth:s.cameras.main.width}}''')
 ck('camera scrolls toward new forest',d2['scrollX']>200,d2)
 p.screenshot(path=str(R/'evidence/M472_COMPAT_NEW_FOREST_END.png'))
 p.keyboard.down('ArrowRight')
 try:p.wait_for_function('__game.scene.getScene("Game").finished',timeout=8000)
 except Exception as e:print('GOAL TIMEOUT',str(e))
 p.keyboard.up('ArrowRight')
 ck('player can finish at JSON gate',p.evaluate('__game.scene.getScene("Game").finished'))
 p.keyboard.press('r');p.wait_for_timeout(900)
 ck('restart reset extension',p.evaluate('window.__RBForestExtension?.snapshot().worldWidth===1800 && !__game.scene.getScene("Game").finished'))
 ck('no runtime JS exceptions',not errors,errors)
 b.close()
(R/'evidence/m472-compat-m471-browser-smoke.json').write_text(json.dumps(out,indent=2))
