# Rafael Brothers — M4.6.5 Independent Re-verification

Date: 2026-10-27  
Disposition: **M4.6.5 POC VERIFIED; project-wide modular migration PARTIAL.**

## Source of truth and comparisons

- Immutable original M4.6.4 baseline archive: `Rafael_Brothers_M464_Baseline_Immutable.zip` (provided separately).
- `baseline/M46_RELEASE.html` bytes match original M4.6.4 ZIP (SHA-256 `6255d2343a0d59bb9827d6ca7c3740b7f23b0e40969adeb45127d435ca724e31`).
- `dist/Rafael_Brothers_M464_REACHABLE_ROTTEN_TREE.html` matches original M4.6.4 ZIP byte-for-byte (SHA-256 `034b0579a077484d7669c47eea6ea8ed7c9cd5e971634c7f42e3791793474398`).
- Rebuilt M4.6.5 standalone HTML: `dist/Rafael_Brothers_M465_MODULAR_STAGE.html` (SHA-256 `bebe59f403753aa24349551ba9e8eddf32dca93bb0fcc91c77e8d18aa3bf5584`), identical to the separately shared HTML.

## Commands executed anew

| Check | Result |
|---|---|
| `npm run build` | PASS, reproducible HTML, 2,328,976 bytes |
| `npm test` | **36/36 PASS** |
| `python3 tests/m465-schema-check.py` | PASS (Draft 2020-12, Stage 01 and three rejection cases) |
| `python3 tests/m465-browser-qa.py` | **22/22 PASS**, actual Chromium/Phaser |
| `python3 tests/m465-rope-crossing.py` | **3/3 PASS** for Manual / Classic / Hybrid |
| `python3 tests/m465-lifecycle-qa.py` | **10/10 PASS** for disable/re-enable/restart and physics cleanup |
| `python3 tests/m465-json-mutation-qa.py` | **6/6 PASS** for positions of collider, drawn bridge and native rope anchor |
| Byte comparison vs original M4.6.4 ZIP | **PASS** for two preserved baseline HTML files |

No JavaScript page errors in instrumented browser tests.

## Deliverables and scope

- Editable Stage 01: `stages/s01.stage.json`. It is the **only editable source** for the migrated Stage 01 objects.
- Canonical JSON Schema: `schemas/stage.v1.schema.json`. The root `STAGE_SCHEMA.json` is only a `$ref` facade for the named deliverable; it holds no duplicate schema definitions.
- POC supports existing `environmental-anchor`, `root-bridge` and `rotten-root` types, six instances total.
- Actor geometry and anchor cross-references are driven by validated Stage JSON; runtime physics and existing rope equations remain unchanged.
- Architecture, migration plan, Forge compatibility, QA, known issues, changelog and handoff are included.

## Limitations (must not be described as completed)

- This milestone does **not** convert the historical HTML scene and eight sidecars to a modern TypeScript module build, load arbitrary stages, or move all object types to JSON.
- Actor-owned lifecycle remains distributed; the Stage Loader itself does not universally construct/teardown Phaser actors.
- Browser QA uses controlled scenarios, not a fully unaided human playthrough; Safari/iPhone remains unverified.
- Forge installed skill is M2, not independently verified M3; no changes were made to the plugin.
- A generated facade `STAGE_SCHEMA.json` requires canonical `schemas/stage.v1.schema.json` in its relative location; use the canonical schema for tooling without external reference resolution.

## Recommended next release

M4.6.6: migrate falling tree and exit geometry safely into Stage JSON, deepen lifecycle teardown ownership, test more character interactions, and preserve offline single-HTML build. Keep Forge separate.
