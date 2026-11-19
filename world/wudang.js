import {writingDesk} from './room-furnishings.js';
import {buildSanqing} from './sanqing-caishen.js';
import {wudangCourts} from './sect-courts.js';
import {layPaving} from './street-paving.js';
import {mountainLandscape} from './landscape.js';
// A mountain route with two real climbs: approach -> practice court -> cloud walk.
// Every platform, doorway and stair is built by the existing temple engine.
import {townSurfaces} from './surfaces.js';
export function* buildWudang(b,a){
 const {THREE,M,at,B,C,G,S,col,roof,hall,plaque,pine,bamboo,boulder,cushion,rail,lantern,plight}=b;
 const V=THREE.Vector3,point=(x,y,z)=>new V(x,y,z),surfaces=townSurfaces(THREE,M),{wood,stone,soil}=surfaces;
 const paint=M.paint.clone();paint.color.setHex(0x68756d);
 const plaster=new THREE.MeshStandardMaterial({color:0xc6c5af,roughness:1});plaster.userData.s=4;
 const palette=fn=>b.palette({red:plaster,wood:M.woodDark,paint,gold:M.bronze,eave:wood},fn);
 const glaze=M.tile.clone();glaze.color.setHex(0x76ad9e);glaze.roughness=.43;
 yield;
 const lacquer=new THREE.MeshStandardMaterial({color:0x824233,roughness:.58});
 const ridge=new THREE.MeshStandardMaterial({color:0x556d61,roughness:.53});
 const vermilion=plaster.clone();vermilion.color.setHex(0x954c3d);
 const mainHall={red:vermilion,wood:lacquer,paint,tile:glaze,ridge,gold:M.bronze,eave:wood};
 const sign=(text,x,y,z,r=0,h=.65)=>{at(x,y,z,r);plaque(text,0,0,0,{h,bg:'#253c39',fg:'#e2d8b5'});};
 function terrace(x,z,w,d,y,surface=stone){at(x,0,z);B(w,26+y-.24,d,0,-26,0,M.cliff);B(w,.24,d,0,y-.24,0,M.ashlar);B(w,.02,d,0,y,0,surface,false);}
 function stairs(x,z,width,base,rise,n=18){
  at(x,base,z);for(let i=0;i<n;i++){const top=rise*(i+1)/n;B(width,top-.025,.8,0,0,-(i+.5)*.8,M.ashlar);B(width,.025,.8,0,top-.025,-(i+.5)*.8,stone);}
  for(const side of[-1,1])for(let i=0;i<n;i+=3)rail(x+side*(width/2+.18),z-i*.8,x+side*(width/2+.18),z-(i+3)*.8,base+rise*(i+1.5)/n);
 }
 // A narrow lower approach opens to the court. Outside it is a genuine drop,
 // contained by stone rails; no invisible flat floor fills the mountain valley.
 yield;
 terrace(0,42,18,30,0);terrace(0,-10,72,55,3.6,soil);terrace(24,-45,24,22,7.2);
 layPaving(b,stone,3.638,[[0,3,9,29],[0,-12,32,8],[0,-8,42,3.8],[3,10.2,48,3.8],[28.8,-3,40,3.6],[-20,-8,9,19]]);
 terrace(50,-3,28,24,3.6,stone);
 stairs(0,31.9,6.2,0,3.6);stairs(28,-19.6,5.4,3.6,3.6);
 for(const x of[-9,9]){rail(x,56,x,49,0);rail(x,41,x,29,0);}
 rail(-9,56,-3.5,56,0);rail(3.5,56,9,56,0);
 rail(-36,17.5,-3.5,17.5,3.6);rail(3.5,17.5,36,17.5,3.6);
 yield;
 rail(-36,17.5,-36,-37.5,3.6);rail(-36,-37.5,-13,-37.5,3.6);rail(-4,-37.5,12,-37.5,3.6);rail(36,17.5,36,.3,3.6);rail(36,-6.3,36,-34,3.6);
 for(const z of [-15,9])rail(36,z,64,z,3.6);rail(64,-15,64,9,3.6);
 rail(12,-34,25,-34,7.2);rail(31,-34,36,-34,7.2);rail(12,-34,12,-56,7.2);rail(36,-34,36,-56,7.2);rail(12,-56,36,-56,7.2);
 // Mountain gate: 5.2m clear passage. The stairs and main roof remain visible.
 at(0,0,38);for(const x of[-3,3]){B(.7,.5,.7,x,0,0,M.ashlar);C(.22,.29,4.2,x,.5,0,M.woodDark);}
 B(7,.4,.5,0,4.45,0,M.woodDark,false);palette(()=>roof(9.4,4.8,1.7,.55,0,4.9,0));sign('武当',0,4.1,38.3,0,.85);
 at(-5.3,0,42);B(1.6,2,.4,0,0,0,M.stele);sign('江汉道山',-5.3,1.4,42.24,0,.48);
 yield;
 for(const [x,z,h]of[[-6,50,8],[6.4,43,9],[-6.7,33,10],[-7.3,28.5,11],[7.2,29.8,8]])pine(x,0,z,h);
 // The central axis is quiet: a pale stone court and the main teaching hall.
 at(0,3.6,3);C(9.5,9.5,.060,0,0,0,M.ashlar,false,80);
 {const g=new THREE.CircleGeometry(8.7,80);g.rotateX(-Math.PI/2);G(g,M.bagua,0,.065,0);}
 for(const [x,z]of[[-13,13],[13,13],[-13,-8],[13,-8]])lantern(x,3.6,z);
 b.palette(mainHall,()=>hall(0,-23,3.6,0,23,14,{name:'紫霄殿',frontBays:5,depthBays:5,plat:.85,ch:4.6,porch:2.8,doors:3,double:true,empty:true,inner:'清静自守',couplet:['松风入座添清趣','山月临窗照道心']}));
 // A working interior: reading desks, a wall scroll and a resident instructor.
 yield;
 for(const x of[-5,0,5]){cushion(x,4.45,-22,0);a.rest('wudang:hall:'+x,point(x,4.45,-22),0,'堂内静坐');}
 a.npc('守堂道人',[4.8,4.45,-27],0,{robe:3,dao:true,beard:true},'前坪可随式练云手，西亭听松，东廊上行可望远山。堂内还有几方坐席。');
 a.on('wudang:scroll',point(-7.5,5.4,-25.8),2.8,'读堂中题记',()=>a.card('清静自守','紫霄殿题记','行路时留意脚下，停步时留意呼吸。来此不必争快，认清一式，再走下一式。'));
 // West library faces the court, with real shelves inside its open doors.
 palette(()=>hall(-26,-8,3.6,1,14,9,{name:'藏书阁',plat:.51,ch:3.8,porch:1.8,empty:true,inner:'观物知理'}));
 for(const z of[-12,-5]){at(-28,4.11,z);for(const y of[0,.65,1.3,1.95])B(3.8,.1,.7,0,y,0,wood);for(const x of[-1.8,1.8])B(.12,2.3,.7,x,0,0,M.woodDark);
  for(let j=0;j<3;j++)for(let i=0;i<6;i++)B(.38,.4,.5,-1.45+i*.56,.1+j*.65,0,i%2?M.paper:M.sack,false);}
 yield;
 at(-28.2,4.11,-8);B(1.8,.08,1.1,0,.7,0,wood);for(const x of[-.7,.7])for(const z of[-.35,.35])B(.08,.7,.08,x,0,z,M.woodDark);
 B(.7,.045,.5,0,.78,0,M.paper,false);
 a.on('wudang:architecture',point(-27.65,5.1,-8),2.35,'翻阅营造札记',()=>a.card('看一座山中屋宇','藏书阁 · 营造札记','柱子承梁，梁上起檩，檩上铺椽。站到东廊下抬头看，便能找到从瓦面一直落到石础的支撑。'));
 // A second desk keeps the Daoist text beside the library shelves.
 at(-25.7,4.11,-12.75,1);B(3.45,.09,1.05,0,.76,0,wood);
 for(const x of [-.85,.85])for(const z of [-.36,.36])B(.10,.76,.10,x,0,z,M.woodDark);
 at(-25.7,4.96,-12.75,1);writingDesk(b,'道德经',['知人者智','自知者明']);
 yield;
 a.on('wudang:daodejing',point(-25.4,5.13,-12.45),2.2,'读《道德经》',()=>a.card('道德经','藏书阁 · 第三十三章','知人者智，自知者明。胜人者有力，自胜者强。'));
 // Open west pavilion, deliberately facing out to pine trees and the valley.
 at(-25,3.6,10.2);B(13,.3,9,0,0,0,M.ashlar);B(13,.04,9,0,.3,0,wood);
 for(const x of[-5.3,5.3])for(const z of[-3.3,3.3]){C(.25,.3,.2,x,.34,z,M.ashlar);C(.16,.2,3.5,x,.54,z,M.woodDark);}
 for(const z of[-3.3,3.3])B(11,.3,.26,0,3.9,z,M.woodDark,false);
 palette(()=>roof(15,11,2.8,.6,0,4.2,0));for(let i=-5;i<=5;i++)B(.1,.16,8,i,3.9,0,wood,false);
 sign('听松亭',-17.65,7.2,10.2,1,.65);
 yield;
 at(-24,3.94,10.2);B(1.6,.08,.9,0,.6,0,wood);for(const x of[-.6,.6])B(.1,.6,.6,x,0,0,M.woodDark);
 C(.1,.07,.1,0,.68,0,M.marble,false,16);C(.08,.08,.012,0,.778,0,M.dark,false,16);
 for(const z of[8.7,11.7]){cushion(-26,3.94,z,Math.PI/2);a.rest('wudang:pine:'+z,point(-26,3.94,z),Math.PI/2,'听松歇息');}
 // Covered eastern walk: open bays, stone footings, beams and exposed rafters.
 for(const z of[9,1,-7,-15]){
  at(27,3.6,z);B(6,.025,8,0,0,0,stone,false);
  for(const x of[-2.6,2.6])for(const sz of[-3.8,3.8]){C(.23,.28,.23,x,0,sz,M.ashlar);C(.14,.18,3.4,x,.23,sz,M.woodDark);}
  for(const x of[-2.6,2.6])B(.22,.3,8,x,3.4,0,M.woodDark,false);
  palette(()=>roof(7.8,9.2,1.8,.45,0,3.8,0));for(let j=-3;j<=3;j++)B(5.8,.2,.11,0,3.32,j,wood,false);
 }
 yield;
 for(const z of[1,-15]){lantern(30.9,3.6,z);at(0,0,0);plight(30.9,5.2,z,0xffd7a6,12,10);}
 sign('云海长廊',27,6.7,13.2,0,.65);
 at(24.25,3.6,-.4,3);B(.15,1.45,.16,0,0,0,M.woodDark);plaque('三清殿',0,1.47,0,{h:.42,bg:'#253c39',fg:'#e2d8b5'});
 // Upper viewing platform: quiet seating at the guard rail, with an operable bell.
 for(const x of[21,25,29]){cushion(x,7.2,-51,0);a.rest('wudang:cloud:'+x,point(x,7.2,-51),0,'看云静坐');}
 at(17,7.2,-44);for(const x of[-1.6,1.6]){B(.6,.3,.6,x,0,0,M.ashlar);C(.16,.2,3.7,x,.3,0,M.woodDark);}B(4,.32,.3,0,3.85,0,M.woodDark,false);
 C(.025,.025,.5,0,3.35,0,M.iron,false,8);C(.47,.7,.85,0,2.5,0,M.bronze,false,24);C(.045,.045,.9,0,2.2,0,M.woodDark,false,8);
 yield;
 sign('听风台',17,10.6,-44.2,0,.5);at(17,7.2,-44);for(const x of[-.7,.7])C(.012,.012,.2,x,3.65,-.2,M.iron,false,6);
 a.on('wudang:bell',point(17,8.7,-43.5),2.7,'轻叩山钟',()=>{a.sound('bell');a.message('钟声入谷 · 且听余音。');});
 // The instructor and the visitor share one authored movement sequence.
 const master=a.npc('传习道人',[0,3.6,-1.3],0,{robe:2,dao:true,beard:true});
 master.f.post=f=>a.practice.teacherPose(f,master.t);
 sign('太极坪',-11,5.5,3,1,.6);at(-11,3.6,3);B(.12,1.9,.14,0,0,0,M.woodDark);
 a.on('wudang:cloudhands',point(0,4.5,3.5),3.1,'随道人学云手',()=>a.practice.start(point(0,3.6,4.2),Math.PI,master.f));
 yield;
 const student=a.npc('习拳弟子',[-12,3.6,-2],Math.PI/2,{robe:3,dao:true});student.f.post=f=>a.practice.teacherPose(f,student.t+2.5);
 a.npc('张三丰',[25.8,3.6,1.8],-Math.PI/2,{robe:3,dao:true,beard:true,beardC:0xe3dfd1,hairC:0xb9b5a9},'雨后石坪有些滑，我在廊下等它晒干。你若来看云手，就在廊下站一会儿。从这里望过去，教习与弟子的起势都看得清。');
 a.npc('问道弟子',[23.6,3.6,2.0],Math.PI/2,{robe:2,dao:true},'我刚问师父，云手转到哪里才算尽头。他让我先松肩，留心脚下虚实。你看坪上教习的手已转回来，脚下才刚换稳。');
 a.npc('行脚道人',[28.5,3.6,8],-Math.PI/2,{robe:0,dao:true,bag:true},'这条廊道沿山而行，尽头石阶通向听风台。回程在山门旁认准下山路牌。');
 // Planting frames destinations and leaves the central approach unobstructed.
 for(const [x,z,h]of[[-33,13,11],[-32,-26,12],[-16,-33,10],[17,-31,11],[33,10,10],[33,-10,9],[19,-53,8]])pine(x,z<-40?7.2:3.6,z,h);
 for(const [x,z]of[[-34,-16],[-33,-20],[-17,14],[-15,15],[17,14],[19,15]])bamboo(x,3.6,z);
 yield;
 for(const [x,z,r]of[[-32,2,1.4],[-16,-30,2.2],[18,-29,2],[34,1,1.5],[14,-49,1.3]])boulder(x,z<-40?7.2:3.6,z,r);
 yield;
 mountainLandscape(THREE,a.root,'wudang',M.cliff);
 at(0,0,0);plight(0,7,-23,0xffce94,20,17);plight(-25,6.5,10,0xffcf9e,10,12);
 yield;
 palette(()=>b.palette({marble:stone},()=>wudangCourts(b,a)));
 yield;
 const incense=b.palette({...mainHall,red:plaster,marble:stone},()=>buildSanqing(b,a));
 return{id:'wudang',name:'武当',subtitle:'踏古道 · 随式云手 · 临风看云',spawn:{p:[0,0,51],yaw:0},guide:'前庭访龙虎与十方堂 · 太极坪东访张三丰，北进紫霄殿，穿东廊到三清殿',
  locate(p){if(p.x>36&&p.z>=-15&&p.z<=9)return p.x>=49.5?'武当 · 三清殿':'武当 · 演式庭';if(p.z>35&&p.x<-10)return'武当 · 龙虎殿';if(p.z>35&&p.x>10)return'武当 · 十方堂';if(p.z<-38&&p.x<5)return'武当 · 父母殿';if(p.z>28)return'武当 · 松间古道';if(p.z>17)return'武当 · 上山石阶';if(p.y>6.5)return'武当 · 听风台';if(p.x>21)return'武当 · 云海长廊';if(p.x<-18&&p.z>3)return'武当 · 听松亭';if(p.x<-18)return'武当 · 藏书阁';if(p.z<-13)return'武当 · 紫霄殿';return'武当 · 太极坪';},
  snapshot:incense.snapshot,
  tick(){incense.tick();surfaces.sync();
   if(glaze.map!==M.tile.map){glaze.map=M.tile.map;glaze.normalMap=M.tile.normalMap;
    glaze.roughnessMap=M.tile.roughnessMap;glaze.normalScale.copy(M.tile.normalScale);glaze.needsUpdate=true;}
  }};
}
