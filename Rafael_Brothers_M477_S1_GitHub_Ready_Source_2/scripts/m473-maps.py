from pathlib import Path
import json,html
R=Path(__file__).resolve().parents[1]
legacy=[s for s in json.loads((R/'evidence/m473-runtime-snapshot.json').read_text())['surfaces'] if s.get('source')=='runtime-legacy' and s.get('role')=='ground']
for version,file in [('before','s01.m472.rollback.json'),('after','s01.stage.json')]:
 s=json.loads((R/'stages'/file).read_text());surfaces=legacy+s['world']['forestExtension']['surfaces'];data={'stageSource':file,'legacyGroundSource':'evidence/m473-runtime-snapshot.json / live Phaser','world':s['world'],'surfaces':surfaces,'objects':s['objects'],'challenges':s.get('challenges',[])}
 (R/f'evidence/m473-map-{version}.json').write_text(json.dumps(data,indent=2)+'\n')
 w=s['world']['width'];parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="430" viewBox="0 0 {w} 810">',f'<rect width="{w}" height="810" fill="#0c1e23"/>',f'<text x="50" y="48" fill="#faf0c8" font-size="32" font-family="sans-serif">M473 {version.upper()} · Stage 01 · Stage JSON + live legacy ground</text>']
 for x in range(0,w,200):parts.append(f'<path d="M{x} 80V700" stroke="#26404a"/><text x="{x+5}" y="100" fill="#87a8ac" font-size="20">{x}</text>')
 for a in surfaces:parts.append(f'<rect x="{a["x"]}" y="{a["y"]}" width="{a["w"]}" height="{a["h"]}" fill="#365f43" stroke="#9aaf76"/>')
 for o in s['objects']:
  x,y=o['position']['x'],o['position']['y'];p=o['properties'];kind=o['prefab'];label=o['id'];color='#c59a60'
  if kind in ['collapsing-platform','rotten-root','root-bridge']:
   color='#7eac75' if p.get('variant')=='stable-log' or kind=='root-bridge' else '#e6a855';z=p['size'];parts.append(f'<rect x="{x}" y="{y}" width="{z["w"]}" height="{z["h"]}" fill="{color}"/>')
  elif kind in ['environmental-anchor','falling-bridge-tree']:parts.append(f'<circle cx="{x}" cy="{y}" r="9" fill="{"#5bdbdf" if p.get("strength")=="stable" else "#da8172"}"/>')
  elif kind=='exit-grove':parts.append(f'<rect x="{x-25}" y="{y-100}" width="50" height="135" fill="none" stroke="#f1df92" stroke-width="5"/>')
  parts.append(f'<text x="{x}" y="{y-16}" fill="{color}" font-size="17" font-family="sans-serif">{html.escape(label)}</text>')
 for c in s.get('challenges',[]):
  x=c['entry']['x'];parts.append(f'<path d="M{x} 690H{c["exit"]["x"]}" stroke="#a6c5dd" stroke-width="5"/><text x="{x}" y="733" fill="#d1e6f3" font-size="24">{c["challengeId"]} · {c["learningRole"]}</text>')
 parts.append('<text x="50" y="790" fill="#ddd4b1" font-size="22">Green: stable / ground · Amber: collapsing surface · Cyan: stable hook · No invented collision terrain</text></svg>')
 (R/f'M473_STAGE_MAP_{version.upper()}.svg').write_text('\n'.join(parts))
