/** M4.6.1: visual-only earth cutaways and living exit-root accents.
 * No mutation of collision rectangles, portal trigger or world.level.
 */
const STAGE_DRESSING_CONFIG=Object.freeze({ground:[{x:70,w:300},{x:706,w:270}],top:490,bottom:660,gate:null});
function installStageDressing(win=globalThis){
 if(win.__RBStageDressingInstalled)return win.__RBStageDressing||null;
 if(typeof win.__RBStageDressingEnabled!=='boolean')win.__RBStageDressingEnabled=true;
 const button=win.document?.createElement('button');
 if(button){button.id='rb-m461-dressing-toggle';button.type='button';button.textContent='M4.6.1 Dressing: ON';button.style.cssText='display:none;background:#092626;color:#d6ebd3;border:1px solid #648d6e;padding:7px 10px;cursor:pointer';
  button.addEventListener('click',()=>{win.__RBStageDressingEnabled=!win.__RBStageDressingEnabled;button.textContent='M4.6.1 Dressing: '+(win.__RBStageDressingEnabled?'ON':'OFF');win.__RBStageDressing?.update();button.blur();});
  win.document.body.append(button);
 }

 function attach(scene){
   if(scene.__rbStageDressing)scene.__rbStageDressing.destroy();
   return createRBManagedActor({id:'stage-dressing',scene,sceneLifecycle:!win.__RBSceneComposerV1,enabled:()=>win.__RBStageDressingEnabled!==false,
    onState:(id,state)=>win.__RBSceneComposerV1?.recordState?.(id,state),create(scope){
   const soil=scope.gameObject(scene.add.graphics().setDepth(5.5)),vines=scope.gameObject(scene.add.graphics().setDepth(14));
   function render(){soil.clear();vines.clear();
     for(const g of STAGE_DRESSING_CONFIG.ground){const {x,w}=g,y=490;
       soil.fillStyle(0x142620,1);soil.fillRect(x+2,y+6,w-4,164);
       soil.fillStyle(0x263d2a,1);soil.fillRect(x+2,y+7,w-4,25);
       for(let k=0;k<8;k++){let py=y+27+k*19;soil.lineStyle(k%2?2:3,k%2?0x385542:0x243e31,.54);
         soil.beginPath();soil.moveTo(x+4,py+5);soil.lineTo(x+w*.32,py-7);soil.lineTo(x+w*.62,py+5);soil.lineTo(x+w-5,py-4);soil.strokePath();}
       for(let i=0;i<11;i++){const xx=x+9+i*(w-20)/10,depth=(i%4)*9+11;
         soil.lineStyle(3,i%2?0x466345:0x375540,.7);soil.beginPath();soil.moveTo(xx,y+5);soil.lineTo(xx+3,y+depth);soil.lineTo(xx-7,y+depth+14);soil.strokePath();}
       soil.fillStyle(0x557c4e,.98);soil.fillRect(x,y,w,6);
       soil.lineStyle(2,0x8d9e6b,.72);soil.lineBetween(x,y+2,x+w,y+2);
       for(let i=0;i<19;i++){let xx=x+3+i*(w-6)/18;soil.lineStyle(1.5,0x426a46,.75);soil.lineBetween(xx,y+2,xx+(i%2?4:-3),y-5-i%3*2);}
     }
     // Organic frame accents on inherited portal artwork: remain inside world coordinates.
     const x=win.__RBStageV1?.getConfig('exit-grove','forest-exit-grove')?.gateX;
     if(!Number.isFinite(x))throw Error('Missing Stage JSON exit for dressing');
     for(let side of [-1,1]){
        const dx=x+side*75;
        vines.lineStyle(9,0x1a3727,.87);vines.beginPath();vines.moveTo(dx,489);vines.lineTo(dx+side*2,405);vines.lineTo(dx-side*10,344);vines.lineTo(x+side*47,309);vines.strokePath();
        vines.lineStyle(4,0x416b43,.88);vines.beginPath();vines.moveTo(dx+side*3,484);vines.lineTo(dx+side*1,408);vines.lineTo(dx-side*13,342);vines.strokePath();
        for(let i=0;i<6;i++){const xx=dx-side*(i%3*5),yy=476-i*24;
          vines.fillStyle(0x3d6740,.75);vines.fillEllipse(xx-side*10,yy,17,7);}
     }
     vines.lineStyle(4,0x55794a,.58);vines.beginPath();vines.arc(x,340,52,Math.PI*1.07,Math.PI*1.93,false);vines.strokePath();
   }render();
   const runtime={version:'M4.6.8',soil,vines,snapshot:()=>({enabled:win.__RBStageDressingEnabled,groundCount:2,originalGeometryIntact:STAGE_DRESSING_CONFIG})};
   scope.reference(scene,'__rbStageDressing',runtime);scope.reference(win,'__RBStageDressing',runtime);
   return runtime;
   }});

 }
 function patch(){const scene=win.__game?.scene?.getScene?.('Game');if(!scene)return false;const proto=Object.getPrototypeOf(scene);
   if(!proto.__rbM461DressPatched){const old=proto.create;proto.create=function(){const result=old.apply(this,arguments);attach(this);return result;};proto.__rbM461DressPatched=true;}
   if(scene.sys?.isActive?.()&&scene.player&&!scene.__rbStageDressing)attach(scene);
   win.__RBStageDressingInstalled=true;return true;
 }
 if(win.__RBSceneComposerV1){win.__RBSceneComposerV1.register('stage-dressing',attach);win.__RBStageDressingInstalled=true;return win.__RBStageDressing||null;}
 if(!patch()){const t=setInterval(()=>{if(patch())clearInterval(t);},50);setTimeout(()=>clearInterval(t),8000);}return win.__RBStageDressing;
}
