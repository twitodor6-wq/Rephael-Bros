/** Offline release gate. Does NOT silently run or certify missing browser tests. */
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const from=p=>readFileSync(resolve(root,p));
const sha=p=>createHash('sha256').update(from(p)).digest('hex');
const json=p=>JSON.parse(from(p));
const fail=(message)=>{throw Error('M472 RELEASE BLOCKED: '+message)};
const stage='stages/s01.stage.json',html='dist/Rafael_Brothers_M472_ROPE_CROSSING_SAFETY.html';
const qa=json('evidence/m472-rope-crossing-browser.json');
if(qa.stageSha256!==sha(stage)||qa.htmlSha256!==sha(html)||qa.baselineSha256!==sha('baseline/M46_RELEASE.html'))fail('QA hashes do not match the current exact build');
const checks=qa.checks||[];
if(checks.length<44||checks.some(x=>!x.passed))fail('browser QA incomplete or failed');
for(const char of ['rafi','shaul'])for(const mode of ['manual','classic','hybrid'])for(const gap of ['legacy','forest-gap-02'])for(const side of ['left','right']){
 if(!checks.some(c=>c.name===`reel ${char}/${mode}/${gap}/${side}`&&c.passed))fail('missing mandatory reel scenario '+[char,mode,gap,side].join('/'));
}
for(const name of ['old x1275 is rejected as collision sweep','actual old x1275 collision causes safe release in Phaser','disabled extension collision reports NOT TESTED','disabled mandatory anchor reports NOT TESTED','no JavaScript page errors','keyboard E voluntary detach','keyboard ArrowDown extends tape']){
 if(!checks.some(c=>c.name===name&&c.passed))fail('missing mandatory browser finding: '+name);
}
const staticReport=json('dist/m472-static-safety-report.json');
if(staticReport.status!=='PASS')fail('static Stage JSON report status '+staticReport.status);
for(const [file,count] of [['m472-compat-m471-rope-gap-regression.json',10],['m472-compat-m471-new-gap-browser.json',2],['m472-compat-m471-browser-smoke.json',14],['m472-compat-m471-lifecycle-browser.json',8]]){
 const path='evidence/'+file;if(!existsSync(resolve(root,path)))fail('missing compatibility evidence '+file);
 const data=json(path),list=Array.isArray(data)?data:data.checks||[];
 if(list.length!==count||list.some(c=>!c.passed))fail('compatibility regression failed: '+file);
}
const runs=json('evidence/m472-compat-run-manifest.json');
if(runs.stageSha256!==sha(stage)||runs.htmlSha256!==sha(html)||runs.baselineSha256!==sha('baseline/M46_RELEASE.html'))fail('compatibility and Node test run fingerprints are stale');
if(runs.node?.passed!==104||runs.node?.total!==104)fail('Node QA evidence incomplete');
const nodeLog=from('evidence/m472-node-run.log').toString();
if(!nodeLog.includes('# tests 104')||!nodeLog.includes('# pass 104')||!nodeLog.includes('# fail 0'))fail('Node run log lacks 104/104');
if(qa.profiles?.length!==2||!qa.profiles.every(p=>['rafi','shaul'].includes(p.id)))fail('missing two runtime body profile readbacks');
console.log('M4.7.2 RELEASE GATE PASS — 44/44 new Chromium; 34/34 compatibility Chromium; Stage JSON static PASS; two profiles and both gaps; exact file SHA match.');
