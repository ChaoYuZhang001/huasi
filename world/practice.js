import {samplePractice} from './presence.js';
import {practiceSword,swordPose,releaseSword} from './sword.js';
import {practiceFists,fistPose,releaseFists} from './fist.js';
const clamp=v=>Math.max(0,Math.min(1,v));
const lessons={1:{names:['起势','云手','收势'],label:'云手练习',key:'wudang-cloudhands',title:'云手一式',copy:'跟着眼前道人，慢慢展开双手'},2:{names:['提剑','平刺','收剑'],label:'木剑练习',key:'huashan-sword',title:'木剑三式',copy:'看清教习的手臂与剑尖，再随式练习'},3:{names:['守式','出拳','收势'],label:'空拳练习',key:'kongtong-fist',title:'空拳三式',copy:'看清教习的肩肘与腰身，缓缓随式'}};

// The lesson clock advances only while the game is playing. A deliberate follow
// action is required for each movement; cancelling never awards a completion.
export function lessonClock(){
 let active=false,phase=0,time=0;
 return{
  start(){if(active)return false;active=true;phase=time=0;return true;},
  tick(dt){if(active)time+=Math.max(0,Math.min(.1,dt));},
  advance(){if(!active)return'inactive';const u=(time%5)/5;if(u<.55||u>.95)return'waiting';
   if(++phase===3){active=false;return'complete';}time=0;return'advanced';},
  cancel(){active=false;},
  get state(){const u=(time%5)/5;return{active,phase,time,u,ready:active&&u>=.55&&u<=.95};}
 };
}

// Original shoulder/elbow groups stay in use. These authored poses are shared by
// the player and the facing instructor; no external animation or mesh is loaded.
export function cloudHands(f,phase,t){
 const u=clamp(t),ease=v=>v*v*(3-2*v),rise=ease(Math.min(1,u*2));
 let l=-.12,r=-.12,le=-.12,re=-.12,lz=0,rz=0,waist=0;
 if(phase===0){l=r=-1.05*rise;le=re=-.12-.7*rise;lz=.2*rise;rz=-lz;}
 else if(phase===1){const w=Math.sin(u*Math.PI*2),v=Math.cos(u*Math.PI*2);
   const fan=Math.sin(Math.PI*u)**2;l=-1.05-.25*w;r=-1.05+.25*w;le=-.82+.25*w;re=-.82-.25*w;lz=.2+.4*fan*(.5+.5*w);rz=-.2-.4*fan*(.5-.5*w);waist=w*.24;
 }else{const k=1-ease(u);l=r=-1.05*k;le=re=-.12-.7*k;lz=.2*k;rz=-lz;}
 f.upper.rotation.set(.025,waist,0);f.upper.position.y-=.035*(phase===2?1-u:rise);
 f.armL.rotation.set(l,0,lz);f.armR.rotation.set(r,0,rz);
 f.elbL.rotation.set(le,0,0);f.elbR.rotation.set(re,0,0);f.head.rotation.y=waist*.5;
}

export function createPractice(h){
 const clock=lessonClock();let before=null,teacher=null,kind=1,match=false,local=false;
 function prepare(f,type){if(type===2&&!f.practiceSword){f.practiceSword=practiceSword(h.THREE);f.elbR.add(f.practiceSword);}if(f.practiceSword)f.practiceSword.visible=type===2;
  if(type===3&&!f.practiceFists){f.practiceFists=practiceFists(h.THREE);f.elbL.add(f.practiceFists[0]);f.elbR.add(f.practiceFists[1]);}for(const g of f.practiceFists||[])g.visible=type===3;}
 function reset(f){if(!f)return;if(f.practiceSword)f.practiceSword.visible=false;for(const g of f.practiceFists||[])g.visible=false;f.upper.rotation.y=f.upper.rotation.z=f.head.rotation.y=0;}
 function pose(f,type,phase,u){prepare(f,type);(type===3?fistPose:type===2?swordPose:cloudHands)(f,phase,u);}
 const ui=document.createElement('section');ui.className='world-practice';ui.hidden=true;ui.setAttribute('aria-label','云手练习');
 ui.innerHTML='<strong></strong><p class="wp-copy"></p><div class="wp-track"><i></i></div><div class="wp-buttons"><button type="button" data-follow>随式 · E</button><button type="button" data-cancel>收势离开</button></div>';
 const style=document.createElement('style');style.textContent=`.world-practice{position:fixed;z-index:12;bottom:max(24px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:min(360px,calc(100vw - 24px));padding:14px 18px;background:#172321eb;border:1px solid #a39166;border-radius:10px;color:#efe6d3;font:14px/1.6 system-ui;text-align:center;box-sizing:border-box}.world-practice[hidden]{display:none}.world-practice strong{font-size:18px;letter-spacing:3px}.wp-copy{margin:6px 0}.wp-track{height:4px;background:#c9ba8a33;margin:9px 0 12px}.wp-track i{display:block;height:100%;width:0;background:#c9b682}.wp-buttons{display:flex;gap:10px}.wp-buttons button{flex:1;min-height:44px;border:1px solid #ad9a70;border-radius:5px;background:#354b43;color:#f3ead7;font:inherit}.wp-buttons button:last-child{background:transparent;border-color:#687167}`;
 document.head.append(style);document.body.append(ui);
 const title=ui.querySelector('strong'),copy=ui.querySelector('p'),track=ui.querySelector('i');
 function finish(complete,resume=true){if(!before)return;clock.cancel();ui.hidden=true;reset(h.avatar?.());h.end(before,resume);before=null;teacher=null;
  if(complete){const l=lessons[kind];h.learn(match?'fist-match':local?'fist-study':l.key);h.message((match?'对拍切磋完成':l.title)+' · '+l.names.join('、')+'，已记入行旅。');}
  else h.message((kind===2?'收剑':'收势')+'站定 · 随时可以再来练习。');
 }
 function advance(){const s=clock.state;if(match&&s.active&&(s.u<.67||s.u>.83)){h.message('看木尺走入对拍区，再应这一拍');return 'waiting';}const result=clock.advance();if(result==='complete')finish(true);else if(result==='advanced')h.sound('bowl');else if(result==='waiting')h.message('看动作走完半程，亮起时再随式。');return result;}
 ui.querySelector('[data-follow]').onclick=e=>{e.stopPropagation();advance();};ui.querySelector('[data-cancel]').onclick=e=>{e.stopPropagation();finish(false);};
 return{
  get active(){return clock.state.active;},get state(){return{...clock.state,kind};},
  start(p,yaw,npc,type=1,form=''){if(!lessons[type]||!h.canStart()||!clock.start())return false;kind=type;match=form==='match';local=!!form;teacher=npc;before=h.begin(p,yaw);ui.setAttribute('aria-label',lessons[kind].label);ui.querySelector('[data-cancel]').textContent=kind===2?'收剑离开':'收势离开';ui.hidden=false;return true;},
  advance,cancel:(resume=true)=>finish(false,resume),
  tick(dt){clock.tick(dt);const s=clock.state;if(!s.active)return;
   const l=lessons[kind];title.textContent=`${match?'切磋':'随式'} · ${l.names[s.phase]}　${s.phase+1}/3`;const ready=match?s.u>=.67&&s.u<=.83:s.ready;copy.textContent=ready?'此时随式 · 按 E 或轻触按钮':l.copy;track.style.width=`${s.u*100}%`;track.style.background=ready?'#a4d4af':'#c9b682';},
  pose(f){const s=clock.state;if(s.active)pose(f,kind,s.phase,s.u);},
  packet(){const s=clock.state;return s.active?[kind,s.phase,Math.floor(s.u*1000)/1000]:null;},
  remotePose(f,value,elapsed){const p=samplePractice(value,elapsed);if(p)pose(f,p[0],p[1],p[2]);else reset(f);},
  prepare,release(f){releaseSword(f);releaseFists(f);},
  teacherPose(f,t,type=1){const s=clock.state;if(s.active&&f===teacher)pose(f,kind,s.phase,s.u);else pose(f,type,Math.floor(t/5)%3,(t%5)/5);}
 };
}
