import {kongtongCourts} from './sect-courts.js';
import {townSurfaces} from './surfaces.js';
import {mountainLandscape} from './landscape.js';
import {graniteMaterial,cliffGeometry} from './granite.js';
import {buildPines} from './pine.js';
import {grottoGeometry} from './grotto.js';
import {courtGarden} from './court-garden.js';

// A continuous circuit around a gorge. The cave is an actual open interior;
// its rock envelope, lintel and side walls leave the visitor's route unobstructed.
export function* buildKongtong(b,a){
 const {THREE:T,M,at,B,C,G,S,col,roof,plaque,rail,plight}=b,V=T.Vector3,P=(x,y,z)=>new V(x,y,z),root=a.root;
 const surfaces=townSurfaces(T,M),{wood,stone,soil,cloth}=surfaces;stone.color.setHex(0xb7ab92);cloth.color.setHex(0x9a8769);
 const caveRock=graniteMaterial(T,M.cliff),rock=caveRock.material;rock.color.setHex(0xa99b82);rock.vertexColors=false;const cap=M.ashlar.clone();cap.color.setHex(0xc4b28f);
 const granite=graniteMaterial(T,M.cliff);granite.material.color.setHex(0xc4ac89);
 const plaster=new T.MeshStandardMaterial({color:0xc8b99c,roughness:1}),tile=M.tile.clone();tile.color.setHex(0x837c6c);const paint=M.paint.clone();paint.color.setHex(0x6f5542);
 const kit=fn=>b.palette({red:plaster,wood:M.woodDark,tile,paint,eave:wood,gold:M.bronze},fn);
 yield;
 const label=(text,x,y,z,r=0,h=.55)=>{at(x,y,z,r);plaque(text,0,0,0,{h,bg:'#594333',fg:'#eee0bc'});};
 const seat=(id,x,y,z,yaw,text)=>{b.palette({cushion:cloth},()=>b.cushion(x,y,z,yaw));a.rest(id,P(x,y,z),yaw,text);};
 function mesh(g,m,p,parent=root){const o=new T.Mesh(g,m);o.position.copy(p);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 const clear=[[-4,4,19,34],[-34,-10,4,12],[-35,-27,-41,-24],[24,32,-40,-16]];
 function ledge(x,z,w,d,y,paved=true){at(x,0,z);B(w,1,d,0,y-1,0,M.ashlar);if(paved)B(w,.035,d,0,y,0,stone,false);const o=mesh(cliffGeometry(T,{x,z,w,d,y,bottom:-38,clearance:clear}),granite.material,P(0,0,0));o.name='kongtong:cliff';}
 function stairs(x,z,w,base,rise,n,turn=0){at(x,base,z,turn);for(let i=0;i<n;i++){const h=rise*(i+1)/n;B(w,h-.025,.7,0,0,-(i+.5)*.7,M.ashlar);B(w,.025,.7,0,h-.025,-(i+.5)*.7,stone);}
  for(const side of[-1,1])for(let i=0;i<n;i+=3){const v=side*(w/2+.25),u0=i*.7,u1=Math.min(n,i+3)*.7,y=base+rise*(i+1.5)/n;if(turn===1)rail(x-u0,z-v,x-u1,z-v,y);else rail(x+v,z-u0,x+v,z-u1,y);}}
 yield;
 ledge(0,44,16,28,0);ledge(10,0,50,40,2.4,false);ledge(-31,-13,24,32,5.4);ledge(-33,5,6,10,5.4);ledge(5,-45,64,18,8.4);ledge(-29,-42,8,7,8.4);
 const garden=courtGarden(T,root,M);
 stairs(0,31.4,6.2,0,2.4,17);stairs(-12,8,4.6,2.4,3,28,1);stairs(-31,-26,4.6,5.4,3,20);stairs(28,-17,5.2,2.4,6,29);
 for(const s of[-1,1]){rail(s*8,57,s*8,50,0);rail(s*8,40,s*8,30,0);rail(s*8,30,s*3.5,30,0);rail(s*8,57,s*3,57,0);}
 rail(-15,20,-3.5,20,2.4);rail(3.5,20,35,20,2.4);rail(35,20,35,-20,2.4);rail(-15,-20,24.8,-20,2.4);rail(31.2,-20,35,-20,2.4);
 rail(-15,20,-15,10.8,2.4);rail(-15,5.2,-15,-20,2.4);
 rail(-43,3,-36,3,5.4);rail(-28,3,-19,3,5.4);rail(-43,3,-43,-29,5.4);rail(-19,3,-19,-29,5.4);rail(-43,-29,-33.8,-29,5.4);rail(-28.2,-29,-19,-29,5.4);
 yield;
 rail(-36,10,-30,10,5.4);rail(-36,10,-36,3,5.4);rail(-30,3,-30,5.2,5.4);
 rail(-33,-38.5,-33,-45.5,8.4);rail(-33,-45.5,-27,-45.5,8.4);rail(-28.2,-38.5,-25,-38.5,8.4);
 rail(-27,-36,24.8,-36,8.4);rail(31.2,-36,37,-36,8.4);rail(37,-36,37,-54,8.4);rail(-27,-54,37,-54,8.4);rail(-27,-54,-27,-45.5,8.4);
 // Thick archways have true holes. Box colliders flank each opening.
 function arch(x,y,z,w,h,r,shoulder,depth,material,natural=false){const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);if(natural){for(const [u,v]of[[.5,.79],[.42,.98],[.24,1.13],[.07,1.04],[-.12,1.18],[-.33,1.02],[-.5,.84]])shape.lineTo(w*u,h*v);}else{shape.lineTo(w/2,h);shape.lineTo(-w/2,h);}shape.closePath();
  const hole=new T.Path();hole.moveTo(-r,0);hole.lineTo(-r,shoulder);hole.absarc(0,shoulder,r,Math.PI,0,true);hole.lineTo(r,0);hole.closePath();shape.holes.push(hole);
  mesh(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24}),material,P(x,y,z));at(x,y,z+depth/2);
  const side=w/2-r;for(const s of[-1,1])col(side,h,depth,s*(r+side/2),0,0);col(2*r,h-shoulder-r,depth,0,shoulder+r,0);
  // Individual voussoirs mark the arch and give its edge relief.
  if(!natural)for(let i=0;i<15;i++){const angle=(i+.5)*Math.PI/15,g=new T.BoxGeometry(.26,.68,depth+.16);g.rotateZ(angle-Math.PI/2);G(g,cap,Math.cos(angle)*(r+.22),shoulder+Math.sin(angle)*(r+.22),0);}
 }
 yield;
 arch(0,2.4,18.3,13.5,7.3,2.8,2.9,1.5,rock);at(0,2.4,19);B(14,.32,2,0,7.3,0,cap,false);label('崆峒',0,8.9,19.85,0,.85);
 for(const x of[-5.5,5.5]){at(x,2.4,19);B(1,.5,2.1,0,7.62,0,cap,false);}
 // Empty-hand court. A teacher and learner stand apart with a clear view.
 at(6,2.4,3.5);const ring=new T.RingGeometry(1.6,1.65,48);ring.rotateX(-Math.PI/2);G(ring,M.bronze,0,.064,0);
 const teacher=a.npc('授拳教习',[6,2.4,-3],0,{robe:4,bun:true,beard:true});a.practice.prepare(teacher.f,3);teacher.f.post=f=>a.practice.teacherPose(f,teacher.t,3);
 a.on('kongtong:fist',P(6,3.4,5.3),3.1,'随教习练空拳',()=>a.practice.start(P(6,2.4,3.5),Math.PI,teacher.f,3));
 label('守式 · 出拳 · 收势',6,4.7,-8.5,0,.65);at(6,2.4,-8.6);for(const x of[-3.6,3.6])B(.12,2.7,.14,x,0,0,M.woodDark);
 yield;
 a.on('kongtong:practice-note',P(-3,3.7,-5),2.7,'读拳坪小记',()=>a.card('拳院日课','拳坪小记','教习每天在这方石坪上带新来的弟子走一遍功课。坪上今天演的是入门空拳。先看双手守在身前，再看肩肘展开、腰身轻转，最后收势。这里使用三四编排的空拳动作，留出彼此的空处，慢慢跟随即可。'));
 at(-3,2.4,-5.4);B(.12,1.5,.14,0,0,0,M.woodDark);label('拳坪小记',-3,3.9,-5.3,0,.38);
 // Practice bags hang from a supported timber frame, away from the lesson lane.
 at(14,2.4,-13);for(const x of[-4,4]){B(.6,.25,.6,x,0,0,M.ashlar);C(.14,.18,3.7,x,.25,0,M.woodDark);}B(8.6,.25,.3,0,3.7,0,wood,false);
 for(const x of[-2.6,0,2.6]){C(.016,.016,.7,x,2.95,0,M.woodDark,false,8);C(.3,.32,1.3,x,1.65,0,cloth);C(.12,.3,.16,x,2.95,0,cloth,false,16);}
 a.on('kongtong:bags',P(14,3.8,-11.6),2.8,'看看拳坪器具',()=>a.card('先看距离','拳坪器具','布袋吊在横梁下，周围留有回身的空处。游历时可看看器具与场地；跟练空拳请到中央教习面前。'));
 // A compact equipment shelter provides visual detail without blocking east steps.
 yield;
 at(25,2.4,-9);B(11,.22,10,0,0,0,stone);B(11,.025,10,0,.22,0,wood,false);for(const x of[-4.7,4.7])for(const z of[-4,4])C(.15,.19,3.3,x,.245,z,M.woodDark);
 B(11,3.4,.3,0,.22,-5,plaster);for(const z of[-4,4])B(10,.28,.26,0,3.4,z,M.woodDark,false);for(let x=-4;x<=4;x++)B(.12,.18,8,x,3.4,0,wood,false);kit(()=>roof(13,12,1.6,.4,0,3.8,0));label('器具舍',25,5.3,-4.8,0,.55);
 at(25,2.62,-11);for(const x of[-3,3])B(.14,1.8,.18,x,0,0,M.woodDark);B(6.3,.12,.15,0,1.4,0,wood,false);
 for(let i=0;i<6;i++){const x=22.5+i;at(x,2.62,-11);C(.035,.04,2,0,0,0,wood,false,8);if(i>2){const g=new T.ConeGeometry(.09,.32,4);G(g,M.iron,0,2.16,0);}}
 a.on('kongtong:weapons',P(25,3.8,-9.6),2.8,'辨认棍与长枪',()=>a.card('长短有别','器具舍','左边的木棍两端圆钝，右边的长枪带有金属枪头。游览时看清形制与放置位置，不在通道里挥舞。'));
 a.npc('看舍人',[28,2.62,-11],0,{robe:2,bag:true},'西边石阶通观山窟，再往上就是古道驿亭。东边长阶也能登顶，绕一圈可以回到拳坪。');
 // West grotto: real empty chamber, stone portal, rock roof and a warm interior.
 yield;
 at(-32,5.4,-8.75);for(const s of[-1,1])col(6.2,8.2,1.5,s*6.9,0,0);col(7.6,2.1,1.5,0,6.1,0);
 at(-32,5.4,-17);col(20,.28,17,0,6.2,0);col(1.4,6.2,16,-9.3,0,1);col(1.4,6.2,16,9.3,0,1);col(20,6.2,1,0,0,-7);B(17,.025,15.5,0,.04,0,stone,false);
 for(const [name,g]of Object.entries(grottoGeometry(T))){const o=mesh(g,rock,P(0,0,0));o.name='kongtong:grotto-'+name;}
 label('观山窟',-32,12.5,-7.1,0,.8);label('石静人闲',-32,9.1,-23.75,0,.75);
 for(const x of[-35.5,-32,-28.5])seat('kongtong:cave:'+x,x,5.4,-20,Math.PI,'窟中歇息看山');
 at(-32,5.4,-23);B(5,.12,1,0,.65,0,wood);for(const x of[-2.2,2.2])for(const z of[-.3,.3])B(.12,.65,.12,x,0,z,M.woodDark);B(.7,.04,.5,0,.77,0,M.paper,false);
 a.on('kongtong:stone',P(-32,6.65,-21.8),2.4,'读石窟小记',()=>a.card('岩壁与来路','观山窟','从洞口回望，石阶与拳坪留在谷边。上方的石道通向驿亭，可以绕过山脊，再从东阶回到院落。'));
 yield;
 a.npc('歇脚老者',[-38,5.4,-17],Math.PI/2,{robe:1,beard:true},'窟里阴凉，坐一会儿再走。山路有两边，从北面上去，再沿东阶下来，也能回到拳坪。');
 // A fractured rock cap gives the carved chamber an irregular outer silhouette.
 {const outline=[],n=12;for(let k=0;k<n;k++)outline.push([-1+2*k/n,-1]);for(let k=0;k<n;k++)outline.push([1,-1+2*k/n]);for(let k=0;k<n;k++)outline.push([1-2*k/n,1]);for(let k=0;k<n;k++)outline.push([-1,1-2*k/n]);
  const vertices=[],colors=[],indices=[],color=new T.Color();
  for(let j=0;j<4;j++)for(let i=0;i<outline.length;i++){const [x,z]=outline[i],t=[.98,1,1.04,.48][j],noise=Math.sin(i*2.17+j*.9)*.3+Math.sin(i*.71)*.22;
   vertices.push(-32+x*10.2*t+(j?noise:0),[5.25,11.65,14.1,15.6][j]+(j?noise*.9:0),-17+z*(j===0&&z<0?7.25:9.1)*t+(j?noise*.7:0));color.setHex(0xc3c0ad).multiplyScalar(.93+noise*.08);colors.push(color.r,color.g,color.b);}
  const count=outline.length;for(let j=0;j<3;j++)for(let i=0;i<count;i++){if(j===0&&i>=n*2&&i<n*3)continue;const next=(i+1)%count,a=j*count+i,b=j*count+next,c=a+count,d=b+count;indices.push(a,c,b,b,c,d);}
  vertices.push(-32,16,-17);colors.push(.57,.55,.49);const top=count*4;for(let i=0;i<count;i++)indices.push(count*3+i,top,count*3+(i+1)%count);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();const capMesh=mesh(g,rock,P(0,0,0));capMesh.name='kongtong:cave-cap';
 }
 // Upper waystation: an open timber shelter facing the gorge and lower court.
 yield;
 at(8,8.4,-45);B(21,.24,12,0,0,0,stone);B(21,.025,12,0,.24,0,wood,false);for(const x of[-9.5,9.5])for(const z of[-5,5]){B(.6,.25,.6,x,.265,z,M.ashlar);C(.18,.22,3.8,x,.515,z,M.woodDark);}
 B(21,3.9,.3,0,.265,-6,plaster);for(const z of[-5,5])B(19.6,.3,.28,0,4.05,z,M.woodDark,false);for(let x=-9;x<=9;x+=1.2)B(.12,.2,10,x,4.05,0,wood,false);kit(()=>roof(23,14,2,.45,0,4.4,0));label('古道驿亭',8,12.1,-39.8,0,.72);
 for(const x of[2,8,14])seat('kongtong:inn:'+x,x,8.665,-43,Math.PI,'驿亭歇脚望谷');
 at(8,8.665,-49);B(7,.12,1.6,0,.72,0,wood);for(const x of[-3,3])for(const z of[-.6,.6])B(.12,.72,.12,x,0,z,M.woodDark);
 for(const x of[-1.5,0,1.5]){C(.15,.09,.14,x,.84,0,M.bronze,false,16);C(.12,.12,.01,x,.98,0,M.water,false,16);}b.crate(-1,8.665,-49,.9);b.sacks(17,8.665,-49,3,false);
 a.on('kongtong:tea',P(8,9.9,-47.8),2.6,'驿亭歇茶',()=>{a.sound('bowl');a.card('一程山路，一盏茶','古道驿亭','从西窟上来，或从东阶登高，都能到这里歇脚。杯盏放稳，坐下看看谷中的来路。');});
 a.npc('驿亭主人',[16,8.665,-48],Math.PI/2,{robe:3,hat:true},'来客可以在亭里喝茶。东边长阶通拳坪，西边石道经过观山窟。');
 yield;
 a.on('kongtong:view',P(30,9.7,-49),2.8,'从崖边看山路',()=>a.card('山路相连','古道驿亭外','看清入口、拳坪、石窟与石阶，再回望走过的路。不必走得很快，绕一圈就熟悉了。'));
 // A legible site plan in the scene mirrors the actual loop.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d');c.fillStyle='#dfd2b4';c.fillRect(0,0,512,512);c.strokeStyle='#756242';c.lineWidth=10;c.lineJoin='round';
 const map=([x,z])=>[256+x*4,256+z*3.5];c.beginPath();[[0,52],[0,12],[-12,8],[-32,8],[-20.5,0],[-20.5,-25.2],[-31,-25.2],[-31,-39],[28,-39],[28,-17],[31,12],[0,12]].forEach((p,i)=>{const q=map(p);i?c.lineTo(...q):c.moveTo(...q);});c.stroke();
 c.fillStyle='#4c382c';c.font='27px "Songti SC",serif';c.textAlign='center';c.fillText('崆峒行路图',256,38);for(const [text,x,z]of[['山门',0,38],['拳坪',8,0],['观山窟',-32,-16],['驿亭',8,-45]]){const q=map([x,z]);c.fillText(text,q[0],q[1]);}
 const mapTexture=new T.CanvasTexture(canvas);mapTexture.colorSpace=T.SRGBColorSpace;const board=new T.MeshStandardMaterial({map:mapTexture,roughness:1});at(-7,2.4,14);B(2.6,2.6,.1,0,.65,0,wood);const panel=mesh(new T.PlaneGeometry(2.4,2.4),board,P(-7,4.35,14.06));for(const x of[-1,1])B(.12,.7,.15,x,0,0,M.woodDark);
 a.on('kongtong:map',P(-7,3.9,14.1),2.7,'看山路图',()=>a.card('绕谷一程','崆峒行路图','山门进拳坪，西阶通观山窟，北阶上驿亭，东侧长阶再回拳坪。三段石阶连成一圈，沿路都有歇脚的地方。'));
 yield;
 const trees=[[-6,0,43,7],[6,0,34,7],[-11,2.4,-15,7],[32,2.4,16,8],[-40,5.4,-3,8],[-22,8.4,-49,8],[33,8.4,-49,7],[-10,2.4,17,6.5],[14.5,2.4,-5.5,6.2]];const pines=buildPines(T,root,M,trees);pines.group.name='kongtong:close-pines';
 for(const [x,y,z,h]of trees){at(x,y,z);col(.55,h*.5,.55,0,0,0);B(2,.015,2,0,.045,0,soil,false);}
 // A real resting place faces the teacher, with a clear approach from the path.
 at(17,2.4,-3);for(const x of[-.32,.32])for(const z of[-2.15,2.15])B(.15,.42,.18,x,0,z,M.woodDark);B(.95,.08,5,0,.42,0,wood);for(const z of[-2.15,2.15])B(.12,1,.14,.42,0,z,M.woodDark);B(.1,.18,5,.42,.72,0,wood);B(.1,.15,5,.42,.98,0,wood);
 for(const [id,z]of[['north',-4.35],['south',-1.65]])a.rest('kongtong:bench:'+id,P(16.8,2.9,z),Math.PI/2,'松旁歇脚看随式',{bench:true,exit:P(16.05,2.4,z)});
 yield;
 mountainLandscape(T,root,'kongtong',M.cliff);
 const paper=new T.MeshStandardMaterial({color:0xe5d3a3,emissive:0xffbb64,emissiveIntensity:.4,roughness:1});
 for(const [x,y,z,ceiling]of[[-32,10,-17,11.6],[8,11.5,-45,12.6],[25,5.1,-9,5.9]]){at(0,0,0);C(.015,.015,ceiling-y-.24,x,y+.24,z,M.iron,false,8);S(.24,x,y,z,paper,.85,1,.85,18,12);C(.12,.12,.04,x,y+.2,z,M.bronze,false,12);plight(x,y,z,0xffd29c,18,13);}
 a.walkers([[0,12],[19,12],[32,0],[-8,-12]],3);
 yield;
 const incense=kit(()=>b.palette({marble:stone},()=>kongtongCourts(b,a,rock)));
 return{id:'kongtong',name:'崆峒',subtitle:'入山城 · 拳坪随式 · 绕谷歇茶',spawn:{p:[0,0,53],yaw:0},guide:'山口西岔游皇城 · 东访拳院，北上拳坪',
  locate(p){if(p.x<-70&&Math.abs(p.z-17)<8)return'崆峒山 · 三教洞';if(p.y<1&&p.x<-8)return p.z<10?'崆峒皇城 · 玉皇殿':p.z<32?'崆峒皇城 · 真武殿':'崆峒皇城 · 前献殿';if(p.x>8&&p.z>31)return'崆峒 · 拳院议事堂';if(p.z>30)return'崆峒 · 关陇古道';if(p.z>20)return'崆峒 · 入山石阶';if(p.y>8)return'崆峒 · 古道驿亭';if(p.x<-18)return p.z<-9?'崆峒 · 观山窟':p.y<5?'崆峒 · 西阶':'崆峒 · 窟前石台';if(p.z<-20)return'崆峒 · 沿崖石阶';if(p.x>19&&p.z<-3)return'崆峒 · 器具舍';return'崆峒 · 拳坪';},
  snapshot:incense.snapshot,
  tick(dt){incense.tick();surfaces.sync();granite.sync();caveRock.sync();pines.update(dt);garden.update(dt);}
 };
}
