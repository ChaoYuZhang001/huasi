import {incenseOffering} from './incense.js';
import {rockChapel} from './rock-chapel.js';
import {guestBerth,teaService,writingDesk} from './room-furnishings.js';
import {zhenwu,puxian,altarScreen,puxianCeiling} from './shrine-sculpture.js';
import {court,timberHall,altar,nameplate,immortal,reading,meetingTable,timberSeat} from './precinct-kit.js';

function lodging(b,a,id,x,z,y,name,turn=0){
 timberHall(b,x,z,y,name,{width:9,depth:6.8,height:3.1,turn,gable:true});
 const {B,M}=b;b.at(x,y+.26,z,turn);
 for(const side of [-1,1])guestBerth(b,side);
 // Curtains cover the pillow ends; the foot of each berth opens onto the aisle.
 for(const s of [-1,1]){
  const x=s*3.7,z=-.82;
  B(.085,2.16,.085,x-s*.64,0,z,M.woodDark);
  B(1.42,.085,.09,x,2.10,z,M.woodDark,false);
  const g=new b.THREE.PlaneGeometry(1.24,1.43,18,6),v=g.attributes.position;
  for(let i=0;i<v.count;i++)v.setZ(i,.047*Math.cos(v.getX(i)*26));
  g.computeVertexNormals();
  const cloth=M.robe.clone();cloth.color.setHex(turn?0x75817d:0x927961);cloth.side=b.THREE.DoubleSide;
  b.G(g,cloth,x,1.38,z);
 }
 const place=b.point(-1.98,.60,-1.10),exit=b.point(-1.90,0,.02);
 a.rest(id,place,Math.PI+turn*Math.PI/2,'坐在榻沿歇脚',{bench:true,exit});
}

export function wudangCourts(b,a){
 const {M,at,B,standFig}=b;
 for(const side of [-1,1])court(b,side*19,45,0,20,18);
 timberHall(b,-19,44,0,'龙虎殿',{width:10,depth:6.7,turn:1});
 for(const [z,name] of [[-2.1,'青龙'],[2.1,'白虎']]){
  at(-20,.26,44+z,1);B(1.86,.5,1.36,0,0,0,M.ashlar);a.carving(z<0?'dragon-general':'tiger-general',-20,.76,44+z,2.08,1,()=>standFig(0,.5,0,.8,M.bronze,{crown:true}));
  b.plaque(name,0,.27,.72,{h:.21});
 }
 reading(a,b,'wudang:guardians',-17,.26,44,'龙虎二将','龙虎殿','两位守门神将分立于殿中，青龙、白虎各有甲纹。出殿向东是十方堂，北面石阶通太极坪。');
 timberHall(b,19,44,0,'十方堂',{width:10.6,depth:7,turn:3,open:true});
 meetingTable(b,19,44,.26,3.5,3);at(19,1.20,44,3);teaService(b);
 for(const s of [-1,1]){
  at(19,.26,44,3);B(.56,.12,1.12,s*2.05,.42,0,M.wood);
  for(const z of [-.39,.39])B(.36,.42,.11,s*2.05,0,z,M.woodDark);
 }
 a.on('wudang:tea',new b.THREE.Vector3(18.68,1.41,44),1.85,'饮一盏山茶',()=>{
  a.sound('pour');a.message('茶盏温热。出十方堂向北上石阶，便到武当演武坪。');
 });
 reading(a,b,'wudang:reception',17,.26,45,'十方堂','山门前院','前院留给行脚客用茶。沿石阶到太极坪，穿过演武的中院便到紫霄殿。');
 altar(b,0,-27.58,4.45,5.6,2.76);altarScreen(b,0,5.09,-27.7,false);zhenwu(b,a,0,5.09,-27.7);nameplate(b,'真武大帝',0,4.79,-26.13);
 reading(a,b,'wudang:zhenwu',0,4.45,-25.25,'真武大帝','紫霄殿 · 武当道教供奉','披发跣足，龟蛇在座前。殿内奉真武，沿东廊可拜访张三丰。建筑取意紫霄宫，院落与行走路线为三四编排。');
 a.npc('十方堂知客',[20.9,.26,46.7],-.8,{robe:3,dao:true},'请用茶。出堂往北登阶就是紫霄殿，正殿奉真武。若要读《道德经》，太极坪西面的藏书阁有书案。');
 court(b,-7,-47.5,3.6,24,20);timberHall(b,-7,-50,3.6,'父母殿',{width:13.6,depth:8});
 altar(b,-7,-52.3,3.86,6.1);for(const [x,id] of [[-8.65,'father'],[-5.35,'mother']]){
  a.carving(id,x,4.50,-52.3,2.74,0,()=>immortal(b,x,4.50,-52.3,id));
 }
 reading(a,b,'wudang:parents',-7,3.86,-50.25,'真武父母','后院 · 父母殿','祀座上并列真武的父母。西侧回廊通前院，张三丰在演武坪东边与弟子问道。');
}

export function emeiCourts(b,a){
 const {at,B,M,seatedFig}=b;
 court(b,-17,45,0,14,17);timberHall(b,-17,43,0,'弥勒殿',{width:8.5,depth:6,turn:1});
 at(-18,.26,43,1);B(2.7,.45,1.6,0,0,0,M.ashlar);a.carving('budai',-18,.71,43,2.22,1,()=>{seatedFig(0,.45,0,.72,M.gilt,{noLotus:true});b.S(.53,0,1.24,.2,M.gilt,1,.91,.89);});
 b.plaque('弥勒',0,.25,.86,{h:.23});
 reading(a,b,'emei:maitreya',-15.6,.26,43,'弥勒','山口 · 弥勒殿','入山先见布袋弥勒，石阶上的大雄宝殿与北院的七佛殿、普贤殿依次可访。');
 timberHall(b,0,6,1.8,'大雄宝殿',{width:13.6,depth:7.2,height:4.25});
 altar(b,0,3.6,2.06);at(0,2.70,3.6);a.carving('shakyamuni',0,2.70,3.6,2.69,0,()=>seatedFig(0,0,0,.82,M.gilt,{buddha:true,halo:true}),'shaolin/shakyamuni');
 reading(a,b,'emei:central',0,2.06,5.7,'释迦牟尼佛','中院 · 大雄宝殿','这里的佛殿次序取意后世报国寺。清音学舍里有茶芽标本，拿茶圃里的嫩梢来就能对照。');
 timberHall(b,26,-15.2,1.8,'剑舍',{width:11.4,depth:7.6,height:3.3,gable:true});
 at(26,2.06,-17);
 for(const x of [-.8,.8]){
  B(.42,.13,.88,x,0,0,M.woodDark);B(.15,1.74,.16,x,.13,-.05,M.wood);
  for(let tier=0;tier<3;tier++){
   B(.14,.09,.35,x,.54+tier*.49,.12,M.woodDark);
   B(.12,.13,.07,x,.62+tier*.49,.265,M.woodDark);
  }
 }
 B(1.65,.15,.13,0,.22,-.05,M.woodDark);
 for(let tier=0;tier<3;tier++){
  const h=.64+tier*.49,sign=tier%2?-1:1;
  const outline=new b.THREE.Shape();
  outline.moveTo(-1.17,0);outline.quadraticCurveTo(-1.08,.048,-.90,.056);
  outline.lineTo(.73,.081);outline.lineTo(.73,-.061);outline.lineTo(-.90,-.039);outline.quadraticCurveTo(-1.08,-.037,-1.17,0);
  const blade=new b.THREE.ExtrudeGeometry(outline,{depth:.048,bevelEnabled:true,bevelThickness:.008,bevelSize:.006,bevelSegments:1,curveSegments:8});
  blade.setIndex(Array.from({length:blade.attributes.position.count},(_,k)=>k));if(sign<0)blade.rotateY(Math.PI);
  b.G(blade,M.sack,0,h+.045,.15);
  b.S(.14,sign*.73,h+.055,.15,M.wood,.37,1,.61,16,10);
  B(.40,.085,.078,sign*.94,h+.007,.15,M.woodDark,false);
  for(let i=0;i<4;i++)B(.024,.093,.087,sign*(.82+i*.074),h+.003,.15,M.sack,false);
  b.S(.064,sign*1.16,h+.05,.15,M.wood,.78,1,.85,12,8);
 }
 reading(a,b,'emei:sword-house',26,2.06,-14.6,'剑舍','峨眉弟子起居','木剑归架，旁边的学舍陈列着弟子从茶圃采来的叶样。此处为三四编排的弟子院落。');
 court(b,15,-73,5.4,42,34);timberHall(b,5,-65,5.4,'七佛殿',{width:14,depth:6.8,height:3.65});
 altar(b,5,-67,5.66,11,1.34);
 const buddhas=['毗婆尸佛','尸弃佛','毗舍浮佛','释迦牟尼佛','迦叶佛','拘那含牟尼佛','拘留孙佛'];
 for(let i=0;i<buddhas.length;i++){
  const x=5+(i-3)*1.49;at(x,6.30,-67);
  a.carving('seven-'+(i+1),x,6.30,-67,1.42,0,()=>seatedFig(0,0,0,.43,M.gilt,{buddha:true,halo:true}));
  nameplate(b,buddhas[i],x,6.00,-66.25);
 }
 reading(a,b,'emei:seven',5,5.66,-64.5,'七佛','后院 · 七佛殿','正中奉释迦牟尼佛，另六席与中尊合称过去七佛。每席座前有名牌。绕出东侧，再往北就是普贤殿。');
 timberHall(b,21,-81,5.4,'普贤殿',{width:17,depth:9,height:4.9});
 altar(b,21,-82.7,5.66,5.2,4.5);puxianCeiling(b);altarScreen(b,21,6.30,-82.75,true);puxian(b,a,21,6.30,-82.75);nameplate(b,'普贤菩萨',21,6.0,-80.34);
 reading(a,b,'emei:puxian',21,5.66,-79.35,'普贤菩萨','后院 · 普贤殿','白象六牙，普贤菩萨安坐象背。报国寺提供殿序与供奉的美术参考，茶圃和学舍沿山路布置。');
 a.npc('峨眉知客僧',[24.9,5.66,-80.3],-.85,{school:'temple',bald:true,robe:1},'殿中普贤菩萨坐六牙白象。你若从后院返回，先经过七佛殿；若想认茶芽，沿石阶下到清音学舍。');
 return incenseOffering(b,a,'emei:puxian-incense','向普贤菩萨敬香',17.6,5.66,-79.9,0,1.7);
}

export function huashanCourts(b,a){
 court(b,-24,47.5,0,36,19);timberHall(b,-27,46.5,0,'希夷祠',{width:13,depth:8,turn:1,stone:true});
 altar(b,-29,46.5,.26,3.2,1.8,1);a.carving('chen',-29,.90,46.5,2.34,1,()=>immortal(b,-29,.90,46.5,'chen',1));nameplate(b,'陈抟',-28.02,.58,46.5,1);
 b.at(-10,0,48);b.B(.28,2.32,.38,0,0,0,b.M.ashlar);b.plaque('玉泉院',0,1.68,.23,{h:.50});
 reading(a,b,'huashan:chen',-27,.26,47.9,'陈抟','山下玉泉院 · 希夷祠','山下道院取意玉泉院，希夷祠奉陈抟。回到险门，登石阶才进入三四编排的华山剑派。');
 a.npc('玉泉院道人',[-25.5,.26,50.5],1.5,{school:'daoist',dao:true,robe:1},'祠里纪念陈抟，道号扶摇子，世称希夷先生。要找巡山的弟子，出院向东，再循险门登山。');
 court(b,-7,-13.5,4.8,39,13);timberHall(b,-11,-13.4,4.8,'议事堂',{width:14.5,depth:7.4,height:3.65,gable:true});
 meetingTable(b,-11,-14.6,5.06,4.2);b.at(-11,6,-14.6);writingDesk(b,'华山路径',[],{map:true});for(const x of [-13.6,-11,-8.4])timberSeat(b,x,-16,5.06);
 reading(a,b,'huashan:council',-11,5.06,-12.2,'议事堂','山上 · 华山派','桌上的山路图标出了玉泉和崖台。剑坪在南，东侧沿崖登高，过木桥可到崖台。');
 a.npc('巡山师兄',[-15.4,5.06,-15.4],.38,{robe:2,bun:true,beard:true},'敝派弟子多在南边剑坪。若问山下希夷祠，该从险门出去，沿西路回玉泉院。');
 lodging(b,a,'huashan:berth',5,-14,4.8,'弟子舍');
 return incenseOffering(b,a,'huashan:chen-incense','在希夷祠敬香',-27.8,.26,44.35,1,1.7);
}

export function kongtongCourts(b,a,rock){
 const {M,at,B}=b;
 // The two paths have their own foundations. One reaches the religious precinct
 // directly from the lower mountain road, the other climbs to the martial school.
 court(b,-39,44,0,62,24);court(b,-59,11,0,22,42);
 timberHall(b,-59,44,0,'前献殿',{width:10.9,depth:7.5,open:true,through:true,stone:true});
 meetingTable(b,-61.7,43.5,.26,2.7);at(-61.7,1.20,43.5);
 for(const x of [-.83,.83]){b.C(.15,.19,.08,x,0,0,M.bronze,false);b.C(.065,.065,.29,x,.08,0,M.bronze,false);b.C(.17,.12,.065,x,.37,0,M.bronze,false);}
 b.C(.25,.16,.16,0,0,0,M.bronze,false,24);
 reading(a,b,'kongtong:offering',-58.7,.26,45.3,'献殿','崆峒皇城 · 前院','这里陈放供器。穿过敞开的明间，前面是真武殿。沿正殿侧道再向后，就是玉皇殿。');
 a.npc('皇城值殿道人',[-55.6,.26,42.3],-.7,{school:'daoist',dao:true,robe:3},'从这里能望见真武殿的檐口。三教洞在西边，拳院在入山路的另一头。');
 timberHall(b,-59,23,0,'真武殿',{width:13,depth:8.2,stone:true});
 altar(b,-59,20.69,.26,4,2.9);zhenwu(b,a,-59,.90,20.6);
 reading(a,b,'kongtong:zhenwu',-59,.26,23,'真武','崆峒皇城 · 现实建筑参考','山路西岔进皇城，正殿奉真武，后殿奉玉皇。另一岔上山进拳院议事堂，拳坪和器具舍都在那条路上。');
 timberHall(b,-60,-3,0,'玉皇殿',{width:13.4,depth:8.4,stone:true});
 altar(b,-60,-5.4,.26);a.carving('jade',-60,.90,-5.4,2.9,0,()=>immortal(b,-60,.90,-5.4,'jade'));nameplate(b,'玉皇大帝',-60,.56,-4.41);
 reading(a,b,'kongtong:jade',-60,.26,-3.2,'玉皇大帝','皇城后殿','循前献殿、真武殿入后殿看玉皇。这一支参考山上宫观，拳院另有议事处。');
 // A shallow rock chapel belongs to the imperial precinct, apart from the school's rear grotto.
 court(b,-77,17,0,14,13);at(-76,0,17);
 rockChapel(b,rock);B(7.5,.54,1.2,0,0,-1.85,M.ashlar);
 for(const [i,name] of ['释迦牟尼','太上老君','孔子'].entries()){
  const x=(i-1)*2.35;
  a.carving(['grotto-buddha','daoist','scholar'][i],-76+x,.54,15.15,1.83,0,()=>b.seatedFig(x,.54,-1.85,.60,i===0?M.gilt:M.bronze,{buddha:i===0,noLotus:i!==0,hat:i===2,beard:i>0}));
  b.plaque(name,x,.31,-1.2,{h:.22});
 }
 reading(a,b,'kongtong:teachings',-76,0,17.4,'三教洞','崆峒山文化支路','释迦牟尼、太上老君、孔子同在一龛。拳派练习后的观山窟在另一条路上。');
 court(b,20,44,0,24,24);timberHall(b,20,41,0,'拳院议事堂',{width:14.7,depth:8.6,stone:true});
 meetingTable(b,20,40.3,.26,4.6);
 for(const [dx,dz,r] of [[-2,-1.8,0],[0,-1.8,0],[2,-1.8,0],[-3.2,.35,1],[3.2,.35,3]])timberSeat(b,20+dx,40.3+dz,.26,r);
 a.npc('拳院掌事',[23.6,.26,39.0],-.54,{robe:3,bun:true,beard:true,beardC:0xb8afa0},'今日轮到我照看拳院。桌旁的座椅是留给练习后歇脚的弟子们的。你若是来访皇城，要从山路西岔过去。');
 reading(a,b,'kongtong:elders',20,.26,42.8,'拳院议席','崆峒 · 拳院议事堂','教习在这里排每日功课，来访的人也能坐下问路。出堂回到山路，北行过石门便是拳坪；再沿西阶登高，进入后山石窟。');
 return incenseOffering(b,a,'kongtong:zhenwu-incense','向真武大帝敬香',-62,.26,22.35,0,1.7);
}

export function kunlunCourts(b,a){
 const {at,B,M}=b;
 court(b,-18,44,0,20,18);timberHall(b,-18,43,0,'山口客院',{width:11,depth:7.3,open:true,turn:1});
 meetingTable(b,-18,43,.26,3.1);timberSeat(b,-19.5,41.7,.26);
 court(b,20,44,0,24,18);lodging(b,a,'kunlun:berth',21,43,0,'雪谷客舍',3);
 timberHall(b,-2,8,2.4,'听雪客堂',{width:12.8,depth:7.4,height:3.6,through:true,gable:true});
 meetingTable(b,-5.4,7,2.66,2.6);timberSeat(b,-5.3,5.6,2.66);
 // The reception table stays in the west bay, leaving the through passage open.
 at(-5.4,3.60,7);B(.98,.065,.90,0,0,0,M.woodDark,false);
 for(let i=0;i<19;i++){
  const v=(i-9)*.045;
  B(.816,.003,.005,0,.065,v,M.sack,false);B(.005,.003,.816,v,.065,0,M.sack,false);
 }
 for(const [x,z,white] of [[-5,5,1],[5,-5,0],[4,3,1],[3,4,0],[4,4,0],[-4,-4,1],[-3,-4,0],[-3,-3,1]]){
  b.S(.022,x*.045,.080,z*.045,white?M.paper:M.ink,1,.50,1,10,6);
 }
 a.npc('琴院主人',[-6.6,2.66,5.8],.54,{robe:3,bun:true,beard:true},'客人请坐。桌上这局棋才下了一半，棋友去了琴院。沿西廊走，听到琴声就到了。');
 reading(a,b,'kunlun:board',-5.4,2.66,7.8,'窗边棋局','松雪谷 · 听雪客堂','黑白棋子还留在席上，靠窗的一边能看见雪峰。从会客堂沿西廊走，可以听到琴院的弦声。');
 reading(a,b,'kunlun:hosts',-4.3,2.66,8.7,'听雪客堂','松雪谷 · 琴院主人','雪天封路时，过山的人在堂里借宿，旧棋盘也是客人留下的。西北那间屋用来听琴，往东上石阶可到望雪台。');
 at(1.8,2.66,7.2);B(.52,.07,.39,0,.68,0,M.paper,false);B(.85,.68,.55,0,0,0,M.woodDark);
 // The back valley opens beside the overlook. Four banks leave a real basin
 // below the path, with a stone lip and a narrow outlet toward the far ridge.
 court(b,15,-61.5,6,38,8);court(b,15,-78.5,6,38,6);
 court(b,1,-70.5,6,10,10);court(b,29,-70.5,6,10,10);
 at(15,6,-70.5);B(18,1.55,10,0,-2.35,0,M.rock);
 const pool=M.water.clone();pool.color.setHex(0x83adba);
 B(18,.035,10,0,-.42,0,pool,false);
 for(const side of [-1,1]){
  B(.45,.44,10,side*9,0,0,M.ashlar);B(17.6,.36,.42,0,0,side*5,M.ashlar);
 }
 reading(a,b,'kunlun:valley',26.5,6,-70.5,'谷后静池','昆仑雪谷','下临静水，北望雪山。回程向南经过望雪台，再下石阶到琴院。');

}
