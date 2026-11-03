# M474 architecture delta

Scope is limited to the existing encounter and visual sidecars. No new engine, prefab family, stage, enemy, Forge dependency or parallax system.

- `falling-bridge-tree`: pure finite state and shared pose/renderer; existing managed lifecycle, independently owned static one-way deck, sound voice cap, anchor release and cleanup. Existing tool hit dispatcher and respawn are leased/restored with scope ownership.
- Additive Stage motion/hammer metadata defines timings and geometry. Hinge and trunk dimensions derive from the authored landing deck; hookDistance must resolve exactly to the upright anchor. Old Stage data still validates. No coordinates are moved automatically.
- Root bridge config now carries explicit decorativeOnly/drop and a canopy mount for the original hook. No collision is created for the two hanging remnants. Original walking shelf collision remains.
- Stable anchor mountY is cosmetic Stage data; actual hook identities/positions and activation behavior are unchanged.
- Legacy rotten root reads authored enabled=false only as the initial preference. Its real optional toggle and implementation remain. Exit retains its authored object reference and geometry-only validation, never an active-state dependency.
- Read-only ordinary-jump budget is extracted at build time from the immutable Game Core, including coyote and measured body widths. This complements the unchanged rope-crossing validator; unsafe raised-deck and full-pit mutations are rejected. No movement or tape formulas are edited.
- Historical preservation assertions now compare frozen M473 copies of the specifically authorized visual sidecars; current preservation is separately proven against immutable core and exact unchanged eastern data. No old test is removed.
- Rollback reconstructs the exact supplied948-file M473 tree in a new destination from unchanged files plus original changed-byte delta. It never overwrites current work or recursively embeds another full archival ZIP.
