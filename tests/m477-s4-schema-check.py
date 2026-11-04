from pathlib import Path
import copy,json,jsonschema
root=Path(__file__).resolve().parents[1]
v=jsonschema.Draft202012Validator(json.loads((root/'schemas/stage.v1.schema.json').read_text()))
s=json.loads((root/'stages/s01.stage.json').read_text())
v.validate(s)
for mutate in [lambda p:p.update(count=0),lambda p:p.update(count=33),lambda p:p.update(count=1.5),lambda p:p.update(gravity=-1),lambda p:p.update(extra=1),lambda p:p.pop('bumpY'),lambda p:p['roamOffset'].update(extra=1)]:
 data=copy.deepcopy(s);mutate(next(o for o in data['objects'] if o['prefab']=='egg-sac')['properties']);assert not v.is_valid(data)
for file in ['stages/s01.m477-s3.rollback.json','stages/s01.m477-s2.rollback.json']:
 v.validate(json.loads((root/file).read_text()))
print('PASS S4 schema, 7 invalid egg configs, S3/S2 backwards compatibility')
