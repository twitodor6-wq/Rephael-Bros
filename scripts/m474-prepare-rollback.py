from pathlib import Path
import zipfile,json,hashlib,sys
root=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2:raise SystemExit('usage: m474-prepare-rollback.py /original/M473.zip')
archive=Path(sys.argv[1]).resolve();sha=lambda b:hashlib.sha256(b).hexdigest();inventory={};changed=[]
with zipfile.ZipFile(archive) as source, zipfile.ZipFile(root/'rollback/M473_RESTORE_BYTES.zip','w',zipfile.ZIP_DEFLATED,compresslevel=6) as dest:
 for name in sorted(source.namelist()):
  if name.endswith('/'):continue
  rel=name.split('/',1)[1];data=source.read(name);inventory[rel]=sha(data);now=root/rel
  if not now.is_file() or sha(now.read_bytes())!=inventory[rel]:dest.writestr(rel,data);changed.append(rel)
(root/'rollback/M473_SOURCE_INVENTORY.json').write_text(json.dumps({'baseline':'M4.7.3 supplied archive','archiveSha256':sha(archive.read_bytes()),'files':inventory,'restoredOriginalPaths':changed},indent=2)+'\n')
print('Rollback prepared:',len(inventory),'original files;',len(changed),'changed-byte entries')
