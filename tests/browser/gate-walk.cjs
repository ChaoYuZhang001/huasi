const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');

async function verify(){
 const browser=await chromium.launch({channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800},locale:'zh-CN'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>localStorage.setItem('huashan-temple-v1',JSON.stringify({journey:{last:'temple'}})));
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8000');
  await page.waitForFunction(()=>window.__g?.WORLD.atlas,null,{timeout:90000});
  await page.locator('[data-entry="resume"]').click();
  async function prompt(label){await page.waitForFunction(label=>document.querySelector('#prompt').style.opacity==='1'&&document.querySelector('#pl').textContent.includes(label),label);}
  async function walk(key,arrived){
   await page.keyboard.down(key);try{await page.waitForFunction(arrived,null,{timeout:60000});}finally{await page.keyboard.up(key);}
  }
  await prompt('与阿岚同行');
  const obstruction=await page.evaluate(async()=>{
   const route=(await import('/world/gate-walk.js')).createGateWalk();route.invite();
   while(route.phase==='leading'){
    const {x,z}=route.step(.05,route.position,false),height=__g.navH[__g.cellOf(x,z)];
    if(!Number.isFinite(height)||__g.cols.some(box=>box.y1>height+.5&&box.y0<height+1.7&&x>=box.x0-.28&&x<=box.x1+.28&&z>=box.z0-.28&&z<=box.z1+.28))return {x,z,height};
   }
   return null;
  });
  assert.equal(obstruction,null,JSON.stringify(obstruction));
  if(process.env.GATE_SHOT)await page.screenshot({path:process.env.GATE_SHOT});
  await page.keyboard.press('KeyE');
  await page.waitForFunction(()=>{
   const guide=__g.IA.find(item=>item.id==='temple:lantern-guide').p;
   return Math.hypot(guide.x-__g.P.pos.x,guide.z-__g.P.pos.z)>5.5;
  });
  const location=()=>page.evaluate(()=>__g.IA.find(item=>item.id==='temple:lantern-guide').p.toArray());
  const waited=await location();await page.waitForTimeout(350);assert.deepEqual(await location(),waited);
  await walk('KeyD',()=>__g.P.pos.x>=1.08);
  await walk('KeyW',()=>__g.P.pos.z<=29.7);
  await walk('KeyD',()=>__g.P.pos.x>=4.1);
  await walk('KeyW',()=>__g.P.pos.z<=27.7);
  await page.waitForFunction(()=>document.querySelector('#msg').textContent.includes('这张红案'),null,{timeout:30000});
  await prompt('请香');await page.keyboard.press('KeyE');
  assert.equal(await page.evaluate(()=>__g.P.inc),1);
  await page.waitForFunction(()=>__g.IA.find(item=>item.id==='temple:lantern-guide').p.z>29);
  await page.close();
  const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,locale:'en-US'});
  mobile.on('pageerror',error=>errors.push(error.message));
  await mobile.addInitScript(()=>localStorage.setItem('huashan-temple-v1',JSON.stringify({journey:{last:'temple'}})));
  await mobile.goto(process.env.GAME_URL||'http://127.0.0.1:8000');
  await mobile.waitForFunction(()=>window.__g?.WORLD.atlas,null,{timeout:90000});
  await mobile.locator('[data-entry="resume"]').tap();
  await mobile.getByRole('button',{name:'Follow',exact:true}).tap();
  await mobile.waitForFunction(()=>__g.IA.find(item=>item.id==='temple:lantern-guide').p.z<50);
  assert.deepEqual(errors,[]);console.log('Passed: gate invitation → waits for player → walks through gate → hands off to incense table → guide returns; touch invitation');
 }finally{await browser.close();}
}
verify().catch(error=>{console.error(error);process.exitCode=1;});
