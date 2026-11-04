# Enemy prefab contract — S2

Stage v1 remains `1.0.0`: `ceiling-spider` is an optional additive object family. Existing stages with no authored spiders compile and spawn none. Runtime no longer creates an implicit default spider. `SPIDER_PLACEMENT` remains only the pure simulation API's historical default/reference, not a Stage runtime source.

`stages/s01.stage.json` contains the exact former placement. `position` is the ceiling-rest origin. `attackOffsetY`, `platformOffsetY` and `triggerOffset.{x,y,w,h}` are local to it. Moving that position moves the simulation, trigger, hitbox, silk, cover and platform mark together. Positive finite timers/speeds, body sizes and derived world bounds are validated before attachment. Bounds validation is not a solid-ground/reachability guarantee: designers must put the platform mark on real ground and review custom encounters in Phaser.

## Runtime

`makePrefabRegistry` compiles Stage objects; `mountRBEnemyPrefabs(scene, loader, adapters)` consumes `getInstances(type)` and binds each actor by stable Stage ID. The ceiling-spider adapter is installed as `enemy-prefabs` through the existing Scene Composer. The old independent create patch/polling loop is removed from the S2 output.

Adapters receive `(scene, config, id)`, own graphics/simulation/resources and expose `postUpdate(dtSeconds)`, `hammer(rect)`, `setEnabled(bool)`, `reset()`, `snapshot()` and idempotent `destroy()`. The collection fans calls out, owns bindings and rolls back completed mounts when a later adapter fails. A throwing adapter must clean any resources it allocated before it returned. Scene hooks wrap the existing hammer/respawn chain once and restore it when still owned on teardown; shutdown/destroy remove the postupdate listener and references.

`window.__RBEnemies.snapshot()` returns all instances. `window.__RBSpider` / `scene.__rbSpider` preserve first-spider `sim`, `view`, and `snapshot()` diagnostics; hammer/reset/toggle dispatch to the collection. The existing spider toggle controls all authored ceiling spiders and persists over Restart. Each spider keeps its own state; the collection shares the player immunity window, preventing simultaneous damage from overlapping authored spiders.

To add an enemy: extend the existing prefab enum, JSON Schema conditional and semantic validator; register its configuration compiler; provide one adapter; add it to the adapter map at the composition boundary; test zero/multiple instances, malformed input, mount failure, OFF/reset/shutdown and actual Phaser behavior. Do not add another Game.create patch.

## Compatibility review: webs and eggs

| Existing component | Fit | Required future extraction | S2 action |
| --- | --- | --- | --- |
| Interactive sticky web (`rb-m44-sticky-web`) | A reusable hazard adapter, not a decorative background layer | Move `STICKY_WEB_CONFIG` to Stage data, keep pure state helpers, adapt reset/update/hammer, explicitly release `player.inWeb`, preserve contact damping and tape checks | Embedded script retained byte-for-byte; no placeholder prefab registered |
| Egg sac + spiderlings (`rb-m45-egg-sac`) | One compound enemy adapter owns the sac and its spawned children | Move `EGG_SAC_CONFIG` to Stage data, retain hatch/baby simulation and invulnerability/bump rules, clean all children and hooks on OFF/shutdown | Embedded script retained byte-for-byte; no duplicate implementation |
| Decorative/local web response (`src/web-response.mjs`) | Visual anchor response, not an enemy | Keep existing anchor/presentation ownership | Source unchanged |

Both historical hazards wrap hammer/respawn and own postupdate handlers. The S2 spider wrapper calls the prior chain before its own dispatch, preserving their handlers. Their extraction is intentionally deferred to avoid changing tape/contact behavior during this milestone. Hash equality proves preservation, not runtime regression acceptance.
