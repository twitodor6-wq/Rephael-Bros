# M477-S2 Handoff

Baseline: `497b4a8` on `twitodor6-wq/Rephael-Bros`; branch initially matched main. S1 build and 142 Node tests passed before changes.

Follow `README_START_HERE_M477_S2.md`. Stage authoring contract: `docs/ENEMY_PREFAB_CONTRACT.md`. Runtime map: Stage JSON → existing stage-loader registry → relative config → Scene Composer `enemy-prefabs` → `mountRBEnemyPrefabs` → existing ceiling-spider simulation/render adapter.

Completed: data-driven ceiling spiders, multi-instance foundation, binding/lifecycle cleanup, exact Stage 01 default migration, schema and Node regressions, compatibility assessment for webs/eggs. Frozen core, camera/background modules and other gameplay sources were not edited.

Next required acceptance: install compatible Chromium, run `npm run qa:s2`, `npm run qa:m477`, parity/death and smoke scripts against S2, then perform full-stage/human gameplay review. These have NOT passed in this environment. Browser installation returned truncated/invalid ZIPs, and browser launch reports a missing executable.

No merge authorization exists. PR targets main for review; retain S1 rollback/history. Historical build scripts remain historical tooling; use `npm run build` for current source.
