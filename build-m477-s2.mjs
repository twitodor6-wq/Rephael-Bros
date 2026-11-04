/** M4.7.1 unified composition root over immutable M4.6.4 baseline. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {validateRopeCrossingSafety,assertRopeCrossingGate} from './src/validation/rope-crossing-safety.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const sha=v=>createHash('sha256').update(v).digest('hex');
// Freeze historical S2 data contracts while S3 evolves.
const frozen={'src/stage-loader.mjs':'baseline/stage-loader.M477-S2.mjs','src/scene-composer.mjs':'baseline/scene-composer.M477-S2.mjs','stages/s01.stage.json':'stages/s01.m477-s2.rollback.json'};
const get=p=>readFileSync(resolve(root,frozen[p]||p),'utf8');
const baseline=get('baseline/M46_RELEASE.html');
const banner='M4.6 — Forest Art & Bridges · experimental';
if(baseline.split(banner).length!==2)throw Error('Unexpected baseline banner');
const stage=JSON.parse(get('stages/s01.stage.json'));
// Read-only contract harvested from existing immutable baseline, fail rather than guess.
const tapeMaxLength=Number(baseline.match(/Math\.hypot\(J\.x-Z\.x,J\.y-Z\.y\)<(\d+)/)?.[1]);
if(!Number.isFinite(tapeMaxLength)||!baseline.includes(`,110,${tapeMaxLength})`))throw Error('Cannot derive tape range from immutable Game Core');
const stageLoader=get('src/stage-loader.mjs');
const sandbox={};vm.createContext(sandbox);
vm.runInContext(stageLoader+';this.validator=validateStageV1;this.compile=compileStageV1',sandbox);
const check=sandbox.validator(stage);if(!check.ok)throw Error('Invalid stage: '+check.errors.join('; '));
const derived=sandbox.compile(stage);
// Static QA: only stage-owned collision bodies; unknown legacy ground is NOT implicit PASS.
// Cached, read-only Phaser body measurements, valid only for same baseline hash.
// If absent/stale, report NOT TESTED; never infer a magic hitbox size.
let verifiedProfiles=[];
try {const qa=JSON.parse(get('evidence/m472-rope-crossing-browser.json'));
 if(qa.baselineSha256===sha(baseline)&&Array.isArray(qa.profiles)&&qa.profiles.length===2&&qa.profiles.every(p=>Number.isFinite(p.width)&&Number.isFinite(p.height))){verifiedProfiles=qa.profiles;}
} catch {}
// Read-only normal-jump budget, including coyote time; no gameplay formula is changed.
const physicsMatch=baseline.match(/At=\{gravity:([^,]+),maxSpeed:([^,]+),[^}]+jumpVelocity:([^,]+),[^}]+coyote:([^,]+),/);
if(!physicsMatch||verifiedProfiles.length!==2)throw Error('Cannot verify falling-log jump budget from immutable core');
const fallScope=vm.createContext({});vm.runInContext(get('src/falling-bridge-tree.mjs')+';this.audit=fallingLogJumpAudit',fallScope);
const logCfg=derived.config('falling-bridge-tree','fallen-bridge-tree');
const normalJump=fallScope.audit(logCfg,{gravity:Number(physicsMatch[1]),maxSpeed:Number(physicsMatch[2]),jumpVelocity:Number(physicsMatch[3]),coyote:Number(physicsMatch[4]),bodyWidth:Math.max(...verifiedProfiles.map(p=>p.width))});
if(!normalJump.safe)throw Error('Falling log would bypass ordinary tape crossing: '+JSON.stringify(normalJump));
writeFileSync(resolve(root,'dist/m477-s2-normal-jump-audit.json'),JSON.stringify(normalJump,null,2)+'\n');
const staticSnapshot={source:'stage-json-only',stageId:stage.stageId,world:stage.world,
 surfaces:stage.world.forestExtension?.surfaces||stage.world.terrain?.surfaces||[],
 anchors:derived.anchors.anchors,profiles:verifiedProfiles,tape:{maxLength:tapeMaxLength},crossings:stage.ropeCrossings||[]};
const staticReport=validateRopeCrossingSafety(staticSnapshot);
assertRopeCrossingGate(staticReport,{allowNotTested:true});
writeFileSync(resolve(root,'dist/m477-s2-static-safety-report.json'),JSON.stringify(staticReport,null,2)+'\n');
writeFileSync(resolve(root,'stages/s01.modules.json'),JSON.stringify(derived.modules,null,2)+'\n');
writeFileSync(resolve(root,'stages/s01.anchors.json'),JSON.stringify(derived.anchors,null,2)+'\n');
let html=baseline.replace(banner,'M4.7.7-S2 — Root Forest · modular rope safety validation');
// Replace the named historical visual module exactly once; retain immutable baseline bytes.
const forest=get('src/forest-parallax.mjs');
if((html.match(/<script id="rb-m46-0">/g)||[]).length!==1)throw Error('Parallax script identity mismatch');
html=html.replace(/(<script id="rb-m46-0">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+'\n'+forest+'\ninstallForestParallax(window.__RBM46_IMAGES);\n'+b);
// Add read-only per-frame visual diagnostics to the existing telemetry sampler.
const sampleMarker='      position: { x: roundNum(player.x), y: roundNum(player.y) },';
if(html.split(sampleMarker).length!==2)throw Error('Telemetry sample marker mismatch');
html=html.replace(sampleMarker,`      camera: {scrollX:scene.cameras.main.scrollX,scrollY:scene.cameras.main.scrollY},
      parallax: scene.__rbForestParallax?.snapshot?.() ?? null,
      webResponse: scene.__rbWebResponse?.snapshot?.() ?? null,
`+sampleMarker);
// Replace only the historical spider sidecar with its narrowly gated successor.
html=html.replace(/(<script id="rb-m43-ceiling-spider">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+'\n// Installed through the Scene Composer below.\n'+b);
let scripts='<script id="rb-m472-rope-safety">\n(()=>{\n'+get('src/validation/rope-crossing-safety.mjs').replace(/^export /gm,'')+`\nwindow.__RBRopeCrossingSafety={
 validate:validateRopeCrossingSafety,gate:assertRopeCrossingGate,
 snapshot:()=>window.__RBStageV1?.getRopeCrossingSnapshot(window.__game?.scene?.getScene?.('Game')),
 report:()=>validateRopeCrossingSafety(window.__RBRopeCrossingSafety.snapshot())};\n})();\n</script>\n`;
scripts+='<script id="rb-m471-stage-data">window.__RB_TAPE_RANGE_FROM_SOURCE='+tapeMaxLength+';window.__RB_STAGE_V1_DATA='+JSON.stringify(stage).replaceAll('<','\\u003c')+';</script>\n';
scripts+='<script id="rb-m471-stage-loader">\n'+stageLoader.replace(/^export /gm,'')+'\ninstallStageLoader();\n</script>\n';
const managed=get('src/managed-actor.mjs');
scripts+='<script id="rb-m471-managed-actor">\n'+managed+'\n</script>\n';
const fixtureData=JSON.parse(get('stages/m470-world-fixture.json'));
scripts+='<script id="rb-m470-world-fixture">\nwindow.__RBM471Fixture='+JSON.stringify(fixtureData)+';\n</script>\n';

const transition=get('src/transition-controller.mjs');
const experiments=['a','b'].map(id=>JSON.parse(get('stages/transition-experiment-'+id+'.json')));
scripts+='<script id="rb-m471-transition">\n'+transition+'\nwindow.__RBTransitionExperiments='+JSON.stringify(experiments)+';\n</script>\n';
const visualManifest=JSON.parse(get('assets/rafi-run-prototype.asset.json'));
const visualVM=vm.createContext({});vm.runInContext(get('src/rafi-run-sprite.mjs')+';this.validate=validateRafiRunAsset;',visualVM);
const visualCheck=visualVM.validate(visualManifest);if(!visualCheck.ok)throw Error(visualCheck.errors.join('; '));
const png=readFileSync(resolve(root,visualManifest.assetPath));
if(png.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||png.readUInt32BE(16)!==visualManifest.width||png.readUInt32BE(20)!==visualManifest.height||sha(png)!==visualManifest.sha256)throw Error('Sprite PNG bytes/dimensions differ from asset manifest');
scripts+='<script id="rb-m477-visual-asset">window.__RBRafiRunAssetData='+JSON.stringify({manifest:visualManifest,png:png.toString('base64')}).replaceAll('<','\\u003c')+';</script>\n';
const composer=get('src/scene-composer.mjs');
scripts+='<script id="rb-m471-scene-composer">\n'+composer.replace(/^export /gm,'')+'\ncreateRBSceneComposer();\n</script>\n';
scripts+='<script id="rb-m477-s2-enemy-runtime">\n'+get('src/enemy-prefabs.mjs')+'\n</script>\n';
const sources=[['forest-extension.mjs','installForestExtension()'],['stage-modules.mjs','installStageModules()'],['bridge-polish.mjs','installBridgePolish()'],['stage-dressing.mjs','installStageDressing()'],['environmental-anchors.mjs','installEnvironmentalAnchors()'],['rotten-root.mjs','installRottenRoot()'],['falling-bridge-tree.mjs','installFallingBridgeTree()'],['exit-grove.mjs','installExitGrove()'],['web-response.mjs','installWebResponse()'],['collapsing-platform.mjs','installCollapsingPlatforms()'],['rafi-run-sprite.mjs','installRafiRunPrototype()'],['ceiling-spider.mjs','installCeilingSpider()']];
for(const [i,[file,installer]] of sources.entries()){
 const src=get('src/'+file);if(/\bimport\s/.test(src))throw Error('Unexpected import: '+file);
 scripts+=`<script id="rb-m471-${i}">\n${src.replace(/^export /gm,'')}\n${installer};\n</script>\n`;
}
scripts+='<script id="rb-m471-composer-start">window.__RBSceneComposerV1.start();</script>\n';
const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body tag');
html=html.slice(0,at)+scripts+html.slice(at);
for(const key of ['rb-m46-art-data','rb-m45-egg-sac','rb-m44-sticky-web','rb-m43-ceiling-spider'])if(!html.includes(`id="${key}"`))throw Error('Missing baseline module '+key);
for(const [i,m] of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].entries())new vm.Script(m[1],{filename:'inline-'+i});
const out='Rafael_Brothers_M477_S2_ENEMY_PREFABS.html';writeFileSync(resolve(root,'dist',out),html);
writeFileSync(resolve(root,'dist/m477-s2-build-manifest.json'),JSON.stringify({version:'M4.7.7-S2',enemyRuntimeSha256:sha(get('src/enemy-prefabs.mjs')),visualAssetSha256:sha(png),visualManifestSha256:sha(get('assets/rafi-run-prototype.asset.json')),safetyValidatorSha256:sha(get('src/validation/rope-crossing-safety.mjs')),staticSafetyStatus:staticReport.status,staticProfilesVerified:verifiedProfiles.length===2,stageSha256:sha(get('stages/s01.stage.json')),baselineSha256:sha(baseline),transitionSha256:sha(transition),managedSha256:sha(managed),composerSha256:sha(composer),loaderSha256:sha(stageLoader),finalSha256:sha(html),forestSha256:sha(forest),files:Object.fromEntries(sources.map(([f])=>[f,sha(get('src/'+f))]))},null,2)+'\n');
console.log(out,Buffer.byteLength(html),'bytes');
