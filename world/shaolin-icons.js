import {carvingGallery} from './carvings.js';

export function shaolinIcons(THREE,solo,worldPoint,quarterTurns,refreshShadow){
 const gallery=carvingGallery(THREE,solo,refreshShadow);
 function aureole(){
  const trim=new THREE.MeshStandardMaterial({color:0xba9252,metalness:.45,roughness:.58});
  const group=new THREE.Group();
  for(const [radius,wire] of [[.172,.0065],[.158,.0033]]){
   const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,wire,6,64),trim);
   group.add(ring);
  }
  group.position.set(0,.813,-.158);
  return group;
 }
 function place(name,x,y,z,height,buildDistant,asset,finish){
  const file=asset||(name==='damo'?'shaolin-damo':'shaolin/'+name);
  const halo=['shakyamuni','amitabha','medicine','vairocana','guanyin'].includes(name);
  gallery.place(file,'shaolin:'+name,worldPoint(x,y,z),height,quarterTurns(),buildDistant,scene=>{
   if(halo)scene.add(aureole());
   if(finish)scene.traverse(o=>{if(o.isMesh)finish(o.material);});
  });
 }
 return {place,update:gallery.update};
}
