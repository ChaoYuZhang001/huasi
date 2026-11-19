import {hash2} from './landscape-field.js';
import {pineNeedleTexture} from './pine-needles.js';

const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
export function stemPoint(stem,t){
 if(stem.kind==='trunk'){
  const u=Math.max(0,(t-.3)/.7),arc=Math.sin(t*Math.PI);
  return[stem.bend*u*u+(stem.sweepX||0)*arc,stem.height*t,stem.lean*u*u+(stem.sweepZ||0)*arc];
 }
 const [a,b,c]=stem.points;return a.map((v,i)=>(1-t)*(1-t)*v+2*(1-t)*t*b[i]+t*t*c[i]);
}

// A deterministic, connected branch skeleton. Every needle cluster is attached
// to a twig end; the leader also carries foliage instead of ending as a bare pole.
export function pineShape(height,seed,mature=false){
 const r=k=>hash2(seed,k,8127),stems=[],tufts=[],bend=(r(1)-.5)*height*.16,lean=(r(2)-.5)*height*.13;
 const rootRadius=height*(mature ? .062 : .024);
 const leader={kind:'trunk',height,bend,lean,radius:rootRadius,end:.018,segments:16,sides:mature?13:9};
 if(mature){
  leader.sweepX=height*.19*Math.cos(seed);leader.sweepZ=height*.19*Math.sin(seed);
  leader.bend*=3;leader.lean*=3;
 }
 const trunk=t=>stemPoint(leader,t);
 stems.push(leader);
 const tuft=(p,size,k)=>tufts.push({p,scale:[size,size*(.63+r(k)*.22),size*(.82+r(k+1)*.25)],turn:r(k+2)*Math.PI*2,tilt:(r(k+3)-.5)*.7,tint:.86+r(k+4)*.24});
 for(let i=0;i<12;i++){
  const k=30+i*20,t=.36+i/11*.51,theta=i*2.399+r(3)*6.28+(r(k)-.5)*.35,dir=[Math.cos(theta),0,Math.sin(theta)];
  const length=height*(.38-.22*t)*(.8+r(k+1)*.35)*(mature?1.68:1),rise=height*(.026+r(k+2)*.032),base=trunk(t);
  const mid=plus(base,[dir[0]*length*.52,-height*.021,dir[2]*length*.52]),tip=plus(base,[dir[0]*length,rise,dir[2]*length]);
  const mainIndex=stems.length,main={points:[base,mid,tip],parent:0,at:t,radius:rootRadius*(1-t)*.61,end:.014,segments:7,sides:6};stems.push(main);
  for(let j=0;j<3;j++){
   const u=.42+j*.23,start=stemPoint(main,u),side=j===1?-1:1,angle=theta+side*(.35+r(k+3+j)*.45),length2=height*(.055+r(k+6+j)*.045);
   const end=plus(start,[Math.cos(angle)*length2,.17+height*.018,Math.sin(angle)*length2]);
   stems.push({points:[start,lerp(start,end,.5),end],parent:mainIndex,at:u,radius:.028*(height/8),end:.008,segments:4,sides:5});
   const size=height*(.105+r(k+10+j)*.035)*(mature?1.28:1);
   tuft(end,size,k+12+j);
   tuft(lerp(start,end,.64),size*.82,k+15+j);
  }
  tuft(tip,height*(.10+r(k+18)*.03),k+17);
 }
 for(let i=0;i<4;i++)tuft(trunk(.88+i*.04),height*(.115-i*.014),310+i*6);
 if(mature)for(let i=0;i<7;i++){
  const angle=i*2.399+r(410+i)*.5,length=height*(.12+r(420+i)*.17),base=trunk(.055);
  const end=[Math.cos(angle)*length,-.08,Math.sin(angle)*length];
  stems.push({parent:0,at:.055,points:[base,[end[0]*.47,.23,end[2]*.55],end],radius:rootRadius*.62,end:.04,segments:7,sides:7});
 }
 return{stems,tufts,baseRadius:rootRadius};
}

function branchGeometry(T,stem,scale){
 const curve=new class extends T.Curve{getPoint(t,target=new T.Vector3()){return target.fromArray(stemPoint(stem,t));}};
 const g=new T.TubeGeometry(curve,stem.segments,stem.radius,stem.sides,false),p=g.attributes.position,uv=g.attributes.uv,L=curve.getLength();
 for(let j=0;j<=stem.segments;j++){
  const t=j/stem.segments,center=curve.getPointAt(t),radius=stem.end+(stem.radius-stem.end)*(1-t)**1.18;
  for(let k=0;k<=stem.sides;k++){const i=j*(stem.sides+1)+k;p.setXYZ(i,center.x+(p.getX(i)-center.x)*radius/stem.radius,center.y+(p.getY(i)-center.y)*radius/stem.radius,center.z+(p.getZ(i)-center.z)*radius/stem.radius);uv.setXY(i,k/stem.sides*stem.radius*6.28/scale,t*L/scale);}
 }
 g.computeVertexNormals();return g;
}
function mergeBranches(T,list){
 const p=[],n=[],uv=[],indices=[];let offset=0;
 for(const g of list){p.push(...g.attributes.position.array);n.push(...g.attributes.normal.array);uv.push(...g.attributes.uv.array);for(const v of g.index.array)indices.push(v+offset);offset+=g.attributes.position.count;g.dispose();}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeBoundingSphere();return g;
}

// Three curved, intersecting sprays retain volume from below and from the side.
// A fine needle texture supplies the silhouette, including internal gaps.
function needleGeometry(T){
 const p=[],n=[],uv=[],indices=[];
 for(let plane=0;plane<3;plane++){
  const turn=plane*Math.PI/3,tilt=plane===0?.25:plane===1?1.0:-1.0;
  const rotation=new T.Quaternion().setFromEuler(new T.Euler(tilt,turn,0)),normal=new T.Vector3(),vertex=new T.Vector3(),offset=p.length/3;
  for(let y=0;y<3;y++)for(let x=0;x<3;x++){
   const u=x/2,v=y/2,xx=u-.5,zz=v-.5,yy=.12-.26*(xx*xx+zz*zz);
   vertex.set(xx,yy,zz).applyQuaternion(rotation);p.push(...vertex.toArray());
   normal.set(vertex.x,vertex.y*1.6,vertex.z).normalize();n.push(...normal.toArray());uv.push(u,v);
  }
  for(let y=0;y<2;y++)for(let x=0;x<2;x++){const a=offset+y*3+x;indices.push(a,a+3,a+1,a+1,a+3,a+4);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeBoundingSphere();return g;
}

export function buildPines(T,root,M,placements,{mature=false}={}){
 const group=new T.Group();group.name='huashan:close-pines';root.add(group);
 const bark=M.bark.clone();bark.color.setHex(0xb1aa95);
 const map=pineNeedleTexture(T);
 const foliage=new T.MeshLambertMaterial({map,color:0xb4bc9a,alphaTest:.35,alphaToCoverage:true,side:T.DoubleSide});
 const depth=new T.MeshDepthMaterial({map,alphaTest:.35,side:T.DoubleSide,depthPacking:T.RGBADepthPacking});
 const wind={value:0};
 function windShader(material,shadow=false){
  material.uniforms={pineWind:wind};
  material.onBeforeCompile=shader=>{
   shader.uniforms.pineWind=wind;
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float pineWind;').replace('#include <begin_vertex>',`#include <begin_vertex>
    vec4 pineWorld=vec4(transformed,1.0);
    #ifdef USE_INSTANCING
     pineWorld=instanceMatrix*pineWorld;
    #endif
    pineWorld=modelMatrix*pineWorld;
    float pineSway=sin(pineWind*.85+pineWorld.x*.43+pineWorld.z*.37)+sin(pineWind*1.7+pineWorld.z*.82)*.22;
    transformed.x+=pineSway*.035*(.5+uv.y);transformed.z+=pineSway*.023*(.5+uv.y);`);
   if(!shadow)shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb*.22;');
  };
  material.customProgramCacheKey=()=>shadow?'sansi-pine-depth-v1':'sansi-pine-foliage-v1';
 }
 windShader(foliage);windShader(depth,true);
 const needle=needleGeometry(T),matrix=new T.Matrix4(),rotation=new T.Quaternion(),scale=new T.Vector3(),position=new T.Vector3(),tint=new T.Color();
 for(const [x,y,z,h]of placements){
  const seed=Math.round(x*31+z*17+h*13),shape=pineShape(h,seed,mature),tree=new T.Group();tree.position.set(x,y,z);tree.name='pine:'+seed;
  const wood=new T.Mesh(mergeBranches(T,shape.stems.map(s=>branchGeometry(T,s,M.bark.userData.s||1.2))),bark);wood.name='pine:wood';wood.castShadow=wood.receiveShadow=true;tree.add(wood);
  const leaves=new T.InstancedMesh(needle,foliage,shape.tufts.length);leaves.name='pine:needles';leaves.castShadow=leaves.receiveShadow=true;leaves.customDepthMaterial=depth;
  for(let i=0;i<shape.tufts.length;i++){const t=shape.tufts[i];position.fromArray(t.p);rotation.setFromEuler(new T.Euler(t.tilt,t.turn,0));scale.fromArray(t.scale);matrix.compose(position,rotation,scale);leaves.setMatrixAt(i,matrix);tint.setScalar(t.tint);leaves.setColorAt(i,tint);}
  leaves.computeBoundingSphere();leaves.boundingSphere.radius+=.15;tree.add(leaves);group.add(tree);
 }
 group.userData.trees=placements.length;
 return{group,update(dt){wind.value+=Math.min(.1,Math.max(0,dt||0));let changed=false;for(const key of ['map','normalMap','roughnessMap'])if(bark[key]!==M.bark[key]){bark[key]=M.bark[key];changed=true;}if(changed){bark.normalScale.copy(M.bark.normalScale);bark.needsUpdate=true;}}};
}
