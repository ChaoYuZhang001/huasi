export function pavingCells(rectangles){
 const bounds=rectangles.map(([x,z,width,depth])=>[x-width/2,z-depth/2,x+width/2,z+depth/2]);
 const edges=dimension=>[...new Set(bounds.flatMap(rect=>[rect[dimension],rect[dimension+2]]))].sort((left,right)=>left-right);
 const xs=edges(0),zs=edges(1),cells=[];
 for(let row=1;row<zs.length;row++)for(let column=1;column<xs.length;column++){
  const left=xs[column-1],right=xs[column],near=zs[row-1],far=zs[row];
  if(bounds.some(rect=>left>=rect[0]&&right<=rect[2]&&near>=rect[1]&&far<=rect[3]))cells.push([left,near,right,far]);
 }
 return cells;
}

export function layPaving({THREE,G,at},material,height,rectangles){
 at(0,0,0);
 const scale=material.userData.s||1;
 for(const [left,near,right,far] of pavingCells(rectangles)){
  const slab=new THREE.PlaneGeometry(right-left,far-near);slab.rotateX(-Math.PI/2);
  slab.translate((left+right)/2,height,(near+far)/2);
  const positions=slab.attributes.position,uv=slab.attributes.uv;
  for(let vertex=0;vertex<positions.count;vertex++)uv.setXY(vertex,positions.getX(vertex)/scale,-positions.getZ(vertex)/scale);
  G(slab,material,0,0,0);
 }
}
