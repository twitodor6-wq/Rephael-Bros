# Rafael Brothers — M4.6.7 Architecture Delta

## Target: Unified Scene Lifecycle / Controlled Composition Root

M4.6.6 injected eight JavaScript sidecars and seven different scripts independently wrapped `GameScene.prototype.create` and polled for the game scene. In M4.6.7, a new `src/scene-composer.mjs` is the single active adapter that wraps `GameScene.prototype.create` (once), controls the order in which all seven actor sidecars attach and reports diagnostic state. The eighth module, Stage Modules, is DOM/UI-only and is installed separately before actor registration.

```text
unchanged M4.6.4 baseline HTML
 -> Stage 01 JSON + unchanged M4.6.6 Stage Loader
 -> createRBSceneComposer()  [one registry + one create adapter]
 -> installStageModules()  [panel only]
 -> seven sidecars register their existing attach(scene) functions
 -> composer.start()
 -> Phaser GameScene.create()
 -> composer.attach() in dependency order
    bridge-polish -> stage-dressing -> environmental-anchors
    -> rotten-root -> falling-bridge-tree -> exit-grove -> web-response
 -> Phaser scene SHUTDOWN: existing actors own their collider/graphics/event cleanup
 -> composer final shutdown observer invalidates scene epoch and clears StageV1 runtime bindings
```

## Source compatibility and boundaries

- The seven sidecars retain **inactive** legacy fallback patch/install paths for rollback and staged migration. The M467 HTML activates the managed registration branch first, so the seven legacy `create` monkey-patches are **not installed**. Browser verification checks each corresponding prototype flag.
- No modification to the core Phaser Arcade physics, character movement, rope formulas, swing tuning, or Stage 01 authored coordinates.
- The composition root does not own or destroy the actual actor colliders, Phaser graphics or audio nodes; each actor still owns its shutdown cleanup. A final metadata cleanup handles legacy actors that did not unbind all their StageV1 references. This is safe after all actors' shutdown callbacks, as the composer listener is added last.
- Stage Modules retains its existing DOM listener model; migration of the persistent panel into a more general UI lifecycle is deferred.
- Existing `stage.json` schema v1.0.0 and the five prefab types/seven authored objects are unchanged. The legacy baseline may still have unrelated native scene hooks and graphics.

## New tests

`tests/m467-composer.test.mjs` provides a pure Node test of completeness, registration ordering, idempotent scene attachment and recovery after shutdown. `tests/m467-scene-lifecycle-qa.py` checks actual Chromium + Phaser: seven registrations, no legacy patches, exactly one composition root, 5 consecutive restarts, stable listener counts, no duplicate anchors, and zero lingering StageV1 runtime references after the Game scene is stopped.

## Remaining work

The runtime still composes on top of the legacy HTML baseline rather than a single modern TS/Vite tree; stage-specific hardcoded geometry exists in art-only layers. Full actor teardown ownership, cross-stage switching, performance profiling, Safari/iPhone smoke, screenshot parity, and removal of dormant fallback monkey-patch code remain deferred until evidence supports a safe migration.
