import {lazy,Suspense,useEffect,useState} from 'react';
import {ArrowUpRight,Play} from 'lucide-react';
import {record,seasonRecords} from './engine.mjs';
import {matchVideoLinks} from './videos.mjs';
import {RivalAnalysis} from './RivalAnalysis';
import {chapters,techniques,interviews,imageSources} from './anatomyContent';
import './anatomy.css';

const FootworkCourt=lazy(()=>import('./FootworkCourt'));

type Match={key:string;date:string;tournament:string;round:string;tier:string;p1:string;p2:string;winner:number;games:number[][];status:string;team1:string;team2:string;source?:string;team_event?:string|null};
type Props={matches:Match[];videos:any[];sourceUrl:(id?:string)=>string;openMatch:(m:Match)=>void;openSeason:(year:number)=>void};
type Point=readonly [number,number,number,number,number,number];
const defense=[
 ['높이 띄우기','깊게 보내면 자세를 가다듬을 시간이 생긴다. 짧아지면 상대에게 다시 높은 타점을 준다.',[141,224,90,10,50,35]],
 ['네트 앞으로 받기','상대가 후위에 남았다면 전방 이동을 강제한다. 리턴이 뜨면 상대가 네트 위에서 끊는다.',[141,224,105,155,115,128]],
 ['빈 곳으로 방향 전환','상대의 복귀 반대편을 겨냥한다. 셔틀이 몸에 가까우면 각도를 만들기 어렵다.',[141,224,112,95,46,89]]
] as const;
const rally=[
 ['깊은 클리어','셔틀을 후위로 보낸다.',[65,239,115,15,154,40]],
 ['상대의 후위 이동','상대가 셔틀 뒤로 이동한다.',[92,106,127,69,154,40]],
 ['네트 앞 공간','상대가 뒤에 남으면 전위가 열린다.',[154,40,139,64,92,91]],
 ['짧은 드롭','열린 전위로 셔틀을 보낸다.',[65,239,102,82,123,131]],
 ['다음 공격 기회','떠오르는 리턴을 예상해 한 걸음 전진한다.',[97,209,113,175,123,131]]
] as const;
const rivals=[['chen','천위페이'],['yamaguchi','야마구치 아카네'],['harvard:5034337','왕즈이'],['tai','타이쯔잉'],['marin','카롤리나 마린']] as const;
const pct=(wins:number,n:number)=>n?(100*wins/n).toFixed(1)+'%':'—';
const photo=(name:string)=>import.meta.env.BASE_URL+'photos/'+name;

function Court({trajectory,mode='shot',view='top',speed=1,label}:{trajectory:Point;mode?:string;view?:string;speed?:number;label:string}) {
 const [replay,setReplay]=useState(0);
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const onChange=()=>setReduced(query.matches);query.addEventListener('change',onChange);return()=>query.removeEventListener('change',onChange);},[]);
 const [x,y,cx,cy,endX,endY]=trajectory;
 const path=`M ${x} ${y} Q ${cx} ${cy} ${endX} ${endY}`;
 const transform=view==='front'?'translate(0 51) scale(1 .65)':view==='side'?'translate(213 52) rotate(90) scale(.78 .65)':undefined;
 return <figure className="anatomy-court">
   <svg viewBox="0 0 220 300" role="img" aria-label={label}>
    <g transform={transform}>
     <rect x="22" y="18" width="176" height="264" rx="5" fill="#174934" stroke="#a6c7a6" strokeWidth="2"/>
     <path d="M35 18V282M185 18V282M22 47H198M22 253H198M22 111H198M22 189H198M110 18V111M110 189V282" stroke="#c7dcc1" fill="none"/>
     <path d="M17 150H203" stroke="#d0e6d0" strokeWidth="2" strokeDasharray="4 3"/>
     <circle cx="110" cy="83" r="5" fill="#7ebad9"/>
     <path d={path} stroke="#cbff68" strokeWidth="3" strokeDasharray="6 3" fill="none"/>
     <circle cx={x} cy={y} r="4" fill="#fff"/><circle cx={endX} cy={endY} r="6" fill="#cbff68"/>
     {!reduced&&<circle key={path+replay+speed} r="5" fill={mode==='foot'?'#ffffff':'#d6ff86'}><animateMotion path={path} dur={(2/speed)+'s'} repeatCount="1" fill="freeze"/></circle>}
    </g>
   </svg>
   <figcaption><span>전술 교육용 도식</span>{!reduced&&<button className="text-btn" onClick={()=>setReplay(n=>n+1)}><Play size={14}/> 다시 재생</button>}</figcaption>
 </figure>;
}
function Controls({items,value,onChange,label}:{items:readonly string[];value:number;onChange:(n:number)=>void;label:string}) {
 return <div className="anatomy-options" role="group" aria-label={label}>{items.map((name,i)=><button key={name} aria-pressed={i===value} onClick={()=>onChange(i)}>{name}</button>)}</div>;
}
function Interview({item}:{item:(typeof interviews)[number]}) {
 return <article className="anatomy-interview"><b>{item.speaker}</b><small>{item.role} · {item.date} · {item.quote?'발언 발췌':'발언 요약'}</small><p>{item.summary}</p>{item.translation&&<blockquote>{item.translation}<details><summary>영어 원문</summary><p lang="en">{item.quote}</p></details></blockquote>}<a href={item.url} target="_blank" rel="noreferrer">{item.media} <ArrowUpRight size={14}/></a></article>;
}
export default function AnatomyPage({matches,videos,sourceUrl,openMatch,openSeason}:Props) {
 const [active,setActive]=useState('defense');
 const [def,setDef]=useState(0),[foot,setFoot]=useState(0),[view,setView]=useState(0),[speed,setSpeed]=useState(1);
 const [footReady,setFootReady]=useState(false);
 const [step,setStep]=useState(0),[skill,setSkill]=useState(0),[rival,setRival]=useState('yamaguchi'),[era,setEra]=useState(2),[scope,setScope]=useState(0);
 useEffect(()=>{
  const findActive=()=>{const id=[...chapters].reverse().find(([id])=>(document.getElementById(id)?.getBoundingClientRect().top??Infinity)<185)?.[0]??'defense';setActive(id);};
  window.addEventListener('scroll',findActive,{passive:true});const anchor=location.hash.slice(1);if(chapters.some(([id])=>id===anchor))document.getElementById(anchor)?.scrollIntoView();findActive();return()=>window.removeEventListener('scroll',findActive);
 },[]);
 const matchup=matches.filter(m=>m.p1===rival||m.p2===rival).slice().reverse();
 const ends=[2021,2024,2026],starts=[2019,2022,2025];
 const eraRows=matches.filter(m=>Number(m.date.slice(0,4))>=starts[era]&&Number(m.date.slice(0,4))<=ends[era]);
 const scoped=matches.filter(m=>scope===0||(scope===1?!(!!m.team_event||/team|uber cup|sudirman|thomas/i.test(m.tier+' '+m.tournament)):/team|uber cup|sudirman|thomas/i.test(m.tier+' '+m.tournament)));
 const stats=record(scoped,'an'),season=seasonRecords(scoped,'an');
 const afterLoss=season.map(({year})=>{
  const rows=scoped.filter(m=>m.date.startsWith(String(year)));
  const next=rows.filter((m,i)=>i>0&&rows[i-1].status==='completed'&&rows[i-1].winner!==(rows[i-1].p1==='an'?1:2)&&m.status==='completed');
  return {year,n:next.length,w:next.filter(m=>m.winner===(m.p1==='an'?1:2)).length};
 }).filter(x=>x.n);
 const official=(m:Match)=>matchVideoLinks(m,videos);
 const clip=(date:string)=>matches.find(m=>m.date===date&&official(m).length);
 const gameStats=[0,1,2].map(i=>{const rows=scoped.filter(m=>m.status==='completed'&&m.games[i]);return {n:rows.length,w:rows.filter(m=>m.games[i][m.p1==='an'?0:1]>m.games[i][m.p1==='an'?1:0]).length};});
 const gameCard=(m?:Match)=>{
  if(!m)return null;
  return <article className="anatomy-match"><b>{m.tournament}</b><small>{m.date} · {m.p1==='an'?m.team2:m.team1}</small><span>{m.games.map(g=>m.p1==='an'?g.join('–'):[g[1],g[0]].join('–')).join(' · ')}</span><div>{official(m).map((v:any)=><a key={v.id} href={v.href} target="_blank" rel="noreferrer"><Play size={14}/> {v.label} · BWF TV</a>)}<button className="text-btn" onClick={()=>openMatch(m)}>경기 원장 <ArrowUpRight size={14}/></button></div></article>;
 };
 const early=matches.find(m=>m.date<'2025-01-01'&&official(m).length);
 const late=clip('2026-08-23');
 const classic=clip('2025-03-16')??clip('2026-10-18');
 const defenseClip=clip('2026-11-08')??late;
 const officialFinal=clip('2025-12-21');
 const rivalsWithRows=rivals.filter(([key])=>matches.some(m=>m.p1===key||m.p2===key));
 function content(id:string){
  switch(id){
   case 'defense':return <><Controls items={defense.map(d=>d[0])} value={def} onChange={setDef} label="수비 선택"/><Court trajectory={defense[def][2]} label={defense[def][0]+' 셔틀 궤적'}/><p>{defense[def][1]}</p>{gameCard(defenseClip)}</>;
   case 'footwork':return <><Controls items={['전위로 이동','후위로 이동']} value={foot} onChange={setFoot} label="풋워크 방향"/><Controls items={['상단','정면','측면']} value={view} onChange={setView} label="코트 시점"/><Controls items={['0.5배속','1배속','2배속']} value={speed} onChange={setSpeed} label="재생 속도"/><div className="anatomy-options">{!footReady&&<button onClick={()=>setFootReady(true)}>3D 풋워크 보기</button>}</div>{footReady&&<Suspense fallback={<p>코트 불러오는 중…</p>}><FootworkCourt direction={foot} view={view} speed={[0.5,1,2][speed]}/></Suspense>}</>;
   case 'rally':return <><Controls items={rally.map(s=>s[0])} value={step} onChange={setStep} label="전술 단계"/><Court trajectory={rally[step][2]} label={rally[step][0]}/><p>{rally[step][1]}</p><p>2025년 전영오픈 결승에서 안세영과 왕즈이는 79타 랠리를 펼쳤습니다. 타구 수는 이 장면의 기록입니다. <a href="https://indianexpress.com/article/sports/badminton/watch-in-all-england-final-an-se-young-wins-sensational-79-shot-rally-against-wang-zhi-yi-9890026/" target="_blank" rel="noreferrer">장면과 보도 ↗</a></p>{gameCard(classic)}</>;
   case 'technique':return <><h3>TECHNIQUE LAB</h3><figure className="anatomy-press-photo"><img className="anatomy-photo" src={photo('anatomy/yonex-profile.jpg')} alt="라켓을 들어 올린 안세영" loading="lazy" decoding="async" width="810" height="540"/><figcaption><a href="https://www.yonex.com/athletes/details/?athlete_id=107">사진 · YONEX 공식 선수 프로필 ↗</a></figcaption></figure><Controls items={techniques.map(t=>t[0])} value={skill} onChange={setSkill} label="기술 선택"/><h4>{techniques[skill][0]} · {techniques[skill][1]}</h4><Court trajectory={techniques[skill][4]} label={techniques[skill][0]+' 셔틀 궤적'}/><p>{techniques[skill][2]}</p><p>{techniques[skill][3]}</p>{gameCard(skill===0||skill===6?late:defenseClip)}</>;
   case 'strategy':return <><label>라이벌 <select value={rival} onChange={e=>setRival(e.target.value)}>{rivalsWithRows.map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></label><RivalAnalysis matches={matches} opponent={rival} videos={videos} sourceUrl={sourceUrl}/><details className="reading-notes"><summary>맞대결 {matchup.length}건</summary><div className="anatomy-match-grid">{matchup.map(m=><div key={m.key}>{gameCard(m)}</div>)}</div></details></>;
   case 'mental':return <><img className="anatomy-photo" src={photo('an-victory.jpg')} loading="lazy" decoding="async" alt="경기를 마치고 환호하는 안세영"/><div className="anatomy-metrics"><div><b>{pct(stats.comebackWins,stats.comebackN)}</b>첫 게임 패배 후 역전승<small>{stats.comebackWins}/{stats.comebackN}경기</small></div><div><b>{pct(stats.fullWins,stats.fullN)}</b>풀게임 승률<small>{stats.fullWins}/{stats.fullN}경기</small></div><div><b>{pct(stats.titles,stats.finals)}</b>결승 승률<small>{stats.titles}/{stats.finals}경기</small></div></div><details className="reading-notes"><summary>시즌별 패배 뒤 다음 수록 경기</summary><ul>{afterLoss.map(x=><li key={x.year}>{x.year}년 {x.w}승 {x.n-x.w}패</li>)}</ul></details>{gameCard(classic)}{gameCard(officialFinal)}</>;
   case 'evolution':{const r=record(eraRows,'an');return <><Controls items={['2019–2021','2022–2024','2025–2026']} value={era} onChange={setEra} label="비교 시기"/><p>수록 완료 {r.n}경기 · {r.wins}승 {r.losses}패 · {pct(r.wins,r.n)}</p><div className="anatomy-match-grid">{gameCard(early??classic)}{gameCard(late)}</div><img className="anatomy-photo" src={photo('an-medal.jpg')} loading="lazy" decoding="async" alt="메달에 입맞추는 안세영"/></>;}
   default:return <><Controls items={['전체','개인전','단체전']} value={scope} onChange={setScope} label="경기 범위"/><p>{scoped.length}건 수록 · 완료 {stats.n}경기 · 수록 경기 최장 연승 {stats.streak??'—'}</p><div className="anatomy-metrics">{gameStats.map((g,i)=><div key={i}><b>{pct(g.w,g.n)}</b>{i+1}게임 승률<small>{g.w}/{g.n}게임</small></div>)}</div><div className="rival-seasons">{season.map(s=><div key={s.year}><button className="text-btn" onClick={()=>openSeason(s.year)}>{s.year}</button><div className="rival-track"><span style={{width:pct(s.wins,s.n)}}/></div><span>{s.wins}승 {s.losses}패 · {pct(s.wins,s.n)}</span></div>)}</div><details className="reading-notes"><summary>데이터 범위</summary><p>{scoped[0]?.date}–{scoped.at(-1)?.date}. 게임별 지표는 해당 게임까지 치른 완료 경기의 점수로 계산했다. 기권과 부전승은 승률에서 제외했다.</p></details></>;
  }
 }
 return <div className="anatomy-page">
  <section className="anatomy-hero">
   <img src={photo('anatomy/yonex-banner.jpg')} alt="코트에서 라켓을 뻗는 안세영"/>
   <div><span>WHY AN SE YOUNG WINS</span><h1>승리의 해부학</h1><p>안세영은 왜 이토록 강한가?</p><small>철벽 수비, 정교한 기술, 압도적인 경기 운영. 세계 정상의 경기력을 해부하다.</small></div><a className="anatomy-hero-credit" href="https://www.yonex.com/athletes/details/?athlete_id=107">사진 · YONEX ↗</a>
  </section>
  <div className="anatomy-nav" role="navigation" aria-label="특집 목차">{chapters.map(([id,title])=><a key={id} aria-current={active===id?'location':undefined} href={'#'+id}>{title}</a>)}</div>
  <div className="anatomy-body">
   {chapters.map(([id,title,question,description])=><section className="anatomy-chapter" id={id} key={id}><h2>{title}</h2><h3>{question}</h3><p>{description}</p>{content(id)}{interviews.filter(i=>i.chapter===id).map(i=><Interview key={i.url} item={i}/>)}</section>)}
   <details className="anatomy-chapter"><summary>인터뷰 모아보기 · {interviews.length}건</summary>{interviews.map(i=><Interview key={i.url} item={i}/>)}</details>
   <details className="anatomy-chapter"><summary>사진·영상·기술 출처</summary><p><a href="https://res.cloudinary.com/badminton/images/v1760081409/wordpress_assets_test/BWF-Athletes-Commission-2026-2029-Profiles/BWF-Athletes-Commission-2026-2029-Profiles.pdf" target="_blank" rel="noreferrer">BWF 공식 선수 자료·사진 원문 ↗</a></p><a href="https://www.badminton.org.au/wp-content/uploads/2022/11/1.-BWF-ST-Teachers-Manual_Inclusivity_ENGLISH.pdf" target="_blank" rel="noreferrer">BWF Shuttle Time 지도자 자료 ↗</a><ul>{imageSources.map(s=><li key={s.file}>{s.use} · {s.originalUrl?<a href={s.originalUrl}>{s.source} 원본 ↗</a>:s.source}</li>)}</ul><p><a href="https://bwfbadminton.us12.list-manage.com/subscribe?id=91b28c9b95&amp;u=73460b7def03b0639c64e732c" target="_blank" rel="noreferrer">BWF 공식 사진·영상 이용 조건 ↗</a></p><p>경기 영상은 BWF TV 원문으로 연결합니다. 기술별 구간은 영상 검증을 마친 뒤 등록합니다.</p></details>
  </div>
 </div>;
}
