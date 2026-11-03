# M469 design and authorized scope

Authority: uploaded Rafael_Brothers_M469_Work_Prompt_HE(1).md, explicitly authorizing autonomous implementation and independent QA.

Migrate only environmental-anchors to the shared managed lifecycle. Retain authored IDs/order/geometry, existing getRef/getMeta/setActive/clearOverride/sync/snapshot API and original non-environmental tape anchors. Each authored anchor has a resource lease with stable owner ID; disabled or destroyed registration removes its exact identity, releases tape once, and records release failure while still clearing stale attachment and registration references. Reset clears temporary manual disable and resynchronizes module flags without resetting legacy challenge state.

Prototype transition is separate from Game and has no production stage-change UI. Generic JSON validation and asset/prefab availability checks precede unload. Pure versioned session data is copied, frozen and never accepts Phaser/runtime references. Failed candidate load cleans partial resources and reconstructs the old tiny scene from data/session; rollback failure is explicit. Reject concurrent transitions; bounded events carry stage IDs and epochs. Real-browser proof uses two tiny Phaser scenes and >=15 cycles with failure injection.

One executable general-schema extension: optional camera.bounds in Stage v1. Existing Stage01 JSON stays byte-identical and absence changes nothing. Separate generic structural shape validation from Stage01-specific semantic checks. Spawn/exit/terrain/assets/background contracts beyond the prototype are design-only. Defer optional registry-toggle UI: the three core objectives take priority.

No rope formulas, Arcade tuning, new enemies/art/challenges, Forge changes or production Stage02 claims. M468 source ZIP remains immutable with hashes.
