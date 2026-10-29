import {playerId,tournamentKey} from './engine.mjs';
const rounds={F:'Final',FINAL:'Final',SF:'Semifinal',QF:'Quarterfinal',R16:'Round of 16',R32:'Round of 32',R64:'Round of 64'};
const roundKey=round=>rounds[String(round).toUpperCase()]??String(round);
export function youtubeSearchUrl(match){
 const tournament=String(match.tournament??'').trim();const year=String(match.date??'').slice(0,4);
 const query=['BWF TV',match.team1,'vs',match.team2,tournament,/\b(19|20)\d{2}\b/.test(tournament)?'':year,roundKey(match.round)].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
 return 'https://www.youtube.com/results?search_query='+encodeURIComponent(query);
}
export function matchVideoLinks(match,registry){
 const ids=[playerId(match.team1),playerId(match.team2)].sort().join('|');
 const entry=registry.find(r=>r.date===match.date&&[match.tournament,...(match.tournamentAliases??[])].some(name=>tournamentKey(r.tournament,r.date.slice(0,4))===tournamentKey(name,match.date.slice(0,4)))&&[match.round,...(match.roundAliases??[])].some(round=>roundKey(r.round)===roundKey(round))&&r.players.map(playerId).sort().join('|')===ids);
 return entry?entry.videos.filter(v=>/^[A-Za-z0-9_-]{11}$/.test(v.id)).map(v=>({...v,href:'https://www.youtube.com/watch?v='+v.id,checked:entry.checked})):[];
}
export function primaryVideoLink(match,registry){const video=matchVideoLinks(match,registry)[0];return video?{href:video.href,label:'경기 영상',verified:true}:{href:youtubeSearchUrl(match),label:'영상 찾기',verified:false};}
