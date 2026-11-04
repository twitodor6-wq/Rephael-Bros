# M477-S4 QA report — 4 November 2026

Baseline: S3 `5c3cf756`, PR #6 open/unmerged. Verified actual S3 Actions run `41766967493`: completed/success. Local S3 build and all 166 Node tests passed before implementation.

## Current local evidence

- S4 build PASS; self-contained HTML; all inline scripts parsed, asset/Stage/rope safety gates executed.
- 180/180 Node tests PASS (166 retained +14 S4): exact pure model/default parity, relative geometry, zero/one/many, own children, multiple-hatch shared immunity, hammer, OFF/ON, five Composer shutdown/recreate cycles, rollback on binding/graphics failure, S2/S3 hook integration, frozen source hashes and historical S3 rebuild.
- S4 and retained S2/S3 JSON Schema checks PASS, including malformed inputs.
- No edits to Game Core, ceiling spider, sticky web, enemy collection, managed lifecycle implementation, camera/parallax, rope, other level actors or Rafi RUN source. S4 core comparison allows only product caption.
- Local Chromium installation failed (invalid download archive). Actual CI run `41771952899` on `f5b2e892` built and passed 180 Node/schema checks. S4 passed contact/hatch, both actors, tool-chain, OFF/ON and five real restarts, then its immediate Shutdown assertion failed because Phaser queues scene.stop. Retained S2/S3, six rope crossings, six physics parity pairs, smoke/visual/death passed. Later multi/zero-egg browser cases were not reached in that failed S4 sequence. Fixed the harness to wait for actual shutdown; full retest pending.

## Development → QA → Fix → Retest

1. New Stage tests initially rejected unknown egg prefab; extended existing registry/schema and passed exact default/relocation/invalid-data tests.
2. Extracted historical pure model unchanged; 700-step event/state/tool replay matches original exactly.
3. Actual-adapter tests passed independent hatch/children and scoped cleanup. Damage fixture initially sampled before children landed; extended the simulated interval and confirmed one bite for overlapping batches, plus attached-tape no-knockback.
4. Preserved historical S3 build inputs; exact output hash is pinned by a rebuild regression.
5. Browser QA exposed an asynchronous fixture error: the same evaluate call requested scene.stop and immediately sampled live resources. The new fixture waits for the scene to stop and egg references to clear before asserting cleanup. No production lifecycle patch was made.
6. Historical Stage comparisons explicitly allow only the additive S4 object; all other data assertions remain. Registry count assertions add one optional family.

## Required remote evidence

PENDING: S4 Actions build, Node, schemas, qa:s4, qa:s3, qa:s2, actor/rope-mode gameplay, paired physics parity, smoke, visual and death tests; screenshots and package artifacts. Record actual run/commit/conclusion here after execution. No merge authorization.
