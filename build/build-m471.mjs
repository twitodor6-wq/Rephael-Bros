/** M4.7.1 unified composition root over immutable M4.6.4 baseline. */
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
let html=baseline.replace(banner,'M4.7.1.1 — Root Forest · rope anchor hotfix');
let scripts='<script id="rb-m471-stage-data">window.__RB_STAGE_V1_DATA='+JSON.stringify(stage).replaceAll('<','\\u003c')+';</script>\n';
scripts+='<script id="rb-m471-stage-loader">\n'+stageLoader.replace(/^export /gm,'')+'\ninstallStageLoader();\n</script>\n';
const managed=get('src/managed-actor.mjs');
scripts+='<script id="rb-m471-managed-actor">\n'+managed+'\n</script>\n';
const fixtureData=JSON.parse(get('stages/m470-world-fixture.json'));
scripts+='<script id="rb-m470-world-fixture">\nwindow.__RBM471Fixture='+JSON.stringify(fixtureData)+';\n</script>\n';

const transition=get('src/transition-controller.mjs');
const experiments=['a','b'].map(id=>JSON.parse(get('stages/transition-experiment-'+id+'.json')));
scripts+='<script id="rb-m471-transition">\n'+transition+'\nwindow.__RBTransitionExperiments='+JSON.stringify(experiments)+';\n</script>\n';
const composer=get('src/scene-composer.mjs');
scripts+='<script id="rb-m471-scene-composer">\n'+composer.replace(/^export /gm,'')+'\ncreateRBSceneComposer();\n</script>\n';
const sources=[['forest-extension.mjs','installForestExtension()'],['stage-modules.mjs','installStageModules()'],['bridge-polish.mjs','installBridgePolish()'],['stage-dressing.mjs','installStageDressing()'],['environmental-anchors.mjs','installEnvironmentalAnchors()'],['rotten-root.mjs','installRottenRoot()'],['falling-bridge-tree.mjs','installFallingBridgeTree()'],['exit-grove.mjs','installExitGrove()'],['web-response.mjs','installWebResponse()']];
for(const [i,[file,installer]] of sources.entries()){
 const src=get('src/'+file);if(/\bimport\s/.test(src))throw Error('Unexpected import: '+file);
 scripts+=`<script id="rb-m471-${i}">\n${src.replace(/^export /gm,'')}\n${installer};\n</script>\n`;
}
scripts+='<script id="rb-m471-composer-start">window.__RBSceneComposerV1.start();</script>\n';
const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body tag');
html=html.slice(0,at)+scripts+html.slice(at);
for(const key of ['rb-m46-art-data','rb-m45-egg-sac','rb-m44-sticky-web','rb-m43-ceiling-spider'])if(!html.includes(`id="${key}"`))throw Error('Missing baseline module '+key);
for(const [i,m] of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].entries())new vm.Script(m[1],{filename:'inline-'+i});
const out='Rafael_Brothers_M471_ROOT_FOREST.html';writeFileSync(resolve(root,'dist',out),html);
writeFileSync(resolve(root,'dist/m471-build-manifest.json'),JSON.stringify({version:'M4.7.1',stageSha256:sha(get('stages/s01.stage.json')),baselineSha256:sha(baseline),transitionSha256:sha(transition),managedSha256:sha(managed),composerSha256:sha(composer),loaderSha256:sha(stageLoader),finalSha256:sha(html),files:Object.fromEntries(sources.map(([f])=>[f,sha(get('src/'+f))]))},null,2)+'\n');
console.log(out,Buffer.byteLength(html),'bytes');
