# Rafael Brothers — M4.6.5 Modular Stage Foundation

**Play now:** `dist/Rafael_Brothers_M465_MODULAR_STAGE.html` — offline, one HTML.

**Build:** `npm run build` (Node >=20). **Quick unit QA:** `npm test`.

**Editable stage geometry:** `stages/s01.stage.json` (schema `schemas/stage.v1.schema.json`). `stages/s01.anchors.json` and `stages/s01.modules.json` are **generated compatibility outputs**: do not edit.

See `M465_HANDOFF.md`, `M465_QA_REPORT.md`, `M465_KNOWN_ISSUES.md`, `ARCHITECTURE_AUDIT.md`, `ARCHITECTURE_DESIGN.md`, `FORGE_COMPATIBILITY_REPORT.md`, and `MIGRATION_ROADMAP.md`.

This milestone implements three existing prefab types as a safe loader/adapter POC. The full Phaser game has **not** been rewritten to modular TS/Vite; all prior mechanics remain intact in the byte-identical legacy baseline.
