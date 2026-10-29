import {isWin,playerId} from './engine.mjs';

const DAY=86400000;
export function preMatchTop10(matches,id,scope={start:'2018-01-01',end:'2024-12-31'}){
 const tier=scope.end<'2018-01-01'?/World Superseries|World Championships|Olympic|Grade 1/i:/Super (300|500|750|1000)|World Tour Finals|World Championships|Olympic|Grade 1/i;
 const rows=matches.filter(m=>m.status==='completed'&&(m.p1===id||m.p2===id)&&m.date>=scope.start&&m.date<=scope.end&&tier.test(m.tier));
 let covered=0,wins=0,losses=0;const evidence=[];
 for(const m of rows){const rank=isWin(m,id)?m.loser_rank:m.winner_rank;if(!Number.isInteger(rank)||rank<1)continue;covered++;if(rank>10)continue;const win=isWin(m,id);if(win)wins++;else losses++;evidence.push({date:m.date,opponent:m.p1===id?m.p2:m.p1,rank,win,key:m.key});}
 const n=wins+losses,coverage=rows.length?covered/rows.length:null,eligible=rows.length>=20&&n>=10&&coverage>=.9;
 return {scope,n,wins,losses,rate:n?wins/n:null,matches:rows.length,covered,coverage,eligible,scoreRate:eligible?wins/n:null,evidence,method:'연구 원자료의 경기 전 상대 BWF 랭킹. 관측 수집표로 대체하지 않음. 점수 적격: 완료20경기·Top10상대10경기·랭킹확보율90% 이상.'};
}
export function validateSnapshot(date,rows){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date).toISOString().slice(0,10)!==date)throw Error('Invalid ranking date');
 const ten=rows.filter(r=>+r.rank>=1&&+r.rank<=10).map(r=>({id:playerId(r.name),name:r.name,rank:+r.rank,points:+r.points})).sort((a,b)=>a.rank-b.rank);
 if(ten.length!==10||new Set(ten.map(r=>r.id)).size!==10||ten.some((r,i)=>r.rank!==i+1||!Number.isFinite(r.points)))throw Error('Incomplete or duplicated Top 10 snapshot: '+date);
 const an=rows.find(r=>playerId(r.name)==='an');if(!an||!Number.isInteger(+an.rank)||+an.rank<1)throw Error('An ranking missing: '+date);
 return {date,an:{rank:+an.rank,points:+an.points},top10:ten};
}
export function rankingSegments(points,maxGapDays=15){
 const groups=[];for(const p of [...points].sort((a,b)=>a.date.localeCompare(b.date))){const last=groups.at(-1);if(!last||p.kind!=='snapshot'||last.at(-1).kind!=='snapshot'||Date.parse(p.date)-Date.parse(last.at(-1).date)>maxGapDays*DAY)groups.push([p]);else last.push(p);}return groups;
}
