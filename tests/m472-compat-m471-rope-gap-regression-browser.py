"""M4.7.1 hotfix: real Chromium reproduce/verify ↑ reeling on both gap faces.
Controls are genuine Playwright keyboard events; rope is set to a controlled attached
state, matching the uploaded telemetry's position and measured length. This is a
focused regression test, not an assertion of a full unassisted stage playthrough.
"""
import json,os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
OUTPUT=R/'evidence/m472-compat-m471-rope-gap-regression.json'
checks=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1280,'height':720});errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content((R/'dist/Rafael_Brothers_M472_ROPE_CROSSING_SAFETY.html').read_text(),wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function('__game?.scene?.isActive?.("Menu")',timeout=15000)
    page.keyboard.press('Enter');page.wait_for_function('__RBForestExtension?.snapshot()',timeout=15000)
    for mode in ['manual','classic','hybrid']:
      for x in [1204,1230,1256]:
        page.evaluate('''({mode,x})=>{const s=__game.scene.getScene('Game');
          globalThis.__RBSwingMode=mode;s.tape.reset();s.player.respawn(x,546.5);
          s.player.body2.setVelocity(0,0);
          const a=s.tape.anchors.find(a=>a.x===1230 && a.y===260);
          if(!a)throw Error('M471 hotfix anchor missing');
          s.tape.anchor=a;s.tape.recent=a;
          s.tape.length=Math.hypot(a.x-s.player.body2.center.x,a.y-s.player.body2.center.y);
          s.player.tethered=true;
        }''',{'mode':mode,'x':x})
        page.wait_for_timeout(110)
        before=page.evaluate('''()=>{const s=__game.scene.getScene('Game');return {attached:s.tape.attached,anchor:s.tape.anchor&&{x:s.tape.anchor.x,y:s.tape.anchor.y},length:s.tape.length,center:{x:s.player.body2.center.x,y:s.player.body2.center.y},blocked:{...s.player.body2.blocked}}}''')
        page.keyboard.down('ArrowUp');page.wait_for_timeout(330)
        after=page.evaluate('''()=>{const s=__game.scene.getScene('Game');return {attached:s.tape.attached,anchor:s.tape.anchor&&{x:s.tape.anchor.x,y:s.tape.anchor.y},length:s.tape.length,center:{x:s.player.body2.center.x,y:s.player.body2.center.y},blocked:{...s.player.body2.blocked}}}''')
        page.keyboard.up('ArrowUp')
        good=before['attached'] and after['attached'] and after['length']<before['length']-3
        checks.append({'name':f'{mode}: reel up from x={x} inside gap','passed':good,'before':before,'after':after})
        print('PASS' if good else 'FAIL',mode,x,'beforeLength=',round(before['length'],1),'afterLength=',round(after['length'],1),'attached=',after['attached'],flush=True)
    # This regression is independent of page errors.
    checks.append({'name':'no page errors','passed':not errors,'errors':errors})
    browser.close()
OUTPUT.write_text(json.dumps({'kind':'M471_ROPE_COLLISION_REGRESSION','checks':checks},indent=2)+'\n')
print('TOTAL',sum(c['passed'] for c in checks),'/',len(checks),flush=True)
raise SystemExit(0 if all(c['passed'] for c in checks) else 1)
