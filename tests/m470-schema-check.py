"""M470 schema: old stage & transition compatibility plus isolated world terrain extension."""
import json,copy
from pathlib import Path
import jsonschema
R=Path(__file__).resolve().parents[1]
for f in ('stage.v1.schema.json','m470-world-fixture.schema.json','transition-experiment.v1.schema.json','stage.v2.contract.DRAFT.json'):
 jsonschema.Draft202012Validator.check_schema(json.loads((R/'schemas'/f).read_text()))
schema=json.loads((R/'schemas/stage.v1.schema.json').read_text());validate=jsonschema.Draft202012Validator(schema)
validate.validate(json.loads((R/'stages/s01.stage.json').read_text()))
fixtureValidate=jsonschema.Draft202012Validator(json.loads((R/'schemas/m470-world-fixture.schema.json').read_text()))
fixtureValidate.validate(json.loads((R/'stages/m470-world-fixture.json').read_text()))
for f in ('transition-experiment-a.json','transition-experiment-b.json'):
 jsonschema.Draft202012Validator(json.loads((R/'schemas/transition-experiment.v1.schema.json').read_text())).validate(json.loads((R/'stages'/f).read_text()))
fixture=json.loads((R/'stages/m470-world-fixture.json').read_text())
for label,mutation in [
 ('missing surfaces',lambda d:d['world']['terrain'].pop('surfaces')),
 ('unknown terrain field',lambda d:d['world']['terrain'].update(hazards=[])),
 ('missing surface width',lambda d:d['world']['terrain']['surfaces'][0].pop('w')),
 ('invalid pit start type',lambda d:d['world']['terrain']['pits'][0].update(start='not-a-number')),
 ('invalid camera bounds shape',lambda d:d['camera'].update(zoom=2))]:
 obj=copy.deepcopy(fixture);mutation(obj)
 assert list(fixtureValidate.iter_errors(obj)),label
print('PASS: Stage01 unchanged, world terrain fixture, transition experiment pair, v2 draft schema syntax and 5 negative schema shapes')
