# Changelog — M4.6.6 Modular Encounters

- Migrated the falling-branch encounter and exit grove into the existing versioned Stage JSON; kept schema version `1.0.0` with additive prefab families.
- Attached the falling tree's tape hook to its own prefab record instead of a second positional source; derived hanging bridge geometry and safe-pit constraint from `root-bridge` data.
- Converted branch graphics, hint and standing-contact checks from absolute world locations to prefab-relative geometry.
- Moved the exit arch location and deferred finish guards into a data-driven prefab with validation against the rotten ledge.
- Added guarded runtime bind/unbind for the new prefabs, fixed falling-tree shutdown event listener cleanup and idempotent cleanup, restored exit win-hook with ownership guard.
- Preserved legacy M4.6.5 playable HTML, reconstructed immutable M4.6.5 source snapshot, and retained the original core baseline.
- Added new Node safety tests, JSON-mutation visual/physical Chromium verification, and toggle/restart lifecycle regression.
- No new enemies, animations, levels, gameplay physics formulas or Forge releases.
