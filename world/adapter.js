import {openLedger,travelTrade} from './trade.js';
import {carvingGallery} from './carvings.js';
import {campusPost} from './campus-post.js';
import {STATIONS,SOUTH_STOPS,ALL_STOPS,ROAD_END,TOWN_END,origin,station,nearestStation,walkingHint,addApproachCollision,buildHighroad,directions} from './highroad.js';
import {buildWudang} from './wudang.js';
import {buildEmei} from './emei.js';
import {buildHuashan} from './huashan.js';
import {buildKunlun} from './kunlun.js';
import {buildKongtong} from './kongtong.js';
import {buildMing} from './ming.js';
import {buildBeggar} from './beggar.js';
import {buildEscort} from './escort.js';
import {createRegions} from './regions.js';
import {createPractice} from './practice.js';
import {resourcesOf,releaseRegion} from './resources.js';
import {createAtlas} from './atlas.js';
import {PLACES} from './atlas-data.js';
import {createQin} from './qin.js';
import {installGateWalk} from './gate-walk.js';
import {buildTown} from './town.js';

import {waystopBuilders} from './waystops.js';

const builders={...waystopBuilders,town:buildTown,roads:buildHighroad,wudang:buildWudang,emei:buildEmei,huashan:buildHuashan,kunlun:buildKunlun,kongtong:buildKongtong,ming:buildMing,beggar:buildBeggar,escort:buildEscort};

export function installWorld(h) {
  const {THREE,scene,P,GS,WORLD,collections,builders:b}=h;
  const {cols,cushions,IA,npcs,pois}=collections;
  const root=new THREE.Group();root.name='region:temple';
  for(const child of [...scene.children])if(!h.shared(child))root.add(child);
  scene.add(root);WORLD.templeRoot=root;
  // A fixed light count keeps materials on the same shader program across gates.
  // Only sources in the player's active room contribute to this small light pool.
  const lamps=Array.from({length:6},()=>{const l=new THREE.PointLight(0xffffff,0,18,1.8);scene.add(l);return l;});
  function sources(group){const list=[];group.traverse(o=>{if(o.isPointLight){list.push(o);o.visible=false;}});return list;}
  const templeLights=sources(root);
  let selected=[],lightRegion=null,lightTime=0;
  function updateLights(region,dt){
    const list=region.id==='temple'?templeLights:region.sources;
    lightTime-=dt;
    if(region!==lightRegion||lightTime<=0){
      selected=(list||[]).filter(l=>l.intensity>.001&&l.position.distanceToSquared(P.pos)<(l.distance+8)**2)
       .sort((a,b)=>a.position.distanceToSquared(P.pos)-b.position.distanceToSquared(P.pos)).slice(0,lamps.length);
      lightRegion=region;lightTime=.1;
    }
    lamps.forEach((l,i)=>{const source=selected[i];l.intensity=source?.intensity||0;if(source){l.position.copy(source.position);l.color.copy(source.color);l.distance=source.distance;l.decay=source.decay;}});
  }
  const journey=h.savedJourney&&typeof h.savedJourney==='object'?h.savedJourney:{};
  journey.learned=journey.learned&&typeof journey.learned==='object'?journey.learned:{};
  const earlierWorkshopVisit=journey.learned['ming-five-flags'];
  if(earlierWorkshopVisit){
    const current=journey.learned['ming-workshops'];
    if(Number.isSafeInteger(earlierWorkshopVisit.times)&&earlierWorkshopVisit.times>0&&
       (!Number.isSafeInteger(current?.times)||current.times<earlierWorkshopVisit.times)){
      journey.learned['ming-workshops']=earlierWorkshopVisit;
    }
    delete journey.learned['ming-five-flags'];
  }
  journey.visited=Array.isArray(journey.visited)?journey.visited.filter(x=>typeof x==='string'):[];
  journey.places=journey.places&&typeof journey.places==='object'?journey.places:{};
  journey.states=journey.states&&typeof journey.states==='object'?journey.states:{};
  const validPose=(value,id)=>value&&Array.isArray(value.p)&&value.p.length===3&&value.p.every(Number.isFinite)&&
    Math.abs(value.p[0])<(id==='roads'?814:87)&&value.p[2]>-146&&value.p[2]<72&&value.p[1]>=-.5&&value.p[1]<30&&Number.isFinite(value.yaw)
      ?{p:[...value.p],yaw:value.yaw,pitch:Number.isFinite(value.pitch)?value.pitch:0}:null;
  const capture=()=>({arrays:Object.fromEntries(Object.entries(collections).map(([k,v])=>[k,v.slice()])),nav:h.captureNav()});
  const restore=data=>{for(const [key,list] of Object.entries(data.arrays)){const target=collections[key];target.length=0;for(const item of list)target.push(item);}h.restoreNav(data.nav);};
  const pose=()=>({p:P.pos.toArray(),yaw:P.yaw,pitch:P.pitch});
  const rememberState=region=>{if(region?.snapshot)journey.states[region.id]=region.snapshot();};
  const refreshGuide=()=>{if(WORLD.active?.guideText)h.guide(WORLD.active.guideText());};
  const save=()=>h.saveJourney(journey);
  const ledger=openLedger(journey,save);
  const trade=travelTrade({ledger,save,card:h.card,message:h.message,places:PLACES,
    current:()=>WORLD.id,go:id=>regions.go(id),visit:id=>journey.visited.includes(id),sit:h.sit});
  WORLD.openPurse=()=>{if(GS.state==='play'&&P.mode==='walk'&&!h.modal())trade.openPurse();};
  const learn=key=>{journey.learned[key]={at:Date.now(),times:(journey.learned[key]?.times||0)+1};rememberState(WORLD.active);refreshGuide();const amount=ledger.earn(key==='fist-match'?'切磋':'完成课业',key==='fist-match'?8:4,key==='fist-match'?14:9);h.receipt(amount);};
  const practice=createPractice({THREE,avatar:h.avatar,canStart:()=>GS.state==='play'&&P.mode==='walk'&&!h.modal(),begin:h.beginPractice,end:h.endPractice,learn,message:h.message,sound:h.sound});
  WORLD.practice=practice;
  const qin=createQin({canStart:()=>GS.state==='play'&&P.mode==='walk'&&!h.modal(),begin:h.beginQin,end:h.endQin,note:h.note});
  WORLD.qin=qin;
  let regions;
  const retained=()=>resourcesOf(scene,h.sharedResources());
  const dispose=region=>releaseRegion(region.root,{retained});

  function* stages(id,buildRegion,savedState,immediate=false){

    let previous=capture(),before=new Set(scene.children);
    const nextRoot=new THREE.Group();
    nextRoot.name='region:'+id;nextRoot.visible=false;scene.add(nextRoot);
    for(const list of Object.values(collections))list.length=0;
    const gallery=carvingGallery(THREE,b.solo,h.refreshShadows,retained);
    const roomLamps=[],walkerPlans=[];
    const on=(key,p,r,label,act)=>IA.push({id:key,p,r,label:typeof label==='function'?label:()=>label,act});
    const addNpc=(name,p,yaw,look={},talk)=>{
      const school=look.school??(['wudang','emei','huashan','kunlun','kongtong','ming','beggar'].includes(id)&&!look.visitor?id:undefined);const f=h.figure({...look,school,role:name});nextRoot.add(f.g);h.tag(f,name);
      const q={f,p:new THREE.Vector3(...p),ci:-1,tx:-1,poi:null,st:'fixed',fixed:true,t:0,dur:1e9,yaw,y0:yaw,ox:0,oz:0,gd:0,greetT:0,gy:0,
        upd(q){q.yaw=h.turn(q.yaw,q.y0,.04);f.swing=0;f.bob=Math.sin(q.t*.8)*.006;return[0,0];}};
      f.g.position.copy(q.p);f.g.rotation.y=yaw;npcs.push(q);
      if(talk)on('npc:'+name,q.p.clone().add(new THREE.Vector3(0,1.3,0)),3.2,'问候 · '+name,()=>{
        q.greetT=2.2;q.gy=Math.atan2(P.pos.x-q.p.x,P.pos.z-q.p.z);h.card({title:name,body:`<p>${talk}</p>`});
      });
      return q;
    };
    try {
      let definition=buildRegion({...b,roomLamp:(x,y,z)=>roomLamps.push(b.point(x,y,z))},{
        carving(name,x,y,z,height,turn,fallback,file='schools/'+name){
          gallery.place(file,'carving:'+name,new THREE.Vector3(x,y,z),height,turn,fallback);
        },
        root:nextRoot,on,trade,ledger,npc:addNpc,visitor:()=>P,practice,qin,savedState:savedState??journey.states[id],
        checkpoint(){rememberState(WORLD.active);refreshGuide();h.saveJourney(journey);},
        rest(key,p,yaw,label,options={}){on(key,p.clone().add(new THREE.Vector3(0,.6,0)),2.5,label,()=>h.sit({p,yaw,...options}));},
        walkers(points,count){walkerPlans.push({points,count});},
        travel:to=>h.card({title:station(to)?.name||'问路',body:'<p>'+directions(id,to,P.pos.x)+'</p>'}),message:h.message,sound:name=>h.sound(name),
        card:(title,sub,body)=>h.card({title,sub,body:`<p>${body}</p>`}),
        learn
      });
      if(typeof definition?.next==='function'){
        const work=definition;let result=work.next();
        while(!result.done){
          if(immediate){result=work.next();continue;}
          for(const child of [...scene.children])if(child!==nextRoot&&!before.has(child))nextRoot.add(child);
          const partial=Object.fromEntries(Object.entries(collections).map(([k,v])=>[k,v.slice()]));
          const batch=h.exchangeBuild();restore(previous);
          immediate=yield;
          // Walking, NPCs and other travel may have updated the live world between slices.
          previous=capture();before=new Set(scene.children);h.exchangeBuild(batch);
          for(const [key,list] of Object.entries(partial)){collections[key].length=0;for(const item of list)collections[key].push(item);}
          result=work.next();
        }
        definition=result.value;
      }
      if(id!=='roads'&&id!=='town'){
        const entry=station(id),side=entry.edge<0?1:-1,z=entry.edge+side*5;
        b.at(-3.9,0,z);b.B(.16,1.4,.16,0,0,0,b.M.woodDark);
        b.plaque('驿车',0,1.22,.1,{h:.48,bg:'#3b3f32',fg:'#efe1be'});
        on(id+':carriage',new THREE.Vector3(-3.25,1.15,z),2.6,'驿车 · 雇车远行',()=>trade.transport(false));
      }
      const post=campusPost(b,id,P,h.card);if(post)IA.push(post);
      addApproachCollision(b,id);
      h.flush(nextRoot,id==='town'||id==='wudang');
      for(const child of [...scene.children])if(child!==nextRoot&&!before.has(child))nextRoot.add(child);
      h.rebuildNav(definition.spawn.p,id);
      for(const plan of walkerPlans){
        for(const p of plan.points){const c=h.cellOf(...p);if(c<0||!Number.isFinite(h.navH[c]))continue;
          pois.push({p,c,y:h.navH[c],face:Math.PI,act:'gaze',f:h.fieldFrom(c)});}
        for(let i=0;i<plan.count&&pois.length;i++){
          const po=pois[i%pois.length],q=addNpc(['歇脚客','挑担客','过桥人','看书人','远行客','卖茶客','候镖人','听水人'][i%8],[po.p[0],po.y,po.p[1]],po.face,{visitor:true,robe:i%5,hat:i%2===0,bun:i%3===1,bag:true});
          Object.assign(q,{fixed:false,poi:po,ci:po.c,st:'act',dur:5+i,ox:(i%3-1)*.22,oz:0});
        }
      }
      const lights=[];nextRoot.traverse(o=>{if(o.isPointLight)lights.push({o,base:o.intensity});});
      let roomLight;
      if(roomLamps.length){
        roomLight=new THREE.PointLight(0xffdcab,0,18,1.8);
        roomLight.name='hall-lantern';nextRoot.add(roomLight);
      }
      const saved=validPose(journey.places[id],id);
      const result={...definition,root:nextRoot,data:capture(),sources:sources(nextRoot),lights,gallery,roomLamps,roomLight,
        returnPose:saved&&h.safePose(saved)?saved:null};
      // Preserve accessor diagnostics for browser verification.
      Object.defineProperty(result,'lesson',{get:()=>definition.lesson});
      restore(previous);
      return result;
    } catch(error){
      const extra=h.drainBuild();
      for(const child of [...scene.children])if(child!==nextRoot&&!before.has(child))nextRoot.add(child);
      releaseRegion(nextRoot,{retained,extra});restore(previous);throw error;
    }
  }

  let warming=null;
  const failedPreloads=new Set();
  function build(id,builder,state){
    const cached=warming?.id===id?warming:null;
    if(cached)warming=null;
    if(cached?.result){finishPreview(cached);return cached.result;}
    const work=cached?.work||stages(id,builder,state,true);
    let step;do{step=work.next(true);}while(!step.done);
    return step.value;
  }
  function finishPreview(job){
    if(!job.pending)return;
    for(const mesh of job.pending)mesh.visible=true;
    job.pending=null;
  }
  function preview(job){
    const region=job.result;
    if(!job.pending){
      const [x,z]=origin(region.id);region.root.position.set(x,0,z);
      region.root.visible=true;const meshes=[];region.root.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
      job.pending=meshes.reverse();
      for(const mesh of meshes)mesh.visible=false;
      region.root.visible=true;
    }
    // Give the renderer a few material batches at a time so buffers and their
    // bounds are ready before the whole neighbouring courtyard enters view.
    let vertices=0,count=0;
    while(job.pending.length&&vertices<18000&&count<24){
      const mesh=job.pending.pop();mesh.visible=true;
      vertices+=mesh.geometry?.attributes.position?.count||0;count++;
    }
  }
  function streamApproach(){
    if(regions.busy||regions.current.id!=='roads'||P.mode!=='walk'){
      if(warming?.result)warming.result.root.visible=false;return;
    }
    const heading=Math.abs(P.vel.x)>.35?Math.sign(P.vel.x):0;
    const candidate=ALL_STOPS.filter(s=>!failedPreloads.has(s.id)&&!regions.get(s.id)&&(s.x-P.pos.x)*heading>=-3&&Math.abs(P.pos.x-s.x)<(s.edge<0?104:190))
      .sort((a,b)=>Math.abs(P.pos.x-a.x)-Math.abs(P.pos.x-b.x))[0];
    if(warming?.result&&warming.id!==candidate?.id){dispose(warming.result);warming=null;}
    if(!warming&&candidate)warming={id:candidate.id,work:stages(candidate.id,builders[candidate.id])};
    if(!warming)return;
    if(warming.result){warming.result.root.visible=true;preview(warming);return;}
    try{
      const step=warming.work.next();
      if(step.done){warming.result=step.value;h.warmShaders(step.value.root);}
    }catch(error){failedPreloads.add(warming.id);warming=null;console.warn('Unable to preload approach',error);}
  }

  regions=createRegions({capture,restore,pose,build,dispose,
    remember(region,visit){journey.places[region.id]=visit.returnPose;rememberState(region);if(!journey.visited.includes(region.id))journey.visited.push(region.id);},
    rollback(region,arrival){WORLD.id=region.id;WORLD.active=region;P.pos.fromArray(arrival.p);P.camY=P.pos.y;P.yaw=arrival.yaw;P.pitch=arrival.pitch;h.switchPresence(region.id);},
    canTravel:()=>GS.state==='play'&&P.mode==='walk'&&!h.modal(),
    beginTravel(){h.stopWalk();h.resetInput();P.mode='travel';P.vel.set(0,0,0);h.fade(1);},
    keep:region=>region.id==='roads'||region.root.visible,
    load:id=>{if(!builders[id])throw new Error('Unknown road');return builders[id];},
    enter(region,arrival){region.root.position.set(0,0,0);WORLD.id=region.id;WORLD.active=region;
      P.pos.fromArray(arrival.p);P.camY=P.pos.y;P.yaw=arrival.yaw;P.pitch=arrival.pitch??-.08;P.avYaw=P.yaw+Math.PI;P.eye=1.65;P.onG=true;
      P.vel.set(0,0,0);h.resetEffects();h.guide(region.guideText?.()||region.guide);h.switchPresence(region.id);h.refreshShadows();
      if(!journey.visited.includes(region.id))journey.visited.push(region.id);journey.last=region.id;h.saveJourney(journey);
      h.intro(region.name,region.subtitle||(region.id==='temple'?'山风未止 · 钟声未歇':'过桥游街 · 临水学茶 · 客栈歇脚'));h.message(region.name+' · 已到');},
    failed(error){console.warn('Region load failed; restored current scene',error);h.message('这段山路暂未能打开，请稍后再试。');},
    endTravel(){P.mode='walk';h.fade(0);}
  },{limit:4});
  // Gate marker on the return path.
  const before=new Set(scene.children);
  IA.push(campusPost(b,'temple',P,h.card));
  b.at(-3.8,0,57);b.B(.16,1.4,.16,0,0,0,b.M.woodDark);b.plaque('驿车',0,1.24,.1,{h:.48});
  IA.push({id:'temple:carriage',p:new THREE.Vector3(-3.35,1.15,57),r:2.6,label:()=>'驿车 · 雇车远行',act:()=>trade.transport(false)});
  h.flush(root);
  for(const child of [...scene.children])if(!before.has(child))root.add(child);
  h.updateCollisionCount();
  installGateWalk(h,root);
  const town=build('town',buildTown);
  const templePose=validPose(journey.places.temple);
  regions.start({id:'temple',name:'嵩山少林寺',root,spawn:{p:[0,0,54],yaw:0},returnPose:templePose&&h.safePose(templePose)?templePose:null,guide:h.templeGuide},town);
  WORLD.id=town.id;WORLD.active=town;WORLD.go=regions.go;
  P.pos.fromArray(town.spawn.p);P.camY=P.pos.y;P.yaw=town.spawn.yaw;P.avYaw=P.yaw+Math.PI;P.pitch=-.08;
  h.switchPresence(town.id);h.refreshShadows();
  const roads=regions.prepare('roads',buildHighroad);
  function layout(visible){
    const [ox,oz]=origin(regions.current.id);
    for(const id of regions.ids){
      const region=regions.get(id),[x,z]=origin(id);
      region.root.position.set(x-ox,0,z-oz);region.root.visible=visible.includes(id);
    }
    regions.trim();
  }
  let layoutKey='',destination=null;
  function arrive(id){
    if(destination!==id)return;
    destination=null;h.message('已步行抵达'+station(id).name);
  }
  function show(ids){
    const key=regions.current.id+'|'+ids.join(',');
    if(key===layoutKey)return;
    for(const id of ids)if(!regions.get(id))regions.prepare(id,builders[id]);
    layout(ids);layoutKey=key;h.refreshShadows();
  }
  function cross(next){
    const [x,z]=origin(regions.current.id),[nx,nz]=origin(next.id);
    if(!regions.cross(next))return;
    P.pos.x+=x-nx;P.pos.z+=z-nz;h.shiftWalk(x-nx,z-nz);
    WORLD.id=next.id;WORLD.active=next;h.resetEffects();h.switchPresence(next.id);
    h.guide(next.guideText?.()||next.guide);arrive(next.id);WORLD.saveLocation();
  }
  WORLD.walkRoad=()=>{
    if(P.mode!=='walk'||regions.busy)return;
    const current=regions.current;
    if(current.id==='roads'){
      const near=nearestStation(P.pos.x);
      const ids=['roads',...STATIONS.filter(s=>Math.abs(P.pos.x-s.x)<130).map(s=>s.id)];
      const south=nearestStation(P.pos.x,SOUTH_STOPS);
      if(Math.abs(P.pos.x-south.x)<(south.id==='town'?85:60)&&P.pos.z>-6)ids.push(south.id);
      show(ids);
      if(Math.abs(P.pos.x-near.x)<2.98&&P.pos.z<=ROAD_END)cross(regions.get(near.id));
      else if(Math.abs(P.pos.x-south.x)<2.98&&P.pos.z>=TOWN_END)cross(regions.get(south.id));
    }else{
      const s=station(current.id),townSide=s.edge<0,distance=(P.pos.z-s.edge)*(townSide?-1:1);
      show(distance>-100?[current.id,'roads']:[current.id]);
      if(Math.abs(P.pos.x)<2.98&&distance>.04)cross(roads);
    }
    if(current!==regions.current){layoutKey='';layout(regions.ids.filter(id=>regions.get(id).root.visible));}
  };
  layout(['town','roads']);
  WORLD.beginTown=()=>{h.guide(town.guideText());h.intro(town.name,'南门长街 · 临水茶棚');WORLD.saveLocation();};
  WORLD.locate=p=>regions.current.locate?.(p)||regions.current.name;
  WORLD.tick=dt=>{streamApproach();practice.tick(dt);qin.tick(dt);const r=regions.current;updateLights(r,dt);if(r.id==='temple')return;
    if(r.roomLight){
      let closest=null,minDistance=18*18;
      for(const lamp of r.roomLamps){
        const distance=P.pos.distanceToSquared(lamp);
        if(distance<minDistance){closest=lamp;minDistance=distance;}
      }
      if(closest)r.roomLight.position.copy(closest);
      r.roomLight.intensity=closest?38*(.8+h.lamp()*.2):0;
    }
    r.gallery?.update(P.pos,performance.now()/1000);r.tick?.(dt);for(const l of r.lights)l.o.intensity=l.base*(.6+h.lamp()*.5);};
  const hint=id=>walkingHint(regions.current.id,id,P.pos.x,P.pos.z);
  WORLD.walkingGuide=()=>destination?('去'+station(destination).name+' · '+hint(destination)):'';
  WORLD.atlas=createAtlas({journey,current:()=>regions.current.id,target:()=>destination,mark:id=>{destination=id;},
    mapAnchor:()=>regions.current.id==='roads'?nearestStation(P.pos.x,P.pos.z>3.5?SOUTH_STOPS:P.pos.z<-3.5?STATIONS:ALL_STOPS).id:regions.current.id,
    directions:id=>regions.current.id==='roads'?hint(id):directions(regions.current.id,id,P.pos.x),
    canOpen:()=>GS.state==='play'&&P.mode==='walk'&&!h.modal(),save:()=>WORLD.saveLocation(),begin:h.beginAtlas,end:h.endAtlas});
  WORLD.routes=()=>WORLD.atlas.open();
  WORLD.regions=regions;WORLD.journey=journey;
  WORLD.saveLocation=()=>{if(GS.state!=='play'||P.mode==='travel')return;
    journey.last=regions.current.id;journey.places[journey.last]=pose();if(!journey.visited.includes(journey.last))journey.visited.push(journey.last);rememberState(regions.current);h.saveJourney(journey);};
  const lastStop=()=>journey.last==='roads'?{name:'山间驿道'}:PLACES.find(place=>place.region&&place.region===journey.last);
  WORLD.lastStopName=()=>lastStop()?.name;
  WORLD.resume=()=>{if(lastStop()&&journey.last!==WORLD.id)return regions.go(journey.last);
    const saved=validPose(journey.places.town);if(saved&&h.safePose(saved)){P.pos.fromArray(saved.p);P.camY=P.pos.y;P.yaw=saved.yaw;P.pitch=saved.pitch;}
    WORLD.beginTown();};
  return WORLD;
}
