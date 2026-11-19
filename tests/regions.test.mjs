import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../world/regions.js',import.meta.url),'utf8');
const {createRegions}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));

function fixture(failAt) {
  let data='temple-data',pose={p:[1,0,2],yaw:0},place='temple',mode='walk',loads=0;
  const temple={id:'temple',root:{visible:true},spawn:pose};
  const town={id:'town',root:{visible:false},data:'town-data',spawn:{p:[0,0,48],yaw:0}};
  const host={capture:()=>data,restore:d=>{data=d;},pose:()=>structuredClone(pose),canTravel:()=>mode==='walk',
    beginTravel(){mode='travel';},async load(){loads++;if(failAt==='load')throw Error('offline');return()=>{};},
    build(){if(failAt==='build'){data='partial';throw Error('construction failed');}return town;},
    enter(r,p){place=r.id;pose=structuredClone(p);if(failAt==='enter')throw Error('handoff failed');},
    rollback(r,p){place=r.id;pose=p;},failed(){},endTravel(){mode='walk';}};
  const regions=createRegions(host);regions.start(temple);
  return{regions,temple,town,state:()=>({data,pose,place,mode,loads})};
}

test('round trip restores the exact departure pose and reuses a loaded region',async()=>{
  const f=fixture();assert.equal(await f.regions.go('town'),true);assert.equal(f.temple.root.visible,false);
  assert.equal(await f.regions.go('temple'),true);assert.deepEqual(f.state().pose.p,[1,0,2]);
  assert.equal(f.state().data,'temple-data');await f.regions.go('town');assert.equal(f.state().loads,1);
});
for(const at of ['load','build','enter'])test(`failure during ${at} restores one visible region and movable player`,async()=>{
  const f=fixture(at);assert.equal(await f.regions.go('town'),false);
  assert.equal(f.state().data,'temple-data');assert.equal(f.state().place,'temple');assert.equal(f.state().mode,'walk');
  assert.equal(f.temple.root.visible,true);assert.equal(f.town.root.visible,false);assert.equal(f.regions.busy,false);
});
test('duplicate requests cannot interleave loads or overwrite the return pose',async()=>{
  const f=fixture();const a=f.regions.go('town'),b=f.regions.go('town');assert.equal(await b,false);assert.equal(await a,true);
  assert.equal(f.state().loads,1);
});

function cachedFixture() {
 let data={},pose={p:[0,0,1],yaw:0},fail=false;
 const disposed=[],builds=[],host={capture:()=>data,restore:d=>{data=d;},pose:()=>structuredClone(pose),canTravel:()=>true,
  beginTravel(){},endTravel(){},failed(){},load:async id=>id,
  build(id,build,saved){const state=saved||{count:0};const r={id,root:{visible:false},data:{id},spawn:{p:[0,0,0],yaw:0},state,snapshot:()=>({...state})};builds.push(r);return r;},
  enter(r,p){pose=structuredClone(p);if(fail)throw Error('arrival');},
  rollback(r,p){pose=p;},dispose:r=>disposed.push(r.id)};
 const regions=createRegions(host,{limit:3});regions.start({id:'temple',root:{visible:true},spawn:pose});
 return{regions,disposed,builds,move:p=>{pose={p,yaw:1};},fail:v=>{fail=v;},setData:d=>{data=d;},get data(){return data;},get pose(){return pose;}};
}
test('bounded cache pins the temple, evicts least-recently-visited region and restores lightweight progress',async()=>{
 const f=cachedFixture();await f.regions.go('town');const old=f.regions.current;old.state.count=2;f.move([2,0,3]);
 await f.regions.go('wudang');await f.regions.go('ming');assert.deepEqual(f.disposed,['town']);assert.equal(f.regions.ids.length,3);assert(f.regions.ids.includes('temple'));
 await f.regions.go('town');assert.notEqual(f.regions.current,old);assert.equal(f.regions.current.state.count,2);assert.deepEqual(f.pose,{p:[2,0,3],yaw:1});assert.deepEqual(f.disposed,['town','wudang']);
});
test('visiting a cached region refreshes its recency',async()=>{
 const f=cachedFixture();await f.regions.go('town');await f.regions.go('wudang');await f.regions.go('town');await f.regions.go('ming');
 assert.deepEqual(f.disposed,['wudang']);assert.equal(f.builds.filter(r=>r.id==='town').length,1);
});
test('failed arrival disposes only the new destination, keeps old scenes and retries with a fresh build',async()=>{
 const f=cachedFixture();await f.regions.go('town');await f.regions.go('wudang');f.fail(true);
 assert.equal(await f.regions.go('ming'),false);assert.deepEqual(f.disposed,['ming']);assert.equal(f.regions.current.id,'wudang');assert.deepEqual(f.regions.ids,['temple','town','wudang']);
 f.fail(false);assert.equal(await f.regions.go('ming'),true);assert.equal(f.builds.filter(r=>r.id==='ming').length,2);assert.deepEqual(f.disposed,['ming','town']);
});
test('failed travel restores the latest active collections, not the earlier visit snapshot',async()=>{
 const f=cachedFixture();f.setData({newInteraction:true});f.fail(true);await f.regions.go('town');assert.deepEqual(f.data,{newInteraction:true});
});
