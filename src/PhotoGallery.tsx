import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Expand,X} from 'lucide-react';

const base=import.meta.env.BASE_URL;
export const archivePhotos=[
 {src:base+'photos/an-medal.jpg',alt:'메달에 입맞추는 안세영',kicker:'THE ACHIEVEMENT',title:'정상에 선 순간',copy:'한 점씩 쌓아 올린 시간이, 하나의 장면으로 남습니다.',position:'52% 48%',width:2048,height:1559},
 {src:base+'photos/an-victory.jpg',alt:'코트 위에서 두 주먹을 쥐며 환호하는 안세영',kicker:'THE EMOTION',title:'마지막 포인트 뒤의 감정',copy:'승률이라는 숫자만으로는 다 전할 수 없는 기쁨.',position:'33% 46%',width:2048,height:1482},
 {src:base+'photos/an-roar.jpg',alt:'두 주먹을 쥐고 환호하는 안세영의 모습',kicker:'THE FIGHT',title:'끝까지, 다시',copy:'그 다음 랠리를 향한 집중과 의지를 기억합니다.',position:'72% 42%',width:1200,height:675},
];

/** Scroll and hover effects stay in the browser; reduced-motion users get a static view. */
export function useExhibitEffects(view:string){
 useEffect(()=>{const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const nodes=document.querySelectorAll<HTMLElement>('.reveal');let observer:IntersectionObserver|undefined;
  if(reduced)nodes.forEach(n=>n.classList.add('is-visible'));
  else{observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('is-visible');observer?.unobserve(e.target);}},{threshold:.08});nodes.forEach(n=>observer?.observe(n));}
  let frame=0;const hero=document.querySelector<HTMLElement>('.hero-portrait');const scroll=()=>{if(reduced||!hero||frame)return;frame=requestAnimationFrame(()=>{const top=Math.min(window.scrollY*.1,70);hero.style.transform=`translate3d(0,${top}px,0) scale(1.08)`;frame=0;});};
  const pointer=(e:PointerEvent)=>{if(reduced||e.pointerType==='touch')return;const card=(e.target as Element)?.closest<HTMLElement>('.feature-card,.photo-card,.rival-card,.video-card');if(!card)return;const bounds=card.getBoundingClientRect();card.style.setProperty('--glow-x',`${e.clientX-bounds.left}px`);card.style.setProperty('--glow-y',`${e.clientY-bounds.top}px`);};
  window.addEventListener('scroll',scroll,{passive:true});document.addEventListener('pointermove',pointer,{passive:true});scroll();
  return()=>{observer?.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',scroll);document.removeEventListener('pointermove',pointer);};
 },[view]);
}

export function PhotoGallery({compact=false,onCareer}:{compact?:boolean;onCareer?:()=>void}){
 const [selected,setSelected]=useState<number|null>(null);const trigger=useRef<HTMLButtonElement|null>(null);
 const close=()=>{setSelected(null);requestAnimationFrame(()=>trigger.current?.focus());};
 useEffect(()=>{if(selected===null)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[selected!==null]);
 const photo=selected===null?null:archivePhotos[selected];
 return <section className={'photo-gallery section '+(compact?'photo-gallery-compact':'')} aria-labelledby={compact?'career-photos-title':'gallery-title'}><div className="section-heading reveal"><div><span className="eyebrow">BEYOND THE SCORE / THE PHOTO ARCHIVE</span><h2 id={compact?'career-photos-title':'gallery-title'}>기록 너머의 순간들.</h2><p className="gallery-intro">숫자로 읽었던 위대함을, 사진 속에서 다시 만납니다.</p></div>{onCareer&&<button className="text-btn" onClick={onCareer}>커리어 따라가기 <ArrowUpRight size={18}/></button>}</div><div className="photo-grid">{archivePhotos.map((p,i)=><button className={'photo-card reveal photo-card-'+i} key={p.src} style={{'--reveal-delay':`${i*90}ms`} as CSSProperties} onClick={e=>{trigger.current=e.currentTarget;setSelected(i);}} aria-label={p.alt+' 사진 크게 보기'}><span className="photo-image"><img src={p.src} alt={p.alt} width={p.width} height={p.height} loading="lazy" decoding="async" style={{objectPosition:p.position}}/><span className="photo-expand"><Expand size={18}/></span></span><span className="photo-caption"><span className="eyebrow">{p.kicker}</span><strong>{p.title}</strong><span>{p.copy}</span></span></button>)}</div>{photo&&<div className="photo-lightbox-backdrop" onClick={close}><section className="photo-lightbox" role="dialog" aria-modal="true" aria-label="안세영 사진 크게 보기" tabIndex={-1} ref={el=>el?.focus()} onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='ArrowRight')setSelected((selected!+1)%archivePhotos.length);if(e.key==='ArrowLeft')setSelected((selected!+archivePhotos.length-1)%archivePhotos.length);if(e.key==='Tab'){const buttons=e.currentTarget.querySelectorAll<HTMLButtonElement>('button');const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===e.currentTarget)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}><div className="photo-lightbox-top"><span>{String(selected!+1).padStart(2,'0')} / 03 · THE PHOTO ARCHIVE</span><button className="icon-btn" aria-label="사진 닫기" onClick={close}><X size={22}/></button></div><img src={photo.src} alt={photo.alt}/><div className="photo-lightbox-bottom"><div><h3>{photo.title}</h3><p>{photo.copy}</p></div><div><button className="icon-btn" aria-label="이전 사진" onClick={()=>setSelected((selected!+2)%3)}><ArrowLeft size={20}/></button><button className="icon-btn" aria-label="다음 사진" onClick={()=>setSelected((selected!+1)%3)}><ArrowRight size={20}/></button></div></div></section></div>}</section>;
}
