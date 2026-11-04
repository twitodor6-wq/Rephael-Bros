"""Self-contained source + build + available QA, excluding dependencies and Git internals."""
from pathlib import Path
import subprocess,zipfile,json,hashlib
root=Path(__file__).resolve().parents[1]
try:
 files=set(subprocess.check_output(['git','ls-files','--cached'],cwd=root,stderr=subprocess.DEVNULL).decode().splitlines())
 source_commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root).decode().strip()
except subprocess.CalledProcessError:
 packaged=json.loads((root/'M477_S4_PACKAGE_MANIFEST.json').read_text());files=set(packaged['files']);source_commit=packaged['sourceCommit']
for pattern in ['dist/*M477_S4*','dist/m477-s4-*.json','ci-results/**/*','evidence/m477/**/*','evidence/m477-s2/**/*','evidence/m477-s3/**/*','evidence/m477-s4/**/*']:
 files.update(str(p.relative_to(root)) for p in root.glob(pattern) if p.is_file())
files={f for f in files if (root/f).is_file() and not f.endswith('.zip') and not any(v in Path(f).parts for v in ['node_modules','.git'])}
manifest={f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in sorted(files)}
output=root/'Rafael_Brothers_M477_S4_FULL_SOURCE_QA.zip'
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(files):z.write(root/f,f)
 z.writestr('M477_S4_PACKAGE_MANIFEST.json',json.dumps({'sourceCommit':source_commit,'files':manifest},indent=2)+'\n')
with zipfile.ZipFile(output) as z:assert z.testzip() is None
print(output.name,len(files),'files',output.stat().st_size,'bytes')
