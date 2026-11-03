/** M4.7.1: Stage01 post-legacy forest extension. Uses the *existing* Arcade solids
 * group/collider for extension-only surfaces, NOT the isolated world.terrain POC.
 * The original two ground solids and tape formulas are never recreated.
 */
function installForestExtension(win=globalThis){
 if(win.__RBForestExtensionInstalled)return win.__RBForestExtension||null;
 function attach(scene){
  if(scene.__rbForestExtension)scene.__rbForestExtension.destroy();
  const extension=win.__RBStageV1?.getForestExtension?.(),world=win.__RBStageV1?.getWorld?.();
  const exit=win.__RBStageV1?.getConfig('exit-grove','forest-exit-grove');
  if(!extension||!world||!exit)throw Error('Stage01 forest extension config missing');
  if(!scene.world?.solids||!scene.world?.level||!scene.player)throw Error('Legacy forest ground unavailable');
  // Prevent overlap with the previous last ground solid, not just a visual join.
  const old=scene.world.solidRects||[];
  if(!old.some(r=>Math.abs(r.x+r.w-extension.joinX)<.01&&r.y===extension.surfaces[0].y))throw Error('Forest join does not meet an existing solid');
  for(const surface of extension.surfaces)if(old.some(r=>r.x<surface.x+surface.w&&r.x+r.w>surface.x&&r.y<surface.y+surface.h&&r.y+r.h>surface.y))throw Error('Duplicate ground collision');
  const previous={width:scene.world.level.width,gate:{...scene.world.level.gate},physics:{x:scene.physics.world.bounds.x,y:scene.physics.world.bounds.y,width:scene.physics.world.bounds.width,height:scene.physics.world.bounds.height},camera:{x:scene.cameras.main._bounds.x,y:scene.cameras.main._bounds.y,width:scene.cameras.main._bounds.width,height:scene.cameras.main._bounds.height}};
  return createRBManagedActor({id:'forest-extension',scene,sceneLifecycle:!win.__RBSceneComposerV1,
   enabled:()=>true,onState:(id,state)=>win.__RBSceneComposerV1?.recordState?.(id,state),create(scope){
    // Text-only readability repair: dispatch through the existing Game Core hints.
    const guidance=win.__RBStageV1.getGuidance?.(),priorCopy={name:scene.world.level.name,hints:scene.world.level.hints,areas:scene.world.level.areas,registry:scene.registry.get('levelName')};
    if(guidance){scene.world.level.name=guidance.name;scene.world.level.hints=guidance.hints;scene.world.level.areas=guidance.areas;scene.registry.set('levelName',guidance.name);
      scope.defer(()=>{scene.world.level.name=priorCopy.name;scene.world.level.hints=priorCopy.hints;scene.world.level.areas=priorCopy.areas;scene.registry.set('levelName',priorCopy.registry);});}
    const graphics=scope.gameObject(scene.add.graphics().setDepth(6.4));
    const surfaces=[];
    // Scope owns each extension body; the original world.solids group supplies the
    // original tape collision/visibility and existing player collision group.
    for(const def of extension.surfaces){
     const zone=scope.gameObject(scene.add.zone(def.x+def.w/2,def.y+def.h/2,def.w,def.h));
     scene.physics.add.existing(zone,true);zone.body.setSize(def.w,def.h).updateFromGameObject();
     scene.world.solids.add(zone);scope.body(zone.body);
     const rect={x:def.x,y:def.y,w:def.w,h:def.h};
     scene.world.solidRects.push(rect);
     scope.defer(()=>{const i=scene.world.solidRects.indexOf(rect);if(i!==-1)scene.world.solidRects.splice(i,1);});
     surfaces.push({id:def.id,zone,rect});
    }
    const resetWorld=()=>{scene.world.level.width=previous.width;scene.world.level.gate={...previous.gate};scene.physics.world.setBounds(previous.physics.x,previous.physics.y,previous.physics.width,previous.physics.height);scene.cameras.main.setBounds(previous.camera.x,previous.camera.y,previous.camera.width,previous.camera.height);};
    scope.defer(resetWorld);
    scene.world.level.width=world.width;
    scene.world.level.gate={x:exit.gateX,y:exit.gateY};
    scene.physics.world.setBounds(0,0,world.width,world.height+400);
    scene.cameras.main.setBounds(0,0,world.width,world.height);
    for(const [index,def] of extension.surfaces.entries()){
     const {x,y,w,h}=def;
     graphics.fillStyle(index?0x203729:0x192e26,1).fillRect(x,y,w,h);
     graphics.fillStyle(0x486348,1).fillRect(x,y,w,8);
     graphics.lineStyle(3,0x7a9b63,.86).lineBetween(x,y+2,x+w,y+2);
     for(let i=0;i<Math.floor(w/28);i++){
      const px=x+14+i*28,dy=15+i%3*7;
      graphics.lineStyle(5,0x345840,.83).lineBetween(px,y+5,px-7,y+dy+17);
      graphics.lineStyle(2,0x77916a,.55).lineBetween(px+8,y+6,px+11,y-dy);
     }
     for(let j=0;j<5;j++){const yy=y+35+j*24;
      graphics.lineStyle(2,j%2?0x3e6041:0x30503a,.55).lineBetween(x+4,yy,x+w-6,yy+4);}
    }
    const runtime={version:'M4.7.1',surfaces,graphics,snapshot:()=>({worldWidth:scene.world.level.width,cameraWidth:scene.cameras.main._bounds.width,gate:{...scene.world.level.gate},surfaces:surfaces.map(p=>({id:p.id,x:p.zone.body.x,y:p.zone.body.y,w:p.zone.body.width,h:p.zone.body.height,enabled:p.zone.body.enable})),ownedSurfaces:surfaces.length})};
    scope.reference(scene,'__rbForestExtension',runtime);scope.reference(win,'__RBForestExtension',runtime);
    return runtime;
   }});
 }
 if(win.__RBSceneComposerV1){win.__RBSceneComposerV1.register('forest-extension',attach);win.__RBForestExtensionInstalled=true;return win.__RBForestExtension||null;}
 throw Error('M471 forest extension requires the existing SceneComposer');
}
