import test from 'node:test';
import assert from 'node:assert/strict';
import {createQinLesson,QIN_NOTES,QIN_PHRASE} from '../world/qin-lesson.js';
import {pluckSamples,playQin} from '../world/qin-audio.js';
test('hearing different registers is required before following a phrase',()=>{
 const a=createQinLesson(()=>{});for(const n of[-1,7,'0',NaN])assert.equal(a.pluck(n),'invalid');
 a.pluck(0);a.pluck(0);a.pluck(1);assert.equal(a.state.stage,'explore');assert.deepEqual(a.state.heard,[0,1]);
 a.pluck(3);assert.equal(a.pluck(6),'ready');assert.equal(a.state.progress,0);assert.equal(a.state.stage,'follow');
});
test('a wrong note gently restarts the phrase; completion and free playing award once',()=>{
 let n=0;const a=createQinLesson(()=>n++);for(const note of[0,3,6])a.pluck(note);
 a.pluck(0);a.pluck(3);assert.equal(a.pluck(2),'again');assert.equal(a.state.progress,0);assert.equal(n,0);
 for(const note of QIN_PHRASE)a.pluck(note);assert.equal(n,1);assert.equal(a.state.stage,'free');
 for(const note of QIN_PHRASE)assert.equal(a.pluck(note),'free');assert.equal(n,1);
});
test('partly learned and completed phrases survive re-entry without duplicate awards',()=>{
 let n=0;const a=createQinLesson(()=>n++);[0,3,6,0,3].forEach(x=>a.pluck(x));
 const saved=a.state;saved.heard.push(2);assert(!a.state.heard.includes(2));
 const b=createQinLesson(()=>n++,a.state);assert.equal(b.state.progress,2);b.pluck(6);b.pluck(3);assert.equal(n,1);
 const c=createQinLesson(()=>n++,JSON.parse(JSON.stringify(b.state)));assert.equal(c.pluck(1),'free');assert.equal(n,1);
});
test('malformed saves cannot mark a listening lesson complete',()=>{
 for(const s of[{heard:3,complete:true,progress:4},{heard:[0,0,7],complete:true,progress:4},{heard:[0,3,6],complete:true,progress:NaN},{heard:[0,3,6],complete:true,progress:999}])assert.equal(createQinLesson(()=>{},s).state.complete,false);
 assert.equal(createQinLesson(()=>{},{heard:[0,3,6],progress:4}).state.progress,0);
});
test('plucked voices are deterministic, finite, decay, and retain their intended pitch at common sample rates',()=>{
 for(const rate of[44100,48000])for(const frequency of QIN_NOTES){const a=pluckSamples(rate,frequency),b=pluckSamples(rate,frequency);assert.deepEqual(a,b);assert.equal(a.length,rate*3);
  let peak=0,early=0,late=0;for(let i=0;i<a.length;i++){assert(Number.isFinite(a[i]));peak=Math.max(peak,Math.abs(a[i]));if(i<rate*.3)early+=a[i]**2;if(i>rate*2.7)late+=a[i]**2;}assert(peak>.03&&peak<1);assert(late<early*.2);
  const start=Math.floor(rate*.15),end=start+Math.floor(rate*.1),expected=rate/frequency;let best=0,bestLag=0;
  for(let lag=Math.floor(expected*.94);lag<=Math.ceil(expected*1.06);lag++){let corr=0;for(let i=start;i<end;i++)corr+=a[i]*a[i+lag];if(corr>best){best=corr;bestLag=lag;}}
  assert(Math.abs(rate/bestLag-frequency)/frequency<.015,JSON.stringify({rate,frequency,bestLag}));
 }
 for(const args of[[0,130],[44100,0],[48000,NaN],[48000,130,Infinity]])assert.throws(()=>pluckSamples(...args),RangeError);
});
test('audio nodes connect through the supplied effects bus and disconnect when stopped',()=>{
 let created=0,stops=0,disconnections=0;const bus={};let target;
 const ctx={sampleRate:44100,createBuffer(c,n,r){created++;return{copyToChannel(){}};},createGain(){return{gain:{value:0},connect(o){target=o;},disconnect(){disconnections++;}};},createBufferSource(){return{connect(){},start(){},stop(){stops++;this.onended();},disconnect(){disconnections++;}};}};
 const a=playQin(ctx,bus,QIN_NOTES[0]);assert.equal(target,bus);a();a();const b=playQin(ctx,bus,QIN_NOTES[0]);b();assert.equal(created,1);assert.equal(stops,2);assert.equal(disconnections,4);
 assert.doesNotThrow(()=>playQin(null,null,130)());
});
