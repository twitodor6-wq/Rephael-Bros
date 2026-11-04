/** S3 Chromium/Phaser smoke. Respawn placement and hammer rectangle are explicit test fixtures. */
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {boot,press,R}=require('./m477-harness.cjs');
(async()=>{
 let browser,page;const checks=[],scope='real Phaser initial-stage smoke; controlled initial respawn and scripted hammer rectangle, not full-stage proof';
 const folder=path.join(R,'evidence/m477-s3');fs.mkdirSync(folder,{recursive:true});
 const check=(name,condition)=>{assert.ok(condition,name);checks.push(name);console.log('PASS',name);};
 try{
  const result=await boot();browser=result.browser;page=result.page;
  const state=()=>page.evaluate(()=>{
    const scene=__game.scene.getScene('Game'),snap=__RBStickyWebs.snapshot();
    return {bound:__RBStageV1.snapshot().instances.filter(v=>v.type==='sticky-web'),
      webs:snap.instances,inWeb:scene.player.inWeb,post:scene.events.listenerCount('postupdate'),
      managed:scene.__rbStickyWebGroup?.managedActor,enabled:__RBStickyWebEnabled};
  });
  let s=await state();
  check('Stage JSON web binds once',s.webs.length===1&&s.bound.length===1&&s.bound[0].bound&&s.managed);
  check('historical geometry retained',s.webs[0].id==='sticky-web-launch-left');
  await page.screenshot({path:path.join(folder,'STICKY_WEB_INITIAL.png')});
  await page.evaluate(()=>__game.scene.getScene('Game').player.respawn(103,490));
  await page.waitForFunction(()=>__RBStickyWeb?.snapshot()?.contacts>0,{timeout:10000});
  s=await state();
  check('real Phaser contact detected',s.webs[0].contacts>0);
  await page.screenshot({path:path.join(folder,'STICKY_WEB_CONTACT.png')});
  const cut=await page.evaluate(()=>__game.scene.getScene('Game').world.hammerHit({x:85,y:402,w:42,h:86}));
  s=await state();
  check('scripted hammer rectangle dispatches to authored web',cut&&s.webs[0].cuts>0);
  await page.evaluate(()=>document.getElementById('rb-m44-web-toggle').click());
  s=await state();
  check('OFF clears web and player.inWeb',!s.enabled&&!s.inWeb);
  const before=s.post;
  for(let i=0;i<3;i++){
   await press(page,'KeyR');
   await page.waitForFunction(()=>!!window.__RBStickyWebs?.snapshot()?.instances?.length);
   await page.waitForTimeout(220);
   const now=await state();
   check('restart '+(i+1)+' keeps singleton and OFF',now.bound[0].bound&&now.webs.length===1&&now.post===before&&!now.enabled&&!now.inWeb);
  }
  await page.evaluate(()=>document.getElementById('rb-m44-web-toggle').click());
  s=await state();
  check('ON restores Stage hazard without new binding',s.enabled&&s.webs.length===1&&s.bound[0].bound);
  check('no page errors',result.errors.length===0);
 }finally{
  if(browser)await browser.close();
  fs.writeFileSync(path.join(folder,'browser.json'),JSON.stringify({scope,checks},null,2));
 }
})().catch(error=>{console.error(error);process.exitCode=1});
