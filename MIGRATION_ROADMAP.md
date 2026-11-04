# מסלול המיגרציה — M4.6.9

- M465–M466: Stage JSON, רישום Prefabs, עצים ושער בנתונים.
- M467: שורש הרכבה יחיד לשבעת רכיבי הצד.
- M468: Scope משאבים משותף ו־Managed Actor ל־Dressing ולגשר.
- M469: Managed Environmental Anchors, בקר מעברים מבודד שהוכח מול כשל ו־rollback, ו־camera.bounds אופציונלי עם צריכה בזמן ריצה.
- M470 מוצע: בעלות רכיבי אתגר ותשתית עולם/Session/נכסים בייצור, לפני Stage02. ראה M470_PLAN.md.
- מאוחר יותר: הרחבת תוכן, אנימציות ונכסים ומתאם Forge; Forge נשאר עצמאי.

אין כעת מעבר ייצור כללי בין שלבים ואין שינוי פיזיקה.

## M4.7.0 checkpoint — 2026-10-29

**Implemented:** managed rotten-root + falling-bridge-tree; `world.terrain` optional Stage v1 extension, isolated Phaser fixture with world spawn/finish/camera, 16 cleanup cycles; no Stage01 replacement. Verified core baseline unchanged by hashes. M469 production transition remains deferred.

**Next M4.7.1 — content-first:** extend root forest traversal, place the collapsing tree over the pit based on linked JSON offsets, and create an editable challenge sequence. Each change must preserve existing rope timing and actual browser traversability, verify disable/reset/restart, and keep the former Stage01 configuration available for rollback. Keep Challenge Forge a standalone proposal/testing tool; do not import it as the Phaser physics engine.


## M4.7.1 — Production content return (29.10.2026)

- QUALIFIED: extended Stage01 with authored `world.forestExtension`, new east-bank root gap, relocated grove gate and an unchanged rope physics baseline.
- Actual 80px gap keyboard jump, main pit Manual/Classic/Hybrid swing, controlled gate arrival, and live tree collapse pass in Chromium.
- Preserve M470 production geometry and Stage JSON rollback; M470 `world.terrain` remains fixture-only.
- Next M4.7.2: human full-run + Hybrid timing/renderer investigation, stage art readability/pacing and partial-recreate robustness if actually required. Do NOT jump directly to Stage02 production migration.
