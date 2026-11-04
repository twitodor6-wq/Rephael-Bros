# Rafael Brothers M4.6.1 — Forest Polish & Modular Stage Panel

Working language Hebrew. Run: `npm run build` then open `dist/Rafael_Brothers_M461_FOREST_POLISH_STAGE_MODULES.html` in a browser (self-contained single HTML, no network assets).

**Release baseline:** `baseline/M46_RELEASE.html` is the actual signed-off M4.6 self-contained browser build (immutable except title string and appended script tags in M4.6.1). Original complete source and test chain archived in `m46_source_archive/` inside the release ZIP.

**New modules:**
- `src/stage-modules.mjs` + `stages/s01.modules.json`: a collapsed top-right **Stage Modules** drawer with categorization and seven working toggles. Reparents original button DOM nodes preserving listeners/IDs/state. Stage definition is data-driven. Future stages get a new JSON stage registry. Current build contains one stage only.
- `src/bridge-polish.mjs`: enlarged one-way root shelf x718..887 y399, root fractures x355..480 and x583..720 with decorative 103px separation. Still pit 370..706: no bridge across main gap. Original M4.6 collider hidden/disabled after installation.
- `src/stage-dressing.mjs`: overlays organic earth cross sections and subtle vines on exit arch; cosmetic only, independently toggled from drawer. Old grounds and win trigger remain unchanged.
- `docs/ROTTEN_TREE_CHALLENGE_DESIGN.md`: user-proposed future Rotten Root / Hollow Tree spec, registered as planned, no fake active switch.

**Preserved verbatim:** original forest Parallax, floating gnats/particles, thin mist, spiders/spiderlings, web, rope, all tools, player physics, telemetry, game HUD, level end. Original artwork layers, labels and inherited code stay inside M4.6 HTML.

**QA:** `npm test`, `npm run qa:browser`. See `QA_REPORT.md`, `HANDOFF.md` and `KNOWN_ISSUES.md`. New tests use explicit fixture teleport for focused checks; no human start-to-finish playtest claimed.
