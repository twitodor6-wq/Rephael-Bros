/** M4.7.5: one camera-only owner. No actor fallback, integration, or attachment-dependent filter.
 * Fixed screen-space art keeps its existing opacity and layered depths. */
const FOREST_PARALLAX_CONFIG=Object.freeze({
 far:{factor:.04,depth:-98,alpha:.45,key:'rb_m46_far'},
 mid:{factor:.09,depth:-72,alpha:.65,key:'rb_m46_mid'},
 near:{factor:.16,depth:-52,alpha:.55,key:'rb_m46_near'},width:1792,height:720,
});
function forestOffsets(_playerX,cameraX=0,cfg=FOREST_PARALLAX_CONFIG){
 const shift=Number.isFinite(cameraX)?cameraX:0;
 return {source:'camera',far:shift*cfg.far.factor,mid:shift*cfg.mid.factor,near:shift*cfg.near.factor};
}
function installForestParallax(images,win=globalThis){
  if(!win||win.__RBForestParallaxInstalled)return win.__RBForestParallax||null;
  if(typeof win.__RBForestParallaxEnabled!=='boolean')
    win.__RBForestParallaxEnabled=!/^(0|false|off)$/i.test(new URLSearchParams(win.location?.search||'').get('parallax')||'');
  let ready=false,failed=[];const loaded=new Set();
  function textures(game){
    if(ready)return;
    if(!win.Image){failed.push('browser Image API unavailable');return;}
    for(const [kind,config] of Object.entries(FOREST_PARALLAX_CONFIG)){
      if(!config?.key)continue;
      if(game.textures.exists(config.key)){loaded.add(kind);continue;}
      const img=new win.Image();
      img.onload=()=>{
        try{if(!game.textures.exists(config.key))game.textures.addImage(config.key,img);loaded.add(kind);
          const scene=game.scene.getScene('Game');if(scene?.__rbForestParallax)scene.__rbForestParallax.makeLayers();}
        catch(e){failed.push(String(e));}
      };
      img.onerror=()=>failed.push('image load failed:'+kind);
      img.src='data:image/png;base64,'+images[kind];
    }
    ready=true;
  }
  function attach(scene){
  const authored=win.__RB_STAGE_V1_DATA?.backgrounds?.layers||[];
  const cfg=Object.fromEntries(Object.entries(FOREST_PARALLAX_CONFIG).filter(([,v])=>v?.key).map(([k,v])=>[k,{...v,factor:Number.isFinite(authored.find(a=>a.id===k)?.parallax)?authored.find(a=>a.id===k).parallax:v.factor}]));

    if(scene.__rbForestParallax)scene.__rbForestParallax.destroy();
    const layers={};
    const runtime={version:'M4.7.5',layers,source:'none',lastCamera:{scrollX:0,scrollY:0},lastOffsets:{far:0,mid:0,near:0},
      makeLayers(){
        if(!scene.sys.isActive())return;
        for(const [kind,c] of Object.entries(cfg)){
          if(!c?.key||layers[kind]||!scene.textures.exists(c.key))continue;
          layers[kind]=scene.add.image(0,0,c.key)
            .setOrigin(0,0).setScrollFactor(0).setDepth(c.depth).setAlpha(0);
        }
      },
      update(){
        if(!scene.sys.isActive())return;
        this.makeLayers();
        const offsets=forestOffsets(null,scene.cameras.main.scrollX,cfg);
        this.lastCamera={scrollX:scene.cameras.main.scrollX,scrollY:scene.cameras.main.scrollY};this.source=offsets.source;this.lastOffsets=offsets;
        const visible=win.__RBForestParallaxEnabled!==false && win.__RBArtEnabled!==false;
        for(const [kind,sprite] of Object.entries(layers)){
          sprite.setAlpha(visible?cfg[kind].alpha:0);
          sprite.setX(win.__RBForestParallaxEnabled!==false?-offsets[kind]:0);
        }
        // Keep approved concept visible, only lower its opacity behind the added layers.
        const concept=scene.backdrop?.conceptArt;
        if(concept)concept.setAlpha(win.__RBArtEnabled===false?0:(visible?.69:.88));
      },
      snapshot(){return {enabled:win.__RBForestParallaxEnabled,visible:win.__RBForestParallaxEnabled&&win.__RBArtEnabled,
        source:this.source,camera:{...this.lastCamera},samplePhase:'Scene postupdate before camera render-follow',smoothing:'none — direct camera transform',factors:Object.fromEntries(Object.entries(cfg).map(([k,v])=>[k,v.factor])),offsets:{...this.lastOffsets},readyLayers:Object.keys(layers),loaded:[...loaded],errors:[...failed],
        sprites:Object.fromEntries(Object.entries(layers).map(([k,v])=>[k,{depth:v.depth,alpha:v.alpha,offsetX:v.x,key:v.texture.key}]))};},
      destroy(){for(const sprite of Object.values(layers))sprite.destroy();
        for(const k of Object.keys(layers))delete layers[k];
        if(scene.__rbForestParallax===runtime)scene.__rbForestParallax=null;
        if(win.__RBForestParallax===runtime)win.__RBForestParallax=null;}
    };
    scene.__rbForestParallax=runtime;win.__RBForestParallax=runtime;
    textures(scene.game);runtime.makeLayers();
    const onPost=()=>scene.__rbForestParallax?.update();
    scene.events.on('postupdate',onPost);
    scene.events.once('shutdown',()=>{scene.events.off('postupdate',onPost);runtime.destroy();});
    return runtime;
  }
  function patch(){const scene=win.__game?.scene?.getScene?.('Game');if(!scene)return false;
    const proto=Object.getPrototypeOf(scene);
    if(!proto.__rbM46ParallaxPatched){const old=proto.create;proto.create=function rbM46ForestCreate(){
      const result=old.apply(this,arguments);attach(this);return result;};proto.__rbM46ParallaxPatched=true;}
    if(scene.sys?.isActive?.()&&scene.player&&!scene.__rbForestParallax)attach(scene);
    win.__RBForestParallaxInstalled=true;return true;
  }
  if(!win.document)return null;
  const button=win.document.createElement('button');button.id='rb-m46-parallax-toggle';button.type='button';
  button.style.cssText='position:fixed;top:160px;right:12px;z-index:10062;background:#071c21ee;color:#d5f5ea;border:1px solid #75ae9c;border-radius:8px;padding:5px 9px;min-height:36px;cursor:pointer;font:600 12px system-ui,sans-serif';
  const refresh=()=>{button.textContent='M4.7.5 Depth: '+(win.__RBForestParallaxEnabled?'ON':'OFF');button.setAttribute('aria-pressed',String(!!win.__RBForestParallaxEnabled));};
  button.addEventListener('click',()=>{win.__RBForestParallaxEnabled=!win.__RBForestParallaxEnabled;refresh();button.blur();});
  win.document.body.append(button);refresh();
  if(!patch()){const timer=setInterval(()=>{if(patch())clearInterval(timer);},40);setTimeout(()=>clearInterval(timer),8000);}
  return win.__RBForestParallax;
}

