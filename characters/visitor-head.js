const portraits=new Map();
export const portraitResources=new Set();

export async function dressPortrait(THREE,figure){
 const sex=figure.player==='f'?'female':'male';
 if(!portraits.has(sex)){
  globalThis.__SHANSI_THREE=THREE;
  portraits.set(sex,import('../vendor/GLTFLoader.js').then(({GLTFLoader})=>
   new GLTFLoader().loadAsync(new URL('./visitor-'+sex+'.glb',import.meta.url).href)
  ).then(({scene})=>{
   scene.name='visitor-portrait:'+sex;
   scene.traverse(node=>{if(node.isMesh){portraitResources.add(node.material);portraitResources.add(node.geometry);node.castShadow=true;}});
   return scene;
  }).catch(error=>{portraits.delete(sex);throw error;}));
 }
 try{
  const template=await portraits.get(sex);
  if(!figure.g.parent)return;
  const portrait=template.clone(true);
  figure.eyelids=[];
  portrait.traverse(node=>{
   if(node.morphTargetDictionary?.blink===0)figure.eyelids.push(node);
   if(node.morphTargetDictionary?.tailSway===0)figure.ponytail=node;
  });
  figure.head.children[0].visible=false;
  figure.eyes.forEach(eye=>eye.visible=false);
  portrait.position.y=figure.head.userData.eyeHeight;
  figure.head.add(portrait);
 }catch(error){console.warn('Using the local fallback portrait',error);}
}
