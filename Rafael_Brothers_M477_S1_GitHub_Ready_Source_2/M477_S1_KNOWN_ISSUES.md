# M477-S1 known issues

- PROTOTYPE ONLY. Alpha was heuristically extracted from lossy H264. Pale fringe, compression artifacts, imperfect body/pivot motion and limited pose consistency remain. No Production Ready claim.
- Per-frame foot pivots compensate source bounding-box drift; faint alpha can extend1–2 source pixels below that bound (under .46 display pixels). The pixel data were not altered.
- RUN and original placeholder art differ in style and silhouette. Fallback transitions are deliberate and abrupt. Only RUN exists; no fabricated idle/jump/tool/Shaul animation.
- Visible feet can slide relative to ground: the .9s source loop is independent of acceleration. Direction reversals use original view until input and velocity agree. A future clean source animation should provide stable foot pivots and speed calibration.
- Browser automation is not human play or human visual approval. Safari and full-stage WebGL are NOT PROVEN. New M477 evidence includes partial actual-key crossings, not six new Spawn→Exit runs.
- Existing M476 gameplay limitations remain documented in M476_KNOWN_ISSUES.md. Camera, parallax, rope, tools and encounter geometry were not changed.
