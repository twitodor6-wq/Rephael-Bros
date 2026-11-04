# Rafael Brothers M4.6.5 — QA Report

**Milestone:** Modular Stage Foundation — validated JSON, 3 prefab factories / 6 stage instances, safe bridge and fragile-root geometry adapters.

**Status: POC PASS / Architecture Migration PARTIAL.** Tested on 2026-10-27.

## Executed evidence (not inferred)

| Command | Result | Evidence / precise scope |
| --- | --- | --- |
| `npm run build` | **PASS** | 2,328,976-byte standalone HTML; all embedded script blocks parse in Node VM. SHA of output is recorded in `evidence/m465-sha256.txt`. |
| `npm test` | **36/36 PASS** | Existing 31 + five Stage Schema/loader tests; see `evidence/m465-node-tests.log`. Includes manifest, geometry, original module markers, schema errors and runtime binding uniqueness. |
| `python3 tests/m465-schema-check.py` | **PASS** | Validates Draft 2020-12 JSON Schema and Stage 01 using `jsonschema` (plus unknown prefab, invalid version and nonnumeric coordinate rejection). |
| `npm run qa:browser` | **22/22 PASS** | Actual Chromium / Phaser runtime, target fixtures including collapsed trees, goal guard, egg sac, sticky web, art, Web Response panel. `evidence/m465-browser-qa.json`. |
| `python3 tests/m465-rope-crossing.py` | **3/3 PASS** | Manual / Classic / Hybrid real Phaser movement from a controlled x460+Tape fixture; original x514/y290 primary anchor; all reached >=730 after releasing at speed. `evidence/m465-rope-crossing.json`. |
| `python3 tests/m465-lifecycle-qa.py` | **10/10 PASS** | All 6 Stage objects bound; no duplicate tape anchors after restart; bridge OFF disables both collider+body and hook; re-enable restores; rotten OFF disables both bodies and hook; re-enable restores. `evidence/m465-lifecycle-qa.json`. |
| `python3 tests/m465-json-mutation-qa.py` | **6/6 PASS** | Rebuilt an **isolated temp copy** with bridge JSON x+12 and initial anchor JSON x+18. Chromium Phaser bridge physical body moved exactly +12, root Graphics command buffer changed (visual drawing coordinates), tape anchor ref moved +18, no console JS pageerrors. `evidence/m465-json-mutation-qa.json`. |
| Immutable rollback comparison | **PASS** | SHA-256 of `baseline/M46_RELEASE.html` and `dist/Rafael_Brothers_M464_REACHABLE_ROTTEN_TREE.html` exactly matches corresponding bytes in the original M4.6.4 ZIP. |

## Specific regression observations

- Rafi/Shaul, movement, player/tape physics and existing controls reside in the untouched baseline; script-level regressions and browser stage smoke passed. No new key-by-key formal character animation test was created.
- The near-bank branch warns/collapses from standing and its short bridge maintains safe crossing clearance. Far-bank fragile ledge warns and collapses **before** stage completion. Restart restores state.
- Original early gate does not prematurely end the game; new root-grove threshold finishes on the far bank.
- Approved parallax and ambience remain active, Web Response on/off works, sticky web responds, and egg sac hatches seven spiderlings.
- No JavaScript `pageerror` events were recorded by the dedicated browser, mutation or lifecycle runs.

## QA boundaries

Browser tests use **controlled player position / gear fixtures** for most scenarios. They engage real scene physics, actual Arcade colliders, real keyboard steering for rope modes and the live DOM, but they **do not** constitute a full unaided human stage playthrough. Chromium was tested in headless mode; Safari / iPhone GPU performance and user-level feel are pending. Visual mutation is confirmed by altered graphics command buffer, not a pixel-perfect art diff. Forge's own simulator was not run in this milestone; installed skill is M2 and unchanged. Full generalized stage loading, all prefab lifecycles and current TS/Vite source migration are deliberately deferred.

## Disposition

**M4.6.5 POC meets the defined restricted definition-of-done:** one authoritative Stage 01 JSON, schema/semantic validation, three existing prefab types converted through Stage Loader, one real JSON-to-visual-and-physics change, preserved existing gameplay behavior under executed checks, complete build package and an M4.6.6 migration roadmap.

**Not certified complete:** all-game architectural refactor, arbitrary new stage loading, universal lifetime managers, new content, Safari performance, or Forge M3 installation. See `M465_KNOWN_ISSUES.md`.
