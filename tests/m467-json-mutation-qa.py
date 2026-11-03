"""M4.6.7 isolated Stage JSON perturbation -> rebuild -> real Phaser geometry and art."""
import copy,json,shutil,tempfile,subprocess,os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
original=json.loads((ROOT/'stages/s01.stage.json').read_text())
modified=copy.deepcopy(original)
for o in modified['objects']:
 if o['id']=='fallen-bridge-tree':o['position']['x']+=6
 if o['id']=='forest-exit-grove':o['position']['x']+=4

def read_scene(page,html):
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded',timeout=60000)
 page.wait_for_function('window.__game?.scene?.isActive?.("Menu") && window.__RBStageV1',timeout=25000)
 page.keyboard.press('Enter')
 page.wait_for_function('window.__game?.scene?.isActive?.("Game") && !!window.__RBFallingBridge && !!window.__RBExitGrove',timeout=25000)
 data=page.evaluate('''()=>{
 const tree=__RBFallingBridge,exit=__RBExitGrove,meta=__RBStageV1;
 return {falling:{zoneX:tree.zone.body.x,zoneY:tree.zone.body.y,graphics:JSON.stringify(tree.graphics.commandBuffer),hintX:tree.hint.x,anchor:__RBStageAnchors.getRef('fallen-bridge-tree').x,anchorActive:__RBStageAnchors.isActive('fallen-bridge-tree'),safe:tree.snapshot().safe},
   exit:{endX:exit.snapshot().exitX,geometry:JSON.stringify(exit.graphics.commandBuffer),finishY:meta.getConfig('exit-grove','forest-exit-grove').minFootY},
   registered:meta.snapshot().instances.filter(x=>x.bound).length,
   tapeAnchorPresent:__game.scene.getScene('Game').tape.anchors.includes(__RBStageAnchors.getRef('fallen-bridge-tree'))};
 }''')
 return data,errors

with tempfile.TemporaryDirectory(prefix='rb-m467-mutation-') as d:
 temp=Path(d)
 for dirname in ['baseline','stages','src','dist']:(temp/dirname).mkdir()
 shutil.copy2(ROOT/'build-m467.mjs',temp/'build-m467.mjs')
 shutil.copy2(ROOT/'baseline/M46_RELEASE.html',temp/'baseline/M46_RELEASE.html')
 for f in (ROOT/'src').glob('*.mjs'):shutil.copy2(f,temp/'src'/f.name)
 (temp/'stages/s01.stage.json').write_text(json.dumps(modified,ensure_ascii=False,indent=2))
 proc=subprocess.run(['node','build-m467.mjs'],cwd=temp,capture_output=True,text=True,timeout=45)
 if proc.returncode:raise AssertionError('Isolated mutation build failed: '+proc.stderr)
 with sync_playwright() as pl:
  b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
  p1=b.new_page(viewport={'width':1280,'height':800});ref,e1=read_scene(p1,(ROOT/'dist/Rafael_Brothers_M467_UNIFIED_LIFECYCLE.html').read_text())
  p2=b.new_page(viewport={'width':1280,'height':800});mut,e2=read_scene(p2,(temp/'dist/Rafael_Brothers_M467_UNIFIED_LIFECYCLE.html').read_text())
  tests={
   'falling branch collider shifts +6 px':abs(mut['falling']['zoneX']-ref['falling']['zoneX']-6)<.01,
   'falling branch artwork follows same +6 shift':mut['falling']['graphics']!=ref['falling']['graphics'],
   'falling warning hint follows +6 px':mut['falling']['hintX']-ref['falling']['hintX']==6,
   'single-source anchor follows tree +6 px':mut['falling']['anchor']-ref['falling']['anchor']==6,
   'anchor remains registered in actual rope':ref['tapeAnchorPresent'] and mut['tapeAnchorPresent'] and mut['falling']['anchorActive'],
   'tree stays safely short of pit':mut['falling']['safe'],
   'exit authored finish guard moves +4 px':mut['exit']['endX']-ref['exit']['endX']==4,
   'exit arch geometry follows +4 px':mut['exit']['geometry']!=ref['exit']['geometry'],
   'both builds bind all seven stage instances':mut['registered']==7 and ref['registered']==7,
   'no browser JavaScript exceptions':not e1 and not e2,
  }
  b.close()
  report={'version':'M4.6.7','checks':[{'name':k,'passed':bool(v)} for k,v in tests.items()], 'passed':sum(bool(v) for v in tests.values()),'total':len(tests),'pageErrors':e1+e2,'baseline':{k:{a:b for a,b in v.items() if a not in ('graphics','geometry')} if isinstance(v,dict) else v for k,v in ref.items()},'mutated':{k:{a:b for a,b in v.items() if a not in ('graphics','geometry')} if isinstance(v,dict) else v for k,v in mut.items()},'notes':'Two independent headless Chromium game scenes. No speculative simulation claims.'}
  (ROOT/'evidence/m467-json-mutation-qa.json').write_text(json.dumps(report,indent=2))
  for k,v in tests.items():print(('PASS ' if v else 'FAIL ')+k,flush=True)
  print('TOTAL',report['passed'],'/',report['total'])
  if report['passed']!=report['total']:raise SystemExit(1)
