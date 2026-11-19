// A quiet, authored empty-hand sequence for the existing two-part arms.
// It is not a reconstruction of a historical school's martial technique.
export function fistPose(f,phase,t){
 const u=Math.max(0,Math.min(1,t)),v=Math.min(1,u/.55),q=v*v*(3-2*v),lerp=(a,b)=>a+(b-a)*q;
 const rest=[-.25,-.2,-.25,-.2,0,0],guard=[-.62,-1.55,-.82,-1.2,.08,0],extended=[-1.47,-.12,-.82,-1.2,-.16,.04];
 const a=phase===0?rest:phase===1?guard:extended,b=phase===0?guard:phase===1?extended:rest;
 const [r,re,l,le,waist,lean]=a.map((x,i)=>lerp(x,b[i]));
 f.upper.rotation.set(lean,waist,0);f.armR.rotation.set(r,0,-.1);f.elbR.rotation.set(re,0,0);
 f.armL.rotation.set(l,0,.16);f.elbL.rotation.set(le,0,0);f.head.rotation.y=waist*.35;
}

export function practiceFists(T){
 const cloth=new T.MeshStandardMaterial({color:0xd1c4a5,roughness:1}),seam=new T.MeshStandardMaterial({color:0x958267,roughness:1});
 const palm=new T.SphereGeometry(.043,10,8),thumb=new T.SphereGeometry(.017,8,6),knuckle=new T.SphereGeometry(.012,8,6),band=new T.TorusGeometry(.041,.0035,4,16);band.rotateX(Math.PI/2);
 return[-1,1].map(side=>{const g=new T.Group();g.name='practice:wrapped-fist';g.position.set(0,-.34,.008);g.visible=false;
  function add(geo,m,x,y,z,sx=1,sy=1,sz=1){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;g.add(o);}
  add(palm,cloth,0,0,0,1.08,.9,1);add(thumb,cloth,-side*.036,.008,.02,.85,1.3,1);
  for(const x of[-.027,-.009,.009,.027])add(knuckle,cloth,x,-.005,.033,.85,1,1);
  for(const y of[-.016,.016])add(band,seam,0,y,0);return g;});
}

export function releaseFists(f){
 if(!f?.practiceFists)return;const resources=new Set();
 for(const g of f.practiceFists){g.traverse(o=>{if(o.geometry)resources.add(o.geometry);if(o.material)resources.add(o.material);});g.removeFromParent();}
 for(const r of resources)r.dispose();f.practiceFists=null;
}
