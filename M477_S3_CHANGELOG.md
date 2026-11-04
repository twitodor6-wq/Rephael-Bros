# M477-S3 Changelog

- Added optional `sticky-web` Stage JSON prefab with strict schema/semantic validation and relative placement.
- Migrated the historical first-platform web at exactly x=86, y=402 with identical size and timing data.
- Extracted M4.4 pure sticky-web state machine, cutting model and Phaser graphics into a Stage-owned multi-instance adapter.
- Added a single Scene Composer-managed collection, owned binding/cleanup and restoration of hammer/respawn chains after enemy teardown.
- Applied overlapping web slowdown and rope dampening once per frame; no rope physics formula was altered.
- Added S3 builder, preserved historical S2 builder inputs, and extended Node/Python/Chromium QA.
