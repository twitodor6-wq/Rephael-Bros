# Egg Sac + Spiderlings Prefab — M477-S4

`egg-sac` is an optional additive Stage v1 (`1.0.0`) family. `stages/s01.stage.json` is the sole active source of position/tuning. No authored eggs means no egg graphics, children or implicit fallback enemy. `EGG_SAC_CONFIG` is retained solely as the historical pure-model reference; the live adapter always receives compiled Stage config.

## Data

Origin: `position:{x,y}` at sac center. Required properties:

| Field | Meaning / permitted range |
| --- | --- |
| `radiusX`, `radiusY` | Sac ellipse/hitbox half-size, 1..100 |
| `silkTopOffsetY` | Relative silk mount Y, -2000..-1; must be above sac |
| `groundOffsetY` | Relative spiderling floor, 1..2000; below sac and within world |
| `hatchSeconds` | Crack delay, .01..10 seconds |
| `count` | 1..32 integer children per sac |
| `gravity` | Existing kinematic baby gravity, 1..2000 |
| `spiderlingLifeSeconds` | .1..30 seconds |
| `spiderlingSpeed` | 1..300 |
| `roamOffset:{minX,maxX}` | Relative horizontal roam interval, ordered and within world |
| `damageCooldown` | .1..10 seconds |
| `bumpX`, `bumpY` | Safe-side knockback magnitude 0..500 and vertical -500..0 |

All numbers must be finite; missing and unknown properties are rejected. Semantic validation checks derived world bounds and floor ordering. JSON Schema handles primitive contracts; Stage Loader handles cross-field geometry. Authoring does not infer collision terrain or ensure a custom enemy is balanced. A child uses the legacy kinematic floor/roam behavior, not Arcade enemy bodies.

Stage 01 matches the original at (332,355), radii 23/29, silk Y75, floor Y490, delay .24, 7 babies, gravity640, life8.5, speed64, roam178..356, immunity1.15 and bump(-125,-165). Moving the origin moves all local geometry, spawning, floor and visuals together. The fixed leftward bump preserves the original safe-side behavior; custom placements must be reviewed accordingly.

## Ownership and lifecycle

Legacy pure model (`makeEggSac`, `stepEggSac`, `hammerEggSac`, `resetEggSac` and helpers) is byte-identical. The original drawing remains local to the installer with explicit config/scope parameters. `installSpiderlingEggSac` registers one `egg-sac-prefabs` managed actor. Scene Composer orders egg → sticky web → ceiling spider, preserving the previous update/hook layering. Core, S2/S3 adapters, rope, camera, trees and art are unchanged.

The existing `mountRBEnemyPrefabs` owns stable Stage bindings and collection dispatch. Each egg owns one sim, one local ResourceScope and four graphical objects (silk, sac, baby batch, label). Children live only in their owner's sim; snapshots add `ownerId`, while the legacy local child index remains unchanged. No hatch timer/interval is allocated: the deterministic update clock handles hatching/lifetime.

All egg instances share one collection-level player immunity window, preventing overlapping batches from delivering duplicate hits in one cooldown. The pure per-sac cooldown is synchronized at the adapter boundary. Ceiling spider immunity remains unchanged and separate; this milestone does not introduce a new global damage system. Attached tape suppresses egg knockback as before, without editing tape state.

Managed reset/Respawn resets every sim and empties children. OFF resets immediately and blocks updates/tool hits; ON restores intact sacs. Shutdown/destroy remove one update listener, all graphical objects, children, Stage bindings and current facade references. Composer destroys later wrappers first; existing hammer/respawn functions are restored only while owned. A failed constructor or later binding rolls back created resources.

## Diagnostics and tools

`window.__RBEggSacs.snapshot().instances` enumerates sacs and owned babies; `lifecycleSnapshot()` reports the group scope. `window.__RBEggSac` / `scene.__rbEggSac` retain first-sac config/sim/view/snapshot and collection hammer/reset/destroy dispatch. First-sac snapshot is null for zero sacs.

The real existing `world.hammerHit(rect)` chain cracks intact sacs and defeats overlapping live spiderlings. The drill retains its prior behavior; no new drill destruction ability is introduced. No player collider/body, tape anchor, camera motion, or separate physics formula is added.
