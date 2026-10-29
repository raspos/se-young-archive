import {mkdirSync,writeFileSync} from 'node:fs';
mkdirSync('.research',{recursive:true});
const url='https://raw.githubusercontent.com/SahilMotyar/bwf-match-data/main/ws.csv';
const r=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw new Error('CSV HTTP '+r.status);const csv=await r.text();if(!csv.startsWith('date,discipline,'))throw new Error('CSV schema changed');writeFileSync('.research/ws.csv',csv);
const readme=await fetch('https://raw.githubusercontent.com/SahilMotyar/bwf-match-data/main/README.md');if(readme.ok)writeFileSync('.research/upstream-README.md',await readme.text());
writeFileSync('.research/retrieval.json',JSON.stringify({url,retrieved:new Date().toISOString(),redistribution:'unconfirmed; raw kept private'}));console.log('원본은 .research/에만 보관합니다. npm run data:build로 파생 집계를 갱신하세요.');
