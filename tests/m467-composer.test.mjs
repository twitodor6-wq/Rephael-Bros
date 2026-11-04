import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EventEmitter} from 'node:events';
import vm from 'node:vm';
const src=readFileSync(new URL('../src/scene-composer.mjs',import.meta.url),'utf8');
function fixture(){
 const context={setInterval,clearInterval,setTimeout,clearTimeout};vm.createContext(context);
 vm.runInContext(src+';this.factory=createRBSceneComposer;this.order=RB_SCENE_COMPOSER_ORDER',context);
 const emitted=[],events=new EventEmitter();
 class MockGameScene{create(){emitted.push('native');return 42;}}
 const scene=new MockGameScene();Object.assign(scene,{sys:{isActive:()=>true},player:{},world:{},tape:{},events});
 const win={__game:{scene:{getScene:key=>key==='Game'?scene:null}},setInterval,clearInterval,setTimeout,clearTimeout};
 const controller=context.factory(win);return {controller,scene,win,events,emitted,order:[...context.order]};
}
test('composer requires every named actor before start',()=>{
 const {controller}=fixture();assert.throws(()=>controller.start(),/missing registration/);
});
test('one ordered composition root, idempotent on active Game scene, reattaches after shutdown',()=>{
 const {controller,scene,events,emitted,order}=fixture();
 for(const name of order)controller.register(name,()=>{emitted.push(name);return {}});
 assert.throws(()=>controller.register(order[0],()=>{}),/Duplicate/);
 controller.start();assert.deepEqual(emitted,order);
 assert.equal(controller.snapshot(scene).active,true);
 assert.equal(scene.create(),42);assert.deepEqual(emitted.slice(-1),['native']);
 const before=controller.snapshot(scene);assert.equal(before.attachCount,1);assert.equal(before.shutdownCount,0);
 events.emit('shutdown');assert.equal(controller.snapshot(scene).active,false);
 assert.equal(scene.create(),42);assert.deepEqual(emitted.slice(-(1+order.length)),['native',...order]);
 const after=controller.snapshot(scene);assert.equal(after.attachCount,2);assert.equal(after.shutdownCount,1);
 assert.deepEqual([...after.registered],order);assert.deepEqual([...after.legacyScenePatches],[]);
 assert.throws(()=>controller.register('late',()=>{}),/closed/);
});
test('composer rejects unnamed registration and preserves deliberate registration order',()=>{
 const {controller,order}=fixture();
 assert.throws(()=>controller.register('not-a-prefab',()=>{}),/invalid/);
 for(const name of [...order].reverse())controller.register(name,()=>{});
 controller.start();assert.deepEqual([...controller.snapshot().registered],[...order].reverse());
 assert.deepEqual([...controller.snapshot().expected],order);
});
