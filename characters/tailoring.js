// The cylindrical cloth panels meet at the back. The student atlas also holds the satchel front.
const panels={body:[0,0,1024,570],collar:[0,578,1024,706],pipedCollar:[0,578,800,706],satchel:[808,578,1016,706],sleeve:[0,714,504,1020],lower:[510,714,1014,1020]};
const tau=2*Math.PI;
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));

let weave;
export function clothingMaterial(T,base,female){
 const mat=base.clone(),loader=new T.TextureLoader();
 mat.name=female?'tailored-blouse':'tailored-jacket';
 mat.color.setHex(female?0xa2a7b3:0x38404a);
 mat.roughness=.91;
 if(!weave){
  weave=loader.load(new URL('./visitor-cloth.webp',import.meta.url).href);
  weave.wrapS=weave.wrapT=T.RepeatWrapping;
  weave.repeat.set(12,12);
 }
 loader.load(new URL(female?'./visitor-blouse.webp':'./visitor-jacket.webp',import.meta.url).href,texture=>{
  texture.colorSpace=T.SRGBColorSpace;
  texture.anisotropy=4;
  mat.map=texture;
  mat.bumpMap=weave;
  mat.bumpScale=.00025;
  mat.color.setHex(0xffffff);
  mat.needsUpdate=true;
 });
 return mat;
}

function writeUV(uv,i,rect,u,v){
 const [l,t,r,b]=rect;
 uv.setXY(i,(l+.5+clamp(u,0,1)*(r-l-1))/1024,1-(t+.5+clamp(v,0,1)*(b-t-1))/1024);
}

export function mapCloth(geo,panel,vertical){
 const uv=geo.attributes.uv,position=geo.attributes.position;
 for(let i=0;i<uv.count;i++)writeUV(uv,i,panels[panel],uv.getX(i),vertical(position.getY(i)));
 geo.userData.tailored=true;
 return geo;
}

export function solidTrim(geometries){
 for(const geo of geometries){
  if(geo.userData.tailored)continue;
  const uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,1021/1024,1/1024);
 }
 return geometries;
}

export function jacketSurface(female){
 const hem=female?.208:-.11,top=.554;
 // y, chest half-width, front depth, back depth. The armhole turns inward
 // below the shoulder cap and opens out again at the jacket hem.
 const rows=female?[
  [hem,.150,.118,.105],[.224,.151,.120,.106],[.26,.147,.119,.105],
  [.30,.151,.133,.108],[.37,.166,.149,.113],[.44,.171,.148,.116],
  [.475,.170,.139,.116],[.498,.178,.128,.110],[.516,.172,.115,.101],
  [.535,.133,.096,.090],[.547,.098,.078,.073],[top,.063,.066,.062]
 ]:[
  [hem,.191,.147,.128],[-.095,.193,.150,.131],[.02,.187,.150,.130],
  [.12,.177,.143,.126],[.23,.175,.146,.130],[.34,.186,.157,.139],
  [.42,.197,.156,.140],[.466,.194,.145,.137],[.490,.204,.136,.128],
  [.505,.200,.126,.115],[.52,.178,.116,.102],[.537,.132,.096,.085],[top,.064,.069,.064]
 ];
 function neckline(phi){
  const front=Math.max(0,Math.cos(phi));
  return [(female?.068:.071)*Math.sin(phi),
   (female?.582:.571)-(female?.031:.019)*front**1.7,(female?.074:.079)*Math.cos(phi)];
 }
 const widths=rows.map(r=>r[0]);
 function surface(phi,y,standOff=0){
  let j=1;while(j<rows.length-1&&widths[j]<y)j++;
  const a=rows[j-1],b=rows[j],t=clamp((y-a[0])/(b[0]-a[0]),0,1);
  const at=k=>a[k]+(b[k]-a[k])*t;
  const sn=Math.sin(phi),cs=Math.cos(phi),w=at(1);
  const depth=cs>=0?at(2):at(3);
  const seam=Math.exp(-((Math.abs(sn)-.84)**2)/.012);
  const drape=clamp((y-hem)/.06,0,1)*clamp((.51-y)/.08,0,1);
  const fold=.004*drape*(Math.sin(13*phi+1.5*Math.sin(8*y))+.45*Math.sin(27*phi-7*y))*(.22+seam);
  const tNeck=clamp((y-.5)/(top-.5),0,1),ease=tNeck*tNeck*(3-2*tNeck);
  const neck=neckline(phi),last=rows.at(-1);
  return [(w+fold+standOff)*sn+ease*(neck[0]-last[1]*sn),
   y+ease*(neck[1]-top),(depth+fold+standOff)*cs+ease*(neck[2]-last[cs>=0?2:3]*cs)];

 }
 return surface;
}

export function sewnJacket(T,part,female,surface=jacketSurface(female)){
 const hem=female?.208:-.11,top=.554;
 function swatch(name,segments,rings,sample){
  const geo=new T.PlaneGeometry(1,1,segments,rings),p=geo.attributes.position,uv=geo.attributes.uv;
  for(let row=0;row<=rings;row++)for(let col=0;col<=segments;col++){
   const index=row*(segments+1)+col,{xyz,u,v}=sample(col/segments,row/rings);
   p.setXYZ(index,...xyz);writeUV(uv,index,panels[name],u,v);
  }
  geo.computeVertexNormals();geo.userData.tailored=true;
  return part(geo,0xffffff);
 }
 const body=swatch('body',96,64,(u,v)=>({xyz:surface(tau*(u-.5),top+(hem-top)*v),u,v}));
 const pieces=[body];
 // The raised hem of a patch pocket casts a real shadow at grazing angles.
 if(!female){
  for(const sign of [-1,1])for(const height of [-.014,.386]){
   pieces.push(swatch('body',18,5,(u,v)=>{
    const phi=sign*.65+(u-.5)*.68;
    const y=height+.030-v*(.032+.011*Math.sin(Math.PI*u));
    const lift=.0008+(.002+.0033*v)*Math.sin(Math.PI*u)**.55;
    return {xyz:surface(phi,y,lift),u:.5+phi/tau,v:(top-y)/(top-hem)};
   }));
  }
 }
 // Trace two separate leaves so the open centre and the free turned edges
 // keep their thickness in profile. Their lower edge follows the chest.
 for(const side of [-1,1]){
  const edges=[],rimPoints=[];
  const leaf=swatch(female?'pipedCollar':'collar',56,12,(u,v)=>{
   const phi=side<0?-Math.PI+(Math.PI-.001)*u:.001+(Math.PI-.001)*u;
   const a=Math.abs(phi),front=Math.max(0,Math.cos(phi));
   const rim=(female?.630:.619)-(female?.061:.047)*front**1.7;
   const innerX=(female?.053:.057)*Math.sin(phi),innerZ=(female?.058:.061)*Math.cos(phi);
   const drop=female?0:.025*Math.exp(-(((a-.36)/.44)**2))+.004*front;
   const base=surface(phi,top-drop,.001);
   const bow=Math.sin(v*Math.PI)*(female?.0008:.0025);
   const xyz=[innerX*(1-v)+base[0]*v+bow*Math.sin(phi),rim*(1-v)+base[1]*v,
    innerZ*(1-v)+base[2]*v+bow*Math.cos(phi)];
   if(v===0)rimPoints.push(new T.Vector3(...xyz));
   if(v===1)edges.push(new T.Vector3(...xyz));
   return {xyz,u:.5+phi/tau,v};
  });
  pieces.push(leaf);
  const piping=new T.TubeGeometry(new T.CatmullRomCurve3(rimPoints),56,female?.0019:.0010,6,false);
  pieces.push(part(piping,female?0x343747:0xb1a89e));
  const rolled=new T.TubeGeometry(new T.CatmullRomCurve3(edges),56,female?.0009:.0014,5,false);
  pieces.push(part(rolled,female?0x323745:0x39393c));
 }
 return pieces;
}
