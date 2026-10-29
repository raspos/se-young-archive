import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {cleanName,ALIASES,parseCSV} from '../src/engine.mjs';
const players=JSON.parse(readFileSync('data/research-players.json','utf8'));
const fingerprint=s=>cleanName(s).split(' ').sort().join(' ');
const groups=new Map();for(const p of players){const f=fingerprint(p.name);if(!groups.has(f))groups.set(f,[]);groups.get(f).push(p);}
const compact=new Map();for(const p of players){const t=cleanName(p.name).split(' ');for(let i=0;i<t.length;i++){const k=[...t.slice(i),...t.slice(0,i)].join('');if(!compact.has(k))compact.set(k,new Map());compact.get(k).set(p.player_id,p);}}
const names=[...players.map(p=>p.name),...(existsSync('.research/ws.csv')?parseCSV(readFileSync('.research/ws.csv','utf8')).flatMap(r=>[r.team1,r.team2]):[])];
const aliases={};let ambiguous=0;for(const name of new Set(names)){const exact=groups.get(fingerprint(name));const found=exact??[...(compact.get(cleanName(name).replaceAll(' ',''))?.values()??[])];if(!found.length)continue;if(found.length!==1){ambiguous++;continue;}const p=found[0];aliases[cleanName(name)]=ALIASES[cleanName(p.name)]??p.canonical_key;}
writeFileSync('src/player-aliases.mjs','// Generated from unique research player identities; ambiguous full-name token sets are not joined.\nexport default '+JSON.stringify(aliases)+';\n');
console.log(JSON.stringify({aliases:Object.keys(aliases).length,ambiguousNames:ambiguous,source:'Harvard player IDs + unique complete-name token sets'}));
