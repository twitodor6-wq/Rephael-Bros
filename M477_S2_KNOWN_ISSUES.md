# M477-S2 Known Issues

- Chromium/Phaser execution, WebGL, complete stage runs, visual acceptance and Safari/mobile were not tested in S2. Missing browser; attempted installation failed with invalid/truncated ZIP downloads.
- Stage bounds validation does not verify collision terrain under a custom spider. Designers must review authored placement in the actual game.
- The player immunity window is shared across ceiling spiders; simultaneous overlapping custom encounters still need gameplay balancing.
- Webs and egg traps remain historical singleton modules, preserved rather than migrated; no JSON configurability is claimed for them in S2.
- Existing Rafi RUN prototype art/fallback limitations from S1 remain.
- The S1 builder now uses frozen S1 Stage/Composer/loader/spider inputs. Other historical build/release scripts target earlier contracts; use `build-m477-s2.mjs` for the current game.
