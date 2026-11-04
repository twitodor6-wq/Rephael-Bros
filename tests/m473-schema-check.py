from pathlib import Path
import json, jsonschema
R=Path(__file__).resolve().parents[1]
schema=json.loads((R/'schemas/stage.v1.schema.json').read_text())
v=jsonschema.Draft202012Validator(schema)
for file in ['stages/s01.stage.json','stages/s01.m472.rollback.json']:
 v.validate(json.loads((R/file).read_text()));print('PASS JSON schema',file)
s=json.loads((R/'stages/s01.stage.json').read_text());next(o for o in s['objects'] if o['prefab']=='collapsing-platform')['properties']['warningMs']=-1
assert not v.is_valid(s),'negative timer accepted'
print('PASS negative timer schema check')
