// Point queries are used for feet and head clearance. Keep each box in all tiles
// it can affect, including a margin for the walker's radius at tile boundaries.
export function collisionGrid(boxes){
 const size=6,margin=.5,empty=[];
 const tile=value=>Math.floor(value/size);
 const rows=new Map();
 for(const box of boxes){
  const west=tile(box.x0-margin),east=tile(box.x1+margin);
  const north=tile(box.z0-margin),south=tile(box.z1+margin);
  for(let z=north;z<=south;z++){
   let row=rows.get(z);
   if(!row){row=new Map();rows.set(z,row);}
   for(let x=west;x<=east;x++){
    const cell=row.get(x);
    if(cell)cell.push(box);else row.set(x,[box]);
   }
  }
 }
 const nearby=(x,z,pad)=>pad>margin?boxes:rows.get(tile(z))?.get(tile(x))||empty;
 // Sweeping the visitor's clearance along the edge also catches thin railings
 // between two clear cell centres. Use the same step and head heights as walking.
 nearby.canWalk=(x,y,z,nx,ny,nz)=>{
  const minX=Math.min(x,nx),maxX=Math.max(x,nx),minZ=Math.min(z,nz),maxZ=Math.max(z,nz);
  const low=Math.min(y,ny)+.42,high=Math.max(y,ny)+1.8;
  const dx=nx-x,dy=ny-y,dz=nz-z;
  const west=tile(minX),east=tile(maxX),north=tile(minZ),south=tile(maxZ);
  for(let iz=north;iz<=south;iz++){
   const row=rows.get(iz);if(!row)continue;
   for(let ix=west;ix<=east;ix++)for(const c of row.get(ix)||empty){
    if(c.y1<=low||c.y0>=high||c.x1+.35<=minX||c.x0-.35>=maxX||c.z1+.35<=minZ||c.z0-.35>=maxZ)continue;
    let enter=0,leave=1;
    if(dx){
     const a=(c.x0-.35-x)/dx,b=(c.x1+.35-x)/dx;
     enter=Math.max(enter,Math.min(a,b));leave=Math.min(leave,Math.max(a,b));
    }
    if(dz){
     const a=(c.z0-.35-z)/dz,b=(c.z1+.35-z)/dz;
     enter=Math.max(enter,Math.min(a,b));leave=Math.min(leave,Math.max(a,b));
    }
    if(dy){
     const a=(c.y0-1.8-y)/dy,b=(c.y1-.42-y)/dy;
     enter=Math.max(enter,Math.min(a,b));leave=Math.min(leave,Math.max(a,b));
    }
    if(enter<leave)return false;
   }
  }
  return true;
 };
 return nearby;
}
