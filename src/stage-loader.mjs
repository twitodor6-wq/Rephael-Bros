/** M4.6.5 -- Stage JSON -> validated prefab configurations, preserving existing Phaser actors.
 * Pure preparation phase; no changes to Arcade/Matter mechanics or tape math.
 * Runtime owns only metadata; existing actors own colliders/timers/lifecycle.
 */
const RB_STAGE_SCHEMA='1.0.0';
const RB_STAGE_PREFABS=['environmental-anchor','root-bridge','rotten-root','falling-bridge-tree','exit-grove','collapsing-platform','ceiling-spider','sticky-web','egg-sac'];
function validateStageStructure(s){
 const errors=[], ids=new Set();
 const fail=(msg)=>errors.push(msg);
 if(!s||typeof s!=='object'||Array.isArray(s))return {ok:false,errors:['stage object required']};
 if(typeof s.title!=='string'||!s.title)fail('invalid title');
 if(s.schemaVersion!==RB_STAGE_SCHEMA)fail('unsupported schema version');
 if(typeof s.stageId!=='string'||!/^[a-z][a-z0-9-]+$/.test(s.stageId))fail('invalid stageId');
 if(!s.world||!Number.isFinite(s.world.width)||!Number.isFinite(s.world.height)||s.world.width<100||s.world.height<100)fail('invalid world bounds');
 if(!Array.isArray(s.objects)||!Array.isArray(s.modules))fail('objects and modules required');
 // M475 optional additive visual contract; old legacy string configs remain compatible.
 if(s.backgrounds?.motionSource!==undefined){
  const bg=s.backgrounds,ls=bg.layers;
  if(bg.motionSource!=='camera'||bg.smoothing!=='none')fail('parallax must be direct camera sourced');
  if(!Array.isArray(ls)||ls.length!==3||ls.some((v,i)=>!v||v.id!==['far','mid','near'][i]||!Number.isFinite(v.parallax)||v.parallax<0||v.parallax>.18||i>0&&v.parallax<=ls[i-1].parallax))fail('invalid camera depth factors');
  if(Array.isArray(ls)&&ls.some(v=>v&&1280+Math.max(0,(s.world?.width||1280)-1280)*v.parallax>1792))fail('parallax art does not cover camera range');
  const w=bg.webResponse;
  if(!w||![w.anchor?.x,w.anchor?.y,w.maxDeflection,w.responseHz].every(Number.isFinite)||w.maxDeflection<0||w.maxDeflection>4||w.responseHz<=0||w.responseHz>30)fail('invalid local web response');
 }
 // M476 presentation only: reuse existing hint/area dispatch; never alter geometry.
 if(s.guidance!==undefined){
  const g=s.guidance,point=v=>v&&Number.isFinite(v.x)&&v.x>=0&&v.x<=s.world?.width;
  if(!g||typeof g.name!=='string'||!g.name.length||g.name.length>80||!Array.isArray(g.hints)||g.hints.length>8||!Array.isArray(g.areas)||g.areas.length>4)fail('invalid stage guidance');
  else {
   const used=new Set();
   for(const h of g.hints){if(!point(h)||typeof h.id!=='string'||!h.id.length||used.has(h.id)||typeof h.text!=='string'||!h.text.length||h.text.length>100)fail('invalid guidance hint');used.add(h?.id);}
   for(const a of g.areas)if(!point(a)||typeof a.name!=='string'||!a.name.length||a.name.length>50||typeof a.subtitle!=='string'||a.subtitle.length>100)fail('invalid guidance area');
  }
 }
 const anchors=new Set();
 for(const o of Array.isArray(s.objects)?s.objects:[]){
  if(!o||typeof o.id!=='string'||!/^[a-z][a-z0-9-]+$/.test(o.id)||ids.has(o.id)){fail('duplicate or invalid object id');continue;}
  ids.add(o.id);
  if(typeof o.prefab!=='string'||!o.prefab)fail('invalid prefab '+o.id);
  if(!o.position||!Number.isFinite(o.position.x)||!Number.isFinite(o.position.y)||o.position.x<0||o.position.y<0||o.position.x>(s.world?.width??0)||o.position.y>(s.world?.height??0))fail('invalid object position '+o.id);
  if(!o.properties||typeof o.properties!=='object'||Array.isArray(o.properties))fail('missing prefab properties '+o.id);
  if(o.prefab==='environmental-anchor'||o.prefab==='falling-bridge-tree')anchors.add(o.id);
 }
 const mIds=new Set(),flags=new Set();
 for(const m of Array.isArray(s.modules)?s.modules:[]){
  if(!m||typeof m.id!=='string'||mIds.has(m.id))fail('duplicate module id');else mIds.add(m.id);
  if(m?.flag){if(flags.has(m.flag))fail('duplicate module flag');flags.add(m.flag);}
  if(m?.state==='active'&&!m.element)fail('missing active module element');
 }
 if(s.world?.forestExtension!==undefined){
  const ext=s.world.forestExtension,parts=ext?.surfaces;
  if(!ext||typeof ext.id!=='string'||!Array.isArray(parts)||parts.length<1||parts.length>8||!Number.isFinite(ext.joinX)||ext.joinX<0||ext.joinX>=s.world.width)fail('invalid forest extension');
  else {
   const used=new Set();let last=ext.joinX;
   for(const r of parts){
    if(!r||typeof r.id!=='string'||!/^[a-z][a-z0-9-]+$/.test(r.id)||used.has(r.id)||![r.x,r.y,r.w,r.h].every(Number.isFinite)||r.w<=0||r.h<=0||r.x<last||r.x+r.w>s.world.width||r.y<0||r.y+r.h>s.world.height){fail('invalid forest extension surface');break;}
    used.add(r.id);last=r.x+r.w;
   }
   if(parts[0]?.x!==ext.joinX)fail('forest extension must join existing ground');
  }
 }
 if(s.world?.terrain!==undefined){
  const terrain=s.world.terrain,validRect=r=>r&&typeof r==='object'&&['x','y','w','h'].every(k=>Number.isFinite(r[k]))&&r.w>0&&r.h>0;
  if(!terrain||typeof terrain!=='object'||Array.isArray(terrain)||Object.keys(terrain).some(k=>!['surfaces','pits'].includes(k))||!Array.isArray(terrain.surfaces)||!Array.isArray(terrain.pits))fail('invalid world terrain');
  else {
   const terrainIds=new Set();
   for(const a of [...terrain.surfaces,...terrain.pits]){
    if(typeof a?.id!=='string'||!/^[a-z][a-z0-9-]+$/.test(a.id)||terrainIds.has(a.id))fail('duplicate or invalid terrain id');else terrainIds.add(a.id);
   }
   for(const r of terrain.surfaces)if(!validRect(r)||r.x<0||r.y<0||r.x+r.w>s.world.width||r.y+r.h>s.world.height)fail('surface outside world');
   for(const gap of terrain.pits)if(!Number.isFinite(gap?.start)||!Number.isFinite(gap?.end)||gap.start<0||gap.start>=gap.end||gap.end>s.world.width)fail('invalid pit interval');
   for(const a of terrain.pits)for(const b of terrain.surfaces)if(b.x<a.end&&b.x+b.w>a.start)fail('terrain surface intersects pit '+a.id);
   for(let i=0;i<terrain.pits.length;i++)for(let j=0;j<i;j++)if(terrain.pits[i].start<terrain.pits[j].end&&terrain.pits[j].start<terrain.pits[i].end)fail('overlapping pits');
  }
 }
 // Optional semantic links; geometry remains owned by surfaces and anchor objects.
 if(s.ropeCrossings!==undefined){
  if(!Array.isArray(s.ropeCrossings))fail('ropeCrossings must be an array');
  else {const crossingIds=new Set(),surfaceIds=new Set([...(s.world?.forestExtension?.surfaces||[]),...(s.world?.terrain?.surfaces||[])].map(v=>v.id));
   for(const c of s.ropeCrossings){
    if(!c||typeof c.id!=='string'||!/^[-a-z0-9]+$/.test(c.id)||crossingIds.has(c.id)||c.kind!=='tape-crossing'||typeof c.anchorId!=='string'||!anchors.has(c.anchorId)||!surfaceIds.has(c.leftSurfaceId)||!surfaceIds.has(c.rightSurfaceId)||c.leftSurfaceId===c.rightSurfaceId||Object.keys(c).some(k=>!['id','kind','anchorId','leftSurfaceId','rightSurfaceId'].includes(k)))fail('invalid rope crossing reference '+c?.id);
    else crossingIds.add(c.id);
   }
  }
 }
 if(s.camera!==undefined){const b=s.camera?.bounds;
  if(!b||Object.keys(s.camera).some(k=>k!=='bounds')||Object.keys(b).some(k=>!['x','y','width','height'].includes(k))||![b.x,b.y,b.width,b.height].every(Number.isFinite)||b.x<0||b.y<0||b.width<=0||b.height<=0||b.x+b.width>(s.world?.width??0)||b.y+b.height>(s.world?.height??0))fail('invalid camera bounds');
 }
 return {ok:errors.length===0,errors};
}
function validateStageV1(s){
 const shape=validateStageStructure(s);if(!shape.ok)return shape;
 const errors=[],fail=msg=>errors.push(msg),anchors=new Set(s.objects.filter(o=>['environmental-anchor','falling-bridge-tree'].includes(o.prefab)).map(o=>o.id));
 for(const o of s.objects)if(!RB_STAGE_PREFABS.includes(o.prefab))fail('unknown prefab '+o.id);
 const object=(type)=>s.objects.filter(o=>o.prefab===type);
 // Enemy coordinates are local offsets from the authored ceiling origin.
 for(const o of object('egg-sac')){
  const p=o.properties,limits={radiusX:[1,100],radiusY:[1,100],silkTopOffsetY:[-2000,-1],groundOffsetY:[1,2000],hatchSeconds:[.01,10],count:[1,32],gravity:[1,2000],spiderlingLifeSeconds:[.1,30],spiderlingSpeed:[1,300],damageCooldown:[.1,10],bumpX:[0,500],bumpY:[-500,0]};
  const keys=[...Object.keys(limits),'roamOffset'],r=p?.roamOffset;
  if(!p||Object.keys(p).length!==keys.length||keys.some(k=>!(k in p))||Object.entries(limits).some(([k,[lo,hi]])=>!Number.isFinite(p[k])||p[k]<lo||p[k]>hi)||!Number.isInteger(p.count)||!r||Array.isArray(r)||Object.keys(r).length!==2||![r.minX,r.maxX].every(Number.isFinite)){fail('invalid egg sac properties '+o.id);continue;}
  const {x,y}=o.position;
  if(x-p.radiusX<0||x+p.radiusX>s.world.width||y-p.radiusY<0||y+p.radiusY>s.world.height||y+p.silkTopOffsetY<0||p.silkTopOffsetY>-p.radiusY||p.groundOffsetY<p.radiusY+6||y+p.groundOffsetY>s.world.height||r.minX>=r.maxX||x+r.minX<8||x+r.maxX>s.world.width-8||x-(p.count-1)*2<8||x+(p.count-1)*2>s.world.width-8)fail('egg sac outside world or invalid ground/roam '+o.id);
 }
 for(const o of object('sticky-web')){
  const p=o.properties,k=['size','speedCap','holdToTrapSeconds','directionalEscapeSeconds','maxTrapSeconds','recoverySeconds','cutRecoverySeconds','swingDragPerSecond'];
  if(!p||Object.keys(p).length!==k.length||k.some(v=>!(v in p))||!p.size||typeof p.size!=='object'||Array.isArray(p.size)||Object.keys(p.size).length!==2||!Number.isFinite(p.size.w)||!Number.isFinite(p.size.h)||p.size.w<=0||p.size.h<=0||k.filter(v=>v!=='size').some(v=>!Number.isFinite(p[v])||p[v]<=0)){fail('invalid sticky web properties '+o.id);continue;}
  const x=o.position.x,y=o.position.y;
  if(x+p.size.w>s.world.width||y+p.size.h>s.world.height||p.speedCap>230||p.swingDragPerSecond>10||p.maxTrapSeconds>30||p.cutRecoverySeconds>60||p.recoverySeconds>60)fail('sticky web outside world or unsafe tuning '+o.id);
 }
 for(const o of object('ceiling-spider')){
  const p=o.properties,keys=['attackOffsetY','triggerOffset','warnSeconds','descendSpeed','ascendSpeed','attackWindow','stunSeconds','rearmSeconds','body','knock','invulnSeconds','platformOffsetY'];
  const exact=(v,ks)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===ks.length&&ks.every(k=>Number.isFinite(v[k]));
  if(!p||Object.keys(p).length!==keys.length||keys.some(k=>!(k in p))||keys.filter(k=>!['triggerOffset','body','knock'].includes(k)).some(k=>!Number.isFinite(p[k])||p[k]<=0)||!exact(p.triggerOffset,['x','y','w','h'])||!exact(p.body,['w','h'])||!exact(p.knock,['x','y'])){fail('invalid ceiling spider properties '+o.id);continue;}
  const t=p.triggerOffset,b=p.body,x=o.position.x,y=o.position.y;
  if(t.w<=0||t.h<=0||b.w<=0||b.h<=0||p.knock.x<0||p.knock.y>0||x-b.w/2<0||x+b.w/2>s.world.width||y-b.h/2<0||y+p.attackOffsetY+b.h/2>s.world.height||x+t.x<0||x+t.x+t.w>s.world.width||y+t.y<0||y+t.y+t.h>s.world.height||y+p.platformOffsetY>s.world.height||p.platformOffsetY<p.attackOffsetY+b.h/2)fail('ceiling spider outside world or platform '+o.id);
 }


 if(object('root-bridge').length!==1||object('rotten-root').length!==1||object('falling-bridge-tree').length!==1||object('exit-grove').length!==1||anchors.size<1)fail('stage requires single root bridge, rotten root, falling tree, exit and anchors');
 for(const o of object('rotten-root'))if(!anchors.has(o.properties?.anchorId))fail('rotten root anchorId unresolved');
 for(const o of s.objects.filter(o=>['environmental-anchor','falling-bridge-tree'].includes(o.prefab))){
  const p=o.prefab==='falling-bridge-tree'?o.properties?.anchor:o.properties;
  if(!['tree','bridge'].includes(p?.kind)||!['stable','fragile'].includes(p?.strength)||!['none','fallen-log','bridge-fragment','break'].includes(p?.collapseOutcome))fail('invalid anchor metadata '+o.id);
  if(p?.strength==='stable'&&p?.collapseOutcome!=='none')fail('invalid stable anchor outcome');
 }
 const positiveRect=r=>r&&Number.isFinite(r.x)&&Number.isFinite(r.y)&&Number.isFinite(r.w)&&(r.h===undefined||(Number.isFinite(r.h)&&r.h>0))&&r.w>0;
 for(const o of object('root-bridge')){
  const p=o.properties;if(!p?.size||p.size.w<=0||p.size.h<=0||!positiveRect(p.brokenLeft)||!positiveRect(p.brokenRight)||!p.pit||p.pit.end<=p.pit.start)fail('invalid root bridge geometry');
  else if(!(o.position?.x>=p.pit.end+10&&o.position.x+p.size.w<(s.world?.width??0)-20&&o.position.y>=380&&o.position.y<425&&p.brokenLeft.x+p.brokenLeft.w<p.brokenRight.x-65))fail('root bridge safety invariant');
 }
 for(const o of object('rotten-root')){
  const p=o.properties;if(!p?.size||p.size.w<=0||p.size.h<=0||!Number.isFinite(p.fallY)||!Number.isFinite(p.safeFloorW)||p.safeFloorW<=0||p.warningMs<=0)fail('invalid rotten root geometry');
 }
 for(const o of object('collapsing-platform')){
  const p=o.properties,sz=p.size;
  if(!sz||![sz.w,sz.h,p.warningMs,p.standingMs].every(Number.isFinite)||sz.w<=0||sz.h<=0||p.warningMs<=0||p.standingMs<0||o.position.x+sz.w>s.world.width||o.position.y+sz.h>s.world.height||!['rotten-log','crumbling-bridge','stable-log'].includes(p.variant)||p.trigger!=='stand'||p.outcome!=='remove'||!Array.isArray(p.anchorRefs)||p.anchorRefs.some(id=>!anchors.has(id)))fail('invalid collapsing platform '+o.id);
 }
 if(s.challenges!==undefined){
  if(!Array.isArray(s.challenges))fail('invalid challenges');
  else {const seen=new Set();for(const c of s.challenges){
   if(!c||typeof c.challengeId!=='string'||seen.has(c.challengeId)||c.schemaVersion!=='1.0.0'||!['teach','practice','combine','mastery'].includes(c.learningRole)||!Number.isFinite(c.difficulty)||c.difficulty<1||c.difficulty>5||!Array.isArray(c.requiredSkills)||!c.requiredSkills.length||!Array.isArray(c.instances)||!c.instances.length||c.instances.some(id=>!s.objects.some(o=>o.id===id))||![c.entry?.x,c.entry?.y,c.exit?.x,c.exit?.y].every(Number.isFinite)||[c.entry,c.exit].some(v=>v.x<0||v.y<0||v.x>s.world.width||v.y>s.world.height)||c.requiredSkills.some(v=>typeof v!=='string')||!Array.isArray(c.solutions)||!c.solutions.length||!c.recovery||!c.warningTiming||!c.dynamicStateAssumptions||!c.qaEvidence)fail('invalid challenge '+c?.challengeId);
   if(c?.recovery){const r=c.recovery;
    if(r.surfaceId&&!(s.world.forestExtension?.surfaces||[]).some(v=>v.id===r.surfaceId))fail('unresolved recovery surface');
    if(r.anchorId&&!anchors.has(r.anchorId))fail('unresolved recovery anchor');
    if(r.returnVia&&(!Array.isArray(r.returnVia)||!r.returnVia.length||r.returnVia.some(id=>!s.objects.some(o=>o.id===id&&o.prefab==='collapsing-platform'))))fail('unresolved recovery return');
    if(r.rearmOnReturn){const o=s.objects.find(o=>o.id===r.returnVia?.at(-1));if(o?.properties.variant!=='stable-log'||!c.instances?.includes(o.id))fail('recovery requires stable entry');}
   }
   seen.add(c?.challengeId);
  }}
 }
 const bounds=s.world||{};
 const rectOk=r=>r&&[r.x,r.y,r.w,r.h].every(Number.isFinite)&&r.w>0&&r.h>0;
 for(const o of object('falling-bridge-tree')){
  const p=o.properties||{},a=p.anchor||{},linked=s.objects.find(v=>v.id===p.pitSource&&v.prefab==='root-bridge');
  const stub={x:o.position.x+p.stubOffset?.x,y:o.position.y+p.stubOffset?.y,...p.stubSize};
  const bridge={x:o.position.x+p.bridgeOffset?.x,y:o.position.y+p.bridgeOffset?.y,...p.bridgeSize};
  const pit=linked?.properties?.pit;
  if(!linked||!rectOk(stub)||!rectOk(bridge)||!pit||!Number.isFinite(p.pullRatio)||p.pullRatio<=0||p.pullRatio>=1||![p.warningMs,p.standMs,p.pullMs].every(n=>Number.isFinite(n)&&n>0))fail('invalid falling tree geometry '+o.id);
  else if(p.motion){
   const m=p.motion;
   if(![m.breakMs,m.fallMs,m.settleMs,m.hookDistance,m.minRemainingGap].every(n=>Number.isFinite(n)&&n>0)||m.minRemainingGap<230||!(bridge.x>=pit.start-32&&bridge.x<=pit.start&&bridge.x+bridge.w>pit.start+40&&pit.end-bridge.x-bridge.w>=m.minRemainingGap&&bridge.y<=520&&stub.x+stub.w<=pit.start-8&&stub.y+stub.h===490&&bridge.h>=8&&m.hookDistance<bridge.w&&o.position.x===bridge.x&&Math.abs(o.position.y-(bridge.y+bridge.h/2-m.hookDistance))<.01))fail('falling log pose/safety invariant '+o.id);
  }
  else if(!(bridge.x>=pit.start&&bridge.x<=pit.start+40&&bridge.x+bridge.w<=pit.end-150&&bridge.y<490&&stub.x+stub.w<=pit.start-8&&stub.y<bounds.height-50))fail('falling tree safety invariant '+o.id);
  if(a.collapseOutcome!=='bridge-fragment'||a.strength!=='fragile'||a.enabledFlag!=='__RBFallingBridgeEnabled')fail('falling tree anchor metadata invalid');
 }
 for(const o of object('exit-grove')){
  const p=o.properties||{},rotten=s.objects.find(v=>v.id===p.requiresRottenLedge&&v.prefab==='rotten-root');
  const endX=o.position.x+p.endOffsetX,footY=o.position.y+p.minFootOffsetY;
  if(!rotten||![p.endOffsetX,p.minFootOffsetY].every(Number.isFinite)||!(endX>=rotten.position.x+rotten.properties.size.w&&endX<bounds.width-12&&footY>=430&&footY<=bounds.height-80&&o.position.x>rotten.position.x))fail('exit grove must follow rotten ledge and remain in bounds');
 }
 return {ok:errors.length===0,errors};
}
function makePrefabRegistry(){
 const factories=new Map();
 const register=(name,fn)=>{if(factories.has(name)||!RB_STAGE_PREFABS.includes(name))throw Error('Invalid or duplicate prefab factory '+name);factories.set(name,fn);};
 register('egg-sac',o=>{const p=o.properties;return {id:o.id,x:o.position.x,y:o.position.y,radiusX:p.radiusX,radiusY:p.radiusY,silkTopY:o.position.y+p.silkTopOffsetY,groundY:o.position.y+p.groundOffsetY,hatchSeconds:p.hatchSeconds,count:p.count,gravity:p.gravity,spiderlingLifeSeconds:p.spiderlingLifeSeconds,spiderlingSpeed:p.spiderlingSpeed,spiderlingMinX:o.position.x+p.roamOffset.minX,spiderlingMaxX:o.position.x+p.roamOffset.maxX,damageCooldown:p.damageCooldown,bumpX:p.bumpX,bumpY:p.bumpY};});
 register('sticky-web',o=>({id:o.id,x:o.position.x,y:o.position.y,w:o.properties.size.w,h:o.properties.size.h,speedCap:o.properties.speedCap,holdToTrapSeconds:o.properties.holdToTrapSeconds,directionalEscapeSeconds:o.properties.directionalEscapeSeconds,maxTrapSeconds:o.properties.maxTrapSeconds,recoverySeconds:o.properties.recoverySeconds,cutRecoverySeconds:o.properties.cutRecoverySeconds,swingDragPerSecond:o.properties.swingDragPerSecond}));
 register('ceiling-spider',o=>{const p=o.properties;return {id:o.id,name:'Ceiling Drop Spider',x:o.position.x,ceilingY:o.position.y,attackY:o.position.y+p.attackOffsetY,trigger:{x:o.position.x+p.triggerOffset.x,y:o.position.y+p.triggerOffset.y,w:p.triggerOffset.w,h:p.triggerOffset.h},warnSeconds:p.warnSeconds,descendSpeed:p.descendSpeed,ascendSpeed:p.ascendSpeed,attackWindow:p.attackWindow,stunSeconds:p.stunSeconds,rearmSeconds:p.rearmSeconds,body:{...p.body},knock:{...p.knock},invulnSeconds:p.invulnSeconds,platformTop:o.position.y+p.platformOffsetY};});
 register('environmental-anchor',o=>({...o.properties,id:o.id,x:o.position.x,y:o.position.y}));
 register('root-bridge',(o,stage)=>({shelf:{x:o.position.x,y:o.position.y,w:o.properties.size.w,h:o.properties.size.h},brokenLeft:{...o.properties.brokenLeft},brokenRight:{...o.properties.brokenRight},pit:{...o.properties.pit},worldEnd:stage.world.width,decorativeDrop:o.properties.decorativeDrop,decorativeOnly:o.properties.decorativeOnly,legacyHookMount:o.properties.legacyHookMount}));
 register('falling-bridge-tree',(o,stage,index)=>{
  const p=o.properties, root=index.get(p.pitSource), pit=root.properties.pit;
  return {anchorId:o.id,anchor:{...o.position},stub:{x:o.position.x+p.stubOffset.x,y:o.position.y+p.stubOffset.y,...p.stubSize},bridge:{x:o.position.x+p.bridgeOffset.x,y:o.position.y+p.bridgeOffset.y,...p.bridgeSize},pit:{left:pit.start,right:pit.end},warningMs:p.warningMs,standMs:p.standMs,pullMs:p.pullMs,pullRatio:p.pullRatio,motion:p.motion?{...p.motion}:null,hammer:p.hammer?{...p.hammer}:null};
 });
 register('collapsing-platform',o=>({...o.properties,id:o.id,x:o.position.x,y:o.position.y,size:{...o.properties.size},anchorRefs:[...o.properties.anchorRefs]}));
 register('exit-grove',o=>({gateX:o.position.x,gateY:o.position.y,endX:o.position.x+o.properties.endOffsetX,minFootY:o.position.y+o.properties.minFootOffsetY}));
 register('rotten-root',(o,stage,index)=>{const a=index.get(o.properties.anchorId);if(!a||a.prefab!=='environmental-anchor')throw Error('Missing rotten root authored anchor');const {size,anchorId,...p}=o.properties;return {...p,ledge:{x:o.position.x,y:o.position.y,w:size.w,h:size.h},anchor:{...a.position},anchorId};});
 return {create:(o,stage,index)=>{const f=factories.get(o.prefab);if(!f)throw Error('Missing prefab factory '+o.prefab);return f(o,stage,index);},types:[...factories.keys()]};
}
function compileStageV1(stage){
 const validation=validateStageV1(stage);if(!validation.ok)throw Error('Invalid Stage JSON: '+validation.errors.join('; '));
 const index=new Map(stage.objects.map(o=>[o.id,o]));
 const factories=makePrefabRegistry(),instances=new Map();
 for(const o of stage.objects)instances.set(o.id,{id:o.id,type:o.prefab,config:factories.create(o,stage,index)});
 const config=(type,id)=>{const a=instances.get(id);return a&&a.type===type?a.config:null;};
 const anchorObjects=stage.objects.filter(o=>o.prefab==='environmental-anchor'||o.prefab==='falling-bridge-tree');
 const anchors={schema:'rafael-stage-anchors/v1',stage:stage.stageId,world:{...stage.world},anchors:anchorObjects.map(o=>o.prefab==='environmental-anchor'?config(o.prefab,o.id):({...o.properties.anchor,id:o.id,x:o.position.x,y:o.position.y}))};
 const modules={schema:'rafael-stage-modules/v1',stage:stage.stageId,title:stage.stageModules?.title||stage.title,description:stage.stageModules?.description||'',modules:stage.modules};
 return {stageId:stage.stageId,guidance:stage.guidance?JSON.parse(JSON.stringify(stage.guidance)):null,world:{width:stage.world.width,height:stage.world.height},forestExtension:stage.world.forestExtension?JSON.parse(JSON.stringify(stage.world.forestExtension)):null,ropeCrossings:stage.ropeCrossings?JSON.parse(JSON.stringify(stage.ropeCrossings)):[],camera:stage.camera?{...stage.camera.bounds}:null,instances,anchors,modules,config,types:factories.types};
}
function installStageLoader(win=globalThis){
 if(win.__RBStageV1)return win.__RBStageV1;
 const prepared=compileStageV1(win.__RB_STAGE_V1_DATA);const runtimeRefs=new Map();
 const runtime={schemaVersion:RB_STAGE_SCHEMA,stageId:prepared.stageId,types:prepared.types,
  getInstances:type=>[...prepared.instances.values()].filter(o=>o.type===type).map(o=>({id:o.id,config:o.config})),getChallenges:()=>JSON.parse(JSON.stringify(win.__RB_STAGE_V1_DATA.challenges||[])),
  getGuidance:()=>prepared.guidance?JSON.parse(JSON.stringify(prepared.guidance)):null,getCameraConfig:()=>prepared.camera?{...prepared.camera}:null,getForestExtension:()=>prepared.forestExtension?JSON.parse(JSON.stringify(prepared.forestExtension)):null,getWorld:()=>({...prepared.world}),getConfig:prepared.config,bindRuntime(type,id,actor){if(!prepared.config(type,id))throw Error('Invalid prefab binding '+id);runtimeRefs.set(id,actor);},
  unbindRuntime(type,id,actor){if(!prepared.config(type,id))return false;if(runtimeRefs.get(id)!==actor)return false;runtimeRefs.delete(id);return true;},
  getRopeCrossingSnapshot:(scene=null,profiles=null,tape=null)=>{
   // Real collision rects are harvested from the live Phaser world when available;
   // do not introduce an alternative Stage01 legacy-ground source of truth.
   const stageSurface=prepared.forestExtension?.surfaces||[];
   const terrainSurface=win.__RB_STAGE_V1_DATA.world.terrain?.surfaces||[];
   const own=[...stageSurface,...terrainSurface];
   const rects=scene?.world?.solidRects;
   const staticBodies=scene?.physics?.world?.staticBodies?.entries||[];
   const sameBounds=(a,b)=>['x','y'].every(k=>Math.abs(a[k]-b[k])<.1)&&Math.abs(a.w-b.width)<.1&&Math.abs(a.h-b.height)<.1;
   const surfaces=Array.isArray(rects)&&rects.length?rects.map((r,i)=>{
    const match=own.find(v=>['x','y','w','h'].every(k=>Math.abs(v[k]-r[k])<.01));
    const body=staticBodies.find(b=>sameBounds(r,b));
    return {id:match?.id||`legacy-ground-${i}`,x:r.x,y:r.y,w:r.w,h:r.h,enabled:body?.enable??false,role:'ground',source:match?'stage-json':'runtime-legacy'};
   }):own.map(s=>({...s,enabled:true,role:'ground',source:'stage-json'}));
   if(Array.isArray(rects)&&rects.length)for(const [i,b] of staticBodies.entries()){
    if(!surfaces.some(s=>sameBounds(s,b)))surfaces.push({id:`static-obstacle-${i}`,x:b.x,y:b.y,w:b.width,h:b.height,enabled:!!b.enable,collisionPolicy:b.__rbCollisionPolicy||'solid',role:'obstacle',source:'runtime-phaser'});
   }
   const anchors=prepared.anchors.anchors.map(a=>({...a,active:scene?.__rbStageAnchors?.isActive?.(a.id)??true}));
   if(scene?.tape?.anchors){for(const [i,a] of scene.tape.anchors.entries())if(!anchors.some(v=>v.x===a.x&&v.y===a.y))anchors.push({id:`legacy-tape-${i}`,x:a.x,y:a.y,strength:'unknown',active:true});}
   const body=scene?.player?.body2;
   const profilesOut=profiles||((body&&Number.isFinite(body.width)&&Number.isFinite(body.height))?[{id:scene.player.activeId||'active',width:body.width,height:body.height}]:[]);
   return {source:scene?'live-phaser-stage01':'stage-json-only',stageId:prepared.stageId,world:{...prepared.world},surfaces,anchors,profiles:profilesOut,tape:tape||{maxLength:win.__RB_TAPE_RANGE_FROM_SOURCE??null},crossings:prepared.ropeCrossings};
  },
  snapshot:()=>({schemaVersion:RB_STAGE_SCHEMA,stageId:prepared.stageId,instances:[...prepared.instances.values()].map(o=>({id:o.id,type:o.type,position:(win.__RB_STAGE_V1_DATA.objects.find(v=>v.id===o.id)||{}).position,bound:runtimeRefs.has(o.id)}))}),
  clearRuntime:()=>runtimeRefs.clear()};
 win.__RB_STAGE_ANCHOR_CONFIG=prepared.anchors;win.__RB_STAGE_MODULE_CONFIG=prepared.modules;win.__RBStageV1=runtime;return runtime;
}

/** M4.7.0: isolated Phaser fixture compiler. Not a production Stage01 or Stage02 loader. */
function compileRBWorldFixture(data){
 const v=validateStageStructure(data);if(!v.ok)throw Error('Invalid world fixture: '+v.errors.join('; '));
 if(!data.world.terrain||!data.world.spawn||!data.world.finish)throw Error('Fixture terrain, spawn and finish required');
 const {world}=data,validPoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<=world.width&&p.y<=world.height;
 if(!validPoint(world.spawn)||!validPoint(world.finish))throw Error('Fixture start/end outside world');
 if(data.objects.length||data.modules.length)throw Error('World fixture rejects Game prefabs/modules');
 return {stageId:data.stageId,width:world.width,height:world.height,spawn:{...world.spawn},exit:{...world.finish},camera:data.camera?.bounds?{...data.camera.bounds}:null,
   surfaces:world.terrain.surfaces.map(o=>({...o})),pits:world.terrain.pits.map(o=>({...o}))};
}
function mountRBWorldFixture(scene,input){
 const data=compileRBWorldFixture(input),scope=createRBResourceScope(),surfaces=[];let exited=false;
 try{
  if(data.camera){
   const cam=scene.cameras.main,prior=cam._bounds?{x:cam._bounds.x,y:cam._bounds.y,width:cam._bounds.width,height:cam._bounds.height}:null,hadBounds=cam.useBounds;
   scope.defer(()=>{if(prior)cam.setBounds(prior.x,prior.y,prior.width,prior.height);cam.useBounds=hadBounds;});
   cam.setBounds(data.camera.x,data.camera.y,data.camera.width,data.camera.height);
  }
  for(const r of data.surfaces){
   const zone=scope.gameObject(scene.add.zone(r.x+r.w/2,r.y+r.h/2,r.w,r.h));
   scene.physics.add.existing(zone,true);scope.body(zone.body);zone.body.setSize(r.w,r.h).updateFromGameObject();
   if(scene.player)scope.collider(scene.physics.add.collider(scene.player,zone));
   surfaces.push({id:r.id,zone,collider:!!scene.player});
  }
  const goal=scope.gameObject(scene.add.zone(data.exit.x,data.exit.y,36,50));scene.physics.add.existing(goal,true);scope.body(goal.body);
  if(scene.player)scope.collider(scene.physics.add.overlap(scene.player,goal,()=>{exited=true;}));
  return {stageId:data.stageId,spawn:data.spawn,exit:data.exit,goal,surfaces,pits:data.pits,camera:data.camera,
   get exited(){return exited;},disable:()=>scope.setEnabled(false),reset:()=>{exited=false;scope.setEnabled(true);},
   destroy:()=>scope.destroy(),lifecycleSnapshot:()=>scope.snapshot()};
 }catch(e){scope.destroy();throw e;}
}
