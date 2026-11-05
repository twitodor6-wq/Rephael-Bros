/** M4.7.7-S3 — Stage-owned interactive sticky webs.
 * Historical M4.4 pure state model and graphics retained below.
 * One Scene Composer-owned collection owns the only hammer/respawn/postupdate
 * hooks. No Game.create patch or NinjaTape physics changes.
 */
const STICKY_WEB_CONFIG = Object.freeze({
  id: 'sticky-web-launch-left', x: 86, y: 402, w: 38, h: 86,
  platformStart: 70, platformEnd: 370, pitStart: 370, spawnX: 145,
  speedCap: 81, // existing maxSpeed (230) * web speed multiplier (.35) ~= 80.5
  holdToTrapSeconds: 0.70,
  directionalEscapeSeconds: 0.62,
  maxTrapSeconds: 2.1,
  recoverySeconds: 1.55,
  cutRecoverySeconds: 3.0,
  swingDragPerSecond: 1.45, // exp(-drag * dt): bounded tangential energy loss
});
function intersects(a, b) {
  return !!a && !!b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function createStickyWeb() {
  return { state: 'idle', contactSeconds: 0, trapSeconds: 0, escapeEffort: 0,
    recovery: 0, captured: 0, released: 0, contacts: 0, cuts: 0, swingContacts: 0,
    log: [], touching: false };
}
function event(sim, type) {
  sim.log.push(type);
  if (sim.log.length > 80) sim.log.shift();
}
/** Pure deterministic state update; release automatically, never indefinite confinement. */
function stepStickyWeb(sim, seconds, context = {}, cfg = STICKY_WEB_CONFIG) {
  const dt = Math.min(0.05, Math.max(0, Number.isFinite(seconds) ? seconds : 0));
  const enabled = context.enabled !== false;
  const touching = enabled && !!context.touching;
  const tethered = !!context.tethered;
  const moving = !!context.moving;
  const events = [];
  const emit = (name) => { events.push(name); event(sim, name); };
  if (!enabled) {
    sim.state = 'idle'; sim.contactSeconds = sim.trapSeconds = sim.escapeEffort = sim.recovery = 0;
    sim.touching = false;
    return { touching: false, slowed: false, trapped: false, events };
  }
  if (sim.recovery > 0) sim.recovery = Math.max(0, sim.recovery - dt);
  if (!touching) {
    if (sim.touching && sim.state === 'trapped') { sim.released++; emit('release:leave'); }
    sim.touching = false;
    sim.state = 'idle'; sim.contactSeconds = sim.trapSeconds = sim.escapeEffort = 0;
    return { touching: false, slowed: false, trapped: false, events };
  }
  if (!sim.touching) { sim.contacts++; emit('touch'); }
  sim.touching = true;
  if (sim.recovery > 0) {
    sim.state = 'recovering';
    return { touching: true, slowed: false, trapped: false, events };
  }
  if (tethered) {
    if (sim.state === 'trapped') { sim.released++; emit('release:rope'); }
    sim.state = 'slowed'; sim.trapSeconds = sim.escapeEffort = 0;
    sim.swingContacts++;
    return { touching: true, slowed: true, trapped: false, events };
  }
  if (sim.state !== 'trapped') {
    sim.state = 'slowed';
    sim.contactSeconds += dt;
    if (sim.contactSeconds >= cfg.holdToTrapSeconds) {
      sim.state = 'trapped'; sim.trapSeconds = 0; sim.escapeEffort = 0;
      sim.captured++; emit('trapped');
    }
  } else {
    sim.trapSeconds += dt;
    sim.escapeEffort = moving ? sim.escapeEffort + dt : Math.max(0, sim.escapeEffort - dt * 0.5);
    if (sim.escapeEffort >= cfg.directionalEscapeSeconds || sim.trapSeconds >= cfg.maxTrapSeconds) {
      sim.released++; emit(sim.escapeEffort >= cfg.directionalEscapeSeconds ? 'release:movement' : 'release:timeout');
      sim.state = 'recovering'; sim.recovery = cfg.recoverySeconds;
      sim.contactSeconds = sim.trapSeconds = sim.escapeEffort = 0;
    }
  }
  return { touching: true, slowed: sim.state === 'slowed' || sim.state === 'trapped',
    trapped: sim.state === 'trapped', events };
}
/** Called only after a real J hammer hitbox overlaps the web. */
function cutStickyWeb(sim, cfg = STICKY_WEB_CONFIG) {
  if (sim.recovery > 0) return false;
  sim.cuts++;
  if (sim.state === 'trapped') sim.released++;
  sim.state = 'recovering'; sim.recovery = cfg.cutRecoverySeconds;
  sim.contactSeconds = sim.trapSeconds = sim.escapeEffort = 0;
  event(sim, 'release:hammer');
  return true;
}
function resetStickyWeb(sim) {
  const fresh = createStickyWeb();
  for (const name of Object.keys(fresh)) sim[name] = fresh[name];
  return sim;
}

  function createView(scene, cfg) {
    const web = scene.add.graphics().setDepth(15);
    const glow = scene.add.graphics().setDepth(14);
    const label = scene.add.text(cfg.x + cfg.w / 2, cfg.y - 22, 'STICKY WEB', {
      fontFamily: 'Georgia, serif', fontSize: '12px', color: '#e9d5b4', stroke: '#101a17', strokeThickness: 3,
    }).setOrigin(0.5, 0.5).setDepth(25).setAlpha(0.85);
    return { web, glow, label, destroy: () => { web.destroy(); glow.destroy(); label.destroy(); } };
  }
  function render(view, sim, t, enabled, cfg) {
    const { web, glow, label } = view;
    web.clear(); glow.clear();
    const recovering = sim.recovery > 0;
    const trapped = sim.state === 'trapped';
    const activity = trapped ? 1 : sim.touching && !recovering ? 0.65 : 0;
    const alpha = enabled ? (recovering ? 0.18 : 0.76 + activity * 0.22) : 0.14;
    label.setAlpha(enabled ? (recovering ? 0.38 : 1) : 0.15);
    label.setColor(trapped ? '#ffdfa0' : '#e9f7e6');
    label.setText(trapped ? 'MOVE TO ESCAPE!' : recovering ? 'WEB CUT / RECOVERING' : 'STICKY WEB');
    const x = cfg.x, y = cfg.y, w = cfg.w, h = cfg.h;
    const pull = Math.sin(t * (activity ? 19 : 2)) * (activity ? 4.5 : 1.0);
    const knots = [
      [x, y], [x + w / 2, y - 13], [x + w, y],
      [x, y + h], [x + w, y + h], [x + w / 2 + pull, y + h * .55],
    ];
    glow.fillStyle(trapped ? 0xffc777 : 0x9ddacc, alpha * 0.15);
    glow.fillEllipse(x + w / 2, y + h / 2, w + 21, h + 18);
    glow.fillStyle(trapped ? 0xffcc81 : 0xb5ffe0, alpha * (trapped ? 0.21 : 0.13));
    glow.fillRect(x, y, w, h);
    web.lineStyle(2.1, 0x84dabe, alpha * 0.85);
    web.strokeRoundedRect(x - 3, y - 4, w + 6, h + 6, 8);
    web.lineStyle(2.3, trapped ? 0xffd18b : 0xc9e4d0, alpha);
    for (let i = 0; i < 5; i++) {
      web.lineBetween(knots[i][0], knots[i][1], knots[5][0], knots[5][1]);
    }
    web.lineStyle(1.2, 0xf5e7c5, alpha * 0.9);
    for (const frac of [.26, .52, .78]) {
      const leftX = x + (w / 2 - w / 2 * frac);
      const rightX = x + (w / 2 + w / 2 * frac);
      const topY = y + (h * (.5 - .5 * frac));
      const bottomY = y + (h * (.5 + .5 * frac));
      web.beginPath(); web.moveTo(leftX, topY);
      web.lineTo(rightX, topY + Math.sin(t * 6 + frac * 10) * activity * 3);
      web.lineTo(rightX, bottomY);
      web.lineTo(leftX, bottomY); web.closePath(); web.strokePath();
    }
    web.fillStyle(trapped ? 0xffd18b : 0xf4f9ed, alpha);
    web.fillCircle(knots[5][0], knots[5][1], 4 + activity * 2);
    if (enabled && trapped) {
      const progress = Math.min(1, sim.escapeEffort / cfg.directionalEscapeSeconds);
      web.fillStyle(0x173b2e, 0.85); web.fillRect(x - 10, y - 10, w + 20, 5);
      web.fillStyle(0xf6d491, 1); web.fillRect(x - 10, y - 10, (w + 20) * progress, 5);
    }
  }

function installStickyWeb(win = globalThis) {
  if (!win || win.__RBStickyWebInstalled) return win && win.__RBStickyWeb;
  if (typeof win.__RBStickyWebEnabled !== 'boolean') {
    win.__RBStickyWebEnabled = !/^(0|false|off)$/i.test(new URLSearchParams(win.location?.search || '').get('web') || '');
  }
  if (!win.document || !win.__RBSceneComposerV1 || !win.__RBStageV1) throw Error('Sticky web requires Stage Loader and Scene Composer');

  const button = win.document.getElementById('rb-m44-web-toggle') || win.document.createElement('button');
  button.id = 'rb-m44-web-toggle';
  button.type = 'button';
  button.style.cssText = 'position:fixed;top:68px;right:12px;z-index:10062;background:#071c21ee;color:#eaf6ec;border:1px solid #80c3b9;border-radius:9px;padding:8px 12px;min-height:40px;cursor:pointer;font:600 13px system-ui,sans-serif';
  const updateLabel = () => {
    button.textContent = 'M4.4 Sticky Web: ' + (win.__RBStickyWebEnabled ? 'ON' : 'OFF');
    button.setAttribute('aria-pressed', String(!!win.__RBStickyWebEnabled));
  };
  button.addEventListener('click', () => {
    win.__RBStickyWebEnabled = !win.__RBStickyWebEnabled;
    if (!win.__RBStickyWebEnabled) win.__RBStickyWebs?.reset();
    updateLabel();
    button.blur();
  });
  if (!win.document.getElementById(button.id)) win.document.body.append(button);
  updateLabel();

  const caption = win.document.getElementById('rb-m43-caption');
  if (caption) caption.textContent = 'M4.4 · Spider ahead; sticky web to the left · J hammer';

  function attachOne(scene, cfg, id) {
    const sim = createStickyWeb();
    const view = createView(scene, cfg);
    let destroyed = false;
    const actor = {
      id, config: cfg, sim, view, time: 0, contactSwingDamping: 0,
      snapshot() {
        return { ...sim, log: [...sim.log], enabled: win.__RBStickyWebEnabled,
          ropeAttached: !!scene.tape?.attached, contactSwingDamping: actor.contactSwingDamping };
      },
      reset() {
        if (destroyed) return false;
        resetStickyWeb(sim);
        actor.contactSwingDamping = 0;
        render(view, sim, actor.time, win.__RBStickyWebEnabled, cfg);
        return true;
      },
      destroy() {
        if (destroyed) return false;
        destroyed = true;
        view.destroy();
        return true;
      },
      postUpdate(dt) {
        if (destroyed || !scene.sys.isActive() || scene.finished) return { slowed: false, trapped: false };
        const p = scene.player, body = p?.body2;
        if (!body || !body.center) return { slowed: false, trapped: false };
        actor.time += dt;
        const enabled = win.__RBStickyWebEnabled !== false;
        const hit = intersects({ x: body.x, y: body.y, w: body.width, h: body.height }, cfg);
        const moving = !!(p.keys.left.isDown || p.keys.right.isDown || p.keys.a.isDown || p.keys.d.isDown);
        const result = stepStickyWeb(sim, dt, { touching: hit, tethered: !!scene.tape?.attached, moving, enabled }, cfg);
        if (result.events.includes('touch')) scene.game.events.emit('hud:toast', 'Sticky web! Move or jump to escape. J can cut it.');
        if (result.events.includes('trapped')) scene.game.events.emit('hud:toast', 'Trapped! Hold left/right to break free — or swing J.');
        if (result.events.some(v => v.startsWith('release:'))) scene.game.events.emit('hud:toast', 'Freed from the web!');
        render(view, sim, actor.time, enabled, cfg);
        return result;
      },
      cut(hitbox) {
        if (destroyed || !win.__RBStickyWebEnabled || !intersects(hitbox, cfg)) return false;
        if (!cutStickyWeb(sim, cfg)) return false;
        scene.game.events.emit('hud:toast', 'Hammer cut the sticky web — clear for a few seconds!');
        scene.cameras.main.shake(80, 0.002);
        return true;
      },
    };
    render(view, sim, 0, win.__RBStickyWebEnabled, cfg);
    return actor;
  }

  function attach(scene) {
    scene.__rbStickyWebGroup?.destroy();
    const loader = win.__RBStageV1, entries = [];
    let destroyed = false;
    const release = () => {
      let error;
      for (const entry of entries.slice().reverse()) {
        try { entry.actor.destroy(); } catch (e) { error ||= e; }
        finally { loader.unbindRuntime('sticky-web', entry.id, entry.actor); }
      }
      if (error) throw error;
    };
    try {
      for (const { id, config } of loader.getInstances('sticky-web')) {
        const actor = attachOne(scene, config, id);
        entries.push({ id, actor });
        loader.bindRuntime('sticky-web', id, actor);
      }
    } catch (error) {
      try { release(); } catch {}
      throw error;
    }

    const first = entries[0]?.actor || null;
    const world = scene.world, player = scene.player;
    const previousHit = world.hammerHit, previousRespawn = player.respawn;
    const group = {
      managedActor: true,
      entries,
      reset() {
        if (destroyed) return false;
        for (const e of entries) e.actor.reset();
        if (player) player.inWeb = false;
        if (first) scene.registry.set('stickyWebState', 'idle');
        return true;
      },
      cut(rect) {
        if (destroyed) return false;
        let cut = false;
        for (const e of entries) cut = e.actor.cut(rect) || cut;
        if (cut) player.inWeb = false;
        return cut;
      },
      postUpdate(dt) {
        if (destroyed || !scene.sys.isActive() || scene.finished) return;
        const body = player?.body2;
        if (!body || !body.center) return;
        const results = entries.map(e => ({ actor: e.actor, result: e.actor.postUpdate(dt) }));
        const slowed = results.filter(x => x.result.slowed);
        const trapped = results.some(x => x.result.trapped);
        const tethered = !!scene.tape?.attached;
        if (entries.length) player.inWeb = slowed.length > 0 && !tethered;
        // Apply the historical Arcade response ONCE, even for overlapping webs.
        if (trapped && !tethered) body.setVelocityX(0);
        else if (slowed.length && !tethered) {
          const cap = Math.min(...slowed.map(x => x.actor.config.speedCap));
          if (Math.abs(body.velocity.x) > cap) body.setVelocityX(Math.sign(body.velocity.x) * cap);
        }
        if (slowed.length && tethered) {
          const drag = Math.max(...slowed.map(x => x.actor.config.swingDragPerSecond));
          const factor = Math.exp(-drag * dt);
          body.setVelocity(body.velocity.x * factor, body.velocity.y * factor);
          for (const x of slowed) x.actor.contactSwingDamping++;
        }
        if (first) scene.registry.set('stickyWebState', first.sim.state);
      },
      snapshot() {
        return { destroyed, instances: entries.map(e => ({ id: e.id, ...e.actor.snapshot() })) };
      },
      destroy() {
        if (destroyed) return false;
        destroyed = true;
        scene.events.off('postupdate', onPost);
        if (world.hammerHit === hit) world.hammerHit = previousHit;
        if (player.respawn === respawn) player.respawn = previousRespawn;
        player.inWeb = false;
        try { release(); } finally {
          if (scene.__rbStickyWebGroup === group) scene.__rbStickyWebGroup = null;
          if (scene.__rbStickyWeb === facade) scene.__rbStickyWeb = null;
          if (win.__RBStickyWebs === group) win.__RBStickyWebs = null;
          if (win.__RBStickyWeb === facade) win.__RBStickyWeb = null;
        }
        return true;
      },
    };
    const facade = {
      config: first?.config || null, sim: first?.sim || null, view: first?.view || null,
      snapshot: () => first?.snapshot() || null,
      reset: group.reset, cut: group.cut, postUpdate: group.postUpdate,
      destroy: group.destroy,
    };
    const hit = function(rect) {
      const prior = previousHit.call(this, rect);
      const cut = group.cut(rect);
      return !!(cut || prior);
    };
    const respawn = function(...args) {
      const out = previousRespawn.apply(this, args);
      group.reset();
      return out;
    };
    const onPost = (_time, ms) => group.postUpdate(Math.min(ms, 50) / 1000);

    world.hammerHit = hit;
    player.respawn = respawn;
    scene.events.on('postupdate', onPost);
    scene.__rbStickyWebGroup = group;
    win.__RBStickyWebs = group;
    scene.__rbStickyWeb = facade;
    win.__RBStickyWeb = facade;
    scene.registry.set('stickyWebState', 'idle');
    // Composer destroys this managed actor AFTER the later enemy adapter has
    // unwound its own hammer/respawn wrappers. Do not independently register
    // a shutdown observer: observer order would leave dangling wrapper chains.
    return group;
  }

  win.__RBSceneComposerV1.register('sticky-web-prefabs', attach);
  win.__RBStickyWebInstalled = true;
  return win.__RBStickyWeb;
}
