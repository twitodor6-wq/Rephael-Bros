# Stage Environmental Anchors — Authoring Notes (M4.6.3)

## Stage JSON schema (v1)

`stages/s01.anchors.json` is a stage-specific list of opt-in anchors.

- `schema`: `rafael-stage-anchors/v1`
- `stage`: e.g. `s01`.
- `world`: width/height bounds used for validation.
- `anchors`: array of items with unique `id`, `label`, `kind` (`tree` or `bridge`), `strength` (`stable` / `fragile`), numeric `x`,`y`, `group`, `enabledFlag` or `null`, and `collapseOutcome`.

Supported `collapseOutcome` metadata: `none`, `fallen-log`, `bridge-fragment`, `break`.

**Important:** The registry owns anchor coordinates, stable/fragile metadata, identity and safe addition/removal from the existing TapeMeasure anchor array; it **does not simulate arbitrary geometry or physics solely from JSON**. Fragile actor scripts (`rotten-root.mjs`, `falling-bridge-tree.mjs`) still own their unique warning and collision geometry. A new actor type needs code, collision review and QA, not merely a JSON entry.

## Lifecycle

1. Scene Game creates original TapeMeasure and base anchor array.
2. EnvironmentalAnchors sidecar registers stage anchors with stable object identity.
3. Rope uses the original `findAnchor()`, `visible()`, `toggle()` and update formulas.
4. Disabling a module removes its owned anchor. If the tape is attached to it, the tape releases first.
5. Scene shutdown removes all added anchor references and unregisters graphics. Restart creates new refs once without duplicates.

## Bridge/pit safety

- Original pit spans x370..706.
- Added living shelf remains x718..887; geometry unchanged from M4.6.1.
- Optional fallen-bridge fragment spans x346..512 at y459. It does not cross the pit: 194px horizontal distance to the far bank remains.
- The original x514,y290 pit anchor must still be selected from the x330 approach position, and all three Swing Lab modes must remain playable.

## Extension guide

For another stage: create `s02.anchors.json`, choose points that genuinely attach to physical foreground objects, ensure the stage config is embedded at build time, and add scoped collision/line-of-sight and end-to-end hook-selection tests. Never turn every painted background tree into an automatic anchor.
