import {emeiCourts} from './sect-courts.js';
import {layPaving} from './street-paving.js';
import {mountainLandscape} from './landscape.js';
import {townSurfaces} from './surfaces.js';
import {createTeaGarden} from './tea-garden.js';

// Authored Emei journey: bamboo approach, working tea garden, rain pavilion,
// a modest school house and a higher cloud terrace. Not a surveyed real temple.
export function* buildEmei(b,a){
 const {THREE:T,M,at,B,C,G,S,col,roof,hall,plaque,bamboo,pine,boulder,rail,plight}=b;
 const V=T.Vector3,P=(x,y,z)=>new V(x,y,z),root=a.root,surfaces=townSurfaces(T,M),{stone,soil,wood,cloth}=surfaces;
 stone.color.setHex(0xb6b9aa);cloth.color.setHex(0x9eaaa0);
 const plaster=new T.MeshStandardMaterial({color:0xd0cebc,roughness:1}),tile=M.tile.clone();tile.color.setHex(0x919d91);
 const bedSoil=soil.clone();bedSoil.color.setHex(0xaf875b);
 const lanternPaper=new T.MeshStandardMaterial({color:0xeee0b5,emissive:0xe8bd7c,emissiveIntensity:.35,roughness:.92});
 yield;
 const paint=M.paint.clone();paint.color.setHex(0x577469);
 const kit=fn=>b.palette({red:plaster,wood:M.woodDark,paint,tile,eave:wood,gold:M.bronze},fn);
 const sign=(text,x,y,z,r=0,h=.6)=>{at(x,y,z,r);plaque(text,0,0,0,{h,bg:'#374a3e',fg:'#e5dcc0'});};
 const seat=(id,x,y,z,yaw,label)=>{b.palette({cushion:cloth},()=>b.cushion(x,y,z,yaw));a.rest(id,P(x,y,z),yaw,label);};
 const lesson=createTeaGarden(()=>{a.learn('emei-tea');a.message('辨芽、轻采、摊叶 · 采青识叶已记入行旅。');},a.savedState);
 let t=0,spreadTime=0;const picks=[],basketLeaves=[],trayLeaves=[];
 const bambooLeaves=[];
 function mesh(g,m,p,parent=root){const o=new T.Mesh(g,m);o.position.copy(p);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function beam(p,q,r,m,parent=root){const d=q.clone().sub(p),g=new T.CylinderGeometry(r,r*1.1,d.length(),8),rotation=new T.Quaternion().setFromUnitVectors(P(0,1,0),d.normalize()),mid=p.clone().add(q).multiplyScalar(.5);
  if(parent===root){g.applyQuaternion(rotation);at(0,0,0);G(g,m,...mid.toArray());}else{const o=mesh(g,m,mid,parent);o.quaternion.copy(rotation);}}
 function grove(x,y,z){for(let k=0;k<3;k++){const bx=x+Math.sin(k*2.4)*.6,bz=z+Math.cos(k*2.4)*.6,h=6+Math.sin(x*.7+z+k)*1.2;at(bx,y,bz);C(.034,.055,h,0,0,0,M.bamboo,false,7);
   for(let j=1;j<h/.65;j++)C(.047,.047,.045,0,j*.65,0,M.bamboo,false,7);
   for(let level=0;level<3;level++)for(const side of[-1,1]){const ang=k*2.1+side*.7+level,sy=y+h*(.55+level*.14),q=P(bx+Math.cos(ang)*1.1,sy+.3,bz+Math.sin(ang)*1.1);beam(P(bx,sy,bz),q,.013,M.bamboo);
    for(let j=0;j<9;j++){const u=.2+j*.085;bambooLeaves.push([bx+(q.x-bx)*u,sy+.3*u,bz+(q.z-bz)*u,-ang-Math.PI/2+(j%2?.75:-.75),.35+(j%3)*.1]);}}}
  at(x,y,z);col(1.3,3,1.3,0,0,0);}
 function terrace(x,z,w,d,y,mat=soil){at(x,0,z);B(w,24+y-.32,d,0,-24,0,M.cliff);B(w,.32,d,0,y-.32,0,M.ashlar);B(w,.025,d,0,y,0,mat,false);}
 function stairs(x,z,w,base,rise,n){at(x,base,z);for(let i=0;i<n;i++){const h=rise*(i+1)/n;B(w,h-.025,.75,0,0,-(i+.5)*.75,M.ashlar);B(w,.025,.75,0,h-.025,-(i+.5)*.75,stone);}
  for(const s of[-1,1])for(let i=0;i<n;i+=3)rail(x+s*(w/2+.2),z-i*.75,x+s*(w/2+.2),z-Math.min(n,i+3)*.75,base+rise*(i+1.5)/n);}
 yield;
 terrace(0,42,20,30,0);terrace(0,-2,88,48,1.8);terrace(15,-47,42,18,5.4,stone);
 at(0,0,42);B(4.8,.028,30,0,.027,0,stone,false);
 stairs(0,29.5,6.4,0,1.8,10);stairs(28,-21.5,5.6,1.8,3.6,24);
 layPaving(b,stone,1.856,[[0,0,8,44],[0,17,70,4],[0,-8,70,4]]);
 rail(10,56,10,27,0);rail(-10,56,-10,49,0);rail(-10,40,-10,27,0);rail(-10,27,-3.6,27,0);rail(3.6,27,10,27,0);rail(-10,56,-3.4,56,0);rail(3.4,56,10,56,0);
 rail(-44,22,-3.6,22,1.8);rail(3.6,22,44,22,1.8);rail(-44,22,-44,-26,1.8);rail(44,22,44,-26,1.8);
 rail(-44,-26,24.8,-26,1.8);rail(31.2,-26,44,-26,1.8);
 yield;
 rail(-6,-38,24.8,-38,5.4);rail(31.2,-38,36,-38,5.4);rail(-6,-38,-6,-56,5.4);rail(36,-38,36,-56,5.4);rail(-6,-56,24,-56,5.4);rail(32,-56,36,-56,5.4);
 // A generous gateway frames bamboo and the school roof through a real aperture.
 at(0,0,39);for(const x of[-3.5,3.5]){B(.65,.35,.65,x,0,0,M.ashlar);C(.22,.27,4,x,.35,0,M.woodDark);}B(7.6,.3,.4,0,4.25,0,M.woodDark,false);kit(()=>roof(10,4.8,1.6,.45,0,4.7,0));sign('峨眉',0,3.9,39.3,0,.86);
 for(const side of[-1,1])for(let i=0;i<9;i++){const z=53-i*3.1,x=side*(5.6+(i%3)*.9);grove(x,0,z);if(i%3===0)boulder(side*8.6,z<28?1.8:0,z,.7);}
 // The teaching house is modest and open, with books and a real practice apron.
 kit(()=>hall(5,-17,1.8,0,20,12,{name:'清音学舍',plat:.51,ch:3.8,porch:2.2,doors:3,empty:true,inner:'观物自得',couplet:['竹影入窗山色静','茶香绕案客心闲']}));
 at(5,2.31,-20);B(7,.12,1.15,0,.72,0,wood);for(const x of[-3,3])for(const z of[-.4,.4])B(.12,.72,.12,x,0,z,M.woodDark);
 yield;
 for(const x of[-2,0,2]){B(.55,.04,.42,x,.84,0,M.paper,false);B(.5,.025,.025,x,.88,.12,M.woodDark,false);}
 for(const x of[1,5,9])seat('emei:hall:'+x,x,2.31,-16,0,'学舍静坐');
 // The teaching board uses the same leaves the visitor can pick outdoors.
 at(-.8,4.17,-22.77);B(1.62,2.26,.08,0,-1.13,0,wood,false);
 B(1.44,2.10,.025,0,-1.05,.058,M.paper,false);
 sign('采青识叶',-.8,4.94,-22.67,0,.25);
 sign('一芽两叶',-.8,3.47,-22.67,0,.19);
 yield;
 a.on('emei:tea-board',P(-.8,4.05,-21.75),2.9,'看茶芽标本',()=>a.card('一芽两叶','清音学舍 · 茶芽标本','枝梢尖细的是芽，两旁各舒开一片嫩叶。到西边茶圃找一找这个样子的枝头，采下后送到茶屋摊开。'));
 a.on('emei:notes',P(5,3.45,-18.9),2.5,'翻看山行札记',()=>a.card('观物自得','清音学舍','叶色有深浅，竹节有疏密，山中处处可留心。西边茶圃可学辨芽轻采，东边廊亭歇脚；沿北侧石阶，便到望云台。'));
 a.npc('守舍师姐',[10,2.31,-20],0,{robe:3,bun:true,long:true},'山行不必赶路。茶圃的嫩叶较浅，老叶较深；先看清枝头，再轻轻采下。');
 // Sword racks and an unblocked practice apron identify a school without a fight loop.
 at(14,1.8,-4);for(const x of[-1.5,1.5])B(.12,1.65,.18,x,0,0,M.woodDark);B(3.2,.12,.13,0,1.35,0,wood,false);
 for(let i=0;i<4;i++){B(.065,1,.04,-1+i*.65,.38,0,M.iron,false);B(.36,.05,.08,-1+i*.65,1.37,0,M.bronze,false);B(.07,.25,.07,-1+i*.65,1.42,0,M.woodDark,false);}
 a.on('emei:swords',P(14,3,-3),2.5,'看练习用剑',()=>a.card('练习用剑','清音学舍前坪','这里陈放的是练习用剑。行经前坪，给习练者留出转身与收势的空处。'));
 // Tea bushes have woody branches and instanced, serrated individual leaves.
 yield;
 const leafCanvas=document.createElement('canvas');leafCanvas.width=128;leafCanvas.height=256;const ctx=leafCanvas.getContext('2d'),gradient=ctx.createLinearGradient(0,0,128,0);
 gradient.addColorStop(0,'#355927');gradient.addColorStop(.47,'#6d924c');gradient.addColorStop(.52,'#50773b');gradient.addColorStop(1,'#365b2c');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,256);
 ctx.strokeStyle='#9dac6f';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(64,0);ctx.lineTo(64,256);ctx.stroke();ctx.strokeStyle='#8c9e6260';ctx.lineWidth=.8;
 for(let i=0;i<12;i++)for(const side of[-1,1]){ctx.beginPath();ctx.moveTo(64,22+i*19);ctx.quadraticCurveTo(64+side*18,16+i*19,64+side*50,6+i*19);ctx.stroke();}
 const leafTexture=new T.CanvasTexture(leafCanvas);leafTexture.colorSpace=T.SRGBColorSpace;
 const leafMat=new T.MeshStandardMaterial({map:leafTexture,color:0xffffff,emissive:0x20361a,emissiveIntensity:.1,roughness:.7,side:T.DoubleSide});
 const young=leafMat.clone();young.color.setHex(0xdcefa0);young.emissive.setHex(0x6f7d35);young.emissiveIntensity=.2;const stem=new T.MeshStandardMaterial({color:0x718249,roughness:.9});
 function leafGeo(){const shape=new T.Shape();shape.moveTo(0,0);for(let i=1;i<=9;i++){const z=i/10,w=Math.sin(z*Math.PI)*.28+(i%2?.014:-.014);shape.lineTo(w,z);}shape.lineTo(0,1);for(let i=9;i>=1;i--){const z=i/10,w=Math.sin(z*Math.PI)*.28+(i%2?.014:-.014);shape.lineTo(-w,z);}shape.closePath();const g=new T.ShapeGeometry(shape);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,.12*Math.sin(-p.getZ(i)*Math.PI));g.computeVertexNormals();return g;}
 yield;
 const lg=leafGeo(),placements=[],dummy=new T.Object3D();for(let i=0;i<lg.attributes.uv.count;i++)lg.attributes.uv.setX(i,(lg.attributes.uv.getX(i)+.3)/.6);
 const pressed=lg.clone();pressed.rotateX(Math.PI/2);
 for(const [height,angle,width,length,material] of [[3.88,.85,.65,.65,leafMat],[3.98,-.78,.61,.62,leafMat],[4.11,.08,.30,.51,young]]){
  const leaf=mesh(pressed,material,P(-.8,height,-22.665));
  leaf.rotation.z=angle;leaf.scale.set(width,length,.06);
 }
 beam(P(-.80,3.79,-22.67),P(-.80,4.22,-22.67),.014,stem);
 yield;
 for(const z of[8,1,-6]){at(-26,1.8,z);B(25,.22,2.7,0,0,0,M.ashlar);B(24.7,.06,2.4,0,.22,0,bedSoil,false);
  for(let k=0;k<11;k++){const x=-37+k*2.15;at(x,2.08,z);C(.035,.07,.62,0,0,0,M.bark,false,7);
   for(let j=0;j<6;j++){const ang=j*Math.PI/3+.15*k,end=P(x+Math.cos(ang)*.77,2.77+(j%2)*.12,z+Math.sin(ang)*.77);beam(P(x,2.37,z),end,.025,M.bark);
    for(let n=0;n<8;n++){const u=.25+n*.105;placements.push([x+(end.x-x)*u,2.37+(end.y-2.37)*u,z+(end.z-z)*u,-ang-Math.PI/2+(n%2?.85:-.85),.35+(n%3)*.035]);}}
  }
 }
 const foliage=new T.InstancedMesh(lg,leafMat,placements.length);foliage.name='emei:tea-leaves';foliage.castShadow=foliage.receiveShadow=true;
 yield;
 placements.forEach(([x,y,z,r,s],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(.2+.3*Math.sin(i),r,.15*Math.sin(i*.7));dummy.scale.setScalar(s);dummy.updateMatrix();foliage.setMatrixAt(i,dummy.matrix);});root.add(foliage);
 function shoot(x,y,z,fresh,parent=root){const g=new T.Group();g.position.set(x,y,z);parent.add(g);mesh(new T.CylinderGeometry(.01,.018,.4,6),stem,P(0,.2,0),g);
  for(let i=0;i<(fresh?2:4);i++){const l=mesh(lg,fresh?young:leafMat,P(0,.15+i*.045,0),g);l.rotation.y=i*Math.PI+.8;l.rotation.z=i%2?.15:-.1;l.scale.setScalar(fresh?.34:.45);}
  if(fresh){const bud=mesh(new T.SphereGeometry(.05,8,6),young,P(0,.43,0),g);bud.scale.set(.7,2.6,.7);}return g;}
 const targets=[['east',-16,8],['middle',-26,1],['west',-36,-6]];
 for(const [id,x,z]of targets){beam(P(-37+Math.round((x+37)/2.15)*2.15,2.6,z),P(x,2.75,z),.017,stem);const g=shoot(x,2.75,z,true);g.name='emei:shoot:'+id;picks.push({id,g,x,z,base:g.position.clone(),flying:0});
  at(x,1.8,z+1.6);B(.075,.6,.075,0,0,0,M.woodDark);sign('观叶',x,2.35,z+1.62,0,.25);
  a.on('emei:pick:'+id,P(x,2.9,z+.2),2.2,()=>lesson.state.picked.includes(id)?'这枝已采 · 看看别处':'辨叶 · 轻采',()=>{
   const result=lesson.pick(id);if(result==='picked'){a.message('这枝已采，留待新芽再生。');return;}
   picks.find(q=>q.id===id).flying=1;a.checkpoint();a.sound('bowl');a.message(result==='ready'?'三枝嫩梢已入篮 · 到茶屋将叶片摊入竹匾。':'一芽与两片嫩叶 · 轻轻入篮。还可沿茶垄看看。');});
 }
 yield;
 for(const [x,z]of[[-34,8],[-18,-6]]){beam(P(-37+Math.round((x+37)/2.15)*2.15,2.6,z),P(x,2.75,z),.017,stem);const g=shoot(x,2.75,z,false);g.name='emei:mature';a.on('emei:old:'+x,P(x,2.9,z+.2),2.2,'辨叶 · 轻采',()=>a.card('这枝先留下','茶圃 · 辨芽与老叶','叶色较深，叶片也更大。这次练习寻找枝头较浅的一芽两叶，先把这枝留在树上。'));}
 // A working, open-front tea room. Trays rest on a supported table, not in air.
 at(-26,1.8,-19.5);B(28,.18,10,0,0,0,stone);B(28,.025,10,0,.18,0,wood,false);
 for(const x of[-13,13])for(const z of[-4.4,4.4]){B(.48,.22,.48,x,.18,z,M.ashlar);C(.14,.19,3.4,x,.4,z,M.woodDark);}
 B(28,3.6,.32,0,.18,-5,plaster);for(const z of[-4.4,4.4])B(26.5,.3,.24,0,3.65,z,M.woodDark,false);
 for(let x=-12;x<=12;x+=1.2)B(.1,.18,9,x,3.6,0,wood,false);kit(()=>roof(30,12,1.5,.35,0,4,0));sign('茶圃学青',-26,5,-14.9,0,.7);
 at(-26,1.98,-18.5);B(8,.1,2.2,0,.82,0,wood);for(const x of[-3.6,3.6])for(const z of[-.85,.85])B(.12,.82,.12,x,0,z,M.woodDark);
 yield;
 const wicker=M.sack.clone();wicker.color.setHex(0xab9869);wicker.side=T.DoubleSide;
 const basket=mesh(new T.CylinderGeometry(.57,.42,.65,20,1,true),wicker,P(-21.5,2.315,-18.5));basket.name='emei:basket';
 mesh(new T.CircleGeometry(.42,20),wicker,P(-21.5,1.99,-18.5)).rotation.x=-Math.PI/2;
 for(let i=0;i<3;i++){const g=shoot(-21.5+(i-1)*.15,2.1,-18.5,true);g.scale.setScalar(.65);g.name='emei:basket-shoot:'+i;basketLeaves.push(g);}
 for(let i=0;i<3;i++){const x=-29+i*3;at(x,2.9,-18.5);C(.82,.82,.04,0,0,0,wicker,false,24);const rim=new T.TorusGeometry(.81,.025,6,32);rim.rotateX(Math.PI/2);G(rim,M.bamboo,0,.06,0);
  for(let j=0;j<7;j++){const l=mesh(lg,young,P(x+Math.cos(j*2.4)*.45,2.97,-18.5+Math.sin(j*2.4)*.4));l.rotation.y=j*2.4;l.scale.setScalar(.28);l.name='emei:tray-leaf:'+i+':'+j;trayLeaves.push(l);}}
 a.on('emei:spread',P(-26,3,-17.1),3,'将嫩叶摊入竹匾',()=>{const r=lesson.spread();if(r==='missing')a.message(`篮中已有 ${lesson.state.count} 枝 · 再到茶圃找齐三枝嫩梢。`);else if(r==='complete'){spreadTime=1;a.sound('bowl');}else a.message('嫩叶已摊开 · 这段采青见闻已记下。');});
 yield;
 a.npc('看茶师姐',[-33,1.98,-20],0,{robe:2,bun:true,long:true},'先找浅色嫩梢，认出枝顶的芽和相邻嫩叶，再轻轻采下。带回来的叶片摊开放，这里只学采青与摊叶，制成茶还要后续工序。');
 at(-36,1.98,-22);B(2,.75,1,0,0,0,wood);B(.8,.04,.6,0,.75,0,M.paper,false);
 at(-26,1.98,-23.8);for(const y of[.55,1.4])B(15,.08,.7,0,y,0,wood);for(const x of[-7,0,7])B(.12,1.8,.7,x,0,0,M.woodDark);
 for(let i=0;i<9;i++){at(-32+i*1.6,2.61,-23.8);C(.18,.24,.44,0,0,0,wicker,false,16);C(.23,.23,.04,0,.44,0,M.woodDark,false,16);}sign('辨芽 · 轻采 · 摊叶',-26,4.25,-24.28,0,.65);
 a.on('emei:guide',P(-36,3,-21.4),2.5,'读采青小记',()=>a.card('采青小记','先辨芽，再轻采','嫩叶的颜色通常较浅，老叶较深。本次练习寻找一芽两叶，分别在三行茶垄认一枝，采齐后到屋前摊入竹匾。采青只是制茶的起点。'));
 // Rain pavilion: four open bays with exposed roof support and a rain chain.
 at(26,1.8,7);B(17,.24,13,0,0,0,stone);B(17,.03,13,0,.24,0,wood,false);
 yield;
 for(const x of[-7.5,7.5])for(const z of[-5.5,5.5]){B(.55,.25,.55,x,.27,z,M.ashlar);C(.17,.22,3.7,x,.52,z,M.woodDark);}
 for(const z of[-5.5,5.5])B(15.5,.3,.28,0,4.05,z,M.woodDark,false);for(let x=-7;x<=7;x++)B(.12,.2,11,x,4.02,0,wood,false);
 kit(()=>roof(19,15,2.1,.5,0,4.4,0));sign('听雨亭',26,5.45,12.7,0,.7);
 for(const z of[4,8,11])seat('emei:rain:'+z,29,2.07,z,-Math.PI/2,'亭中听风歇息');
 at(33.8,1.8,1);C(.75,.9,.4,0,0,0,M.ashlar,true,20);C(.66,.66,.025,0,.4,0,M.water,false,24);
 for(let i=0;i<25;i++){const g=new T.TorusGeometry(.07,.015,6,10);if(i%2)g.rotateY(Math.PI/2);G(g,M.bronze,0,.55+i*.14,0);}
 // The chain hangs from the beam with a visible bracket.
 yield;
 B(.15,.12,.7,-.15,4,.2,M.bronze,false);C(.015,.015,.15,0,3.93,0,M.bronze,false,6);
 a.on('emei:rainchain',P(32.6,3,1),2.4,'看看檐下雨链',()=>a.card('雨从檐下落','听雨亭','雨来时，檐水沿链落入石钵。晴日坐在开敞的亭中，可看竹影随风而动。'));
 a.npc('歇脚师妹',[23,2.07,4],Math.PI/2,{robe:3,bun:true,long:true},'北面石阶通向望云台。下山前，在亭里歇一歇也好。');
 // Higher destination rewards the climb with an open framed view.
 at(14,5.4,-48);B(24,.2,10,0,0,0,M.ashlar);for(const x of[-10,10])for(const z of[-4,4]){B(.6,.25,.6,x,.2,z,M.ashlar);C(.17,.22,3.6,x,.45,z,M.woodDark);}
 for(const z of[-4,4])B(20.5,.3,.25,0,3.9,z,M.woodDark,false);for(let x=-9;x<=9;x+=1.2)B(.12,.18,8,x,3.9,0,wood,false);kit(()=>roof(26,12,2.1,.5,0,4.25,0));sign('望云台',14,8.8,-43.8,0,.7);
 for(const x of[8,14,20])seat('emei:cloud:'+x,x,5.6,-50,0,'望云歇息');
 yield;
 a.on('emei:clouds',P(28,6.5,-51),3,'看看山间云影',()=>a.card('云影过山','望云台','近处竹林，远处重峦。山路分成几段，走过一段，就坐下看看来路。'));
 for(const [x,z]of[[-41,17],[-40,-9],[-8,14],[-9,-14],[39,17],[40,-8],[19,18]])grove(x,1.8,z);
 for(const [x,z]of[[-42,-20],[40,-19],[-3,-53],[33,-53]])grove(x,z<-38?5.4:1.8,z);
 const bg=new T.BufferGeometry();bg.setAttribute('position',new T.Float32BufferAttribute([0,0,0,.075,.018,-.4,0,.04,-1,0,0,0,0,.04,-1,-.075,.018,-.4],3));bg.computeVertexNormals();
 const bambooMaterial=new T.MeshStandardMaterial({color:0x6b8d50,emissive:0x25351c,emissiveIntensity:.12,roughness:.82,side:T.DoubleSide}),bl=new T.InstancedMesh(bg,bambooMaterial,bambooLeaves.length);bl.name='emei:bamboo-leaves';
 bambooLeaves.forEach(([x,y,z,r,s],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(-.3+Math.sin(i)*.2,r,0);dummy.scale.setScalar(s);dummy.updateMatrix();bl.setMatrixAt(i,dummy.matrix);});bl.castShadow=bl.receiveShadow=true;root.add(bl);
 for(const [x,z,s]of[[-8,3,1.3],[39,3,1.7],[20,-23,1.3],[-40,18,1]])boulder(x,1.8,z,s);
 yield;
 mountainLandscape(T,a.root,'emei',M.cliff);
 for(const [x,y,z,ceiling,intensity]of[[5,5.3,-17,6.11,14],[-26,5,-19,5.52,12],[26,5.3,7,5.92,8]]){at(0,0,0);C(.012,.012,ceiling-y-.22,x,y+.22,z,M.iron,false,6);S(.22,x,y,z,lanternPaper,1,.85,1,20,12);C(.1,.1,.04,x,y+.18,z,M.bronze,false,12);C(.08,.08,.04,x,y-.22,z,M.bronze,false,12);plight(x,y,z,0xffdfad,intensity,12);}
 a.walkers([[0,17],[3,3],[20,-8],[28,-16],[-8,17]],3);
 function sync(dt=0){t+=dt;const s=lesson.state;spreadTime=Math.max(0,spreadTime-dt*.7);for(const q of picks){q.flying=Math.max(0,q.flying-dt);q.g.visible=!s.picked.includes(q.id)||q.flying>0;if(q.flying>0){const u=1-q.flying;q.g.position.copy(q.base).lerp(P(-21.5,2.4,-18.5),u);q.g.position.y+=Math.sin(u*Math.PI)*1.8;}else{q.g.position.copy(q.base);q.g.rotation.z=Math.sin(t*1.4+q.x)*.025;}}
  basketLeaves.forEach((o,i)=>o.visible=!s.spread&&i<s.count);trayLeaves.forEach((o,i)=>{o.visible=s.spread;o.position.y=2.97+spreadTime*(.5+(i%3)*.2);});surfaces.sync();}
 sync();
 yield;
 const incense=kit(()=>b.palette({marble:stone},()=>emeiCourts(b,a)));
 return{id:'emei',name:'峨眉',subtitle:'穿竹径 · 茶圃辨芽 · 亭中歇雨',spawn:{p:[0,0,52],yaw:0},guide:'沿竹径入山 · 茶圃辨芽轻采 · 茶屋摊叶 · 北阶望云',
  guideText(){const {picked,count,spread}=lesson.state;if(spread)return'采青已记 · 到听雨亭歇脚，或打开行旅簿看下一站';if(count===3)return'三枝已齐 · 到茶圃北边的茶屋，将嫩叶摊入竹匾';if(!count)return'山口访弥勒 · 中院观佛、学舍看茶芽 · 北阶上普贤殿';const next=targets.find(([id])=>!picked.includes(id))[0];return `篮中 ${count}/3 枝 · 到${{east:'南排东端',middle:'中排中央',west:'北排西端'}[next]}的「观叶」牌旁辨芽`;},
  locate(p){if(p.z<-54)return p.z<-73?'峨眉 · 普贤殿':'峨眉 · 七佛殿';if(p.z>35&&p.x<-10)return'峨眉 · 弥勒殿';if(p.x>18&&p.z<-8)return'峨眉 · 剑舍';if(Math.abs(p.x)<7&&Math.abs(p.z-6)<5)return'峨眉 · 大雄宝殿';if(p.z>27)return'峨眉 · 竹影山径';if(p.z>22)return'峨眉 · 入山石阶';if(p.y>4.8)return'峨眉 · 望云台';if(p.z<-25)return'峨眉 · 望云石阶';if(p.x<-8)return p.z<-13?'峨眉 · 茶圃学青':'峨眉 · 山间茶圃';if(p.x>17&&p.z>-1)return'峨眉 · 听雨亭';if(p.z<-10)return'峨眉 · 清音学舍';return'峨眉 · 竹庭';},
  tick(dt){sync(dt);incense.tick();},snapshot:()=>({...lesson.state,...incense.snapshot()}),get lesson(){return lesson.state;}};
}
