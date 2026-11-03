# M4.7.1.1 — User Bug Diagnosis / Hotfix QA

## User-observed issue

At the second gap, when hanging against the east-bank side wall and pressing ArrowUp to shorten the tape, it immediately releases and the player falls to respawn. In the first pit, ArrowUp shortens the tape without an involuntary release.

## Evidence from two real telemetry exports (29 Oct 2026)

- `03:24:10` export: at tMono 154811.3, ArrowUp keydown; tMono 154829.1 tape attachment becomes released at x1256,y546.894, **17.8ms later**, without any E keydown. Before release, the active anchor was (1275,260), length=255.209; player body center was (1256.029,514.503) with `blocked.right=true`. Respawn follows at tMono 155313.6.
- `03:22:50` export: same new gap also released at x1256,y571.667 while the character approached the right wall, with no ArrowUp/E at that instant. This indicates a geometry/collision issue, not a key mapping bug.
- First pit in these exports supports ArrowUp reeling without automatic release; intentional E release is logged later.
- Note: export metadata still labels gameVersion M4.1.3, apparently an inherited telemetry version string. Geometry, level width and stage behavior correspond to M4.7.1. This label alone is **not** treated as proof of executing old gameplay code.

## Root cause confirmed with controlled Chromium reproduction

In unmodified M4.7.1, attach to the new anchor at (1275,260) at body center (1256,514.5) while touching the x1270 right-bank ground wall. `NinjaTape.update` shortens the length when ArrowUp is held. The radial correction toward the anchor has a positive X component and would move the 28px-wide player body into the bank. `canOccupy` rejects that swept correction, so the existing safety path releases the tape. Runtime diagnostic toast captured: **`Tape blocked by roots — released safely`**. This is *not* the E-key detach path, and is not a defective up-key mapping.

## Minimal fix

Move only the `stable-root-extension` Stage JSON `position.x` from 1275 to **1230**. It is now centered between the x1190 and x1270 ground faces (the actual second gap is 80px wide). The correction from either wall moves inward toward free space rather than deeper into the wall. Anchor ID, order, y=260, tape mechanics, player, colliders and exit are unchanged.

## Retest results

- Baseline reproduction via actual Chromium: first pit stayed attached and shortened; second pit (original x1275 anchor) **FAILED** (detached), confirming the report. Diagnostic toast confirmed collision-sweep rejection.
- Patched original scenario at x1256,y546.5 with ArrowUp: **PASS**, stayed attached and shortened.
- `tests/m471-rope-gap-regression-browser.py`: **10/10 PASS**, 3 modes (Manual, Classic, Hybrid) × 3 gap positions (x1204,1230,1256) with real keyboard ArrowUp, all stayed attached and shortened; plus no page errors. Note: each case begins in a **controlled attached state**, not unassisted walking/swinging.
- `npm test`: **94/94 PASS** (93 existing checks plus 1 new geometry guard; updated one intentionally outdated position assertion).
- `npm run build`: PASS.
- `tests/m471-new-gap-browser.py`: 2/2 PASS, live arrow+space jump crosses new gap.
- `tests/m471-browser-smoke.py`: 14/14 PASS (extension, camera, gate, characters, F3, restart).
- `tests/m471-lifecycle-browser.py`: **8/8 PASS**, 15 disable/reset and 15 restart cycles, stable resources and cleanup.

## Scope and limitations

This is a localized stage-layout hotfix, not a redesign of general tape collisions. Human feeling, Safari/iOS and every possible tape angle are **NOT TESTED**. Historic intermittent Hybrid normal-render report remains open, although focused Hybrid reeling checks passed. Full unassisted playthrough is **NOT TESTED**. No historical QA evidence has been discarded or reclassified.
