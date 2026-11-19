import {townSurfaces} from './surfaces.js';
import {WAYSTOPS} from './waystop-data.js';
import {timberHall,meetingTable} from './precinct-kit.js';
import {timberBetween} from './joinery.js';
import {teaService} from './room-furnishings.js';

// Planks and paths use the same physical surfaces as the rest of the world.
function ground(b,x,z,w,d,top=b.M.paving){
 b.at(x,0,z);b.B(w,2.1,d,0,-2.25,0,b.M.cliff);b.B(w,.15,d,0,-.15,0,top);
}
function beach(b,x,z,w,d){
 // A sloping strand hides the masonry foundation below the waterline.
 const pos=[],rings=[],segments=48;
 for(const [extra,h] of [[-.15,-.04],[1.2,-.30],[3.3,-1.24]]){
  const ring=[];
  for(let i=0;i<segments;i++){
   const t=i/segments*2*Math.PI,c=Math.cos(t),s=Math.sin(t);
   const edge=1/Math.max(Math.abs(c)/(w/2),Math.abs(s)/(d/2));
   const r=edge+extra*(1+.17*Math.sin(t*5));
   ring.push([c*r,h,s*r]);
  }
  rings.push(ring);
 }
 for(let j=0;j<2;j++)for(let i=0;i<segments;i++){
  const n=(i+1)%segments,inside=rings[j],outside=rings[j+1];
  pos.push(...inside[i],...inside[n],...outside[n],...inside[i],...outside[n],...outside[i]);
 }
 const geom=new b.THREE.BufferGeometry();geom.setAttribute('position',new b.THREE.Float32BufferAttribute(pos,3));geom.computeVertexNormals();
 const mesh=new b.THREE.Mesh(geom,new b.THREE.MeshStandardMaterial({color:0xb8a98a,roughness:1,side:b.THREE.DoubleSide}));mesh.position.set(x,0,z);mesh.receiveShadow=true;
 return mesh;
}
function deck(b,x,z,w,d){
 b.at(x,0,z);
 const n=Math.ceil(d/.46);
 for(let i=0;i<n;i++)b.B(w,.15,d/n-.012,0,-.15,(i+.5)*d/n-d/2,b.M.wood,false);
 for(const side of [-1,1]){
  b.B(.20,.28,d,side*(w/2-.25),-.43,0,b.M.woodDark,false);
  for(let i=0;i<=Math.ceil(d/4);i++)b.C(.13,.16,2.6,side*(w/2-.25),-2.9,d*(i/Math.ceil(d/4)-.5),b.M.woodDark,false);
 }
 b.col(w,.15,d,0,-.15,0);
}
function water(b,x,z,w,d){
 b.at(x,-.72,z);b.B(w,.07,d,0,-.07,0,b.M.water,false);
}
function bridge(b,x,z,w,d){
 deck(b,x,z,w,d);
 for(const side of [-1,1]){
  b.at(x,0,z);
  const bx=side*(w/2-.16);
  b.B(.12,.10,d,bx,.92,0,b.M.wood);
  for(let i=0;i<=Math.ceil(d/3);i++)b.B(.15,1.12,.15,bx,0,d*(i/Math.ceil(d/3)-.5),b.M.woodDark);
 }
}
function coils(b,x,y,z,count){
 b.at(x,y,z);
 for(let i=0;i<count;i++){
  const hoop=new b.THREE.TorusGeometry(.29+i*.059,.038,6,26);
  hoop.rotateX(Math.PI/2);b.G(hoop,b.M.sack,0,.04,0);
 }
}
function stool(b,x,z,y=0){
 b.at(x,y,z);b.B(1.28,.12,.68,0,.40,0,b.M.wood);
 for(const side of [-1,1])b.B(.13,.40,.53,side*.46,0,0,b.M.woodDark);
}
function sailboat(b,x,z){
 // Hull strakes meet along the keel and rise at the bow and stern.
 b.at(x,-.55,z);
 const stations=[[-3.8,.08,.63],[-2.7,.84,.48],[0,1.05,.42],[2.6,.79,.47],[3.7,.15,.65]];
 for(let i=1;i<stations.length;i++){
  const [az,aw,ah]=stations[i-1],[bz,bw,bh]=stations[i];
  for(const side of [-1,1])for(let plank=0;plank<4;plank++){
   const f=(plank+.5)/4;
   timberBetween(b,[side*aw*(.32+.68*f),ah*f,az],[side*bw*(.32+.68*f),bh*f,bz],.19,.15,b.M.wood);
  }
 }
 for(const z of [-1.85,0,1.7])b.B(1.49,.11,.38,0,.39,z,b.M.woodDark,false);
}
// Low banks, dry ridges and open sea have different horizon lines. The mesh
// stays below the walked surfaces and the road; only the scenery uses its heights.
function surroundings(b,root,id,coastal){
 const {THREE:T}=b,sea=id==='islands'||id==='whale'||id==='sand',canyon=id==='wushan',dry=id==='vajra'||id==='persia';
 const geo=new T.PlaneGeometry(480,330,80,55);geo.rotateX(-Math.PI/2);geo.translate(0,0,105);
 const pos=geo.attributes.position,colors=[],color=new T.Color();
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),z=pos.getZ(i);
  const rise=Math.min(1,Math.max(0,(Math.max(Math.abs(x)-30,z-36))/38));
  const noise=Math.sin(x*.064+z*.019)*.45+Math.cos(z*.064-x*.027)*.35+Math.sin(x*.135+z*.123)*.20;
  const height=dry?19:canyon?40:9;
  let h=-.38+rise*height*(.85+noise);
  if((coastal&&x>7)||id==='islands')h=-3.8+(sea?0:Math.max(0,Math.min(1,(x-48)/17))*height*(.85+noise));
  if(canyon&&z>-.8&&z<10.2)h=-4;
  if(z< -27)h=Math.min(h,-.7-(Math.abs(z)-27)*.15);
  pos.setY(i,h);
  color.setHex(dry?0xb19b78:canyon?0x71806b:sea?0x98957d:0x84906a).multiplyScalar(.92+noise*.12);
  colors.push(color.r,color.g,color.b);
 }
 geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
 const banks=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:1}));banks.receiveShadow=true;root.add(banks);
}
function clothStall(b,x,z,cloth){
 b.at(x,0,z);
 for(const dx of [-2.5,2.5])for(const dz of [-1.5,1.5])b.C(.076,.10,2.9,dx,0,dz,b.M.woodDark);
 for(const side of [-1,1])b.B(5.36,.15,.15,0,2.75,side*1.5,b.M.woodDark,false);
 for(let i=0;i<6;i++){
  const stripe=new b.THREE.BoxGeometry(.90,.06,3.45);stripe.rotateX(-.12);
  b.G(stripe,i%2?b.M.sack:cloth,(i-2.5)*.90,2.96,0);
 }
 b.B(4.25,.14,1.08,0,.85,0,b.M.wood);
 for(const dx of [-1.74,1.74])b.B(.18,.85,.70,dx,0,0,b.M.woodDark);
 for(const [i,mat] of [cloth,b.M.sack,b.M.robe,b.M.drum].entries()){
  const bolt=new b.THREE.CylinderGeometry(.18,.18,.89,14);bolt.rotateX(Math.PI/2);
  b.G(bolt,mat,(i-1.5)*.85,1.17,0);
 }
}
function* buildStop(id,b,a,surfaces){
 const info=WAYSTOPS[id],{M,THREE:T}=b;
 const coastal=['sanjiang','eagle','sand','whale'].includes(id);
 const stone=['vajra','wushan'].includes(id);
 const siteMat=surfaces.stone;siteMat.color.setHex(stone?0xc6bbac:coastal?0xcbbfa9:0xd2c4a9);
 const cloth=M.robe.clone();cloth.color.setHex(id==='persia'?0x994831:0x57786b);
 ground(b,0,-32,6,8); // -36 touches the road, -28 touches the local courtyard.
 yield;
 let hall=[-13,8],shelter=[10,18],host=[-7,9],first,second,landmark,finish;
 const point=(x,y,z)=>new T.Vector3(x,y,z);
 const sign=(name,x,z)=>{
  b.at(x,0,z,2);b.B(.15,1.67,.15,0,0,0,M.woodDark);
  b.plaque(name,0,1.52,.12,{h:.39,bg:'#443c32',fg:'#f0ddb3'});
 };
 const reveal=(draw)=>{const group=b.solo(draw);group.name=id+':finished-work';return group;};
 yield;
 if(id==='islands'){
  // Three pieces of land with visible water between them, connected by timber footbridges.
  water(b,0,97,455,264);
  ground(b,0,-20,24,16,M.sack);bridge(b,0,-8,4.2,8);
  ground(b,0,1,21,10,M.rock);bridge(b,0,10,4.2,8);
  ground(b,0,23,30,18,M.ashlar);
  for(const [z,w,d] of [[-20,24,16],[1,21,10],[23,30,18]])a.root.add(beach(b,0,z,w,d));
  hall=[6,24];shelter=[-6,-20];host=[7,1];
 }else if(id==='wushan'){
  water(b,0,3,68,13);ground(b,0,-14,46,28,M.ashlar);
  bridge(b,1,4.5,4.5,9);ground(b,0,21,45,24,siteMat);
  hall=[-9,-12];shelter=[11,21];host=[-5,1+10];
 }else if(coastal){
  ground(b,-9,2,34,60,siteMat);water(b,116,76,216,219);
  deck(b,14,4,12,5);deck(b,22,4,4,17);
  hall=[-14,11];shelter=[-14,-10];host=[4,4];
  for(const z of [-22,-14,17,25]){b.at(7.3,0,z);for(let i=0;i<8;i++)b.C(.025,.042,1+(i%3)*.18,(i%3)*.17,0,i*.24,M.bamboo,false,6);}
 }else{
  ground(b,0,2,50,60,id==='fist'?M.paving:siteMat);
 }
 yield;
 surroundings(b,a.root,id,coastal);
 const spacious=id==='whale'||id==='persia';
 timberHall(b,hall[0],hall[1],0,info.hall,{width:spacious?15:11.8,depth:spacious?9.5:7.4,height:id==='vajra'?4.2:3.35,gable:true,open:spacious||id==='fivephoenix',stone,turn:2});
 timberHall(b,shelter[0],shelter[1],0,info.shelter,{width:9.2,depth:6.4,height:2.9,open:true,gable:true,turn:2});
 // A visible tea tray and a bench with a clear approach at every shelter.
 meetingTable(b,shelter[0]-2,shelter[1]+.85,.26,2.6);
 b.at(shelter[0]-2,1.20,shelter[1]+.85);teaService(b);
 yield;
 stool(b,shelter[0]-2,shelter[1]-.72,.26);
 a.rest(id+':rest',point(shelter[0]-2,.78,shelter[1]-.72),Math.PI,'坐下歇脚',{bench:true,exit:point(shelter[0]-.7,.26,shelter[1]-.72)});
 if(id==='persia'){
  // A standing warp-weighted loom, a passing shuttle, and bolts shaded by a canopy.
  first=[-10,7];second=[-14,7];landmark='织机';
  b.at(-12,.26,8);
  for(const x of [-2.2,2.2]){b.B(.19,2.65,.23,x,0,0,M.woodDark);b.B(.60,.14,1.35,x,0,0,M.wood);}
  for(const y of [.65,2.5])b.B(4.6,.15,.18,0,y,0,M.wood);
  for(let i=0;i<35;i++)b.C(.012,.012,1.72,-1.8+i*.105,.75,0,M.sack,false,6);
  b.B(3.71,.55,.065,0,.75,-.07,cloth,false);
  finish=reveal(()=>{b.at(-12,.26,8);b.B(3.71,.68,.065,0,1.30,-.07,cloth,false);
   for(let i=0;i<5;i++)b.B(3.72,.04,.019,0,1.34+i*.12,-.112,M.sack,false);});
  clothStall(b,7,-6,cloth);clothStall(b,14,-6,M.drum);
  b.at(-12,.26,8);b.S(.36,.55,1.53,-.12,M.woodDark,1.4,.18,.22,14,8);
 }else if(id==='vajra'){
  first=[5,-8];second=[-13,6];landmark='石关';
  b.at(0,0,-16);for(const x of [-3.8,3.8]){b.B(2.4,4.3,2.1,x,0,0,M.ashlar);b.B(2.65,.25,2.4,x,4.3,0,M.marble);}
  b.B(9.7,.60,2.2,0,4.35,0,M.ashlar);b.at(0,0,-16,2);b.plaque('石关',0,4.62,1.13,{h:.46});
  sign('西行驿程',5,-7);
  for(const [x,z,r] of [[19,-16,2.4],[-18,-20,3.2],[20,10,2.7],[-20,24,4.1]])b.boulder(x,-.35,z,r);
  b.at(7,0,12.5);for(const dx of [-1.6,1.6])b.C(.13,.17,1.36,dx,0,0,M.woodDark);b.B(3.52,.14,.13,0,1.1,0,M.wood);
  meetingTable(b,-13,7,.26,3.3);
  b.at(-13,1.20,7);b.B(1.62,.05,.74,0,0,0,M.paper,false);
  finish=reveal(()=>{b.at(-13,1.25,7);b.B(.47,.06,.27,0,0,0,M.wood,false);});
  b.at(12,.26,19);b.B(3,.16,.9,0,.22,0,M.woodDark);
  for(const x of [-1.43,1.43])b.B(.14,.53,.88,x,.15,0,M.wood);
  for(const z of [-.40,.40])b.B(3,.41,.11,0,.27,z,M.wood);
  b.sacks(13,.26,17,3,true);
 }else if(id==='wushan'){
  first=[2.7,-2.3];second=[2.8,12];landmark='峡口栈桥';
  sign('出峡',3.6,-2.8);sign('回寨',3.6,12.9);
  for(const [x,z,r] of [[-17,-2,5],[18,1,6],[-16,12,4.8],[18,13,4]])b.boulder(x,-1,z,r);
  finish=reveal(()=>{b.at(3.6,0,12.9,2);b.B(.43,.51,.03,0,.74,.105,cloth,false);});
 }else if(id==='fist'){
  first=[4,-5];second=[4,3];landmark='柳巷练步坪';
  b.at(5,0,-1);b.B(10,.07,13,0,0,0,M.wood,false);
  for(const z of [-4,4])b.B(7,.015,.10,0,.072,z,M.sack,false);
  b.at(7,0,-5);b.B(.94,.13,.56,0,.72,0,M.wood);for(const x of [-.35,.35])b.B(.12,.72,.38,x,0,0,M.woodDark);
  b.B(.7,.06,.19,0,.85,0,M.bamboo,false);
  finish=reveal(()=>{b.at(8,0,3);b.B(.69,.06,.37,0,.073,0,cloth,false);});
  // Street-front shop and yard wall frame the two practice lines.
  b.at(0,0,22);b.B(30,1.26,.37,-5,0,0,M.brick);b.B(30.25,.13,.52,-5,1.26,0,M.tile,false);
  for(const dx of [-17,3]){b.at(dx,0,-14);b.B(2.9,.16,1.05,0,.89,0,M.wood);for(const end of [-1,1])b.B(.17,.89,.58,end*1.22,0,0,M.woodDark);}
  for(const x of [-19,19])b.ginkgo(x,0,-18,6);
 }else if(id==='fivephoenix'){
  first=[-15,6];second=[-10,9];landmark='农具炉房';
  b.at(-15,.26,8);b.B(1.58,1.3,1.38,0,0,0,M.brick);b.B(.96,1.8,.93,0,1.3,.23,M.brick);
  b.B(.82,.59,.04,0,.37,-.71,M.ink,false);b.B(.59,.12,.05,0,.38,-.74,M.drum,false);
  b.at(-11,.26,9);b.B(2,.14,.27,0,.91,0,M.wood);
  for(const x of [-.82,.82])b.B(.14,.91,.27,x,0,0,M.woodDark);
  function hoe(x,y,z){b.at(x,y,z);b.C(.05,.06,1.05,0,0,0,M.wood,false);b.B(.42,.09,.25,0,1.02,-.09,M.iron,false);}
  hoe(-14,.26,6.9);finish=reveal(()=>hoe(-10.8,.26,8.75));
  for(const z of [1,12,24])b.bamboo(19,0,z);
 }else if(id==='sanjiang'){
  first=[22,-1];second=[21.7,7];landmark='系船栈台';sailboat(b,25,-.2);
  for(const z of [-1.2,7.6]){b.at(23.4,0,z);b.C(.19,.24,1,0,0,0,M.woodDark);}
  b.at(0,0,0);timberBetween(b,[23.4,.65,-1.2],[25.1,.06,-3.4],.07,.07,M.sack);
  finish=reveal(()=>coils(b,22,.002,7.2,5));
 }else if(id==='eagle'){
  first=[21.6,1];second=[-14,10];landmark='芦湾水尺';
  b.at(23.8,-1.2,1);b.B(.41,3.05,.19,0,0,0,M.wood);
  for(let i=0;i<14;i++)b.B(i%2?.14:.28,.037,.026,-.04,.24+i*.19,-.106,M.paper,false);
  meetingTable(b,-14,11,.26,3.2);b.at(-14,1.20,11);b.B(1.4,.035,.76,0,0,0,M.paper,false);
  finish=reveal(()=>{b.at(-14,1.24,11);b.B(.72,.008,.06,0,0,0,M.ink,false);});
  sailboat(b,26.2,7.7);
 }else if(id==='sand'){
  first=[2,-9];second=[3,12];landmark='盐池与盐筐';
  for(const z of [-11,-5,1]){
   b.at(2,0,z);b.B(7,.12,4.8,0,0,0,M.marble,false);b.B(6.65,.025,4.45,0,.121,0,M.water,false);
   for(let i=0;i<32;i++){
    const size=.06+(i%5)*.028;
    b.B(size,.04+size*.31,size*.82,-2.95+(i%16)*.39,.15,-1.82+(i%4)*.12+Math.floor(i/16)*.31,M.paper,false);
   }
  }
  for(const x of [-19,-16.8,-14.6])b.crate(x,.26,13,.77);
  b.at(3,0,13);b.C(.69,.51,.42,0,0,0,M.sack);finish=reveal(()=>{b.at(3,0,13);b.S(.61,0,.42,0,M.paper,1,.42,1,16,8);});
  b.sacks(-16,.26,10,3,true);
 }else if(id==='whale'){
  first=[-15,9];second=[-11,14];landmark='修船坞';
  b.at(-13,.26,12);
  for(let i=-3;i<=3;i++){
   const width=1.8-Math.abs(i)*.32;
   for(const side of [-1,1]){
    timberBetween(b,[0,.38,i],[side*width*.72,.78,i],.13,.13,M.woodDark);
    timberBetween(b,[side*width*.72,.78,i],[side*width,1.58,i],.13,.13,M.wood);
   }
  }
  b.B(.19,.24,6.6,0,.24,0,M.woodDark);for(const z of [-2,2])b.B(2.5,.24,.28,0,0,z,M.woodDark);
  finish=reveal(()=>{b.at(-13,.26,12);for(let i=-3;i<3;i++)timberBetween(b,[1.8-Math.abs(i)*.32,1.47,i],[1.8-Math.abs(i+1)*.32,1.47,i+1],.10,.30,M.wood);});
  sailboat(b,25,4);coils(b,21,0,8,4);
 }else{
  first=[2,-20];second=[2,.4];landmark='白沙湾与灯塔礁';
  sign('白沙湾',3,-20);sign('北岬',3.6,15.1);
  b.at(2,0,-20);for(let i=0;i<5;i++)b.B(.82,.012,.06,(i-2)*.83,.004,i%2*.14,M.woodDark,false);
  b.at(3,0,1);b.C(1.4,1.7,3.2,0,0,0,M.ashlar,true,16);
  b.C(.86,1.42,.36,0,3.2,0,M.ashlar,false,16);
  for(const x of [-.6,.6])for(const z of [-.6,.6])b.C(.07,.08,1.32,x,3.56,z,M.woodDark,false);
  b.C(.12,1.19,.64,0,4.88,0,M.tile,false,8);b.C(.42,.34,.23,0,3.56,0,M.bronze,false,16);
  finish=reveal(()=>{b.at(3,0,1);b.S(.32,0,3.99,0,M.lantern,.83,1.32,.83,16,8);});
  for(const [x,z] of [[-9,-15],[8,-20],[-6,2],[10,29]])b.boulder(x,-.13,z,1.1);
 }
 yield;
 const teacher=a.npc(info.host,[host[0],0,host[1]],Math.PI,{robe:stone?1:3,hat:coastal,bag:id==='vajra',bun:!coastal},info.talk);
 if(id==='fist'){
  const spot=point(host[0],0,host[1]-2.7);
  teacher.f.post=f=>a.practice.teacherPose(f,teacher.t,3);
  a.on('fist:mentor',spot.clone().add(point(0,1.3,0)),2.25,'求师 · 对拍切磋',()=>a.trade.mentor(match=>a.practice.start(spot,0,teacher.f,3,match?'match':'study')));
 }
 const [resident,residentPosition,look,words]=info.resident;
 yield;
 a.npc(resident,residentPosition,Math.PI*.82,look,words);
 // The entrance sign faces north, so visitors can read it while walking south.
 sign(info.name,3.5,-25);
 a.on(id+':route',point(3.5,1.55,-25.4),2.8,'读路牌',()=>a.card(info.name,'驿道南支',info.talk+' 回三四镇可沿来路向北，认驿道路碑。'));
 let step=[1,2].includes(a.savedState?.step)?a.savedState.step:0;
 finish.visible=step===2;
 const targets=[first,second];
 yield;
 targets.forEach(([x,z],i)=>{
  a.on(id+':work:'+i,point(x,1.28,z),2.65,()=>info.steps[i],()=>{
   if(i>step){a.message('先到'+landmark+'，'+info.steps[0]+'。');return;}
   if(i===step){
    step++;
    if(step===2){finish.visible=true;a.learn(id+'-visit');}else a.checkpoint();
   }
   a.sound(i===0&&id==='fist'?'fish':'take');
   a.message(info.notes[i]+(step===2&&i===1?' 已记入行旅簿。':''));
  });
 });
 return {id,name:info.name,subtitle:landmark+' · '+info.lesson,spawn:{p:[0,0,-31],yaw:Math.PI},
  guide:info.talk,guideText:()=>step<2?info.name+' · '+info.steps[step]:info.lesson+'已记入行旅簿 · 向北回驿道',
  locate(p){if(p.z<-23)return info.name+' · 北口';if(Math.hypot(p.x-hall[0],p.z-hall[1])<7)return info.name+' · '+info.hall;if(Math.hypot(p.x-shelter[0],p.z-shelter[1])<6)return info.name+' · '+info.shelter;return info.name+' · '+landmark;},
  tick:surfaces.sync,snapshot:()=>({step})};
}
export const waystopBuilders=Object.fromEntries(Object.keys(WAYSTOPS).map(id=>[id,function*(b,a){
 const surfaces=townSurfaces(b.THREE,b.M);
 const paper=new b.THREE.MeshStandardMaterial({color:0xefe8d2,roughness:1});
 const plaster=new b.THREE.MeshStandardMaterial({color:id==='persia'?0xc6a080:0xbebbac,roughness:1});
 const palette={wood:surfaces.wood,red:plaster,paper,marble:surfaces.stone};
 const stages=buildStop(id,b,a,surfaces);
 for(;;){const step=b.palette(palette,()=>stages.next());if(step.done)return step.value;yield;}
}]));
