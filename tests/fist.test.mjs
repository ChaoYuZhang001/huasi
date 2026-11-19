import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../three.module.min.js';
import {fistPose,practiceFists,releaseFists} from '../world/fist.js';
function figure(){const g=new T.Group(),upper=new T.Group(),armR=new T.Group(),armL=new T.Group(),elbR=new T.Group(),elbL=new T.Group(),head=new T.Group();g.add(upper);upper.position.y=.95;upper.add(armR,armL,head);armR.position.set(.195,.5,0);armL.position.set(-.195,.5,0);armR.add(elbR);armL.add(elbL);elbR.position.y=elbL.position.y=-.26;
 const f={g,upper,armR,armL,elbR,elbL,head,practiceFists:practiceFists(T)};elbL.add(f.practiceFists[0]);elbR.add(f.practiceFists[1]);return f;}
test('both wrapped fists stay on the hands with finite poses and continuous phase boundaries',()=>{
 const f=figure(),anchor=new T.Vector3(0,-.34,.008);for(let phase=0;phase<3;phase++)for(let i=0;i<=100;i++){fistPose(f,phase,i/100);f.g.updateMatrixWorld(true);for(const [n,elbow]of[[0,f.elbL],[1,f.elbR]]){const p=f.practiceFists[n].getWorldPosition(new T.Vector3()),hand=elbow.localToWorld(anchor.clone());assert(p.toArray().every(Number.isFinite));assert(p.distanceTo(hand)<1e-8);assert(p.y>.6&&p.y<1.7);}}
 for(let phase=0;phase<3;phase++){fistPose(f,phase,1);f.g.updateMatrixWorld(true);const a=f.practiceFists.map(g=>g.matrixWorld.clone());fistPose(f,(phase+1)%3,0);f.g.updateMatrixWorld(true);for(let i=0;i<2;i++)assert(a[i].elements.every((v,k)=>Math.abs(v-f.practiceFists[i].matrixWorld.elements[k])<1e-8));}releaseFists(f);
});
test('the forward fist extends while the other hand remains in guard',()=>{
 const f=figure();fistPose(f,0,1);f.g.updateMatrixWorld(true);const start=f.practiceFists[1].getWorldPosition(new T.Vector3());fistPose(f,1,1);f.g.updateMatrixWorld(true);const right=f.practiceFists[1].getWorldPosition(new T.Vector3()),left=f.practiceFists[0].getWorldPosition(new T.Vector3());assert(right.z>start.z+.12);assert(right.z>left.z+.12);assert(Math.abs(right.y-left.y)<.2);releaseFists(f);
});
test('replacing a figure releases shared two-hand resources once and detaches both wraps',()=>{
 const f=figure(),resources=new Set();for(const g of f.practiceFists)g.traverse(o=>{if(o.geometry)resources.add(o.geometry);if(o.material)resources.add(o.material);});let n=0;for(const r of resources)r.addEventListener('dispose',()=>n++);releaseFists(f);releaseFists(f);assert.equal(n,resources.size);assert.equal(f.practiceFists,null);assert.equal(f.elbL.children.length+f.elbR.children.length,0);
});
