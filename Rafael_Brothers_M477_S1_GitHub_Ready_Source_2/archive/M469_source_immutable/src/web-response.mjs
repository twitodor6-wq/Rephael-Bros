/** M4.6.4: conservative visual differentiation between parallax and attached-web tension.
 * Mid and near background offsets are low-pass-filtered to prevent rigid web
 * artwork from tracking every rapid swing. A tiny secondary locally anchored
 * web responds only when the original pit anchor itself is loaded by the tape.
 * This is a cosmetic spring, not measured real-world tension or soft-body sim.
 */
const RB_WEB_RESPONSE=Object.freeze({anchorX:514,anchorY:290,maxDeflection:3.5,nearFollow:.17,midFollow:.11});
function installWebResponse(win=globalThis){
 if(win.__RBWebResponseInstalled)return win.__RBWebResponse||null;
 if(typeof win.__RBWebResponseEnabled!=='boolean')win.__RBWebResponseEnabled=true;
 const doc=win.document;const toggle=doc.createElement('button');toggle.type='button';toggle.id='rb-m464-web-response-toggle';toggle.style.cssText='display:none;background:#112d2e;color:#d1e9db;border:1px solid #779b91;padding:7px 10px;cursor:pointer';
 const refresh=()=>toggle.textContent='M4.6.4 Web Response: '+(win.__RBWebResponseEnabled?'ON':'OFF');refresh();
 toggle.addEventListener('click',()=>{win.__RBWebResponseEnabled=!win.__RBWebResponseEnabled;refresh();toggle.blur();});doc.body.append(toggle);
 function attach(scene){
  if(scene.__rbWebResponse)scene.__rbWebResponse.destroy();
  const g=scene.add.graphics().setDepth(-12);const last={mid:null,near:null};let deflect=0,speed=0,loaded=false;
  function update(){
    const par=scene.__rbForestParallax;const tap=scene.tape,body=scene.player?.body2;
    if(!body)return;
    const enabled=win.__RBWebResponseEnabled!==false;
    const swinging=enabled&&!!tap?.attached;
    for(const key of ['mid','near']){
      const sprite=par?.layers?.[key];if(!sprite)continue;
      const raw=sprite.x;
      if(last[key]===null)last[key]=raw;
      const k=swinging?(key==='mid'?RB_WEB_RESPONSE.midFollow:RB_WEB_RESPONSE.nearFollow):.28;
      last[key]+=(raw-last[key])*k;
      if(enabled) sprite.x=last[key]; else last[key]=raw;
    }
    const original=!!(swinging && tap.anchor?.x===RB_WEB_RESPONSE.anchorX && tap.anchor?.y===RB_WEB_RESPONSE.anchorY);
    const dist=original?Math.hypot(body.center.x-tap.anchor.x,body.center.y-tap.anchor.y):0;
    const ratio=original&&tap.length?dist/tap.length:0;
    loaded=original&&ratio>.985;
    const target=loaded?Math.max(-RB_WEB_RESPONSE.maxDeflection,Math.min(RB_WEB_RESPONSE.maxDeflection,(body.velocity.x||0)*.008)):0;
    speed=(speed+(target-deflect)*.065)*.83;deflect+=speed;
    g.clear();if(!enabled||Math.abs(deflect)<.14||!scene.sys.isActive())return;
    // Local strands are attached to the marked pit root, not the whole swamp.
    const x=RB_WEB_RESPONSE.anchorX,y=RB_WEB_RESPONSE.anchorY;
    for(let i=0;i<3;i++){
      const n=i-1;g.lineStyle(1,0xb4d0be,.25);g.beginPath();g.moveTo(x-15+n*9,y-27);g.lineTo(x+16+n*11+deflect*(1-Math.abs(n)*.2),y+4+n*5);g.lineTo(x+44+n*14,y-15+n*8);g.strokePath();
    }
  }
  const runtime={version:'M4.6.4',snapshot:()=>({enabled:win.__RBWebResponseEnabled!==false,loaded,deflection:deflect,midOffset:last.mid,nearOffset:last.near,anchor:{x:RB_WEB_RESPONSE.anchorX,y:RB_WEB_RESPONSE.anchorY},maxDeflection:RB_WEB_RESPONSE.maxDeflection}),
    destroy(){scene.events.off('postupdate',update);g.destroy();if(scene.__rbWebResponse===runtime)scene.__rbWebResponse=null;if(win.__RBWebResponse===runtime)win.__RBWebResponse=null;}};
  scene.__rbWebResponse=runtime;win.__RBWebResponse=runtime;scene.events.on('postupdate',update);scene.events.once('shutdown',()=>runtime.destroy());return runtime;
 }
 function patch(){const scene=win.__game?.scene?.getScene?.('Game');if(!scene)return false;const proto=Object.getPrototypeOf(scene);
  if(!proto.__rbM464WebPatched){const old=proto.create;proto.create=function(){const v=old.apply(this,arguments);attach(this);return v;};proto.__rbM464WebPatched=true;}
  if(scene.sys?.isActive?.()&&scene.player&&!scene.__rbWebResponse)attach(scene);win.__RBWebResponseInstalled=true;return true;
 }
 if(win.__RBSceneComposerV1){win.__RBSceneComposerV1.register('web-response',attach);win.__RBWebResponseInstalled=true;return win.__RBWebResponse||null;}
 if(!patch()){const t=win.setInterval(()=>{if(patch())win.clearInterval(t);},50);win.setTimeout(()=>win.clearInterval(t),8000);}
 return win.__RBWebResponse||null;
}
