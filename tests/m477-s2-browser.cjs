/** Real Phaser smoke; initial placement fixture is explicit, not a full-stage run. */
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {boot,press,R}=require('./m477-harness.cjs');
(async()=>{let browser;const checks=[];try{
 const b=await boot();browser=b.browser;const p=b.page;
 const state=()=>p.evaluate(()=>({enemies:__RBEnemies.snapshot(),bound:__RBStageV1.snapshot().instances.filter(v=>v.type==='ceiling-spider'),post:__game.scene.getScene('Game').events.listenerCount('postupdate')}));
 let s=await state();assert.equal(s.enemies.instances.length,1);assert.ok(s.bound[0].bound);checks.push('authored enemy bound');
 // Disclosed setup only: move player into the authored trigger; simulation advances normally.
 await p.evaluate(()=>__game.scene.getScene('Game').player.respawn(245,490));
 await p.waitForFunction(()=>__RBSpider.snapshot().counts.warning>0);checks.push('real Phaser trigger advances warning');
 await p.evaluate(()=>__RBSpider.setEnabled(false));let off=await p.evaluate(()=>({snapshot:__RBSpider.snapshot(),visible:Object.values(__RBSpider.view).filter(v=>v&&typeof v.visible==='boolean').some(v=>v.visible)}));assert.equal(off.snapshot.enabled,false);assert.equal(off.visible,false);checks.push('OFF disables/hides actor');
 const expected=(await state()).post;for(let i=0;i<3;i++){await press(p,'KeyR');await p.waitForTimeout(200);s=await state();assert.equal(s.post,expected);assert.equal(s.enemies.instances.length,1);assert.ok(s.bound[0].bound);assert.equal(s.enemies.instances[0].enabled,false);}checks.push('3 restarts retain one binding/listener and OFF');
 await p.evaluate(()=>__RBSpider.setEnabled(true));assert.equal((await state()).enemies.instances[0].enabled,true);assert.equal(b.errors.length,0);checks.push('ON restored; no page errors');
 }finally{if(browser)await browser.close();fs.mkdirSync(path.join(R,'evidence/m477-s2'),{recursive:true});fs.writeFileSync(path.join(R,'evidence/m477-s2/browser.json'),JSON.stringify({checks,scope:'partial smoke; no full-stage claim'},null,2));}console.log(checks);
})().catch(e=>{console.error(e);process.exitCode=1});
