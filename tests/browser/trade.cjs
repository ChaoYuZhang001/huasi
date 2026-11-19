const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const {visit}=require('./walk.cjs');

(async()=>{
 const url=(process.env.GAME_URL||'http://127.0.0.1:8000').replace(/\/$/,'')+'/';
 const browser=await chromium.launch({channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:960,height:640},locale:'zh-CN'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route(url,async route=>{
   const res=await route.fetch(),html=await res.text();
   const harness=`window.shopTest={visit:${visit.toString()},face(id){
    const target=IA.find(i=>i.id===id),v=target.p.clone().sub(P.pos);
    P.view='first';P.yaw=Math.atan2(-v.x,-v.z);P.pitch=Math.atan2(target.p.y-P.camY-P.eye,Math.hypot(v.x,v.z));
    updCamera(.05);findIA();return curIA?.id;},
    tick(n){for(let i=0;i<n;i++)WORLD.practice.tick(.05);},
    edge(sprint){P.pos.set(62,0,0);P.camY=0;P.vel.set(0,0,0);P.onG=true;P.yaw=Math.PI;keys.KeyW=true;keys.ShiftLeft=sprint;
     for(let i=0;i<100;i++){if(i===27)keys.Space=true;updPlayer(.05);WORLD.walkRoad();}
     keys.KeyW=keys.ShiftLeft=keys.Space=false;return [WORLD.id,...P.pos.toArray()];}};`;
   await route.fulfill({response:res,body:html.replace('window.__g={',harness+'window.__g={')});
  });
  await page.goto(url);await page.locator('[data-entry="free"]:enabled').waitFor({timeout:90000});
  await page.locator('#entryCharacter input[value=m]').check();
  await page.locator('#setBtn').click();await page.locator('#pace').selectOption('brisk');await page.locator('#qMode').selectOption('smooth');
  await page.locator('[data-entry="free"]').click();
  const balance=()=>page.evaluate(()=>__g.WORLD.journey.purse.balance);
  const purse=()=>page.evaluate(()=>__g.WORLD.journey.purse);
  const pick=i=>page.keyboard.press('Digit'+(i+1));
  async function act(id){
   const walk=await page.evaluate(id=>shopTest.visit(id),id);assert.ok(!walk.error,JSON.stringify(walk));
   const seen=await page.evaluate(id=>shopTest.face(id),id);assert.equal(seen,id,'Looking at '+id);
   await page.keyboard.press('KeyE');
  }
  assert.equal(await balance(),0);
  for(const id of ['town:tea-order','town:meals-order','town:sleep']){
   await act(id);await pick(0);assert.equal(await page.evaluate(()=>__g.P.mode),'sit');await page.keyboard.press('KeyE');
   await page.waitForFunction(()=>__g.P.mode==='walk');
  }
  assert.equal(await balance(),0);
  await act('town:reading');await pick(0);const first=await balance();assert(first>=4&&first<=8);
  for(let i=0;i<8;i++){await act('town:parcel');assert((await purse()).parcel);await act('town:deliver');}
  const wages=await balance();assert(wages>=first+56&&wages<=first+96);
  await act('town:shop');await pick(0);assert.equal(await balance(),wages-24);
  await act('town:shop');await pick(1);await pick(0);assert.equal((await purse()).sales,1);
  for(const [id,cost] of [['town:tea-order',2],['town:meals-order',4],['town:sleep',6]]){
   const before=await balance();await act(id);await pick(1);assert.equal(await balance(),before-cost);
   await page.keyboard.press('KeyE');await page.waitForFunction(()=>__g.P.mode==='walk');
  }
  await act('town:fruit-offering');await pick(0);assert.equal((await purse()).offerings,1);
  await act('town:carriage');let opts;
  for(let i=0;i<5;i++){
   opts=await page.locator('#cOpts button').allTextContents();
   const menu=opts.findIndex(x=>x.includes('柳巷拳馆'));
   if(menu>=0){await pick(menu);break;}await pick(opts.length-1);
  }
  await page.waitForFunction(()=>__g.WORLD.id==='fist');await act('fist:mentor');await pick(0);
  async function perform(){
   await page.waitForFunction(()=>__g.WORLD.practice.active);
   for(let i=0;i<3;i++){await page.evaluate(()=>shopTest.tick(71));await page.keyboard.press('KeyE');}
   await page.waitForFunction(()=>!__g.WORLD.practice.active);
  }
  await perform();await act('fist:mentor');await pick(1);await perform();
  const afterMatch=await purse();assert(afterMatch.apprentice);assert(await page.evaluate(()=>__g.WORLD.journey.learned['fist-match'].times===1));
  await page.keyboard.press('KeyB');await pick(0);await pick(0);await page.waitForFunction(()=>__g.WORLD.id==='town');
  assert.equal(await balance(),afterMatch.balance-14);
  await page.reload();await page.locator('[data-entry="resume"]:enabled').waitFor({timeout:90000});await page.locator('[data-entry="resume"]').click();
  assert.equal(await balance(),afterMatch.balance-14);assert.equal((await purse()).sales,1);assert.equal(await page.evaluate(()=>__g.P.gender),'m');
  await page.evaluate(()=>__g.WORLD.go('roads'));
  for(const sprint of [false,true]){
   const [region,x,y,z]=await page.evaluate(s=>shopTest.edge(s),sprint);
   assert.equal(region,'roads');assert.equal(x,62);assert(Math.abs(y+.27)<.0001);assert(z>=7.35&&z<=7.58,'Stopped on the grassy verge at '+z);
  }
  assert.deepEqual(errors,[]);console.log('Passed: reference avatar, free and paid meals and lodging, book knowledge and delivery wages, trading stall, offerings, coach, tuition, sparring, portal, save and cliff edges.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
