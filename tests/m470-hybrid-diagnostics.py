"""Hybrid controlled Attach -> Reel -> steering -> Release, baseline/current comparable; diagnostic only."""
from pathlib import Path
import json,os,shutil,statistics
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
files=[('M469','dist/Rafael_Brothers_M469_MANAGED_ANCHORS.html'),('M470','dist/Rafael_Brothers_M470_MANAGED_ENCOUNTERS.html')]
results=[]
with sync_playwright() as pl:
 b=pl.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,path in files:
  p=b.new_page(viewport={'width':1280,'height':800});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  p.set_content((R/path).read_text(),wait_until='domcontentloaded');p.wait_for_function('__RBSceneComposerV1?.snapshot().installed');p.keyboard.press('Enter');p.wait_for_function('__RBStageAnchors && __game.scene.isActive("Game")')
  p.evaluate('''()=>{const s=__game.scene.getScene('Game');__RBSwingLab.setMode('hybrid');s.pickups.gear.add('tape');s.player.respawn(460,490);s.tape.grounded();s.tape.toggle();}''')
  snap='''()=>{const s=__game.scene.getScene('Game');return {frame:__game.loop.frame,frameDeltaMs:__game.loop.delta,gameDtMs:Math.min(__game.loop.delta,50),nowMs:performance.now(),x:s.player.x,y:s.player.y,vx:s.player.body2.velocity.x,vy:s.player.body2.velocity.y,attached:!!s.tape.attached,anchor:s.tape.anchor?{x:s.tape.anchor.x,y:s.tape.anchor.y}:null,length:s.tape.length}}'''
  events=[{'phase':'attach','input':'E-equivalent fixture action','state':p.evaluate(snap)}];samples=[]
  p.keyboard.down('ArrowUp');events.append({'phase':'reel-down','input':'ArrowUp','state':p.evaluate(snap)})
  for _ in range(12):p.wait_for_timeout(36);samples.append(p.evaluate(snap))
  p.keyboard.up('ArrowUp');events.append({'phase':'reel-up','input':'ArrowUp','state':p.evaluate(snap)})
  p.keyboard.down('ArrowRight');events.append({'phase':'steer-down','input':'ArrowRight','state':p.evaluate(snap)})
  released=False
  for i in range(125):
   p.wait_for_timeout(36);q=p.evaluate(snap);samples.append(q)
   if not released and q['x']>=635 and q['vx']>=220 and q['vy']<150 and q['attached']:
    p.evaluate('__game.scene.getScene("Game").tape.release()');released=True;events.append({'phase':'release','input':'E-equivalent explicit tape.release fixture action','state':p.evaluate(snap)})
   if released and q['x']>=730:break
  if not released:
   p.evaluate('__game.scene.getScene("Game").tape.release()');events.append({'phase':'explicit-end-release','input':'controlled test release after threshold not met','state':p.evaluate(snap)})
  p.keyboard.up('ArrowRight');events.append({'phase':'steer-up','input':'ArrowRight','state':p.evaluate(snap)})
  ds=[q['frameDeltaMs'] for q in samples];result={'baselineOrCurrent':label,'renderIsolation':False,'events':events,'sampleCount':len(samples),'samples':samples,'meanFrameDeltaMs':statistics.mean(ds),'maxFrameDeltaMs':max(ds),'reelDeltaPx':events[0]['state']['length']-events[2]['state']['length'],'released':released,'finalX':samples[-1]['x'],'jsErrors':errors};results.append(result);p.close();print(label,'frames',len(ds),'mean delta',round(result['meanFrameDeltaMs'],2),'reel Δ',round(result['reelDeltaPx'],2),'released',released,flush=True)
 b.close()
out={'milestone':'M4.7.0','method':'Chrome headed by software renderer, actual Phaser; same automation macro in baseline and current; test injects successful equip/toggle at x460, ArrowUp 12x36ms, ArrowRight up to 125x36ms, conditional release; does not modify player physics formulas','runs':results}
(R/'evidence/m470-hybrid-frame-trace.json').write_text(json.dumps(out,indent=2));print('Trace saved')
