# M4.7.1 — Stage 01 level-design report (Before/After)

## Confirmed production baseline from M470

- World 976×660 in authored Stage JSON; old Phaser bundled level width was 1100, and its **two original ground solids** are x70–370 and x706–976 at y490. The legacy center pit is x370–706.
- First bank has legacy tape anchor x514,y290, entrance living root x105,y250, falling-tree anchor x205,y185; fallen branch collision x346–512 when collapsed.
- Far bank: living shelf x718,y399, fragile ledge x858,y378 with hook x920,y330; gate art x916,y455 and guarded end threshold x946.
- Ceiling spider, egg sac, sticky web, bridges, art and parallax continue unchanged. They remain part of the original encounter order.

## Final Stage 01 map

| Interval / location | Existing or new? | Player purpose |
|---|---|---|
| x70–370 | Original launch clearing | Learn jump, gear, stable and fragile hooks |
| x370–706 | Original central pit | Main tape-swing challenge. Tree stub x300–348; after warning the short falling branch occupies x370–536,y459, **not a complete pit bridge** |
| x706–976 | Original far-bank spider/root encounter | Living root shelf, fragile rotten ledge and other existing obstacles |
| x976–1190 | **New eastern root path** | Safe recovery and run-up after first pit |
| x1190–1270 | **New 80px root gap** | Short jump in live Chromium QA; optional stable hook x1275,y260 |
| x1270–1780 | **New last clearing** | Landing, recovery and walk to the relocated forest exit |
| x1710,y455 | Relocated exit grove | Finish at player x1740+ with authored end offset, while on lower ground |

**World limits: 1800×660.** Legacy solid x706–976 remains exactly intact. Two *additional* Arcade bodies join at x976 and x1270; no body intersects the original solids. Camera follow and bounds widen to authored Stage width. Original tape physics, original pit edges and the baseline world drawing are not rewritten. Extra roots/soil are drawn using existing Phaser graphics/colors, without new art assets.

## Decision and change history

An initial proposed second gap of 170px was rejected after an actual jump test found a fall/respawn. Testing also showed that simple tape attachment without directed release did not automatically clear that geometry. The gap was reduced to **80px**, and the same real keyboard jump landed on the next ground surface. This adjustment changed **only Stage JSON geometry**, not jump or tape formulas.

The collapsing tree anchor moves from x205 to x300. Its existing stub size (48×5) and branch size (166×13) are preserved, with offsets adjusted from Stage JSON: stubOffset.x=0 and bridgeOffset.x=70. The collapsed branch is x370–536 with 170px clearance before the far edge of the original pit. Existing warning/collapse timings are unchanged. Same anchor ID and registry order; newly added root hook is appended to the list. The tree initially appears intact at the bank; after standing/pull warning it drops the branch over the pit. A gameplay collapse was observed in Chromium in two mutated variants.

## Editability without modifying JavaScript

1. **Tree position/bridge offset**: `objects[id=fallen-bridge-tree].position.x`, `properties.stubOffset`, `properties.bridgeOffset`; drawn geometry, Arcade body and anchor all derive from same Stage JSON.
2. **Eastern ground layout**: `world.forestExtension.surfaces[]` supports edited size and second-gap spacing with validated non-overlap; the Stage loader/runtime reads the JSON.
3. **Exit + optional hook**: change `forest-exit-grove.position.x` and `stable-root-extension.position.x`. The runtime adjusts the old world goal, camera bounds and prefabs automatically.

`world.forestExtension` is a **small Stage v1 extension**, separately validated and consumed in production. It does not activate M470's isolated `world.terrain` proof-of-concept. See `M471_JSON_MUTATION_REPORT.md` for two actual in-memory Chromium variations.

## Layout and evidence

See `M471_STAGE_MAP.svg`, `evidence/M471_NEW_FOREST_START.png`, `evidence/M471_NEW_FOREST_END.png`, `evidence/M471_SECOND_GAP_LANDING.png`, and variant screenshots. The SVG/PNG previews are derived evidence only, **never a second content source**.
