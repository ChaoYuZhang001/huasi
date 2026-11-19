import test from 'node:test';
import assert from 'node:assert/strict';
import {openWaybills} from '../world/consignment.js';

test('rejects out-of-order handling, keeps the unfinished bundle, and never double delivers',()=>{
  let orders=openWaybills();
  for(const [id,wrap,to] of [['cups','straw','boat'],['books','oilcloth','cart']]){
    assert.equal(orders.wrap(wrap),false);
    assert.equal(orders.take(id),true);
    assert.equal(orders.take(id==='cups'?'books':'cups'),false);
    assert.equal(orders.dispatch(to),false);
    assert.equal(orders.wrap(wrap==='straw'?'oilcloth':'straw'),false);
    assert.equal(orders.wrap(wrap),true);
    orders=openWaybills(JSON.parse(JSON.stringify(orders.snapshot())));
    assert.equal(orders.active,id);
    assert.equal(orders.packed,true);
    assert.equal(orders.dispatch(to==='cart'?'boat':'cart'),false);
    assert.equal(orders.dispatch(to),true);
    assert.equal(orders.dispatch(to),false);
    assert.equal(orders.take(id),false);
  }
  assert.deepEqual(orders.snapshot(),{active:null,packed:false,delivered:['cups','books']});
});
test('restoring inconsistent or legacy records leaves usable orders available',()=>{
  assert.deepEqual(openWaybills({active:'cups',packed:true,delivered:['cups','cups','unlisted']}).snapshot(),{active:null,packed:false,delivered:['cups']});
  assert.deepEqual(openWaybills({active:'__proto__',packed:'true',delivered:42}).snapshot(),{active:null,packed:false,delivered:[]});
});
