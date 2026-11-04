# Rafael Brothers — M4.6.5 Changelog

## Added
- `stages/s01.stage.json` authoritative Stage 01 data with stable object IDs and three prefab types.
- `schemas/stage.v1.schema.json`, `src/stage-loader.mjs`: stage data validation, prefab registry, actor configuration, runtime instance binding.
- `build-m465.mjs`: reproducible single-HTML build, JS syntax validation, baseline SHA and stage/loader hashes; emits legacy manifest views from unified data.
- Schema, browser, rope mode, JSON mutation and lifecycle regression tests and reports.
- Architecture audit, dependency design, asset/animation/audio interface plan, Forge compatibility audit and migration roadmap.

## Changed
- `bridge-polish.mjs` reads living shelf and decorative support geometry from Stage JSON, preserving Phaser collision/render ownership.
- `rotten-root.mjs` reads ledge position/dimensions and warning parameters from Stage JSON; resolves hook position through authored environmental anchor ID.
- `environmental-anchors.mjs` records prefab runtime bindings without changing tape formulas.
- Root `package.json` now builds M4.6.5; prior M4.6.4 remains available for rollback.

## Unchanged intentionally
- Legacy M46 HTML baseline; Rafi/Shaul controller, jump/air control and tape physics/three swing modes.
- Fallen branch, exit grove, spider, sticky web, egg sac, parallax and atmosphere behavior; all existing visual art.
