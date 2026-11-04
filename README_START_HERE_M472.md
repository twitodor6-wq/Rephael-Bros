# Rafael Brothers M4.7.2 — Modular Rope Crossing Safety

**Source:** original M4.7.1.1 hotfix package, with immutable baseline and history retained.

## Play
Open `dist/Rafael_Brothers_M472_ROPE_CROSSING_SAFETY.html` directly in Chromium or another modern browser. One HTML file is self-contained; start game with Enter.

## Build and QA
```bash
npm run build
npm test
npm run qa:crossing
python tests/m472-compat-m471-rope-gap-regression-browser.py
python tests/m472-compat-m471-new-gap-browser.py
python tests/m472-compat-m471-browser-smoke.py
python tests/m472-compat-m471-lifecycle-browser.py
npm run build
npm run qa:release
```
Requires Node >=20 and Python Playwright with Chromium installed. Final build refreshes read-only hitbox profile cache from the existing Chromium evidence.

## Major addition
`src/validation/rope-crossing-safety.mjs` predicts risky anchor-to-wall reel sweeps across **all discoverable gaps**. `src/stage-loader.mjs` provides a read-only runtime geometry snapshot, with optional valid `ropeCrossings` Stage JSON refs. No rope/character physics changes and no core edits.

**Current QA:** read `M472_QA_REPORT.md`, `M472_HANDOFF.md`, `docs/ROPE_CROSSING_SAFETY_CONTRACT.md` and `M472_RELEASE_MANIFEST.json`. Historic QA remains in root/archive; do not confuse the old reports with the new milestone.

## Rollback
Extract the original uploaded `Rafael_Brothers_M4711_Source_QA_HOTFIX.zip` into a clean directory. Nothing in this milestone changes the archived immutable M471/earlier game artifacts or Stage 01's anchor coordinates. The semantic `ropeCrossings` property can be removed to preserve older schema consumers, but full ZIP rollback is preferred.
