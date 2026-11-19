// Carved rock, not a rectangular room. The public walking envelope stays in the
// region builder; these surfaces add relief inside and outside that envelope.
export function grottoGeometry(T){
 const geometry=(p,i)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(i);g.computeVertexNormals();g.computeBoundingSphere();return g;};
 const relief=(x,y,z)=>Math.sin(x*1.63+y*.73+z*.31)*.10+Math.sin(x*.47-y*1.8+z*.82)*.08;
 // An annulus joins the open arch to the fractured outer rock silhouette.
 const inner=[];for(let j=0;j<10;j++)inner.push([-3.8,2.3*j/10]);
 for(let j=0;j<=48;j++){const a=Math.PI-j/48*Math.PI;inner.push([Math.cos(a)*3.8,2.3+Math.sin(a)*3.8]);}
 for(let j=1;j<=10;j++)inner.push([3.8,2.3*(1-j/10)]);
 for(let j=1;j<24;j++)inner.push([3.8-7.6*j/24,0]);
 const p=[],idx=[],count=inner.length,rings=8;
 for(let k=0;k<=rings;k++)for(let j=0;j<count;j++){
  const [x,y]=inner[j],dy=y-2.5;
  const tx=Math.abs(x)>.001?10/Math.abs(x):Infinity,ty=dy>0?7.2/dy:dy<0?-2.5/dy:Infinity,t=Math.min(tx,ty);
  const ox=x*t,oy=2.5+dy*t,u=k/rings;
  const xx=x+(ox-x)*u,yy=y+(oy-y)*u;
  const edge=u*u,top=Math.max(0,Math.min(1,(yy-5)/3));
  p.push(-32+xx+edge*relief(xx,yy,0)*.65,5.4+yy+edge*top*(Math.sin(xx*.8)*.45+Math.sin(xx*1.71)*.18),-8.0+u*.25+Math.sin(u*Math.PI)*(.36+relief(xx,yy,2)*2));
 }
 for(let k=0;k<rings;k++)for(let j=0;j<count;j++){const a=k*count+j,b=k*count+(j+1)%count,c=a+count,d=b+count;idx.push(a,b,c,b,d,c);}
 const facade=geometry(p,idx);
 // A rounded chamber expands behind the opening. Normals face the empty room.
 const profile=[];for(let j=0;j<8;j++)profile.push({s:-1,h:j/8});
 for(let j=0;j<=48;j++)profile.push({a:Math.PI-j/48*Math.PI});
 for(let j=1;j<=8;j++)profile.push({s:1,h:1-j/8});
 const vp=[],vi=[],sections=30,n=profile.length;
 for(let k=0;k<=sections;k++){
  const z=-8.0-k/sections*16,expand=Math.min(1,k/4),width=3.8+4.8*expand,shoulder=2.3+1.6*expand,crown=3.8-1.55*expand;
  for(const v of profile){let x,y;if(v.a!==undefined){x=Math.cos(v.a)*width;y=shoulder+Math.sin(v.a)*crown;}else{x=v.s*width;y=v.h*shoulder;}
   const rough=relief(x,y,z)*Math.min(1,k/2)*Math.min(1,y);
   vp.push(-32+x*(1+rough*.008),5.4+y+rough,z);
  }
 }
 for(let k=0;k<sections;k++)for(let j=0;j<n-1;j++){const a=k*n+j,b=a+1,c=a+n,d=c+1;vi.push(a,c,b,b,c,d);}
 const chamber=geometry(vp,vi);
 // The back face has shallow tool-like variation, with no separate floating slab.
 const bp=[],bi=[],nx=32,ny=14;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const x=-8.6+17.2*i/nx,y=6.2*j/ny;bp.push(-32+x,5.4+y,-24+relief(x,y,5)*.8);}
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;bi.push(a,b,c,b,d,c);}
 return{facade,chamber,back:geometry(bp,bi)};
}
