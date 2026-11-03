/** Rafael Brothers M4.6.2 — Rotten Root / Hollow Tree prototype hazard.
 * One optional environmental anchor near the exit arch. It can be triggered by
 * standing on the rotten shelf or by pulling its tape anchor until the root
 * warns, cracks, then collapses safely to the floor.
 * Uses only Arcade scene objects; never swaps player physics engine.
 */
const ROTTEN_ROOT_SCHEMA='rafael-rotten-root/v1';
function rottenRootConfig(win=globalThis){
 const cfg=win.__RBStageV1?.getConfig('rotten-root','rotten-root-ledge');
 if(!cfg)throw Error('Missing Stage 01 rotten-root prefab');
 return cfg;
}
function rottenPointInRect(p,r){return !!p&&p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;}
function rottenTension(scene,anchor){
  const tape=scene?.tape; const body=scene?.player?.body2;
  if(!tape?.attached||tape.anchor!==anchor||!body||!Number.isFinite(tape.length)||tape.length<=0) return {attached:false,ratio:0,distance:0};
  const distance=Math.hypot(body.center.x-anchor.x,body.center.y-anchor.y);
  return {attached:true,distance,ratio:distance/tape.length};
}
function rottenStateSnapshot(runtime){
  return {
    schema:ROTTEN_ROOT_SCHEMA,
    enabled:globalThis.__RBRottenRootEnabled!==false,
    state:runtime.state,
    trigger:runtime.trigger,
    anchor:{...runtime.anchor},
    anchorActive:globalThis.__RBStageAnchors?.getRef?.('rotten-root')===runtime.anchor ? globalThis.__RBStageAnchors.isActive('rotten-root'):!!runtime.anchorActive,
    ledge:{...runtime.config.ledge},
    warningElapsed:Math.round(runtime.warningElapsed),
    tapePullMs:Math.round(runtime.tapePullMs),
    standMs:Math.round(runtime.standMs),
    audioEvents:runtime.audioEvents.slice(-12),
    collapseCount:runtime.collapseCount,
    fallenVisible:runtime.fallen?.visible ?? false,
    colliderActive:!!runtime.collider?.active,
    floorColliderActive:!!runtime.floorCollider?.active,
    safeFloor:{x:runtime.config.ledge.x-10,y:runtime.config.fallY,w:runtime.config.safeFloorW,h:10}
  };
}
function installRottenRoot(win=globalThis){
  if(win.__RBRottenRootInstalled) return win.__RBRottenRoot||null;
  if(typeof win.__RBRottenRootEnabled!=='boolean') win.__RBRottenRootEnabled=rottenRootConfig(win).enabled!==false;
  const doc=win.document;
  if(doc){
    const button=doc.createElement('button');
    button.id='rb-m462-rotten-toggle'; button.type='button';
    const render=()=>button.textContent='M4.6.2 Rotten Root: '+(win.__RBRottenRootEnabled?'ON':'OFF');
    render();
    button.style.cssText='display:none;background:#11241d;color:#e7eed4;border:1px solid #6f8d6f;padding:7px 10px;cursor:pointer';
    button.addEventListener('click',()=>{win.__RBRottenRootEnabled=!win.__RBRottenRootEnabled;render();win.__RBRottenRoot?.setEnabled?.(win.__RBRottenRootEnabled);button.blur();});
    doc.body.append(button);
  }
  function attach(scene){
    if(scene.__rbRottenRoot) scene.__rbRottenRoot.destroy();
    const cfg=rottenRootConfig(win);
    return createRBManagedActor({id:'rotten-root',scene,stateProperty:'lifecycleState',sceneLifecycle:!win.__RBSceneComposerV1,enabled:()=>win.__RBRottenRootEnabled!==false,
    onState:(id,state)=>win.__RBSceneComposerV1?.recordState?.(id,state),
    onReset:()=>scene.__rbRottenRoot?.resetChallenge?.(),
    onDisable:()=>scene.__rbRottenRoot?.disableChallenge?.(),
    onDestroy:()=>{try{scene.__rbRottenRoot?.audioCtx?.close?.().catch(()=>{});}catch{}},
    update:(_,dt)=>scene.__rbRottenRoot?.tick?.(_,Math.min(Number.isFinite(dt)?dt:16.7,60)),
    create(scope){
    const g=scope.gameObject(scene.add.graphics().setDepth(15));
    const fallen=scope.gameObject(scene.add.graphics().setDepth(10).setVisible(false));
    const warning=scope.gameObject(scene.add.text(cfg.ledge.x+cfg.ledge.w/2,cfg.ledge.y-52,'!',{fontFamily:'Georgia,serif',fontSize:'62px',color:'#d18a3d',stroke:'#4f220d',strokeThickness:7}).setOrigin(.5).setVisible(false).setDepth(18));
    const zone=scope.gameObject(scene.add.zone(cfg.ledge.x+cfg.ledge.w/2,cfg.ledge.y+cfg.ledge.h/2,cfg.ledge.w,cfg.ledge.h)); scene.physics.add.existing(zone,true);scope.resource(zone.body,b=>{b.enable=false},(b,on)=>{b.enable=on&&runtime.state!=='collapsed'});zone.body.setSize(cfg.ledge.w,cfg.ledge.h).updateFromGameObject();
    const floor=scope.gameObject(scene.add.zone(cfg.ledge.x-10+cfg.safeFloorW/2,cfg.fallY+5,cfg.safeFloorW,10)); scene.physics.add.existing(floor,true);scope.resource(floor.body,b=>{b.enable=false},(b,on)=>{b.enable=on&&runtime.state==='collapsed'});floor.body.setSize(cfg.safeFloorW,10).updateFromGameObject();
    const runtime={version:'M4.6.3',config:cfg,graphics:g,fallen,warning,zone,floor,anchor:{...cfg.anchor},anchorActive:true,state:'idle',trigger:null,warningElapsed:0,standMs:0,tapePullMs:0,collapseCount:0,audioEvents:[],prevEnabled:win.__RBRottenRootEnabled!==false,crackBursts:[],audioCtx:null};
    const zoneBody=zone.body, floorBody=floor.body;
    const collPred=player=>{const body=player?.body;return runtime.state!=='collapsed' && !!body && body.velocity.y>=0 && body.prev.y+body.height<=cfg.ledge.y+6;};
    const collider=scope.resource(scene.physics.add.collider(scene.player,zone,undefined,collPred),v=>v.destroy(),(v,on)=>{v.active=on&&runtime.state!=='collapsed'});
    const floorCollider=scope.resource(scene.physics.add.collider(scene.player,floor,undefined,player=>runtime.state==='collapsed' && !!player?.body && player.body.velocity.y>=0 && player.body.prev.y+player.body.height<=cfg.fallY+7),v=>v.destroy(),(v,on)=>{v.active=on&&runtime.state==='collapsed'});
    runtime.collider=collider; runtime.floorCollider=floorCollider;
    const shared=scene.__rbStageAnchors || win.__RBStageAnchors;
    const registeredAnchor=shared?.getRef?.('rotten-root');
    if(registeredAnchor && shared.getMeta('rotten-root')?.strength!=='fragile')throw Error('Rotten root must have fragile anchor metadata');
    if(registeredAnchor) runtime.anchor=registeredAnchor;
    const anchorRef=runtime.anchor;
    scope.resource(null,()=>ensureAnchor(false),(_,on)=>{if(!on)ensureAnchor(false);else if(runtime.state!=='collapsed')ensureAnchor(true);});
    function ensureAnchor(on){
      if(shared?.getRef?.('rotten-root')===anchorRef){
        shared.setActive('rotten-root',on);
        runtime.anchorActive=shared.isActive('rotten-root');
        if(!on && runtime.trigger===null && scene.tape?.anchor===anchorRef)runtime.trigger='tape';
        return;
      }
      const arr=scene.tape?.anchors; if(!Array.isArray(arr)) return;
      const has=arr.includes(anchorRef);
      if(on && !has){arr.push(anchorRef); runtime.anchorActive=true;}
      if(!on && has){const idx=arr.indexOf(anchorRef); if(idx>=0) arr.splice(idx,1); runtime.anchorActive=false; if(scene.tape.anchor===anchorRef){scene.tape.release(); runtime.trigger ??= 'tape'; try{scene.game.events.emit('hud:toast','Rotten root gave way — tape released');}catch{}}}
    }
    function tryAudio(type){
      runtime.audioEvents.push({type,time:scene.time.now}); if(runtime.audioEvents.length>24) runtime.audioEvents.shift();
      try{
        const C=win.AudioContext||win.webkitAudioContext; if(!C) return; if(!runtime.audioCtx) runtime.audioCtx=new C();
        const ctx=runtime.audioCtx; if(ctx.state==='suspended') ctx.resume().catch(()=>{});
        const o=ctx.createOscillator(), g1=ctx.createGain(); const noise=ctx.createBufferSource(); const noiseGain=ctx.createGain();
        const dur=type==='collapse'?0.55:(type==='snap'?0.2:0.12); const now=ctx.currentTime;
        const freq=type==='groan'?92:type==='snap'?170:64;
        o.type='sawtooth'; o.frequency.setValueAtTime(freq,now); o.frequency.exponentialRampToValueAtTime(Math.max(38,freq*.45),now+dur);
        g1.gain.setValueAtTime(type==='collapse'?0.05:0.03,now); g1.gain.exponentialRampToValueAtTime(0.0001,now+dur);
        const buffer=ctx.createBuffer(1,Math.max(1,ctx.sampleRate*dur),ctx.sampleRate); const data=buffer.getChannelData(0); for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*(1-i/data.length);
        noise.buffer=buffer; noiseGain.gain.setValueAtTime(type==='collapse'?0.05:0.025,now); noiseGain.gain.exponentialRampToValueAtTime(0.0001,now+dur);
        o.connect(g1).connect(ctx.destination); noise.connect(noiseGain).connect(ctx.destination); o.start(now); noise.start(now); o.stop(now+dur); noise.stop(now+dur);
      }catch{}
    }
    function draw(){
      const on=win.__RBRottenRootEnabled!==false;
      g.clear(); fallen.clear();
      if(!on){warning.setVisible(false);return;}
      const flash=runtime.state==='warning' && Math.floor(runtime.warningElapsed/140)%2===0;
      // rotten shelf
      if(runtime.state!=='collapsed'){
        g.lineStyle(18,0x2e2417,1).lineBetween(cfg.ledge.x,cfg.ledge.y+8,cfg.ledge.x+cfg.ledge.w,cfg.ledge.y+4);
        g.lineStyle(10,0x725238,.95).lineBetween(cfg.ledge.x,cfg.ledge.y-3,cfg.ledge.x+cfg.ledge.w,cfg.ledge.y-6);
        g.lineStyle(2,0xb89b6f,.65).lineBetween(cfg.ledge.x+4,cfg.ledge.y-6,cfg.ledge.x+cfg.ledge.w-5,cfg.ledge.y-8);
        for(let i=0;i<5;i++){const xx=cfg.ledge.x+10+i*16;g.lineStyle(3,0x493624,.85).lineBetween(xx,cfg.ledge.y+3,xx+3,cfg.ledge.y+26+(i%2)*6);}
        // hollow mouth and cracks
        g.fillStyle(0x11120f,.9).fillEllipse(cfg.ledge.x+cfg.ledge.w*.58,cfg.ledge.y+4,18,8);
        g.lineStyle(2,flash?0xe0a55e:0x856042,.95);
        g.beginPath();g.moveTo(cfg.ledge.x+12,cfg.ledge.y-2);g.lineTo(cfg.ledge.x+28,cfg.ledge.y+8);g.lineTo(cfg.ledge.x+20,cfg.ledge.y+18);g.strokePath();
        g.beginPath();g.moveTo(cfg.ledge.x+cfg.ledge.w-18,cfg.ledge.y-5);g.lineTo(cfg.ledge.x+cfg.ledge.w-25,cfg.ledge.y+7);g.lineTo(cfg.ledge.x+cfg.ledge.w-11,cfg.ledge.y+17);g.strokePath();
        g.lineStyle(7,0x2d4433,.95).beginPath();g.moveTo(cfg.anchor.x-6,cfg.anchor.y+45);g.lineTo(cfg.anchor.x-2,cfg.anchor.y+8);g.lineTo(cfg.anchor.x-16,cfg.anchor.y-16);g.strokePath();
        g.lineStyle(3,0x62805b,.9).lineBetween(cfg.anchor.x-4,cfg.anchor.y+38,cfg.anchor.x+2,cfg.anchor.y+11);
        g.fillStyle(runtime.anchorActive?0xd5b46e:0x8a7a63,.95).fillEllipse(cfg.anchor.x,cfg.anchor.y,16,10);
        if(runtime.state==='warning'){
          g.fillStyle(0xd8bf80,.32);g.fillCircle(cfg.anchor.x,cfg.anchor.y,28+(runtime.warningElapsed%260)/22);
          for(let i=0;i<4;i++){const dx=(i-1.5)*7; g.fillStyle(0xd4c8a8,.22).fillCircle(cfg.ledge.x+18+i*17,cfg.ledge.y-10-i*2,2+i%2);}
        }
      } else {
        // fallen broken log on floor
        fallen.lineStyle(20,0x302416,1).lineBetween(cfg.ledge.x-8,cfg.fallY+3,cfg.ledge.x-8+cfg.safeFloorW,cfg.fallY+11);
        fallen.lineStyle(10,0x6a4b32,.96).lineBetween(cfg.ledge.x-8,cfg.fallY-6,cfg.ledge.x-8+cfg.safeFloorW,cfg.fallY+2);
        for(let i=0;i<6;i++){const xx=cfg.ledge.x+4+i*18;fallen.lineStyle(3,0x473524,.84).lineBetween(xx,cfg.fallY,xx+4,cfg.fallY+19+(i%2)*6);}        
      }
      warning.setVisible(runtime.state==='warning').setPosition(cfg.ledge.x+cfg.ledge.w/2,cfg.ledge.y-55);
    }
    function resetIntact(){
      runtime.state='idle'; runtime.trigger=null; runtime.warningElapsed=0; runtime.standMs=0; runtime.tapePullMs=0; warning.setVisible(false); ensureAnchor(true);
      collider.active=true; zoneBody.enable=true; floorCollider.active=false; floorBody.enable=false; fallen.setVisible(false);
      draw();
    }
    function beginWarning(source){ if(runtime.state!=='idle') return; runtime.state='warning'; runtime.trigger=source; runtime.warningElapsed=0; tryAudio('groan'); scene.game.events.emit('hud:toast', source==='tape' ? 'Rotten root cracking — release or move!' : 'Rotten shelf cracking — jump away!'); }
    function collapse(){ if(runtime.state==='collapsed') return; runtime.state='collapsed'; runtime.warningElapsed=cfg.warningMs; ensureAnchor(false); collider.active=false; zoneBody.enable=false; floorCollider.active=true; floorBody.enable=true; fallen.setVisible(true); scene.cameras.main.shake(cfg.cameraShake,.0035); tryAudio('collapse'); runtime.collapseCount++; draw(); }
    runtime.disableChallenge=()=>{ensureAnchor(false);warning.setVisible(false);collider.active=false;zoneBody.enable=false;floorCollider.active=false;floorBody.enable=false;g.setVisible(false);fallen.setVisible(false);};
    runtime.resetChallenge=()=>{g.setVisible(true);resetIntact();};
    runtime.setEnabled=(on)=>{win.__RBRottenRootEnabled=!!on;if(on){runtime.reset();}else{runtime.disable();}};
    runtime.tick=(_,dt)=>{
      const enabled=win.__RBRottenRootEnabled!==false;
      if(enabled!==runtime.prevEnabled){runtime.prevEnabled=enabled;if(enabled)runtime.resetChallenge();else runtime.disableChallenge();}
      if(!enabled){return;}
      if(runtime.state==='idle'){
        ensureAnchor(true);
        const body=scene.player?.body2;
        const bodyRect=body?{x:body.x,y:body.y,w:body.width,h:body.height}:null;
        const overlapX=bodyRect && bodyRect.x+bodyRect.w>cfg.ledge.x+4 && bodyRect.x<cfg.ledge.x+cfg.ledge.w-4;
        const footClose=bodyRect && Math.abs((bodyRect.y+bodyRect.h)-cfg.ledge.y)<=12;
        const descendingSlow=body?Math.abs(body.velocity.y)<=45:false;
        const standing=!!(bodyRect && overlapX && footClose && descendingSlow && (body.blocked.down||body.touching.down));
        runtime.standMs=standing?runtime.standMs+dt:0;
        const tension=rottenTension(scene,anchorRef);
        runtime.tapePullMs=tension.attached && tension.ratio>=cfg.tensionRatio?runtime.tapePullMs+dt:0;
        if(runtime.tapePullMs>0 && Math.floor(runtime.tapePullMs/120)!==Math.floor((runtime.tapePullMs-dt)/120)) tryAudio('snap');
        if(runtime.standMs>=cfg.standingWarnMs) beginWarning('stand');
        else if(runtime.tapePullMs>=cfg.tapeWarnMs) beginWarning('tape');
      } else if(runtime.state==='warning'){
        runtime.warningElapsed+=dt;
        if(Math.floor(runtime.warningElapsed/520)!==Math.floor((runtime.warningElapsed-dt)/520)) tryAudio('snap');
        if(runtime.warningElapsed>=cfg.warningMs) collapse();
      }
      draw();
    };
    runtime.snapshot=()=>rottenStateSnapshot(runtime);
    resetIntact();
    scope.reference(scene,'__rbRottenRoot',runtime);scope.reference(win,'__RBRottenRoot',runtime);
    scope.binding(win.__RBStageV1,'rotten-root','rotten-root-ledge',runtime);
    return runtime;
    }});
  }
  function patch(){const scene=win.__game?.scene?.getScene?.('Game'); if(!scene) return false; const proto=Object.getPrototypeOf(scene);
    if(!proto.__rbM462RottenPatched){const old=proto.create; proto.create=function(){const r=old.apply(this,arguments); attach(this); return r;}; proto.__rbM462RottenPatched=true;}
    if(scene.sys?.isActive?.()&&scene.player&&!scene.__rbRottenRoot) attach(scene);
    win.__RBRottenRootInstalled=true; return true;
  }
  if(win.__RBSceneComposerV1){win.__RBSceneComposerV1.register('rotten-root',attach);win.__RBRottenRootInstalled=true;return win.__RBRottenRoot||null;}
 if(!patch()){const t=win.setInterval(()=>{if(patch())win.clearInterval(t);},50); win.setTimeout(()=>win.clearInterval(t),8000);} 
  return win.__RBRottenRoot||null;
}
