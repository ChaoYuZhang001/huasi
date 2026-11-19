import {WAYSTOPS} from './waystop-data.js';
import {STATIONS} from './highroad.js';
import {wrappingHint} from './consignment.js';

// Authored game geography from the agreed world plan, not a historical atlas.
// The map and the travel journal use the same region ids as the walkable trailheads.
export const PLACES=[
 {id:'persia',region:'persia',name:'西域织市',kind:'商旅集市',area:'西向远行',x:70,y:140,visit:'穿过两座布棚去织坊，机架上可辨经纬。',rest:'商旅茶棚坐看布市。',learn:'认经线、投梭引纬。',note:'西行商旅由此入市，沿街可访织铺与客院。'},
 {id:'ming',name:'明教',kind:'山间驻地',area:'西域 · 石灯院',x:200,y:125,region:'ming',visit:'山口关楼、议事大厅、石灯广场、作坊与后山石道。',rest:'西望台临风歇脚。',learn:'观察作坊器物，再到巡识桌记下见闻。',note:'石灯院和五间作坊是三四为行旅编排的驻地。史实中的摩尼光佛石刻位于福建晋江草庵。'},
 {id:'kunlun',name:'昆仑',kind:'山中琴院',area:'西域雪山',x:250,y:225,region:'kunlun',visit:'山口客院与客舍、松雪谷花木掩映的听雪客堂、西翼琴院，以及静池、望雪台。琴案外望雪峰。',rest:'茶亭温盏、琴院和望雪台静坐。',learn:'亲手拨弦，听低、中、高音，再随一段短句。'},
 {id:'vajra',region:'vajra',name:'石关驿',kind:'山路驿站',area:'西域古道',x:105,y:240,visit:'穿石门读里程牌，驿舍有行簿，马棚有水槽。',rest:'歇马棚坐席。',learn:'辨里程木牌，在驿案交牌。'},
 {id:'kongtong',name:'崆峒',kind:'拳院与宫观',area:'关陇山道',x:435,y:120,region:'kongtong',visit:'山路分向皇城与拳院议事堂。皇城有前献殿、真武殿、玉皇殿与三教洞，真武殿内可敬香。拳派一线经拳坪到观山窟。',rest:'石窟看山、古道驿亭饮茶。',learn:'随教习守式、出拳、收势，辨认棍与长枪。'},
 {id:'huashan',name:'华山',kind:'道院与剑社',area:'关陇险峰',x:480,y:215,region:'huashan',visit:'山下玉泉院希夷祠供陈抟，祠内可敬香。过险门登上山中剑坪、议事堂和弟子舍，沿崖桥去后山。',rest:'听剑舍、歇脚亭和朝阳台静坐。',learn:'随教习提剑、平刺、收剑，认清登高路线。'},
 {id:'shaolin',name:'少林寺',kind:'山中禅寺',area:'中原 · 嵩山',x:685,y:200,region:'temple',visit:'穿天王殿入大殿看三佛，东访紧那罗，西访达摩；过藏经阁、方丈院、立雪亭往千佛殿。千佛殿西侧有林下松径。',rest:'殿内蒲团静坐，西院禅茶寮歇脚。',learn:'前院西侧六祖堂供达摩木雕，可近前读禅宗初祖的来历。',note:'主院的殿序与供像取意嵩山少林寺。东客堂接待来客，西院有僧寮和茶寮。院落尺寸和旁院游线作了游戏化安排。'},
 {id:'wushan',region:'wushan',name:'峡口山寨',kind:'山峡聚落',area:'川江峡谷',x:180,y:365,visit:'从峡口饭铺过木栈桥，去对岸茶亭。',rest:'栈头茶亭望峡。',learn:'沿栈认路，在对岸找回程路标。'},
 {id:'sanjiang',region:'sanjiang',name:'双溪渡',kind:'水路驿站',area:'川江渡口',x:300,y:435,visit:'沿候渡棚走到系船栈台，船首以缆绳系岸。',rest:'缆绳棚临水歇脚。',learn:'认船头缆，盘绳归桩。'},
 {id:'town',name:'三四镇',kind:'公共城镇',area:'中原市井',x:495,y:335,region:'town',visit:'沿石桥水街向西到财神殿，殿侧巷子通镖局驿站。镇上还有客栈、书铺与丐帮歇脚处。',rest:'临水茶棚和客栈坐席。',learn:'温杯、置茶、注水，亲手学成一盏茶。'},
 {id:'beggar',name:'丐帮',kind:'帮会',area:'中原 · 河岸会所',x:640,y:365,region:'beggar',visit:'南埠码头与分粥棚迎客，树下开会，两侧是物资棚与客舍，后河埠可歇脚。',rest:'树下闲坐、临河听水。',learn:'添水、量米、搅粥、分粥，围炉帮厨。'},
 {id:'fist',region:'fist',name:'柳巷拳馆',kind:'街巷拳馆',area:'中原街巷',x:425,y:420,visit:'街坊茶座、练步坪和拳馆。',rest:'柳巷茶座。',learn:'听木板起拍，在坪上换步收势。'},
 {id:'fivephoenix',region:'fivephoenix',name:'竹溪铁铺',kind:'市井作坊',area:'中原城郊',x:565,y:450,visit:'竹林旁有炉房、锄具样件和归置农具的木架。',rest:'竹棚茶座。',learn:'认农具样件，收回修好的锄具。'},
 {id:'eagle',region:'eagle',name:'芦湾水驿',kind:'水路驿站',area:'江南湖山',x:820,y:340,visit:'芦岸有驿舍、木栈桥和立在水边的水尺。',rest:'观水棚歇脚。',learn:'读水尺，回驿舍对照水痕。',note:'从江南水道可以望见岸边的木栈桥。'},
 {id:'escort',name:'平川镖局',kind:'镖局',area:'江南商路',x:860,y:430,region:'escort',visit:'签押房、包货库、备马棚与东渡口。',rest:'临河茶棚看船。',learn:'认货领单，为瓷盏垫草、给书册包油布，再按目的地交运。',note:'客商在总号交货，镖师从这里分水陆两路出发。'},
 {id:'emei',name:'峨眉',kind:'山寺与茶圃',area:'巴蜀云山',x:220,y:575,region:'emei',visit:'弥勒殿迎客，中院大雄宝殿，后有七佛殿、普贤殿，可在普贤殿敬香。剑舍和清音学舍另设，学舍里有茶芽标本。',rest:'听雨亭、学舍和望云台静坐。',learn:'辨认嫩芽与老叶，轻采三枝嫩梢，在茶屋摊叶。'},
 {id:'wudang',name:'武当',kind:'山中道院',area:'江汉道山',x:525,y:580,region:'wudang',visit:'龙虎殿与十方堂迎客，太极坪后紫霄殿供真武，父母殿在后院。太极坪往东见张三丰，穿东廊过演式庭，可到三清殿敬香。',rest:'听松亭、听风台静坐。',learn:'随道人完成起势、云手、收势。'},
 {id:'sand',region:'sand',name:'盐湾集',kind:'沿海市镇',area:'沿海盐滩',x:765,y:560,visit:'从三畦浅盐池沿埂走到盐筐和岸边盐仓。',rest:'盐户凉棚听浪。',learn:'辨认池边盐花，把盐晶收入筐中。'},
 {id:'whale',region:'whale',name:'海门船行',kind:'港口会馆',area:'沿海港口',x:900,y:570,visit:'看修船坞的龙骨、肋材，以及栈台外的木船。',rest:'船行茶棚。',learn:'辨认船肋，沿船身校看外板。'},
 {id:'islands',region:'islands',name:'海岛远行',kind:'远行目的地',area:'沿海与远洋',x:880,y:650,visit:'从白沙湾过两段木桥，途经灯塔礁，到北岬守灯屋。',rest:'白沙湾避风棚。',learn:'对照湾里的潮痕和礁上的航标。',note:'桥头的木牌标着去处和回程。'}
];
export const SHORTCUTS=['shaolin','town','wudang','ming','beggar','emei','huashan','kunlun','kongtong','escort'];
const placeForStation=id=>PLACES.find(place=>place.region===id).id;
const stationPlaces=STATIONS.map(s=>placeForStation(s.id));
export const ROADS=[
 ...stationPlaces.slice(1).map((id,i)=>[stationPlaces[i],id]),['shaolin','town'],
 ...Object.entries(WAYSTOPS).map(([id,site])=>[placeForStation(site.via),id])

];
export const LESSONS=[
 ...Object.entries(WAYSTOPS).map(([place,site])=>({place,key:place+'-visit',title:site.lesson,detail:site.steps.join(' · ')})),
 {key:'tea',place:'town',title:'茶棚学茶',detail:'温杯 · 置茶 · 注水'},
 {key:'wudang-cloudhands',place:'wudang',title:'云手一式',detail:'起势 · 云手 · 收势'},
 {key:'ming-workshops',place:'ming',title:'百工访学',detail:'编钟 · 木架 · 水车 · 风箱 · 沙盘'},
 {key:'beggar-meal',place:'beggar',title:'围炉帮厨',detail:'添水 · 量米 · 搅粥 · 分粥'},
 {key:'emei-tea',place:'emei',title:'采青识叶',detail:'辨芽 · 轻采 · 摊叶'},
 {key:'huashan-sword',place:'huashan',title:'木剑三式',detail:'提剑 · 平刺 · 收剑'},
 {key:'kunlun-qin',place:'kunlun',title:'听弦小记',detail:'听音高 · 随短句 · 自由拨弦'},
 {key:'escort-waybill',place:'escort',title:'西车东渡',detail:'认单 · 包货 · 交运'},
 {key:'kongtong-fist',place:'kongtong',title:'空拳三式',detail:'守式 · 出拳 · 收势'}
];
export const placeById=id=>PLACES.find(p=>p.id===id);
const TRAILS=[
 {title:'一叶到一盏',detail:'在峨眉认一枝嫩芽，再去三四镇泡一盏茶。',keys:['emei-tea','tea']},
 {title:'人间烟火',detail:'到河岸饭棚为过客分粥，再替镖局送一份托付。',keys:['beggar-meal','escort-waybill']},
 {title:'山中听音',detail:'从石灯院的编钟与作坊器物，听到昆仑琴院的弦声。',keys:['ming-workshops','kunlun-qin']}
];
export function journalTrails(journey,current){
 const completed=new Set(journalEntries(journey,current).lessons.map(lesson=>lesson.key));
 return TRAILS.map(({title,detail,keys})=>{
  const stops=keys.map(key=>({...LESSONS.find(lesson=>lesson.key===key),done:completed.has(key)}));
  return {title,detail,stops,next:stops.find(stop=>!stop.done)};
 });
}
export const placeForRegion=id=>PLACES.find(p=>p.region===id);
export function routeBetween(from,to){
 if(!placeById(from)?.region||!placeById(to)?.region)return[];
 const queue=[[from]],seen=new Set([from]);
 while(queue.length){const path=queue.shift(),last=path.at(-1);if(last===to)return path;
  for(const [a,b]of ROADS){const next=a===last?b:b===last?a:null;if(!next||seen.has(next)||!placeById(next)?.region)continue;seen.add(next);queue.push([...path,next]);}}
 return[];
}
export function journalEntries(journey,current){
 const visited=new Set(Array.isArray(journey.visited)?journey.visited:[]);if(placeForRegion(current))visited.add(current);
 return{
  visited:[...SHORTCUTS,...Object.keys(WAYSTOPS)].map(placeById).filter(p=>visited.has(p.region)),
  lessons:LESSONS.flatMap(l=>{const record=journey.learned?.[l.key];return Number.isSafeInteger(record?.times)&&record.times>0?[{...l,times:record.times,at:Number.isFinite(record.at)?record.at:null}]:[];})
 };
}
export function unfinished(journey,id){
 const s=journey.states?.[id];if(!s)return'';
 if(WAYSTOPS[id]&&s.step===1)return '下一步：'+WAYSTOPS[id].steps[1]+'。';
 if(id==='escort')return wrappingHint(s.active,s.packed===true);
 if(id==='town'&&[1,2].includes(s.step))return s.step===1?'杯已温好，下一步置茶。':'茶已入盏，下一步注水。';
 if(id==='town'&&s.step===0&&s.pouring>0)return'温杯尚未完成，回到茶棚可继续。';
 if(id==='ming'&&!s.awarded){const n=new Set((Array.isArray(s.seen)?s.seen:[]).filter(x=>['metal','wood','water','fire','earth'].includes(x))).size;return n?n===5?'五处作坊都已走过，回巡识桌记下见闻。':`已看过 ${n} 处作坊，尚有 ${5-n} 处待访。`:'';}
 if(id==='beggar')return{rice:'水已添好，下一步量米。',stir:s.stirring?'粥正在慢火煨着，回饭棚可继续。':'米已下锅，下一步执勺慢搅。',serve:'粥已煨好，下一步分粥待客。'}[s.stage]||'';
 if(id==='emei'&&!s.spread){const n=new Set((Array.isArray(s.picked)?s.picked:[]).filter(x=>['east','middle','west'].includes(x))).size;return n===3?'三枝嫩梢已入篮，下一步到茶屋摊叶。':n?`已采 ${n} 枝嫩梢，再到茶圃看看。`:'';}
 if(id==='kunlun'&&!s.complete){const n=new Set((Array.isArray(s.heard)?s.heard:[]).filter(x=>[0,3,6].includes(x))).size;return n===3?'已听低、中、高音，回琴院随一段短句。':n?`已听 ${n} 种音高，还可回琴案试弦。`:'';}
 return'';
}
