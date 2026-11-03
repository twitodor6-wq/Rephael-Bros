"""M471 Stage JSON two independent mutations: actual live Phaser bodies/geometry/anchor/gate.
   In-memory browser HTML variant, no changes to production or immutable snapshots.
"""
import json,re,copy,shutil,os
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];BASE=(R/'dist/Rafael_Brothers_M471_ROOT_FOREST.html').read_text()
STAGE=json.loads((R/'stages/s01.stage.json').read_text());CHECKS=[]
def ck(name,yes,value=None):
 CHECKS.append(dict(name=name,passed=bool(yes),value=value));print(('PASS ' if yes else 'FAIL ')+name,flush=True)
variants=[('a',306,70,1662,1265),('b',300,78,1690,1290)]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for id,tree_x,offset_x,gate_x,hook_x in variants:
  stage=copy.deepcopy(STAGE)
  tree=next(v for v in stage['objects'] if v['id']=='fallen-bridge-tree');tree['position']['x']=tree_x;tree['properties']['bridgeOffset']['x']=offset_x
  next(v for v in stage['objects'] if v['id']=='forest-exit-grove')['position']['x']=gate_x
  next(v for v in stage['objects'] if v['id']=='stable-root-extension')['position']['x']=hook_x
  (R/f'evidence/m471-variant-{id}.stage.json').write_text(json.dumps(stage,indent=2)+'\n')
  new='window.__RB_STAGE_V1_DATA='+json.dumps(stage,separators=(',',':'))+';'
  html,count=re.subn(r'window\.__RB_STAGE_V1_DATA=\{.*?\};',lambda m:new,BASE,count=1)
  assert count==1
  p=browser.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  p.set_content(html,wait_until='domcontentloaded',timeout=60000)
  p.wait_for_function('__game?.scene?.isActive?.("Menu")');p.keyboard.press('Enter')
  p.wait_for_function('__RBFallingBridge?.snapshot() && __RBForestExtension?.snapshot()',timeout=20000)
  data=p.evaluate('''()=>{const s=__game.scene.getScene('Game'),t=__RBFallingBridge;return {stageTree:__RB_STAGE_V1_DATA.objects.find(x=>x.id==='fallen-bridge-tree').position.x,tree:__RBStageAnchors.getRef('fallen-bridge-tree').x,bridge:t.snapshot().geometry.x,body:t.zone.body.x,collider:t.collider.active,root:__RBStageAnchors.getRef('stable-root-extension').x,gate:s.world.level.gate.x,portal:__RBExitGrove.snapshot().exitX,graphicCommands:t.graphics.commandBuffer.length,duplicates:__RBStageAnchors.snapshot().duplicateRefs}}''')
  ck(f'variant {id} JSON moves physical tree and stable anchor together',data['tree']==tree_x and data['stageTree']==tree_x and data['bridge']==tree_x+offset_x and data['body']==data['bridge'] and data['root']==hook_x and not data['duplicates'],data)
  ck(f'variant {id} finish gate follows JSON in world and grove',data['gate']==gate_x and data['portal']==gate_x+30)
  p.evaluate('''()=>{const s=__game.scene.getScene('Game');s.player.respawn(330,490);s.player.body2.setVelocity(0,0)}''')
  try:
   p.wait_for_function('__RBFallingBridge.snapshot().state==="warning"',timeout=3800)
   p.wait_for_function('__RBFallingBridge.snapshot().state==="collapsed"',timeout=4700)
   fallen=p.evaluate('''()=>{let t=__RBFallingBridge;return {state:t.snapshot().state,body:t.zone.body.x,bodyEnabled:t.zone.body.enable,collider:t.collider.active,commandCount:t.graphics.commandBuffer.length,anchorActive:__RBStageAnchors.isActive('fallen-bridge-tree')}}''')
   ck(f'variant {id} real standing warning/collapse has matching body and rendered geometry',fallen['state']=='collapsed' and fallen['bodyEnabled'] and fallen['collider'] and not fallen['anchorActive'] and fallen['commandCount']>3 and fallen['body']==data['bridge'],fallen)
  except Exception as e:ck(f'variant {id} collapse',False,str(e))
  p.screenshot(path=str(R/f'evidence/M471_MUTATION_{id.upper()}.png'))
  p.keyboard.press('r');p.wait_for_function('__RBFallingBridge.snapshot().state==="idle"')
  ck(f'variant {id} restart restores hook',p.evaluate('__RBStageAnchors.isActive("fallen-bridge-tree")'))
  ck(f'variant {id} has no page errors',not errors,errors)
  p.close()
 browser.close()
(R/'evidence/m471-mutation-browser.json').write_text(json.dumps(CHECKS,indent=2))
print('TOTAL',sum(x['passed'] for x in CHECKS),'/',len(CHECKS))
raise SystemExit(0 if all(x['passed'] for x in CHECKS) else 1)
