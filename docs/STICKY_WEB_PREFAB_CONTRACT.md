# Sticky Web Prefab Contract — M4.7.7-S3

`stages/s01.stage.json` is the source of truth for active interactive webs, not `STICKY_WEB_CONFIG` (retained as a pure-model reference). Prefab type: `sticky-web`. Schema version remains `1.0.0`; old stages with zero authored webs spawn zero web graphics and apply no web slowdown. Every web has a stable Stage ID and finite `position: {x,y}` origin.

Required `properties`: `size:{w,h}`, `speedCap`, `holdToTrapSeconds`, `directionalEscapeSeconds`, `maxTrapSeconds`, `recoverySeconds`, `cutRecoverySeconds`, `swingDragPerSecond`. Other properties are rejected. World-bounds and upper safety limits are validated before installing Phaser actors. Stage 01 data exactly matches original M4.4 web position (86,402), dimensions (38x86), speed cap 81, capture 0.70, directional escape 0.62, trap max 2.1, recovery 1.55, cut recovery 3.0 and swing drag 1.45.

**Lifecycle:** Stage loader compiles the web configuration. `installStickyWeb` registers `sticky-web-prefabs` with Scene Composer. It mounts each web, binds its ID to the Stage runtime, manages graphics and deterministic state, and wraps existing world hammer/respawn functions exactly once for the collection. The Composer attaches this managed collection *before* the ceiling spider group; enemy actor shutdown runs first, then Composer destroys webs, allowing wrapper restoration without leaving previous handlers attached. Each web maintains independent states and recovers automatically. The global OFF toggle and Restart reset active captures and `player.inWeb` without changing rope length, anchor or attachment state.

**Multiple webs:** Each web tests its own collision, state, hammer cut and visual response. The group applies Arcade `player.inWeb`, speed cap and swing damping once per frame: strongest drag and smallest speed cap among contacts, rather than compounding. The original single-web result is preserved. There is no implicit fallback hazard.

**Diagnostics:** `window.__RBStickyWeb.snapshot()` exposes the first authored web for historical tests and debug controls. `window.__RBStickyWebs.snapshot().instances` returns all bound webs. Distinguish controlled replay/respawn fixtures from real unaided gameplay.

**Untouched:** immutable M46 Game Core, tape physics and controls, camera/parallax, web-response decorative animation, ceiling spider state machine and old egg sac/spiderlings. Historical S2 inputs are frozen separately for rebuilding its standalone HTML.
