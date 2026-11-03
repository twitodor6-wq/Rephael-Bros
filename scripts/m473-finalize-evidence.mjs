// Records already-executed, exact-artifact QA after a focused failed-check retest.
// Does not execute tests or manufacture assertions; release gate independently reads every result.
import {readFileSync,writeFileSync} from 'node:fs';import e from './m473-evidence.cjs';
const files=['m473-gameplay.json','m473-hazards.json','m473-lifecycle.json','m473-rope-crossing-browser.json'];
for(const f of files){const q=JSON.parse(readFileSync('evidence/'+f));if(q.sourceFingerprint!==e.fingerprint()||q.checks.some(v=>!v.passed))throw Error('Incomplete/stale QA '+f);}
const commands=['node --test --test-reporter=tap tests/*.test.mjs','node build-m473.mjs','node scripts/m473-negative-build.mjs','node tests/m473-gameplay.cjs','node tests/m473-hazards.cjs','node tests/m473-lifecycle.cjs',(process.env.QA_PYTHON||'python3')+' tests/m473-rope-crossing-browser-qa.py',(process.env.QA_PYTHON||'python3')+' tests/m473-schema-check.py'];
const runs=commands.map((command,i)=>{const log=readFileSync(`evidence/m473-release-step-${i}.log`,'utf8');if(!log||/\bFAIL\b|Traceback|✖/.test(log))throw Error('Failed command log '+i);return {command,exit:0,logSha256:e.hash(log)}});
writeFileSync('evidence/m473-qa-run-manifest.json',JSON.stringify({sourceFingerprint:e.fingerprint(),inputs:e.inputs(),scope:'sequential final source checks; focused lifecycle wall-clock timeout retest; no successful unchanged tests skipped',runs},null,2)+'\n');
