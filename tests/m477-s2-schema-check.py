from pathlib import Path
import copy, json, jsonschema
root = Path(__file__).resolve().parents[1]
validator = jsonschema.Draft202012Validator(json.loads((root/'schemas/stage.v1.schema.json').read_text()))
stage = json.loads((root/'stages/s01.stage.json').read_text())
validator.validate(stage)
for mutate in [lambda p: p.update(warnSeconds=0), lambda p:p.update(extra=1), lambda p:p['body'].update(w=-1), lambda p:p.pop('knock')]:
    data=copy.deepcopy(stage)
    mutate(next(o for o in data['objects'] if o['prefab']=='ceiling-spider')['properties'])
    assert not validator.is_valid(data)
print('PASS S2 schema: current stage and four malformed enemy cases')
