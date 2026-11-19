import {gabledRoof,timberBetween,hangingLamp} from './joinery.js';
import {layPaving} from './street-paving.js';
import {townSurfaces} from './surfaces.js';
import {createMeal} from './meal.js';

// An original riverside meeting place: low roofs, a living tree, shared food.
// Open sheds have exposed structure; the principal destination is outdoors.
export function* buildBeggar(b,a){
 const {THREE:T,M,at,B,C,G,S,col,plaque,bamboo,boulder,plight,crate,sacks}=b,V=T.Vector3;
 const root=a.root,point=(x,y,z)=>new V(x,y,z),surfaces=townSurfaces(T,M),{wood,stone,soil}=surfaces;
 const plaster=new T.MeshStandardMaterial({color:0xb8b09a,emissive:0x554b38,emissiveIntensity:.16,roughness:1}),brick=M.brick.clone();brick.color.setHex(0xb6b0a0);
 const boards=wood.clone();boards.color.setHex(0xbabb9a);const leaf=M.lfC.clone();leaf.color.setHex(0x81985d);leaf.onBeforeCompile=M.lfC.onBeforeCompile;
 const bark=M.bark.clone();bark.color.setHex(0xa2947a);bark.emissive.setHex(0x554634);bark.emissiveIntensity=.28;
 leaf.emissive.setHex(0x334b27);leaf.emissiveIntensity=.22;
 yield;
 const cloth=surfaces.cloth;cloth.color.setHex(0x96926d);
 const cushion=(x,y,z,yaw)=>b.palette({cushion:cloth},()=>b.cushion(x,y,z,yaw));
 const sign=(text,x,y,z,r=0,h=.6)=>{at(x,y,z,r);plaque(text,0,0,0,{h,bg:'#383b2e',fg:'#dfd1ad'});};
 let time=0,pour=0,scoop=0,serve=0;
 const meal=createMeal(()=>{a.learn('beggar-meal');a.message('一锅粥，四方客 · 围炉帮厨已记入行旅。');},a.savedState);
 function mesh(g,m,p,parent=root){const o=new T.Mesh(g,m);o.position.copy(p);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function beam(p,q,r,m,parent=root){const d=q.clone().sub(p),g=new T.CylinderGeometry(r,r*1.08,d.length(),8),mid=p.clone().add(q).multiplyScalar(.5),rotation=new T.Quaternion().setFromUnitVectors(point(0,1,0),d.normalize());
  if(parent===root){g.applyQuaternion(rotation);at(0,0,0);G(g,m,...mid.toArray());return;}
  const o=mesh(g,m,mid,parent);o.quaternion.copy(rotation);return o;}
 function bench(x,z,rotation=0,base=0){at(x,base,z,rotation);B(3.3,.13,.7,0,.4,0,wood);for(const px of[-1.25,1.25])B(.2,.4,.55,px,0,0,M.woodDark);}
 function table(x,z,w=3.2,d=1.2,y=.78,base=0){at(x,base,z);B(w,.12,d,0,y,0,wood);for(const px of[-w/2+.2,w/2-.2])for(const pz of[-d/2+.2,d/2-.2])B(.12,y,.12,px,0,pz,M.woodDark);}
 // Ground stays on the west bank. The eastern dock is a real supported platform.
 yield;
 at(0,0,0);B(78,5,108,-9,-5,0,M.cliff);B(78,.025,108,-9,0,0,soil,false);
 layPaving(b,stone,.057,[[0,2,8,95],[-6,13,63,5],[-6,-24,64,5]]);
 // River wall prevents walking into an un-navigable water plane.
 B(.6,2,61.3,30,-1,10.35,M.ashlar);B(.6,2,8,30,-1,50,M.ashlar);B(.6,2,26.3,30,-1,-40.85,M.ashlar);
 B(.6,1.4,7.4,30,-1,-24,M.ashlar);B(1,1.1,108,-48,0,0,brick);
 B(78,1.1,1,-9,0,-54,brick);B(35,1.1,1,-30,0,54,brick);B(26,1.1,1,17,0,54,brick);

 yield;
 const water=M.water.clone();water.color.setHex(0x668778);water.transparent=false;water.opacity=1;
 const river=mesh(new T.PlaneGeometry(180,620,20,60),water,point(121,-.7,0));river.rotation.x=-Math.PI/2;river.castShadow=false;river.name='beggar:river';
 at(0,0,0);B(22,.55,7,40,-.1,-24,wood);B(9,.4,14,55,.05,-24,wood);
 // One low step crosses the retaining wall at the dock; its other spans stay closed.
 for(let i=0;i<4;i++)B(1.1,(i+1)*.1125,6,26.1+i*1.1,0,-24,stone);
 // The bank wall has a matching low span beneath the dock's open threshold.
 for(const x of[31,37,43,49,54,59])for(const z of[-27,-21])C(.17,.2,4,x,-3.5,z,M.woodDark);
 function fence(x0,z0,x1,z1,y=0){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,z1-z0)/3));
  for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;at(x,y,z);C(.065,.09,1,0,0,0,M.woodDark);}
  for(const h of[.45,.86])beam(point(x0,y+h,z0),point(x1,y+h,z1),.045,wood);
  at(0,0,0);col(Math.abs(x1-x0)+.12,1,Math.abs(z1-z0)+.12,(x0+x1)/2,y,(z0+z1)/2);
 }
 yield;
 fence(30,54,30,46);fence(30,41,30,-20.3);fence(30,-27.7,30,-54);fence(30.5,-27.4,51,-27.4,.45);fence(30.5,-20.6,51,-20.6,.45);
 fence(51,-31,59.5,-31,.45);fence(59.5,-31,59.5,-17,.45);fence(51,-17,59.5,-17,.45);
 fence(51,-31,51,-27.4,.45);fence(51,-20.6,51,-17,.45);
 // Low vernacular sheds: three wall faces, a generous open front, exposed beams.
 function shed(x,z,w,d,name,workshop=false){
  const y=.33;at(x,0,z);B(w,.3,d,0,0,0,stone);B(w,.03,d,0,.3,0,wood,false);
  B(w+1.5,.15,2.5,0,0,d/2+1.25,stone);
  B(w,3.4,.32,0,y,-d/2,plaster);
  for(const sx of[-1,1]){B(.32,workshop?.87:3.4,d,sx*w/2,y,0,plaster);for(const pz of[-d/2,d/2]){B(.4,.25,.4,sx*(w/2-.5),y,pz,M.ashlar);C(.14,.18,3.2,sx*(w/2-.5),y+.25,pz,M.woodDark);}}
  for(const pz of[-d/2,d/2])B(w,.28,.28,0,y+3.2,pz,M.woodDark,false);
  // A low stone plinth and engaged posts give the solid walls visible structure.
  B(w,.45,.36,0,y,-d/2,brick);for(let px=-w/2+1;px<w/2;px+=4)B(.12,3.4,.1,px,y,-d/2+.2,M.woodDark,false);
  for(const sx of[-1,1]){B(.36,.45,d,sx*w/2,y,0,brick);for(let pz=-d/2+1;pz<d/2;pz+=3)B(.1,3.4,.12,sx*(w/2-.2),y,pz,M.woodDark,false);}
  for(const px of [-w/4,w/4]){
   B(.22,3.29,.22,px,y,d/2,M.woodDark);
   for(const side of [-1,1])timberBetween(b,[px,y+2.48,d/2],[px+side*.88,y+3.25,d/2],.14,.15,wood);
  }
  gabledRoof(b,w+1.8,d+1.6,y+3.50,d*.21,boards,wood,{boards:true});sign(name,x,y+3,z+d/2+.2,0,.56);
 }
 // A second, low boarding stage serves the soup line at the village entrance.
 yield;
 at(0,0,0);B(10,.35,5,34.8,-.15,43.5,wood);
 for(const x of [31.5,38.7])for(const z of [41.6,45.4])C(.13,.19,1.65,x,-1.55,z,M.woodDark);
 at(16.4,0,44.5);
 // A ridge pole and stitched lengths of drooping canvas form the waterfront shelter.
 for(const end of [-1,1]){
  for(const edge of [-1,1]){
   C(.09,.14,2.62,end*3.68,0,edge*2.26,M.woodDark);
   timberBetween(b,[end*3.68,2.53,edge*2.26],[end*3.68,3.38,0],.105,.12,wood);
  }
  B(.15,.16,4.65,end*3.68,2.52,0,wood,false);
  B(.14,.77,.14,end*3.68,2.65,0,wood,false);
 }
 yield;
 B(8.42,.13,.12,0,3.32,0,wood,false);
 for(const side of [-1,1])B(8,.12,.14,0,2.53,side*2.26,wood,false);
 const patch=cloth.clone();patch.color.setHex(0xc6ad86);
 for(let strip=0;strip<5;strip++){
  const g=new T.PlaneGeometry(8.4/5,5.5,8,16);g.rotateX(-Math.PI/2);
  const pos=g.attributes.position;
  for(let i=0;i<pos.count;i++){
   const x=pos.getX(i),z=pos.getZ(i),span=Math.abs(z)/2.75;
   const sag=.13*Math.sin(Math.PI*span)*Math.cos(x*1.55);
   pos.setY(i,3.49-span*.96-sag-.13*Math.max(0,span-.82)/.18);
  }
  g.computeVertexNormals();G(g,strip===1||strip===4?patch:cloth,(strip-2)*8.4/5,0,0);
 }
 yield;
 table(16.4,44.5,4.2,1.2);at(16.4,0,44.5);
 const vessel=profile=>new T.LatheGeometry(profile.map(([r,h])=>new T.Vector2(r,h)),22);
 G(vessel([[.02,0],[.31,0],[.40,.06],[.48,.37],[.47,.47],[.43,.47],[.42,.41],[.30,.06],[.01,.06]]),M.iron,0,.9,0);
 C(.432,.426,.015,0,1.325,0,M.sack,false,22);
 for(const sign of [-1,1]){const handle=new T.TorusGeometry(.10,.022,6,16);G(handle,M.iron,sign*.48,1.22,0);}
 for(const x of [-1.45,-1,-.55,.85,1.3])
  G(vessel([[.002,0],[.085,0],[.10,.026],[.166,.126],[.168,.15],[.150,.15],[.14,.115],[.066,.027],[.002,.027]]),M.jade,x,.9,.17);
 yield;
 a.on('beggar:landing',point(37.1,1.55,43.5),2.7,'看渡口',()=>a.card('南埠','丐帮河岸','靠岸先有一碗热粥。物资棚里的粮袋从这里抬上岸，往北走经过榕树下的露天会场，再到河边歇脚。'));
 // Arrival bends around the old street and opens toward the tree, never a temple gate.
 shed(-16,35,17,10,'物资棚',true);shed(16,34,17,12,'修补摊',true);
 sign('丐帮 · 河岸会所',0,3.5,25,0,.8);at(0,0,25);for(const x of[-4.5,4.5])C(.14,.18,3.8,x,0,0,M.woodDark);B(9.4,.2,.23,0,3.7,0,wood,false);
 at(-16,.33,35);hangingLamp(b,0,3.63,-1.15,.50);
 // Raised shelves keep the grain off damp ground; the front bay stays open for unloading.
 at(-16,.33,32);
 yield;
 for(const x of [-5.6,0,5.6])for(const z of [-.7,.7])B(.18,2.08,.18,x,0,z,M.woodDark);
 for(const h of [.46,1.46])B(11.7,.12,1.65,0,h,0,wood);
 for(const x of [-19.8,-16,-12.2]){
  sacks(x,.91,32,3,true);crate(x,1.91,32,.62);
 }
 a.on('beggar:stores',point(-16,1.53,33.05),2.4,'看棚内粮架',()=>a.card('物资棚','丐帮 · 南埠','粮袋平码在下层木架，怕潮的干货箱收在上层。南埠靠船后，帮众从棚前的空地卸货。'));
 table(15,36,3.6,1.2,.78,.33);
 yield;
 at(15,1.23,36);B(1.32,.025,.72,-.39,0,.06,cloth,false);
 for(const [x,m] of [[.54,cloth],[1.02,M.sack],[1.50,M.robe]]){
  C(.115,.115,.22,x,.02,-.23,wood,false,14);C(.14,.14,.15,x,.055,-.23,m,false,14);
 }
 for(let i=0;i<6;i++)B(.06,.008,.018,-.72+i*.12,.027,.15,M.drum,false);
 a.on('beggar:mending',point(15,1.4,37),2.7,'看看修补手艺',()=>a.card('旧衣再穿','行脚人的针线','补片沿着破口外缘落针，针距不必急，先把布铺平。桌上的几块旧布，都是行路人留下的。'));
 // The gathering tree has a branching trunk, buttress roots, airy leaf clusters
 // and pendant aerial roots that stop above the primary walking ring.
 yield;
 const tx=-10,tz=-5;
 at(tx,0,tz);C(1.2,1.9,4.8,0,0,0,bark,true,16);
 const branchEnds=[];
 for(let i=0;i<9;i++){const ang=i*Math.PI*2/9+.2,r=8+(i%3)*1.4,end=point(tx+Math.cos(ang)*r,7.5+(i%3)*1.1,tz+Math.sin(ang)*r);
  const start=point(tx+Math.cos(ang)*.5,3.7,tz+Math.sin(ang)*.5),mid=point(tx+Math.cos(ang)*r*.52,6.2+(i%2),tz+Math.sin(ang)*r*.52);
  beam(start,mid,.49,bark);beam(mid,end,.22,bark);branchEnds.push(end);
  const rootEnd=point(tx+Math.cos(ang)*3.8,.06,tz+Math.sin(ang)*3.8);beam(point(tx+Math.cos(ang)*.6,.85,tz+Math.sin(ang)*.6),rootEnd,.25,bark);
 }
 yield;
 at(tx,0,tz);col(4.8,.55,4.8,0,0,0);
 for(let i=0;i<38;i++){const ang=i*2.39996,r=2+Math.sqrt(i/38)*10,x=tx+Math.cos(ang)*r,z=tz+Math.sin(ang)*r,y=8.7+Math.sin(i*1.7)*1.1;
  for(let j=0;j<3;j++){const g=new T.PlaneGeometry(6.5,5.5);g.rotateX(j===2?-Math.PI/2:0);g.rotateY(j*Math.PI/2+i*.37);at(0,0,0);G(g,leaf,x,y,z);}
 }
 for(let i=0;i<12;i++){const end=branchEnds[i%9],shift=(i%3-1)*.6;beam(end.clone().add(point(shift,-.1,0)),point(end.x+shift,3.2,end.z),.026,bark);}
 // Perimeter seats face the shared center; the south and east gaps stay clear.
 for(const [x,z,r,yaw]of[[-18,-5,1,-Math.PI/2],[-10,-13,0,Math.PI],[-2,-5,1,Math.PI/2],[-16,2,0,-.8]]){
  bench(x,z,r);cushion(x,0,z+.9,yaw);a.rest('beggar:tree:'+x+':'+z,point(x,0,z+.9),yaw,'树下歇脚');
 }
 // Open meeting house and a quiet western guest porch.
 yield;
 shed(-13,-32,24,12,'四海同席');shed(-35,-8,15,16,'行脚客舍');
 table(-13,-31,8,1.5,.78,.33);for(const x of[-16,-12,-8]){bench(x,-28,0,.33);cushion(x,.33,-36,Math.PI);a.rest('beggar:hall:'+x,point(x,.33,-36),Math.PI,'堂内歇息');}
 sign('来者有一席',-13,2.6,-37.7,0,.8);
 // A bamboo staff on the meeting table illustrates the elder's account.
 const staff=point(-15.65,1.275,-31.2),tip=point(-11.1,1.275,-30.8);
 beam(staff,tip,.043,M.bamboo);
 for(let i=1;i<13;i++){const p=staff.clone().lerp(tip,i/13);beam(p,p.clone().add(point(.046,0,.004)),.050,M.bamboo);}
 yield;
 beam(staff,staff.clone().lerp(tip,.19),.044,wood);
 for(const fraction of [.22,.31,.44]){const p=staff.clone().lerp(tip,fraction);beam(p,p.clone().add(point(.023,0,.002)),.046,M.ink);}
 a.on('beggar:stories',point(-13,1.6,-29),3,'听渡口掌故',()=>a.card('渡口的竹篙','丐帮河岸会所','渡口的老人把竹篙搁上桌。涨水时，船家凭篙上的水痕认水深。饭棚的米是沿这条河送来的，赶得巧，卸完船就能喝上一碗热粥。'));
 for(const z of[-13,-8,-3]){cushion(-35,.33,z,Math.PI/2);a.rest('beggar:guest:'+z,point(-35,.33,z),Math.PI/2,'客舍休息');}
 // A low cooking canopy with no wall infill: water bucket, rice measure, pot,
 // and serving table are distinct and reachable from the open courtyard.
 at(12,0,-13);B(20,.15,18,0,0,0,stone);for(const x of[-9,9])for(const z of[-8,8]){B(.5,.2,.5,x,.15,z,M.ashlar);C(.15,.2,3.6,x,.35,z,M.woodDark);}
 yield;
 for(const z of[-8,8])B(18.5,.28,.25,0,3.85,z,M.woodDark,false);
 for(let x=-8;x<=8;x++)B(.12,.18,16,x,3.8,0,wood,false);
 gabledRoof(b,21.8,19.5,4,2.9,boards,wood,{boards:true});sign('围炉帮厨',12,3.45,-4.8,0,.7);
 at(12,.15,-14);C(.85,1.05,.66,0,0,0,brick,true,20);
 const pot=mesh(new T.LatheGeometry([new T.Vector2(.1,0),new T.Vector2(.58,.08),new T.Vector2(.85,.36),new T.Vector2(.95,.62),new T.Vector2(.92,.68)],32),M.iron,point(12,.77,-14));
 pot.material=new T.MeshStandardMaterial({color:0x514738,emissive:0x211b14,emissiveIntensity:.18,metalness:.35,roughness:.72,side:T.DoubleSide});pot.name='beggar:pot';
 const soupMat=new T.MeshStandardMaterial({color:0xd8c391,roughness:.52});
 yield;
 const soup=mesh(new T.CircleGeometry(.85,40),soupMat,point(12,1.25,-14));soup.rotation.x=-Math.PI/2;soup.name='beggar:soup';
 const bubbles=new T.Group();root.add(bubbles);for(let i=0;i<12;i++){const q=mesh(new T.SphereGeometry(.045,6,4),soupMat,point(12+Math.cos(i*2.4)*.65,1.29,-14+Math.sin(i*2.4)*.65),bubbles);q.castShadow=false;}
 const ladle=new T.Group();ladle.name='beggar:ladle';ladle.position.set(12,1.2,-14);root.add(ladle);
 beam(point(0,0,0),point(.85,.55,.2),.025,wood,ladle);
 const bowlGeo=new T.LatheGeometry([new T.Vector2(.01,0),new T.Vector2(.12,.025),new T.Vector2(.19,.14),new T.Vector2(.19,.16)],18);
 mesh(bowlGeo,M.woodDark,point(0,-.1,0),ladle);
 const bucket=new T.Group();bucket.name='beggar:bucket';bucket.position.set(20,0,-8);root.add(bucket);
 yield;
 mesh(new T.CylinderGeometry(.4,.31,.7,16,1,true),wood,point(0,.36,0),bucket);
 for(const y of[.12,.62]){const hoop=mesh(new T.TorusGeometry(.36,.018,6,24),M.iron,point(0,y,0),bucket);hoop.rotation.x=Math.PI/2;}
 const handle=mesh(new T.TorusGeometry(.38,.023,6,20,Math.PI),M.iron,point(0,.7,0),bucket);handle.rotation.z=0;
 const fill=mesh(new T.CircleGeometry(.35,24),water,point(0,.62,0),bucket);fill.rotation.x=-Math.PI/2;
 const waterStream=mesh(new T.CylinderGeometry(.035,.05,.65,8),water,point(12.5,1.7,-14));waterStream.visible=false;
 at(7,.15,-8);C(.5,.4,.6,0,0,0,wood);C(.46,.46,.04,0,.56,0,M.paper,false,20);
 const measure=new T.Group();measure.name='beggar:measure';measure.position.set(7,.77,-8);root.add(measure);
 yield;
 mesh(new T.CylinderGeometry(.18,.15,.18,12,1,true),wood,point(0,.09,0),measure);mesh(new T.CylinderGeometry(.16,.16,.01,12),M.paper,point(0,.16,0),measure);
 table(12,-6,6,1.2,.85);const servings=[];
 for(const x of[10.2,11.4,12.6,13.8]){mesh(bowlGeo,M.marble,point(x,.97,-6));const q=mesh(new T.CircleGeometry(.16,20),soupMat,point(x,1.1,-6));q.rotation.x=-Math.PI/2;servings.push(q);}
 const hints={water:'先把水桶里的水添进锅里。',rice:'水已添好，取米斗量米下锅。',stir:'米已下锅，来灶边慢慢搅动。',serve:'粥已煨好，到桌边分给四方来客。',done:'粥已分好，坐下歇歇吧。'};
 const doMeal=action=>{if(!meal.act(action)){a.message(hints[meal.state.stage]);return;}if(action==='water'){pour=2.1;a.sound('pour');}if(action==='rice'){scoop=1.8;a.sound('take');}if(action==='serve'){serve=2;a.sound('bowl');}a.checkpoint();a.message(hints[meal.state.stage]);};
 a.on('beggar:water',point(20,1.1,-7),2.6,'提桶添水',()=>doMeal('water'));
 a.on('beggar:rice',point(7,1.1,-7),2.5,'量米下锅',()=>doMeal('rice'));
 yield;
 a.on('beggar:stir',point(12,1.35,-12.5),2.6,()=>meal.state.stirring?'慢火煨粥…':'执勺慢搅',()=>doMeal('stir'));
 a.on('beggar:serve',point(12,1.4,-5),2.7,'分粥待客',()=>doMeal('serve'));
 // Soft ember light is below the pot; no floating fixture or oversized blaze.
 at(12,.15,-14);B(.65,.18,.15,0,.08,.85,M.glow,false);at(0,0,0);plight(12,.55,-13.2,0xff9b45,5,5);
 const paperLamp=new T.MeshStandardMaterial({color:0xd6bf8b,emissive:0xc79b57,emissiveIntensity:.4,roughness:1});
 for(const x of[5.5,18.5]){at(x,0,-13);C(.012,.012,.45,0,3.4,0,M.iron,false,6);C(.22,.25,.5,0,2.9,0,paperLamp,false,14);C(.27,.27,.07,0,3.4,0,wood,false,14);C(.27,.27,.07,0,2.83,0,wood,false,14);at(0,0,0);plight(x,3.05,-13,0xffdc9c,32,18);}
 const steamCanvas=document.createElement('canvas');steamCanvas.width=steamCanvas.height=64;const ctx=steamCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,1,32,32,31);gradient.addColorStop(0,'rgba(235,231,207,.32)');gradient.addColorStop(1,'rgba(235,231,207,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
 yield;
 const steamTexture=new T.CanvasTexture(steamCanvas),steam=[];
 for(let i=0;i<6;i++){const o=new T.Sprite(new T.SpriteMaterial({map:steamTexture,transparent:true,opacity:0,depthWrite:false}));root.add(o);steam.push(o);}
 // River pavilion and supported pier, with a moored hull below the rail.
 at(26,0,8);B(7,.18,9,0,0,0,wood);for(const x of[-2.8,2.8])for(const z of[-3.8,3.8])C(.12,.17,3,x,.18,z,M.woodDark);
 gabledRoof(b,8.4,10.2,3.22,1.73,boards,wood,{boards:true});sign('听水棚',26,2.8,12,0,.55);
 for(const z of[6,10]){cushion(27,.18,z,-Math.PI/2);a.rest('beggar:river:'+z,point(27,.18,z),-Math.PI/2,'临河听水');}
 for(const z of[-26,-22]){cushion(56,.45,z,-Math.PI/2);a.rest('beggar:dock:'+z,point(56,.45,z),-Math.PI/2,'码头看船');}
 yield;
 const boat=new T.Group();boat.name='beggar:boat';boat.position.set(48,-.55,-31);root.add(boat);
 const hull=new T.Shape();hull.moveTo(-4,0);hull.quadraticCurveTo(-3.5,-1.4,0,-1.5);hull.quadraticCurveTo(3.5,-1.4,4,0);hull.quadraticCurveTo(3.5,1.4,0,1.5);hull.quadraticCurveTo(-3.5,1.4,-4,0);
 const hg=new T.ExtrudeGeometry(hull,{depth:.42,bevelEnabled:true,bevelThickness:.12,bevelSize:.18,bevelSegments:2,steps:1,curveSegments:12});hg.rotateX(Math.PI/2);mesh(hg,wood,point(0,.4,0),boat);
 for(let i=-3;i<=3;i++)mesh(new T.BoxGeometry(.9,.08,2.3),wood,point(i,.5,0),boat);
 for(const side of[-1,1]){const pts=[point(-3.8,.65,0),point(-2.8,.75,side*1.1),point(0,.75,side*1.32),point(2.8,.75,side*1.1),point(3.8,.65,0)];mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),30,.085,6,false),wood,point(0,0,0),boat);}
 for(const x of[-1.8,1.8])mesh(new T.BoxGeometry(.7,.13,2.45),wood,point(x,.64,0),boat);
 beam(point(45,.25,-30),point(49,.8,-27),.025,M.sack);beam(point(51,.25,-30),point(54,.8,-27),.025,M.sack);
 // Tie a shallow freight boat alongside the arrival stage. Its cargo
 // and mooring posts connect the dock to the provisions shed across the road.
 yield;
 const ferry=boat.clone(true);ferry.name='beggar:grain-ferry';
 ferry.rotation.y=Math.PI/2;ferry.position.set(41.3,-.57,43.4);root.add(ferry);
 const basketGeo=new T.LatheGeometry([[.02,0],[.29,0],[.39,.12],[.43,.53],[.40,.59]].map(([r,y])=>new T.Vector2(r,y)),16);
 const rimGeo=new T.TorusGeometry(.41,.027,6,24),grainGeo=new T.SphereGeometry(.37,14,8);
 for(const [x,z] of [[.72,-.36],[.56,.42],[-.39,-.28]]){
  mesh(basketGeo,M.sack,point(x,.56,z),ferry);
  const grain=mesh(grainGeo,M.sack,point(x,1.11,z),ferry);grain.scale.y=.27;
  for(const [h,r] of [[.14,.91],[.48,1],[.58,1]]){
   const rim=mesh(rimGeo,wood,point(x,.56+h,z),ferry);rim.scale.setScalar(r);rim.rotation.x=Math.PI/2;
  }
 }
 yield;
 for(const z of [41.3,45.4]){
  at(38.9,.20,z);C(.10,.14,.65,0,0,0,M.woodDark);
  beam(point(38.9,.71,z),point(40.7,.19,z+(z<43?-.55:.55)),.028,M.sack);
 }
 // Patchwork belongs to the people here, rather than new character assets.
 const npc=a.npc;
 npc('守灶人',[17,.15,-17],0,{robe:1,hat:true},'桶在东边，米斗在西边。添水、量米、慢搅，最后把粥分到桌上的碗里。');
 yield;
 const elder=npc('树下老人',[-10,0,-11],0,{robe:0,bald:true,bag:true},'在路上，一句问候能认得一个朋友。若歇够了，东边饭棚正缺一双手。');elder.f.sit=.95;
 npc('补衣人',[16,.33,33],0,{robe:3,bun:true},'布旧了还能缝，路远了可以歇。修补摊前留着空处，尽管坐。');
 npc('摆渡客',[54,.45,-29],Math.PI,{visitor:true,robe:2,hat:true},'这处小码头供人看水歇脚。回三四镇，要沿南边老街走。');
 npc('说书人',[-16,.33,-34],0,{robe:4,bag:true},'世上的去处多，走过一段，记下一段。这里的树荫总留给过路人。');
 a.walkers([[0,42],[0,18],[-5,13],[15,1],[24,17],[-23,-19],[0,-23]],3);
 for(const [x,z]of[[-43,21],[-42,-42],[-28,-46],[23,-45],[25,34],[-40,48]])bamboo(x,0,z);
 for(const [x,z,r]of[[-43,15,1.3],[27,40,1.5],[26,-44,1.4],[-42,-47,2]])boulder(x,0,z,r);
 yield;
 const server=npc('分粥人',[16.5,0,43.65],0,{robe:3,bag:true},'刚靠岸的先领碗。过了街口，老树下正在议事。');
 const guest=npc('候粥客',[16.8,0,45.48],Math.PI,{visitor:true,robe:4,beard:true},'等粥的时候坐一会儿，去后河埠的船还早。');
 const guestBowl=mesh(bowlGeo,M.woodDark,point(-.035,-.34,.035),guest.f.elbL);
 guestBowl.scale.setScalar(.76);
 const broth=mesh(new T.CircleGeometry(.155,16),soupMat,point(0,.137,0),guestBowl);broth.rotation.x=-Math.PI/2;
 const scoopTool=ladle.clone(true);scoopTool.name='beggar:serving-ladle';
 scoopTool.scale.setScalar(.53);scoopTool.position.set(-.39,-.59,-.10);server.f.elbR.add(scoopTool);
 yield;
 server.f.post=f=>{const u=(Math.sin(time*.95)+1)*.5;f.armR.rotation.x=-.32-.58*u;f.elbR.rotation.x=-.36-.44*u;};
 guest.f.post=f=>{
  f.armL.rotation.x=-.54;f.elbL.rotation.x=-.87-.20*Math.sin(time*.72);
  f.elbL.getWorldQuaternion(guestBowl.quaternion);guestBowl.quaternion.invert();
 };
 npc('听会帮众',[-13,0,-1.8],-.8,{robe:2,bag:true},'树荫下坐得下大家。有信带来，便说给众人听。');
 // Low rolling banks across the river; no giant peaks pressed against the street.
 yield;
 const land=new T.PlaneGeometry(900,900,96,96);land.rotateX(-Math.PI/2);const pos=land.attributes.position,colors=new Float32Array(pos.count*3),color=new T.Color();
 const ground=(x,z)=>{const edge=Math.max(0,Math.min(1,(Math.max(Math.abs(x+10),Math.abs(z))-65)/50));let h=-4+28*Math.exp(-((x+230)**2+(z+180)**2)/26000)+40*Math.exp(-((x-270)**2+(z+210)**2)/29000)+13*Math.sin(z*.011+x*.006);if(x>29&&x<210)h=-3;return-4+(h+4)*edge;};
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,z>58?Math.min(-2,ground(x,z)):ground(x,z));color.setHex(0x748065).multiplyScalar(.9+.12*Math.sin(x*.021+z*.019));colors.set([color.r,color.g,color.b],i*3);}
 land.computeVertexNormals();land.setAttribute('color',new T.BufferAttribute(colors,3));const landscape=mesh(land,new T.MeshStandardMaterial({vertexColors:true,roughness:1}),point(0,0,0));landscape.userData.landscape=true;landscape.castShadow=false;
 // Far-bank vegetation gives the resting view a shoreline and several depths.
 // It shares the local tree's two material batches and has no collision boxes.
 for(let i=0;i<34;i++){const x=222+(i%3)*19+Math.sin(i*1.7)*6,z=-220+i*14,base=ground(x,z)-.5,h=12+(i%5)*2.2;at(x,base,z);C(.22,.4,h*.55,0,0,0,bark,false,6);
  for(let j=0;j<3;j++){const g=new T.PlaneGeometry(10+j*2,12);g.rotateY(j*Math.PI/3+i*.3);G(g,leaf,0,h*.6,0);}}
 yield;
 const sync=()=>{const s=meal.state;soup.visible=s.stage!=='water';bubbles.visible=s.stirring;servings.forEach(q=>q.visible=s.stage==='done');soup.material.color.setHex(s.stage==='rice'?0x91a299:0xd8c391);};sync();
 return{id:'beggar',name:'丐帮 · 河岸会所',subtitle:'老街入树荫 · 围炉待四方',spawn:{p:[0,0,50],yaw:0},guide:'老树歇脚 · 围炉帮厨 · 会所听书 · 码头看水',
  snapshot:()=>meal.state,get lesson(){return meal.state;},
  locate(p){if(p.x>30&&p.z>39)return'丐帮 · 南埠';if(p.x>11&&p.x<22&&p.z>40)return'丐帮 · 渡口粥棚';if(p.x>31)return'丐帮 · 河岸码头';if(p.z>24)return'丐帮 · 老街';if(p.x>1&&p.z<-4&&p.z>-23)return'丐帮 · 围炉饭棚';if(p.z<-25&&p.x<1)return'丐帮 · 四海同席';if(p.x<-26)return'丐帮 · 行脚客舍';if(p.x>20)return'丐帮 · 听水棚';return'丐帮 · 老树下';},
  tick(dt){time+=dt;surfaces.sync();const simmering=meal.state.stirring;meal.tick(dt);
   if(simmering&&!meal.state.stirring)a.checkpoint();sync();
   ferry.position.y=-.57+.017*Math.sin(.86*time);ferry.rotation.z=.007*Math.sin(.71*time);pour=Math.max(0,pour-dt);scoop=Math.max(0,scoop-dt);serve=Math.max(0,serve-dt);
   const k=pour?Math.sin(Math.PI*pour/2.1):0;bucket.position.set(20-7.2*k,k*1.8,-8-6*k);bucket.rotation.z=-k*.9;waterStream.visible=k>.85;
   const j=scoop?Math.sin(Math.PI*scoop/1.8):0;measure.position.set(7+4.6*j,.77+j*1.1,-8-6*j);measure.rotation.z=-j*1.1;
   ladle.rotation.y=meal.state.stirring?time*1.9:0;ladle.rotation.z=serve?Math.sin(serve*Math.PI/2)*-.7:0;
   bubbles.children.forEach((q,i)=>q.scale.setScalar(.4+.6*Math.max(0,Math.sin(time*4+i))));boat.rotation.z=Math.sin(time*.65)*.01;boat.position.y=-.55+Math.sin(time*.8)*.025;
   steam.forEach((o,i)=>{const u=(time*.22+i/6)%1;o.position.set(12+Math.sin(time+i)*u*.25,1.4+u*1.5,-14+Math.cos(i)*.2);o.scale.setScalar(.35+u*.9);o.material.opacity=['serve','done'].includes(meal.state.stage)||meal.state.stirring?Math.sin(u*Math.PI)*.55:0;});
  }
 };
}
