import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from '../three.module.min.js';
import {trimSlabFaces,trimTempleFaces} from '../world/slab-faces.js';

test('overlapping slab tops have one owner, continuous UVs and intact sides',()=>{
 const stone=new THREE.MeshBasicMaterial(),wood=new THREE.MeshBasicMaterial();
 stone.userData.s=2;
 function box(width,depth,x,z,order){
  const geometry=new THREE.BoxGeometry(width,1,depth);
  geometry.translate(x,-.5,z);geometry.userData.slabOrder=order;return geometry;
 }
 const base=box(12,8,0,0,0),overlap=box(3,12,0,1,1),patch=box(3,3,1,1,2);
 const buckets=new Map([[wood,[overlap]],[stone,[base,patch]]]);
 trimSlabFaces(THREE,buckets);
 const meshes=[...buckets].flatMap(([m,gs])=>gs.map(g=>new THREE.Mesh(g,m)));
 const down=new THREE.Vector3(0,-1,0);
 for(const [x,z,expected] of [[-3.3,1,stone],[-.8,1,wood],[.6,1,stone],[.75,5.2,wood]]){
  const hits=new THREE.Raycaster(new THREE.Vector3(x,1,z),down,0,2).intersectObjects(meshes);
  assert.equal(hits.length,1);assert.equal(hits[0].object.material,expected);
  if(x===-3.3){
   assert.ok(Math.abs(hits[0].uv.x-(x+6)/2)<1e-5);
   assert.ok(Math.abs(hits[0].uv.y-(4-z)/2)<1e-5);
  }
 }
 const side=new THREE.Raycaster(new THREE.Vector3(-7,-.4,1),new THREE.Vector3(1,0,0),0,1.5);
 assert.equal(side.intersectObjects(meshes).length,1);
});

test('temple trim leaves one textured face on all six sides of intersecting timbers',()=>{
 const old=new THREE.MeshBasicMaterial(),trim=new THREE.MeshBasicMaterial();
 for(let axis=0;axis<3;axis++){
  const depth=[6,6,6],width=[2,2,2];width[axis]=depth[axis];
  const outer=new THREE.BoxGeometry(...depth),inner=new THREE.BoxGeometry(...width);
  outer.userData.boxOrder=1;inner.userData.boxOrder=2;
  const unchanged=new THREE.Mesh(outer.clone(),old);
  const batch=new Map([[trim,[inner]],[old,[outer]]]);trimTempleFaces(THREE,batch);
  const meshes=[...batch].flatMap(([m,gs])=>gs.map(g=>new THREE.Mesh(g,m)));
  for(const sign of [-1,1])for(const offset of [.43,1.72]){
   const origin=new THREE.Vector3(.12,.12,.12),dir=new THREE.Vector3();
   origin.setComponent(axis,sign*4);origin.setComponent((axis+1)%3,offset);
   dir.setComponent(axis,-sign);
   const ray=new THREE.Raycaster(origin,dir,0,1.1),hits=ray.intersectObjects(meshes);
   assert.equal(hits.length,1);assert.equal(hits[0].object.material,offset<1?trim:old);
   if(offset>1)assert.ok(hits[0].uv.distanceTo(ray.intersectObject(unchanged)[0].uv)<1e-6);
  }
 }
});
