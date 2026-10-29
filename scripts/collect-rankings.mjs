import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseCSV} from '../src/engine.mjs';
import {validateSnapshot} from '../src/ranking.mjs';

// Pinned, attributable MIT dataset. Directory dates are collection dates, not BWF publication dates.
const repository='SanderP99/Badminton-Data';
const commit='054ca53408ac24f88724010f7e75dc0af35ce9b9';
mkdirSync('.research/rankings',{recursive:true});
const cached='.research/ranking-files.json';
let manifest=existsSync(cached)?JSON.parse(readFileSync(cached,'utf8')):null;
if(manifest?.commit!==commit){const r=await fetch(`https://api.github.com/repos/${repository}/git/trees/${commit}?recursive=1`);if(!r.ok)throw Error('Ranking tree HTTP '+r.status);const tree=await r.json();manifest={commit,files:tree.tree.filter(f=>/\/WS_\d{4}-\d{2}-\d{2}$/.test(f.path))};writeFileSync(cached,JSON.stringify(manifest));}
const snapshots=[];let next=0;
async function worker(){for(;;){const i=next++;if(i>=manifest.files.length)return;const f=manifest.files[i],date=f.path.split('/')[1],cache='.research/rankings/'+f.path.split('/').at(-1)+'.csv';let csv;
 if(existsSync(cache))csv=readFileSync(cache,'utf8');else{const r=await fetch(`https://raw.githubusercontent.com/${repository}/${commit}/${f.path}`,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Ranking CSV HTTP '+r.status);csv=await r.text();writeFileSync(cache,csv);}
 const snapshot=validateSnapshot(date,parseCSV(csv,['name','rank','points']));
 snapshots.push({...snapshot,source:'ranking-csv',path:f.path,sha256:createHash('sha256').update(csv).digest('hex')});
}}
await Promise.all([worker(),worker(),worker()]);snapshots.sort((a,b)=>a.date.localeCompare(b.date));
const checkpoints=JSON.parse(readFileSync('data/ranking-checkpoints.json','utf8'));
const observations=new Map();
for(const m of JSON.parse(readFileSync('data/research-matches.json','utf8')).filter(m=>m.p1==='an'||m.p2==='an')){const rank=m.p1==='an'?m.winner_rank:m.loser_rank;if(!Number.isInteger(rank)||rank<1)continue;const key=m.date+'|'+rank;observations.set(key,{date:m.date,rank,kind:'match',source:'harvard',label:m.tournament+' · 경기 전',basis:'연구 원자료의 경기 전 BWF 순위 · 경기일을 표시하며 공식 발표일은 아님',sourceRow:m.source_row});}
const points=[...snapshots.map(s=>({date:s.date,...s.an,kind:'snapshot',source:s.source,label:'수집표 확인',basis:'저장소 폴더의 수집일 기준 · 공식 발표일과 다를 수 있음',path:s.path})),...observations.values(),...checkpoints].sort((a,b)=>a.date.localeCompare(b.date)||a.kind.localeCompare(b.kind));
const result={checked:'2026-10-29',repository,commit,snapshots,points,note:'실선은 15일 이내 연속 수집표, 점선은 30일 이내 경기 전 관측값을 잇는 안내선. 연말·이정표는 독립 점. 빈 구간의 주별 순위를 생성하지 않음.'};
writeFileSync('data/ranking-snapshots.json',JSON.stringify(result));
mkdirSync('public/data',{recursive:true});writeFileSync('public/data/ranking-history.json',JSON.stringify(result));
console.log(JSON.stringify({snapshots:snapshots.length,points:points.length,start:points[0].date,end:points.at(-1).date,repository,commit}));
