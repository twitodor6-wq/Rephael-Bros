"""Run ONLY in a disposable extracted M477 source copy. Restores exact M476 inventory."""
from pathlib import Path
import json,zipfile,hashlib
root=Path(__file__).resolve().parent.parent
manifest=json.loads((root/'rollback-m477-to-m476.json').read_text())
with zipfile.ZipFile(root/'rollback-m477-to-m476.zip') as z: originals={n:z.read(n) for n in z.namelist()}
for name in manifest['added']:
 p=root/name
 if p.is_file():p.unlink()
for name,data in originals.items():
 p=root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
errors=[name for name,digest in manifest['baselineFiles'].items() if not (root/name).is_file() or hashlib.sha256((root/name).read_bytes()).hexdigest()!=digest]
if errors:raise SystemExit('Rollback mismatch: '+repr(errors))
print('PASS exact M476 original file inventory restored:',len(manifest['baselineFiles']))
