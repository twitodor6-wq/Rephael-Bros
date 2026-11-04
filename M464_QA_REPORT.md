# Rafael Brothers M4.6.4 — QA report

**Milestone:** Reachable Rotten Tree, Organic Exit Grove & Subtle Web Response

## User-reported issues reproduced

1. In M4.6.3, original `qt.update` gate collider checks a rect beginning near x844. The rotten shelf spans x858..946, so normal ground traversal enters `Level Complete` before a player reaches this challenge.
2. The falling-bridge-tree encounter on the left bank was **off by default**, which concealed the most reachable rotten-tree challenge.
3. M4.6 parallax fallback uses player x-position as virtual scroll in a stage shorter than the viewport. Swinging changes x, giving the appearance that distant painted webs swing mechanically with the player. No mechanical relation between distant webs and rope tension existed.

## Fixes

- Default falling-tree encounter turned on. It still leaves 194px of the main pit and cannot bypass the tape challenge.
- A new sidecar `exit-grove.mjs` replaces the green arch with an organic root grove and guards the old win hook until the player reaches the far edge x946 **on ground** (foot y>=440). No changes to collision surfaces.
- Replaced view of old arch and glow with a narrower root passage, natural fibers, moss and muted light points.
- `web-response.mjs` subtly low-pass-filters the motion of the near/mid parallax sprites. A separately drawn set of **local** web strands responds to tension on original root x514,y290 via a damped spring, capped at 3.5px. This is cosmetic, not full soft-body web physics.

## Verified 2026-10-27

- `npm run build`: **PASS** (inline JavaScript validation built into bundler)
- `npm test`: **31/31 PASS**
- `npm run qa:browser`: **22/22 PASS** in Chromium (script details at `evidence/m464-browser-qa.json`)
- `python3 tests/m464-rope-crossing.py`: **3/3 PASS**, Manual / Classic / Hybrid, original x514/y290 anchor kept (see `evidence/m464-rope-crossing.json`)
- Real-keyboard smoke on a fresh browser page: started from the original spawn, walked right until x333, stood still; **the rotten branch collapsed naturally once**, without teleport or challenge toggle.
- The updated exit trigger was checked at old x868 (no finish) and beyond right edge x946 (finish).
- Standing on rotten-root shelf was checked at x902/y378 before finishing; the tree entered warning and collapsed while the stage remained active.
- Sticky web interaction and 7 spiderlings preserved.
- JavaScript runtime errors: **none in M4.6.4 dedicated browser QA**.

## QA scope and caveats

- Automated tests use focused player and gear fixtures for many scenarios (fully disclosed in the browser report); one additional smoke used real movement from original spawn.
- The local web-response visual sway is small and bounded; this is NOT a material-tension simulation of independent web polygons.
- Real Safari performance and human perception of web movement require user validation. No claim of a complete unaided level playthrough.
- User telemetry includes two identical exports dated 01:00:22 and another from 01:04:34. The reports show no recorder errors, no sustained movement stalls and successful original pit traversal, but **cannot record web-layer sprite displacement**. They therefore cannot prove a physical web reaction.
