import {buildPines} from './pine.js';
import {hash2,noise2} from './landscape-field.js';

function forestFloor(T){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(256,256);
 for(let z=0;z<256;z++)for(let x=0;x<256;x++){
  const i=(z*256+x)*4,n=hash2(x,z,613)-.5;
  const moss=(Math.sin(x*Math.PI/64+Math.cos(z*Math.PI/64))+Math.cos(z*Math.PI/128))*.24+.5;
  pixels.data[i]=89+17*n-moss*19;pixels.data[i+1]=70+17*n+moss*10;
  pixels.data[i+2]=51+13*n-moss*4;pixels.data[i+3]=255;
 }
 ctx.putImageData(pixels,0,0);ctx.lineWidth=.75;
 for(let i=0;i<1400;i++){
  const x=hash2(i,1)*256,z=hash2(i,2)*256,angle=noise2(x*.035,z*.035,927)*3+hash2(i,3)*3;
  const len=2+hash2(i,4)*6;
  ctx.strokeStyle=i%4?'rgba(172,140,88,.38)':'rgba(48,44,33,.55)';
  ctx.beginPath();ctx.moveTo(x,z);ctx.lineTo(x+Math.cos(angle)*len,z+Math.sin(angle)*len);ctx.stroke();
 }
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
 map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;
 const material=new T.MeshStandardMaterial({map,roughness:1});material.userData.s=3.8;return material;
}

export function shaolinGrove(b,root){
 const {THREE:T,M,B,at,col}=b,floor=forestFloor(T),grade=3.5;
 // A continuous forest floor joins the west path beside the rear halls.
 at(-23.25,grade,-102);
 B(17.5,3.76,64,0,-4,0,M.cliff);
 B(17.5,.24,64,0,-.24,0,floor);
 for(const [x,z,r] of [[-28,-104,1.6],[-30,-111,2.1],[-29,-116,1.4],[-31,-120,2.5],[-28.5,-129,2.2],[-24,-132,1.3],[-17,-132,1.6],[-25,-98,.78],[-22.2,-109,.56]]){
  b.boulder(x,grade-.12,z,r);
 }
 const placements=[[-18,grade,-107,9.5],[-25.5,grade,-115.4,10.3],[-17.7,grade,-124.4,10.7],[-27.6,grade,-89,8.6],[-28.1,grade,-126.2,9.1]];
 const grove=buildPines(T,root,M,placements,{mature:true});grove.group.name='temple:pine-grove';
 for(const [x,y,z,height] of placements){at(x,y,z);col(1.35,height*.32,1.35,0,0,0);}
 return grove;
}
