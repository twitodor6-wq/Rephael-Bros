# M4.7.2 — HANDOFF

**Release status: TARGETED CHROMIUM QA PASS / NOT UNASSISTED END-TO-END CERTIFIED**.

## What shipped

- Generic, pure static rope-crossing safety validator with PASS / WARN / FAIL / NOT TESTED evidence and gated release checks.
- Stage-loader read-only adapter deriving all 4 ground rectangles and extra active/inactive Arcade static bodies from the live Phaser scene, plus stage semantic links.
- Stage v1 additive optional `ropeCrossings` link for the existing eastern forest gap; first pit remains auto-derived from legacy runtime solids.
- No changed tape, body-motion, player, bridge physics or game-core formulas. Stage 01's verified anchor remains x1230,y260.
- New Playwright QA, Node mutation and universal fixtures, compatibility Chromium QA, new HTML, separate M472 builder.

## Where to continue

1. Read `docs/ROPE_CROSSING_SAFETY_CONTRACT.md`; preserve the source-of-truth boundary.
2. Extend controlled trajectory scenarios to genuine unassisted approach/swing, moving environment and both characters across multiple levels.
3. Add provenance-aware crossing scenarios when Stage 02+ exists; no hard-coded location/anchor-ID inside generic validator.
4. Use full `npm run qa:release` after any Stage JSON/HTML change; SHA mismatch intentionally blocks publication.

## Risks and rollback

- A local static PASS is a finite geometric sample, not a physics proof or full-play approval.
- Runtime snapshot reflects current collider state, not all future collapse/enable transitions.
- Never shift stage anchors programmatically or introduce a second terrain source for Stage01.
- Full rollback: use unchanged user-provided M4.7.1.1 source ZIP.
