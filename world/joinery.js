// All dimensions are local to the current builder origin, in metres.
export function timberBetween(b,start,end,width,depth,material){
 const {THREE:T}=b,from=new T.Vector3(...start),to=new T.Vector3(...end);
 const delta=to.clone().sub(from),length=delta.length();
 const piece=new T.BoxGeometry(width,length,depth);
 piece.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()));
 const mid=from.lerp(to,.5);b.G(piece,material,mid.x,mid.y,mid.z);
}

// Two actual roof slopes. Rafters meet at the ridge and rest on the longitudinal plates.
export function gabledRoof(b,width,depth,eaves,rise,cover,timber,{boards=false,enclosed=false}={}){
 const {THREE:T,M,B,G}=b,run=depth/2,slope=Math.atan2(rise,run),length=Math.hypot(run,rise);
 const ridge=eaves+rise,rafters=Math.ceil(width/1.25);
 for(const side of [-1,1]){
  const skin=new T.BoxGeometry(width,.14,length);
  const uv=skin.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*width/1.6,uv.getY(i)*length/1.5);
  skin.rotateX(side*slope);G(cover===M.tile?skin.toNonIndexed():skin,cover,0,eaves+rise*.5,side*run*.5);
  for(let i=0;i<=rafters;i++){
   const x=(i/rafters-.5)*(width-.3);
   timberBetween(b,[x,eaves-.14,side*run],[x,ridge-.14,0],.11,.14,timber);
  }
  const bearing=run-1.1;
  B(width-.9,.22+rise*(1-bearing/run),.24,0,eaves-.24,side*bearing,timber,false);
  B(width,.21,.16,0,eaves-.19,side*run,timber,false);
  if(boards){
   const count=Math.ceil(width/1.05);
   for(let i=0;i<=count;i++){
    const x=(i/count-.5)*(width-.12);
    timberBetween(b,[x,eaves+.099,side*run],[x,ridge+.099,0],.065,.055,timber);
   }
  }
 }
 for(let i=0;i<6;i++){
  const z=(i-2.5)*depth/6;
  b.col(width,.17,depth/6,0,eaves+rise*(1-Math.abs(z)/run),z);
 }
 B(width+.18,.18,.26,0,ridge-.02,0,boards?timber:M.ridge,false);
 for(const x of [-(width/2-.75),width/2-.75]){
  B(.22,.22,depth-1.15,x,eaves-.15,0,timber,false);
  B(.15,rise-.16,.15,x,eaves+.07,0,timber,false);
  if(enclosed){
   const face=new T.Shape();face.moveTo(-run+.66,0);face.lineTo(run-.66,0);face.lineTo(0,rise-.15);face.closePath();
   const g=new T.ExtrudeGeometry(face,{depth:.13,bevelEnabled:false});g.rotateY(Math.PI/2);
   g.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));G(g,M.red,x-.065,eaves-.03,0);
  }
 }
}

// A real window opening above a solid sill. Both faces use the same rails and mullions.
export function windowBay(b,cx,z,width,bottom,top,wall){
 const {B,M}=b,sill=bottom+.92,head=top-.34;
 B(width,.92,.18,cx,bottom,z,wall);
 for(const h of [sill,head])B(width,.14,.23,cx,h,z,M.woodDark,false);
 B(width,top-head-.14,.16,cx,head+.14,z,wall,false);
 const n=Math.max(2,Math.round(width/.55));
 for(let i=0;i<=n;i++)B(i===0||i===n?.12:.065,head-sill,.11,cx+width*(i/n-.5),sill,z,M.woodDark,false);
 B(width,.055,.12,cx,head-.38,z,M.woodDark,false);
}

export function hangingLamp(b,x,ceiling,z,drop=.4){
 const {M,C}=b,top=ceiling-drop;
 C(.018,.018,drop,x,top,z,M.iron,false,8);
 C(.21,.19,.35,x,top-.35,z,M.glow,false,10);
 for(const h of [top-.39,top-.025])C(.23,.23,.045,x,h,z,M.bronze,false,10);
 for(const side of [-1,1])b.B(.029,.34,.029,x+side*.19,top-.35,z,M.woodDark,false);
 if(b.roomLamp)b.roomLamp(x,top-.22,z);
 else b.plight(x,top-.22,z,0xffdcab,36,13);
}
