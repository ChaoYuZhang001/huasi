import test from 'node:test';
import assert from 'node:assert/strict';
import {createTeaGarden,SHOOTS} from '../world/tea-garden.js';
test('mature leaves and repeated picking cannot fill the basket',()=>{
 const v=createTeaGarden(()=>{});assert.equal(v.pick('old'),'old');assert.equal(v.state.count,0);
 assert.equal(v.pick('east'),'fresh');assert.equal(v.pick('east'),'picked');assert.equal(v.state.count,1);assert.equal(v.spread(),'missing');
});
test('three unique shoots can be spread and award the lesson once',()=>{
 let n=0;const v=createTeaGarden(()=>n++);for(const id of SHOOTS)v.pick(id);assert.equal(v.state.stage,'spread');
 assert.equal(v.spread(),'complete');assert.equal(v.state.stage,'done');assert.equal(v.spread(),'done');assert.equal(n,1);
});
test('partial and complete visits survive reconstruction without duplicate awards',()=>{
 let n=0;const a=createTeaGarden(()=>n++);a.pick('middle');const state=a.state;state.picked.push('east');assert.equal(a.state.count,1);
 const b=createTeaGarden(()=>n++,JSON.parse(JSON.stringify(a.state)));assert.equal(b.state.count,1);b.pick('east');b.pick('west');b.spread();
 const c=createTeaGarden(()=>n++,b.state);assert.equal(c.spread(),'done');assert.equal(n,1);
});
test('corrupt saved state cannot unlock a completed garden lesson',()=>{
 const v=createTeaGarden(()=>{},{picked:['east','east','invented'],spread:true});assert.equal(v.state.count,1);assert.equal(v.state.stage,'pick');
 assert.equal(createTeaGarden(()=>{},{picked:3}).state.count,0);
});
