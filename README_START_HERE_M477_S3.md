# Rafael Brothers — M4.7.7-S3: Sticky Web Prefabs

Baseline: merged M4.7.7-S2 (`main` commit `2ea8b442`). Branch: `dev/m477-s3-sticky-web-prefabs`.

**Goal:** Make interactive sticky webs Stage JSON-owned, allowing zero, one or multiple independently positioned hazards without altering NinjaTape physics or game-core movement. Egg sacs, decorative web response and camera remain untouched.

- `npm run build` -> `dist/Rafael_Brothers_M477_S3_STICKY_WEB_PREFABS.html` (self-contained browser game).
- `npm test` -> Node regression checks including S3 configuration, pure state-model parity and adapter lifecycle.
- `python tests/m477-s3-schema-check.py` -> Draft202012 JSON schema and rejection fixtures (requires `jsonschema`).
- `npm run qa:s3` -> Playwright/Chromium S3 smoke; installed browser required.
- `npm run qa:s2`, `npm run qa:m477`, and the historic parity, smoke, visual, death scripts run against S3 by default using `tests/m477-harness.cjs`.

Read `docs/STICKY_WEB_PREFAB_CONTRACT.md`, `M477_S3_HANDOFF.md`, `M477_S3_QA_REPORT.md` and `M477_S3_KNOWN_ISSUES.md`.

**No automatic merge.** Release acceptance requires actual Chromium run and human play acceptance. The S2 baseline remains at the merged main commit and frozen S2 source contracts.
