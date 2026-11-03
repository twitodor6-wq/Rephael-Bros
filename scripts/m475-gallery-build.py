#!/usr/bin/env python3
from pathlib import Path
import base64,re,subprocess
root=Path(__file__).resolve().parents[1]
p=root/'M475_VIDEO_COMPARISON.html';html=p.read_text()
clips=['M474_ON_FIXED_SWING','M475_ON_FIXED_SWING','M475_OFF_FIXED_SWING','M474_ON_SCROLL_SWING','M475_ON_SCROLL_SWING','M475_OFF_SCROLL_SWING']
replacements=[]
for name in clips:
    src=root/'evidence'/f'{name}.mp4';out=src.with_suffix('.webm')
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(src),'-c:v','libvpx','-deadline','realtime','-cpu-used','8','-b:v','1000k','-an',str(out)],check=True)
    replacements.append('data:video/webm;base64,'+base64.b64encode(out.read_bytes()).decode())
items=iter(replacements)
html=re.sub(r'data:video/(?:mp4|webm);base64,[A-Za-z0-9+/=]+',lambda m:next(items),html)
p.write_text(html)
