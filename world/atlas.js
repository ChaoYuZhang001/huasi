import {PLACES,ROADS,SHORTCUTS,placeById,placeForRegion,routeBetween,journalEntries,journalTrails,unfinished} from './atlas-data.js';

export function createAtlas(h){
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./atlas.css',import.meta.url).href;document.head.append(css);
 const dialog=document.createElement('dialog');dialog.id='journeyAtlas';dialog.setAttribute('aria-labelledby','atlasTitle');
 dialog.innerHTML=`<header class="atlas-header"><div><p class="atlas-eyebrow">山川有路 · 来去从容</p><h2 id="atlasTitle">三四行旅图</h2></div><p class="atlas-header-note">游览各地，歇一歇，学一点。</p><button class="atlas-close" aria-label="收起行旅图">×</button></header>
 <div class="atlas-tabs" role="tablist" aria-label="行旅内容"><button id="atlasMapTab" role="tab" aria-selected="true" aria-controls="atlasMap">天下图</button><button id="atlasBookTab" role="tab" aria-selected="false" aria-controls="atlasBook" tabindex="-1">行旅簿</button></div>
 <section id="atlasMap" class="atlas-main" role="tabpanel" aria-labelledby="atlasMapTab"><div class="atlas-map-section"><div class="atlas-toolbar"><span class="atlas-map-help">拖动看图 · 点地名查看</span><button data-center>回到所在</button><button class="atlas-zoom" data-zoom="-.1" aria-label="缩小地图">−</button><button class="atlas-zoom" data-zoom=".1" aria-label="放大地图">＋</button></div><div class="atlas-viewport" aria-label="江湖地图，可向各方向滚动"><div class="atlas-canvas"></div></div></div>
 <aside class="atlas-detail" aria-label="目的地详情"><div class="atlas-detail-body"><span class="atlas-status"></span><h3 class="atlas-place-title"></h3><p class="atlas-kind"></p><dl class="atlas-facts"><div><dt>游览</dt><dd data-fact="visit"></dd></div><div><dt>歇脚</dt><dd data-fact="rest"></dd></div><div><dt>学习</dt><dd data-fact="learn"></dd></div></dl><p class="atlas-note"></p><p class="atlas-progress" hidden></p><p class="atlas-route"></p><p class="atlas-message" role="status"></p></div><button class="atlas-go"></button></aside></section>
 <section id="atlasBook" class="atlas-journal" role="tabpanel" aria-labelledby="atlasBookTab" hidden><h3>路上留下的记忆</h3><p class="atlas-journal-summary"></p><div class="atlas-visits"></div><h3>主题游线</h3><div class="atlas-trails"></div><h3>学过的事情</h3><div class="atlas-learning"></div><p class="atlas-empty" hidden>还没有学习记录。去茶棚试一盏茶，或到太极坪随道人学一式云手。</p></section>
 <footer class="atlas-footer"><span class="atlas-legend"><i class="atlas-dot"></i>所在</span><span class="atlas-legend"><i class="atlas-dash"></i>途经岔口</span><span class="atlas-legend"><i class="atlas-water"></i>水路</span><span>示意图 · 行走以路碑为准</span><span class="atlas-footer-note">M / Esc 收起 · 1–9、0 查看地点</span></footer>`;
 document.body.append(dialog);
 const $=s=>dialog.querySelector(s),viewport=$('.atlas-viewport'),canvas=$('.atlas-canvas'),buttons=new Map();
 let opened=false,selected='shaolin',zoom=.9,before=null,drag=null,suppressClick=false;
 const svgNS='http://www.w3.org/2000/svg',svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox','0 0 1000 690');svg.setAttribute('aria-hidden','true');canvas.append(svg);
 function shape(tag,attrs,parent=svg){const node=document.createElementNS(svgNS,tag);for(const [k,v]of Object.entries(attrs))node.setAttribute(k,String(v));parent.append(node);return node;}
 // Quiet contour masses leave the readable destination layer in front.
 shape('path',{d:'M40 80 Q170 -10 310 80 T550 95 Q650 60 800 120 L830 250 Q710 310 620 240 T340 275 Q210 320 50 280 Z',fill:'#d4dac2',opacity:'.65'});
 shape('path',{d:'M55 350 Q190 270 310 335 Q400 400 330 490 L380 630 Q250 680 120 610 L85 465 Z',fill:'#d0d8be',opacity:'.65'});
 shape('path',{d:'M400 510 Q550 460 650 535 L700 660 L410 670 Q470 600 400 510 Z',fill:'#d5dcc5',opacity:'.8'});
 shape('path',{d:'M930 0 Q885 175 935 270 T920 440 Q910 520 960 560 L1000 690 L1000 0 Z',fill:'#c3d5d2',opacity:'.75'});
 shape('path',{d:'M120 330 Q160 400 280 390 T460 460 Q650 400 780 465 T990 510',fill:'none',stroke:'#9ebcb8','stroke-width':12,opacity:'.55'});
 shape('path',{d:'M120 330 Q160 400 280 390 T460 460 Q650 400 780 465 T990 510',fill:'none',stroke:'#d2e1d9','stroke-width':5});
 for(const [x,y,n]of[[60,78,4],[265,70,4],[350,180,3],[605,90,4],[100,510,4],[410,535,3]])for(let i=0;i<n;i++){
  const px=x+i*24,py=y+Math.sin(i*1.7)*13;shape('path',{d:`M${px-21} ${py+23} L${px} ${py-14} L${px+25} ${py+23} M${px-7} ${py-1} L${px+1} ${py+5} L${px+7} ${py-3}`,fill:'none',stroke:'#9ca98d','stroke-width':1.2,opacity:'.55'});
 }
 const labels=[['西域雪山',172,38],['关陇山道',455,40],['嵩山古寺',748,65],['川江渡口',167,310],['中原市井',560,275],['江南水乡',830,285],['巴蜀云山',215,510],['江汉道山',535,510],['沿海与远洋',850,510]];
 for(const [title,x,y]of labels){const t=shape('text',{x,y,fill:'#6c7d63','font-size':17,'font-family':'serif','letter-spacing':4,'text-anchor':'middle',opacity:'.78'});t.textContent=title;}
 const roads=shape('g',{}),roadNodes=[];
 for(const [a,b,kind]of ROADS){const p=placeById(a),q=placeById(b),dx=q.x-p.x,dy=q.y-p.y,bend=Math.min(45,Math.hypot(dx,dy)*.14),mx=(p.x+q.x)/2-dy/Math.max(1,Math.hypot(dx,dy))*bend,my=(p.y+q.y)/2+dx/Math.max(1,Math.hypot(dx,dy))*bend;
  const open=!!(p.region&&q.region),n=shape('path',{d:`M${p.x} ${p.y} Q${mx} ${my} ${q.x} ${q.y}`,fill:'none',stroke:kind==='water'?'#7d9da2':'#a6aa91','stroke-width':open?2:1.3,'stroke-dasharray':open?'none':kind==='water'?'7 5':'3 5',opacity:'.75'},roads);roadNodes.push({a,b,n,open,kind});}
 shape('path',{d:'M945 80 L945 35 M936 49 L945 35 L954 49',stroke:'#6f7b68','stroke-width':1.4,fill:'none'});shape('text',{x:945,y:100,'text-anchor':'middle',fill:'#6f7b68','font-size':13}).textContent='北';
 for(const p of PLACES){const b=document.createElement('button');b.className='atlas-place'+(!p.region?' planned':'');b.dataset.place=p.id;b.style.left=p.x/10+'%';b.style.top=p.y/6.9+'%';const name=document.createElement('span');name.textContent=p.name;const status=document.createElement('small');b.append(name,status);canvas.append(b);buttons.set(p.id,b);
  b.addEventListener('click',()=>{if(!suppressClick)select(p.id);});b.addEventListener('focus',()=>select(p.id));
  b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const v={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];let best=null,score=Infinity;
   for(const q of PLACES){const dx=q.x-p.x,dy=q.y-p.y,forward=dx*v[0]+dy*v[1],cross=Math.abs(dx*v[1]-dy*v[0]);if(forward<=0)continue;const cost=Math.hypot(dx,dy)+cross*2;if(cost<score){score=cost;best=q;}}
   if(best){buttons.get(best.id).focus({preventScroll:true});center(best.id);}});
 }
 function select(id){const p=placeById(id);if(!p)return;selected=id;const current=h.current(),visited=new Set(h.journey.visited||[]),isHere=p.region===current;
  for(const q of PLACES){const b=buttons.get(q.id),here=q.region===current,seen=!!q.region&&(visited.has(q.region)||here);b.classList.toggle('current',here);b.classList.toggle('visited',seen);b.setAttribute('aria-pressed',q.id===id);b.querySelector('small').textContent=here?'你在这里':seen?'已到过':q.region?'可前往':'规划中';b.setAttribute('aria-label',`${q.name}，${b.querySelector('small').textContent}`);}
  const status=$('.atlas-status');status.textContent=isHere?'你在这里':p.region?'已开放':'规划中 · 尚未开放';status.classList.toggle('planned',!p.region);
  $('.atlas-place-title').textContent=p.name;$('.atlas-kind').textContent=p.kind+' · '+p.area;for(const key of['visit','rest','learn'])$(`[data-fact="${key}"]`).textContent=p[key];
  $('.atlas-note').textContent=(p.region?'':'以下内容为驻地规划。')+(p.note||'');
  const progress=unfinished(h.journey,p.region);$('.atlas-progress').textContent=progress;$('.atlas-progress').hidden=!progress;
  const path=routeBetween(placeForRegion(h.mapAnchor())?.id,id);$('.atlas-route').textContent=isHere?'你已在此处。':p.region?h.directions(p.region):'驻地建成后再开放行旅。';
  $('.atlas-go').disabled=!p.region;$('.atlas-go').textContent=isHere?'收图 · 继续游览':!p.region?'尚未开放':h.target()===p.region?'取消步行指引':'步行去'+p.name;$('.atlas-message').textContent='';
  const edges=new Set(path.slice(1).map((id,i)=>[id,path[i]].sort().join(':')));for(const {a,b,n,open,kind}of roadNodes){const active=edges.has([a,b].sort().join(':'));n.setAttribute('stroke',active?'#a36c45':kind==='water'?'#7d9da2':'#a6aa91');n.setAttribute('stroke-width',active?3:open?2:1.3);n.setAttribute('opacity',active?1:.75);}
 }
 function size(value){const cx=(viewport.scrollLeft+viewport.clientWidth/2)/(1000*zoom),cy=(viewport.scrollTop+viewport.clientHeight/2)/(690*zoom);zoom=Math.max(.75,Math.min(1.25,value));canvas.style.width=1000*zoom+'px';canvas.style.height=690*zoom+'px';viewport.scrollLeft=cx*1000*zoom-viewport.clientWidth/2;viewport.scrollTop=cy*690*zoom-viewport.clientHeight/2;}
 function center(id){const p=placeById(id);if(!p)return;viewport.scrollTo({left:p.x*zoom-viewport.clientWidth/2,top:p.y*zoom-viewport.clientHeight/2,behavior:'instant'});}
 function book(){const entries=journalEntries(h.journey,h.current()),visits=$('.atlas-visits'),learning=$('.atlas-learning');visits.replaceChildren();learning.replaceChildren();$('.atlas-journal-summary').textContent=`已到过 ${entries.visited.length} 处开放地点 · 留下 ${entries.lessons.length} 项学习记录`;
  const link=(p,label)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{tab('map');select(p.id);center(p.id);$('.atlas-go').focus();};return b;};
  for(const p of entries.visited){const b=link(p,p.name),small=document.createElement('small');small.textContent=p.region===h.current()?'所在':'已到过';b.append(small);visits.append(b);}
  $('.atlas-trails').replaceChildren(...journalTrails(h.journey,h.current()).map(({title,detail,stops,next})=>{
   const card=document.createElement('article'),heading=document.createElement('h4'),intro=document.createElement('p'),steps=document.createElement('ol');heading.textContent=title;intro.textContent=detail;
   for(const stop of stops){const item=document.createElement('li');item.textContent=`${placeById(stop.place).name} · ${stop.title}${stop.done?'（已完成）':''}`;steps.append(item);}
   card.append(heading,intro,steps);if(next){card.append(link(placeById(next.place),'在图上查看'+placeById(next.place).name));}else{const seal=document.createElement('strong');seal.textContent='全程已走完';card.append(seal);}return card;
  }));
  for(const l of entries.lessons){const row=document.createElement('article'),title=document.createElement('h4'),description=document.createElement('p'),meta=document.createElement('p');title.textContent=l.title;description.textContent=l.detail;let date='';if(l.at!==null){const d=new Date(l.at);if(Number.isFinite(d.getTime()))date=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric'}).format(d)+' · ';}meta.textContent=date+'完成 '+l.times+' 次';row.append(title,description,meta,link(placeById(l.place),'再去看看'));learning.append(row);}
  $('.atlas-empty').hidden=entries.lessons.length>0;
 }
 function tab(name){const map=name==='map';$('#atlasMap').hidden=!map;$('#atlasBook').hidden=map;for(const [id,active]of[['#atlasMapTab',map],['#atlasBookTab',!map]]){$(id).setAttribute('aria-selected',active);$(id).tabIndex=active?0:-1;}if(!map)book();}
 function open(id){if(opened||!h.canOpen())return false;opened=true;h.save();before=h.begin();dialog.showModal();tab('map');select(id||placeForRegion(h.target()||h.mapAnchor())?.id||'town');size(Math.min(1,Math.max(.75,Math.min(viewport.clientWidth/1000,viewport.clientHeight/690))));center(selected);buttons.get(selected).focus({preventScroll:true});return true;}
 function close(resume=true){if(!opened)return;opened=false;dialog.close();const state=before;before=null;h.end(state,resume);}
 $('.atlas-go').onclick=()=>{const to=placeById(selected)?.region;if(!to)return;if(to!==h.current())h.mark(to===h.target()?null:to);close();};$('.atlas-close').onclick=()=>close();$('[data-center]').onclick=()=>{select(placeForRegion(h.mapAnchor())?.id||'town');center(selected);};for(const b of dialog.querySelectorAll('[data-zoom]'))b.onclick=()=>size(zoom+Number(b.dataset.zoom));
 $('#atlasMapTab').onclick=()=>tab('map');$('#atlasBookTab').onclick=()=>tab('book');$('.atlas-tabs').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const map=e.key==='Home'||e.key!=='End'&&$('#atlasMapTab').getAttribute('aria-selected')!=='true';tab(map?'map':'book');$(map?'#atlasMapTab':'#atlasBookTab').focus();}});
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('keydown',e=>{if(!opened)return;e.stopPropagation();
  if(e.key==='Tab'){const items=[...dialog.querySelectorAll('button:not(:disabled):not([tabindex="-1"]),[tabindex="0"]')].filter(n=>n.getClientRects().length),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}return;}
  if(e.repeat)return;if(e.key==='Escape'||e.code==='KeyM'){e.preventDefault();close();}else if(/^Digit[0-9]$/.test(e.code)){e.preventDefault();const id=SHORTCUTS[(Number(e.code.slice(-1))+9)%10];select(id);center(id);}});
 // Contain gestures in the modal: they must not turn the camera or trigger a bow.
 for(const type of['keyup','mousedown','mouseup','mousemove','wheel','touchstart','touchmove','touchend','click'])dialog.addEventListener(type,e=>{if(opened)e.stopPropagation();},{passive:true});
 viewport.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};suppressClick=false;viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');});
 viewport.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)suppressClick=true;viewport.scrollLeft=drag.left-dx;viewport.scrollTop=drag.top-dy;});
 const endDrag=()=>{drag=null;viewport.classList.remove('dragging');setTimeout(()=>suppressClick=false,0);};viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);
 return{open,close,get isOpen(){return opened;},get selected(){return selected;}};
}
