# Challenge Composer contract — draft for M4.7.4

Status: version1.0.0 data contract, manual composition only. No generator is shipped.

A Stage v1 challenge record contains:
- `challengeId`, `schemaVersion:"1.0.0"`, `requiredSkills:string[]`.
- `learningRole:teach|practice|combine|mastery`, `difficulty:1..5`.
- `instances:string[]` referencing Stage prefab IDs; geometry lives only in objects/surfaces.
- `entry` and `exit`: in-world feet positions used for proposal boundaries and legal QA starts.
- `solutions:string[]`, `recovery` (surface/return instance or stable rescue anchor refs).
- `warningTiming`: instance configuration provenance; no duplicated countdown constants.
- `dynamicStateAssumptions`, `qaEvidence` with status and evidence path; optional visible `label`.

Runtime uses instances and recovery return policy; compiler validates IDs, bounded endpoints and required fields. JSON schema describes the records. Text solutions/skills do not become physics proofs. Anchors and all collider footprints belong to Stage objects.

## M474 one-way adapter
Forge proposal → reviewed Stage JSON draft → Stage schema/compiler → crossing safety validator → Phaser keyboard evidence → human acceptance. Keep Forge independent, with no Phaser imports in Forge or Forge simulation in Game Core.

Installed capability checked: Platformer Challenge Forge0.2.1 skill is a proposal tool with unverified historical physics profile and no proven universal grapple witness. No M3 source-adapter capability was assumed or plugin upgraded.

Future work: versioned profile export from actual live hitboxes; recovery links and solution schemas; multiple candidate layouts; timing budgets and route witnesses; human difficulty calibration. Never let generation move approved hooks or modify tape formulas to make a candidate pass.
