# M4.7.7-S3 QA Report — Sticky Web Prefabs

## Scope
Baseline: M4.7.7-S2 merge `2ea8b442`; branch: `dev/m477-s3-sticky-web-prefabs`.
Goal: Stage-authored sticky web hazard, zero/multiple instances and lifecycle; preserve tape physics, old spider/egg hazards, camera/parallax and character behavior.

## Automated evidence

- First CI run `41766327460` on `2e7ceea`: S3 HTML build PASS; **166/166 Node tests PASS**; schema tests PASS; Chromium installation PASS; S2/M477 smoke, six actor/rope-mode regressions, physics parity, visual and death/restart regressions PASS, **zero browser regression failures**.
- Caveat: The first workflow inadvertently omitted the **dedicated S3 Chromium smoke**, despite executing all existing browser regressions. That omission was detected and fixed in `4176db45`.
- Required latest check: the `qa:s3` step must appear in the GitHub Actions browser loop and pass on the latest branch commit, alongside `qa:s2`, `qa:m477`, parity, visual and death tests. Final CI status is the source of truth; do not infer a PASS merely from this document.
- The browser smoke covers a controlled Stage 01 web contact, scripted hammer hitbox, OFF/ON, three restarts, Stage binding count and uncaught JS errors. It does not prove an unaided complete level run or Safari/mobile compatibility.
- QA artifacts: GitHub Actions run page (screenshots, logs, standalone HTML); binaries stay out of code commits.

## Preservation / ownership
- Pure M4.4 sticky state machine is byte-identical to embedded original; default Stage 01 coordinates/tuning match the original.
- S2 Stage, loader and Composer contracts are frozen for historical S2 rebuilding.
- Sticky web group is Composer managed, attached before the enemy collection, so nested hammer/respawn hooks unwind on scene shutdown without accumulation.
- Multiple overlapping webs apply one Arcade speed/damping response per frame, not multiplicative changes.

## Merge gate
Draft PR only. Request human confirmation of the S3 build's feel and visibility in a real browser before merge to `main`. No manual full-stage acceptance is claimed here.
