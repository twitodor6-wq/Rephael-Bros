# M4.6.8 Managed Lifecycle Implementation Plan

Goal: shared deterministic resource ownership for dressing and bridge, preserving core and Stage 01 byte-for-byte.
Authority: user's detailed M468 specification and explicit autonomous execution instruction. No additional design approval gate requested.

Architecture: shared resource scope owns reversible enable/disable and terminal cleanup. Managed actor wrapper provides create/update/disable/reset/destroy; compatibility properties remain available. Composer records managed actors and destroys in reverse order; old sidecars retain their existing cleanup.

Alternatives: rewriting all actors raises regression risk; per-module cleanup repeats ownership bugs. Choose a small shared scope and two adapters. Third migration deferred.

- [x] Verify 44 Node + 72 Chromium baseline checks and build/schema before product changes.
- [x] Add failing tests for resource scope cleanup, idempotence, disabled listener/timer semantics, anchors, runtime bindings, exception cleanup and managed actor transitions.
- [x] Implement scope and lifecycle contract; migrate dressing and bridge without changing draw/geometry/physics. Retain dormant fallback.
- [x] Add real-browser toggle/destroy/reset/restart/stop-start tests, resource counts and small separate test-scene unload proof.
- [x] Preserve panel/export; add bounded composer lifecycle diagnostics (stage ID, actor state) without telemetry rewrite.
- [x] Run inherited gameplay, rope modes, JSON mutation, schema and Node suites. Compare baseline graphics/geometry and core hashes.
- [x] Document multi-stage blockers, registry-panel plan, results and M469 plan; package standalone/source with immutable M467 baseline.

Review focus: destroy while disabled; repeated direct actor replacement; cleanup failure continues remaining disposals; scene shutdown listener ordering; Stage 01 remains specialized rather than claiming Stage 02 support.
