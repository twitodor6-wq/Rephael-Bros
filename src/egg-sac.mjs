
/** M4.5 Spiderling Egg Sac — isolated scene sidecar, Phaser Graphics actors.
 * No Arcade bodies are added, so the single player Arcade Body and Ninja Rope
 * solver remain wholly owned by M4.4. Pure state logic is Node-testable.
 */
const EGG_SAC_CONFIG = Object.freeze({
  id: 'egg-sac-launch-right', x: 332, y: 355, radiusX: 23, radiusY: 29,
  silkTopY: 75, platformMin: 70, platformMax: 370, spiderX: 270,
  groundY: 490, hatchSeconds: .24, count: 7, gravity: 640,
  spiderlingLifeSeconds: 8.5, spiderlingSpeed: 64,
  spiderlingMinX: 178, spiderlingMaxX: 356,
  damageCooldown: 1.15, bumpX: 125, bumpY: -165,
});
const clamp = (v,a,b) => Math.min(b, Math.max(a,v));
function overlaps(a,b) {
  return !!(a&&b&&a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y);
}
function sacHitbox(cfg=EGG_SAC_CONFIG) {
  return {x:cfg.x-cfg.radiusX,y:cfg.y-cfg.radiusY,w:cfg.radiusX*2,h:cfg.radiusY*2};
}
function makeEggSac() {
  return {state:'intact',timer:0,elapsed:0,hatched:0,hatchCount:0,
    spiders:[],hits:0,defeated:0,contacts:0,hammerHatches:0,
    contactCooldown:0,log:[]};
}
function log(sim,what,events) {
  sim.log.push(what); if(sim.log.length>60)sim.log.shift();
  events.push(what);
}
function breakEggSac(sim, reason='touch',cfg=EGG_SAC_CONFIG) {
  if(sim.state!=='intact') return false;
  sim.state='cracking';sim.timer=cfg.hatchSeconds;
  sim.contacts++;
  if(reason==='hammer')sim.hammerHatches++;
  sim.log.push('crack:'+reason);
  return true;
}
function release(sim,cfg,events) {
  sim.state='swarming';sim.hatched=1;sim.hatchCount++;
  sim.spiders=[];
  for(let i=0;i<cfg.count;i++){
    const lane=i-(cfg.count-1)/2;
    sim.spiders.push({id:i,x:cfg.x+lane*4,y:cfg.y+18,
      vx:lane*29,vy:-72-Math.abs(lane)*10,grounded:false,
      age:0,alive:true,hit:false});
  }
  log(sim,'hatch',events);
}
/** Clock advance and optional player physics rectangle. The spawned spiders
 * are deterministic kinematic Graphics sprites, NOT new player/enemy engines.
 */
function stepEggSac(sim,seconds,world={},cfg=EGG_SAC_CONFIG) {
  let remaining = clamp(Number.isFinite(seconds)?seconds:0,0,.05);
  const events=[];
  if(world.enabled===false)return {events,damage:false};
  sim.elapsed+=remaining;
  sim.contactCooldown=Math.max(0,sim.contactCooldown-remaining);
  if(sim.state==='intact' && overlaps(world.playerRect,sacHitbox(cfg))) {
    breakEggSac(sim,'touch',cfg); events.push('crack:touch');
  }
  if(sim.state==='cracking'){
    sim.timer-=remaining;
    if(sim.timer<=0)release(sim,cfg,events);
  }
  let damage=false;
  if(sim.state==='swarming'){
    for(const b of sim.spiders){
      if(!b.alive)continue;
      b.age+=remaining;
      if(b.age>=cfg.spiderlingLifeSeconds){b.alive=false;continue;}
      if(!b.grounded){
        b.vy+=cfg.gravity*remaining;
        b.x+=b.vx*remaining;
        b.y+=b.vy*remaining;
        if(b.y>=cfg.groundY-6){b.y=cfg.groundY-6;b.vy=0;b.grounded=true;}
      } else {
        const target=world.playerCenter?.x;
        if(Number.isFinite(target)&&Math.abs(target-b.x)>13 && Math.abs(target-b.x)<130)
          b.vx=Math.sign(target-b.x)*cfg.spiderlingSpeed;
        else b.vx=Math.sign(b.vx||1)*cfg.spiderlingSpeed*.6;
        b.x+=b.vx*remaining;
        if(b.x<cfg.spiderlingMinX){b.x=cfg.spiderlingMinX;b.vx=Math.abs(b.vx);}
        if(b.x>cfg.spiderlingMaxX){b.x=cfg.spiderlingMaxX;b.vx=-Math.abs(b.vx);}
      }
      const hitbox={x:b.x-8,y:b.y-7,w:16,h:13};
      if(sim.contactCooldown<=0 && overlaps(world.playerRect,hitbox) && b.grounded) {
        sim.contactCooldown=cfg.damageCooldown;sim.hits++;
        log(sim,'bite',events);damage=true;
      }
    }
    if(sim.spiders.every(s=>!s.alive)) {sim.state='spent';log(sim,'spent',events);}
  }
  return {events,damage};
}
function hammerEggSac(sim,rect,cfg=EGG_SAC_CONFIG) {
  if(sim.state==='intact'&&overlaps(rect,sacHitbox(cfg)))return breakEggSac(sim,'hammer',cfg);
  if(sim.state!=='swarming')return false;
  let hit=false;
  for(const b of sim.spiders){
    if(b.alive && overlaps(rect,{x:b.x-10,y:b.y-10,w:20,h:18})){
      b.alive=false;sim.defeated++;hit=true;
    }
  }
  if(hit){sim.log.push('hammer:spiderling');if(sim.log.length>60)sim.log.shift();}
  return hit;
}
function resetEggSac(sim){Object.assign(sim,makeEggSac());return sim;}

function installSpiderlingEggSac(win=globalThis){
  if(!win||win.__RBEggSacInstalled)return win?.__RBEggSac||null;
  if(!win.document||!win.__RBStageV1||!win.__RBSceneComposerV1)throw Error('Egg sacs require Stage Loader and Scene Composer');
  if(typeof win.__RBEggSacEnabled!=='boolean')win.__RBEggSacEnabled=!/^(0|false|off)$/i.test(new URLSearchParams(win.location?.search||'').get('eggs')||'');
  function createView(scene,cfg,scope){
    const silk=scope.gameObject(scene.add.graphics().setDepth(15));
    const sac=scope.gameObject(scene.add.graphics().setDepth(24));
    const babies=scope.gameObject(scene.add.graphics().setDepth(23));
    const label=scope.gameObject(scene.add.text(cfg.x,cfg.y-48,'EGG SAC',{fontFamily:'Georgia,serif',fontSize:'12px',
      color:'#e4dcc2',stroke:'#112118',strokeThickness:3}).setOrigin(.5).setDepth(25));
    return {silk,sac,babies,label,destroy(){silk.destroy();sac.destroy();babies.destroy();label.destroy();}};
  }
  function render(view,sim,clock,enabled,cfg){
    const {silk,sac,babies,label}=view;
    silk.clear();sac.clear();babies.clear();
    const live=sim.state==='intact'||sim.state==='cracking';
    const shake=sim.state==='cracking'?Math.sin(clock*96)*5:Math.sin(clock*2.4)*1.5;
    const x=cfg.x+shake,y=cfg.y;
    const a=enabled?1:.2;
    label.setAlpha(enabled&&live?.9:.18);
    label.setText(live?'EGG SAC':sim.state==='swarming'?'SPIDERLINGS!':'EMPTY SAC');
    silk.lineStyle(3,0x17261d,a*.9);silk.lineBetween(cfg.x,cfg.silkTopY,x,y-cfg.radiusY);
    silk.lineStyle(1.4,0xf1ebd0,a*.75);silk.lineBetween(cfg.x+1,cfg.silkTopY,x+1,y-cfg.radiusY);
    if(live){
      sac.fillStyle(0x17251d,a);sac.fillEllipse(x,y,cfg.radiusX*2+6,cfg.radiusY*2+6);
      sac.fillStyle(sim.state==='cracking'?0xf9dd9c:0xb9c8aa,a*.97);
      sac.fillEllipse(x,y,cfg.radiusX*2,cfg.radiusY*2);
      sac.fillStyle(0x546e59,a*.5);sac.fillEllipse(x-5,y+7,18,24);
      for(let j=0;j<5;j++){
        sac.lineStyle(1.2,0xf1ead6,a*.55);
        sac.strokeEllipse(x,y,10+j*7,14+j*8);
      }
      sac.fillStyle(0x273b2e,a*.74);
      for(let j=0;j<4;j++)sac.fillCircle(x+Math.sin(j*1.9)*11,y-15+j*9,2.2);
      if(sim.state==='cracking'){
        sac.lineStyle(3,0x513527,a);sac.lineBetween(x-9,y-18,x+3,y-5);
        sac.lineBetween(x+3,y-5,x-7,y+8);sac.lineBetween(x-7,y+8,x+9,y+23);
      }
    }else{
      sac.lineStyle(2,0xabb9a2,a*.85);
      sac.strokeEllipse(x,y-16,31,18);
      sac.lineBetween(x-15,y-17,x-24,y+12);sac.lineBetween(x+15,y-17,x+21,y+8);
    }
    if(enabled){
      for(const b of sim.spiders){
        if(!b.alive)continue;
        const fade=Math.min(1,(cfg.spiderlingLifeSeconds-b.age)*1.5);
        const legStep=Math.sin(clock*24+b.id*2)*2;
        babies.lineStyle(1.5,0x0a1512,fade);
        for(const side of [-1,1])for(let k=0;k<3;k++)
          babies.lineBetween(b.x+side*2,b.y,b.x+side*(9+k),b.y-5+k*4+legStep);
        babies.fillStyle(0x16170e,fade);babies.fillEllipse(b.x,b.y,13,10);
        babies.fillStyle(0x8c3428,fade);babies.fillCircle(b.x-2.5,b.y-1.5,1.4);babies.fillCircle(b.x+2.5,b.y-1.5,1.4);
      }
    }
  }

  function attachOne(scene,cfg,id,context){
    const scope=createRBResourceScope(),sim=makeEggSac();let destroyed=false,enabled=win.__RBEggSacEnabled;
    try{
      const view=createView(scene,cfg,scope);
      const actor={id,config:cfg,sim,view,clock:0,
        snapshot(){return {id,state:sim.state,enabled,hatched:sim.hatched,hatchCount:sim.hatchCount,total:sim.spiders.length,alive:sim.spiders.filter(b=>b.alive).length,hits:sim.hits,defeated:sim.defeated,contacts:sim.contacts,hammerHatches:sim.hammerHatches,cooldown:sim.contactCooldown,log:[...sim.log],spiders:sim.spiders.map(b=>({...b,ownerId:id})),lifecycle:scope.snapshot()};},
        reset(){if(destroyed)return false;resetEggSac(sim);actor.clock=0;render(view,sim,0,enabled,cfg);return true;},
        setEnabled(on){if(destroyed)return false;enabled=!!on;actor.reset();return true;},
        destroy(){if(destroyed)return false;destroyed=true;enabled=false;resetEggSac(sim);scope.destroy();return true;},
        hammer(rect){if(destroyed||!enabled)return false;const was=sim.state,hit=hammerEggSac(sim,rect,cfg);if(hit)scene.game.events.emit('hud:toast',was==='intact'?'CRACK! The egg sac is opening!':'Hammer scatters the spiderlings!');return hit;},
        postUpdate(dt){
          if(destroyed||!enabled||!scene.sys.isActive()||scene.finished)return;
          const p=scene.player,b=p?.body2;if(!b||!b.center)return;
          actor.clock+=dt;
          // The collection decrements its immunity once. Pure legacy step also decrements
          // its local timer; compensate only when importing a longer shared window.
          if(context.invuln>sim.contactCooldown)sim.contactCooldown=context.invuln+dt;
          const output=stepEggSac(sim,dt,{enabled,playerRect:{x:b.x,y:b.y,w:b.width,h:b.height},playerCenter:{x:b.center.x,y:b.center.y}},cfg);
          for(const ev of output.events){
            if(ev==='crack:touch')scene.game.events.emit('hud:toast','Something stirs inside the hanging egg sac!');
            if(ev==='hatch'){scene.game.events.emit('hud:toast',cfg.count===7?'Seven tiny spiders scatter — jump or use the hammer!':cfg.count+' tiny spiders scatter — jump or use the hammer!');scene.cameras.main.shake(100,.0028);}
          }
          if(output.damage){context.invuln=cfg.damageCooldown;
            if(!scene.tape?.attached)b.setVelocity(-cfg.bumpX,cfg.bumpY);
            scene.cameras.main.shake(90,.003);scene.game.events.emit('hud:toast','A spiderling nips your ankle!');
          }
          render(view,sim,actor.clock,enabled,cfg);scene.registry.set('eggSacState',sim.state);
        }
      };
      render(view,sim,0,enabled,cfg);return actor;
    }catch(error){scope.destroy();throw error;}
  }
  function attach(scene){
    scene.__rbEggSacs?.destroy();let group,runtime;
    runtime=createRBManagedActor({id:'egg-sac-prefabs',scene,sceneLifecycle:false,enabled:()=>win.__RBEggSacEnabled,
      create(scope){
        group=mountRBEnemyPrefabs(scene,win.__RBStageV1,{'egg-sac':attachOne});scope.defer(()=>group.destroy());
        const first=group.entries[0]?.actor;
        const facade={config:first?.config||null,sim:first?.sim||null,view:first?.view||null,snapshot:()=>first?.snapshot()||null,hammer:group.hammer,reset:()=>runtime?.reset(),destroy:()=>runtime?.destroy()};
        const world=scene.world,player=scene.player,previousHit=world.hammerHit,previousRespawn=player.respawn;
        const hit=function(rect){const prior=previousHit.call(this,rect);const egg=group.hammer(rect);return !!(prior||egg);};
        const respawn=function(...args){const out=previousRespawn.apply(this,args);runtime?.reset();return out;};
        scope.defer(()=>{if(world.hammerHit===hit)world.hammerHit=previousHit;if(player.respawn===respawn)player.respawn=previousRespawn;});
        world.hammerHit=hit;player.respawn=respawn;
        const out={entries:group.entries,hammer:group.hammer,postUpdate:dt=>group.postUpdate(dt),snapshot:()=>group.snapshot()};
        scope.reference(scene,'__rbEggSacs',out);scope.reference(win,'__RBEggSacs',out);
        scope.reference(scene,'__rbEggSac',facade);scope.reference(win,'__RBEggSac',facade);
        return out;
      },
      update:(_time,ms)=>{if(!scene.finished&&scene.sys.isActive())group.postUpdate(Math.min(50,Math.max(0,ms||0))/1000);},
      onDisable:()=>{group.reset();group.setEnabled(false);},
      onReset:()=>{group.reset();group.setEnabled(win.__RBEggSacEnabled);}
    });
    return runtime;
  }
  const button=win.document.getElementById('rb-m45-egg-toggle')||win.document.createElement('button');
  button.id='rb-m45-egg-toggle';button.type='button';
  button.style.cssText='position:fixed;top:114px;right:12px;z-index:10062;background:#071c21ee;color:#f1e7c6;border:1px solid #bfaa74;border-radius:9px;padding:8px 12px;min-height:40px;cursor:pointer;font:600 13px system-ui,sans-serif';
  const update=()=>{button.textContent='M4.5 Egg Sac: '+(win.__RBEggSacEnabled?'ON':'OFF');button.setAttribute('aria-pressed',String(!!win.__RBEggSacEnabled));};
  button.addEventListener('click',()=>{win.__RBEggSacEnabled=!win.__RBEggSacEnabled;win.__RBEggSacs?.reset();update();button.blur();});
  if(!win.document.getElementById(button.id))win.document.body.append(button);update();
  win.__RBSceneComposerV1.register('egg-sac-prefabs',attach);win.__RBEggSacInstalled=true;
  return win.__RBEggSac;
}
