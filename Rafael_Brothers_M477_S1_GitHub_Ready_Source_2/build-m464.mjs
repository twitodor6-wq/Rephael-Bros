/** M4.6.4 stage QA fix: reveal rotten challenge, relocate finish trigger, natural portal, subtle attached web response. */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';import vm from 'node:vm';
const root=dirname(fileURLToPath(import.meta.url));const hash=v=>createHash('sha256').update(v).digest('hex');
const baseline=readFileSync(resolve(root,'baseline/M46_RELEASE.html'),'utf8');
const old='M4.6 — Forest Art & Bridges · experimental';if(baseline.split(old).length!==2)throw Error('Unexpected baseline banner');
const panel=JSON.parse(readFileSync(resolve(root,'stages/s01.modules.json'),'utf8'));
const anchors=JSON.parse(readFileSync(resolve(root,'stages/s01.anchors.json'),'utf8'));
if(panel.schema!=='rafael-stage-modules/v1'||anchors.schema!=='rafael-stage-anchors/v1'||panel.stage!==anchors.stage)throw Error('Stage registries mismatch');
let html=baseline.replace(old,'M4.6.4 — Reachable Rotten Tree & Root Grove · experimental');
let scripts='<script id="rb-m464-stage-config">window.__RB_STAGE_MODULE_CONFIG='+JSON.stringify(panel)+';window.__RB_STAGE_ANCHOR_CONFIG='+JSON.stringify(anchors)+';</script>\n';
const sources=[['stage-modules.mjs','installStageModules()'],['bridge-polish.mjs','installBridgePolish()'],['stage-dressing.mjs','installStageDressing()'],['environmental-anchors.mjs','installEnvironmentalAnchors()'],['rotten-root.mjs','installRottenRoot()'],['falling-bridge-tree.mjs','installFallingBridgeTree()'],['exit-grove.mjs','installExitGrove()'],['web-response.mjs','installWebResponse()']];
for(const [i,[file,installer]] of sources.entries()){
 const src=readFileSync(resolve(root,'src',file),'utf8');if(/\bimport\s/.test(src))throw Error('Unexpected import '+file);
 scripts+=`<script id="rb-m464-${i}">\n${src.replace(/^export /gm,'')}\n${installer};\n</script>\n`;
}
const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');html=html.slice(0,at)+scripts+html.slice(at);
for(const key of ['rb-m46-art-data','rb-m45-egg-sac','rb-m44-sticky-web','rb-m43-ceiling-spider'])if(!html.includes(`id="${key}"`))throw Error('Missing legacy module '+key);
for(const [i,m] of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].entries())new vm.Script(m[1],{filename:'inline-'+i});
const out='Rafael_Brothers_M464_REACHABLE_ROTTEN_TREE.html';writeFileSync(resolve(root,'dist',out),html);
writeFileSync(resolve(root,'dist/m464-build-manifest.json'),JSON.stringify({version:'M4.6.4',baselineSha256:hash(baseline),finalSha256:hash(html),stageModulesSha256:hash(readFileSync(resolve(root,'stages/s01.modules.json'))),stageAnchorsSha256:hash(readFileSync(resolve(root,'stages/s01.anchors.json'))),files:Object.fromEntries(sources.map(([f])=>[f,hash(readFileSync(resolve(root,'src',f)))]))},null,2));
console.log(out,Buffer.byteLength(html),'bytes');
