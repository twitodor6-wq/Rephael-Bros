from pathlib import Path
import json, copy, jsonschema
root=Path(__file__).resolve().parents[1]
schema=json.loads((root/'schemas/stage.v1.schema.json').read_text())
validator=jsonschema.Draft202012Validator(schema)
stage=json.loads((root/'stages/s01.stage.json').read_text())
validator.validate(stage)
get=lambda s:next(o for o in s['objects'] if o['prefab']=='sticky-web')['properties']
for mutate in [lambda p:p['size'].update(w=0),lambda p:p.update(extra=1),lambda p:p.update(speedCap=-1),lambda p:p.update(maxTrapSeconds=0),lambda p:p.pop('swingDragPerSecond')]:
    candidate=copy.deepcopy(stage)
    mutate(get(candidate))
    assert not validator.is_valid(candidate),'invalid sticky-web configuration accepted'
old=copy.deepcopy(stage)
old['objects']=[o for o in old['objects'] if o['prefab']!='sticky-web']
validator.validate(old)
print('PASS S3 schema: valid default and zero-web stages; five invalid web cases rejected')
