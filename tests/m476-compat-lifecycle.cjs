/** M473 real Chromium/Phaser; only initial legal approach setup, then keyboard. */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright'));
const R=path.resolve(__dirname,'..'),HTML=path.join(R,'dist/Rafael_Brothers_M476_FULL_RUN_ACCEPTANCE.html');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(R,p))).digest('hex');
const {fingerprint}=require('../scripts/m476-evidence.cjs');const checks=[],runs=[],errors=[];let page;
const check=(name,passed,detail={})=>{checks.push({name,passed:!!passed,...detail});console.log(passed?'PASS':'FAIL',name,JSON.stringify(detail).slice(0,1000));};
async function snap(){return page.evaluate(()=>{const s=__game.scene.getScene('Game'),b=s.player.body2;return {x:s.player.x,y:s.player.y,foot:b.bottom,vx:b.velocity.x,vy:b.velocity.y,ground:b.blocked.down||b.touching.down,actor:s.player.activeId,attached:s.tape.attached,anchor:s.tape.anchor&&{x:s.tape.anchor.x,y:s.tape.anchor.y},length:s.tape.length,finished:s.finished,platforms:__RBCollapsingPlatforms.snapshot().instances}})}
async function release(){for(const k of ['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Space','KeyE'])await page.keyboard.up(k)}
async function wait(pred,ms=3000,trace){const until=Date.now()+ms*4;let v;do{await page.waitForTimeout(25);v=await snap();trace?.push(v);if(pred(v))return v;}while(Date.now()<until);throw Error('condition timed out '+JSON.stringify(v).slice(0,350))}
async function setup(actor,mode,x=1810,y=490){await release();await page.keyboard.press('KeyR');await page.waitForTimeout(160);if((await snap()).actor!==actor){await page.keyboard.press('Tab');await page.waitForTimeout(80)}await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__game.scene.getScene('Game').pickups.has('tape'),{timeout:4000});await page.keyboard.up('ArrowRight');await page.evaluate(({mode,x,y})=>{const s=__game.scene.getScene('Game');__RBSwingMode=mode;s.tape.reset();s.player.respawn(x,y);}, {mode,x,y});await page.waitForTimeout(140)}
async function runTo(x,trace){await page.keyboard.down('ArrowRight');await wait(v=>v.x>=x||v.finished,5000,trace);await page.keyboard.up('ArrowRight');await page.waitForTimeout(110)}
async function jumpTo(x,trace){await page.keyboard.down('ArrowRight');await page.keyboard.down('Space');await wait(v=>v.x>=x,2400,trace);await page.keyboard.up('ArrowRight');const landed=await wait(v=>v.ground&&Math.abs(v.vy)<1,1800,trace);await page.keyboard.up('Space');await page.waitForTimeout(70);return landed}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/tmp/m476-compat-chromium',args:['--no-sandbox','--disable-webgl','--disable-gpu','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
page=await browser.newPage({viewport:{width:1280,height:720}});page.keyboard.press=async key=>{await page.keyboard.down(key);const f=await page.evaluate(()=>__game.loop.frame);await page.waitForFunction(f=>__game.loop.frame>=f+2,f,{timeout:10000});await page.keyboard.up(key);};page.on('pageerror',e=>errors.push(String(e)));await page.setContent(fs.readFileSync(HTML,'utf8'),{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>globalThis.__game?.scene?.isActive('Menu'));await page.keyboard.press('Enter');await page.waitForFunction(()=>globalThis.__RBCollapsingPlatforms?.snapshot());
fs.writeFileSync(path.join(R,'evidence/m476-compat-runtime-snapshot.json'),JSON.stringify(await page.evaluate(()=>__RBRopeCrossingSafety.snapshot()),null,2));
// UI flag must control the one existing enemy. Deliberately trigger its warning then switch OFF.
await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__RBSpider.snapshot().state==='warning');await page.keyboard.up('ArrowRight');
await page.evaluate(()=>document.querySelector('#rb-m473-spider-toggle').click());
const before=await page.evaluate(()=>__RBSpider.snapshot());await page.waitForTimeout(1000);const after=await page.evaluate(()=>({snapshot:__RBSpider.snapshot(),views:Object.values(__RBSpider.view).filter(v=>typeof v?.visible==='boolean').map(v=>v.visible),hammer:__RBSpider.hammer({x:0,y:0,w:500,h:600})}));
check('spider OFF freezes timer/AI, hides all five views, disables contact and hammer',!before.enabled&&!after.snapshot.enabled&&before.y===after.snapshot.y&&before.damageCount===after.snapshot.damageCount&&after.views.length===5&&after.views.every(v=>!v)&&!after.hammer,{before,after});
await page.keyboard.press('Tab');await page.keyboard.press('KeyR');await page.waitForTimeout(160);check('spider OFF survives Tab and R',await page.evaluate(()=>!__RBSpider.enabled&&Object.values(__RBSpider.view).filter(v=>typeof v?.visible==='boolean').every(v=>!v.visible)));
await page.evaluate(()=>document.querySelector('#rb-m473-spider-toggle').click());check('spider ON restores original enemy',await page.evaluate(()=>__RBSpider.enabled&&__RBSpider.snapshot().state==='idle_ceiling'));
// Teaching failure, real collapse into lower floor, return via two jumps. No mid-route respawn.
for(const actor of ['rafi','shaul']){
 await setup(actor,'manual');const trace=[];
 try{
 await runTo(1870,trace);await jumpTo(2000,trace);await wait(v=>v.platforms.find(p=>p.id==='teach-log-a').state==='warning',2000,trace);
 if(actor==='rafi')await page.screenshot({path:path.join(R,'evidence/M476_COMPAT_WARNING.png')});
 await wait(v=>v.foot===630&&v.ground,10000,trace);check('waiting on log falls to visible recovery '+actor,!(await snap()).platforms.find(p=>p.id==='teach-log-a').bodyEnabled);
 if(actor==='rafi')await page.screenshot({path:path.join(R,'evidence/M476_COMPAT_COLLAPSE_RECOVERY.png')});
 // A straight lower-floor jump cannot bypass the high exit bank.
 await runTo(2300,trace);await page.keyboard.down('Space');await page.keyboard.down('ArrowRight');await page.waitForTimeout(1100);await release();
 const bypass=await snap();check('lower recovery floor cannot bypass challenge '+actor,bypass.x<2340&&bypass.foot>560,{position:bypass.x,foot:bypass.foot});
 await page.keyboard.down('ArrowLeft');await wait(v=>v.x<1900,5000,trace);await page.keyboard.up('ArrowLeft');await page.waitForTimeout(120);
 await page.keyboard.down('Space');await wait(v=>v.foot<580&&!v.ground,1500,trace);await wait(v=>v.ground,2000,trace);await page.keyboard.up('Space');await page.waitForTimeout(110);
 await page.keyboard.down('Space');await wait(v=>v.foot<510&&!v.ground,1500,trace);await wait(v=>v.ground,2000,trace);await page.keyboard.up('Space');await page.waitForTimeout(110);
 const returned=await snap();check('return to stable entry rearms rotten logs '+actor,returned.foot===490&&returned.platforms.find(p=>p.id==='teach-log-a').state==='idle',{returned});
 }catch(e){check('teaching recovery '+actor,false,{error:String(e),end:await snap()})}await release();runs.push({kind:'teaching-recovery',actor,trace});
}
// State independence and resource ownership are tested on live actors, with simulation setup labeled.
await setup('rafi','manual');
const independent=await page.evaluate(()=>{const a=__RBCollapsingPlatforms.instances.get('teach-log-a'),b=__RBCollapsingPlatforms.instances.get('teach-log-b');a.sim.step(60,true);b.sim.step(60,true);a.sim.step(1100,false);b.sim.step(1100,false);return {a:a.snapshot(),b:b.snapshot()}});
check('live independent instance clocks (explicit state simulation)',independent.a.state==='warning'&&independent.b.state==='collapsed',{independent});
await page.evaluate(()=>document.querySelector('#rb-m473-collapse-toggle').click());const disabled=await page.evaluate(()=>__RBCollapsingPlatforms.snapshot());await page.waitForTimeout(300);check('OFF during warning disables every collider and timer',disabled.instances.every(p=>p.state==='disabled'&&!p.bodyEnabled&&!p.colliderActive));
await page.evaluate(()=>document.querySelector('#rb-m473-collapse-toggle').click());check('ON resets every surface intact',await page.evaluate(()=>__RBCollapsingPlatforms.snapshot().instances.every(p=>p.state==='idle'&&p.bodyEnabled&&p.colliderActive)));
const destroyed=await page.evaluate(()=>{const a=__RBCollapsingPlatforms.instances.get('teach-log-a'),b=__RBCollapsingPlatforms.instances.get('teach-log-b');a.disable();a.reset();const first=a.destroy();return {first,second:a.destroy(),reset:a.reset(),bound:__RBStageV1.snapshot().instances.find(v=>v.id==='teach-log-a').bound,sibling:b.snapshot(),count:__RBCollapsingPlatforms.instances.size}});
check('destroy single instance is idempotent, unbinds only self and leaves sibling live',destroyed.first&&!destroyed.second&&!destroyed.reset&&!destroyed.bound&&destroyed.sibling.bodyEnabled&&destroyed.count===7,{destroyed});
const resource=()=>page.evaluate(()=>{const s=__game.scene.getScene('Game');return {bodies:s.physics.world.staticBodies.entries.length,children:s.children.list.length,listeners:s.events.listenerCount('postupdate'),actors:__RBSceneComposerV1.snapshot().managed.length,bindings:__RBStageV1.snapshot().instances.filter(i=>i.bound).length,duplicates:__RBStageAnchors.snapshot().duplicateRefs}});
await page.keyboard.press('KeyR');await page.waitForTimeout(180);const initial=await resource();const cycles=[];for(let i=0;i<8;i++){await page.keyboard.press('KeyR');await page.waitForTimeout(180);cycles.push(await resource())}check('8 restarts keep colliders, children, listeners and bindings bounded',cycles.every(v=>v.bodies===initial.bodies&&v.children===initial.children&&v.listeners===initial.listeners&&v.actors===initial.actors&&v.bindings===initial.bindings&&v.duplicates.length===0),{initial,cycles});
// Kill fall uses normal engine respawn. Test setup puts actor at legal bridge approach.
await setup('rafi','manual',2410,490);await runTo(2490);await wait(v=>v.platforms.find(p=>p.id==='bridge-a').state==='collapsed',2200);await wait(v=>v.x<300,2500);check('failure invokes actual death/respawn and resets platforms',(await snap()).platforms.every(p=>p.state==='idle'));
check('old falling-tree bridge and rotten-root retained',await page.evaluate(()=>__RBFallingBridge.snapshot().safe&&__RBRottenRoot.snapshot().state==='idle'&&__RBStageAnchors.getRef('stable-root-extension').x===1230));
check('no uncaught errors',!errors.length,{errors});
}finally{await browser.close();fs.writeFileSync(path.join(R,'evidence/m476-compat-lifecycle.json'),JSON.stringify({milestone:'M4.7.6',sourceFingerprint:fingerprint(),testSha256:sha('tests/m476-compat-lifecycle.cjs'),browser:'Chromium',htmlSha256:sha('dist/Rafael_Brothers_M476_FULL_RUN_ACCEPTANCE.html'),stageSha256:sha('stages/s01.stage.json'),checks,runs},null,2));}process.exitCode=checks.every(c=>c.passed)?0:1})().catch(e=>{console.error(e);process.exitCode=1});
