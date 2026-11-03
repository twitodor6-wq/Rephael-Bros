/** Exact-artifact gate; no QA synthesis. Historical M472 gate is preserved separately. */
import {readFileSync,existsSync} from 'node:fs';import evidence from './m473-evidence.cjs';
const json=p=>JSON.parse(readFileSync(p)),sha=p=>evidence.hash(readFileSync(p)),fail=m=>{throw Error('M473 RELEASE BLOCKED: '+m)};
const html='dist/Rafael_Brothers_M473_GAMEPLAY_CHALLENGE.html',stage='stages/s01.stage.json',source=evidence.fingerprint(),build=json('dist/m473-build-manifest.json');
if(build.finalSha256!==sha(html)||build.stageSha256!==sha(stage))fail('stale build');
if(build.staticSafetyStatus!=='PASS'||!build.staticProfilesVerified)fail('static safety/profile provenance');
const prior=json('M472_RELEASE_MANIFEST.json');for(const [p,v] of Object.entries(prior.core_preservation))if(sha(p)!==v.sha256)fail('core preservation '+p);
const qaFiles=[['m473-gameplay.json','m473-gameplay.cjs'],['m473-hazards.json','m473-hazards.cjs'],['m473-lifecycle.json','m473-lifecycle.cjs'],['m473-rope-crossing-browser.json','m473-rope-crossing-browser-qa.py']];let total=0;
for(const [f,t] of qaFiles){const q=json('evidence/'+f);if(q.htmlSha256!==sha(html)||q.stageSha256!==sha(stage)||q.sourceFingerprint!==source||q.testSha256!==sha('tests/'+t))fail('stale evidence '+f);if(!q.checks?.length||q.checks.some(v=>!v.passed))fail('failed checks '+f);total+=q.checks.length;}
const gameplay=json('evidence/m473-gameplay.json'),hazards=json('evidence/m473-hazards.json');
for(const actor of ['rafi','shaul'])for(const mode of ['manual','classic','hybrid']){
 if(!gameplay.checks.some(c=>c.name===`continuous teach + combine ${actor}/${mode}`&&c.passed)||!gameplay.checks.some(c=>c.name===`keyboard reaches actual exit ${actor}/${mode}`&&c.passed))fail('missing continuous route '+actor+'/'+mode);
 if(!hazards.checks.some(c=>c.name===`keyboard rescue reaches far bank ${actor}/${mode}`&&c.passed))fail('missing actual rescue '+actor+'/'+mode);
 const r=gameplay.runs.find(v=>v.actor===actor&&v.mode===mode);if(!r?.trace?.some(v=>v.ground&&Math.abs(v.foot-465)<2)||!r.trace.some(v=>v.ground&&Math.abs(v.foot-440)<2))fail('route did not land on both teaching logs');
}
const negative=json('evidence/m473-negative-build.json');if(!negative.rejected||!negative.restored||negative.stageSha256!==sha(stage))fail('missing restored negative build');
const runs=json('evidence/m473-qa-run-manifest.json');if(runs.sourceFingerprint!==source||runs.runs.length!==8||runs.runs.some(r=>r.exit!==0))fail('QA commands incomplete');
const log=readFileSync('evidence/m473-node-run.log','utf8');const count=Number(log.match(/# tests (\d+)/)?.[1]);if(count<114||!log.includes(`# pass ${count}`)||!log.includes('# fail 0'))fail('Node regression suite incomplete');
console.log(`M4.7.3 RELEASE GATE PASS — ${count}/${count} Node, ${total}/${total} Chromium assertions; 6 continuous partial-stage runs + 6 actual rescues; unchanged core, exact Stage/HTML/source hashes.`);
