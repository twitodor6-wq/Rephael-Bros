async function runM469TransitionProbe(){
 const game=window.__game,delay=ms=>new Promise(r=>setTimeout(r,ms));
 async function until(fn){for(let n=0;n<400;n++){if(fn())return;await delay(10);}throw Error('scene operation timeout');}
 game.scene.stop('Game');game.scene.stop('HUD');await until(()=>!__RBSceneComposerV1.snapshot().active);
 const rows=[],disposed=[],counts=[];let serial=0,active=null,fault=null,releaseCalls=0;
 const ck=(name,ok,details)=>rows.push({name,passed:!!ok,details});
 const data=window.__RBTransitionExperiments,session={schemaVersion:'1.0.0',characterId:'shaul',gear:['tape'],progress:{visited:['transition-a']}};
 const adapter={
  async prepareAssets(ids){if(fault==='prepare'){fault=null;throw Error('simulated asset prepare failure');}for(const id of ids){if(!game.textures.exists(id)){const g=new Phaser.GameObjects.Graphics(game.scene.getScenes()[0]||game.scene.getScene('Game'));g.fillStyle(0x668866).fillRect(0,0,8,8);g.generateTexture(id,8,8);g.destroy();}}},
  async releaseTape(h){releaseCalls++;if(h.tape.attached){h.tape.attached=false;h.tape.anchor=null;}},
  async unload(h){game.scene.stop(h.key);await until(()=>!game.scene.isActive(h.key));},
  async dispose(h){if(h.disposed)return;h.disposed=true;if(game.scene.keys[h.key]){game.scene.stop(h.key);await until(()=>!game.scene.isActive(h.key));game.scene.remove(h.key);await until(()=>!game.scene.keys[h.key]);}
   disposed.push({key:h.key,scope:h.actor?.scope.snapshot(),refs:!h.refs.actor&&!h.refs.stage,anchors:h.tape.anchors.length,listeners:h.emitter.listenerCount('probe'),clock:h.clock?.getAllEvents?.().length||0});},
  async load(d,s,registerPartial){
   const h={key:'M469Tiny'+(++serial),refs:{},tape:{anchors:[],attached:false,anchor:null},emitter:new Phaser.Events.EventEmitter(),session:s,disposed:false};registerPartial(h);
   let resolve,reject;const ready=new Promise((a,b)=>{resolve=a;reject=b});
   const scene=new Phaser.Scene({key:h.key});h.scene=scene;
   scene.create=function(){try{h.clock=this.time;this.cameras.main.setBounds(d.camera.bounds.x,d.camera.bounds.y,d.camera.bounds.width,d.camera.bounds.height);
    h.actor=createRBManagedActor({id:d.stageId,scene:this,create:scope=>{
     const art=scope.gameObject(this.add.image(d.objects[0].x,d.objects[0].y,d.objects[0].asset));
     const z=scope.gameObject(this.add.zone(d.objects[0].x,d.objects[0].y,8,8));this.physics.add.existing(z,true);scope.body(z.body);scope.collider(this.physics.add.collider(z,z));
     scope.listen(h.emitter,'probe',()=>{});scope.timer(this.time.addEvent({delay:15,loop:true,callback:()=>h.emitter.emit('probe')}));
     const ref={x:d.spawn.x,y:d.spawn.y};scope.anchor(h.tape.anchors,ref,()=>{if(h.tape.anchor===ref){h.tape.anchor=null;h.tape.attached=false;}});h.tape.anchor=ref;h.tape.attached=true;
     scope.reference(h.refs,'actor',art);scope.binding({bindRuntime:(t,id,v)=>h.refs.stage=v,unbindRuntime:(t,id,v)=>{if(h.refs.stage===v)h.refs.stage=null}},'probe','one',art);return {zone:z};}});
    resolve();}catch(e){reject(e);}};
   game.scene.add(h.key,scene,true);await ready;
   if(fault==='load'){fault=null;throw Error('simulated candidate load failure');}
   active=h;return h;
  }
 };
 const c=createRBTransitionController({adapter,availablePrefabs:['experiment-platform'],availableAssets:['experiment-tile']});
 async function go(d){const p=await c.prepare(d,session);return c.transition(p);}
 await go(data[0]);const first=active;const before=c.snapshot();fault='prepare';try{await go(data[1]);ck('prepare failure rejects',false);}catch{ck('prepare failure leaves active scene and epoch intact',active===first&&c.snapshot().stageId===data[0].stageId&&c.snapshot().epoch===before.epoch&&!first.disposed);}
 const invalid=JSON.parse(JSON.stringify(data[1]));invalid.spawn.x=10000;try{await go(invalid);ck('invalid spawn rejects before unload',false);}catch{ck('invalid spawn rejects before unload',active===first&&!first.disposed);}
 for(let i=0;i<16;i++){await go(data[(i+1)%2]);counts.push({scenes:Object.keys(game.scene.keys).filter(k=>k.startsWith('M469Tiny')).length,objects:active.scene.children.length,bodies:active.scene.physics.world.staticBodies.size,colliders:active.scene.physics.world.colliders.getActive().length,anchors:active.tape.anchors.length,listeners:active.scene.events.listenerCount('postupdate'),resources:active.actor.scope.snapshot().resources});}
 ck('16 real scene transitions have stable actual Phaser resource counts',counts.every(x=>JSON.stringify(x)===JSON.stringify(counts[0])),counts);
 const previous=active,oldKey=active.key;fault='load';try{await go(data[1]);ck('load failure rejects',false);}catch{ck('load failure rolls back with freshly reconstructed scene',c.snapshot().status==='ready'&&active!==previous&&active.key!==oldKey&&previous.disposed&&c.snapshot().stageId===data[0].stageId,{state:c.snapshot(),oldKey,newKey:active.key});}
 ck('pure session survives load and rollback',active.session.characterId==='shaul'&&active.session.gear[0]==='tape'&&active.session.progress.visited[0]==='transition-a'&&Object.isFrozen(active.session));
 ck('all disposed Phaser actors release listeners/timers/anchors/references',disposed.every(x=>x.scope?.resources===0&&!x.scope.errors.length&&x.refs&&x.anchors===0&&x.listeners===0&&x.clock===0),disposed);
 ck('tape released before each unload',releaseCalls===17,{releaseCalls});
 ck('diagnostic transitions carry bounded stage and epoch',c.snapshot().events.length<=64&&c.snapshot().events.every(e=>typeof e.epoch==='number'&&e.stageId));
 await adapter.unload(active);await adapter.dispose(active);
 ck('final test-scene unload leaves no experiment scenes',!Object.keys(game.scene.keys).some(k=>k.startsWith('M469Tiny')));
 return {checks:rows,events:c.snapshot(),method:'Two JSON definitions; fresh actual Phaser scenes; drawing enabled; live timers/colliders; 16 transitions and injected preparation/load failure'};
}
