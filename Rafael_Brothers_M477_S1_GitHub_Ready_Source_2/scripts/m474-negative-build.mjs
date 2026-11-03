import {readFileSync,writeFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';import evidence from './m474-evidence.cjs';
const file='stages/s01.stage.json',original=readFileSync(file),results=[];
for(const kind of ['wrong-stable-hook','full-pit-log','normal-jump-bypass']){
 try{const s=JSON.parse(original);if(kind==='wrong-stable-hook')s.objects.find(o=>o.id==='stable-root-extension').position.x=1275;
 else if(kind==='full-pit-log')s.objects.find(o=>o.id==='fallen-bridge-tree').properties.bridgeSize.w=300;
 else {const o=s.objects.find(o=>o.id==='fallen-bridge-tree');o.position.y-=44; o.properties.stubOffset.y+=44;}
 writeFileSync(file,JSON.stringify(s,null,2)+'\n');const r=spawnSync(process.execPath,['build-m474.mjs'],{encoding:'utf8'});const rejected=r.status!==0;results.push({kind,rejected,exit:r.status,reason:r.stderr.slice(0,1600)});if(!rejected)throw Error('Unsafe mutation accepted '+kind);
 }finally{writeFileSync(file,original);}
}
const r=spawnSync(process.execPath,['build-m474.mjs'],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);writeFileSync('evidence/m474-negative-build.json',JSON.stringify({restored:true,stageSha256:evidence.hash(original),results},null,2)+'\n');console.log('3 unsafe mutations rejected; exact Stage bytes restored; rebuild PASS');
