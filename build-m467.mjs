/** M4.6.7 unified composition root over immutable M4.6.4 baseline. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const root=dirname(fileURLToPath(import.meta.url));
const sha=v=>createHash('sha256').update(v).digest('hex');
const get=p=>readFileSync(resolve(root,p),'utf8');
const baseline=get('baseline/M46_RELEASE.html');
const banner='M4.6 — Forest Art & Bridges · experimental';
if(baseline.split(banner).length!==2)throw Error('Unexpected baseline banner');
const stage=JSON.parse(get('stages/s01.stage.json'));
const stageLoader=get('src/stage-loader.mjs');
const sandbox={};vm.createContext(sandbox);
vm.runInContext(stageLoader+';this.validator=validateStageV1;this.compile=compileStageV1',sandbox);
const check=sandbox.validator(stage);if(!check.ok)throw Error('Invalid stage: '+check.errors.join('; '));
const derived=sandbox.compile(stage);
writeFileSync(resolve(root,'stages/s01.modules.json'),JSON.stringify(derived.modules,null,2)+'\n');
writeFileSync(resolve(root,'stages/s01.anchors.json'),JSON.stringify(derived.anchors,null,2)+'\n');
let html=baseline.replace(banner,'M4.6.7 — Unified Scene Lifecycle · experimental');
let scripts='<script id="rb-m467-stage-data">window.__RB_STAGE_V1_DATA='+JSON.stringify(stage).replaceAll('<','\\u003c')+';</script>\n';
scripts+='<script id="rb-m467-stage-loader">\n'+stageLoader.replace(/^export /gm,'')+'\ninstallStageLoader();\n</script>\n';
const composer=get('src/scene-composer.mjs');
scripts+='<script id="rb-m467-scene-composer">\n'+composer.replace(/^export /gm,'')+'\ncreateRBSceneComposer();\n</script>\n';
const sources=[['stage-modules.mjs','installStageModules()'],['bridge-polish.mjs','installBridgePolish()'],['stage-dressing.mjs','installStageDressing()'],['environmental-anchors.mjs','installEnvironmentalAnchors()'],['rotten-root.mjs','installRottenRoot()'],['falling-bridge-tree.mjs','installFallingBridgeTree()'],['exit-grove.mjs','installExitGrove()'],['web-response.mjs','installWebResponse()']];
for(const [i,[file,installer]] of sources.entries()){
 const src=get('src/'+file);if(/\bimport\s/.test(src))throw Error('Unexpected import: '+file);
 scripts+=`<script id="rb-m467-${i}">\n${src.replace(/^export /gm,'')}\n${installer};\n</script>\n`;
}
scripts+='<script id="rb-m467-composer-start">window.__RBSceneComposerV1.start();</script>\n';
const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body tag');
html=html.slice(0,at)+scripts+html.slice(at);
for(const key of ['rb-m46-art-data','rb-m45-egg-sac','rb-m44-sticky-web','rb-m43-ceiling-spider'])if(!html.includes(`id="${key}"`))throw Error('Missing baseline module '+key);
for(const [i,m] of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].entries())new vm.Script(m[1],{filename:'inline-'+i});
const out='Rafael_Brothers_M467_UNIFIED_LIFECYCLE.html';writeFileSync(resolve(root,'dist',out),html);
writeFileSync(resolve(root,'dist/m467-build-manifest.json'),JSON.stringify({version:'M4.6.7',stageSha256:sha(get('stages/s01.stage.json')),baselineSha256:sha(baseline),composerSha256:sha(composer),loaderSha256:sha(stageLoader),finalSha256:sha(html),files:Object.fromEntries(sources.map(([f])=>[f,sha(get('src/'+f))]))},null,2)+'\n');
console.log(out,Buffer.byteLength(html),'bytes');
