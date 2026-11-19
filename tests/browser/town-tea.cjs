const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');

async function verify(){
 const browser=await chromium.launch({channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:960,height:640},locale:'zh-CN'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8000');
  await page.waitForFunction(()=>window.__g?.WORLD.atlas,null,{timeout:90000});
  await page.locator('[data-entry="free"]').click();
  await page.waitForFunction(()=>__g.WORLD.id==='town');
  async function walk(key,arrived){
   await page.keyboard.down(key);
   try{await page.waitForFunction(arrived,null,{timeout:90000});}
   catch(error){throw new Error(`Walk ${key} failed at ${await page.evaluate(()=>__g.P.pos.toArray())}`,{cause:error});}
   finally{await page.keyboard.up(key);}
  }
  await page.keyboard.down('ShiftLeft');await walk('KeyW',()=>__g.P.pos.z<=18);await page.keyboard.up('ShiftLeft');
  await walk('KeyD',()=>__g.P.pos.x>=14.8);
  await walk('KeyW',()=>__g.P.pos.z<=14.6);
  for(const label of ['温杯','置茶','注水']){
   try{await page.waitForFunction(label=>document.querySelector('#prompt').style.opacity==='1'&&document.querySelector('#pl').textContent.includes(label),label);}
   catch(error){throw new Error(`Missing ${label}: ${await page.evaluate(()=>JSON.stringify({pos:__g.P.pos.toArray(),view:__g.P.view,yaw:__g.P.yaw,prompt:document.querySelector('#pl').textContent}))}`,{cause:error});}
   await page.keyboard.press('KeyE');
  }
  await page.waitForFunction(()=>__g.WORLD.active.lesson.completed===1);
  await page.waitForFunction(()=>document.querySelector('#prompt').style.opacity==='1'&&document.querySelector('#pl').textContent.includes('端盏'));
  await page.keyboard.press('KeyE');await page.getByText('临水一盏',{exact:true}).waitFor();await page.keyboard.press('KeyE');
  await page.waitForFunction(()=>document.querySelector('#prompt').style.opacity==='1'&&document.querySelector('#pl').textContent.includes('温杯'));
  assert.equal(await page.evaluate(()=>__g.WORLD.active.lesson.completed),1);
  await page.keyboard.press('KeyM');await page.locator('#atlasBookTab').click();
  const trail=page.locator('.atlas-trails article').filter({hasText:'一叶到一盏'});
  assert.match(await trail.innerText(),/茶棚学茶（已完成）/);
  await trail.getByRole('button').click();assert.equal(await page.locator('.atlas-place-title').innerText(),'峨眉');
  await page.reload();await page.waitForFunction(()=>window.__g?.WORLD.atlas,null,{timeout:90000});
  await page.locator('[data-entry="free"]').click();
  await page.waitForFunction(()=>__g.GS.state==='play'&&__g.WORLD.id==='town'&&__g.P.mode==='walk');
  await page.keyboard.press('KeyM');await page.locator('#atlasBookTab').click();
  assert.match(await trail.innerText(),/茶棚学茶（已完成）/);
  assert.deepEqual(errors,[]);console.log('Passed: town gate → on-foot tea lesson → recorded trail → next stop → persisted journal');
 }finally{await browser.close();}
}
verify().catch(error=>{console.error(error);process.exitCode=1;});
