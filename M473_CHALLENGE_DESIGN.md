# M4.7.3 — Gameplay Challenge Pass

Stage 01 only. Design is authored in `stages/s01.stage.json`; this document and maps are derived explanations.

## Preserved encounters
- Original pit x370–706, root bridge, falling tree at x300 producing a partial bridge.
- Original rotten-root ledge x858,y378 with fragile hook x920,y330 and forgiving fallen-log aftermath.
- Second gap x1190–1270 and stable hook x1230,y260 unchanged.

## 1. Log to log — teach / difficulty 1
Entry x1810,foot490. Stable log x1840..1920, rotten log A x1970..2100 at465, rotten log B x2120..2250 at440, stable landing x2270..2350 at490.
50ms contact starts each independent warning: 1400ms A, 1050ms B. Flashing wood, cracks, countdown and HUD warning precede collider removal. Step away does not cancel a warning.
Main route requires timed jumps; simply running drops the actor to the visible floor at630. The high exit bank is140px above recovery, beyond the unchanged normal jump apex (~112px), so walking below cannot complete the challenge. Return via the visible step at560 and stable start at490. Returning to stable entry rearms teaching logs (explicit recovery policy in JSON); it does not globally reset the stage.

## 2. Crumbling bridge / rescue — combine / difficulty 3
Entry bank2340..2450; gap2450..2790; landing bank2790..3000. Three separate disappearing bridge sections with widths110/110/120 and warning900/700/550ms after50ms contact. Full-speed run, segment jumps, or a stable tape rescue are intended solutions. A stationary actor loses support. This is distinct from the historical tree that creates support after falling.
Hook2620,240 remains stable throughout. Rescue: E after collapse, Up to shorten, steer right, release E above the far side and continue right. One successful keyboard witness per actor/mode is required; this is not a guarantee for arbitrary angles or timing.

## Fairness and evidence boundary
There is no hidden ground under the bridge. The teaching floor is visible collision geometry and a deliberately incomplete route. The exit is moved through JSON to2920 (finish threshold2950). R still restarts the whole stage. Recovery/respawn reset only encounter state; player/tape formulas are untouched.

Automated keyboard play is evidence for specific routes. Human feel, Safari and mobile remain separate acceptance checks. JSON trajectories and screenshots are in `evidence/`; failed development attempts are retained for transparency.
