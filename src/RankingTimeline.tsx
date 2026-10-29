import {useMemo,useState} from 'react';
import {Download,ExternalLink,TrendingUp} from 'lucide-react';
import {rankingSegments} from './ranking.mjs';
import './ranking.css';

type Point={date:string;rank:number;points?:number;kind:string;source:string;label:string;basis:string;path?:string};
type History={checked:string;commit:string;points:Point[];snapshots:any[];note:string};
const kinds:Record<string,string>={snapshot:'날짜별 수집표',match:'경기 전 관측값',yearEnd:'연말 기준값',milestone:'확인된 이정표',latest:'최근 확인값'};
const ms=(s:string)=>Date.parse(s+'T00:00:00Z');
const stamp=(s:string)=>s.replaceAll('-','.');

export function RankingTimeline({data,sourceUrl}:{data:History;sourceUrl:(id:string)=>string}){
 const initial=new URLSearchParams(location.search).get('rankRange');
 const [range,setRange]=useState(['career','snapshots','recent'].includes(initial??'')?initial!:'career');
 const [metric,setMetric]=useState('rank');
 const [selected,setSelected]=useState('2026-10-27|latest');
 const filtered=useMemo(()=>data.points.filter(p=>(range!=='snapshots'||p.kind==='snapshot')&&(range!=='recent'||p.date>='2024-01-01')&&(metric==='rank'||p.points!=null)),[data,range,metric]);
 const active=filtered.find(p=>p.date+'|'+p.kind===selected)??filtered.at(-1)!;
 const x0=ms(filtered[0].date),x1=ms(filtered.at(-1)!.date),left=65,right=995,top=40,bottom=335;
 const x=(date:string)=>left+(ms(date)-x0)/Math.max(1,x1-x0)*(right-left);
 const maxRank=[10,20,50,100,200,500,1000,2000].find(n=>n>=Math.max(...filtered.map(p=>p.rank)))??10000;
 const ticks=metric==='rank'?[1,2,5,10,20,50,100,200,500,1000,2000].filter(t=>t<=maxRank):[60000,80000,100000,120000,140000];
 const y=(p:Point)=>metric==='rank'?top+Math.log10(Math.max(1,p.rank))/Math.log10(maxRank)*(bottom-top):bottom-((p.points??0)-60000)/80000*(bottom-top);
 const groups=rankingSegments(filtered.filter(p=>p.kind==='snapshot'),15) as Point[][];
 const observationGroups:Point[][]=[];for(const p of filtered.filter(p=>p.kind==='match')){const last=observationGroups.at(-1);if(!last||ms(p.date)-ms(last.at(-1)!.date)>30*86400000)observationGroups.push([p]);else last.push(p);}
 const years=[...new Set(filtered.map(p=>p.date.slice(0,4)))].map(Number).filter((_,i)=>range!=='career'||i%2===0);
 const link=(p:Point)=>p.path?`https://github.com/SanderP99/Badminton-Data/blob/${data.commit}/${p.path}`:sourceUrl(p.source);
 function chooseRange(value:string){setRange(value);const q=new URLSearchParams(location.search);q.set('rankRange',value);history.replaceState(null,'','?'+q);}
 function csv(){const rows=[['date','rank','points','basis','source'],...filtered.map(p=>[p.date,p.rank,p.points??'',p.basis,link(p)])];const text='\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n');const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='an-ranking-history.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <section id="ranking-history" className="ranking-exhibit section" aria-labelledby="ranking-title">
  <div className="section-heading"><div><span className="eyebrow">THE CLIMB / WORLD RANKING</span><h2 id="ranking-title">한 계단씩, 세계 1위까지.</h2><p className="ranking-intro">안세영의 세계랭킹 추이. 한 번의 정상이 아니라, 올라온 시간을 봅니다.</p></div><button className="outline" onClick={csv}><Download size={17}/> 랭킹 CSV</button></div>
  <div className="ranking-stats"><div><span>최근 확인 순위</span><strong>1<small>위</small></strong><p>2026.10.27 기준</p></div><div><span>처음 세계 1위</span><strong className="ranking-date">2023.08.01</strong><p>KBS · 협회 발표 인용</p></div><div><span>검증해 연결한 기록</span><strong>{data.points.length}<small>건</small></strong><p>수집표 {data.snapshots.length}개 + 경기 전·연말값</p></div></div>
  <div className="ranking-chart-panel">
   <div className="ranking-toolbar"><div className="ranking-mode" role="group" aria-label="랭킹 그래프 지표"><button aria-pressed={metric==='rank'} onClick={()=>setMetric('rank')}>세계 순위</button><button aria-pressed={metric==='points'} onClick={()=>setMetric('points')}>랭킹 포인트</button></div><label>기간 <select aria-label="랭킹 그래프 기간" value={range} onChange={e=>chooseRange(e.target.value)}><option value="career">전체 궤적 · 2018–2026</option><option value="snapshots">수집표 상세 · 2022–2025</option><option value="recent">2024년 이후</option></select></label></div>
   <div className="ranking-axis-note"><TrendingUp size={15}/>{metric==='rank'?'위로 갈수록 높은 순위 · 로그 눈금':'확인된 랭킹 포인트 · 제도 변경 전후 단순 비교 주의'}</div>
   <div className="ranking-chart-scroll" tabIndex={0} role="region" aria-label="안세영 랭킹 그래프, 작은 화면에서는 좌우 스크롤"><svg viewBox="0 0 1040 390" className="ranking-history-chart" role="img" aria-label="안세영 세계랭킹 추이: 2018년 연말 99위, 2023년 8월 첫 1위, 최근 확인 1위">
    <defs><linearGradient id="rank-line" x1="0" x2="1"><stop stopColor="#71c6ab"/><stop offset="1" stopColor="#cbff68"/></linearGradient><pattern id="rank-gap" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 10L10 0" stroke="#c8ddba0b"/></pattern></defs>
    {range!=='snapshots'&&filtered[0].date<'2025-01-07'&&<g><rect x={Math.max(left,x('2025-01-07'))} y={top} width={Math.max(0,right-Math.max(left,x('2025-01-07')))} height={bottom-top} fill="url(#rank-gap)"/><text x={Math.min(right-100,Math.max(left+20,x('2025-01-07')+15))} y={bottom-16} fill="#a1b09b" fontSize="14">주별 수집표 미연결 구간</text></g>}
    {ticks.map(t=>{const yy=y({rank:t,points:t} as Point);return <g key={t}><line x1={left} x2={right} y1={yy} y2={yy} stroke="#c0d4ae20"/><text x={left-13} y={yy+5} textAnchor="end" fill="#a7b99e" fontSize="15">{metric==='rank'?t:t/1000+'k'}</text></g>;})}
    {years.map(year=><text key={year} x={Math.max(left,Math.min(right,x(year+'-07-01')))} y="370" textAnchor="middle" fill="#a7b99e" fontSize="15">{year}</text>)}
    {groups.filter(g=>g.length>1).map((g,i)=><path key={i} d={g.map((p,j)=>`${j?'L':'M'}${x(p.date)},${y(p)}`).join(' ')} stroke="url(#rank-line)" strokeWidth="3" fill="none"/>)}
    {observationGroups.filter(g=>g.length>1).map((g,i)=><path key={'observed-'+i} d={g.map((p,j)=>`${j?'L':'M'}${x(p.date)},${y(p)}`).join(' ')} stroke="#78b8d18a" strokeDasharray="4 5" strokeWidth="1.5" fill="none"/>)}
    <line x1={x(active.date)} x2={x(active.date)} y1={top-8} y2={bottom} stroke="#e5f2d76b" strokeDasharray="4 6"/>
    {filtered.map((p,index)=><circle className="ranking-point" key={p.date+'|'+p.kind} data-point={index} cx={x(p.date)} cy={y(p)} r={p.kind==='snapshot'?4:p.kind==='match'?3.5:7} fill={p.kind==='yearEnd'?'#e0e9d7':p.kind==='snapshot'?'#76bba3':p.kind==='match'?'#78b8d1':'#cbff68'} stroke="#0a2218" strokeWidth="2" tabIndex={p===active?0:-1} role="button" aria-label={`${p.date} ${p.rank}위 ${kinds[p.kind]}`} onFocus={()=>setSelected(p.date+'|'+p.kind)} onPointerEnter={()=>setSelected(p.date+'|'+p.kind)} onClick={()=>setSelected(p.date+'|'+p.kind)} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=Math.max(0,Math.min(filtered.length-1,index+(e.key==='ArrowRight'?1:-1)));(e.currentTarget.ownerSVGElement?.querySelector(`[data-point="${next}"]`) as SVGCircleElement)?.focus();}if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(p.date+'|'+p.kind);}}}><title>{stamp(p.date)} · {p.rank}위 · {p.basis}</title></circle>)}
    <circle cx={x(active.date)} cy={y(active)} r="11" fill="none" stroke="#cbff68" strokeWidth="2" pointerEvents="none"/>
   </svg></div>
   <p className="ranking-scroll-hint">그래프를 좌우로 밀어 전체 흐름을 볼 수 있습니다.</p><div className="ranking-legend"><span><i className="snapshot-key"/>날짜별 수집표 · 실선</span><span><i className="match-key"/>경기 전 관측값 · 점선 안내</span><span><i/>연말 기준값 · 독립 점</span><span><i className="milestone-key"/>보도·공식 자료 확인값</span></div>
   <label className="ranking-date-select">기록 선택 <select aria-label="랭킹 확인 기록 선택" value={active.date+'|'+active.kind} onChange={e=>setSelected(e.target.value)}>{filtered.map(p=><option key={p.date+'|'+p.kind} value={p.date+'|'+p.kind}>{p.date} · {p.rank}위 · {kinds[p.kind]}</option>)}</select></label><div className="ranking-readout" aria-live="polite"><div><span>{stamp(active.date)} · {kinds[active.kind]}</span><strong>{active.rank}위{active.points!=null&&<small>{active.points.toLocaleString('ko-KR',{maximumFractionDigits:1})} pts</small>}</strong><p>{active.label} · {active.basis}</p></div><a className="outline" href={link(active)} target="_blank" rel="noreferrer">이 기록 원문 <ExternalLink size={15}/></a></div>
  </div>
  <p className="footnote">{data.note} 수집일을 공식 랭킹 발표일로 바꾸지 않았습니다. 연말 순위의 12월 31일은 연말 기준일입니다. 점에 마우스를 올리거나 누르면 날짜와 근거를 확인할 수 있습니다. 재조사 {data.checked}.</p>
  <details className="ranking-data-table"><summary>확인한 랭킹 {filtered.length}건과 출처 보기</summary><div className="table-scroll"><table><thead><tr><th>날짜 / 기준일</th><th>순위</th><th>포인트</th><th>기록 종류</th><th>출처</th></tr></thead><tbody>{filtered.map(p=><tr key={p.date+'|'+p.kind}><td>{p.date}</td><td>{p.rank}위</td><td>{p.points?.toLocaleString('ko-KR')??'해당 기록에 없음'}</td><td>{kinds[p.kind]}</td><td><a href={link(p)} target="_blank" rel="noreferrer">원문 ↗</a></td></tr>)}</tbody></table></div></details>
 </section>;
}
