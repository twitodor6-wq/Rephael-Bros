# M477-S3 Handoff

Start point: PR #5 merged into `main` at `2ea8b442`. S2 Chromium/Node/schema QA passed in GitHub Actions; user manually accepted gameplay.

This branch introduces the Stage v1 `sticky-web` prefab, with authored Stage 01 placement matching M4.4 exactly. The historical pure sticky-web state helpers and graphics implementation were extracted from the M46 baseline to `src/sticky-web.mjs`; the active M4.4 HTML installer is replaced in the S3 build only. Composer owns one `sticky-web-prefabs` managed actor, followed by the S2 `enemy-prefabs` adapter.

The new group owns its one per-scene postupdate/hammer/respawn hook set, Stage binding and idempotent cleanup. When multiple webs overlap, slowing and rope drag are combined once per frame; webs independently own their states and views. On restart, toggle state persists. Existing first-web diagnostic `window.__RBStickyWeb` is maintained; `window.__RBStickyWebs.snapshot()` enumerates all.

Frozen S2 loader, composer and Stage data support reproducibility of `node build-m477-s2.mjs`. The immutable M46 core, tape physics, ceiling spider state machine, egg sacs and decorative web response were not edited.

Follow-up acceptance: GitHub Actions build, Node, schema, S3 Chromium smoke and retained browser regression suite; manually check web cut/escape near the starting platform, rope swing, egg sac and spider behavior before asking for merge authorization. Do not merge without approval.
