# Rafael Brothers — M4.6.5 Handoff

## Play

Open `dist/Rafael_Brothers_M465_MODULAR_STAGE.html` directly in Chrome/Chromium (or Safari) with no server. This is a standalone self-contained game. It is a **limited architectural milestone**, not a new content release.

## Build and tests

```
node --version                # 20+
npm run build
npm test                      # Node test runner
npm run qa:browser            # M4.6.5 Chromium regression (Playwright)
python3 tests/m465-rope-crossing.py
python3 tests/m465-lifecycle-qa.py
python3 tests/m465-json-mutation-qa.py
python3 tests/m465-schema-check.py
```

`python3` browser tests require Playwright and a Chromium executable. `jsonschema` is required only for the optional formal JSON Schema validator. `npm run build` itself uses Node built-ins and JS semantic validation (no install required).

## Make an authored change

1. Edit ONLY `stages/s01.stage.json` for one of the supported prefab types. The generated `s01.anchors.json` and `s01.modules.json` files are **not** editable authoritative sources.
2. Run `npm run build`. Unsafe locations or broken anchor references fail rather than silently producing HTML.
3. Open the game and inspect `__RBStageV1.snapshot()`, `__RBBridgePolish.snapshot()`, `__RBRottenRoot.snapshot()`, `__RBStageAnchors.snapshot()` in browser developer tools.
4. Run all regression checks, including three rope modes and JSON mutation tests. The mutation test edits an isolated temp copy, not the main source.

## Rollback

- Original unmodified upload kept independently as `/mnt/data/Rafael_Brothers_M464_Baseline_Immutable.zip` (when in this working container).
- Current source still contains `dist/Rafael_Brothers_M464_REACHABLE_ROTTEN_TREE.html` plus `build-m464.mjs` and archived M46 source.
- Build script has not edited `baseline/M46_RELEASE.html` or the prior release HTML.

## Next milestone

M4.6.6: finish migrating falling tree + exit geometry safely, strengthen generalized lifecycle cleanup and loader boundaries, then revisit modular asset registry. Forge installed M2 must not be silently assumed equivalent to prior M3.
