import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
for(const f of ['stage-modules.mjs','bridge-polish.mjs','stage-dressing.mjs','rotten-root.mjs']){
  test('script syntax '+f,()=>{new vm.Script(readFileSync(new URL('src/'+f,root),'utf8'));});
}
test('stage panel now includes active rotten root toggle',()=>{
  const s=readFileSync(new URL('stages/s01.modules.json',root),'utf8');
  for(const id of ['rb-m42-art-toggle','rb-m44-web-toggle','rb-m45-egg-toggle','rb-m46-parallax-toggle','rb-m46-bridges-toggle','rb-m46-ambience-toggle','rb-m461-dressing-toggle','rb-m462-rotten-toggle']) assert.ok(s.includes(id),id);
  assert.ok(s.includes('"state": "active"'));
});
test('rotten helpers behave deterministically',()=>{
  const s=readFileSync(new URL('src/rotten-root.mjs',root),'utf8');
  const sandbox={globalThis:{}}; vm.createContext(sandbox); vm.runInContext(s+';this.chk1=rottenPointInRect({x:5,y:5},{x:0,y:0,w:10,h:10});this.chk2=rottenPointInRect({x:11,y:5},{x:0,y:0,w:10,h:10});',sandbox);
  assert.equal(sandbox.chk1,true); assert.equal(sandbox.chk2,false); const stage=JSON.parse(readFileSync(new URL('stages/s01.stage.json',root)));const cfg=stage.objects.find(o=>o.prefab==='rotten-root').properties;assert.equal(cfg.warningMs,1800); assert.ok(cfg.tensionRatio>.9);
});
test('build output includes rotten root sidecar ids',()=>{
  const html=readFileSync(new URL('dist/Rafael_Brothers_M462_ROTTEN_ROOT_ANCHOR.html',root),'utf8');
  assert.ok(html.includes('id="rb-m462-stage-config"'));
  assert.ok(html.includes('id="rb-m462-3"'));
  assert.ok(html.includes('M4.6.2 — Rotten Root & Environmental Anchor · experimental'));
});
