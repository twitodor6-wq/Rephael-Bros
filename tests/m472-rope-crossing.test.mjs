// M473: historical layout scenarios use immutable s01.m472.rollback.json; new layout tested separately.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {validateRopeCrossingSafety as validate,assertRopeCrossingGate} from '../src/validation/rope-crossing-safety.mjs';
const stage=JSON.parse(readFileSync(new URL('../stages/s01.m472.rollback.json',import.meta.url)));
const compiled=(()=>{const scope={};vm.createContext(scope);vm.runInContext(readFileSync(new URL('../src/stage-loader.mjs',import.meta.url),'utf8')+';this.compile=compileStageV1;this.validateStage=validateStageV1',scope);return scope})();
const hitboxes=[{id:'rafi',width:28,height:64},{id:'shaul',width:28,height:74}];
function setup(){const s=compiled.compile(stage);return {source:'node-fixture',world:stage.world,
 surfaces:[{id:'legacy-ground-0',x:70,y:490,w:300,h:170},{id:'legacy-ground-1',x:706,y:490,w:270,h:170},...stage.world.forestExtension.surfaces],
 anchors:[{id:'legacy-tape-0',x:514,y:290,active:true,strength:'unknown'},...s.anchors.anchors.map(a=>({...a,active:true}))],
 profiles:hitboxes,tape:{maxLength:425},crossings:stage.ropeCrossings};}
const deep=x=>structuredClone(x);
test('both real pit geometries and both profiles statically safe',()=>{
 const report=validate(setup());assert.equal(report.status,'PASS',JSON.stringify(report));
 assert.equal(report.crossings.length,2);for(const c of report.crossings)assert.equal(c.checks.filter(v=>v.code==='REEL_SWEEP_CLEAR').length,4);
});
test('M471 original 1275 fails swept geometry; M4711 1230 passes',()=>{
 const original=setup();original.anchors.find(a=>a.id==='stable-root-extension').x=1275;
 const bad=validate(original);assert.equal(bad.status,'FAIL');assert.ok(bad.crossings.find(c=>c.id==='forest-gap-02').checks.some(c=>c.code==='REEL_SWEEP_BLOCKED'&&c.side==='right'));
 assert.throws(()=>assertRopeCrossingGate(bad),/QA gate/);
 assert.equal(validate(setup()).status,'PASS');
});
test('stage reference schema rejects mismatched, duplicate and missing links',()=>{
 for(const fn of [
  s=>s.ropeCrossings[0].anchorId='unknown',
  s=>s.ropeCrossings[0].rightSurfaceId='does-not-exist',
  s=>s.ropeCrossings.push(deep(s.ropeCrossings[0])),
  s=>s.ropeCrossings[0].leftSurfaceId=s.ropeCrossings[0].rightSurfaceId,
  s=>s.ropeCrossings[0].coordinates={x:1230,y:260}
 ]){const s=deep(stage);fn(s);assert.equal(compiled.validateStage(s).ok,false);}
});
test('mutation of stage anchor x changes findings without changing JS',()=>{
 for(const [x,status] of [[1230,'PASS'],[1275,'FAIL'],[1200,'FAIL']]){
  const s=deep(stage);s.objects.find(o=>o.id==='stable-root-extension').position.x=x;
  const anchors=compiled.compile(s).anchors.anchors;
  const snapshot=setup();snapshot.anchors=anchors;
  assert.equal(validate(snapshot).crossings.find(c=>c.id==='forest-gap-02').status,status,`x=${x}`);
 }
});
test('two additional JSON gap layouts validate with the same code',()=>{
 for(const name of ['a','b']){
  const snapshot=JSON.parse(readFileSync(new URL(`../stages/fixtures/m472-${name}.json`,import.meta.url)));
  assert.equal(validate(snapshot).status,'PASS',name);
 }
});
test('above-bank anchor can be safe on an elevated traversable approach',()=>{
 const snapshot={world:{width:900,height:660},surfaces:[{id:'left',x:0,y:490,w:210,h:170},{id:'right',x:310,y:490,w:590,h:170}],anchors:[{id:'tree-above-right',x:335,y:140,active:true}],profiles:[{id:'elevated',width:20,height:30}],tape:{maxLength:425},crossings:[{id:'bank-hook',leftSurfaceId:'left',rightSurfaceId:'right',anchorId:'tree-above-right',probes:{elevated:[{side:'left',x:230,y:340},{side:'right',x:295,y:340}]}}]};
 assert.equal(validate(snapshot).status,'PASS');
});
test('no ground and missing hitbox never claim PASS',()=>{
 const s=setup();s.surfaces=[];assert.equal(validate(s).status,'NOT TESTED');
 const s2=setup();s2.profiles=[];assert.equal(validate(s2).status,'NOT TESTED');
 assert.throws(()=>assertRopeCrossingGate(validate(s2)),/QA gate/);
});
test('fragile anchor produces a warning, disabled anchor is not tested',()=>{
 const fragile=setup();fragile.anchors.find(a=>a.id==='stable-root-extension').strength='fragile';assert.equal(validate(fragile).status,'WARN');
 const disabled=setup();disabled.anchors.find(a=>a.id==='stable-root-extension').active=false;assert.equal(validate(disabled).status,'NOT TESTED');
});
test('dynamic collider inserted into reel trajectory triggers failure',()=>{
 const s=setup();s.surfaces.push({id:'obstacle',x:1224,y:520,w:12,h:33});assert.equal(validate(s).status,'FAIL');
});
test('profile width changes clearance and safety result',()=>{
 const s=setup();s.profiles=[{id:'oversize',width:100,height:64}];assert.equal(validate(s).status,'FAIL');
});
