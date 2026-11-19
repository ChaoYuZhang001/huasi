import test from 'node:test';
import assert from 'node:assert/strict';
import {collisionGrid} from '../world/collision-grid.js';

test('indexed point queries preserve inclusive boundaries and box order at every tested pad',()=>{
 const boxes=[
  {x0:-12,x1:-6.5,z0:-18.5,z1:-12.5},
  {x0:-5.5,x1:5.5,z0:-5.5,z1:5.5},
  {x0:-24,x1:24,z0:-.2,z1:.2},
  {x0:6,x1:12,z0:6,z1:12}
 ];
 const candidates=collisionGrid(boxes);
 for(const pad of [0,.34,.5,1.5])for(let x=-24;x<=24;x+=.5)for(let z=-20;z<=18;z+=.5){
  const touches=b=>x>=b.x0-pad&&x<=b.x1+pad&&z>=b.z0-pad&&z<=b.z1+pad;
  assert.deepEqual(candidates(x,z,pad).filter(touches),boxes.filter(touches));
 }
 assert.deepEqual(candidates(240,240,.5),[]);
});

test('a walk edge cannot cut through a thin railing between grid centres',()=>{
 const rail={x0:-10,x1:-6,z0:-.06,z1:.06,y0:0,y1:1.25};
 const grid=collisionGrid([rail]);
 assert.equal(grid.canWalk(-6.5,0,-.5,-6.5,0,.5),false);
 assert.equal(grid.canWalk(-6.5,0,-.5,-5.5,0,.5),false);
 assert.equal(grid.canWalk(-5.5,0,-.5,-5.5,0,.5),true);
 assert.equal(grid.canWalk(-6.5,1.3,-.5,-6.5,1.3,.5),true);
});

test('a walk edge follows the rise of stairs and clears overhead lintels',()=>{
 const step={x0:-3,x1:3,z0:.5,z1:1.5,y0:-1,y1:.25};
 const lintel={x0:-3,x1:3,z0:.55,z1:.8,y0:2.2,y1:2.5};
 const clear=collisionGrid([step,lintel]).canWalk;
 assert.equal(clear(0,0,0,0,.25,1),true);
 assert.equal(clear(0,.25,1,0,0,0),true);
 const low=collisionGrid([step,{...lintel,y0:1.78}]).canWalk;
 assert.equal(low(0,0,0,0,.25,1),false);
});
