# M4.7.4 — HANDOFF

Start with README_START_HERE_M474.md, M474_QA_REPORT.md, M474_ENCOUNTER_DESIGN.md and M474_RELEASE_MANIFEST.json. Mission was deliberately narrowed by the user to repair existing encounters, not implement the earlier Forge/Composer roadmap.

## What changed
A single116px hollow log rotates around350,518 and settles as a one-way deck350,510,116×16. Its fragile grip350,416 is physically102px along the same upright log. J forwards through the original tool handler and begins the warning; standing/tape remain supported. Warning→break→fall→settle precede support. Breaking unregisters the fragile hook and releases an attached player safely.

The240px remaining gap plus lower deck preserves the original stable rope crossing. Build reads original movement constants and verified widest body to reject ordinary-jump bypass layouts. Both original gaps and stable hooks514,290 /1230,260 remain unchanged. First gap can still be crossed directly by the original rope route; the tree is a helpful optional encounter.

Two green fragments are decorative underwater roots with no walking edge or collider. Existing walking shelf and stable grip colliders remain. Canopy mounting, bark grain, hollow end and moss improve visual continuity without replacing backgrounds/parallax.

Second legacy hollow ledge is explicitly parked by Stage enabled=false/defaultOn=false. ON still restores its previous behavior; no capability deleted. Exit uses authored position/foot threshold and does not require that encounter to be active. Eastern M473 geometry/challenges/exit remain exact as data.

K uses the existing drill system; no redundant new drill puzzle. New J hit forwarding, both acquired tools, module state, death, restart and JSON export are covered in runtime QA.

## Evidence
Automated keyboard first-pit routes and eastern routes are partial-stage witnesses, never claimed as human full-stage play. Phase screenshots use natural state transitions, frozen only to capture matched camera frames; those are not gameplay certification. Test keys are held until real render frames acknowledge them to avoid missing down/up between software-rendered frames.

Rebuild with npm run build; npm test; npm run qa:all with Chromium/Python dependencies; npm run qa:release checks exact artifacts and refuses stale evidence. Read known issues for human/Safari limits.

## Rollback
Run scripts/rollback-to-m473.py with a NEW destination. It reconstructs and hashes all948 files of the original supplied M473 tree without overwriting M474. Full rollback was tested with the old release gate. Older nested M472 rollback is retained inside the reconstructed M473 tree.

## Next recommended work
Human playtest of the first tree, input timing, visible landing surface and full-stage flow, then decide whether the parked legacy ledge earns a new location. Tune layout in JSON against the existing safety checks. Keep the generator, new stages and enemy additions outside this pass until visual/gameplay feedback is accepted.
