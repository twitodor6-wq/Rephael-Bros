/** M4.6.1: larger organically drawn root shelf and meaningful broken supports.
 * Old M4.6 overlay is retained for rollback but its collider/drawings disabled.
 * Never makes the x370..706 main gap walkable. Uses original Arcade player only.
 */
// Geometry is supplied by the validated Stage Loader, not by a second hardcoded map.
function rootBridgeConfig(win=globalThis){
 const cfg=win.__RBStageV1?.getConfig('root-bridge','living-root-shelf');
 if(!cfg)throw Error('Missing Stage 01 root-bridge prefab');
 return cfg;
}
function bridgePolishSafe(c){const b=c.shelf;return b.x>=c.pit.end+10&&b.x+b.w<c.worldEnd-20&&b.y>=380&&b.y<425&&c.brokenLeft.x+c.brokenLeft.w<c.brokenRight.x-65;}
function installBridgePolish(win=globalThis){
 if(win.__RBBridgePolishInstalled)return win.__RBBridgePolish;
 function attach(scene){
  const prior=scene.__rbBridgePolish;if(prior)prior.destroy();
  const c=rootBridgeConfig(win),b=c.shelf;
  if(!bridgePolishSafe(c))throw Error('unsafe root bridge geometry');
  let lockLegacy=()=>{};
  return createRBManagedActor({id:'bridge-polish',scene,sceneLifecycle:!win.__RBSceneComposerV1,enabled:()=>win.__RBRootBridgesEnabled!==false,
   sync:()=>lockLegacy(),onState:(id,state)=>win.__RBSceneComposerV1?.recordState?.(id,state),create(scope){
  const root=scope.gameObject(scene.add.graphics().setDepth(12)),broken=scope.gameObject(scene.add.graphics().setDepth(11));
  const zone=scope.gameObject(scene.add.zone(b.x+b.w/2,b.y+b.h/2,b.w,b.h));scene.physics.add.existing(zone,true);
  scope.body(zone.body);
  zone.body.setSize(b.w,b.h);zone.body.updateFromGameObject();
  const collider=scope.collider(scene.physics.add.collider(scene.player,zone,undefined,player=>{
    const body=player?.body;return !!body&&body.velocity.y>=0&&body.prev.y+body.height<=b.y+6;
  }));
  function strokes(g,x0,x1,y,width,seed){
    for(let i=0;i<7;i++){const xx=x0+(x1-x0)*i/7;
      g.lineStyle(1.4,0x98aa7b,.26);g.beginPath();g.moveTo(xx,y+2+(i%2));g.lineTo(xx+width/3,y+6+(i%3)*2);g.lineTo(xx+width/2,y+2+(i%2));g.strokePath();}
  }
  function draw(){root.clear();broken.clear();
    // Walking shelf is a thick living ROOT reaching from the left landing edge
    // into the massive far-side root wall. Its horizontal playable surface stays exact.
    root.fillStyle(0x1c3026,1);root.fillRoundedRect(b.x-8,b.y+5,b.w+16,24,12);
    root.fillStyle(0x425a3d,1);root.fillRoundedRect(b.x-8,b.y,b.w+16,11,6);
    root.lineStyle(5,0x6c815b,.96);root.beginPath();root.moveTo(b.x-7,b.y+2);root.lineTo(b.x+70,b.y-2);root.lineTo(b.x+120,b.y+1);root.lineTo(b.x+b.w+6,b.y+2);root.strokePath();
    root.lineStyle(2,0xa4b389,.48);root.lineBetween(b.x+6,b.y+3,b.x+b.w-8,b.y+3);
    for(let i=0;i<7;i++){let px=b.x+10+i*26;
      root.lineStyle(3.5,0x2b4633,.95);root.beginPath();root.moveTo(px,b.y+14);root.lineTo(px+5,b.y+38+i%3*9);root.lineTo(px-4,b.y+45+i%2*8);root.strokePath();
      root.lineStyle(1.8,0x6f9270,.6);root.lineBetween(px+5,b.y+2,px+11,b.y-4-i%3*3);
    }strokes(root,b.x,b.x+b.w,b.y,18,0);
    // Cosmetic hanging remnants: no horizontal walking edge and no collision bodies.
    if(c.decorativeOnly){
      for(const [v,left] of [[c.brokenLeft,true],[c.brokenRight,false]]){
        const start=left?v.x:v.x+v.w,end=left?v.x+v.w:v.x,drop=c.decorativeDrop;
        broken.lineStyle(12,0x1b3026,.85).beginPath().moveTo(start,v.y-2).lineTo(start+(end-start)*.24,v.y+drop*.5).lineTo(start+(end-start)*.6,v.y+drop*.85).lineTo(end,v.y+drop+10).strokePath();
        broken.lineStyle(4,0x4a6041,.7).beginPath().moveTo(start,v.y-3).lineTo(start+(end-start)*.3,v.y+drop*.55).lineTo(end,v.y+drop+6).strokePath();
        for(let n=1;n<5;n++){const x=start+(end-start)*n/5,y=v.y+drop*n/5;broken.lineStyle(1.6,0x58704c,.5).lineBetween(x,y,x+(left?7:-7),y+16+n*2);}
      }
      const mount=c.legacyHookMount,a=mount?scene.tape.anchors[mount.anchorIndex]:null;
      if(a){
        root.lineStyle(22,0x24362a,.98).beginPath().moveTo(a.x-72,mount.canopyY).lineTo(a.x-51,a.y-150).lineTo(a.x-30,a.y-105).lineTo(a.x-8,a.y-35).lineTo(a.x,a.y).strokePath();
        root.lineStyle(9,0x5b6544,.95).beginPath().moveTo(a.x-75,mount.canopyY).lineTo(a.x-46,a.y-150).lineTo(a.x-27,a.y-105).lineTo(a.x-8,a.y-34).lineTo(a.x,a.y).strokePath();
        root.lineStyle(7,0x46593e,.95).beginPath().moveTo(a.x+28,a.y-90).lineTo(a.x+16,a.y-58).lineTo(a.x,a.y).strokePath();
        root.lineStyle(2,0x9aa47b,.5).lineBetween(a.x-42,a.y-148,a.x-7,a.y-31);
        root.fillStyle(0x1b3026,1).fillCircle(a.x,a.y,10);root.lineStyle(2,0xbed49a,.9).strokeCircle(a.x,a.y,8);root.fillStyle(0xe7cd84,1).fillCircle(a.x,a.y,4);
      }
      return;
    }
    // Fractured root beam A: grows from left embankment, then ends in exposed splinters.
    const left=c.brokenLeft,right=c.brokenRight;
    for(const [v,isLeft] of [[left,true],[right,false]]){
      const inner=isLeft?v.x+v.w:v.x;
      broken.lineStyle(23,0x203729,1);broken.beginPath();broken.moveTo(v.x,v.y+9);broken.lineTo(v.x+v.w*.36,v.y-8);
      broken.lineTo(v.x+v.w*.7,v.y+3);broken.lineTo(v.x+v.w,v.y-8);broken.strokePath();
      broken.lineStyle(9,0x57714e,.98);broken.beginPath();broken.moveTo(v.x,v.y-1);broken.lineTo(v.x+v.w*.4,v.y-19);broken.lineTo(v.x+v.w*.73,v.y-11);broken.lineTo(v.x+v.w,v.y-19);broken.strokePath();
      broken.lineStyle(2,0x9bad82,.6);broken.lineBetween(v.x+4,v.y-5,v.x+v.w*.66,v.y-15);
      for(let i=0;i<6;i++){
        const base=inner+(isLeft?-2:2),dir=isLeft?1:-1;
        broken.lineStyle(i%2?2:3,0xa68a5b,.9);broken.lineBetween(base,v.y-14+(i-3)*2,base+dir*(15+(i%3)*5),v.y-18+(i-3)*7);
      }
      for(let i=0;i<3;i++){let px=v.x+20+i*30;broken.lineStyle(3,0x2c4e35,.95);broken.lineBetween(px,v.y+8,px+4,v.y+37+(i%2)*10);}
    }
  }
  draw();
  // M4.6 installs asynchronously and may wrap scene.create AFTER this module.
  // Discover its runtime lazily and decorate its update so there is never a
  // frame in which both the original shelf and the replacement collide.
  function lockOld(){
    const old=scene.__rbRootBridges;
    if(!old)return null;
    if(!old.__rb461Locked){
      const priorUpdate=old.update.bind(old);
      old.update=function(){priorUpdate();this.graphics?.setVisible(false);this.shattered?.setVisible(false);this.collider.active=false;this.zone.body.enable=false;};
      old.__rb461Locked=true;
    }
    old.update();return old;
  }
  // The anchor registry still owns hook identity and release. This lease only
  // suppresses the bridge hook while its actual collider is unavailable.
  let registry=null,leased=null;
  const syncAnchor=on=>{const reg=scene.__rbStageAnchors;if(!reg)return;
    if(reg!==registry||leased!==on){registry=reg;leased=on;
      if(on)reg.clearOverride('stable-root-bridge');else reg.setActive('stable-root-bridge',false);
      reg.sync();
    }
  };
  scope.resource(null,()=>scene.__rbStageAnchors?.setActive('stable-root-bridge',false),(_,on)=>syncAnchor(on));
  lockLegacy=()=>{lockOld();syncAnchor(scope.snapshot().enabled);};
  const runtime={version:'M4.6.8',root,broken,zone,collider,
    snapshot:()=>({enabled:win.__RBRootBridgesEnabled,legacyDisabled:!!scene.__rbRootBridges&&!scene.__rbRootBridges.zone.body.enable&&!scene.__rbRootBridges.collider.active,
      bounds:{x:zone.body.x,y:zone.body.y,w:zone.body.width,h:zone.body.height},decorativeGap:c.brokenRight.x-(c.brokenLeft.x+c.brokenLeft.w),pit:{...c.pit},safe:bridgePolishSafe(c),decorativeOnly:c.decorativeOnly===true,decorativeDrop:c.decorativeDrop||0,brokenColliderCount:0,colliderActive:collider.active})};
  scope.reference(scene,'__rbBridgePolish',runtime);scope.reference(win,'__RBBridgePolish',runtime);
  scope.binding(win.__RBStageV1,'root-bridge','living-root-shelf',runtime);
  return runtime;
  }});

 }
 function patch(){const scene=win.__game?.scene?.getScene?.('Game');if(!scene)return false;
   const proto=Object.getPrototypeOf(scene);
   if(!proto.__rbM461BridgePatched){const old=proto.create;proto.create=function(){let r=old.apply(this,arguments);attach(this);return r;};proto.__rbM461BridgePatched=true;}
   if(scene.sys?.isActive?.()&&scene.player&&!scene.__rbBridgePolish)attach(scene);
   win.__RBBridgePolishInstalled=true;return true;
 }
 if(win.__RBSceneComposerV1){win.__RBSceneComposerV1.register('bridge-polish',attach);win.__RBBridgePolishInstalled=true;return win.__RBBridgePolish||null;}
 if(!patch()){const t=setInterval(()=>{if(patch())clearInterval(t);},50);setTimeout(()=>clearInterval(t),8000);}return win.__RBBridgePolish||null;
}
