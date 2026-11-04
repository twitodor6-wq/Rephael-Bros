# Rafael Brothers — M4.6.7 QA Report

## Actual execution results

| Test suite | Result | Evidence |
| --- | --- | --- |
| Node tests (existing 41 plus composer-contract 3) | **44/44** | `evidence/m467-node-tests.log` |
| Chromium existing gameplay regressions | **22/22** | `evidence/m467-browser-qa.json` |
| Chromium environmental-anchor/bridge lifecycle | **10/10** | `evidence/m467-lifecycle-qa.json` |
| Chromium falling-branch interactions and restart | **9/9** | `evidence/m467-interactions-qa.json` |
| Chromium Manual / Classic / Hybrid pit traverse | **3/3** | `evidence/m467-rope-crossing.json` |
| Chromium two-scene JSON-only mutation rebuild | **10/10** | `evidence/m467-json-mutation-qa.json` |
| Chromium composer registration/5 restart/unload stress | **18/18** | `evidence/m467-scene-lifecycle-qa.json` |
| JSON Schema 2020-12 and 3 invalid fixtures | **pass** | `evidence/m467-schema-console.log` |
| Standalone HTML build and every inline script parsed by Node `vm` | **pass** | `build-m467.mjs`, `dist/m467-build-manifest.json` |

**Total:** **116/116 automated checks** (44 Node + 72 Chromium); JSON Schema/build checks separately. The tests were run in this development container, with Playwright headless Chromium actually running the Phaser game. The browser regression tools use position/equipment fixtures and are not a completely unassisted human playthrough.

## Development -> QA -> Fix cycle

1. M466 baseline Node suite passed 41/41; M466 playable SHA-256 matched its previously delivered file.
2. Added composer and switched seven sidecars to ordered managed attachment. Rebuilt HTML; legacy gameplay browser suite passed 22/22; targeted lifecycle tests passed 10/10 and 9/9, all rope-mode traversals passed 3/3, isolated JSON mutation passed 10/10.
3. A pure Node composer-contract test initially failed because its mock defined `create` on an instance instead of the Scene prototype and compared cross-VM arrays by realm identity. Fixed the test fixture to reflect Phaser's prototype layout; final composer-contract tests pass 3/3.
4. Five repeated real-Phaser restarts passed but explicitly stopping Game revealed stale StageV1 runtime bindings on 5 objects. Fixed via composer **last shutdown callback** calling `StageV1.clearRuntime()` after existing actors shut down, without touching their physics.
5. Re-ran tests on final output; composer stress checks pass 18/18, including zero prefabs still bound after scene stop. The remaining suites, Node suite, and schema checker passed.

## Preservation / regression evidence

- 7 authored runtime instances still bind on Game scene startup; 0 remain bound in StageV1 metadata after Game scene unload.
- 5 consecutive restarts reattach all actors once each and do not grow `postupdate` or `shutdown` listeners in tested paths; environmental tape hook references stay unique.
- Rope gap tests pass in Manual, Classic, and Hybrid, with no changes to formulas.
- Sticky web and egg-sac spiderlings still trigger; falling bridge warning and collapse, rotten shelf collapse, gate completion and ambient parallax still pass.
- No unhandled JavaScript page errors in sampled browser scenarios.
- Stage JSON-only changes shift branch physical collider, rendered graphics, hint and tape anchor together; exit artwork and guard move together. Authoritative Stage 01 JSON unchanged in final artifact.
- Original M466 HTML retains SHA-256 `07c5c0a8d13092f14c1cb71f558dadcce96d88a877adaf70365733fdebb87a62`.

## Limitations

No manual native Safari/iPhone test or standalone `file://` launch was possible in this Chromium QA environment (prior attempts were blocked by administrator policy). The HTML is self-contained by build construction and parsed, not independently proven to open under every browser file policy. There is no frame-by-frame subjective swing parity proof; runtime fixture tests are narrower. Baseline M466 package and Stage 01 only are covered, not a second authored stage or all cross-game workflows.
