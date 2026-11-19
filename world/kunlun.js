import {kunlunCourts} from './sect-courts.js';
import {townSurfaces} from './surfaces.js';
import {mountainLandscape} from './landscape.js';
import {graniteMaterial,cliffGeometry} from './granite.js';
import {buildPines} from './pine.js';
import {hash2} from './landscape-field.js';
import {createQinLesson} from './qin-lesson.js';

// Authored snow-mountain school: a sheltered listening court, a frozen pool,
// a tea room and a continuous stair to a high lookout. No real-site claim.
export function* buildKunlun(b,a){
 const {THREE:T,M,at,B,C,G,S,col,roof,hall,plaque,rail,plight}=b,V=T.Vector3,root=a.root,P=(x,y,z)=>new V(x,y,z);
 const surfaces=townSurfaces(T,M),{stone,wood,soil,cloth}=surfaces;stone.color.setHex(0xb6c0c3);cloth.color.setHex(0x829a9d);
 const granite=graniteMaterial(T,M.cliff);granite.material.color.setHex(0xaab7bd);
 const snow=new T.MeshStandardMaterial({color:0xe6edf0,roughness:.98}),plaster=new T.MeshStandardMaterial({color:0xc7ccc4,roughness:1});
 const tile=M.tile.clone();tile.color.setHex(0x82949c);const paint=M.paint.clone();paint.color.setHex(0x3f626c);
 const kit=fn=>b.palette({red:plaster,wood:M.woodDark,paint,tile,eave:wood,gold:M.bronze},fn);
 yield;
 const label=(text,x,y,z,r=0,h=.55)=>{at(x,y,z,r);plaque(text,0,0,0,{h,bg:'#314e59',fg:'#e9e1c6'});};
 const seat=(id,x,y,z,yaw,text)=>{b.palette({cushion:cloth},()=>b.cushion(x,y,z,yaw));a.rest(id,P(x,y,z),yaw,text);};
 function mesh(g,m,p,parent=root){const o=new T.Mesh(g,m);o.position.copy(p);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function ledge(x,z,w,d,y,clearance){at(x,0,z);B(w,1,d,0,y-1,0,M.ashlar);B(w,.035,d,0,y,0,stone,false);
  const cliff=mesh(cliffGeometry(T,{x,z,w,d,y,bottom:-38,clearance}),granite.material,P(0,0,0));cliff.name='kunlun:cliff';}
 function bank(x,y,z,sx,sz,h=.35){at(0,0,0);const g=new T.SphereGeometry(1,18,8);g.scale(sx,h,sz);G(g,snow,x,y-.06,z);}
 function stairs(x,z,w,base,rise,n){at(x,base,z);for(let i=0;i<n;i++){const y=rise*(i+1)/n;B(w,y-.025,.7,0,0,-(i+.5)*.7,M.ashlar);B(w,.025,.7,0,y-.025,-(i+.5)*.7,stone);}
  for(const s of[-1,1])for(let i=0;i<n;i+=3)rail(x+s*(w/2+.25),z-i*.7,x+s*(w/2+.25),z-Math.min(n,i+3)*.7,base+rise*(i+1.5)/n);}
 yield;
 const clear=[[-4,4,19,33],[23,31,-42,-23]];
 ledge(0,44,16,28,0,clear);ledge(0,-3,72,48,2.4,clear);ledge(15,-49,42,17,6,clear);
 stairs(0,31.4,6,0,2.4,16);stairs(27,-24.4,5.2,2.4,3.6,24);
 for(const s of[-1,1]){rail(s*8,57,s*8,50,0);rail(s*8,40,s*8,30,0);rail(s*8,30,s*3.5,30,0);rail(s*8,57,s*3,57,0);}

 rail(-36,21,-3.5,21,2.4);rail(3.5,21,36,21,2.4);rail(-36,21,-36,-27,2.4);rail(36,21,36,-27,2.4);
 rail(-36,-27,-27,-27,2.4);rail(-1,-27,23.8,-27,2.4);rail(30.2,-27,36,-27,2.4);rail(-6,-40.5,23.8,-40.5,6);rail(30.2,-40.5,36,-40.5,6);
 yield;
 rail(-6,-40.5,-6,-57.5,6);rail(36,-40.5,36,-57.5,6);rail(-6,-57.5,25,-57.5,6);rail(33,-57.5,36,-57.5,6);
 // Open mountain gate. Snow lies at the edges; the swept route stays clear.
 at(0,0,38);for(const x of[-3.5,3.5]){B(.72,.45,.72,x,0,0,M.ashlar);C(.23,.28,4.2,x,.45,0,M.woodDark);}B(7.7,.34,.4,0,4.6,0,wood,false);kit(()=>roof(10,5,1.6,.4,0,5,0));label('昆仑',0,4.3,38.3,0,.9);
 for(const side of[-1,1])for(let i=0;i<7;i++)bank(side*(5.3+(i%2)*.7),0,54-i*3.3,1.6,2.1,.3+(i%3)*.07);
 at(0,0,0);B(25,3.4,3,-14,-1,-28.5,M.ashlar);
 // A school house with a working instrument, not a decorative music sign.
 kit(()=>hall(-14,-21.5,2.4,0,22,14,{name:'听雪琴院',plat:.48,ch:4.1,porch:2.3,doors:3,empty:true,mountainWindow:true,inner:'山静弦清',couplet:['雪落无声山自静','弦回有韵客从容']}));
 yield;
 at(-14,2.88,-20.3);B(3,.13,1.4,0,.7,0,wood);for(const x of[-1.3,1.3])for(const z of[-.55,.55])B(.13,.7,.13,x,0,z,M.woodDark);
 // The broad head and bridge lie at the player's right; the tail narrows to the left.
 const body=new T.Shape();body.moveTo(2,-.38);
 body.bezierCurveTo(1.8,-.43,1.67,-.27,1.5,-.28);body.bezierCurveTo(1.31,-.28,1.28,-.46,1.10,-.46);
 body.bezierCurveTo(.30,-.44,-.31,-.36,-.52,-.33);body.bezierCurveTo(-.75,-.18,-.93,-.32,-1.09,-.31);
 body.quadraticCurveTo(-1.67,-.28,-2,-.22);body.lineTo(-2,.22);
 body.quadraticCurveTo(-1.67,.28,-1.09,.31);body.bezierCurveTo(-.93,.32,-.75,.18,-.52,.33);
 yield;
 body.bezierCurveTo(-.31,.36,.30,.44,1.10,.46);body.bezierCurveTo(1.28,.46,1.31,.28,1.5,.28);
 body.bezierCurveTo(1.67,.27,1.8,.43,2,.38);body.closePath();
 const instrument=new T.Group();instrument.name='kunlun:qin';instrument.scale.setScalar(.31);instrument.position.set(-14,3.74,-20.3);root.add(instrument);
 const lacquer=new T.MeshStandardMaterial({color:0x482e24,roughness:.35}),ivory=new T.MeshStandardMaterial({color:0xe0d2ae,roughness:.4});
 const bg=new T.ExtrudeGeometry(body,{depth:.13,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.035});bg.rotateX(-Math.PI/2);mesh(bg,lacquer,P(0,0,0),instrument);
 for(const x of [-1.03,1.75])for(const z of [-.14,.14])mesh(new T.CylinderGeometry(.07,.08,.10,12),M.woodDark,P(x,-.05,z),instrument);
 mesh(new T.BoxGeometry(.072,.057,.65),M.woodDark,P(1.8,.191,0),instrument);
 yield;
 mesh(new T.BoxGeometry(.07,.037,.47),M.woodDark,P(-1.8,.181,0),instrument);
 // Thirteen hui mark harmonic nodes along the sounding length, counted from the bridge.
 const hui=[1/8,1/6,1/5,1/4,1/3,2/5,1/2,3/5,2/3,3/4,4/5,5/6,7/8];
 hui.forEach((fraction,i)=>{
  const marker=mesh(new T.SphereGeometry(i===6?.030:.025,12,8),ivory,P(1.8-3.6*fraction,.164,-.233),instrument);
  marker.scale.y=.32;
 });
 yield;
 const stringStyle={color:0xc9b78c,metalness:.3,roughness:.45,emissive:0xc28b3a,emissiveIntensity:0};
 const strings=[],ages=Array(7).fill(10);
 for(let i=0;i<7;i++){const curve=new T.LineCurve3(P(-1.8,-.020,0),P(1.8,0,0));const g=new T.TubeGeometry(curve,28,.007,4,false),s=mesh(g,new T.MeshStandardMaterial(stringStyle),P(0,.22,(i-3)*.07),instrument);s.name='kunlun:string:'+i;strings.push({s,base:g.attributes.position.array.slice()});}
 const lesson=createQinLesson(()=>{a.learn('kunlun-qin');a.message('低、中、高，再回中音 · 听弦小记已记入行旅。');},a.savedState);
 const qin={pluck(n){ages[n]=0;}};
 a.on('kunlun:qin',P(-14,3.9,-19.4),2.8,'琴案听弦 · 亲手拨一声',()=>a.qin.open({p:P(-14,2.88,-17.95),yaw:0,lesson,instrument:qin,save:a.checkpoint}));
 for(const x of[-6,6])seat('kunlun:hall:'+x,x-14,2.88,-21.5,0,'琴院静坐');
 yield;
 a.npc('守琴人',[-8,2.88,-25.5],0,{robe:1,bun:true,long:true},'风穿过琴窗，席上也能听见松枝响。听雪时不妨坐到琴案前，拨一、四、七弦，听同一张琴怎样唱出低、中、高三种声音。');
 at(-21,2.88,-27.3);B(3,.85,1.1,0,0,0,wood);for(let i=0;i<4;i++)B(.55,.04,.45,-.9+i*.6,.86,0,M.paper,false);
 a.on('kunlun:score',P(-21,4,-26.2),2.5,'读听弦小记',()=>a.card('听弦小记','先听音高，再随短句','七弦旁十三个小点称为琴徽，标示泛音的位置。轻拨琴弦，音声渐弱。本段练习只认低、中、高的变化：一、四、七、四。弦位提示会随声亮起；关闭声音，也能按提示慢慢练习。琴院与短句为三四创作。'));
 // West tea shelter: open front and supported timber, with small warm lamps.
 at(-24,2.4,-4);B(17,.24,15,0,0,0,stone);B(17,.025,15,0,.24,0,wood,false);
 for(const x of[-7.5,7.5])for(const z of[-6.5,6.5]){B(.65,.3,.65,x,.265,z,M.ashlar);C(.19,.23,3.8,x,.565,z,M.woodDark);}
 B(17,3.9,.35,0,.26,-7.5,plaster);B(.35,3.9,15,-8.5,.26,0,plaster);
 yield;
 for(const z of[-6.5,6.5])B(15.5,.3,.3,0,4.1,z,M.woodDark,false);for(let x=-7;x<=7;x+=1.2)B(.12,.2,13,x,4.1,0,wood,false);
 kit(()=>roof(19,17,2,.4,0,4.5,0));label('煨茶歇雪',-24,5.9,2.8,0,.65);
 for(const z of[-8,-4,0])seat('kunlun:tea:'+z,-29,2.665,z,Math.PI/2,'茶亭歇脚');
 at(-23,2.665,-5);B(4,.12,1.7,0,.73,0,wood);for(const x of[-1.7,1.7])for(const z of[-.65,.65])B(.12,.73,.12,x,0,z,M.woodDark);
 C(.28,.22,.36,-1,.85,0,M.bronze,false,20);C(.16,.26,.08,-1,1.21,0,M.bronze,false,20);for(const x of[.2,.8,1.4]){C(.14,.09,.14,x,.85,0,M.ceramic||M.ashlar,false,18);C(.11,.11,.008,x,.993,0,M.water,false,18);}
 a.on('kunlun:tea',P(-23,3.8,-3.8),2.5,'茶亭温盏',()=>{a.sound('bowl');a.card('一盏暖意','煨茶歇雪','把茶盏捧在掌心，歇一歇。沿东侧石阶可以上望雪台，回到琴院还可继续听弦。');});
 a.npc('煨茶客',[-21,2.665,-9],0,{visitor:true,robe:2,bag:true},'院里的路扫过雪了。东阶通望雪台，琴声在北屋，西边留有热茶。');
 // Ice is enclosed by a low basin; no walkable water or false path over it.
 yield;
 at(21,2.4,2);B(12,.24,15,0,0,0,M.ashlar);for(const x of[-6,6])B(.45,.4,15.4,x,0,0,stone);for(const z of[-7.5,7.5])B(12.4,.4,.45,0,0,z,stone);
 const ice=new T.MeshStandardMaterial({color:0xa1bcc4,roughness:.38,metalness:.08});B(11.5,.03,14.5,0,.25,0,ice,false);col(12,.8,15,0,0,0);
 const cracks=[],crackColor=new T.LineBasicMaterial({color:0xdce9e9,transparent:true,opacity:.65});
 for(let i=0;i<9;i++){const x=16+i*1.2,z=-4+(i%3)*1.7;cracks.push(P(x,2.69,z),P(x+.4,2.69,z+3),P(x+.4,2.69,z+3),P(x-.6,2.69,z+5.5));}
 const crackGeo=new T.BufferGeometry().setFromPoints(cracks);root.add(new T.LineSegments(crackGeo,crackColor));
 for(const [x,z]of[[17,-5],[24,8]])bank(x,2.69,z,2.1,1.7,.22);
 label('前池观冰',21,3.65,10.3,0,.4);at(21,2.4,10.2);B(.1,1.3,.1,0,0,0,M.woodDark);
 yield;
 a.on('kunlun:ice',P(21,3.6,10.2),2.8,'看看池上冰纹',()=>a.card('池水歇声','静池','冰面映着山色，白纹散开。绕池沿石路走，就能到东侧登高的石阶。'));
 // Top pavilion frames the distant snow ridges; the east stair arrives beside it.
 at(12,6,-49);B(21,.2,12,0,0,0,stone);for(const x of[-9.5,9.5])for(const z of[-5,5]){B(.65,.25,.65,x,.2,z,M.ashlar);C(.18,.23,3.6,x,.45,z,M.woodDark);}
 for(const z of[-5,5])B(19.5,.3,.3,0,3.9,z,M.woodDark,false);for(let x=-9;x<=9;x+=1.2)B(.12,.2,10,x,3.9,0,wood,false);
 kit(()=>roof(23,14,2,.5,0,4.25,0));label('望雪台',12,9.4,-43.8,0,.75);
 for(const x of[6,12,18])seat('kunlun:snow:'+x,x,6.2,-52.5,0,'望雪静坐');
 a.on('kunlun:ridge',P(-2,7.3,-52),2.5,'看远山雪脊',()=>a.card('雪脊接天','望雪台','石阶把院落留在身后，远山层层展开。沿原阶回去，茶还温着。'));
 yield;
 a.npc('看山人',[31,6,-53],Math.PI/2,{robe:4,hat:true,bag:true},'从这里看下去，琴院和茶亭都在来路上。山中不必赶路。');
 const trees=[[-6,0,46,7],[6,0,33,7],[-33,2.4,15,8],[32,2.4,15,9],[31,2.4,-18,8],[-2,6,-54,7]];
 const pines=buildPines(T,root,M,trees);pines.group.name='kunlun:close-pines';for(const [x,y,z,h]of trees){at(x,y,z);col(.55,h*.5,.55,0,0,0);bank(x,y,z,1.5,1.6,.3);}
 for(const side of[-1,1])for(let i=0;i<8;i++)bank(side*34.5,2.4,17-i*5.8,1.25,3,.28+(i%3)*.1);
 for(const [x,z,sx,sz]of[[-10,-25,6,1],[14,-25,6,1.5],[1,-56,5,1],[30,-56,4,1]])bank(x,z<-40?6:2.4,z,sx,sz,.35);
 // Garden plants share one leaf mesh and one blossom mesh across both beds.
 const leaves=[],petals=[],transform=new T.Object3D();
 function leafSpray(x,y,z,size,seed,color,flowers){
  for(let j=0;j<88;j++){
   const theta=j*2.39996,rad=size*Math.sqrt(hash2(seed,j,7));
   const lx=x+Math.cos(theta)*rad,lz=z+Math.sin(theta)*rad*.85;
   const ly=y+size*(.49-rad/size*.58)+size*(hash2(seed,j,12)-.5)*.61;
   const leafSize=.09+hash2(seed,j,31)*.055;
   transform.position.set(lx,ly,lz);transform.rotation.set(.25+hash2(seed,j,57)*.72,theta,.38);
   transform.scale.set(leafSize,.018,leafSize*.47);transform.updateMatrix();
   leaves.push([transform.matrix.clone(),new T.Color(color).multiplyScalar(.74+hash2(seed,j,65)*.44)]);
   if(flowers&&j%10===0){
    for(let k=0;k<5;k++){
     const turn=k*Math.PI*2/5;
     transform.position.set(lx+.038*Math.cos(turn),ly+.026,lz+.038*Math.sin(turn));
     transform.rotation.set(.32,-turn,0);transform.scale.set(.048,.019,.028);transform.updateMatrix();
     petals.push([transform.matrix.clone(),new T.Color(flowers)]);
    }
   }
  }
 }
 yield;
 for(const [x,z,sign] of [[-13,6,1],[9,14,-1]]){
  at(x,2.4,z);B(4.8,.16,3.1,0,0,0,M.ashlar);B(4.5,.035,2.8,0,.16,0,soil,false);
  col(4.8,.55,3.1,0,0,0);at(x,2.595,z);
  C(.085,.135,1.25,0,0,0,M.bark,true,10);
  for(let i=0;i<6;i++){
   const angle=.5+i*2.4,dx=Math.cos(angle)*(.88-i*.07),dz=Math.sin(angle)*(.86-i*.07),top=1.48+i*.17;
   const branch=new T.CatmullRomCurve3([P(0,.74+i*.07,0),P(dx*.45,1.22+i*.1,dz*.45),P(dx,top,dz)]);
   G(new T.TubeGeometry(branch,6,.052,7,false),M.bark,0,0,0);
   for(const side of [-1,1]){
    const tx=dx+.29*side,tz=dz+.18*sign,ty=top+.22;
    const twig=new T.LineCurve3(P(dx,top,dz),P(tx,ty,tz));
    G(new T.TubeGeometry(twig,1,.025,5,false),M.bark,0,0,0);
    leafSpray(x+tx,2.595+ty,z+tz,.47,i*7+side,0x648343);
    if((i+side)%2===0)S(.067,tx,ty-.13,tz,M.redc,.93,1,.94,9,6);
   }
  }
  for(const side of [-1,1]){
   const baseX=side*1.49;
   for(let i=0;i<5;i++){
    const theta=i*2.4,dx=.30*Math.cos(theta),dz=.33*Math.sin(theta),h=.40+i*.055;
    const twig=new T.LineCurve3(P(baseX,.04,0),P(baseX+dx,h,dz));
    G(new T.TubeGeometry(twig,1,.023,5,false),M.bark,0,0,0);
    leafSpray(x+baseX+dx,2.595+h,z+dz,.36,i+side,0x516f3b,side===1?0xeed7b8:0xc98587);
   }
  }
 }
 yield;
 const leafShape=new T.SphereGeometry(1,7,4),plantMaterial=new T.MeshStandardMaterial({roughness:.87});
 for(const [parts,name] of [[leaves,'leaves'],[petals,'petals']]){
  const plants=new T.InstancedMesh(leafShape,plantMaterial,parts.length);
  parts.forEach(([matrix,color],i)=>{plants.setMatrixAt(i,matrix);plants.setColorAt(i,color);});
  plants.name='kunlun:garden-'+name;plants.castShadow=plants.receiveShadow=true;root.add(plants);
 }
 // A small earth pocket grounds the pines in a visibly swept, seasonal courtyard.
 yield;
 at(-32,2.4,15);B(4,.012,4,0,.04,0,soil,false);
 yield;
 mountainLandscape(T,root,'kunlun',M.cliff);
 const paper=new T.MeshStandardMaterial({color:0xe5d7a3,emissive:0xffbf67,emissiveIntensity:.45,roughness:.9});
 for(const [x,y,z,ceiling]of[[-14,6.2,-21.5,7.7],[-24,5.4,-4,6.8],[12,9,-49,10.1]]){at(0,0,0);C(.015,.015,ceiling-y-.25,x,y+.25,z,M.iron,false,8);S(.25,x,y,z,paper,.8,1,.8,18,12);C(.12,.12,.05,x,y+.2,z,M.bronze,false,12);plight(x,y,z,0xffd598,14,14);}
 a.walkers([[-9,8],[10,-3],[30,12],[-12,-6],[30,-15],[0,15]],3);
 yield;
 kit(()=>b.palette({marble:stone},()=>kunlunCourts(b,a)));
 return{id:'kunlun',name:'昆仑',subtitle:'行雪道 · 琴院听弦 · 茶亭歇脚',spawn:{p:[0,0,53],yaw:0},guide:'入松雪谷，到听雪客堂访琴院主人 · 西北琴院听弦，东阶登台看雪',
  locate(p){if(p.z<-58)return'昆仑 · 谷后静池';if(p.x<-2&&p.x>-26&&p.z<-13&&p.y<4)return'昆仑 · 听雪琴院';if(p.z>35&&Math.abs(p.x)>8)return p.x<0?'昆仑 · 山口客院':'昆仑 · 雪谷客舍';if(Math.abs(p.x+2)<7&&Math.abs(p.z-8)<5)return'昆仑 · 听雪客堂';if(p.z>30)return'昆仑 · 雪山古道';if(p.z>21)return'昆仑 · 入山石阶';if(p.y>5.8)return'昆仑 · 望雪台';if(p.z<-27)return'昆仑 · 登高石阶';if(p.x<-14&&p.z<4)return'昆仑 · 煨茶歇雪';if(p.z<-8&&Math.abs(p.x)<12)return'昆仑 · 听雪琴院';if(p.x>13&&p.z>-7&&p.z<12)return'昆仑 · 前池观冰';return'昆仑 · 松雪谷';},
  tick(dt){surfaces.sync();granite.sync();pines.update(dt);strings.forEach(({s,base},i)=>{if(ages[i]>2.1)return;ages[i]+=dt;const amp=ages[i]<2?Math.exp(-ages[i]*3)*.026:0;s.material.emissiveIntensity=ages[i]<.65?.8:0;const p=s.geometry.attributes.position;
    for(let k=0;k<p.count;k++){const x=base[k*3];p.setY(k,base[k*3+1]+Math.sin((x+1.8)/3.6*Math.PI)*Math.sin(ages[i]*70)*amp);}p.needsUpdate=true;});},
  snapshot:()=>lesson.state,get lesson(){return lesson.state;}
 };
}
