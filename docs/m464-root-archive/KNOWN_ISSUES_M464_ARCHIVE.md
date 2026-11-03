# Rafael Brothers — M4.6.3 Known Issues

1. Added anchor registry is reusable, but **fragile actor collision geometry is still defined in code**. JSON metadata does not yet create arbitrary new breakable structures.
2. Falling-tree fragment is intentionally **off by default**, so the existing main-pit challenge remains unchanged unless testing the variant.
3. Tree and bridge drawings remain **procedural placeholders**; approved final sprites, terrain textures, and matching audio assets are pending.
4. Crack/break sounds are synthesized with WebAudio and may require browser user interaction/unmuting to be audible.
5. Headless automated hook tests use `scene.tape.toggle()` after a controlled fixture because direct `E` key focus was inconsistent in this test harness. Steering and collision use live Phaser physics; no manual end-to-end human Safari QA is claimed.
6. The environment still carries older project backlog items: possible rope shortening perception on 360° swings, performance constraints under software rendering, and final art/sprite animation work.
7. The final partial bridge is short (x346..512); it is not intended to connect the full pit x370..706.
