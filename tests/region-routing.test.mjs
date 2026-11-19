import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../server/worker.js';
function route(query,cf) {
  const req = new Request('https://example.test/ws?' + query, {headers:{Upgrade:'websocket', Origin:'https://example.test'}});
  if(cf)Object.defineProperty(req,'cf',{value:cf});
  const seen={};
  const env={ROOMS:{idFromName(name){seen.name=name;return name;},get(){return{fetch(req){seen.headers=Object.fromEntries(req.headers);return new Response('ok');}};}}};
  return worker.fetch(req,env).then(response=>({response,seen}));
}

test('temple retains existing world room; town has an independent room',async()=>{
  assert.equal((await route('c=world')).seen.name,'world');
  const town=await route('c=world&r=town');assert.equal(town.seen.name,'town:world');assert.equal(town.seen.headers['x-world'],'1');
});
test('town isolation also applies to nearby and IP-derived rooms',async()=>{
  assert.equal((await route('c=62_242&r=town')).seen.name,'town:62_242');
  assert.equal((await route('r=town',{latitude:'31.2',longitude:'121.5'})).seen.name,'town:62_243');
});
test('unknown regions are rejected before room creation',async()=>{
  const x=await route('c=world&r=unknown');assert.equal(x.response.status,400);assert.equal(x.seen.name,undefined);
});
test('Wudang has separate world and nearby rooms',async()=>{
 assert.equal((await route('c=world&r=wudang')).seen.name,'wudang:world');
 assert.equal((await route('c=62_242&r=wudang')).seen.name,'wudang:62_242');
});
test('Ming has separate world and nearby rooms',async()=>{
 assert.equal((await route('c=world&r=ming')).seen.name,'ming:world');
 assert.equal((await route('c=62_242&r=ming')).seen.name,'ming:62_242');
});
test('Beggar guild has separate world and nearby rooms',async()=>{
 assert.equal((await route('c=world&r=beggar')).seen.name,'beggar:world');
 assert.equal((await route('c=62_242&r=beggar')).seen.name,'beggar:62_242');
});
test('Emei has separate world and nearby rooms',async()=>{
 assert.equal((await route('c=world&r=emei')).seen.name,'emei:world');
 assert.equal((await route('c=62_242&r=emei')).seen.name,'emei:62_242');
});
test('Huashan has separate world and nearby rooms',async()=>{
 assert.equal((await route('c=world&r=huashan')).seen.name,'huashan:world');
 assert.equal((await route('c=62_242&r=huashan')).seen.name,'huashan:62_242');
});

test('Kunlun has separate world and nearby rooms',async()=>{
 assert.equal((await route('c=world&r=kunlun')).seen.name,'kunlun:world');
 assert.equal((await route('c=62_242&r=kunlun')).seen.name,'kunlun:62_242');
});

test('Kongtong has separate world and nearby rooms',async()=>{
 assert.equal((await route('c=world&r=kongtong')).seen.name,'kongtong:world');
 assert.equal((await route('c=62_242&r=kongtong')).seen.name,'kongtong:62_242');
});

test('escort bureau has its own regional world and nearby rooms',async()=>{
 assert.equal((await route('c=world&r=escort')).seen.name,'escort:world');
 assert.equal((await route('c=62_242&r=escort')).seen.name,'escort:62_242');
});
