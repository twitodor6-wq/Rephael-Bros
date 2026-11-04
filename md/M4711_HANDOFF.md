# M4.7.1.1 Hotfix Handoff

**STATUS: TARGETED BUGFIX QA PASS / NOT END-TO-END CERTIFIED**

Issue from real user: `ArrowUp` auto-released the tape near the second gap's east-bank wall and caused death. In original M471, `stable-root-extension` at x1275 drew the radial reel correction toward the solid bank. Collision sweep returned `Tape blocked by roots — released safely`.

Fix: only Stage JSON `stable-root-extension.position.x` 1275 → 1230, inside gap x1190–1270. First gap, tape physics, player, timing, and all colliders unchanged. Build via `npm run build`.

QA: 94/94 Node, 10/10 focused real-keyboard reeling tests (three modes × three positions), 2/2 gap jump, 14/14 smoke, 8/8 lifecycle with 15 restarts. QA runs use controlled player placement for reproduction; human full-run and Safari remain NOT TESTED.

Full source ZIP + playable HTML are deliverables. Keep original M471 package for rollback. Original M471 manifest and archived QA remain untouched. See `M4711_HOTFIX_QA.md`.
