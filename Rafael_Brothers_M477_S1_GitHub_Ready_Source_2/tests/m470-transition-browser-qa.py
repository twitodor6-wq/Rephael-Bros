import os,shutil,json
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];errors=[]
with sync_playwright() as pl:
 b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
 p.set_content((R/'dist/Rafael_Brothers_M470_MANAGED_ENCOUNTERS.html').read_text());p.wait_for_function('__RBSceneComposerV1?.snapshot().installed');p.keyboard.press('Enter');p.wait_for_function('__RBStageAnchors?.managedActor')
 p.add_script_tag(content=(R/'tests/support/m469-transition-probe.js').read_text());report=p.evaluate('runM469TransitionProbe()');report['checks'].append(dict(name='no uncaught JavaScript errors',passed=not errors,details=errors));report.update(version='M4.6.9',pageErrors=errors,passed=sum(x['passed'] for x in report['checks']),total=len(report['checks']));b.close()
(R/'evidence/m470-transition-browser-qa.json').write_text(json.dumps(report,indent=2))
for x in report['checks']:print(('PASS ' if x['passed'] else 'FAIL ')+x['name'],flush=True)
print('TOTAL',report['passed'],'/',report['total']);raise SystemExit(0 if report['passed']==report['total'] else 1)
