/** M4.7.5: anchor-local cosmetic tension only. Decorative forest owns its own
 * camera transform. This component never writes a background or physics body. */
function installWebResponse(win=globalThis){
 if(win.__RBWebResponseInstalled)return win.__RBWebResponse||null;
 if(typeof win.__RBWebResponseEnabled!=='boolean')win.__RBWebResponseEnabled=true;
 const doc=win.document;const toggle=doc.createElement('button');toggle.type='button';toggle.id='rb-m464-web-response-toggle';toggle.style.cssText='display:none;background:#112d2e;color:#d1e9db;border:1px solid #779b91;padding:7px 10px;cursor:pointer';
 const refresh=()=>toggle.textContent='M4.6.4 Web Response: '+(win.__RBWebResponseEnabled?'ON':'OFF');refresh();
 toggle.addEventListener('click',()=>{win.__RBWebResponseEnabled=!win.__RBWebResponseEnabled;refresh();toggle.blur();});doc.body.append(toggle);
 function attach(scene){
 const cfg=win.__RB_STAGE_V1_DATA?.backgrounds?.webResponse||{anchor:{x:514,y:290},maxDeflection:3.5,responseHz:12};

  if(scene.__rbWebResponse)scene.__rbWebResponse.destroy();
  const g=scene.add.graphics().setDepth(-12);let deflect=0,speed=0,loaded=false;
  function update(_time,delta){
    const tap=scene.tape,body=scene.player?.body2;
    if(!body)return;
    const enabled=win.__RBWebResponseEnabled!==false;
    const swinging=enabled&&!!tap?.attached;
    const original=!!(swinging && tap.anchor?.x===cfg.anchor.x && tap.anchor?.y===cfg.anchor.y);
    const dist=original?Math.hypot(body.center.x-tap.anchor.x,body.center.y-tap.anchor.y):0;
    const ratio=original&&tap.length?dist/tap.length:0;
    loaded=original&&ratio>.985;
    const target=loaded?Math.max(-cfg.maxDeflection,Math.min(cfg.maxDeflection,(body.velocity.x||0)*.008)):0;
    // Analytic critically damped cosmetic spring, seconds-based, capped for tab resume.
    const dt=Math.max(0,Math.min(.05,(delta||scene.game.loop.delta||16.667)/1000));
    const omega=cfg.responseHz,e=Math.exp(-omega*dt),d=deflect-target,v=speed+omega*d;
    deflect=target+(d+v*dt)*e;speed=(speed-omega*v*dt)*e;
    if(!enabled){deflect=0;speed=0;loaded=false;}
    g.clear();if(!enabled||Math.abs(deflect)<.14||!scene.sys.isActive())return;
    // Local strands are attached to the marked pit root, not the whole swamp.
    const x=cfg.anchor.x,y=cfg.anchor.y;
    for(let i=0;i<3;i++){
      const n=i-1;g.lineStyle(1,0xb4d0be,.25);g.beginPath();g.moveTo(x-15+n*9,y-27);g.lineTo(x+16+n*11+deflect*(1-Math.abs(n)*.2),y+4+n*5);g.lineTo(x+44+n*14,y-15+n*8);g.strokePath();
    }
  }
  const runtime={version:'M4.7.5',snapshot:()=>({enabled:win.__RBWebResponseEnabled!==false,loaded,deflection:deflect,role:'anchor-local cosmetic',source:loaded?'attached-anchor-load':'rest',backgroundWrites:false,anchor:{x:cfg.anchor.x,y:cfg.anchor.y},maxDeflection:cfg.maxDeflection}),
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
