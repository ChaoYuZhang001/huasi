// World-space sampling keeps neighbouring terrain tiles and rebuilt visits identical.
// These hills are scenery beyond the existing guard rails, never walking surfaces.
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export const MOUNTAIN_PROFILES={
 temple:{seed:1567,bounds:[140,144],floor:-34,base:-48,rough:11,heightScale:.95,forest:'broadleaf',density:.56,
  earth:0x68774c,rock:0x929383,foliage:0x425b40,
  peaks:[[-214,-225,172,109,.75,-.6],[-110,-348,204,96,.52,.53],[65,-402,193,113,.62,-.38],[229,-288,184,89,.59,-.51],[323,-142,125,103,.68,-.48],[-343,-95,148,120,.56,.63],[-225,231,118,136,.7,-.2],[255,240,121,129,.73,.5]]},
 escort:{seed:5713,bounds:[74,65],floor:-10,base:-24,rough:5,heightScale:.78,forest:'broadleaf',density:.65,
  earth:0x74825c,rock:0x94998a,foliage:0x576b52,
  peaks:[[-235,-265,100,140,.73,.45],[230,-300,110,130,.77,-.32],[295,180,124,115,.72,.4],[-280,160,95,130,.73,-.6],[35,-465,145,150,.8,.25]]},
 kongtong:{seed:4093,bounds:[85,64],floor:-33,base:-52,rough:12,heightScale:.95,grid:4,forest:'scrub',density:.35,mesa:true,
  earth:0x998261,rock:0xb9a27d,foliage:0x73724f,
  peaks:[[-235,-290,200,105,.65,-.35],[265,-340,245,110,.62,.4],[-300,100,195,115,.7,.5],[300,150,205,110,.7,-.5],[-35,-490,270,130,.65,.1],[-370,-420,250,115,.6,-.2]]},
 kunlun:{seed:3181,bounds:[43,84],floor:-34,base:-55,rough:14,heightScale:1.08,grid:4,forest:'pine',density:.12,snow:26,
  earth:0x6d8487,rock:0x647988,foliage:0x586f66,
  peaks:[[-255,-365,290,78,.65,-.35],[290,-390,330,90,.62,.3],[-335,125,240,100,.68,.7],[340,160,260,100,.7,-.5],[-50,-330,115,58,.74,-.25],[18,-264,90,44,.7,.24],[-109,-241,85,47,.73,.32],[56,-439,125,71,.65,.37],[-390,-455,335,105,.65,-.3]]},
 huashan:{seed:2067,bounds:[48,66],floor:-34,base:-48,rough:10,heightScale:1,grid:4,forest:'pine',density:.42,
  earth:0x949c86,rock:0xb9baaa,foliage:0x526849,
  peaks:[[-170,-245,285,72,.5,-.3],[-255,-310,300,85,.7,.35],[185,-290,330,80,.48,.4],[-235,135,225,85,.55,.7],[250,110,245,76,.52,-.5],[-20,-490,350,110,.55,.2],[-350,-390,320,85,.55,-.4]]},
 emei:{seed:431,bounds:[50,92],floor:-27,base:-48,rough:8,heightScale:.82,forest:'broadleaf',density:.8,
  earth:0x3f5942,rock:0x7c8472,foliage:0x536e4d,
  peaks:[[-150,-210,146,91,.67,-.5],[185,-255,187,105,.62,.4],[-255,85,148,100,.68,.8],[230,120,155,105,.7,-.6],[5,-470,245,135,.6,.2],[-300,-410,224,114,.62,-.3],[-110,-50,55,50,.8,.3]]},
 wudang:{seed:927,bounds:[42,64],floor:-27,base:-51,rough:12,heightScale:.84,forest:'pine',density:.71,
  earth:0x425649,rock:0x85897b,foliage:0x4d6750,
  peaks:[[-185,-240,154,89,.56,-.6],[210,-300,194,105,.62,.6],[-240,65,152,96,.65,.35],[230,150,145,100,.66,-.7],[-50,-470,235,130,.58,.2],[350,-410,245,120,.62,.7],[-110,-40,55,50,.75,.2]]},
 ming:{seed:1531,bounds:[67,65],floor:-28,base:-65,rough:18,heightScale:.82,forest:'scrub',density:.15,
  earth:0x927550,rock:0xc2a783,foliage:0x686645,
  peaks:[[-235,-270,230,121,.57,-.5],[235,-245,235,110,.65,.3],[-340,150,195,144,.54,.65],[320,125,196,130,.65,-.5],[5,-470,270,136,.6,.35],[-490,-160,235,128,.56,-.3]]}
};
export function hash2(x,z,seed=0){let n=Math.imul(x,374761393)^Math.imul(z,668265263)^Math.imul(seed,1442695041);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296;}
export function noise2(x,z,seed=0){const ix=Math.floor(x),iz=Math.floor(z),u=smooth(x-ix),v=smooth(z-iz),a=hash2(ix,iz,seed),b=hash2(ix+1,iz,seed),c=hash2(ix,iz+1,seed),d=hash2(ix+1,iz+1,seed);return((a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v)*2-1;}
function fbm(x,z,seed){return noise2(x,z,seed)*.58+noise2(x*2.03+17,z*2.03-31,seed+1)*.28+noise2(x*4.09-11,z*4.09+9,seed+2)*.14;}
export function mountainField(id){
 const p=MOUNTAIN_PROFILES[id];if(!p)throw new Error('Unknown mountain region: '+id);
 const peaks=p.peaks.map(([x,z,h,w,aspect,angle])=>({x,z,h,w,aspect,c:Math.cos(angle),s:Math.sin(angle)}));
 const clearance=(x,z)=>Math.max(Math.abs(x)-p.bounds[0],Math.abs(z)-p.bounds[1]);
 function height(x,z){
  const blend=smooth(clearance(x,z)/42);if(blend===0)return p.floor;
  const wx=x+fbm(x*.009,z*.009,p.seed)*25,wz=z+fbm(x*.009+74,z*.009-28,p.seed+9)*25;
  let elevation=0,highest=0;for(const k of peaks){const dx=wx-k.x,dz=wz-k.z,u=(dx*k.c-dz*k.s)/k.w,v=(dx*k.s+dz*k.c)*k.aspect/k.w,q=u*u+v*v;
   const h=k.h*Math.exp(-(p.mesa?q*q:id==='huashan'?Math.pow(q,.72):q)*1.5);elevation+=h;highest=Math.max(highest,h);}
  if(id==='huashan')elevation=highest*.78+elevation*.22;
  if(id==='kunlun'||p.mesa)elevation=highest*.85+elevation*.15;
  const ridge=1-Math.abs(fbm(wx*.029,wz*.029,p.seed+3));
  const folds=fbm(wx*.048,wz*.048,p.seed+7);
  // Large warped spurs, smaller gullies, and fine scree share the same field.
  const y=p.base+elevation*p.heightScale*(.83+.17*ridge)+p.rough*folds*Math.min(1,elevation/50)+fbm(x*.11,z*.11,p.seed+12)*1.5;
  const terrain=p.floor+(y-p.floor)*blend;
  const south=Math.max(0,Math.min(1,(z-62)/22));
  return terrain+(Math.min(terrain,-12)-terrain)*south;
 }
 function normal(x,z){const dx=height(x-1,z)-height(x+1,z),dz=height(x,z-1)-height(x,z+1),d=Math.hypot(dx,2,dz);return[dx/d,2/d,dz/d];}
 // PlaneGeometry's cell diagonal joins (x+grid,z) to (x,z+grid). Trees use that
 // rendered surface rather than the higher-frequency field, avoiding floating roots.
 function surfaceHeight(x,z){const s=p.grid||8,gx=Math.floor(x/s)*s,gz=Math.floor(z/s)*s,u=(x-gx)/s,v=(z-gz)/s,a=height(gx,gz),b=height(gx+s,gz),c=height(gx,gz+s),d=height(gx+s,gz+s);return u+v<=1?a+u*(b-a)+v*(c-a):d+(1-u)*(c-d)+(1-v)*(b-d);}
 function trees(){const result=[],step=p.forest==='scrub'?25:8,range=Math.ceil(345/step);
  for(let ix=-range;ix<=range;ix++)for(let iz=-range;iz<=range;iz++){
   const x=(ix+hash2(ix,iz,p.seed+21)*.75)*step,z=(iz+hash2(ix,iz,p.seed+22)*.75)*step;
   if(z>70||clearance(x,z)<18||Math.hypot(x,z)>345||hash2(ix,iz,p.seed+23)>p.density||noise2(x*.014,z*.014,p.seed+27)<-.5)continue;
   const y=surfaceHeight(x,z),ny=normal(x,z)[1];if(y< -36||y>150||ny<.58)continue;
   const size=(p.forest==='scrub'?1.2:6)+hash2(ix,iz,p.seed+24)*(p.forest==='scrub'?1.5:5);
   result.push({x,y,z,size,turn:hash2(ix,iz,p.seed+25)*Math.PI*2,tint:.75+hash2(ix,iz,p.seed+26)*.42});
  }return result;
 }
 return{profile:p,height,normal,surfaceHeight,clearance,trees};
}
