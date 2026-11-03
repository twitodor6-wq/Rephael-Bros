# M4.7.2 — Rope Crossing Safety Validator Contract

## Scope

- Pure `src/validation/rope-crossing-safety.mjs`, no Phaser dependency and no runtime force/collision mutations.
- `src/stage-loader.mjs` delivers `getRopeCrossingSnapshot(scene,profiles,tape)` using Stage JSON plus **actual** `scene.world.solidRects` and Phaser `staticBodies.entries`; only active bodies block simulated sweeps.
- First-pit `legacy-ground-*` IDs are **derived, read-only local report identifiers**. They are not copied into Stage JSON. The second pit uses IDs already in `world.forestExtension.surfaces`.
- Extra enabled Phaser static bodies are considered as collision obstacles, but not as terrain ground from which gaps are inferred.
- Optional `stage.ropeCrossings` semantic refs (Stage schema 1.0.0 additive): `{id,kind:'tape-crossing',leftSurfaceId,rightSurfaceId,anchorId}`. All linked IDs are validated, a compiler/runtime consumer exists, mutation tests cover resolution. No positions or duplicates of geometry in crossing records.
- Unlisted adjacent same-height ground rectangles are discovered automatically. Snapshot metadata for Stage01's first pit and legacy original hook is obtained from live `scene`/`tape.anchors`, not an invented Stage 01 terrain fixture.
- `stages/fixtures/m472-{a,b}.json` demonstrate portable geometry on an entirely different 900px world without editing the validator.

## Public API

Node: `validateRopeCrossingSafety(snapshot)`, `assertRopeCrossingGate(report,{allowNotTested?})`.

Browser (read-only):

```js
window.__RBRopeCrossingSafety.snapshot();
window.__RBRopeCrossingSafety.report();
window.__RBRopeCrossingSafety.gate(window.__RBRopeCrossingSafety.report());
```

Input snapshot:

```json
{
  "world":{"width":900,"height":660},
  "surfaces":[{"id":"bank-a","x":20,"y":490,"w":190,"h":170,"enabled":true,"role":"ground"}],
  "anchors":[{"id":"anchor-a","x":250,"y":210,"active":true,"strength":"stable"}],
  "profiles":[{"id":"profile","width":28,"height":64}],
  "tape":{"maxLength":425},
  "crossings":[{"id":"crossing-a","leftSurfaceId":"bank-a","rightSurfaceId":"bank-b","anchorId":"anchor-a"}]
}
```

Example is partial: an actual snapshot needs both bank rectangles. Coordinates belong to surfaces/anchors, not to crossing records.

## Rules and statuses

- **PASS:** available evidence and sampled static reel paths clear for included profiles/approaches. Not a guarantee of full playability.
- **FAIL:** a sampled body sweep collides with enabled geometry, range/cone violation, narrow gap, world bounds violation, or malformed duplicate geometry.
- **WARN:** fragile anchor; collision may change during play. Can be combined with independent PASS checks.
- **NOT TESTED:** missing or inactive surfaces/anchors, missing hitbox or tape settings, no detectable gap, or unsampled cases.
- The gate refuses FAIL; by default also refuses NOT TESTED. The build permits NOT TESTED **only** for early preflight without a verified Phaser profile, and does not then claim approval. `npm run qa:release` requires verified full Chromium evidence at the exact Stage+HTML hashes.
- Sweep uses exact player body width/height per selected profile; the wall-edge probe inset is <=1px for numerical stability, not a fixed 14px geometry margin. Samples cover a 120px or half-distance inward segment toward the anchor; they do **not** claim to simulate the full dynamic tape motion.
- No universal rule that anchor X must be inside a gap. Trajectory and active body intersection are the decision criteria. An elevated-entry example with a right-bank hook is covered in Node tests. Unsafe low reeling into a bank remains a FAIL.

## Ownership and source provenance

- Stage authored surfaces/anchors: `stages/s01.stage.json`.
- Live original collision map, legacy anchor and hitboxes: original Phaser `Game` scene.
- Legacy tape maximum reach: **425px parsed at build time from the unchanged immutable Game Core code**; build aborts if the parse/consistency guard no longer matches. The 425 is never used to change the engine.
- Build's early static check uses profile dimensions recorded by M472 Chromium only when matching the immutable baseline SHA, with no character sizes hard-coded in the general validator.
- Runtime collision fields are read-only; `world.terrain` M470 remains only a separate fixture and is not activated.
- All QA set-up uses controlled positions: **real keyboard** and **real Phaser updates**, not unassisted progression.

## Limitations

- Sampling does not prove every arc, line-of-sight and collision shape, rope tension, moving hazard or interactable state. Conditional colliders are captured at current time, not exhaustively for all state combinations.
- `legacy-ground-N` is a snapshot-local runtime ID; do not author cross-Stage persistent references to it. Migrate legacy ground to Stage JSON under a separately verified migration.
- Modes are tested in Chromium by real keyboard, but Safari/mobile and human end-to-end full traversal are NOT TESTED.
- An intentionally disabled crossing is NOT TESTED, not a passing or verified playable route.
