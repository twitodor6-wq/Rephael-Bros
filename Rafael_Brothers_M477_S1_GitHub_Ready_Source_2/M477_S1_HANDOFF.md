# M4.7.7-S1 — Rafi RUN prototype

Baseline: verified M4.7.6 full source ZIP SHA256 `2286ac5fa4ea28d2697b22df0a0c2af8672972f10a0eb31bafcbfff05c323163`.

Open `dist/Rafael_Brothers_M477_S1_RAFI_RUN_PROTOTYPE.html` directly, offline. Enter starts; A/D or arrows move, Space jumps, J hammer, K drill, E tape, Tab switches actor, R restarts. Stage Modules → Art → Rafi RUN toggles the prototype. Asset default is ON.

## Integration map

`assets/characters/rafi_run_12frames_4x3_PROTOTYPE.png` → `assets/rafi-run-prototype.asset.json` → embedded once by `build-m477-s1.mjs` → `src/rafi-run-sprite.mjs` → Scene Composer managed actor → Stage Modules visual toggle → `tests/m477-*`.

The adapter reads the existing player's body center and bottom; it never creates a body or collider. It displays a separate depth-20 Sprite only for grounded, moving Rafi with matching input/velocity directions. It hides only the original `player.view`. Idle, turning, jumping/falling, attached tape, sticky web, tool cooldown, finished stage, Shaul and disabled/not-ready assets restore the original view. A large position reset clears the overlay for one update.

The supplied PNG is unchanged. Grid 4×3, 320×320, 12 frames, 13.333333 fps, loop 0.9 s. Uniform scale .23; X pivot160; per-frame Y pivot uses supplied alpha-bound yMax+1. This compensates up to23 source pixels of foot-height drift without stretching. It cannot correct compressed/missing source detail.

To replace the experimental art: provide a clean RGBA sheet and update the versioned Asset JSON path/SHA/grid/timing/pivots and unique texture/animation keys. Run build validation, Node tests and browser visual/fallback/parity tests. Do not modify player physics to fit artwork. The contract intentionally admits only Rafi/run/prototype; new animation states require explicit future work.

The loader caches one texture and animation blueprint per Phaser Game. Active playback and the presentation Sprite belong to the scene; they stop/hide on fallback and are destroyed on scene shutdown. Cached definitions survive Restart intentionally. Async decode cannot create a Sprite in a disposed/inactive scene. Decode failure retains the original view and exposes assetErrors.

## Build and QA

Node20+; `npm run build`, `npm test`. Browser scripts require Playwright plus a compatible Chromium; set `CHROMIUM_PATH` if needed. `npm run qa:m477`; `npm run qa:m477:parity`; `npm run qa:m477:visual`; `LAUNCH_FILE=1 RENDERER=webgl npm run qa:m477:smoke`. RECORD=1 enables native browser video. No network runtime dependencies exist in the built HTML.

Historical `m476-*` reports/scripts describe M476 evidence and remain available; they are not new M477 full-stage results. See current QA report.

## Rollback

Use the untouched M476 ZIP above for the authoritative rollback. The source package also includes `rollback-m477-to-m476.zip`, `rollback-m477-to-m476.json` and `scripts/rollback-m477-to-m476.py`; run the script only on a disposable copy. It restores changed/deleted baseline files and removes this milestone's added files, then validates every original SHA. No deployment was performed.
