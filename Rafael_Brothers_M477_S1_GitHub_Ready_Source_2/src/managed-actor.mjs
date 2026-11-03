/** M4.6.8: engine-neutral ownership; adapters use public Phaser APIs only. */
function createRBResourceScope(){
 const entries=[],errors=[];let enabled=true,destroyed=false;
 function run(fn){try{fn?.();}catch(e){errors.push(String(e?.message||e));}}
 function own(dispose,toggle){
  if(destroyed)throw Error('Resource scope is destroyed');
  const entry={dispose,toggle};entries.push(entry);
  if(!enabled&&toggle)toggle(false);return entry;
 }
 const scope={
  reportError(e){errors.push(String(e?.message||e));},
  defer(fn){own(fn);return fn;},
  resource(value,dispose,toggle){own(()=>dispose(value),toggle?on=>toggle(value,on):null);return value;},
  gameObject(o){const visible=o.visible!==false;return scope.resource(o,v=>v.destroy(),(v,on)=>v.setVisible(on&&visible));},
  body(b,{destroy=false}={}){const initial=b.enable!==false;return scope.resource(b,v=>{v.enable=false;if(destroy)v.destroy();},(v,on)=>{v.enable=on&&initial;});},
  collider(c){const initial=c.active!==false;return scope.resource(c,v=>v.destroy(),(v,on)=>{v.active=on&&initial;});},
  listen(emitter,event,fn,{whileDisabled=false}={}){
   let listening=false;
   const toggle=on=>{if(on&&!listening){emitter.on(event,fn);listening=true;}else if(!on&&listening){emitter.off(event,fn);listening=false;}};
   own(()=>toggle(false),whileDisabled?null:toggle);toggle(enabled||whileDisabled);return fn;
  },
  timer(timer){const paused=!!timer.paused;return scope.resource(timer,t=>t.remove(false),(t,on)=>{t.paused=!on||paused;});},
  anchor(list,ref,release){
   const toggle=on=>{if(on){if(!list.includes(ref))list.push(ref);}else{try{release?.(ref);}finally{let i;while((i=list.indexOf(ref))>=0)list.splice(i,1);}}};
   own(()=>toggle(false),toggle);toggle(enabled);return ref;
  },
  reference(holder,key,value){holder[key]=value;own(()=>{if(holder[key]===value)holder[key]=null;});return value;},
  binding(stage,type,id,value){const toggle=on=>{if(on)stage.bindRuntime(type,id,value);else stage.unbindRuntime(type,id,value);};own(()=>toggle(false),toggle);toggle(enabled);return value;},
  setEnabled(on){if(destroyed)return false;on=!!on;if(enabled===on)return false;enabled=on;for(const e of entries)run(()=>e.toggle?.(on));return true;},
  destroy(){if(destroyed)return false;destroyed=true;enabled=false;for(const e of entries.splice(0).reverse())run(e.dispose);return true;},
  snapshot:()=>({enabled,destroyed,resources:entries.length,errors:errors.slice()})
 };return scope;
}
function createRBManagedActor({id,scene,create,update,enabled=()=>true,sync,onState,onReset,onDisable,onDestroy,stateProperty='state',sceneLifecycle=true}){
 const scope=createRBResourceScope();let state='creating',manualDisabled=false,runtime;
 const transition=next=>{if(state===next)return;state=next;try{onState?.(id,next);}catch(e){scope.reportError(e);}};
 const apply=()=>{const on=!manualDisabled&&enabled()!==false;scope.setEnabled(on);transition(on?'created':'disabled');return on;};
 try{
  runtime=create(scope)||{};
  Object.defineProperty(runtime,stateProperty,{get:()=>state});
  Object.assign(runtime,{
   managedActor:true,id,scope,
   create(){return state==='destroyed'?false:runtime;},
   update(...args){if(state==='destroyed')return false;sync?.();if(apply())update?.(...args);return true;},
   disable(){if(state==='destroyed')return false;manualDisabled=true;apply();try{onDisable?.();}catch(e){scope.reportError(e);}return true;},
   reset(){if(state==='destroyed')return false;manualDisabled=false;try{onReset?.();}catch(e){scope.reportError(e);}sync?.();apply();return true;},
   destroy(){if(state==='destroyed')return false;transition('destroyed');try{onDestroy?.();}catch(e){scope.reportError(e);}scope.destroy();return true;},
   lifecycleSnapshot:()=>({id,state,...scope.snapshot()})
  });
  scope.listen(scene.events,'postupdate',(...args)=>runtime.update(...args),{whileDisabled:true});
  if(sceneLifecycle){scope.listen(scene.events,'shutdown',()=>runtime.destroy(),{whileDisabled:true});
   scope.listen(scene.events,'destroy',()=>runtime.destroy(),{whileDisabled:true});}
  sync?.();apply();return runtime;
 }catch(e){scope.destroy();throw e;}
}
