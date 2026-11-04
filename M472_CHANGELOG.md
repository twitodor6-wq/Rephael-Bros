# M4.7.2 — Changelog

**Added:** `src/validation/rope-crossing-safety.mjs`, runtime Stage geometry snapshot adapter, `ropeCrossings` optional semantic refs with compiled contract validation, two independent JSON fixtures, Node and Chromium test suites, release QA gate and standalone HTML.

**Preserved:** original `build-m471.mjs` from M4711, archived source/history, 94 pre-existing Node checks, stage anchor coordinates and all tape/Arcade movement formulas.

**Validated:** two existing gaps; old x1275 fails and patched x1230 passes in both static geometry and a real Phaser regression; both character hitboxes; three reel modes; actual keyboard E/ArrowUp/ArrowDown; 3 restarts; module/anchor disabled states; all four M471 compatibility browser QA suites.

**Not claimed:** exhaustively safe stages, human unassisted traversal, all dynamic collider states or Safari.
