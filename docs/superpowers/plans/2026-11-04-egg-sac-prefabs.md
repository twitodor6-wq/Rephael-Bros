# M477-S4 implementation plan

Baseline: S3 `5c3cf7566f876a67aaae81491bc0eef34d057f6b`, PR #6 open/unmerged. S4 branch stacks on S3, no merge.

Architecture: extract the exact legacy pure egg simulation and graphics into a reusable module; Stage registry compiles relative position, ground and roaming geometry. A Composer-managed actor uses the existing Enemy Prefab Collection and resource lifecycle to own per-sac actors, shared egg damage immunity, bindings and one hammer/respawn/update hook chain. Preserve S2 and S3 sources unchanged. No new physics engine or Game Core edit.

- [x] Verify PR state, S3 CI success, baseline build and 166 Node tests.
- [ ] Add failing configuration/parity/lifecycle tests, extend Stage loader/schema and author exact Stage 01 original.
- [ ] Extract pure logic/rendering and add managed egg collection; test zero/one/many, independent children, damage immunity, tools, OFF, rollback and teardown.
- [ ] Preserve historical S3 builder with frozen inputs; build S4 standalone and run Node/schema tests.
- [ ] Add real Chromium fixtures for both actors, 5 restarts, shutdown and multi-egg/contact/tool integration; retain S2/S3/rope-mode regressions.
- [ ] Extend existing Actions, package self-contained source/QA ZIP, push, open stacked draft PR and inspect real CI; fix/retest failures.
- [ ] Record final evidence, limitations and review; no merge.
