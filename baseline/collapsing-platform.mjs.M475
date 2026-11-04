/** M473 reusable disappearing surface. No player/tape forces; independent contact clocks. */
function createCollapseState(cfg){
 let state='idle',contactMs=0,elapsedMs=0,collapses=0;
 return {step(dt,standing){if(state==='disabled'||state==='collapsed'||cfg.variant==='stable-log')return;
  dt=Math.max(0,Number.isFinite(dt)?dt:0);
  if(state==='idle'){contactMs=standing?contactMs+dt:0;if(standing&&contactMs>=cfg.standingMs){state='warning';elapsedMs=0;}}
  else if(state==='warning'){elapsedMs+=dt;if(elapsedMs>=cfg.warningMs){state='collapsed';collapses++;}}
 },disable(){state='disabled';contactMs=0;elapsedMs=0;},reset(){state='idle';contactMs=0;elapsedMs=0;},
 snapshot:()=>({state,contactMs,elapsedMs,collapses,collision:state==='idle'||state==='warning'})};
}
function installCollapsingPlatforms(win=globalThis){
 if(win.__RBCollapsingPlatformsInstalled)return;
 if(typeof win.__RBCollapsingPlatformsEnabled!=='boolean')win.__RBCollapsingPlatformsEnabled=true;
 const button=win.document.createElement('button');button.id='rb-m473-collapse-toggle';button.type='button';
 const label=()=>{button.textContent='Crumbling trail: '+(win.__RBCollapsingPlatformsEnabled?'ON':'OFF');button.setAttribute('aria-pressed',String(win.__RBCollapsingPlatformsEnabled));};label();
 button.onclick=()=>{win.__RBCollapsingPlatformsEnabled=!win.__RBCollapsingPlatformsEnabled;const a=win.__RBCollapsingPlatforms;if(win.__RBCollapsingPlatformsEnabled)a?.reset();else a?.disable();label();button.blur();};win.document.body.append(button);
 function attach(scene){
  const challenges=win.__RBStageV1.getChallenges();let runtime;const instances=new Map(),events=[];
  const record=(id,state)=>{events.push({id,state,at:Math.round(scene.time.now)});if(events.length>160)events.shift();};
  return createRBManagedActor({id:'collapsing-platforms',scene,stateProperty:'lifecycleState',sceneLifecycle:false,
   enabled:()=>win.__RBCollapsingPlatformsEnabled!==false,
   onDestroy:()=>{for(const a of [...instances.values()])a.destroy();},
   onReset:()=>{for(const a of instances.values())a.reset();},onDisable:()=>{for(const a of instances.values())a.disable();},
   create(scope){
    for(const {id,config:cfg} of win.__RBStageV1.getInstances('collapsing-platform')){
     const local=createRBResourceScope();scope.resource(local,v=>v.destroy(),(v,on)=>v.setEnabled(on));let destroyed=false;
     const sim=createCollapseState(cfg),g=local.gameObject(scene.add.graphics().setDepth(13));
     const hint=local.gameObject(scene.add.text(cfg.x+cfg.size.w/2,cfg.y-40,'',{fontFamily:'system-ui',fontSize:'16px',color:'#fff2bd',stroke:'#24180c',strokeThickness:4}).setOrigin(.5).setDepth(25));
     const zone=local.gameObject(scene.add.zone(cfg.x+cfg.size.w/2,cfg.y+cfg.size.h/2,cfg.size.w,cfg.size.h));scene.physics.add.existing(zone,true);zone.body.setSize(cfg.size.w,cfg.size.h).updateFromGameObject();zone.body.__rbCollisionPolicy='one-way-top';
     const coll=scene.physics.add.collider(scene.player,zone,undefined,()=>{const b=scene.player.body2;return b.velocity.y>=0&&b.prev.y+b.height<=cfg.y+8;});
     local.resource(zone.body,b=>{b.enable=false;},(b,on)=>{b.enable=on&&sim.snapshot().collision;});local.resource(coll,c=>c.destroy(),(c,on)=>{c.active=on&&sim.snapshot().collision;});
     const draw=()=>{const s=sim.snapshot();g.clear();hint.setVisible(s.state==='warning');
      if(!s.collision){hint.setVisible(false);if(s.state==='collapsed'){g.lineStyle(3,0x8c6944,.45).lineBetween(cfg.x,cfg.y+28,cfg.x+10,cfg.y+36);}return;}
      const flash=s.state==='warning'&&Math.floor(s.elapsedMs/100)%2===0;
      g.lineStyle(cfg.size.h+8,0x2c2419,1).lineBetween(cfg.x+4,cfg.y+7,cfg.x+cfg.size.w-4,cfg.y+7);
      g.lineStyle(cfg.size.h,flash?0xdd9b49:cfg.variant==='stable-log'?0x657951:0x8a6342,1).lineBetween(cfg.x+4,cfg.y+3,cfg.x+cfg.size.w-4,cfg.y+3);
      g.lineStyle(2,0xd0b17a,.9).lineBetween(cfg.x+5,cfg.y-1,cfg.x+cfg.size.w-5,cfg.y-1);
      if(cfg.variant!=='stable-log')for(let x=cfg.x+12;x<cfg.x+cfg.size.w-5;x+=22)g.lineStyle(2,0x302114,1).lineBetween(x,cfg.y,x+5,cfg.y+10);
      hint.setText('! '+Math.max(0,(cfg.warningMs-s.elapsedMs)/1000).toFixed(1)+(cfg.anchorRefs.length?'s · JUMP / E':'s · JUMP'));
     };
     const apply=()=>{zone.body.enable=win.__RBCollapsingPlatformsEnabled!==false&&local.snapshot().enabled&&sim.snapshot().collision;coll.active=zone.body.enable;draw();};
     const actor={id,cfg,zone,collider:coll,sim,create:()=>destroyed?false:actor,destroy(){if(destroyed)return false;destroyed=true;sim.disable();local.destroy();instances.delete(id);record(id,'destroyed');return true;},reset(){if(destroyed)return false;sim.reset();apply();record(id,'reset');},disable(){if(destroyed)return false;sim.disable();apply();record(id,'disabled');},snapshot:()=>({id,...sim.snapshot(),bodyEnabled:!destroyed&&!!zone.body?.enable,colliderActive:!destroyed&&coll.active,lifecycle:local.snapshot(),geometry:{x:cfg.x,y:cfg.y,...cfg.size},anchorRefs:cfg.anchorRefs}),tick(dt){if(destroyed)return false;
      const b=scene.player.body2,s=sim.snapshot().state;const standing=b.x+b.width>cfg.x+2&&b.x<cfg.x+cfg.size.w-2&&Math.abs(b.bottom-cfg.y)<10&&(b.blocked.down||b.touching.down)&&Math.abs(b.velocity.y)<50;
      sim.step(dt,standing);const next=sim.snapshot().state;if(next!==s){record(id,next);if(next==='warning')scene.game.events.emit('hud:toast',cfg.anchorRefs.length?'Bridge cracking — run, jump or use E!':'Hollow log cracking — jump before it breaks!');if(next==='collapsed')scene.cameras.main.shake(80,.002);}apply();}};
     actor.update=actor.tick;instances.set(id,actor);local.binding(win.__RBStageV1,'collapsing-platform',id,actor);apply();
    }
    for(const c of challenges)scope.gameObject(scene.add.text(c.entry.x,c.entry.y-125,c.label||c.challengeId,{fontFamily:'system-ui',fontSize:'15px',color:'#eee4b9',backgroundColor:'#152a22',padding:{x:7,y:5}}).setDepth(24));
    // Respawn owns encounter reset, never changes coordinates or physics decisions.
    const previous=scene.player.respawn;const wrapped=function(...args){const out=previous.apply(this,args);runtime?.reset();return out;};scene.player.respawn=wrapped;scope.defer(()=>{if(scene.player.respawn===wrapped)scene.player.respawn=previous;});
    runtime={instances,events,snapshot:()=>({instances:[...instances.values()].map(a=>a.snapshot()),events:events.slice()})};
    scope.reference(scene,'__rbCollapsingPlatforms',runtime);scope.reference(win,'__RBCollapsingPlatforms',runtime);return runtime;
   },update:(_,dt)=>{if(scene.finished)return;for(const a of instances.values())a.tick(Math.min(50,dt||0));
    const b=scene.player.body2;
    for(const c of challenges){
     if(!c.recovery.rearmOnReturn)continue;
     const id=c.recovery.returnVia?.at(-1),entry=instances.get(id),g=entry?.cfg;
     if(g&&(b.blocked.down||b.touching.down)&&Math.abs(b.bottom-g.y)<8&&b.x+b.width>g.x&&b.x<g.x+g.size.w&&c.instances.some(id=>instances.get(id)?.snapshot().state==='collapsed')){
      for(const id of c.instances){const a=instances.get(id);if(a&&a.cfg.variant!=='stable-log')a.reset();}
      record(c.challengeId,'rearmed-at-entry');
     }
    }
   }});
 }
 win.__RBSceneComposerV1.register('collapsing-platforms',attach);win.__RBCollapsingPlatformsInstalled=true;
}
