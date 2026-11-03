# Rafael Brothers M4.7.1 — QA REPORT

**Milestone: QUALIFIED / PLAYABLE, not unconditionally COMPLETE.** Conducted 29 October 2026 in local Node.js 22.16 / Chromium 144.0.7559.96 / Python Playwright.

## Baseline and source preservation

- Original uploaded `Rafael_Brothers_M470_Source_QA(1).zip` SHA256 `8456396a4b691d5819a801339d29b87fbf29217f9113794938b6919883107d34` retained unchanged outside the release ZIP; record is in Manifest.
- Unmodified M470 source built successfully before edits. After restoring archive-dependent historical snapshots, **85/85 Node tests PASS**. Without those archive folders two tests initially failed with ENOENT; that was extraction incompleteness, not an M470 regression.
- Production M470 Stage JSON copied without modification to `stages/s01.m470.rollback.json` SHA256 `f51fbb0a323a64e7967faf0d7f434f6b5c4f3cbaf477975e92429b71e3bce5d4`.
- Original Phaser M4.6 baseline HTML unchanged: SHA256 `6255d2343a0d59bb9827d6ca7c3740b7f23b0e40969adeb45127d435ca724e31`. Tape/rope formulas in that baseline were not edited.
- Historical M470 source QA reports preserved under `archive/M470_reference_docs/`; M468/M469 Hybrid FAIL reports were not rewritten.

## Current production source and browser results

| Test | Result | Evidence |
|---|---|---|
| `npm run build` | PASS; standalone 2.37MB HTML, inline JS parses | `dist/Rafael_Brothers_M471_ROOT_FOREST.html` |
| `npm test` | **93/93 PASS**; eight M471-specific positive/negative tests | `tests/m471-stage.test.mjs` |
| `python tests/m470-schema-check.py` | PASS on Stage v1 and existing isolated fixture | CLI output and Stage schema |
| M471 Chromium smoke | **14/14 PASS**; expansion, camera, live static bodies, gate, Rafi/Shaul/Tab, F3, Restart, no JS errors | `evidence/m471-browser-smoke.json`, screenshots |
| Two JSON mutation sessions | **10/10 PASS**; actual tree/anchor/Collider, real warning and collapse, JSON goal, Restart | `evidence/m471-mutation-browser.json`, screenshots |
| New gap live keyboard jump | **2/2 PASS** (gap crossing + no exceptions) | `evidence/m471-new-gap-browser.json`, screenshot |
| 15 disable/reset and 15 native R Restarts | **8/8 PASS** (no resource growth, no hook duplicates, shutdown cleans) | `evidence/m471-lifecycle-browser.json` |
| Tape crossing: Manual, Classic, Hybrid; normal rendering | **3/3 PASS** on the original center pit, controlled x460 start | `evidence/m471-rope-rendered.json` |
| Tape crossing: Manual, Classic, Hybrid; drawing isolated | **3/3 PASS** on original center pit, controlled x460 start | `evidence/m471-rope-isolated.json` |

Sum of current final browser assertions above: **40/40 positive checks** (14 + 10 + 2 + 8 + 3 + 3), on different scoped test harnesses. Do not interpret this as 40 unassisted end-to-end runs.

## Critical QA → Fix → Retest

1. **Baseline extraction**: two historical Node tests initially failed due to omitted archive snapshots. After restoring exact archive files, baseline passed 85/85. Existing live test expectations were deliberately migrated for new Stage content; historical evidence and archived source were preserved.
2. **New gap reachability**: an early **170px gap failed** controlled jump and unassisted tape-hold trial. Changed only Stage JSON to **80px**; live ArrowRight/Space jump then landed on the far side. No physics changes.
3. **Collider settlement**: after recreation/physics frame, transient static-body bookkeeping can lag. In-place extension `recreate` was separately observed completing but a combined stress harness once stalled. The final 15-cycle *disable/reset* and 15 native Restart harness passed, but **repeated forest-extension `recreate` is not a release guarantee**. Automatic restore on failed `recreate` remains absent from M470.
4. **Gate migration**: old x946 finish cannot complete; actual movement at the new gate completes stage. Both test variant goals updated from Stage JSON.

## Preserved behavior and scope

Original pit (370–706), original two base solids and legacy movement are retained. Rafi/Shaul switch, portal, root tree, rotten ledge, anchored tree, Stage Modules, F3, reset, Parallax, sticky-web and spider code are still present. The isolated `world.terrain` fixture and transition controller are not activated in Stage01 production. **No new enemy, animation, Stage02, or tape physics code** was introduced.

## PASS / FAIL / NOT TESTED

- **PASS**: tests as enumerated above. Real Chromium Phaser; no JS page errors in the enumerated browser smoke/mutation/jump/lifecycle runs.
- **HISTORICAL FAIL remains unresolved**: M468/M469 Hybrid normal rendering 2/3 FAIL under earlier conditions. M471 3/3 in both current render conditions does not prove intermittent failure fixed.
- **NOT TESTED**: direct `file://` local navigation in this environment (previous M470 browser policy blocked), Safari/iOS, human play-feel and unassisted full run from start to exit, mobile performance, production Stage02 transition, every possible release-timing scenario over the new gap.
- **KNOWN LIMITATION**: extension is small Stage01-only production adapter atop legacy world.solids. It does not generalize all Game Core terrain; full `recreate` recovery not certified.

**Release gate**: no newly observed Core physics regressions; playable HTML and reproducible source packaged. Status stays **QUALIFIED**, because human full-run/renderer variability and the legacy fixture boundaries are not closed.
