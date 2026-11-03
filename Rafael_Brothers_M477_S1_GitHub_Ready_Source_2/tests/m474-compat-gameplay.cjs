/** M473 real Chromium/Phaser; only initial legal approach setup, then keyboard. */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright'));
const R=path.resolve(__dirname,'..'),HTML=path.join(R,'dist/Rafael_Brothers_M474_ENCOUNTER_LAYOUT.html');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(R,p))).digest('hex');
const {fingerprint}=require('../scripts/m474-evidence.cjs');const checks=[],runs=[],errors=[];let page;
const check=(name,passed,detail={})=>{checks.push({name,passed:!!passed,...detail});console.log(passed?'PASS':'FAIL',name,JSON.stringify(detail).slice(0,1000));};
async function snap(){return page.evaluate(()=>{const s=__game.scene.getScene('Game'),b=s.player.body2;return {x:s.player.x,y:s.player.y,foot:b.bottom,vx:b.velocity.x,vy:b.velocity.y,ground:b.blocked.down||b.touching.down,actor:s.player.activeId,attached:s.tape.attached,anchor:s.tape.anchor&&{x:s.tape.anchor.x,y:s.tape.anchor.y},length:s.tape.length,finished:s.finished,platforms:__RBCollapsingPlatforms.snapshot().instances}})}
async function release(){for(const k of ['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Space','KeyE'])await page.keyboard.up(k)}
async function wait(pred,ms=3000,trace){const until=Date.now()+ms*4;let v;do{await page.waitForTimeout(25);v=await snap();trace?.push(v);if(pred(v))return v;}while(Date.now()<until);throw Error('condition timed out '+JSON.stringify(v).slice(0,350))}
async function setup(actor,mode,x=1810,y=490){await release();await page.keyboard.press('KeyR');await page.waitForTimeout(160);if((await snap()).actor!==actor){await page.keyboard.press('Tab');await page.waitForTimeout(80)}await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__game.scene.getScene('Game').pickups.has('tape'),{timeout:4000});await page.keyboard.up('ArrowRight');await page.evaluate(({mode,x,y})=>{const s=__game.scene.getScene('Game');__RBSwingMode=mode;s.tape.reset();s.player.respawn(x,y);}, {mode,x,y});await page.waitForTimeout(140)}
async function runTo(x,trace){await page.keyboard.down('ArrowRight');await wait(v=>v.x>=x||v.finished,5000,trace);await page.keyboard.up('ArrowRight');await page.waitForTimeout(110)}
async function jumpTo(x,trace){await page.keyboard.down('ArrowRight');await page.keyboard.down('Space');await wait(v=>v.x>=x,2400,trace);await page.keyboard.up('ArrowRight');const landed=await wait(v=>v.ground&&Math.abs(v.vy)<1,1800,trace);await page.keyboard.up('Space');await page.waitForTimeout(70);return landed}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/tmp/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
page=await browser.newPage({viewport:{width:1280,height:720}});page.keyboard.press=async key=>{await page.keyboard.down(key);const f=await page.evaluate(()=>__game.loop.frame);await page.waitForFunction(f=>__game.loop.frame>=f+2,f,{timeout:10000});await page.keyboard.up(key);};page.on('pageerror',e=>errors.push(String(e)));await page.setContent(fs.readFileSync(HTML,'utf8'),{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>globalThis.__game?.scene?.isActive('Menu'));await page.keyboard.press('Enter');await page.waitForFunction(()=>globalThis.__RBCollapsingPlatforms?.snapshot());
console.log('BOOT',JSON.stringify(await snap()));
check('runtime 8 distinct platform bindings',await page.evaluate(()=>__RBCollapsingPlatforms.instances.size===8));
const live=await page.evaluate(()=>__RBRopeCrossingSafety.report());fs.writeFileSync(path.join(R,'evidence/m474-compat-live-safety-initial.json'),JSON.stringify(live,null,2));console.log('LIVE SAFETY',live.status);
for(const actor of ['rafi','shaul'])for(const mode of ['manual','classic','hybrid']){
 const trace=[];await setup(actor,mode);if(mode==='manual')await page.screenshot({path:path.join(R,`evidence/M474_COMPAT_${actor}_${mode}_START.png`)});
 try{
  await runTo(1870,trace);await jumpTo(2000,trace);
  await wait(v=>v.platforms.find(p=>p.id==='teach-log-a').state==='warning',600,trace);

  await jumpTo(2160,trace);await jumpTo(2300,trace);await runTo(2400,trace);await runTo(2830,trace);
  check(`continuous teach + combine ${actor}/${mode}`, (await snap()).x>2790,{final:await snap()});
  await runTo(2940,trace);await wait(v=>v.finished,2000,trace);check(`keyboard reaches actual exit ${actor}/${mode}`,(await snap()).finished,{end:await snap()});
 }catch(e){check(`continuous teach + combine ${actor}/${mode}`,false,{error:String(e),end:await snap()})}
 runs.push({actor,mode,start:{x:1810,y:490},setup:'legal partial stage start; no reposition after start',trace});
}
check('no uncaught browser errors',!errors.length,{errors});
}finally{await browser.close();fs.writeFileSync(path.join(R,'evidence/m474-compat-gameplay.json'),JSON.stringify({milestone:'M4.7.4',sourceFingerprint:fingerprint(),testSha256:sha('tests/m474-compat-gameplay.cjs'),browser:'Chromium',scope:'automated keyboard gameplay, legal partial stage approach; human/Safari NOT TESTED',htmlSha256:sha('dist/Rafael_Brothers_M474_ENCOUNTER_LAYOUT.html'),stageSha256:sha('stages/s01.stage.json'),baselineSha256:sha('baseline/M46_RELEASE.html'),checks,runs},null,2));}process.exitCode=checks.every(c=>c.passed)?0:1})().catch(e=>{console.error(e);process.exitCode=1});
