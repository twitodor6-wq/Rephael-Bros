/** M4.6.3: data-driven stage environmental-anchor registry.
 * Uses only the existing TapeMeasure.anchors array, preserving ALL rope math.
 * Coordinates, strength, visibility flag, and collapse outcome live in JSON.
 * No decorative/background tree is automatically made hookable.
 */
const RB_ANCHOR_SCHEMA='rafael-stage-anchors/v1';
const RB_ANCHOR_STRENGTHS=new Set(['stable','fragile']);
const RB_ANCHOR_OUTCOMES=new Set(['none','fallen-log','bridge-fragment','break']);
function validateEnvironmentalAnchors(config){
  if(!config||config.schema!==RB_ANCHOR_SCHEMA||typeof config.stage!=='string'||!Array.isArray(config.anchors)||!config.world)return false;
  const ids=new Set(); const points=new Set();
  return config.anchors.length>0&&config.anchors.every(a=>{
    if(!a||typeof a.id!=='string'||!/^[a-z][a-z0-9-]+$/.test(a.id)||ids.has(a.id))return false;
    ids.add(a.id);
    if(!RB_ANCHOR_STRENGTHS.has(a.strength)||!['tree','bridge'].includes(a.kind)||!RB_ANCHOR_OUTCOMES.has(a.collapseOutcome))return false;
    if(!Number.isFinite(a.x)||!Number.isFinite(a.y)||a.x<12||a.y<24||a.x>config.world.width-12||a.y>config.world.height-70)return false;
    if(a.enabledFlag!==null && (typeof a.enabledFlag!=='string'||!/^__RB[A-Za-z]+Enabled$/.test(a.enabledFlag)))return false;
    const p=`${a.x},${a.y}`; if(points.has(p))return false; points.add(p);
    if(a.strength==='stable' && a.collapseOutcome!=='none')return false;
    return true;
  });
}
function resolveAnchorDesired(meta,win,override){
  return override!==false && (meta.enabledFlag===null || win[meta.enabledFlag]!==false);
}
function installEnvironmentalAnchors(win=globalThis){
  if(win.__RBStageAnchorsInstalled)return win.__RBStageAnchors||null;
  const config=win.__RB_STAGE_ANCHOR_CONFIG;
  if(!validateEnvironmentalAnchors(config))throw Error('Invalid environmental anchor stage manifest');
  function attach(scene){
    if(scene.__rbStageAnchors)scene.__rbStageAnchors.destroy();
    if(!Array.isArray(scene.tape?.anchors))throw Error('Tape anchor array is unavailable');
    const tape=scene.tape, originalAnchors=tape.anchors;
    let syncRegistry=()=>{};
    return createRBManagedActor({id:'environmental-anchors',scene,sceneLifecycle:!win.__RBSceneComposerV1,sync:()=>syncRegistry(),
     onState:(id,state)=>win.__RBSceneComposerV1?.recordState?.(id,state),create(scope){
    const refs=new Map(),active=new Set(),overrides=new Map(),eventLog=[];
    const g=scope.gameObject(scene.add.graphics().setDepth(14.5));
    let drawKey='';
    // Entries keep object identity; the original NinjaTape validates identity via includes().
    for(const meta of config.anchors){const ref={x:meta.x,y:meta.y};refs.set(meta.id,ref);
      scope.resource(ref,()=>apply(meta,false),(_,on)=>apply(meta,on&&resolveAnchorDesired(meta,win,overrides.get(meta.id))));}

    function event(type,id){eventLog.push({type,id,t:Math.round(scene.time.now)});if(eventLog.length>30)eventLog.shift();}
    function setActive(id,value){
      if(scope.snapshot().destroyed||!refs.has(id))return false;
      overrides.set(id,!!value);sync();return active.has(id);
    }
    function clearOverride(id){if(scope.snapshot().destroyed||!refs.has(id))return false;overrides.delete(id);sync();return active.has(id);}
    function draw(){
      const key=config.anchors.map(m=>`${m.id}:${active.has(m.id)?1:0}`).join('|');
      if(key===drawKey)return;drawKey=key;g.clear();
      for(const meta of config.anchors){
        if(!active.has(meta.id)||meta.strength==='fragile')continue; // fragile object owns its cracks/visuals
        const x=meta.x,y=meta.y;
        if(meta.kind==='tree'){
          if(Number.isFinite(meta.mountY)){
            g.lineStyle(19,0x253b2c,.96).beginPath().moveTo(x-76,meta.mountY).lineTo(x-55,y-130).lineTo(x-40,y-90).strokePath();
            g.lineStyle(7,0x566e47,.85).beginPath().moveTo(x-78,meta.mountY).lineTo(x-52,y-128).lineTo(x-40,y-90).strokePath();
          }
          // Living branch attached to the far left woodland, not a new platform.
          g.lineStyle(16,0x253b2c,.9).beginPath().moveTo(x-40,y-90).lineTo(x-18,y-44).lineTo(x,y).strokePath();
          g.lineStyle(6,0x5b7950,.9).beginPath().moveTo(x-32,y-82).lineTo(x-8,y-38).lineTo(x,y).strokePath();
        }else{
          // Root loop growing upward from the actual far-bank walkable bridge.
          g.lineStyle(14,0x2c3f2a,.92).beginPath().moveTo(x-33,y+46).lineTo(x-12,y+19).lineTo(x,y).strokePath();
          g.lineStyle(6,0x6e8558,.9).beginPath().moveTo(x-30,y+44).lineTo(x-9,y+15).lineTo(x,y).strokePath();
        }
        g.lineStyle(2,0x172a20,.9).strokeCircle(x,y,10);
        g.fillStyle(0xb7ce93,1).fillCircle(x,y,6);
        g.fillStyle(0xf3d891,.92).fillCircle(x-2,y-2,2);
      }
    }
    function apply(meta,desired){
      const ref=refs.get(meta.id),list=tape.anchors;
      if(!Array.isArray(list))return;
      const currently=list.includes(ref);
      if(desired){
        if(!currently){list.push(ref);event('registered',meta.id);}
        // Keep the first identity (and therefore selection order), discard duplicates.
        let first=list.indexOf(ref);for(let i=list.length-1;i>first;i--)if(list[i]===ref)list.splice(i,1);
        active.add(meta.id);
      }else{
        if(tape.anchor===ref){
          try{tape.release();event('rope-released',meta.id);}
          catch(e){scope.reportError(e);event('release-failed',meta.id);}
          finally{if(tape.anchor===ref||tape.anchor==null){tape.attached=false;if(tape.anchor===ref)tape.anchor=null;}}
        }
        let i;while((i=list.indexOf(ref))>=0)list.splice(i,1);
        active.delete(meta.id);if(currently)event('unregistered',meta.id);
      }
      draw();
    }
    function sync(){
      if(scope.snapshot().destroyed)return false;
      const on=scope.snapshot().enabled;
      for(const meta of config.anchors)apply(meta,on&&resolveAnchorDesired(meta,win,overrides.get(meta.id)));
      draw();return true;
    }
    const runtime={version:'M4.6.9',schema:RB_ANCHOR_SCHEMA,stage:config.stage,config,
      getRef:id=>refs.get(id)||null,
      getMeta:id=>config.anchors.find(a=>a.id===id)||null,
      isActive:id=>active.has(id),setActive,clearOverride,sync,
      snapshot:()=>({schema:RB_ANCHOR_SCHEMA,stage:config.stage,anchors:config.anchors.map(m=>({id:m.id,ownerId:m.id,kind:m.kind,strength:m.strength,collapseOutcome:m.collapseOutcome,flag:m.enabledFlag,active:active.has(m.id),x:m.x,y:m.y})),originalCount:originalAnchors.length-config.anchors.filter(m=>active.has(m.id)).length,entryCount:scene.tape?.anchors?.length||0,duplicateRefs:config.anchors.filter(m=>(scene.tape?.anchors||[]).filter(a=>a===refs.get(m.id)).length>1).map(m=>m.id),events:eventLog.slice(-15)})};
    scope.reference(scene,'__rbStageAnchors',runtime);scope.reference(win,'__RBStageAnchors',runtime);
    for(const meta of config.anchors){if(win.__RBStageV1?.getConfig('environmental-anchor',meta.id))scope.binding(win.__RBStageV1,'environmental-anchor',meta.id,runtime);}
    syncRegistry=sync;sync();return runtime;
    },update:()=>scene.__rbStageAnchors?.sync()});

  }
  function patch(){const scene=win.__game?.scene?.getScene?.('Game');if(!scene)return false;
    const proto=Object.getPrototypeOf(scene);
    if(!proto.__rbM463EnvironmentalAnchorsPatched){const old=proto.create;proto.create=function(){const r=old.apply(this,arguments);attach(this);return r;};proto.__rbM463EnvironmentalAnchorsPatched=true;}
    if(scene.sys?.isActive?.()&&scene.tape&&!scene.__rbStageAnchors)attach(scene);
    win.__RBStageAnchorsInstalled=true;return true;
  }
  if(win.__RBSceneComposerV1){win.__RBSceneComposerV1.register('environmental-anchors',attach);win.__RBStageAnchorsInstalled=true;return win.__RBStageAnchors||null;}
 if(!patch()){const timer=win.setInterval(()=>{if(patch())win.clearInterval(timer);},50);win.setTimeout(()=>win.clearInterval(timer),8000);}
  return win.__RBStageAnchors||null;
}
