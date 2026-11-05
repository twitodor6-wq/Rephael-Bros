# Rafael Brothers — M4.7.7-S4: Egg Sac & Spiderlings Prefabs

Baseline: S3 commit `5c3cf7566f876a67aaae81491bc0eef34d057f6b`. PR #6 was open/unmerged when work started; S4 branch `dev/m477-s4-egg-sac-prefabs` stacks on `dev/m477-s3-sticky-web-prefabs`. No merge is authorized.

- Node 20+ (CI Node 22), Python 3.12 with `jsonschema`.
- `npm install --no-package-lock` then `npm run build`.
- Open `dist/Rafael_Brothers_M477_S4_EGG_SAC_PREFABS.html` directly in a browser, offline.
- `npm test` — Node tests; `python tests/m477-s4-schema-check.py` — schema tests.
- `npx playwright install --with-deps chromium`; `npm run qa:s4` — new real Phaser fixtures.
- `npm run qa:s3`, `npm run qa:s2`, `npm run qa:m477`, `npm run qa:m477:parity`, `npm run qa:m477:smoke`, `npm run qa:m477:visual`, `node tests/m477-death.cjs` — retained regressions against S4 via the shared harness.
- `python scripts/package-m477-s4.py` — self-contained source + available build/QA ZIP. In an extracted source ZIP without `.git`, use the included package manifest; see handoff for packaging details.

Controls: Enter starts; A/D/arrows move; Space jumps; J hammer; K drill; E tape; Tab switches Rafi/Shaul; R restarts. Egg toggle persists across Restart.

Read `M477_S4_HANDOFF.md`, `M477_S4_QA_REPORT.md`, `M477_S4_KNOWN_ISSUES.md` and `docs/EGG_SAC_PREFAB_CONTRACT.md`. The QA report distinguishes actual CI/Chromium results from controlled fixtures and untested human acceptance.
