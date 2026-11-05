/** Rafael Brothers M4.6.7 — one composition root for Stage 01 sidecars.
 * Orders already-existing Phaser actors; deliberately owns no physics or geometry.
 * The actors continue to own their colliders, timers and destruction semantics.
 */
const RB_SCENE_COMPOSER_ORDER=Object.freeze([
 'forest-extension','bridge-polish','stage-dressing','environmental-anchors','rotten-root',
 'falling-bridge-tree','exit-grove','web-response','collapsing-platforms','rafi-run-prototype','sticky-web-prefabs','enemy-prefabs'
]);
function createRBSceneComposer(win=globalThis){
 if(win.__RBSceneComposerV1)return win.__RBSceneComposerV1;
 const entries=new Map(),transitions=[];let epochId=0;let installed=false,booted=false,pollId=null,timeoutId=null;
 const state={attachCount:0,shutdownCount:0,attachFailures:0,lastError:null};
 function register(id,attach){
  if(booted)throw Error('Scene composer registry is closed');
  if(!RB_SCENE_COMPOSER_ORDER.includes(id)||entries.has(id)||typeof attach!=='function')throw Error('Duplicate or invalid scene actor '+id);
  entries.set(id,attach);return true;
 }
 function snapshot(scene=win.__game?.scene?.getScene?.('Game')){
  return {version:'M4.6.9',stageId:win.__RBStageV1?.stageId||null,epoch:epochId,managed:(scene?.__rbM467Composition?.managed||[]).map(a=>a.lifecycleSnapshot()),transitions:transitions.slice(),booted,installed,registered:[...entries.keys()],expected:[...RB_SCENE_COMPOSER_ORDER],
   legacyScenePatches:Object.entries({
     'bridge-polish':'__rbM461BridgePatched','stage-dressing':'__rbM461DressPatched',
     'environmental-anchors':'__rbM463EnvironmentalAnchorsPatched','rotten-root':'__rbM462RottenPatched',
     'falling-bridge-tree':'__rbM463FallingTreePatched','exit-grove':'__rbM464ExitPatched',
     'web-response':'__rbM464WebPatched'
   }).filter(([,flag])=>!!Object.getPrototypeOf(scene||{})[flag]).map(([id])=>id),
   active:!!scene?.__rbM467Composition?.active,actors:scene?.__rbM467Composition?.actors?.slice()||[],
   ...state};
 }
 function attach(scene){
  if(!booted)throw Error('Composition root was not started');
  if(scene.__rbM467Composition?.active)return false;
  if(!scene.player||!scene.tape||!scene.world)throw Error('Game core is incomplete before sidecar attachment');
  const camera=win.__RBStageV1?.getCameraConfig?.();if(camera)scene.cameras.main.setBounds(camera.x,camera.y,camera.width,camera.height);
  const active=[],managed=[];
  try{
   for(const id of RB_SCENE_COMPOSER_ORDER){const actor=entries.get(id)(scene);if(actor?.managedActor)managed.push(actor);active.push(id);}
  }catch(e){
   state.attachFailures++;state.lastError=String(e?.message||e);
   // The actor managers own rollback. Snapshot per-actor runtime references before calling destroy.
   const props={'forest-extension':'__rbForestExtension','bridge-polish':'__rbBridgePolish','stage-dressing':'__rbStageDressing',
    'environmental-anchors':'__rbStageAnchors','rotten-root':'__rbRottenRoot',
    'falling-bridge-tree':'__rbFallingBridge','sticky-web-prefabs':'__rbStickyWebGroup','exit-grove':'__rbExitGrove','web-response':'__rbWebResponse','collapsing-platforms':'__rbCollapsingPlatforms','rafi-run-prototype':'__rbRafiRunPrototype','enemy-prefabs':'__rbEnemies'};
   for(const id of active.reverse())try{scene[props[id]]?.destroy?.();}catch{}
   throw e;
  }
  epochId++;const epoch={active:true,actors:[...active],managed,shutdown:null};scene.__rbM467Composition=epoch;
  epoch.shutdown=()=>{if(!epoch.active)return;scene.events.off('shutdown',epoch.shutdown);scene.events.off('destroy',epoch.shutdown);for(const actor of epoch.managed.slice().reverse())actor.destroy();epoch.active=false;state.shutdownCount++;if(scene.__rbM467Composition===epoch)scene.__rbM467Composition=null;
   // Some historical actors do not unbind their StageV1 IDs on shutdown.
   // This runs LAST, after all their own shutdown callbacks and destroys only
   // metadata references; it does not touch gameplay objects or tape physics.
   win.__RBStageV1?.clearRuntime();
  };
  // Registered last, so every actor's existing shutdown listener runs before this observer.
  scene.events.once('shutdown',epoch.shutdown);scene.events.once('destroy',epoch.shutdown);
  state.attachCount++;return true;
 }
 function tryInstall(){
  const scene=win.__game?.scene?.getScene?.('Game');if(!scene)return false;
  const proto=Object.getPrototypeOf(scene);
  if(!proto.__rbM467CompositionPatched){
   const previous=proto.create;
   proto.create=function(){const out=previous.apply(this,arguments);if(this===scene||this.scene?.key==='Game')attach(this);return out;};
   Object.defineProperty(proto,'__rbM467CompositionPatched',{value:true,configurable:false});
  }
  installed=true;
  if(scene.sys?.isActive?.()&&scene.player&&scene.tape&&scene.world&&!scene.__rbM467Composition?.active)attach(scene);
  return true;
 }
 function start(){
  if(booted)return true;
  if(RB_SCENE_COMPOSER_ORDER.some(id=>!entries.has(id)))throw Error('Scene composer missing registration: '+RB_SCENE_COMPOSER_ORDER.filter(id=>!entries.has(id)).join(','));
  booted=true;
  if(tryInstall())return true;
  // The baseline creates its Phaser scene asynchronously. One bounded polling loop
  // replaces seven independent timers; it never runs after finding the scene.
  pollId=win.setInterval(()=>{if(tryInstall()){win.clearInterval(pollId);win.clearTimeout(timeoutId);pollId=null;}},50);
  timeoutId=win.setTimeout(()=>{if(pollId!==null){win.clearInterval(pollId);pollId=null;state.lastError='Game scene not found during composer startup';}},8000);
  return true;
 }
 function recordState(id,value){transitions.push({stageId:win.__RBStageV1?.stageId||null,epoch:epochId+(!win.__game?.scene?.getScene?.('Game')?.__rbM467Composition?.active?1:0),id,state:value,at:Date.now()});if(transitions.length>64)transitions.shift();}
 function recreate(id,scene=win.__game?.scene?.getScene?.('Game')){
  const epoch=scene?.__rbM467Composition;
  if(!epoch?.active||!['forest-extension','bridge-polish','stage-dressing','rotten-root','falling-bridge-tree'].includes(id))throw Error('Only active managed actors can be recreated');
  const index=epoch.managed.findIndex(a=>a.id===id);epoch.managed[index]?.destroy();
  const actor=entries.get(id)(scene);if(index<0)epoch.managed.push(actor);else epoch.managed[index]=actor;return actor;
 }
 function diagnostics(){return {version:'M4.6.9',lifecycle:snapshot(),modules:(win.__RB_STAGE_MODULE_CONFIG?.modules||[]).map(m=>({id:m.id,enabled:m.flag?win[m.flag]!==false:null})),telemetry:win.__RBTelemetry?.snapshot?.()||null};}
 function exportDiagnostics(){
  const doc=diagnostics(),blob=new win.Blob([JSON.stringify(doc,null,2)],{type:'application/json'}),url=win.URL.createObjectURL(blob);
  const a=win.document.createElement('a');a.href=url;a.download='rafael-brothers-m469-lifecycle.json';a.click();win.setTimeout(()=>win.URL.revokeObjectURL(url),1000);return doc;
 }
 const controller={version:'M4.6.9',register,start,attach,snapshot,recordState,recreate,diagnostics,exportDiagnostics};
 win.__RBSceneComposerV1=controller;return controller;
}
