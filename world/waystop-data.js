// The new trailheads leave the existing trunk on its south side. Distances are
// measured in the road's local physics frame, independent of the illustrated map.
export const WAYSTOPS={
 persia:{resident:['染布商',[7,0,-8],{robe:5,bag:true},'布卷横放好，颜色就能并排看。向西过去是织坊。'],
  name:'西域织市',x:-605,via:'ming',hall:'织坊',shelter:'商旅茶棚',host:'织坊掌柜',lesson:'梭过经线',steps:['认经线','投梭引纬'],talk:'先看架上绷直的经线，再往梭子来回的方向看纬线。',notes:['架上纵向绷紧的是经线。','木梭横穿经线，纬线往返成布。']},
 vajra:{resident:['管马人',[12,.26,16],{robe:1,hat:true},'草料放在槽旁，牵马时留出棚口的空地。'],
  name:'石关驿',x:-790,via:'kunlun',hall:'交牌驿舍',shelter:'歇马棚',host:'石关驿卒',lesson:'驿路交牌',steps:['看里程木牌','登记行程'],talk:'过关的人先看里程牌，再到驿舍登记。棚下备着草料和水槽。',notes:['里程牌记着前后两站的路程。','将下一站写进驿簿，留给后来的人查阅。']},
 wushan:{resident:['栈头茶娘',[9,.26,18],{robe:2,bun:true},'沿桥北去是饭铺，回程仍认栈口的木牌。'],
  name:'峡口山寨',x:395,via:'emei',hall:'峡口饭铺',shelter:'栈头茶亭',host:'守栈山民',lesson:'沿栈认路',steps:['辨栈口路标','到对岸认回程'],talk:'沿木栈过去，在对岸看一眼回程的路标，雾起时也容易认路。',notes:['这块木牌朝向峡口。沿栏杆走到栈桥尽头。','回望来时的桥头，山脊和栈口已能对上。']},
 sanjiang:{resident:['理缆水手',[20.4,0,9],{robe:0,hat:true},'靠岸之后要收好余绳，别绊了候渡的人。'],
  name:'双溪渡',x:265,via:'wudang',hall:'候渡棚',shelter:'缆绳棚',host:'双溪船娘',lesson:'渡头收缆',steps:['认船头缆','盘绳归桩'],talk:'靠岸时我来照料船，你可以在岸上帮忙把松下来的余绳盘好。',notes:['绳的一端连着船头，岸桩上留有余绳。','余绳已经盘回桩边，栈板上腾出了地方。']},
 fist:{resident:['练步学徒',[8,0,5.7],{robe:4,bun:true},'起拍时从第一道线出发，到第二道线站稳。'],
  name:'柳巷拳馆',x:-108,via:'town',hall:'柳巷拳馆',shelter:'街坊茶座',host:'拳馆教习',lesson:'听拍换步',steps:['听木板起拍','踏到收势线'],talk:'地上的两道线是练步用的。听木板起拍，走到第二道线，再站稳。',notes:['木板一响，沿坪上的两道步线向前。','双脚停在线旁，收势站稳。']},
 fivephoenix:{resident:['送锄农人',[-6,0,4],{robe:1,hat:true,bag:true},'这把锄是送来修的，我在竹棚里等。'],
  name:'竹溪铁铺',x:100,via:'town',hall:'竹溪炉房',shelter:'竹棚',host:'修具铁匠',lesson:'辨修农具',steps:['认农具样件','归放修具'],talk:'案上放着待修的锄头。到另一边的架子，把修好的样件归回它的位置。',notes:['锄头有宽刃，靠套孔装上木柄。','修好的锄具归架，炉边的过道也空出来了。']},
 eagle:{resident:['候船脚夫',[20.6,0,9],{robe:0,bag:true},'船行深浅跟着水位变，驿簿留着上回的记号。'],
  name:'芦湾水驿',x:510,via:'beggar',hall:'芦湾驿舍',shelter:'观水棚',host:'芦湾驿妇',lesson:'芦湾读水',steps:['读岸边水尺','对照驿簿水痕'],talk:'看水面落在哪一格，再到驿舍对照上回的水痕。',notes:['木尺立在岸外，水面经过一道深色刻痕。','驿簿里留下一道水痕，下一趟船还能接着比。']},
 sand:{resident:['盐仓伙计',[-10,.26,7],{robe:2,bun:true},'潮气重，进仓的盐先装筐，再平码。'],
  name:'盐湾集',x:598,via:'beggar',hall:'盐仓',shelter:'盐户凉棚',host:'守滩盐户',lesson:'盐滩看晶',steps:['看浅池盐花','收晶入筐'],talk:'先看小池边的盐花，再去浅滩看看用来收盐的筐。',notes:['浅池水面退去，池埂边留下一层白晶。','将晒出的盐晶拢入筐里，随后送进盐仓。']},
 whale:{resident:['校板学徒',[-9,.26,7],{robe:1,bun:true},'到坞里看，木板顺着一道道肋骨贴上去。'],
  name:'海门船行',x:700,via:'escort',hall:'修船坞',shelter:'船行茶棚',host:'船坞木匠',lesson:'船坞识材',steps:['辨认船肋','校看船板'],talk:'船肋像一道道弧形木骨。沿船身走到另一头，看外板怎样贴上去。',notes:['船肋立起来，船身的宽窄和曲线就看得见了。','对好木板的走向，船壳沿肋骨渐渐合拢。']},
 islands:{resident:['岬上巡灯人',[4,.26,22],{robe:2,hat:true},'从屋前回望，先是灯塔礁，再过去就是白沙湾。'],
  name:'海岛远行',x:799,via:'escort',hall:'北岬守灯屋',shelter:'白沙湾避风棚',host:'北岬守灯人',lesson:'循岸认灯',steps:['认白沙湾潮痕','登礁辨灯'],talk:'木桥把白沙湾、灯塔礁和北岬连在一起。先认湾里的潮痕，再循桥看灯。',notes:['湾里的深色线是潮水留下的痕迹。','礁上的灯与岬角的屋脊前后相望，沿桥可以原路回岸。']}
};
