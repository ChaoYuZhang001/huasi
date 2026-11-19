import {cargo, openWaybills} from './consignment.js';
import {townSurfaces} from './surfaces.js';
import {mountainLandscape} from './landscape.js';

export function* buildEscort(b, a) {
  const {THREE:T,M,at,B,C,G,S,col,plaque} = b;
  const {root} = a;
  const point = (x,y,z) => new T.Vector3(x,y,z);
  const plaster = new T.MeshStandardMaterial({color:0xd9d3bc, roughness:1});
  const indigo = new T.MeshStandardMaterial({color:0x324957, roughness:.9, side:T.DoubleSide});
  const straw = new T.MeshStandardMaterial({color:0xa68a57, roughness:1});
 yield;
  const ink = new T.MeshStandardMaterial({color:0x30435a, roughness:.42});
  const surfaces=townSurfaces(T,M);
  const river=M.water.clone();river.bumpScale=.18;river.roughness=.39;river.color.setHex(0x465f58);
  const canopy=surfaces.cloth;canopy.color.setHex(0x384c50);canopy.roughness=.93;
  const waybills = openWaybills(a.savedState);

  function sign(text,x,y,z,h=.46,r=0) {
    at(x,y,z,r);
    plaque(text,0,0,0,{h,bg:'#203b41',fg:'#f0dfb8',noframe:true});
  }
  function board(text,x,z,r=0) {
    at(x,0,z,r);
    B(.15,1.65,.15,0,0,0,M.woodDark);
    sign(text,x,1.65,z,.45,r);
  }
  function table(x,z,w=2.2) {
    at(x,0,z);
    for (const sx of [-1,1]) for (const sz of [-1,1])
      B(.12,.87,.12,sx*(w/2-.16),0,sz*.43,M.woodDark);
    B(w,.11,1.16,0,.87,0,surfaces.wood);
  }
  function shed(x,z,r,w,d,h,gables) {
    at(x,0,z,r);
    for (const side of [-1,1]) {
      for (const dz of [-1,1]) {
        const px=side*(w/2-.4), pz=dz*(d/2-.45);
        B(.48,.26,.48,px,0,pz,M.ashlar);
        C(.135,.17,h-.26,px,.26,pz,M.woodDark);
      }
      B(w,.29,.24,0,h-.29,side*(d/2-.45),M.woodDark,false);
      if (gables) {
        // The capped, stepped fire walls rise above the roof on either side.
        const px=side*w/2;
        for (const [depth,base,height] of [[d,0,h+.35],[d*.71,h+.35,.65],[d*.39,h+1,.60]]) {
          B(.36,height,depth,px,base,0,plaster);
          B(.55,.11,depth+.15,px,base+height,0,M.ridge,false);
        }
      }
    }
    for(let dx=-w/2+.6;dx<w/2;dx+=.85) B(.09,.15,d,dx,h-.16,0,surfaces.wood,false);
    b.palette({gold:M.iron,eave:M.woodDark},()=>b.roof(w+1.1,d+1.55,1.75,.34,0,h+.2,0));
  }
  // South lane and courtyard end at the river wall. The water has no walking surface.
 yield;
  at(0,0,0);
  B(42,1.55,59,-3,-1.55,.5,M.ashlar);
  B(42,.018,59,-3,.001,.5,surfaces.soil,false);
  B(10,.04,53,0,0,1.5,surfaces.stone,false);
  B(32,.03,6,0,.005,-5,surfaces.stone,false);
  B(34,.032,5,-1,.005,10,surfaces.stone,false);
  B(3.8,.035,47,15.9,0,1,M.ashlar,false);
 yield;
  B(10,.025,27,-15,.008,-2,surfaces.stone,false);
  B(11,.022,10,10,.006,-18,surfaces.stone,false);
  B(.4,.18,22,17.8,-.1,-17.4,M.ashlar);B(.4,.18,30,17.8,-.1,14,M.ashlar);
  B(260,.15,700,90,-1.65,0,M.cliff,false);
  B(144,1.4,700,-54,-1.44,0,surfaces.soil,false);
  B(24,.03,700,30,-.93,0,river,false);
  B(158,1.4,700,121,-1.4,0,surfaces.soil,false);
  // Bank-side houses and stone steps give the opposite shore a readable scale.
 yield;
  for(const [x,z,w,h] of [[49,-28,10,3.6],[52,-12,11,4.4],[48,6,8,3.6],[53,19,13,4.2]]) {
    at(x,0,z,3);B(w,h,6,0,0,0,plaster,false);
    for(let dx=-w/2+1.5;dx<w/2;dx+=2.5)B(1.1,1.45,.12,dx,.9,3.04,M.lattice,false);
    b.palette({gold:M.iron},()=>b.roof(w+1.6,7.8,2,.25,0,h,0));
  }
  // The towpath meets a humpback bridge downstream. The open arch frames the river bend.
  const crown=x=>.3+4.4*(.5+.5*Math.cos(Math.PI*Math.min(1,Math.abs(x)/15)));
 yield;
  const profile=new T.Shape();profile.moveTo(-16,-1.4);profile.lineTo(-16,crown(-16));
  for(let x=-15;x<=15;x+=.5)profile.lineTo(x,crown(x));
  profile.lineTo(16,crown(16));profile.lineTo(16,-1.4);profile.lineTo(8,-1.4);profile.lineTo(8,-.55);
  profile.bezierCurveTo(8,1.9,4.4,3.85,0,3.85);profile.bezierCurveTo(-4.4,3.85,-8,1.9,-8,-.55);profile.lineTo(-8,-1.4);profile.closePath();
  const bridge=part(root,new T.ExtrudeGeometry(profile,{depth:3.3,bevelEnabled:false,curveSegments:20}),M.ashlar,30,0,-37);
  bridge.name='escort:river-bridge';
  for(const z of [-37.08,-33.62]){
    const parapet=[];
    for(let x=-15;x<=15;x+=1.5){
      parapet.push([30+x,crown(x)+.80,z]);
      at(30+x,crown(x),z);B(.20,.85,.20,0,0,0,M.ashlar,false);
    }
    line(root,parapet,.10,plaster);
    const arch=[];for(let i=0;i<=32;i++){const t=i*Math.PI/32;arch.push([30+8*Math.cos(t),-.50+4.46*Math.sin(t),z]);}
    line(root,arch,.14,plaster);
  }
 yield;
  mountainLandscape(T,root,'escort',M.rock);
  b.palette({red:plaster},()=>{
    b.wall(-23,28,-23,-28); b.wall(-23,-28,17.8,-28);
    b.wall(-23,28,-3.4,28); b.wall(3.4,28,17.8,28);
    b.wall(-23,19,-3.7,19); b.wall(3.7,19,13,19);
  });

 yield;
  b.rail(17.8,-28,17.8,-6.4,0);b.rail(17.8,-1,17.8,28,0);
  // Short loading pier steps down from the towpath, alongside the open bow.
  at(0,0,0);B(2.95,.18,5.4,19.05,-.34,-3.7,M.woodDark);
  for(let i=0;i<16;i++)B(2.95,.045,.315,19.05,-.16,-6.2+i*.33,surfaces.wood,false);
  for(const z of [-6.36,-1.04]){
    B(2.85,.1,.1,19.05,.58,z,M.woodDark,false);col(2.85,.82,.16,19.05,-.12,z);
    for(const x of [18.15,20.38])C(.12,.14,2.0,x,-1.06,z,M.woodDark);
  }
 yield;
  B(.15,.18,5.4,20.47,-.12,-3.7,M.woodDark);
  // A low mooring rope guards the river edge without blocking the view of the boat.
  col(.15,1,5.4,20.47,-.12,-3.7);
  line(root,[[20.47,.64,-6.35],[20.47,.34,-3.7],[20.47,.64,-1.05]],.028,straw);
  shed(0,19,0,8.5,3.5,4.1,false);
  sign('平川镖局',0,3.8,20.64,.91);
  for(const x of [-2.85,2.85]) {
    at(x,0,20.32);C(.018,.018,.38,0,3.56,0,M.woodDark,false,6);
    S(.36,0,3.18,0,M.lantern,1,1.14,1,20,12);
    for(const y of [2.83,3.50])C(.24,.24,.08,0,y,0,M.bronze,false,16);
    for(let i=0;i<5;i++)C(.015,.009,.25,(i-2)*.046,2.58,0,M.ribbon,false,6);
  }
  // A dyed pennant marks the land-side entrance. The hanging edge curls under its own weight.
 yield;
  at(-5.8,0,20.9);C(.52,.63,.38,0,0,0,M.ashlar);C(.075,.1,4.65,0,.38,0,M.woodDark);
  B(1.52,.075,.09,.65,4.69,0,M.woodDark,false);
  const flagCanvas=document.createElement('canvas');flagCanvas.width=256;flagCanvas.height=384;
  const paint=flagCanvas.getContext('2d');paint.fillStyle='#763b32';paint.fillRect(0,0,256,384);
  paint.strokeStyle='#c9a176';paint.lineWidth=5;paint.strokeRect(13,13,230,358);
  paint.textAlign='center';paint.fillStyle='#efe3c4';paint.font='bold 100px "Songti SC",serif';
  paint.fillText('平',128,160);paint.fillText('川',128,292);
 yield;
  const textile=new T.CanvasTexture(flagCanvas);textile.colorSpace=T.SRGBColorSpace;
  const pennant=new T.PlaneGeometry(1.24,1.92,14,10),v=pennant.attributes.position;
  for(let i=0;i<v.count;i++){const t=(.96-v.getY(i))/1.92;v.setZ(i,.13*t*Math.sin(6*v.getX(i)+t));}
  pennant.computeVertexNormals();
  const flag=part(root,pennant,new T.MeshStandardMaterial({map:textile,side:T.DoubleSide,roughness:1}),-5.08,3.70,20.9);
  flag.name='escort:house-flag';
  a.on('escort:flag',point(-5.7,1.55,21.1),2.8,'认平川镖旗',()=>a.card('平川镖旗','江南商路 · 运单与镖旗','旗上绣着「平川」二字，镖车和渡船都用同一面旗。往来的客商凭旗认号，到了签押房，再看运单上写的货物和收货人。'));
 yield;
  board('回三四镇',4.2,25);
  a.on('escort:return',point(4.2,1.4,25),3,'随驿车回三四镇',()=>a.travel('town'));

  // Waybill counter, open to the yard with account books under the eaves.
  shed(0,-18,0,13,8.2,4.5,true);
  at(0,0,-18); B(13,4.3,.34,0,0,-3.9,plaster);
  for(const x of [-4,4]) {
    B(2.5,2.35,.48,x,0,-3.55,M.woodDark);
    for(let j=0;j<3;j++)for(let k=0;k<5;k++)
      B(.32,.12,.40,x-.85+k*.41,.37+j*.73,-3.20,k%2?indigo:M.sack,false);
  }
 yield;
  sign('签押房',0,4.05,-13.98,.72);
  table(-2.3,-14.5,3.5); table(2.3,-14.5,3.5);
  sign('东岸茶庄',-2.3,.72,-13.9,.37);sign('西门书铺',2.3,.72,-13.9,.37);
  a.npc('账房先生',[.2,0,-17],0,{robe:2,bun:true,beard:true},'两家托了货。茶庄隔水，瓷盏要垫软。书铺在西门外，道上湿气重，书怕潮。');
  shed(-16,-2,1,17,7.4,3.9,true);
  at(-16,0,-2); B(.3,3.8,17,-3.5,0,0,plaster);
  table(-14.8,-5.5,2.6);table(-14.8,1.5,2.6);
 yield;
  sign('草衬',-13.45,1.38,-5.5,.39,1);sign('油布',-13.45,1.38,1.5,.39,1);
  at(-14.8,.98,-5.5);
  for(let i=0;i<9;i++) {
    const reed=new T.CylinderGeometry(.043,.049,1.7,6);
    reed.rotateZ(Math.PI/2);G(reed,straw,0,.05+(i%2)*.04,(i-4)*.09);
  }
  at(-14.8,.98,1.5);
 yield;
  for(let i=0;i<4;i++) B(1.45-i*.05,.066,.77,i*.04,i*.068,0,indigo,false);
  b.crate(-18,0,-6.8,1.1);b.sacks(-18,0,.4,4,false);

  // A real river boat with rising gunwales, tapered hull and a ribbed arched awning.
  const boat = new T.Group();boat.name='escort:boat';boat.position.set(21.95,-.86,-4.6);root.add(boat);
  function part(parent,geometry,material,x,y,z) {
    const mesh=new T.Mesh(geometry,material);
    mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function line(parent,vertices,radius,material) {
    const path=new T.CatmullRomCurve3(vertices.map(v=>point(...v)));
    return part(parent,new T.TubeGeometry(path,Math.max(12,vertices.length*4),radius,6,false),material,0,0,0);
  }
 yield;
  const hullSections=[[-4.8,.06,1.05],[-3.7,.89,.82],[-2.2,1.17,.73],[0,1.21,.71],[2.4,1.13,.74],[3.8,.71,.91],[4.7,.06,1.12]];
  function strip(rows,material,parent) {
    const positions=[],uv=[],indices=[];
    rows.forEach((row,i)=>row.forEach((v,j)=>{
      positions.push(...v);uv.push(j/(row.length-1),i/(rows.length-1));
      if(i&&j){const end=i*row.length+j;indices.push(end-row.length-1,end-row.length,end,end-row.length-1,end,end-1);}
    }));
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
    return part(parent,geometry,material,0,0,0);
  }
 yield;
  const hullWood=M.woodDark.clone();hullWood.side=T.DoubleSide;
  strip(hullSections.map(([z,w,h])=>[[-w,h,z],[-w*.82,.2,z],[-w*.42,-.25,z],[w*.42,-.25,z],[w*.82,.2,z],[w,h,z]]),hullWood,boat);
  for(const side of [-1,1])line(boat,hullSections.map(([z,w,h])=>[side*w,h,z]),.055,surfaces.wood);
  for(let i=0;i<25;i++){
    const z=-3.65+i*.30, high=hullSections.findIndex(section=>section[0]>=z);
    const [z0,w0]=hullSections[high-1],[z1,w1]=hullSections[high];
    part(boat,new T.BoxGeometry((w0+(w1-w0)*(z-z0)/(z1-z0))*1.77,.065,.29),surfaces.wood,0,.62,z);
  }
 yield;
  const canopyRow=z=>Array.from({length:17},(_,i)=>{const angle=i*Math.PI/16;return [Math.cos(angle)*1.12,.74+Math.sin(angle)*1.42,z];});
  strip([canopyRow(-2.95),canopyRow(-.38)],canopy,boat);
  for(const z of [-2.95,-2.35,-1.71,-1.05,-.38])line(boat,canopyRow(z),.033,straw);
  at(16.45,0,-3.7);
  for(const z of [-2.3,2.3]) C(.15,.2,1.12,.44,0,z,M.woodDark);
  board('东岸渡口',15.4,-8,0);
  const mooring=line(root,[[20.38,.79,-6.36],[20.58,.26,-6.8],[21.06,.01,-7.6]],.026,straw);
 yield;
  mooring.name='escort:mooring';

  // Covered road cart with spoked wheels, a tilt and a rear loading ledge.
  at(-10,0,10);
  for(const side of [-1,1]) {
    const wheel=new T.TorusGeometry(.76,.075,8,32);wheel.rotateY(Math.PI/2);G(wheel,M.woodDark,side*1.15,.79,0);
    for(let i=0;i<8;i++) {
      const spoke=new T.BoxGeometry(.075,1.48,.055);spoke.rotateX(i*Math.PI/8);G(spoke,surfaces.wood,side*1.15,.79,0);
    }
    B(.11,.13,3.1,side*.65,.75,2.1,M.woodDark,false);
  }
 yield;
  B(2.1,.15,3.5,0,.85,0,M.woodDark);
  for(const side of [-1,1]) {
    B(.12,.62,3.3,side*.99,1,0,surfaces.wood,false);
    for(const z of [-1.2,.3])C(.055,.06,1.57,side*.98,1,z,surfaces.wood,false);
  }
  const cartCover = new T.Group();cartCover.position.set(-10,1.82,10);root.add(cartCover);
  const arch=z=>Array.from({length:13},(_,i)=>[Math.cos(i*Math.PI/12)*1.12,.18+Math.sin(i*Math.PI/12)*.70,z]);
 yield;
  strip([arch(-1.53),arch(.58)],indigo,cartCover);for(const z of [-1.53,-.5,.58])line(cartCover,arch(z),.035,straw);
  board('西路车',-7.75,11);

  // Water-side tea and a separate shaded holding bay for pack saddles and feed.
  shed(10.8,-18.5,0,7,7,3.6,false);
  at(10.8,0,-17.8);B(3.65,.1,.88,0,.4,0,M.woodDark);
  for(const dx of [-1.35,1.35])B(.17,.40,.64,dx,0,0,surfaces.wood);
  // Sit facing south; the step-out lands in the open aisle in front of the bench.
 yield;
  const seatZ=-17.54;
  for(const x of [9.85,11.75])a.rest('escort:tea:'+x,point(x,.5,seatZ),Math.PI,'临河茶棚歇脚',{bench:true,exit:point(x,0,-16.6)});
  table(13.3,-19.5,1.45);at(13.3,.98,-19.5);
  for(const x of [-.38,.16]){C(.13,.07,.12,x,0,0,M.jade,false,16);C(.108,.108,.012,x,.11,0,surfaces.wood,false,16);}
  sign('歇脚茶棚',10.8,3.15,-15.3,.50);
  shed(9,9,0,6.6,6,3.45,false);
  at(9,0,9);for(const dx of [-2.5,0,2.5]){B(.18,1.55,2.8,dx,0,-.48,M.woodDark);B(.24,.13,3,dx,1.55,-.48,surfaces.wood);}
 yield;
  B(5.8,.46,.83,0,.29,-2.2,M.woodDark);b.sacks(9,0,8,3,true);sign('备马棚',9,2.95,11.7,.48);
  // Two indigo pennants mark the working yard between the cart and quay.
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=512;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#263e44';ctx.fillRect(0,0,256,512);
  for(let y=0;y<512;y+=4){ctx.fillStyle='rgba(222,195,147,.09)';ctx.fillRect(0,y,256,1);}
  ctx.strokeStyle='#cbb080';ctx.lineWidth=5;ctx.strokeRect(15,15,226,482);
  ctx.strokeStyle='#996c4e';ctx.lineWidth=2;ctx.strokeRect(24,24,208,464);
 yield;
  ctx.fillStyle='#e3cc98';ctx.font='bold 136px "Kaiti SC","STKaiti",serif';ctx.textAlign='center';
  ctx.fillText('平',128,213);ctx.fillText('川',128,364);
  const flagTexture=new T.CanvasTexture(canvas);flagTexture.colorSpace=T.SRGBColorSpace;
  const flagCloth=new T.MeshStandardMaterial({map:flagTexture,roughness:1,side:T.DoubleSide});
  const wind={value:0};
  function flutter(shader){
    shader.uniforms.uRiverWind=wind;
    shader.vertexShader='uniform float uRiverWind;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      float fall=(1.47-position.y)/2.94;
      transformed.z+=fall*(.16*sin(position.x*4.+fall*2.-uRiverWind*1.8)+.08*cos(fall*5.-uRiverWind));`);
  }
 yield;
  flagCloth.onBeforeCompile=flutter;
  const flagDepth=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,side:T.DoubleSide});
  flagDepth.onBeforeCompile=flutter;
  for(const [x,z,angle] of [[-4.6,8,.21],[6.1,-8,-.32]]){
    at(x,0,z);B(.7,.32,.7,0,0,0,M.ashlar);C(.075,.13,6.7,0,.32,0,M.woodDark);
    B(2.18,.09,.09,.89,6.77,0,surfaces.wood);S(.13,0,7.06,0,M.bronze);
    const geo=new T.PlaneGeometry(1.65,2.94,12,18);
    const flag=part(root,geo,flagCloth,x+1.02,5.22,z);flag.rotation.y=angle;
    flag.customDepthMaterial=flagDepth;
  }
 yield;
  const nearbyTrees=[[-20,14,6],[-20,-22,7],[14,-24,6.8],[13,15,6.7],[45,11,8],[44,-22,9],[48,35,8]];
  for(const [x,z,h] of nearbyTrees)b.palette({ginkgo:M.gkC},()=>b.ginkgo(x,0,z,h));
  for(const [x,z] of [[-20,19],[7,-23],[13,2],[-5,-25],[46,-5]])b.bamboo(x,0,z);
  b.lstring(-5.8,-9.5,6,-9.5,4.3,4);
  b.plight(0,3.35,-14.8,0xffc887,19,13);
  b.plight(-14.5,2.9,-2,0xf7ce93,14,10);
  a.npc('渡船伙计',[14.6,0,-.7],Math.PI,{robe:3,hat:true},'东岸茶庄的盏走水路。船上的前舱留给货，后篷给人歇脚。');
 yield;
  a.walkers([[0,13],[6,4],[13,-10],[5,-12],[-8,-4],[-7,6]],3);

  // Each order exists in exactly one place, from the counter to its carrier.
  function parcel(id) {
    const group=new T.Group(), loose=new T.Group(), wrap=new T.Group();
    group.name='escort:cargo:'+id;group.add(loose,wrap);root.add(group);
    if(id==='cups')for(const x of [-.21,.21]){
      const profile=[[.095,.015],[.105,.05],[.178,.15],[.175,.18],[.157,.174],[.115,.09],[.085,.07]];
      part(loose,new T.LatheGeometry(profile.map(v=>new T.Vector2(...v)),24),M.jade,x,0,0);
      const band=new T.TorusGeometry(.17,.009,6,24);band.rotateX(Math.PI/2);part(loose,band,ink,x,.15,0);
    }
    else for(let i=0;i<3;i++){
      part(loose,new T.BoxGeometry(.56,.06,.39),plaster,.03*i,.04+i*.076,0);
      part(loose,new T.BoxGeometry(.58,.015,.40),indigo,.03*i,.077+i*.076,0);
    }
    const material=id==='cups'?M.crate:indigo;
    part(wrap,new T.BoxGeometry(.77,.39,.57),material,0,.20,0);
    for(const x of [-.24,.24])part(wrap,new T.BoxGeometry(.037,.41,.59),straw,x,.20,0);
    part(wrap,new T.BoxGeometry(.79,.41,.033),straw,0,.20,0);
    part(wrap,new T.BoxGeometry(.24,.013,.17),plaster,.09,.414,.07);
    return {group,loose,wrap};
  }
 yield;
  const parcels={cups:parcel('cups'),books:parcel('books')};
  const home={cups:point(-2.3,.98,-14.5),books:point(2.3,.98,-14.5)};
  const landed={cups:point(0,.67,1.5),books:point(-10,1,10.92)};
  function updateCargo() {
    for(const [id,obj] of Object.entries(parcels)){
      const delivered=waybills.done(id),held=waybills.active===id;
      const parent=delivered&&id==='cups'?boat:root;
      if(obj.group.parent!==parent)parent.add(obj.group);
      obj.wrap.visible=delivered||(held&&waybills.packed);obj.loose.visible=!obj.wrap.visible;
      if(!held){obj.group.visible=true;obj.group.position.copy(delivered?landed[id]:home[id]);obj.group.rotation.y=0;obj.group.scale.setScalar(1);}
    }
  }
  function changed(message,sound) {
    updateCargo();a.checkpoint();a.sound(sound);a.message(message);
  }
 yield;
  for(const [id,item] of Object.entries(cargo)){
    a.on('escort:take:'+id,home[id].clone().setY(1.1),2.65,
      ()=>waybills.active||waybills.done(id)?null:(id==='cups'?'领瓷盏':'领书册'),()=>{
        if(!waybills.take(id)){a.message(waybills.hint());return;}
        changed('已领'+item.recipient+'的运单。','take');
      });
  }
 yield;
  for(const [material,z,text] of [['straw',-5.5,'草衬'],['oilcloth',1.5,'油布']]){
    a.on('escort:wrap:'+material,point(-14.8,1.1,z),2.8,()=>waybills.packed?null:'用'+text+'包货',()=>{
      if(!waybills.active){a.message('先到签押房，选一张托运单。');return;}
      if(!waybills.wrap(material)){a.message(waybills.hint());return;}
      changed(waybills.hint(),'take');
    });
  }
 yield;
  for(const [to,pos,label] of [['boat',[20.4,.88,-3.6],'交东渡船'],['cart',[-9.8,1.18,11.6],'装西路车']]){
    a.on('escort:send:'+to,point(...pos),2.9,label,()=>{
      const id=waybills.active;
      if(!id){a.message('签押房的两张托运单分别通往东岸和西门。');return;}
      if(!waybills.dispatch(to)){a.message(waybills.hint());return;}
      updateCargo();
      if(waybills.snapshot().delivered.length===1)a.learn('escort-waybill');else a.checkpoint();
      a.sound('bowl');a.message(cargo[id].recipient+'的货已交运 · '+(waybills.snapshot().delivered.length===2?'两张运单均已签收。':'另一张运单仍可领取。'));
    });
  }
 yield;
  updateCargo();
  let elapsed=0;
  return {
    id:'escort',name:'平川镖局',subtitle:'临河总号 · 西车东渡',guide:'签押房领单 · 西库包货 · 西车东渡',
    spawn:{p:[0,0,26],yaw:0},snapshot:waybills.snapshot,
    guideText(){return waybills.hint() || (waybills.done('cups')&&waybills.done('books')?'两单已交 · 茶棚歇脚':'签押房领单 · 西库包货 · 西车东渡');},
    locate(p){if(p.z>18)return'平川镖局 · 门巷';if(p.x>7&&p.z<-12)return'平川镖局 · 临河茶棚';if(p.x>13)return'平川镖局 · 东渡口';if(p.z<-12)return'平川镖局 · 签押房';if(p.x<-11&&p.z<8)return'平川镖局 · 包货库';return'平川镖局 · 行车院';},
    tick(dt){
      elapsed+=dt;
      wind.value=elapsed;surfaces.sync();
      boat.rotation.z=Math.sin(elapsed*.73)*.014;boat.position.y=-.86+Math.sin(elapsed*.92)*.034;
      if(!waybills.active)return;
      const {group}=parcels[waybills.active],visitor=a.visitor();
      const third=visitor.view==='third',yaw=third?visitor.avYaw-Math.PI:visitor.yaw;
      // Hold the bundle below the sight line on both narrow and wide screens.
      const pitch=third?0:visitor.pitch,depth=.74,below=.28;
      const forward=third?.36:Math.cos(pitch)*depth+Math.sin(pitch)*below;
      const lift=third?1.03:visitor.eye+Math.sin(pitch)*depth-Math.cos(pitch)*below;
      const side=third?.12:.10;
      group.position.set(visitor.pos.x-Math.sin(yaw)*forward+Math.cos(yaw)*side,visitor.pos.y+lift,visitor.pos.z-Math.cos(yaw)*forward-Math.sin(yaw)*side);
      group.rotation.y=yaw;group.scale.setScalar(third?.77:.43);
      group.visible=visitor.mode==='walk';
    }
  };
}
