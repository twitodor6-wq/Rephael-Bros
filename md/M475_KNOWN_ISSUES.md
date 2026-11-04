# M4.7.5 — Known issues and evidence boundaries

- Human comfort/readability acceptance, Safari/iOS, mobile/gamepad, long-session heap profiling and an unassisted full-stage playthrough are NOT TESTED.
- Chromium real-keyboard witnesses use disclosed legal partial-stage starts; they are neither human tests nor exhaustive trajectory proofs. All three original swing modes and both characters remain covered.
- Before/after live videos use the same scripted actions, viewport and initial camera conditions, but are separate real-time executions, not frame-identical replays. Captured screenshots are encoded at30fps with original wall-time intervals; source capture is lower rate, so duplicated frames are expected. Video is diagnostic, not a high-frame-rate animation benchmark. Telemetry supplies the exact transform evidence.
- Full final capture/test matrix uses the game's existing Chromium Canvas fallback. A WebGL smoke test loaded all layers and passed live safety; WebGL capture stalled in the software host. Browser/GPU parity is not certified.
- Current camera follow and its smoothing/deadzone are unchanged. Background transforms sample Scene postupdate; native camera follow completes during render. Telemetry reports observed camera and applied camera separately to identify that phase difference.
- Ambient decorative filaments/spores still have their existing independent slow wind animation. Only camera motion drives forest parallax; only local attachment/load drives the small anchor-response strands. This pass does not freeze unrelated ambient animation.
- The marked-grip response remains a small cosmetic load proxy derived from geometry/velocity; it is not a physical web solver or a force measurement. The sticky gameplay web is a separate unchanged actor.
- Legacy hollow ledge remains deliberately parked OFF as in M474. Existing M474 visual/encounter constraints and normal-jump audit limits remain applicable.
- The unrelated attached M07 Markdown was a SpaceAces77 guide and was excluded from Rafael requirements. Supplied1800-sample telemetry has no camera/layer fields, so old camera motion cannot be recovered as an exact measurement from it.
