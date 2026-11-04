// M473: historical layout scenarios use immutable s01.m472.rollback.json; new layout tested separately.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const src=readFileSync(new URL('src/stage-loader.mjs',root),'utf8');
const stage=JSON.parse(readFileSync(new URL('stages/s01.m472.rollback.json',root),'utf8'));
const box={};vm.createContext(box);vm.runInContext(src+';this.api={validateStageV1,compileStageV1,installStageLoader};',box);
const clone=()=>structuredClone(stage), valid=x=>box.api.validateStageV1(x).ok;

test('M466 stage compiles five prefab families with linked single-source branch hook',()=>{
 const s=box.api.compileStageV1(stage);
 assert.equal(s.types.length,8);
 const tree=s.config('falling-bridge-tree','fallen-bridge-tree');
 const meta=s.anchors.anchors.find(a=>a.id==='fallen-bridge-tree');
 assert.equal(tree.anchor.x,meta.x);assert.equal(tree.anchor.y,meta.y);
 assert.equal(tree.bridge.x,370);assert.equal(tree.stub.x,300);
 assert.equal(s.config('exit-grove','forest-exit-grove').endX,1740);
});
test('shifting branch prefab moves hook, branch and collision with one position edit',()=>{
 const s=clone();s.objects.find(o=>o.id==='fallen-bridge-tree').position.x+=6;
 assert.equal(valid(s),true);
 const c=box.api.compileStageV1(s),f=c.config('falling-bridge-tree','fallen-bridge-tree');
 assert.equal(c.anchors.anchors.find(a=>a.id==='fallen-bridge-tree').x,306);
 assert.equal(f.stub.x,306);assert.equal(f.bridge.x,376);
});
test('reject branch that would bypass tape gap or lose pit source',()=>{
 let s=clone();s.objects.find(o=>o.id==='fallen-bridge-tree').position.x+=20;
 assert.equal(valid(s),false);
 s=clone();s.objects.find(o=>o.id==='fallen-bridge-tree').properties.pitSource='ghost';assert.equal(valid(s),false);
 s=clone();s.objects.find(o=>o.id==='fallen-bridge-tree').properties.anchor.strength='stable';assert.equal(valid(s),false);
});
test('reject exit before rotten ledge, outside world, or missing referenced ledge',()=>{
 let s=clone();s.objects.find(o=>o.prefab==='exit-grove').position.x=850;assert.equal(valid(s),false);
 s=clone();s.objects.find(o=>o.prefab==='exit-grove').position.x=stage.world.width-15;assert.equal(valid(s),false);
 s=clone();s.objects.find(o=>o.prefab==='exit-grove').properties.requiresRottenLedge='ghost';assert.equal(valid(s),false);
});
test('runtime can conditionally unbind a destroyed prefab without clearing others',()=>{
 const runtime=box.api.installStageLoader({__RB_STAGE_V1_DATA:clone()});
 const a={},b={};runtime.bindRuntime('falling-bridge-tree','fallen-bridge-tree',a);
 runtime.bindRuntime('exit-grove','forest-exit-grove',b);
 assert.equal(runtime.unbindRuntime('falling-bridge-tree','fallen-bridge-tree',b),false);
 assert.equal(runtime.unbindRuntime('falling-bridge-tree','fallen-bridge-tree',a),true);
 assert.equal(runtime.snapshot().instances.find(x=>x.id==='forest-exit-grove').bound,true);
 assert.equal(runtime.snapshot().instances.find(x=>x.id==='fallen-bridge-tree').bound,false);
});
