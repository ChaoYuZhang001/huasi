import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../three.module.min.js';
import {pineShape,stemPoint,buildPines} from '../world/pine.js';
import {resourcesOf,releaseRegion} from '../world/resources.js';
import {needleMipmaps} from '../world/pine-needles.js';

test('fine needle mipmaps retain sparse coverage without opaque square borders',()=>{
 const mips=needleMipmaps(),coverage=m=>{let n=0;for(let i=3;i<m.data.length;i+=4)if(m.data[i]>=.35*255)n++;return n/(m.width*m.height);},base=coverage(mips[0]);
 assert(base>.12&&base<.28);assert.equal(mips.length,10);
 for(const m of mips){assert.equal(m.data.length,m.width*m.height*4);if(m.width>=8){assert(Math.abs(coverage(m)-base)<.015);assert.equal(m.data[3],0);assert.equal(m.data[m.data.length-1],0);}}
 assert.deepEqual(needleMipmaps()[0].data,mips[0].data);
});

test('pine branches meet their parent curves and rebuild deterministically',()=>{
 for(const height of [6,8,10])for(const seed of [-789,1,1246]){
  const shape=pineShape(height,seed);assert.deepEqual(shape,pineShape(height,seed));
  for(let i=1;i<shape.stems.length;i++){const stem=shape.stems[i];assert(stem.parent<i);const parent=stemPoint(shape.stems[stem.parent],stem.at);assert(Math.hypot(...stem.points[0].map((v,k)=>v-parent[k]))<1e-10);}
  for(const tuft of shape.tufts){assert(tuft.p.every(Number.isFinite));assert(tuft.p[1]>height*.34);assert(tuft.p[1]<=height*1.1);assert(tuft.scale.every(v=>v>0));}
  // The lower trunk fits the existing 0.55m-wide collision envelope.
  for(let i=0;i<=50;i++){const t=i/100,p=stemPoint(shape.stems[0],t),radius=.018+(shape.baseRadius-.018)*(1-t)**1.18;assert(Math.hypot(p[0],p[2])+radius<.275);}
 }
});
test('close pine meshes have finite normals, volumetric needles and paired wind/shadow uniforms',()=>{
 const M={bark:new T.MeshStandardMaterial(),pineC:{map:new T.Texture()}},root=new T.Group(),pines=buildPines(T,root,M,[[0,0,0,8]]),tree=pines.group.children[0],wood=tree.children[0],leaves=tree.children[1];
 const n=wood.geometry.attributes.normal;for(let i=0;i<n.count;i++)assert(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<1e-5);
 leaves.geometry.computeBoundingBox();const size=leaves.geometry.boundingBox.getSize(new T.Vector3());assert(size.x>.7&&size.y>.5&&size.z>.7);
 assert.equal(leaves.material.uniforms.pineWind,leaves.customDepthMaterial.uniforms.pineWind);pines.update(.05);assert.equal(leaves.material.uniforms.pineWind.value,.05);pines.update(200);assert(Math.abs(leaves.material.uniforms.pineWind.value-.15)<1e-8);
 releaseRegion(root,{retained:()=>new Set([M.pineC.map])});M.bark.dispose();M.pineC.map.dispose();
});
test('pine eviction disposes shadow material and instance buffers while keeping source scans',()=>{
 const scene=new T.Scene(),root=new T.Group(),source=new T.MeshStandardMaterial({map:new T.Texture(),normalMap:new T.Texture()}),needle=new T.Texture();source.userData.s=1.2;scene.add(root);
 const sourceMesh=new T.Mesh(new T.BoxGeometry(),source),needleMesh=new T.Mesh(new T.PlaneGeometry(),new T.MeshStandardMaterial({map:needle}));scene.add(sourceMesh,needleMesh);
 const kit=buildPines(T,root,{bark:source,pineC:{map:needle}},[[0,0,0,7],[10,0,0,9]]),owned=[...resourcesOf(root)],counts=new Map(owned.map(r=>[r,0]));for(const r of owned)r.addEventListener('dispose',()=>counts.set(r,counts.get(r)+1));
 const leaves=kit.group.children[0].children[1];assert(owned.includes(leaves.customDepthMaterial));
 releaseRegion(root,{retained:()=>resourcesOf(scene)});
 for(const [resource,count]of counts)assert.equal(count,[source.map,source.normalMap,needle].includes(resource)?0:1);
 source.map.dispose();source.normalMap.dispose();needle.dispose();source.dispose();sourceMesh.geometry.dispose();needleMesh.geometry.dispose();needleMesh.material.dispose();
});
