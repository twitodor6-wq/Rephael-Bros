/** Safe M4.6.2 overlay: same immutable M4.6 prefix with updated sidecars. */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';import vm from 'node:vm';
const root=dirname(fileURLToPath(import.meta.url)),h=v=>createHash('sha256').update(v).digest('hex');
const prior=readFileSync(resolve(root,'baseline/M46_RELEASE.html'),'utf8');
let html=prior;const old='M4.6 — Forest Art & Bridges · experimental';
if(html.split(old).length!==2)throw Error('M4.6 banner changed');
html=html.replace(old,'M4.6.2 — Rotten Root & Environmental Anchor · experimental');
const sourcefiles=['stage-modules.mjs','bridge-polish.mjs','stage-dressing.mjs','rotten-root.mjs'];
const installers=['installStageModules()','installBridgePolish()','installStageDressing()','installRottenRoot()'];
const stageConfig=JSON.parse(readFileSync(resolve(root,'stages/s01.modules.json'),'utf8'));
if(stageConfig.schema!=='rafael-stage-modules/v1')throw Error('invalid stage manifest');
let scripts='<script id="rb-m462-stage-config">window.__RB_STAGE_MODULE_CONFIG='+JSON.stringify(stageConfig)+';</script>\n';
for(const [i,n] of sourcefiles.entries()){
 let src=readFileSync(resolve(root,'src',n),'utf8');if(/\bimport\s/.test(src))throw Error('unexpected import');
 scripts+=`<script id="rb-m462-${i}">\n${src.replace(/^export /gm,'')}\n${installers[i]};\n</script>\n`;
}
const at=html.lastIndexOf('</body>');if(at<0)throw Error('missing body');
html=html.slice(0,at)+scripts+html.slice(at);
for(const key of ['rb-m46-art-data','rb-m45-egg-sac','rb-m44-sticky-web','rb-m43-ceiling-spider']) if(!html.includes(`id="${key}"`)) throw Error('missing '+key);
for(const [i,match] of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].entries()) new vm.Script(match[1],{filename:'inline-'+i});
const path=resolve(root,'dist/Rafael_Brothers_M462_ROTTEN_ROOT_ANCHOR.html');writeFileSync(path,html);
const m={version:'M4.6.2',baseline:'M4.6 immutable released HTML',sha256M46Baseline:h(prior),sha256Final:h(html),stageConfigSha256:h(readFileSync(resolve(root,'stages/s01.modules.json'))),files:Object.fromEntries(sourcefiles.map(f=>[f,h(readFileSync(resolve(root,'src',f)))])),environmentalAnchorPrototype:true};
writeFileSync(resolve(root,'dist/m462-build-manifest.json'),JSON.stringify(m,null,2));console.log(path,Buffer.byteLength(html),'bytes');
