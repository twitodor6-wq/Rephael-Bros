// M473: historical layout scenarios use immutable s01.m472.rollback.json; new layout tested separately.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const file=p=>readFileSync(new URL('../'+p,import.meta.url));
const sha=p=>createHash('sha256').update(file(p)).digest('hex');
const stage=JSON.parse(file('stages/s01.m472.rollback.json'));
const rollback=JSON.parse(file('stages/s01.m470.rollback.json'));
const sandbox={};vm.createContext(sandbox);vm.runInContext(file('src/stage-loader.mjs').toString()+';this.validate=validateStageV1;this.compile=compileStageV1;',sandbox);
const copy=()=>structuredClone(stage);
test('M471 original Stage01 and tape baseline are byte-preserved with immutable rollback',()=>{
 assert.equal(sha('stages/s01.m470.rollback.json'),sha('archive/M469_source_immutable/stages/s01.stage.json'));
 assert.equal(sha('baseline/M46_RELEASE.html'),sha('archive/M469_source_immutable/baseline/M46_RELEASE.html'));
 assert.equal(rollback.world.width,976);assert.equal(stage.world.terrain,undefined);
});
test('forest grows eastward with only extension colliders joining legacy ground',()=>{
 assert.equal(stage.world.width,1800);assert.equal(stage.world.forestExtension.joinX,976);
 assert.deepEqual(stage.world.forestExtension.surfaces.map(x=>[x.x,x.w,x.y]),[[976,214,490],[1270,510,490]]);
 assert.equal(stage.world.forestExtension.surfaces[1].x-(976+214),80);
});
test('Stage v1 compiler exposes world extension and authored finish without mutating Game core',()=>{
 assert.equal(sandbox.validate(stage).ok,true);
 const s=sandbox.compile(stage);
 assert.equal(s.forestExtension.surfaces.length,2);
 assert.equal(s.config('exit-grove','forest-exit-grove').endX,1740);
 assert.equal(s.anchors.anchors.at(-1).id,'stable-root-extension');
});
test('branch fully aligns with pit but cannot bridge all of it',()=>{
 const s=sandbox.compile(stage),t=s.config('falling-bridge-tree','fallen-bridge-tree');
 assert.equal(t.bridge.x,t.pit.left);assert.ok(t.bridge.x+t.bridge.w<t.pit.right);
 assert.ok(t.stub.x+t.stub.w<t.pit.left);assert.equal(t.anchor.x,300);
});
test('mutating authored branch x moves anchor, platform and stub together',()=>{
 const s=copy();s.objects.find(o=>o.id==='fallen-bridge-tree').position.x+=6;
 assert.equal(sandbox.validate(s).ok,true);
 const c=sandbox.compile(s),t=c.config('falling-bridge-tree','fallen-bridge-tree');
 assert.equal(c.anchors.anchors.find(a=>a.id==='fallen-bridge-tree').x,306);
 assert.equal(t.stub.x,306);assert.equal(t.bridge.x,376);
});
test('two independent JSON mutations move portal and extension stable hook',()=>{
 const s=copy();s.objects.find(x=>x.id==='forest-exit-grove').position.x-=40;
 s.objects.find(x=>x.id==='stable-root-extension').position.x-=20;
 assert.equal(sandbox.validate(s).ok,true);
 const c=sandbox.compile(s);assert.equal(c.config('exit-grove','forest-exit-grove').gateX,1670);
 assert.equal(c.anchors.anchors.at(-1).x,1210);
});
test('extension rejects overlap, out-of-bounds and invalid join',()=>{
 for(const change of [s=>s.world.forestExtension.surfaces[1].x=1180,s=>s.world.forestExtension.surfaces[0].x=980,s=>s.world.forestExtension.surfaces[0].w=10000]){
  const s=copy();change(s);assert.equal(sandbox.validate(s).ok,false);
 }
});
test('branch safety rejects complete overpit bypass, missing source and unsafe bank',()=>{
 for(const change of [s=>s.objects.find(o=>o.id==='fallen-bridge-tree').properties.bridgeSize.w=250,s=>s.objects.find(o=>o.id==='fallen-bridge-tree').position.x+=20,s=>s.objects.find(o=>o.id==='fallen-bridge-tree').properties.pitSource='unknown']){
  const s=copy();change(s);assert.equal(sandbox.validate(s).ok,false);
 }
});

test('M4711 second gap is validated through Stage JSON semantic surface refs',async()=>{
 const {validateRopeCrossingSafety}=await import('../src/validation/rope-crossing-safety.mjs');
 const compiled=sandbox.compile(stage);
 const report=validateRopeCrossingSafety({world:stage.world,
  surfaces:stage.world.forestExtension.surfaces,
  anchors:compiled.anchors.anchors,profiles:[{id:'test-hitbox',width:28,height:64}],
  tape:{maxLength:425},crossings:stage.ropeCrossings});
 assert.equal(report.status,'PASS',JSON.stringify(report));
});
