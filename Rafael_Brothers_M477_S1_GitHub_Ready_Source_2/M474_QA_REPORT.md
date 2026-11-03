# M4.7.4 — QA Report

Date:2026-11-01. **TARGETED AUTOMATED QA PASS; second legacy ledge deliberately parked. Human full-stage/Safari NOT TESTED.**

## Baseline
The supplied M473 archive was extracted independently. Its114 Node tests, release gate and all manifest hashes passed before edits. No newer verified source was supplied. Existing source and all historical artifacts remain available. Current immutable baseline/M46_RELEASE.html and managed-actor, original tool/player/tape formulas remain byte-preserved.

## Final artifact
`dist/Rafael_Brothers_M474_ENCOUNTER_LAYOUT.html`
SHA-256:`a73cd0304d20385430ad2ac7712bbd912f53b81f040615749ffbd84beb277dd5`.

`npm test`: **122/122 PASS**, retaining114 earlier tests and adding8 M474 tests.
`npm run build`: PASS, inline JavaScript syntax checked, Stage compilation and read-only rope checks PASS.
`npm run qa:release`: **145/145 Chromium assertions PASS**, source/Stage/HTML and exact test hashes matched. No removed tests or injected test results.

| Chromium suite | Result |
|---|---|
| First-pit encounter | 42/42 PASS |
| Eastern continuous route | 14/14 PASS |
| Eastern collapse rescue | 19/19 PASS |
| Lifecycle/recovery | 17/17 PASS |
| Rope crossing | 44/44 PASS |
| Matched phase images | 2/2 PASS |
| Fragile release | 5/5 PASS |
| Actual JSON export | 2/2 PASS |

## Gameplay versus diagnostic evidence
- Six first-pit witnesses: Rafi/Shaul × Manual/Classic/Hybrid. Each actually collects tools with keyboard, establishes a disclosed legal partial start314,490, uses J, waits for real fall/settlement, lands on the fallen log, uses E on the unchanged original514,290 hook, swings/releases and lands beyond706. No direct attach/finish call, injected velocity or reposition after start.
- Six unchanged eastern teaching→combination routes reach the real exit; six eastern collapse→E rescue routes remain playable in all actor/mode pairs.
- A real no-rope jump attempt fails to reach the far bank and invokes actual death/respawn, resetting the first tree. This sampled failure is not an exhaustive impossibility proof.
- Warning/break/fall/settle image capture follows natural state progression, then pauses the Game scene only for screenshots. Camera0,0, viewport1280×720, actor310,490; camera shake reset for the matched diagnostic image. Those frames are not counted as full gameplay runs.
- Independent eastern clocks also retain the inherited explicitly labeled state-simulation check, distinct from keyboard routes.
- **Full unassisted original-spawn-to-final-exit playthrough: NOT TESTED. Human fun/difficulty/readability acceptance: NOT TESTED. Safari/iOS: NOT TESTED.**

## New encounter and tools
The same116px bark/hollow/moss shape rotates around350,518. Grip350,416 is a verified point102px up the upright log. Body stays OFF during warning/breaking/falling/settling and turns ON at the settled350,510,116×16 footprint. Actual landing foot is510. Hook is removed at breaking and attached Rafi/Shaul safely release in dedicated tests.

J uses the existing acquired hammer/cooldown/hit rectangle; its dispatcher forwards prior barriers/switches/web/spider handlers. Standing and tape pull still enter the warning sequence. K is the existing acquired drill dispatch and cooldown/animation; no new drill target or bark-break coverage beyond the existing system is claimed. Audible sound output is not human-verified in muted headless QA; voice bounds and OFF cleanup are checked.

The new lower intermediate ledge leaves240px. Read-only build analysis of unchanged constants and largest verified body estimates an ordinary unboosted jump, including coyote travel/body-width allowances, at234.982px (margin5.018px). This excludes enemy/mushroom/vent/tape boosts and is not a generic trajectory proof. It does not change physics.

Three negative production mutations are rejected: old unsafe x1275 hook, deck spanning too much of the pit, and a raised deck enabling ordinary-jump bypass. Exact Stage bytes are restored and rebuilt.

## Visual/collision checks
Two green roots are explicit cosmetic-only hanging remnants and own zero colliders. Actual shelf collision is retained. Shared log pose bounds and delayed support are checked mathematically and in Phaser, with phase screenshots. Canopy mount/bark/moss support grip readability; no background/parallax asset/system was rewritten. Human visual acceptance remains pending.

The old rotten-root-ledge is OFF by Stage enabled=false/defaultOn=false. Its hook, top and fallen-floor colliders are inactive. Its real optional ON implementation remains. JSON structural references remain resolved; exit gating never requires the encounter to be active. Eastern routes finish with it parked.

## Lifecycle and telemetry
OFF during warning removes tree grip/body/voice activity; J cannot activate an OFF tree. OFF survives restart; ON resets intact. Five new restart cycles retain99 scene children,20 static bodies,15 postupdate listeners and16 active bindings without duplicate hooks; eight inherited lifecycle restarts also pass. These are bounded object/listener checks, not heap profiling.

F3/telemetry functions remain; actual exportJson download is saved and parsed as evidence/M474_TELEMETRY_EXPORT.json and matches the returned document. Encounter state snapshots and a diagnostic JSON file are retained. Sampler M4.1.3 is historical sampler identity, not product version.

Measured profiles: `[{"id": "rafi", "width": 28, "height": 64}, {"id": "shaul", "width": 32, "height": 74}]`.

## Development → QA → Fix → Retest
See M474_REVIEW_NOTES.md and development logs. Fixes cover instantaneous visual swap, phase/collider ownership, high-deck coyote bypass, fragile-hook layout, safe activation outside the existing spider footprint and a useful long-arc tape route. Short key down/up and initial render stalls caused host test failures; key presses now span actual frames and condition timeouts allow the unchanged simulation to complete. Existing successful unchanged-source cases were not replaced by static proofs.

Historical fixed-sidecar assertions compare preserved M473 bytes for the explicitly authorized visual changes. Current source has its own preservation/eastern-data checks. No old capability or test was removed.

Review is the implementing assistant switching to a critical QA role in the same session. No independent human tester is claimed.

## Limitations
See M474_KNOWN_ISSUES.md. No human/Safari/mobile approval, exhaustive dynamic/boosted routes, long-session heap certification, new Forge/generator, new enemy or Stage02. Standalone HTML was executed as content in Chromium; external end-user file launch remains a separate acceptance check. Rollback reconstructs original files in a new directory and is verified separately.

## Rollback and artifact UI verification
The948 original files were reconstructed byte-for-byte from the immutable uploaded ZIP inventory into a new folder. The reconstructed M473 release gate and114/114 original Node tests pass. Delta restoration never overwrites M474. The comparison gallery also passed9 UI/image-loading/zoom checks, recorded separately from the145 Phaser/Chromium assertions above.
