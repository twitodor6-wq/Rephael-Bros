# M477-S1 design / integration map

Scope is the supplied focused visual-only POC, executed autonomously from the detailed work prompt. User-specified constraints are binding; no new character states/assets or backgrounds. No new physics or player calls.

Baseline: restored M476 source ZIP from its delivered Library identity.126 manifest hashes match; original QA gate and fresh135 Node tests/build pass. Old six Canvas runs and WebGL limits remain historical until rerun.

Chosen single extension: `assets/rafi-run-prototype.asset.json` → embedded PNG/manifest data at build → `src/rafi-run-sprite.mjs` loader + presentation adapter → one final Scene Composer slot → existing Stage Modules button. Global texture and animation definition are cached once per Phaser Game. Scene-owned visual Sprite has NO body/collider; destroyed on scene shutdown; active animation stops when falling back. Immutable cache definitions intentionally survive scene restart, then Phaser Game disposal owns their removal.

Read original player.view / body / activeId / facing and tools cooldowns. Overlay only for Rafi on ground, movement input + speed≥18, no tape attachment, tool use or sticky web. Use bottom-center body location for rendering, fixed uniform0.23 scale, per-frame Y pivot from supplied bounds yMax+1 (no image edits, no dynamic stretching), X pivot160. Flip X for left. Other states show original view untouched. OFF restores original visibility immediately. Prototype enabled by default for review, clearly labelled; status is never production-ready.

Alternatives rejected: replacing player texture would affect its body/offset contract; patching player.update scatters new presentation rules into preserved core. A separate render adapter uses the existing lifecycle without either change. These are implementation choices within the supplied POC, not extra user approval requirements.

Tests: policy negatives; 12 calibrated poses; manifest rejection; no physics writes; original core/camera/Stage geometry hashes. Chromium true keyboard run/stop/left/right/jump/J/K/tape/Shaul/OFF/ON/restart/death; paired deterministic fixed-step ON/OFF body traces (explicit controlled diagnostics, not human play); exact screenshots; native QA movie; WebGL smoke if available. Do not claim six new whole-stage runs unless all six actually run.
