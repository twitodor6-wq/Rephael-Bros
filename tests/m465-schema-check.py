"""Optional formal JSON Schema (Draft 2020-12) validation, complementing JS semantic checks."""
import json,copy
from pathlib import Path
from jsonschema import Draft202012Validator
r=Path(__file__).resolve().parents[1]
schema=json.loads((r/'schemas/stage.v1.schema.json').read_text())
stage=json.loads((r/'stages/s01.stage.json').read_text())
Draft202012Validator.check_schema(schema)
v=Draft202012Validator(schema)
assert v.is_valid(stage)
bad=copy.deepcopy(stage);bad['objects'][0]['prefab']='unknown';assert not v.is_valid(bad)
bad=copy.deepcopy(stage);bad['schemaVersion']='2.0';assert not v.is_valid(bad)
bad=copy.deepcopy(stage);bad['objects'][0]['position']['x']='bad';assert not v.is_valid(bad)
print('PASS Draft 2020-12 schema + valid Stage 01 + 3 rejection cases')
