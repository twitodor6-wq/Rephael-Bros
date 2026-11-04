# Rafael Brothers M4.7.7-S1 — GitHub-ready source snapshot

This source snapshot was reconstructed from `Rafael_Brothers_M477_S1_FULL_SOURCE_QA.zip` (not from the small partial `ארכיון.zip`).

Contains the current game source, stage JSON, assets, build scripts, schemas, tests, historical immutable QA fixtures needed by the Node test suite, and gameplay baseline.

Does **not** include the original full QA evidence, videos, archive ZIPs, or rollback recovery binaries. Preserve the original 412 MB+ FULL_SOURCE_QA ZIP separately.

## Import

Copy the files and directories into the root of the cloned GitHub repository `twitodor6-wq/Rephael-Bros` without deleting or replacing `README.md` or `CROSS_PROJECT.md`. The original game README is at `docs/M477_S1_ORIGINAL_README.md`.

Only commit after reviewing GitHub Desktop's Changes, especially repository public visibility and the included art. This ZIP makes no changes to GitHub by itself.

## Verification performed for this snapshot

- Node v22.16.0
- `npm run build`: PASS, generated standalone game HTML ~3.19 MB
- `npm test`: PASS, 142/142 Node tests

Browser/Playwright QA for this prepared snapshot was not repeated. Historical full QA proofs live in the original archive.

## Development

```sh
npm install
npm run build
npm test
```

Generated game: `dist/Rafael_Brothers_M477_S1_RAFI_RUN_PROTOTYPE.html`.
M4.7.7-S2 should use a development branch and Pull Request.
