import json,copy
from pathlib import Path
import jsonschema
R=Path(__file__).resolve().parents[1]
for f in ['stage.v1.schema.json','transition-experiment.v1.schema.json','stage.v2.contract.DRAFT.json']:jsonschema.Draft202012Validator.check_schema(json.loads((R/'schemas'/f).read_text()))
for schema,files in [('stage.v1.schema.json',['s01.stage.json']),('transition-experiment.v1.schema.json',['transition-experiment-a.json','transition-experiment-b.json'])]:
 v=jsonschema.Draft202012Validator(json.loads((R/'schemas'/schema).read_text()))
 for f in files:v.validate(json.loads((R/'stages'/f).read_text()))
v=jsonschema.Draft202012Validator(json.loads((R/'schemas/stage.v1.schema.json').read_text()));s=json.loads((R/'stages/s01.stage.json').read_text());s['camera']={'bounds':{'x':12,'y':0,'width':940,'height':660}};v.validate(s)
for bad in [None,{'bounds':{'x':0,'y':0,'width':0,'height':1}},{'bounds':{'x':0,'y':0,'width':1,'height':1},'zoom':2}]:
 s['camera']=bad;assert list(v.iter_errors(s))
print('PASS three schema documents, Stage01, two experiment fixtures, optional camera and three invalid camera shapes; v2 remains DESIGN ONLY')
