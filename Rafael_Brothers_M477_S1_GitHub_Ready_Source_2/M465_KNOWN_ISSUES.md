# M4.6.5 — Known issues and deferred work

- **PARTIAL architecture migration.** Core engine remains embedded in legacy M46 HTML, and eight ordered sidecar scripts still attach to a single Phaser scene. No newly recovered complete current TS/Vite source exists in this package. This milestone does not claim otherwise.
- **PARTIAL Stage Loader.** Stage JSON compiles three prefab types / six Stage 01 instances, but cannot instantiate an arbitrary stage or scene, fully unload stages, or generate new enemy types. Existing sidecar actor creators still instantiate scene objects.
- **PARTIAL stage schema.** `world.spawn`, camera and checkpoint semantics, enemy/trap objects, exit geometry, falling-tree geometry, and some legacy collisions are not yet migrated. Declared background/animation/audio fields are catalog metadata only.
- Existing Stage Module UI uses fixed category names. Control panel toggles retain existing module-owned lifecycle; the loader provides binding metadata only.
- Root bridge actor still wraps and disables a predecessor overlay/collider instead of removing archived predecessor code. This is preserved for rollback.
- Some old manifests exist as generated compatibility outputs, not current source. Always run `npm run build` after editing `s01.stage.json`.
- Browser QA and JSON coordinate mutations passed in Chromium; full unassisted human playthrough, Safari/iPhone profiling, and strong visual pixel equivalence are not certified. Existing cosmetic web motion and audio caveats remain.
- Platformer Challenge Forge skill currently installed identifies as **M2**, not independently verified M3. Forge was not updated; native game simulation unchanged.
