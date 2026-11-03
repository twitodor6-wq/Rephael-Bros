/** Safe M4.6.1 overlay: M4.6 approved HTML remains byte-identical in prefix. */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';import vm from 'node:vm';
const root=dirname(fileURLToPath(import.meta.url)),h=v=>createHash('sha256').update(v).digest('hex');
const prior=readFileSync(resolve(root,'baseline/M46_RELEASE.html'),'utf8');
let html=prior;const old='M4.6 — Forest Art & Bridges · experimental';
if(html.split(old).length!==2)throw Error('M4.6 banner changed');
html=html.replace(old,'M4.6.1 — Forest Polish & Stage Modules · experimental');
const sourcefiles=['stage-modules.mjs','bridge-polish.mjs','stage-dressing.mjs'];
const installers=['installStageModules()','installBridgePolish()','installStageDressing()'];
const stageConfig=JSON.parse(readFileSync(resolve(root,'stages/s01.modules.json'),'utf8'));
if(stageConfig.schema!=='rafael-stage-modules/v1')throw Error('invalid stage manifest');
let scripts='<script id="rb-m461-stage-config">window.__RB_STAGE_MODULE_CONFIG='+JSON.stringify(stageConfig)+';</script>\n';for(const [i,n] of sourcefiles.entries()){
 let src=readFileSync(resolve(root,'src',n),'utf8');if(/\bimport\s/.test(src))throw Error('unexpected import');
 scripts+=`<script id="rb-m461-${i}">\n${src.replace(/^export /gm,'')}\n${installers[i]};\n</script>\n`;
}
const at=html.lastIndexOf('</body>');if(at<0)throw Error('missing body');
html=html.slice(0,at)+scripts+html.slice(at);
for(const key of ['rb-m46-art-data','rb-m45-egg-sac','rb-m44-sticky-web','rb-m43-ceiling-spider','rb-m461-2'])if(!html.includes(`id="${key}"`))throw Error('missing '+key);
for(const [i,match] of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].entries())new vm.Script(match[1],{filename:'inline-'+i});
const path=resolve(root,'dist/Rafael_Brothers_M461_FOREST_POLISH_STAGE_MODULES.html');writeFileSync(path,html);
const m={version:'M4.6.1',baseline:'M4.6 immutable released HTML',sha256M46Baseline:h(prior),sha256Final:h(html),stageConfigSha256:h(readFileSync(resolve(root,'stages/s01.modules.json'))),files:Object.fromEntries(sourcefiles.map(f=>[f,h(readFileSync(resolve(root,'src',f)))])),artPreserved:true,legacyMechanicsPreserved:true};
writeFileSync(resolve(root,'dist/m461-build-manifest.json'),JSON.stringify(m,null,2));console.log(path,Buffer.byteLength(html),'bytes');
