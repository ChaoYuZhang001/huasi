// A rectangle uses [west, north, east, south]. Keep only the area outside
// the cover. Touching edges share no area and retain the original rectangle.
export function subtractRect(rect,cover){
 const [x0,z0,x1,z1]=rect;
 const left=Math.max(x0,cover[0]),right=Math.min(x1,cover[2]);
 const near=Math.max(z0,cover[1]),far=Math.min(z1,cover[3]);
 if(left>=right||near>=far)return [rect];
 const pieces=[];
 if(z0<near)pieces.push([x0,z0,x1,near]);
 if(far<z1)pieces.push([x0,far,x1,z1]);
 if(x0<left)pieces.push([x0,near,left,far]);
 if(right<x1)pieces.push([right,near,x1,far]);
 return pieces;
}

// Only static box builders register faces. Later paving owns the overlap.
// The collision solids and the sides and undersides of the slabs stay intact.
export function trimSlabFaces(THREE,buckets){
 const layers=new Map();
 for(const [material,geometries] of buckets)for(const mesh of geometries){
  if(mesh.userData.slabOrder===undefined)continue;
  const p=mesh.attributes.position,top=mesh.groups[2],v=mesh.index.getX(top.start);
  const height=p.getY(v),key=Math.round(height*10000);
  // BoxGeometry stores the four +Y corners at vertices 8–11.
  const rect=[p.getX(8),p.getZ(8),p.getX(11),p.getZ(11)];
  let layer=layers.get(key);if(!layer){layer=[];layers.set(key,layer);}
  layer.push({mesh,rect,height,material});
 }
 for(const layer of layers.values()){
  layer.sort((a,b)=>b.mesh.userData.slabOrder-a.mesh.userData.slabOrder);
  const covers=[];
  for(const {mesh,rect,height,material} of layer){
   let pieces=[rect];
   for(const cover of covers){
    if(cover[0]>=rect[2]||cover[2]<=rect[0]||cover[1]>=rect[3]||cover[3]<=rect[1])continue;
    pieces=pieces.flatMap(piece=>subtractRect(piece,cover));
    if(!pieces.length)break;
   }
   covers.push(rect);
   if(pieces.length===1&&pieces[0]===rect)continue;
   const top=mesh.groups[2],indices=Array.from(mesh.index.array);
   indices.splice(top.start,top.count);mesh.setIndex(indices);
   const scale=material.userData.s||1;
   for(const [west,north,east,south] of pieces){
    const surface=new THREE.PlaneGeometry(1,1),{position,normal,uv}=surface.attributes;
    for(const [i,[x,z]] of [[west,north],[east,north],[west,south],[east,south]].entries()){
     position.setXYZ(i,x,height,z);normal.setXYZ(i,0,1,0);
     uv.setXY(i,(x-rect[0])/scale,(rect[3]-z)/scale);
    }
    buckets.get(material).push(surface);
   }
  }
 }
}

// A beam can meet another beam on its soffit, or its trim on a vertical
// face. Clip these faces before batching so each exposed patch is drawn once.
export function trimTempleFaces(THREE,buckets){
 const layers=new Map(),removed=new Map();
 for(const [material,geometries] of buckets)for(const box of geometries){
  if(box.userData.boxOrder===undefined)continue;
  const p=box.attributes.position;
  for(let face=0;face<6;face++){
   const k=face*4,axis=face>>1,u=(axis+1)%3,v=(axis+2)%3;
   const plane=p.getComponent(k,axis),key=face+','+Math.round(plane*10000);
   const u0=p.getComponent(k,u),u1=p.getComponent(k+3,u);
   const v0=p.getComponent(k,v),v1=p.getComponent(k+3,v);
   const rect=[Math.min(u0,u1),Math.min(v0,v1),Math.max(u0,u1),Math.max(v0,v1)];
   if(!layers.has(key))layers.set(key,[]);
   layers.get(key).push({box,material,face,axis,u,v,rect});
  }
 }
 for(const layer of layers.values()){
  layer.sort((a,b)=>b.box.userData.boxOrder-a.box.userData.boxOrder);
  const covers=[];
  for(const {box,material,face,axis,u,v,rect} of layer){
   let pieces=[rect];
   for(const cover of covers){
    if(cover[0]>=rect[2]||cover[2]<=rect[0]||cover[1]>=rect[3]||cover[3]<=rect[1])continue;
    pieces=pieces.flatMap(piece=>subtractRect(piece,cover));
    if(!pieces.length)break;
   }
   covers.push(rect);
   if(pieces.length===1&&pieces[0]===rect)continue;
   removed.set(box,(removed.get(box)||0)|(1<<face));
   const original=box.attributes,base=face*4;
   for(const piece of pieces){
    const patch=new THREE.PlaneGeometry(1,1),{position,normal,uv}=patch.attributes;
    for(let i=0;i<4;i++){
     const j=base+i;
     position.setComponent(i,axis,original.position.getComponent(j,axis));
     for(const [index,a] of [[0,u],[1,v]]){
      const edge=original.position.getComponent(j,a)===rect[index]?index:index+2;
      position.setComponent(i,a,piece[edge]);
     }
     normal.setXYZ(i,original.normal.getX(j),original.normal.getY(j),original.normal.getZ(j));
     // The two independent box edges run from corner 0 to corners 1 and 2.
     let s=original.uv.getX(base),t=original.uv.getY(base);
     for(const next of [base+1,base+2]){
      const a=original.position.getComponent(next,u)!==original.position.getComponent(base,u)?u:v;
      const from=original.position.getComponent(base,a),to=original.position.getComponent(next,a);
      const fraction=(position.getComponent(i,a)-from)/(to-from);
      s+=fraction*(original.uv.getX(next)-original.uv.getX(base));
      t+=fraction*(original.uv.getY(next)-original.uv.getY(base));
     }
     uv.setXY(i,s,t);
    }
    buckets.get(material).push(patch);
   }
  }
 }
 for(const [box,mask] of removed){
  box.setIndex(Array.from(box.index.array).filter((_,i)=>!(mask&(1<<Math.floor(i/6)))));
  box.clearGroups();
 }
}
