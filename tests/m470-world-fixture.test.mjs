import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
const root=new URL('../',import.meta.url),file=p=>readFileSync(new URL(p,root),'utf8'),stage=file('src/stage-loader.mjs');const sandbox={};vm.createContext(sandbox);vm.runInContext(stage+';this.check=validateStageStructure;this.compile=compileRBWorldFixture;',sandbox);
const good=JSON.parse(file('stages/m470-world-fixture.json'));
test('fixture compiles spawn, finish, pits, collision surfaces and camera from one JSON file',()=>{const c=sandbox.compile(good);assert.equal(c.surfaces.length,2);assert.equal(c.pits.length,1);assert.equal(c.spawn.x,120);assert.equal(c.exit.x,770);assert.equal(c.camera.width,900);});
test('mutation of surface, exit and camera changes runtime compiler output',()=>{const s=structuredClone(good);s.world.terrain.surfaces[1].x=492;s.world.terrain.surfaces[1].w=408;s.world.finish.x=760;s.camera.bounds.width=850;const c=sandbox.compile(s);assert.equal(c.surfaces[1].x,492);assert.equal(c.exit.x,760);assert.equal(c.camera.width,850);});
test('reject overlapping pit, duplicate ID, out-of-world geometry, incomplete start/end',()=>{for(const change of [s=>s.world.terrain.surfaces[0].x=310,s=>s.world.terrain.surfaces[1].id='ground-a',s=>s.world.terrain.pits[0].end=950,s=>delete s.world.finish]){const s=structuredClone(good);change(s);assert.throws(()=>sandbox.compile(s))}});
test('Stage01 maintains original schema and no terrain override',()=>{const s=JSON.parse(file('stages/s01.stage.json'));assert.equal(s.schemaVersion,'1.0.0');assert.equal(s.world.terrain,undefined);assert.equal(sandbox.check(s).ok,true)});
test('isolated fixture and Stage v1 share one terrain property contract',()=>{
 const stageSchema=JSON.parse(file('schemas/stage.v1.schema.json'));
 const fixtureSchema=JSON.parse(file('schemas/m470-world-fixture.schema.json'));
 assert.deepEqual(fixtureSchema.properties.world.properties.terrain,stageSchema.properties.world.properties.terrain);
 assert.equal(stageSchema.properties.objects.minItems,3);
 assert.equal(fixtureSchema.properties.objects.maxItems,0);
});
