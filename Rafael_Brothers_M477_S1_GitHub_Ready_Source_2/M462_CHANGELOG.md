# M4.6.2 CHANGELOG — Rotten Root / Environmental Anchor Prototype

## Added
- New stage module: **Rotten root / hollow tree** (`rb-m462-rotten-toggle`)
- New sidecar `src/rotten-root.mjs`
- One live environmental anchor near the exit area
- Two trigger paths for the rotten object:
  - standing trigger
  - tape-tension trigger
- Warning phase with visual crack cues, toast messaging, and lightweight procedural audio
- Collapse state with fallen-log floor collider and automatic tape release
- Browser QA coverage for both trigger paths

## Changed
- `stages/s01.modules.json`
  - converted `rotten-root` from planned → active
- `build-m462.mjs`
  - new M4.6.2 build pipeline and output file name
- package scripts
  - `build` now targets M4.6.2
  - `qa:browser` now targets the new M4.6.2 browser harness

## Preserved
- Approved M4.6 base HTML prefix remains untouched except title/banner replacement and appended scripts
- All earlier optional modules remain present and independently toggleable from the stage drawer
- Level completion, sticky web, egg sac, parallax, ambience and enlarged root shelf remain functional
