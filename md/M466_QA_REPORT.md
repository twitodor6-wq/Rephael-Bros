# Rafael Brothers — M4.6.6 QA Report

## Results (executed in this run)

| Check | Result | Evidence |
| --- | --- | --- |
| Node `npm test` | **41/41 pass** | `evidence/m466-node-tests.log` |
| Chromium gameplay regressions | **22/22 pass** | `evidence/m466-browser-qa.json` |
| Stage module lifecycle | **10/10 pass** | `evidence/m466-lifecycle-qa.json` |
| Manual, Classic, Hybrid gap traverse | **3/3 pass** | `evidence/m466-rope-crossing.json` |
| Isolated JSON edits + two real Chromium scenes | **10/10 pass** | `evidence/m466-json-mutation-qa.json` |
| Branch toggle, collider + anchor release, restart | **9/9 pass** | `evidence/m466-interactions-qa.json` |
| Draft 2020-12 JSON Schema & three invalid fixtures | **pass** | `tests/m465-schema-check.py` |
| Offline standalone HTML build and inline JS parse | **pass** | `build-m466.mjs` and `dist/m466-build-manifest.json` |
| M465 baseline artifact unchanged | **SHA-256 equal** | `evidence/m466-sha256.txt`, pre-existing M465 manifest |

All automated tests above were actually run in this environment. Browser tests used **headless Chromium + Playwright** with real Phaser runtime, plus controlled placement/equipment fixtures. These are not independent unassisted full human playthroughs. The rope tests specifically use a preset x460 launch with an equipped tape, then real keyboard steering; they do not guarantee every natural arrival trajectory. Browser console `pageerror` checks reported no uncaught exceptions on these sampled paths.

## JSON mutation demonstration

An isolated copy of the M4.6.6 project was rebuilt after **one Stage JSON-only edit for each prefab**: `fallen-bridge-tree.position.x += 6` and `forest-exit-grove.position.x += 4`. Real running Phaser scenes verified the branch collider x, rendered graphic instructions, warning hint, attached rope hook all move by the authored delta. The portal graphics and guard threshold moved by +4; all active prefabs remain bound; no JavaScript page errors. These edits never altered main checked-in Stage 01.

## Known limitations

- Direct `file://` and localhost HTTP navigation were both blocked by the Chromium container administrator policy (`ERR_BLOCKED_BY_ADMINISTRATOR`); HTML-source `page.set_content()` loading and real Phaser startup, interactions and gameplay regressions passed. No native Safari/iPhone test, full manual playthrough, profiler, pixel screenshot parity guarantee, or migration of the legacy core to TS/Vite.
- The stage schema describes **only Stage 01 POC** and still requires explicit IDs for some actors; not a general-purpose multi-stage engine yet.
- `src/environmental-anchors.mjs` and other sidecars retain ordered Phaser `create` wrapping; teardown is not centralized across all components.
- No Phaser physics formulas or swing tuning were intentionally modified; automated rope regression is a safety signal rather than proof of identical subjective game feel.

**Verdict:** M4.6.6 scoped Stage JSON migration and QA complete; entire architecture modernization remains incremental.
