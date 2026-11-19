import {gabledRoof,windowBay,timberBetween,hangingLamp} from './joinery.js';
// Units in metres. The doorway opens along local +Z. A level stone sill can
// be crossed by the same walker that uses the old courtyards and mountain paths.
export function court(b,x,z,y,width,depth){
 b.at(x,y,z);b.B(width,3.8,depth,0,-4,0,b.M.cliff);b.B(width,.2,depth,0,-.2,0,b.M.paving);
}

export function timberHall(b,x,z,y,name,{width=12,depth=8,height=3.8,turn=0,through=false,open=false,stone=false,gable=false,bays=3,screenPassage=false}={}){
 const {M,at,B,C,roof,plaque}=b;
 at(x,y,z,turn);const base=.26,half=width/2,end=depth/2,post=stone?M.ashlar:M.woodDark;
 const posts=Array.from({length:bays+1},(_,i)=>(i/bays-.5)*(width-.7));
 B(width+1.1,.19,depth+1,0,0,0,M.ashlar);B(width+1.2,.07,depth+1.1,0,.19,0,M.marble);
 for(const side of [-1,1]){
  for(const u of posts){
   C(.25,.3,.21,u,base,side*(end-.35),M.ashlar);
   C(.15,.19,height-.21,u,base+.21,side*(end-.35),post);
   const bearing=side*(end-.35);
   B(.48,.22,.48,u,base+height-.31,bearing,post,false);
   B(.82,.16,.34,u,base+height-.12,bearing,M.wood,false);
   B(.32,.18,.86,u,base+height-.09,bearing,post,false);
  }
  B(width,.25,.32,0,base+height,side*(end-.35),post);
  if(!open){
   B(.27,1.06,depth-1.1,side*(half-.15),base,-.25,M.brick);
   const wx=side*(half-.15);
   for(const h of [1.06,height-.56])B(.22,.14,depth-1.1,wx,base+h,-.25,M.woodDark,false);
   const bars=Math.ceil((depth-1.1)/.6);
   for(let i=0;i<=bars;i++)B(.09,height-1.06,.085,wx,base+1.06,-.25+(i/bars-.5)*(depth-1.1),M.woodDark,false);
   B(.16,.43,depth-1.1,wx,base+height-.43,-.25,M.red,false);
  }
 }
 // Enclosed halls have recessed front bays on either side of the central door.
 if(!open&&(!through||screenPassage)){
  const jamb=bays>3?Math.max(1.55,half/bays):Math.max(1.55,half/3),outer=half-.25,front=end-.84;
  for(const side of [-1,1]){
   if(bays>3){
    const sideBays=(bays-1)/2,span=(outer-jamb)/sideBays;
    for(let i=0;i<sideBays;i++)windowBay(b,side*(jamb+(i+.5)*span),front,span,base,base+height,M.red);
   }else windowBay(b,side*(jamb+outer)/2,front,outer-jamb,base,base+height,stone?M.ashlar:M.red);
   if(screenPassage)windowBay(b,side*(jamb+outer)/2,-front,outer-jamb,base,base+height,M.red);
   B(.15,height-.18,.16,side*jamb,base,front,M.woodDark);
   const leaf=Math.min(jamb,1.22),cx=side*(jamb+.04);
   B(.095,height-.47,leaf,cx,base+.035,front-leaf/2,M.wood);
   for(const h of [.27,1.05,height-.72])B(.14,.105,leaf,cx,base+h,front-leaf/2,M.woodDark,false);
   const pull=new b.THREE.TorusGeometry(.085,.018,6,16);pull.rotateY(Math.PI/2);
   b.G(pull,M.bronze,cx-side*.072,base+1.08,front-leaf+.21);

  }
  B(2*jamb+.2,.24,.24,0,base+height-.38,front,M.woodDark,false);
 }
 const tread=Math.min(width-1,Math.max(3.3,width*.46));
 B(tread,.13,.55,0,0,end+.81,M.ashlar);
 if(through)B(tread,.13,.55,0,0,-end-.81,M.ashlar);
 if(!through&&!open)B(width-.5,height,.28,0,base,-end+.16,stone?M.ashlar:M.red);
 for(const u of posts){
  B(.22,.23,depth-.35,u,base+height-.08,0,M.wood,false);
 }
 for(let v=-end+1.1;v<end-.6;v+=1.45)B(width-.3,.13,.14,0,base+height+.12,v,M.eave,false);
 if(b.roomLamp)hangingLamp(b,-half/3,base+height,end*.31,.42);
 if(!through&&!open){
  const rail=end-.34;
  B(width-.6,.14,.14,0,base+.63,-rail,M.woodDark,false);
  for(const x of [-half/3,half/3])B(.17,height,.15,x,base,-rail,M.woodDark,false);
 }
 if(gable)gabledRoof(b,width+1.9,depth+1.8,base+height+.28,depth*.30,M.tile,M.woodDark,{enclosed:!open});
 else roof(width+2.45,depth+2.8,Math.min(3,depth*.23),open?.37:.59,0,base+height+.25,0);
 plaque(name,0,base+height-.12,end-.08,{h:.67,bg:stone?'#454846':'#342d24',fg:'#e9d6a7'});
}

export function altar(b,x,z,y,w=4,d=1.8,turn=0){
 b.at(x,y,z,turn);b.B(w,.52,d,0,0,0,b.M.ashlar);b.B(w+.14,.12,d+.12,0,.52,0,b.M.marble);
}

export function nameplate(b,name,x,y,z,turn=0){
 b.at(x,y,z,turn);b.plaque(name,0,0,0,{h:.27,bg:'#332e27',fg:'#eed9a5'});
}

export function reading(a,b,id,x,y,z,title,context,body){
 a.on(id,new b.THREE.Vector3(x,y+1.35,z),2.8,'看'+title,()=>a.card(title,context,body));
}

export function timberSeat(b,x,z,y,turn=0){
 const {at,B,M}=b;at(x,y,z,turn);
 B(1.02,.095,.85,0,.455,0,M.wood);B(.89,.08,.71,0,.375,0,M.woodDark,false);
 for(const side of [-1,1]){
  for(const end of [-1,1])timberBetween(b,[side*.45,0,end*.35],[side*.39,.47,end*.30],.084,.084,M.woodDark);
  B(.068,.07,.70,side*.42,.20,0,M.wood,false);
  timberBetween(b,[side*.39,.53,-.32],[side*.42,1.18,-.45],.075,.085,M.woodDark);
 }
 timberBetween(b,[0,.54,-.31],[0,1.16,-.43],.185,.068,M.wood);
 for(const side of [-1,1])timberBetween(b,[0,1.14,-.43],[side*.52,1.20,-.45],.11,.10,M.woodDark);
 b.col(.92,.46,.72,0,0,0);b.col(.88,.63,.11,0,.55,-.38);
}

export function meetingTable(b,x,z,y,w=3.8,turn=0){
 b.at(x,y,z,turn);b.B(w,.13,1.25,0,.81,0,b.M.wood);
 for(const t of [-1,1])b.B(w-.32,.16,.10,0,.66,t*.45,b.M.woodDark,false);
 for(const s of [-1,1])for(const t of [-1,1])b.B(.14,.81,.14,s*(w/2-.25),0,t*.45,b.M.woodDark);
}

export function immortal(b,x,y,z,kind,turn=0){
 const {at,B,C,S,M,seatedFig}=b;at(x,y,z,turn);
 B(1.55,.38,1.48,0,0,0,M.woodDark);
 const top=.38;
 seatedFig(0,top,0,.77,M.gilt,{noLotus:true,beard:kind!=='mother',beardM:M.ink});
 if(kind==='chen'){
  S(.22,0,2.63,-.04,M.ink,1,.75,.82);S(.13,0,2.82,-.06,M.ink,.9,.92,.85);
 }else{
  C(.23,.28,.23,0,2.59,0,M.gilt,false,12);
  if(kind==='jade'){B(1,.085,.65,0,2.81,0,M.ink,false);for(let i=-2;i<=2;i++)C(.019,.023,.28,i*.17,2.51,.28,M.gold,false,6);}
  else S(.13,0,2.84,0,M.gold);
 }
}
