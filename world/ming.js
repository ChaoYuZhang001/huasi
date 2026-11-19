import {hangingLamp} from './joinery.js';
import {writingDesk} from './room-furnishings.js';
import {mountainLandscape} from './landscape.js';
import {townSurfaces} from './surfaces.js';
import {createWorkshopVisit} from './ming-lesson.js';

// An authored western fortress: cut gate, five working camps, a sunset ledge
// and a real walk-through back passage. No temple/Buddha builder is changed.
export function* buildMing(b,a){
 const {THREE,M,at,B,C,G,S,col,plaque,cushion,crate,sacks,plight}=b,V=THREE.Vector3;
 const point=(x,y,z)=>new V(x,y,z),root=a.root,surfaces=townSurfaces(THREE,M),wood=surfaces.wood;
 const floor=surfaces.stone;floor.color.setHex(0xc8ad82);
 function sandstone(){
  const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),im=g.createImageData(256,256);let seed=932;
  const rand=()=>{seed=Math.imul(seed,1664525)+1013904223|0;return(seed>>>0)/4294967296;};
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){const n=(rand()-.5)*16+Math.sin(y*.27+x*.008)*2,i=(y*256+x)*4;im.data.set([155+n,124+n,89+n,255],i);}
  g.putImageData(im,0,0);g.strokeStyle='#6e574e70';g.lineWidth=1.5;
  for(let y=0;y<256;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();for(let x=(y/32%2)*40;x<256;x+=80){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+32);g.stroke();}}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;
  const m=new THREE.MeshStandardMaterial({map:t,bumpMap:t,bumpScale:.055,roughness:1});m.userData.s=3;return m;
 }
 yield;
 const stone=sandstone(),cap=stone.clone(),cliff=M.cliff.clone();cap.color.setHex(0xded1ac);cliff.color.setHex(0xa17a50);
 const dark=new THREE.MeshStandardMaterial({color:0x342e2b,roughness:1}),cloth=new THREE.MeshStandardMaterial({color:0x9d5040,side:THREE.DoubleSide,roughness:1});
 const water=new THREE.MeshStandardMaterial({color:0x5c9697,roughness:.3,metalness:.12,transparent:true,opacity:.85});
 const effects=[];let time=0;
 const label=(s,x,y,z,r=0,h=.55)=>{at(x,y,z,r);plaque(s,0,0,0,{h,bg:'#472f25',fg:'#f0dcb0'});};
 function slab(x,z,w,d,y=2.8){at(x,0,z);B(w,30+y-.4,d,0,-30,0,cliff);B(w,.4,d,0,y-.4,0,stone);B(w,.025,d,0,y,0,floor,false);}
 function parapet(x1,z1,x2,z2,y=2.8){at(0,y,0);const alongX=Math.abs(x2-x1)>Math.abs(z2-z1),len=Math.hypot(x2-x1,z2-z1),x=(x1+x2)/2,z=(z1+z2)/2;
  B(alongX?len:.55,.85,alongX?.55:len,x,0,z,stone);B(alongX?len+.12:.7,.13,alongX?.7:len+.12,x,.85,z,cap,false);
  const n=Math.max(1,Math.floor(len/3));for(let i=0;i<=n;i++)B(.72,.48,.72,x1+(x2-x1)*i/n,.98,z1+(z2-z1)*i/n,cap,false);
 }
 function stairs(x,z,width,y,rise,n){at(x,y,z);for(let i=0;i<n;i++)B(width,rise*(i+1)/n,.8,0,0,-(i+.5)*.8,stone);}
 function tabletop(x,y,z,w=2.2,d=1.25){at(x,y,z);B(w,.1,d,0,.78,0,wood);for(const sx of[-1,1])for(const sz of[-1,1])B(.12,.78,.12,sx*(w/2-.18),0,sz*(d/2-.18),M.woodDark);}
 function beam(group,start,end,r,material=M.woodDark){const d=new V().subVectors(end,start),m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),material);m.position.copy(start).add(end).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new V(0,1,0),d.normalize());m.castShadow=true;group.add(m);return m;}
 // South approach and ascent. The broad aperture shows the flame beyond.
 yield;
 slab(0,45,14,28,0);slab(0,-9,86,62);stairs(0,36,8.4,0,2.8,18);
 for(const side of[-1,1])for(let i=0;i<18;i+=3)parapet(side*4.65,36-i*.8,side*4.65,36-(i+3)*.8,2.8*(i+1.5)/18);
 parapet(-7,58,-7,34,0);parapet(7,58,7,34,0);parapet(-7,58,-3.2,58,0);parapet(3.2,58,7,58,0);
 // This aperture is an actual hole in a thick extruded wall, not a dark decal.
 {const shape=new THREE.Shape();shape.moveTo(-8,0);shape.lineTo(8,0);shape.lineTo(8,9.7);shape.lineTo(-8,9.7);shape.closePath();const hole=new THREE.Path();hole.moveTo(-3.7,0);hole.lineTo(-3.7,4.5);hole.absarc(0,4.5,3.7,Math.PI,0,true);hole.lineTo(3.7,0);hole.closePath();shape.holes.push(hole);
  const geom=new THREE.ExtrudeGeometry(shape,{depth:2.4,bevelEnabled:false,curveSegments:24});geom.translate(0,2.8,20.8);const mesh=new THREE.Mesh(geom,stone);mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);at(0,2.8,22);col(4.3,9.7,2.4,-5.85,0,0);col(4.3,9.7,2.4,5.85,0,0);col(7.4,1.5,2.4,0,8.2,0);}
 at(0,2.8,22);B(16.6,.35,3,0,9.7,0,cap,false);for(let i=-3;i<=3;i++)B(.95,.9,2.8,i*2.2,10.05,0,stone,false);
 yield;
 label('石灯院',0,12.15,23.25,0,.75);
 at(0,2.8,23.18);for(let i=0;i<20;i++){const lo=i*Math.PI/20+.012,hi=(i+1)*Math.PI/20-.012,s=new THREE.Shape();s.moveTo(Math.cos(lo)*3.7,4.5+Math.sin(lo)*3.7);s.lineTo(Math.cos(lo)*4.18,4.5+Math.sin(lo)*4.18);s.absarc(0,4.5,4.18,lo,hi,false);s.lineTo(Math.cos(hi)*3.7,4.5+Math.sin(hi)*3.7);s.absarc(0,4.5,3.7,hi,lo,true);s.closePath();const wedge=new THREE.ExtrudeGeometry(s,{depth:.25,bevelEnabled:false,curveSegments:4});wedge.setIndex(Array.from({length:wedge.attributes.position.count},(_,k)=>k));G(wedge,cap,0,0,0);}for(const x of[-3.94,3.94])B(.48,4.5,.3,x,0,.1,cap,false);
 // Gallery walls tie each tower into the gatehouse. Enter from the courtyard.
 for(const side of [-1,1]){
  at(side*9.25,2.8,22);B(2.5,8.55,2.4,0,0,0,stone);
  B(2.5,.26,2.68,0,8.55,0,cap);B(2.5,.62,.38,0,8.81,1.01,stone);
  at(side*15,2.8,22);
  B(9,.14,8,0,0,0,cap);
  for(const x of [-4.09,4.09])B(.82,10.8,8,x,0,0,stone);
  for(const x of [-3.63,3.63])B(.27,.38,7.11,x,.14,0,cap);
  B(7.31,.38,.26,0,.14,3.05,cap);
  hangingLamp(b,0,4.15,.68,.68);
  // Two front lights are cut through the wall thickness.
  B(7.36,2.05,.88,0,0,3.56,stone);B(7.36,7.13,.88,0,3.67,3.56,stone);
  B(2.5,1.62,.88,0,2.05,3.56,stone);
  for(const x of [-2.69,2.69])B(1.98,1.62,.88,x,2.05,3.56,stone);
  for(const x of [-2.52,2.52])B(2.32,10.8,.85,x,0,-3.58,stone);
  B(2.72,7.7,.85,0,3.1,-3.58,stone);
  for(const x of [-1.46,1.46])B(.24,3.1,1.04,x,0,-3.58,cap);
  B(3.32,.32,1.04,0,3.10,-3.58,cap);
  for(const x of [-2.5,0,2.5])B(.23,.32,7.2,x,4.15,0,M.woodDark,false);
  B(8.2,.18,7,0,4.47,0,wood);B(9.7,.32,8.7,0,10.8,0,cap);
  for(const x of [-3.8,-1.25,1.25,3.8])for(const z of [-3.5,3.5])B(1.1,1.04,1.1,x,11.12,z,stone,false);
  for(const x of [-4.1,4.1])B(.6,.94,7.9,x,11.12,0,stone,false);
  // The watch table stands to one side of the doorway.
  tabletop(side*15+1.65,2.94,22.1,2.6,1.22);
  at(side*15+1.65,3.82,22.1);
  C(.27,.24,.39,-.62,0,0,M.clay,false,18);C(.30,.26,.065,-.62,.39,0,wood,false,18);
  for(let i=0;i<3;i++){const roll=new THREE.CylinderGeometry(.082,.082,.6,14);roll.rotateX(Math.PI/2);const x=.12+i*.19;G(roll,M.drum,x,.084,-.02);
   for(const z of [-.15,.12]){const tie=new THREE.CylinderGeometry(.087,.087,.039,14);tie.rotateX(Math.PI/2);G(tie,M.robe2,x,.084,z);}
  }
 }
 yield;
 a.on('ming:watch',point(14.8,4.05,21.65),2.15,'读关楼交接记',()=>a.card('关楼交接记','石灯院 · 东关楼','桌上的封筒由关楼交给值守人。出门就是作坊，沿广场中轴可望见炉火。'));
 for(const [x0,x1]of[[-43,-19.5],[19.5,43]])parapet(x0,22,x1,22);
 parapet(-43,22,-43,-4);parapet(-43,-18,-43,-40);parapet(-43,-40,12,-40);parapet(43,22,43,-40);parapet(20,-40,34,-40);
 // Open sandstone assembly hall. Actual beams, columns and backed side walls.
 at(0,2.8,-30);B(25,.3,14,0,0,0,cap);for(const x of[-11.3,11.3])for(const z of[-5.3,5.3]){B(1.25,.45,1.25,x,.3,z,cap);C(.44,.52,6.3,x,.75,z,stone);B(1.4,.4,1.4,x,7.05,z,cap,false);}
 B(25,7.7,.75,0,.3,-6.5,stone);for(const x of[-12,12])B(.75,7.7,13,x,.3,0,stone);
 for(const z of[-5.3,5.3])B(24,.55,.55,0,7.45,z,M.woodDark,false);for(let i=-5;i<=5;i++)B(.24,.3,12,i*2.15,7.7,0,wood,false);
 yield;
 B(26,.45,15,0,8,0,stone);B(26.5,.15,15.5,0,8.45,0,cap,false);for(const x of[-12.8,12.8])B(.5,.8,15,x,8.6,0,stone,false);B(26,.8,.5,0,8.6,-7.2,stone,false);
 // Two intermediate piers carry the front beam, preserving a broad central sightline.
 for(const x of [-5.65,5.65]){
  B(1.10,.35,1.2,x,.30,5.3,cap);B(.68,6.25,.84,x,.65,5.3,stone);
  B(.95,.24,1.12,x,6.9,5.3,cap);B(1.38,.31,1.25,x,7.14,5.3,cap);
 }
 B(24,.41,.82,0,7.47,5.3,cap,false);
 yield;
 for(const sign of [-1,1]){
  const x=sign*8.45;
  B(5.18,.28,.7,x,6.60,5.3,stone,false);
  for(const offset of [-1.65,0,1.65])B(.25,.60,.64,x+offset,6.88,5.3,stone,false);
 }
 label('石灯院议事厅',0,9.1,-22.85,0,.85);at(0,3.1,-34);B(7.5,.15,1.43,0,.65,0,wood);
 for(const x of [-3,0,3]){
  B(.38,.11,1.25,x,0,0,M.woodDark);B(.22,.54,.91,x,.11,0,M.woodDark);
 }
 yield;
 B(6.22,.14,.16,0,.24,0,wood,false);
 at(0,3.9,-34);writingDesk(b,'作坊值次',['钟磬坊','木作坊','水车坊','炉作坊','舆图坊']);
 for(const x of[-6,0,6]){cushion(x,3.1,-29,Math.PI);a.rest('ming:hall:'+x,point(x,3.1,-29),Math.PI,'面向炉火歇坐');}
 for(const x of [-6.4,6.4])for(const z of [-31.5,-28]){
  at(x,3.1,z);B(1.34,.14,.88,0,.45,0,wood);for(const sx of [-.52,.52])B(.15,.45,.65,sx,0,0,M.woodDark);
 }
 a.on('ming:council',point(0,4.45,-31.6),2.8,'看堂中议席',()=>a.card('石灯院议事大厅','明教 · 石灯院','堂前的火盆在夜里照路，两侧的工棚白天开门。从东廊绕到厅后，石道一直通回广场。'));
 // Three shallow steps lead to the central brazier. Collision keeps visitors
 // outside the bowl; its flame is shaded procedural light, not solid cones.
 yield;
 at(0,2.8,-11);C(5,5,.18,0,0,0,cap,true,48);C(4.4,4.7,.18,0,.18,0,stone,true,48);C(3.8,4.1,.18,0,.36,0,cap,true,48);
 C(1.8,2.4,.65,0,.54,0,M.bronze,true,32);C(2.5,1.8,.6,0,1.19,0,M.bronze,true,32);C(2.35,2.35,.08,0,1.78,0,dark,false,32);
 for(const x of[-1.5,1.5])for(const z of[-1.5,1.5])C(.11,.17,.95,x,.55,z,M.bronze,false,10);
 function fire(x,y,z,scale=1){
  const uniforms={t:{value:0}},mat=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,
   vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:`varying vec2 v; uniform float t;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){
      vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      float lower=mix(hash(i),hash(i+vec2(1.,0.)),f.x);
      float upper=mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x);
      return mix(lower,upper,f.y);
    }
    void main(){
      vec2 p=vec2(2.*v.x-1.,v.y);
      float flow=noise(vec2(4.*p.x,5.*p.y-2.1*t))+.4*noise(vec2(10.*p.x,9.*p.y-3.2*t));
      float x=p.x+.12*sin(8.*p.y-2.2*t)*p.y;
      float body=.71*(1.-p.y)-abs(x);
      float tip=p.y+.22*abs(x)-.16*flow;
      float density=(body+.35*(flow-.6))*(1.-smoothstep(.66,1.,tip));
      float alpha=smoothstep(.01,.18,density)*smoothstep(0.,.075,p.y)*(1.-smoothstep(.79,1.,tip));
      if(alpha<.015)discard;
      vec3 ember=vec3(.94,.14,.028),gold=vec3(1.,.59,.11),core=vec3(1.,.94,.60);
      vec3 color=mix(ember,gold,smoothstep(.02,.32,density));
      color=mix(color,core,smoothstep(.28,.59,density)*(1.-smoothstep(.10,.65,p.y)));
      gl_FragColor=vec4(color,alpha*.86);
    }`});
  const group=new THREE.Group();group.position.set(x,y,z);root.add(group);for(let i=0;i<3;i++){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.6*scale,4.3*scale),mat);mesh.position.y=2*scale;mesh.rotation.y=i*Math.PI/3;group.add(mesh);}effects.push(()=>{uniforms.t.value=time;});return group;
 }
 yield;
 fire(0,4.58,-11);at(0,0,0);plight(0,6.5,-11,0xff782b,55,18);
 a.on('ming:flame',point(0,4,-5.7),3,'围火驻足',()=>{a.sound('bowl');a.card('石灯院 · 石灯广场','明教游览','入夜后，守院人添柴把石台的火盆点亮，赶路的人到这里歇脚。往两边的作坊走，可以听编钟、看水车。');});
 // Each workshop demonstrates one working object.
 const visits=createWorkshopVisit(()=>a.learn('ming-workshops'),a.savedState),campDefs=[
  ['metal','钟磬坊',-28,0,'#877460','轻叩编钟'],['wood','木作坊',-28,-22,'#867e69','观察木架'],['water','水车坊',28,-22,'#7b8180','拨动水车'],['fire','炉作坊',28,0,'#93745f','推动风箱'],['earth','舆图坊',19,13,'#8e846c','展开山形沙盘']
 ];
 const motions={};
 function camp(id,name,x,z,color){
  at(x,2.8,z);B(11,.15,10,0,0,0,cap);for(const sx of[-4.5,4.5])for(const sz of[-3.8,3.8]){B(.6,.25,.6,sx,.15,sz,stone);C(.13,.17,3.6,sx,.4,sz,M.woodDark);}
  for(const sz of[-3.8,3.8])B(9.5,.25,.18,0,4,sz,M.woodDark,false);
  const g=new THREE.BufferGeometry(),verts=[-5.1,3.85,-4.4,0,4.8,-4.4,0,4.8,4.4,-5.1,3.85,-4.4,0,4.8,4.4,-5.1,3.85,4.4,0,4.8,-4.4,5.1,3.85,-4.4,5.1,3.85,4.4,0,4.8,-4.4,5.1,3.85,4.4,0,4.8,4.4];g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));const uv=[];for(let i=0;i<verts.length;i+=3)uv.push(verts[i]/10.2+.5,verts[i+2]/8.8+.5);g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();const m=cloth.clone();m.color.set(color);G(g,m,0,0,0);
  B(.15,.2,9,0,4.65,0,M.woodDark,false);for(const zz of[-3.8,3.8])C(.07,.07,.65,0,4.05,zz,M.woodDark,false);
  label(name,x,6.2,z+3.91,0,.5);crate(x+3,2.95,z-2,.8);sacks(x-3,2.95,z-2,2,false);
 }
 yield;
 for(const d of campDefs)camp(...d);
 // Metallic chimes, suspended from a beam; vibration is local feedback.
 at(-28,2.95,0);for(const x of[-1.4,1.4])B(.15,2.3,.15,x,0,-.6,M.woodDark);B(3.2,.2,.22,0,2.3,-.6,M.woodDark,false);
 const chimes=new THREE.Group();chimes.name='ming:chimes';chimes.position.set(-28,4.95,-.6);root.add(chimes);for(let i=0;i<5;i++){const x=(i-2)*.48;beam(chimes,point(x,.3,0),point(x,0,0),.015,M.iron);const m=new THREE.Mesh(new THREE.CylinderGeometry(.12,.19,.45+i*.065,16),M.bronze);m.position.set(x,-.225-i*.0325,0);chimes.add(m);}motions.metal=0;
 // An exposed triangular roof frame: the demonstration highlights its brace.
 const timber=new THREE.Group();timber.name='ming:timber';timber.position.set(-28,2.95,-22);root.add(timber);for(const z of[-1,1]){beam(timber,point(-1.7,0,z),point(-1.7,2,z),.12);beam(timber,point(1.7,0,z),point(1.7,2,z),.12);beam(timber,point(-1.7,2,z),point(0,3.2,z),.1);beam(timber,point(0,3.2,z),point(1.7,2,z),.1);beam(timber,point(-1.7,.3,z),point(1.7,2,z),.085,wood);}beam(timber,point(0,3.2,-1),point(0,3.2,1),.1);motions.wood=0;
 // A wheel stands over a shallow trough; no collision or navigation changes.
 yield;
 at(28,2.95,-22);B(4,.3,2.6,0,0,0,stone);B(3.6,.035,2.2,0,.31,0,water,false);for(const x of[-1.45,1.45])B(.2,1.05,.2,x,.3,0,M.woodDark);
 const wheel=new THREE.Group();wheel.name='ming:wheel';wheel.position.set(28,4.1,-22);wheel.rotation.y=Math.PI/2;root.add(wheel);for(const z of[-.6,.6]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.95,.075,8,32),wood);ring.position.z=z;wheel.add(ring);for(let i=0;i<8;i++){const q=i*Math.PI/4;beam(wheel,point(0,0,z),point(Math.cos(q)*.95,Math.sin(q)*.95,z),.045,wood);}}
 for(let i=0;i<8;i++){const paddle=new THREE.Mesh(new THREE.BoxGeometry(.35,.14,1.4),wood);paddle.position.set(Math.cos(i*Math.PI/4)*.95,Math.sin(i*Math.PI/4)*.95,0);paddle.rotation.z=i*Math.PI/4;wheel.add(paddle);}beam(wheel,point(0,0,-1.5),point(0,0,1.5),.08,M.iron);motions.water=0;
 // A bellows and small hearth are a quiet observation station, not crafting.
 at(28,2.95,0);B(1.4,.7,1.4,-.8,0,-.5,stone);C(.55,.55,.12,-.8,.7,-.5,dark,false,20);fire(27.2,3.77,-.5,.28);
 at(29,2.95,0);B(1.5,.2,1,0,0,0,M.woodDark);const bellows=new THREE.Group();bellows.name='ming:bellows';bellows.position.set(29,3.15,0);root.add(bellows);const bag=new THREE.Mesh(new THREE.BoxGeometry(1.3,.5,.9),M.sack);bag.position.y=.3;bellows.add(bag);const lid=new THREE.Mesh(new THREE.BoxGeometry(1.45,.1,1),wood);lid.position.y=.6;bellows.add(lid);beam(bellows,point(-.5,.4,0),point(-1.3,.4,-.4),.07,M.iron);motions.fire=0;
 // Contours separate vertically for a moment, revealing how a map describes height.
 yield;
 tabletop(19,2.95,13,3.4,2.6);const layers=new THREE.Group();layers.name='ming:contours';layers.position.set(19,3.83,13);root.add(layers);for(let i=0;i<5;i++){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(1.1-i*.17,1.2-i*.17,.13,7),i%2?cap:stone);mesh.scale.z=.72;mesh.position.y=.065+i*.13;mesh.rotation.y=.2;layers.add(mesh);}motions.earth=0;
 const notes={metal:'编钟长短不同，轻叩时留意余音。',wood:'斜撑把四边形分成三角形；沿着木构能看清支撑关系。',water:'轮叶经过水槽，轮轴带着轮圈一起转动。',fire:'风箱起落时，留意炉边火光的变化。',earth:'一层一层的轮廓对应不同高度；层叠便能读出山形。'};
 for(const [id,name,x,z,,action]of campDefs){a.on('ming:camp:'+id,point(x,4,z+1.5),3,action,()=>{motions[id]=4;const known=visits.state.seen.includes(id);visits.observe(id);if(!known)a.checkpoint();drawLedger();a.sound(id==='water'?'pour':id==='metal'?'bell':'take');a.message(name+' · '+notes[id]+'（'+visits.state.count+'/5）');});}
 // The ledger is a visible object in the world, not a full-screen quest menu.
 tabletop(-13,2.8,10,3,1.6);const board=document.createElement('canvas');board.width=768;board.height=384;const ctx=board.getContext('2d'),tex=new THREE.CanvasTexture(board);tex.colorSpace=THREE.SRGBColorSpace;const ledger=new THREE.Mesh(new THREE.PlaneGeometry(2.7,1.35),new THREE.MeshStandardMaterial({map:tex,roughness:1}));ledger.rotation.x=-Math.PI/2;ledger.position.set(-13,3.682,10);root.add(ledger);
 function drawLedger(){ctx.fillStyle='#d9c5a1';ctx.fillRect(0,0,768,384);ctx.fillStyle='#3c2c23';ctx.font='bold 66px serif';ctx.textAlign='center';ctx.fillText('百工访学',384,90);ctx.font='34px serif';campDefs.forEach((d,i)=>{ctx.fillStyle=visits.state.seen.includes(d[0])?'#7e3322':'#756e5e';ctx.fillText((visits.state.seen.includes(d[0])?'● ':'○ ')+d[1],130+(i%3)*250,190+Math.floor(i/3)*75);});tex.needsUpdate=true;}drawLedger();
 a.on('ming:ledger',point(-13,4,10),3,()=>visits.state.count===5?'记下作坊见闻':'查看百工访学',()=>{const state=visits.record();if(state==='complete'){a.sound('bowl');a.message('作坊见闻 · 已记入行旅。');}else if(state==='recorded')a.message('这次巡识已记下，可继续游览。');else a.card('百工访学','作坊见闻 · '+visits.state.count+'/5','听过编钟、看过木架、水车、风箱和山形沙盘，再回桌边把见闻记进簿里。');});
 yield;
 a.npc('木作匠',[-24.7,2.8,-20.3],-1.6,{robe:2,bun:true},'木架先立柱，再上梁。你看侧面的斜撑，架子受推时便不容易歪。');
 a.npc('水车匠',[24.6,2.8,-20.1],1.7,{robe:1,bun:true},'轮叶伸进水槽，转轮把力传到轴上。你来拨一拨，站在侧边能看清楚。');
 a.npc('领路人',[-10.5,2.8,11],Math.PI/2,{robe:1,bag:true},'先到两侧作坊看看器物，再回桌边记下见闻。西台可歇脚，东侧石道通向院后。');
 a.npc('守火人',[-5.5,2.8,-16],Math.PI/3,{robe:0,hat:true},'山口风大，我照料炉火，客商入夜凭灯认路。');a.npc('远行客商',[8,3.1,-33],0,{visitor:true,robe:4,bag:true},'山口朝南。西台看群山，东边的石道绕过议事厅，可走回广场。');
 // Sunset ledge with two supported shade sails and seating facing west.
 slab(-51,-11,18,14);parapet(-60,-18,-43,-18);parapet(-60,-4,-43,-4);parapet(-60,-18,-60,-4);
 at(-53,2.8,-11);for(const x of[-3,3])for(const z of[-4,4]){C(.1,.14,3.8,x,0,z,M.woodDark);}
 yield;
 B(6.5,.12,.16,0,3.8,-4,M.woodDark,false);B(6.5,.12,.16,0,3.8,4,M.woodDark,false);B(6.5,.05,8.5,0,3.85,0,cloth,false);
 for(const z of[-8,-11,-14]){cushion(-56,2.8,z,Math.PI/2);a.rest('ming:sunset:'+z,point(-56,2.8,z),Math.PI/2,'临风看群山');}
 label('西望台',-44,5.5,-6,1,.5);at(-44,2.8,-6);B(.12,2.7,.12,0,0,0,M.woodDark);
 // L-shaped passage. Same floor level avoids stacked nav cells; thick walls
 // and roof create real shadow, and the northern exit joins the open terrace.
 slab(37,-36,5,23);slab(26,-47,27,5);slab(15,-42.5,5,12);
 at(0,2.8,0);B(.8,4.5,19.3,34.1,0,-34.15,stone);B(.8,4.5,26,39.9,0,-37.5,stone);B(6.8,.75,23,37,4.5,-36,cliff);
 yield;
 B(27,4.5,.8,26,0,-50,stone);B(17.5,4.5,.8,25.75,0,-44,stone);B(27,.75,6.8,26,4.5,-47,cliff);
 for(const z of[-29,-36,-43]){B(.14,3.9,.18,34.6,0,z,M.woodDark,false);B(.14,3.9,.18,39.4,0,z,M.woodDark,false);B(5,.22,.22,37,3.9,z,M.woodDark,false);}
 label('后山石道',37,6.5,-24.45,0,.5);at(0,0,0);plight(37,5.5,-35,0xffbf74,12,9);plight(24,5.5,-47,0xffbf74,9,8);
 // Ceiling-hung lamps account for the passage lights, with visible stems.
 for(const [x,z]of[[37,-35],[24,-47]]){at(x,5.2,z);C(.25,.31,.15,0,0,0,M.bronze,false,12);C(.2,.2,.45,0,.15,0,M.glow,false,12);C(.3,.24,.12,0,.6,0,M.bronze,false,12);C(.025,.025,1.38,0,.72,0,M.iron,false,8);}
 for(const x of[-5.6,5.6]){at(0,0,0);plight(x,6.9,-30,0xffcf93,12,13);at(x,6.5,-30);C(.32,.4,.17,0,0,0,M.bronze,false,12);C(.26,.26,.5,0,.17,0,M.glow,false,12);C(.4,.28,.15,0,.67,0,M.bronze,false,12);C(.025,.025,3.48,0,.82,0,M.iron,false,8);}
 a.on('ming:passage',point(37,4.2,-31),2.5,'辨认石道出口',()=>a.card('后山石道','石道记路','从南口向北，尽头向西转。见到天光后再向南走，便回到前院。'));
 // Sparse stones and thorn scrub leave long sightlines through the camp.
 yield;
 for(const [x,z,r]of[[-38,13,1.1],[-37,-31,1.5],[37,12,1.4],[11,-18,.8],[-19,-13,.7]]){at(x,2.8,z);S(r,0,r*.6,0,cliff,1,.7,.8,7,5);}
 for(const [x,z]of[[-6,40],[6,46],[-39,7],[39,7],[-38,-36],[24,-38]]){at(x,z>30?0:2.8,z);for(let j=0;j<7;j++){const twig=new THREE.CylinderGeometry(.008,.024,.7+j*.04,5);twig.rotateZ(Math.sin(j*2)*.5);twig.rotateY(j);G(twig,wood,Math.sin(j)*.25,.35,Math.cos(j)*.25);}}
 yield;
 mountainLandscape(THREE,a.root,'ming',M.cliff);

 at(-5,0,51);B(.15,1.8,.15,0,0,0,M.woodDark);label('西域古道 · 昆仑',-5,1.8,51,0,.45);a.on('ming:kunlun',point(-5,1.3,51),3.2,'沿西域古道去昆仑',()=>a.travel('kunlun'));
 return{id:'ming',name:'明教 · 石灯院',subtitle:'过关隘 · 访作坊 · 临风看群山',spawn:{p:[0,0,54],yaw:0},guide:'中央炉火 · 百工访学 · 西台歇脚 · 东道绕行',
  get lesson(){return visits.state;},
  snapshot(){return visits.state;},
  locate(p){if(p.z>22)return'明教 · 山口关隘';if(p.x<-43)return'明教 · 西望台';if(p.z<-40||p.x>34&&p.z<-24)return'明教 · 后山石道';if(Math.abs(p.x)<13&&p.z<-23)return'明教 · 议事大厅';for(const [id,name,x,z]of campDefs)if(Math.hypot(p.x-x,p.z-z)<8)return'明教 · '+name;return'明教 · 石灯广场';},
  tick(dt){time+=dt;surfaces.sync();effects.forEach(f=>f());for(const key in motions)motions[key]=Math.max(0,motions[key]-dt);chimes.rotation.z=motions.metal?Math.sin(time*14)*.06*motions.metal/4:0;timber.rotation.y=motions.wood?Math.sin(time*1.2)*.06:0;if(motions.water)wheel.rotation.z+=dt*1.5;bag.scale.y=motions.fire?1+Math.sin(time*5)*.3:1;bag.position.y=.25*bag.scale.y;lid.position.y=.5*bag.scale.y+.05;layers.children.forEach((m,i)=>m.position.y=.065+i*(.13+(motions.earth?Math.sin(Math.PI*motions.earth/4)*.14:0)));}
 };
}
