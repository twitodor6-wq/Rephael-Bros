import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8'),j=p=>JSON.parse(read(p));const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.match(read('evidence/m477/node.log'),/# pass 142/);assert.match(read('evidence/m477/node.log'),/# fail 0/);
const b=j('evidence/m477/browser.json');assert.equal(b.checks.length,25);assert.ok(b.checks.every(c=>c.passed));
const p=j('evidence/m477/physics-parity.json');assert.equal(p.cases.length,6);assert.ok(p.cases.every(c=>c.equal&&c.steps===199));assert.deepEqual(p.errors,[]);
const v=j('evidence/m477/visual.json');assert.equal(v.sha256,hash('dist/Rafael_Brothers_M477_S1_RAFI_RUN_PROTOTYPE.html'));for(const k of ['x','y','vx','vy','camera'])assert.equal(v.before[k],v.after[k]);assert.deepEqual(v.errors,[]);assert.ok(v.before.proto.show&&!v.after.proto.show);
const d=j('evidence/m477/death.json');assert.equal(d.cases.length,2);assert.deepEqual(d.errors,[]);assert.equal(d.cleanup.reference,false);assert.equal(d.cleanup.children,0);
assert.match(read('evidence/m477/webgl-local.log'),/"rendererType":2,"errors":\[\]/);
console.log('PASS M477-S1:142 Node,25 Canvas checks,6 paired199-step diagnostics,2 deaths,matched images,local WebGL smoke. Human/Safari/full WebGL NOT PROVEN.');
