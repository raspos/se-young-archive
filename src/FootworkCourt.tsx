import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';

export default function FootworkCourt({direction,view,speed}:{direction:number;view:number;speed:number}) {
 const target=useRef<HTMLDivElement>(null);
 const [failed,setFailed]=useState(false);
 const [replay,setReplay]=useState(0);
 useEffect(()=>{
  const host=target.current;
  if(!host)return;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#0b251c');
  const camera=new THREE.PerspectiveCamera(40,1,.1,90);
  camera.position.copy([new THREE.Vector3(0,21,.01),new THREE.Vector3(0,6,18),new THREE.Vector3(17,7,1)][view]);
  camera.lookAt(0,0,0);
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  host.appendChild(renderer.domElement);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(6.1,13.4),new THREE.MeshBasicMaterial({color:'#174934',side:THREE.DoubleSide}));
  floor.rotation.x=-Math.PI/2;scene.add(floor);
  const marks:THREE.Vector3[]=[];
  const segment=(x:number,z:number,ex:number,ez:number)=>marks.push(new THREE.Vector3(x,.02,z),new THREE.Vector3(ex,.02,ez));
  for(const x of [-3.05,-2.59,2.59,3.05])segment(x,-6.7,x,6.7);
  for(const z of [-6.7,-5.94,-1.98,0,1.98,5.94,6.7])segment(-3.05,z,3.05,z);
  segment(0,-6.7,0,-1.98);segment(0,1.98,0,6.7);
  scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(marks),new THREE.LineBasicMaterial({color:'#c7dcc1'})));
  const player=new THREE.Mesh(new THREE.SphereGeometry(.24,16,12),new THREE.MeshBasicMaterial({color:'#cbff68'}));scene.add(player);
  const start=new THREE.Vector3(0,.27,3.3);
  const stop=new THREE.Vector3(direction===0?-1.9:2,.27,direction===0?1:5.8);
  const route=new THREE.QuadraticBezierCurve3(start,new THREE.Vector3(stop.x*.4,.27,(start.z+stop.z)/2),stop);
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(route.getPoints(22)),new THREE.LineBasicMaterial({color:'#cbff68'})));
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const paint=()=>renderer.render(scene,camera);
  const resize=()=>{const width=host.clientWidth;const height=280;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();paint();};
  const observer=new ResizeObserver(resize);observer.observe(host);
  const begin=performance.now();let frame=0;
  const draw=(now:number)=>{
   const elapsed=Math.min(1,(now-begin)*speed/2400);
   const at=reduce.matches?1:elapsed;
   player.position.copy(route.getPoint(at));paint();
   if(at<1)frame=requestAnimationFrame(draw);
  };
  resize();frame=requestAnimationFrame(draw);
  return ()=>{cancelAnimationFrame(frame);observer.disconnect();scene.traverse(o=>{
   if(o instanceof THREE.Mesh||o instanceof THREE.Line){o.geometry.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>m.dispose());}
  });renderer.dispose();renderer.domElement.remove();};
 },[direction,view,speed,replay]);
 if(failed)return <p>3D 코트를 열 수 없습니다. {direction===0?'전위 이동은 중심에서 네트 쪽 대각선으로 출발합니다.':'후위 이동은 중심에서 뒤쪽 대각선으로 출발합니다.'}</p>;
 return <figure className="anatomy-court"><div ref={target} role="img" aria-label="3D 풋워크 이동 경로"/><figcaption><span>전술 교육용 도식</span><button className="text-btn" onClick={()=>setReplay(n=>n+1)}>다시 재생</button></figcaption></figure>;
}
