const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');

async function verify(){
 const browser=await chromium.launch({channel:'chrome'});
 try{
  const url=new URL(process.env.GAME_URL||'http://127.0.0.1:8854');
  url.searchParams.set('mp',process.env.RELAY_URL||'ws://127.0.0.1:8856/ws?c=world');
  const errors=[];
  async function visitor(name,x,yaw){
   const page=await browser.newPage({viewport:{width:1100,height:740},locale:'zh-CN'});
   page.on('pageerror',error=>errors.push(error.message));
   const received=[];
   page.on('websocket',socket=>socket.on('framereceived',frame=>{
    const data=JSON.parse(frame.payload);if(data.t==='sky')received.push(data);
   }));
   await page.addInitScript(({name,x,yaw})=>{
    localStorage.setItem('huashan-temple-v1',JSON.stringify({name,mp:1,view:'first',tod:3,todAt:Date.now(),journey:{last:'temple',places:{temple:{p:[x,3.5,-64],yaw,pitch:.12}}}}));
   },{name,x,yaw});
   await page.goto(url.href);await page.waitForFunction(()=>window.__g?.WORLD.atlas,null,{timeout:90000});
   await page.locator('[data-entry="resume"]').click();await page.waitForFunction(()=>__g.GS.state==='play'&&__g.MP.on);
   return {page,received};
  }
  const first=await visitor('听云',-.8,-.14),second=await visitor('望月',1.5,.38);
  const mutual=()=>[...__g.MP.peers.values()].some(peer=>peer.seen);
  await Promise.all([first.page.waitForFunction(mutual),second.page.waitForFunction(mutual)]);
  async function release(page,choice){
   await page.waitForFunction(()=>document.querySelector('#prompt').style.opacity==='1'&&document.querySelector('#pl').textContent.includes('放天灯'));
   await page.keyboard.press('KeyE');await page.locator('#cOpts button').first().waitFor();
   await page.keyboard.press(choice);
   await page.waitForFunction(()=>__g.WORLD.templeRoot.getObjectByName('sky-lantern:self'));
  }
  const theirs=()=>__g.WORLD.templeRoot.getObjectByName('sky-lantern:visitor')?.position.toArray();
  const count=page=>page.evaluate(()=>[__g.P.sky,JSON.parse(localStorage.getItem('huashan-temple-v1')).sky||0]);
  await release(first.page,'Digit1');await second.page.waitForFunction(theirs);
  assert.deepEqual(await count(first.page),[1,1]);assert.deepEqual(await count(second.page),[0,0]);
  const before=await second.page.evaluate(theirs);await second.page.waitForFunction(height=>__g.WORLD.templeRoot.getObjectByName('sky-lantern:visitor').position.y>height+.3,before[1]);
  await release(second.page,'Digit3');await first.page.waitForFunction(theirs);
  assert.deepEqual(await count(first.page),[1,1]);assert.deepEqual(await count(second.page),[1,1]);
  for(const visitor of [first,second]){
   assert.equal(visitor.received.length,1);assert.deepEqual(Object.keys(visitor.received[0]).sort(),['id','p','seed','t']);
   assert.equal(await visitor.page.evaluate(()=>__g.WORLD.templeRoot.children.filter(child=>child.name.startsWith('sky-lantern:')).length),2);
  }
  if(process.env.LANTERN_SHOT){
   await second.page.keyboard.press('KeyV');await second.page.keyboard.press('KeyH');
   await second.page.waitForTimeout(950);await second.page.screenshot({path:process.env.LANTERN_SHOT});
  }
  const late=await visitor('听泉',-2,-.35);
  await late.page.waitForFunction(()=>[...__g.MP.peers.values()].filter(peer=>peer.seen).length===2);
  assert.deepEqual(late.received,[]);assert.deepEqual(await count(late.page),[0,0]);
  assert.equal(await late.page.evaluate(()=>!!__g.WORLD.templeRoot.getObjectByName('sky-lantern:visitor')),false);
  await first.page.waitForFunction(()=>__g.WORLD.templeRoot.children.every(child=>!child.name.startsWith('sky-lantern:')),null,{timeout:60000});
  assert.deepEqual(await count(first.page),[1,1]);
  assert.deepEqual(errors,[]);console.log('Passed: reciprocal visible flights via Worker, private counts, late arrival without replay, expired flights removed');
 }finally{await browser.close();}
}
verify().catch(error=>{console.error(error);process.exitCode=1;});
