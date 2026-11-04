# Rafael Brothers — M4.6.4

Open `dist/Rafael_Brothers_M464_REACHABLE_ROTTEN_TREE.html` in your browser. This is a single HTML with no external assets or server requirement.

M4.6.4 responds to user-reported gameplay and art problems with M4.6.3: rotten tree by finish trigger, rigidly moving background web art, and unnatural green exit arch. Both rotten encounters are now playable before the end screen, and there is a small separately toggleable localized web-response visual layer. See `M464_HANDOFF.md`, `M464_QA_REPORT.md`, `M464_KNOWN_ISSUES.md`.

Build: `npm run build`
Node QA: `npm test`
Browser QA: `npm run qa:browser`
Rope mode QA: `python3 tests/m464-rope-crossing.py`

Source preserves archived M4.6 baseline and M4.6.3 sidecars. New sidecars append, without rewriting prior engine code. Browser QA includes focused fixtures; do not mistake it for a complete human playthrough.
