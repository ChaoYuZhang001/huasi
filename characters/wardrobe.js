import {jacketSurface,mapCloth,sewnJacket,solidTrim} from './tailoring.js';
import {points,faces} from './portrait-data.js';

const unpack=(data,Type)=>new Type(Uint8Array.from(atob(data),ch=>ch.charCodeAt(0)).buffer);
const coordinates=Float32Array.from(unpack(points,Int16Array),value=>value/10000),indices=unpack(faces,Uint16Array);
export const schools={daoist:[0x4c5461,0x777f84],temple:[0x91663c,0x694131],wudang:[0x465c69,0xabb4ab],emei:[0x839785,0xd0c7ae],huashan:[0x44546e,0x937a58],kunlun:[0x586877,0xe3dccc],kongtong:[0x73614e,0x433d38],ming:[0x683b38,0xe1a253],beggar:[0x656249,0x96745a]};

export function contour(THREE,rows,segments=24,seam=0){
 const geo=new THREE.LatheGeometry(rows.map(row=>new THREE.Vector2(1,row[0])),segments),pos=geo.attributes.position;
 for(let column=0;column<=segments;column++)for(let ring=0;ring<rows.length;ring++){
  const index=column*rows.length+ring,[height,width,depth,forward=0,lateral=0]=rows[ring],angle=seam+2*Math.PI*column/segments;
  pos.setXYZ(index,lateral+width*Math.sin(angle),height,forward+depth*Math.cos(angle));
 }geo.computeVertexNormals();return geo;
}

export function tailoredArm(THREE,part,color,skin,side,female){
 const size=female?.89:1,section=(tone,rows)=>part(contour(THREE,rows),tone,0,0,0,size,1,size);
 const fabric=(rows,elbow=false)=>{
  const geo=contour(THREE,rows,32,-Math.PI);
  const reach=female?.39:.546;
  mapCloth(geo,'sleeve',y=>(.039-y+(elbow?.26:0))/reach);
  return part(geo,0xffffff,0,0,0,size,1,size);
 };
 const sleeve=fabric([[-.277,.049,.051],[-.242,.051,.055],[-.15,.061,.067],[-.086,.064,.069],[-.035,.06,.066,0,-side*.006],[.014,.047,.056,0,-side*.026],[.036,.022,.031,0,-side*.045],[.04,.002,.003,0,-side*.055]]);
 const wrist=fabric([[-.246,.041,.044],[-.242,.045,.046],[-.227,.044,.046],[-.22,.042,.045],[-.134,.049,.054],[-.045,.052,.055],[.009,.047,.049],[.021,.031,.038]],true);
 const palm=section(skin,[[-.311,.009,.025,.006],[-.300,.015,.031,.004],[-.280,.019,.035],[-.258,.021,.028],[-.232,.018,.024]]);
 const fingers=[-.019,-.004,.011,.026].map((z,i)=>{
  const length=[.032,.042,.045,.039][i];
  return part(new THREE.SphereGeometry(1,12,8),skin,-side*.005,-.3-length*.43,z,
   .009,length*.65,.008,-.08,0,-side*.09);
 });
 const thumb=part(new THREE.SphereGeometry(1,12,8),skin,-side*.014,-.286,.028,.012,.028,.012,-.36,0,-side*.14);
 if(female){
  wrist.dispose();
  const forearm=section(skin,[[-.256,.020,.024],[-.213,.025,.031],[-.14,.033,.041],[-.064,.043,.048],[-.035,.042,.047]]);
  const shortCuff=fabric([[-.091,.053,.056],[-.089,.057,.058],[-.07,.056,.059],[-.035,.054,.057],[.018,.051,.053]],true);
  const binding=section(0x394253,[[-.092,.054,.057],[-.087,.0575,.059]]);
  return [[sleeve],solidTrim([shortCuff,binding,forearm,palm,...fingers,thumb])];
 }
 return [[sleeve],solidTrim([wrist,palm,...fingers,thumb])];
}

export function footwear(THREE,part,female,skin){
 const form=(tone,rows)=>part(contour(THREE,rows,32),tone);
 const leather=female?0x403a36:0x272727,sole=0x272523;
 // Leave the waist of the sole off the ground between the heel and toe.
 const heel=form(sole,[[-.035,.001,.001,-.055],[-.034,female?.026:.036,.033,-.055],
  [-.009,female?.029:.038,.039,-.052],[-.006,.03,.04,-.052]]);
 const tread=form(sole,[[-.035,.001,.001,.085],[-.034,.041,.065,.083],
  [-.028,.045,.067,.082],[-.023,.044,.066,.081]]);
 const upper=form(leather,[[-.025,.044,.066,.081],[-.018,.047,.113,.037],
  [-.008,.049,.121,.028],[.006,.046,.116,.028],[.019,.044,.099,.011],
  [.035,.039,.065,-.009],[.045,.036,.051,-.022],[.049,.001,.001,-.027]]);
 if(female){
  // The low-cut vamp reveals the instep from the ankle to the ball of the foot.
  const instep=form(skin,[[.010,.025,.080,.019],[.019,.035,.077,.014],
   [.035,.032,.058,.001],[.050,.028,.043,-.010],[.066,.024,.030,-.013],[.077,.018,.021,-.015]]);
  return [heel,tread,upper,instep];
 }
 const tongue=form(leather,[[.029,.034,.060,.002],[.043,.031,.052,-.003],
  [.057,.028,.041,-.013],[.065,.022,.030,-.017],[.067,.003,.003,-.018]]);
 const pieces=[heel,tread,upper,tongue];
 for(let i=0;i<3;i++){
  const y=.042+i*.005,z=.047-i*.011;
  const lace=new THREE.CatmullRomCurve3([new THREE.Vector3(-.018,y,z-.003),
   new THREE.Vector3(0,y+.003,z+.001),new THREE.Vector3(.018,y,z+.003)]);
  pieces.push(part(new THREE.TubeGeometry(lace,8,.0015,4,false),0x423f3b));
 }
 return pieces;
}

export function portrait(THREE,part,look,skin,hair){
 const mesh=new THREE.BufferGeometry(),female=look.player==='f'||look.school==='emei';
 const width=female?.94:1.02,shape=coordinates.slice();
 for(let i=0;i<shape.length;i+=3){shape[i]*=width*(female&&shape[i+1]<-.045?.96:1);if(look.player){const blend=Math.max(0,Math.min(1,(shape[i+1]-.033)/.053));shape[i]*=1-.14*blend;shape[i+1]-=.018*blend;shape[i+2]*=1-.13*blend;}}
 mesh.setAttribute('position',new THREE.BufferAttribute(shape,3));mesh.setIndex(new THREE.BufferAttribute(indices,1));mesh.computeVertexNormals();mesh.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(shape.length/3*2),2));
 const result=[part(mesh,skin)],colors=mesh.attributes.color,lip=new THREE.Color(female?0xa65e58:0x975f55);
 const complexion=new THREE.Color(skin),flush=new THREE.Color(female?0xca8279:0xb97c67),mixed=new THREE.Color();
 for(let i=0;i<colors.count;i++){const offset=i*3,x=shape[offset],y=shape[offset+1],z=shape[offset+2];if(z<.048)continue;
  const cheek=Math.exp(-((Math.abs(x)-.052)**2/.00055+(y+.035)**2/.00035)),mouth=Math.exp(-((x/.027)**4+((y+.067)/.007)**2))*Math.max(0,Math.min(1,(z-.085)/.014));mixed.copy(complexion).lerp(flush,.32*cheek).lerp(lip,.67*mouth);colors.setXYZ(i,mixed.r,mixed.g,mixed.b);}
 const oval=(tone,x,y,z,w,h,d,tilt=0)=>part(new THREE.SphereGeometry(1,16,10),tone,x,y,z,w,h,d,0,0,tilt);
 for(const side of [-1,1])result.push(oval(0xddd1c0,side*.0375*width,-.002,.079,.015,.012,.014),oval(hair,side*.039*width,.021,.102,.019,.003,.003,-side*.10));
 if(look.player){const cap=new THREE.SphereGeometry(1,40,20,0,2*Math.PI,0,Math.PI/2),pos=cap.attributes.position;
  const surface=(angle,t)=>{const front=(Math.cos(angle)+1)/2,edge=(female?2.55-1.42*front**3:2.12-1.02*front**2)+front*.13*Math.sin(2*angle+.4),theta=t*edge,wave=Math.sin(theta),sweep=Math.sin(angle-.5)*wave,lock=.002*Math.cos(23*angle+3*t)*wave;return new THREE.Vector3((.104+lock)*Math.sin(angle)*wave-.009*(1-t),.022+(.13-.012*sweep)*Math.cos(theta),-.005+(.118+lock)*Math.cos(angle)*wave);};
  for(let i=0;i<pos.count;i++){const point=surface(Math.atan2(pos.getX(i),pos.getZ(i)),Math.acos(Math.min(1,Math.max(0,pos.getY(i))))/(Math.PI/2));pos.setXYZ(i,point.x,point.y,point.z);}cap.computeVertexNormals();result.push(part(cap,hair));
  for(let strand=0;strand<27;strand++){const angle=strand*2*Math.PI/27,curve=new THREE.CatmullRomCurve3(Array.from({length:8},(_,step)=>{const t=.19+step*.109;return surface(angle+.58*(1-t),t).multiplyScalar(1.007);}));result.push(part(new THREE.TubeGeometry(curve,8,.00125,4,false),strand%3===0?0x44352d:0x312820));}
  if(female){result.push(oval(0x302622,0,-.061,-.093,.063,.067,.049),oval(0x524036,.006,-.071,-.12,.05,.045,.027,-.35));}}
 return result;
}

export function garments(THREE,part,look,color,skin){
 const shell=(tone,rows,depth)=>part(new THREE.LatheGeometry(rows.map(([r,y])=>new THREE.Vector2(r,y)),32),tone,0,0,0,1,1,depth);
 const box=(tone,x,y,z,w,h,d,angle=0)=>part(new THREE.BoxGeometry(w,h,d),tone,x,y,z,1,1,1,0,0,angle);
 const oval=(tone,x,y,z,w,h,d,angle=0)=>part(new THREE.SphereGeometry(1,16,10),tone,x,y,z,w,h,d,0,0,angle);
 if(look.player){const female=look.player==='f';
  const surface=jacketSurface(female),body=sewnJacket(THREE,part,female,surface);
  if(female){
   body.push(shell(0x303440,[[.154,.194],[.156,.203],[.152,.226]],.78));
   // The flat sling crosses the wearer's chest and returns across her back.
   const leather=0x694735,edge=0x4c372e;
   // Sample the same sewn surface as the blouse. Over the crest of the
   // shoulder the leather needs clearance upwards as well as outwards.
   function onShirt(angle,y){
    const at=(a,h)=>new THREE.Vector3(...surface(a,h));
    const point=at(angle,y),along=at(angle+.004,y).sub(at(angle-.004,y));
    const up=at(angle,y+.001).sub(at(angle,y-.001));
    return point.addScaledVector(along.cross(up).normalize(),.0045);
   }
   const v=(x,y,z)=>new THREE.Vector3(x,y,z);
   const path=new THREE.CatmullRomCurve3([
    ...[[2.17,.521],[1.90,.537],[1.57,.541],[1.27,.537],[1.04,.526],[.82,.511],
     [.70,.488],[.66,.452],[.69,.385],[.55,.303],[.20,.225]]
     .map(([a,h])=>onShirt(a,h)),
    v(-.050,.162,.122),v(-.113,.119,.115),v(-.157,.084,.094),v(-.208,.084,-.043),
    v(-.149,.108,-.092),v(-.084,.169,-.113),
    ...[[-2.72,.222],[-2.98,.303],[2.95,.377],[2.63,.455],[2.38,.501]]
     .map(([a,h])=>onShirt(a,h))
   ],true);
   const strap=new THREE.PlaneGeometry(1,1,1,64),sp=strap.attributes.position;
   for(let i=0;i<=64;i++){
    const v=path.getPointAt(i/64),tangent=path.getTangentAt(i/64);
    const outward=new THREE.Vector3(v.x*.6,Math.max(0,v.y-.47)*3,v.z).normalize();
    const across=new THREE.Vector3().crossVectors(outward,tangent).normalize().multiplyScalar(.010);
    for(let j=0;j<2;j++){const point=v.clone().addScaledVector(across,j?1:-1);sp.setXYZ(i*2+j,point.x,point.y,point.z);}
   }
   strap.computeVertexNormals();body.push(part(strap,leather));
   const underside=strap.clone(),si=underside.index.array;
   for(let k=0;k<si.length;k+=3)[si[k+1],si[k+2]]=[si[k+2],si[k+1]];
   underside.computeVertexNormals();body.push(part(underside,edge));
   function mountBag(geo,tone,x,y,z){
    geo.translate(x,y,z);
    return part(geo,tone,-.184,.007,.025,1,1,1,0,-1.06,.035);
   }
   function satchel(tone,w,h,d,x,y,z,round){
    const shape=new THREE.Shape(),l=-w/2,r=w/2,b=-h/2,t=h/2;
    shape.moveTo(l+round,b);shape.lineTo(r-round,b);shape.quadraticCurveTo(r,b,r,b+round);
    shape.lineTo(r,t-round);shape.quadraticCurveTo(r,t,r-round,t);shape.lineTo(l+round,t);
    shape.quadraticCurveTo(l,t,l,t-round);shape.lineTo(l,b+round);shape.quadraticCurveTo(l,b,l+round,b);
    const geo=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSize:.003,bevelThickness:.003,bevelSegments:2,curveSegments:4});
    geo.setIndex(Array.from({length:geo.attributes.position.count},(_,i)=>i));
    return mountBag(geo,tone,x,y,z);
   }
   body.push(satchel(edge,.173,.162,.041,0,0,0,.014),
    satchel(0x79533c,.172,.081,.007,0,.031,.044,.010),
    satchel(0x50382d,.019,.037,.006,0,-.012,.052,.003),
    satchel(0xab8860,.015,.011,.004,0,-.009,.060,.002));
   // A single welt follows the flap. The buckle and tongue remain legible
   // when seen from the side where the clasp is silhouetted against leather.
   const flapSeam=new THREE.CatmullRomCurve3([
    [-.080,.028,.009],[-.080,-.021,.009],[-.074,-.033,.009],
    [-.040,-.034,.009],[0,-.035,.009],[.040,-.034,.009],[.074,-.033,.009],
    [.080,-.021,.009],[.080,.028,.009]].map(v=>new THREE.Vector3(...v)));
   body.push(mountBag(new THREE.TubeGeometry(flapSeam,32,.0013,5,false),0x5d402e,0,.031,.044));
   body.push(satchel(0x65442f,.006,.015,.002,0,-.01,.064,.001));
  }
  return solidTrim(body);
 }
 const trim=schools[look.school][1],pieces=[];
 if(['daoist','wudang','kunlun','huashan','emei'].includes(look.school))pieces.push(shell(trim,[[.245,look.school==='kunlun'?.31:.42],[.251,.46],[.20,.51],[.084,.559]],.81));
 if(look.school==='emei')pieces.push(box(trim,-.12,.25,.14,.034,.40,.014,-.18));
 if(look.school==='temple'||look.school==='kongtong')pieces.push(box(trim,-.035,.28,.146,look.school==='temple'?.074:.047,.53,.017,-.48));
 if(look.school==='ming')pieces.push(box(trim,0,.33,.153,.115,.024,.014));
 if(look.school==='beggar')for(const [x,y] of [[-.10,.25],[.095,.1],[-.07,.42]])pieces.push(box(trim,x,y,.14,.066,.059,.012,x));
 return pieces;
}
