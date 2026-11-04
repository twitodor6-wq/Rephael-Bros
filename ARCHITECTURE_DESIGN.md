# M4.6.5 Modular Architecture & Stage API

## Source & build

- Edit `stages/s01.stage.json` for **supported** Stage 01 prefabs and Stage Modules. Do not edit the `s01.modules.json` or `s01.anchors.json` files; they are generated compatibility views.
- Versioned JSON reference schema: `schemas/stage.v1.schema.json`; runtime semantic validator: `validateStageV1` in `src/stage-loader.mjs`.
- Build: `npm run build` (Node 20+). The script validates the stage, regenerates compatibility files, embeds data plus loader and actor sources, checks inline JS syntax and emits a single HTML. No CDN or server at runtime.
- `installStageLoader` processes the stage before sidecars. `makePrefabRegistry` supplies factories for `environmental-anchor`, `root-bridge`, `rotten-root`. Factories produce validated instance configurations, not replacement physics controllers.
- `window.__RBStageV1.getConfig(type,id)` provides actor configuration; `bindRuntime(type,id,actor)` records an existing actor. `snapshot()` exposes binding state for QA. Native actor still owns create/update/disable/reset/destroy.
- Current game still has one fixed `Game` Phaser scene. General scene instantiation, streaming external JSON, new levels, enemies and global manager construction are **deferred**.

## Geometry and responsibilities

- For `root-bridge`, the object position in Stage JSON is the shelf top-left and `properties.size` determines drawing and Arcade collision size. Decorative fractured supports live in the same object's properties. Pit safe-region policy is validated.
- For `rotten-root`, the position defines the live fragile ledge; its visual linework, warning and collision region use exactly that config. The rope hook location is resolved by `anchorId` against the `environmental-anchor` object rather than authored twice.
- For `environmental-anchor`, each ID, hook position, strength, category, gating flag and collapse outcome are authored once; the existing tape array receives the exact references. Disabled/broken anchors are removed and attached rope safely releases.
- Legacy `falling-bridge-tree` and stage-exit geometry are intentionally NOT migrated now; this is the next safe isolated step.

## Prefab lifecycle contract (current POC)

`prepare (JSON) -> register -> actor create -> per-frame update -> actor disable/reset -> actor destroy on scene shutdown`

The Stage Loader itself only prepares and records runtime objects. Native actor scripts dispose graphics, colliders, zones and postupdate subscriptions on scene shutdown, with their own toggle behavior. Runtime bindings are a diagnostic registry; they are overwritten by matching IDs on restart. The loader does **not** currently own teardown or general factory-created actors. Do not mistake the POC for a complete universal lifecycle manager.

## Compatibility, bounds and validation

Use pixel coordinates with x right/y down. Object positions must be finite and inside authored world bounds. IDs are stable and unique across all objects. Unknown prefab names, missing referenced anchors, duplicate module flags, unsupported schema versions and unsafe living-root placement fail the build. JSON Schema catches structural/type problems when run by an external Draft 2020-12 validator. Runtime semantic validation performs cross-object safety checks, independently of JSON Schema.

## Data areas reserved for later milestones

The Stage 01 document contains `backgrounds.layers` asset IDs, `atmosphere`, `challenges`, `triggers`, `animations`, `audio`, and `difficulty` slots. They **do not** yet instantiate new features. Actual player spawn, checkpoints, world camera rules and completion guard have not been migrated: recording these as authoritative now would risk disagreement with the unchanged engine.
