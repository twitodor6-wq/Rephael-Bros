import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const url=new URL('../',import.meta.url);
const src=readFileSync(new URL('src/environmental-anchors.mjs',url),'utf8');
function sandbox(){const s={};vm.createContext(s);vm.runInContext(src+';this.validate=validateEnvironmentalAnchors;this.desired=resolveAnchorDesired;',s);return s;}
const cfg=JSON.parse(readFileSync(new URL('stages/s01.anchors.json',url)));
test('three authored environmental anchors with distinct profiles',()=>{
  assert.equal(cfg.schema,'rafael-stage-anchors/v1');assert.equal(cfg.stage,'s01');
  assert.deepEqual(cfg.anchors.map(a=>a.id),['stable-tree-start','stable-root-bridge','rotten-root','fallen-bridge-tree','stable-root-extension','combine-rescue-anchor']);
  assert.deepEqual(cfg.anchors.map(a=>a.strength),['stable','stable','fragile','fragile','stable','stable']);
  assert.deepEqual(cfg.anchors.map(a=>a.collapseOutcome),['none','none','fallen-log','bridge-fragment','none','none']);
});
test('valid registry passes and invalid duplicate ID fails',()=>{
  const {validate}=sandbox();assert.equal(validate(cfg),true);
  const dup=structuredClone(cfg);dup.anchors[1].id=dup.anchors[0].id;assert.equal(validate(dup),false);
});
test('registry rejects duplicate coordinates and invalid world bounds',()=>{
  const {validate}=sandbox();const dup=structuredClone(cfg);dup.anchors[1].x=dup.anchors[0].x;dup.anchors[1].y=dup.anchors[0].y;assert.equal(validate(dup),false);
  const bounds=structuredClone(cfg);bounds.anchors[0].x=10000;assert.equal(validate(bounds),false);
});
test('registry only accepts stable strength with none outcome',()=>{
  const {validate}=sandbox();const mutated=structuredClone(cfg);mutated.anchors[0].collapseOutcome='break';assert.equal(validate(mutated),false);
});
test('strength and outcome enums refuse unknown values',()=>{
  const {validate}=sandbox();const bad=structuredClone(cfg);bad.anchors[0].strength='infinite';assert.equal(validate(bad),false);
  const outcome=structuredClone(cfg);outcome.anchors[2].collapseOutcome='explode';assert.equal(validate(outcome),false);
});
test('stable tree independent of other feature flags',()=>{
  const {desired}=sandbox();assert.equal(desired(cfg.anchors[0],{},undefined),true);
  assert.equal(desired(cfg.anchors[0],{},false),false);
});
test('stable bridge follows original bridge feature toggle',()=>{
  const {desired}=sandbox();assert.equal(desired(cfg.anchors[1],{__RBRootBridgesEnabled:true}),true);
  assert.equal(desired(cfg.anchors[1],{__RBRootBridgesEnabled:false}),false);
});
test('fragile root follows existing hazard toggle',()=>{
  const {desired}=sandbox();assert.equal(desired(cfg.anchors[2],{__RBRottenRootEnabled:true}),true);
  assert.equal(desired(cfg.anchors[2],{__RBRottenRootEnabled:false}),false);
});
test('registries stay in same Stage 01',()=>{
  const m=JSON.parse(readFileSync(new URL('stages/s01.modules.json',url)));
  assert.equal(m.stage,cfg.stage);assert.ok(m.modules.find(x=>x.id==='rotten-root'&&x.state==='active'));
  assert.ok(m.modules.find(x=>x.id==='falling-bridge-tree'&&x.state==='active'&&x.defaultOn===true));
});
test('M4.6 baseline, inherited features, new bundle preserved',()=>{
  const text=readFileSync(new URL('dist/Rafael_Brothers_M463_ENVIRONMENTAL_ANCHORS.html',url),'utf8');
  for(const id of ['rb-m46-art-data','rb-m45-egg-sac','rb-m44-sticky-web','rb-m43-ceiling-spider','rb-m463-3','rb-m463-4','rb-m463-5'])assert.ok(text.includes('id="'+id+'"'),id);
});

test('optional falling tree cannot bypass full tape gap',()=>{
  const stage=JSON.parse(readFileSync(new URL('stages/s01.stage.json',url),'utf8'));
  const src=readFileSync(new URL('src/stage-loader.mjs',url),'utf8');const sandbox={};vm.createContext(sandbox);vm.runInContext(src+';this.compile=compileStageV1;',sandbox);
  const c=sandbox.compile(stage).config('falling-bridge-tree','fallen-bridge-tree');
  assert.ok(c.bridge.x+c.bridge.w<=c.pit.right-150);
});
test('falling branch defaults ON for playability and keeps authored anchor',()=>{
  const a=cfg.anchors.find(a=>a.id==='fallen-bridge-tree');assert.equal(a.enabledFlag,'__RBFallingBridgeEnabled');assert.equal(a.collapseOutcome,'bridge-fragment');
});
