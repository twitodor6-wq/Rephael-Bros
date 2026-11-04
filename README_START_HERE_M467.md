# Rafael Brothers M4.6.7 — Start Here

**Deliverable:** M4.6.7 Unified Scene Lifecycle. Source and documentation in this archive; playable game at `dist/Rafael_Brothers_M467_UNIFIED_LIFECYCLE.html`.

1. Start with `M467_HANDOFF.md`, `M467_QA_REPORT.md`, `M467_KNOWN_ISSUES.md` and `M467_ARCHITECTURE_DELTA.md`.
2. Build with `npm run build` (Node 20+); run `npm test` and the six browser QA scripts described in `M467_HANDOFF.md` if Playwright+Chromium are available.
3. Edit Stage 01 only at `stages/s01.stage.json`, not at the generated legacy anchor/module views.
4. Modify actor lifecycle only with regression tests; the Stage Composer controls attachment, actors still own their runtime resources.
5. Use `archive/M466_source_immutable/` or the unchanged M466 HTML for rollback. Do not overwrite the preserved baseline.

No new game content or altered rope physics in this milestone.
