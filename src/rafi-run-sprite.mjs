/** M477-S1 prototype presentation ONLY. Reads gameplay; owns no body, force or collider. */
function rafiRunPolicy(s,cfg={minSpeed:18,maxGroundVerticalSpeed:50}){
 const reason=!s.enabled?'disabled':!s.ready?'asset-not-ready':s.activeId!=='rafi'?'other-character':s.finished?'finished':s.attached?'tape':s.hammerCd>0||s.drillCd>0?'tool':s.inWeb?'sticky-web':!s.grounded||Math.abs(s.vy)>cfg.maxGroundVerticalSpeed?'airborne':!s.input||Math.abs(s.vx)<cfg.minSpeed?'idle':Math.sign(s.vx)!==Math.sign(s.input)?'turning':'run';
 return {show:reason==='run',reason};
}
function rafiRunPose(m,frame,body,facing){
 const pivot=m.render.pivots[frame],scale=m.render.scale;
 return {x:body.x,y:body.bottom,originX:pivot.x/m.frameWidth,originY:pivot.y/m.frameHeight,scaleX:scale,scaleY:scale,flipX:facing<0,footY:body.bottom};
}
function validateRafiRunAsset(m){
 const errors=[];const fail=s=>errors.push(s);
 if(!m||m.schema!=='rafael-visual-sprites/v1'||m.status!=='prototype'||m.characterId!=='rafi'||m.state!=='run')fail('prototype Rafi RUN contract required');
 if(!m||![m.frameWidth,m.frameHeight,m.columns,m.rows,m.frames,m.width,m.height].every(v=>Number.isInteger(v)&&v>0)||m.frames!==m.columns*m.rows||m.width!==m.frameWidth*m.columns||m.height!==m.frameHeight*m.rows)fail('invalid sheet grid');
 if(!m||!Number.isFinite(m.fps)||m.fps<=0||m.fps>60||m.loop!==true||typeof m.enabledByDefault!=='boolean')fail('invalid animation timing');
 if(!m||!['assetPath','textureKey','animationKey','version','sha256'].every(k=>typeof m[k]==='string'&&m[k].length>0)||!/^assets\/[a-zA-Z0-9_./-]+\.png$/.test(m.assetPath)||m.assetPath.includes('..')||!/^[a-f0-9]{64}$/.test(m.sha256))fail('invalid asset identity');
 const r=m?.render;
 if(!r||!Number.isFinite(r.scale)||r.scale<=0||r.scale>1||!Number.isFinite(r.minSpeed)||r.minSpeed<=0||!Number.isFinite(r.maxGroundVerticalSpeed)||r.maxGroundVerticalSpeed<0||!Array.isArray(r.pivots)||r.pivots.length!==m?.frames||r.pivots.some(p=>!p||![p.x,p.y].every(Number.isFinite)||p.x<0||p.x>m.frameWidth||p.y<=0||p.y>m.frameHeight))fail('invalid visual calibration');
 return {ok:errors.length===0,errors};
}
function installRafiRunPrototype(win=globalThis){
 if(win.__RBRafiRunPrototypeInstalled)return win.__RBRafiRunPrototype||null;
 const manifest=win.__RBRafiRunAssetData?.manifest,check=validateRafiRunAsset(manifest);
 if(!check.ok)throw Error('Invalid Rafi RUN visual asset: '+check.errors.join('; '));
 if(typeof win.__RBRafiRunPrototypeEnabled!=='boolean')win.__RBRafiRunPrototypeEnabled=manifest.enabledByDefault;
 const cache=new WeakMap();
 function ensureAsset(game){
  if(cache.has(game))return cache.get(game);
  const record={state:'loading',loads:1,errors:[],disposed:false,promise:null};cache.set(game,record);
  const image=new win.Image();record.promise=new Promise(resolve=>{
   const done=(state,error)=>{record.state=state;if(error)record.errors.push(String(error));image.onload=null;image.onerror=null;resolve(record);};
   image.onerror=()=>done('failed','PNG decode failed; original character retained');
   image.onload=()=>{if(record.disposed)return done('disposed');try{
    if(image.width!==manifest.width||image.height!==manifest.height)throw Error('Decoded dimensions differ from manifest');
    if(!game.textures.exists(manifest.textureKey))game.textures.addSpriteSheet(manifest.textureKey,image,{frameWidth:manifest.frameWidth,frameHeight:manifest.frameHeight});
    if(!game.anims.exists(manifest.animationKey))game.anims.create({key:manifest.animationKey,frames:game.anims.generateFrameNumbers(manifest.textureKey,{start:0,end:manifest.frames-1}),frameRate:manifest.fps,repeat:manifest.loop?-1:0});
    done('ready');
   }catch(e){done('failed',e.message);}};
   game.events.once('destroy',()=>{record.disposed=true;done('disposed');cache.delete(game);});
   image.src='data:image/png;base64,'+win.__RBRafiRunAssetData.png;
  });return record;
 }
 const button=win.document.createElement('button');button.type='button';button.id='rb-m477-rafi-run-toggle';
 const label=()=>{button.textContent='Rafi Run Prototype · '+(win.__RBRafiRunPrototypeEnabled?'ON':'OFF');button.setAttribute('aria-pressed',String(win.__RBRafiRunPrototypeEnabled));};label();
 button.onclick=()=>{win.__RBRafiRunPrototypeEnabled=!win.__RBRafiRunPrototypeEnabled;const a=win.__RBRafiRunPrototype;if(win.__RBRafiRunPrototypeEnabled)a?.reset();else a?.disable();label();};win.document.body.append(button);
 function attach(scene){
  scene.__rbRafiRunPrototype?.destroy();const asset=ensureAsset(scene.game);let sprite=null,disposed=false,hidOriginal=false,lastPoint=null,policy={show:false,reason:'asset-not-ready'},pose=null,runtime,createdSprites=0;
  function fallback(reason){sprite?.anims?.stop();sprite?.setVisible(false);if(hidOriginal&&scene.player?.view?.scene)scene.player.view.setVisible(true);hidOriginal=false;policy={show:false,reason};}
  function makeSprite(scope){if(disposed||sprite||asset.state!=='ready'||!scene.sys.isActive())return;sprite=scope.gameObject(scene.add.sprite(0,0,manifest.textureKey,0).setVisible(false).setDepth(scene.player.view.depth));createdSprites++;}
  return createRBManagedActor({id:'rafi-run-prototype',scene,sceneLifecycle:false,stateProperty:'lifecycleState',enabled:()=>win.__RBRafiRunPrototypeEnabled!==false,
   onDisable:()=>fallback('disabled'),onReset:()=>{fallback('reset');lastPoint=null;},onDestroy:()=>{disposed=true;fallback('destroyed');},
   create(scope){
    makeSprite(scope);asset.promise.then(()=>{makeSprite(scope);});
    scope.listen(scene.events,'character',()=>fallback('character-switch'),{whileDisabled:true});
    runtime={snapshot:()=>({status:'prototype',enabled:win.__RBRafiRunPrototypeEnabled,assetState:asset.state,assetErrors:asset.errors.slice(),loads:asset.loads,show:!!sprite?.visible,reason:policy.reason,frame:sprite?.frame?Number(sprite.frame.name):null,playing:!!sprite?.anims?.isPlaying,flipX:!!sprite?.flipX,depth:sprite?.depth,pose:pose?{...pose}:null,originalVisible:scene.player?.view?.visible,hasPhysicsBody:!!sprite?.body,createdSprites,textureKey:manifest.textureKey,animationKey:manifest.animationKey}),get sprite(){return sprite;}};
    scope.reference(win,'__RBRafiRunPrototype',runtime);scope.reference(scene,'__rbRafiRunPrototype',runtime);return runtime;
   },update(){
    makeSprite(runtime.scope);const p=scene.player,b=p.body2;const point={x:b.center.x,bottom:b.bottom};
    if(lastPoint&&Math.hypot(point.x-lastPoint.x,point.bottom-lastPoint.bottom)>100){lastPoint=point;fallback('position-reset');return;}lastPoint=point;
    const keys=p.keys,input=(keys.right.isDown||keys.d.isDown?1:0)-(keys.left.isDown||keys.a.isDown?1:0);
    policy=rafiRunPolicy({enabled:win.__RBRafiRunPrototypeEnabled,ready:asset.state==='ready'&&!!sprite,activeId:p.activeId,grounded:b.blocked.down||b.touching.down,vx:b.velocity.x,vy:b.velocity.y,input,attached:scene.tape.attached,hammerCd:scene.tools.hammerCd,drillCd:scene.tools.nailCd,inWeb:p.inWeb,finished:scene.finished},manifest.render);
    if(!policy.show)return fallback(policy.reason);
    sprite.play(manifest.animationKey,true);const frame=Number(sprite.frame.name);pose=rafiRunPose(manifest,frame,point,p.facing);
    sprite.setPosition(pose.x,pose.y).setOrigin(pose.originX,pose.originY).setScale(pose.scaleX,pose.scaleY).setFlipX(pose.flipX).setAngle(0).setVisible(true);
    p.view.setVisible(false);hidOriginal=true;
   }});
 }
 win.__RBSceneComposerV1.register('rafi-run-prototype',attach);win.__RBRafiRunPrototypeInstalled=true;return null;
}
