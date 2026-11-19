import {mountainField,noise2,hash2} from './landscape-field.js';
import {graniteMaterial} from './granite.js';

const ridgeSamples=new Map();
if(typeof Worker==='function'&&typeof document!=='undefined'){
 try{
  const worker=new Worker(new URL('./ridge-worker.js',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>ridgeSamples.set(data.id,data);
 }catch{/* Synchronous sampling also supports browsers without module workers. */}
}

// Shared construction, independently authored terrain, colours and vegetation.
// No collider is registered here. Tiled meshes can be culled by the main camera.
export function mountainLandscape(T,root,id,sourceRock){
 const field=mountainField(id),p=field.profile,group=new T.Group();group.name=id+':landscape';root.add(group);
 const earth=new T.Color(p.earth),rock=new T.Color(p.rock),snow=new T.Color(0xe3ebed),c=new T.Color();
 const granite=id==='huashan'?graniteMaterial(T,sourceRock):null;
 const material=granite?.material||new T.MeshStandardMaterial({vertexColors:true,roughness:1});
 // Triplanar detail stays at a stable world scale on both slopes and cliff faces.
 // The texture is an explicit material resource so eviction releases it as well.
 let grain;
 if(!granite){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(128,128);
 for(let z=0;z<128;z++)for(let x=0;x<128;x++){const i=(z*128+x)*4,v=174+noise2(x*.075,z*.075,p.seed)*25+(hash2(x,z,p.seed)-.5)*37;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}
 ctx.putImageData(pixels,0,0);grain=new T.CanvasTexture(canvas);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.anisotropy=4;
 material.landscapeFallback=grain;
 material.uniforms={landscapeGrain:{value:sourceRock?.map||grain}};
 material.onBeforeCompile=shader=>{
  shader.uniforms.landscapeGrain=material.uniforms.landscapeGrain;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vHillPosition;\nvarying vec3 vHillNormal;').replace('#include <begin_vertex>','#include <begin_vertex>\nvHillPosition=position;vHillNormal=normal;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D landscapeGrain;\nvarying vec3 vHillPosition;\nvarying vec3 vHillNormal;').replace('#include <color_fragment>',`#include <color_fragment>
   vec3 weights=pow(abs(normalize(vHillNormal)),vec3(4.0));weights/=max(dot(weights,vec3(1.0)),0.001);
   float grain=dot(vec3(texture2D(landscapeGrain,vHillPosition.yz*.035).r,texture2D(landscapeGrain,vHillPosition.xz*.035).r,texture2D(landscapeGrain,vHillPosition.xy*.035).r),weights);
   float strata=sin(vHillPosition.y*.64+sin(vHillPosition.x*.025+vHillPosition.z*.03)*1.8);
   diffuseColor.rgb*=.7+grain*.8+strata*.065*(1.0-abs(vHillNormal.y));`);
 };
 material.customProgramCacheKey=()=> 'sansi-landscape-v1';
 }
 // Identical grid spacing and analytical normals on both sides of each seam.
 const samples=ridgeSamples.get(id);
 const size=160,segments=size/(p.grid||8);
 for(let tz=-4;tz<4;tz++)for(let tx=-4;tx<4;tx++){
  const geo=new T.PlaneGeometry(size,size,segments,segments);geo.rotateX(-Math.PI/2);geo.translate((tx+.5)*size,0,(tz+.5)*size);
  const a=geo.attributes.position,n=geo.attributes.normal,colors=new Float32Array(a.count*3);
  for(let i=0;i<a.count;i++){
   const x=a.getX(i),z=a.getZ(i);
   const k=samples?4*(Math.round((z+640)/samples.step)*samples.width+Math.round((x+640)/samples.step)):0;
   const y=samples?samples.data[k]:field.height(x,z),normal=samples?[samples.data[k+1],samples.data[k+2],samples.data[k+3]]:field.normal(x,z),patch=noise2(x*.018,z*.018,p.seed+15);
   a.setY(i,y);n.setXYZ(i,...normal);c.copy(earth).lerp(rock,Math.min(.95,Math.max(0,(1-normal[1])*(id==='ming'?1.65:.95)+patch*.13)));
   c.multiplyScalar(.86+patch*.13+normal[1]*.1);
   if(p.snow!==undefined){const elevation=Math.max(0,Math.min(1,(y-p.snow+patch*23)/32)),slope=Math.max(0,Math.min(1,(normal[1]-.48)/.3));c.lerp(snow,elevation*slope);}
   colors.set([c.r,c.g,c.b],i*3);
  }
  geo.setAttribute('color',new T.BufferAttribute(colors,3));geo.computeBoundingSphere();
  const tile=new T.Mesh(geo,material);tile.name=`${id}:ridge:${tx}:${tz}`;tile.receiveShadow=true;
  tile.onBeforeRender=()=>{if(granite)granite.sync();else material.uniforms.landscapeGrain.value=sourceRock?.map||grain;};group.add(tile);
 }
 const trees=samples?.trees||field.trees(),cells=new Map();
 for(const tree of trees){const key=Math.floor(tree.x/128)+','+Math.floor(tree.z/128);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(tree);}
 const bark=new T.MeshStandardMaterial({color:0x4a4434,roughness:1}),foliage=new T.MeshStandardMaterial({color:p.foliage,map:crownTexture(T,p),alphaTest:.48,side:T.DoubleSide,roughness:1});
 // Leaf clusters receive soft upward lighting on both sides. Flipping their
 // back-face normals downward would leave black cutouts between the sunlit cards.
 foliage.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal *= faceDirection;');};
 foliage.customProgramCacheKey=()=> 'sansi-distant-crowns-v1';
 const trunkGeo=new T.CylinderGeometry(.025,.05,1,5),leafGeo=crownPlanes(T);
 const matrix=new T.Matrix4(),position=new T.Vector3(),scale=new T.Vector3(),rotation=new T.Quaternion(),axis=new T.Vector3(0,1,0),tint=new T.Color();
 const lobes=p.forest==='pine'?1:3;
 for(const [key,list]of cells){
  const trunks=new T.InstancedMesh(trunkGeo,bark,list.length),leaves=new T.InstancedMesh(leafGeo,foliage,list.length*lobes);
  trunks.name=id+':forest-trunks:'+key;leaves.name=id+':forest-crowns:'+key;
  for(let i=0;i<list.length;i++){const t=list[i];rotation.setFromAxisAngle(axis,t.turn);position.set(t.x,t.y+t.size*.4,t.z);scale.set(t.size,t.size*.8,t.size);matrix.compose(position,rotation,scale);trunks.setMatrixAt(i,matrix);
   for(let j=0;j<lobes;j++){
    const angle=j*2.399+t.turn,spread=j===0?0:.2*t.size;
    position.set(t.x+Math.cos(angle)*spread,t.y+t.size*(p.forest==='pine'?.08:(j===0?.26:.14)),t.z+Math.sin(angle)*spread);
    const k=p.forest==='pine'?1:(j===0?.84:.7);scale.set(t.size*k,t.size*k*(p.forest==='scrub'?.65:1.05),t.size*k);
    matrix.compose(position,rotation,scale);leaves.setMatrixAt(i*lobes+j,matrix);tint.setScalar(t.tint*(1-j*.025));leaves.setColorAt(i*lobes+j,tint);
   }
  }
  trunks.computeBoundingSphere();leaves.computeBoundingSphere();group.add(trunks,leaves);
 }
 group.traverse(o=>{o.userData.landscape=true;});group.userData.trees=trees.length;group.userData.tiles=64;
 return group;
}

// Only the distant forest uses crossed cards; close bamboo and pines keep their
// existing volumetric geometry. Three fixed planes preserve depth on camera turns.
function crownPlanes(T){
 const positions=[],uv=[],normals=[],indices=[];
 for(let j=0;j<3;j++){const a=j*Math.PI/3,c=Math.cos(a),s=Math.sin(a),n=j*4;
  for(const [x,y,u,v]of[[-.5,0,0,0],[.5,0,1,0],[-.5,1,0,1],[.5,1,1,1]]){positions.push(x*c,y,x*s);uv.push(u,v);normals.push(-s*.6,.8,c*.6);}
  indices.push(n,n+1,n+2,n+1,n+3,n+2);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);return g;
}
function crownTexture(T,p){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');
 const pine=p.forest==='pine';
 // Dense small leaves build an uneven canopy edge, with gaps between branches.
 for(let i=0;i<1800;i++){
  const a=hash2(i,1,p.seed)*Math.PI*2,r=Math.sqrt(hash2(i,2,p.seed)),y=hash2(i,3,p.seed);
  let x,cy;
  if(pine){const tier=Math.floor(y*9),ty=.09+tier*.091,width=ty*.47;x=.5+(hash2(i,4,p.seed)-.5)*width*2;cy=ty+Math.abs(x-.5)*.2+(hash2(i,5,p.seed)-.5)*.065;}
  else{x=.5+Math.cos(a)*r*.43*(.88+.12*Math.sin(a*5));cy=.5+Math.sin(a)*r*.43;}
  const shade=Math.floor(108+hash2(i,6,p.seed)*100+(1-cy)*24);c.fillStyle=`rgb(${shade},${shade},${shade})`;c.beginPath();c.ellipse(x*256,cy*256,2+hash2(i,7,p.seed)*3,1.4+hash2(i,8,p.seed)*2,a,0,Math.PI*2);c.fill();
 }
 // Pine drawing coordinates run from tip to base; the card UV supplies the flip.
 const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
}
