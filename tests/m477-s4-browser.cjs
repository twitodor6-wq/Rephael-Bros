/** S4 real Chromium/Phaser. Explicit respawn and hammer rectangles are controlled
 * encounter fixtures, not unaided full-stage gameplay or keyboard-tool proof. */
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('node:assert/strict');
const {boot,press,R,HTML,setup}=require('./m477-harness.cjs');
const folder=path.join(R,'evidence/m477-s4');fs.mkdirSync(folder,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'rb-s4-')),checks=[],runs=[];let complete=false;
const check=(name,condition,detail={})=>{assert.ok(condition,name+' '+JSON.stringify(detail));checks.push({name,...detail});console.log('PASS',name,JSON.stringify(detail));};
function fixture(name,configs){const stage=JSON.parse(fs.readFileSync(path.join(R,'stages/s01.stage.json')));stage.objects=stage.objects.filter(o=>o.prefab!=='egg-sac').concat(configs);const html=fs.readFileSync(path.join(R,HTML),'utf8').replace(/window\.__RB_STAGE_V1_DATA=[\s\S]*?;<\/script>/,'window.__RB_STAGE_V1_DATA='+JSON.stringify(stage).replaceAll('<','\\u003c')+';</script>');const file=path.join(temp,name+'.html');fs.writeFileSync(file,html);return path.relative(R,file);}
const original=JSON.parse(fs.readFileSync(path.join(R,'stages/s01.stage.json'))).objects.find(o=>o.prefab==='egg-sac');
async function session(file,fn){const {browser,page,errors}=await boot(file);try{await fn(page);check('zero page errors: '+file,errors.length===0,{errors});}finally{await browser.close();}}
const snap=p=>p.evaluate(()=>({eggs:__RBEggSacs.snapshot(),bindings:__RBStageV1.snapshot().instances.filter(o=>o.type==='egg-sac'),life:__RBEggSacs.lifecycleSnapshot(),actor:__game.scene.getScene('Game').player.activeId}));
(async()=>{try{
 await session(HTML,async p=>{
  let s=await snap(p);check('one authored original sac bound and managed',s.eggs.instances.length===1&&s.bindings[0].bound&&s.life.state==='created');
  check('default Stage config retained',await p.evaluate(()=>__RBEggSac.config.x===332&&__RBEggSac.config.y===355&&__RBEggSac.config.count===7));
  await p.screenshot({path:path.join(folder,'S4_INITIAL.png')});
  // Actual touching with a disclosed initial body-bottom placement, no direct state setter.
  await p.evaluate(()=>{__RBSpider.setEnabled(false);__game.scene.getScene('Game').player.respawn(332,375);});
  await p.waitForFunction(()=>__RBEggSac.snapshot().hatchCount===1);
  s=await snap(p);check('real Phaser contact hatches original seven',s.eggs.instances[0].total===7);await p.screenshot({path:path.join(folder,'S4_HATCH.png')});
  for(const actor of ['rafi','shaul']){
   await setup(p,actor,'manual',332,490);
   await p.evaluate(()=>{__RBSpider.setEnabled(false);__game.scene.getScene('Game').world.hammerHit({x:300,y:320,w:64,h:68});});
   await p.waitForFunction(()=>__RBEggSac.snapshot().hits>0,{timeout:10000});
   s=await snap(p);check('spiderling contact damages actual '+actor,s.actor===actor&&s.eggs.instances[0].hits>0);runs.push({actor,snapshot:s});
  }
  await p.evaluate(()=>{const s=__game.scene.getScene('Game');s.player.respawn(145,490);__RBSpider.setEnabled(true);s.world.hammerHit({x:84,y:400,w:42,h:90});s.world.hammerHit({x:240,y:80,w:60,h:60});s.world.hammerHit({x:300,y:320,w:64,h:68});});
  check('tools reach web, ceiling spider and egg through shared chain',await p.evaluate(()=>__RBStickyWeb.snapshot().cuts>0&&__RBSpider.snapshot().state==='stunned'&&__RBEggSac.snapshot().hammerHatches===1));
  await p.evaluate(()=>document.getElementById('rb-m45-egg-toggle').click());
  s=await snap(p);check('OFF resets all children immediately',!s.eggs.instances[0].enabled&&s.eggs.instances[0].total===0);
  await p.evaluate(()=>{window.__s4Old=[];});
  const counts=()=>p.evaluate(()=>{const s=__game.scene.getScene('Game');return {post:s.events.listenerCount('postupdate'),bodies:s.physics.world.bodies.entries.length,static:s.physics.world.staticBodies.entries.length};});
  const before=await counts();
  for(let i=0;i<5;i++){
   await p.evaluate(()=>__s4Old.push(__RBEggSacs));await press(p,'KeyR');await p.waitForTimeout(250);
   s=await snap(p);check('Restart '+(i+1)+' has one binding, stable resources and OFF',s.eggs.instances.length===1&&s.bindings[0].bound&&!s.eggs.instances[0].enabled&&JSON.stringify(await counts())===JSON.stringify(before));
  }
  check('all five prior groups destroyed and emptied',await p.evaluate(()=>__s4Old.length===5&&__s4Old.every(g=>g.lifecycleSnapshot().state==='destroyed'&&g.lifecycleSnapshot().resources===0&&g.snapshot().instances.every(e=>e.total===0))));
  await p.evaluate(()=>document.getElementById('rb-m45-egg-toggle').click());check('ON restores intact egg', (await snap(p)).eggs.instances[0].enabled);
  const shutdown=await p.evaluate(()=>{const s=__game.scene.getScene('Game'),g=__RBEggSacs;s.scene.stop();return {life:g.lifecycleSnapshot(),empty:g.snapshot().instances.every(e=>e.total===0),refs:__RBEggSacs===null&&__RBEggSac===null,post:s.events.listenerCount('postupdate'),bound:__RBStageV1.snapshot().instances.some(o=>o.bound)};});
  check('real scene Shutdown releases children, graphics scopes, bindings, refs and listeners',shutdown.life.state==='destroyed'&&shutdown.life.resources===0&&shutdown.empty&&shutdown.refs&&!shutdown.bound&&shutdown.post===0,{shutdown});
 });
 await session(fixture('zero',[]),async p=>{const s=await snap(p);check('zero Stage sacs spawn no default enemy',s.eggs.instances.length===0&&s.bindings.length===0&&await p.evaluate(()=>__RBEggSac.snapshot()===null));});
 const near={...structuredClone(original),id:'egg-near'},far={...structuredClone(original),id:'egg-far',position:{x:800,y:355}};far.properties.count=3;
 await session(fixture('multiple',[near,far]),async p=>{
  await p.evaluate(()=>{__RBSpider.setEnabled(false);__game.scene.getScene('Game').world.hammerHit({x:300,y:320,w:64,h:68});});
  await p.waitForFunction(()=>__RBEggSacs.snapshot().instances[0].hatchCount===1);
  let s=await snap(p);check('first hatch leaves second sac independent',s.eggs.instances[0].total===7&&s.eggs.instances[1].total===0);
  await p.evaluate(()=>__game.scene.getScene('Game').world.hammerHit({x:770,y:320,w:64,h:68}));await p.waitForFunction(()=>__RBEggSacs.snapshot().instances[1].hatchCount===1);
  s=await snap(p);check('second hatch obeys authored count and ownership',s.eggs.instances[1].total===3&&s.eggs.instances.every(e=>e.spiders.every(b=>b.ownerId===e.id)));
  await p.screenshot({path:path.join(folder,'S4_MULTIPLE.png')});
  await p.evaluate(()=>__game.scene.getScene('Game').world.hammerHit({x:100,y:0,w:420,h:660}));s=await snap(p);check('hammer kills near children without killing far children',s.eggs.instances[0].alive===0&&s.eggs.instances[1].alive===3);
 });
 await session(fixture('overlap',[near,{...structuredClone(near),id:'egg-overlap'}]),async p=>{
  await p.evaluate(()=>{__RBSpider.setEnabled(false);const s=__game.scene.getScene('Game');s.player.respawn(332,490);s.world.hammerHit({x:300,y:320,w:64,h:68});});
  await p.waitForFunction(()=>__RBEggSacs.snapshot().instances.some(e=>e.hits>0));await p.waitForTimeout(100);
  const s=await snap(p);check('multiple simultaneous hatches produce one damage event in immunity window',s.eggs.instances.every(e=>e.hatchCount===1)&&s.eggs.instances.reduce((n,e)=>n+e.hits,0)===1,{hits:s.eggs.instances.map(e=>e.hits)});
 });
 complete=true;
 }finally{fs.rmSync(temp,{recursive:true,force:true});fs.writeFileSync(path.join(folder,'browser.json'),JSON.stringify({status:complete?'PASS':'INCOMPLETE',scope:'actual Phaser fixtures; scripted hammer/initial placement disclosed; retained rope-mode suite separate; no unaided full-stage claim',checks,runs},null,2));}
})().catch(e=>{console.error(e);process.exitCode=1});
