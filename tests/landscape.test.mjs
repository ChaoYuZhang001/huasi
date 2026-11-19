import test from 'node:test';
import assert from 'node:assert/strict';
import {mountainField} from '../world/landscape-field.js';

for(const id of ['temple','emei','wudang','ming','huashan','kunlun','kongtong']){
 test(id+': decorative terrain stays under the occupied site',()=>{
  const f=mountainField(id),[bx,bz]=f.profile.bounds;
  for(let x=-bx;x<=bx;x+=2)for(let z=-bz;z<=bz;z+=2){assert.equal(f.height(x,z),f.profile.floor);assert(f.normal(x,z)[1]>.98);}
 });
 test(id+': hills and forest rebuild deterministically with finite unit normals',()=>{
  const a=mountainField(id),b=mountainField(id),trees=a.trees();assert.deepEqual(trees,b.trees());assert(trees.length>0&&trees.length<2500);
  let min=Infinity,max=-Infinity;
  for(let x=-640;x<=640;x+=16)for(let z=-640;z<=640;z+=16){const y=a.height(x,z),n=a.normal(x,z);assert(Number.isFinite(y));assert.equal(y,b.height(x,z));assert(Math.abs(Math.hypot(...n)-1)<1e-8);assert(n[1]>0);min=Math.min(min,y);max=Math.max(max,y);}
  assert(min>-100&&max<500);assert(max-min>120);
  for(const t of trees){assert(a.clearance(t.x,t.z)>=18);assert.equal(t.y,a.surfaceHeight(t.x,t.z));assert(t.size>0&&t.size<14);}
 });
 test(id+': tile boundaries sample continuous world heights and normals',()=>{
  const f=mountainField(id);
  for(let seam=-480;seam<=480;seam+=160)for(let z=-640;z<=640;z+=8){
   assert(Math.abs(f.height(seam-.0001,z)-f.height(seam+.0001,z))<.01);
   const a=f.normal(seam-.0001,z),b=f.normal(seam+.0001,z);assert(Math.hypot(...a.map((v,i)=>v-b[i]))<.001);
  }
 });
}
