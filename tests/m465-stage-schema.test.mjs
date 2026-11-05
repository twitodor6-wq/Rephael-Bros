// M473: historical layout scenarios use immutable s01.m472.rollback.json; new layout tested separately.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const src=readFileSync(new URL('src/stage-loader.mjs',root),'utf8');
const stage=JSON.parse(readFileSync(new URL('stages/s01.m472.rollback.json',root),'utf8'));
const ctx={};vm.createContext(ctx);vm.runInContext(src+';this.api={validateStageV1,compileStageV1,installStageLoader};',ctx);
const run=(s)=>ctx.api.validateStageV1(s);
const copy=()=>structuredClone(stage);
test('unified Stage 01 JSON validated and three prefab factories present',()=>{
 assert.equal(run(stage).ok,true,run(stage).errors?.join('; '));
 const c=ctx.api.compileStageV1(stage);
 assert.deepEqual([...c.types].sort(),['ceiling-spider','collapsing-platform','egg-sac','environmental-anchor','exit-grove','falling-bridge-tree','root-bridge','rotten-root','sticky-web']);
 assert.equal(c.anchors.anchors.length,5);
 assert.equal(c.modules.modules.length,stage.modules.length);
 assert.equal(c.config('rotten-root','rotten-root-ledge').anchor.x,920);
});
test('schema rejects duplicate stable object ids, missing actors and reference errors',()=>{
 let s=copy();s.objects[1].id=s.objects[0].id;assert.equal(run(s).ok,false);
 s=copy();s.objects=s.objects.filter(o=>o.prefab!=='root-bridge');assert.equal(run(s).ok,false);
 s=copy();s.objects.find(o=>o.prefab==='rotten-root').properties.anchorId='ghost';assert.equal(run(s).ok,false);
 s=copy();s.schemaVersion='999';assert.equal(run(s).ok,false);
});
test('schema rejects unsafe moved root bridge and unbounded prefabs',()=>{
 let s=copy();s.objects.find(o=>o.prefab==='root-bridge').position.x=400;assert.equal(run(s).ok,false);
 s=copy();s.objects.find(o=>o.prefab==='environmental-anchor').position.x=Infinity;assert.equal(run(s).ok,false);
});
test('compiled changes propagate through anchor registry and two actor configurations',()=>{
 const s=copy();s.objects.find(o=>o.id==='stable-tree-start').position.x=126;
 s.objects.find(o=>o.prefab==='root-bridge').position.x=728;
 s.objects.find(o=>o.prefab==='rotten-root').position.x=862;
 s.objects.find(o=>o.id==='rotten-root').position.x=915;
 s.objects.find(o=>o.prefab==='exit-grove').position.x=920;
 const c=ctx.api.compileStageV1(s);
 assert.equal(c.anchors.anchors.find(a=>a.id==='stable-tree-start').x,126);
 assert.equal(c.config('root-bridge','living-root-shelf').shelf.x,728);
 assert.equal(c.config('rotten-root','rotten-root-ledge').ledge.x,862);
 assert.equal(c.config('rotten-root','rotten-root-ledge').anchor.x,915);
});
test('runtime prefab binding registers types, preserves single reference per id',()=>{
 const win={__RB_STAGE_V1_DATA:copy()};const runtime=ctx.api.installStageLoader(win);
 const actor={id:'test'};
 runtime.bindRuntime('root-bridge','living-root-shelf',actor);
 runtime.bindRuntime('root-bridge','living-root-shelf',actor);
 assert.equal(runtime.snapshot().instances.filter(i=>i.bound).length,1);
 assert.throws(()=>runtime.bindRuntime('root-bridge','stable-tree-start',actor));
 runtime.clearRuntime();assert.equal(runtime.snapshot().instances.some(x=>x.bound),false);
});
