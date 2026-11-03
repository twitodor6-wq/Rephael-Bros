# M4.6.4 — handoff

## Release
- `dist/Rafael_Brothers_M464_REACHABLE_ROTTEN_TREE.html` — self-contained browser build
- `src/exit-grove.mjs` — win trigger guard + new root arch
- `src/web-response.mjs` — damped parallax + locally loaded strands
- `src/falling-bridge-tree.mjs` — same falling-tree physics; now **ON by default**
- `stages/s01.modules.json` — new visual toggle and falling-tree default flag
- `build-m464.mjs` — produces standalone HTML from unchanged M4.6 baseline + sidecars

## Testing the fix
1. Start the level and walk right to the edge of the starting bank near the tape pickup; stand momentarily to hear and see the tree warning, then collapse.
2. Use the tape to cross the pit. The original x514/y290 root and Manual/Classic/Hybrid physics are unchanged.
3. On the far bank, pass beneath the narrower root arch: the level should **not** end at the old x844 trigger. Jump onto the fragile elevated shelf and stand until it warns and collapses. Then walk on ground to the far right to finish.
4. Open ⚙ Stage Modules / Visuals & atmosphere / **Web sway**. Turn it off and on to compare how the mid/near background follows rapid swinging; the original forest gnats, mist and parallax textures remain.
5. Press R to restart and verify both rotten-root encounters reset.

## Next priorities
- Replace procedural rotten limb with authored sprite/animation, richer crack and fall phases
- Add editor-visible challenge previews and per-level finish trigger geometry to stage JSON, rather than having it in a sidecar
- Consider a proper local web-mesh/pivot connection map for physical thread motion and damping
- Keep original depth effect stable by default; profile performance on Safari hardware
