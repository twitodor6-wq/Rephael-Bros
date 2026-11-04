# Rafael Brothers — M4.6 Forest Art & Bridges Pass

**Playable:** `dist/Rafael_Brothers_M46_FOREST_ART_BRIDGES.html` (single-file, Phaser HTML5 game).

This release extends verified M4.5 and retains M4.3 ceiling spider, M4.4 sticky web, M4.5 seven-spiderling egg sac, both playable brothers and rope modes. No reimplementation of physics, gear, or character body.

## What's new

- Three separate transparent procedural PARALLAX layers (far, mid, near) based on Spider Swamp reference art and world bible. Editable generator `generate-m46-art.py` and asset manifest, **temporary art**, not approved finished illustrations.
- Elevated one-way **walkable root shelf** at x742..835 on the far side of main pit (370..706), and decorative broken root stumps on the gap edges. Jump UP through the solid shelf then land on top; it never bypasses rope traversal.
- Modest atmospheric spores, dew, fine swaying strands and low fog. No new characters or hazards.
- Three independent toggles at the upper right: **M4.6 Depth, Bridges, Atmosphere**. M4.3 art, M4.4 web and M4.5 egg toggles remain.
- Three flags to initialize switched off: `?parallax=off`, `?bridges=off`, `?ambience=off`.

**Keys:** Enter to start; A/D or left/right to move; Space/W jump; E grapple/release; up/down reel; J hammer; K drill; Tab change character; R restart; F3 telemetry; Esc pause. Swing Lab has Manual / Classic / Hybrid and legacy fallback flag.

## Rebuild & test

Node 20+, Python 3 with Playwright + Chromium (for browser suites):

```sh
npm run build
npm test
python3 tests/m46-browser-qa.py
python3 tests/m46-inherited-m45-qa.py
python3 tests/m46-inherited-m43-regression.py
python3 tests/m46-inherited-m44-qa.py 1
python3 tests/m46-inherited-m44-qa.py 2
python3 tests/m46-hybrid-gap-check.py
python3 tests/m46-performance-benchmark.py
```

Build order: `build.mjs` → `build-m42.mjs` → `build-m43.mjs` → `build-m44.mjs` → `build-m45.mjs` → `build-m46.mjs`.

`ASSET_MANIFEST_M46.json` and `dist/m46-build-manifest.json` carry SHA-256 provenance. Prior full HTML M4.5 included as rollback. See `HANDOFF.md`, `QA_REPORT.md` and `KNOWN_ISSUES.md` for caveats.
