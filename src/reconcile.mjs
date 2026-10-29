import {normalizeMatches,tournamentKey,isWin,isQualificationRound} from './engine.mjs';
const DAY=86400000;
const pair=m=>[m.p1,m.p2].sort().join('|');
const winner=m=>isWin(m,m.p1)?m.p1:m.p2;
const signature=m=>m.games.filter(Boolean).map(g=>(m.p1<m.p2?g:[g[1],g[0]]).join('-')).join(' ');
const family=m=>tournamentKey(m.tournament).replace(/\b(?:19|20)\d{2}\b/g,'').trim();
function compatibleRound(a,b){return a.round===b.round||(isQualificationRound(a.round)&&isQualificationRound(b.round))||(/finals/i.test(a.tournament+' '+b.tournament)&&(/GROUP/.test(a.round)&&/^R[123]$/.test(b.round)||/GROUP/.test(b.round)&&/^R[123]$/.test(a.round)));}
export function reconcileSources(primaryRows,secondaryRows,asOf){
 const primary=normalizeMatches(primaryRows,asOf,true,true).matches;
 const secondary=normalizeMatches(secondaryRows,asOf,true,true).matches;
 const byPair=new Map();for(const p of primary){const k=pair(p);if(!byPair.has(k))byPair.set(k,[]);byPair.get(k).push(p);}
 const result=[...primary],audit={primary:primary.length,secondary:secondary.length,matched:0,exactResultMatches:0,dateDifferences:[],roundAliases:0,conflicts:[],ambiguous:[]};
 for(const row of secondary){const pool=byPair.get(pair(row))??[];let candidates=pool.filter(p=>Math.abs(Date.parse(p.date)-Date.parse(row.date))<=2*DAY&&(tournamentKey(p.tournament+' '+p.date.slice(0,4),p.date.slice(0,4))===tournamentKey(row.tournament+' '+row.date.slice(0,4),row.date.slice(0,4))||p.date===row.date&&family(p)===family(row))&&compatibleRound(p,row));
  // Independent exact result identity corroborates sponsor/order and group-label aliases.
  // Only completed scores qualify; empty walkovers never establish this fallback identity.
  if(!candidates.length&&row.status==='completed'){candidates=pool.filter(p=>p.status==='completed'&&p.date===row.date&&winner(p)===winner(row)&&signature(p)===signature(row));if(candidates.length===1)audit.exactResultMatches++;}
  if(candidates.length!==1){if(candidates.length>1){audit.ambiguous.push(row.key);result.push({...row,status:'conflict'});}else result.push(row);continue;}
  const p=candidates[0];audit.matched++;p.crossSources=[...new Set([...(p.crossSources??[p.source]),row.source])];
  if(p.tournament!==row.tournament)p.tournamentAliases=[...new Set([...(p.tournamentAliases??[]),row.tournament])];
  if(p.round!==row.round){p.roundAliases=[...new Set([...(p.roundAliases??[]),row.round])];audit.roundAliases++;}
  if(p.date!==row.date){p.alternateDates=[...new Set([...(p.alternateDates??[]),row.date])];audit.dateDifferences.push({primary:p.date,secondary:row.date,key:p.key});}
  if(winner(p)!==winner(row)||(p.status==='completed'&&row.status==='completed'&&signature(p)!==signature(row))){p.status='conflict';audit.conflicts.push({key:p.key,secondary:row.key,primaryScore:p.score,secondaryScore:row.score});}
 }
 return {rows:result,audit};
}
