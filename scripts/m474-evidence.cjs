const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
function inputs(){const files=['baseline/M46_RELEASE.html','build-m474.mjs','stages/s01.stage.json'];for(const dir of ['src','schemas']){const scan=d=>{for(const e of fs.readdirSync(path.join(root,d),{withFileTypes:true})){const p=d+'/'+e.name;if(e.isDirectory())scan(p);else files.push(p)}};scan(dir)}return Object.fromEntries(files.sort().map(p=>[p,hash(fs.readFileSync(path.join(root,p)))]))}
function fingerprint(){return hash(JSON.stringify(inputs()))}module.exports={inputs,fingerprint,hash};
