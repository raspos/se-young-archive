import {useState} from 'react';

type Props={players:{id:string;name:string}[];summaries:Record<string,any>};
const percent=(v:number)=>(v*100).toFixed(1)+'%';

export function PeakExhibit({players,summaries}:Props){
 const [era,setEra]=useState('worldtour');
 const legacy=era==='superseries',key=legacy?'peakSuperseries':'peak';
 const eligible=players.filter(p=>summaries[p.id]?.[key]);
 const excluded=players.filter(p=>!summaries[p.id]?.[key]);
 return <section id="peak" className="lab-section">
  <div className="section-heading"><div><span className="eyebrow">C / THREE SEASONS AT THE TOP</span><h2>가장 빛났던 연속 3개 시즌</h2></div>
   <label className="peak-era-select">분석 시대 <select aria-label="전성기 분석 시대" value={era} onChange={e=>setEra(e.target.value)}><option value="worldtour">월드투어 · 2018–2024</option><option value="superseries">슈퍼시리즈 · 2007–2017</option></select></label>
  </div>
  <p className="muted">{legacy?'슈퍼시리즈·프리미어 및 Grade 1 개인전.':'월드투어 S300 이상·Finals 및 Grade 1 개인전.'} 연속 3개 시즌 각각 완료 경기 20회 이상인 창 중 합산 승률 최대. 시대별 대회 모집단을 분리하며, 서로 다른 탭의 승률을 같은 순위에 합치지 않습니다.</p>
  <div className="table-scroll"><table className="peak-table"><thead><tr><th>선수</th><th>분석 범위 내 최적 3시즌</th><th>승 · 패</th><th>승률</th><th>결승 진출률</th><th>완료 경기 표본</th><th>상위 10위 상대 승 · 패</th></tr></thead><tbody>{eligible.map(p=>{const s=summaries[p.id][key];return <tr key={p.id}><th>{p.name}</th><td>{s.start}–{s.end}</td><td>{s.wins} · {s.losses}</td><td className="lime">{percent(s.rate)}</td><td>{percent(s.finalRate)}</td><td>{s.n}경기</td><td>{s.top10?.n?<>{s.top10.wins} · {s.top10.losses}<small>상대 랭킹 {s.top10.covered}/{s.top10.matches}경기 확보</small></>:'경기 전 랭킹 표본 없음'}</td></tr>;})}</tbody></table></div>
  {!eligible.length&&<p className="notice">이 시대의 연속 3시즌 조건을 충족하는 표본이 없습니다.</p>}
  <details className="peak-exclusions"><summary>이 시대에 포함하지 않은 선수와 이유 ({excluded.length}명)</summary>{excluded.map(p=>{const s=summaries[p.id];return <p key={p.id}><b>{p.name}</b> · {!s?.record?.n?'2007년 이후 CSV에 활동기 경기 없음':!legacy&&['zhang','xie','wang','li'].includes(p.id)?'월드투어 기간의 연속 3시즌 표본 부족 · 슈퍼시리즈 탭에서 확보 범위 확인':legacy&&p.id==='an'?'활동기 기록이 월드투어 시대에 해당':'이 시대에서 각각 20경기 이상인 연속 3시즌 미충족'}</p>;})}</details>
  <p className="footnote">자료: Sun·Zhang / Harvard Dataverse v3 및 공개 경기 CSV · 2026.10.29 재집계. 결승 진출률 = 수록 결승 경기 수 / 수록 출전 대회 수. 전체 커리어의 공식 전성기·승률이 아닙니다. 상위 10위는 연구 원자료의 경기 전 상대 BWF 랭킹이며, 랭킹이 없는 경기를 하위권으로 가정하지 않습니다.</p>
 </section>;
}
