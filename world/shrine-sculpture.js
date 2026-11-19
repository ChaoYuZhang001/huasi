// Small polychrome carvings. Coordinates are in metres from the altar top,
// facing local +Z. All ornament merges into the existing region material batches.
function pigment(b, color, metalness = .12) {
 return new b.THREE.MeshStandardMaterial({color, metalness, roughness: .66});
}

function sweep(b, material, points, radii, steps = 14) {
 const T = b.THREE, curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
 const mesh = new T.TubeGeometry(curve, steps, 1, 8, false);
 const pos = mesh.attributes.position, center = new T.Vector3(), vertex = new T.Vector3();
 for (let i = 0; i <= steps; i++) {
  const t = i / steps, k = t * (radii.length - 1), j = Math.floor(k);
  const radius = T.MathUtils.lerp(radii[j], radii[Math.min(j + 1, radii.length - 1)], k - j);
  curve.getPointAt(t, center);
  for (let side = 0; side <= 8; side++) {
   const id = i * 9 + side;
   vertex.fromBufferAttribute(pos, id).sub(center).multiplyScalar(radius).add(center);
   pos.setXYZ(id, vertex.x, vertex.y, vertex.z);
  }
 }
 mesh.computeVertexNormals();
 b.G(mesh, material, 0, 0, 0);
}

// Each ring has a height, moving centre and two radii. Slightly fluted
// cross sections keep folds in the silhouette from every angle.
function carving(b, material, rings, folds = 0) {
 const positions = [], uv = [], indices = [], sides = 32;
 for (const [j, [y,x,z,w,d]] of rings.entries()) {
  for (let i = 0; i <= sides; i++) {
   const a = 2 * Math.PI * i / sides, flute = 1 + folds * Math.cos(8*a + j*.12);
   positions.push(x + w*Math.sin(a)*flute, y, z + d*Math.cos(a)*flute);
   uv.push(i / sides, j / (rings.length - 1));
   if (i < sides && j < rings.length-1) {
    const k = j*(sides+1) + i;
    indices.push(k, k+1, k+sides+1, k+1, k+sides+2, k+sides+1);
   }
  }
 }
 const T = b.THREE, geometry = new T.BufferGeometry();
 geometry.setIndex(indices);
 geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
 geometry.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
 geometry.computeVertexNormals();
 b.G(geometry, material, 0, 0, 0);
}

function ring(b, radius, thickness, x, y, z, material) {
 b.G(new b.THREE.TorusGeometry(radius, thickness, 8, 64), material, x,y,z);
}

function head(b, y, z, face, hair, crowned = false) {
 const ink = b.M.ink;
 carving(b, face, [
  [y-.29,0,z+.01,.07,.10],[y-.24,0,z+.035,.158,.174],
  [y-.13,0,z+.01,.223,.205],[y+.03,0,z,.246,.216],
  [y+.17,0,z-.012,.239,.204],[y+.25,0,z-.025,.19,.161],[y+.30,0,z-.02,.02,.02]
 ]);
 for (const s of [-1,1]) {
  b.S(.068,s*.238,y-.03,z-.004,face,.70,1.7,.66,14,10);
  sweep(b, ink, [[s*.038,y+.049,z+.214],[s*.103,y+.075,z+.205],[s*.186,y+.05,z+.156]], [.008,.016,.005]);
  sweep(b, ink, [[s*.045,y+.002,z+.211],[s*.117,y-.009,z+.202],[s*.18,y+.005,z+.16]], [.006,.010,.003]);
 }
 b.S(.053,0,y-.038,z+.21,face,.77,1.46,.77,16,10);
 sweep(b, b.M.lip, [[-.069,y-.146,z+.196],[0,y-.153,z+.217],[.069,y-.146,z+.196]], [.003,.012,.003]);
 const cap = new b.THREE.SphereGeometry(1,24,12,0,Math.PI*2,0,1.45);
 cap.scale(.256,.30,.225); cap.rotateX(-.19);
 b.G(cap,hair,0,y+.042,z-.026);
 if (!crowned) for (const s of [-1,1]) {
  sweep(b,hair,[[s*.014,y+.222,z+.141],[s*.099,y+.212,z+.157],[s*.193,y+.149,z+.106],[s*.23,y+.077,z+.04]], [.018,.043,.063,.054]);
  sweep(b,hair,[[s*.18,y+.18,z-.04],[s*.22,y+.04,z-.105],[s*.24,y-.28,z-.145],[s*.32,y-.52,z-.11]], [.07,.105,.082,.015]);
 }
}

export function zhenwu(b, a, x, y, z) {
 b.at(x,y,z);
 const {B,S,M}=b, skin=pigment(b,0xdca65f,.27), armour=pigment(b,0x435867,.52);
 const mantle=pigment(b,0x792d23), binding=pigment(b,0xbb8d48,.42), hair=pigment(b,0x302c28);
 const patina=pigment(b,0x688072,.36);
 a.carving('zhenwu',x,y,z-.13,3.03,0,()=>{
 B(1.78,.16,1.54,0,0,-.08,M.woodDark,false);
 B(1.58,.54,1.22,0,.16,-.13,M.wood,false);B(1.76,.13,1.37,0,.70,-.13,M.woodDark,false);
 B(1.72,1.72,.14,0,.81,-.72,M.woodDark,false);
 B(1.49,1.53,.08,0,.89,-.60,mantle,false);
 for(const s of [-1,1]){
  B(.072,1.74,.11,s*.82,.84,-.60,binding,false);
  B(.16,.12,.98,s*.82,1.31,-.12,M.woodDark,false);
  b.C(.065,.09,.53,s*.82,.83,.29,binding,false);
  // Bare insteps project below bell-shaped skirt sleeves.
  S(.19,s*.47,.307,.62,skin,.86,.59,1.43,18,12);
  for(let toe=0;toe<4;toe++)S(.041,s*(.36+toe*.055),.284,.815-toe*.012,skin,1,.8,1.43,12,8);
  carving(b,mantle,[[.36,s*.47,.51,.235,.224],[.48,s*.47,.49,.24,.235],[.85,s*.47,.45,.206,.19],[1.12,s*.47,.40,.247,.23],[1.27,s*.46,.34,.224,.21],[1.36,s*.40,.23,.16,.18]],.047);
  sweep(b,binding,[[s*.68,.42,.51],[s*.57,.41,.70],[s*.42,.407,.73],[s*.275,.42,.64]], [.017,.019,.018,.012]);
 }
 carving(b,armour,[[.85,0,-.04,.72,.52],[1.05,0,.01,.76,.49],[1.34,0,.01,.56,.41],[1.51,0,-.05,.43,.34],[1.85,0,-.07,.50,.37],[2.14,0,-.08,.65,.31],[2.27,0,-.07,.56,.26],[2.34,0,-.08,.19,.17]],.035);
 carving(b,mantle,[[.59,0,.38,.23,.045],[.67,0,.36,.32,.065],[1.03,0,.34,.31,.11],[1.28,0,.23,.295,.13],[1.45,0,.20,.24,.118]],.06);
 for(const s of [-1,1])sweep(b,binding,[[s*.23,.62,.411],[s*.292,.74,.40],[s*.27,1.05,.414],[s*.246,1.31,.34],[s*.214,1.45,.29]], [.014,.016,.015,.014,.013]);
 b.lathe([[.43,0],[.46,.02],[.46,.10],[.43,.12]],binding,0,1.44,-.046,.83);
 S(.085,0,1.51,.337,binding,1,.93,.40,16,12);
 S(.048,0,1.51,.37,patina,1,.96,.34,14,10);
 for(let row=0;row<3;row++){
  const h=1.64+row*.17;
  sweep(b,binding,[[-.43,h+.06,.10],[-.24,h+.012,.24],[0,h-.038,.296],[.24,h+.012,.24],[.43,h+.06,.10]],[.009,.016,.019,.016,.009]);
 }
 for(const s of [-1,1]){
  sweep(b,mantle,[[s*.24,2.26,-.106],[s*.52,2.19,-.06],[s*.67,1.98,-.008],[s*.76,1.57,.06],[s*.69,.99,-.12]], [.09,.175,.17,.14,.06]);
  sweep(b,armour,[[s*.54,2.12,.00],[s*.66,1.98,.07],[s*.75,1.73,.18],[s*.65,1.55,.37],[s*.52,1.49,.48]], [.20,.196,.162,.135,.10]);
  for(let row=0;row<2;row++)sweep(b,binding,[[s*.46,2.16-row*.095,.095],[s*.59,2.15-row*.095,.21],[s*.74,2.10-row*.095,.16],[s*.80,2.05-row*.095,.04]], [.014,.026,.019,.009]);
  S(.118,s*.51,1.49,.48,skin,1,.74,1.07,16,10);
  for(let i=0;i<4;i++){
   const u=s*(.457+i*.041);
   sweep(b,skin,[[u,1.50,.52],[u,1.466,.58],[u-s*.009,1.421,.574]], [.023,.025,.018],6);
  }
  sweep(b,skin,[[s*.45,1.51,.48],[s*.415,1.487,.535],[s*.426,1.455,.55]], [.032,.029,.020],6);
  // The ridge of each overlapping shoulder plate catches light above the arm.
  for(let i=0;i<2;i++){
   S(.173,s*(.584+i*.076),2.12-i*.115,.041,armour,1.05,.66,1.05,16,10);
   sweep(b,binding,[[s*(.46+i*.07),2.12-i*.12,.13],[s*(.57+i*.07),2.067-i*.115,.21],[s*(.68+i*.07),2.053-i*.115,.164]], [.009,.017,.007]);
  }
 }
 b.C(.15,.19,.24,0,2.23,-.05,skin,false,18);
 head(b,2.65,-.026,skin,hair);
 carving(b,hair,[[2.035,0,.242,.012,.015],[2.117,0,.209,.063,.048],[2.25,0,.175,.117,.061],[2.355,0,.158,.14,.065],[2.426,0,.152,.111,.046]],.075);
 for(const s of [-1,1]){
  sweep(b,hair,[[s*.013,2.54,.197],[s*.085,2.53,.188],[s*.14,2.49,.155]], [.01,.024,.007]);
  for(let j=0;j<3;j++)sweep(b,hair,[[s*(.12+j*.035),2.48,.12-j*.042],[s*(.117+j*.03),2.38,.159-j*.025],[s*(.055+j*.035),2.20,.207],[s*(.013+j*.024),2.02+j*.051,.243]], [.036,.049,.032,.002]);
 }
 });
 // Tortoise and serpent sit on their own stone in front of the throne.
 S(.53,-.19,.078,.89,M.ashlar,1.25,.145,1,20,10);
 S(.355,-.21,.237,.90,patina,1.12,.65,1.08,24,14);
 S(.127,-.22,.224,1.285,patina,.91,.85,1.46,16,10);
 for(const s of [-1,1]){
  for(const dz of [-.20,.18])S(.103,-.21+s*.322,.14,.91+dz,patina,1.17,.55,1.17,12,8);
  S(.023,-.22+s*.078,.259,1.369,M.ink);
 }
 for(const s of [-1,1])for(const d of [-.15,.052,.218]){
  sweep(b,binding,[[-.21,.454-.44*d*d,.90+d],[-.21+s*.166,.421-.40*d*d,.924+d],[-.21+s*.29,.365-.64*d*d,.949+d]], [.008,.012,.006]);
 }
 sweep(b,binding,[[-.21,.299,.566],[-.21,.435,.75],[-.21,.462,.94],[-.21,.39,1.13],[-.21,.31,1.206]],[.008,.011,.014,.011,.006]);
 sweep(b,hair,[[.20,.14,.69],[.16,.24,.98],[-.01,.38,1.1],[-.275,.445,1.02],[-.50,.36,.86],[-.54,.40,.69],[-.46,.56,.66],[-.39,.618,.75]], [.018,.041,.041,.047,.045,.037,.036,.041],26);
 S(.065,-.383,.619,.765,hair,.78,.62,1.2,14,8);
 // The sword is inclined beside the outer knee, clear of the feet and animal.
 sweep(b,M.marble,[[.87,.34,.66],[.82,.68,.62],[.70,1.12,.56],[.59,1.46,.505]], [.006,.046,.052,.04]);
 sweep(b,binding,[[.45,1.48,.50],[.58,1.46,.505],[.73,1.50,.51]], [.016,.044,.013]);
 sweep(b,M.woodDark,[[.592,1.46,.51],[.54,1.67,.485]],[.032,.038]);S(.053,.54,1.68,.485,binding);
}

function saddle(b, cloth, thread) {
 // A woven blanket hangs over both flanks. The binding follows its actual edge.
 const flank=[[-.87,1.09],[-.82,1.39],[-.65,1.64],[-.36,1.77],[0,1.81],[.36,1.77],[.65,1.64],[.82,1.39],[.87,1.09]];
 const g=new b.THREE.BufferGeometry(), verts=[], uv=[], ind=[];
 for(const [i,[x,y]] of flank.entries()){
  const end=.62-.08*Math.abs(x);
  for(const [j,z] of [-end-.14,end-.14].entries()){verts.push(x,y,z);uv.push(i/8,j);}
  if(i<flank.length-1){const k=i*2;ind.push(k,k+1,k+2,k+2,k+1,k+3);}
 }
 g.setIndex(ind);g.setAttribute('position',new b.THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new b.THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();b.G(g,cloth,0,0,0);
 for(const s of [-1,1]){
  sweep(b,thread,flank.map(([x,y])=>[x,y+.008,s*(.62-.08*Math.abs(x))-.14]),[.018,.021,.018],24);
  sweep(b,thread,[[s*.87,1.10,-.67],[s*.88,1.10,-.14],[s*.87,1.10,.41]],[.017,.021,.017]);
  for(let j=0;j<7;j++)sweep(b,thread,[[s*.873,1.09,-.63+j*.157],[s*.885,.99,-.63+j*.157]],[.014,.009],4);
 }
}

export function puxian(b,a,x,y,z) {
 b.at(x,y,z);
 const {M,S}=b, stone=pigment(b,0xe1d7c3,.045), crease=pigment(b,0xb4a58e,.05);
 const ivory=pigment(b,0xfbe7b0,.19), cloth=pigment(b,0x2b6766), thread=pigment(b,0xd2a453,.38);
 const robe=pigment(b,0xa04839), face=pigment(b,0xe7bd83,.26), hair=pigment(b,0x37302b);
 // The forehead domes, broad feet and folded ears carry through to the side view.
 for(const s of [-1,1])for(const hind of [-1,1]){
  const dx=s*.52,dz=hind*.68;
  carving(b,stone,[[.012,dx+s*.04,dz+.035,.207,.233],[.082,dx+s*.045,dz+.04,.224,.251],[.19,dx+s*.036,dz,.197,.204],[.40,dx+s*.024,dz-.023,.169,.171],[.60,dx+s*.028,dz+.016,.184,.191],[.84,dx,dz,.205,.232],[1.14,dx-s*.024,dz,.253,.29],[1.23,dx-s*.04,dz,.24,.25]]);
  for(let i=-1;i<=1;i++)S(.058,dx+s*.04+i*.09,.084,dz+.255-Math.abs(i)*.032,crease,.69,.82,.35,12,8);
 }
 S(1,0,1.14,-.08,stone,.82,.637,1.22,32,20);
 sweep(b,stone,[[0,1.48,-1.11],[.03,.99,-1.30],[.21,.57,-1.30],[.25,.34,-1.18]], [.069,.044,.031,.018]);
 S(.074,.245,.32,-1.18,crease,.7,1.34,.70,12,8);
 carving(b,stone,[[.96,0,.90,.24,.29],[1.13,0,.98,.405,.39],[1.38,0,1.02,.49,.467],[1.58,0,1.01,.497,.453],[1.77,0,.97,.412,.364],[1.90,0,.90,.24,.23],[1.94,0,.90,.035,.054]]);
 for(const s of [-1,1]){
  S(.225,s*.198,1.733,1.033,stone,1.02,.70,1.06,24,14);
  carving(b,stone,[[1.01,s*.54,.703,.038,.059],[1.11,s*.568,.738,.073,.155],[1.31,s*.614,.75,.083,.263],[1.51,s*.61,.773,.105,.286],[1.652,s*.535,.81,.112,.244],[1.72,s*.443,.851,.055,.158]]);
  // The crease terminates above the curled lower ear.
  sweep(b,stone,[[s*.33,1.66,.98],[s*.515,1.55,.87],[s*.648,1.38,.74],[s*.588,1.10,.75]], [.13,.196,.185,.079]);
  sweep(b,crease,[[s*.44,1.72,1.05],[s*.578,1.61,1.012],[s*.641,1.45,.931],[s*.617,1.32,.91]], [.012,.023,.016,.005]);
  S(.057,s*.335,1.53,1.359,crease,1.14,.82,.78,16,12);
  S(.036,s*.35,1.533,1.385,M.ink,1,.71,.61,16,12);
  sweep(b,stone,[[s*.286,1.543,1.401],[s*.34,1.566,1.391],[s*.377,1.56,1.358],[s*.404,1.541,1.314]], [.009,.019,.015,.006]);
  for(let i=0;i<3;i++){
   const h=1.32-i*.128, spread=.50+i*.136, reach=2.06-i*.132;
   sweep(b,ivory,[[s*.262,h,1.32],[s*.339,h-.036,1.51],[s*(spread-.08),h-.11,reach-.21],[s*spread,h-.04,reach-.065],[s*(spread+.065),h+.106,reach]], [.071,.066,.047,.025,.002],18);
  }
 }
 sweep(b,stone,[[0,1.61,1.205],[.003,1.36,1.422],[0,.97,1.52],[-.023,.66,1.55],[-.017,.49,1.69],[.063,.50,1.84],[.13,.64,1.89]], [.205,.17,.12,.098,.081,.067,.046],28);
 for(let i=0;i<4;i++){const h=1.26-i*.105,u=1.59+i*.009;sweep(b,crease,[[-.096+i*.007,h+.018,u-.017],[0,h,u],[.096-i*.007,h+.013,u-.014]], [.002,.007,.002],8);}
 saddle(b,cloth,thread);
 b.lathe([[.02,0],[.51,.008],[.63,.08],[.69,.14],[.63,.20],[.05,.207]],thread,0,1.75,-.16,.77);
 for(let i=0;i<14;i++){
  const a=2*Math.PI*i/14,g=new b.THREE.SphereGeometry(1,12,8);
  g.scale(.14,.15,.056);g.rotateX(.39);g.rotateY(a);
  b.G(g,ivory,Math.sin(a)*.60,1.90,-.16+Math.cos(a)*.45);
 }
 a.carving('puxian',x,y+1.94,z-.16,1.87,0,()=>{
 S(.64,0,2.05,-.138,robe,1,.38,.75,28,16);
 carving(b,cloth,[[2.08,0,-.17,.53,.35],[2.22,0,-.15,.46,.33],[2.41,0,-.175,.30,.244],[2.64,0,-.175,.33,.225],[2.85,0,-.18,.409,.225],[2.94,0,-.175,.30,.18],[2.99,0,-.16,.138,.116]],.04);
 for(const s of [-1,1]){
  sweep(b,robe,[[s*.24,2.88,-.16],[s*.373,2.80,-.10],[s*.44,2.63,-.022],[s*.43,2.39,.068],[s*.27,2.28,.16]], [.113,.138,.137,.128,.10]);
  sweep(b,thread,[[s*.21,2.91,-.053],[s*.23,2.72,.018],[s*.155,2.57,.053],[0,2.46,.081]], [.028,.032,.026,.017]);
 }
 b.C(.117,.132,.17,0,2.92,-.146,face,false,16);
 head(b,3.22,-.156,face,hair,true);
 S(.157,0,3.51,-.181,hair,1,1.23,.97,20,14);
 b.lathe([[.202,0],[.245,.03],[.236,.09],[.203,.103]],thread,0,3.37,-.155,.87);
 for(let i=-2;i<=2;i++){
  const t=i*.58,px=Math.sin(t)*.226,pz=-.16+Math.cos(t)*.191,h=.148-.022*Math.abs(i);
  const leaf=new b.THREE.SphereGeometry(1,12,8);
  leaf.scale(.067,h,.025);leaf.rotateZ(-i*.17);leaf.rotateY(t);b.G(leaf,thread,px,3.48+h*.45,pz);
  S(.036,px,3.494,pz+.024,cloth,1,1.24,.62,12,8);
 }
 // Two open rings leave the mountain light visible through the head halo.
 ring(b,.435,.029,0,3.24,-.48,thread);ring(b,.389,.012,0,3.24,-.476,ivory);
 sweep(b,face,[[-.29,2.33,.15],[-.16,2.32,.23],[-.07,2.35,.27]], [.068,.064,.033]);
 sweep(b,face,[[.31,2.31,.16],[.35,2.42,.22],[.36,2.50,.22]], [.064,.059,.036]);
 sweep(b,cloth,[[.327,2.30,.23],[.37,2.54,.235],[.50,2.73,.18],[.52,2.88,.16]],[.014,.014,.012,.010]);
 for(let i=0;i<7;i++){const a=i*2*Math.PI/7;S(.069,.52+Math.sin(a)*.055,2.88,.16+Math.cos(a)*.055,ivory,.48,1,.49,12,8);}
 });
}

export function altarScreen(b, x, y, z, buddhist) {
 b.at(x,y,z);
 const {M,B,C}=b, frame=M.woodDark, gold=pigment(b,0xb99050,.36);
 const backing=pigment(b,buddhist?0x71392f:0x294749), inset=pigment(b,buddhist?0x925244:0x345b59);
 const rear=buddhist?-1.86:-1.09, h=buddhist?3.88:3.39;
 B(4.62,h,.12,0,0,rear,backing,false);
 for(const s of [-1,1]){
  const cx=s*1.72;
  B(.97,h-.31,.027,cx,.12,rear+.083,inset,false);
  for(const u of [cx-.46,cx+.46])B(.043,h-.29,.051,u,.14,rear+.11,gold,false);
  for(const u of [cx-.28,cx+.28])B(.025,h-.57,.046,u,.27,rear+.11,frame,false);
  for(const level of [.22,.43,h-.42,h-.22])B(.91,.037,.048,cx,level,rear+.115,gold,false);
  // Pierced cloud-head brackets beneath the cornice.
  sweep(b,gold,[[s*2.22,h-.54,rear+.18],[s*2.05,h-.43,rear+.18],[s*2.01,h-.27,rear+.18],[s*1.83,h-.24,rear+.18],[s*1.72,h-.09,rear+.18]], [.023,.052,.05,.054,.025]);
  B(.155,h+.07,.23,s*2.30,0,rear,frame,false);
 }
 B(4.85,.15,.39,0,h-.06,rear,frame,false);B(4.98,.046,.46,0,h+.09,rear,gold,false);
 for(const s of [-1,1]){
  sweep(b,frame,[[s*1.99,h+.17,rear],[s*2.25,h+.17,rear],[s*2.46,h+.22,rear],[s*2.57,h+.34,rear]], [.068,.077,.062,.018]);
  const u=s*2.02, v=buddhist?.70:.77;
  b.lathe([[.025,0],[.221,0],[.24,.047],[.14,.087],[.11,.125],[.07,.17],[.055,.53],[.135,.57],[.10,.63],[.08,.67],[.084,.73],[.222,.79],[.216,.835],[.028,.835]],gold,u,0,v,.94,20);
  C(.047,.059,.15,u,.832,v,M.redc,false);
  b.S(.057,u,1.015,v,M.glow,.67,1.68,.67,12,10);
  b.plight(u,1.04,v,0xffc282,7,7);
 }
 if(!buddhist){
  // Concentric mouldings behind the throne, with curling clouds on each wing.
  ring(b,.77,.030,0,2.47,rear+.104,gold);
  ring(b,.698,.013,0,2.47,rear+.115,gold);
  for(const s of [-1,1])for(const dy of [0,1.28]){
   sweep(b,gold,[[s*2.10,.67+dy,rear+.16],[s*1.83,.73+dy,rear+.16],[s*1.73,.86+dy,rear+.16],[s*1.55,.86+dy,rear+.16],[s*1.50,.97+dy,rear+.16],[s*1.61,1.02+dy,rear+.16],[s*1.65,.97+dy,rear+.16]], [.009,.019,.025,.024,.023,.019,.005]);
  }
 }else{
  for(const s of [-1,1]){
   const cx=s*1.73;
   sweep(b,gold,[[cx,.48,rear+.16],[cx-.12,1.02,rear+.16],[cx+.12,1.66,rear+.16],[cx,2.25,rear+.16]], [.021,.016,.015,.011]);
   for(let i=-2;i<=2;i++){
    const petal=new b.THREE.TorusGeometry(.16,.014,6,24);
    petal.scale(.45,1.15,1);petal.rotateZ(-i*.31);
    b.G(petal,gold,cx+i*.064,2.31-.034*Math.abs(i),rear+.16);
   }
  }
 }
}

export function puxianCeiling(b) {
 // Transverse ties bear on the existing hall posts. Secondary joists span
 // the ties under the eaves. The central bay stays open above the lotus.
 b.at(21,5.66,-81);
 for(const z of [-4.15,0,4.15]){
  b.B(16.8,.20,.25,0,4.62,z,b.M.wood,false);
  for(const s of [-1,1]){
   b.B(.78,.15,.52,s*8.08,4.38,z,b.M.woodDark,false);
   b.B(1.13,.09,.58,s*7.96,4.53,z,b.M.wood,false);
  }
 }
 for(let i=-7;i<=7;i++)b.B(.11,.12,8.66,i*1.06,4.83,0,b.M.wood,false);
}
