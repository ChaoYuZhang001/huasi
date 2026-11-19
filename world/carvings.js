import {resourcesOf,releaseRegion} from './resources.js';

let loaderPromise;
async function readCarving(THREE,file){
 if(!loaderPromise){
  globalThis.__SHANSI_THREE=THREE;
  loaderPromise=Promise.all([import('../vendor/GLTFLoader.js'),import('../vendor/meshopt_decoder.module.js')])
   .then(([{GLTFLoader},{MeshoptDecoder}])=>new GLTFLoader().setMeshoptDecoder(MeshoptDecoder))
   .catch(error=>{loaderPromise=null;throw error;});
 }
 const {scene}=await (await loaderPromise).loadAsync(new URL('../models/'+file+'.glb',import.meta.url).href);
 scene.traverse(o=>{
  if(!o.isMesh)return;
  o.castShadow=o.receiveShadow=true;
  if(o.material.map){
   o.material.map.anisotropy=4;o.material.emissiveMap=o.material.map;
   o.material.emissive.setHex(0xffffff);o.material.emissiveIntensity=.18;
  }
 });
 return scene;
}

// A region owns its altars. If a traveller leaves while the network is in
// flight an evicted region must neither attach nor retain the late model.
export function carvingGallery(THREE,solo,refreshShadow,retained){
 const slots=[];
 function place(file,name,position,height,turn,fallback,decorate){
  const distant=solo(fallback);
  slots.push({file,name,position,height,turn,distant,decorate,next:0});
 }
 async function load(slot,time){
  slot.next=Infinity;
  try{
   const scene=await readCarving(THREE,slot.file),parent=slot.distant.parent;
   if(!parent){releaseRegion(scene,{retained:()=>new Set()});return;}
   scene.name=slot.name;scene.position.copy(slot.position);scene.rotation.y=slot.turn*Math.PI/2;
   scene.scale.setScalar(slot.height);slot.decorate?.(scene);parent.add(scene);
   if(retained)releaseRegion(slot.distant,{retained});
   else{slot.distant.removeFromParent();for(const g of resourcesOf(slot.distant))if(g.isBufferGeometry)g.dispose();}
   slot.distant=null;refreshShadow();
  }catch(error){slot.next=time+30;console.warn('Unable to load '+slot.file,error);}
 }
 function update(position,time){
  for(const slot of slots)if(time>=slot.next&&position.distanceToSquared(slot.position)<28*28)load(slot,time);
 }
 return {place,update};
}
