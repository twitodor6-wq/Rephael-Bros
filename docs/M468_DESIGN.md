# M468 bounded design

The supplied M467 package is the behavioral baseline. Build, Node tests and real Chromium tests must be executed before implementation. The archived input ZIP and read-only extracted tree preserve rollback.

Two resource owners migrate: dressing (graphics) and bridge (graphics, static zone/body, collider, stage binding and coordination with the existing anchor registry). A common scope disposes resources in reverse registration order, continues cleanup after errors and is idempotent. Enable/disable pauses owned interactions; reset restores the same static authored actor, without allocating a duplicate. Destroy is terminal. Runtime refs clear only when identity still matches, to avoid an older actor clearing a replacement.

The managed actor wrapper owns postupdate/shutdown/destroy listeners. Existing public runtime properties and snapshot payloads stay available. Composer records returned managed instances, destroys them in reverse order on shutdown and reports bounded transitions. Other five actors keep their existing lifecycle paths. Dormant compatibility paths are retained.

No core physics, rope tuning, Stage 01 geometry, art drawing commands, or Forge changes. No third migration: anchors have dependencies across multiple still-legacy actors, and expanding scope is unnecessary to prove the contract.

Validation: unit cleanup/error paths; actual Phaser browser disable/reset/destroy/replace/restart/stop-start; inherited Manual/Classic/Hybrid crossings and gameplay fixtures; baseline geometry/graphics parity; test-scene load/unload; additive diagnostic JSON export. Native cross-browser and a full unassisted playthrough remain separate.
