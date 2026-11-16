type Player = {id:string; name:string; events:string[][]; allEnglandYears:number[]};
type Update = {player:string; metric:string; date:string};
type Props = {players:Player[]; updates:Update[]; asOf:string; worldsUrl:string; englandUrl:string};

export function HistoricalTitles({players,updates,asOf,worldsUrl,englandUrl}:Props) {
  return <section id="historic-titles" className="lab-section">
    <div className="section-heading"><h2>세계선수권·전영오픈 우승 연도</h2></div>
    <div className="table-scroll">
      <table className="historic-titles-table">
        <thead><tr><th>선수</th><th>세계선수권</th><th>전영오픈</th></tr></thead>
        <tbody>{players.map(player=>{
          const worlds=[...new Set(player.events.filter(([date,type])=>date<=asOf&&type==='worlds').map(([date])=>Number(date.slice(0,4))))].sort();
          const england=[...new Set([...player.allEnglandYears,...updates.filter(u=>u.player===player.id&&u.metric==='allEngland'&&u.date<=asOf).map(u=>Number(u.date.slice(0,4)))])].sort();
          return <tr key={player.id}><th>{player.name}</th><td>{worlds.join(' · ')||'—'}</td><td>{england.join(' · ')||'—'}</td></tr>;
        })}</tbody>
      </table>
    </div>
    <details className="reading-notes"><summary>출처와 기준일</summary>
      <p>여자단식 · {asOf} 기준 · <a href={worldsUrl}>세계선수권 ↗</a> · <a href={englandUrl}>전영오픈 ↗</a></p>
    </details>
  </section>;
}
