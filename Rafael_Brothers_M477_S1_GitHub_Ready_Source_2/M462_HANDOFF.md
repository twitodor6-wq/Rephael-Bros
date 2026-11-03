# M4.6.2 HANDOFF — Rotten Root / Environmental Anchor Prototype

## Delivered build
- `dist/Rafael_Brothers_M462_ROTTEN_ROOT_ANCHOR.html`

## Delivered source package
- root source in this folder
- archive to export: `Rafael_Brothers_M462_Source_QA.zip`

## What to look at first
1. Open the HTML build.
2. Start the stage.
3. Open **⚙ Stage Modules**.
4. In **Hazards**, keep **Rotten root / hollow tree** ON.
5. Test the new encounter in two ways:
   - Stand on the rotten shelf near the exit side.
   - With tape equipped, acquire the nearby anchor and pull until it cracks.

## Gameplay behavior now
- The rotten shelf begins intact.
- If the player stands on it long enough, it warns then collapses.
- If the player hooks the environmental anchor and puts enough tension on it, it warns then collapses.
- Collapse disables the upper rotten shelf, releases the anchor, and leaves a fallen-log floor state.
- Restart restores the intact state.

## Important implementation boundaries
- No new external assets were introduced.
- Sounds are procedural and best-effort only.
- The system is still prototype-level: one encounter, one anchor, one collapse profile.
- Existing physics engine and rope system were not replaced.

## Suggested next milestone
### M4.6.3 — Reusable environmental anchors
- Promote environmental anchors to a registry/system instead of one hard-coded encounter
- Support anchor metadata:
  - stable / fragile / scripted
  - strength
  - warning audio profile
  - collapse outcome (drop, break, become bridge, become hazard)
- Add one more **stable bridge/tree anchor** to validate the general system
- Improve authoring data so future stages can define stage modules and anchor actors from JSON
