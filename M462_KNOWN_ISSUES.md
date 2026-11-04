# M4.6.2 KNOWN ISSUES

1. **Prototype scope only** — the environmental-anchor logic is currently hard-coded for one rotten-root encounter. It is not yet a reusable authored system.
2. **Procedural audio is best-effort** — browsers may suppress or delay WebAudio until user interaction, and sound mix is intentionally lightweight.
3. **Headless hook-key focus** — in automated browser QA, direct keyboard `E` input did not always attach the tape in headless mode even when preview was ready. The runtime hook logic itself works, and QA uses `scene.tape.toggle()` for deterministic validation.
4. **Visual art remains provisional** — the rotten root is drawn procedurally to match the prototype stage rather than using a final approved sprite or tileset.
5. **Collapse outcomes are limited** — the current encounter only supports warn → collapse → fallen-floor state. It does not yet support branching outcomes such as “falls into a full bridge” or “breaks into a hazard”.
