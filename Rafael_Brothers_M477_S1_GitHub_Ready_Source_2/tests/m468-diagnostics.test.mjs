import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
test('diagnostics combine original telemetry with bounded stage-tagged lifecycle and module flags',()=>{
 const c=vm.createContext({});vm.runInContext(readFileSync(new URL('../src/scene-composer.mjs',import.meta.url),'utf8')+';this.factory=createRBSceneComposer',c);
 const original={events:[{type:'input'}]},w={__RBStageV1:{stageId:'s01'},__RB_STAGE_MODULE_CONFIG:{modules:[{id:'bridge',flag:'bridgeOn'}]},bridgeOn:false,__RBTelemetry:{snapshot:()=>original}};
 const a=c.factory(w);for(let i=0;i<100;i++)a.recordState('bridge-polish','disabled');
 const d=a.diagnostics();assert.equal(d.telemetry,original);assert.equal(d.lifecycle.stageId,'s01');assert.equal(d.lifecycle.transitions.length,64);assert.equal(d.modules[0].enabled,false);assert.equal(original.lifecycle,undefined);
});
