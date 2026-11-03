/** M4.7.2: pure, read-only Stage/Phaser geometry safety analysis.
 * No Phaser dependency, no rope forces, no automatic anchor relocation.
 * Coordinates: world pixels; surfaces use TOP-LEFT rectangles; probes are body CENTER.
 */
export const ROPE_CROSSING_CONTRACT='rafael-rope-crossing-safety/v1';
const finite=Number.isFinite;
const validRect=r=>r&&[r.x,r.y,r.w,r.h].every(finite)&&r.w>0&&r.h>0;
const intersects=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const outcome=(checks)=>checks.some(c=>c.status==='FAIL')?'FAIL':checks.some(c=>c.status==='NOT TESTED')?'NOT TESTED':checks.some(c=>c.status==='WARN')?'WARN':'PASS';
function deriveGroundGaps(surfaces,eps=0.01){
 const ground=surfaces.filter(s=>s.role!=='obstacle'&&s.enabled!==false&&validRect(s)).sort((a,b)=>a.x-b.x);
 const gaps=[];
 for(let i=1;i<ground.length;i++){
  const a=ground[i-1],b=ground[i],left=a.x+a.w;
  if(Math.abs(a.y-b.y)>eps||b.x<=left+eps)continue;
  gaps.push({id:`gap:${a.id}:${b.id}`,left,right:b.x,top:a.y,leftSurfaceId:a.id,rightSurfaceId:b.id});
 }
 return gaps;
}
function crossingCheck(snapshot,crossing,profiles){
 const {world,surfaces,anchors}=snapshot;
 const checks=[],record=(status,code,details={})=>checks.push({status,code,...details});
 const left=surfaces.find(r=>r.id===crossing.leftSurfaceId),right=surfaces.find(r=>r.id===crossing.rightSurfaceId);
 if(!left||!right||!validRect(left)||!validRect(right)){record('NOT TESTED','MISSING_BANK_COLLIDER');return {id:crossing.id,status:outcome(checks),checks};}
 if(left.enabled===false||right.enabled===false){record('NOT TESTED','BANK_DISABLED');return {id:crossing.id,status:outcome(checks),checks};}
 const anchor=anchors.find(a=>a.id===crossing.anchorId);
 if(!anchor){record('NOT TESTED','MISSING_ANCHOR',{anchorId:crossing.anchorId});return {id:crossing.id,status:outcome(checks),checks};}
 if(![anchor.x,anchor.y].every(finite)||anchor.x<0||anchor.y<0||anchor.x>world.width||anchor.y>world.height){record('FAIL','ANCHOR_OUTSIDE_WORLD',{anchorId:anchor.id});return {id:crossing.id,status:outcome(checks),checks};}
 if(anchor.active===false){record('NOT TESTED','ANCHOR_DISABLED',{anchorId:anchor.id});return {id:crossing.id,status:outcome(checks),checks};}
 if(anchor.strength==='fragile'){record('WARN','FRAGILE_ANCHOR_STATE',{anchorId:anchor.id});}
 if(Math.abs(left.y-right.y)>0.01){record('NOT TESTED','UNEVEN_BANKS');return {id:crossing.id,status:outcome(checks),checks};}
 const start=left.x+left.w,end=right.x;
 if(start>=end){record('FAIL','MISSING_OPEN_GAP');return {id:crossing.id,status:outcome(checks),checks};}
 const maxLength=snapshot.tape?.maxLength;
 if(!finite(maxLength)||maxLength<=0)record('NOT TESTED','UNKNOWN_TAPE_RANGE');
 if(!Array.isArray(profiles)||!profiles.length)record('NOT TESTED','MISSING_PLAYER_HITBOX');
 for(const p of profiles||[]){
  if(!finite(p.width)||!finite(p.height)||p.width<=0||p.height<=0){record('NOT TESTED','INVALID_PLAYER_HITBOX',{profile:p.id});continue;}
  // A body-width gap is a clearance requirement, not an anchor-centering rule.
  if(end-start<=p.width){record('FAIL','GAP_NARROWER_THAN_BODY',{profile:p.id,gapWidth:end-start,bodyWidth:p.width});continue;}
  const inset=Number.isFinite(snapshot.probeInset)?Math.max(0,snapshot.probeInset):Math.min(1,(end-start-p.width)/4);
  const bodyY=left.y+p.height/2+Math.min(p.height/4,(left.h||p.height)/4);
  const probes=crossing.probes?.[p.id]||[
   {side:'left',x:start+p.width/2+inset,y:bodyY},
   {side:'right',x:end-p.width/2-inset,y:bodyY}
  ];
  for(const probe of probes){
   const center={x:probe.x,y:probe.y},distance=dist(center,anchor);
   if(![center.x,center.y].every(finite)){record('NOT TESTED','INVALID_PROBE',{profile:p.id,side:probe.side});continue;}
   if(finite(maxLength)&&distance>=maxLength){record('FAIL','ANCHOR_OUT_OF_RANGE',{profile:p.id,side:probe.side,distance,maxLength});continue;}
   if(anchor.y>=center.y+36){record('FAIL','ANCHOR_BELOW_ATTACH_CONE',{profile:p.id,side:probe.side});continue;}
   const stepLength=Math.min(120,distance*.5);
   const samples=Math.max(1,Math.ceil(stepLength/Math.max(1,Math.min(p.width,p.height)/6)));
   let blocker=null,at=null;
   for(let k=0;k<=samples;k++){
    const t=distance?stepLength*k/samples/distance:0;
    const body={x:center.x+(anchor.x-center.x)*t-p.width/2,y:center.y+(anchor.y-center.y)*t-p.height/2,w:p.width,h:p.height};
    blocker=surfaces.find(r=>r.enabled!==false&&validRect(r)&&!(r.collisionPolicy==='one-way-top'&&anchor.y<center.y)&&intersects(body,r));
    if(blocker){at={x:body.x,y:body.y};break;}
   }
   if(blocker)record('FAIL','REEL_SWEEP_BLOCKED',{profile:p.id,side:probe.side,anchorId:anchor.id,colliderId:blocker.id,position:at,distance});
   else record('PASS','REEL_SWEEP_CLEAR',{profile:p.id,side:probe.side,anchorId:anchor.id,distance,sampleCount:samples});
  }
 }
 const status=outcome(checks);
 return {id:crossing.id,status,anchorId:anchor.id,leftSurfaceId:left.id,rightSurfaceId:right.id,gap:{left:start,right:end,top:left.y},checks};
}
/** Stage may name crossings by ID. Unlisted adjacent ground gaps are discovered automatically.
 * Detection is evidence, not proof of all possible trajectories or physics dynamics.
 */
export function validateRopeCrossingSafety(snapshot){
 const issues=[];
 if(!snapshot?.world||!finite(snapshot.world.width)||!finite(snapshot.world.height))return {contract:ROPE_CROSSING_CONTRACT,status:'NOT TESTED',issues:['missing world geometry'],crossings:[]};
 if(!Array.isArray(snapshot.surfaces)||snapshot.surfaces.length<2)return {contract:ROPE_CROSSING_CONTRACT,status:'NOT TESTED',issues:['missing bank surfaces'],crossings:[]};
 const surfaces=snapshot.surfaces;
 const ids=new Set();for(const s of surfaces){if(!validRect(s)||!s.id||ids.has(s.id))issues.push('invalid/duplicate surface '+s?.id);ids.add(s?.id);}
 const anchorIds=new Set();for(const a of snapshot.anchors||[]){if(!a?.id||anchorIds.has(a.id))issues.push('invalid/duplicate anchor '+a?.id);anchorIds.add(a?.id);}
 const gaps=deriveGroundGaps(surfaces),explicit=snapshot.crossings||[],mapped=new Set();
 const crossingDefs=[...explicit];
 for(const c of explicit)mapped.add(`${c.leftSurfaceId}|${c.rightSurfaceId}`);
 for(const gap of gaps){
  if(mapped.has(`${gap.leftSurfaceId}|${gap.rightSurfaceId}`))continue;
  const candidates=(snapshot.anchors||[]).filter(a=>a.active!==false&&finite(a.x)&&finite(a.y));
  // Best candidate by proximity to the gap center, with no mandatory center-position constraint.
  candidates.sort((a,b)=>dist(a,{x:(gap.left+gap.right)/2,y:gap.top})-dist(b,{x:(gap.left+gap.right)/2,y:gap.top}));
  crossingDefs.push({id:gap.id,leftSurfaceId:gap.leftSurfaceId,rightSurfaceId:gap.rightSurfaceId,anchorId:candidates[0]?.id});
 }
 if(!crossingDefs.length)return {contract:ROPE_CROSSING_CONTRACT,status:'NOT TESTED',issues:['no adjacent terrain gaps found'],crossings:[]};
 const profiles=snapshot.profiles;
 const crossings=crossingDefs.map(c=>crossingCheck(snapshot,c,profiles));
 const status=issues.length?'FAIL':outcome(crossings);
 return {contract:ROPE_CROSSING_CONTRACT,status,issues,crossings,summary:Object.fromEntries(['PASS','WARN','FAIL','NOT TESTED'].map(s=>[s,crossings.filter(c=>c.status===s).length])),source:snapshot.source||'unspecified',limitations:['Finite static swept-body probes are not Phaser gameplay or exhaustive proof','Dynamic colliders, release cause, modes and respawns require browser QA']};
}
export function assertRopeCrossingGate(report,{allowNotTested=false}={}){
 if(report.status==='FAIL'||(!allowNotTested&&report.status==='NOT TESTED'))throw new Error('Rope crossing QA gate: '+report.status+' '+JSON.stringify(report.summary||report.issues));
 return report;
}
