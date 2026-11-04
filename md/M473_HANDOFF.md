# M4.7.3 — HANDOFF

Milestone: Gameplay Challenge Pass. Read `README_START_HERE_M473.md`, `M473_QA_REPORT.md`, `M473_KNOWN_ISSUES.md` and `M473_RELEASE_MANIFEST.json` together.

## Implemented
Stage JSON describes8 reusable surfaces (3 stable,2 rotten logs,3 crumbling bridge sections),2 graded Challenge records and a stable rescue hook. Each instance has independent state/timing, one-way collision, diagnostics, reset/disable/destroy and binding cleanup. The old rotten-root and falling-tree-to-partial-bridge are unchanged. A real ON/OFF controls the existing ceiling spider.

Stage01 extends eastward to3020; teaching entry1810, combination entry2370, portal2920 / threshold2950. Original pit370–706, second pit1190–1270, and corrected hook1230,260 are retained. Original baseline core, movement/jump/tape formulas remain byte-preserved.

## Recovery
Teach: wait→warning→collider removal→fall to visible floor630; return via step560 to stable490; Stage recovery policy rearms only teaching logs. Combine: wait on bridge to lose support; E chooses stable2620,240 hook; reel Up, steer right, E release, land on far bank. Missing E or missed timing can produce actual death/normal respawn.

## QA and continuation
Run `npm run qa:all` with Chromium and Python QA dependencies. Gate binds current HTML, Stage JSON, runtime source/schema fingerprint and exact test script hashes to current evidence. It refuses stale approvals. All earlier artifacts are historical; do not read their pass counts as current evidence.

Main M474 entry: `docs/CHALLENGE_COMPOSER_CONTRACT_DRAFT.md`. Implement one-way Forge proposal→Stage draft adapter before an automatic generator. Export verified live profiles and demand browser witnesses. First human task: play the eastern teaching + bridge sequence, judge warning readability and difficulty, then attempt an unassisted full original-to-exit run. No current human/Safari completion certification.

## Restore
Unzip `rollback/Rafael_Brothers_M472_ORIGINAL_FULL_SOURCE_QA.zip` into a new folder. Original archive and rollback Stage JSON are unchanged. Do not reset M473 content by copying only one older sidecar into this tree.
