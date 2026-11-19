import test from 'node:test';
import assert from 'node:assert/strict';
import {PLACES,ROADS,SHORTCUTS,placeById,placeForRegion,routeBetween,journalEntries,journalTrails,unfinished} from '../world/atlas-data.js';
test('trails recognize earlier and out-of-order lessons but never mere visits or invalid records',()=>{
 const journey={visited:SHORTCUTS,learned:{tea:{times:2},'emei-tea':{times:-1}}};
 const trails=journalTrails(journey,'town');assert.equal(trails.length,3);
 for(const trail of trails)for(const stop of trail.stops)assert(placeById(stop.place)?.region);
 assert.deepEqual(trails[0].stops.map(stop=>stop.done),[false,true]);assert.equal(trails[0].next.place,'emei');
 journey.learned['emei-tea'].times=1;assert.equal(journalTrails(journey,'town')[0].next,undefined);
});
test('world map contains a single playable Shaolin backed by the original temple',()=>{
 assert.equal(PLACES.length,20);assert.equal(new Set(PLACES.map(p=>p.id)).size,20);
 assert(PLACES.every(place=>place.kind&&place.area&&place.visit));
 assert.equal(placeById('kunlun').kind,'山中琴院');
 assert.equal(placeById('persia').kind,'商旅集市');
 assert.equal(placeForRegion('temple'),placeById('shaolin'));assert.equal(placeById('shaolin').name,'少林寺');
 assert.equal(PLACES.filter(p=>p.region==='temple').length,1);
 assert.equal(SHORTCUTS.length,10);assert(PLACES.every(p=>p.region));
 for(const [a,b]of ROADS){assert(placeById(a));assert(placeById(b));}
});
test('open travel directions connect all open regions without pretending to travel through planned places',()=>{
 assert.deepEqual(routeBetween('shaolin','escort'),['shaolin','wudang','emei','beggar','escort']);
 assert.deepEqual(routeBetween('wudang','ming'),['wudang','shaolin','huashan','kongtong','ming']);
 for(const {id:a} of PLACES)for(const {id:b} of PLACES){const path=routeBetween(a,b);assert.equal(path[0],a);assert.equal(path.at(-1),b);assert(path.every(id=>placeById(id).region));}
 assert.deepEqual(routeBetween('town','kunlun'),['town','shaolin','huashan','kongtong','ming','kunlun']);assert.deepEqual(routeBetween('town','shaolin'),['town','shaolin']);assert.deepEqual(routeBetween('invented','town'),[]);
});
test('journal only displays known visited regions and valid completed learning records',()=>{
 const j={visited:['temple','temple','planned','ming'],learned:{tea:{times:2,at:100},'wudang-cloudhands':{times:-1},fake:{times:100},'ming-workshops':{times:NaN}}};
 const entries=journalEntries(j,'town');assert.deepEqual(entries.visited.map(p=>p.id),['shaolin','town','ming']);assert.equal(entries.lessons.length,1);assert.equal(entries.lessons[0].times,2);assert.deepEqual(j.visited,['temple','temple','planned','ming']);
});
test('unfinished activity notes match saved game state and exclude completed records',()=>{
 assert.match(unfinished({states:{town:{step:2}}},'town'),/注水/);
 assert.match(unfinished({states:{ming:{seen:['metal','metal','invalid','water']}}},'ming'),/2 处作坊/);
 assert.equal(unfinished({states:{ming:{seen:['metal'],awarded:true}}},'ming'),'');
 assert.match(unfinished({states:{beggar:{stage:'stir',stirring:true}}},'beggar'),/继续/);
 assert.match(unfinished({states:{emei:{picked:['east','east','middle']}}},'emei'),/2 枝/);
 assert.match(unfinished({states:{emei:{picked:['east','middle','west']}}},'emei'),/摊叶/);
 assert.equal(unfinished({states:{emei:{picked:['east','middle','west'],spread:true}}},'emei'),'');
 assert.match(unfinished({states:{kunlun:{heard:[0,3,6]}}},'kunlun'),/短句/);
 assert.equal(unfinished({states:{kunlun:{heard:[0,3,6],complete:true}}},'kunlun'),'');
 assert.equal(unfinished({states:{beggar:{stage:'done'}}},'beggar'),'');assert.equal(unfinished({},'town'),'');
});
