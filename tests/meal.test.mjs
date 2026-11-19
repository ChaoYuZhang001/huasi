import test from 'node:test';
import assert from 'node:assert/strict';
import {createMeal} from '../world/meal.js';
test('helping at the stove requires water, rice, stirring time and serving in order',()=>{
 let awards=0;const m=createMeal(()=>awards++);assert.equal(m.act('rice'),false);assert.equal(m.act('serve'),false);
 assert(m.act('water'));assert.equal(m.act('water'),false);assert(m.act('rice'));assert(m.act('stir'));assert.equal(m.act('stir'),false);assert.equal(m.act('serve'),false);
 for(let i=0;i<31;i++)m.tick(.25);assert.equal(m.state.stage,'stir');m.tick(.25);assert.equal(m.state.stage,'serve');assert.equal(awards,0);assert(m.act('serve'));assert.equal(awards,1);assert.equal(m.act('serve'),false);
});
test('eviction and reload retain partial stirring, and do not repeat a completed award',()=>{
 let awards=0;const a=createMeal(()=>awards++);for(const s of['water','rice','stir'])a.act(s);for(let i=0;i<10;i++)a.tick(.25);
 const b=createMeal(()=>awards++,JSON.parse(JSON.stringify(a.state)));assert.equal(b.state.remaining,5.5);for(let i=0;i<22;i++)b.tick(.25);assert(b.act('serve'));
 const c=createMeal(()=>awards++,b.state);assert.equal(c.act('serve'),false);assert.equal(awards,1);
});
test('invalid steps and elapsed time cannot skip the activity',()=>{
 const m=createMeal(()=>{}, {stage:'invented',remaining:-99,stirring:true});assert.equal(m.state.stage,'water');assert.equal(m.act('invented'),false);
 for(const s of['water','rice','stir'])m.act(s);m.tick(NaN);m.tick(-1);assert.equal(m.state.remaining,8);m.tick(999);assert.equal(m.state.remaining,7.75);
});
