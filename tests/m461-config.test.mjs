import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
const root=new URL('../',import.meta.url);
for(const f of ['stage-modules.mjs','bridge-polish.mjs','stage-dressing.mjs']){
 test('script syntax '+f,()=>{new vm.Script(readFileSync(new URL('src/'+f,root),'utf8'));});
}
test('stage panel references original toggles and future tree spec',()=>{let s=readFileSync(new URL('stages/s01.modules.json',root),'utf8');for(let id of ['rb-m42-art-toggle','rb-m44-web-toggle','rb-m45-egg-toggle','rb-m46-parallax-toggle','rb-m46-bridges-toggle','rb-m46-ambience-toggle','rb-m461-dressing-toggle','rotten-root'])assert.ok(s.includes(id),id);});
test('bridge geometry always leaves pit empty',()=>{const stage=JSON.parse(readFileSync(new URL('stages/s01.stage.json',root)));const o=stage.objects.find(o=>o.prefab==='root-bridge');const b=o.properties;assert.equal(b.pit.start,370);assert.equal(b.pit.end,706);assert.ok(b.brokenRight.x-b.brokenLeft.x-b.brokenLeft.w>75)});
test('M4.6 immutable prefix (except banner)',()=>{let original=readFileSync(new URL('baseline/M46_RELEASE.html',root),'utf8');let now=readFileSync(new URL('dist/Rafael_Brothers_M461_FOREST_POLISH_STAGE_MODULES.html',root),'utf8');let old='M4.6 — Forest Art & Bridges · experimental',next='M4.6.1 — Forest Polish & Stage Modules · experimental';assert.ok(now.startsWith(original.replace(old,next).split('</body>')[0]));});
