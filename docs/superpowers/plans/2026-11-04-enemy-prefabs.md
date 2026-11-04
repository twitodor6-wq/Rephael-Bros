# Enemy Prefab Standardization Implementation Plan

Goal: Stage-authored ceiling spiders, preserving S1 gameplay and frozen core.
Architecture: extend the existing registry and schema; relative geometry compiles to the existing simulation config. A small enemy collection owns adapter instances and Stage bindings; existing spider rendering/simulation remain responsible for behavior. Composer owns scene attachment.
Constraints: do not change tape, characters, camera or backgrounds. GitHub branch is authoritative. Commit and open PR; no merge.

- [x] Verify S1 build and 142 Node tests.
- [x] Write failing Stage configuration, relocation, multi-instance and malformed-input tests.
- [x] Extend Stage registry, semantic validation and JSON Schema; migrate exact default placement.
- [x] Add reusable enemy collection with rollback/idempotent destruction tests; adapt spider through Composer, preserving legacy singleton diagnostics and toggle.
- [x] Build S2 standalone HTML; run Node/schema/browser regressions and document actual results and limits.
- [ ] Review frozen sources and diff, commit, push and open PR to main.

Review focus: missing/zero enemies, multiple instances, malformed geometry, partial mount rollback, shutdown/restart listener cleanup and hammer/respawn chain restoration.
