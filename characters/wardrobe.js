import {points,faces} from './portrait-data.js';

const unpack=(data,Type)=>new Type(Uint8Array.from(atob(data),ch=>ch.charCodeAt(0)).buffer);
const coordinates=Float32Array.from(unpack(points,Int16Array),value=>value/10000),indices=unpack(faces,Uint16Array);
export const schools={daoist:[0x4c5461,0x777f84],temple:[0x91663c,0x694131],wudang:[0x465c69,0xabb4ab],emei:[0x839785,0xd0c7ae],huashan:[0x44546e,0x937a58],kunlun:[0x586877,0xe3dccc],kongtong:[0x73614e,0x433d38],ming:[0x683b38,0xe1a253],beggar:[0x656249,0x96745a]};

export function contour(THREE,rows,segments=24){
 const geo=new THREE.LatheGeometry(rows.map(row=>new THREE.Vector2(1,row[0])),segments),pos=geo.attributes.position;
 for(let column=0;column<=segments;column++)for(let ring=0;ring<rows.length;ring++){
  const index=column*rows.length+ring,[height,width,depth,forward=0,lateral=0]=rows[ring],angle=2*Math.PI*column/segments;
  pos.setXYZ(index,lateral+width*Math.sin(angle),height,forward+depth*Math.cos(angle));
 }geo.computeVertexNormals();return geo;
}

// Add fine woven variation in metres, shared across the jacket, sleeves and skirt.
export function visitorFabric(THREE,base){
 const weaveMap=new THREE.TextureLoader().load(new URL('./visitor-cloth.webp',import.meta.url).href);
 weaveMap.wrapS=weaveMap.wrapT=THREE.RepeatWrapping;
 const material=base.clone();
 material.onBeforeCompile=shader=>{
  shader.uniforms.travelWeave={value:weaveMap};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 clothPoint;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nclothPoint = position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D travelWeave;\nvarying vec3 clothPoint;')
   .replace('#include <color_fragment>', `#include <color_fragment>
    vec2 thread=vec2(clothPoint.x+.57*clothPoint.z,clothPoint.y)*1640.;
    vec2 visibleThread=1.-smoothstep(vec2(.45),vec2(3.),fwidth(thread));
    float weave=dot(sin(thread),visibleThread*vec2(.028,.025));
    float slub=.016*sin(33.*clothPoint.y+2.*sin(48.*clothPoint.x));
    if(vColor.b>vColor.r){
      vec2 surface=vec2(clothPoint.x+.66*clothPoint.z,clothPoint.y);
      float grain=texture2D(travelWeave,surface*9.).r*2.-1.;
      float crease=.5+.5*cos(dot(surface,vec2(64.,21.))+2.*sin(surface.y*21.));
      diffuseColor.rgb*=1.+weave+slub+.11*grain-.027*pow(crease,8.);
    }`);
 };
 return material;
}

export function tailoredArm(THREE,part,color,skin,side,female){
 const size=female?.89:1,section=(tone,rows)=>part(contour(THREE,rows),tone,0,0,0,size,1,size);
 const sleeve=section(color,[[-.277,.049,.051],[-.242,.051,.055],[-.15,.061,.067],[-.086,.064,.069],[-.035,.06,.066,0,-side*.006],[.014,.047,.056,0,-side*.019],[.036,.022,.031,0,-side*.035],[.04,.002,.003,0,-side*.043]]);
 const wrist=section(color,[[-.246,.041,.044],[-.242,.045,.046],[-.227,.044,.046],[-.22,.042,.045],[-.134,.049,.054],[-.045,.052,.055],[.009,.047,.049],[.021,.031,.038]]);
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
  const shortCuff=section(color,[[-.091,.053,.056],[-.089,.057,.058],[-.07,.056,.059],[-.035,.054,.057],[.018,.051,.053]]);
  const binding=section(0x394253,[[-.092,.054,.057],[-.087,.0575,.059]]);
  return [[sleeve],[shortCuff,binding,forearm,palm,...fingers,thumb]];
 }
 return [[sleeve],[wrist,palm,...fingers,thumb]];
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
 if(look.player){const female=look.player==='f',trim=female?0x303746:0x252932;
  const profile=female?[[.034,.172,.128],[.055,.173,.13],[.13,.151,.117],[.23,.158,.126],[.345,.182,.142,.006],[.435,.186,.133],[.478,.194,.114],[.502,.179,.099],[.531,.12,.082],[.552,.065,.061]]:[[-.11,.204,.152],[-.09,.205,.154],[.035,.191,.148],[.15,.174,.139],[.32,.19,.151],[.425,.205,.15],[.48,.212,.133],[.506,.193,.115],[.537,.124,.087],[.554,.07,.067]];
  const body=[part(contour(THREE,profile,48),color),oval(skin,0,.584,0,.044,.042,.041)];
  const front=(x,y,lift=0)=>{let index=1;while(index<profile.length-1&&profile[index][0]<y)index++;const low=profile[index-1],high=profile[index],ratio=Math.max(0,Math.min(1,(y-low[0])/(high[0]-low[0]))),at=column=>(low[column]||0)*(1-ratio)+(high[column]||0)*ratio;return [x,y,at(3)+at(2)*Math.sqrt(Math.max(0,1-(x/at(1))**2))+lift];};
  const piping=(tone,points,radius)=>part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),18,radius,5,false),tone);
  const panel=(tone,left,right,bottom,top,lift)=>{const geo=new THREE.PlaneGeometry(1,1,10,4),pos=geo.attributes.position;for(let index=0;index<pos.count;index++){const across=pos.getX(index)+.5,up=pos.getY(index)+.5;pos.setXYZ(index,...front(left+(right-left)*across,bottom(across)*(1-up)+top(across)*up,lift));}geo.computeVertexNormals();return part(geo,tone);};
  const welt=new THREE.Color(color).multiplyScalar(.74).getHex(),line=(tone,path,radius,lift)=>piping(tone,path.map(([x,y])=>front(x,y,lift)),radius);
  // The collar opens at the centre front. Its turned points sit on the jacket.
  const collarRows=4,collarGeom=new THREE.PlaneGeometry(1,1,64,collarRows);
  const cp=collarGeom.attributes.position,rim=[];
  for(let row=0;row<=collarRows;row++){
   const t=row/collarRows;
   for(let col=0;col<=64;col++){
    const a=.025+(2*Math.PI-.05)*col/64,frontAngle=Math.min(a,2*Math.PI-a);
    const point=female?0:.028*Math.exp(-((frontAngle-.55)**2)/.13);
    const radius=.063+.017*t+.024*t*Math.exp(-((frontAngle-.6)**2)/.25);
    const top=.584-(female?.028:.022)*Math.exp(-(frontAngle**2)/.1);
    const xyz=[radius*Math.sin(a),top*(1-t)+(.532-point)*t,(.95*radius+.018*t)*Math.cos(a)];
    cp.setXYZ(row*65+col,...xyz);
    if(row===0)rim.push(new THREE.Vector3(...xyz));
   }
  }
  collarGeom.computeVertexNormals();body.push(part(collarGeom,color));
  body.push(part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rim),64,female?.0027:.0017,5,false),female?trim:0xc5c2b5));
  if(!female){
   body.push(panel(welt,-.012,.009,()=>-.106,()=>.554,.0025));
   for(const side of [-1,1]){
    for(const height of [-.008,.34]){
     const center=side*.107,left=center-.054,right=center+.054;
     body.push(panel(welt,left,right,a=>height-.077+.01*(2*a-1)**4,()=>height+.029,.0035),
      panel(color,left-.002,right+.002,a=>height+.019-.019*Math.sin(Math.PI*a),()=>height+.041,.007));
     body.push(oval(trim,...front(center,height+.014,.009),.006,.006,.003));
    }
   }
   for(const side of [-1,1]){
    const flap=new THREE.PlaneGeometry(1,1,20,5),position=flap.attributes.position;
    for(let i=0;i<position.count;i++){
     const t=position.getX(i)+.5,up=position.getY(i)+.5;
     const x=side*(.003+.088*t),y=.550-.041*Math.sin(Math.PI*t*.88);
     const bottom=front(x,y,.008),rimY=.558+.018*Math.sin(Math.PI*t);
     position.setXYZ(i,x,y+(rimY-y)*up,bottom[2]*(1-up)+(.067-.032*t)*up);
    }
    flap.computeVertexNormals();
    if(side<0){
     const index=flap.index.array;
     for(let i=0;i<index.length;i+=3)[index[i+1],index[i+2]]=[index[i+2],index[i+1]];
     flap.computeVertexNormals();
    }
    body.push(part(flap,new THREE.Color(color).multiplyScalar(.90).getHex()));
   }
   for(const height of [-.078,.049,.176,.303,.431,.535])body.push(oval(trim,...front(0,height,.007),.008,.008,.005));
   body.push(piping(welt,[[-.17,.425,-.08],[-.09,.417,-.136],[0,.414,-.151],[.09,.417,-.136],[.17,.425,-.08]],.0018));
  }else{
   const overlap=[[-.004,.554],[-.028,.516],[-.063,.478],[-.099,.426],[-.131,.37],[-.16,.272]];
   body.push(line(trim,overlap,.0034,.004));
   for(const [x,y] of [[-.022,.532],[-.074,.463],[-.121,.388]]){
    body.push(line(trim,[[x-.022,y+.013],[x-.013,y+.008],[x+.019,y-.010],[x+.022,y-.009],[x+.014,y-.003]],.0025,.008),
     oval(trim,...front(x,y,.009),.005,.005,.004));
   }
   body.push(shell(0x303440,[[.176,.041],[.177,.046],[.17,.075]],.78));
   // The flat sling crosses the wearer's chest and returns across her back.
   const leather=0x694735,edge=0x4c372e;
   const path=new THREE.CatmullRomCurve3([[.119,.512,-.070],[.122,.542,.002],[.114,.510,.089],
    ...[[.082,.438],[.014,.335],[-.07,.205],[-.136,.086]].map(([x,y])=>front(x,y,.011)),
    [-.183,-.019,.086],[-.198,-.01,-.039],[-.139,.096,-.10],[-.064,.235,-.135],[.031,.374,-.147],[.119,.512,-.070]].map(v=>new THREE.Vector3(...v)));
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
   const bagAngle=-.77;
   function satchel(tone,w,h,d,x,y,z,round){
    const shape=new THREE.Shape(),l=-w/2,r=w/2,b=-h/2,t=h/2;
    shape.moveTo(l+round,b);shape.lineTo(r-round,b);shape.quadraticCurveTo(r,b,r,b+round);
    shape.lineTo(r,t-round);shape.quadraticCurveTo(r,t,r-round,t);shape.lineTo(l+round,t);
    shape.quadraticCurveTo(l,t,l,t-round);shape.lineTo(l,b+round);shape.quadraticCurveTo(l,b,l+round,b);
    const geo=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSize:.003,bevelThickness:.003,bevelSegments:2,curveSegments:4});
    geo.setIndex(Array.from({length:geo.attributes.position.count},(_,i)=>i));
    return part(geo,tone,x,y,z,1,1,1,0,bagAngle,.035);
   }
   body.push(satchel(edge,.173,.162,.041,-.165,-.083,.061,.014),
    satchel(0x79533c,.172,.081,.007,-.198,-.052,.096,.010),
    satchel(0x50382d,.019,.037,.006,-.206,-.095,.104,.003),
    satchel(0xab8860,.015,.011,.004,-.212,-.092,.109,.002));
  }
  return body;
 }
 const trim=schools[look.school][1],pieces=[];
 if(['daoist','wudang','kunlun','huashan','emei'].includes(look.school))pieces.push(shell(trim,[[.245,look.school==='kunlun'?.31:.42],[.251,.46],[.20,.51],[.084,.559]],.81));
 if(look.school==='emei')pieces.push(box(trim,-.12,.25,.14,.034,.40,.014,-.18));
 if(look.school==='temple'||look.school==='kongtong')pieces.push(box(trim,-.035,.28,.146,look.school==='temple'?.074:.047,.53,.017,-.48));
 if(look.school==='ming')pieces.push(box(trim,0,.33,.153,.115,.024,.014));
 if(look.school==='beggar')for(const [x,y] of [[-.10,.25],[.095,.1],[-.07,.42]])pieces.push(box(trim,x,y,.14,.066,.059,.012,x));
 return pieces;
}
