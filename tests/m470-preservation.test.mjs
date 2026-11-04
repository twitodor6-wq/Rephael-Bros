import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const file=p=>readFileSync(new URL('../'+p,import.meta.url)),sha=p=>createHash('sha256').update(file(p)).digest('hex');
test('unchanged baseline Phaser core, authored Stage01 and transition experiment',()=>{
 const m=JSON.parse(file('archive/M469_source_immutable/RELEASE_MANIFEST.json'));
 for(const p of ['baseline/M46_RELEASE.html','stages/s01.m470.rollback.json','src/transition-controller.mjs','src/environmental-anchors.mjs','src/stage-modules.mjs','src/web-response.mjs','src/exit-grove.mjs']){
  assert.equal(sha(p==='src/web-response.mjs'?'baseline/web-response.M474.mjs':p==='src/environmental-anchors.mjs'?'baseline/environmental-anchors.mjs.M473':p==='src/stage-modules.mjs'?'baseline/stage-modules.M472.mjs':p),sha('archive/M469_source_immutable/'+(p==='stages/s01.m470.rollback.json'?'stages/s01.stage.json':p)),p);
 }
 assert.equal(sha('stages/s01.m470.rollback.json'),m.releaseHashes['stages/s01.stage.json']);
});
test('world-fixture JSON is isolated from unchanged production Stage01',()=>{
 const stage=JSON.parse(file('stages/s01.stage.json'));
 assert.equal(stage.world.terrain,undefined);assert.equal(stage.schemaVersion,'1.0.0');
 assert.match(file('src/stage-loader.mjs').toString(),/mountRBWorldFixture/);
 assert.match(file('src/rotten-root.mjs').toString(),/createRBManagedActor/);
 assert.match(file('src/falling-bridge-tree.mjs').toString(),/createRBManagedActor/);
});
