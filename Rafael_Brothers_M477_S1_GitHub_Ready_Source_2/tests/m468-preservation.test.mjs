import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sha=p=>createHash('sha256').update(readFileSync(new URL(p,import.meta.url))).digest('hex');
test('M470 retains legacy immutable base, Stage01 data and untouched panel, exit, web actors',()=>{
 for(const p of ['baseline/M46_RELEASE.html','stages/s01.m470.rollback.json','src/stage-modules.mjs','src/exit-grove.mjs','src/web-response.mjs'])assert.equal(sha('../'+(p==='src/web-response.mjs'?'baseline/web-response.M474.mjs':p==='src/stage-modules.mjs'?'baseline/stage-modules.M472.mjs':p)),sha('../archive/M467_source_immutable/'+(p==='stages/s01.m470.rollback.json'?'stages/s01.stage.json':p)),p);
});
