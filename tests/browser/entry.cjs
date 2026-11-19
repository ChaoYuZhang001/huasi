const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');

async function verify(){
 const browser=await chromium.launch({channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:375,height:667},isMobile:true,hasTouch:true,locale:'en-US'});
  const url=process.env.GAME_URL||'http://127.0.0.1:8000';
  await page.addInitScript(()=>{
   Object.defineProperty(navigator,'share',{value:async data=>{window.sharedInvite=data;}});
   if(sessionStorage.allow3D)return;
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:original.call(this,type,...args);};
  });
  await page.goto(url);await page.waitForSelector('[data-entry-state="failed"]');
  assert.equal(await page.locator('[data-entry="free"]').isVisible(),false);
  assert.match(await page.locator('#waitTxt').innerText(),/browser could not start/);
  assert.equal(await page.locator('#go').innerText(),'Retry');
  assert.equal(await page.locator('#templeTools').isVisible(),false);
  await page.evaluate(()=>{sessionStorage.allow3D='1';});
  await page.locator('#go').tap();await page.waitForSelector('[data-entry-state="ready"]',{timeout:90000});
  await page.locator('#share').tap();
  const invite=await page.evaluate(()=>window.sharedInvite);
  assert.equal(invite.text,'Visit Shaolin, learn cloud hands at Wudang and identify tea buds at Emei.');
  assert.equal(invite.url,page.url());
  await page.locator('#ttl').tap();assert.equal(await page.evaluate(()=>__g.GS.state),'menu');
  await page.locator('#howBtn').tap();assert.equal(await page.locator('#how').isVisible(),true);
  await page.locator('#howBtn').tap();
  await page.locator('[data-entry="free"]').tap();await page.waitForFunction(()=>__g.GS.state==='play'&&__g.WORLD.id==='town'&&__g.P.pos.z===48);
  const rites=page.locator('[data-a="rites"]'),tray=page.locator('#templeTools');
  assert.equal(await rites.isVisible(),false);
  for(const key of ['KeyJ','Digit1','Digit2','Digit3','Digit4'])await page.keyboard.press(key);
  assert.deepEqual(await page.evaluate(()=>[BEADS.isOpen(),__g.P.fish,__g.P.greetT,__g.P.mode]),[false,false,0,'walk']);
  await page.locator('[data-a="world"]').tap();
  await page.locator('#journeyAtlas[open]').waitFor();
  await page.locator('.atlas-close').tap();
  const originalView=await page.evaluate(()=>__g.P.view);
  await page.locator('[data-a="view"]').tap();
  assert.notEqual(await page.evaluate(()=>__g.P.view),originalView);
  await page.locator('#tPause').tap();await page.waitForSelector('[data-entry-state="paused"]');
  assert.equal(await page.locator('[data-entry="free"]').isVisible(),false);
  await page.locator('#go').tap();await page.waitForFunction(()=>__g.GS.state==='play');
  // Both resume and a fresh town entry are available on a returning visit.
  await page.evaluate(()=>__g.WORLD.go('temple'));
  await page.locator('#tPause').tap();await page.waitForSelector('[data-entry-state="paused"]');
  await page.reload();await page.locator('[data-entry="resume"]:enabled').waitFor();
  await page.locator('[data-entry="resume"]').tap();
  await page.waitForFunction(()=>__g.GS.state==='play'&&__g.WORLD.id==='temple');
  await rites.waitFor();assert.equal(await tray.isVisible(),false);
  await rites.tap();await tray.waitFor();
  await page.locator('[data-a="beads"]').tap();await page.locator('#bcv').tap();await page.locator('#bClose').tap();
  assert.equal(await page.evaluate(()=>BEADS.total),1);
  await page.evaluate(()=>__g.WORLD.go('town'));
  await rites.waitFor({state:'hidden'});assert.equal(await tray.isVisible(),false);
  await page.reload();await page.locator('[data-entry="free"]:enabled').waitFor();
  await page.locator('[data-entry="free"]').tap();
  await page.waitForFunction(()=>__g.GS.state==='play'&&__g.WORLD.id==='town'&&__g.P.pos.z===48);
  console.log('Passed: graphics retry, town entry and travel controls, region-specific rites, pause and saved return');
 }finally{await browser.close();}
}
verify().catch(error=>{console.error(error);process.exitCode=1;});
