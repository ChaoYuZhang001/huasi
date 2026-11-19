import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkshopVisit,WORKSHOP_IDS} from '../world/ming-lesson.js';
test('five different observations are required before recording the visit',()=>{
 let awards=0;const v=createWorkshopVisit(()=>awards++);assert.equal(v.record(),'missing');
 assert.equal(v.observe('unknown'),false);for(let i=0;i<5;i++)v.observe('metal');assert.equal(v.state.count,1);assert.equal(v.record(),'missing');
 for(const id of WORKSHOP_IDS)v.observe(id);assert.equal(v.state.count,5);assert.equal(v.record(),'complete');assert.equal(awards,1);
 assert.equal(v.record(),'recorded');assert.equal(awards,1);
});
test('visitors own independent observations and exported state cannot mutate the lesson',()=>{
 const a=createWorkshopVisit(()=>{}),b=createWorkshopVisit(()=>{});a.observe('wood');const view=a.state;view.seen.push('water');assert.equal(a.state.count,1);assert.equal(b.state.count,0);
});
test('rebuilding a region preserves unfinished observations and an already recorded visit',()=>{
 let awards=0;const first=createWorkshopVisit(()=>awards++);first.observe('metal');first.observe('water');
 const second=createWorkshopVisit(()=>awards++,JSON.parse(JSON.stringify(first.state)));assert.equal(second.state.count,2);
 for(const id of WORKSHOP_IDS)second.observe(id);assert.equal(second.record(),'complete');
 const third=createWorkshopVisit(()=>awards++,second.state);assert.equal(third.record(),'recorded');assert.equal(awards,1);
});
test('malformed saved observations cannot unlock a completed visit',()=>{
 const v=createWorkshopVisit(()=>{}, {seen:['metal','metal','unknown'],awarded:true});assert.equal(v.state.count,1);assert.equal(v.state.awarded,false);assert.equal(v.record(),'missing');
 assert.equal(createWorkshopVisit(()=>{}, {seen:3}).state.count,0);
});
