import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {normalizeMatches,parseCSV,summariesFor,record,seasonRecords,playerId} from '../src/engine.mjs';
import {reconcileSources} from '../src/reconcile.mjs';
import {preMatchTop10} from '../src/ranking.mjs';
const players=JSON.parse(readFileSync('data/players.json','utf8'));
const englandYears=JSON.parse(readFileSync('data/all-england-years.json','utf8'));
for(const p of players){if(p.allEngland!==englandYears.years[p.id].length)throw Error('All England count disagrees with sourced edition list: '+p.id);p.allEnglandYears=englandYears.years[p.id];}
const rankings=JSON.parse(readFileSync('data/rankings.json','utf8'));
const historicalEvents=JSON.parse(readFileSync('data/historical-events.json','utf8'));
for(const p of players)p.ranking={...rankings.players[p.id],through:rankings.through,checked:rankings.checked,source:rankings.source};
for(const e of historicalEvents){const p=players.find(p=>p.id===e.player);if(!p.events.some(([date,type])=>date===e.date&&type===e.type))p.events.push([e.date,e.type]);}
// Dated age-series updates are independent of the common 2024 achievement snapshot.
const ageUpdates=JSON.parse(readFileSync('data/age-updates.json','utf8'));
for(const u of ageUpdates)players.find(p=>p.id===u.player).events.push([u.date,u.type]);
const verified=JSON.parse(readFileSync('data/verified-matches.json','utf8'));
const sources=JSON.parse(readFileSync('data/sources.json','utf8'));
const videos=JSON.parse(readFileSync('data/videos.json','utf8'));
mkdirSync('public/data',{recursive:true});
const {matches:curated,audit:curatedAudit}=normalizeMatches(verified);
const retrieval=existsSync('.research/retrieval.json')?JSON.parse(readFileSync('.research/retrieval.json','utf8')):null;
const dataAsOf=retrieval?.retrieved?new Date(new Date(retrieval.retrieved).getTime()+9*3600000).toISOString().slice(0,10):'2026-10-27';
const originalCSV=existsSync('.research/ws.csv')?readFileSync('.research/ws.csv','utf8'):null;
const tiers={WC:'World Championships',OG:'Olympic Games',SS:'World Superseries',SSP:'World Superseries Premier',SSF:'World Superseries Finals',S100:'Super 100',S300:'Super 300',S500:'Super 500',S750:'Super 750',S1000:'Super 1000',WTF:'World Tour Finals',GP:'Grand Prix',GPG:'Grand Prix Gold',IC:'International Challenge',IS:'International Series'};
const researchTournaments=JSON.parse(readFileSync('data/research-tournaments.json','utf8'));
const researchRows=JSON.parse(readFileSync('data/research-matches.json','utf8')).map(r=>{const t=researchTournaments.find(t=>t.tournament_id===r.tournament_id);const n=/^Round ([1-9])$/.exec(r.round);return {...r,raw_round:r.round,round:n&&t?.has_quarterfinal?'R'+2**(t.main_round_count-Number(n[1])+4):r.round,tier:tiers[r.ranking_level]??r.ranking_level};});
const reconciliation=reconcileSources(researchRows,originalCSV?parseCSV(originalCSV).map(r=>({...r,source:'csv'})):[],dataAsOf);
const combined=reconciliation.rows;
const local=normalizeMatches(combined,dataAsOf);
// Raw CSV and normalized bulk match rows deliberately stay out of public/ and dist/.
const summaries=local?summariesFor(local.matches,players):{};
const rankingHistory=JSON.parse(readFileSync('data/ranking-snapshots.json','utf8'));
for(const p of players){const sum=summaries[p.id];sum.opposition=preMatchTop10(local.matches,p.id);for(const key of ['peak','peakSuperseries'])if(sum[key])sum[key].top10=preMatchTop10(local.matches,p.id,{start:sum[key].start+'-01-01',end:sum[key].end+'-12-31'});const values=researchRows.filter(m=>m.p1===p.id||m.p2===p.id).flatMap(m=>{const winner=m.p1===p.id;return [{value:winner?m.winner_elo:m.loser_elo,date:m.date},{value:winner?m.winner_next_elo:m.loser_next_elo,date:m.date}];}).filter(v=>Number.isFinite(v.value));sum.researchElo=values.sort((a,b)=>b.value-a.value)[0]??null;}
const archive={players,sources,verified:curated,summaries,metadata:{checked:'2026-10-27',comparisonEnd:'2024-12-31',curatedAudit,bulkAudit:local?.audit??null,bulkCoverage:local?{start:local.matches[0]?.date,end:local.matches.at(-1)?.date}:null,rawRedistribution:false,summaryScope:'Harvard Dataverse v3·공개 CSV 통합 파생 집계. 통산·전체 국제경기 기록 아님. 자격예선·WO·불완전 점수 제외.'}};
archive.metadata.rechecked='2026-10-29';
archive.historicalEvents=historicalEvents;
archive.rankingMethod=rankings.note;
archive.rankingHistory=rankingHistory;
archive.historicalTourTitles=JSON.parse(readFileSync('data/historical-tour-titles.json','utf8'));
archive.researchProvenance=JSON.parse(readFileSync('data/research-provenance.json','utf8'));
archive.metadata.reconciliation=reconciliation.audit;
// Only An's normalized factual results are included, never the upstream all-player CSV.
const anRows=combined.filter(r=>[r.team1,r.team2].some(n=>playerId(n)==='an'));
const anFacts=normalizeMatches(anRows,dataAsOf,true,true).matches;
archive.matches=normalizeMatches([...anFacts,...verified],dataAsOf,true,true).matches;
if(summaries.an){summaries.an.record=record(archive.matches,'an');summaries.an.seasons=seasonRecords(archive.matches,'an');}
archive.metadata.archiveCoverage={start:archive.matches[0]?.date,end:archive.matches.at(-1)?.date,count:archive.matches.length};
archive.metadata.resultScope='확보한 안세영 경기 결과 전체. 예선·기권 표식 포함. 전체 통산 수집 완료를 의미하지 않음. 미완결 점수는 승률에서 제외.';
archive.rivals=local?[...new Set(local.matches.filter(m=>m.p1==='an'||m.p2==='an').map(m=>m.p1==='an'?m.team2:m.team1))].map(name=>{const rows=local.matches.filter(m=>(m.p1==='an'&&m.team2===name)||(m.p2==='an'&&m.team1===name));return {name,...record(rows,'an')};}).filter(r=>r.n>=3).sort((a,b)=>b.n-a.n):[];
archive.metadata.bulkAsOf=dataAsOf;
archive.videos=videos;
archive.metadata.bulkRetrieved=retrieval?.retrieved??null;
archive.metadata.bulkSha256=originalCSV?createHash('sha256').update(originalCSV).digest('hex'):null;
writeFileSync('public/data/archive.json',JSON.stringify(archive));
writeFileSync('src/archive.json',JSON.stringify(archive));
console.log(JSON.stringify({players:players.length,verified:curated.length,bulkAudit:local?.audit,rawRedistributed:false}));
