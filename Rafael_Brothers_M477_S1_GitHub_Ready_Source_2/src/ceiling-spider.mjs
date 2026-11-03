/** M4.3 Ceiling Drop Spider.
 * Pure state machine is Phaser-free so it can be tested in Node.
 * The installer only hooks scene create/postupdate and world.hammerHit.
 * It does not edit rope length, swing velocity, or Arcade gravity.
 */

export const SPIDER_STATES = Object.freeze([
  "idle_ceiling",
  "warning",
  "descending",
  "attack_window",
  "ascending",
  "stunned",
  "disabled",
]);

/** The launch platform is x=70..370, top y=490. The pit begins at x=370.
 * Spawn is x=145, and the hammer is picked up near x=180. This enemy now
 * hangs AHEAD of spawn, near x=270, and its warning triggers when the player
 * enters the approach zone. The spider is entirely above solid ground and
 * does not overlap the central pit or rope anchor (x=514).
 * Placement is tutorial-friendly: the player can evade by continuing right,
 * stop to fight with J, or retreat. No existing level geometry is changed.
 */
export const SPIDER_PLACEMENT = Object.freeze({
  id: "ceiling-drop-spider",
  name: "Ceiling Drop Spider",
  x: 270,
  ceilingY: 108,
  attackY: 448,
  trigger: Object.freeze({ x: 177, y: 380, w: 138, h: 145 }),
  warnSeconds: 0.5,
  descendSpeed: 640,
  ascendSpeed: 460,
  attackWindow: 0.48,
  stunSeconds: 0.4,
  rearmSeconds: 0.75,
  body: Object.freeze({ w: 52, h: 44 }),
  knock: Object.freeze({ x: 280, y: -240 }),
  invulnSeconds: 1.15,
  platformTop: 490,
  pitStartX: 370,
});

export function rectsOverlap(a, b) {
  return !!a && !!b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function pointInRect(x, y, rect) {
  return !!rect && x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function createSpider(cfg = SPIDER_PLACEMENT) {
  return {
    cfg,
    state: "idle_ceiling",
    x: cfg.x,
    y: cfg.ceilingY,
    timer: 0,
    rearm: 0,
    hits: 0,
    disabled: false,
  };
}

export function spiderHitbox(spider) {
  const { w, h } = spider.cfg.body;
  return { x: spider.x - w / 2, y: spider.y - h / 2, w, h };
}

function clampDt(dt) {
  return Math.max(0, Math.min(0.05, Number.isFinite(dt) ? dt : 0));
}

export function stepSpider(spider, dt, playerCenter) {
  const cfg = spider.cfg;
  const events = [];
  dt = clampDt(dt);
  if (spider.state === "disabled") {
    const rest = cfg.attackY + 30;
    if (spider.y < rest) spider.y = Math.min(rest, spider.y + 980 * dt);
    return { events };
  }
  if (spider.state === "idle_ceiling") {
    spider.x = cfg.x;
    spider.y = cfg.ceilingY;
    if (spider.rearm > 0) spider.rearm = Math.max(0, spider.rearm - dt);
    else if (playerCenter && pointInRect(playerCenter.x, playerCenter.y, cfg.trigger)) {
      spider.state = "warning";
      spider.timer = cfg.warnSeconds;
      events.push("warning");
    }
  } else if (spider.state === "warning") {
    spider.timer -= dt;
    const t = 1 - Math.max(spider.timer, 0) / cfg.warnSeconds;
    spider.y = cfg.ceilingY + Math.sin(t * Math.PI) * 12;
    if (spider.timer <= 0) {
      spider.state = "descending";
      spider.timer = 0;
      events.push("descending");
    }
  } else if (spider.state === "descending") {
    spider.y = Math.min(cfg.attackY, spider.y + cfg.descendSpeed * dt);
    if (spider.y >= cfg.attackY - 0.01) {
      spider.y = cfg.attackY;
      spider.state = "attack_window";
      spider.timer = cfg.attackWindow;
      events.push("attack_window");
    }
  } else if (spider.state === "attack_window") {
    spider.y = cfg.attackY;
    spider.timer -= dt;
    if (spider.timer <= 0) {
      spider.state = "ascending";
      events.push("ascending");
    }
  } else if (spider.state === "ascending") {
    spider.y = Math.max(cfg.ceilingY, spider.y - cfg.ascendSpeed * dt);
    if (spider.y <= cfg.ceilingY + 0.01) {
      spider.y = cfg.ceilingY;
      spider.state = "idle_ceiling";
      spider.rearm = cfg.rearmSeconds;
      events.push("idle_ceiling");
    }
  } else if (spider.state === "stunned") {
    spider.timer -= dt;
    if (spider.timer <= 0) {
      spider.state = "disabled";
      spider.disabled = true;
      events.push("disabled");
    }
  }
  return { events };
}

export function advanceSpider(spider, dt, world = {}) {
  const stepped = stepSpider(spider, dt, world.playerCenter || null);
  const damaged = !!(world.playerRect && contactDamage(spider, world.playerRect, world.invuln || 0));
  return { events: stepped.events, damaged };
}

export function contactDamage(spider, playerRect, invuln) {
  if (!spider || (invuln || 0) > 0) return false;
  if (spider.state !== "descending" && spider.state !== "attack_window") return false;
  return rectsOverlap(playerRect, spiderHitbox(spider));
}

export function hammerSpider(spider, rect) {
  if (!spider || spider.state === "disabled" || spider.state === "stunned") return false;
  if (!rectsOverlap(rect, spiderHitbox(spider))) return false;
  spider.state = "stunned";
  spider.timer = spider.cfg.stunSeconds;
  spider.hits += 1;
  return true;
}

export function resetSpider(spider) {
  spider.state = "idle_ceiling";
  spider.x = spider.cfg.x;
  spider.y = spider.cfg.ceilingY;
  spider.timer = 0;
  spider.rearm = 0;
  spider.hits = 0;
  spider.disabled = false;
}

function emptyCounts() {
  return { warning: 0, descending: 0, attack_window: 0, ascending: 0, idle_ceiling: 0, stunned: 0, disabled: 0 };
}

function burst(scene, x, y, tint) {
  if (!scene?.textures?.exists?.("puff")) return;
  for (let i = 0; i < 7; i++) {
    const ang = (i / 7) * Math.PI * 2;
    const img = scene.add.image(x, y, "puff").setDepth(30).setTint(tint).setScale(0.36).setAlpha(0.9);
    scene.tweens.add({
      targets: img,
      x: x + Math.cos(ang) * 30,
      y: y + Math.sin(ang) * 22,
      alpha: 0,
      scale: 0.08,
      duration: 280,
      onComplete: () => img.destroy(),
    });
  }
}

export function installCeilingSpider(win = globalThis) {
  if (!win || win.__RBCeilingSpiderInstalled) return win.__RBSpider || null;
  const cfg = SPIDER_PLACEMENT;
  if(typeof win.__RBCeilingSpiderEnabled!=='boolean')win.__RBCeilingSpiderEnabled=true;
  const button=win.document.createElement('button');button.id='rb-m473-spider-toggle';button.type='button';
  const label=()=>{button.textContent='Ceiling spider: '+(win.__RBCeilingSpiderEnabled?'ON':'OFF');button.setAttribute('aria-pressed',String(win.__RBCeilingSpiderEnabled));};label();
  button.onclick=()=>{win.__RBCeilingSpiderEnabled=!win.__RBCeilingSpiderEnabled;win.__RBSpider?.setEnabled?.(win.__RBCeilingSpiderEnabled);label();button.blur();};win.document.body.append(button);

  function draw(view, sim, time) {
    const { silk, body, eyes } = view;
    silk.clear();
    body.clear();
    eyes.clear();
    const hidden = sim.state === "idle_ceiling";
    const warn = sim.state === "warning";
    const dead = sim.state === "disabled";
    const shake = warn ? Math.sin(time * 42) * 4 : sim.state === "stunned" ? Math.sin(time * 55) * 3 : 0;
    const x = sim.x + shake;
    const y = sim.y + (sim.state === "attack_window" ? Math.sin(time * 16) * 2 : 0);
    if (!dead) {
      const amp = warn ? 4.5 : hidden ? 1.1 : 1.6;
      silk.lineStyle(4, 0x140e0a, hidden ? 0.35 : 0.85);
      silk.beginPath();
      silk.moveTo(cfg.x, 8);
      const steps = 10;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const yy = 8 + (y - 8) * t;
        const wob = Math.sin(t * 10 + time * (warn ? 14 : 5)) * amp * (1 - t * 0.35);
        silk.lineTo(cfg.x + wob, yy);
      }
      silk.strokePath();
      silk.lineStyle(1.5, warn ? 0xf2d48a : 0xd9c7a2, hidden ? 0.28 : 0.95);
      silk.beginPath();
      silk.moveTo(cfg.x, 8);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const yy = 8 + (y - 8) * t;
        const wob = Math.sin(t * 10 + time * (warn ? 14 : 5)) * amp * (1 - t * 0.35);
        silk.lineTo(cfg.x + wob, yy);
      }
      silk.strokePath();
    } else {
      silk.lineStyle(2, 0xd9c7a2, 0.35);
      silk.lineBetween(cfg.x, 8, cfg.x + 6, 42);
    }
    const alpha = hidden ? 0.72 : 1;
    const spread = sim.state === "attack_window" ? 1.05 : sim.state === "descending" ? 0.42 : dead ? 0.15 : 0.78;
    body.lineStyle(2.5, dead ? 0x3a342e : 0x1a120e, alpha);
    for (let i = 0; i < 8; i++) {
      const side = i < 4 ? -1 : 1;
      const idx = i % 4;
      const phase = Math.sin(time * (sim.state === "descending" || sim.state === "ascending" ? 18 : 7) + i);
      const hipX = x + side * 6;
      const hipY = y + 2;
      const kneeX = x + side * (12 + idx * 7) * spread;
      const kneeY = y + 6 + idx * 4 + phase * 3;
      const footX = kneeX + side * (8 + (dead ? 0 : 4));
      const footY = kneeY + 12;
      body.lineBetween(hipX, hipY, kneeX, kneeY);
      body.lineBetween(kneeX, kneeY, footX, footY);
    }
    body.fillStyle(dead ? 0x4a433c : 0x16110e, alpha);
    body.fillEllipse(x, y + 8, dead ? 34 : 36, dead ? 16 : 26);
    body.fillStyle(dead ? 0x5c564e : 0x2a1c16, alpha);
    body.fillEllipse(x, y - 8, 24, dead ? 12 : 18);
    if (sim.state === "attack_window") {
      body.fillStyle(0xe8d2a4, 0.95);
      body.fillTriangle(x - 6, y - 2, x - 2, y + 8, x - 10, y + 7);
      body.fillTriangle(x + 6, y - 2, x + 2, y + 8, x + 10, y + 7);
    }
    body.fillStyle(0x000000, 0.28);
    body.fillEllipse(x, cfg.platformTop - 2, 28, 8);
    const eye = warn || sim.state === "descending" || sim.state === "attack_window" ? 0xff3a2a : dead ? 0x6a6258 : 0x8d2018;
    const er = warn ? 3.4 : 2.3;
    eyes.fillStyle(eye, dead ? 0.45 : 1);
    eyes.fillCircle(x - 5, y - 10, er);
    eyes.fillCircle(x + 5, y - 10, er);
    if (!dead) {
      eyes.fillStyle(0xffe1a8, warn ? 0.9 : 0.35);
      eyes.fillCircle(x - 5.6, y - 10.6, 0.8);
      eyes.fillCircle(x + 4.4, y - 10.6, 0.8);
    }
  }

  function makeView(scene) {
    const silk = scene.add.graphics().setDepth(16);
    const body = scene.add.graphics().setDepth(22);
    const eyes = scene.add.graphics().setDepth(24);
    const cover = scene.add.graphics().setDepth(23);
    const hint = scene.add.graphics().setDepth(8);
    cover.fillStyle(0x10241c, 0.92);
    cover.fillTriangle(cfg.x - 54, -20, cfg.x + 18, -20, cfg.x - 6, 168);
    cover.fillStyle(0x1b3a2c, 0.88);
    cover.fillTriangle(cfg.x - 10, -20, cfg.x + 62, -20, cfg.x + 16, 150);
    cover.fillStyle(0x07140f, 0.8);
    cover.fillTriangle(cfg.x - 28, -20, cfg.x + 24, -20, cfg.x + 2, 96);
    cover.fillStyle(0x3d2a1c, 1);
    cover.fillCircle(cfg.x, 18, 8);
    hint.lineStyle(1, 0xc9b48a, 0.35);
    hint.strokeEllipse(cfg.x, cfg.platformTop - 6, 54, 14);
    hint.strokeEllipse(cfg.x, cfg.platformTop - 6, 28, 8);
    hint.lineBetween(cfg.x - 20, cfg.platformTop - 8, cfg.x + 18, cfg.platformTop - 4);
    return {
      silk, body, eyes, cover, hint,
      destroy() {
        silk.destroy();
        body.destroy();
        eyes.destroy();
        cover.destroy();
        hint.destroy();
      },
    };
  }

  function attach(scene) {
    if (scene.__rbSpider) scene.__rbSpider.destroy();
    const sim = createSpider(cfg);
    const view = makeView(scene);
    const runtime = {
      version: "M4.7.3", view, enabled:win.__RBCeilingSpiderEnabled,
      setEnabled(on) {
        runtime.enabled=!!on;win.__RBCeilingSpiderEnabled=!!on;
        runtime.reset();for(const o of [view.silk,view.body,view.eyes,view.cover,view.hint])o.setVisible(!!on);
      },
      sim,
      invuln: 0,
      damageCount: 0,
      log: [],
      counts: emptyCounts(),
      time: 0,
      destroy() {
        view.destroy();
        if (scene.__rbSpider === runtime) scene.__rbSpider = null;
      },
      snapshot() {
        return {
          enabled: runtime.enabled,
          state: sim.state,
          x: sim.x,
          y: sim.y,
          hits: sim.hits,
          disabled: sim.disabled,
          rearm: sim.rearm,
          invuln: runtime.invuln,
          damageCount: runtime.damageCount,
          counts: { ...runtime.counts },
          log: runtime.log.slice(),
        };
      },
      reset() {
        resetSpider(sim);
        runtime.invuln = 0;
        runtime.damageCount = 0;
        runtime.log.length = 0;
        runtime.counts = emptyCounts();
        const viewSprite = scene.player && scene.player.view;
        if (viewSprite) {
          viewSprite.setAlpha(1);
          viewSprite.setTint(0xffffff);
        }
      },
      hammer(rect) {
        if (!runtime.enabled) return false;
        const hit = hammerSpider(sim, rect);
        if (!hit) return false;
        runtime.counts.stunned += 1;
        runtime.log.push("stunned");
        burst(scene, sim.x, sim.y, 0xf0d78c);
        scene.cameras.main.shake(90, 0.004);
        scene.game.events.emit("hud:toast", "The hammer catches the drop-spider.");
        return true;
      },
      postUpdate(dt) {
        if (!runtime.enabled) return;
        if (!scene.sys.isActive() || scene.finished) return;
        const player = scene.player;
        const body = player && player.body2;
        if (!body || !body.center) return;
        runtime.time += dt;
        if (runtime.invuln > 0) runtime.invuln = Math.max(0, runtime.invuln - dt);
        const playerRect = { x: body.x, y: body.y, w: body.width, h: body.height };
        const result = advanceSpider(sim, dt, {
          playerCenter: { x: body.center.x, y: body.center.y },
          playerRect,
          invuln: runtime.invuln,
        });
        for (const ev of result.events) {
          runtime.log.push(ev);
          if (runtime.log.length > 80) runtime.log.shift();
          if (runtime.counts[ev] != null) runtime.counts[ev] += 1;
          if (ev === "warning") scene.game.events.emit("hud:toast", "The roots overhead shift — a spider is about to drop.");
          if (ev === "disabled") {
            burst(scene, sim.x, sim.y, 0x8d9a90);
            scene.cameras.main.shake(110, 0.004);
            scene.game.events.emit("hud:toast", "Drop-spider disabled.");
          }
        }
        if (result.damaged) {
          runtime.damageCount += 1;
          runtime.invuln = cfg.invulnSeconds;
          if (!player.tethered) {
            const dir = body.center.x >= sim.x ? 1 : -1;
            player.jumping = false;
            body.setVelocity(dir * cfg.knock.x, cfg.knock.y);
          }
          scene.cameras.main.shake(150, 0.007);
          scene.cameras.main.flash(80, 90, 16, 12);
          burst(scene, body.center.x, body.center.y, 0xff5a3c);
          scene.game.events.emit("hud:toast", "The drop-spider strikes!");
        }
        draw(view, sim, runtime.time);
        const portrait = player.view;
        if (portrait) {
          if (runtime.invuln > 0) {
            const blink = Math.floor(runtime.invuln * 16) % 2 === 0;
            portrait.setTint(blink ? 0xff6a4a : 0xffffff);
            portrait.setAlpha(blink ? 0.62 : 1);
          } else if (runtime._wasInvuln) {
            portrait.setTint(0xffffff);
            portrait.setAlpha(1);
          }
        }
        runtime._wasInvuln = runtime.invuln > 0;
        scene.registry.set("spiderState", sim.state);
      },
    };
    runtime.setEnabled(win.__RBCeilingSpiderEnabled);
    scene.__rbSpider = runtime;
    win.__RBSpider = runtime;
    const world = scene.world;
    if (world && !world.__rbSpiderHammer) {
      const origHit = world.hammerHit.bind(world);
      world.hammerHit = (rect) => {
        const worldHit = origHit(rect);
        const spiderHit = scene.__rbSpider ? scene.__rbSpider.hammer(rect) : false;
        return !!(worldHit || spiderHit);
      };
      world.__rbSpiderHammer = true;
    }
    const player = scene.player;
    if (player && !player.__rbSpiderRespawn) {
      const origRespawn = player.respawn.bind(player);
      player.respawn = (x, y) => {
        const out = origRespawn(x, y);
        if (scene.__rbSpider) scene.__rbSpider.reset();
        return out;
      };
      player.__rbSpiderRespawn = true;
    }
    const onPost = (_time, delta) => {
      const live = scene.__rbSpider;
      if (live) live.postUpdate(Math.min(delta, 50) / 1000);
    };
    scene.events.on("postupdate", onPost);
    scene.events.once("shutdown", () => {
      scene.events.off("postupdate", onPost);
      runtime.destroy();
    });
    if (!win.__RBSpiderIntro) {
      win.__RBSpiderIntro = true;
      scene.time.delayedCall(700, () => {
        if (scene.scene.isActive()) scene.game.events.emit("hud:toast", "A drop-spider hides in the roots on the left ledge.");
      });
    }
    return runtime;
  }

  function patch() {
    const game = win.__game;
    const scene = game && game.scene && game.scene.getScene && game.scene.getScene("Game");
    if (!scene) return false;
    const proto = Object.getPrototypeOf(scene);
    if (!proto.__rbSpiderPatched) {
      const origCreate = proto.create;
      proto.create = function rbM43Create() {
        const result = origCreate.apply(this, arguments);
        attach(this);
        return result;
      };
      proto.__rbSpiderPatched = true;
    }
    if (scene.sys && scene.sys.isActive && scene.sys.isActive() && scene.player && !scene.__rbSpider) attach(scene);
    win.__RBCeilingSpiderInstalled = true;
    if (!win.__RBSpider) {
      win.__RBSpider = {
        version: "M4.3",
        states: SPIDER_STATES,
        placement: cfg,
        snapshot: () => null,
      };
    }
    return true;
  }

  if (!win.document) return null;
  if (!document.getElementById("rb-m43-caption")) {
    const cap = document.createElement("div");
    cap.id = "rb-m43-caption";
    cap.textContent = "M4.3 · Spider ahead on the first platform · J attacks";
    cap.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:10061;color:#f3ead4;font:600 12px Georgia,serif;background:#071c21ee;border:1px solid #8d7048;border-radius:8px;padding:8px 10px;pointer-events:none;max-width:min(420px,calc(100vw - 150px))";
    document.body.append(cap);
  }
  if (!patch()) {
    const timer = setInterval(() => {
      if (patch()) clearInterval(timer);
    }, 40);
    setTimeout(() => clearInterval(timer), 8000);
  }
  return win.__RBSpider;
}
