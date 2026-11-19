import test from 'node:test';
import assert from 'node:assert/strict';
import {openLedger,travelTrade} from '../world/trade.js';

function setup(journey={},go=async()=>true){
 let card,last,seat,saves=0;
 const save=()=>saves++,ledger=openLedger(journey,save,()=>.5);
 const trade=travelTrade({ledger,save,card:c=>card=c,message:s=>last=s,sit:s=>seat=s,
  places:[{region:'town',name:'三四镇'},{region:'temple',name:'少林寺'},{region:'fist',name:'柳巷拳馆'}],
  current:()=>'town',visit:id=>id==='temple',go});
 return {trade,ledger,journey,pick:i=>card.onPick(i),get card(){return card;},get last(){return last;},get seat(){return seat;},get saves(){return saves;}};
}
test('a new traveller can order free food, tea and a bed with an empty purse',()=>{
 const h=setup({visited:['town'],purse:{balance:-10}});
 for(const kind of ['tea','meals','nights']){
  const previous=h.seat;h.trade.service(kind,'免费','选点',3,cost=>({cost}));h.pick(1);assert.equal(h.seat,previous);h.pick(0);
  assert.deepEqual(h.seat,{cost:0});assert.equal(h.journey.purse[kind],1);
  assert.equal(h.journey.purse.balance,0);
 }
});
test('a parcel survives reload and pays once per delivery, reading pays once',()=>{
 const a=setup();a.trade.parcel(true);a.trade.parcel(false);a.trade.parcel(false);
 const b=setup(JSON.parse(JSON.stringify(a.journey)));b.trade.parcel(true);b.trade.parcel(true);
 assert.equal(b.ledger.purse.balance,10);b.trade.book();b.pick(1);assert.equal(b.ledger.purse.balance,10);b.trade.book();b.pick(0);b.trade.book();
 assert.equal(b.ledger.purse.balance,16);assert.equal(b.card.opts,undefined);
});
test('rent, stocking, fitted orders and offerings update the durable ledger',()=>{
 const h=setup({purse:{balance:32}});h.trade.shop();h.pick(0);assert.equal(h.ledger.purse.stock,2);
 h.trade.shop();h.pick(1);h.pick(1);assert.equal(h.ledger.purse.stock,2);
 h.trade.shop();h.pick(1);h.pick(0);assert.equal(h.ledger.purse.sales,1);assert.equal(h.ledger.purse.stock,1);
 h.trade.shop();h.pick(0);assert.equal(h.ledger.purse.stock,3);
 let placed=false;h.trade.offer(()=>placed=true);h.pick(0);assert(placed);assert.equal(h.ledger.purse.offerings,1);
});
test('an apprenticeship unlocks on payment, subsequent practice and matches are free',()=>{
 const h=setup({purse:{balance:10}}),modes=[];h.trade.mentor(v=>modes.push(v));h.pick(0);h.trade.mentor(v=>modes.push(v));h.pick(1);
 assert.deepEqual(modes,[false,true]);assert.equal(h.ledger.purse.balance,0);assert.equal(h.ledger.purse.spent,10);
});
test('portal lists visited destinations and charges exactly once after successful arrival',async()=>{
 let finish,calls=0;const h=setup({purse:{balance:20}},()=>{calls++;return new Promise(resolve=>finish=resolve);});
 h.trade.transport(true);assert.deepEqual(h.card.opts,['少林寺']);
 const failure=h.pick(0);await h.pick(0);assert.equal(calls,1);finish(false);await failure;assert.equal(h.ledger.purse.balance,20);
 h.trade.transport(false);assert.deepEqual(h.card.opts,['少林寺','柳巷拳馆']);const success=h.pick(1);finish(true);await success;assert.equal(h.ledger.purse.balance,12);
});
