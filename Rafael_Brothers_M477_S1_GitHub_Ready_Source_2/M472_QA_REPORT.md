# Rafael Brothers — M4.7.2 QA REPORT

**Date:** 2026-10-30. **Status:** TARGETED QA PASS / NOT EXHAUSTIVE END-TO-END CERTIFICATION.

## Baseline / preservation

- Extracted the attached `Rafael_Brothers_M4711_Source_QA_HOTFIX(1).zip`, preserving earlier `archive/`, `baseline/`, sources, QA and production HTML.
- On unchanged M4.7.1.1: `npm test` returned **94/94 PASS**.
- After M472: `npm test` returned **104/104 PASS** (94 retained, 10 additional tests).
- SHA-256 byte comparisons to the supplied ZIP: immutable `baseline/M46_RELEASE.html`, `build-m471.mjs`, `src/bridge-polish.mjs` and `src/managed-actor.mjs` unchanged. No tape/core motion source edited.

## M472 independent Node validation, 10/10

1. Automatic discovery of both pits, both character profiles.
2. Recreate old `stable-root-extension` at x1275: `REEL_SWEEP_BLOCKED` from right bank, release gate rejects.
3. M4711 x1230 passes both banks (source of truth in Stage JSON).
4. Invalid/duplicated crossing IDs and anchor/surface references rejected.
5. Stage anchor mutations x1230 → x1275/x1200 change safety outcome without editing JavaScript.
6. Two distinct separate JSON challenge fixtures from 900px worlds pass without change to validator.
7. Above-bank anchor passes with explicitly documented elevated clear approach; a universal center-only rule is not used.
8. Missing ground/player hitbox = NOT TESTED.
9. Fragile anchor = WARN; inactive anchor = NOT TESTED; added enabled static collision obstruction = FAIL.
10. Oversized player body that cannot pass between the banks = FAIL.

## Chromium QA M472: 44/44 PASS

The new `tests/rope-crossing-browser-qa.py` opens the produced **M472 HTML** and actually runs Phaser and real keyboard events. Controlled actor repositioning establishes reproducible initial states. It asserts:

- Both gaps are found through the live Phaser world, with live stage source and legacy geometry clearly distinguished.
- Replaying the original x1275 anchor inside Phaser reproduces actual blocked-roots safe release; coordinate is restored immediately after the test.
- Two actual Phaser character profiles: **Rafi 28×64** and **Shaul 28×74** collision bodies.
- **24/24 controlled ArrowUp reeling cases**: 2 characters × 3 modes × 2 gaps × 2 shore starts, remain attached and shorten tape.
- Three live keyboard steering tests, one each Manual/Classic/Hybrid.
- Live ArrowDown lengthening and intentional E detach.
- Three restart cycles retain four original/extended ground rects, two validated crossings and unduplicated anchors.
- Disabling extension colliders or the stage anchor yields **NOT TESTED** rather than false PASS; resetting restores PASS.
- No uncaught JS browser errors.

## Compatibility Chromium: 34/34 PASS (M471 tests executed against M472 HTML)

- M471 reel-gap regression: **10/10**.
- Controlled keyboard gap jump: **2/2**.
- Full smoke test: **14/14**.
- Existing managed-actor lifecycle/restart tests: **8/8**, including 15 `R` restarts and 15 disable/reset cycles.

The original M471 test scripts and historical evidence were retained. `tests/m472-compat-*` are separate adapted copies targeting M472 HTML with separate `evidence/m472-compat-*` outputs.

## Development → QA → Fix → Retest

1. Initial embed of new validator caused a browser lexical collision (`Identifier 'intersects' has already been declared`); corrected with a private IIFE scope; Chromium then showed zero page errors.
2. Extended snapshot to include actual enabled/disabled Arcade static collision bodies as obstacles and avoid false assumptions about module states. Retested 44/44 and restored normal geometry.
3. Recreated original x1275 defect using static validator and real Phaser. Restored x1230 and confirmed safe reeling at both banks.
4. Mutated **production Stage JSON temporarily** x1230 → x1275; `npm run build` failed with `Rope crossing QA gate: FAIL`. Restored the original Stage JSON byte-for-byte; build succeeded and release gate passed again. Negative mutation did not become part of delivery.

## Gate and artifact checks

- `npm run build`: PASS; HTML standalone and syntax checked by `vm.Script` for all inline scripts.
- Static Stage preflight for Stage-owned second gap with browser-verified two profile sizes: PASS.
- Live Chromium Stage snapshot: both gaps PASS for each active character; three tape modes covered by actual keyboard scenarios.
- `npm run qa:release`: PASS only with matching current Stage+HTML+baseline SHA hashes and complete test evidence; renamed/old HTML cannot be silently certified.
- The legacy first pit has **not** been duplicated into new `world.terrain` JSON production data. Runtime snapshot reflects actual game solids.
- Core tape and original build file byte-identical to the provided ZIP.

## Not tested / explicit limitations

- **NOT TESTED:** human unassisted full Stage01 completion with rope, complete swing paths/angles and timing under all dynamic hazard states.
- **NOT TESTED:** Safari/iOS, gamepads, production long-session memory stress.
- **NOT TESTED:** all fragile anchor break timing and dynamically appearing obstacles simultaneously.
- **NOT TESTED:** full release-cause telemetry mapping for every possible source of release, and complete death/respawn scenario matrix.
- The swept-body static validator is a sampling/early-warning system, **not** a complete simulation of Phaser dynamics, line-of-sight or universal proof of traversability. It never modifies rope mechanics.
- Current `forestExtension` surfaces and a small set of legacy rects are not a general full Stage terrain migration. That remains a separate milestone.

**Artifacts:** `evidence/m472-rope-crossing-browser.json`, `evidence/m472-node-run.log`, `evidence/m472-{rope,jump,smoke,lifecycle}-run.log`, `dist/m472-static-safety-report.json`, `M472_RELEASE_MANIFEST.json`.

## Browser navigation sandbox restriction

The restricted Chromium environment blocks both direct `file://` navigation and HTTP navigation to `127.0.0.1` with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. These are **NOT TESTED** as direct-navigation workflows here. All 44 new and 34 compatibility browser assertions instead executed the fully generated standalone HTML via Playwright `page.set_content(html)` with live Phaser scenes, actual keyboard events and no page errors. An external end-user opening the HTML file directly remains a separate acceptance check.
