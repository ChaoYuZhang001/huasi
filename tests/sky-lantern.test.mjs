import test from 'node:test';
import assert from 'node:assert/strict';
import {flightAt,readSkyRelease,nearRelease,FLIGHT_SECONDS} from '../world/sky-lantern.js';

test('flight starts at the release, follows its own wind and expires regardless of frame count',()=>{
 const release={p:[1,5,-65],seed:12};
 const start=flightAt(release,0),middle=flightAt(release,20),end=flightAt(release,FLIGHT_SECONDS+2);
 assert.deepEqual([start.x,start.y,start.z],release.p);assert.equal(start.scale,1);
 assert.ok(middle.y>start.y);assert.notEqual(middle.x,flightAt({...release,seed:12000},20).x);
 assert.deepEqual(flightAt(release,FLIGHT_SECONDS),end);assert.equal(end.scale,0);
});

test('release decoding admits only a bounded flight; wishes and arbitrary fields are not copied',()=>{
 const release={p:[1,5,-65],seed:0};assert.deepEqual(readSkyRelease({...release,wish:5}),release);
 for(const value of [null,{}, {...release,seed:65536},{...release,seed:.1},{...release,p:[1,5,-20]},{...release,p:[NaN,5,-65]}])assert.equal(readSkyRelease(value),null);
 assert.ok(nearRelease([1,3.5,-64],release));assert.ok(!nearRelease([-6,3.5,-65],release));
});
