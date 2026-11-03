# Schema evolution — M469

PASS-capable code: existing Stage v1.0.0 JSON remains supported byte-for-byte. `validateStageStructure` validates generic shape (world, IDs, positions, module descriptors, optional camera). `validateStageV1` then applies Stage01 inventory, supported prefab, linkage and geometry invariants. Empty generic object/module lists may be structurally valid but cannot compile as Stage01. Malformed input returns validation errors before the stage-specific pass.

One production data subdomain is implemented: optional `camera.bounds = {x,y,width,height}`. Bounds must be finite, positive in size and contained in the stage world; schema handles shape and JS handles cross-field containment. The Stage Loader returns a copy and Composer invokes Phaser Camera.setBounds only when present. Omitted means no camera call. Existing s01.stage.json is unchanged. The browser JSON mutation proof checks actual camera._bounds, along with inherited branch/exit mutation checks. Bounds affect view only; geometry, physics and challenge placement remain unchanged.

The separate `transition-experiment.v1.schema.json` is executable for two tiny experimental scene definitions. It has its own world origin/size, spawn/exit points, explicit prefab/asset lists and optional camera; this is not a production Stage02 schema. Its adapter consumes the same frozen prototype data and pure session contract.

DESIGN ONLY, future general production contract (v2 draft, not accepted as executed data by Game):
- world/terrain: surface rectangles and pit intervals with stable IDs and material/profile references;
- start/checkpoints: position, facing, character policy and stable checkpoint ID;
- exit: trigger rectangle, conditions and destination stage ID;
- assets: manifest IDs with paths, type, owner (shared core/stage), preload dependency and release policy;
- camera: bounds now executable; zoom, dead-zone and follow policy remain future;
- backgrounds: ordered asset/layer IDs, parallax factors and camera-follow axis; current legacy art remains untouched.

Migration must first prepare/validate without touching the active stage, then use a version-specific compiler. Never treat a schema field as implemented until a mutation test proves its runtime consumer. Generic production transitions require terrain/enemy/core ownership work beyond this milestone.

## M4.7.0 isolated runtime extension

Exactly one new optional Stage v1 subdomain: `world.terrain = {surfaces:[{id,x,y,w,h}],pits:[{id,start,end}]}`. Structural validation checks shapes, stable IDs, positive rectangles, world bounds, no surface/pit interval intersection and no overlapping pits. `stages/m470-world-fixture.json` provides this data; `schemas/m470-world-fixture.schema.json` is an isolated permissive fixture variant allowing empty objects/modules. It is not the Stage01 production schema and cannot be promoted to Stage v2 by inference. `compileRBWorldFixture` and `mountRBWorldFixture` provide a Phaser runtime consumer, and a mutation/cleanup test exercises the actual body coordinates/camera/exit zone. Existing Stage01 JSON and original game physics remain unchanged.
