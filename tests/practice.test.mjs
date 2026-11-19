import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonClock} from '../world/practice.js';
const wait=(c,n)=>{for(let i=0;i<n*60;i++)c.tick(1/60);};
test('lesson requires three deliberate follows and cannot complete twice',()=>{
 const c=lessonClock();assert.equal(c.advance(),'inactive');assert(c.start());assert.equal(c.start(),false);
 assert.equal(c.advance(),'waiting');for(const expected of['advanced','advanced','complete']){wait(c,3);assert.equal(c.advance(),expected);}
 assert.equal(c.state.active,false);assert.equal(c.advance(),'inactive');
});
test('cancelling and restarting does not retain an earned step',()=>{
 const c=lessonClock();c.start();wait(c,3);c.advance();c.cancel();assert.equal(c.advance(),'inactive');c.start();assert.equal(c.state.phase,0);assert.equal(c.state.time,0);
});
test('missing the follow window lets the same movement repeat',()=>{
 const c=lessonClock();c.start();wait(c,5.3);assert.equal(c.advance(),'waiting');assert.equal(c.state.phase,0);wait(c,3);assert.equal(c.advance(),'advanced');
});
