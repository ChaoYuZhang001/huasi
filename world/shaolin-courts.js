import {gabledRoof,hangingLamp} from './joinery.js';
import {writingDesk,teaService,guestBerth} from './room-furnishings.js';
import {shaolinGrove} from './shaolin-grove.js';
import {court,timberHall,altar,nameplate,meetingTable,reading} from './precinct-kit.js';

export function shaolinCourts(b,a,root){
 const {at,B,C,S,M,seatedFig,standFig,plaque}=b;
 // The two sides of the gate shrine address the approaching and departing pilgrim.
 at(0,.3,40);B(1.32,.48,1.98,0,0,0,M.woodDark);B(1.39,.09,2.04,0,.48,0,M.marble);
 B(1.30,1.82,.12,0,.57,0,M.red);
 for(const [key,turn,z,height,asset] of [
  ['mile',0,40.53,1.36,'schools/budai'],['weituo',2,39.47,1.75,'shaolin/weituo']]){
  at(0,.87,z,turn);b.icon(key,0,0,0,height,()=>key==='mile'?seatedFig(0,0,0,.43,M.wood,{noLotus:true}):standFig(0,0,0,.57,M.wood,{crown:true}),asset);
 }
 reading(a,b,'temple:gate-images',0,.3,42,'山门供像','嵩山少林寺 · 山门','弥勒面朝山门迎客，背龛的韦驮面向寺内护法。绕过龛座，两边都可通往前院。');
 // The middle doorway continues the path from the rebuilt gate to the Buddha hall.
 timberHall(b,0,17,0,'天王殿',{width:14.6,depth:5.6,height:4.3,through:true,screenPassage:true});
 for(const [x,key] of [[-4.8,'vajra-open'],[4.8,'vajra-closed']]){
  altar(b,x,20.65,.26,1.58,1.35);at(x,.9,20.65);
  b.icon(key,0,0,0,2.18,()=>standFig(0,0,0,.68,M.wood,{}));
 }
 for(const [x,z,name] of [[-5,18,'east-king'],[5,18,'south-king'],[-5,15.5,'north-king'],[5,15.5,'west-king']]){
  altar(b,x,z,.26,1.8,1.5);at(x,.9,z,x<0?1:3);b.icon(name,0,0,0,2.38,()=>standFig(0,0,0,.91,M.bronze,{crown:true}));
 }
 reading(a,b,'temple:kings',-3,0,17.5,'四天王','天王殿','前檐下两尊金刚把守入口，一张口、一闭口。穿过殿内四天王之间的通道，再上月台，前方是大雄宝殿。');
 reading(a,b,'temple:three-buddhas',4.4,2.35,-8.5,'三世佛','大雄宝殿','正中释迦牟尼佛。两侧为药师佛与阿弥陀佛，药钵与莲花标明各自的供位。西院六祖堂另供达摩。');
 timberHall(b,36,-5,0,'紧那罗殿',{width:9.5,depth:5.8,turn:3});
 at(38,.26,-5,3);B(2.4,.64,1.68,0,0,0,M.ashlar);b.icon('kinnara',0,.64,0,2.34,()=>standFig(0,.64,0,.90,M.bronze,{}));
 reading(a,b,'temple:kinnara',36,.26,-5,'紧那罗王','少林东院','寺院奉紧那罗王为护法。木杖在身侧，香客从东院入殿。');
 for(const [i,name] of ['慧可','僧璨','道信','弘忍','慧能'].entries()){
  at(-36,0,-5,1);const x=[-7.7,-5.3,-2.7,3.1,5.7][i];
  B(1.62,.56,1.3,x,.85,-2.9,M.woodDark);b.icon(['huike','sengcan','daoxin','hongren','huineng'][i],x,1.41,-2.92,1.35,()=>seatedFig(x,1.41,-2.92,.44,M.wood,{noLotus:true,beard:i!==4}));
  plaque(name,x,1.16,-2.2,{h:.21,bg:'#443425'});
 }
 reading(a,b,'temple:patriarchs',-36,.85,-2.5,'禅宗六祖','六祖堂','西侧祖师空间以达摩为初祖，列慧可、僧璨、道信、弘忍、慧能。');
 // A second courtyard continues from the sutra library and the north terrace.
 court(b,7,-102,3.5,43,64);
 // A walled forecourt and covered east walk enclose the abbot's working quarters.
 at(0,3.5,-75);
 for(const side of [-1,1]){
  const x=side*4.78;
  B(5.56,.33,.48,x,0,0,M.ashlar);B(5.56,.96,.32,x,.33,0,M.brick);
  B(5.72,.12,.47,x,1.29,0,M.ridge);
  B(.51,1.52,.53,side*2.0,0,0,M.ashlar);
 }
 at(9.05,3.5,-81.2,1);B(12,.13,2.65,0,0,0,M.ashlar);
 for(const x of [-5.7,0,5.7])for(const z of [-.98,.98]){
  C(.20,.24,.18,x,.13,z,M.marble);C(.115,.145,2.43,x,.31,z,M.woodDark);
 }
 for(const z of [-.98,.98])B(11.85,.24,.18,0,2.64,z,M.wood);
 gabledRoof(b,12.7,3.45,2.9,.81,M.tile,M.woodDark);
 timberHall(b,0,-83.5,3.5,'方丈院',{width:12,depth:7.4,height:3.4,gable:true});
 at(0,3.76,-85);hangingLamp(b,-1.9,3.56,.38,.57);
 meetingTable(b,0,-85,3.76,3.6);at(0,4.70,-85);writingDesk(b,'寺务簿',['晨启山门','洒扫庭除','整点经函','午备客斋','暮收灯烛']);
 reading(a,b,'temple:abbot',0,3.76,-83,'方丈院','后院','案上寺务簿记有洒扫庭除、整点经函、预备客斋等日课。沿院西石路向北，先到立雪亭，再到千佛殿。');
 timberHall(b,0,-98,3.5,'立雪亭',{width:10.5,depth:7.1,height:3.75,stone:true});
 altar(b,0,-99.95,3.76,2.86,1.54);at(0,4.40,-99.95);
 b.icon('snow-damo',0,0,0,1.68,()=>seatedFig(0,0,0,.52,M.bronze,{beard:true,noLotus:true}),'shaolin-damo',m=>{
  m.color.setHex(0xab875f);m.metalness=.46;m.roughness=.58;
 });
 B(10.34,.24,.18,0,2.83,.88,M.woodDark,false);
 for(const x of [-.54,.54])B(.05,.23,.10,x,2.67,.96,M.wood,false);
 plaque('雪印心珠',0,2.72,1.02,{h:.54,bg:'#31261e',fg:'#dfbe83'});
 reading(a,b,'temple:snow',0,3.76,-97.85,'立雪亭','达摩亭 · 慧可求法','这里供奉达摩。亭为三间殿宇，取意现存单檐庑殿顶和石柱。「雪印心珠」匾与慧可立雪求法的传说相应。');
 timberHall(b,0,-119.5,3.5,'千佛殿',{width:17,depth:10.5,height:5.1,gable:true,bays:7});
 altar(b,0,-123,3.76,5);at(0,4.40,-123);b.icon('vairocana',0,0,0,3.79,()=>seatedFig(0,0,0,1.08,M.gilt,{halo:true,trim:M.gold2}));
 nameplate(b,'毗卢佛',0,4.07,-121.98);
 reading(a,b,'temple:vairocana',0,3.76,-120.5,'毗卢佛','千佛殿','后部殿内以毗卢佛为主尊。出殿沿院西小径可往后山。');
 reading(a,b,'temple:white-robes',17,4.35,-119.5,'白衣观音','后院东厢 · 白衣殿','由千佛殿向东可进白衣殿，这里的主供是白衣观音。寺中所存的少林拳谱壁画也与这一进院落有关。');
 timberHall(b,66,7,0,'东客堂',{width:14,depth:8,height:3.6,gable:true});
 meetingTable(b,66,6,.26,4.2);at(66,1.20,6);teaService(b);
 for(const x of [62.8,69.2]){at(x,.26,6);B(.55,.12,1.68,0,.40,0,M.wood);for(const z of [-.57,.57])B(.28,.40,.15,0,0,z,M.woodDark);}
 reading(a,b,'temple:guests',66,.26,8.4,'东客堂','常住院 · 接待来客','知客在此接待来寺的人。回到前院向北走，经过天王殿，就能看见大雄宝殿的月台。');
 timberHall(b,-65,7,0,'寮房',{width:10.5,depth:7.3,height:3.3,gable:true});
 at(-65,.26,7);for(const s of [-1,1])guestBerth(b,s);
 reading(a,b,'temple:quarters',-65,.26,8.2,'僧寮','常住院 · 僧众起居','榻上卷好被褥，箱里收着衣物。寮房供僧众起居，沿院墙向西可到禅茶寮，去禅堂须回主院上石阶。');
 for(const x of [-22,-20])b.cushion(x,3.5,-118,Math.PI/2);
 reading(a,b,'temple:pine-grove',-19,3.5,-112.8,'后山松径','千佛殿西侧','脚下的松针很厚。往北几步，树荫里有两方蒲团，坐一会儿可以听见前院的钟声。');
 return shaolinGrove(b,root);
}
