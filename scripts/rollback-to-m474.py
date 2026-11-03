#!/usr/bin/env python3
"""Reconstruct exact original M474 inventory into a NEW destination only."""
import sys,json,hashlib,zipfile,shutil
from pathlib import Path
root=Path(__file__).resolve().parents[1]
dest=Path(sys.argv[1]).resolve()
if dest.exists():raise SystemExit('Refusing existing destination')
meta=json.loads((root/'rollback/M474_SOURCE_INVENTORY.json').read_text())
with zipfile.ZipFile(root/'rollback/M474_RESTORE_BYTES.zip') as delta:
    names=set(delta.namelist())
    dest.mkdir(parents=True)
    for rel,digest in meta['files'].items():
        target=dest/rel;target.parent.mkdir(parents=True,exist_ok=True)
        data=delta.read(rel) if rel in names else (root/rel).read_bytes()
        if hashlib.sha256(data).hexdigest()!=digest:raise SystemExit('Source hash mismatch: '+rel)
        target.write_bytes(data)
print('M474 exact rollback PASS:',len(meta['files']),'files')
