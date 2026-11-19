// Four Roads coins belong to the local journey, just like its lessons and stamps.
const count=n=>Number.isSafeInteger(n)&&n>=0?n:0;
export function openLedger(journey,save,random=Math.random){
 const raw=journey.purse||{};
 const purse=journey.purse={balance:count(raw.balance),earned:count(raw.earned),spent:count(raw.spent),
  apprentice:raw.apprentice===true,shop:raw.shop===true,stock:count(raw.stock),sales:count(raw.sales),
  parcel:raw.parcel===true,read:raw.read===true,offerings:count(raw.offerings),
  tea:count(raw.tea),meals:count(raw.meals),nights:count(raw.nights),
  last:typeof raw.last==='string'?raw.last.replace(/[<>&]/g,'').slice(0,64):''};
 function earn(label,min,max){
  const amount=min+Math.floor(random()*(max-min+1));
  purse.balance+=amount;purse.earned+=amount;purse.last=label+' +'+amount;save();return amount;
 }
 function pay(price,label,change){
  if(!Number.isSafeInteger(price)||price<0||purse.balance<price)return false;
  change?.();purse.balance-=price;purse.spent+=price;purse.last=label+(price?' −'+price:' · 免钱');save();return true;
 }
 return {purse,earn,pay};
}

export function travelTrade({ledger,save,card,message,places,current,go,visit,sit}){
 const {purse,earn,pay}=ledger;
 const menu=(title,body,choices)=>card({title,sub:'四方钱 · 现有 '+purse.balance+' 枚',body:'<p>'+body+'</p>',
  opts:choices.map(c=>c[0]),onPick:i=>choices[i]?.[1]()});
 const tell=s=>message(s);
 function buy(price,label,change){
  if(pay(price,label,change))return true;
  tell('还差 '+(price-purse.balance)+' 枚四方钱。到长街书摊接一趟送书差事。');return false;
 }
 let travelling=false;
 function transport(portal,page=0){
  const list=places.filter(p=>p.region!==current()&&(!portal||visit(p.region))),price=portal?14:8;
  if(!list.length){tell('走到下一处地方，便能在两地之间开启传送门。');return;}
  const choices=list.slice(page*5,page*5+5).map(p=>[p.name,async()=>{
   if(travelling)return;
   if(purse.balance<price){tell('路费还差 '+(price-purse.balance)+' 枚四方钱');return;}
   travelling=true;
   try{if(await go(p.region)){pay(price,(portal?'传送至':'乘车至')+p.name);tell('已抵达'+p.name+' · 路费 '+price+' 枚四方钱');}}
   finally{travelling=false;}
  }]);
  if(list.length>5)choices.push(['翻页 '+(page+1)+' / '+Math.ceil(list.length/5),()=>transport(portal,(page+1)%Math.ceil(list.length/5))]);
  menu(portal?'行旅传送门':'驿站雇车',(portal?'通往曾经到访的地点。':'沿驿道前往各处站点。')+' 选定目的地，抵达时付 '+price+' 枚。',choices);
 }
 function service(type,free,paid,cost,seat){
  menu(type==='tea'?'茶摊':type==='meals'?'街口饭棚':'山下客栈','选好后即可入席。',[[free+' · 免费',()=>order(0,free)],[paid+' · '+cost+' 枚',()=>order(cost,paid)]]);
  function order(price,label){if(buy(price,label,()=>{purse[type]++;})){sit(seat(price));tell(label+' · 已入席，可随时起身');}}
 }
 function book(){
  if(purse.read){card({title:'山川行记',body:'<p>等高线连接海拔相同的点。同一幅图上，等高线越密，坡度通常越大。</p>'});return;}
  menu('书铺读图','等高线连接海拔相同的点。同一幅地图中，两条相邻等高线之间的高差固定。哪段山路通常更陡？',[
   ['线距较密的一段',()=>{purse.read=true;tell('读图答对 · 获得 '+earn('读图',4,8)+' 枚四方钱');}],
   ['线距较疏的一段',()=>tell('相同高差，走过的水平距离越短，坡就越陡。可回书案再试。')]]);
 }
 function parcel(deliver){
  if(deliver&&!purse.parcel){tell('长街旧书摊有书包要送来，先去领一份。');return;}
  if(!deliver&&purse.parcel){tell('书包已领 · 过石桥送到东北的书铺');return;}
  purse.parcel=!deliver;
  if(deliver)tell('送书交差 · 工钱 '+earn('送书',7,12)+' 枚四方钱');
  else{save();tell('领到书包 · 过桥到东北书铺交给抄书人');}
 }
 function shop(){
  if(!purse.shop){menu('承租长街杂货摊','缴纳 24 枚租钱，获得摊位和首批两份货。开张后可以补货、接待客人。',[['签下摊契 · 24 枚',()=>{if(buy(24,'租摊',()=>{purse.shop=true;purse.stock=2;}))tell('长街杂货摊已开张 · 备好两份货');}]]);return;}
  menu('我的长街摊位','存货 '+purse.stock+' 份，已成交 '+purse.sales+' 单。',[
   ['进两份货 · 6 枚',()=>{if(buy(6,'进货',()=>{purse.stock+=2;}))tell('两份新货已上架');}],
   ['接待买主',()=>{if(!purse.stock){tell('架上已空，先补货。');return;}
    const wet=purse.sales%2===0;
    menu('替行客配货',wet?'行客说，想给书册找一层挡雨的外包。':'行客要带两只瓷盏走山路，想垫一层软料。',
     ['油纸','干草'].map((name,i)=>[name,()=>{if(i!==(wet?0:1)){tell('客人摇了摇头，愿意再看看别的。');return;}
      purse.stock--;purse.sales++;tell('成交 · 收入 '+earn('售货',5,9)+' 枚四方钱');}]));}]
  ]);
 }
 function mentor(start){
  if(purse.apprentice){menu('拳馆教习','可温习三拍步调，也可和教习对拍切磋。',[['温习',()=>start(false)],['对拍切磋',()=>start(true)]]);return;}
  menu('拳馆求师','教习收徒后可反复温习，或与他对拍切磋。',[['付束脩求师 · 10 枚',()=>{if(buy(10,'求师',()=>{purse.apprentice=true;}))start(false);} ]]);
 }
 function offer(effect){menu('供案添供','可在案上添一份时果。',[['供时果 · 3 枚',()=>{if(buy(3,'供时果',()=>{purse.offerings++;})){effect();tell('供果已置于案前');}}]]);}
 function openPurse(){menu('行旅钱袋','累计赚得 '+purse.earned+' 枚，花去 '+purse.spent+' 枚。'+(purse.last?'最近一笔为「'+purse.last+'」。':'长街书摊可领送书差事，各地课业和手艺也有报酬。')+(purse.parcel?' 身上有一包书待交。':''),[['开启传送门 · 14 枚',()=>transport(true)],['查看镇上去处',()=>card({title:'三四镇长街',body:'<p>热汤面摊有饭，茶摊有茶，客栈有床。旧书摊接送书差事，杂货摊可租。过桥往西到驿站雇车，往东至书铺交书。柳巷拳馆可求师。</p>'})]]);}
 return {openPurse,transport,service,book,parcel,shop,mentor,offer};
}
