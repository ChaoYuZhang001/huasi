import test from 'node:test';
import assert from 'node:assert/strict';
import {STATIONS,SOUTH_STOPS,TOWN,origin,ROAD_END,TOWN_END,walkingHint} from '../world/highroad.js';
import {pavingCells} from '../world/street-paving.js';

test('each open destination meets the road at the same physical coordinates on both sides',()=>{
 for(const site of [...SOUTH_STOPS,...STATIONS]){
  const [x,z]=origin(site.id);
  assert.equal(x,site.x);
  assert.ok(Math.abs(z+site.edge-(site.edge<0?TOWN_END:ROAD_END))<1e-9);
 }
 assert.deepEqual(origin('roads'),[0,0]);
});

test('crossing and duplicate paving rectangles produce one surface per point',()=>{
 const tiles=pavingCells([[0,0,2,10],[0,0,10,2],[0,0,2,10]]);
 let area=0;
 for(const [i,[a,b,c,d]] of tiles.entries()){
  area+=(c-a)*(d-b);
  for(const [e,f,g,h] of tiles.slice(i+1))assert.ok(Math.min(c,g)<=Math.max(a,e)||Math.min(d,h)<=Math.max(b,f));
 }
 assert.equal(area,36);
});

test('walking directions take the current branch back to the trunk, then the correct signed exit',()=>{
 for(const dest of [...SOUTH_STOPS,...STATIONS]){
  assert.equal(walkingHint(dest.id,dest.id,0,0),'');
  const side=dest.x===-800?1:-1;
  assert.match(walkingHint('roads',dest.id,dest.x+side*200,-24),/向南到驿道交叉口/);
  assert.match(walkingHint('roads',dest.id,dest.x+side*200,0),new RegExp('向'+(side===1?'西':'东')+'到'+(dest===TOWN?'少林寺':dest.name)+'岔口 · 200 米'));
  assert.match(walkingHint('roads',dest.id,dest.x,0),dest.edge<0?/沿南路.*32 米/:/沿北路.*48 米/);
 }
 assert.match(walkingHint('roads','wudang',0,21),/向北到驿道交叉口/);
 assert.match(walkingHint('town','temple',0,48),/过石桥/);
 assert.equal(walkingHint('roads','future',0,5),'');
});
