import {altar,immortal,meetingTable,nameplate,reading,timberHall,timberSeat} from './precinct-kit.js';

import {incenseOffering} from './incense.js';

export function buildSanqing(b,a){
 const {M,B,at,THREE:T}=b;
 // The western doors open directly toward the practice yard and the eastern walk.
 timberHall(b,55,-3,3.6,'三清殿',{width:17,depth:9.6,height:4.65,turn:3,bays:5});
 altar(b,57.8,-3,3.86,10.7,2.25,3);
 const lacquer=new T.MeshStandardMaterial({color:0x304e50,roughness:.72});
 at(58.80,4.50,-3,3);
 B(10.48,3.40,.12,0,0,0,lacquer,false);
 for(const x of [-5.16,-1.7,1.7,5.16])B(.10,3.45,.21,x,0,.038,M.woodDark,false);
 for(const y of [.14,3.11,3.36])B(10.56,.075,.21,0,y,.040,M.woodDark,false);
 for(const x of [-3.4,0,3.4]){
  for(const side of [-1,1]){
   const cloud=new T.CatmullRomCurve3([[.17,2.91],[.55,2.91],[.73,2.80],[.98,2.80],
    [1.03,2.66],[1.21,2.65],[1.34,2.53]].map(([u,y])=>new T.Vector3(side*u+x,y,.086)));
   b.G(new T.TubeGeometry(cloud,20,.027,6,false),M.bronze,0,0,0);
  }
 }

 for(const [id,title,z] of [['lingbao','灵宝天尊',-6.4],['yuanshi','元始天尊',-3],['daode','道德天尊',.4]]){
  const crownHeight=id==='yuanshi'?2.60:2.43;
  a.carving(id,57.8,4.50,z,crownHeight,3,()=>immortal(b,57.8,4.50,z,'tianzun',3));
  at(56.89,4.50,z+.91,3);
  B(1.10,.075,.36,0,0,0,M.woodDark,false);B(1.01,.35,.085,0,.075,0,M.wood,false);
  nameplate(b,title,56.81,4.77,z+.91,3);
 }
 const incense=incenseOffering(b,a,'wudang:sanqing-incense','向三清敬香',55.75,3.86,-3,3,5.8);
 reading(a,b,'wudang:sanqing',54.6,3.86,-.6,'三清','武当 · 三清殿',
  '殿中并奉三清，正中为元始天尊，另两席为灵宝天尊、道德天尊。从供案前向西出殿便是演式庭，沿东廊可回太极坪。');
 for(const z of [-10.3,4.3])timberSeat(b,49,z,3.6,3);
 const disciple=a.npc('演式弟子',[46,3.6,-.9],-Math.PI/2,{robe:2,dao:true});
 disciple.f.post=f=>a.practice.teacherPose(f,disciple.t);
 const stance=new T.Vector3(44.2,3.6,-.9);
 a.on('wudang:sanqing-practice',stance.clone().add(new T.Vector3(0,1.15,0)),2.2,'随弟子演太极',()=>{
  a.practice.start(stance,Math.PI/2,disciple.f);
 });
 at(43.7,3.6,-9.4);B(.86,.21,.64,0,0,0,M.ashlar);B(.65,1.12,.24,0,.21,0,M.stele);
 b.plaque('演式庭',0,.80,.145,{vertical:true,h:.90,bg:'#39423b',fg:'#e1d7b2'});
 return incense;
}

export function buildWealthShrine(b,a){
 const {M,B,C,S,at}=b;
 // The shopkeepers' shrine faces the canal. Its west alley opens onto the escort yard.
 b.palette({red:M.brick},()=>timberHall(b,-11.75,-18.35,0,'财神殿',{width:9.4,depth:7.4,height:3.36,gable:true}));
 altar(b,-11.75,-20.78,.26,2.9,1.54);
 a.carving('zhao-gongming',-11.75,.90,-20.78,2.00,0,()=>immortal(b,-11.75,.90,-20.78,'caishen'));
 at(-10.83,.90,-20.25);B(.84,.07,.26,0,0,0,M.woodDark,false);B(.80,.31,.085,0,.07,0,M.wood,false);
 nameplate(b,'赵公明',-10.83,1.13,-20.17);
 const fruits=b.solo(()=>{at(-12.75,.90,-20.3);C(.20,.15,.055,0,0,0,M.marble,false,18);
  for(const [x,z] of [[-.07,.02],[.07,.02],[0,-.09]])S(.08,x,.1,z,M.red,1,.91,1,12,8);});
 fruits.visible=a.ledger.purse.offerings>0;
 a.on('town:fruit-offering',new b.THREE.Vector3(-13.35,1.35,-19.48),2,'添供 · 时果',()=>a.trade.offer(()=>{fruits.visible=true;}));
 const incense=incenseOffering(b,a,'town:caishen-incense','向财神上香',-11.75,.26,-19.12,0,2.48);
 reading(a,b,'town:caishen',-9.95,.26,-19.13,'赵公明','三四镇 · 财神殿',
  '镇上商户合资建了这间临河小殿，供武财神赵公明。过桥后往西是香案，出门沿西巷向北就是平川镖局驿站。');
 // A shop abacus and a pair of scale weights sit on the side counter.
 meetingTable(b,-14.8,-18.8,.26,1.7);at(-14.8,1.20,-18.8);
 for(const z of [-.25,.07,.25])B(.78,.045,.038,0,0,z,M.woodDark,false);
 for(const x of [-.39,.39])B(.04,.045,.54,x,0,0,M.woodDark,false);
 for(let i=0;i<9;i++){const x=(i-4)*.082;
  B(.011,.015,.49,x,.018,0,M.bronze,false);
  for(const z of [-.19,-.14,-.09,.14,.19])S(.031,x,.035,z,M.wood,1,.65,.71,8,6);
 }
 for(const [x,size] of [[.57,.08],[.73,.062]]){C(size*.7,size,size*.95,x,0,0,M.bronze,false,8);S(size*.32,x,size,0,M.bronze);}
 a.npc('镇上掌柜',[-16.95,0,-13.8],.75,{robe:3,hat:true,bag:true},
  '香是街坊凑的。出门走镖的人常在开市前过来，上一炷香，再从这条西巷去驿站。');
 return incense;
}
