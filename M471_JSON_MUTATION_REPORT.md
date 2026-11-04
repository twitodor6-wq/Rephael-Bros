# M4.7.1 — JSON mutation → live Phaser proof

Harness: `tests/m471-mutation-browser.py`. Each variation replaces **only** the inlined Stage JSON in a separately instantiated HTML test page; no production JS is edited. Validation and scene initialization run normally. Both are real Chromium/Phaser sessions, not pure shape mockups.

| Variant | Tree anchor x | Branch `bridgeOffset.x` | Actual branch body x | Exit grove x | `world.level.gate.x` | Stable extension hook x | Result |
|---|---:|---:|---:|---:|---:|---:|---|
| Production | 300 | 70 | 370 | 1710 | 1710 | 1275 | Final HTML |
| A | 306 | 70 | 376 | 1662 | 1662 | 1265 | PASS |
| B | 300 | 78 | 378 | 1690 | 1690 | 1290 | PASS |

**10/10 Chromium checks PASS** across A and B:

- JSON tree coordinate equals the active Registry anchor; the actual Phaser Zone/static body x matches the compiled branch x, not an unrelated constant.
- World finish goal and guarded grove exit offset update from the new JSON, without retaining old x946 trigger.
- Standing on the actual left-bank stub produced `warning`, then `collapsed`. This activated the existing branch Collider and static Zone body, generated Graphics commands, and deactivated the same fragile hook.
- Native `R` Restart restored the fragile hook in both variants. No JS page errors or anchor duplicates reported.

Artifacts: `evidence/m471-variant-a.stage.json`, `evidence/m471-variant-b.stage.json`, `evidence/M471_MUTATION_A.png`, `evidence/M471_MUTATION_B.png`, `evidence/m471-mutation-browser.json`.

**Boundary:** these tests verify component behavior and mutation integrity, but do not replace unassisted end-to-end human completion, full rope-steer timing experiments or Safari QA.
