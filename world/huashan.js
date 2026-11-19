import {huashanCourts} from './sect-courts.js';
import {townSurfaces} from './surfaces.js';
import {mountainLandscape} from './landscape.js';
import {practiceSword} from './sword.js';
import {graniteMaterial,cliffGeometry} from './granite.js';
import {buildPines} from './pine.js';

// A continuous climb across four ledges. Geometry, navigation and interaction
// heights agree; the cleft under the bridge has no invisible walkable floor.
export function* buildHuashan(b,a){
 const {THREE:T,M,at,B,C,G,S,col,roof,hall,plaque,boulder,plight}=b,V=T.Vector3,root=a.root;
 const P=(x,y,z)=>new V(x,y,z),surfaces=townSurfaces(T,M),{wood,stone}=surfaces;
 const granite=graniteMaterial(T,M.cliff);
 const plaster=new T.MeshStandardMaterial({color:0xc6c1aa,roughness:1}),paint=M.paint.clone();paint.color.setHex(0x5b6259);
 const kit=fn=>b.palette({red:plaster,wood:M.woodDark,paint,gold:M.bronze,eave:wood},fn);
 const sign=(text,x,y,z,r=0,h=.6)=>{at(x,y,z,r);plaque(text,0,0,0,{h,bg:'#353d37',fg:'#e2d5af'});};
 yield;
 const mesh=(g,m,p,parent=root)=>{const o=new T.Mesh(g,m);o.position.copy(p);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 function beam(p,q,r,m){const d=q.clone().sub(p),g=new T.CylinderGeometry(r,r,d.length(),7);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(P(0,1,0),d.normalize()));at(0,0,0);G(g,m,...p.clone().add(q).multiplyScalar(.5).toArray());}
 function guard(x0,z0,x1,z1,y0,y1=y0,rope=false){
  const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,z1-z0)/2.8));
  for(let i=0;i<=n;i++){const u=i/n,x=x0+(x1-x0)*u,z=z0+(z1-z0)*u,y=y0+(y1-y0)*u;at(x,y,z);C(.07,.1,1.15,0,0,0,rope?M.woodDark:M.iron,false,8);S(.1,0,1.18,0,rope?wood:M.bronze,1,.7,1,8,6);
   if(i===n)continue;const v=(i+1)/n,xx=x0+(x1-x0)*v,zz=z0+(z1-z0)*v,yy=y0+(y1-y0)*v;
   for(const h of[.55,1.06]){if(rope){const curve=new T.QuadraticBezierCurve3(P(x,y+h,z),P((x+xx)/2,(y+yy)/2+h-.13,(z+zz)/2),P(xx,yy+h,zz));at(0,0,0);G(new T.TubeGeometry(curve,10,.028,5,false),M.sack,0,0,0);}else beam(P(x,y+h,z),P(xx,yy+h,zz),.025,M.iron);}
   at(0,0,0);col(Math.abs(xx-x)+.18,1.25+Math.abs(yy-y),Math.abs(zz-z)+.18,(x+xx)/2,Math.min(y,yy),(z+zz)/2);
  }
 }
 function ledge(x,z,w,d,y){
  at(0,0,0);B(w,.35,d,x,y-.35,z,M.ashlar);B(w,.025,d,x,y,z,stone,false);
  const clearance=[[-2.9,2.9,21.5,40],[30.4,35.6,-23.6,0],[-11.6,-6.4,-56.2,-39.8]];
  const cliff=mesh(cliffGeometry(T,{x,z,w,d,y,clearance}),granite.material,P(0,0,0));cliff.name='huashan:ledge';
 }
 function stairs(x,z,width,base,rise,n,run=.7){
  for(let i=0;i<n;i++){const y=base+rise*(i+1)/n;at(0,0,0);B(width,y-base+.4,run,x,base-.4,z-(i+.5)*run,M.ashlar);B(width,.024,run,x,y,z-(i+.5)*run,stone,false);}
  for(const s of[-1,1])guard(x+s*(width/2+.14),z,x+s*(width/2+.14),z-n*run,base,base+rise);
 }
 // Arrival and lower climb.
 yield;
 ledge(0,47.5,12,19,0);ledge(-4,8,56,30,4.8);stairs(0,39,4.8,0,4.8,24);
 guard(-6,57,-6,51,0);guard(-6,43,-6,38,0);guard(6,57,6,38,0);guard(-6,57,-3,57,0);guard(3,57,6,57,0);
 guard(-6,38,-2.6,38,0);guard(2.6,38,6,38,0);
 guard(-32,23,-3,23,4.8);guard(3,23,24,23,4.8);guard(-32,23,-32,-7,4.8);guard(-32,-7,-16,-7,4.8);guard(-7,-7,24,-7,4.8);guard(24,23,24,3,4.8);guard(24,-3,24,-7,4.8);
 // A narrow gate leaves the high sword court visible above the stair.
 at(0,0,43);for(const x of[-3.2,3.2]){B(.65,.35,.65,x,0,0,M.ashlar);C(.22,.26,3.8,x,.35,0,M.woodDark);}B(7.2,.3,.4,0,4.15,0,M.woodDark,false);kit(()=>roof(9.5,4.6,1.8,.45,0,4.55,0));sign('华山',0,3.8,43.3,0,.8);
 // The sword court is the only broad outdoor space; the rest follows the ridge.
 yield;
 kit(()=>hall(-23,6,4.8,1,16,10,{name:'听剑舍',plat:.51,ch:3.6,porch:1.8,empty:true,inner:'从容有度'}));
 at(-24,5.31,6);B(1.1,.12,5.8,0,.7,0,wood);for(const z of[-2.4,2.4])for(const x of[-.4,.4])B(.1,.7,.1,x,0,z,M.woodDark);B(.48,.04,.7,0,.82,0,M.paper,false);
 for(const z of[2.8,8.8]){b.cushion(-23,5.31,z,-Math.PI/2);a.rest('huashan:hall:'+z,P(-23,5.31,z),-Math.PI/2,'舍内歇息');}
 a.on('huashan:notes',P(-22.5,6.2,6),2.6,'翻看剑坪札记',()=>a.card('华山剑脉','听剑舍 · 弟子札记','巡山回来，弟子会在舍里记下山路晴雨。弟子在这页留下日常功课：剑坪用木剑随式。先看提剑，再看手臂如何展开，最后看收剑回身。这里的三段动作由三四编排，供游历者观察与跟练。'));
 at(1,4.8,8);
 for(const [g,m,y]of[[new T.RingGeometry(6.95,7.4,96),M.ashlar,.03],[new T.CircleGeometry(6.95,96),stone,.035]]){
  g.rotateX(-Math.PI/2);const p=g.attributes.position,uv=g.attributes.uv,s=m.userData.s||4;for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+1)/s,(p.getZ(i)+8)/s);G(g,m,0,y,0);
 }
 yield;
 for(const z of[5,8,11]){at(1,4.8,z);B(1.1,.045,.08,0,.035,0,M.bronze,false);}
 const teacher=a.npc('持剑教习',[1,4.8,2.2],0,{robe:3,bun:true,beard:true});a.practice.prepare(teacher.f,2);teacher.f.post=f=>a.practice.teacherPose(f,teacher.t,2);
 a.on('huashan:sword',P(1,5.8,10.5),3.2,'随教习练木剑',()=>a.practice.start(P(1,4.8,9),Math.PI,teacher.f,2));
 sign('剑坪',11,6.4,11,0,.6);at(11,4.8,11);B(.1,1.6,.12,0,0,0,M.woodDark);
 a.npc('守舍弟子',[-14,4.8,12],Math.PI/2,{robe:4,bun:true},'剑坪留出了两人相向的空处。练过木剑，沿东边石阶上去，过桥便是歇脚亭。');
 // Wooden practice blades hang from a rack, with their guards resting on pegs.
 at(-5,4.8,-3.5);for(const x of[-2,2])B(.12,2,.18,x,0,0,M.woodDark);B(4.4,.16,.22,0,1.75,0,wood,false);
 yield;
 for(const x of[-6.5,-5,-3.5]){const sword=practiceSword(T);sword.position.set(x,6.45,-3.2);sword.rotation.x=Math.PI/2;root.add(sword);at(x,6.45,-3.5);B(.09,.08,.45,0,0,.1,M.woodDark,false);}
 // Route board is drawn in the scene; paths match the actual ledge connections.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#ddd1ac';ctx.fillRect(0,0,512,512);ctx.strokeStyle='#5c6c57';ctx.lineWidth=9;ctx.lineJoin='round';ctx.beginPath();
 const route=[[256,456],[256,314],[406,280],[406,190],[206,190],[206,75]];route.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.fillStyle='#263a30';ctx.font='26px "Songti SC",serif';ctx.textAlign='center';ctx.fillText('华山行路图',256,38);
 for(const [x,y,name,tx,ty]of[[256,456,'山门',256,494],[256,314,'剑坪',180,317],[406,190,'崖桥',415,145],[206,190,'歇脚亭',128,175],[206,75,'朝阳台',118,82]]){ctx.fillStyle='#a05a3c';ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#314635';ctx.font='23px "Songti SC",serif';ctx.fillText(name,tx,ty);}
 ctx.font='18px sans-serif';ctx.fillText('示意路线 · 距离不按比例',256,400);const mapTexture=new T.CanvasTexture(canvas);mapTexture.colorSpace=T.SRGBColorSpace;const mapMaterial=new T.MeshStandardMaterial({map:mapTexture,roughness:1});
 at(-11,4.8,18);for(const x of[-1.35,1.35])B(.11,2.7,.13,x,0,0,M.woodDark);B(3.1,2.6,.15,0,.8,0,wood,false);mesh(new T.PlaneGeometry(2.8,2.4),mapMaterial,P(-11,6.9,18.09));
 yield;
 a.on('huashan:route',P(-11,6.3,19.1),3,'辨认上山路线',()=>a.card('从剑坪到朝阳台','华山行路图','先沿剑坪东侧上石阶，到崖边转向西，经过木桥。桥头歇脚亭可坐下喝茶；从亭后再上一段石阶，便是朝阳台。下山沿原路回到南侧山门。'));
 // The eastern stair climbs above the court and ends at a small bridge landing.
 ledge(29.5,0,12,6,4.8);guard(24,3,35.5,3,4.8);guard(35.5,3,35.5,-1,4.8);guard(24,-3,30.7,-3,4.8);
 stairs(33,-1,4.2,4.8,6,30,.72);ledge(33.5,-25,13,8,10.8);
 guard(27,-29,40,-29,10.8);guard(40,-29,40,-21,10.8);guard(40,-21,35.3,-21,10.8);guard(30.7,-21,27,-21,10.8);
 guard(27,-29,27,-27.9,10.8);guard(27,-24.1,27,-21,10.8);
 // A supported timber bridge spans the open cleft, with paired rope handrails.
 yield;
 at(0,0,0);B(18.4,.24,3.8,19.2,10.56,-26,M.woodDark);for(let i=0;i<32;i++)B(.54,.045,3.75,10.3+i*.57,10.8,-26,wood,false);
 for(const z of[-27.35,-24.65])beam(P(10,10.4,z),P(28.4,10.4,z),.15,M.woodDark);
 guard(10,-27.9,28.4,-27.9,10.8,10.8,true);guard(10,-24.1,28.4,-24.1,10.8,10.8,true);
 for(const x of[10.4,27.8])for(const z of[-27.5,-24.5])beam(P(x,9.4,z),P(x+(x<20?2.5:-2.5),10.4,z),.13,M.woodDark);
 sign('过桥入亭',35,12.3,-27.5,1,.5);at(35,10.8,-27.5);B(.1,1.5,.12,0,0,0,M.woodDark);
 a.on('huashan:bridge',P(34.8,11.9,-26),2.5,'看看崖桥的结构',()=>a.card('桥与山相接','崖桥','桥面由横铺木板组成，下面两根纵梁把重量传到两端石台。两侧绳索作扶手，步道在桥面上；站在桥中央，可以回望来路。'));
 // The upper tea pavilion and final climb.
 yield;
 ledge(-3,-31.5,28,21,10.8);guard(-17,-21,11,-21,10.8);guard(-17,-21,-17,-42,10.8);guard(11,-21,11,-24.1,10.8);guard(11,-27.9,11,-42,10.8);
 guard(-17,-42,-11.4,-42,10.8);guard(-6.6,-42,11,-42,10.8);
 at(-6,10.8,-30);B(18,.3,11,0,0,0,M.ashlar);B(18,.025,11,0,.3,0,wood,false);for(const x of[-7.7,7.7])for(const z of[-4.4,4.4]){B(.45,.22,.45,x,.3,z,M.ashlar);C(.16,.2,3.3,x,.52,z,M.woodDark);}
 for(const z of[-4.4,4.4])B(16,.3,.25,0,3.82,z,M.woodDark,false);for(let x=-7;x<=7;x++)B(.1,.18,9,x,3.8,0,wood,false);kit(()=>roof(20,13,2.6,.55,0,4.2,0));sign('歇脚亭',3.9,14.3,-30,1,.65);
 at(-6,11.1,-30);B(4,.12,1.35,0,.65,0,wood);for(const x of[-1.7,1.7])for(const z of[-.45,.45])B(.11,.65,.11,x,0,z,M.woodDark);
 for(const x of[-7.2,-5.8]){at(x,11.9,-30);C(.12,.09,.14,0,0,0,M.marble,false,16);C(.09,.09,.01,0,.14,0,M.dark,false,16);}
 for(const x of[-10,-6,-2]){b.cushion(x,11.1,-33,Math.PI);a.rest('huashan:tea:'+x,P(x,11.1,-33),Math.PI,'亭中品茶歇脚');}
 yield;
 a.npc('煮茶山客',[-11,11.1,-29],Math.PI/2,{visitor:true,robe:0,hat:true,bag:true},'石阶走累了，先在亭里歇一歇。亭后还有一小段路，朝阳台面向开阔的山谷。');
 stairs(-9,-40.8,4.2,10.8,3.6,18,.8);ledge(-8.5,-58.6,23,6.8,14.4);
 guard(-20,-55.2,-11.4,-55.2,14.4);guard(-6.6,-55.2,3,-55.2,14.4);guard(-20,-55.2,-20,-62,14.4);guard(-20,-62,3,-62,14.4);guard(3,-62,3,-55.2,14.4);
 for(const z of[-56,-59]){b.cushion(.4,14.4,z,-Math.PI/2);a.rest('huashan:sun:'+z,P(.4,14.4,z),-Math.PI/2,'朝阳台望山');}
 sign('朝阳台',-15.3,16.1,-59,0,.55);at(-15.3,14.4,-59);B(.15,1.7,.18,0,0,0,M.woodDark);
 at(-16.5,14.4,-56.5);C(.07,.12,2.9,0,0,0,M.woodDark);B(1.4,.1,.12,.6,2.8,0,M.woodDark,false);C(.01,.01,.35,1.1,2.4,0,M.iron,false,6);C(.16,.23,.3,1.1,2.1,0,M.bronze,false,16);C(.018,.018,.32,1.1,1.9,0,M.woodDark,false,6);
 a.on('huashan:bell',P(-15.4,15.8,-56.3),2.7,'轻叩风铃',()=>{a.sound('bowl');a.message('铃声过谷 · 在这里看看山色。');});
 yield;
 a.on('huashan:sunrise',P(-15.3,15.8,-58),2.5,'读朝阳台题记',()=>a.card('朝阳台','峰顶古道','沿栏边坐下，可以看山色随晨、午、暮、夜变化。时辰按钮随时可切换，回程则沿亭后的石阶下行。'));
 const treePositions=[[-4.6,0,52,7],[5,0,40,8],[-29,4.8,18,10],[19,4.8,18,8],[19,4.8,-5,9],[-15,10.8,-39,7],[-18,14.4,-60,6]];
 const pines=buildPines(T,root,M,treePositions);
 for(const [x,y,z,h]of treePositions){at(x,y,z);col(.55,h*.5,.55,0,0,0);}
 for(const [x,y,z,r]of[[-28,4.8,-5,1.3],[20,4.8,12,1.1],[-14,10.8,-23,1.2],[38,10.8,-27.5,.8],[-16,14.4,-57,1]])boulder(x,y,z,r);
 yield;
 mountainLandscape(T,root,'huashan',M.cliff);
 at(0,0,0);plight(-23,7.5,6,0xffd29e,13,12);plight(-6,13.7,-30,0xffd39e,12,12);
 a.walkers([[-10,13],[13,12],[16,1]],2);
 at(-4.5,0,51);B(.12,1.8,.14,0,0,0,M.woodDark);sign('关陇古道 · 崆峒',-4.5,1.7,51,0,.42);a.on('huashan:kongtong',P(-4.5,1.3,51),3,'沿关陇古道去崆峒',()=>a.travel('kongtong'));
 yield;
 const incense=kit(()=>b.palette({marble:stone},()=>huashanCourts(b,a)));
 return{id:'huashan',name:'华山',subtitle:'登石阶 · 剑坪随式 · 过崖桥望山',spawn:{p:[0,0,53],yaw:0},guide:'西访玉泉院 · 过险门上剑坪，北访议事堂、东登崖台',
  locate(p){if(p.x<-6&&p.z>38)return'华山 · 玉泉院希夷祠';if(p.y<6&&p.z<-7)return p.x>0?'华山 · 弟子舍':'华山 · 议事堂';if(p.y>13.5)return'华山 · 朝阳台';if(p.y>10&&p.x<12)return p.z<-40?'华山 · 峰顶石阶':'华山 · 歇脚亭';if(p.y>9&&p.z<-21)return p.x<28?'华山 · 崖桥':'华山 · 桥头';if(p.x>25)return'华山 · 沿崖石阶';if(p.z>38)return'华山 · 山门古道';if(p.z>23)return'华山 · 入山石阶';if(p.x<-16)return'华山 · 听剑舍';return'华山 · 剑坪';},snapshot:incense.snapshot,tick(dt){incense.tick();surfaces.sync();granite.sync();pines.update(dt);}};
}
