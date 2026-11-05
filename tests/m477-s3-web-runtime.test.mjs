import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {EventEmitter} from 'node:events';

const webScript=fs.readFileSync(new URL('../src/sticky-web.mjs',import.meta.url),'utf8');
function cfg(id,x=86,y=402){
 return {id,x,y,w:38,h:86,speedCap:81,holdToTrapSeconds:.70,
  directionalEscapeSeconds:.62,maxTrapSeconds:2.1,recoverySeconds:1.55,
  cutRecoverySeconds:3,swingDragPerSecond:1.45};
}
function fixture(configs=[cfg('web-a')], opts={}){
 const objects=[],buttons=new Map(),bindings=new Map(),sceneEvents=new EventEmitter();
 let installer,hitCalls=0,respawns=0,velocityXs=0,velocities=0;
 const renderObject=()=>{
  const o={destroyed:false,ops:[],destroy(){this.destroyed=true;return this;}};
  const proxy=new Proxy(o,{get(target,key){
   if(key in target)return target[key];
   return (...args)=>{target.ops.push([key,...args]);return proxy;};
  }});
  objects.push(proxy);return proxy;
 };
 const document={
  getElementById:id=>buttons.get(id)||null,
  createElement:()=>({id:null,events:{},style:{},setAttribute(){},blur(){},
   addEventListener(name,cb){this.events[name]=cb;}}),
  body:{append(b){buttons.set(b.id,b);}}
 };
 const body={x:92,y:438,width:34,height:50,center:{x:109,y:463},
  velocity:{x:170,y:0},setVelocityX(v){this.velocity.x=v;velocityXs++;},
  setVelocity(x,y){this.velocity.x=x;this.velocity.y=y;velocities++;}};
 const player={body2:body,inWeb:false,keys:{left:{isDown:false},right:{isDown:false},a:{isDown:false},d:{isDown:false}},
  respawn(){respawns++;return 17;}};
 const world={hammerHit(){hitCalls++;return false;}};
 const scene={player,world,tape:{attached:false},events:sceneEvents,sys:{isActive:()=>true},
  finished:false,add:{graphics:renderObject,text:renderObject},game:{events:{emit(){}}},
  registry:{set(){}},cameras:{main:{shake(){}}}};
 const stage={getInstances(type){assert.equal(type,'sticky-web');return configs.map(x=>({id:x.id,config:x}));},
  bindRuntime(type,id,actor){if(opts.failId===id)throw Error('bind failed');bindings.set(id,actor);},
  unbindRuntime(type,id,actor){if(bindings.get(id)===actor)bindings.delete(id);}};
 const win={document,location:{search:''},__RBStageV1:stage,__RBSceneComposerV1:{
  register(id,cb){assert.equal(id,'sticky-web-prefabs');installer=cb;}
 }};
 const c=vm.createContext({URLSearchParams});
 vm.runInContext(webScript+';this.install=installStickyWeb;',c);
 c.install(win);
 return {win,scene,body,player,world,objects,bindings,buttons,
  get counts(){return {hitCalls,respawns,velocityXs,velocities};},
  attach(){return installer(scene);}};
}

test('one Stage web binds and preserves historical Arcade slowdown and hammer cutting',()=>{
 const f=fixture(),worldHit=f.world.hammerHit,respawn=f.player.respawn;
 const group=f.attach();
 assert.equal(f.bindings.size,1);
 assert.equal(f.scene.events.listenerCount('postupdate'),1);
 assert.equal(group.snapshot().instances[0].id,'web-a');
 f.scene.events.emit('postupdate',0,16);
 assert.equal(f.body.velocity.x,81);
 assert.equal(f.player.inWeb,true);
 assert.equal(f.win.__RBStickyWeb.snapshot().contacts,1);
 assert.equal(f.world.hammerHit({x:84,y:400,w:40,h:90}),true);
 assert.equal(f.win.__RBStickyWeb.snapshot().cuts,1);
 assert.equal(f.player.inWeb,false);
 assert.equal(f.player.respawn(),17);
 assert.equal(f.player.inWeb,false);
 assert.equal(f.win.__RBStickyWeb.snapshot().contacts,0);
 group.destroy();
 assert.equal(f.scene.events.listenerCount('postupdate'),0);
 assert.equal(f.bindings.size,0);
 assert.equal(f.world.hammerHit,worldHit);
 assert.equal(f.player.respawn,respawn);
 assert.ok(f.objects.every(o=>o.destroyed));
 assert.equal(f.win.__RBStickyWeb,null);
 assert.equal(group.destroy(),false);
});

test('two positioned webs use independent state and share one physics response',()=>{
 const f=fixture([cfg('near'),cfg('far',600,350)]),g=f.attach();
 g.postUpdate(.016);
 assert.equal(g.snapshot().instances[0].contacts,1);
 assert.equal(g.snapshot().instances[1].contacts,0);
 assert.equal(f.body.velocity.x,81);
 assert.equal(f.counts.velocityXs,1);
 f.scene.tape.attached=true;
 f.body.velocity.x=100;f.body.velocity.y=40;
 g.postUpdate(.02);
 assert.equal(f.player.inWeb,false);
 assert.equal(f.counts.velocities,1);
 assert.ok(Math.abs(f.body.velocity.x-100*Math.exp(-1.45*.02))<1e-8);
 assert.equal(g.snapshot().instances[0].contactSwingDamping,1);
 assert.equal(g.snapshot().instances[1].contactSwingDamping,0);
 g.destroy();
});

test('overlapping webs never stack drag or duplicate player.inWeb flags',()=>{
 const f=fixture([cfg('a'),cfg('b')]),g=f.attach();
 f.scene.tape.attached=true;
 f.body.velocity.x=100;f.body.velocity.y=0;
 g.postUpdate(.02);
 assert.equal(f.counts.velocities,1);
 assert.ok(Math.abs(f.body.velocity.x-100*Math.exp(-1.45*.02))<1e-8);
 assert.equal(g.snapshot().instances[0].contacts,1);
 assert.equal(g.snapshot().instances[1].contacts,1);
 g.destroy();
});

test('zero-authored-web stage creates no implicit web or graphics',()=>{
 const f=fixture([]),g=f.attach();
 assert.equal(g.snapshot().instances.length,0);
 assert.equal(f.objects.length,0);
 assert.equal(f.win.__RBStickyWeb.snapshot(),null);
 f.body.velocity.x=150;
 g.postUpdate(.016);
 assert.equal(f.body.velocity.x,150);
 assert.equal(f.player.inWeb,false);
 g.destroy();
});

test('a failed second Stage binding cleans earlier actors',()=>{
 const f=fixture([cfg('first'),cfg('second',240,400)],{failId:'second'});
 assert.throws(()=>f.attach(),/bind failed/);
 assert.equal(f.bindings.size,0);
 assert.ok(f.objects.every(o=>o.destroyed));
 assert.equal(f.scene.events.listenerCount('postupdate'),0);
});

test('OFF, reset, and destruction preserve toggles and correctly unwind hooks',()=>{
 const f=fixture(),g=f.attach();
 f.buttons.get('rb-m44-web-toggle').events.click();
 assert.equal(f.win.__RBStickyWebEnabled,false);
 assert.equal(f.player.inWeb,false);
 f.scene.events.emit('postupdate',0,16);
 assert.equal(f.win.__RBStickyWeb.snapshot().contacts,0);
 const enemyPrevious=f.world.hammerHit;
 const enemyHit=function(rect){return enemyPrevious.call(this,rect);};
 f.world.hammerHit=enemyHit; // enemy installed after sticky web
 f.world.hammerHit=enemyPrevious; // enemy teardown must run before composer-managed web teardown
 g.destroy();
 assert.equal(f.win.__RBStickyWebs,null);
 assert.equal(f.win.__RBStickyWeb,null);
 assert.equal(f.scene.events.listenerCount('postupdate'),0);
 const next=f.attach();
 assert.equal(f.win.__RBStickyWebEnabled,false);
 assert.equal(next.snapshot().instances.length,1);
 assert.equal(f.scene.events.listenerCount('postupdate'),1);
 next.destroy();
});

test('Scene Composer owns web cleanup after enemy hook shutdown',()=>{
 const src=fs.readFileSync(new URL('../src/scene-composer.mjs',import.meta.url),'utf8');
 assert.ok(src.indexOf("'sticky-web-prefabs','enemy-prefabs'")>0);
 assert.match(src,/'sticky-web-prefabs':'__rbStickyWebGroup'/);
 assert.doesNotMatch(webScript,/scene\.events\.once\('shutdown'/);
});
