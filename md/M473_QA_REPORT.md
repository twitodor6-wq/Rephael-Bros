# M4.7.3 — QA Report

Date:2026-10-30. **TARGETED CHROMIUM QA PASS / HUMAN FULL STAGE NOT TESTED.**

## Verified final artifact
`dist/Rafael_Brothers_M473_GAMEPLAY_CHALLENGE.html`
SHA-256:`80b521c63676c3258dcb2109735c70493f363087901bdeb80cb6d75d59820d69`.

`npm test`: **114/114 PASS** (104 retained historical cases,10 new M473 cases).
`npm run build`: PASS. All inline scripts syntax-checked; Stage v1 operational validation and static rope safety PASS. Old/new Stage JSON pass formal JSON Schema; a negative warning timer is rejected.
`npm run qa:release`: **PASS —94/94 Chromium assertions**, exact Stage/HTML/runtime source/schema and test hashes. Gate verifies6 partial-stage routes and6 actual tape rescues. It does not accept renamed older HTML or stale evidence.

| Chromium suite | Result |
|---|---|
| gameplay | 14/14 PASS |
| hazards | 19/19 PASS |
| lifecycle | 17/17 PASS |
| rope-crossing-browser | 44/44 PASS |

## Continuous gameplay evidence
All six actor/mode configurations passed: Rafi and Shaul × Manual,Classic,Hybrid. Each run actually acquires the tape by walking from original spawn, then establishes a disclosed **legal partial-stage start at1810,490**. From that point: continuous keyboard approach, jumping onto both teaching rotten logs, continuing to stable terrain, crossing the crumbling bridge and reaching the real relocated exit. No mid-route player placement, direct finish call, injected velocity or attached rope is used.

Separate6 rescue runs start legally at2410,490 after actual tape pickup: real contact→warning→collapse removes support; E attaches stable2620,240 hook; Up shortens; steering moves across; E releases; actual far-bank landing. These are successful sampled strategies, not proof of arbitrary late timing or every swing angle.

Chromium153.0.8010.0 / live Phaser. Actual body profiles in crossing QA: Rafi28×64, Shaul28×74 (read back from current runtime, not inferred from historical configuration).

## Failure, recovery, lifecycle
- Waiting on either teaching log produces warning and collider removal; visible floor630 catches the actor.
- Lower-floor jumping cannot bypass the140px high exit bank. Both actors return via560 step and490 stable entry; Stage policy rearms teaching logs for retry.
- Waiting on bridge without rescue causes genuine normal death/respawn; surfaces return intact.
- OFF midwarning removes all collision/support and cancels countdowns; ON restores intact instances.
- Independent timers shown in pure Node tests and a **separately labeled live state simulation** with two simultaneously advanced instances. This state setup is not reported as keyboard gameplay.
- Destroying one instance is idempotent, unbinds only its own ID and leaves sibling live.
- Eight R restarts retain20 static bodies,99 scene children,15 postupdate listeners,7 managed actors and17 prefab bindings; no duplicate anchor identities. This is a bounded leak check, not heap profiling.
- Spider OFF during warning: AI/time/position frozen, five owned visuals hidden, contact/damage and hammer disabled. Tab/R preserve OFF; ON restores original enemy.

## Crossing safety and preservation
44/44 crossing assertions retain old banks, two profiles,24 controlled reeling cases (both original gaps×two banks×two actors×three modes), steering, ArrowDown extension, E release, negative old x1275 and restart/disable cases. The third new gap is also included in live static validation. Original x1230,y260 remains fixed.

One-way deck metadata allows only upward sampled passage matching the live collider predicate; identical full solids still fail. Validator is read-only and sampled. The negative production build mutation x1230→1275 was rejected before publication; exact Stage bytes restored and rebuild passed.

Byte-preserved core: immutable baseline/M46_RELEASE.html, build-m471.mjs, src/bridge-polish.mjs and src/managed-actor.mjs match M472 manifest. Old rotten-root, falling-bridge-tree and environmental-anchors also match supplied source. New geometry/content belongs only to Stage JSON. Original two pits and old partial bridge remain.

## Development → QA → Fix → Retest
See `M473_REVIEW_NOTES.md` and retained failed development logs. Corrections include one-way safety modeling, return-to-entry rearm, independent disposal, formal crossing schema, clearer jump-only teaching warning and wider130px teaching landings. One deliberate-failure test exceeded a wall-clock timeout on the slow software-rendering host while simulation time was still1250/1400ms; timeout was extended, the test reran and passed. Existing successful source-matching gameplay/rescue suites were retained and their signatures rechecked.

Review is a separate QA perspective by the implementing assistant in the same session, not an independent human review.

## NOT TESTED / limits
Human feel/fun, unassisted full original Stage01-to-exit traversal, Safari/iOS, gamepads, exhaustive angle/dynamic-module combinations and long-session heap analysis. HTML content executed in Chromium; direct file/localhost navigation inherits sandbox restrictions. Historical component version labels and sampler version are not product milestone identifiers.

The Stage Challenge `qaEvidence` placeholders retain authoring-time NOT TESTED; the referenced final evidence files and release manifest are the authoritative current QA status. No generator or unverified Forge M3 capability is claimed.

## Supplementary visual witness
3/3 additional Chromium checks passed outside the94-assertion gate: real-keyboard finish screenshot, real Tab during live bridge warning preserves progressing timer/state, zero page errors. See evidence/m473-visual-witness.json and M473_FINISH.png. Final gated suites plus supplementary checks:97 observed Chromium assertions.
