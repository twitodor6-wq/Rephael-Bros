# Rafael Brothers CHANGELOG

## M4.6.3 — Environmental Anchors & Falling Tree

- New stage-authored anchor registry with validation, stable object identity, opt-in visibility and safe release on removal.
- New stable tree and stable bridge hooks; the previous fixed pit hook retains priority at the original takeoff point.
- Migrated M4.6.2 rotten root to registry ownership while retaining standing and tape-pull collapse triggers.
- Added optional falling rotten branch near left pit edge; after cracking and warning audio, it becomes a **short one-way partial bridge**. Disabled by default.
- Added verification for actual landing on the bridge, hazard module toggles, restarts and no leaked/duplicated anchor references.
- Closed procedural audio contexts on actor shutdown to avoid accumulating them across repeated restarts.
- New browser QA, inherited M4.6.2 regression, rope crossing test for Manual/Classic/Hybrid, and comparison performance smoke.

See historical milestone records: `M462_CHANGELOG.md`, `m46_source_archive/`.
