/** M4.6.6 JSON-first stage loader and validated prefab adapters over M4.6.4. */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';import vm from 'node:vm';
const root=dirname(fileURLToPath(import.meta.url));const hash=v=>createHash('sha256').update(v).digest('hex');
const baseline=readFileSync(resolve(root,'baseline/M46_RELEASE.html'),'utf8');
const old='M4.6 — Forest Art & Bridges · experimental';if(baseline.split(old).length!==2)throw Error('Unexpected baseline banner');
const stage=JSON.parse(readFileSync(resolve(root,'stages/s01.stage.json'),'utf8'));
const stageLoader=readFileSync(resolve(root,'src/stage-loader.mjs'),'utf8');
const sandbox={};vm.createContext(sandbox);vm.runInContext(stageLoader+';this.validator=validateStageV1;this.compile=compileStageV1',sandbox);
const check=sandbox.validator(stage);if(!check.ok)throw Error('Invalid stage: '+check.errors.join('; '));
const derived=sandbox.compile(stage);
// Legacy M4.6.x JSON is emitted as a COMPATIBILITY VIEW, never read by the runtime.
writeFileSync(resolve(root,'stages/s01.modules.json'),JSON.stringify(derived.modules,null,2)+'\n');
writeFileSync(resolve(root,'stages/s01.anchors.json'),JSON.stringify(derived.anchors,null,2)+'\n');
let html=baseline.replace(old,'M4.6.6 — Modular Encounters · experimental');
let scripts='<script id="rb-m466-stage-data">window.__RB_STAGE_V1_DATA='+JSON.stringify(stage).replaceAll('<','\\u003c')+';</script>\n';
scripts+='<script id="rb-m466-stage-loader">\n'+stageLoader.replace(/^export /gm,'')+'\ninstallStageLoader();\n</script>\n';
const sources=[['stage-modules.mjs','installStageModules()'],['bridge-polish.mjs','installBridgePolish()'],['stage-dressing.mjs','installStageDressing()'],['environmental-anchors.mjs','installEnvironmentalAnchors()'],['rotten-root.mjs','installRottenRoot()'],['falling-bridge-tree.mjs','installFallingBridgeTree()'],['exit-grove.mjs','installExitGrove()'],['web-response.mjs','installWebResponse()']];
for(const [i,[file,installer]] of sources.entries()){
 const src=readFileSync(resolve(root,'src',file),'utf8');if(/\bimport\s/.test(src))throw Error('Unexpected import '+file);
 scripts+=`<script id="rb-m464-${i}">\n${src.replace(/^export /gm,'')}\n${installer};\n</script>\n`;
}
const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');html=html.slice(0,at)+scripts+html.slice(at);
for(const key of ['rb-m46-art-data','rb-m45-egg-sac','rb-m44-sticky-web','rb-m43-ceiling-spider'])if(!html.includes(`id="${key}"`))throw Error('Missing legacy module '+key);
for(const [i,m] of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].entries())new vm.Script(m[1],{filename:'inline-'+i});
const out='Rafael_Brothers_M466_MODULAR_ENCOUNTERS.html';writeFileSync(resolve(root,'dist',out),html);
writeFileSync(resolve(root,'dist/m466-build-manifest.json'),JSON.stringify({version:'M4.6.6',stageSha256:hash(readFileSync(resolve(root,'stages/s01.stage.json'))),loaderSha256:hash(stageLoader),baselineSha256:hash(baseline),finalSha256:hash(html),stageModulesSha256:hash(readFileSync(resolve(root,'stages/s01.modules.json'))),stageAnchorsSha256:hash(readFileSync(resolve(root,'stages/s01.anchors.json'))),files:Object.fromEntries(sources.map(([f])=>[f,hash(readFileSync(resolve(root,'src',f)))]))},null,2));
console.log(out,Buffer.byteLength(html),'bytes');
