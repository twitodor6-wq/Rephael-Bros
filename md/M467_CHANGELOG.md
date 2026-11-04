# M4.6.7 — Changelog

## Added
- `src/scene-composer.mjs`: stage-local composition root with ordered actor registrations and a single active scene-create hook.
- Stage lifecycle diagnostic snapshot with attach/shutdown/failure counters and legacy-patch inspection.
- Three Node composition-contract tests and 18 Chromium lifecycle stress checks.
- One unified M4.6.7 build script and final build manifest with hashes.

## Changed
- Seven pre-existing sidecars now register their unchanged attachment function with the composer when M467 activates it; legacy patch code remains as an inactive rollback path.
- The composer final shutdown observer clears StageV1 runtime metadata to prevent stale bound prefabs after scene unload.
- M467 uses exactly the same Stage 01 JSON and legacy Phaser/core physics as M466.

## Preserved
- All Stage 01 scripted obstacles, sticky web, egg sac, spiderlings, Parallax, environmental anchors and character controls.
- Manual / Classic / Hybrid rope modes with untouched physics implementations.
- M466 standalone HTML and immutable editable-source snapshot.

## Validation
- 44/44 Node tests; 72/72 Chromium tests across six suites; formal JSON Schema valid with three negative fixtures; HTML build and embedded JavaScript syntax checks passed.
