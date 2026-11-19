import {hash2,noise2} from './landscape-field.js';

// The court's circulation and planted edges are authored together. Decorative
// plants never occupy the practice rectangle, path widths or bench approach.
const beds=[[-10.2,-13,3.3,4.8],[-11,-3,2.7,3.6],[-8.5,2.2,3.7,2.8],[-9.4,17.1,3.7,1.9],[16.8,16.1,9.3,2.5],[16.4,-3.5,3.7,5.5],[32.4,16,1.6,2.3],[-3,-15.4,6.8,2.5],[18.3,-18.2,4.6,1],[34.1,-9,.45,5]];
const paths=[[[0,20],[0,12],[6,8],3.6],[[0,12],[-11,12],[-11,8],[-15,8],3.2],[[6,11],[30.5,11],[32.5,5],[32.5,-14],[28,-15],[28,-20],3],[[24,11],[24,-4],2.5],[[11,-4],[14,-9],2.5],[[1,-4],[-3,-4],2.1],[[11,-2],[15,-2],2.1]];
const distance=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);};
function pathDistance(x,z){let d=Infinity;for(const p of paths){const half=p.at(-1)/2;for(let i=1;i<p.length-1;i++)d=Math.min(d,distance(x,z,p[i-1],p[i])-half);}return d;}
function practice(x,z,pad=0){return x>1-pad&&x<11+pad&&z>-6-pad&&z<8+pad;}
function bench(x,z,pad=0){return x>15.1-pad&&x<18.5+pad&&z>-6.2-pad&&z<.2+pad;}
function planted(x,z){let d=0;for(const [bx,bz,rx,rz]of beds){const q=Math.hypot((x-bx)/rx,(z-bz)/rz);d=Math.max(d,Math.max(0,Math.min(1,(1-q)*3+noise2(x*.8,z*.8,611)*.22)));}return d;}

export function courtGarden(T,root,M){
 const group=new T.Group();group.name='kongtong:court-garden';root.add(group);
 const geometry=(p,n,uv,c,i)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));if(n)g.setAttribute('normal',new T.Float32BufferAttribute(n,3));if(uv)g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));if(c)g.setAttribute('color',new T.Float32BufferAttribute(c,3));g.setIndex(i);if(!n)g.computeVertexNormals();g.computeBoundingSphere();return g;};
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(512,512);
 for(let z=0;z<512;z++)for(let x=0;x<512;x++){
  const wx=-15+x/511*50,wz=-20+z/511*40,i=(z*512+x)*4,n=noise2(wx*.3,wz*.3,716)*9+noise2(wx*2,wz*2,531)*4+(hash2(x,z,123)-.5)*11;
  const green=planted(wx,wz)*.8,shade=1-Math.max(0,green-.2)*.1;
  const base=[114,109,94],leaf=[76,94,57];for(let k=0;k<3;k++)pixels.data[i+k]=(base[k]*(1-green)+leaf[k]*green+n)*shade;pixels.data[i+3]=255;
 }
 ctx.putImageData(pixels,0,0);const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
 const ground=new T.MeshStandardMaterial({map,roughness:1});ground.uniforms={courtGrain:{value:M.rock.map}};
 ground.onBeforeCompile=shader=>{shader.uniforms.courtGrain=ground.uniforms.courtGrain;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vCourtPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nvCourtPosition=(modelMatrix*vec4(position,1.0)).xyz;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D courtGrain;varying vec3 vCourtPosition;').replace('#include <color_fragment>','#include <color_fragment>\nfloat grain=texture2D(courtGrain,vCourtPosition.xz*.72).r;diffuseColor.rgb*=.78+grain*.35;');};ground.customProgramCacheKey=()=> 'sansi-court-earth-v1';
 const plane=new T.PlaneGeometry(50,40);plane.rotateX(-Math.PI/2);plane.translate(10,2.438,0);const soil=new T.Mesh(plane,ground);soil.name='court:earth';soil.receiveShadow=true;group.add(soil);
 // Hand-cut slabs are one mesh, with visible joints and independent tint. Their
 // few-centimetre relief does not create invisible new navigation barriers.
 const sp=[],sn=[],su=[],sc=[],si=[],tint=new T.Color();let slabs=0;
 for(let row=0;row<42;row++)for(let column=0;column<53;column++){
  const x=-14.5+column*.94+(row%2)*.47,z=-19.5+row*.94;
  if(x>34.6||z>19.6||(!practice(x,z)&&pathDistance(x,z)>.08))continue;
  const r=k=>hash2(column,row,527+k),hx=.454-r(1)*.007,hz=.454-r(2)*.007,cut=.035+r(3)*.035,y=2.458+r(4)*.003;
  const outline=[[-hx+cut,-hz],[hx-cut,-hz],[hx,-hz+cut],[hx,hz-cut],[hx-cut,hz],[-hx+cut,hz],[-hx,hz-cut],[-hx,-hz+cut]],offset=sp.length/3;
  tint.setHex(0xd4d9d3).multiplyScalar(.9+r(5)*.16);
  // Sample inside one of the existing scan's 5x5 stones, excluding its grout.
  // Each authored slab keeps the scan's colour, normal and roughness together.
  const tileX=Math.floor(r(6)*5),tileY=Math.floor(r(7)*5);
  for(const [dx,dz]of outline){sp.push(x+dx,y,z+dz);sn.push(0,1,0);su.push(tileX/5+.012+(dx+hx)/(2*hx)*.176,tileY/5+.012+(dz+hz)/(2*hz)*.176);sc.push(tint.r,tint.g,tint.b);}
  for(let i=1;i<7;i++)si.push(offset,offset+i+1,offset+i);slabs++;
 }
 const slabMaterial=new T.MeshStandardMaterial({vertexColors:true,color:0xc4c9c0,roughness:1}),sources={};
 function syncStone(){let changed=false;for(const key of['map','normalMap','roughnessMap'])if(sources[key]!==M.paving[key]){sources[key]=M.paving[key];const previous=slabMaterial[key];slabMaterial[key]=sources[key]?.clone()||null;if(slabMaterial[key]){slabMaterial[key].repeat.set(1,1);slabMaterial[key].offset.set(0,0);slabMaterial[key].needsUpdate=true;}previous?.dispose();changed=true;}if(changed){slabMaterial.normalScale.copy(M.paving.normalScale).multiplyScalar(.65);slabMaterial.needsUpdate=true;}}
 syncStone();
 const paving=new T.Mesh(geometry(sp,sn,su,sc,si),slabMaterial);paving.name='court:slabs';paving.receiveShadow=true;group.add(paving);
 // Volumetric curved blades stay legible at grazing angles without alpha cards.
 const bp=[],bc=[],bi=[],leafDark=new T.Color(0x50613b),leafLight=new T.Color(0x9b9e62),lc=new T.Color();
 for(let b=0;b<9;b++){
  const angle=b*2.399,h=.22+hash2(b,1,908)*.45,bend=.14+hash2(b,2,908)*.34,width=.008+hash2(b,3,908)*.015,offset=bp.length/3;
  for(let k=0;k<5;k++){const t=k/4,r=bend*t*t,half=width*Math.sin(Math.PI*(t*.9+.05));lc.copy(leafDark).lerp(leafLight,t*.8);
   for(const s of[-1,1]){bp.push(Math.cos(angle)*r+Math.sin(angle)*half*s,h*t,Math.sin(angle)*r-Math.cos(angle)*half*s);bc.push(lc.r,lc.g,lc.b);}}
  for(let k=0;k<4;k++){const a=offset+k*2;bi.push(a,a+1,a+2,a+1,a+3,a+2);}
 }
 const blade=geometry(bp,null,null,bc,bi),green=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
 const wind={value:0};green.uniforms={courtWind:wind};green.onBeforeCompile=shader=>{shader.uniforms.courtWind=wind;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float courtWind;').replace('#include <begin_vertex>',`#include <begin_vertex>
 vec4 courtPlant=instanceMatrix*vec4(position,1.0);float sway=sin(courtWind*.8+courtPlant.x*.9+courtPlant.z*.4);transformed.x+=sway*.045*position.y*position.y;transformed.z+=sway*.025*position.y*position.y;`);};green.customProgramCacheKey=()=> 'sansi-court-leaves-v1';
 const plants=[];for(let row=0;row<84;row++)for(let col=0;col<104;col++){
  const r=k=>hash2(col,row,817+k),x=-15+(col+r(1))*.48,z=-20+(row+r(2))*.48;
  if(x>34.8||z>19.8||planted(x,z)<.22||practice(x,z,.5)||pathDistance(x,z)<.65||bench(x,z,.35)||r(3)>.72)continue;
  plants.push({x,z,size:.48+r(4)*.65,turn:r(5)*6.28,tint:.85+r(6)*.3});
 }
 const cells=new Map(),matrix=new T.Matrix4(),q=new T.Quaternion(),position=new T.Vector3(),scale=new T.Vector3(),up=new T.Vector3(0,1,0);
 for(const p of plants){const key=Math.floor(p.x/10)+','+Math.floor(p.z/10);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(p);}
 for(const [key,list]of cells){const grass=new T.InstancedMesh(blade,green,list.length);list.forEach((p,i)=>{position.set(p.x,2.44,p.z);scale.setScalar(p.size);q.setFromAxisAngle(up,p.turn);matrix.compose(position,q,scale);grass.setMatrixAt(i,matrix);tint.setScalar(p.tint);grass.setColorAt(i,tint);});grass.computeBoundingSphere();grass.boundingSphere.radius+=.1;grass.name='court:grasses:'+key;grass.receiveShadow=true;group.add(grass);}
 // Small flowers punctuate selected clumps; they are rooted in the same beds.
 const fp=[],fc=[],fi=[],stem=new T.Color(0x697a44),petal=new T.Color(0xded6ae),centre=new T.Color(0xa28b3f);
 function tri(a,b,c,color){const offset=fp.length/3;fp.push(...a,...b,...c);for(let k=0;k<3;k++)fc.push(color.r,color.g,color.b);fi.push(offset,offset+1,offset+2);}
 for(let side=0;side<2;side++){const a=side*Math.PI/2,dx=Math.cos(a)*.009,dz=Math.sin(a)*.009;tri([-dx,0,-dz],[dx,0,dz],[0,.54,0],stem);}
 for(let k=0;k<5;k++){const a=k/5*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),cross=.035;tri([0,.53,0],[ca*.08-sa*cross,.55,sa*.08+ca*cross],[ca*.14,.52,sa*.14],petal);tri([0,.53,0],[ca*.14,.52,sa*.14],[ca*.08+sa*cross,.55,sa*.08-ca*cross],petal);tri([0,.555,0],[ca*.027,.55,sa*.027],[Math.cos(a+1.257)*.027,.55,Math.sin(a+1.257)*.027],centre);}
 const flowerPlants=plants.filter((_,i)=>i%9===0),flowerMaterial=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}),flowers=new T.InstancedMesh(geometry(fp,null,null,fc,fi),flowerMaterial,flowerPlants.length);
 flowerPlants.forEach((p,i)=>{position.set(p.x+.08,2.44,p.z-.03);scale.setScalar(.7+p.size*.6);q.setFromAxisAngle(up,p.turn);matrix.compose(position,q,scale);flowers.setMatrixAt(i,matrix);});flowers.computeBoundingSphere();flowers.name='court:flowers';flowers.receiveShadow=true;group.add(flowers);
 group.userData.summary={slabs,plants:plants.length,flowers:flowerPlants.length,plantGroups:cells.size};
 return{group,update(dt){wind.value+=Math.min(.1,Math.max(0,dt||0));ground.uniforms.courtGrain.value=M.rock.map;syncStone();}};
}
