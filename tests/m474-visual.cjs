/** Naturally reached states paused solely to capture matched-camera diagnostic frames. */
const fs=require('fs'),path=require('path');const {fingerprint}=require('../scripts/m474-evidence.cjs');const {R,HTML,sha,boot,snap}=require('./m474-harness.cjs');
(async()=>{const records=[],checks=[];for(const before of [true,false]){const {browser,page:p,errors}=await boot(before?'dist/Rafael_Brothers_M473_GAMEPLAY_CHALLENGE.html':HTML);try{
 await p.evaluate(()=>{const s=__game.scene.getScene('Game');s.player.respawn(310,490);s.cameras.main.stopFollow();s.cameras.main.setScroll(0,0);s.cameras.main.shakeEffect.reset();s.scene.pause();});
 const prefix=before?'M473_BEFORE':'M474_AFTER';await p.screenshot({path:path.join(R,'evidence',prefix+'_IDLE.png')});records.push({prefix,state:'idle',snapshot:await snap(p)});
 async function frame(state){await p.evaluate(state=>{const s=__game.scene.getScene('Game');globalThis.__M474Frame=null;const f=()=>{const a=__RBFallingBridge.snapshot();if(a.state===state&&(state!=='falling'||a.progress>=.45)){s.events.off('postupdate',f);globalThis.__M474Frame=a;s.cameras.main.shakeEffect.reset();s.scene.pause();}};s.events.on('postupdate',f);s.scene.resume();},state);await p.waitForFunction(()=>!!globalThis.__M474Frame,{timeout:12000});await p.screenshot({path:path.join(R,'evidence',prefix+'_'+state.toUpperCase()+'.png')});records.push({prefix,state,snapshot:await snap(p)});}
 for(const state of before?['warning','collapsed']:['warning','breaking','falling','settling','collapsed'])await frame(state);
 checks.push({name:prefix+' natural stages / fixed camera',passed:!errors.length,errors});
 }finally{await browser.close();}}
 fs.writeFileSync(path.join(R,'evidence/m474-visual.json'),JSON.stringify({sourceFingerprint:fingerprint(),testSha256:sha('tests/m474-visual.cjs'),htmlSha256:sha(HTML),stageSha256:sha('stages/s01.stage.json'),scope:'diagnostic frozen frames; camera0,0; actor310,490; natural stand trigger; no gameplay proof',checks,records},null,2));if(checks.some(c=>!c.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
