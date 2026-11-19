import test from 'node:test';
import assert from 'node:assert/strict';
import {readPractice, samplePractice, readBench} from '../world/presence.js';
import {Room} from '../server/worker.js';

function roomFixture() {
  const sockets=[];
  const state={getWebSockets:()=>sockets};
  let room=new Room(state);
  const add=(id,gender,options={})=>{
    let attachment={id,realm:'temple',world:true,ready:false,w:0,c:0,lat:12,lon:34,...options};
    const ws={messages:[],closes:[],send(s){this.messages.push(JSON.parse(s));},close(code){this.closes.push(code);},
      deserializeAttachment:()=>structuredClone(attachment),serializeAttachment:a=>{attachment=structuredClone(a);}};
    sockets.push(ws);room.webSocketMessage(ws,JSON.stringify({t:'hi',name:id,k:4,g:gender}));return ws;
  };
  return {add,send:(ws,data)=>room.webSocketMessage(ws,JSON.stringify(data)),
    close:ws=>room.webSocketClose(ws),error:ws=>room.webSocketError(ws),
    restore:()=>{room=new Room(state);},clear:()=>sockets.forEach(s=>s.messages.length=0)};
}
const pose={t:'s',p:[1,3.6,-4],r:.5,a:[0,0,.8]};

test('a terrace release is live only, sender-excluded and restricted to nearby visitors',()=>{
 const room=roomFixture(),nearby={world:false};
 const actor=room.add('traveler','f',nearby),observer=room.add('watcher','m',nearby),far=room.add('far','m',{world:false,lat:16});
 const packet={t:'sky',p:[1,5,-66],seed:404,wish:'private'};
 room.send(actor,{...pose,p:[1,3.5,-65]});room.clear();room.send(actor,packet);
 assert.deepEqual(observer.messages,[{t:'sky',id:'traveler',p:[1,5,-66],seed:404}]);
 assert.deepEqual(actor.messages,[]);assert.deepEqual(far.messages,[]);
 room.restore();room.send(actor,packet);assert.equal(observer.messages.length,1);
 const late=room.add('late','f',nearby);assert.ok(!late.messages.some(message=>message.t==='sky'));
});

test('a release needs a recent matching terrace pose in the temple',()=>{
 const packet={t:'sky',p:[1,5,-66],seed:404};
 for(const options of [{realm:'town'},{realm:undefined},{poseAt:Date.now()-30000},{pose:{p:[1,3.5,-2]}},{pose:null}]){
  const room=roomFixture(),actor=room.add('a','m',{pose:{p:[1,3.5,-65]},poseAt:Date.now(),...options}),observer=room.add('b','f');room.clear();
  room.send(actor,packet);assert.deepEqual(observer.messages,[]);
 }
});

test('practice extension accepts only finite, known movements',()=>{
  assert.deepEqual(readPractice([1,2,.999]),[1,2,.999]);
  for(const x of [null,{},[1,0],[4,0,.2],[1,-1,.2],[1,3,.2],[1,.5,.2],[1,1,1],[1,1,-.1],[1,1,NaN],[1,1,Infinity],[1,1,'0.5']])assert.equal(readPractice(x),null);
});
test('remote practice advances within the same phase, caps stalls and wraps the loop',()=>{
  assert.deepEqual(samplePractice([1,1,.5],.4),[1,1,.58]);
  assert.deepEqual(samplePractice([1,2,.5],20),[1,2,.62]);
  assert(Math.abs(samplePractice([1,1,.98],.4)[2]-.06)<1e-12);
  assert.deepEqual(samplePractice([1,0,.5],-1),[1,0,.5]);
  assert.equal(samplePractice(null,1),null);
});
test('wooden-sword practice is relayed and restored with its own action kind',()=>{
 assert.deepEqual(readPractice([2,1,.4]),[2,1,.4]);assert.deepEqual(samplePractice([2,1,.4],10),[2,1,.52]);
 const f=roomFixture(),a=f.add('sword'),b=f.add('watcher');f.clear();f.send(a,{...pose,x:[2,1,.45]});assert.deepEqual(b.messages.pop().x,[2,1,.45]);
 f.restore();const c=f.add('late');assert(c.messages.some(m=>m.t==='s'&&m.id==='sword'&&m.x?.[0]===2));
 f.send(a,{...pose,x:null});assert.equal(b.messages.pop().x,null);
});
test('relay preserves old actions, carries cloud hands and clears it on legacy packets',()=>{
  const f=roomFixture(),a=f.add('alice'),b=f.add('bob');f.clear();
  f.send(a,{...pose,x:[1,1,.45]});assert.deepEqual(b.messages.pop(),{...pose,id:'alice',x:[1,1,.45]});
  f.send(a,pose);assert.deepEqual(b.messages.pop(),{...pose,id:'alice',x:null});
  f.send(a,{...pose,x:[1,99,.2]});assert.equal(b.messages.pop().x,null);
});
test('arrival receives an immediate pose snapshot after identity, including restored attachments',()=>{
  const f=roomFixture(),a=f.add('alice');f.send(a,{...pose,x:[1,1,.45]});f.restore();
  const b=f.add('bob'),identity=b.messages.findIndex(m=>m.t==='in'),index=b.messages.findIndex(m=>m.t==='s');
  assert(identity>=0&&index>identity);const m=b.messages[index];assert.deepEqual(m.p,pose.p);assert.equal(m.x[1],1);
  assert.deepEqual(Object.keys(m).sort(),['a','id','p','r','t','x']);
  assert.equal(JSON.stringify(b.messages).includes('lat'),false);
});
test('invalid position never replaces the last accepted pose',()=>{
  const f=roomFixture(),a=f.add('alice');f.send(a,pose);f.send(a,{...pose,p:[999,0,0]});
  const b=f.add('bob');assert.deepEqual(b.messages.find(m=>m.t==='s').p,pose.p);
});
test('close handshake completes and close plus error announces departure once',()=>{
  const f=roomFixture(),a=f.add('alice'),b=f.add('bob');f.clear();f.close(a);f.error(a);
  assert.equal(a.closes[0],1000);assert.equal(b.messages.filter(m=>m.t==='out').length,1);
  assert.equal(b.messages.find(m=>m.t==='n').n,0);
});
test('selected avatar appearance is relayed for both existing and arriving visitors',()=>{
  const f=roomFixture(),a=f.add('alice','f'),b=f.add('bob','m');
  assert.equal(a.messages.find(m=>m.t==='in'&&m.name==='bob').g,'m');
  assert.equal(b.messages.find(m=>m.t==='in'&&m.name==='alice').g,'f');
  f.add('invalid',{url:'ignored'});assert.equal(b.messages.find(m=>m.name==='invalid').g,null);
});

test('empty-hand practice relays to late arrivals and clears when the visitor stops',()=>{
 const f=roomFixture(),a=f.add('fist'),b=f.add('watch');f.clear();f.send(a,{...pose,x:[3,1,.6]});assert.deepEqual(b.messages.pop().x,[3,1,.6]);
 f.restore();const c=f.add('late');assert(c.messages.some(m=>m.t==='s'&&m.id==='fist'&&m.x?.[0]===3));
 assert.deepEqual(samplePractice([3,0,.2],5),[3,0,.32]);f.send(a,{...pose,x:null});assert.equal(b.messages.pop().x,null);
});

test('bench kind is bounded, survives late arrival, and clears on standing or legacy packets',()=>{
 assert.equal(readBench(1),1);for(const v of [null,0,-1,2,'1',{},[],NaN,Infinity])assert.equal(readBench(v),0);
 const f=roomFixture(),a=f.add('resting'),b=f.add('watching');f.clear();
 const seated={...pose,a:[1,0,0],b:1};f.send(a,seated);assert.equal(b.messages.pop().b,1);
 f.restore();const c=f.add('late');assert.equal(c.messages.find(m=>m.t==='s').b,1);
 f.send(a,{...seated,b:2});assert.equal(b.messages.pop().b,undefined);
 f.send(a,seated);f.send(a,{...pose,b:1});assert.equal(b.messages.pop().b,undefined);
 f.send(a,seated);f.send(a,{...pose,a:[1,0,0]});assert.equal(b.messages.pop().b,undefined);
});
