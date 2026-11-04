# M475 architecture delta

No engine/camera/physics rewrite. Extract the existing inlined forest sidecar into maintained src/forest-parallax.mjs, replacing its exact named script once at build time. Forest is the exclusive writer of its three X transforms. Stage backgrounds config feeds factors and local response metadata; additive runtime/schema validation prevents invalid new configurations while preserving old Stage compatibility.

Web response no longer reads or writes background sprites; it draws world-space anchor-local cosmetic strands and owns only their bounded spring state. Existing composer registration/order and shutdown semantics are preserved. Existing sticky web, enemies, tools, anchors, bridges, terrain, eastern challenges and gate are unchanged.

Telemetry sampler gains read-only camera/parallax/web snapshots. Applied-camera versus observed-camera separation exposes native render-follow frame order. Full bundled Game Core comparison permits only product caption substitution. The immutable baseline and retained historical sidecars provide byte-level regressions.
