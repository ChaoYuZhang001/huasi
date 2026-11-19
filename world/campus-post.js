import {directions,station} from './highroad.js';

// Inbound faces look south down the approach. Return directions face the grounds.
const posts={
 temple:[-7,53,'山门　天王殿 ↑','穿山门、过天王殿，到大雄宝殿看三佛。前院西侧是六祖堂，东侧是紧那罗殿。过藏经阁往后走，千佛殿西边的小径通松林。','town'],
 wudang:[5.2,49,'← 龙虎殿　十方堂 →','西侧龙虎殿，东侧十方堂。回到石阶上太极坪，再往北进紫霄殿看真武。父母殿在后院，张三丰在坪东，穿过东廊便是演式庭，三清殿内可敬香。','town'],
 emei:[5.5,50,'← 弥勒殿　中院 ↑','山口西侧先到弥勒殿，上石阶进中院大雄宝殿。清音学舍挂着茶芽标本。沿北阶经七佛殿，到普贤殿看白象，殿内西侧香案可敬香。','town'],
 huashan:[4.5,51,'← 玉泉院　险门 ↑','山下西侧的希夷祠奉陈抟，祠内可敬香。回山门上石阶，过剑坪北侧的缺口进议事堂。去朝阳台要从剑坪东边上阶，过崖桥，再走茶亭后面的石阶。','town'],
 kongtong:[5,51,'← 皇城　议事堂 →','西路进皇城，经过前献殿，在真武殿可敬香，再往后是玉皇殿。东路进拳院议事堂，回中路上拳坪，沿西阶去观山窟。','huashan'],
 kunlun:[5,51,'← 山口客院　客舍 →','沿两院之间的石阶进松雪谷，花木旁的听雪客堂里可以见到琴院主人。听雪琴院在西北侧，登东阶可到望雪台和谷后静池。','ming'],
 ming:[5,51,'关隘　炉火 ↑','穿关隘上石阶，炉火在广场中央，手工作坊分居两翼。北面是议事大厅，东侧石道绕至大厅背后。','town'],
 beggar:[5,49,'分粥棚　南埠 →','向东先过分粥棚，穿岸边栏杆的开口就能上南埠木台。沿老街向北，在榕树下听议事，西侧客舍可以歇脚。','town']
};

export function campusPost(b,id,visitor,card){
 const data=posts[id];if(!data)return;
 const [x,z,front,guide,back]=data,to=station(back).name;
 b.at(x,0,z);b.B(.16,1.91,.18,0,0,0,b.M.woodDark);
 const style={h:.46,bg:'#3d4032',fg:'#eee0b7',side:0x594d38};
 b.plaque(front,0,1.74,.12,style);
 b.at(x,0,z,2);b.plaque('驿道 · '+to,0,1.74,.12,style);
 const entering=()=>visitor.pos.z>=z;
 return {id:id==='temple'?'temple:town':id+':return',p:new b.THREE.Vector3(x,1.5,z),r:3.2,
  label:()=>entering()?'读入门路牌':'读返程路牌',
  act(){const into=entering();card({title:station(id).name+'路牌',sub:into?'入门游线':'返程驿路',body:'<p>'+(into?guide:directions(id,back))+'</p>'});}};
}
