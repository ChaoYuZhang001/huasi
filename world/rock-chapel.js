// A shallow rock outcrop around the three seats. The entrance and vault are one shell.
export function rockChapel(b,stone){
 const {THREE:T}=b,vertices=[],indices=[],uv=[];
 const steps=22,sections=8;
 function crossSection(k,outer){
  const front=k/sections,z=3.2-6.8*front;
  const width=outer?5.35+.48*Math.sin(front*Math.PI):3.18+.86*Math.sin(front*Math.PI);
  const rise=outer?4.7+.57*Math.sin(front*Math.PI):2.49+.42*Math.sin(front*Math.PI);
  const start=vertices.length/3;
  for(let j=-1;j<=steps+1;j++){
   const angle=Math.PI*Math.max(0,Math.min(steps,j))/steps;
   const floor=j<0||j>steps,noise=.12*Math.sin(j*1.4+k*.86)+.09*Math.cos(j*.87-k*1.11);
   const x=(width+noise)*Math.cos(angle);
   const y=floor?-.12:.81+(rise+noise)*Math.sin(angle)+noise*.5;
   const depth=z+(outer?.24*Math.cos(j*.66+k*.8):.07*Math.sin(j+front));
   vertices.push(x,y,depth);uv.push((x+.45*z)/3,(y+.63*z)/3);
  }
  return start;
 }
 const count=steps+3;
 function join(start,next,reverse){
  for(let j=0;j<count-1;j++){
   const a=start+j,c=next+j;
   if(reverse)indices.push(a,c,a+1,a+1,c,c+1);
   else indices.push(a,a+1,c,a+1,c+1,c);
  }
 }
 const outside=[],inside=[];
 for(let k=0;k<=sections;k++){
  outside.push(crossSection(k,true));inside.push(crossSection(k,false));
  if(k){join(outside[k-1],outside[k],true);join(inside[k-1],inside[k],false);}
 }
 join(inside[0],outside[0],true);join(outside[sections],inside[sections],true);
 const center=vertices.length/3;vertices.push(0,.72,-3.64);uv.push(0,.24);
 for(let j=0;j<count-1;j++)indices.push(inside[sections]+j,inside[sections]+j+1,center);
 indices.push(inside[sections]+count-1,inside[sections],center);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
 g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
 b.G(g,stone,0,0,0);
 for(const s of [-1,1]){
  b.col(.94,4.9,6.8,s*4.63,0,-.15);
  b.col(1.4,3.65,.54,s*4,0,3.1);
 }
 b.col(9.8,4.3,.40,0,0,-3.64);b.col(8.6,.55,6.6,0,3.73,-.16);
}
