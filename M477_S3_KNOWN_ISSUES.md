# M477-S3 Known Issues / Boundaries

- First automated S3 run and actual browser acceptance are pending until CI is recorded. This branch must not be marked GO based only on static code or source parity.
- Automatic collision/world-bounds checks do not establish that a custom authored web is playable or positioned on actual terrain; stage designers must inspect in Phaser.
- Overlapping webs deliberately apply speed limits and swing drag once, not multiplicatively. Multi-web balancing still requires human gameplay review.
- `window.__RBStickyWeb` is a backward-compatible *first-web* facade; all-web diagnostics are at `window.__RBStickyWebs`.
- The sticky-web system is a Stage-owned hazard, not decorative parallax. Egg sac/spiderlings remain legacy singleton components and are out of S3 scope.
- Safari/mobile and full unaided level runs are separate acceptance scopes.
