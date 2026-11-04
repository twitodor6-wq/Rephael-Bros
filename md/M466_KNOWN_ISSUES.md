# M4.6.6 — Known Issues / Deferred

1. **Partial migration.** Latest working game remains built from M46 HTML baseline and eight ordered JS sidecars; not a fresh complete TypeScript/Vite tree. `M4.6.7` should improve composition and teardown before TS rewrite.
2. **Stage 01 specificity.** `validateStageV1` enforces concrete geometries and named singletons; a JSON loader exists but is not an arbitrary stage editor/importer. Cross-prefab linked safety is intentionally conservative.
3. **Legacy positions.** Some unaffected background and enemy coordinates are still hardcoded. Only the five supported prefabs are authoritative in JSON. The deprecated legacy gate is visually hidden and the exit's legacy `win` hook is guarded, not replaced by a generic stage completion system.
4. **Lifecycle scope.** The new falling tree and exit have idempotent destruction and registered runtime unbinding, but the older sidecars still have distributed teardown. No proof of full scene unload/reload across all game scenes.
5. **Browser coverage.** Chromium tests passed; native Safari/real iPhone smoke, full end-to-end human traversal, screenshots/pixel-diff comparison and performance benchmarks are not certified.
6. **Forge.** Installed Challenge Forge was identified in prior audit as M2, whereas an M3 source-adapter version existed in earlier work. No plugin modifications or physics substitutions were performed.
7. **Schema validation.** Formal JSON Schema checks and runtime geometric safety checks complement each other; formal JSON Schema alone cannot enforce cross-reference or real-engine collision safety.

- Direct file and localhost navigation could not be smoke-tested here because Chromium policy returned `ERR_BLOCKED_BY_ADMINISTRATOR`; Playwright `set_content()` loads and Phaser game runtime did work.
