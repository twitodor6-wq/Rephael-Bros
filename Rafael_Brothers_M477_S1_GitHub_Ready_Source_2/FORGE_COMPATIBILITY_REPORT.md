# Platformer Challenge Forge — Installed Compatibility & Upgrade Audit

## Installed skill verified in this session

Skill: `platformer-challenge-forge / creating-platformer-challenges`. Its installed `skill.md` describes an **M2** release and schema `0.1.0`. It includes `jump_gap`, `mushroom_gap`, `grapple_gap` generation, JSON challenge output, SVG preview, static checks, bounded reference movement simulation and `--require-witness`. Bundled contract: `references/contract.md`. The bundled reference profile is explicitly `rafael_v02_unverified_profile.json`.

Earlier project conversations mention a local **M3 (38 tests, source adapter, Rafi/Shaul profiles)**, but that version is **not the installed skill available to this milestone**. Therefore those M3 features are **unverified for the installed skill**. No plugin update performed; Forge source not copied into the game or changed.

## Compatibility dimensions

| Forge M2 field | New Stage v1 field / mapping | Caveat |
| --- | --- | --- |
| `bounds.width,height` | `world.width,height` | Pixel space only; camera offsets not modeled by Forge. |
| `platforms` `{id,x,y,w,h}` | candidate `root-bridge` footprint or future `platform` prefab | Only existing root bridge actively supported. |
| `anchors` `{id,x,y}` | `environmental-anchor` objects | Fragile hooks and `enabledFlag`/break state need runtime semantics. |
| `hazards` `{id,x,y,w,h}` | proposed `challenges` / `objects` for later modules | Do not create unsupported enemies or hazards automatically. |
| `bouncePads` | future `mushroom` prefab | Not migrated in M4.6.5. |
| `spawn`,`goal` (feet at platform top) | future `world.spawn/finish` | Not identical to Phaser player center; coordinate adaptation required. |
| `physicsProfile`/static verdict/witness | separate provenance + QA metadata | No direct game engine equivalence. |

## Proposed integration, no coupling

Forge stays an independent **authoring tool**. A one-way `forge -> proposal.json -> audited adapter -> Stage v1 draft -> game validation -> Chromium playtest` pipeline should use explicit schema versioning and provenance. No code path from live Phaser physics to Forge. Use Stage v1 extracted geometry and an independently verified actual Rafi/Shaul profile if building a source adapter. Simulator witnesses only support candidate selection; actual Phaser movement, enemy interactions and tape dynamics must be tested in Chromium (and preferably Safari), not inferred from model outputs.

## Concrete upgrade gate

1. Obtain and verify actual Forge M3 package/installation, including tests and adapter, before claiming those capabilities.
2. Compare M3 challenge schema with stage v1, identify coordinate/body-shape and collision semantic differences.
3. Export a **read-only** stage profile and a converter that never mutates the game. Never silently upgrade the installed plugin in a game milestone.
4. Test candidates at increasing fidelity: JSON Schema -> static safety -> Forge witnesses -> actual Phaser keyboard/browser physics. Publish each verdict separately.
5. Keep Forge universal; Stage v1 is a consumer-specific adapter, not Forge's mandatory native format.
