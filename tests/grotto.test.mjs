import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../three.module.min.js';
import {grottoGeometry} from '../world/grotto.js';

test('the grotto opening remains clear for a standing visitor',()=>{
 const gs=grottoGeometry(T),material=new T.MeshBasicMaterial(),objects=Object.values(gs).map(g=>new T.Mesh(g,material));
 for(const x of[-34,-32,-30])for(const y of[5.8,6.6,7.1]){
  const ray=new T.Raycaster(new T.Vector3(x,y,-5),new T.Vector3(0,0,-1),0,8);
  assert.equal(ray.intersectObjects(objects).length,0,`blocked entrance at ${x},${y}`);
 }
 for(const g of Object.values(gs))g.dispose();material.dispose();
});
test('the front, roof and interior walls face the viewer rather than being culled',()=>{
 const gs=grottoGeometry(T),material=new T.MeshBasicMaterial(),objects=Object.values(gs).map(g=>new T.Mesh(g,material));
 for(const [from,to]of[[[-38,7,-5],[-38,7,-12]],[[-32,7,-17],[-32,15,-17]],[[-32,7,-17],[-43,7,-17]],[[-32,7,-17],[-21,7,-17]],[[-32,7,-17],[-32,7,-26]]]){
  const p=new T.Vector3(...from),q=new T.Vector3(...to),ray=new T.Raycaster(p,q.clone().sub(p).normalize(),0,p.distanceTo(q));
  assert(ray.intersectObjects(objects).length>0,`missing rock surface toward ${to}`);
 }
 for(const g of Object.values(gs))g.dispose();material.dispose();
});
