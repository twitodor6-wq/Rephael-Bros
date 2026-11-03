# M4.6.2 QA REPORT — Rotten Root / Environmental Anchor Prototype

## Scope
Independent smoke/regression QA for the new rotten-root prototype and earlier stage systems.

## Commands run
- `npm run build`
- `npm test`
- `npm run qa:browser`

## Results summary
- Node tests: **13/13 passed**
- Browser QA: **14/14 passed**

## Browser checks passed
1. Stage drawer mounts eight active toggles including rotten root.
2. Rotten root starts enabled and intact.
3. Rotten root toggle disables the module.
4. Rotten root toggle restores the intact state.
5. Standing on the rotten shelf starts the warning phase.
6. Rotten shelf collapses and disables the anchor.
7. Restart resets the rotten root encounter.
8. Rotten-root environmental anchor can be acquired in preview range.
9. Tape pull can also collapse the rotten root.
10. Sticky web still works.
11. Egg sac still hatches seven spiderlings.
12. Enlarged root bridge is still walkable.
13. Finish trigger still works.
14. No page JS errors were observed.

## Fixture disclosure
- Respawn/gear fixtures were used for encounter isolation.
- Standing validation uses direct placement on the rotten shelf.
- Environmental-anchor acquisition uses `scene.tape.toggle()` after preview readiness because headless keyboard focus did not reliably trigger the hook key.
- Real keyboard input was still used for pull, jump, restart and finish checks.

## Evidence files
- `evidence/m462-browser-qa.json`
- `evidence/m462-rotten-collapsed.png`

## QA conclusion
**PASS** — The M4.6.2 prototype is functional and does not regress the previously verified M4.6.1 stage systems covered by this harness.
