import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../three.module.min.js';
import {resourcesOf,releaseRegion} from '../world/resources.js';
const count=resource=>{let n=0;resource.addEventListener('dispose',()=>n++);return()=>n;};
const mesh=(geometry=new T.BoxGeometry(),material=new T.MeshStandardMaterial())=>new T.Mesh(geometry,material);

test('eviction releases owned geometry, cloned material and label texture, but keeps shared stone maps',()=>{
 const scene=new T.Scene(),temple=new T.Group(),region=new T.Group();scene.add(temple,region);
 const shared=new T.Texture(),source=new T.MeshStandardMaterial({map:shared}),copy=source.clone();
 temple.add(mesh(undefined,source));const building=mesh(undefined,copy);region.add(building);
 const texture=new T.Texture(),label=new T.Sprite(new T.SpriteMaterial({map:texture}));region.add(label);
 const counts=[building.geometry,copy,texture,label.material,shared,source].map(count);
 releaseRegion(region,{retained:()=>resourcesOf(scene)});
 assert.deepEqual(counts.map(f=>f()),[1,1,1,1,0,0]);assert.equal(region.parent,null);assert.equal(region.children.length,0);
});
test('another cached region can retain shared resources until its own final eviction',()=>{
 const scene=new T.Scene(),a=new T.Group(),b=new T.Group();scene.add(a,b);
 const geo=new T.BoxGeometry(),mat=new T.MeshStandardMaterial({map:new T.Texture()});a.add(mesh(geo,mat));b.add(mesh(geo,mat));
 const counts=[geo,mat,mat.map].map(count),retained=()=>resourcesOf(scene);
 releaseRegion(a,{retained});assert.deepEqual(counts.map(f=>f()),[0,0,0]);
 releaseRegion(b,{retained});assert.deepEqual(counts.map(f=>f()),[1,1,1]);
});
test('late-loaded maps and global figure resources are protected by the live scan',()=>{
 const scene=new T.Scene(),region=new T.Group();scene.add(region);
 const base=new T.MeshStandardMaterial(),copy=base.clone(),late=new T.Texture(),geo=new T.BoxGeometry();
 region.add(mesh(geo,copy));base.map=copy.map=late;
 const counts=[copy,late,geo].map(count);
 releaseRegion(region,{retained:()=>resourcesOf(scene,[base,geo])});
 assert.deepEqual(counts.map(f=>f()),[1,0,0]);
});
test('shader uniforms, invisible objects, skeleton bone textures and shadow targets are released',()=>{
 const region=new T.Group(),tex=new T.Texture(),shader=new T.ShaderMaterial({uniforms:{layers:{value:[{map:tex}]}}});
 const m=mesh(undefined,shader);m.visible=false;region.add(m);
 const skeleton=new T.Skeleton([new T.Bone()]);skeleton.computeBoneTexture();m.skeleton=skeleton;
 const lamp=new T.PointLight();lamp.shadow.map=new T.WebGLRenderTarget(16,16);region.add(lamp);
 const counts=[tex,shader,skeleton.boneTexture,lamp.shadow.map].map(count);
 releaseRegion(region,{retained:()=>new Set()});assert.deepEqual(counts.map(f=>f()),[1,1,1,1]);assert.equal(skeleton.boneTexture,null);
});
test('failed construction also releases unmerged builder resources once',()=>{
 const root=new T.Group(),geo=new T.BoxGeometry(),mat=new T.MeshStandardMaterial({map:new T.Texture()});
 const counts=[geo,mat,mat.map].map(count);
 releaseRegion(root,{retained:()=>new Set(),extra:[geo,geo,mat]});assert.deepEqual(counts.map(f=>f()),[1,1,1]);
});
test('eviction releases instance buffers even when another region keeps their geometry and material',()=>{
 const scene=new T.Scene(),a=new T.Group(),b=new T.Group();scene.add(a,b);
 const geo=new T.PlaneGeometry(),mat=new T.MeshStandardMaterial(),one=new T.InstancedMesh(geo,mat,3),two=new T.InstancedMesh(geo,mat,4);a.add(one);b.add(two);
 const counts=[one,two,geo,mat].map(count),retained=()=>resourcesOf(scene);
 releaseRegion(a,{retained});assert.deepEqual(counts.map(f=>f()),[1,0,0,0]);
 releaseRegion(b,{retained});assert.deepEqual(counts.map(f=>f()),[1,1,1,1]);
});
