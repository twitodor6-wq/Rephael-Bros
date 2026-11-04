import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {SPIDER_PLACEMENT,createSpider,advanceSpider} from '../src/ceiling-spider.mjs';
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../src/stage-loader.mjs',import.meta.url),'utf8')+';this.api={compileStageV1,validateStageV1,installStageLoader}',context);
const stage=()=>JSON.parse(fs.readFileSync(new URL('../stages/s01.stage.json',import.meta.url)));
const authored=()=>({id:'test-spider',prefab:'ceiling-spider',position:{x:270,y:108},properties:{attackOffsetY:340,triggerOffset:{x:-93,y:272,w:138,h:145},warnSeconds:.5,descendSpeed:640,ascendSpeed:460,attackWindow:.48,stunSeconds:.4,rearmSeconds:.75,body:{w:52,h:44},knock:{x:280,y:-240},invulnSeconds:1.15,platformOffsetY:382}});
test('JSON spider config exactly preserves legacy simulation and moves all geometry',()=>{
 const s=stage();s.objects=s.objects.filter(o=>o.prefab!=='ceiling-spider');s.objects.push(authored());
 const c=context.api.compileStageV1(s).config('ceiling-spider','test-spider');
 for(const k of ['x','ceilingY','attackY','trigger','warnSeconds','descendSpeed','ascendSpeed','attackWindow','stunSeconds','rearmSeconds','body','knock','invulnSeconds','platformTop'])assert.equal(JSON.stringify(c[k]),JSON.stringify(SPIDER_PLACEMENT[k]),k);
 const a=createSpider(c),b=createSpider();for(let i=0;i<240;i++){const w={playerCenter:{x:250,y:440},playerRect:{x:230,y:420,w:35,h:50}};assert.deepEqual(advanceSpider(a,1/60,w),advanceSpider(b,1/60,w));assert.equal(a.state,b.state);assert.equal(a.y,b.y);}
 s.objects.at(-1).position={x:600,y:128};const moved=context.api.compileStageV1(s).config('ceiling-spider','test-spider');assert.equal(moved.x,600);assert.equal(moved.attackY,468);assert.equal(moved.trigger.x,507);assert.equal(moved.trigger.y,400);assert.equal(moved.platformTop,510);
});
test('JSON supports multiple stable enemy ids and zero enemies for old stages',()=>{const s=stage();s.objects=s.objects.filter(o=>o.prefab!=='ceiling-spider');assert.equal(context.api.validateStageV1(s).ok,true);s.objects.push(authored(),{...authored(),id:'other-spider',position:{x:600,y:108}});assert.equal(context.api.validateStageV1(s).ok,true);assert.ok(context.api.compileStageV1(s).config('ceiling-spider','other-spider'));});
test('invalid enemy properties and unsafe geometry fail before mounting',()=>{for(const change of [o=>o.properties.warnSeconds=0,o=>o.properties.descendSpeed=NaN,o=>o.properties.body.w=-1,o=>o.properties.triggerOffset.x=-1000,o=>o.properties.attackOffsetY=900,o=>o.properties.typo=1,o=>delete o.properties.knock,o=>o.properties.knock.x=Infinity,o=>o.properties.body.extra=1]){const s=stage(),o=authored();change(o);s.objects=s.objects.filter(o=>o.prefab!=='ceiling-spider');s.objects.push(o);assert.equal(context.api.validateStageV1(s).ok,false,JSON.stringify(o));}});

test('spider state machine and attack rules remain byte-identical to pre-migration source',()=>{const source=fs.readFileSync('src/ceiling-spider.mjs','utf8'),baseline=fs.readFileSync('baseline/ceiling-spider.M476.mjs','utf8');const simulation=s=>s.slice(s.indexOf('export function rectsOverlap'),s.indexOf('function emptyCounts'));assert.equal(simulation(source),simulation(baseline));});

test('historical S1 artifact keeps frozen installer/composer contract',()=>{execFileSync(process.execPath,['build-m477-s1.mjs']);const html=fs.readFileSync('dist/Rafael_Brothers_M477_S1_RAFI_RUN_PROTOTYPE.html','utf8');assert.ok(html.includes('function rbM43Create()'));assert.ok(!html.includes("register('enemy-prefabs',attach)"));});
