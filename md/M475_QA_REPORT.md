# M4.7.5 — QA report

2026-11-01. Targeted automated QA; human acceptance NOT TESTED.

## Baseline and preservation
Original delivered M474 ZIP hash c8cbdf87fed2b4f5e31cd366cbb675c71939cb9721daead1c6fc70f9ede55428. Original release gate and122 Node tests passed before change. Immutable baseline file unchanged. Full bundled Game Core equals M474 exactly except the product caption. Player, tape, original camera follow/deadzone/smoothing, tools, terrain, modules and eastern challenges retained. Stage data comparison allows only backgrounds changes. Original source is reconstructible in a new destination with per-file hashes.

## Root cause and measurable result
Old camera abs(scrollX)<=.5 used actor-progress*.58, while larger scroll selected camera; web-response then rewrote mid/near with different coefficients when attached. This caused actor-dependent movement, threshold discontinuity and competing transform owners.

New forest offsets are always -appliedCamera.scrollX × Stage factor (.04/.09/.16). No fallback or attachment filter. Original layer opacity .45/.65/.55 retained. World-space local strands react only to their actual grip attachment/load, bounded3.5px; sticky gameplay web is unchanged.

| Rafi/Manual sampled live run | Actor range px | Camera range px | Near-art range px |
|---|---:|---:|---:|
| M474, camera fixed |170.4|0|70.017|
| M475 ON, camera fixed |192.2|0|0|
| M475 OFF, camera fixed |198.3|0|0|
| M474, original camera follow |260.4|127|108.150|
| M475 ON, original camera follow |269.0|156|24.960|
| M475 OFF, original camera follow |249.9|141|0|

Runs use the same action script but are independent real-time executions; ranges differ and are not controlled A/B estimates of player physics. Exact camera-factor equality is separately asserted for every new sampled scrolling frame. The source comparison proves unchanged physics. The old film is user gameplay reference, not a matching old telemetry camera trace; it contains no such fields.

## Final automated matrix
- Node:130/130, retaining122 prior tests and adding8 targeted tests.
- Chromium game/visual/assertion matrix:116/116 (release gate verifies final runtime and source identity).
- Comparison gallery:3/3 separate UI checks.

| Suite | Assertions | Evidence |
|---|---:|---|
| Stability/crossings |51|m475-stability.json|
| Local web/UI/lifecycle |10|m475-web-lifecycle.json|
| Art/Depth combinations |5|m475-art-toggle.json|
| Eastern continuous gameplay + real exit |14|m475-compat-gameplay.json|
| Eastern collapse/rescue |19|m475-compat-hazards.json|
| Recovery/OFF/ON/restart/resources |17|m475-compat-lifecycle.json|

The first-pit12 routes use real tool pickup, then disclosed legal partial start314,490. J→natural collapse→jump onto actual log→E original514,290→swing/release→far-bank landing. All Rafi/Shaul ×Manual/Classic/Hybrid ×Depth ON/OFF combinations pass. No injected velocity/direct attachment/reposition after start. Fixed camera is a deliberate diagnostic condition for this witness.

Second-pit videos start at1135,490 after pickup, then jump/E/steer with the original camera startFollow parameters. They demonstrate actual camera motion, not a full-stage completion. Eastern6 keyboard routes start at1810,490 and reach actual final exit; six inherited rescues and lifecycle cases pass. These are partial-stage automated gameplay sections, not an unassisted complete playthrough.

Controlled local-web fixtures explicitly pause gameplay and manipulate tape metadata/body velocity to isolate visual load response; these are diagnostic tests, not gameplay evidence. They verify original-grip-only reaction, no background writes, Depth independence, OFF reset and different-anchor silence. Actual UI handler tests and restart resource bounds are separate. Four new restart cycles retain99 children,15 postupdate listeners and3 art layers; inherited lifecycle cycles add their own bounds. No exhaustive heap analysis claimed.

Actual exportJson download is parsed and stored as M475_TELEMETRY_EXPORT.json, with camera.scrollX/scrollY, applied camera, layer positions, factors and source on samples. Applied versus observed camera fields deliberately expose Scene postupdate/native render-follow ordering; no fabricated physical force field.

## Visual evidence and browser
M475_VIDEO_COMPARISON.html embeds six original clips: before/after/OFF for fixed and following camera. M475_BEFORE_AFTER.mp4 combines before/after clips. Screenshot-camera viewport1280×720 is the same; separate live runs do not align player pose at every frame. Source screenshots are captured at a lower rate and encoded with original wall-time intervals at30fps, so duplicated frames are expected. They are visual diagnostics, not animation performance certification.

Final matrix uses Chromium153 and Phaser's existing Canvas fallback, with no production renderer/config mutation. WebGL smoke initially loaded three layers, passed safety and had no JS errors; its video capture stalled in this software environment, so full WebGL parity is NOT TESTED. No uncaught JavaScript errors in final suites; no new duplicate script, texture keys or module controls. Single named parallax script replaces historical implementation, rather than appending another.

## Development → QA → Fix → Retest and limits
See M475_REVIEW_NOTES.md for initial failures, independent source review, Art control regression fix and camera-phase telemetry correction. Final gate rejects stale identity and missing combinations. Source review does not constitute human approval.

NOT TESTED: human comfort/readability, full unassisted original-spawn-to-exit playthrough, Safari/iOS/mobile/gamepads, exhaustive dynamic trajectories, long-session heap profiling. Existing independent wind animation remains cosmetic. No new enemies/stages/Forge or player/tape change.

## Delivery validation
All six movie streams pass ffprobe integrity. Gallery uses WebM for open-codec browser compatibility; separate MP4 comparison is supplied. Gallery metadata, three-way group playback and zero JS errors pass3/3. One encoding was regenerated from the original screenshot/timestamp list; source gameplay frames were not fabricated. Exact M474 rollback reconstructs1,056 original files and passes its original release gate and122/122 Node tests.
