import {WAYSTOPS} from './waystop-data.js';
// Local coordinates are metres. All northern entrances face the same east–west road.
// The town opens north onto the junction opposite Shaolin.
export const STATIONS=[
 ['kunlun','昆仑',58],['ming','石灯院',59],['kongtong','崆峒',58],['huashan','华山',57],
 ['temple','少林寺',60.2],['wudang','武当',57],['emei','峨眉',57],['beggar','丐帮',54],['escort','平川镖局',30]
].map(([id,name,edge],index)=>({id,name,edge,x:(index-4)*200}));
export const TOWN={id:'town',name:'三四镇',edge:-62,x:0};
export const ROAD_END=-48,TOWN_END=32;
export const SOUTH_STOPS=[TOWN,...Object.entries(WAYSTOPS).map(([id,{name,x}])=>({id,name,x,edge:-36}))];
export const ALL_STOPS=[...STATIONS,...SOUTH_STOPS];
export function station(id){return ALL_STOPS.find(s=>s.id===id);}
export function origin(id){
 const s=station(id);
 return s?[s.x,(s.edge<0?TOWN_END:ROAD_END)-s.edge]:[0,0];
}
export function directions(from,to,x=0){
 const dest=station(to);if(!dest)return '';
 const originX=station(from)?.x??x;
 const fork=to==='town'?station('temple'):dest;
 const along=Math.abs(dest.x-originX)<2.98?'到十字路口':(dest.x>originX?'向东':'向西')+'沿驿道走到「'+fork.name+'」路碑';
 const exit=from==='town'?'过石桥，从北门出镇。':from==='roads'?'':station(from)?.edge<0?'沿来路出北口，走到驿道。':'沿来路出驻地南口，走到驿道。';
 return exit+along+(to==='town'?'，向南回镇。':dest.edge<0?'，向南进'+dest.name+'。':'，向北进驻地。');
}
export function nearestStation(x,stops=STATIONS){
 return stops.reduce((a,b)=>Math.abs(x-a.x)<=Math.abs(x-b.x)?a:b);
}
export function walkingHint(from,to,x,z){
 const dest=station(to);
 if(!dest||from===to)return '';
 if(from==='town')return z>0?'沿长街向北，过石桥出镇':'沿长街向北，从镇门上驿道';
 if(from!=='roads')return station(from)?.edge<0?'沿来路向北出入口，上山间驿道':'沿来路回到驻地南口，上山间驿道';
 const dx=dest.x-x;
 if(Math.abs(dx)<2.98){
  const town=dest===TOWN,end=dest.edge<0?TOWN_END:ROAD_END;
  return (town?'沿南路回三四镇':(dest.edge<0?'沿南路进':'沿北路进')+dest.name)+' · '+Math.ceil(Math.abs(z-end))+' 米';
 }
 if(Math.abs(z)>3.5)return '沿支路向'+(z>0?'北':'南')+'到驿道交叉口 · '+Math.ceil(Math.abs(z))+' 米';
 const fork=dest===TOWN?station('temple'):dest;
 return '沿驿道向'+(dx>0?'东':'西')+'到'+fork.name+'岔口 · '+Math.ceil(Math.abs(dx))+' 米';
}
export function addApproachCollision(b,id){
 const s=station(id);if(!s)return;
 const sign=s.edge<0?-1:1;
 b.at(0,0,0);b.col(5.6,.35,8,0,-.35,s.edge+sign*4);
}
export function buildHighroad(b,{root}){
 const {THREE:T,M,at,B,C,col,plaque}=b;
 const span=STATIONS.at(-1).x-STATIONS[0].x;
 const roadMat=M.paving;
 function road(x,z,w,d){
  at(0,0,0);B(w,.52,d,x,-.52,z,roadMat);
 }
 road(0,0,span+10,7);
 for(const s of STATIONS){
  road(s.x,(ROAD_END-3.5)/2,5.6,-3.5-ROAD_END);
  col(5.6,.35,7,s.x,-.35,ROAD_END-3.5);
  at(s.x+4.8,0,-5.9);B(.88,.24,.72,0,0,0,M.ashlar);B(.65,2.35,.38,0,.24,0,M.stele);
  plaque(s.name,0,1.56,.23,{h:1.48,vertical:true,bg:'#514637',fg:'#f0dfb5'});
  const west=STATIONS[STATIONS.indexOf(s)-1],east=STATIONS[STATIONS.indexOf(s)+1];
  at(s.x-4.6,0,-5.8);C(.10,.14,2.8,0,0,0,M.woodDark);
  if(west)plaque('← '+west.name,0,2.36,.13,{h:.41,bg:'#48382b'});
  if(east)plaque(east.name+' →',0,1.87,.13,{h:.41,bg:'#48382b'});
 }
 for(const site of SOUTH_STOPS){
  road(site.x,(TOWN_END+3.5)/2,5.6,TOWN_END-3.5);
  at(0,0,0);col(5.6,.35,7,site.x,-.35,TOWN_END+3.5);
  at(site.x+4.6,0,6,2);B(.18,2,.18,0,0,0,M.woodDark);
  plaque('南 · '+site.name,0,1.76,.15,{h:.44});
 }
 // Low grassy verges support a step off the pavement. A continuous bank drops
 // into the valley away from the trail. Branches end flush with their courtyards.
 const grass=M.moss.clone();grass.color.setHex(0x83956e);grass.roughness=1;
 const ground=new T.PlaneGeometry(span+210,134,172,22);ground.rotateX(-Math.PI/2);
 const p=ground.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),z=p.getZ(i);
  const distance=Math.min(Math.abs(z),z<0?Math.min(...STATIONS.map(s=>Math.abs(x-s.x))):Math.abs(x-nearestStation(x,SOUTH_STOPS).x));
  ground.attributes.uv.setXY(i,x/6,-z/6);
  p.setY(i,-.24-Math.max(0,distance-5)*.18+.06*Math.sin(x*.05+z*.11));
 }
 ground.computeVertexNormals();const bank=new T.Mesh(ground,grass);bank.receiveShadow=true;root.add(bank);
 at(0,0,0);col(span+10,.3,15,0,-.57,0);
 for(const s of STATIONS)col(10,.3,-ROAD_END,s.x,-.57,ROAD_END/2);
 for(const site of SOUTH_STOPS)col(10,.3,TOWN_END,site.x,-.57,TOWN_END/2);
 for(let x=STATIONS[0].x+17;x<STATIONS.at(-1).x;x+=42){
  const z=(Math.sin(x*1.17)>0?1:-1)*(11+3*Math.cos(x));
  if(Math.abs(x-nearestStation(x,z>0?SOUTH_STOPS:STATIONS).x)<7)continue;
  b.pine(x,-1.7,z,5.6+1.5*Math.sin(x*.13));b.shrub(x+3,-1.2,z*.88,1.4);
 }
 for(const s of STATIONS){
  b.pine(s.x-9,-.85,-15,6.6);b.boulder(s.x+8.7,-.85,-12,1.35);
  b.shrub(s.x+7.6,-.8,-10,1.1);
 }
 return {id:'roads',name:'山间驿道',spawn:{p:[0,0,22],yaw:0},guide:'北路通各派，南路通城镇、作坊和渡口',
  locate(p){return '山间驿道 · '+nearestStation(p.x,p.z>3.5?SOUTH_STOPS:p.z<-3.5?STATIONS:ALL_STOPS).name+'岔口';}};
}
