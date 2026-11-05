import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = p => fs.readFileSync(new URL('../' + p, import.meta.url),'utf8');
const stage = () => JSON.parse(read('stages/s01.stage.json'));
const loaderContext = vm.createContext({});
vm.runInContext(read('src/stage-loader.mjs') + ';this.api={validateStageV1,compileStageV1};',loaderContext);
const {validateStageV1,compileStageV1} = loaderContext.api;
const legacyHtml = read('baseline/M46_RELEASE.html');
const legacy = legacyHtml.match(/<script id="rb-m44-sticky-web">([\s\S]*?)<\/script>/)?.[1];
const current = read('src/sticky-web.mjs');
const historicalModel = legacy.slice(legacy.indexOf('const STICKY_WEB_CONFIG'),legacy.indexOf('function installStickyWeb'));
const currentModel = current.slice(current.indexOf('const STICKY_WEB_CONFIG'),current.indexOf('  function createView(scene, cfg)'));

const expected = {id:'sticky-web-launch-left',x:86,y:402,w:38,h:86,
 speedCap:81,holdToTrapSeconds:.70,directionalEscapeSeconds:.62,
 maxTrapSeconds:2.1,recoverySeconds:1.55,cutRecoverySeconds:3,swingDragPerSecond:1.45};

test('Stage 01 web is authored JSON with the original geometry and tuning',()=>{
 const s=stage(),obj=s.objects.filter(x=>x.prefab==='sticky-web');
 assert.equal(obj.length,1);
 assert.equal(validateStageV1(s).ok,true);
 const compiled=compileStageV1(s).config('sticky-web',expected.id);
 assert.equal(JSON.stringify(compiled),JSON.stringify(expected));
});

test('historical pure sticky state machine stays byte-identical',()=>{
 assert.ok(legacy && legacy.length>10000);
 assert.equal(currentModel.trimEnd(),historicalModel.trimEnd());
 const old=vm.createContext({}),now=vm.createContext({});
 vm.runInContext(historicalModel+';this.api={createStickyWeb,stepStickyWeb,cutStickyWeb,resetStickyWeb,STICKY_WEB_CONFIG};',old);
 vm.runInContext(currentModel+';this.api={createStickyWeb,stepStickyWeb,cutStickyWeb,resetStickyWeb,STICKY_WEB_CONFIG};',now);
 const historical=old.api.createStickyWeb(),updated=now.api.createStickyWeb();
 const cfg=compileStageV1(stage()).config('sticky-web',expected.id);
 for(let i=0;i<240;i++){
  const context={touching:i<150,tethered:i>=15&&i<35,moving:i>80&&i<130,enabled:true};
  const a=old.api.stepStickyWeb(historical,1/60,context);
  const b=now.api.stepStickyWeb(updated,1/60,context,cfg);
  assert.equal(JSON.stringify(a),JSON.stringify(b),'event step '+i);
  assert.equal(JSON.stringify(historical),JSON.stringify(updated),'state step '+i);
 }
 assert.equal(now.api.cutStickyWeb(updated,cfg),old.api.cutStickyWeb(historical));
 assert.equal(JSON.stringify(historical),JSON.stringify(updated));
});

test('webs can be absent or placed independently through Stable Stage IDs',()=>{
 const s=stage();
 s.objects=s.objects.filter(x=>x.prefab!=='sticky-web');
 assert.equal(validateStageV1(s).ok,true);
 assert.equal([...compileStageV1(s).instances.values()].filter(x=>x.type==='sticky-web').length,0);
 s.objects.push({...stage().objects.find(x=>x.prefab==='sticky-web'),id:'web-a',position:{x:500,y:350}},
  {...stage().objects.find(x=>x.prefab==='sticky-web'),id:'web-b',position:{x:900,y:300}});
 assert.equal(validateStageV1(s).ok,true);
 const a=compileStageV1(s);
 assert.equal(a.config('sticky-web','web-a').x,500);
 assert.equal(a.config('sticky-web','web-b').y,300);
 assert.equal(a.instances.size,stage().objects.length+1);
});

test('invalid sizing, timings, properties, bounds and duplicate IDs are rejected',()=>{
 const fns=[
  o=>o.properties.size.w=0,o=>o.properties.size.h=-1,
  o=>o.properties.speedCap=-1,o=>o.properties.speedCap=231,
  o=>o.properties.holdToTrapSeconds=NaN,o=>o.properties.maxTrapSeconds=0,
  o=>o.properties.maxTrapSeconds=31,o=>o.properties.swingDragPerSecond=11,
  o=>o.properties.cutRecoverySeconds=Infinity,
  o=>o.properties.surprise=1,o=>delete o.properties.size,
  o=>o.position.x=3010,o=>o.position.y=640,
 ];
 for(const change of fns){const s=stage(),o=s.objects.find(x=>x.prefab==='sticky-web');change(o);assert.equal(validateStageV1(s).ok,false,JSON.stringify(o));}
 const s=stage();s.objects.push({...s.objects.find(x=>x.prefab==='sticky-web')});
 assert.equal(validateStageV1(s).ok,false);
});

test('current build contains one Stage-driven web module, without legacy installer',()=>{
 const html=read('dist/Rafael_Brothers_M477_S4_EGG_SAC_PREFABS.html');
 const match=html.match(/<script id="rb-m44-sticky-web">([\s\S]*?)<\/script>/);
 assert.ok(match);
 assert.match(match[1],/Stage-owned sticky web/);
 assert.doesNotMatch(match[1],/installStickyWeb\(\)/);
 assert.equal((html.match(/function installStickyWeb\(/g)||[]).length,1);
 assert.equal((html.match(/register\('sticky-web-prefabs'/g)||[]).length,1);
 assert.equal((html.match(/register\('enemy-prefabs'/g)||[]).length,1);
 assert.match(html,/sticky-web-launch-left/);
});

test('S2 rollback baseline is preserved exactly',()=>{
 assert.match(read('build-m477-s2.mjs'),/stage-loader\.M477-S2\.mjs/);
 const rollback=JSON.parse(read('stages/s01.m477-s2.rollback.json'));
 assert.equal(rollback.objects.filter(x=>x.prefab==='sticky-web').length,0);
 assert.equal(rollback.objects.filter(x=>x.prefab==='ceiling-spider').length,1);
});
