# M4.6.6 — Architecture Delta

**Reference:** `ARCHITECTURE_AUDIT.md`, `ARCHITECTURE_DESIGN.md` and `M465_HANDOFF.md` describe the previously verified M4.6.5 platform; this document records only new functionality.

```text
stages/s01.stage.json (authoritative Stage 01 prefab data)
  -> src/stage-loader.mjs (schema+semantic validation, ID registry, relative geometry)
     -> generated stages/s01.anchors.json and stages/s01.modules.json (read-only compatibility views)
     -> __RBStageV1.getConfig(type,id)  [browser runtime]
          -> environmental-anchors.mjs (stable IDs, fragile hook refs, real tape integration)
          -> falling-bridge-tree.mjs (branch geometry, warning, collider, hook lifecycle)
          -> exit-grove.mjs (portal art and deferred-finish guard)
          -> bridge-polish.mjs / rotten-root.mjs (unchanged existing prefab consumers)
```

**Single-source falling object:** `fallen-bridge-tree.position` is the existing tape hook position. `stubOffset` and `bridgeOffset` specify relative, reusable geometry. `anchor` contains metadata without duplicate world coordinates. The safe gap references `pitSource`, the existing root bridge object. Moving its position updates all derived geometry and the actual Phaser hook, as tested in Chromium.

**Exit:** `forest-exit-grove.position` is the portal art origin. `endOffsetX` and `minFootOffsetY` define guard boundaries relative to it. A semantic check requires the threshold after the existing rotten ledge. The legacy gate graphic's detection signature is *not* a second authored location.

**Scope boundary:** Physics and rope core are unmodified; old sidecar prototype hooks remain and will be incrementally replaced only after parity QA. There is one HTML build artifact and an isolated, identical M465 rollback snapshot.
