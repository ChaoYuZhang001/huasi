import test from 'node:test';
import assert from 'node:assert/strict';
import {createGateWalk} from '../world/gate-walk.js';

test('guide stays at the gate unless invited, leads on foot, waits and resumes',()=>{
 const walk=createGateWalk(),home=walk.position,visitor={x:0,z:54};
 for(let frame=0;frame<100;frame++)assert.equal(walk.step(.05,visitor,false).moving,false);
 assert.equal(walk.invite(),true);assert.equal(walk.invite(),false);
 for(let frame=0;frame<180;frame++)walk.step(.05,visitor,false);
 const waited=walk.position;assert.ok(waited.z<home.z&&waited.z>47);
 assert.equal(walk.step(.05,visitor,false).moving,false);
 assert.equal(walk.step(.05,waited,false).moving,true);
 let arrivals=0;
 for(let frame=0;frame<330;frame++){const pose=walk.position;const next=walk.step(.05,{x:pose.x,z:pose.z-6},false);if(next.event)arrivals++;}
 assert.deepEqual(walk.position,{x:5.5,z:27.5});
 assert.equal(walk.step(.05,walk.position,false).event,'arrived');assert.equal(arrivals,0);
 for(let frame=0;frame<400;frame++)assert.equal(walk.step(.05,walk.position,true).event,null);
 assert.equal(walk.phase,'gate');assert.deepEqual(walk.position,home);
});

test('leaving the area sends the guide back without completing the walk',()=>{
 const walk=createGateWalk(),home=walk.position;walk.invite();
 for(let frame=0;frame<50;frame++)walk.step(.05,walk.position,false);
 const before=walk.position;
 assert.equal(walk.step(.05,{x:-25,z:54},false).event,null);
 assert.equal(walk.phase,'returning');assert.ok(Math.hypot(walk.position.x-before.x,walk.position.z-before.z)<.1);
 for(let frame=0;frame<160;frame++)walk.step(.05,{x:-25,z:54},false);
 assert.deepEqual(walk.position,home);assert.equal(walk.invite(),true);
});
