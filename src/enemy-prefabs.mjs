/** Stage-owned enemy collection. Adapters own behavior/resources; this owns bindings.
 * Add enemy types by extending Stage validation/factories and supplying an adapter.
 * No physics, rendering, timers or player rules belong here.
 */
function mountRBEnemyPrefabs(scene,loader,adapters){
 const entries=[],context={invuln:0};let destroyed=false;
 const each=(method,...args)=>{if(!destroyed)for(const e of entries)e.actor[method]?.(...args);};
 const destroy=()=>{if(destroyed)return false;destroyed=true;let firstError;
  for(const e of entries.slice().reverse())try{e.actor.destroy();}catch(error){firstError??=error;}finally{loader.unbindRuntime(e.type,e.id,e.actor);}
  if(firstError)throw firstError;return true;
 };
 try{for(const [type,create] of Object.entries(adapters))for(const {id,config} of loader.getInstances(type)){
  const actor=create(scene,config,id,context);entries.push({id,type,actor});loader.bindRuntime(type,id,actor);
 }}catch(error){try{destroy();}catch{}throw error;}
 return {entries,reset:()=>{context.invuln=0;each('reset');},setEnabled:on=>each('setEnabled',on),postUpdate:dt=>{if(destroyed)return;context.invuln=Math.max(0,context.invuln-dt);each('postUpdate',dt);},
  hammer(rect){if(destroyed)return false;let hit=false;for(const e of entries)hit=!!e.actor.hammer?.(rect)||hit;return hit;},
  snapshot:()=>({destroyed,instances:entries.map(e=>({id:e.id,type:e.type,...e.actor.snapshot?.()}))}),destroy};
}
