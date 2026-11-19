const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');

const {visit}=require('./walk.cjs');

async function verify(){
 const url=process.env.GAME_URL||'http://127.0.0.1:8000';
 const browser=await chromium.launch({channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:960,height:640},locale:'zh-CN'});
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  page.on('console',msg=>{if(msg.type()==='error'&&msg.text().includes('Shader Error'))errors.push(msg.text());});
  // Drive the production locomotion and collision step at fixed time intervals.
  // The visitor starts at the normal spawn. Every metre is travelled by walking.
  await page.route(url.replace(/\/$/,'')+'/',async route=>{
   const response=await route.fetch(),html=await response.text();
   assert(html.includes('window.__g={'));
   const hook=`window.roadTest={visit:${visit.toString()},step(){updPlayer(.05);WORLD.walkRoad();},aim(yaw){P.yaw=yaw;},
    face(item){
     const dx=item.x-P.pos.x,dz=item.z-P.pos.z;P.view='first';
     P.yaw=Math.atan2(-dx,-dz);P.pitch=Math.atan2(item.y-P.camY-P.eye,Math.hypot(dx,dz));
     updCamera(.033);camera.updateMatrixWorld(true);findIA();
    },
    soffitHits(x,y,z,dx,dz){
     scene.updateMatrixWorld(true);
     const dir=new V3(-dx,.32,-dz),distance=dir.length();
     const ray=new THREE.Raycaster(new V3(x+dx,y-.32,z+dz),dir.normalize(),distance-.001,distance+.001);
     ray.camera=camera;
     return ray.intersectObjects(WORLD.active.root.children,true).filter(hit=>hit.face?.normal.y<-.99).length;
    },
    surfaces(x,y,z,dx=0,dz=0){
     scene.updateMatrixWorld(true);
     const direction=new V3(-dx,-.4,-dz),range=direction.length()+.6;
     const raycaster=new THREE.Raycaster(new V3(x+dx,y,z+dz),direction.normalize(),0,range);
     raycaster.camera=camera;return raycaster.intersectObjects(WORLD.active.root.children,true).filter(h=>h.face.normal.y>.9).map(h=>Number(h.point.y.toFixed(4)));}};`;
   await route.fulfill({response,body:html.replace('window.__g={',hook+'window.__g={')});
  });
  await page.goto(url);await page.waitForFunction(()=>window.__g?.WORLD.active,null,{timeout:120000});
  await page.locator('[data-entry="free"]').click();
  assert.deepEqual(await page.evaluate(()=>[__g.WORLD.id,...__g.P.pos.toArray()]),['town',0,0,48]);
  await page.keyboard.press('KeyM');await page.locator('[data-place="wudang"]').click();
  await page.locator('.atlas-go').click();
  assert.equal(await page.evaluate(()=>__g.WORLD.id),'town');
  await page.getByText('去武当 · 沿长街向北，过石桥出镇',{exact:true}).waitFor();
  await page.keyboard.press('KeyM');
  await page.getByRole('button',{name:'取消步行指引'}).click();
  assert.equal(await page.evaluate(()=>__g.WORLD.walkingGuide()),'');
  await page.keyboard.press('KeyM');await page.locator('[data-place="wudang"]').click();
  await page.getByRole('button',{name:'步行去武当'}).click();
  const stations=await page.evaluate(async()=>(await import('./world/highroad.js')).STATIONS);
  async function walk(x,z,id){
   await page.keyboard.down('KeyW');
   try{await page.evaluate(async({x,z,id})=>{
    const {origin}=await import('./world/highroad.js'),{P,WORLD}=__g;
    const position=()=>{const [ox,oz]=origin(WORLD.id);return [P.pos.x+ox,P.pos.z+oz];};
    for(let i=0;i<16000;i++){
     const [px,pz]=position(),dx=x-px,dz=z-pz;
     if(Math.hypot(dx,dz)<.22&&WORLD.id===id)return;
     roadTest.aim(Math.atan2(-dx,-dz));roadTest.step();
     const [ax,az]=position();
     if(Math.hypot(ax-px,az-pz)>.33||P.pos.y<-.5||P.mode!=='walk')throw Error('Interrupted walk at '+[WORLD.id,ax,az,P.mode,P.pos.y]);
     if(i===15999)throw Error('Blocked at '+[WORLD.id,px,pz]+' on the way to '+[id,x,z]);
    }
   },{x,z,id});}finally{await page.keyboard.up('KeyW');}
  }
  // Cross the town bridge, pass the rest area, and join the trunk road.
  await walk(1.5,136,'town');await walk(1.5,92,'town');
  for(const id of ['town:caishen','town:caishen-incense','town:route']){
   const stop=await page.evaluate(id=>roadTest.visit(id),id);
   assert.ok(!stop.error,JSON.stringify(stop));
   if(id==='town:route')continue;
   await page.waitForFunction(()=>__g.WORLD.active.root.getObjectByName('carving:zhao-gongming')?.getObjectByProperty('isMesh',true)?.material.map?.image);
   await page.evaluate(id=>roadTest.face(__g.IA.find(item=>item.id===id).p),id);
   await page.keyboard.press('KeyE');
   if(id==='town:caishen'){
    await page.waitForFunction(()=>document.querySelector('#cTitle').textContent==='赵公明'&&document.querySelector('#cSub').getClientRects().length);
    await page.keyboard.press('KeyE');
   }else await page.waitForFunction(()=>__g.WORLD.active.root.getObjectByName('town:caishen-incense')?.visible);
  }
  const street=await page.evaluate(()=>roadTest.visit('main-street',[1.5,1.4,-28.5]));assert.ok(!street.error,JSON.stringify(street));
  await walk(1.5,57,'town');await walk(0,42,'town');await walk(0,0,'roads');
  assert.match(await page.evaluate(()=>__g.WORLD.walkingGuide()),/向东到武当岔口/);
  const landmarks={
 temple:['gate-images','kings','three-buddhas','kinnara','patriarchs','guests','quarters','library','abbot','snow','vairocana','white-robes','pine-grove','monk-gardener','monk-copyist','monk-gate','monk-attendant','monk-guest','monk-library-keeper','monk-meals','monk-quarters-keeper','monk-acolyte'],
 wudang:['guardians','reception','tea','npc:十方堂知客','daodejing','cloudhands','npc:问道弟子','npc:张三丰','sanqing-practice','sanqing','sanqing-incense','zhenwu','parents'],emei:['maitreya','central','sword-house','tea-board','seven','puxian','puxian-incense','npc:峨眉知客僧'],
 huashan:['npc:玉泉院道人','chen','chen-incense','council','berth','npc:巡山师兄','bridge','sunrise'],kongtong:['offering','npc:皇城值殿道人','zhenwu','zhenwu-incense','jade','teachings','elders','npc:拳院掌事','fist','stone'],
 escort:['flag'],kunlun:['berth','hosts','board','npc:琴院主人','qin','valley'],ming:['watch','flame','camp:metal','camp:wood','npc:木作匠','camp:water','npc:水车匠','camp:fire','camp:earth','ledger','council','hall:0','passage'],beggar:['landing','stores','npc:分粥人','water','rice','stir','serve','stories','npc:摆渡客']
};
  const shrineTitles={'wudang:daodejing':'道德经','kongtong:offering':'献殿','npc:十方堂知客':'十方堂知客','npc:峨眉知客僧':'峨眉知客僧','npc:玉泉院道人':'玉泉院道人','npc:皇城值殿道人':'皇城值殿道人','npc:木作匠':'木作匠','npc:水车匠':'水车匠','npc:摆渡客':'摆渡客','escort:flag':'平川镖旗','beggar:stories':'渡口的竹篙','ming:council':'石灯院议事大厅','ming:flame':'石灯院 · 石灯广场','temple:pine-grove':'后山松径','temple:monk-gardener':'护林僧 · 行茂','temple:monk-copyist':'抄经僧 · 明澈','kongtong:teachings':'三教洞','kunlun:hosts':'听雪客堂','wudang:sanqing':'三清','temple:monk-gate':'山门接引 · 行信','temple:monk-guest':'知客 · 净闻','temple:monk-library-keeper':'藏主 · 行简','temple:monk-acolyte':'侍者 · 慧印','temple:monk-attendant':'殿堂香灯 · 慧朗','temple:monk-meals':'典座 · 明俭','temple:monk-quarters-keeper':'寮元 · 净修','ming:watch':'关楼交接记','beggar:stores':'物资棚','kunlun:board':'窗边棋局','npc:琴院主人':'琴院主人','npc:巡山师兄':'巡山师兄','npc:拳院掌事':'拳院掌事','emei:maitreya':'弥勒','emei:seven':'七佛','wudang:guardians':'龙虎二将','wudang:zhenwu':'真武大帝','npc:张三丰':'张三丰','npc:问道弟子':'问道弟子','emei:tea-board':'一芽两叶','emei:puxian':'普贤菩萨'};
  const icons={
   'wudang:sanqing':['lingbao','yuanshi','daode'],'wudang:guardians':['dragon-general','tiger-general'],'wudang:zhenwu':['zhenwu'],'wudang:parents':['father','mother'],
   'emei:maitreya':['budai'],'emei:central':['shakyamuni'],'emei:seven':Array.from({length:7},(_,i)=>'seven-'+(i+1)),
   'emei:puxian':['puxian'],'huashan:chen':['chen'],'kongtong:zhenwu':['zhenwu'],
   'kongtong:jade':['jade'],'kongtong:teachings':['grotto-buddha','daoist','scholar']
  };
  const visited=[],walked=[];
  for(const s of [stations[4],...stations.slice(5),...stations.slice(0,4).reverse()]){
   await walk(s.x,0,'roads');await walk(s.x,-56,s.id);
   if(s.id==='wudang')assert.equal(await page.evaluate(()=>__g.WORLD.walkingGuide()),'');
   const seams={
    wudang:[[1.68,4.45,-23.36],[-7.4,3.86,-48.3]],emei:[[19.13,5.66,-77.84],[5.13,5.66,-63.19]],
    kunlun:[[-.75,2.66,8.14]],kongtong:[[20.84,.26,43.14],[-33.516,5.435,1.116],[-26.172,8.435,-42.896]],
    huashan:[[-26.83,.26,47.14],[23.707,4.825,-.768]],ming:[[1.4,3.1,-26.13],[36.57,2.825,-34.234],[14.57,2.825,-47.012]],
    beggar:[[34.93,.20,42.83],[29.3933,.45,-24.768],[50.707,.45,-24.896]],escort:[[14.828,.035,-5.768]]
   };
   for(const [x,y,z] of seams[s.id]||[]){
    // Follow the same patch of paving from above and two grazing angles.
    const samples=await page.evaluate(([x,y,z])=>[[0,0],[2.1,-.7],[-1.6,1.4]].map(([dx,dz])=>roadTest.surfaces(x,y+.4,z,dx,dz)),[x,y,z]);
    for(const heights of samples)assert.equal(heights.filter(h=>Math.abs(h-y)<.002).length,1,s.id+' paving at '+[x,y,z]);
   }
   if(s.id==='wudang'){
    for(const [x,z] of [[1.3,4.2],[-5.1,3.7],[6.2,5.1]]){
     const top=await page.evaluate(([x,z])=>roadTest.surfaces(x,4,z),[x,z]);
     assert(Math.abs(Math.max(...top)-3.665)<.002,'Walkway hides the practice court inlay at '+[x,z]);
    }
   }
   if(s.id==='temple'){
    for(const [x,y,z] of [[-40.48,4.5,4.97],[-24.88,6.8,-56.53],[-24.93,6.8,-61.48]]){
     const counts=await page.evaluate(([x,y,z])=>[[0,0],[.31,-.13],[-.56,.4]].map(([a,b])=>roadTest.soffitHits(x,y,z,a,b)),[x,y,z]);
     assert.deepEqual(counts,[1,1,1],'coplanar soffit at '+[x,y,z]);
    }
    const grove=await page.evaluate(()=>({
     ground:roadTest.surfaces(-18.24,4.1,-114.24),
     seats:__g.cushions.filter(c=>c.p.z===-118&&c.p.y===3.5).length
    }));
    assert.equal(grove.ground.filter(y=>Math.abs(y-3.5)<.002).length,1);
    assert.equal(grove.seats,2);
    await walk(1.16,-64,'temple');await walk(1.16,-73,'temple');await walk(0,-79,'temple');
    const levels=await page.evaluate(()=>roadTest.surfaces(2.13,2.9,-7.37));
    assert.equal(levels.filter(y=>Math.abs(y-2.35)<.005).length,1,'Main hall floor must have one exposed face');
    if(process.env.GATE_SHOT){await walk(1.16,-73,'temple');await walk(1.16,-64,'temple');await walk(0,-55,'temple');await page.evaluate(()=>roadTest.aim(0));await page.waitForTimeout(250);await page.screenshot({path:process.env.GATE_SHOT});}
   }
   if(landmarks[s.id]&&s.id!=='escort'){
    const postId=s.id==='temple'?'temple:town':s.id+':return';
    const point=await page.evaluate(id=>__g.IA.find(a=>a.id===id).p.toArray(),postId);
    for(const [side,sub] of [[1,'入门游线'],[-1,'返程驿路']]){
     const [x,y,z]=point;
     const approach=await page.evaluate(point=>roadTest.visit('post',point),[x-.8,y,z+side*1.8]);
     assert.ok(!approach.error,JSON.stringify(approach));
     await page.evaluate(([x,y,z])=>roadTest.face({x,y,z}),point);
     await page.keyboard.press('KeyE');
     await page.waitForFunction(sub=>document.querySelector('#cSub').textContent===sub&&document.querySelector('#cSub').getClientRects().length,sub,{timeout:7000});
     await page.keyboard.press('KeyE');
    }
   }
   for(const name of landmarks[s.id]||[]){
    const id=name.startsWith('npc:')?name:s.id+':'+name;
    const result=await page.evaluate(id=>roadTest.visit(id),id);
    assert.ok(!result.error,JSON.stringify(result));walked.push(result);
    if(icons[id])await page.waitForFunction(names=>names.every(name=>__g.WORLD.active.root.getObjectByName('carving:'+name)?.getObjectByProperty('isMesh',true)?.material.map?.image),icons[id],{timeout:45000});
    if(id.endsWith('-incense')){
     await page.evaluate(id=>roadTest.face(__g.IA.find(item=>item.id===id).p),id);
     await page.keyboard.press('KeyE');
     await page.waitForFunction(id=>__g.WORLD.active.root.getObjectByName(id)?.visible,id,{timeout:6000});
     const offering=await page.evaluate(id=>({
      end:__g.WORLD.active.snapshot().incenseUntil,
      prompt:__g.IA.find(item=>item.id===id).label()
     }),id);
     assert(offering.end>Date.now(),id+' failed to save');
     assert.equal(offering.prompt,null,id+' still offers while lit');
    }
    if(id==='temple:library'){
     const texts=new Set();
     for(let i=0;i<5;i++){
      await page.evaluate(id=>roadTest.face(__g.IA.find(item=>item.id===id).p),id);
      await page.keyboard.press('KeyE');
      await page.waitForFunction(()=>document.querySelector('#cTitle').textContent==='藏经'&&document.querySelector('#cSub').getClientRects().length);
      texts.add(await page.locator('#cSub').innerText());
      await page.keyboard.press('KeyE');
     }
     assert.deepEqual(texts,new Set(['《心经》','《金刚经》','《六祖坛经》']));
    }
    if(id==='wudang:sanqing-practice'){
     await page.evaluate(id=>roadTest.face(__g.IA.find(item=>item.id===id).p),id);await page.keyboard.press('KeyE');
     await page.waitForFunction(()=>__g.P.mode==='practice');
     await page.locator('.world-practice [data-cancel]').click();
     await page.waitForFunction(()=>__g.P.mode==='walk');
    }
    if(id.endsWith(':berth')||id==='wudang:tea'){
     await page.evaluate(id=>roadTest.face(__g.IA.find(item=>item.id===id).p),id);
     await page.keyboard.press('KeyE');
     if(id==='wudang:tea'){
      await page.waitForFunction(()=>document.querySelector('#msg').textContent.includes('茶盏温热'),null,{timeout:6000});
     }else{
      await page.waitForFunction(()=>__g.P.mode==='sit',null,{timeout:6000});
      await page.keyboard.press('KeyE');
      await page.waitForFunction(()=>__g.P.mode==='walk',null,{timeout:6000});
     }
    }
    if(shrineTitles[id]){
     await page.evaluate(id=>roadTest.face(__g.IA.find(item=>item.id===id).p),id);
     await page.keyboard.press('KeyE');
     await page.waitForFunction(title=>document.querySelector('#cTitle').textContent===title&&document.querySelector('#cTitle').getClientRects().length,shrineTitles[id],{timeout:7000});
     if(id==='kongtong:teachings')assert.match(await page.locator('#cBody').innerText(),/释迦牟尼、太上老君、孔子/);
     if(id==='kunlun:hosts')assert.match(await page.locator('#cBody').innerText(),/旧棋盘/);
     await page.keyboard.press('KeyE');
    }
   }
   if(landmarks[s.id]){
    const result=await page.evaluate(edge=>roadTest.visit('south-exit',[.5,1.4,Math.floor(edge-4)+.5]),s.edge);
    assert.ok(!result.error,JSON.stringify(result));
   }
   visited.push(s.name);await walk(s.x,0,'roads');
  }
  const south=await page.evaluate(async()=>(await import('./world/highroad.js')).SOUTH_STOPS.filter(s=>s.id!=='town').sort((a,b)=>a.x-b.x));
  for(const s of south){
   await walk(s.x,0,'roads');
   await page.keyboard.press('KeyM');await page.locator('[data-place="'+s.id+'"]').click();
   await page.getByRole('button',{name:'步行去'+s.name,exact:true}).click();
   assert.match(await page.evaluate(()=>__g.WORLD.walkingGuide()),/沿南路/);
   await walk(s.x,39,s.id);
   const [host,resident]=await page.evaluate(async id=>{const site=(await import('./world/waystop-data.js')).WAYSTOPS[id];return [site.host,site.resident[0]];},s.id);
   for(const action of ['route','npc:'+host,'work:0','work:1','rest','npc:'+resident]){
    const id=action.startsWith('npc:')?action:s.id+':'+action;
    const result=await page.evaluate(id=>roadTest.visit(id),id);
    assert.ok(!result.error,JSON.stringify(result));walked.push(result);
    await page.evaluate(id=>roadTest.face(__g.IA.find(item=>item.id===id).p),id);
    await page.keyboard.press('KeyE');
    if(action==='route'||action.startsWith('npc:')){
     await page.waitForFunction(title=>document.querySelector('#cTitle').textContent===title&&document.querySelector('#cSub').getClientRects().length,action==='route'?s.name:action.slice(4),{timeout:5500});
     await page.keyboard.press('KeyE');
    }else if(action==='rest'){
     await page.waitForFunction(()=>__g.P.mode==='sit',null,{timeout:5500});
     await page.keyboard.press('KeyE');await page.waitForFunction(()=>__g.P.mode==='walk');
    }else{
     const step=action==='work:0'?1:2;
     assert.equal(await page.evaluate(()=>__g.WORLD.active.snapshot().step),step,id);
     if(step===2){
      assert(await page.evaluate(id=>__g.WORLD.active.root.getObjectByName(id+':finished-work').visible,s.id));
      assert.equal(await page.evaluate(id=>__g.WORLD.journey.learned[id+'-visit'].times,s.id),1);
     }
     if(s.id==='persia'&&step===1){
      await page.reload({waitUntil:'commit'});await page.locator('[data-entry="resume"]:enabled').click({timeout:90000});
      await page.waitForFunction(()=>__g.WORLD.id==='persia'&&__g.GS.state==='play');
      assert.equal(await page.evaluate(()=>__g.WORLD.active.snapshot().step),1);
     }
    }
   }
   const exit=await page.evaluate(()=>roadTest.visit('north-exit',[.25,1.4,-32.6]));
   assert.ok(!exit.error,JSON.stringify(exit));visited.push(s.name);await walk(s.x,0,'roads');
  }
  await walk(0,0,'roads');await walk(0,38,'town');
  await page.keyboard.press('KeyM');await page.locator('#atlasBookTab').click();
  assert.equal(await page.locator('.atlas-visits button').count(),20);
  for(const s of south)assert.equal(await page.evaluate(id=>__g.WORLD.journey.learned[id+'-visit'].times,s.id),1);
  await page.locator('.atlas-close').click();
  assert.deepEqual(errors,[]);if(process.env.WALK_RESULTS)require('node:fs').writeFileSync(process.env.WALK_RESULTS,JSON.stringify(walked,null,2));
  console.log(walked.length+' interior stops. '+'Walked from town and back through '+visited.join('、'));
 }finally{await browser.close();}
}
verify().catch(err=>{console.error(err);process.exitCode=1;});
