# M477-S1 QA report

## Scope and evidence levels

This is a Rafi RUN presentation POC over M476, not a replacement game. Chromium automated gameplay actions and controlled diagnostics were performed. Human play, human visual approval, Safari and full-stage WebGL are NOT PROVEN. No six new full-stage runs are claimed. M476's six historical Canvas Spawn→Exit recordings remain historical evidence only.

## Baseline

Recovered exact M476 full-source ZIP SHA256 `2286ac5fa4ea28d2697b22df0a0c2af8672972f10a0eb31bafcbfff05c323163`. Before implementation:126 manifest file hashes matched, baseline build passed,135 Node tests passed. Historical M476 release gate also passed; that gate alone does not constitute new browser testing.

## Current verification

- Build: self-contained offline HTML with one embedded RGBA sprite sheet, validated PNG dimensions/hash and manifest. Original PNG bytes unchanged.
- Node:142/142 tests, comprising135 retained tests and7 new policy/calibration/adapter/contract tests. Complete bundled Game Core differs only by version caption. Frozen camera/background/physics-related sources remain byte-equivalent. Stage comparison permits only the new visual-module entry.
- Chromium Canvas:25 checks in `evidence/m477/browser.json`: actual key movement right/left; original-view fallback at idle/jump/J/K/tape/Shaul; real OFF/ON;6 keyboard first-pit crossings (Rafi/Shaul × Manual/Classic/Hybrid);6 Restart cycles; OFF persists across R; zero page errors. Crossing tests disclose initial legal partial respawn and tool pickup; no mid-crossing physics setters. They are not Spawn→Exit runs.
- ON/OFF diagnostic:6 paired fixed-step traces,199 steps per side, including ground movement/reversal/jump and E attach/reel/release. Body x/y/vx/vy, grounded state, tape anchor/length and spatially canonicalized static-body/collider states compared exactly. Fixture resets initial position and clears scene timers equally; it is explicitly not ordinary gameplay. See `physics-parity.json` and log for per-case results.
- Actual gravity death/respawn for both profiles after a disclosed initial pit fixture; original rendering restored. Scene stop/start lifecycle API removed visual instance and references. See `death.json`.
- Matched OFF/ON screenshots: identical body coordinates, velocities and camera; loop frozen only for screenshot pair. Native browser recording captures real right/left keys, stop/jump and toggle; no synthesized sprite frames. Partial fixture camera intentionally framed near x1450.
- Local `file://` WebGL smoke: actual renderer type2, PNG ready, RUN display and original fallback, zero page errors. This proves a smoke only, not full WebGL gameplay.

## Critical review → fixes → retest

1. Adapter mock exposed undefined foot Y: pose received `{x,y}` while contract expects `{x,bottom}`. Corrected; dedicated assertion now checks finite body-bottom anchoring.
2. Destroyed Phaser Sprite has null animation/frame internals: snapshot/fallback needed nested optional guards. Added realistic destroy test; corrected and retested.
3. Reversing input before velocity changed caused potential backward sliding animation. Added a failing policy case and conservative turning fallback; test passes.
4. First matched screenshot fixture kept camera at0 while body was offscreen. Reframed fixture; recaptured matching ON/OFF. This was evidence framing, not a gameplay-camera change.
5. ON/OFF comparison initially compared unordered physics lists by insertion order. Saved precanonical traces show equal body/tape values. Canonicalized static bodies by spatial identity and collider active-state multiset; reran full paired matrix. No physics patch was made.
6. Scene loop cannot be resumed using an incomplete callback in this harness. Diagnostic now uses a fresh browser per ON/OFF side. Original failed logs retained where available.
7. The extracted working copy showed original tracked metadata reappearing across commands. A separate byte-copied release tree was created; package/stage/build/test edits and reproducibility were verified there. Only this release tree is delivered.

## Visual findings and limits

Reviewed supplied dark preview and actual matched game screenshots. .23 scale preserves proportions and approximately matches prior visible height; per-frame foot pivot corrects gross source-bound drift. Fine pale fringe and pose/foot sliding remain. Stylistic fallback is abrupt. All art remains PROTOTYPE; see M477_S1_KNOWN_ISSUES.md. New automated tests are not human acceptance.

Current machine-readable release manifest and release gate are authoritative for final hashes/results. Original offscreen diagnostic screenshots are excluded from the comparison gallery; matched screenshots are the reviewed evidence.
