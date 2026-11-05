# M477-S4 Handoff

Start: S3 `5c3cf756`, PR #6 open, latest S3 Actions run `41766967493` actually verified successful. S4 is based on S3 and its draft PR targets S3 until the parent merges. Do not merge either PR without the owner.

Map: `stages/s01.stage.json` → existing schema/loader registry → compiled `egg-sac` config → Composer `egg-sac-prefabs` → existing enemy collection → one scoped adapter/sim per sac. Read `docs/EGG_SAC_PREFAB_CONTRACT.md` for authoring and lifecycle.

`build-m477-s4.mjs` removes the historical egg singleton from the baseline script and embeds one Stage-driven installer. `build-m477-s3.mjs` uses frozen S3 inputs, preserving the historical output. Use `npm run build` for current S4. Runtime HTML needs no external network assets.

Browser fixtures disclose initial respawn positions and scripted hammer rectangles. They test real Phaser contact, damage, rendering and cleanup; they do not constitute unaided complete-level play. Retained browser tests cover both actors and all three rope modes. Verified full CI run `41772640558` on `09972c0a` passed build,180 Node tests, schemas and all Chromium suites after the deferred-Shutdown harness correction. Final CI evidence and remaining limits are in `M477_S4_QA_REPORT.md`.

The package includes all tracked sources plus S4 HTML/manifests and available CI/screenshots. It excludes `.git`, `node_modules` and temporary directories. Build/test entrypoints work from the extracted ZIP after installing dependencies. The packager uses `git ls-files` in a checkout; without `.git`, it falls back to the packaged file manifest. Regenerating tests/fixtures does not depend on original temporary paths.
