import {buildWealthShrine} from './sanqing-caishen.js';
// 三四镇: authored circulation and buildings, using the temple's own construction kit.
// Coordinates are metres. South arrival -> market -> stone bridge -> northern lanes.
import {townSurfaces} from './surfaces.js';
import {layPaving} from './street-paving.js';
export function* buildTown(b, a) {
  const {THREE, M, at, B, C, G, S, col, roof, hall, plaque, pine, bamboo,
    boulder, crate, sacks, cushion, lantern, rail, plight, ginkgo:baseGinkgo, shrub, lstring, wall} = b;
  const V3 = THREE.Vector3, root = a.root;
  // Town paving is quieter than the ceremonial marble of the temple.
  // These materials belong to this region; shared temple materials stay intact.
  const surfaces=townSurfaces(THREE,M),{stone:streetM,soil:vergeM,cloth:canopyM,wood:timberM}=surfaces;
 yield;
  const ginkgo=(...args)=>b.palette({ginkgo:M.gkC},()=>baseGinkgo(...args));
  const point = (x,y,z) => new V3(x,y,z);
  const label = (text,x,y,z,r=0,h=.65) => {at(x,y,z,r);plaque(text,0,0,0,{h,bg:'#302b24',fg:'#e6d2a6'});};
  const house = (x,z,r,w,d,name) => b.palette({red:M.brick,paint:M.woodDark,wood:M.woodDark,gold:M.bronze},
    () => hall(x,z,0,r,w,d,{name,plat:.51,ch:3.8,porch:1.8,empty:true}));
  const bench = (x,y,z,r=0) => {
    at(x,y,z,r);B(2.7,.12,.52,0,.42,0,M.woodDark);
    for(const s of [-1,1]){B(.14,.42,.44,s*1.05,0,0,M.wood);B(.12,.62,.12,s*1.12,.48,-.2,M.wood);}
    B(2.5,.18,.1,0,.94,-.2,M.woodDark,false);
  };
 yield;
  const table = (x,y,z,r=0) => {
    at(x,y,z,r);B(2.1,.09,1.05,0,.69,0,timberM);
    for(const sx of [-.85,.85])for(const sz of [-.35,.35])B(.09,.69,.09,sx,0,sz,timberM);
    B(1.7,.08,.08,0,.2,-.35,timberM,false);B(1.7,.08,.08,0,.2,.35,timberM,false);
  };
  function bowl(x,y,z,r=.1){at(x,y,z);C(r,r*.65,.1,0,0,0,M.marble,false,16);C(r*.82,r*.82,.012,0,.096,0,M.dark,false,16);}

  // A real canal cut: the walking surface does not continue beneath its water.
 yield;
  at(0,0,0);
  B(122,45,126,0,-47,-3,M.cliff);
  B(116,1.75,60,0,-1.8,26,M.ashlar);B(116,1.75,52,0,-1.8,-36,M.ashlar);
  B(116,.05,60,0,-.05,26,vergeM);B(116,.05,52,0,-.05,-36,vergeM);
  B(116,.25,6,0,-2,-7,M.rock);
  B(116,.025,6,0,-.9,-7,M.water,false);
  const streets=[[0,30,7.6,50],[0,-36.5,7.6,47],[-23,17,24,22],[20,16,18,20],[0,18,27,3.6],[0,-2,104,3],[0,-12,104,3],[22,-27,20,22],[0,-27,40,3.6],[-10,-13.4,20,3],[-18.4,-20,2.7,15]];
 yield;
  layPaving(b,streetM,.026,streets);
  for(const x of [-3.9,3.9])B(.18,.035,48,x,.01,29,M.ashlar,false);
  // Stone aprons connect doors to the street. The remaining ground is planted,
  // so the town reads as lanes and yards rather than an uninterrupted plaza.
  for(const z of [-10.25,-3.75]){B(116,.18,.45,0,-.08,z,M.ashlar);}
  for(const z of [-10.3,-3.7])for(const [x0,x1]of[[-58,-4.6],[4.6,36],[44,58]])rail(x0,z,x1,z,0);
  function bridge(x) {
    at(x,0,-7);
    // The broad central deck rests on two masonry piers and abutments.
    B(7.6,.55,5.8,0,-.15,0,M.ashlar);B(7.7,.06,5.8,0,.4,0,M.paving);
    for(const sx of [-1,1])B(1,2.1,1.3,sx*2.9,-2,0,M.ashlar);
    for(const s of [-1,1])for(let i=0;i<4;i++)B(7.6,.115*(4-i),.6,0,0,s*(3.2+i*.6),M.ashlar);
    rail(x-3.9,-12.6,x-3.9,-1.4,.45);rail(x+3.9,-12.6,x+3.9,-1.4,.45);
  }
 yield;
  bridge(0);bridge(40);

  function gateLanterns(z,beamHeight){
    at(0,0,z);
    for(const x of [-2.85,2.85]){
      const y=beamHeight-.76;
      B(.10,.13,.98,x,beamHeight-.08,.45,M.woodDark,false);
      C(.02,.025,.32,x,y+.35,.88,M.iron,false,8);
      S(.32,x,y,.88,M.lantern,1,1.15,1,16,12);
      for(const side of [-1,1])C(.18,.18,.065,x,y+side*.32,.88,M.bronze,false,12);
      C(.025,.04,.19,x,y-.52,.88,M.red,false,8);
      plight(x,y-.13,1.02,0xffbb70,12,12);
    }
  }
  // South gate, with a 7.8m clear opening and visible street beyond.
 yield;
  at(0,0,43);
  for(const x of [-4.2,4.2]){B(.9,.45,.9,x,0,0,M.ashlar);C(.23,.29,4.5,x,.45,0,M.woodDark);}
  B(9.4,.55,.65,0,4.5,0,M.woodDark);roof(12.2,5.2,1.8,.6,0,5.05,0);
  label('三四镇',0,4.2,43.42,0,.9);
  gateLanterns(43,4.65);
  label('过桥出北门 · 少林寺',6.3,1.6,47,0,.5);
  at(6.3,0,47);B(.12,1.6,.16,0,0,0,M.woodDark);
 yield;
  a.on('town:return',point(6.3,1.2,47),3.2,'问去少林寺的路',()=>a.travel('temple'));

  at(3.7,0,20.5);B(.16,1.85,.16,0,0,0,M.woodDark);
  label('茶棚试茶 →',3.7,1.65,20.62,0,.52);

  // Inn: main room faces the street; the north wing encloses a usable side yard.
  house(-19,18,1,17,10,'山下客栈');house(-29,2,0,13,7,'听雨小舍');
 yield;
  at(0,0,0);B(19,.035,20,-24,0,9,M.paving,false);
  table(-18,.51,14,1);table(-18,.51,22,1);
  bench(-16.7,.51,14,1);bench(-19.5,.51,14,3);
  bench(-16.7,.51,22,1);bench(-19.5,.51,22,3);
  at(-22,.51,18);B(.85,1,5.4,0,0,0,M.woodDark);B(.92,.08,5.5,0,1,0,M.wood);
  for(const z of [15.6,18,20.4]){bowl(-21.8,1.59,z,.13);}
  for(const x of [-32,-28]){
    at(x,.51,1);B(2.8,.3,2.3,0,0,0,M.woodDark);B(2.6,.035,2.1,0,.3,0,M.sack,false);
    cushion(x,.845,1,0);
    a.rest(`town:inn:${x}`,point(x,.845,1),0,'坐榻歇息');
    label('歇脚',x,2.6,-1.4,0,.4);
  }
 yield;
  a.npc('客栈掌柜',[-23,.51,18],Math.PI/2,{robe:4,beard:true},'进门是热茶，北边小舍可歇脚。过桥往西，先到街坊的财神殿，沿西巷再走就是镖局驿站。');
  crate(-31,0,29);sacks(-29,0,28,4,true);lantern(-12,0,24);

  // Open tea pavilion: every bay looks out onto street or water, no false walls.
  at(20,0,16);B(13,.36,12,0,0,0,M.ashlar);B(13,.015,12,0,.36,0,M.dark,false);
  for(let j=0;j<40;j++)for(let i=0;i<4;i++)B(3.235,.025,.292,-4.875+i*3.25,.375,-5.85+j*.3,timberM,false);
  col(13,.04,12,0,.36,0);
 yield;
  B(5,.18,1.2,-4,0,6.6,M.ashlar);
  for(const x of [-5.4,0,5.4])for(const z of [-4.8,4.8]){C(.23,.29,.22,x,.4,z,M.ashlar);C(.16,.2,3.55,x,.62,z,M.woodDark);}
  for(const z of [-4.8,4.8])B(11.6,.38,.28,0,4.02,z,M.woodDark,false);
  for(const x of [-5.4,5.4])B(.28,.38,10.2,x,4.02,0,M.woodDark,false);
  b.palette({woodDark:timberM,eave:timberM},()=>roof(15.4,14.4,3.6,.7,0,4.4,0));
  // Exposed rafters make the roof's underside legible from the sitting camera.
  for(let i=-6;i<=6;i++)B(.09,.18,11.4,i,4.05,0,timberM,false);
 yield;
  label('临水茶棚',13.2,3.7,16,3,.7);
  table(20,.4,15);table(24,.4,19);
  for(const [x,z,yaw] of [[18.1,15,-Math.PI/2],[21.9,15,Math.PI/2],[24,17.8,Math.PI],[24,20.2,0]]) {
    cushion(x,.4,z,yaw);a.rest(`town:tea:${x}:${z}`,point(x,.4,z),yaw,'临水坐一会');
  }
  for(const [x,z] of [[19.5,15],[20.5,15],[24,18.7],[24,19.3]])bowl(x,1.18,z,.095);
  // Learning station on the open western edge, accessible from the street.
 yield;
  table(15,.4,12);at(15,1.18,12);B(1.8,.045,.85,0,0,0,M.bronze,false);
  bowl(14.45,1.225,12,.13);bowl(15.4,1.225,12,.09);
  at(14.85,1.225,11.8);C(.14,.14,.22,0,0,0,M.woodDark,false,16);C(.155,.155,.03,0,.22,0,M.wood,false,16);
  const kettle=new THREE.Group();kettle.position.set(15.6,1.225,11.85);root.add(kettle);
  const body=new THREE.Mesh(new THREE.SphereGeometry(.2,18,12),M.bronze);body.position.y=.17;body.scale.set(1,.85,1);kettle.add(body);
  const lid=new THREE.Mesh(new THREE.CylinderGeometry(.12,.14,.025,16),M.bronze);lid.position.y=.31;kettle.add(lid);
  const handle=new THREE.Mesh(new THREE.TorusGeometry(.18,.025,7,20,Math.PI),M.woodDark);handle.position.y=.27;kettle.add(handle);
 yield;
  const spout=new THREE.Mesh(new THREE.CylinderGeometry(.035,.065,.29,10),M.bronze);spout.rotation.z=.8;spout.position.set(-.21,.23,0);kettle.add(spout);
  const stream=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,.35,7),M.water);stream.visible=false;root.add(stream);
  const leaves=new THREE.Mesh(new THREE.CircleGeometry(.065,12),M.leaf);leaves.rotation.x=-Math.PI/2;leaves.position.set(14.45,1.33,12);leaves.visible=false;root.add(leaves);
  const saved=a.savedState||{};
  let teaStep=[0,1,2].includes(saved.step)?saved.step:0;
  let pouring=Number.isFinite(saved.pouring)?Math.max(0,Math.min(teaStep===0?1.5:2.1,saved.pouring)):0;
  let lessonCount=Number.isSafeInteger(saved.completed)&&saved.completed>=0?saved.completed:0;
 yield;
  const teaSurface=new THREE.Mesh(new THREE.CircleGeometry(.105,16),new THREE.MeshStandardMaterial({color:0xb97828,roughness:.22}));
  teaSurface.rotation.x=-Math.PI/2;teaSurface.position.set(14.45,1.338,12);root.add(teaSurface);
  teaSurface.visible=saved.served===true&&lessonCount>0&&teaStep===0&&!pouring;
  leaves.visible=teaStep===2;
  const teaNames=['温杯 · 提壶润盏','置茶 · 取茶入盏','注水 · 收壶成茶'];
  a.on('town:tea-lesson',point(15,1.7,12),3.1,()=>pouring?null:teaSurface.visible?'端盏 · 品刚沏的茶':teaNames[teaStep],()=>{
    if(teaSurface.visible){teaSurface.visible=false;a.checkpoint();a.card('临水一盏','三四镇 · 茶棚','你端起自己沏的茶。第一口还烫，放下片刻，才尝到一点回甘。隔着棚柱，石桥上的脚步声一阵近，一阵远。');return;}
    if(teaStep===0){pouring=1.5;a.sound('pour');a.message('温杯 · 提壶，沿杯壁润一圈。');}
    else if(teaStep===1){leaves.visible=true;teaStep=2;a.sound('take');a.message('置茶 · 茶叶入盏，留出舒展的余地。');}
    else {pouring=2.1;a.sound('pour');a.message('注水 · 缓缓收壶，茶汤留七分。');}
    a.checkpoint();
  });
 yield;
  a.npc('煮茶人',[16.8,.4,11.8],-Math.PI/2,{robe:3,bun:true},'桌上有茶罐和水壶。你来试一盏，我在旁边看。');

  // Bookshop: workbench and readable page, with the street-facing opening left clear.
  house(21,-27,3,16,9,'过桥书铺');
  for(const z of [-31,-23]){
    at(24,.51,z);B(.5,2.3,5,0,0,0,M.woodDark);
    for(let i=0;i<4;i++)for(let j=0;j<7;j++)B(.09,.36,.38,-.3,.22+i*.51,-2+j*.63,j%2?M.paper:M.sack,false);
  }
 yield;
  table(22,.51,-27);
  at(22,1.29,-27);B(.62,.04,.43,0,0,0,M.paper,false);B(.018,.045,.44,0,0,0,M.woodDark,false);
  for(const x of [-.2,.13])for(let j=0;j<5;j++)B(.17,.004,.008,x,.043,-.13+j*.055,M.woodDark,false);
  a.on('town:book',point(22,1.6,-27),2.8,'翻阅游记',()=>a.card('山川行记','书铺抄本','山路看坡势，水路看流向。到了岔路，先认回程的地标，再向前走。'));
  a.npc('抄书人',[22.2,.51,-29.4],-Math.PI/2,{robe:2,bun:true},'书里记山川，路上认山川。你从南门来，记得两座石桥的位置。');

  a.on('town:reading',point(19.3,1.45,-25.1),2.35,'读图答问',a.trade.book);
 yield;
  a.on('town:deliver',point(20.2,1.45,-30.6),2.4,'交付书包',()=>a.trade.parcel(true));
  const wealthShrine=buildWealthShrine(b,a);
  at(-5.4,0,-14.4);B(.14,1.35,.14,0,0,0,M.woodDark);label('← 财神殿',-5.4,1.4,-14.4,0,.41);

  // Escort station: broad working yard, packing tables, handcart and stores.
  house(-25,-29,1,19,10,'平川镖局');house(-43,-30,1,12,7,'行囊库');
  at(0,0,0);B(29,.035,24,-29,.01,-29,M.paving,false);
 yield;
  label('三四镇驿站',-18.1,3.2,-29,1,.48);
  table(-24,.51,-26,1);crate(-28,.51,-34);crate(-29,.51,-33,1.1);sacks(-42,.51,-28,4,false);
  at(-14,0,-25);B(2.4,.13,1.5,0,.6,0,M.woodDark);B(2.3,.12,.08,0,.88,-.69,M.woodDark,false);B(2.3,.12,.08,0,.88,.69,M.woodDark,false);
  for(const z of [-.85,.85]){const g=new THREE.TorusGeometry(.42,.055,8,20);G(g,M.woodDark,0,.45,z);
    for(let i=0;i<6;i++){const spoke=new THREE.CylinderGeometry(.022,.022,.78,6);spoke.rotateZ(i*Math.PI/3);G(spoke,M.woodDark,0,.45,z);}}
  {const axle=new THREE.CylinderGeometry(.055,.055,1.9,8);axle.rotateX(Math.PI/2);G(axle,M.iron,0,.45,0);}
  for(const z of [-.5,.5])B(2.7,.09,.09,2,.65,z,M.woodDark,false);
 yield;
  crate(-14,.74,-25,.7);sacks(-15,.74,-25,2,false);
  a.npc('押镖师傅',[-19,.51,-32],Math.PI/2,{robe:1,hat:true},'出门先查行囊，再认渡口和歇脚处。平川镖局的总号在江南，这里是驿站。');
  a.on('town:route',point(-18,1.5,-27),3,'查看驿路',()=>a.card('三四镇驿路','山川之间，有路可行','沿长街过桥，从北门走到驿道。正北去少林，向东去武当，向西去华山与石灯院。武当学云手，石灯院访作坊，途中各有歇脚处。'));
  label('江南商路 · 总号',-17.2,1.8,-23.3,0,.53);at(-17.2,0,-23.3);B(.14,1.8,.16,0,0,0,M.woodDark);
  a.on('town:escort',point(-17.2,1.4,-23.3),3.2,'随驿车去平川总号',()=>a.travel('escort'));
  label('江汉道 · 武当',-15,1.8,-38,0,.55);at(-15,0,-38);B(.14,1.8,.16,0,0,0,M.woodDark);
  a.on('town:wudang',point(-15,1.4,-38),3.2,'沿江汉道去武当',()=>a.travel('wudang'));
 yield;
  label('西行 · 石灯院',-37,1.8,-40,0,.55);at(-37,0,-40);B(.14,1.8,.16,0,0,0,M.woodDark);
  a.on('town:ming',point(-37,1.4,-40),3.2,'随商旅去石灯院',()=>a.travel('ming'));
  label('巴蜀道 · 峨眉',-27,1.8,-42,0,.55);at(-27,0,-42);B(.14,1.8,.16,0,0,0,M.woodDark);
  a.on('town:emei',point(-27,1.4,-42),3.2,'沿巴蜀道去峨眉',()=>a.travel('emei'));
  label('关陇道 · 华山',-20,1.8,-44,0,.55);at(-20,0,-44);B(.14,1.8,.16,0,0,0,M.woodDark);
  a.on('town:huashan',point(-20,1.4,-44),3.2,'沿关陇道去华山',()=>a.travel('huashan'));

  // Beggar guild meeting point: a shaded clearing, visibly different from the shops.
 yield;
  ginkgo(-6.8,0,-47,9);boulder(5,0,-48,1.6);bench(-5,0,-46,1);bench(4,0,-44,3);
  label('丐帮歇脚处',-4,2,-42,0,.55);at(-4,0,-42);B(.11,2,.11,0,0,0,M.woodDark);
  label('河岸会所 →',4,2,-42,0,.5);at(4,0,-42);B(.11,2,.11,0,0,0,M.woodDark);
  a.on('town:beggar',point(4,1.4,-42),3,'沿老街去丐帮会所',()=>a.travel('beggar'));
  a.npc('结伴行路人',[1.6,0,-43.5],Math.PI,{robe:3,hat:true,bag:true},'树荫下歇一歇。各地都有同路人，先把脚下这条街认熟。');
  for(const x of [-1,1]){cushion(x,0,-43,Math.PI);a.rest(`town:tree:${x}`,point(x,0,-43),Math.PI,'树下歇脚');}

  // Low shop awnings frame the market lane. Open sides and rear access
  // stay usable; roofs are supported by posts, with goods on real counters.
  function stall(x,z,r,text,wares){
    at(x,0,z,r);B(4.5,.08,4.4,0,0,0,streetM);
    for(const sx of [-2,2])for(const sz of [-1.6,1.6])C(.07,.09,2.85,sx,.08,sz,M.woodDark,true,8);
    for(const sz of [-1.6,1.6])B(4.3,.15,.13,0,2.73,sz,M.woodDark,false);
    // A shallow pitched fabric roof, with no false doorway or solid infill.
    const cloth=new THREE.PlaneGeometry(4.8,4.2,4,4),p=cloth.attributes.position;
    for(let i=0;i<p.count;i++){const px=p.getX(i),pz=p.getY(i);p.setXYZ(i,px,2.95+.28*(1-Math.abs(pz)/2.1),pz);}
    cloth.setIndex([...cloth.index.array].reverse());cloth.computeVertexNormals();G(cloth,canopyM,0,0,0);
    for(const sx of [-1.7,1.7])B(.1,.9,.1,sx,.08,.8,M.woodDark);
    B(3.8,.1,1.05,0,.98,.8,M.woodDark);B(3.8,.3,.08,0,.68,1.3,M.woodDark,false);
    plaque(text,0,2.42,1.65,{h:.37,bg:'#3a3024',fg:'#e6d5ad'});
    for(let i=0;i<5;i++){
      const x=-1.35+i*.65;
      if(wares==='books'){B(.48,.05,.38,x,1.08,.8,M.paper,false);B(.44,.06,.34,x+.03,1.13,.82,M.sack,false);}
      else if(wares==='jars'){C(.17,.13,.3,x,1.08,.8,M.bronze,false,16);C(.14,.14,.04,x,1.38,.8,M.woodDark,false,12);}
      else{C(.19,.12,.1,x,1.08,.8,M.marble,false,16);for(let j=0;j<3;j++)S(.07,x+(j-1)*.09,1.22,.8,M.sack,1,.8,1,10,8);}
    }
  }
 yield;
  stall(-6.9,34,1,'行旅杂货','jars');stall(6.9,34,3,'热汤面','food');
  stall(-7.5,27,1,'旧书摊','books');stall(7.5,27,3,'山中茶','jars');
  a.on('town:parcel',point(-6.6,1.35,28.3),2.6,'旧书摊 · 领送书差事',()=>a.trade.parcel(false));
  a.on('town:shop',point(-6.4,1.3,35),2.6,'杂货摊 · 做买卖',a.trade.shop);
  a.on('town:carriage',point(-16,1.35,-25.7),2.5,'驿站 · 雇车远行',()=>a.trade.transport(false));
  for(const [type,z,free,paid,price] of [['tea',27,'大碗凉茶','新沏清茶',2],['meals',34,'街坊粥','热汤面',4]]){
    bench(10.2,0,z);bench(10.2,0,z+2.2);
    const seat=cost=>({p:point(10.2,.54,z+(cost?2.2:0)),yaw:Math.PI,bench:true,exit:point(10.3,0,z+(cost?2.2:0)+1.05)});
    a.on('town:'+type+'-order',point(7.1,1.35,z+1.4),2.6,type==='tea'?'茶摊 · 点茶':'面摊 · 用饭',()=>a.trade.service(type,free,paid,price,seat));
  }
 yield;
  a.on('town:sleep',point(-29,1.45,3.7),2.65,'客舍 · 投宿',()=>a.trade.service('nights','通铺','客房铺位',6,cost=>({p:point(cost?-32:-28,.845,1),yaw:0})));
  // These short side lanes lead around the stalls and into the existing yards.
  at(0,0,0);for(const x of [-7.4,7.4])B(5,.025,15,x,.001,31,streetM,false);
  crate(-10,0,35);sacks(-9.5,0,33,2,false);

  // Garden courts interrupt the paving and bring the street down to a human scale.
  for(const [x,z,w,d]of[[-9,10,5,9],[9,20,4.2,8],[31,30,11,10],[-38,39,13,9],[28,-48,13,10],[-25,-48,14,9]]){
    at(x,0,z);B(w,.08,d,0,.015,0,M.moss,false);
    B(w+.2,.16,.24,0,0,d/2,M.ashlar);B(w+.2,.16,.24,0,0,-d/2,M.ashlar);
    B(.24,.16,d,-w/2,0,0,M.ashlar);B(.24,.16,d,w/2,0,0,M.ashlar);
    for(const sx of [-1,1])shrub(x+sx*w*.28,0,z,.75);
  }
 yield;
  ginkgo(-9,0,10,7);ginkgo(8.8,0,20,7);ginkgo(31,0,30,8.5);
  ginkgo(-38,0,39,9);ginkgo(28,0,-48,10);ginkgo(-25,0,-48,8);
  // Keep the lantern line above the camera and away from the main street view.
  lstring(-8.9,38,8.9,38,5.8,5);lstring(-5.3,-17,6.5,-17,5.8,3);
  // A low perimeter belongs to the town; hills remain a distant backdrop.
  b.palette({red:M.brick},()=>{wall(-52,53,-52,-58);wall(52,53,52,-58);wall(-52,-58,-4.5,-58);wall(4.5,-58,52,-58);});

 yield;
  for(const [x,z,h]of[[-48,45,10],[-32,43,8],[36,36,9],[49,20,11],[-48,15,9],[50,-27,11],[-49,-49,12],[29,-49,10],[-15,-57,12],[47,-52,11]])pine(x,0,z,h);
  for(const [x,z]of[[30,14],[32,19],[34,12],[29,24],[39,-38],[41,-41],[-40,10]])bamboo(x,0,z);
  for(const [x,z,r]of[[-43,40,2.1],[47,30,2.8],[51,-45,2.1],[-45,-55,2.5],[33,4,1.8],[-8,-55,1.8]])boulder(x,0,z,r);
  for(const [x,z]of[[-6,38],[6,38],[-6,0],[6,-14],[10,24],[-10,-40],[35,-14]])lantern(x,0,z);
  // Continuous foothills rather than isolated, flat-topped cliff cylinders.
  // Broad forest and rock colour follows the terrain. Repeating paving/rock
  // maps on distant slopes produced the conspicuous horizontal bands.
 yield;
  const hillM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
  const terrain=new THREE.PlaneGeometry(1100,1100,128,128);terrain.rotateX(-Math.PI/2);
  const tp=terrain.attributes.position,tu=terrain.attributes.uv,tc=new Float32Array(tp.count*3),colour=new THREE.Color();
  const hills=[[-190,-190,75,100],[175,-260,115,100],[-50,-400,150,130],[285,-50,90,110],[-300,80,85,105],[100,280,78,115]];
  for(let i=0;i<tp.count;i++){
    const x=tp.getX(i),z=tp.getZ(i),d=Math.max(Math.abs(x),Math.abs(z+3));
    let h=-5;for(const [hx,hz,height,width]of hills)h+=height*Math.exp(-((x-hx)**2+(z-hz)**2)/(width*width));
    h+=Math.sin(x*.047+Math.cos(z*.033))*7+Math.sin(z*.061+x*.027)*4+Math.sin(x*.117-z*.081)*1.7;
    const k=Math.max(0,Math.min(1,(d-60)/40));h=-2+(h+2)*k*k*(3-2*k);const north=Math.max(0,Math.min(1,(-z-56)/20));tp.setY(i,h+(Math.min(h,-4)-h)*north);tu.setXY(i,x/17,z/17);
  }
 yield;
  terrain.computeVertexNormals();
  const forest=new THREE.Color(0x52664b),rock=new THREE.Color(0x8a897b),normals=terrain.attributes.normal;
  for(let i=0;i<tp.count;i++){
    const x=tp.getX(i),z=tp.getZ(i),slope=1-normals.getY(i),patch=(Math.sin(x*.038+Math.cos(z*.026)*2)+1)/2;
    colour.copy(forest).lerp(rock,Math.min(.8,Math.max(0,slope*1.9+patch*.22-.1)));
    colour.multiplyScalar(.86+patch*.22);tc.set([colour.r,colour.g,colour.b],i*3);
  }
 yield;
  terrain.setAttribute('color',new THREE.BufferAttribute(tc,3));
  // The shared static merger preserves position/normal/UV; this terrain also has
  // vertex colours, so keep its single draw call separate rather than dropping them.
  const hillsMesh=new THREE.Mesh(terrain,hillM);hillsMesh.receiveShadow=true;root.add(hillsMesh);
  at(0,0,-58);for(const x of [-4.1,4.1]){B(.8,.4,.8,x,0,0,M.ashlar);C(.2,.27,4,x,.4,0,M.woodDark);}
  B(8.9,.45,.55,0,4.2,0,M.woodDark);roof(10.5,4.5,1.45,.38,0,4.66,0);
  label('北门驿道',0,3.88,-57.64,0,.65);
 yield;
  label('三四镇',0,3.88,-58.36,2,.65);
  gateLanterns(-58,4.35);
  rail(-57,-61,-3.6,-61,0);rail(3.6,-61,57,-61,0);rail(-57,-61,-57,55,0);rail(57,-61,57,55,0);
  rail(-57,55,-5,55,0);rail(5,55,57,55,0);
  // Solid cliff lips prevent a one-step accidental fall while preserving visible exits.
  at(0,0,0);col(10,1,1,0,0,56);
  plight(-18,3.2,18,0xffc181,22,16);plight(20,3.2,16,0xffc181,18,15);
 yield;
  plight(20,3.2,-27,0xffc181,20,13);plight(-25,3.2,-29,0xffc181,18,14);
  a.walkers([[0,34],[4,16],[0,-18],[8,-39],[40,-16],[36,4],[6,1]],8);

  return {
    id:'town',name:'三四镇',spawn:{p:[0,0,48],yaw:0},
    snapshot(){return{step:teaStep,pouring,completed:lessonCount,served:teaSurface.visible,...wealthShrine.snapshot()};},
    guide:'过桥认路 · 茶棚学茶 · 客栈歇脚 · 北门出镇走驿道',
    guideText(){if(pouring)return teaStep===0?'温杯中 · 等壶落稳，再取茶':'注水中 · 等壶落稳，茶汤即成';if(teaStep===1)return'临水茶棚 · 杯已温好，在茶桌前取茶入盏';if(teaStep===2)return'临水茶棚 · 茶叶已入盏，在茶桌前提壶注水';if(teaSurface.visible)return'临水茶棚 · 茶汤已好，在桌前端盏品茶';return lessonCount?'一盏茶成 · 临水歇脚，或打开行旅簿看下一站':'向北过桥出镇 · 行旅图可标记目的地';},
    locate(p){if(p.x>-17&&p.x<-6.5&&p.z>=-22.4&&p.z<=-14.10)return'三四镇 · 财神殿';if(p.z>39)return'三四镇 · 南门';if(p.z>-13&&p.z<0)return'三四镇 · 石桥水街';
      if(p.x<-12&&p.z>0&&p.z<29)return'三四镇 · 山下客栈';if(p.x>12&&p.z>6&&p.z<26)return'三四镇 · 临水茶棚';
      if(p.x<-12&&p.z<-17&&p.z>-40)return'三四镇 · 平川驿站';if(p.x>12&&p.z<-17&&p.z>-38)return'三四镇 · 过桥书铺';
      if(p.z<-39)return'三四镇 · 丐帮歇脚处';return'三四镇 · 行旅长街';},
    tick(dt){
      surfaces.sync();wealthShrine.tick();
      if(!pouring)return;pouring-=dt;
      const k=Math.sin(Math.PI*Math.min(1,Math.max(0,pouring/(teaStep===0?1.5:2.1))));
      kettle.position.set(15.6-k*.7,1.225+k*.45,11.85+k*.15);kettle.rotation.z=k*.8;
      stream.visible=k>.92;stream.position.set(14.45,1.5,12);
      if(pouring<=0){pouring=0;kettle.position.set(15.6,1.225,11.85);kettle.rotation.z=0;stream.visible=false;
        if(teaStep===0){teaStep=1;a.checkpoint();a.message('杯已温好 · 现在取茶入盏。');}
        else{teaStep=0;lessonCount++;teaSurface.visible=true;leaves.visible=false;a.learn('tea');a.message('一盏茶成 · 趁热端盏，尝尝自己沏的茶。');}}
    },
    get lesson(){return{step:teaStep,pouring,completed:lessonCount};}
  };
}
