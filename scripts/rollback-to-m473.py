"""Reconstruct the exact supplied M473 tree in a NEW destination, without deleting current work."""
from pathlib import Path
import json,zipfile,hashlib,sys,shutil
source=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2:raise SystemExit('usage: python3 scripts/rollback-to-m473.py /new/destination')
dest=Path(sys.argv[1]).resolve()
if dest.exists():raise SystemExit('Destination must not exist; current project will not be overwritten')
manifest=json.loads((source/'rollback/M473_SOURCE_INVENTORY.json').read_text());dest.mkdir(parents=True)
with zipfile.ZipFile(source/'rollback/M473_RESTORE_BYTES.zip') as old:
 names=set(old.namelist())
 for rel,expected in manifest['files'].items():
  out=dest/rel;out.parent.mkdir(parents=True,exist_ok=True)
  if rel in names:out.write_bytes(old.read(rel))
  else:shutil.copy2(source/rel,out)
  if hashlib.sha256(out.read_bytes()).hexdigest()!=expected:raise SystemExit('Mismatch '+rel)
print('Exact M473 rollback verified:',len(manifest['files']),'files at',dest)
