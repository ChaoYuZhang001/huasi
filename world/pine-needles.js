import {hash2} from './landscape-field.js';

// Fine needles are generated as narrow strokes, with space between each bundle.
// Alpha-weighted mip colours avoid dark borders; coverage compensation keeps
// the canopy from disappearing when its fine needles become smaller than a pixel.
export function needleMipmaps(size=512){
 const data=new Uint8Array(size*size*4),r=k=>hash2(k,19,2713),unit=size/512;
 for(let i=0;i<data.length;i+=4){data[i]=42;data[i+1]=77;data[i+2]=35;}
 function line(ax,ay,bx,by,width,color){
  ax*=unit;ay*=unit;bx*=unit;by*=unit;width*=unit;
  const dx=bx-ax,dy=by-ay,d=dx*dx+dy*dy,pad=width+1;
  for(let y=Math.max(0,Math.floor(Math.min(ay,by)-pad));y<Math.min(size,Math.ceil(Math.max(ay,by)+pad));y++)for(let x=Math.max(0,Math.floor(Math.min(ax,bx)-pad));x<Math.min(size,Math.ceil(Math.max(ax,bx)+pad));x++){
   const t=Math.max(0,Math.min(1,((x+.5-ax)*dx+(y+.5-ay)*dy)/d)),distance=Math.hypot(x+.5-ax-t*dx,y+.5-ay-t*dy),alpha=Math.max(0,Math.min(1,width*(.58-.34*t)+.65-distance));
   if(!alpha)continue;const p=(y*size+x)*4,old=data[p+3]/255,out=alpha+old*(1-alpha);
   for(let c=0;c<3;c++)data[p+c]=(color[c]*alpha+data[p+c]*old*(1-alpha))/out;data[p+3]=out*255;
  }
 }
 for(let i=0;i<64;i++){
  const a=r(i*9)*Math.PI*2,rad=Math.sqrt(r(i*9+1))*175,cx=256+Math.cos(a)*rad,cy=256+Math.sin(a)*rad*.82,turn=r(i*9+2)*Math.PI*2,shade=r(i*9+3);
  for(let j=0;j<17;j++){
   const angle=turn+(j-8)*.19+(r(i*91+j)-.5)*.14,length=22+r(i*61+j)*32;
   line(cx,cy,cx+Math.cos(angle)*length,cy+Math.sin(angle)*length,1.45+r(i*43+j)*.75,[31+shade*33,63+shade*51,25+shade*24]);
  }
 }
 const coverage=(pixels,cut=.35)=>{let count=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>=cut*255)count++;return count/(pixels.length/4);};
 const target=coverage(data),mips=[{data,width:size,height:size}];
 while(size>1){const previous=mips[mips.length-1],n=Math.max(1,size>>1),next=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   let alpha=0,color=[0,0,0];for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const p=((y*2+dy)*size+x*2+dx)*4,a=previous.data[p+3]/255;alpha+=a;for(let c=0;c<3;c++)color[c]+=previous.data[p+c]*a;}
   const p=(y*n+x)*4;for(let c=0;c<3;c++)next[p+c]=alpha?color[c]/alpha:[42,77,35][c];next[p+3]=alpha*255/4;
  }
  if(n>=8){let low=.25,high=4;for(let step=0;step<12;step++){const scale=(low+high)/2;let count=0;for(let i=3;i<next.length;i+=4)if(next[i]*scale>=.35*255)count++;if(count/(n*n)<target)low=scale;else high=scale;}const scale=(low+high)/2;for(let i=3;i<next.length;i+=4)next[i]=Math.min(255,next[i]*scale);}
  mips.push({data:next,width:n,height:n});size=n;
 }
 return mips;
}
export function pineNeedleTexture(T){
 const mips=needleMipmaps(),first=mips[0],texture=new T.DataTexture(first.data,first.width,first.height,T.RGBAFormat);
 texture.name='huashan:pine-needles';texture.mipmaps=mips;texture.generateMipmaps=false;texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;texture.needsUpdate=true;return texture;
}
