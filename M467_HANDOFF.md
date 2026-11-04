# Rafael Brothers — M4.6.7 Handoff

## Latest playable artifact
`dist/Rafael_Brothers_M467_UNIFIED_LIFECYCLE.html` (fully bundled self-contained HTML). Previous complete M466 source and standalone HTML are kept under `archive/M466_source_immutable/`, plus the M466 HTML remains in `dist/`.

## Rebuild
Requires Node >=20 and Python/Playwright+Chromium for browser QA. The Node build uses only standard-library modules; it does not require an npm install.

```bash
npm run build
npm test
python3 tests/m467-browser-qa.py
python3 tests/m467-lifecycle-qa.py
python3 tests/m467-interactions-qa.py
python3 tests/m467-rope-crossing.py
python3 tests/m467-json-mutation-qa.py
python3 tests/m467-scene-lifecycle-qa.py
python3 tests/m465-schema-check.py
```

## Sources of truth
- `stages/s01.stage.json`: authoritative Stage 01 prefab locations and geometry (no new position data added for M467).
- `schemas/stage.v1.schema.json`: canonical schema.
- `src/stage-loader.mjs`: Stage JSON validator, compiler, runtime config and metadata binding.
- `src/scene-composer.mjs`: **single active** Stage 01 sidecar attachment order and scene lifecycle observer.
- `src/*.mjs` actors: their own gameplay, colliders, art, and cleanup. The legacy fallback hooks remain dormant in the M467 build.
- `build-m467.mjs`: deterministic build and inline JS validation; source order is explicit.

## Rollback
- `archive/M466_source_immutable/` is an unchanged file-for-file M466 source snapshot including the original M466 playable file, and `dist/Rafael_Brothers_M466_MODULAR_ENCOUNTERS.html` matches it by SHA-256.
- `baseline/M46_RELEASE.html` is untouched; earlier milestone archives are retained.
- Do not attempt to replace the M467 composer with seven independent hooks without performing the older M466 build and its QA.

## Scope and QA
M467 is an architecture-focused milestone only. It adds no stage, enemy, animation or tape physics changes. Chromium tests use real Phaser runtime, controllable fixtures and real input, not a fully unassisted human playthrough. Direct `file://` and localhost navigation were restricted in the Chromium QA environment; native Safari needs separate manual testing.

The user-supplied October 28 telemetry is **M4.1.3**, not M467. The user confirmed its fall into the pit was normal gameplay after reeling down and disconnecting. No rope bug was filed or physics fix applied on that basis.

## Proposed next: M4.6.8
Migrate one or two older sidecars into a shared managed actor-lifecycle interface (`create, update, disable, reset, destroy`), removing their *dormant* prototype patch paths only after parity tests. Then consider a general stage-change controller and data-driven UI modules. Keep Forge independent and do not replace Phaser physics.
