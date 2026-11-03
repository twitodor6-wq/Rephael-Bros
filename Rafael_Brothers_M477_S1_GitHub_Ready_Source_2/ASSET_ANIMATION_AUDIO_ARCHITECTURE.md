# Proposed asset, animation and audio architecture (future contract, not implemented assets)

**Asset registry:** Stable `assetId` -> `{kind,source,hash,stageScope}`. `kind` may be `image`, `spritesheet`, `audio`, `atlas`, `shader`, `particle-preset`. Build should inline required bytes for standalone HTML and deduplicate by ID/hash. Stage JSON references IDs, never duplicates image binaries. Preserve the existing three `s01` far/mid/near images and unchanged approved parallax pipeline until an exact-visual-match test passes.

**Background manager:** Each layer has explicit depth, camera scroll multiplier, world transform and optional decoration attachment. Decorative painted webs belong to the parallax image. Gameplay webs use world-space anchors / separately simulated local geometry, not art offsets. Existing web-response is cosmetic and must remain so unless separately approved.

**Animation manager:** Scoped keys `character/rafi/idle`, `character/shaul/run`, `enemy/spider/attack`, `environment/rotten-root/crack`; references `{sheetId,frames,frameRate,repeat,events}`. Game-state transitions stay in player/enemy controllers. Sprite import requires orientation, origin and collision box verification; no animations generated in M4.6.5.

**Audio:** Logical event IDs (`environment/root/groan`, `/snap`, `/collapse`) map to buffers or procedural fallback, with volume grouping (`master`, `music`, `sfx`, `ambience`), rate limiting and spatial anchor. Browser interaction gates playback. Keep legacy procedural audio while the abstraction is planned.

**Particles/atmosphere:** stage-owned presets + per-layer placement; lifetime and per-frame budget; group-specific disable/destroy; avoid giant pooled effects on Safari.

**Build evolution:** explicit manifests and hashing -> adapters around current actors -> unified TS/Vite bundler only after M4.6.4/5 behavioral equivalence + actual browser/Safari checks. Never require remote assets for offline HTML.
