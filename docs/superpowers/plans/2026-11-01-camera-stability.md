# Camera stability implementation plan

Goal: camera-only decorative parallax; independent anchor-local web response. Phaser HTML with existing sidecars.
Spec: user M4.7.5 request. Autonomous inline execution is authorized.
Constraints: preserve player/tape/core, all encounters, three swing modes; Stage JSON owns visual parameters. No opacity-only fix.
Review focus: zero-scroll boundary, camera teleports/restart, ON/OFF without catchup, image coverage at far east, web cleanup.

- [x] Record baseline gate and Node122; inspect input film and telemetry (no old camera samples).
- [x] Red test forestOffsets: fixed camera + moving actor identical; continuous across .5; ordered factors bounded by .18; disable static. New src/forest-parallax.mjs replaces exactly historical script rb-m46-0 in build-m475.mjs.
- [x] Stage backgrounds.parallax supplies factors .04/.09/.16, camera source, no temporal player-dependent smoothing. Layer extent must cover camera max1740. Existing asset1792 spans1280+278.4.
- [x] Remove background ownership from src/web-response.mjs; local strands use existing stable anchor under actual attachment/load, exponential dt-scaled spring, reset on OFF/restart. Keep sticky gameplay web untouched.
- [x] Extend telemetry sample only with camera and decorative/interactive snapshots. New build replaces named art script and narrow sampler insertion, verifies syntax and unchanged Game core.
- [x] Run Node regression, Chromium freeze-camera and scrolling camera sweeps, both actors × modes ON/OFF real-keyboard swings; before/after recording and trace; actual JSON export; restart and JS errors. Replay identical measured camera/player trace through old/new visual models as diagnostic separate from gameplay.
- [x] Critical self-review, fix/retest; source ZIP, standalone HTML, video comparison and docs, manifest and original archive rollback.

Completed inline. Original ZIP is the immutable rollback source; no external repository or branch was modified. Independent source review findings were fixed via RED→GREEN. See M475_REVIEW_NOTES.md.
