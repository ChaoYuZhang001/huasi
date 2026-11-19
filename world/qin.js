import {QIN_NOTES,QIN_PHRASE} from './qin-lesson.js';

// One reusable panel; scene instruments and their learning state belong to regions.
export function createQin(h){
 const ui=document.createElement('dialog');ui.id='qinLesson';ui.setAttribute('aria-labelledby','qinTitle');
 ui.innerHTML=`<header><div><small>昆仑 · 听雪琴院</small><h2 id="qinTitle">听弦</h2></div><button data-close aria-label="离开琴案">离开 · Esc</button></header><p data-copy role="status"></p><div class="qin-strings">${QIN_NOTES.map((_,i)=>`<button data-string="${i}" aria-label="拨第${i+1}弦"><i></i><span>${['一 · 低','二','三','四 · 中','五','六','七 · 高'][i]}</span></button>`).join('')}</div><footer><span data-progress></span><button data-listen>听一遍短句</button></footer>`;
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./qin.css',import.meta.url).href;document.head.append(css);document.body.append(ui);
 const copy=ui.querySelector('[data-copy]'),progress=ui.querySelector('[data-progress]'),listen=ui.querySelector('[data-listen]'),strings=[...ui.querySelectorAll('[data-string]')];
 let current=null,before=null,demo=-1,elapsed=0,glow=-1,glowTime=0,voices=[];
 function render(message){if(!current)return;const s=current.lesson.state;
  copy.textContent=message||(demo>=0?'听短句：低 → 中 → 高 → 中。弦位会随声音亮起。':s.stage==='explore'?'先拨一、四、七弦，听听低、中、高的变化。':s.stage==='follow'?'随短句拨弦：一 → 四 → 七 → 四。可以慢慢来。':'听弦小记已记入行旅。还可以自由拨弦。');
  progress.textContent=s.stage==='explore'?`已听 ${[0,3,6].filter(n=>s.heard.includes(n)).length} / 3 种音高`:s.stage==='follow'?`短句 ${s.progress} / 4`:'一 · 四 · 七 · 四';
  listen.textContent=demo>=0?'正在示范…':'听一遍短句';listen.disabled=demo>=0;
  strings.forEach((b,i)=>{b.classList.toggle('heard',s.heard.includes(i));b.classList.toggle('sounding',i===glow);b.disabled=demo>=0;b.setAttribute('aria-pressed',String(i===glow));});
 }
 function sound(n){glow=n;glowTime=.65;current.instrument.pluck(n);voices.push({stop:h.note(QIN_NOTES[n]),left:3.2});if(voices.length>12)voices.shift().stop();}
 function pluck(n){if(!current||demo>=0)return;sound(n);const result=current.lesson.pluck(n);current.save();render(result==='again'?'这一声与短句不同。看弦位提示，或再听一遍。':undefined);}
 function close(resume=true){if(!current)return;current.save();voices.forEach(v=>v.stop());voices=[];demo=-1;glow=-1;const old=before;current=null;before=null;ui.close();h.end(old,resume);}
 ui.querySelector('[data-close]').onclick=()=>close();listen.onclick=()=>{if(!current||demo>=0)return;demo=0;elapsed=0;sound(QIN_PHRASE[0]);render('听短句：低 → 中 → 高 → 中。弦位会随声音亮起。');};
 strings.forEach((b,i)=>b.onclick=()=>pluck(i));ui.addEventListener('cancel',e=>{e.preventDefault();close();});
 // Disabling the focused demonstration button can move focus to the document.
 // Capture instrument keys while open so they still work before focus returns.
 addEventListener('keydown',e=>{if(!current)return;if(e.code==='Escape'){e.preventDefault();e.stopPropagation();close();}else if(/^Digit[1-7]$/.test(e.code)){e.preventDefault();e.stopPropagation();if(!e.repeat)pluck(Number(e.code.at(-1))-1);}},{capture:true});
 ui.addEventListener('keydown',e=>{if(current)e.stopPropagation();});
 for(const type of['keyup','mousedown','mouseup','mousemove','wheel','touchstart','touchmove','touchend','click'])ui.addEventListener(type,e=>{if(current)e.stopPropagation();},{passive:true});
 return{get active(){return !!current;},
  open(config){if(current||!h.canStart())return false;current=config;before=h.begin(config.p,config.yaw);ui.showModal();render();strings[0].focus({preventScroll:true});return true;},close,
  tick(dt){if(!current)return;const step=Math.max(0,Math.min(.1,dt));voices=voices.filter(v=>(v.left-=step)>0);glowTime-=step;if(glowTime<=0&&glow>=0){glow=-1;render();}
   if(demo>=0){elapsed+=step;if(elapsed>=.85){elapsed-=.85;if(++demo>=QIN_PHRASE.length){demo=-1;render();strings[0].focus({preventScroll:true});}else{sound(QIN_PHRASE[demo]);render('听短句：低 → 中 → 高 → 中。弦位会随声音亮起。');}}}
  }
 };
}
