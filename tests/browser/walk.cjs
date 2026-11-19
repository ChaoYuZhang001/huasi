// The harness only sets yaw and the forward key. Position, grounding and collision
// response are owned by the game's normal player update throughout each campus.
function visit(id,point){
 const site=point?{p:new V3(...point),r:1.25}:IA.find(a=>a.id===id);if(!site)return {error:'missing '+id};
 const {p,r}=site,ignored=new Set();
 let steps=0,metres=0;
 function eyeDistance(x,y,z){return Math.hypot(x-p.x,y+1.4-p.y,z-p.z);}
 function route(){
  const start=cellOf(P.pos.x,P.pos.z);
  if(!nb[start])return null;
  const parent=new Int32Array(navH.length).fill(-1),q=[start];parent[start]=start;
  for(let i=0;i<q.length;i++){
   const c=q[i];
   if(eyeDistance(cellX(c),navH[c],cellZ(c))<r-.48){
    const path=[];for(let n=c;n!==start;n=parent[n])path.push(n);
    return path.reverse();
   }
   for(const n of nb[c]){
    if(parent[n]>=0||ignored.has(c+','+n))continue;
    if(npcs.some(w=>Math.abs(w.p.y-navH[n])<1.2&&Math.hypot(w.p.x-cellX(n),w.p.z-cellZ(n))<.57))continue;
    parent[n]=c;q.push(n);
   }
  }
  return null;
 }
 function next(x,z){
  let best=Infinity,stuck=0;
  for(let i=0;i<100;i++){
   const dx=x-P.pos.x,dz=z-P.pos.z,dist=Math.hypot(dx,dz);
   if(dist<.16)return true;
   if(dist<best-.03){best=dist;stuck=0;}else if(++stuck>13)return false;
   P.yaw=Math.atan2(-dx,-dz);keys.KeyW=true;
   const px=P.pos.x,pz=P.pos.z;updPlayer(.033);WORLD.walkRoad();steps++;
   const move=Math.hypot(P.pos.x-px,P.pos.z-pz);metres+=move;
   if(move>1||P.pos.y<-.65)throw new Error('left the path '+id+' at '+P.pos.toArray());
  }
  return false;
 }
 try{
  let lastEdge='';
  for(let attempt=0;attempt<32;attempt++){
   if(eyeDistance(P.pos.x,P.pos.y,P.pos.z)<r-.18){
    return {id,at:P.pos.toArray(),steps,metres:Math.round(metres),detours:ignored.size};
   }
   const cells=route();
   if(!cells||!cells.length)return {error:'no route',id,at:P.pos.toArray(),lastEdge,detours:ignored.size};
   let prev=cellOf(P.pos.x,P.pos.z);
   for(const n of cells){
    if(!next(cellX(n),cellZ(n))){
     lastEdge=prev+','+n;ignored.add(lastEdge);
     break;
    }
    prev=n;
   }
  }
  return {error:'stalled',id,at:P.pos.toArray(),lastEdge,detours:ignored.size};
 }finally{keys.KeyW=false;for(let k=0;k<8;k++)updPlayer(.033);}
}

module.exports={visit};
