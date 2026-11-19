import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../three.module.min.js';
import {cliffGeometry,graniteMaterial} from '../world/granite.js';
import {mountainField} from '../world/landscape-field.js';
import {resourcesOf,releaseRegion} from '../world/resources.js';

test('cliff tops meet the foundation without protruding into the occupied deck',()=>{
 for(const [x,z,w,d,y]of[[0,47.5,12,19,0],[-4,8,56,30,4.8],[33.5,-25,13,8,10.8],[-3,-31.5,28,21,10.8],[-8.5,-57.5,23,9,14.4]]){
  const g=cliffGeometry(T,{x,z,w,d,y}),p=g.attributes.position,n=g.attributes.normal;
  for(let i=0;i<p.count;i++){assert(p.getY(i)<=y-.28+1e-5);assert(p.getY(i)>=-42-1e-5);assert([p.getX(i),p.getY(i),p.getZ(i),n.getX(i),n.getY(i),n.getZ(i)].every(Number.isFinite));assert(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))>.99);}
  g.dispose();
 }
});
test('granite picks up late scan loading while eviction preserves the shared scan',()=>{
 const first=new T.Texture(),late=new T.Texture(),source=new T.MeshStandardMaterial({map:first}),kit=graniteMaterial(T,source);
 const scene=new T.Scene(),temple=new T.Mesh(new T.BoxGeometry(),source),root=new T.Group();scene.add(temple,root);root.add(new T.Mesh(cliffGeometry(T,{x:0,z:0,w:12,d:9,y:0}),kit.material));
 source.map=late;kit.sync();assert.equal(kit.material.uniforms.graniteGrain.value,late);assert(resourcesOf(root).has(late));assert(!resourcesOf(root).has(first));
 let materialDisposals=0,textureDisposals=0;kit.material.addEventListener('dispose',()=>materialDisposals++);late.addEventListener('dispose',()=>textureDisposals++);
 releaseRegion(root,{retained:()=>resourcesOf(scene)});assert.equal(materialDisposals,1);assert.equal(textureDisposals,0);assert.equal(source.map,late);
 first.dispose();late.dispose();source.dispose();temple.geometry.dispose();
});
test('Huashan pine roots lie on the actual finer terrain triangles',()=>{
 const f=mountainField('huashan'),trees=f.trees(),tiles=new Map(),material=new T.MeshBasicMaterial(),ray=new T.Raycaster();
 for(let i=0;i<trees.length;i+=Math.max(1,Math.floor(trees.length/25))){
  const t=trees[i],tx=Math.floor(t.x/160),tz=Math.floor(t.z/160),key=tx+','+tz;
  if(!tiles.has(key)){
   const g=new T.PlaneGeometry(160,160,160/f.profile.grid,160/f.profile.grid);g.rotateX(-Math.PI/2);g.translate((tx+.5)*160,0,(tz+.5)*160);
   const p=g.attributes.position;for(let j=0;j<p.count;j++)p.setY(j,f.height(p.getX(j),p.getZ(j)));const mesh=new T.Mesh(g,material);mesh.updateMatrixWorld();tiles.set(key,mesh);
  }
  ray.set(new T.Vector3(t.x,500,t.z),new T.Vector3(0,-1,0));const hit=ray.intersectObject(tiles.get(key))[0];assert(hit);assert(Math.abs(hit.point.y-t.y)<1e-4);
 }
 for(const mesh of tiles.values())mesh.geometry.dispose();material.dispose();
});
