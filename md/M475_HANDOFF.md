# M4.7.5 — Camera & Parallax Stability

Start with README_START_HERE_M475.md and M475_QA_REPORT.md. Baseline is the previously delivered, independently verified M474 source ZIP (SHA c8cbdf87fed2b4f5e31cd366cbb675c71939cb9721daead1c6fc70f9ede55428). It passed its release gate and122 Node tests before edits. Original input archive remains untouched.

## Root cause and change
The old `forestOffsets` used actor progress ×.58 whenever abs(cameraX)<=.5, then switched to raw camera scroll. A swing with camera0 moved near art by .4988px per actor pixel. Crossing the threshold could jump sources. `web-response` then rewrote mid/near sprite X with attachment-dependent, frame-based filtering, so two actors owned the same transforms.

`src/forest-parallax.mjs` now solely owns the three decorative layers, in screen space, with offsetX=-appliedCamera.scrollX*factor. Factors .04/.09/.16 are authored in Stage backgrounds.layers and validated. Direct camera transform has no secondary integration, player fallback or attachment-dependent filter. Existing layer opacity, art assets and depths are unchanged. Depth OFF hides the optional layers and places their offsets at0; re-enable uses the current camera immediately, without catching up an accumulator. Art OFF is respected; concept art retains core .88 when Art ON/Depth OFF and .69 in the depth composite.

`src/web-response.mjs` owns only three small cosmetic strands around the existing514,290 grip. The strands respond only while that grip is attached and geometrically loaded; deflection is bounded3.5px with a seconds-based analytic critically damped response, no background writes. OFF clears their cosmetic state immediately. The existing sticky web actor, spider, egg sac and gameplay interactions are untouched. Ambient wind filaments/spores remain independent, time-based decoration; they do not read actor/tape state.

## Source and build boundaries
Stage JSON remains the authoring source. Optional additive backgrounds.motionSource/smoothing/webResponse fields are backward compatible with legacy Stage input. Runtime and JSON schema reject invalid new inputs. `build-m475.mjs` replaces only the named rb-m46-0 art sidecar, adds three read-only fields to the existing telemetry sampler, and composes the existing modules. The immutable baseline file is unchanged. The complete bundled Game Core script equals M474 byte-for-byte except its literal milestone caption; player/tape/camera formulas are identical. No new textures, enemies, stages or architectural migration.

Per-frame exported samples add camera.scrollX/scrollY, parallax (applied camera, factors, offsets, effective sprite positions, source, phase, enabled state) and webResponse (local loaded/deflection/source). The engine updates camera follow during render, after Scene postupdate; therefore sample.camera is the observed camera at sample time, while sample.parallax.camera is the exact camera used for that layer transform. Both are intentionally retained. This makes frame order visible rather than falsely matching snapshots from different phases. Sampler's historical version captions remain historical; release identity is M4.7.5.

## QA and continuation
Run npm run build, npm test, npm run qa:all. Set CHROMIUM_PATH to a Chromium binary, Playwright runtime/module and Python jsonschema where necessary. QA scripts use Chromium Canvas for reliable software capture; WebGL was initially smoke-tested, but capture stalled and is not claimed as full WebGL certification. Real keyboard witnesses use disclosed legal partial starts after real tool pickup. Read the QA report for exact final counts and video limits. No human approval or unassisted full-stage pass is claimed.

Use the new rollback-to-m474.py into a NEW directory; it reconstructs original inventory/hashes, not a mixed tree. Older M473 rollback remains historical. Continue human swing/readability evaluation next. Do not interpret automated visual stability as human comfort acceptance.
