/* Engine-neutral M469 experiment. Intentionally no imports/exports for inline use. */
function rbTransitionCopyJSON(value, path = 'data', seen = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'object' || seen.has(value)) throw new Error(path + ': expected finite, acyclic plain JSON');
  const proto = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && proto !== null && (Object.getPrototypeOf(proto) !== null || !Object.prototype.hasOwnProperty.call(proto, 'constructor') || proto.constructor.name !== 'Object')) throw new Error(path + ': runtime/class object prohibited');
  if (Array.isArray(value) && (!proto || !Object.prototype.hasOwnProperty.call(proto, 'constructor') || proto.constructor.name !== 'Array')) throw new Error(path + ': array subclass prohibited');
  seen.add(value);
  if (Object.getOwnPropertySymbols(value).length) throw new Error(path + ': symbol keys prohibited');
  const result = Array.isArray(value) ? [] : Object.create(null);
  for (const key of Object.getOwnPropertyNames(value)) {
    if (Array.isArray(value) && key === 'length') continue;
    if (key === '__proto__' || key === 'prototype' || key === 'constructor') throw new Error(path + ': unsafe key');
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor.enumerable || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) throw new Error(path + ': accessor/non-JSON property');
    if (Array.isArray(value) && (!/^(0|[1-9][0-9]*)$/.test(key) || +key >= value.length)) throw new Error(path + ': array property');
    result[key] = rbTransitionCopyJSON(descriptor.value, path + '.' + key, seen);
  }
  if (Array.isArray(value) && Object.keys(result).length !== value.length) throw new Error(path + ': sparse array');
  seen.delete(value);
  return Object.freeze(result);
}
function rbValidateTransitionData(data, prefabs, assets) {
  const object = (v, allowed, required, path) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error(path + ': expected object');
    for (const key of Object.keys(v)) if (!allowed.includes(key)) throw new Error(path + ': unexpected ' + key);
    for (const key of required) if (!Object.prototype.hasOwnProperty.call(v, key)) throw new Error(path + ': missing ' + key);
  };
  const id = (v, path) => { if (typeof v !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(v)) throw new Error(path + ': invalid ID'); };
  const point = (v, path) => {object(v,['x','y'],['x','y'],path);for(const k of ['x','y'])if(typeof v[k]!=='number'||!Number.isFinite(v[k]))throw new Error(path+': invalid coordinate');};
  const rectangle = (v,path) => {object(v,['x','y','width','height'],['x','y','width','height'],path);for(const k of ['x','y','width','height'])if(typeof v[k]!=='number'||!Number.isFinite(v[k]))throw new Error(path+': invalid bounds');if(v.width<=0||v.height<=0)throw new Error(path+': nonpositive bounds');};
  object(data,['schemaVersion','stageId','world','spawn','exit','camera','assets','objects'],['schemaVersion','stageId','world','spawn','exit','assets','objects'],'stage');
  if(data.schemaVersion!=='1.0.0')throw new Error('stage: unsupported schemaVersion');
  id(data.stageId,'stageId');rectangle(data.world,'world');
  const within = (p,path) => {const w=data.world;if(p.x<w.x||p.y<w.y||p.x>w.x+w.width||p.y>w.y+w.height)throw new Error(path+': outside world');};
  point(data.spawn,'spawn');within(data.spawn,'spawn');point(data.exit,'exit');within(data.exit,'exit');
  if(Object.prototype.hasOwnProperty.call(data,'camera')){object(data.camera,['bounds'],['bounds'],'camera');rectangle(data.camera.bounds,'camera.bounds');within(data.camera.bounds,'camera.bounds');within({x:data.camera.bounds.x+data.camera.bounds.width,y:data.camera.bounds.y+data.camera.bounds.height},'camera.bounds');}
  if(!Array.isArray(data.assets)||!Array.isArray(data.objects))throw new Error('stage: expected arrays');
  const assetIDs=new Set();for(const a of data.assets){id(a,'asset');if(assetIDs.has(a)||!assets.has(a))throw new Error('duplicate or unavailable asset: '+a);assetIDs.add(a);}
  const ids=new Set();for(const o of data.objects){object(o,['id','prefab','x','y','asset'],['id','prefab','x','y'],'object');id(o.id,'object.id');id(o.prefab,'object.prefab');if(ids.has(o.id))throw new Error('duplicate object ID: '+o.id);ids.add(o.id);if(!prefabs.has(o.prefab))throw new Error('unavailable prefab: '+o.prefab);point({x:o.x,y:o.y},'object position');within(o,'object');if(o.asset!==undefined&&(!assets.has(o.asset)||!assetIDs.has(o.asset)))throw new Error('undeclared or unavailable object asset');}
}
function rbValidateTransitionSession(session) {
  const keys=Object.keys(session);
  if(keys.length!==4||!['schemaVersion','characterId','gear','progress'].every(k=>keys.includes(k)))throw new Error('session: unexpected or missing field');
  if(session.schemaVersion!=='1.0.0'||!['rafi','shaul'].includes(session.characterId))throw new Error('session: invalid version/character');
  if(!Array.isArray(session.gear)||session.gear.some(v=>typeof v!=='string')||new Set(session.gear).size!==session.gear.length)throw new Error('session: gear must be unique strings');
  if(!session.progress||typeof session.progress!=='object'||Array.isArray(session.progress))throw new Error('session: progress must be object');
  const whitelist=['visited','checkpoints','flags','counters','completedStageIds','collectibles'];
  if(Object.keys(session.progress).some(k=>!whitelist.includes(k)))throw new Error('session: unexpected progress field');
}
function createRBTransitionController({adapter,availablePrefabs=[],availableAssets=[]}) {
  for(const hook of ['prepareAssets','releaseTape','unload','load','dispose'])if(typeof adapter?.[hook]!=='function')throw new Error('adapter missing '+hook);
  const prefabs=new Set(availablePrefabs),assets=new Set(availableAssets),tokens=new WeakMap(),seenHandles=new WeakSet();
  let busy=false,epoch=0,status='idle',current=null;
  const events=[];
  const event=(type,stageId,detail)=>{events.push(Object.freeze({type,stageId:stageId??null,epoch,...(detail?{detail:String(detail)}:{})}));if(events.length>64)events.shift();};
  async function prepare(data,session){
    if(busy)throw new Error('transition controller busy');busy=true;
    try{
      const frozenData=rbTransitionCopyJSON(data),frozenSession=rbTransitionCopyJSON(session);
      rbValidateTransitionData(frozenData,prefabs,assets);rbValidateTransitionSession(frozenSession);
      event('preparing',frozenData.stageId);
      await adapter.prepareAssets(frozenData.assets,frozenData,frozenSession);
      const token=Object.freeze({stageId:frozenData.stageId});tokens.set(token,{data:frozenData,session:frozenSession,used:false});event('prepared',frozenData.stageId);return token;
    }finally{busy=false;}
  }
  async function transition(prepared){
    if(busy)throw new Error('transition controller busy');
    const candidate=tokens.get(prepared);if(!candidate||candidate.used)throw new Error('invalid or consumed prepared token');candidate.used=true;
    busy=true;epoch++;const previous=current;let teardown=false;
    const disposed=new Set();
    async function dispose(handle){if(handle!=null&&!disposed.has(handle)){disposed.add(handle);await adapter.dispose(handle);}}
    async function load(record){
      const partials=new Set();let handle;
      try{handle=await adapter.load(record.data,record.session,h=>{if(h!=null)partials.add(h);});if(handle===null||(typeof handle!=='object'&&typeof handle!=='function'))throw new Error('load must return a fresh object handle');if(seenHandles.has(handle))throw new Error('load returned reused/dead handle');seenHandles.add(handle);for(const p of partials)if(p!==handle)await dispose(p);return {...record,handle};}
      catch(error){const cleanup=[];for(const p of partials)try{await dispose(p);}catch(e){cleanup.push(String(e));}if(handle!=null)try{await dispose(handle);}catch(e){cleanup.push(String(e));}if(cleanup.length)throw new Error(String(error)+'; partial cleanup failed: '+cleanup.join('; '));throw error;}
    }
    try{
      status='transitioning';
      if(previous){event('releaseTape',previous.data.stageId);await adapter.releaseTape(previous.handle);teardown=true;current=null;event('unload',previous.data.stageId);await adapter.unload(previous.handle);await dispose(previous.handle);}
      event('load',candidate.data.stageId);current=await load(candidate);status='ready';event('ready',current.data.stageId);
    }catch(error){
      event('transitionFailed',candidate.data.stageId,error);
      if(previous&&!teardown){current=previous;status='ready';throw error;}
      current=null;
      if(previous){
        try{await dispose(previous.handle);event('rollback',previous.data.stageId);current=await load(previous);status='ready';event('rolledBack',current.data.stageId);}
        catch(rollbackError){current=null;status='failed';event('rollbackFailed',previous.data.stageId,rollbackError);throw new Error('transition failed: '+String(error)+'; rollback failed: '+String(rollbackError));}
      }else status='failed';
      throw error;
    }finally{busy=false;}
    return snapshot();
  }
  function snapshot(){return Object.freeze({status,busy,stageId:current?.data.stageId??null,epoch,events:Object.freeze(events.slice())});}
  return Object.freeze({prepare,transition,snapshot});
}
