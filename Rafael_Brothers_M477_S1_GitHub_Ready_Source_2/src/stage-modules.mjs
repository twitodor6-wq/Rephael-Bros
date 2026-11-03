/** Rafael Brothers M4.6.1 — reusable, DOM-side modular stage panel.
 * Reparents existing feature switches, preserving their listeners and DOM IDs.
 * Registry declares placement only; scene module code retains toggle ownership.
 */
const STAGE_MODULE_SCHEMA='rafael-stage-modules/v1';
function validateStageModules(modules){const ids=new Set();const flags=new Set();for(const m of modules){
  if(!/^[a-z0-9-]+$/.test(m.id)||ids.has(m.id))return false;ids.add(m.id);
  if(m.flag){if(flags.has(m.flag))return false;flags.add(m.flag);}
  if(m.state==='active'&&!m.element)return false;
}return true;}
function installStageModules(win=globalThis){
  if(!win?.document||win.__RBStagePanelInstalled)return win.__RBStagePanel||null;
  const doc=win.document;const config=win.__RB_STAGE_MODULE_CONFIG;
  if(!config||config.schema!==STAGE_MODULE_SCHEMA||!Array.isArray(config.modules))throw Error('stage module config missing');
  const registry=config.modules;
  if(!validateStageModules(registry))throw Error('invalid stage registry');
  const style=doc.createElement('style');style.id='rb-stage-panel-style';style.textContent=`
    #rb-stage-tab {position:fixed;right:12px;top:12px;z-index:10080;border:1px solid #8bbfb6;border-radius:12px;background:#07252aee;color:#ecf7ef;padding:10px 15px;min-height:42px;cursor:pointer;font:700 13px system-ui;box-shadow:0 4px 19px #0008;}
    #rb-stage-panel {position:fixed;z-index:10079;top:63px;right:12px;bottom:auto;width:min(296px,calc(100vw - 26px));max-height:min(75vh,650px);overflow:auto;border:1px solid #6caaa1;border-radius:14px;background:#06191dec;box-shadow:0 13px 45px #000b;color:#e7f4ef;font:13px system-ui,sans-serif;padding:12px;}
    #rb-stage-panel[hidden] {display:none !important;}
    #rb-stage-panel .rb-heading {font:700 16px Georgia,serif;color:#e5c77b;margin:1px 0 4px;}
    #rb-stage-panel .rb-sub {font:11px system-ui;opacity:.8;margin:0 0 9px;}
    #rb-stage-panel details {border-top:1px solid #34595b;padding:6px 0;}
    #rb-stage-panel summary {cursor:pointer;font-weight:700;padding:4px 1px;user-select:none;color:#bfded2;}
    #rb-stage-panel .rb-entry{display:flex;flex-direction:column;gap:2px;margin:7px 0;}
    #rb-stage-panel .rb-entry>span{font-size:11px;color:#aac8c3;}
    #rb-stage-panel .rb-entry>button{position:relative!important;top:auto!important;right:auto!important;bottom:auto!important;left:auto!important;inset:auto!important;z-index:auto!important;display:block!important;width:100%!important;margin:0!important;min-height:35px!important;border-radius:8px!important;text-align:left!important;font:600 12px system-ui,sans-serif!important;padding:7px 10px!important;}
    #rb-stage-panel .rb-planned {opacity:.55;font-style:italic;font-size:12px;padding:6px 3px;}
    #rb-stage-panel button:focus-visible,#rb-stage-tab:focus-visible{outline:2px solid #ffd38b;outline-offset:2px;}
    @media (max-width:580px) {#rb-stage-panel{max-height:68vh;}}
  `;doc.head.append(style);
  const tab=doc.createElement('button');tab.id='rb-stage-tab';tab.type='button';tab.textContent='⚙ Stage Modules';tab.setAttribute('aria-controls','rb-stage-panel');tab.setAttribute('aria-expanded','false');
  const panel=doc.createElement('aside');panel.id='rb-stage-panel';panel.hidden=true;panel.setAttribute('aria-label','Stage challenge and visual modules');
  panel.innerHTML='<h2 class="rb-heading"></h2><p class="rb-sub">Game settings · toggles affect this stage only</p>';
  panel.querySelector('.rb-heading').textContent=config.title;
  const categories=[['art','Visuals & atmosphere'],['terrain','Bridges & terrain'],['hazards','Enemies & challenges']];
  const categoryNodes={};for(const [id,title] of categories){
    const details=doc.createElement('details');details.id='rb-module-'+id;details.open=id!=='hazards';
    const summary=doc.createElement('summary');summary.textContent=title;details.append(summary);panel.append(details);categoryNodes[id]=details;
  }
  const originalParents=new Map();
  function mount(){let count=0;
    for(const m of registry){if(m.state==='planned'||m.state==='built-in')continue;
      const el=doc.getElementById(m.element);if(!el)continue;
      if(originalParents.has(el))continue;
      originalParents.set(el,{parent:el.parentElement,next:el.nextSibling});
      const entry=doc.createElement('div');entry.className='rb-entry';entry.dataset.moduleId=m.id;
      entry.dataset.stage=config.stage;const label=doc.createElement('span');label.textContent=m.label;entry.append(label,el);categoryNodes[m.category].append(entry);count++;
    }return count;
  }
  for(const m of registry.filter(m=>m.state==='planned')){const e=doc.createElement('div');e.className='rb-planned';e.textContent='Planned · '+m.label; e.dataset.moduleId=m.id;categoryNodes[m.category].append(e);}
  // keep ceiling spider as a known installed world feature; no inert fake toggle.

  doc.body.append(tab,panel);
  const setOpen=(open)=>{panel.hidden=!open;tab.setAttribute('aria-expanded',String(open));tab.textContent=open?'✕ Close Modules':'⚙ Stage Modules';};
  tab.addEventListener('click',()=>setOpen(panel.hidden));
  doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){setOpen(false);e.stopPropagation();}},true);
  mount();
  let retries=0;const interval=win.setInterval(()=>{mount();if(++retries>50||originalParents.size===registry.filter(m=>m.state==='active').length)win.clearInterval(interval);},80);
  const api={schema:STAGE_MODULE_SCHEMA,stage:config.stage,registry,open:()=>setOpen(true),close:()=>setOpen(false),toggle:()=>setOpen(panel.hidden),
    snapshot:()=>({schema:STAGE_MODULE_SCHEMA,stage:config.stage,open:!panel.hidden,mounted:[...originalParents.keys()].map(e=>e.id),planned:registry.filter(m=>m.state==='planned').map(m=>m.id),values:Object.fromEntries(registry.filter(m=>m.flag).map(m=>[m.id,win[m.flag]]))})};
  win.__RBStagePanel=api;win.__RBStagePanelInstalled=true;return api;
}
