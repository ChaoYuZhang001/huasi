const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');

async function verify(){
 const browser=await chromium.launch({channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},locale:'zh-CN',isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&m.text().includes('Shader Error'))errors.push(m.text());});
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8000',{waitUntil:'commit'});
  await page.locator('[data-entry="free"]:enabled').tap({timeout:100000});
  await page.waitForFunction(()=>window.__g?.GS.state==='play');
  const go=async region=>{
   assert(await page.evaluate(id=>__g.WORLD.go(id),region));
   await page.waitForFunction(id=>__g.WORLD.id===id&&__g.P.mode==='walk',region);
  };
  const act=id=>page.evaluate(id=>{
   const item=__g.IA.find(i=>i.id===id);if(!item)throw Error('Missing interaction '+id);item.act();
  },id);
  // The long walk suite covers navigation. Exercise the real seat and activity
  // callbacks here in seven loaded regions, checking the shared touch controls.
  for(const [id,seat] of [['wudang','hall:0'],['emei','hall:1'],['huashan','tea:-10'],['kongtong','bench:north'],['kunlun','hall:-6'],['ming','hall:0'],['beggar','river:6']]){
   await go(id);const sat=await page.evaluate(()=>__g.P.sat);
   await act(id+':'+seat);await page.waitForFunction(()=>__g.P.mode==='sit');
   await page.waitForTimeout(350);
   assert.equal(await page.evaluate(()=>__g.P.sat),sat,id+' ordinary rest credited as meditation');
   assert.equal(await page.evaluate(()=>Number(getComputedStyle(document.querySelector('#breath')).opacity)),0);
   assert.equal(await page.locator('[data-a=rites]').isVisible(),false);
   await page.locator('#tAct').tap();await page.waitForFunction(()=>__g.P.mode==='walk');
  }
  const stored=region=>page.evaluate(region=>JSON.parse(localStorage.getItem('huashan-temple-v1')).journey.states[region],region);
  await act('beggar:water');assert.equal((await stored('beggar')).stage,'rice');
  await act('beggar:rice');await act('beggar:stir');assert((await stored('beggar')).stirring);
  await page.waitForFunction(()=>__g.WORLD.active.lesson.stage==='serve',null,{timeout:60000});
  assert.equal((await stored('beggar')).stage,'serve');
  await act('beggar:serve');assert.equal((await stored('beggar')).stage,'done');
  await go('ming');await act('ming:camp:wood');assert.deepEqual((await stored('ming')).seen,['wood']);
  await page.reload({waitUntil:'commit'});
  await page.locator('[data-entry="resume"]:enabled').tap({timeout:100000});
  await page.waitForFunction(()=>__g.WORLD.id==='ming'&&__g.GS.state==='play');
  assert.deepEqual(await page.evaluate(()=>__g.WORLD.active.lesson.seen),['wood']);
  for(const flag of ['metal','water','fire','earth'])await act('ming:camp:'+flag);
  await act('ming:ledger');assert.equal((await stored('ming')).awarded,true);
  await go('beggar');assert.equal(await page.evaluate(()=>__g.WORLD.active.lesson.stage),'done');
  await go('emei');
  await act('emei:pick:east');await act('emei:puxian-incense');
  const offering=await stored('emei');
  assert.deepEqual(offering.picked,['east']);assert(offering.incenseUntil>Date.now());
  await page.reload({waitUntil:'commit'});
  await page.locator('[data-entry="resume"]:enabled').tap({timeout:100000});
  await page.waitForFunction(()=>__g.GS.state==='play'&&__g.WORLD.id==='emei');
  const burning=()=>page.evaluate(()=>__g.WORLD.active.root.getObjectByName('emei:puxian-incense').visible);
  assert(await burning());assert.deepEqual(await page.evaluate(()=>__g.WORLD.active.lesson.picked),['east']);
  await page.clock.setFixedTime(new Date(offering.incenseUntil+1000));
  await page.waitForFunction(()=>__g.IA.find(i=>i.id==='emei:puxian-incense').label()==='向普贤菩萨敬香');
  assert.equal(await burning(),false);await act('emei:puxian-incense');
  assert((await stored('emei')).incenseUntil>offering.incenseUntil);
  await go('temple');
  await page.evaluate(()=>{__g.P.pos.copy(__g.cushions[0].p);__g.bowKey();});
  await page.waitForFunction(()=>__g.P.mode==='sit'&&__g.P.sat>0);
  assert.equal(await page.locator('#breath').evaluate(el=>el.style.opacity),'1');
  // Restore a completed visit written by the earlier release.
  const previousRecord=await page.evaluate(()=>JSON.parse(localStorage.getItem('huashan-temple-v1')).journey.learned['ming-workshops']);
  assert.equal(previousRecord.times,1);
  await page.addInitScript(()=>{
   const key='huashan-temple-v1',saved=JSON.parse(localStorage.getItem(key));
   const record=saved.journey.learned['ming-workshops'];
   saved.journey.learned['ming-five-flags']=record;
   delete saved.journey.learned['ming-workshops'];
   localStorage.setItem(key,JSON.stringify(saved));
  });
  await page.reload({waitUntil:'commit'});
  await page.locator('[data-entry="resume"]:enabled').tap({timeout:100000});
  await page.waitForFunction(()=>__g.GS.state==='play');
  assert.deepEqual(await page.evaluate(()=>__g.WORLD.journey.learned['ming-workshops']),previousRecord);
  assert.equal(await page.evaluate(()=>Object.hasOwn(__g.WORLD.journey.learned,'ming-five-flags')),false);
  await go('ming');await act('ming:ledger');
  assert.equal(await page.evaluate(()=>__g.WORLD.journey.learned['ming-workshops'].times),1);
  assert.deepEqual(errors,[]);
  console.log('Seven touch rest areas, meals, workshop records and incense persistence alongside tea progress verified.');
 }finally{await browser.close();}
}
verify().catch(error=>{console.error(error);process.exitCode=1;});
