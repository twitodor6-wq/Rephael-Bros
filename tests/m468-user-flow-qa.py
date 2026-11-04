"""Actual character switching, recorder JSON downloads and frame/resource diagnostics."""
import os,shutil,json
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[];errors=[];network=[]
def ck(name,ok,detail=None):checks.append(dict(name=name,passed=bool(ok),details=detail));print(('PASS ' if ok else 'FAIL ')+name,flush=True)
with sync_playwright() as pl:
 b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 p=b.new_page(viewport={'width':1280,'height':800},accept_downloads=True);p.on('pageerror',lambda e:errors.append(str(e)))
 p.on('request',lambda r:network.append(r.url) if r.url.startswith(('https:','http:')) else None)
 p.goto((R/'dist/Rafael_Brothers_M468_MANAGED_ACTORS.html').as_uri(),wait_until='domcontentloaded');p.wait_for_function('__RBSceneComposerV1?.snapshot().installed');p.keyboard.press('Enter');p.wait_for_function('__RBBridgePolish && __RBStageAnchors')
 first=p.evaluate('__game.scene.getScene("Game").player.activeId');p.keyboard.press('Tab');p.wait_for_function(f'__game.scene.getScene("Game").player.activeId!=="{first}"');second=p.evaluate('__game.scene.getScene("Game").player.activeId')
 ck('real Tab switches Rafi to Shaul',first=='rafi' and second=='shaul',{'first':first,'second':second})
 p.keyboard.press('Tab');p.wait_for_function('__game.scene.getScene("Game").player.activeId==="rafi"');ck('second Tab restores Rafi',True)
 p.evaluate('()=>{__RBTelemetry.start();return true}');p.keyboard.down('ArrowRight');p.wait_for_timeout(200);p.keyboard.up('ArrowRight');p.evaluate('()=>{__RBTelemetry.stop();return true}')
 snapshot=p.evaluate('__RBTelemetry.snapshot()');ck('recorder produces game samples',snapshot.get('summary',{}).get('sampleCount',0)>0,{'summary':snapshot.get('summary')})
 with p.expect_download() as dl:p.evaluate('()=>{__RBTelemetry.exportJson();return true}')
 dl.value.save_as(R/'evidence/m468-telemetry-export.json');export=json.loads((R/'evidence/m468-telemetry-export.json').read_text());ck('original JSON download preserves captured samples',export.get('summary',{}).get('sampleCount',0)>0)
 with p.expect_download() as dl:p.evaluate('()=>{__RBSceneComposerV1.exportDiagnostics();return true}')
 dl.value.save_as(R/'evidence/m468-lifecycle-export.json');doc=json.loads((R/'evidence/m468-lifecycle-export.json').read_text())
 ck('additive diagnostic export includes stage, module flags, states and original telemetry',doc['lifecycle']['stageId']=='s01' and len(doc['lifecycle']['managed'])==2 and bool(doc['modules']) and doc['telemetry'].get('summary',{}).get('sampleCount',0)>0,{'stageId':doc['lifecycle']['stageId'],'modules':len(doc['modules'])})
 perf=p.evaluate('()=>({fps:__game.loop.actualFps,delta:__game.loop.delta,managed:__RBSceneComposerV1.snapshot().managed})');ck('owned scopes report no cleanup errors',all(not x['errors'] for x in perf['managed']),perf)
 ck('standalone file URL runs without HTTP asset requests',not network,network)
 ck('no JavaScript exceptions in user flow',not errors,errors);b.close()
report=dict(version='M4.6.8',passed=sum(x['passed'] for x in checks),total=len(checks),checks=checks,pageErrors=errors)
(R/'evidence/m468-user-flow-qa.json').write_text(json.dumps(report,indent=2));print('TOTAL',report['passed'],'/',report['total']);raise SystemExit(0 if report['passed']==report['total'] else 1)
