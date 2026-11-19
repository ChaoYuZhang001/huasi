import {noise2,hash2} from './landscape-field.js';

// Region-owned granite uses the existing scan as fine grain, not as a repeated
// picture of an entire cliff. Its projection is shared by near and distant rock.
export function graniteMaterial(T,source){
 const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.96});
 material.extensions={derivatives:true};
 material.uniforms={graniteGrain:{value:source.map}};
 material.onBeforeCompile=shader=>{
  shader.uniforms.graniteGrain=material.uniforms.graniteGrain;
  shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
   varying vec3 vGranitePosition;varying vec3 vGraniteNormal;`).replace('#include <begin_vertex>',`#include <begin_vertex>
   vGranitePosition=(modelMatrix*vec4(position,1.0)).xyz;vGraniteNormal=normalize(mat3(modelMatrix)*normal);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   uniform sampler2D graniteGrain;varying vec3 vGranitePosition;varying vec3 vGraniteNormal;
   float graniteHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
   float graniteNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
    return mix(mix(mix(graniteHash(i),graniteHash(i+vec3(1,0,0)),f.x),mix(graniteHash(i+vec3(0,1,0)),graniteHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(graniteHash(i+vec3(0,0,1)),graniteHash(i+vec3(1,0,1)),f.x),mix(graniteHash(i+vec3(0,1,1)),graniteHash(i+vec3(1,1,1)),f.x),f.y),f.z);
   }
   float graniteHeight(vec3 p,vec3 weights){
    float a=dot(vec3(texture2D(graniteGrain,p.yz*.29).r,texture2D(graniteGrain,p.xz*.29).r,texture2D(graniteGrain,p.xy*.29).r),weights);
    float b=dot(vec3(texture2D(graniteGrain,p.zy*.117+vec2(.37,.19)).r,texture2D(graniteGrain,p.zx*.117+vec2(.37,.19)).r,texture2D(graniteGrain,p.yx*.117+vec2(.37,.19)).r),weights);
    return a*.65+b*.35;
   }`).replace('#include <color_fragment>',`#include <color_fragment>
   vec3 graniteWeights=pow(abs(normalize(vGraniteNormal)),vec3(4.0));graniteWeights/=max(dot(graniteWeights,vec3(1.0)),.001);
   float graniteDetail=graniteHeight(vGranitePosition,graniteWeights);
   float granitePatch=graniteNoise(vGranitePosition*.085);
   float graniteStreak=graniteNoise(vGranitePosition*vec3(.28,.024,.28));
   float graniteSteep=1.0-abs(normalize(vGraniteNormal).y);
   diffuseColor.rgb*=.58+graniteDetail*.48+granitePatch*.38-graniteStreak*.16*graniteSteep;
   diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.85,.94,.79),smoothstep(.62,.9,graniteStreak)*.25);`).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   vec3 graniteDx=dFdx(-vViewPosition),graniteDy=dFdy(-vViewPosition);
   vec3 graniteRx=cross(graniteDy,normal),graniteRy=cross(normal,graniteDx);
   float graniteDet=dot(graniteDx,graniteRx);
   vec2 graniteSlope=vec2(dFdx(graniteDetail),dFdy(graniteDetail))*.15;
   normal=normalize(abs(graniteDet)*normal-sign(graniteDet)*(graniteSlope.x*graniteRx+graniteSlope.y*graniteRy));`);
 };
 material.customProgramCacheKey=()=> 'sansi-huashan-granite-v1';
 return{material,sync(){material.uniforms.graniteGrain.value=source.map;}};
}

// The exact upper rectangle meets the existing foundation. Below it, irregular
// buttresses widen into the valley; none is registered as a walking surface.
export function cliffGeometry(T,{x,z,w,d,y,bottom=-42,clearance=[]}){
 const perimeter=[],nx=Math.ceil(w/1.25),nz=Math.ceil(d/1.25),levels=32;
 for(let i=0;i<nx;i++)perimeter.push([-w/2+w*i/nx,-d/2]);
 for(let i=0;i<nz;i++)perimeter.push([w/2,-d/2+d*i/nz]);
 for(let i=0;i<nx;i++)perimeter.push([w/2-w*i/nx,d/2]);
 for(let i=0;i<nz;i++)perimeter.push([-w/2,d/2-d*i/nz]);
 const count=perimeter.length,positions=[],colors=[],indices=[],color=new T.Color(),pale=new T.Color(0xa8aa9b),deep=new T.Color(0x667361),extent=Math.min(6,Math.min(w,d)*.28);
 for(let j=0;j<=levels;j++)for(let i=0;i<count;i++){
  const t=1-j/levels,[px,pz]=perimeter[i],yy=y-.28+(bottom-y+.28)*t;
  const angle=Math.atan2(pz/d,px/w),u=Math.cos(angle),v=Math.sin(angle);
  const fold=noise2((x+px)*.17,(z+pz)*.17+yy*.025,917);
  const weather=noise2((x+px)*.55+yy*.06,(z+pz)*.55,326);
  const extension=(1-Math.exp(-t*24))*extent*(.35+fold*.32+weather*.1)+t*t*(4.5+fold*2);
  positions.push(x+px+u*extension,yy,z+pz+v*extension);
  color.copy(pale).lerp(deep,Math.min(.55,t*.4+Math.max(0,fold)*.15));color.multiplyScalar(.95+weather*.05);colors.push(color.r,color.g,color.b);
 }
 for(let j=0;j<levels;j++)for(let i=0;i<count;i++){const a=j*count+i,b=j*count+(i+1)%count,c=a+count,e=b+count;indices.push(a,c,b,b,c,e);}
 // Attached, fractured buttresses give the face real silhouettes and self-shadow.
 // Their tops stay below the deck; their bases intersect the continuous substrate.
 for(let i=1;i<count;i+=4){
  const [px,pz]=perimeter[i],seed=Math.round(x*31+z*17),r=k=>hash2(i,k,seed);
  if(r(1)<.25)continue;
  const angle=Math.atan2(pz/d,px/w),outX=Math.cos(angle),outZ=Math.sin(angle),radius=.65+r(2)*1.45;
  const top=y-.45-r(3)*2.4,height=9+r(4)*15,cx=x+px+outX*extent*.44,cz=z+pz+outZ*extent*.44;
  const reach=radius*1.7;
  if(clearance.some(q=>cx+reach>q[0]&&cx-reach<q[1]&&cz+reach>q[2]&&cz-reach<q[3]))continue;
  const start=positions.length/3,sides=7,turn=r(5)*6.28;
  const rings=[[0,.8],[.38,1.2],[.85,.95],[1,.65]];
  for(const [v,s]of rings)for(let k=0;k<sides;k++){
   const a=turn+k/sides*Math.PI*2,irregular=.84+hash2(i,k,seed+9)*.3,lean=(1-v)*radius*.4;
   positions.push(cx+Math.cos(a)*radius*s*irregular-outX*lean,top-height*(1-v),cz+Math.sin(a)*radius*s*irregular-outZ*lean);
   color.copy(pale).lerp(deep,.1+(1-v)*.35);color.multiplyScalar(.78+r(6)*.2);colors.push(color.r,color.g,color.b);
  }
  for(let j=0;j<3;j++)for(let k=0;k<sides;k++){const a=start+j*sides+k,b=start+j*sides+(k+1)%sides,c=a+sides,e=b+sides;indices.push(a,c,b,b,c,e);}
  const cap=positions.length/3;positions.push(cx,top+.06,cz);color.copy(pale).multiplyScalar(.94);colors.push(color.r,color.g,color.b);
  for(let k=0;k<sides;k++)indices.push(cap,start+3*sides+(k+1)%sides,start+3*sides+k);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();
 return g;
}
