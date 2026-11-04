# M477-S2 QA — 4 November 2026

## Baseline and scope

GitHub branch `dev/m477-s2-enemy-prefabs`, initial commit `497b4a8` (also main at checkout). Read S1 README, handoff, QA, source, Stage schema and architecture guidelines. Before changes: S1 build succeeded; 142/142 Node tests passed.

## Final checks performed

| Check | Result | Evidence / limit |
| --- | --- | --- |
| `npm run build` | PASS | S2 self-contained HTML, inline scripts parsed by `vm.Script`, asset and Stage validation; 3,197,222 bytes |
| `npm test` | PASS, 153/153 | `docs/qa/m477-s2/node-tests.tap`; 142 retained tests plus 11 S2 tests |
| `node build-m477-s1.mjs` | PASS | Frozen S1 inputs reproduce original 3,193,100-byte HTML and unchanged tracked S1 build manifest; regression test also executes builder |
| `tests/m473-schema-check.py` | PASS | Current and historical Stage JSON; negative-property rejection |
| `tests/m477-s2-schema-check.py` | PASS | Current JSON and four malformed enemy cases |
| Frozen source / core preservation | PASS | Bundled Game Core differs only by product caption; camera/background/other gameplay sources remain equal; pure spider simulation functions byte-identical |
| Legacy interactive web/egg scripts | PASS, byte equality | Embedded S2 scripts equal retained M476 scripts; this is static preservation evidence |
| `npm run qa:s2` | BLOCKED | Missing Chromium executable; `docs/qa/m477-s2/browser-attempt.log` |
| Browser installation | FAILED | Playwright Chromium download returned invalid/truncated ZIP (central-directory signature absent), including runtime-matched CLI attempt |
| Full-stage, S1 browser/parity/death regressions on S2, WebGL, human play, Safari/mobile | NOT RUN | Same missing-browser prerequisite; no gameplay acceptance claimed |

Python's initial environment lacked `jsonschema`; installed test dependencies into an external temporary directory and reran successfully using `PYTHONPATH=/tmp/rb-qa-deps`. No application dependency was added. Node uses the available Playwright package; browser binary was unavailable.

## Development → QA → Fix → Retest

1. New configuration/relocation/multiple-enemy tests initially rejected the unknown prefab. Extended existing registry, semantic validator and JSON Schema; tests now pass. Default config and 240 simulation steps match the historical default, including event/damage outputs.
2. Collection lifecycle tests initially failed because collection did not exist. Added binding ownership, all-instance dispatch, empty collection and failed-second-mount rollback. Tests pass.
3. Actual spider adapter test with minimal Phaser graphics/event doubles exposed a remaining fixed cover Y. Translated silk origin and cover with authored ceiling Y; test passes. This proves adapter calls, not Phaser rendering.
4. Six historical test failures were obsolete exact registry counts/source/Stage comparisons. Updated counts for the additional family, excluded only the explicitly migrated spider/loader from old frozen-source assertions, and removed only the additive spider object from historical Stage comparisons. New S2 tests assert exact simulation/default preservation and current core preservation. No failed test was silently skipped.
5. Separate reviewer found S1 builder installation-order break. Froze S1 loader/spider/Composer/Stage inputs for the historical builder; rebuilt and reproduced original artifact/manifest; regression test passes.
6. Separate reviewer found overlapping enemies bypassed each other's immunity. Added actual-adapter overlap test: failed with two damage events, then passed with one after sharing the player immunity window at collection scope. Single-spider rules remain unchanged.
7. Empty Stage no longer consumes/shows the spider introduction. No implicit fallback enemy is created.
8. Final rerun: S2 build, 153 Node tests, schema checks and diff whitespace check passed. Browser acceptance remains blocked.

## Risk / merge status

Implementation is ready for code review, with browser acceptance pending. Do not treat Node doubles, static hashes or historical M476/S1 browser reports as S2 gameplay proof. No merge performed.
