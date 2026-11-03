# Rafael Brothers M4.6.3 — QA REPORT

## Verified release

`dist/Rafael_Brothers_M463_ENVIRONMENTAL_ANCHORS.html`

## Results

- **Node tests:** 25/25 PASS (`npm test`)
- **New M4.6.3 Chromium QA:** 30/30 PASS (`python tests/m463-browser-qa.py`)
- **Inherited M4.6.2 Chromium QA:** 14/14 PASS (`python tests/m463-inherited-m462-browser-qa.py`)
- **Pit crossing regression:** Manual, Classic, Hybrid **3/3 PASS**, using the x460 tape fixture, original x514 anchor, real ArrowRight steering, and explicit release. These passed before the final audio-context shutdown cleanup; final combined rerun was interrupted by the execution limit after Manual passed.

The new QA covers registry entry count, stable/fragile strengths, exact hook selection at several locations, collision changes on feature toggles, old-vs-new bridge stability, safe rope release on module removal, first rotten root standing/pull triggers, actual player landing on optional fallen bridge, restart duplicate prevention, sticky web, egg sac, final gate, and no JavaScript page errors.

## Performance smoke

In software-rendered **headless Linux Chromium 1280x800**, an approximately controlled 3×1-second sample gave:

- M4.6.2: **43.9 FPS** mean
- M4.6.3: **45.5 FPS** mean

This is a narrow environment-specific smoke, not a performance promise or a Safari benchmark; the small observed gain is not evidence of a general speed improvement.

## QA fixture disclosure

- The browser scripts use `player.respawn` and equipment fixture setup to isolate encounters.
- Hook tests use existing `scene.tape.toggle()` where direct `E` key focus was unreliable in headless Chromium; no physics engine replacement.
- Actual live input is used for movement, jump, player restart, and pit traversal.
- Optional bridge landing is verified by falling onto a live Arcade collider.

## Follow-up

- Manual, unassisted full-stage QA on Safari/target hardware.
- Better art and sound design.
- Robust geometry authoring for general fragile structures.
