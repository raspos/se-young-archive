import {record, seasonRecords} from './engine.mjs';
import {primaryVideoLink} from './videos.mjs';

type RivalMatch = {key:string; date:string; tournament:string; round:string; p1:string; p2:string; games:number[][]; status:string; winner:number; team1:string; team2:string; source?:string};

export function RivalAnalysis({matches, opponent, videos, sourceUrl}:{matches:RivalMatch[]; opponent:string; videos:any[]; sourceUrl:(id?:string)=>string}) {
  if (!opponent) return null;
  const rows=matches.filter(m=>m.p1===opponent||m.p2===opponent);
  const complete=rows.filter(m=>m.status==='completed');
  const total=record(rows,'an');
  const seasons=seasonRecords(rows,'an');
  const games=[0,1,2].map(index=>{
    const played=complete.filter(m=>m.games[index]);
    const wins=played.filter(m=>m.games[index][m.p1==='an'?0:1]>m.games[index][m.p1==='an'?1:0]).length;
    return {wins, losses:played.length-wins};
  });
  const finals=complete.filter(m=>m.round==='F').sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  return <section className="lab-section rival-analysis" aria-label="라이벌 분석">
    <h2>라이벌 분석</h2>
    <p>{total.wins}승 {total.losses}패 · 수록 완료 {total.n}경기</p>
    <div className="rival-seasons" aria-label="연도별 상대전적">
      {seasons.map(s=><div key={s.year}><b>{s.year}</b><div className="rival-track"><span style={{width:(s.rate??0)*100+'%'}}/></div><span>{s.wins}승 {s.losses}패 · {Math.round((s.rate??0)*100)}%</span></div>)}
    </div>
    <details className="reading-notes"><summary>게임별 성적과 결승</summary>
      <p>{games.map((g,i)=>(i+1)+'게임 '+g.wins+'승 '+g.losses+'패').join(' · ')}</p>
      <p>첫 게임 패배 후 역전승 {total.comebackWins}/{total.comebackN}경기</p>
      <ul>{finals.map(m=>{const video=primaryVideoLink(m,videos);return <li key={m.key}>
        <a href={sourceUrl(m.source)} target="_blank" rel="noreferrer">{m.date} {m.tournament}</a>
        {' · '}{m.winner===(m.p1==='an'?1:2)?'승':'패'}
        {' · '}<a href={video.href} target="_blank" rel="noreferrer">{video.label}</a>
      </li>;})}</ul>
      <p>점수가 확인된 수록 경기 기준</p>
    </details>
  </section>;
}
