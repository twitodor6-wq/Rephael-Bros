# M477-S4 QA report — 4 November 2026

Baseline: S3 `5c3cf756`, PR #6 open/unmerged. Verified actual S3 Actions run `41766967493`: completed/success. Local S3 build and all 166 Node tests passed before implementation.

## Current local evidence

- S4 build PASS; self-contained HTML; all inline scripts parsed, asset/Stage/rope safety gates executed.
- 180/180 Node tests PASS (166 retained +14 S4): exact pure model/default parity, relative geometry, zero/one/many, own children, multiple-hatch shared immunity, hammer, OFF/ON, five Composer shutdown/recreate cycles, rollback on binding/graphics failure, S2/S3 hook integration, frozen source hashes and historical S3 rebuild.
- S4 and retained S2/S3 JSON Schema checks PASS, including malformed inputs.
- No edits to Game Core, ceiling spider, sticky web, enemy collection, managed lifecycle implementation, camera/parallax, rope, other level actors or Rafi RUN source. S4 core comparison allows only product caption.
- Local Chromium installation failed (invalid download archive). Actual CI run `41771952899` on `f5b2e892` built and passed 180 Node/schema checks. S4 passed contact/hatch, both actors, tool-chain, OFF/ON and five real restarts, then its immediate Shutdown assertion failed because Phaser queues scene.stop. Retained S2/S3, six rope crossings, six physics parity pairs, smoke/visual/death passed. Later multi/zero-egg browser cases were not reached in that failed S4 sequence. Fixed the harness to wait for actual shutdown; full retest subsequently passed (see verified run below).

## Development → QA → Fix → Retest

1. New Stage tests initially rejected unknown egg prefab; extended existing registry/schema and passed exact default/relocation/invalid-data tests.
2. Extracted historical pure model unchanged; 700-step event/state/tool replay matches original exactly.
3. Actual-adapter tests passed independent hatch/children and scoped cleanup. Damage fixture initially sampled before children landed; extended the simulated interval and confirmed one bite for overlapping batches, plus attached-tape no-knockback.
4. Preserved historical S3 build inputs; exact output hash is pinned by a rebuild regression.
5. Browser QA exposed an asynchronous fixture error: the same evaluate call requested scene.stop and immediately sampled live resources. The new fixture waits for the scene to stop and egg references to clear before asserting cleanup. No production lifecycle patch was made.
6. Historical Stage comparisons explicitly allow only the additive S4 object; all other data assertions remain. Registry count assertions add one optional family.

## Verified remote evidence — PASS

Full retest: [GitHub Actions run 41772640558](https://github.com/twitodor6-wq/Rephael-Bros/actions/runs/41772640558), head commit `09972c0a068866ec9e083666980c54756b13f9df`, job `126386148668`: completed / success. Inspected actual job logs and artifact list, not only source code.

- Build PASS; Node **180/180**, failures0; all four schema scripts PASS.
- `qa:s4`: **24 checks PASS** across original, zero, independent multi-sac and overlapping-sac Phaser fixtures. Actual original seven-baby hatch, contacts for Rafi/Shaul, web/ceiling/egg hammer chain, OFF/ON, five keyboard restarts, old scopes emptied, actual deferred Shutdown, all bindings/refs/listeners cleared. Shutdown snapshot: state destroyed, resources0, errors[], postupdate listeners0, no bound Stage IDs. Different authored second-sac count3 worked; hammer killed only the near batch. Overlapping hatch result hits[1,0], one bite within shared immunity. Zero uncaught page errors in all four browser sessions.
- Retained `qa:s3` and `qa:s2` PASS.
- Retained actor/rope gameplay PASS: Rafi and Shaul × Manual/Classic/Hybrid, six real first-pit crossings with disclosed legal setup; six restarts keep stable body/cache/listener counts; drill/hammer/run-art fallbacks PASS.
- Paired physics parity PASS: six actor/mode ON/OFF pairs, 199 fixed steps each including tape attachment, reel and release. This is controlled replay, not full-stage proof.
- Canvas smoke, matched visual captures, both actual gravity deaths/respawns and scene cleanup PASS. Browser regression failures: **0**.
- Reviewed actual initial/hatch screenshots. Original sac placement and hatched-baby rendering are present; no art redesign was attempted.
- [QA artifact 13296335395](https://github.com/twitodor6-wq/Rephael-Bros/actions/runs/41772640558/artifacts/13296335395): reports, screenshots, S4 standalone HTML and source/QA ZIP; SHA-256 `dcedd7a374793106ea8cf9b466c58c1fc493b6c7c063a24827350dbcf4fc74ed`.

The source ZIP was also extracted outside the checkout: build, all180 Node tests, and repackaging without `.git` passed. No source runtime dependency on original temporary work folders.

Human play acceptance, unaided Spawn→Exit, Safari/mobile and full-stage WebGL remain NOT TESTED. No merge performed; draft PR remains stacked on S3.
