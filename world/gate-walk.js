const points=[[1.5,50.5],[.5,45.5],[.5,42.65],[1.7,41.4],[1.7,38.6],[.5,37.35],[.5,34.5],[1.5,30.5],[5.5,27.5]];
const lengths=points.slice(1).map(([x,z],index)=>Math.hypot(x-points[index][0],z-points[index][1]));
const outward=lengths.reduce((sum,length)=>sum+length,0);

export function createGateWalk(){
 let distance=0,phase='gate',waiting=false,dwell=0;
 const position=()=>{
  let index=0,remaining=distance;
  while(index<lengths.length-1&&remaining>lengths[index])remaining-=lengths[index++];
  const start=points[index],end=points[index+1],amount=Math.min(1,remaining/lengths[index]);
  return {x:start[0]+(end[0]-start[0])*amount,z:start[1]+(end[1]-start[1])*amount};
 };
 return {
  get phase(){return phase;},get position(){return position();},
  invite(){if(phase!=='gate')return false;phase='leading';waiting=false;return true;},
  step(dt,visitor,hasIncense){
   const before=position(),gap=Math.hypot(visitor.x-before.x,visitor.z-before.z);
   let event=null;
   if(phase==='leading'){
    if(gap>18||hasIncense)phase='returning';
    else{
     const ahead=visitor.z<before.z-1&&Math.abs(visitor.x-before.x)<7;
     if(gap<3.8||ahead)waiting=false;else if(gap>5.5)waiting=true;
     if(!waiting)distance=Math.min(outward,distance+dt*1.85);
     if(distance===outward&&gap<4){phase='at-table';dwell=0;event='arrived';}
    }
   }else if(phase==='at-table'){
    dwell+=dt;if(dwell>=15||hasIncense||gap>8)phase='returning';
   }
   if(phase==='returning'){
    distance=Math.max(0,distance-dt*1.65);
    if(distance===0)phase='gate';
   }
   const after=position(),moving=before.x!==after.x||before.z!==after.z;
   const yaw=moving?Math.atan2(after.x-before.x,after.z-before.z):phase==='at-table'?Math.atan2(4.2-after.x,26-after.z):gap<9?Math.atan2(visitor.x-after.x,visitor.z-after.z):0;
   return {...after,moving,yaw,event};
  }
 };
}

export function installGateWalk(host,root){
 const {THREE,GS,P,collections,builders}=host,walk=createGateWalk(),home=points[0];
 const figure=host.figure({robe:7,bun:true,bag:true,long:true});
 root.add(figure.g);host.tag(figure,'提灯客 · 阿岚');
 const lantern=new THREE.Group();figure.elbR.add(lantern);lantern.position.set(.085,-.33,.06);
 const part=(geometry,material,height)=>{
  const mesh=new THREE.Mesh(geometry,material);mesh.position.y=height;lantern.add(mesh);return mesh;
 };
 part(new THREE.TorusGeometry(.085,.01,5,14),builders.M.woodDark,-.065);
 part(new THREE.CylinderGeometry(.12,.14,.24,8),new THREE.MeshStandardMaterial({color:0xf2af58,emissive:0xd67821,emissiveIntensity:.65,roughness:.9}),-.25);
 const rim=new THREE.CylinderGeometry(.15,.15,.025,8);
 part(rim,builders.M.woodDark,-.125);part(rim,builders.M.woodDark,-.375);
 part(new THREE.CylinderGeometry(.134,.135,.014,8),builders.M.woodDark,-.265);
 part(new THREE.ConeGeometry(.035,.12,7),builders.M.ribbon,-.445).rotation.z=Math.PI;
 const position=new THREE.Vector3(home[0],0,home[1]),prompt=position.clone();
 prompt.y+=1.35;figure.g.position.copy(position);
 const guide={f:figure,p:position,ci:host.cellOf(position.x,position.z),tx:-1,fixed:true,t:0,yaw:0,gd:0,greetT:0,gy:0,
  upd(actor,dt){
   if(GS.state!=='play'||P.mode!=='walk'||host.modal())return [0,0];
   const step=walk.step(dt,P.pos,!!P.inc);
   if(step.moving){
    actor.ci=host.cellOf(step.x,step.z);const height=host.navH[actor.ci];
    position.set(step.x,Number.isFinite(height)?position.y+(height-position.y)*Math.min(1,dt*12):position.y,step.z);
    prompt.copy(position);prompt.y+=1.35;
   }
   actor.yaw=host.turn(actor.yaw,step.yaw,dt*5);
   if(step.event==='arrived')host.message('阿岚收住脚步：前面这张红案，便是请香处。');
   return [0,0,step.moving];
  }};
 collections.npcs.push(guide);
 collections.IA.push({id:'temple:lantern-guide',p:prompt,r:4.5,short:'同行',label:()=>walk.phase==='gate'&&!P.inc?'与阿岚同行 · 去前院香案':null,
  act(){if(walk.invite())host.message('阿岚提起灯：跟我穿过山门吧。慢慢走，我等你。');}});
}
