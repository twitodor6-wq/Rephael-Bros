/** M474: one physical log, a data-authored hinge, and a delayed static landing deck.
 * Existing player / tape / tools are consumed; their physics and cooldowns are untouched.
 */
function fallingTreeSafe(c){
 if(c.motion)return c.bridge.x<=c.pit.left&&c.bridge.x>=c.pit.left-32&&c.bridge.x+c.bridge.w>c.pit.left+40&&c.pit.right-(c.bridge.x+c.bridge.w)>=c.motion.minRemainingGap&&c.motion.minRemainingGap>=230&&c.bridge.y<=520&&c.stub.x+c.stub.w<=c.pit.left-8;
 return c.bridge.x>=c.pit.left&&c.bridge.x<=c.pit.left+40&&c.bridge.x+c.bridge.w<=c.pit.right-150&&c.bridge.y<490&&c.stub.x+c.stub.w<=c.pit.left-8;
}
function createFallingLogState(cfg){
 let state='idle',elapsed=0,trigger=null,collapseCount=0;const m=cfg.motion||{breakMs:180,fallMs:700,settleMs:260};
 const next={warning:'breaking',breaking:'falling',falling:'settling',settling:'collapsed'};
 const duration=s=>s==='warning'?cfg.warningMs:s==='breaking'?m.breakMs:s==='falling'?m.fallMs:m.settleMs;
 return {begin(source){if(state!=='idle')return false;state='warning';trigger=source;elapsed=0;return true;},
 step(dt){let left=Math.max(0,Number.isFinite(dt)?dt:0);while(next[state]&&left>0){const rest=duration(state)-elapsed;if(left<rest){elapsed+=left;break;}left-=rest;state=next[state];elapsed=0;if(state==='collapsed')collapseCount++;}},
 reset(){state='idle';elapsed=0;trigger=null;},disable(){state='disabled';elapsed=0;},
 snapshot:()=>({state,elapsed,trigger,collapseCount,platformActive:state==='collapsed',progress:next[state]?Math.min(1,elapsed/duration(state)):0})};
}
function fallingLogPose(cfg,state,progress){
 const pivot={x:cfg.bridge.x,y:cfg.bridge.y+cfg.bridge.h/2},length=cfg.bridge.w;
 let angle=-Math.PI/2;
 if(state==='falling')angle=-Math.PI/2*(1-progress*progress);
 if(state==='settling')angle=-.025*Math.sin(progress*Math.PI*2)*(1-progress);
 if(state==='collapsed')angle=0;
 const point=d=>({x:pivot.x+Math.cos(angle)*d,y:pivot.y+Math.sin(angle)*d});
 return {pivot,length,thickness:cfg.bridge.h,angle,tip:point(length),hook:point(cfg.motion?.hookDistance??length*.8),top:cfg.bridge.y};
}
function fallingLogJumpAudit(cfg,physics){
 const {gravity:g,maxSpeed:s,jumpVelocity:j,coyote,bodyWidth}=physics;
 if(![g,s,j,coyote,bodyWidth].every(Number.isFinite)||g<=0||s<=0||bodyWidth<=0)throw Error('Verified jump profile required');
 const target=cfg.stub.y+cfg.stub.h,delta=target-cfg.bridge.y,v=Math.abs(j),disc=v*v+2*g*delta;
 const flight=disc>=0?(v+Math.sqrt(disc))/g:0,maxGap=s*(flight+coyote)+bodyWidth;
 const remainingGap=cfg.pit.right-cfg.bridge.x-cfg.bridge.w;
 return {safe:remainingGap>maxGap,maxGap,remainingGap,margin:remainingGap-maxGap,scope:'ordinary unboosted jump; full coyote horizontal allowance and body-width edge allowance'};
}
function installFallingBridgeTree(win=globalThis){
 if(win.__RBFallingBridgeInstalled)return win.__RBFallingBridge||null;
 if(typeof win.__RBFallingBridgeEnabled!=='boolean')win.__RBFallingBridgeEnabled=true;
 const button=win.document.createElement('button');button.type='button';button.id='rb-m463-falling-toggle';
 const label=()=>{button.textContent='Falling hollow tree: '+(win.__RBFallingBridgeEnabled?'ON':'OFF');button.setAttribute('aria-pressed',String(win.__RBFallingBridgeEnabled));};label();
 button.onclick=()=>{win.__RBFallingBridgeEnabled=!win.__RBFallingBridgeEnabled;win.__RBFallingBridge?.setEnabled(win.__RBFallingBridgeEnabled);label();button.blur();};win.document.body.append(button);
 function attach(scene){
  scene.__rbFallingBridge?.destroy();
  const cfg=win.__RBStageV1.getConfig('falling-bridge-tree','fallen-bridge-tree');if(!cfg||!fallingTreeSafe(cfg))throw Error('Unsafe falling log layout');
  const reg=scene.__rbStageAnchors,anchor=reg.getRef(cfg.anchorId),sim=createFallingLogState(cfg),transitions=[];let standMs=0,pullMs=0,runtime;
  return createRBManagedActor({id:'falling-bridge-tree',scene,stateProperty:'lifecycleState',sceneLifecycle:false,enabled:()=>win.__RBFallingBridgeEnabled!==false,
   onState:(id,state)=>win.__RBSceneComposerV1?.recordState(id,state),
   onReset:()=>runtime?.resetChallenge(),onDisable:()=>runtime?.disableChallenge(),
   create(scope){
    const g=scope.gameObject(scene.add.graphics().setDepth(13)),hint=scope.gameObject(scene.add.text(cfg.stub.x-20,cfg.stub.y-70,'J · hollow trunk',{fontFamily:'Georgia',fontSize:'14px',color:'#edd6a4',stroke:'#16271f',strokeThickness:4}).setOrigin(.5).setDepth(25));
    const z=scope.gameObject(scene.add.zone(cfg.bridge.x+cfg.bridge.w/2,cfg.bridge.y+cfg.bridge.h/2,cfg.bridge.w,cfg.bridge.h));scene.physics.add.existing(z,true);z.body.setSize(cfg.bridge.w,cfg.bridge.h).updateFromGameObject();z.body.__rbCollisionPolicy='one-way-top';
    const coll=scene.physics.add.collider(scene.player,z,undefined,()=>{const b=scene.player.body2;return b.velocity.y>=0&&b.prev.y+b.height<=cfg.bridge.y+6;});
    scope.resource(z.body,b=>{b.enable=false;},(b,on)=>{b.enable=on&&sim.snapshot().platformActive;});scope.resource(coll,c=>c.destroy(),(c,on)=>{c.active=on&&sim.snapshot().platformActive;});
    let audio=null;const voices=new Set(),sounds=[];
    function stopAudio(){for(const o of voices){try{o.stop();}catch{}}voices.clear();}
    scope.defer(()=>{stopAudio();audio?.close?.().catch(()=>{});});
    function tone(kind){sounds.push({kind,at:Math.round(scene.time.now)});if(sounds.length>24)sounds.shift();try{const C=win.AudioContext||win.webkitAudioContext;if(!C)return;if(!audio)audio=new C();if(audio.state==='suspended')audio.resume().catch(()=>{});if(voices.size>=4)return;const o=audio.createOscillator(),v=audio.createGain(),at=audio.currentTime,d=kind==='fall'?.35:.16;o.type='triangle';o.frequency.setValueAtTime(kind==='groan'?105:kind==='fall'?75:180,at);o.frequency.exponentialRampToValueAtTime(45,at+d);v.gain.setValueAtTime(.035,at);v.gain.exponentialRampToValueAtTime(.0001,at+d);o.connect(v).connect(audio.destination);voices.add(o);o.onended=()=>{voices.delete(o);o.disconnect();v.disconnect();};o.start(at);o.stop(at+d);}catch{}}
    const event=state=>{const d={id:cfg.anchorId,state,trigger:sim.snapshot().trigger,at:Math.round(scene.time.now)};transitions.push(d);if(transitions.length>40)transitions.shift();scene.game.events.emit('encounter:falling-log',d);};
    const root=()=>{const p=fallingLogPose(cfg,'idle',0).pivot;g.lineStyle(18,0x253a29,1).beginPath().moveTo(cfg.stub.x,cfg.stub.y+7).lineTo(p.x-13,p.y+14).lineTo(p.x,p.y+3).strokePath();g.lineStyle(7,0x5b6540,.95).lineBetween(cfg.stub.x+5,cfg.stub.y+5,p.x,p.y+5);};
    function render(){
     const s=sim.snapshot(),on=win.__RBFallingBridgeEnabled!==false;g.clear();hint.setVisible(on&&(s.state==='idle'||s.state==='warning'));
     if(!on||s.state==='disabled')return;
     const pose=fallingLogPose(cfg,s.state,s.progress),h=pose.thickness/2,L=pose.length;
     root();g.save();g.translateCanvas(pose.pivot.x,pose.pivot.y);g.rotateCanvas(pose.angle);
     // This identical silhouette, hollow end, knots and bark grain is reused at every phase.
     g.fillStyle(0x251e16,1).fillPoints([{x:0,y:-h},{x:L-8,y:-h+1},{x:L,y:-h+4},{x:L,y:h-3},{x:L-7,y:h},{x:2,y:h}],true);
     g.fillStyle(0x715234,1).fillPoints([{x:1,y:-h+2},{x:L-8,y:-h+3},{x:L-2,y:0},{x:L-5,y:h-2},{x:1,y:h-2}],true);
     g.lineStyle(2,0xaf9561,.85).lineBetween(4,-h+3,L-9,-h+4);g.lineStyle(2,0x433323,.9).lineBetween(7,h-3,L-10,h-4);
     for(let i=1;i<6;i++){const x=L*i/7;g.lineStyle(1.5,0x3a2c20,.9).lineBetween(x,-h+4,x+7,h-2);g.lineStyle(1,0xb2935f,.45).lineBetween(x+8,-h+3,x+17,-h+4);}
     g.fillStyle(0x171915,1).fillEllipse(L-10,0,13,8);g.lineStyle(2,0x95815c,.9).strokeEllipse(L-10,0,15,10);
     g.fillStyle(0x344e32,.9).fillEllipse(L*.33,-h+2,20,5);g.fillEllipse(L*.65,-h+2,14,4);
     if(s.state==='warning'||s.state==='breaking'){g.lineStyle(2,s.state==='breaking'?0xffd08b:0xdba85b,1).beginPath().moveTo(8,-h).lineTo(16,0).lineTo(10,h).strokePath();}
     g.restore();
     if(s.state==='idle'||s.state==='warning'){g.lineStyle(2,0x26382b,1).strokeCircle(anchor.x,anchor.y,9);g.fillStyle(s.state==='warning'?0xe8b368:0xdbc18b,1).fillCircle(anchor.x,anchor.y,5);g.lineStyle(1,0xdbc18b,.5).strokeCircle(anchor.x,anchor.y,13);}
     hint.setText(s.state==='warning'?'Cracking · move back!':'J · hollow trunk');
    }
    function apply(){const on=win.__RBFallingBridgeEnabled!==false&&sim.snapshot().state!=='disabled';z.body.enable=on&&sim.snapshot().platformActive;coll.active=z.body.enable;reg.setActive(cfg.anchorId,on&&['idle','warning'].includes(sim.snapshot().state));render();}
    function begin(which){if(!sim.begin(which))return false;event('warning');tone('groan');scene.game.events.emit('hud:toast','Hollow trunk cracking — step back; it will form a short ledge.');apply();return true;}
    function resetChallenge(){sim.reset();standMs=0;pullMs=0;g.setVisible(true);apply();}
    function disableChallenge(){stopAudio();sim.disable();standMs=0;pullMs=0;apply();g.setVisible(false);hint.setVisible(false);}
    scope.resource(null,()=>reg.setActive(cfg.anchorId,false),(_,on)=>{if(!on)reg.setActive(cfg.anchorId,false);});
    // Extend existing hit dispatch: preserve barriers, switches, web cutting and spider hits.
    const previous=scene.world.hammerHit;const hammer=function(rect){const prior=previous.call(this,rect);const pose=fallingLogPose(cfg,'idle',0),box={x:pose.pivot.x-cfg.bridge.h/2,y:pose.pivot.y-pose.length,w:cfg.bridge.h,h:pose.length};const overlap=rect.x<box.x+box.w&&rect.x+rect.w>box.x&&rect.y<box.y+box.h&&rect.y+rect.h>box.y;const hit=win.__RBFallingBridgeEnabled!==false&&cfg.hammer?.enabled!==false&&overlap&&begin('hammer');return !!(prior||hit);};scene.world.hammerHit=hammer;scope.defer(()=>{if(scene.world.hammerHit===hammer)scene.world.hammerHit=previous;});
    const previousRespawn=scene.player.respawn;const respawn=function(...args){const out=previousRespawn.apply(this,args);runtime?.reset();return out;};scene.player.respawn=respawn;scope.defer(()=>{if(scene.player.respawn===respawn)scene.player.respawn=previousRespawn;});
    runtime={version:'M4.7.4',zone:z,collider:coll,graphics:g,hint,resetChallenge,disableChallenge,setEnabled(on){win.__RBFallingBridgeEnabled=!!on;if(on)runtime.reset();else runtime.disable();},
     snapshot(){const s=sim.snapshot();return {...s,enabled:win.__RBFallingBridgeEnabled!==false,anchorActive:reg.isActive(cfg.anchorId),standMs,pullMs,warningMs:s.state==='warning'?s.elapsed:cfg.warningMs,geometry:{...cfg.bridge},pose:fallingLogPose(cfg,s.state,s.progress),platformActive:!!z.body.enable,colliderActive:coll.active,clearance:cfg.pit.right-cfg.bridge.x-cfg.bridge.w,safe:fallingTreeSafe(cfg),transitions:transitions.slice(),sounds:sounds.slice(),activeVoices:voices.size};},
     tick(_,dt){const was=sim.snapshot().state;if(was==='idle'){const b=scene.player.body2;const contact=(b.blocked.down||b.touching.down)&&Math.abs(b.bottom-cfg.stub.y-cfg.stub.h)<8&&b.right>cfg.stub.x&&b.x<cfg.stub.x+cfg.stub.w;standMs=contact?standMs+dt:0;const d=Math.hypot(b.center.x-anchor.x,b.center.y-anchor.y);pullMs=scene.tape.anchor===anchor&&d/scene.tape.length>=cfg.pullRatio?pullMs+dt:0;if(standMs>=cfg.standMs)begin('stand');else if(pullMs>=cfg.pullMs)begin('tape');}else{sim.step(dt);const now=sim.snapshot().state;if(now!==was){event(now);if(now==='breaking')tone('snap');if(now==='settling'){tone('fall');scene.cameras.main.shake(90,.002);}if(now==='breaking')scene.game.events.emit('hud:toast','The root hinge breaks — release the fragile hook!');}}apply();}
    };
    scope.reference(scene,'__rbFallingBridge',runtime);scope.reference(win,'__RBFallingBridge',runtime);scope.binding(win.__RBStageV1,'falling-bridge-tree','fallen-bridge-tree',runtime);resetChallenge();return runtime;
   },update:(_,dt)=>{if(!scene.finished)runtime?.tick(_,Math.min(60,dt||0));}});
 }
 win.__RBSceneComposerV1.register('falling-bridge-tree',attach);win.__RBFallingBridgeInstalled=true;
}
