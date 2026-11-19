import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../three.module.min.js';
import {createFigureMotion,footCycle,visitorFootCycle} from '../characters/motion.js';
globalThis.__SHANSI_THREE=T;
const {mergeGeometries}=await import('../vendor/BufferGeometryUtils.js');
const motion=createFigureMotion(T,{merge:mergeGeometries,floor:()=>0});
function figure(player){
 const g=new T.Group(),upper=new T.Group(),head=new T.Group(),feet=new T.Group(),mat=new T.MeshStandardMaterial({vertexColors:true});
 const piece=()=>new T.Mesh(new T.BoxGeometry(.1,.1,.1),mat),limb=()=>{const a=new T.Group();a.add(piece());return a;};
 const armL=limb(),armR=limb(),elbL=limb(),elbR=limb();armL.add(elbL);armR.add(elbR);head.add(piece());upper.add(piece(),head,armL,armR);feet.add(piece(),piece());
 const skirt=new T.Mesh(new T.LatheGeometry([new T.Vector2(.24,.02),new T.Vector2(.22,.45),new T.Vector2(.178,1)],20),mat);g.add(upper,skirt,feet);
 const f={player,g,upper,head,feet,skirt,armL,armR,elbL,elbR,sit:0,bow:0,palms:0,swing:0,bob:0,moving:false};return motion.attach(f,0x6a4a5c);
}
test('two-bone solver keeps bone lengths and finite values at reachable and unreachable targets',()=>{
 for(const target of [[0,.08,0],[.1,.12,.4],[-.15,.08,.3],[0,-2,0],[0,.9,0]]){
  const hip=new T.Vector3(.1,.9,0),r=motion.solve(hip,new T.Vector3(...target),new T.Vector3(0,0,1));
  assert(Math.abs(r.knee.distanceTo(hip)-.42)<1e-8);assert(Math.abs(r.end.distanceTo(r.knee)-.41)<1e-8);
  assert(r.end.toArray().every(Number.isFinite));
 }
});
test('step stays on the ground in stance and has continuous lift at phase boundaries',()=>{
 for(const u of [0,.2,.519])assert.equal(footCycle(u*Math.PI*2,1.4).lift,0);
 for(const u of [.52,1]){const a=footCycle((u-1e-6)*Math.PI*2,1.4),b=footCycle((u+1e-6)*Math.PI*2,1.4);assert(Math.abs(a.z-b.z)<1e-5);assert(Math.abs(a.lift-b.lift)<1e-5);assert(Math.abs(a.pitch-b.pitch)<1e-5);}
 assert(footCycle(.76*Math.PI*2,1.4).lift>.1);
});
for(const speed of [1.15,3.1])test(`planted feet hold their world position at ${speed} m/s`,()=>{
 const f=figure(),prior=new Map();motion.step(f,1/60);let maxSlip=0,checked=0;
 for(let j=0;j<240;j++){f.g.position.z+=speed/60;f.moving=true;motion.step(f,1/60);motion.pose(f);f.g.updateMatrixWorld(true);
  for(const l of f.motion.legs){if(!l.anchor||f.motion.blend<.99)continue;const world=l.foot.getWorldPosition(new T.Vector3()),p=prior.get(l.anchor);
   if(p){maxSlip=Math.max(maxSlip,Math.hypot(world.x-p.x,world.z-p.z));checked++;}else prior.set(l.anchor,world.clone());}
 }
 assert(checked>100);assert(maxSlip<.012,`stance drift ${maxSlip}`);motion.dispose(f);
});
test('sitting spreads the lap without moving the waist seam or generating invalid normals',()=>{
 const f=figure();motion.step(f,1/60);f.sit=1;motion.pose(f);assert.equal(f.skirt.morphTargetInfluences[0],1);
 assert.equal(f.skirt.scale.y,1);assert(Math.abs(f.upper.position.y-.5)<1e-6);assert.equal(f.motion.mesh.skeleton.bones.length,7);
 const g=f.skirt.geometry,p=g.attributes.position,m=g.morphAttributes.position[0];
 let maxWidth=0;for(let i=0;i<p.count;i++){maxWidth=Math.max(maxWidth,Math.abs(p.getX(i)+m.getX(i)));if(p.getY(i)>.99)assert(Math.abs(p.getY(i)+m.getY(i)-.5)<1e-6);}
 assert(maxWidth>.24&&maxWidth<.65);for(const a of g.morphAttributes.normal)assert([...a.array].every(Number.isFinite));motion.dispose(f);
});
test('teleporting resets anchors instead of producing a high-speed stride',()=>{
 const f=figure();motion.step(f,1/60);f.moving=true;f.g.position.z=50;motion.step(f,1/60);motion.pose(f);
 assert.equal(f.motion.speed,0);assert.equal(f.motion.blend,0);assert(f.motion.legs.every(l=>!l.anchor));motion.dispose(f);
});
test('cloth weights stay normalized through stopping and lowering into a seat',()=>{
 const f=figure();motion.step(f,1/60);
 for(let i=0;i<=100;i++){f.sit=i/100;f.motion.blend=1;f.motion.phase=i*.11;motion.pose(f);
  const w=f.skirt.morphTargetInfluences;assert(w.every(v=>v>=0&&v<=1));assert(w.reduce((a,b)=>a+b,0)<=1+1e-8);
 }
 motion.dispose(f);
});
test('replacing a figure releases its own geometry and skeleton without disposing shared materials',()=>{
 const f=figure(),geometries=[f.motion.mesh.geometry,...f.motion.owned];let released=0,materials=0;
 for(const g of geometries)g.addEventListener('dispose',()=>released++);
 f.skirt.material.addEventListener('dispose',()=>materials++);
 f.motion.mesh.skeleton.computeBoneTexture();const texture=f.motion.mesh.skeleton.boneTexture;let textureReleased=0;texture.addEventListener('dispose',()=>textureReleased++);
 motion.dispose(f);motion.dispose(f);
 assert.equal(released,geometries.length);assert.equal(textureReleased,1);assert.equal(materials,0);
});

test('bench rest keeps uncrossed feet on the floor and cloth clear of the seat',()=>{
 const f=figure();motion.step(f,1/60);f.sit=1;f.bench=1;motion.pose(f);f.g.updateMatrixWorld(true);
 for(const l of f.motion.legs){
  assert(Math.abs(l.foot.position.y-.075)<1e-8);
  assert.equal(Math.sign(l.foot.position.x),l.side);
  assert(l.foot.position.z>.4);assert(Math.abs(l.foot.rotation.y)<1e-8);
  const hip=l.hip.getWorldPosition(new T.Vector3()),knee=l.shin.getWorldPosition(new T.Vector3()),ankle=l.ankle.getWorldPosition(new T.Vector3());
  assert(Math.abs(hip.y-.58)<1e-8);assert(Math.abs(hip.distanceTo(knee)-.42)<1e-8);assert(Math.abs(knee.distanceTo(ankle)-.41)<1e-8);
 }
 const g=f.skirt.geometry,p=g.attributes.position,m=g.morphAttributes.position[15];let draped=0;
 for(let i=0;i<p.count;i++){
  const y=p.getY(i)+m.getY(i),z=p.getZ(i)+m.getZ(i);
  if(y<.5){assert(z>.28,`cloth behind bench edge at ${y}, ${z}`);draped++;}
  if(p.getY(i)>.99)assert(Math.abs(y-f.upper.position.y)<1e-6);
 }
 assert(draped>0);assert(f.elbL.rotation.x<-.3&&f.elbR.rotation.x<-.3);motion.dispose(f);
});
test('bench morphs stay finite and normalized while sitting down and rising',()=>{
 const f=figure();motion.step(f,1/60);f.bench=1;
 for(let i=0;i<=100;i++){f.sit=i/100;f.motion.blend=1;motion.pose(f);const w=f.skirt.morphTargetInfluences;
  assert(w.every(v=>Number.isFinite(v)&&v>=0&&v<=1));assert(w.reduce((a,b)=>a+b,0)<=1+1e-8);
  for(const l of f.motion.legs)assert(l.foot.position.toArray().every(Number.isFinite));
 }
 for(const a of f.skirt.geometry.morphAttributes.normal)assert([...a.array].every(Number.isFinite));motion.dispose(f);
});

test('visitor walk rolls from heel to flat sole to toe before lifting',()=>{
 const cycle=u=>visitorFootCycle(u*2*Math.PI,1.18);
 assert(cycle(0).pitch<0 && cycle(0).stance);
 assert.equal(cycle(.23).pitch,0);
 assert(cycle(.55).pitch>.3 && cycle(.55).stance);
 assert(cycle(.77).lift>.065 && !cycle(.77).stance);
 for(const u of [0,.58,1]){
  const a=cycle(u-.000001),b=cycle(u+.000001);
  for(const k of ['z','lift','pitch'])assert(Math.abs(a[k]-b[k])<.00001);
 }
});

test('both visitors transfer weight over the supporting shoe and keep the sole planted',()=>{
 for(const player of ['m','f']){
  const f=figure(player),checks={left:0,right:0,toe:0},point=new T.Vector3();
  let slip=0,heightError=0;
  motion.step(f,1/60);
  for(let i=0;i<165;i++){
   f.g.position.z+=1.45/60;f.moving=true;motion.step(f,1/60);motion.pose(f);f.g.updateMatrixWorld(true);
   if(f.motion.blend<.99)continue;
   for(const [j,leg] of f.motion.legs.entries()){
    const phase=(f.motion.phase/(2*Math.PI)+j*.5)%1;
    if(phase<.19||phase>.55||!leg.anchor)continue;
    const toe=phase>.38,offset=toe?.142:0;
    leg.foot.localToWorld(point.set(0,-.035,offset));
    slip=Math.max(slip,Math.abs(point.z-leg.anchor.z-offset));
    heightError=Math.max(heightError,Math.abs(point.y));
    if(toe)checks.toe++;
    if(phase>.20&&phase<.29){
     assert.equal(Math.sign(f.upper.position.x),leg.side);
     checks[j?'right':'left']++;
    }
   }
  }
  assert(Object.values(checks).every(count=>count>6));
  assert(slip<.014,`foot slip ${slip}`);
  assert(heightError<.014,`sole height ${heightError}`);
  motion.dispose(f);
 }
});
