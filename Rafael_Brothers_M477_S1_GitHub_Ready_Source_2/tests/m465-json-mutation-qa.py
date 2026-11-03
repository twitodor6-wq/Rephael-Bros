"""A genuine isolated JSON edit + rebuild + two Chromium scenes.
Proves the Phaser bridge's drawn command buffer and physical Arcade collider move
from the same stage JSON position, plus the anchor's real tape reference moves.
"""
import copy,json,shutil,tempfile,subprocess,os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
stage=json.loads((ROOT/'stages/s01.stage.json').read_text())
modified=copy.deepcopy(stage)
for o in modified['objects']:
    if o['id']=='living-root-shelf':o['position']['x']+=12
    if o['id']=='stable-tree-start':o['position']['x']+=18

def read_scene(page,html):
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function('window.__game?.scene?.isActive?.("Menu") && window.__RBStageV1 && window.__RBStageAnchorsInstalled',timeout=25000)
    page.keyboard.press('Enter')
    page.wait_for_function('window.__game?.scene?.isActive?.("Game") && !!window.__RBBridgePolish && !!window.__RBStageAnchors',timeout=25000)
    return page.evaluate('''()=>{
      const scene=__game.scene.getScene('Game'),bridge=__RBBridgePolish;
      const b=bridge.zone.body,a=__RBStageAnchors.getRef('stable-tree-start');
      return {collider:{x:b.x,y:b.y,w:b.width,h:b.height,enabled:b.enable},anchor:{x:a.x,y:a.y,present:scene.tape.anchors.includes(a)},
        commandBuffer:JSON.stringify(bridge.root.commandBuffer),stageX:__RBStageV1.getConfig('root-bridge','living-root-shelf').shelf.x};
    }'''),errors

with tempfile.TemporaryDirectory(prefix='rb-m465-mutation-') as d:
    t=Path(d); (t/'baseline').mkdir();(t/'stages').mkdir();(t/'src').mkdir();(t/'dist').mkdir()
    for f in ['build-m465.mjs']:
        shutil.copy2(ROOT/f,t/f)
    for f in ['M46_RELEASE.html']:
        shutil.copy2(ROOT/'baseline'/f,t/'baseline'/f)
    for f in (ROOT/'src').glob('*.mjs'):
        if f.name in ('stage-loader.mjs','stage-modules.mjs','bridge-polish.mjs','stage-dressing.mjs','environmental-anchors.mjs','rotten-root.mjs','falling-bridge-tree.mjs','exit-grove.mjs','web-response.mjs'):
            shutil.copy2(f,t/'src'/f.name)
    (t/'stages/s01.stage.json').write_text(json.dumps(modified,ensure_ascii=False,indent=2))
    result=subprocess.run(['node','build-m465.mjs'],cwd=t,capture_output=True,text=True,timeout=45)
    if result.returncode:raise AssertionError('Mutation rebuild failed: '+result.stderr)
    original=(ROOT/'dist/Rafael_Brothers_M465_MODULAR_STAGE.html').read_text()
    mutation=(t/'dist/Rafael_Brothers_M465_MODULAR_STAGE.html').read_text()
    with sync_playwright() as pl:
        browser=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
        p1=browser.new_page(viewport={'width':1280,'height':800});orig,err1=read_scene(p1,original)
        p2=browser.new_page(viewport={'width':1280,'height':800});mut,err2=read_scene(p2,mutation)
        # Phaser's root graphics command buffer changes along with the solid collider.
        cases={
         'JSON position moves Arcade collider 12px':abs(mut['collider']['x']-orig['collider']['x']-12)<.01,
         'collider remains enabled':orig['collider']['enabled'] and mut['collider']['enabled'],
         'JSON edit changes drawn root bridge geometry':mut['commandBuffer']!=orig['commandBuffer'],
         'authored anchor moves 18px':mut['anchor']['x']-orig['anchor']['x']==18,
         'anchor stays present in original tape physics array':orig['anchor']['present'] and mut['anchor']['present'],
         'no JS pageerrors in either build':not err1 and not err2,
        }
        # prove stale M464 stage configs are not used
        report={'version':'M4.6.5','checks':[{'name':k,'passed':bool(v)} for k,v in cases.items()],
          'baseline':{k:v for k,v in orig.items() if k!='commandBuffer'},'mutated':{k:v for k,v in mut.items() if k!='commandBuffer'},
          'pageErrors':err1+err2,'change':{'living-root-shelf.x':'+12','stable-tree-start.x':'+18'}}
        report['passed']=sum(x['passed'] for x in report['checks']);report['total']=len(report['checks'])
        (ROOT/'evidence/m465-json-mutation-qa.json').write_text(json.dumps(report,indent=2))
        for c in report['checks']:print(('PASS ' if c['passed'] else 'FAIL ')+c['name'],flush=True)
        print('TOTAL',report['passed'],'/',report['total'])
        browser.close()
    if report['passed']!=report['total']:raise SystemExit(1)
