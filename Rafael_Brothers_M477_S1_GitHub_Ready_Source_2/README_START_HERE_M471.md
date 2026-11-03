# Rafael Brothers — M4.7.1 · Root Forest Expansion

**Release classification: QUALIFIED / PLAYABLE** · 29 October 2026

Playable build: `dist/Rafael_Brothers_M471_ROOT_FOREST.html` (one standalone HTML, Phaser bundled). Open it in a desktop browser (direct `file://` opening has not been verified in this environment). Press **Enter** to start, **A/D or ←/→** to move, **Space** to jump, **Tab** to swap Rafi/Shaul, **E** for the tape, **↑/↓** to reel, **R** to restart and **F3** to toggle telemetry. Stage Modules and Swing Lab controls remain available. The player must collect the tape measure as in M470.

## Run and validate

```bash
node --version  # v20+ recommended
npm run build
npm test
python3 tests/m470-schema-check.py
python3 tests/m471-browser-smoke.py
python3 tests/m471-mutation-browser.py
python3 tests/m471-new-gap-browser.py
python3 tests/m471-lifecycle-browser.py
RB_QA_HTML=dist/Rafael_Brothers_M471_ROOT_FOREST.html RB_QA_RELEASE=M4.7.1 RB_QA_ROPE_REPORT=m471-rope-rendered.json RB_QA_RENDER_ISOLATION=0 python3 tests/m470-rope-crossing.py
RB_QA_HTML=dist/Rafael_Brothers_M471_ROOT_FOREST.html RB_QA_RELEASE=M4.7.1 RB_QA_ROPE_REPORT=m471-rope-isolated.json RB_QA_RENDER_ISOLATION=1 python3 tests/m470-rope-crossing.py
```

Browser QA requires Python Playwright, Chromium and `jsonschema`. In this session: Chromium 144.0.7559.96. `CHROMIUM_PATH` may select Chromium executable. The release is a standalone HTML; browser smoke tests use `page.set_content` because `file://` may be blocked by policy.

## Source-of-truth and rollback

- **Production content:** `stages/s01.stage.json`. Optional extension `world.forestExtension` uses legacy Arcade collision group; experimental `world.terrain` **is not mounted**.
- **Immutable M470 Stage01 snapshot:** `stages/s01.m470.rollback.json`. Original whole ZIP SHA256 recorded in `RELEASE_MANIFEST.json`. Original source baseline `baseline/M46_RELEASE.html` unchanged.
- **Derived views:** `stages/s01.anchors.json` and `stages/s01.modules.json` are overwritten only by the build from Stage JSON.
- **Approved rope mechanics:** baseline Phaser bundle, Manual/Classic/Hybrid formulas untouched.
- **Other experimental features:** M470 fixture and transition controller retained, not activated in production.

Read `M471_STAGE_DESIGN.md`, `M471_JSON_MUTATION_REPORT.md`, `M471_QA_REPORT.md`, `KNOWN_ISSUES.md` and `HANDOFF.md` for exact evidence and limitations.
