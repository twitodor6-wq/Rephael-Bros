#!/usr/bin/env python3
"""Exact supplied M475 file bytes into a NEW destination only; no current-tree overwrite."""
from pathlib import Path
import json,sys,zipfile,hashlib
root=Path(__file__).resolve().parents[1];dest=Path(sys.argv[1]).resolve()
if dest.exists():raise SystemExit('Refusing existing destination')
meta=json.loads((root/'rollback/M475_SOURCE_INVENTORY.json').read_text())
with zipfile.ZipFile(root/'rollback/M475_RESTORE_BYTES.zip') as z:
    names=set(z.namelist());dest.mkdir(parents=True)
    for rel,sha in meta['files'].items():
        if Path(rel).is_absolute() or '..' in Path(rel).parts:raise SystemExit('Unsafe inventory entry')
        data=z.read(rel) if rel in names else (root/rel).read_bytes()
        if hashlib.sha256(data).hexdigest()!=sha:raise SystemExit('Hash mismatch: '+rel)
        out=dest/rel;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(data)
print('M475 exact rollback PASS:',len(meta['files']),'original files')
