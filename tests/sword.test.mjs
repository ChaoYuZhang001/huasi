import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../three.module.min.js';
import {practiceSword,swordPose,releaseSword} from '../world/sword.js';
function figure(){const g=new T.Group(),upper=new T.Group(),armR=new T.Group(),armL=new T.Group(),elbR=new T.Group(),elbL=new T.Group(),head=new T.Group();g.add(upper);upper.position.y=.95;upper.add(armR,armL,head);armR.position.set(.195,.5,0);armL.position.set(-.195,.5,0);armR.add(elbR);armL.add(elbL);elbR.position.y=elbL.position.y=-.26;const f={g,upper,armR,armL,elbR,elbL,head,practiceSword:practiceSword(T)};elbR.add(f.practiceSword);return f;}
test('wooden sword stays attached to the hand through all three movements',()=>{
 const f=figure(),anchor=new T.Vector3(0,-.335,.012);
 for(let phase=0;phase<3;phase++)for(let i=0;i<=100;i++){swordPose(f,phase,i/100);f.g.updateMatrixWorld(true);const pos=f.practiceSword.getWorldPosition(new T.Vector3()),hand=f.elbR.localToWorld(anchor.clone());assert(pos.toArray().every(Number.isFinite));assert(pos.distanceTo(hand)<1e-8);assert(pos.y>.3);}
 releaseSword(f);
});
test('thrust points forward and stays nearly level; phase endpoints connect',()=>{
 const f=figure();swordPose(f,1,.8);f.g.updateMatrixWorld(true);const direction=new T.Vector3(0,0,1).transformDirection(f.practiceSword.matrixWorld);assert(direction.z>.95);assert(Math.abs(direction.y)<.08);
 for(let phase=0;phase<3;phase++){swordPose(f,phase,1);f.g.updateMatrixWorld(true);const a=f.practiceSword.matrixWorld.clone();swordPose(f,(phase+1)%3,0);f.g.updateMatrixWorld(true);assert(a.elements.every((v,i)=>Math.abs(v-f.practiceSword.matrixWorld.elements[i])<1e-8));}
 releaseSword(f);
});
test('avatar or remote visitor removal disposes sword resources once',()=>{
 const f=figure(),resources=new Set();f.practiceSword.traverse(o=>{if(o.geometry)resources.add(o.geometry);if(o.material)resources.add(o.material);});let disposed=0;for(const r of resources)r.addEventListener('dispose',()=>disposed++);
 releaseSword(f);releaseSword(f);assert.equal(disposed,resources.size);assert.equal(f.practiceSword,null);assert.equal(f.elbR.children.length,0);
});
