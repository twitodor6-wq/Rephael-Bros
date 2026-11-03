const fs=require('fs'),path=require('path');const {R,HTML,sha,boot,press,snap,wait,release,setup,runTo,jumpTo}=require('./m474-harness.cjs');const {fingerprint}=require('../scripts/m474-evidence.cjs');
const checks=[],runs=[];const check=(name,passed,details={})=>{checks.push({name,passed:!!passed,...details});console.log(passed?'PASS':'FAIL',name,JSON.stringify(details).slice(0,700));};
(async()=>{const {browser,page:p,errors}=await boot();try{
 for(const actor of ['rafi','shaul'])for(const mode of ['manual','classic','hybrid']){if(process.env.M474_CASE&&(actor!=='rafi'||mode!=='manual'))continue;
  await setup(p,actor,mode);const trace=[];try{
   await press(p,'KeyJ');await wait(p,v=>v.tree.state==='warning',5000,trace);check(`J uses existing hammer and starts warning ${actor}/${mode}`,(await snap(p)).tree.trigger==='hammer');
   await wait(p,v=>v.tree.state==='collapsed',20000,trace);
   const settled=await snap(p);check(`one log / matching settled deck ${actor}/${mode}`,settled.tree.platformActive&&settled.tree.geometry.x===350&&settled.tree.pose.tip.x===466&&settled.tree.pose.top===settled.tree.geometry.y);
   await jumpTo(p,385,trace);await p.screenshot({path:path.join(R,'evidence/M474_LOG_LANDING.png')});check(`actual jump lands on fallen log ${actor}/${mode}`,Math.abs((await snap(p)).foot-510)<2,{landing:await snap(p)});
   // Travel to the lip of the short log, then hook the unchanged original stable root using E.
   await runTo(p,430,trace);await press(p,'KeyE');await wait(p,v=>v.attached,1500,trace);
   check(`E selects original stable root ${actor}/${mode}`,(await snap(p)).anchor?.x===514&& (await snap(p)).anchor?.y===290);
   await p.keyboard.down('ArrowRight');await wait(p,v=>v.attached&&v.x>660&&v.foot<460,12000,trace);await press(p,'KeyE');await wait(p,v=>v.x>720&&v.ground,5000,trace);await release(p);
   check(`continuous log → tape → far bank ${actor}/${mode}`,(await snap(p)).x>706,{end:await snap(p)});
  }catch(e){await release(p);check(`encounter route ${actor}/${mode}`,false,{error:String(e),end:await snap(p)})}
  runs.push({actor,mode,start:{x:314,y:490},scope:'real tool pickup before legal partial start; no reposition, direct attach or injected velocity after start',trace});
 }
 // Expose accidental rope bypass: real normal jump from lip without E.
 await setup(p,'rafi','manual');await press(p,'KeyJ');await wait(p,v=>v.tree.state==='collapsed',20000);await jumpTo(p,385);
 await p.keyboard.down('Space');await wait(p,v=>v.vy< -100,3000);await p.keyboard.down('ArrowRight');const attempt=[];try{await wait(p,v=>v.x<300,12000,attempt)}catch(e){}await release(p);
 check('remaining gap resists ordinary no-rope jump',Math.max(...attempt.map(v=>v.x))<692,{maxX:Math.max(...attempt.map(v=>v.x)),end:await snap(p)});
 check('normal death/respawn resets new tree', (await snap(p)).x<300&& (await snap(p)).tree.state==='idle');
 // Default parking removes the second encounter's hook and both bodies; no finish lock.
 const parked=await p.evaluate(()=>({enabled:__RBRottenRootEnabled,root:__RBRottenRoot.snapshot(),anchor:__RBStageAnchors.isActive('rotten-root'),exit:__RBExitGrove.snapshot()}));check('legacy hollow ledge safely parked by Stage default',!parked.enabled&&!parked.anchor&&!parked.root.colliderActive&&!parked.root.floorColliderActive,{parked});
 // OFF during warning; reset/on/restart do not duplicate hit wrappers or resources.
 await setup(p);await press(p,'KeyJ');await wait(p,v=>v.tree.state==='warning',5000);await p.evaluate(()=>document.getElementById('rb-m463-falling-toggle').click());await p.waitForTimeout(400);const off=await snap(p);check('tree OFF during warning removes hook/collision/active voices',off.tree.state==='disabled'&&!off.tree.platformActive&&!off.tree.anchorActive&&off.tree.activeVoices===0);
 await press(p,'KeyJ');check('J cannot trigger disabled tree',(await snap(p)).tree.state==='disabled');await press(p,'KeyR');await p.waitForTimeout(180);check('OFF survives R',!(await snap(p)).tree.enabled);
 await p.evaluate(()=>document.getElementById('rb-m463-falling-toggle').click());await p.waitForTimeout(60);check('ON restores intact connected tree',(await snap(p)).tree.state==='idle'&&(await snap(p)).tree.anchorActive);
 const counts=()=>p.evaluate(()=>{const s=__game.scene.getScene('Game');return {children:s.children.list.length,bodies:s.physics.world.staticBodies.entries.length,post:s.events.listenerCount('postupdate'),bindings:__RBStageV1.snapshot().instances.filter(v=>v.bound).length,dup:__RBStageAnchors.snapshot().duplicateRefs.length}});
 await press(p,'KeyR');await p.waitForTimeout(180);const initial=await counts(),cycle=[];for(let i=0;i<5;i++){await press(p,'KeyR');await p.waitForTimeout(180);cycle.push(await counts());}check('five restarts retain bounded scene resources',cycle.every(v=>JSON.stringify(v)===JSON.stringify(initial)),{initial,cycle});
 // K remains the existing drill dispatch (one real acquired pickup; controlled setup only).
 await p.evaluate(()=>{const s=__game.scene.getScene('Game');s.player.respawn(800,490);});await p.waitForFunction(()=>__game.scene.getScene('Game').pickups.has('drill'));
 const drillBefore=await p.evaluate(()=>__game.scene.getScene('Game').tools.nailCd);await press(p,'KeyK');await p.waitForTimeout(30);const drill=await p.evaluate(()=>({cooldown:__game.scene.getScene('Game').tools.nailCd,gear:__game.scene.getScene('Game').pickups.has('drill')}));check('real K still invokes original acquired drill',drill.gear&&drill.cooldown>drillBefore,{drillBefore,drill});
 const telemetry=await p.evaluate(()=>({composer:__RBSceneComposerV1.diagnostics(),telemetry:__RBTelemetry?.snapshot?.(),bridge:__RBBridgePolish.snapshot(),safety:__RBRopeCrossingSafety.report()}));fs.writeFileSync(path.join(R,'evidence/m474-telemetry.json'),JSON.stringify(telemetry,null,2));check('telemetry and encounter snapshots serialize to JSON',!!telemetry.telemetry&&telemetry.bridge.decorativeOnly&&telemetry.bridge.brokenColliderCount===0);
 check('live safety retains three crossings',telemetry.safety.status==='PASS'&&telemetry.safety.crossings.length===3,{report:telemetry.safety});
 check('zero uncaught JavaScript errors',!errors.length,{errors});
 }finally{await browser.close();fs.writeFileSync(path.join(R,'evidence/m474-encounters.json'),JSON.stringify({milestone:'M4.7.4',sourceFingerprint:fingerprint(),htmlSha256:sha(HTML),stageSha256:sha('stages/s01.stage.json'),testSha256:sha('tests/m474-encounters.cjs'),checks,runs},null,2));}process.exitCode=checks.every(v=>v.passed)?0:1;
})().catch(e=>{console.error(e);process.exitCode=1});
