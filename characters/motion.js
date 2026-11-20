// The existing figure keeps its face, clothing profile and upper-body controls.
// This module adds a leg rig, planted steps and GPU cloth morphs underneath it.
import {mapCloth} from './tailoring.js';
import {contour} from './wardrobe.js';
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);

export function footCycle(phase,stride) {
  const u=((phase/TAU)%1+1)%1,stance=.52,travel=stride*stance;
  if(u<stance)return{z:travel*(.5-u/stance),lift:0,pitch:.16*smooth(clamp((u-.43)/.09,0,1)),stance:true};
  const t=(u-stance)/(1-stance),arc=Math.sin(Math.PI*t);
  return{z:travel*(smooth(t)-.5),lift:.115*arc*arc,pitch:.16*(1-t)**3-.25*arc,stance:false};
}

// A visitor rolls onto the heel, spends the middle of stance flat-footed,
// then pivots on the ball of the foot. Swing joins stance at the same speed.
export function visitorFootCycle(phase,stride){
  const u=((phase/TAU)%1+1)%1,stance=.58,travel=stride*stance;
  if(u<stance){
    const heel=1-smooth(clamp(u/.105,0,1));
    const toe=smooth(clamp((u-.36)/(stance-.36),0,1));
    return {z:stride*(stance/2-u),lift:0,pitch:-.19*heel+.38*toe,stance:true};
  }
  const t=(u-stance)/(1-stance),arc=Math.sin(Math.PI*t);
  return {z:travel*(smooth(t)-.5)-stride*(1-stance)*t*(1-t)*(1-2*t),
    lift:.077*arc*arc,pitch:mix(.38,-.19,smooth(t))-.13*arc,stance:false};
}

export function createFigureMotion(T,h) {
  const V=T.Vector3,down=new V(0,-1,0),L1=.42,L2=.41;
  const d=new V(),pole=new V(),knee=new V(),end=new V(),dir=new V();
  const qa=new T.Quaternion(),qb=new T.Quaternion();

  // Keep a reachable end point and a consistent knee side, including folded legs.
  function solve(hip,target,bend) {
    d.copy(target).sub(hip);const raw=d.length();
    if(raw<1e-6)d.set(0,-1,0);else d.multiplyScalar(1/raw);
    const length=clamp(raw,Math.abs(L1-L2)+.001,L1+L2-.001);
    end.copy(hip).addScaledVector(d,length);
    pole.copy(bend).addScaledVector(d,-bend.dot(d));
    if(pole.lengthSq()<1e-8){pole.set(1,0,0).addScaledVector(d,-d.x);if(pole.lengthSq()<1e-8)pole.set(0,0,1);}
    pole.normalize();const along=(L1*L1+length*length-L2*L2)/(2*length),out=Math.sqrt(Math.max(0,L1*L1-along*along));
    knee.copy(hip).addScaledVector(d,along).addScaledVector(pole,out);
    return{knee,end};
  }

  const garmentShapes=new Map();
  function cloth(f) {
    const g=f.skirt.geometry,p=g.attributes.position;
    const cut=g.userData.travelCut,cached=garmentShapes.get(cut);
    if(cached){
      g.setAttribute('position',cached.position.clone());g.setAttribute('normal',cached.normal.clone());
      g.morphTargetsRelative=true;
      for(const k of ['position','normal'])g.morphAttributes[k]=cached.morph[k].map(a=>a.clone());
      g.boundingSphere=cached.bounds.clone();f.skirt.updateMorphTargets();return;
    }
    function envelope(s,phase=null){
      const samples=[];
      for(let i=0;i<2;i++){
        const side=i===0?-1:1,w=phase===null?0:1,cy=(f.player?visitorFootCycle:footCycle)((phase||0)+i*Math.PI,f.player?1.20:1.3);
        const hip=new V(side*.1,.9-.45*s-(f.player?.068:.12)*w,0);
        const foot=new V(mix(side*.1,-side*.14,s),.08+cy.lift*w+.1*Math.abs(Math.sin(cy.pitch*w)),mix(cy.z*w,.25+i*.07,s)-.025);
        const r=solve(hip,foot,new V(side*s,0,1-s*.65)),k=r.knee.clone(),e=r.end.clone();
        for(const [a,b,radius]of[[hip,k,f.player==='f'?.086:.108],[k,e,f.player==='f'?.073:.095]])for(let j=0;j<=12;j++)samples.push({p:a.clone().lerp(b,j/12),r:radius});
      }
      return samples;
    }
    function wrap(x,y,z,samples){
      const radius=Math.hypot(x,z)||1,dx=x/radius,dz=z/radius;let outer=0;
      for(const q of samples){
        // Cloth hangs from the widest part above this ring, instead of tracing
        // each knee and shin separately and making a ridge around the joint.
        const offset=y-q.p.y,dy=offset>=0?offset:.085*(1-Math.exp(offset*5)),rr=q.r*q.r-dy*dy;if(rr<=0)continue;
        // A smooth support envelope drapes between the two legs. Ray/capsule
        // intersections alone leave sharp spikes at tangential vertices.
        outer=Math.max(outer,q.p.x*dx+q.p.z*dz+Math.sqrt(rr));
      }
      const k=.025,t=clamp(.5+.5*(radius-outer)/k,0,1),out=mix(outer,radius,t)+k*t*(1-t);
      return[x*out/radius,y,z*out/radius];
    }
    // Build the garment around the same leg poses used by the runtime solver.
    // Keep the original waist; raise the hem slightly to clear the shoes.
    const neutral=envelope(0);
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=.06+.94*p.getY(i),z=p.getZ(i);
      p.setXYZ(i,...(y<.88&&f.player!=='f'?wrap(x,y,z,neutral):[x,y,z]));
    }
    g.computeVertexNormals();const n=g.attributes.normal,base=p.array;
    g.morphAttributes.position=[];g.morphAttributes.normal=[];g.morphTargetsRelative=true;
    const poses=[{sit:1},{sit:.25},{sit:.5},{sit:.75},...Array.from({length:8},(_,i)=>({phase:i*TAU/8})),...Array.from({length:4},(_,i)=>({bench:(i+1)/4}))];
    for(let mode=0;mode<poses.length;mode++){
      const sitting=poses[mode].sit||0,seated=poses[mode].bench||0,phase=poses[mode].phase;
      const coverage=seated||(f.player==='f'&&!sitting)?null:sitting?envelope(sitting):[-1,0,1].flatMap(d=>envelope(0,phase+d*TAU/32));
      const target=new T.BufferGeometry();target.setAttribute('position',p.clone());target.setIndex(g.index);
      const tp=target.attributes.position;
      for(let i=0;i<p.count;i++){
        const x=p.getX(i),y=p.getY(i),z=p.getZ(i),v=clamp(y,0,1),hem=Math.pow(1-v,1.7);
        let tx=x,ty=y,tz=z;
        if(seated){
          // The robe passes over the thighs and drops in front of the bench.
          // Pulling its rear hem straight down would cut through the seat.
          const angle=Math.atan2(z,x),top=clamp((v-.55)/.45,0,1),arc=smooth(top),low=clamp(v/.55,0,1);
          const fold=1+.028*Math.sin(angle*8)*(1-arc),width=mix(mix(.24,.26,low),.178,arc)*fold,depth=mix(mix(.09,.11,low),.178,arc)*fold,front=mix(.40,.47,low)*(1-arc);
          tx=mix(x,Math.cos(angle)*width,seated);tz=mix(z,front+Math.sin(angle)*depth,seated);
          ty=mix(y,v<.55?mix(.11,.565,low):mix(.565,.63,top),seated);
        }
        else if(sitting){tx=x*(1+.45*hem*sitting);ty=mix(y,.025+.475*v,sitting);tz=z*(1+.5*hem*sitting)+.07*hem*sitting;}
        else{ty=y+.012*hem;tz=z+Math.sin(phase)*clamp(x/.15,-1,1)*.035*hem;}
        if(coverage&&v<.88)[tx,ty,tz]=wrap(tx,ty,tz,coverage);
        tp.setXYZ(i,tx,ty,tz);
      }
      target.computeVertexNormals();const delta=new Float32Array(base.length),dn=new Float32Array(n.array.length);
      for(let i=0;i<base.length;i++){delta[i]=tp.array[i]-base[i];dn[i]=target.attributes.normal.array[i]-n.array[i];}
      const pa=new T.BufferAttribute(delta,3);pa.name=seated?`bench-${seated}`:sitting?`sit-${sitting}`:`step-${mode-4}`;
      g.morphAttributes.position.push(pa);g.morphAttributes.normal.push(new T.BufferAttribute(dn,3));target.dispose();
    }
    if(f.player==='f'){
      // The student skirt is fastened above the natural waist. Lift the waistband
      // and upper pleats together; the hem keeps its clearance over the shoes.
      for(let i=0;i<p.count;i++){
        const height=p.getY(i),waist=clamp((height-.36)/.64,0,1);
        p.setXYZ(i,p.getX(i)*(1-.14*waist),height+.18*waist+.033*(1-waist),p.getZ(i)*(1-.12*waist));
      }
      // Keep the waistband tucked under the short blouse even at full seat
      // height. The authored seated morphs used the lower robe's waist.
      poses.forEach((pose,index)=>{
        const seated=pose.sit||pose.bench||0;
        if(!seated)return;
        const delta=g.morphAttributes.position[index];
        for(let i=0;i<p.count;i++){
          const waist=clamp((p.getY(i)-.40)/.78,0,1);
          delta.setY(i,delta.getY(i)+.029*seated*waist);
        }
      });
      g.computeVertexNormals();
    }
    // Cover all deformations for culling; base-pose bounds alone miss a seated lap.
    g.boundingSphere=new T.Sphere(new V(0,.5,.08),.9);
    if(cut)garmentShapes.set(cut,{position:p.clone(),normal:n.clone(),morph:g.morphAttributes,bounds:g.boundingSphere});
    f.skirt.updateMorphTargets();f.skirt.scale.set(1,1,1);
  }

  function walkingSkirt(geometry){
    const position=geometry.attributes.position,rest=position.array.slice();
    const restNormals=geometry.attributes.normal.array.slice();
    const directions=32,rows=18,bottom=.32,top=.93;
    const support=new Float32Array(directions*rows);
    const dx=Array.from({length:directions},(_,i)=>Math.cos(i*TAU/directions));
    const dz=Array.from({length:directions},(_,i)=>Math.sin(i*TAU/directions));
    const vertices=[];
    for(let i=0;i<position.count;i++){
      const [x,y,z]=rest.subarray(i*3,i*3+3),radius=Math.hypot(x,z);
      if(y>=top||radius<.001)continue;
      const angle=((Math.atan2(z,x)/TAU+1)%1)*directions;
      const row=clamp((y-bottom)/(top-bottom)*(rows-1),0,rows-1.001);
      vertices.push({i,ring:Math.floor(row),up:row%1,col:Math.floor(angle),along:angle%1,
        x:x/radius,z:z/radius,radius,pleat:.014*(1-y)*((18*angle/directions)%1)});
    }
    let active=false;
    return (legs,amount)=>{
      if(amount<.002){
        if(active){
          position.array.set(rest);position.needsUpdate=true;
          geometry.attributes.normal.array.set(restNormals);geometry.attributes.normal.needsUpdate=true;
        }
        active=false;return;
      }
      active=true;support.fill(0);
      // Include the actual planted ankle on slopes and during turns. Samples
      // above a hem ring support the falling fabric as well as their own ring.
      for(const leg of legs){
        const joints=[leg.hip.position,leg.kneePoint,leg.anklePoint];
        for(let segment=0;segment<2;segment++){
          const from=joints[segment],to=joints[segment+1],radius=segment===0?.095:.084;
          for(let j=0;j<=8;j++){
            const t=j/8,x=mix(from.x,to.x,t),y=mix(from.y,to.y,t),z=mix(from.z,to.z,t);
            for(let r=0;r<rows;r++){
              const height=mix(bottom,top,r/(rows-1)),dy=height-y;
              if(dy>radius)break;
              const clearance=dy>0?Math.sqrt(radius*radius-dy*dy):radius+dy*.13;
              if(clearance<=0)continue;
              for(let d=0;d<directions;d++){
                const k=r*directions+d;
                support[k]=Math.max(support[k],x*dx[d]+z*dz[d]+clearance);
              }
            }
          }
        }
      }
      for(const v of vertices){
        const column=v.col,next=(column+1)%directions,k=v.ring*directions;
        const low=mix(support[k+column],support[k+next],v.along);
        const high=mix(support[k+directions+column],support[k+directions+next],v.along);
        const needed=mix(low,high,v.up)+v.pleat;
        const width=Math.max(v.radius,needed);
        position.setXYZ(v.i,v.x*width,rest[v.i*3+1],v.z*width);
      }
      position.needsUpdate=true;geometry.computeVertexNormals();
    };
  }

  function attach(f,color,legMaterial=f.skirt.material) {
    cloth(f);
    const bones=[new T.Bone()],legs=[],pieces=[],colors=[],indices=[],weights=[];
    const tint=f.player==='m'?new T.Color(0xffffff):new T.Color(color).multiplyScalar(f.player==='f'?1:.67);
    for(let i=0;i<2;i++){
      const side=i===0?-1:1,hip=new T.Bone(),shin=new T.Bone(),ankle=new T.Bone(),idx=bones.length;
      hip.position.set(side*.10,.9,0);shin.position.y=-L1;ankle.position.y=-L2;
      bones[0].add(hip);hip.add(shin);shin.add(ankle);bones.push(hip,shin,ankle);
      const trousers=f.player==='m';
      const shapes=trousers?[
        [contour(T,[[-.847,.063,.070],[-.833,.067,.075,.005],[-.81,.062,.068],[-.75,.063,.07,-.004],
          [-.61,.066,.073],[-.50,.069,.078],[-.455,.073,.080],[-.427,.072,.078,.004],
          [-.405,.074,.081],[-.37,.074,.08],[-.29,.077,.086],[-.13,.083,.093],[-.02,.092,.106],[.04,.094,.108]]),.9,idx]
      ]:f.player?[
        [contour(T,[[-.43,.049,.052],[-.37,.055,.061],[-.27,.066,.075],[-.13,.064,.075]]),.9,idx],
        [new T.SphereGeometry(.065,16,10),.9-L1,idx+1],
        [contour(T,[[-.42,.032,.04],[-.35,.031,.039],[-.28,.036,.043,-.003],[-.18,.049,.055,-.009],[-.12,.053,.063,-.01],[-.065,.047,.055],[.012,.05,.055]]),.9-L1,idx+1]
      ]:[
        [new T.CylinderGeometry(.07,.058,L1,10,2),.9-L1/2,idx],
        [new T.SphereGeometry(.062,10,6),.9-L1,idx+1],
        [new T.CylinderGeometry(.057,.046,L2,10,2),.9-L1-L2/2,idx+1]
      ];
      for(const [geo,y,bone] of shapes){
        if(trousers){geo.rotateY(Math.PI);mapCloth(geo,'lower',localY=>-localY/.85);}
        geo.translate(side*.10,y,0);pieces.push(geo);
        const pos=geo.attributes.position;
        for(let k=0;k<pos.count;k++){
          const shinWeight=trousers?smooth(clamp((.56-pos.getY(k))/.16,0,1)):0;
          colors.push(tint.r,tint.g,tint.b);
          indices.push(bone,trousers?idx+1:0,0,0);weights.push(1-shinWeight,shinWeight,0,0);
        }
      }
      legs.push({hip,shin,ankle,side,kneePoint:new V(),anklePoint:new V(),target:new V(),bend:new V(),anchor:null,stance:false,foot:f.feet.children[i]});
    }
    const geo=h.merge(pieces);
    geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
    pieces.forEach(g=>g.dispose());const mesh=new T.SkinnedMesh(geo,legMaterial);mesh.name='figure:legs';
    mesh.add(bones[0]);mesh.bind(new T.Skeleton(bones));mesh.castShadow=true;
    mesh.boundingSphere=new T.Sphere(new V(0,.5,.1),1.05);f.g.add(mesh);
    const owned=[f.skirt,f.upper.children[0],f.head.children[0],f.armL.children[0],f.armR.children[0],f.elbL.children[0],f.elbR.children[0]].map(o=>o.geometry);
    if(f.player)owned.push(...f.feet.children.map(foot=>foot.geometry));
    f.motion={mesh,legs,owned,fitSkirt:f.player==='f'?walkingSkirt(f.skirt.geometry):null,phase:0,blend:0,stride:1.15,previous:null,speed:0};
    if(f.player){
      f.motion.dt=1/60;
      pose(f);
    }
    return f;
  }

  function step(f,dt) {
    const m=f.motion;if(!m)return;
    dt=clamp(dt||1/60,.001,.1);const pos=f.g.position,scale=f.g.scale.x||1;
    const distance=m.previous?Math.hypot(pos.x-m.previous.x,pos.z-m.previous.z)/scale:0;
    if(!m.previous)m.previous=pos.clone();
    const reset=distance>1.5||Math.abs(pos.y-m.previous.y)>2;
    const moving=!!f.moving&&!reset&&distance>.00005&&f.sit<.1;
    m.speed=moving?Math.min(5,distance/dt):0;
    const wantedStride=f.player?clamp(.82+.25*m.speed,.88,1.65):clamp(.85+m.speed*.2,.95,1.3);
    m.stride+=(wantedStride-m.stride)*(1-Math.exp(-5*dt));
    if(moving)m.phase=(m.phase+distance/m.stride*TAU)%TAU;
    m.blend+=((moving?1:0)-m.blend)*(1-Math.exp(-10*dt));
    if(reset){m.blend=0;for(const leg of m.legs){leg.anchor=null;leg.stance=false;}}
    if(moving||m.blend>.01){f.swing=Math.sin(m.phase)*.32*m.blend;f.bob=(1-Math.cos(m.phase*2))*.009*m.blend;}
    if(f.player&&(moving||m.blend>.01)){
      f.swing=-Math.cos(m.phase-.16)*.41*m.blend;
      f.bob=(1-Math.cos(m.phase*2-.65))*.011*m.blend;
    }
    m.previous.copy(pos);m.dt=dt;m.walking=moving;
  }

  function standingYaw(f){return f.player==='f'?.28:.19;}

  function pose(f) {
    const m=f.motion;if(!m)return;
    const s=clamp(f.sit,0,1),bench=f.bench===1?s:0,walk=m.blend*Math.max(0,1-s*4),pos=f.g.position,yaw=f.g.rotation.y,scale=f.g.scale.x||1;
    const cs=Math.cos(yaw),sn=Math.sin(yaw),toWorld=(x,z)=>[pos.x+(x*cs+z*sn)*scale,pos.z+(-x*sn+z*cs)*scale];
    f.skirt.scale.set(1,1,1);f.feet.visible=true;
    const weights=f.skirt.morphTargetInfluences;weights.fill(0);
    const seat=s*4,lo=Math.floor(seat),t=seat-lo;
    const seatIndex=n=>f.bench===1?11+n:n===4?0:n;
    if(lo>0)weights[seatIndex(lo)]=1-t;
    if(lo<4)weights[seatIndex(lo+1)]=t;
    const stride=m.phase/TAU*8,step=Math.floor(stride),blend=stride-step;
    if(!m.fitSkirt){weights[4+step%8]=(1-blend)*walk;weights[4+(step+1)%8]=blend*walk;}
    f.upper.position.y=.95-.45*s+.13*bench+f.bob;
    f.upper.rotation.y=Math.sin(m.phase)*.035*walk;f.upper.rotation.z=Math.sin(m.phase)*.018*walk;
    f.upper.rotation.x+=.055*walk;
    const standing=f.player?(1-walk)*(1-s)*(1-f.palms)*(1-f.bow):0;
    const load=f.player?-Math.sin(m.phase-.13)*walk:0;
    if(f.player){
      f.upper.position.x=.023*load-.014*standing;
      f.skirt.position.x=m.fitSkirt?0:.017*load;
      f.skirt.rotation.y=m.fitSkirt?0:.042*Math.cos(m.phase)*walk;
      f.upper.rotation.y=standingYaw(f)*standing-.062*Math.cos(m.phase)*walk;
      f.upper.rotation.z=-.018*load+.012*standing;
      f.head.rotation.y=-standingYaw(f)*standing-.54*(f.upper.rotation.y-standingYaw(f)*standing);
      f.head.position.x=(f.player==='f'?.015:.009)*standing;
      if(f.ponytail)f.ponytail.morphTargetInfluences[0]=.76*walk*Math.sin(m.phase-.82);
    }
    if(bench){
      // Rest open hands on the thighs unless an explicit greeting takes over.
      const relaxed=bench*(1-clamp(f.palms,0,1));
      for(const [arm,elbow,side]of[[f.armL,f.elbL,-1],[f.armR,f.elbR,1]]){
        arm.rotation.x=mix(arm.rotation.x,-.30,relaxed);arm.rotation.z=mix(arm.rotation.z,side*.08,relaxed);
        elbow.rotation.x=mix(elbow.rotation.x,-.42,relaxed);
      }
    }
    for(let i=0;i<2;i++){
      const l=m.legs[i],cy=(f.player?visitorFootCycle:footCycle)(m.phase+i*Math.PI,m.stride),side=l.side;
      const restingZ=side*(f.player==='m'?.082:.059)*standing;
      let x=side*.10,z=cy.z*walk+restingZ,y=.035+cy.lift*walk;
      const world=toWorld(x,z);
      if(m.walking&&cy.stance){
        if(!l.stance||!l.anchor)l.anchor={x:world[0],z:world[1],y:h.floor(world[0],world[1],pos.y,f)};
        const dx=(l.anchor.x-pos.x)/scale,dz=(l.anchor.z-pos.z)/scale;
        x=dx*cs-dz*sn;z=dx*sn+dz*cs;y=(l.anchor.y-pos.y)/scale+.035;
        if(Math.hypot(x-side*.1,z)>.51)l.anchor=null;
      }else{
        l.anchor=null;
        if(m.walking)y+=(h.floor(world[0],world[1],pos.y,f)-pos.y)/scale;
      }
      l.stance=m.walking&&cy.stance;
      // Both shoes remain visible where the crossed ankles emerge from the lap.
      x=mix(x,-side*.14,s);z=mix(z,.25+i*.07,s);y=mix(y,.035,s);
      if(f.bench===1){x=mix(side*.10,side*.12,s);z=mix(cy.z*walk,.43,s);}
      if(f.player){
        const pitch=cy.pitch*walk,pivot=pitch>0?.142:-.090;
        y+=.04*bench+.035*(Math.cos(pitch)-1)+pivot*Math.sin(pitch);
        z+=pivot*(1-Math.cos(pitch))+.035*Math.sin(pitch);
      }else y+=.04*bench+.1*Math.abs(Math.sin(cy.pitch*walk));
      l.target.set(x,y+.045,z-.025);
      l.hip.position.set(side*.10+.020*load,.9-.45*s+.13*bench-(f.player?.068:.12)*walk+f.bob*.45,
        f.player?-side*.009*Math.cos(m.phase)*walk:0);
      l.bend.set(side*(s-bench),0,1-(s-bench)*.65);
      const result=solve(l.hip.position,l.target,l.bend);
      if(m.fitSkirt){l.kneePoint.copy(result.knee);l.anklePoint.copy(result.end);}
      dir.copy(result.knee).sub(l.hip.position).normalize();qa.setFromUnitVectors(down,dir);l.hip.quaternion.copy(qa);
      dir.copy(result.end).sub(result.knee).normalize();qb.setFromUnitVectors(down,dir);l.shin.quaternion.copy(qa).invert().multiply(qb);
      // Use the reachable ankle, never stretch a shin to match an impossible step.
      l.foot.position.copy(result.end);l.foot.position.y-=.045;l.foot.position.z+=.025;
      const restingYaw=f.player==='f'?.38+side*.12:side*.32-.21;
      l.foot.rotation.set(cy.pitch*walk,side*(s-bench)*.95+restingYaw*standing,0);
      if(!m.walking&&s<.01){l.foot.position.lerp(new V(side*.1,.035,restingZ),1-Math.exp(-m.dt*10));}
    }
    m.fitSkirt?.(m.legs,walk);
  }

  function dispose(f){if(!f?.motion)return;f.motion.mesh.skeleton.dispose();f.motion.mesh.geometry.dispose();for(const g of f.motion.owned)g.dispose();f.motion=null;}
  return{attach,step,pose,dispose,solve};
}
