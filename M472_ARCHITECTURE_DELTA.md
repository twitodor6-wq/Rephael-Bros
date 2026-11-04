# M4.7.2 — Architecture Delta / Source of Truth

| Domain | Owner | Consumer | Data ownership |
|---|---|---|---|
| Game forces, swinging, detach | Immutable Game Core baseline | Phaser runtime | Code, unchanged |
| Authored extension ground and hooks | `stages/s01.stage.json` | Stage compiler, actors | JSON once |
| Old first pit and original hook | Phaser legacy level/tape instance | Runtime snapshot adapter | Existing Game Core; no new authored coordinates |
| Current collision bodies | Phaser Arcade world static bodies and `world.solidRects` | Read-only safety snapshot | Runtime Phaser |
| Optional crossing relationships | `stage.ropeCrossings[]` (IDs only) | Stage validation/compiler/runtime/QA | Stage JSON |
| Static pass/fail evidence | `src/validation/rope-crossing-safety.mjs` | Build, Node, Chromium | Derived report, not game state |
| Profile sizes/tape reach | Live character bodies and immutable engine source | Validator (snapshot) | Phaser/Game Core; not 14px magic offset |
| Build promotion gate | `scripts/m472-release-gate.mjs` | QA/release | Exact Stage & HTML SHA + browser evidence |

No plugin changes, no Stage v2 promotion, no M470 world terrain activation, no live-tape collision intervention. New scene adapter does not create physics objects.
