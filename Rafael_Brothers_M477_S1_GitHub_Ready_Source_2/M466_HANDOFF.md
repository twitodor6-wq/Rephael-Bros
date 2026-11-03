# Rafael Brothers — M4.6.6 Handoff

## Playable release

Open `dist/Rafael_Brothers_M466_MODULAR_ENCOUNTERS.html` locally in Chromium/Chrome. The build is a self-contained offline HTML. Original M4.6.5 HTML remains intact under `dist/`.

## Rebuild & test

```sh
node --version    # >=20
npm run build
npm test
npm run qa:browser
python3 tests/m466-lifecycle-qa.py
python3 tests/m466-rope-crossing.py
python3 tests/m466-json-mutation-qa.py
python3 tests/m466-interactions-qa.py
python3 tests/m465-schema-check.py
```

Playwright and Chromium are required for Python browser checks; `jsonschema` only for formal schema checks. No npm package installation is required for the build and Node tests.

## Authoritative editable stage file

`stages/s01.stage.json` is the **single source of truth** for authored geometry of the five current prefab types. `schemas/stage.v1.schema.json` is the canonical schema; root `STAGE_SCHEMA.json` is a reference facade only. `stages/s01.anchors.json` and `stages/s01.modules.json` are **generated compatibility views** and must not be hand-edited.

Current executable prefab families: `environmental-anchor`, `root-bridge`, `rotten-root`, `falling-bridge-tree`, `exit-grove` (seven object instances; four environmental tape hook IDs). The falling tree's anchor metadata lives within its own prefab; the hook and fallen platform are derived from the same position. Its gap comes from `pitSource: living-root-shelf`, not a duplicated rectangle. Exit guard offsets derive from the grove position.

## Rollback

- The M465 standalone HTML is retained unchanged at `dist/Rafael_Brothers_M465_MODULAR_STAGE.html`.
- `archive/M465_source_immutable/` captures the preceding milestone's pristine `src/`, schema, stage data, tests and build script for reproducible rollback. See its README.
- `baseline/M46_RELEASE.html` remains unchanged and read-only to the M466 builder.
- An externally kept complete M464 archive remains usable as the earliest verified rollback point.

## Next target — M4.6.7

Adopt a unified composition root for ordered sidecar installation, remove prototype monkey-patches **one at a time** after behavioral equality checks, ensure scene-switch teardown for every actor, and add scene-level lifecycle contract tests. No automatic Forge updates; installed Forge M2 remains independent.
