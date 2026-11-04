/** M4.6.3 stage anchors with immutable approved art/game baseline. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const root=dirname(fileURLToPath(import.meta.url));
const hash=v=>createHash('sha256').update(v).digest('hex');
const baseline=readFileSync(resolve(root,'baseline/M46_RELEASE.html'),'utf8');
const old='M4.6 — Forest Art & Bridges · experimental';
if(baseline.split(old).length!==2)throw Error('Original baseline banner changed');
const panel=JSON.parse(readFileSync(resolve(root,'stages/s01.modules.json'),'utf8'));
const anchors=JSON.parse(readFileSync(resolve(root,'stages/s01.anchors.json'),'utf8'));
if(panel.schema!=='rafael-stage-modules/v1'||anchors.schema!=='rafael-stage-anchors/v1'||panel.stage!==anchors.stage)throw Error('Stage registry mismatch');
let html=baseline.replace(old,'M4.6.3 — Environmental Anchors · experimental');
let scripts='<script id="rb-m463-stage-config">window.__RB_STAGE_MODULE_CONFIG='+JSON.stringify(panel)+';window.__RB_STAGE_ANCHOR_CONFIG='+JSON.stringify(anchors)+';</script>\n';
const sources=[['stage-modules.mjs','installStageModules()'],['bridge-polish.mjs','installBridgePolish()'],['stage-dressing.mjs','installStageDressing()'],['environmental-anchors.mjs','installEnvironmentalAnchors()'],['rotten-root.mjs','installRottenRoot()'],['falling-bridge-tree.mjs','installFallingBridgeTree()']];
for(const [i,[file,installer]] of sources.entries()){
  const src=readFileSync(resolve(root,'src',file),'utf8');
  if(/\bimport\s/.test(src))throw Error('Unexpected import: '+file);
  scripts+=`<script id="rb-m463-${i}">\n${src.replace(/^export /gm,'')}\n${installer};\n</script>\n`;
}
const at=html.lastIndexOf('</body>');if(at<0)throw Error('missing body');
html=html.slice(0,at)+scripts+html.slice(at);
for(const marker of ['rb-m46-art-data','rb-m45-egg-sac','rb-m44-sticky-web','rb-m43-ceiling-spider'])if(!html.includes(`id="${marker}"`))throw Error('Missing legacy module '+marker);
for(const [i,m] of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].entries())new vm.Script(m[1],{filename:'inline-'+i});
const filename='Rafael_Brothers_M463_ENVIRONMENTAL_ANCHORS.html';
writeFileSync(resolve(root,'dist',filename),html);
const manifest={version:'M4.6.3',baselineSha256:hash(baseline),finalSha256:hash(html),stageModulesSha256:hash(readFileSync(resolve(root,'stages/s01.modules.json'))),stageAnchorsSha256:hash(readFileSync(resolve(root,'stages/s01.anchors.json'))),modules:Object.fromEntries(sources.map(([f])=>[f,hash(readFileSync(resolve(root,'src',f)))])),singleHtml:true};
writeFileSync(resolve(root,'dist/m463-build-manifest.json'),JSON.stringify(manifest,null,2));
console.log(filename,Buffer.byteLength(html),'bytes');
