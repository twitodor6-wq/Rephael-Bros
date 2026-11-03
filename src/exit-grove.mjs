/** M4.6.4: organic exit grove + delayed finish trigger.
 * The old finish trigger begins x=844, ahead of the rotten shelf x858..946.
 * We preserve the world and only defer win until the player travels past the
 * shelf to the far right (x>=950), on lower walking ground. Reversible toggle.
 */
// Authored gate and finish coordinates are resolved exclusively from Stage JSON.
function installExitGrove(win=globalThis){
 if(win.__RBExitGroveInstalled)return win.__RBExitGrove||null;
 function attach(scene){
  if(scene.__rbExitGrove)scene.__rbExitGrove.destroy();
  const cfg=win.__RBStageV1?.getConfig('exit-grove','forest-exit-grove');if(!cfg)throw Error('Missing stage exit-grove prefab');
  const old=scene.world?.hooks?.win; if(typeof old!=='function')return null;
  const oldGate=scene.children.list.find(g=>g.type==='Graphics'&&g.depth===8&&g.commandBuffer?.includes(846)&&g.commandBuffer?.includes(265));
  const glow=scene.world.gateGlow; oldGate?.setVisible(false);glow?.setVisible(false);
  const g=scene.add.graphics().setDepth(8.7);
  // A natural arch of intertwined bark, roots, old leaves and faint spores.
  const x=cfg.gateX,y=cfg.gateY;
  function archLine(width,color,alpha,delta=0){
    g.lineStyle(width,color,alpha);g.beginPath();g.moveTo(x-46+delta,y);g.lineTo(x-44+delta,y-106);
    g.arc(x+delta,y-106,44,Math.PI,0,false);g.lineTo(x+44+delta,y);g.strokePath();
  }
  g.fillStyle(0x061b19,.32);g.fillEllipse(x,y-56,88,158);
  archLine(35,0x1c3025,1);archLine(24,0x4c4530,.98);archLine(11,0x334d35,1);
  archLine(3,0x8b9d6e,.49,-2);
  for(let i=0;i<13;i++){
    const side=i%2?-1:1,px=x+side*(46+(i%3)*4),py=y-12-(i*29)%95;
    g.lineStyle(2.8,0x334e34,.89);g.lineBetween(px,py,px-side*(11+i%3*4),py-17-i%4*6);
    g.fillStyle(i%3?0x3c6445:0x6c7953,.82);g.fillEllipse(px-side*(10+i%3*3),py-14,12+i%3*4,5+i%2*3);
  }
  for(let i=0;i<6;i++){
    g.lineStyle(1,0x9cae9c,.36);g.beginPath();g.moveTo(x-36+i*11,y-188);g.lineTo(x-4+i*2,y-163+(i%2)*3);g.lineTo(x+31-i*5,y-194);g.strokePath();
  }
  for(let i=0;i<5;i++){
    const px=x-25+i*12,py=y-150-(i%3)*19;
    g.fillStyle(i%2?0x83be91:0xb7c79d,.27).fillCircle(px,py,2+i%2);
  }
  let guards=0,finishCount=0;
  const guardedWin=()=>{
    const p=scene.player;
    if(!p||p.x<cfg.endX||p.y<cfg.minFootY){scene.world.won=false;guards++;return;}
    finishCount++;old();
  };
  scene.world.hooks.win=guardedWin;
  let destroyed=false;
  const runtime={version:'M4.6.6',oldGate,glow,graphics:g,
    snapshot:()=>({exitX:cfg.endX,finishCount,guards,portalType:'root-grove',legacyGateHidden:!!oldGate&&!oldGate.visible,glowHidden:!!glow&&!glow.visible,playerX:scene.player?.x,finished:scene.finished}),
    destroy(){if(destroyed)return;destroyed=true;scene.events.off('shutdown',onShutdown);if(scene.world?.hooks?.win===guardedWin)scene.world.hooks.win=old;oldGate?.setVisible(true);glow?.setVisible(true);g.destroy();win.__RBStageV1?.unbindRuntime('exit-grove','forest-exit-grove',runtime);if(scene.__rbExitGrove===runtime)scene.__rbExitGrove=null;if(win.__RBExitGrove===runtime)win.__RBExitGrove=null;}
  };
  scene.__rbExitGrove=runtime;win.__RBExitGrove=runtime;win.__RBStageV1?.bindRuntime('exit-grove','forest-exit-grove',runtime);
  const onShutdown=()=>runtime.destroy();scene.events.once('shutdown',onShutdown);return runtime;
 }
 function patch(){const scene=win.__game?.scene?.getScene?.('Game');if(!scene)return false;
  const proto=Object.getPrototypeOf(scene);
  if(!proto.__rbM464ExitPatched){const old=proto.create;proto.create=function(){const value=old.apply(this,arguments);attach(this);return value;};proto.__rbM464ExitPatched=true;}
  if(scene.sys?.isActive?.()&&scene.world&&!scene.__rbExitGrove)attach(scene);
  win.__RBExitGroveInstalled=true;return true;
 }
 if(win.__RBSceneComposerV1){win.__RBSceneComposerV1.register('exit-grove',attach);win.__RBExitGroveInstalled=true;return win.__RBExitGrove||null;}
 if(!patch()){const t=win.setInterval(()=>{if(patch())win.clearInterval(t);},50);win.setTimeout(()=>win.clearInterval(t),8000);}
 return win.__RBExitGrove||null;
}
