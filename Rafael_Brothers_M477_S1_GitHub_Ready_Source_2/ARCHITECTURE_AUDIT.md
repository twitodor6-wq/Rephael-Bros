# Rafael Brothers M4.6.5 — Architecture Audit

## Verified input / source of truth

Read `M464_HANDOFF.md`, `M464_QA_REPORT.md`, `M464_KNOWN_ISSUES.md`, the stage anchor/module manifests, current actor sources, the archived M4.6 implementation and tests. The supplied ZIP has **no contemporary TS/Vite complete project at the root**. The latest M4.6.4 uses an HTML baseline plus eight injected JS sidecars, built by `build-m464.mjs`. The M46 archived source is older; the current behavior is the M4.6.4 playable HTML, **not** an older TS source. `PROJECT_RULES.md` was not present at the current ZIP root.

## Components and actual ownership

| Existing code | Responsibility | Status after M4.6.5 |
| --- | --- | --- |
| `baseline/M46_RELEASE.html` | Legacy game/Phaser scenes, player Rafi/Shaul, movement, TapeMeasure and Swing Lab modes, existing world collision, HUD, pickups, stage finish, original M4.6 art | **Unchanged byte-for-byte**. Contains substantial coupled game logic. |
| `m46_source_archive/src/*.mjs` | Archived M4.3–4.6 ceiling spider, sticky web, egg sac, parallax/ambience, telemetry, Swing Lab, bridge implementation | **Preserved**. Bundled into the stable baseline or retained for audit. |
| `src/stage-modules.mjs` | Groups **existing** feature-switch DOM elements, leaving each feature responsible for its toggle implementation | Reads generated compatibility view from unified stage data. Categories are still fixed in the panel. |
| `src/environmental-anchors.mjs` | Stable object-identity refs in native tape `.anchors`; flag-aware hook lifecycle | Reads generated unified stage data, registers prefab identity (four anchors). |
| `src/bridge-polish.mjs` | Render and Arcade collider of living far-bank shelf; disable older collision | **Migrated** authored geometry to Stage JSON (`root-bridge` prefab). |
| `src/rotten-root.mjs` | Far-bank fragile shelf, warning/collapse, audio, Arcade bodies, hook | **Migrated** authored geometry and timing to Stage JSON (`rotten-root` prefab); resolves hook via the anchor object ID. |
| `src/falling-bridge-tree.mjs` | Left-bank collapsing branch and short bridge, near-bank anchor | Behavior and geometry **unchanged** this milestone, though hook is now assembled from unified JSON. |
| `src/exit-grove.mjs` | Natural root gateway / end condition | Unchanged; finish geometry still local constants in actor code. |
| `src/web-response.mjs` | Parallax damping / localized cosmetic web movement | Unchanged. |
| `src/stage-loader.mjs` | **New** schema validation + compilation + prefab factory registry + runtime references | Supported for three types and six instances; does not replace Phaser actors. |
| `stages/s01.stage.json` | **Authoritative editable M4.6.5 stage data** | Four environmental anchors, one root bridge, one rotten-root actor; module flags and asset references. |
| `stages/s01.anchors.json`, `stages/s01.modules.json` | Compatibility views for old tests and code | **Derived on every M4.6.5 build**. Do not edit directly. |

## Debt and duplicated responsibility

1. The engine and several new features remain composed through an HTML baseline + individual script tags rather than a single TS module graph. This remains deliberate for safe rollback; not a completed bundler migration.
2. Older legacy source still retains conceptually similar root bridges and colliders. Bridge-polish intentionally disables the older overlay and collider each frame; removing it requires dedicated regression testing.
3. Exit trigger location, initial spawn/ground/platform coordinates, pit geometry in older hazard sources, spider/web settings, and asset integration still contain legacy constants. Only the defined POC objects migrated.
4. `stage-modules.mjs` controls the panel UI, while each individual module still owns its own enabled state and cleanup; moving flags alone does not create generic lifecycle hooks.
5. Legacy actors monkey-patch Phaser scene `create` to attach; patch order and asynchronous initial detection are fragile architectural dependencies.
6. `backgrounds.layers` is an authoring catalogue only; the approved parallax is still emitted by the older art pipeline. Audio & sprite animation catalogues are reserved, not yet managers.
7. Several old artifacts, historical test files and HTML builds are intentionally retained, but they are **rollback and evidence, not current source for Stage 01 geometry**.

## Dependency map

```text
stages/s01.stage.json [EDITABLE SOURCE OF TRUTH]
  -> build-m465.mjs -> validation in src/stage-loader.mjs
     -> embedded __RB_STAGE_V1_DATA -> installStageLoader()
        -> compiled __RB_STAGE_MODULE_CONFIG -> stage-modules.mjs -> existing DOM switches
        -> compiled __RB_STAGE_ANCHOR_CONFIG -> environmental-anchors.mjs -> existing TapeMeasure.anchors
        -> root-bridge prefab -> bridge-polish.mjs -> Phaser Graphics + Arcade collider
        -> rotten-root prefab -> rotten-root.mjs -> Graphics + Arcade collider(s) + anchor ID
     -> emits stages/s01.{modules,anchors}.json [GENERATED VIEWS]
     -> baseline/M46_RELEASE.html [FROZEN LEGACY GAME]
        + eight ordered sidecars -> dist/Rafael_Brothers_M465_MODULAR_STAGE.html [OFFLINE]
Phaser Game Scene + native player/TapeMeasure/World
  -> every sidecar depends on scene lifecycle and runtime objects
  -> inherited forest art, web, spider, egg sac, falling bridge, exit grove remain as before
```

**Safety:** tape formulas, mode selection, movement, parallax implementation and current audio synthesis were not rewritten. A three-type prefab POC is not full engine decoupling or multistage loading.
