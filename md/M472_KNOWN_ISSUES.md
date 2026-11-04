# M4.7.2 — KNOWN ISSUES

- **NOT TESTED:** full unassisted run through Stage01 using rope crossing, including all angles, player speed and dynamic hazard combinations.
- **NOT TESTED:** Safari/iOS/browser parity, mobile UI and human tactile feedback.
- **NOT TESTED:** all permutations of a fragile anchor collapsing mid-swing and all obstacle state combinations.
- **NOT TESTED:** full life/death/respawn telemetry attribution for every crossing. QA observes controlled tape release and restart, but does not install a permanent gameplay event-source change.
- **LIMITATION:** game has two distinct ground ownership systems; only the extension is currently Stage-authored. Legacy first pit must still be read from live Phaser bodies until separately migrated.
- **LIMITATION:** predicted static reel sweep is sampled; it is intentionally conservative and may flag layouts that are viable only through a special input sequence.
- Prior known M4711 issue: intermittent Hybrid normal-render experience still needs human testing; targeted Hybrid keyboard reels pass.

**No active blocker in the tested controlled scenarios. Do not represent this milestone as full end-to-end gameplay certification.**
- **ENVIRONMENT LIMITATION:** Chromium direct navigation to `file://` or localhost HTTP is blocked by the sandbox administrator; Playwright HTML-content execution passed, but local-file launch outside the sandbox is not independently certified.
